process.env.TEST_PARMA_KEY = "AJCize7cAOkB3P/n5HVHA/QuG8oL26CdzO5hOSw4mIk=";

import { Box, render, Text } from "ink";
import React from "react";

import Layout from "./components/Layout.js";
import { useCanvasStore } from "./utils/canvas.store.js";
import * as screens from "./screens/index.js";
import { useAlertStore } from "./utils/alert.store.js";
import Alert from "./components/Alert.js";

const Router = () => {
	const { currentScreen } = useCanvasStore();

	const { hasAlerts } = useAlertStore();

	if (hasAlerts()) {
		return <Alert />;
	} else if (currentScreen in screens) {
		// biome-ignore lint/performance/noDynamicNamespaceImportAccess: that's fine
		const ScreenComponent = screens[currentScreen];
		return <ScreenComponent />;
	} else {
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
