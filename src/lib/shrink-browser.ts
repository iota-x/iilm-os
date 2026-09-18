/**
 * Board photos come off a phone at 3-4 MB and 4000px. Nobody reads a
 * whiteboard at that size, and the free storage tier is 1 GB for the whole
 * section. 1600px on the long edge at JPEG 80 keeps every line of handwriting
 * legible at roughly a tenth of the bytes.
 *
 * Two implementations of the same policy: the browser one runs before the
 * inbox upload, the server one in the share-target route. Both strip EXIF —
 * the capture time is read *before* shrinking and stored on the row.
 */

export const LONG_EDGE = 1600;
export const QUALITY = 0.8;

/** Browser: File → smaller JPEG File. Non-images and small files pass through. */
export async function shrinkInBrowser(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  if (file.size < 400 * 1024) return file; // already small
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, LONG_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.type === "image/jpeg") {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    return file; // HEIC without browser support, or anything odd: keep the original
  }
}

