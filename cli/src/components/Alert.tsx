import React, { useMemo } from "react";
import { useAlertStore } from "../utils/alert.store.js";
import { Box, Text, useInput } from "ink";

export default function Alert() {
	const { alerts } = useAlertStore();

	const currentAlert = useMemo(() => alerts[0], [alerts]);

	useInput((_input, key) => {
		if (key.return) {
            console.log("Dismissing alert");
			if (currentAlert.alertType === "removable") {
				currentAlert.remove();
			} else if (currentAlert.alertType === "promisified") {
				currentAlert.resolve();
			}
		}
	});

	return (
		<Box flexDirection="column" gap={1}>
			<Box
				padding={1}
				borderStyle="round"
				borderColor={
					currentAlert?.type === "error"
						? "red"
						: currentAlert?.type === "warning"
							? "yellow"
							: "green"
				}
			>
				<Text>{currentAlert?.message}</Text>
			</Box>
			<Text>Press Enter to dismiss this alert.</Text>
		</Box>
	);
}
