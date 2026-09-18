/**
 * When was this photo taken, and which class was it?
 *
 * Runs in the browser (inbox upload), on the server (Android share target)
 * and in scripts/intake.ts, so it works on plain Uint8Array and Date — no
 * Node or DOM APIs.
 *
 * The capture time comes from JPEG EXIF DateTimeOriginal, which every phone
 * camera writes. Screenshots and PDFs have none, so callers fall back to the
 * file's own timestamp. A time plus the timetable names the lecture: a photo
 * at Wed 11:40 during the DE+CO slot can only be DE+CO.
 */

export interface SlotLike {
  id?: string;
  day: string; // "Mon" … "Sat"
  start_time: string; // "11:10" or "11:10:00"
  end_time: string;
  subject_id?: string | null;
  subject?: string; // slug, in the seed data
  kind: string;
  lab_group: number | null;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Minimal EXIF reader: APP1 → TIFF → IFD0 → Exif IFD → DateTimeOriginal. */
export function exifDate(bytes: Uint8Array): Date | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null; // not a JPEG
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (a: number, b: number) => {
    let s = "";
    for (let i = a; i < b && i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return s;
  };

  let off = 2;
  while (off + 4 < bytes.length && bytes[off] === 0xff) {
    const marker = bytes[off + 1];
    const len = dv.getUint16(off + 2);
    if (marker === 0xe1 && ascii(off + 4, off + 10) === "Exif\0\0") {
      const tiff = off + 10;
      const le = ascii(tiff, tiff + 2) === "II";
      const u16 = (p: number) => dv.getUint16(p, le);
      const u32 = (p: number) => dv.getUint32(p, le);

      const readIfd = (ifd: number, want: number): number | string | null => {
        if (ifd + 2 > bytes.length) return null;
        const n = u16(ifd);
        for (let i = 0; i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (e + 12 > bytes.length) break;
          if (u16(e) !== want) continue;
          const type = u16(e + 2);
          const count = u32(e + 4);
          if (type === 4) return u32(e + 8);
          if (type === 2) {
            const p = count > 4 ? tiff + u32(e + 8) : e + 8;
            return ascii(p, p + count - 1);
          }
        }
        return null;
      };

      const ifd0 = tiff + u32(tiff + 4);
      const exifPtr = readIfd(ifd0, 0x8769);
      const raw =
        (typeof exifPtr === "number" ? readIfd(tiff + exifPtr, 0x9003) : null) ??
        readIfd(ifd0, 0x0132);
      if (typeof raw === "string") {
        const m = raw.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
        if (m) {
          const [, y, mo, d, h, mi, s] = m.map(Number);
          return new Date(y, mo - 1, d, h, mi, s);
        }
      }
      return null;
    }
    if (marker === 0xda) break;
    off += 2 + len;
  }
  return null;
}

/** A date written into the filename, as screenshots do. */
export function filenameDate(name: string): Date | null {
  const m =
    name.match(/(\d{4})-(\d{2})-(\d{2})(?:[ _T-]+(?:at )?(\d{1,2})[.:](\d{2}))?/) ??
    name.match(/(\d{4})(\d{2})(\d{2})[_-](\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  let hour = h ? Number(h) : 12;
  if (/PM/i.test(name) && hour < 12) hour += 12;
  if (/AM/i.test(name) && hour === 12) hour = 0;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d), hour, mi ? Number(mi) : 0);
  return isNaN(dt.getTime()) ? null : dt;
}

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export interface SessionMatch<S extends SlotLike> {
  /** the class the time falls inside (or just after) */
  slot: S | null;
  /** every class that day for this group, when the time doesn't pin one down */
  candidates: S[];
  day: string;
}

/**
 * Which class a moment belongs to. A photo taken up to 40 minutes after a
 * class ends still counts as that class — the board gets photographed as
 * people are leaving.
 */
export function matchSession<S extends SlotLike>(
  at: Date,
  slots: S[],
  labGroup: number,
): SessionMatch<S> {
  const day = DAY_NAMES[at.getDay()];
  const candidates = slots
    .filter((s) => s.day === day)
    .filter((s) => s.lab_group === null || s.lab_group === labGroup)
    .sort((a, b) => toMin(a.start_time) - toMin(b.start_time));
  const minute = at.getHours() * 60 + at.getMinutes();
  // Precedence: the class that's running, then the one that just ended,
  // then the one about to start. Boards are photographed on the way out,
  // so a photo in the gap between two classes belongs to the earlier one —
  // and a running class always beats one that ended 40 minutes ago.
  const running = candidates.find(
    (s) => minute >= toMin(s.start_time) && minute <= toMin(s.end_time),
  );
  const justEnded = candidates.find(
    (s) => minute > toMin(s.end_time) && minute <= toMin(s.end_time) + 40,
  );
  const aboutToStart = candidates.find(
    (s) => minute >= toMin(s.start_time) - 10 && minute < toMin(s.start_time),
  );
  return { slot: running ?? justEnded ?? aboutToStart ?? null, candidates, day };
}
