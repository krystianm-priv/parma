import React from "react";
import Header from "./Header.js";
import { Box, Text } from "ink";
import { useCanvasStore } from "../utils/canvas.store.js";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { pageTitle, footerInstructions } = useCanvasStore();

	return (
		<Box flexDirection="column">
			<Header />

			<Box flexDirection="column" paddingX={2} paddingY={1}>
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

					{children}

					{footerInstructions && footerInstructions}
				</Box>
			</Box>
		</Box>
	);
}
