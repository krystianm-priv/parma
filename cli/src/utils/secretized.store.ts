import {
	type AnyAvailableAdapter,
	type availableAdapters,
	getAdapterByName,
} from "@parma/adapter-utils";
import type z from "zod";
import { create } from "zustand";
import { secretizedSchema } from "./secretized.schema.js";
import { readFileSync, writeFileSync } from "node:fs";

// store that will store the the secretized contents and the private key

interface SecretizedStore {
	adapter: ReturnType<AnyAvailableAdapter["create"]> | null;
	setAdapter(adapterName: (typeof availableAdapters)[number]["name"]): void;

	//
	secretizedSecrets: z.output<typeof secretizedSchema> | null;

	//
	configFilePath: string | null;
	setConfigFilePath(path: string | null): void;
	saveConfigFile(): void;

	// add secret
	addSecret: (params: {
		category: string;
		name: string;
		type: "utf8" | "base64" | "hex" | "encrypted";
		value: string;
	}) => void;
}

export const useSecretizedStore = create<SecretizedStore>((set, get) => ({
	adapter: null,
	secretizedSecrets: null,
	configFilePath: null,

	setAdapter(adapterName) {
		const { secretizedSecrets } = get();
		if (!secretizedSecrets) {
			throw new Error("Secretized secrets not loaded yet");
		}
		const adapterToUse = getAdapterByName(adapterName);
		if (!adapterToUse) {
			throw new Error(`Adapter ${adapterName} not found`);
		}
		set({
			adapter: adapterToUse.create({
				secretizedName: secretizedSecrets["#name"],
			}),
		});
	},

	setConfigFilePath(path) {
		if (path === null) {
			set({ configFilePath: null, secretizedSecrets: null });
		} else {
			const contents = readFileSync(path, "utf-8");
			const jsoned = JSON.parse(contents);
			const validated = secretizedSchema.parse(jsoned);
			set({
				configFilePath: path,
				secretizedSecrets: validated,
			});
		}
	},

	saveConfigFile() {
		const { configFilePath, secretizedSecrets, setConfigFilePath } = get();
		if (!configFilePath) {
			throw new Error("No config file path set");
		}
		if (!secretizedSecrets) {
			throw new Error("Secretized secrets not loaded yet");
		}
		const serialized = JSON.stringify(secretizedSecrets, null, "\t");
		writeFileSync(configFilePath, serialized, "utf-8");
		setConfigFilePath(configFilePath); // reload to ensure consistency
	},

	addSecret: ({ category, name, value, type }) => {
		const { secretizedSecrets, adapter, saveConfigFile } = get();
		if (!secretizedSecrets) {
			throw new Error("Secretized secrets not loaded yet");
		}
		// biome-ignore lint/suspicious/noAssignInExpressions: allow this
		const categoryRef = (secretizedSecrets.secrets[category] ??= {});
		if (categoryRef[name]) {
			throw new Error(
				`Secret with name ${name} already exists in category ${category}`,
			);
		}

		if (type === "encrypted") {
			if (!adapter) {
				throw new Error("No adapter set for encryption");
			}
			const encryptedValue = adapter.encryptValue(value);
			categoryRef[name] = {
				kind: "encrypted",
				value: encryptedValue,
			};
		} else {
			categoryRef[name] = {
				kind: type,
				value: value,
			};
		}

		saveConfigFile();
	},
}));
