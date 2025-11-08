import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import fs from "node:fs";
import { useCanvasStore } from "../utils/canvas.store.js";

interface Config {
	"#version": number;
	"#name": string;
	secrets: Record<string, Record<string, any>>;
}

export default function MainMenu() {
	const { exit } = useApp();
	const {
		configFilePath,
		setPageTitle,
		setFooterInstructions,
		cleanup,
		setCurrentScreen,
	} = useCanvasStore();

	const [config, setConfig] = useState<Config | null>(null);
	const [selectedAction, setSelectedAction] = useState<string | null>(null);

	useEffect(() => {
		if (!configFilePath) {
			setCurrentScreen("config-selector");
			return;
		}

		try {
			const content = fs.readFileSync(configFilePath, "utf-8");
			setConfig(JSON.parse(content));
		} catch (error) {
			console.error("Error loading config:", error);
			setConfig(null);
		}
	}, [configFilePath, setCurrentScreen]);

	useEffect(() => {
		if (config) {
			setPageTitle(`Configuration: ${config["#name"]}`);
			setFooterInstructions(
				<Box marginTop={1} justifyContent="space-between">
					<Text dimColor>↑/↓ Navigate • Enter to select</Text>
					<Text dimColor>Esc to go back</Text>
				</Box>,
			);
		}
		return cleanup;
	}, [config, setPageTitle, setFooterInstructions, cleanup]);

	useInput((_input, key) => {
		if (key.escape && !selectedAction) {
			setCurrentScreen("config-selector");
		}
	});

	if (!config) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text color="red">✗ Failed to load configuration file</Text>
			</Box>
		);
	}

	const secretCount = Object.keys(config.secrets || {}).reduce(
		(acc, category) => {
			return acc + Object.keys(config.secrets[category] || {}).length;
		},
		0,
	);

	const categoryCount = Object.keys(config.secrets || {}).length;

	const menuItems = [
		{
			label: `📝 Add Secret`,
			value: "add-secret",
			disabled: true,
		},
		{
			label: "🔣 Edit Secret",
			value: "edit-secret",
			disabled: true,
		},
		{
			label: "🔍 View Secrets",
			value: "view-secrets",
			disabled: true,
		},
		{
			label: "🔥 Delete Secret",
			value: "delete-secret",
			disabled: true,
		},
		{
			label: "🔑 Change Encryption Key",
			value: "change-key",
			disabled: true,
		},
		{
			label: "📊 Export",
			value: "export",
			disabled: true,
		},
		{
			label: "🔧 Settings",
			value: "settings",
			disabled: true,
		},
		{
			label: "← Back to Config Selection",
			value: "back",
		},
		{
			label: "❌ Exit",
			value: "exit",
		},
	];

	return (
		<Box flexDirection="column">
			{secretCount === 0 && (
				<Box
					marginBottom={1}
					paddingX={1}
					borderStyle="single"
					borderColor="yellow"
				>
					<Text color="yellow">
						✋ No secrets configured. Use "📝 Add Secret" to get started.
					</Text>
				</Box>
			)}

			<Box marginBottom={1}>
				<Text bold color="magenta">
					What would you like to do?
				</Text>
			</Box>

			<SelectInput
				items={menuItems}
				onSelect={(item) => {
					if (item.value === "exit") {
						exit();
					} else if (item.value === "back") {
						setCurrentScreen("config-selector");
					} else {
						setSelectedAction(item.value);
					}
				}}
			/>

			{selectedAction && (
				<Box
					marginTop={1}
					paddingX={1}
					borderStyle="round"
					borderColor="yellow"
				>
					<Text color="yellow">Feature "{selectedAction}" coming soon!</Text>
				</Box>
			)}
		</Box>
	);
}
