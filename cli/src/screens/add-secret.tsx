import React, { useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useCanvasStore } from "../utils/canvas.store.js";
import { useSecretizedStore } from "../utils/secretized.store.js";
import { useAlertStore } from "../utils/alert.store.js";

export default function AddSecretScreen() {
	const { cleanup, setFooterInstructions, setPageTitle } = useCanvasStore();
	const { adapter, secretizedSecrets } = useSecretizedStore();

	const tabs = [
		"category",
		"name",
		"encoding",
		"value",
		"encrypted",
		"submit",
	] as const;

	const [currentlyEditing, setCurrentlyEditing] =
		React.useState<(typeof tabs)[number]>("category");

	const [category, setCategory] = React.useState<string>("default");
	const [name, setName] = React.useState<string>(`NEW_SECRET_${Date.now()}`);
	const [value, setValue] = React.useState<string>("");
	const [valueEncodingType, setValueEncodingType] = React.useState<
		"utf8" | "base64" | "hex"
	>("utf8");
	const [isEncrypted, setIsEncrypted] = React.useState<boolean>(!!adapter);

	useInput((_input, key) => {
		if (key.tab) {
			const order = tabs;
			const idx = order.indexOf(currentlyEditing);

			const nextIndex = key.shift
				? (idx - 1 + order.length) % order.length
				: (idx + 1) % order.length;

			setCurrentlyEditing(order[nextIndex]);
		}
	});

	useEffect(() => {
		setPageTitle("Add New Secret");
		setFooterInstructions(
			<Box justifyContent="space-between">
				<Text dimColor>
					{[
						"Tab to navigate",
						"Ctrl+Q to cancel",
						"Esc to stop parma session",
					].join(" • ")}
				</Text>
			</Box>,
		);
		return cleanup;
	}, [cleanup, setFooterInstructions, setPageTitle]);

	return (
		<Box flexDirection="column" gap={1}>
			<EditableComponent
				isEditing={currentlyEditing === "category"}
				label="Category"
				value={category}
				onChange={setCategory}
				Editor={TextInput}
			/>
			<EditableComponent
				isEditing={currentlyEditing === "name"}
				label="Name"
				value={name}
				onChange={setName}
				Editor={() => (
					<Box gap={1} flexDirection="column">
						<TextInput
							value={name}
							onChange={(value) =>
								setName(value.replace(/[^a-zA-Z0-9_]/g, "_").toUpperCase())
							}
						/>
						{secretizedSecrets?.secrets?.[category]?.[name] && (
							<Text dimColor>
								⚠️ A secret with this name already exists in this category. You
								will have to start over if you try submitting this.
							</Text>
						)}
					</Box>
				)}
			/>
			<EditableComponent
				isEditing={currentlyEditing === "encoding"}
				label="Encoding"
				value={valueEncodingType}
				onChange={(v) => setValueEncodingType(v as "utf8" | "base64" | "hex")}
				Editor={({ value, onChange }) => (
					<ModeSelector
						label="Mode"
						value={value}
						onChange={onChange}
						options={[
							{ label: "UTF-8", value: "utf8" },
							{ label: "Base64", value: "base64" },
							{ label: "Hex", value: "hex" },
						]}
					/>
				)}
			/>
			<EditableComponent
				isEditing={currentlyEditing === "value"}
				label="Value"
				value={value}
				onChange={setValue}
				Editor={TextInput}
			/>
			<EditableComponent
				isEditing={currentlyEditing === "encrypted"}
				label="Encrypted"
				value={String(isEncrypted)}
				onChange={(v) => setIsEncrypted(v === "true")}
				Editor={({ value, onChange }) =>
					adapter ? (
						<ModeSelector
							label="Mode"
							value={value}
							onChange={onChange}
							options={[
								{ label: "Encrypted", value: "true" },
								{ label: "Plain", value: "false" },
							]}
						/>
					) : (
						<Text dimColor>
							Not using an adapter, therefore you can only create a plain secret
						</Text>
					)
				}
			/>
			<EditableComponent
				isEditing={currentlyEditing === "submit"}
				label="Submit"
				value=""
				onChange={() => {}}
				Editor={() => (
					<Submitter
						category={category}
						name={name}
						value={value}
						valueEncodingType={valueEncodingType}
						isEncrypted={isEncrypted}
					/>
				)}
			/>
		</Box>
	);
}

