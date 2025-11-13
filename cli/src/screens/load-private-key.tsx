import { availableAdapters, getCreatableAdapters } from "@parma/adapter-utils";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import React from "react";
import { useSecretizedStore } from "../utils/secretized.store.js";
import { useCanvasStore } from "../utils/canvas.store.js";

export default function LoadPrivateKeyScreen() {
	const { setAdapter, secretizedSecrets } = useSecretizedStore();
	const { setCurrentScreen } = useCanvasStore();

	if (!secretizedSecrets || typeof secretizedSecrets["#name"] !== "string") {
		throw new Error("Secretized secrets not loaded yet");
	}

	const creatableAdapters = getCreatableAdapters(secretizedSecrets["#name"]);

	if (creatableAdapters.length === 0) {
		return (
			<Box flexDirection="column" gap={1}>
				<Text>
					No available adapters can load the private key for "
					{secretizedSecrets["#name"]}".
				</Text>
				<Text>
					Please ensure you have set up a compatible secret storage adapter.
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" gap={1}>
			<Text>
				Select one of the available adapters to load your private key:
			</Text>
			<SelectInput
				onSelect={(selectedAdapter) => {
					setAdapter(selectedAdapter.value);
					setCurrentScreen("main-menu");
				}}
				items={availableAdapters.map((adapter) => ({
					label: adapter.name,
					value: adapter.name,
				}))}
			/>
		</Box>
	);
}
