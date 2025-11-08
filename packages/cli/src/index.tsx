import { Box, render, Text, useApp } from "ink";
import React, { useState } from "react";

import ConfigSelector from "./screens/config-selector.js";
import Create from "./screens/create.js";
import MainMenu from "./screens/main-menu.js";
import Layout from "components/Layout.js";
import { useCanvasStore } from "utils/canvas.store.js";

const Router = () => {
	const { currentScreen } = useCanvasStore();

	switch (currentScreen) {
		case "config-selector":
			return <ConfigSelector />;
		case "create":
			return <Create />;
		case "main-menu":
			return <MainMenu />;
		default:
			return (
				<Box>
					<Text>Unregistered screen - please just exit</Text>
				</Box>
			);
	}
};

if (import.meta.main) {
	render(
		<Layout>
			<Router />
		</Layout>,
	);
}
