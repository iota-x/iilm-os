/**
 * npm run intake
 *
 * Reads every photo and PDF dropped into ~/Desktop/iilm/<subject>/board/ and
 * /notes/, works out when each was taken, and matches that to the class it
 * came from using the timetable. Writes the result to <subject>/_index.md as
 * a ledger with a `topic` column left blank for Claude to fill in after
 * looking at the images.
 *
 * The point: a board photo from a class you walked into halfway through has
 * no topic on it, but it does have a date — and the date plus the timetable
 * says which lecture it was, which narrows the topic to one or two candidates
 * even before anyone reads the board.
 *
 * Capture date comes from, in order: a date in the filename (screenshots,
 * or anything named YYYY-MM-DD…), EXIF DateTimeOriginal (JPEG), then the
 * file's own timestamps as a last resort, marked as approximate.
 *
 * Anything already filled in on the ledger is kept across runs, keyed by
 * filename. Nothing here touches the database.
 */

import { readdirSync, readFileSync, statSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { homedir } from "node:os";
import { slots as timetable } from "../src/data/timetable";

const ROOT = join(homedir(), "Desktop", "iilm");

/** Folder name on disk → subject slug in the app. */
const FOLDERS: Record<string, { slug: string; short: string }> = {
  applied_calculus: { slug: "applied-calculus", short: "Calculus" },
  C: { slug: "programming-in-c", short: "C" },
  digital_electronics: { slug: "digital-electronics", short: "DE+CO" },
  computational_design_thinking: { slug: "computational-design-thinking", short: "CDT" },
  AI_automation: { slug: "foundation-of-ai", short: "AI" },
  linux: { slug: "linux-administration", short: "Linux" },
};

const KINDS = ["board", "notes", "slides", "sheets"] as const;
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".heic", ".webp", ".gif"]);
const DOC_EXT = new Set([".pdf"]);

const labGroup = Number(process.env.LAB_GROUP ?? 2) as 1 | 2;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// ─── capture date ────────────────────────────────────────────────────

type Taken = { at: Date; source: "filename" | "exif" | "file" };