interface EditableComponentProps {
	isEditing: boolean;
	label: string;
	value: string;
	onChange: (newValue: string) => void;
	Editor: React.FC<{
		value: string;
		onChange: (newValue: string) => void;
	}>;
}

function EditableComponent(args: EditableComponentProps) {
	const { Editor } = args;
	return (
		<Box
			borderColor={args.isEditing ? "yellow" : "cyan"}
			borderStyle={"round"}
			gap={1}
		>
			<Box>
				<Text>{args.label}:</Text>
			</Box>
			{args.isEditing ? (
				<Editor key={args.label} value={args.value} onChange={args.onChange} />
			) : (
				<Text>{args.value}</Text>
			)}
		</Box>
	);
}

interface ModeSelectorProps {
	label: string;
	value: string;
	onChange: (newValue: string) => void;
	options: { label: string; value: string }[];
}

const ModeSelector = ({ value, onChange, options }: ModeSelectorProps) => {
	const [selectedIndex, setSelectedIndex] = React.useState(
		options.findIndex((o) => o.value === value),
	);

	useInput((_input, key) => {
		if (key.leftArrow) {
			setSelectedIndex((prev) => {
				const newIndex = prev - 1;
				const wrappedIndex = newIndex < 0 ? options.length - 1 : newIndex;
				onChange(options[wrappedIndex].value);
				return wrappedIndex;
			});
		} else if (key.rightArrow) {
			setSelectedIndex((prev) => {
				const newIndex = prev + 1;
				const wrappedIndex = newIndex >= options.length ? 0 : newIndex;
				onChange(options[wrappedIndex].value);
				return wrappedIndex;
			});
		}
	}, {});

	return (
		<Box flexDirection="column" gap={1}>
			<Box gap={1}>
				{options.map((option) => (
					<Text
						key={option.value}
						dimColor={selectedIndex !== options.indexOf(option)}
					>
						{option.label}
					</Text>
				))}
			</Box>
			<Text dimColor>Press arrows to navigate</Text>
		</Box>
	);
};

interface SubmitterProps {
	category: string;
	name: string;
	value: string;
	valueEncodingType: "utf8" | "base64" | "hex";
	isEncrypted: boolean;
}

const Submitter: React.FC<SubmitterProps> = ({
	category,
	name,
	value,
	valueEncodingType,
	isEncrypted,
}) => {
	const { addSecret } = useSecretizedStore();
	const { addAlert } = useAlertStore();
	const { setCurrentScreen } = useCanvasStore();
	useInput((_input, key) => {
		if (key.return) {
			try {
				addSecret({
					category,
					name,
					value: isEncrypted
						? Buffer.from(value, valueEncodingType).toString()
						: value,
					type: isEncrypted ? "encrypted" : valueEncodingType,
				});
				addAlert(
					"removable",
					"success",
					`✓ Successfully added secret "${name}" to category "${category}"`,
				);
				setCurrentScreen("MainMenu");
			} catch (error) {
				addAlert(
					"removable",
					"error",
					`✗ Failed to add secret: ${(error as Error).message}`,
				);
			}
		}
	});
	return (
		<Box>
			<Text>Press Enter to submit</Text>
		</Box>
	);
};

// const from = {
// 	plain: {
// 		to: {
// 			base64: (input: string) => Buffer.from(input, "utf-8").toString("base64"),
// 		},
// 	},
// 	hex: {
// 		to: {
// 			base64: (input: string) => Buffer.from(input, "hex").toString("base64"),
// 			plain: (input: string) => Buffer.from(input, "hex").toString("utf-8"),
// 		},
// 	},
// 	base64: {
// 		to: {},
// 	},
// };
