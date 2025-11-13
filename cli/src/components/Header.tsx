import { Box, Text } from "ink";
import SyntaxHighlight from "ink-syntax-highlight";
import React from "react";

export default function Header() {
	return (
		<Box flexDirection="column">
			<Box>
				<Text bold color="magenta">
					PARMA
				</Text>
			</Box>
			<Box flexDirection="column">
				<Text dimColor>
					Secure secrets management with selective encryption
				</Text>
				<Box gap={1}>
					<Text>Press</Text>

					<Text color="whiteBright" bold underline>
						Esc
					</Text>

					<Text>at any time to destroy this session</Text>
				</Box>
			</Box>
		</Box>
	);
}
