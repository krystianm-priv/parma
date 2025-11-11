import { describe, test } from "node:test";
import assert from "node:assert";
import { parmaEnvAdapter } from "./index.ts";
import { randomBytes } from "node:crypto";

// biome-ignore lint/complexity/useLiteralKeys: Property 'INTERNAL_TEST' comes from an index signature, so it must be accessed with ['INTERNAL_TEST']. (ts 4111)
process.env["INTERNAL_TEST"] = randomBytes(32).toString("base64");

describe("PARMA env adapter", () => {
	if (!("INTERNAL_TEST" in process.env)) {
		throw new Error("INTERNAL_TEST environment variable is not set");
	}

	const adapter = parmaEnvAdapter({
		secretizedName: "INTERNAL_TEST",
		cacheDecryptedValues: false,
		cachePrivateKey: false,
	});

	test("encrypts and decrypts a value", () => {
		const value = "test";
		const encrypted = adapter.encryptValue(value);
		assert.strictEqual(value, adapter.decryptValue(encrypted));
	});
});
