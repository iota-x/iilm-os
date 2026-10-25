/**
 * Builds content/page-index/<catalog>.json: the words on every page of the
 * class notes and decks, so search finds "karnaugh" on DENotes p. 26 even
 * though the notes are handwritten.
 *
 *   npx tsx scripts/build-page-index.mts <pages.json>
 *
 * <pages.json> is { "<image file>": "<text>" }, made by OCR-ing the page
 * images in ~/Desktop/iilm/<subject>/slides/ (macOS Vision, which reads
 * handwriting). Which deck a page belongs to, and its label, come from the
 * DECKS table in attach-notes.mts; which topics it covers, from coverage.ts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { coverage } from "../src/data/coverage";

const CATALOG = "iilm-btech-cse-s1";
const ROOT = join(import.meta.dirname, "..");

// slides folder → subject slug
const SUBJECT: Record<string, string> = {
  digital_electronics: "digital-electronics",
  applied_calculus: "applied-calculus",
  computational_design_thinking: "computational-design-thinking",
  AI_automation: "foundation-of-ai",
  entrepreneur_mindset: "entrepreneur-mindset",
};

// read DECKS out of attach-notes.mts rather than keep a second copy of it
const src = readFileSync(join(ROOT, "scripts/attach-notes.mts"), "utf8");
const decks: { file: string; dir: string; prefix: string; label: string }[] = [];
for (const m of src.matchAll(/"([^"]+)":\s*\{\s*dir:\s*"([^"]+)",\s*image:\s*\(n\)\s*=>\s*`([^$`]+)\$\{[^}]+\}\.jpg`,\s*label:\s*"([^"]+)"/g)) {
  decks.push({ file: m[1], dir: m[2], prefix: m[3], label: m[4] });
}
if (decks.length < 10) throw new Error(`only ${decks.length} decks parsed from attach-notes.mts — has its format changed?`);

function pages(where: string): number[] {
  const m = where.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
  if (!m) return [];
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

// (file, page) → topic codes
const topicsOf = new Map<string, string[]>();
for (const [code, cov] of Object.entries(coverage)) {
  for (const s of cov.sources) {
    for (const n of pages(s.where)) {
      const k = `${s.file}#${n}`;
      topicsOf.set(k, [...(topicsOf.get(k) ?? []), code]);
    }
  }
}

const text: Record<string, string> = JSON.parse(readFileSync(process.argv[2], "utf8"));
const out: { k: string; label: string; subject: string; topics: string[]; t: string }[] = [];
let blank = 0;
for (const [image, raw] of Object.entries(text)) {
  // longest prefix wins: "AiU1-Intro-s" before "AE-s"
  const deck = decks
    .filter((d) => image.startsWith(d.prefix) && /^\d+\.jpg$/.test(image.slice(d.prefix.length)))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  if (!deck) continue;
  const n = Number(image.slice(deck.prefix.length, -4));
  const t = raw.replace(/\s+/g, " ").trim();
  if (t.length < 3) {
    blank++;
    continue;
  }
  out.push({
    k: image.replace(/\.jpg$/, ""),
    label: `${deck.label} ${n}`,
    subject: SUBJECT[deck.dir.split("/")[0]] ?? "",
    topics: topicsOf.get(`${deck.file}#${n}`) ?? [],
    t,
  });
}
out.sort((a, b) => a.k.localeCompare(b.k, undefined, { numeric: true }));
const file = join(ROOT, `content/page-index/${CATALOG}.json`);
writeFileSync(file, JSON.stringify(out));
const bytes = readFileSync(file).length;
console.log(`${out.length} pages (${blank} blank) from ${decks.length} decks → ${file} (${Math.round(bytes / 1024)} KB)`);
