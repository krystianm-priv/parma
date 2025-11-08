import React from "react";
import Header from "./Header.js";
import { Box, Text, useApp, useInput } from "ink";
import { useCanvasStore } from "../utils/canvas.store.js";
import { useSecretizedStore } from "../utils/secretized.store.js";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { pageTitle, footerInstructions, currentScreen } = useCanvasStore();
	const { privateKey } = useSecretizedStore();
	const app = useApp();

	useInput((_, key) => {
		if (key.escape) {
			app.exit();
		}
	});

	return (
		<Box flexDirection="column">
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

					{currentScreen !== "config-selector" &&
						currentScreen !== "create" &&
						!privateKey && (
							<Text color="red" underline bold inverse>
								The private key has not been loaded, therefore you may only use
								plain only modes and only read encrypted secrets!
							</Text>
						)}

					{children}

					{footerInstructions}
				</Box>
			</Box>
		</Box>
	);
}
