import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";
import { globSync } from "node:fs";
import React, { useEffect, useState } from "react";

export default function ConfigSelector({
	setConfigFilePath,
	setCreate,
}: {
	setConfigFilePath: (path: string) => void;
	setCreate: (create: boolean) => void;
}) {
	const [candidates, setCandidates] = useState<string[] | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate small delay for smoother UX
		const timer = setTimeout(() => {
			const files = globSync("*.secretized.json");
			setCandidates(files);
			setLoading(false);
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	if (loading) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Box>
					<Text color="cyan">
						<Spinner type="dots" />
					</Text>
					<Text dimColor> Scanning for configuration files...</Text>
				</Box>
			</Box>
		);
	}

	const CREATE_ITEM = {
		label: "✨ Create new configuration",
		value: "__CREATE__",
	};

	const items =
		candidates && candidates.length > 0
			? [
					CREATE_ITEM,
					...candidates.map((c) => ({
						label: `📄 ${c}`,
						value: c,
					})),
				]
			: [CREATE_ITEM];

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
						Select Configuration
					</Text>
				</Box>

				{candidates && candidates.length === 0 && (
					<Box
						marginBottom={1}
						paddingX={1}
						borderStyle="single"
						borderColor="yellow"
					>
						<Text color="yellow">
							No configuration files found in current directory
						</Text>
					</Box>
				)}

				{candidates && candidates.length > 0 && (
					<Box marginBottom={1}>
						<Text dimColor>Found {candidates.length} configuration(s)</Text>
					</Box>
				)}

				<SelectInput
					items={items}
					onSelect={(selection) => {
						if (selection.value === "__CREATE__") {
							setCreate(true);
						} else {
							setConfigFilePath(selection.value);
						}
					}}
				/>

				<Box marginTop={1} justifyContent="space-between">
					<Text dimColor>↑/↓ Navigate</Text>
					<Text dimColor>Enter to select</Text>
				</Box>
			</Box>
		</Box>
	);
}
