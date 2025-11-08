import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export default function Create({ onFinish }: { onFinish: () => void }) {
	// wizard steps: "name" -> "keyMode" -> "keyInput?" -> "review"
	const [step, setStep] = useState("name");

	const [name, setName] = useState("");
	const [nameError, setNameError] = useState("");

	const [keyMode, setKeyMode] = useState<"paste" | "auto" | null>(null); // "paste" | "auto"
	const [keyBase64, setKeyBase64] = useState("");
	const [keyVisible, setKeyVisible] = useState(false);
	const [keyError, setKeyError] = useState("");

	const [submitting, setSubmitting] = useState(false);

	// toggle key visibility with Ctrl+V
	useInput((input, key) => {
		if (step === "keyInput" && key.ctrl && input.toLowerCase() === "v") {
			setKeyVisible((v) => !v);
		}
	});

	// Validate base64 → exactly 32 bytes
	const validateKey = (b64: string) => {
		try {
			const buf = Buffer.from((b64 || "").trim(), "base64");
			return buf.length === 32;
		} catch {
			return false;
		}
	};

	// Handlers
	const submitName = () => {
		const n = name.trim();
		if (!n) {
			setNameError("Please enter a name ✨");
			return;
		}
		setNameError("");
		setStep("keyMode");
	};

	const onPickMode = ({ value }: { value: "paste" | "auto" | null }) => {
		setKeyMode(value);
		if (value === "auto") {
			const b64 = crypto.randomBytes(32).toString("base64");
			setKeyBase64(b64);
			setKeyVisible(true); // Show generated key
			setStep("review");
		} else {
			setStep("keyInput");
		}
	};

	const submitKey = () => {
		const b64 = keyBase64.trim();
		if (!validateKey(b64)) {
			setKeyError("Invalid key. Must be base64-encoded 32-byte key (AES-256).");
			return;
		}
		setKeyError("");
		setStep("review");
	};

	const doFinish = async () => {
		setSubmitting(true);
		const trimmedName = name.trim();
		const trimmedKey = keyBase64.trim();

		try {
			// Create the secretized config structure
			const config = {
				$schema:
					"https://gist.githubusercontent.com/.../v1.secretized-schema.json",
				"#version": 1,
				"#name": trimmedName,
				secrets: {},
			};

			// Write to file
			const fileName = `${trimmedName.toLowerCase()}.secretized.json`;
			const filePath = path.join(process.cwd(), fileName);

			fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");

			// Show success message with key info
			console.log("\n✓ Configuration created successfully!");
			console.log(`  File: ${fileName}`);
			console.log(`\n⚠️  IMPORTANT: Save your encryption key securely!`);
			console.log(`  Key: ${trimmedKey}`);
			console.log(`\n  Set it as environment variable:`);
			console.log(`  export ${trimmedName}_SECRETIZED_KEY="${trimmedKey}"`);
			console.log("");

			if (onFinish) {
				await onFinish();
			}
		} catch (error) {
			console.error("Error creating config:", error);
		} finally {
			setSubmitting(false);
			process.exit(0);
		}
	};

	// UI Blocks
	if (submitting) {
		return (
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Text color="green" bold>
					✓ All set!
				</Text>
				<Text>
					<Spinner /> Finalizing…
				</Text>
			</Box>
		);
	}

	if (step === "name") {
		return (
			<WizardCard title="Project Name">
				<Box>
					<Text color="magentaBright">❯ </Text>
					<Text dimColor>Name:</Text>
					<Box marginLeft={1}>
						<TextInput
							value={name}
							onChange={(v) => {
								setName(v);
								if (nameError) setNameError("");
							}}
							onSubmit={submitName}
							placeholder="Type your name…"
							showCursor
						/>
					</Box>
				</Box>
				<HintRow
					left="Enter to continue"
					right="No data leaves your terminal ✦"
				/>
				{Boolean(nameError) && <ErrorRow msg={nameError} />}
			</WizardCard>
		);
	}

	if (step === "keyMode") {
		return (
			<WizardCard title="AES-256 Key">
				<Text dimColor>Select how to provide the encryption key:</Text>
				<Box marginTop={1}>
					<SelectInput
						items={[
							{
								label: "🔏 Paste existing key (base64, 32-byte)",
								value: "paste",
							},
							{ label: "✨ Generate a new key (recommended)", value: "auto" },
						]}
						onSelect={onPickMode}
					/>
				</Box>
				<HintRow left="↑/↓, Enter" right="You can change later" />
			</WizardCard>
		);
	}

	if (step === "keyInput") {
		return (
			<WizardCard title="Paste AES-256 Key (base64)">
				<Text dimColor>
					The key must decode to exactly 32 bytes. Press{" "}
					<Text color="cyan">Ctrl+V</Text> to
					{keyVisible ? " hide" : " show"} while typing.
				</Text>
				<Box marginTop={1}>
					<Text color="cyan">❯ </Text>
					<Box flexGrow={1}>
						<TextInput
							value={keyBase64}
							onChange={(v) => {
								setKeyBase64(v);
								if (keyError) setKeyError("");
							}}
							onSubmit={submitKey}
							placeholder="Base64 key…"
							showCursor
							// mask only when hidden
							mask={keyVisible ? undefined : "•"}
						/>
					</Box>
				</Box>
				<HintRow left="Enter to validate" right="Ctrl+V toggle visibility" />
				{Boolean(keyError) && <ErrorRow msg={keyError} />}
			</WizardCard>
		);
	}

	// review
	if (step === "review") {
		const b64 = keyBase64.trim();
		const preview = keyVisible ? b64 : `${b64.slice(0, 6)}…${b64.slice(-6)}`;
		const fileName = `${name.trim().toLowerCase()}.secretized.json`;
		const envVarName = `${name.trim()}_SECRETIZED_KEY`;

		return (
			<WizardCard title="Review & Confirm">
				<Row label="Name">
					<Text color="white">{name.trim()}</Text>
				</Row>
				<Row label="File">
					<Text color="white">{fileName}</Text>
				</Row>
				<Row label="Key Source">
					<Text color="white">
						{keyMode === "auto" ? "Generated" : "Provided"}
					</Text>
				</Row>
				<Row label="Key">
					<Text color={keyVisible ? "yellow" : "white"}>{preview}</Text>
				</Row>
				<Row label="Env Variable">
					<Text color="cyan">{envVarName}</Text>
				</Row>

				{keyMode === "auto" && (
					<Box
						marginTop={1}
						paddingX={1}
						borderStyle="round"
						borderColor="yellow"
					>
						<Text color="yellow">
							⚠️ Save the key above! It will be shown after creation.
						</Text>
					</Box>
				)}

				<Box marginTop={1} justifyContent="space-between">
					<Text dimColor>Enter to create</Text>
					<Text dimColor>Ctrl+V to {keyVisible ? "hide" : "show"} key</Text>
				</Box>

				<ConfirmOnEnter onEnter={doFinish} />
				<ToggleKeyVisibility setKeyVisible={setKeyVisible} />
			</WizardCard>
		);
	}

	// Fallback (shouldn't reach)
	return null;
}

