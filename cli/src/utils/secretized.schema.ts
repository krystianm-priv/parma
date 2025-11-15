import { z } from "zod";

/* ============================================================
   $defs
   ============================================================ */

// Base64-encoded encrypted value
const encryptedValueSchema = z
	.string()
	.regex(/^[A-Za-z0-9+/=:]+$/, "Invalid Base64 ciphertext");

// Fully recursive plain_value definition
const plainValueSchema: z.ZodType<unknown> = z.lazy(() =>
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.null(),
		z.array(plainValueSchema),
		// object with arbitrary string keys, values are plainValueSchema
		z.record(z.string(), plainValueSchema),
	]),
);

// labels: keys match /^[a-zA-Z0-9_.-]+$/, values: string
const labelsSchema = z.record(
	z
		.string()
		.regex(/^[a-zA-Z0-9_.-]+$/), //
	z.string(),
);

/* ============================================================
   Secret types
   ============================================================ */

const plainSecretSchema = z.object({
	kind: z.literal("utf8"),
	value: plainValueSchema,
	labels: labelsSchema.optional(),
});

const plainHexSecretSchema = z.object({
	kind: z.literal("hex"),
	value: z.string().regex(/^(?:[0-9a-fA-F]{2})+$/, "Invalid hex string"),
	labels: labelsSchema.optional(),
});

const plainBase64SecretSchema = z.object({
	kind: z.literal("base64"),
	value: z.string().regex(/^[A-Za-z0-9+/=]+$/, "Invalid Base64 string"),
	labels: labelsSchema.optional(),
});

const encryptedSecretSchema = z.object({
	kind: z.literal("encrypted"),
	value: encryptedValueSchema,
	labels: labelsSchema.optional(),
});

const secretValueSchema = z.union([
	plainSecretSchema,
	plainHexSecretSchema,
	plainBase64SecretSchema,
	encryptedSecretSchema,
]);

/* ============================================================
   secrets: patternProperties
   ============================================================ */

const CATEGORY_PATTERN = /^.*$/;
const SECRET_KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/;

// secrets: Record<categoryName, Record<SECRET_KEY, SecretValue>>
const secretsSchema = z.record(
	z
		.string()
		.regex(CATEGORY_PATTERN), // category
	z.record(z.string().regex(SECRET_KEY_PATTERN), secretValueSchema),
);

/* ============================================================
   Root Schema
   ============================================================ */

export const secretizedSchema = z.object({
	$schema: z.literal(
		"https://gist.githubusercontent.com/krystianm-priv/9c907767f490f8f071e45be18010dde2/raw/v1.secretized-schema.json",
	),

	"#version": z.literal(1),

	"#name": z
		.string()
		.regex(/^[A-Z0-9_]{3,64}$/, "Invalid secretized file name"),

	secrets: secretsSchema,
});

/* ============================================================
   Types
   ============================================================ */

export type SecretizedFile = z.infer<typeof secretizedSchema>;
export type SecretValue = z.infer<typeof secretValueSchema>;
