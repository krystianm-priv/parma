process.env.TEST_PARMA_KEY = "AJCize7cAOkB3P/n5HVHA/QuG8oL26CdzO5hOSw4mIk=";

import { Box, render, Text } from "ink";
import React from "react";

import ConfigSelector from "./screens/config-selector.js";
import Create from "./screens/create.js";
import MainMenu from "./screens/main-menu.js";
import Layout from "./components/Layout.js";
import { useCanvasStore } from "./utils/canvas.store.js";
import LoadPrivateKeyScreen from "./screens/load-private-key.js";

const Router = () => {
	const { currentScreen } = useCanvasStore();

	switch (currentScreen) {
		case "config-selector":
			return <ConfigSelector />;
		case "create":
			return <Create />;
		case "main-menu":
			return <MainMenu />;
		case "load-private-key":
			return <LoadPrivateKeyScreen />;
		default:
			return (
				<Box>
					<Text>Unregistered screen - please just exit</Text>
				</Box>
			);
	}
};

if (import.meta.main) {
	process.stdout.write("\x1Bc");
	const { waitUntilExit } = render(
		<Layout>
			<Router />
		</Layout>,
	);

	await waitUntilExit();
	process.stdout.write("\x1Bc");
}
