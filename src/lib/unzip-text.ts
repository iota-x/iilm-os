/**
 * The chat text out of a WhatsApp export. Android exports a plain .txt; an
 * iPhone exports a .zip holding `_chat.txt`. Reads the zip's central
 * directory and inflates the one text file with the platform's own
 * DecompressionStream, so no zip library ships to the browser.
 */
export async function textFromChatFile(file: File): Promise<string> {
  const isZip = /\.zip$/i.test(file.name) || file.type === "application/zip";
  if (!isZip) return file.text();

  const buf = new Uint8Array(await file.arrayBuffer());
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  // end of central directory: last 0x06054b50 in the file
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("That zip couldn't be read.");
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  let best: { method: number; size: number; offset: number } | null = null;
  for (let n = 0; n < count && dv.getUint32(p, true) === 0x02014b50; n++) {
    const method = dv.getUint16(p + 10, true);
    const size = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extra = dv.getUint16(p + 30, true);
    const comment = dv.getUint16(p + 32, true);
    const offset = dv.getUint32(p + 42, true);
    const name = dec.decode(buf.subarray(p + 46, p + 46 + nameLen));
    if (/(^|\/)_chat\.txt$/i.test(name) || (!best && /\.txt$/i.test(name))) best = { method, size, offset };
    p += 46 + nameLen + extra + comment;
  }
  if (!best) throw new Error("No chat text in that zip.");

  const lh = best.offset;
  const start = lh + 30 + dv.getUint16(lh + 26, true) + dv.getUint16(lh + 28, true);
  const raw = buf.slice(start, start + best.size);
  if (best.method === 0) return dec.decode(raw);
  if (best.method !== 8) throw new Error("That zip is compressed in a way Semwise can't read.");
  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
}
