import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

/**
 * Students' Gemini keys are stored encrypted with a server-side secret, so
 * a database export on its own can't read them. AES-256-GCM; the secret is
 * KEY_ENCRYPTION_SECRET in the environment. Values are tagged "enc:v1:" so
 * a plaintext value (from before this existed) still reads.
 */
const TAG = "enc:v1:";

function key(): Buffer {
  const s = process.env.KEY_ENCRYPTION_SECRET;
  if (!s) throw new Error("KEY_ENCRYPTION_SECRET is not set");
  return createHash("sha256").update(s).digest(); // any secret → 32 bytes
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  const tag = c.getAuthTag();
  return TAG + Buffer.concat([iv, tag, body]).toString("base64url");
}

export function decrypt(stored: string | null): string | null {
  if (!stored) return null;
  if (!stored.startsWith(TAG)) return stored; // legacy plaintext
  const buf = Buffer.from(stored.slice(TAG.length), "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const body = buf.subarray(28);
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(body), d.final()]).toString("utf8");
}

export function isEncrypted(stored: string | null): boolean {
  return Boolean(stored?.startsWith(TAG));
}
