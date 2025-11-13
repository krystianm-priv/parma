import { parmaBitwardenAdapter } from "@parma/adapter-bitwarden";
import { parmaEnvAdapter } from "@parma/adapter-env";
import { parmaWinCredAdapter } from "@parma/adapter-win-cred";

export const allAdapters = [
	parmaBitwardenAdapter,
	parmaEnvAdapter,
	parmaWinCredAdapter,
] as const;

export const availableAdapters = allAdapters.filter((adapter) =>
	adapter.isAvailable(),
);

export const getAdapterByName = (
	name: (typeof allAdapters)[number]["name"],
) => {
	return allAdapters.find((adapter) => adapter.name === name);
};
