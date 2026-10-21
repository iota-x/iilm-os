import type { Note, Resource, Subject, Task, Topic, Unit } from "@/lib/db-types";

export interface TaskLink {
  label: string;
  href: string;
  kind: "topic" | "video" | "notes" | "external";
  /** a search rather than a hand-picked resource */
  search?: boolean;
}

/** Channels that worked for this subject at mid-sems, folded into the search. */
const CHANNEL: Record<string, string> = {
  "applied-calculus": "GP sir",
  "digital-electronics": "Neso Academy",
  "programming-in-c": "in C programming",
  "foundation-of-ai": "artificial intelligence",
};
const GSOC_PLAN = "https://claude.ai/artifact/RDoykphchTDkBN65jmJqpx";
const REPOS: Record<string, string> = {
  embeddedchat: "RocketChat/EmbeddedChat",
  fuselage: "RocketChat/fuselage",
  "rocket.chat": "RocketChat/Rocket.Chat",
  care_fe: "ohcnetwork/care_fe",
};

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

/**
 * Where to go from a plan block: its topic page (slides, notes, questions),
 * a video, and the study note. A video hand-picked for the topic wins;
 * otherwise a YouTube search for exactly that block (a unit-level course
 * link is too broad to count as "the video for this").
 */
export function taskLinks(
  tasks: Task[],
  ctx: { subjects: Subject[]; units: Unit[]; topics: Topic[]; resources: Resource[]; notes: Note[] },
): Record<string, TaskLink[]> {
  const subject = new Map(ctx.subjects.map((s) => [s.id, s]));
  const unit = new Map(ctx.units.map((u) => [u.id, u]));
  const topic = new Map(ctx.topics.map((t) => [t.code, t]));
  const videos = ctx.resources
    .filter((r) => r.kind === "video" || r.kind === "playlist")
    .sort((a, b) => (a.rank ?? 5) - (b.rank ?? 5));
  const out: Record<string, TaskLink[]> = {};

  for (const t of tasks) {
    const links: TaskLink[] = [];
    const codes = t.topic_codes ?? [];

    if (codes.includes("track:dsa")) {
      links.push({ label: "Open Planly", href: "https://takeuforward.org/", kind: "external" });
    } else if (codes.includes("track:gsoc")) {
      const m = t.title.match(/(EmbeddedChat|Fuselage|Rocket\.Chat|care_fe)\s*#(\d+)/i);
      if (m) {
        const repo = REPOS[m[1].toLowerCase()];
        links.push({ label: `${m[1]} #${m[2]}`, href: `https://github.com/${repo}/issues/${m[2]}`, kind: "external" });
      }
      links.push({ label: "GSoC plan", href: GSOC_PLAN, kind: "external" });
    } else {
      const tp = codes.map((c) => topic.get(c)).find(Boolean);
      const sub = (tp ? subject.get(tp.subject_id) : null) ?? (t.subject_id ? subject.get(t.subject_id) : null);
      const u = tp ? unit.get(tp.unit_id) : null;
      if (tp && sub && u) {
        links.push({ label: "Topic", href: `/subjects/${sub.slug}/unit-${u.number}/${tp.code}`, kind: "topic" });
      }
      const picked = (tp && videos.find((r) => r.topic_id === tp.id)) || null;
      if (picked) {
        links.push({ label: "Video", href: picked.url, kind: "video" });
      } else if (sub && t.kind !== "mock" && t.kind !== "admin") {
        // "Basics 3 — trigonometry you need" → "trigonometry you need"; "U1 — Rolle + LMVT problems" → "Rolle + LMVT"
        const what = t.title.replace(/^[^—]*—\s*/, "").replace(/\b(problems|drill|you need)\b/gi, "").trim() || tp?.title || t.title;
        const hint = CHANNEL[sub.slug] ?? sub.name;
        links.push({ label: "Find a video", href: yt(`${what} ${hint}`), kind: "video", search: true });
      }
      const note =
        tp &&
        (ctx.notes.find((n) => n.topic_id === tp.id && n.tags?.includes("study-notes")) ??
          ctx.notes.find((n) => n.topic_id === tp.id));
      if (note) links.push({ label: "Notes", href: `/notes?open=${note.id}`, kind: "notes" });
    }
    if (links.length) out[t.id] = links;
  }
  return out;
}
