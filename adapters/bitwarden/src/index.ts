import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAdapter } from "@parma/adapter-core/dev";

const bwCliPkgJsonPath = import.meta.resolve("@bitwarden/cli/package.json");
const { default: bwCliPkgJson } = await import(bwCliPkgJsonPath, {
	with: { type: "json" },
});

const binPath = import.meta.resolve(
	path.join(path.dirname(fileURLToPath(bwCliPkgJsonPath)), bwCliPkgJson.bin.bw),
);

export const parmaBitwardenAdapter = createAdapter({
	name: "bitwarden",
	parmaVersion: "1",
	isAvailable: () => {
		try {
			const { output } = spawnSync("node", [binPath, "login", "status"]);
			return output.toString().includes("already logged in as");
		} catch (error) {
			console.error(error);
			return false;
		}
	},
	getPrivateKey(secretized_name) {
		return spawnSync("node", [
			binPath,
			"get",
			"item",
			`${secretized_name}_SECRETIZED_KEY`,
		]).output.toString();
	},
});

export default parmaBitwardenAdapter;
