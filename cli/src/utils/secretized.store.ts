import {
	type AnyAvailableAdapter,
	type availableAdapters,
	getAdapterByName,
} from "@parma/adapter-utils";
import type z from "zod";
import { create } from "zustand";
import { secretizedSchema } from "./secretized.schema.js";
import { readFileSync } from "node:fs";

// store that will store the the secretized contents and the private key

interface SecretizedStore {
	adapter: ReturnType<AnyAvailableAdapter["create"]> | null;
	setAdapter(adapterName: (typeof availableAdapters)[number]["name"]): void;

	//
	secretizedSecrets: z.output<typeof secretizedSchema> | null;

	//
	configFilePath: string | null;
	setConfigFilePath(path: string | null): void;
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
}));
