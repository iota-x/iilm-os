/**
 * Dry-run check of the seed data. No network, no database.
 *   npx tsx scripts/verify.ts
 */
import { subjects, exams } from "../src/data";
import { slots } from "../src/data/timetable";
import { resources } from "../src/data/resources";
import { planDays } from "../src/data/plan";

let problems = 0;
const bad = (m: string) => {
  console.log(`  ✗ ${m}`);
  problems++;
};
const ok = (m: string) => console.log(`  ✓ ${m}`);

console.log("\nSUBJECTS");
const slugs = new Set<string>();
for (const s of subjects) {
  if (slugs.has(s.slug)) bad(`duplicate slug ${s.slug}`);
  slugs.add(s.slug);
  const t = s.units.flatMap((u) => u.topics);
  console.log(
    `  ${s.shortName.padEnd(9)} ${String(s.units.length).padStart(2)} units · ${String(t.length).padStart(2)} topics · ${String(t.filter((x) => x.inMidsem).length).padStart(2)} in mid-sem · ${String(s.experiments.length).padStart(2)} experiments · ${s.components.length} components · ${s.strategies.length} strategies · [${s.status}]`,
  );
}

console.log("\nTOPIC CODES");
const codes = new Map<string, string>();
for (const s of subjects)
  for (const u of s.units)
    for (const t of u.topics) {
      if (codes.has(t.code)) bad(`duplicate topic code ${t.code}`);
      codes.set(t.code, s.slug);
      if (t.weight < 1 || t.weight > 5) bad(`${t.code} weight out of range: ${t.weight}`);
    }
ok(`${codes.size} unique topic codes`);

console.log("\nUNIT / MIDSEM CONSISTENCY");
for (const s of subjects)
  for (const u of s.units) {
    const mism = u.topics.filter((t) => t.inMidsem !== u.inMidsem);
    if (mism.length) bad(`${s.slug} U${u.number}: ${mism.length} topics disagree with unit inMidsem`);
  }
ok("unit and topic mid-sem flags agree");

console.log("\nRESOURCES");
const unitKeys = new Set(subjects.flatMap((s) => s.units.map((u) => `${s.slug}-u${u.number}`)));
let unresolved = 0;
for (const r of resources) {
  const hit = codes.has(r.target) || unitKeys.has(r.target) || slugs.has(r.target);
  if (!hit) {
    bad(`resource target "${r.target}" resolves to nothing — ${r.title}`);
    unresolved++;
  }
  try {
    new URL(r.url);
  } catch {
    bad(`bad URL on "${r.title}": ${r.url}`);
  }
}
if (!unresolved) ok(`${resources.length} resources, every target resolves`);
const byKind: Record<string, number> = {};
for (const r of resources) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
console.log("  " + Object.entries(byKind).map(([k, v]) => `${k}:${v}`).join("  "));

console.log("\nTIMETABLE");
for (const s of slots) if (!slugs.has(s.subject)) bad(`slot references unknown subject ${s.subject}`);
for (const g of [1, 2] as const) {
  const mine = slots.filter((s) => s.group === null || s.group === g);
  const mins = mine.reduce((a, s) => {
    const [h1, m1] = s.start.split(":").map(Number);
    const [h2, m2] = s.end.split(":").map(Number);
    return a + (h2 * 60 + m2 - (h1 * 60 + m1));
  }, 0);
  console.log(`  group ${g}: ${mine.length} slots · ${(mins / 60).toFixed(1)} contact hours/week`);
}
// clash check for group 2
const g2 = slots.filter((s) => s.group === null || s.group === 2);
for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"]) {
  const d = g2.filter((s) => s.day === day).sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < d.length; i++)
    if (d[i].start < d[i - 1].end)
      bad(`group 2 clash on ${day}: ${d[i - 1].subject} ends ${d[i - 1].end}, ${d[i].subject} starts ${d[i].start}`);
}
ok("no timetable clashes for group 2");

console.log("\nPLAN");
let totalMin = 0;
let overBudget = 0;
const seen = new Set<string>();
for (const d of planDays) {
  if (seen.has(d.date)) bad(`duplicate plan day ${d.date}`);
  seen.add(d.date);
  const mins = d.blocks.reduce((a, b) => a + b.minutes, 0);
  totalMin += mins;
  if (mins > d.budget) {
    bad(`${d.date} (${d.weekday}) schedules ${mins}m against a ${d.budget}m budget`);
    overBudget++;
  }
  for (const b of d.blocks) {
    if (!slugs.has(b.subject)) bad(`${d.date}: unknown subject ${b.subject}`);
  }
}
if (!overBudget) ok("no day exceeds its stated budget");
console.log(
  `  ${planDays.length} days · ${planDays.reduce((a, d) => a + d.blocks.length, 0)} blocks · ${(totalMin / 60).toFixed(1)} study hours total`,
);
const perSubject: Record<string, number> = {};
for (const d of planDays) for (const b of d.blocks) perSubject[b.subject] = (perSubject[b.subject] ?? 0) + b.minutes;
for (const [k, v] of Object.entries(perSubject).sort((a, b) => b[1] - a[1]))
  console.log(`    ${k.padEnd(30)} ${(v / 60).toFixed(1)}h`);

console.log("\nEXAMS");
for (const e of exams) if (e.subject && !slugs.has(e.subject)) bad(`exam ${e.key} → unknown subject ${e.subject}`);
ok(`${exams.length} exam records`);

console.log(
  problems === 0
    ? "\n\x1b[32mAll checks passed.\x1b[0m\n"
    : `\n\x1b[31m${problems} problem(s).\x1b[0m\n`,
);
process.exit(problems === 0 ? 0 : 1);
