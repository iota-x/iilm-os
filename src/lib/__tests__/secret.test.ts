import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.KEY_ENCRYPTION_SECRET = "test-secret-not-for-production";
});

describe("secret", () => {
  it("round-trips and tags encrypted values", async () => {
    const { decrypt, encrypt, isEncrypted } = await import("@/lib/secret");
    const stored = encrypt("AQ.example-key");
    expect(stored.startsWith("enc:v1:")).toBe(true);
    expect(isEncrypted(stored)).toBe(true);
    expect(decrypt(stored)).toBe("AQ.example-key");
  });
  it("uses a fresh IV each time", async () => {
    const { encrypt } = await import("@/lib/secret");
    expect(encrypt("same")).not.toBe(encrypt("same"));
  });
  it("passes legacy plaintext and null through", async () => {
    const { decrypt, isEncrypted } = await import("@/lib/secret");
    expect(decrypt("plain-old-key")).toBe("plain-old-key");
    expect(isEncrypted("plain-old-key")).toBe(false);
    expect(decrypt(null)).toBeNull();
  });
});
