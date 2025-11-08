import { Box, render, Text, useApp } from "ink";
import React, { useState } from "react";

import ConfigSelector from "./screens/config-selector.js";
import Create from "./screens/create.js";
import MainMenu from "./screens/main-menu.js";

const Index = () => {
	const [configFilePath, setConfigFilePath] = useState<string | null>(null);
	const [create, setCreate] = useState<boolean>(false);

	// Header component
	const Header = () => (
		<Box flexDirection="column" marginBottom={1}>
			<Box>
				<Text bold color="cyan">
					╔═══════════════════════════════════════╗
				</Text>
			</Box>
			<Box>
				<Text bold color="cyan">
					║
				</Text>
				<Text bold color="magenta">
					{`        PARMA`}
				</Text>
				<Text bold color="cyan">
					{`                          ║`}
				</Text>
			</Box>
			<Box>
				<Text bold color="cyan">
					╚═══════════════════════════════════════╝
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>
					Secure secrets management with selective encryption
				</Text>
			</Box>
		</Box>
	);

	// Flow: Header -> Create OR Selector -> MainMenu
	if (create) {
		return (
			<Box flexDirection="column">
				<Header />
				<Create
					onFinish={() => {
						setCreate(false);
					}}
				/>
			</Box>
		);
	}

	if (!configFilePath) {
		return (
			<Box flexDirection="column">
				<Header />
				<ConfigSelector
					setConfigFilePath={setConfigFilePath}
					setCreate={setCreate}
				/>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Header />
			<MainMenu
				configFilePath={configFilePath}
				onBack={() => setConfigFilePath(null)}
			/>
		</Box>
	);
};

if (import.meta.main) {
	render(<Index />);
}

export default {
	start() {
		render(<Index />);
	},
	stop() {
	
	}
};
