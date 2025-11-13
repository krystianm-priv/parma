import assert from "node:assert";
import { randomBytes } from "node:crypto";
import { describe, it } from "node:test";
import { addSecret, getSecret } from "./win-cred.ts";

describe("Win-Cred Adapter", () => {
  const secretName = "PARMA_TEST_SECRET";
  const secretValue = Buffer.from(randomBytes(32)).toString("base64");

  it("should add and retrieve a secret", () => {
    addSecret(secretName, secretValue);
    const retrievedValue = getSecret(secretName);
    assert.strictEqual(retrievedValue, secretValue);
  });
});
