import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";

/**
 * Deadlines out of whatever the class actually uses: a WhatsApp forward, a
 * whole exported group chat, a screenshot of the ERP's assignment page, a
 * Classroom announcement. Most teachers here never touch Classroom, so this
 * is how their dates reach the Planner.
 *
 * Pure apart from the one model call, so the API route, the share target
 * and the Classroom sync all use it the same way.
 */

export const KINDS = ["assignment", "exam", "quiz", "presentation", "lab", "form", "event", "other"] as const;

const Item = z.object({
  title: z.string().describe("Short to-do, verb first: 'Submit DE assignment 2', 'C quiz on pointers'"),
  subject: z.string().describe("A slug from the subject list, or empty when no subject fits"),
  due_date: z.string().describe("YYYY-MM-DD"),
  due_time: z.string().describe("HH:MM in 24h when the message gives a time, else empty"),
  kind: z.enum(KINDS),
  quote: z.string().describe("The words in the message this came from, under 160 characters"),
});
export type Caught = z.infer<typeof Item>;

export interface SubjectHint {
  slug: string;
  name: string;
  short_name?: string | null;
  code?: string | null;
  teacher?: string | null;
}

/** "25/10/26, 9:14 pm - " (Android) or "[25/10/26, 9:14:03 PM] " (iPhone) at the start of a line. */
const WA_LINE = /^\[?(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?m\.?)?\]?\s*(?:-\s*)?/i;

export function isWhatsAppExport(text: string) {
  const lines = text.split("\n").slice(0, 40);
  return lines.filter((l) => WA_LINE.test(l)).length >= 3;
}

/**
 * A semester of group chat is far more than a deadline needs. Keep only
 * messages from the last `days` days (a message's own date, so "submit by
 * Friday" can still be resolved), drop media placeholders and system lines,
 * then keep the newest `maxChars`.
 */
export function trimWhatsApp(text: string, today: string, days = 45, maxChars = 60_000) {
  const from = new Date(Date.parse(today + "T00:00:00Z") - days * 86_400_000).toISOString().slice(0, 10);
  const out: string[] = [];
  let keep = false;
  for (const line of text.replace(/\r/g, "").split("\n")) {
    const m = line.match(WA_LINE);
    if (m) {
      const [, d, mo, y] = m;
      const year = y.length === 2 ? 2000 + Number(y) : Number(y);
      const iso = `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
      keep = iso >= from;
      if (/<Media omitted>|image omitted|document omitted|sticker omitted|Messages and calls are end-to-end|joined using this group|added you|left$/i.test(line)) continue;
    }
    if (keep && line.trim()) out.push(line);
  }
  const joined = out.join("\n");
  return joined.length > maxChars ? joined.slice(joined.length - maxChars) : joined;
}

function prompt(today: string, subjects: SubjectHint[], source: string) {
  const list = subjects
    .map((s) => `- ${s.slug}: ${s.name}${s.short_name ? ` (${s.short_name})` : ""}${s.code ? `, ${s.code}` : ""}${s.teacher ? `, taught by ${s.teacher}` : ""}`)
    .join("\n");
  return `You pull deadlines out of messages an Indian B.Tech student got from ${source}.
Today is ${today} (India). Their subjects:
${list || "- (none listed)"}

Return every thing the student must do or attend by a date: assignments, submissions, lab files, quizzes, tests, presentations, vivas, forms, fee or registration deadlines, events they must attend.
- Dates are day/month (28/10 is 28 October). Resolve "tomorrow", "Friday", "next week" against the date of the message that says it (WhatsApp lines start with their own date), not against today. "Next week" with no day means the Monday of that week.
- Only dates on or after ${today}. Skip anything already past.
- One item per real deadline. If a later message moves a date ("postponed to 3 Nov"), return only the new date. Merge reminders of the same thing.
- subject: the slug whose name, short name, code or teacher the message mentions; empty if none clearly fits. Never guess from the topic alone when two subjects could fit.
- Skip chit-chat, questions without an answer, and dates with no action ("holiday on Monday" is not a deadline).
- Nothing found → an empty list.`;
}

export async function extractDeadlines(opts: {
  model: LanguageModel;
  today: string;
  subjects: SubjectHint[];
  text?: string;
  image?: { data: string; mediaType: string };
  source?: string;
}): Promise<Caught[]> {
  let text = (opts.text ?? "").trim();
  const exported = text && isWhatsAppExport(text);
  if (exported) text = trimWhatsApp(text, opts.today);
  else if (text.length > 60_000) text = text.slice(-60_000);
  if (!text && !opts.image) return [];

  const source = opts.source ?? (exported ? "an exported WhatsApp class group" : "a WhatsApp group, the college ERP or a teacher");
  const { output } = await generateText({
    model: opts.model,
    system: prompt(opts.today, opts.subjects, source),
    output: Output.object({ schema: z.object({ items: z.array(Item) }) }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: text || "Read the deadlines in this screenshot." },
          ...(opts.image ? [{ type: "file" as const, mediaType: opts.image.mediaType, data: opts.image.data }] : []),
        ],
      },
    ],
  });
  const slugs = new Set(opts.subjects.map((s) => s.slug));
  return (output?.items ?? [])
    .filter((i) => /^\d{4}-\d{2}-\d{2}$/.test(i.due_date) && i.due_date >= opts.today && i.title.trim())
    .map((i) => ({
      ...i,
      title: i.title.trim().slice(0, 160),
      subject: slugs.has(i.subject) ? i.subject : "",
      due_time: /^\d{2}:\d{2}$/.test(i.due_time) ? i.due_time : "",
      quote: i.quote.trim().slice(0, 200),
    }))
    .slice(0, 30);
}

/* ─── is it already there? ──────────────────────────────────────── */

const STOP = new Set(["the", "a", "an", "of", "to", "for", "on", "in", "and", "by", "submit", "submission", "complete", "do", "file"]);
function words(s: string) {
  return new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)));
}

/** Same day and most of the words in common: the same deadline, caught twice. */
export function sameDeadline(a: { title: string; due_date: string | null }, b: { title: string; due_date: string | null }) {
  if (!a.due_date || a.due_date !== b.due_date) return false;
  const x = words(a.title);
  const y = words(b.title);
  if (!x.size || !y.size) return false;
  let both = 0;
  for (const w of x) if (y.has(w)) both++;
  return both / Math.min(x.size, y.size) >= 0.5;
}
