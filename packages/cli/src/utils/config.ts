import fs from "node:fs";

import crypto from "node:crypto";

export interface SecretValue {
	kind: "plain" | "encrypted";
	value: string;
	labels?: string[];
}

export interface SecretsConfig {
	$schema: string;
	"#version": number;
	"#name": string;
	secrets: Record<string, Record<string, SecretValue>>;
}

/**
 * Load and parse a secretized config file
 */
export function loadConfig(filePath: string): SecretsConfig {
	try {
		const content = fs.readFileSync(filePath, "utf-8");
		return JSON.parse(content);
	} catch (error) {
		throw new Error(`Failed to load config from ${filePath}: ${error}`);
	}
}

/**
 * Save a secretized config file
 */
export function saveConfig(filePath: string, config: SecretsConfig): void {
	try {
		const content = JSON.stringify(config, null, 2);
		fs.writeFileSync(filePath, content, "utf-8");
	} catch (error) {
		throw new Error(`Failed to save config to ${filePath}: ${error}`);
	}
}

/**
 * Create a new empty config
 */
export function createEmptyConfig(name: string): SecretsConfig {
	return {
		$schema: "https://gist.githubusercontent.com/.../v1.secretized-schema.json",
		"#version": 1,
		"#name": name,
		secrets: {},
	};
}

/**
 * Generate a new AES-256 key (32 bytes, base64 encoded)
 */
export function generateKey(): string {
	return crypto.randomBytes(32).toString("base64");
}

/**
 * Validate if a base64 string is a valid AES-256 key (32 bytes)
 */
export function validateKey(base64Key: string): boolean {
	try {
		const buf = Buffer.from(base64Key.trim(), "base64");
		return buf.length === 32;
	} catch {
		return false;
	}
}

/**
 * Validate config name format (UPPER_CASE_WITH_UNDERSCORES)
 */
export function validateConfigName(name: string): boolean {
	return /^[A-Z][A-Z0-9_]*$/.test(name);
}

/**
 * Get environment variable name for a config
 */
export function getEnvKeyName(configName: string): string {
	return `${configName}_SECRETIZED_KEY`;
}

/**
 * Get file name for a config
 */
export function getConfigFileName(configName: string): string {
	return `${configName.toLowerCase()}.secretized.json`;
}

/**
 * Encrypt a value using AES-256-GCM
 */
export function encryptValue(value: string, keyBase64: string): string {
	const key = Buffer.from(keyBase64, "base64");
	const iv = crypto.randomBytes(12); // GCM standard IV size
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

	let encrypted = cipher.update(value, "utf8", "base64");
	encrypted += cipher.final("base64");

	const authTag = cipher.getAuthTag();

	// Format: iv:authTag:ciphertext (all base64)
	return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypt a value using AES-256-GCM
 */
export function decryptValue(
	encryptedValue: string,
	keyBase64: string,
): string {
	try {
		const key = Buffer.from(keyBase64, "base64");
		const parts = encryptedValue.split(":");

		if (parts.length !== 3) {
			throw new Error("Invalid encrypted value format");
		}

		const iv = Buffer.from(parts[0], "base64");
		const authTag = Buffer.from(parts[1], "base64");
		const ciphertext = parts[2];

		const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(authTag);

		let decrypted = decipher.update(ciphertext, "base64", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		throw new Error(`Failed to decrypt value: ${error}`);
	}
}

/**
 * Get all categories from a config
 */
export function getCategories(config: SecretsConfig): string[] {
	return Object.keys(config.secrets || {});
}

/**
 * Get all secret keys in a category
 */
export function getSecretsInCategory(
	config: SecretsConfig,
	category: string,
): string[] {
	return Object.keys(config.secrets?.[category] || {});
}

/**
 * Count total secrets in config
 */
export function countSecrets(config: SecretsConfig): number {
	return Object.keys(config.secrets || {}).reduce((acc, category) => {
		return acc + Object.keys(config.secrets[category] || {}).length;
	}, 0);
}

/**
 * Add a secret to config
 */
export function addSecret(
	config: SecretsConfig,
	category: string,
	key: string,
	value: SecretValue,
): SecretsConfig {
	const newConfig = { ...config };

	if (!newConfig.secrets[category]) {
		newConfig.secrets[category] = {};
	}

	newConfig.secrets[category][key] = value;

	return newConfig;
}

/**
 * Remove a secret from config
 */
export function removeSecret(
	config: SecretsConfig,
	category: string,
	key: string,
): SecretsConfig {
	const newConfig = { ...config };

	if (newConfig.secrets[category]) {
		delete newConfig.secrets[category][key];

		// Remove category if empty
		if (Object.keys(newConfig.secrets[category]).length === 0) {
			delete newConfig.secrets[category];
		}
	}

	return newConfig;
}

/**
 * Update a secret value
 */
export function updateSecret(
	config: SecretsConfig,
	category: string,
	key: string,
	value: SecretValue,
): SecretsConfig {
	const newConfig = { ...config };

	if (newConfig.secrets[category]?.[key]) {
		newConfig.secrets[category][key] = value;
	}

	return newConfig;
}

/**
 * Find all config files in a directory
 */
export function findConfigFiles(dir: string = process.cwd()): string[] {
	try {
		const files = fs.readdirSync(dir);
		return files.filter((f) => f.endsWith(".secretized.json"));
	} catch {
		return [];
	}
}
