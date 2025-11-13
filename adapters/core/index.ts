import {
	createCipheriv,
	createDecipheriv,
	createHash,
	randomBytes,
} from "node:crypto";

const rawDecrypt = (privateKey: string, data: string) => {
	// Data format: iv:authTag:encryptedData (all in hex)
	const parts = data.split(":");
	if (parts.length !== 3) {
		throw new Error("Invalid encrypted data format");
	}

	const [ivHex, authTagHex, encryptedHex] = parts as [string, string, string];
	const iv = Buffer.from(ivHex, "hex");
	const authTag = Buffer.from(authTagHex, "hex");
	const encrypted = Buffer.from(encryptedHex, "hex");

	const key = createHash("sha256").update(privateKey).digest();

	const decipher = createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([
		decipher.update(encrypted),
		decipher.final(),
	]);

	return decrypted.toString("utf8");
};

const rawEncrypt = (privateKey: string, data: string) => {
	// Generate random 12-byte IV (recommended for GCM)
	const iv = randomBytes(12);

	// Derive 256-bit key from privateKey
	const key = createHash("sha256").update(privateKey).digest();

	const cipher = createCipheriv("aes-256-gcm", key, iv);

	const encrypted = Buffer.concat([
		cipher.update(data, "utf8"),
		cipher.final(),
	]);

	const authTag = cipher.getAuthTag();

	// Return format: iv:authTag:encryptedData (all in hex)
	return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString(
		"hex",
	)}`;
};

export interface AdapterOpts<Name extends string> {
	secretizedName: Name;
	cachePrivateKey?: boolean;
	cacheDecryptedValues?: boolean;
}

export interface Adapter<
	Name extends string,
	Opts extends AdapterOpts<Name> = AdapterOpts<Name>,
> {
	name: Name;
	version: "1";
	isAvailable(): boolean;
	canBeCreated(secretizedName: string): boolean;
	create: (userOpts: Opts) => {
		encryptValue: (value: string) => string;
		decryptValue: (value: string) => string;
	};
}

export const createAdapter = <
	Name extends string,
	Opts extends AdapterOpts<Name>,
>(adapterOpts: {
	name: Name;
	parmaVersion: "1";
	getPrivateKey: (secretizedName: string) => string;
	isAvailable: () => boolean;
}): Adapter<Name, Opts> => {
	const name = adapterOpts.name;
	const version = adapterOpts.parmaVersion;
	const isAvailable = adapterOpts.isAvailable;
	const canBeCreated = (secretizedName: string): boolean => {
		try {
			const privateKey = adapterOpts.getPrivateKey(secretizedName);
			return Boolean(privateKey);
		} catch {
			// If any error occurs (i.e., key not found or unusable), return false
			return false;
		}
	};
	return {
		name,
		version,
		isAvailable,
		canBeCreated,
		create: (userOpts: AdapterOpts<Name>) => {
			if (!isAvailable()) {
				throw new Error(
					`Adapter ${adapterOpts.name} is not available on this platform.`,
				);
			}
			if (!canBeCreated(userOpts.secretizedName)) {
				throw new Error(
					`Adapter ${adapterOpts.name} cannot be created for secretized name "${userOpts.secretizedName}".`,
				);
			}
			let privateKeyCache: string;
			const decryptedValuesCache: Record<string, string> = {};

			const decrypt =
				userOpts?.cacheDecryptedValues === true
					? (((privateKey, value) => {
							if (decryptedValuesCache[value]) {
								return decryptedValuesCache[value];
							}
							const decryptedValue = rawDecrypt(privateKey, value);
							decryptedValuesCache[value] = decryptedValue;
							return decryptedValue;
						}) as typeof rawDecrypt)
					: rawDecrypt;

			const encrypt =
				userOpts?.cachePrivateKey === true
					? (((privateKey, value) => {
							if (!privateKeyCache) {
								privateKeyCache = privateKey;
							}
							return rawEncrypt(privateKeyCache, value);
						}) as typeof rawEncrypt)
					: rawEncrypt;

			const encryptValue =
				userOpts.cachePrivateKey === true
					? (value: string) => {
							if (!privateKeyCache) {
								privateKeyCache = adapterOpts.getPrivateKey(
									userOpts.secretizedName,
								);
							}
							return encrypt(privateKeyCache, value);
						}
					: (value: string) => {
							return encrypt(
								adapterOpts.getPrivateKey(userOpts.secretizedName),
								value,
							);
						};
			const decryptValue =
				userOpts.cachePrivateKey === true
					? (value: string) => {
							if (!privateKeyCache) {
								privateKeyCache = adapterOpts.getPrivateKey(
									userOpts.secretizedName,
								);
							}
							return decrypt(privateKeyCache, value);
						}
					: (value: string) => {
							return decrypt(
								adapterOpts.getPrivateKey(userOpts.secretizedName),
								value,
							);
						};

			return {
				encryptValue,
				decryptValue,
			};
		},
	};
};
