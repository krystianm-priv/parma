import { platform } from "node:os";
import { createAdapter } from "@parma/adapter-core";
import { getSecret } from "./win-cred.js";

export const parmaWinCredAdapter = createAdapter({
	name: "win-cred",
	parmaVersion: "1",
	isAvailable: () => {
		return platform() === "win32";
	},
	getPrivateKey(secretized_name) {
		return getSecret(secretized_name);
	},
});

export default parmaWinCredAdapter;
