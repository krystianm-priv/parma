import { env } from "node:process";
import { createAdapter } from "@parma/adapter-core/dev";

export const parmaEnvAdapter = createAdapter({
	name: "env",
	parmaVersion: "1",
	getPrivateKey(secretized_name) {
		if (typeof secretized_name !== "string") {
			throw new Error(
				`Invalid secretized name type: ${typeof secretized_name}`,
			);
		}
		if (!secretized_name) {
			throw new Error(`Secretized name cannot be empty`);
		}
		const value = env[secretized_name];
		if (!value) {
			throw new Error(`Environment variable ${secretized_name} not found`);
		}
		return value;
	},
});