// ——— Little UI helpers ———

function WizardCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Box flexDirection="column" paddingX={2} paddingY={1}>
			<Box marginBottom={1}>
				<Text bold color="cyan">
					{title}
				</Text>
			</Box>
			<Box
				borderStyle="round"
				borderColor="cyan"
				paddingX={1}
				paddingY={1}
				flexDirection="column"
			>
				{children}
			</Box>
		</Box>
	);
}

function Row({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<Box marginTop={1} justifyContent="space-between">
			<Text dimColor>{label}</Text>
			<Box>{children}</Box>
		</Box>
	);
}

function HintRow({ left, right }: { left: string; right: string }) {
	return (
		<Box marginTop={1} justifyContent="space-between">
			<Text dimColor>{left}</Text>
			<Text dimColor>{right}</Text>
		</Box>
	);
}

function ErrorRow({ msg }: { msg: string }) {
	return (
		<Box marginTop={1}>
			<Text color="yellow">{msg}</Text>
		</Box>
	);
}

function ConfirmOnEnter({ onEnter }: { onEnter: () => void }) {
	useInput((_input, key) => {
		if (key.return) onEnter();
	});
	return null;
}

function ToggleKeyVisibility({
	setKeyVisible,
}: {
	setKeyVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	useInput((input, key) => {
		if (key.ctrl && input.toLowerCase() === "v") {
			setKeyVisible((v) => !v);
		}
	});
	return null;
}
