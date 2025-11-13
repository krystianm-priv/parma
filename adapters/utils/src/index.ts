import { parmaBitwardenAdapter } from "@parma/adapter-bitwarden";
import type { Adapter } from "@parma/adapter-core";
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

export type AnyAvailableAdapter = Adapter<string, { secretizedName: string }>;

export const getAdapterByName = (
	name: (typeof availableAdapters)[number]["name"],
): AnyAvailableAdapter | undefined =>
	availableAdapters.find((adapter) => adapter.name === name) as
		| AnyAvailableAdapter
		| undefined;

export const getCreatableAdapters = (secretizedName: string) => {
	return availableAdapters.filter((adapter) =>
		adapter.canBeCreated(secretizedName),
	);
};
