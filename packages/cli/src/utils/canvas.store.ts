import { create } from "zustand";

interface CanvasStore {
	pageTitle: string;
	setPageTitle: (title: CanvasStore["pageTitle"]) => void;
	clearPageTitle: () => void;

	footerInstructions: React.ReactNode;
	setFooterInstructions: (
		instructions: CanvasStore["footerInstructions"],
	) => void;
	clearFooterInstructions: () => void;

	cleanup: () => void;

	currentScreen: "create" | "config-selector" | "main-menu";
	setCurrentScreen: (screen: CanvasStore["currentScreen"]) => void;

	configFilePath: string | null;
	setConfigFilePath: (path: string | null) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
	pageTitle: "",
	setPageTitle: (title: string) => set({ pageTitle: title }),
	clearPageTitle: () => set({ pageTitle: "" }),

	footerInstructions: null,
	setFooterInstructions: (instructions: React.ReactNode) =>
		set({ footerInstructions: instructions }),
	clearFooterInstructions() {
		set({ footerInstructions: null });
	},

	cleanup() {
		set({ pageTitle: "", footerInstructions: null });
	},

	currentScreen: "config-selector",
	setCurrentScreen: (screen: CanvasStore["currentScreen"]) =>
		set({ currentScreen: screen }),

	configFilePath: null,
	setConfigFilePath: (path: string | null) => set({ configFilePath: path }),
}));
