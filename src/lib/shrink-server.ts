/** Server half of shrink — see shrink-browser.ts for the policy. */
import { LONG_EDGE, QUALITY } from "./shrink-browser";

/** Server: bytes → smaller JPEG bytes, via sharp. */
export async function shrinkOnServer(
  bytes: Uint8Array,
  mime: string,
): Promise<{ bytes: Uint8Array; mime: string }> {
  if (!mime.startsWith("image/") || mime === "image/gif") return { bytes, mime };
  if (bytes.length < 400 * 1024) return { bytes, mime };
  try {
    const sharp = (await import("sharp")).default;
    const out = await sharp(bytes)
      .rotate() // honour EXIF orientation before it's stripped
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: Math.round(QUALITY * 100), mozjpeg: true })
      .toBuffer();
    return out.length < bytes.length
      ? { bytes: new Uint8Array(out), mime: "image/jpeg" }
      : { bytes, mime };
  } catch {
    return { bytes, mime };
  }
}
