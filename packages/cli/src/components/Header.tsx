import { Box, Text } from "ink";
import React from "react";

export default function Header() {
	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box>
				<Text bold color="magenta">
					PARMA
				</Text>
			</Box>
			<Box>
				<Text dimColor>
					Secure secrets management with selective encryption
				</Text>
			</Box>
		</Box>
	);
}
