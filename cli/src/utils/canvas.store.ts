import { create } from "zustand";
import type * as screens from "../screens/index.js";

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

	currentScreen: keyof typeof screens;
	setCurrentScreen: (screen: CanvasStore["currentScreen"]) => void;
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

	currentScreen: "ConfigSelector",
	setCurrentScreen: (screen: CanvasStore["currentScreen"]) =>
		set({ currentScreen: screen }),
}));
