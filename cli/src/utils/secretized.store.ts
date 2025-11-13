import { create } from "zustand";

// store that will store the the secretized contents and the private key

interface SecretizedStore {
	privateKey: string | null;
	setPrivateKey: (key: SecretizedStore["privateKey"]) => void;
	filePath: string | null;
	setFilePath: (path: SecretizedStore["filePath"]) => void;
	saveSecrets: () => Promise<void>;
}

export const useSecretizedStore = create<SecretizedStore>((set) => ({
	privateKey: null as string | null,
	setPrivateKey: (key) => set({ privateKey: key }),
	filePath: null as string | null,
	setFilePath: (path) => set({ filePath: path }),
	parsedConfig: null as string | null,
	saveSecrets: async () => {
		// Implement saveSecrets logic here
	},
}));
