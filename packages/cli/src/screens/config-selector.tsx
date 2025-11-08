import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";
import { globSync } from "node:fs";
import React, { useEffect, useState } from "react";
import { useCanvasStore } from "utils/canvas.store.js";

const Instructions = (
	<Box marginTop={1} justifyContent="space-between">
		<Text dimColor>↑/↓ Navigate</Text>
		<Text dimColor>Enter to select</Text>
	</Box>
);

export default function ConfigSelector() {
	const [candidates, setCandidates] = useState<string[] | null>(null);
	const {
		setPageTitle,
		setFooterInstructions,
		cleanup,
		setCurrentScreen,
		setConfigFilePath,
	} = useCanvasStore();

	useEffect(() => {
		setCandidates(globSync("*.secretized.json"));
		setPageTitle("Select Configuration");
		setFooterInstructions(Instructions);
		return cleanup;
	}, [setPageTitle, setFooterInstructions, cleanup]);

	const CREATE_ITEM = {
		label: "✨ Create new configuration",
		value: "__CREATE__",
	};

	const items = React.useMemo<(typeof CREATE_ITEM)[]>(
		() => [
			CREATE_ITEM,
			...(candidates || []).map((c) => ({
				label: `📄 ${c}`,
				value: c,
			})),
		],
		[candidates],
	);

	if (candidates === null) {
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

	return (
		<>
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
						setCurrentScreen("create");
					} else {
						setConfigFilePath(selection.value);
						setCurrentScreen("main-menu");
					}
				}}
			/>
		</>
	);
}
