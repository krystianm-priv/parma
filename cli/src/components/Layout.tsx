import React from "react";
import Header from "./Header.js";
import { Box, Text, useApp, useInput } from "ink";
import { useCanvasStore } from "../utils/canvas.store.js";
import { useSecretizedStore } from "../utils/secretized.store.js";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { pageTitle, footerInstructions, currentScreen, setCurrentScreen } =
		useCanvasStore();
	const { adapter } = useSecretizedStore();
	const app = useApp();

	useInput((char, key) => {
		if (key.escape) {
			app.exit();
		}

		if (key.ctrl && char.toLowerCase() === "l") {
			setCurrentScreen("load-private-key");
		}
	});

	return (
		<Box flexDirection="column" padding={1} gap={1}>
			<Header />

			<Box flexDirection="column">
				<Box
					borderStyle="round"
					borderColor="cyan"
					paddingX={2}
					paddingY={1}
					flexDirection="column"
				>
					{pageTitle && (
						<Box marginBottom={1}>
							<Text bold color="cyan">
								{pageTitle}
							</Text>
						</Box>
					)}

					{!(
						[
							"config-selector",
							"create",
							"load-private-key",
						] as (typeof currentScreen)[]
					).includes(currentScreen) &&
						!adapter && (
							<Box flexDirection="column">
								<Text color="red" underline bold inverse>
									The private key has not been loaded, therefore you may only
									use plain only modes and only read encrypted secrets!
								</Text>

								<Box gap={1}>
									<Text>Press</Text>
									<Text bold underline>
										Ctrl + L
									</Text>
									<Text>to load the private key.</Text>
								</Box>
							</Box>
						)}

					{children}

					{footerInstructions}
				</Box>
			</Box>
		</Box>
	);
}
