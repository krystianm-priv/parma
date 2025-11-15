import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { useCanvasStore } from "../utils/canvas.store.js";

type KeyMode = "generate" | "paste";

export default function Create() {
	const { setPageTitle, setFooterInstructions, cleanup, setCurrentScreen } =
		useCanvasStore();

	const [name, setName] = useState("");
	const [keyMode, setKeyMode] = useState<KeyMode>("generate");
	const [keyBase64, setKeyBase64] = useState("");
	const [keyVisible, setKeyVisible] = useState(false);

	const [focusedField, setFocusedField] = useState<
		"name" | "keyMode" | "key" | "submit"
	>("name");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const app = useApp();

	// Toggle visibility with Ctrl+T
	useInput((input, key) => {
		if (key.ctrl && input.toLowerCase() === "t") {
			setKeyVisible((v) => !v);
		}
		if (key.tab) {
			// Cycle through fields
			if (focusedField === "name") setFocusedField("keyMode");
			else if (focusedField === "keyMode")
				setFocusedField(keyMode === "paste" ? "key" : "submit");
			else if (focusedField === "key") setFocusedField("submit");
			else setFocusedField("name");
		}
		if (key.escape) {
			setCurrentScreen("ConfigSelector");
		}
	});

	useEffect(() => {
		setPageTitle("Create New Configuration");
		setFooterInstructions(
			<Box justifyContent="space-between">
				<Text dimColor>
					Tab to navigate • Ctrl+T to toggle key • Esc to cancel
				</Text>
			</Box>,
		);
		return cleanup;
	}, [setPageTitle, setFooterInstructions, cleanup]);

	// Auto-generate key when mode is "generate"
	useEffect(() => {
		if (keyMode === "generate") {
			const b64 = crypto.randomBytes(32).toString("base64");
			setKeyBase64(b64);
			setKeyVisible(true);
		} else {
			setKeyBase64("");
			setKeyVisible(false);
		}
	}, [keyMode]);

	const validateKey = (b64: string): boolean => {
		try {
			const buf = Buffer.from((b64 || "").trim(), "base64");
			return buf.length === 32;
		} catch {
			return false;
		}
	};

	const handleSubmit = async () => {
		setError("");

		const trimmedName = name.trim();
		if (!trimmedName) {
			setError("Please enter a configuration name");
			return;
		}

		const trimmedKey = keyBase64.trim();
		if (!trimmedKey || !validateKey(trimmedKey)) {
			setError(
				"Invalid encryption key. Must be base64-encoded 32-byte key (AES-256)",
			);
			return;
		}

		setSubmitting(true);

		try {
			const config = {
				$schema:
					"https://gist.githubusercontent.com/.../v1.secretized-schema.json",
				"#version": 1,
				"#name": trimmedName,
				secrets: {},
			};

			const fileName = `${trimmedName.toLowerCase()}.secretized.json`;
			const filePath = path.join(process.cwd(), fileName);

			fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");

			console.log("\n✓ Configuration created successfully!");
			console.log(`  File: ${fileName}`);
			console.log(`\n⚠️  IMPORTANT: Save your encryption key securely!`);
			console.log(`  Key: ${trimmedKey}`);
			console.log(`\n  Set it as environment variable:`);
			console.log(`  export ${trimmedName}_SECRETIZED_KEY="${trimmedKey}"`);
			console.log("");
			app.exit();
		} catch (err) {
			setError(
				`Error creating config: ${err instanceof Error ? err.message : String(err)}`,
			);
			setSubmitting(false);
		}
	};

	if (submitting) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text color="green" bold>
					✓ Creating configuration...
				</Text>
			</Box>
		);
	}

	const fileName = name.trim()
		? `${name.trim().toLowerCase()}.secretized.json`
		: "";
	const envVarName = name.trim() ? `${name.trim()}_PARMA_KEY` : "";

	return (
		<Box flexDirection="column">
			{/* Name Field */}
			<Box marginBottom={1}>
				<Box width={20}>
					<Text color={focusedField === "name" ? "cyan" : "dim"}>Name:</Text>
				</Box>
				<Box flexGrow={1}>
					{focusedField === "name" ? (
						<TextInput
							value={name}
							onChange={(v) => {
								setName(v.toUpperCase());
								setError("");
							}}
							onSubmit={() => setFocusedField("keyMode")}
							placeholder="PROJECT_NAME"
							showCursor
						/>
					) : (
						<Text color={name ? "white" : "dim"}>{name || "(empty)"}</Text>
					)}
				</Box>
			</Box>

			{/* Key Mode Selection */}
			<Box marginBottom={1}>
				<Box width={20}>
					<Text color={focusedField === "keyMode" ? "cyan" : "dim"}>
						Key Mode:
					</Text>
				</Box>
				<Box flexGrow={1}>
					{focusedField === "keyMode" ? (
						<SelectInput
							items={[
								{
									label: "✨ Generate new key (recommended)",
									value: "generate",
								},
								{ label: "📋 Paste existing key", value: "paste" },
							]}
							onSelect={(item) => {
								setKeyMode(item.value as KeyMode);
								setFocusedField(item.value === "paste" ? "key" : "submit");
								setError("");
							}}
						/>
					) : (
						<Text color="white">
							{keyMode === "generate"
								? "✨ Generate new key"
								: "📋 Paste existing key"}
						</Text>
					)}
				</Box>
			</Box>

			{/* Key Input (only if paste mode) */}
			{keyMode === "paste" && (
				<Box marginBottom={1}>
					<Box width={20}>
						<Text color={focusedField === "key" ? "cyan" : "dim"}>
							Encryption Key:
						</Text>
					</Box>
					<Box flexGrow={1}>
						{focusedField === "key" ? (
							<TextInput
								value={keyBase64}
								onChange={(v) => {
									setKeyBase64(v);
									setError("");
								}}
								onSubmit={() => setFocusedField("submit")}
								placeholder="Base64 key (32 bytes)..."
								showCursor
								mask={keyVisible ? undefined : "•"}
							/>
						) : (
							<Text color={keyBase64 ? "white" : "dim"}>
								{keyBase64
									? keyVisible
										? keyBase64
										: `${keyBase64.slice(0, 6)}...${keyBase64.slice(-6)}`
									: "(empty)"}
							</Text>
						)}
					</Box>
				</Box>
			)}

			{/* Key Display (for generated keys) */}
			{keyMode === "generate" && keyBase64 && (
				<Box marginBottom={1}>
					<Box width={20}>
						<Text color="yellow">Generated Key:</Text>
					</Box>
					<Box flexGrow={1}>
						<Text color="yellow">
							{keyVisible
								? keyBase64
								: `${keyBase64.slice(0, 6)}...${keyBase64.slice(-6)}`}
						</Text>
					</Box>
				</Box>
			)}

			{/* Preview */}
			<Box
				marginY={1}
				paddingX={1}
				borderStyle="single"
				borderColor="gray"
				flexDirection="column"
			>
				<Text dimColor>Preview:</Text>
				<Box justifyContent="space-between">
					<Text dimColor>File:</Text>
					<Text color={fileName ? "white" : "dim"}>{fileName || "N/A"}</Text>
				</Box>
				<Box justifyContent="space-between">
					<Text dimColor>Env Variable:</Text>
					<Text color={envVarName ? "cyan" : "dim"}>{envVarName || "N/A"}</Text>
				</Box>
			</Box>

			{/* Submit Button */}
			<Box marginBottom={1}>
				<Text color={focusedField === "submit" ? "green" : "dim"} bold>
					{focusedField === "submit" ? "▶ " : "  "}
					Press Enter to Create
				</Text>
			</Box>

			{focusedField === "submit" && <ConfirmOnEnter onEnter={handleSubmit} />}

			{/* Error Display */}
			{error && (
				<Box marginTop={1} paddingX={1} borderStyle="single" borderColor="red">
					<Text color="red">⚠ {error}</Text>
				</Box>
			)}

			{/* Warning for generated keys */}
			{keyMode === "generate" && (
				<Box
					marginTop={1}
					paddingX={2}
					borderStyle="round"
					borderColor="yellow"
				>
					<Text color="yellow">
						Save the generated key! It will be displayed after creation.
					</Text>
				</Box>
			)}
		</Box>
	);
}

function ConfirmOnEnter({ onEnter }: { onEnter: () => void }) {
	useInput((_input, key) => {
		if (key.return) onEnter();
	});
	return null;
}
