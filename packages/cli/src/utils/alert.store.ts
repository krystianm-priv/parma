import { create } from "zustand";

type AlertType = "warning" | "error" | "success";

type Promisified = {
	alertType: "promisified";
	promise: Promise<void>;
	resolve: () => void;
	reject: () => void;
};

type Removable = {
	alertType: "removable";
	remove: () => void;
};

interface AlertStore {
	// store alerts as array instead of requiring them to be added one by one
	alerts: ({
		type: AlertType;
		message: string;
	} & (Promisified | Removable))[];

	addAlert: (
		alertType: "promisified" | "removable",
		type: AlertStore["alerts"][number]["type"],
		message: string,
	) => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set) => ({
	alerts: [],
	addAlert: async (alertType, type, message) => {
		if (alertType === "removable") {
			set((state) => ({
				alerts: [
					{
						alertType,
						type,
						message,
						remove() {
							set((state) => ({
								...state,
								// alerts: state.alerts.filter((a) => a !== alert),
							}));
						},
					},
					...state.alerts,
				],
			}));
		} else {
			let resolve: (value: void | PromiseLike<void>) => void;
			let reject: (value: void | PromiseLike<void>) => void;
			const promise = new Promise<void>((_resolve, _reject) => {
				resolve = _resolve;
				reject = _reject;
			});

			set((state) => ({
				alerts: [
					{
						alertType,
						type,
						message,
						promise,
						resolve,
						reject,
					},
					...state.alerts,
				],
			}));
		}
	},
}));