function fromFilename(name: string): Date | null {
  // 2026-09-16, 2026-09-16_..., 20260916_..., "Screenshot 2026-09-18 at 11.57.30 AM"
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

/** Minimal EXIF reader: APP1 → TIFF → IFD0 → Exif IFD → DateTimeOriginal. */
function fromExif(path: string): Date | null {
  let buf: Buffer;
  try {
    buf = readFileSync(path);
  } catch {
    return null;
  }
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null; // not a JPEG

  let off = 2;
  while (off + 4 < buf.length && buf[off] === 0xff) {
    const marker = buf[off + 1];
    const len = buf.readUInt16BE(off + 2);
    if (marker === 0xe1 && buf.toString("ascii", off + 4, off + 10) === "Exif\0\0") {
      const tiff = off + 10;
      const le = buf.toString("ascii", tiff, tiff + 2) === "II";
      const u16 = (p: number) => (le ? buf.readUInt16LE(p) : buf.readUInt16BE(p));
      const u32 = (p: number) => (le ? buf.readUInt32LE(p) : buf.readUInt32BE(p));

      const readIfd = (ifd: number, want: number): number | string | null => {
        if (ifd + 2 > buf.length) return null;
        const n = u16(ifd);
        for (let i = 0; i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (e + 12 > buf.length) break;
          const tag = u16(e);
          if (tag !== want) continue;
          const type = u16(e + 2);
          const count = u32(e + 4);
          if (type === 4) return u32(e + 8); // LONG (an IFD pointer)
          if (type === 2) {
            const p = count > 4 ? tiff + u32(e + 8) : e + 8;
            return buf.toString("ascii", p, p + count - 1);
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
    if (marker === 0xda) break; // start of scan — no APP1 before it
    off += 2 + len;
  }
  return null;
}

function takenAt(path: string): Taken {
  const name = basename(path);
  const fn = fromFilename(name);
  if (fn) return { at: fn, source: "filename" };
  if ([".jpg", ".jpeg"].includes(extname(name).toLowerCase())) {
    const ex = fromExif(path);
    if (ex) return { at: ex, source: "exif" };
  }
  const st = statSync(path);
  const birth = st.birthtime.getTime() > 0 ? st.birthtime : st.mtime;
  return { at: birth < st.mtime ? birth : st.mtime, source: "file" };
}

// ─── timetable match ─────────────────────────────────────────────────

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** The class this file most plausibly came from, or the day's classes. */
function sessionFor(slug: string, at: Date): { label: string; exact: boolean } {
  const day = DAY_NAMES[at.getDay()];
  const mine = timetable
    .filter((s) => s.subject === slug && s.day === day)
    .filter((s) => s.group === null || s.group === labGroup)
    .sort((a, b) => toMin(a.start) - toMin(b.start));
  if (!mine.length) {
    return { label: `${day} — no ${slug} class that day (photo of someone's notes?)`, exact: false };
  }
  const minute = at.getHours() * 60 + at.getMinutes();
  // Within the slot, or up to 40 minutes after it (photos taken as the board is wiped).
  const hit = mine.find((s) => minute >= toMin(s.start) - 10 && minute <= toMin(s.end) + 40);
  const fmt = (s: (typeof mine)[number]) =>
    `${s.kind === "lab" ? "lab" : "lecture"} ${s.start}–${s.end}`;
  if (hit) return { label: `${day} ${fmt(hit)}`, exact: true };
  return { label: `${day} — ${mine.map(fmt).join(" or ")}`, exact: false };
}

// ─── ledger ──────────────────────────────────────────────────────────

type Row = { file: string; kind: string; taken: string; via: string; session: string; topic: string; status: string };

function readExisting(indexPath: string): Map<string, Pick<Row, "topic" | "status">> {
  const kept = new Map<string, Pick<Row, "topic" | "status">>();
  if (!existsSync(indexPath)) return kept;
  for (const line of readFileSync(indexPath, "utf8").split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    // | file | kind | taken | via | session | topic | status |
    if (cells.length >= 8 && cells[1] && !cells[1].startsWith("-") && cells[1] !== "file") {
      kept.set(cells[1].replace(/`/g, ""), { topic: cells[6] ?? "", status: cells[7] ?? "" });
    }
  }
  return kept;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let totalFiles = 0;
let totalNew = 0;

for (const [folder, { slug, short }] of Object.entries(FOLDERS)) {
  const dir = join(ROOT, folder);
  if (!existsSync(dir)) continue;

  const indexPath = join(dir, "_index.md");
  const kept = readExisting(indexPath);
  const rows: Row[] = [];

  for (const kind of KINDS) {
    const kdir = join(dir, kind);
    if (!existsSync(kdir)) continue;
    for (const name of readdirSync(kdir).sort()) {
      if (name.startsWith(".")) continue;
      const ext = extname(name).toLowerCase();
      if (!IMAGE_EXT.has(ext) && !DOC_EXT.has(ext)) continue;
      const path = join(kdir, name);
      const t = takenAt(path);
      const sess = sessionFor(slug, t.at);
      const prev = kept.get(`${kind}/${name}`);
      if (!prev) totalNew++;
      rows.push({
        file: `${kind}/${name}`,
        kind,
        taken: fmtDate(t.at) + (t.source === "file" ? " (approx)" : ""),
        via: t.source,
        session: sess.label + (sess.exact ? "" : " ?"),
        topic: prev?.topic ?? "",
        status: prev?.status ?? "new",
      });
    }
  }

  if (!rows.length && !existsSync(indexPath)) continue;
  totalFiles += rows.length;

  rows.sort((a, b) => a.taken.localeCompare(b.taken));

  const lines = [
    `# ${short} — class material index`,
    "",
    `Generated by \`npm run intake\`. Re-run after adding files; the **topic** and **status** columns are kept.`,
    `Lab group ${labGroup}. "?" after a session means the time didn't fall inside a class, so the day's classes are listed instead.`,
    "",
    "| file | kind | taken | via | session | topic | status |",
    "|---|---|---|---|---|---|---|",
    ...rows.map(
      (r) => `| \`${r.file}\` | ${r.kind} | ${r.taken} | ${r.via} | ${r.session} | ${r.topic} | ${r.status} |`,
    ),
    "",
    "**status**: `new` → nobody has looked at it · `placed` → topic filled in and material added to the app · `unsure` → needs you to confirm which class it was",
    "",
  ];
  writeFileSync(indexPath, lines.join("\n"));
  console.log(`  ${short.padEnd(9)} ${String(rows.length).padStart(3)} files → ${folder}/_index.md`);
}

if (!totalFiles) {
  console.log(`\nNothing to index yet. Put files in ~/Desktop/iilm/<subject>/board/ or /notes/ and run again.`);
} else {
  console.log(`\n${totalFiles} files indexed, ${totalNew} new since last run.`);
}

/** First-run convenience: make the folders so there's somewhere to drop things. */
if (process.argv.includes("--init")) {
  for (const folder of Object.keys(FOLDERS)) {
    for (const kind of KINDS) mkdirSync(join(ROOT, folder, kind), { recursive: true });
  }
  console.log("Folders created.");
}
