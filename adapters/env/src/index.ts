import { createAdapter } from "@parma/adapter-core";
import { env } from "node:process";

export const parmaEnvAdapter = createAdapter({
	name: "env",
	parmaVersion: "1",
	isAvailable: () => {
		return true;
	},
	getPrivateKey(secretized_name) {
		if (typeof secretized_name !== "string") {
			throw new Error(
				`Invalid secretized name type: ${typeof secretized_name}`,
			);
		}
		if (!secretized_name) {
			throw new Error(`Secretized name cannot be empty`);
		}
		const value = env[`${secretized_name.toUpperCase()}_PARMA_KEY`];
		if (!value) {
			throw new Error(`Environment variable ${secretized_name} not found`);
		}
		return value;
	},
});

export default parmaEnvAdapter;
