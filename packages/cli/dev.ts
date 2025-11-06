import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const tsConfigPath = ts.findConfigFile(
	process.cwd(),
	ts.sys.fileExists,
	"tsconfig.json",
);

if (!tsConfigPath) throw new Error("No tsconfig.json found");

const { config: tsConfig, error } = ts.readConfigFile(
	tsConfigPath,
	ts.sys.readFile,
);

if (error)
	throw new Error(ts.formatDiagnostics([error], ts.createCompilerHost({})));

const parsed = ts.parseJsonConfigFileContent(
	tsConfig,
	ts.sys,
	dirname(tsConfigPath),
);

registerHooks({
	load: (url, context, nextLoad) => {
		if (extname(url) === ".tsx") {
			const source = readFileSync(fileURLToPath(url), "utf-8");
			const { outputText } = ts.transpileModule(source, {
				compilerOptions: {
					...parsed.raw.compilerOptions,
					module: ts.ModuleKind.ESNext,
				},
				fileName: fileURLToPath(url),
			});
			return {
				url,
				format: "module",
				shortCircuit: true,
				source: outputText,
			};
		}

		return nextLoad(url, context);
	},
});

import("./src/index.tsx");
