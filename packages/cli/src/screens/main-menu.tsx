import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import fs from "node:fs";

interface MainMenuProps {
	configFilePath: string;
	onBack: () => void;
}

export default function MainMenu({ configFilePath, onBack }: MainMenuProps) {
	const { exit } = useApp();
	const [config, setConfig] = useState(() => {
		try {
			const content = fs.readFileSync(configFilePath, "utf-8");
			return JSON.parse(content);
		} catch (error) {
			console.error("Error loading config:", error);
			return null;
		}
	});

	const [selectedAction, setSelectedAction] = useState<string | null>(null);

	// Handle Escape key to go back
	useInput((input, key) => {
		if (key.escape && !selectedAction) {
			onBack();
		}
	});

	if (!config) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text color="red">✗ Failed to load configuration file</Text>
				<Box marginTop={1}>
					<Text dimColor>Press Escape to go back</Text>
				</Box>
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
			label: "📝 Add Secret",
			value: "add-secret",
			disabled: true,
		},
		{
			label: "✏️  Edit Secret",
			value: "edit-secret",
			disabled: true,
		},
		{
			label: "🔍 View Secrets",
			value: "view-secrets",
			disabled: true,
		},
		{
			label: "🗑️  Delete Secret",
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
			label: "⚙️  Settings",
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
		<Box flexDirection="column" paddingX={2} paddingY={1}>
			<Box
				borderStyle="round"
				borderColor="cyan"
				paddingX={2}
				paddingY={1}
				flexDirection="column"
			>
				<Box marginBottom={1}>
					<Text bold color="cyan">
						Configuration: {config["#name"]}
					</Text>
				</Box>

				<Box
					marginBottom={1}
					paddingX={1}
					borderStyle="single"
					borderColor="gray"
					flexDirection="column"
				>
					<Box justifyContent="space-between">
						<Text dimColor>File:</Text>
						<Text color="white">{configFilePath}</Text>
					</Box>
					<Box justifyContent="space-between">
						<Text dimColor>Version:</Text>
						<Text color="white">{config["#version"]}</Text>
					</Box>
					<Box justifyContent="space-between">
						<Text dimColor>Categories:</Text>
						<Text color="white">{categoryCount}</Text>
					</Box>
					<Box justifyContent="space-between">
						<Text dimColor>Secrets:</Text>
						<Text color="white">{secretCount}</Text>
					</Box>
				</Box>

				{secretCount === 0 && (
					<Box
						marginBottom={1}
						paddingX={1}
						borderStyle="single"
						borderColor="yellow"
					>
						<Text color="yellow">
							⚠️ No secrets configured. Use "Add Secret" to get started.
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
							onBack();
						} else {
							setSelectedAction(item.value);
						}
					}}
				/>

				<Box marginTop={1} justifyContent="space-between">
					<Text dimColor>↑/↓ Navigate</Text>
					<Text dimColor>Enter to select • Esc to go back</Text>
				</Box>

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
		</Box>
	);
}
