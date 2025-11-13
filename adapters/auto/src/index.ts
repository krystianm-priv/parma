import parmaBitwardenAdapter from "@parma/adapter-bitwarden";
import parmaEnvAdapter from "@parma/adapter-env";
import parmaWinCredAdapter from "@parma/adapter-win-cred";

const allAdapters = {
	parmaBitwardenAdapter,
	parmaWinCredAdapter,
	parmaEnvAdapter,
};

export function getAvailableAdapters() {
	return Object.fromEntries(
		Object.entries(allAdapters).filter(([, adapter]) => adapter.isAvailable()),
	);
}
