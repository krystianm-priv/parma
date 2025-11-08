import { Box, Text } from "ink";
import React from "react";

export default function SecretizedFileInfo() {
	const configFilePath = "todo";
	const config = {
		"#version": "1.0",
		"#categories": 0,
		"#secrets": 0,
	};
	const categoryCount = config["#categories"] || 0;
	const secretCount = config["#secrets"] || 0;
	return (
		<Box marginBottom={1} paddingX={1} borderStyle="single" borderColor="gray">
			<Box flexDirection="column" width="100%">
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
		</Box>
	);
}
