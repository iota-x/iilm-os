import { requestAuth } from "@/lib/supabase/server";
import { tenantOf } from "@/lib/universities";

export const dynamic = "force-dynamic";

type Page = { k: string; label: string; subject: string; topics: string[]; t: string };

// one index per syllabus pack (scripts/build-page-index.mts); bundled with the route
const INDEXES: Record<string, () => Promise<Page[]>> = {
  "iilm-btech-cse-s1": async () => (await import("../../../../content/page-index/iilm-btech-cse-s1.json")).default as Page[],
};

/**
 * Search inside the class notes: the words on every page of the decks and
 * handwritten notes, read once by OCR. Answers with the page, a snippet
 * around the match, and the topic page it belongs to (every account has
 * those, unlike the page images themselves).
 *
 * GET /api/search-pages?q=karnaugh  →  { hits: [{ label, snippet, href, subject }] }
 * Works with the web session cookie or a mobile app's bearer token.
 */
export async function GET(req: Request) {
  const { db, user } = await requestAuth(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const q = (new URL(req.url).searchParams.get("q") ?? "").toLowerCase().trim();
  const words = q.split(/\s+/).filter((w) => w.length >= 2).slice(0, 6);
  if (!words.length || q.length < 3) return Response.json({ hits: [] });

  const { data: profile } = await db.from("profiles").select("university_id, cohort_id").eq("id", user.id).maybeSingle();
  const load = INDEXES[tenantOf(profile).cohort.catalog ?? ""];
  if (!load) return Response.json({ hits: [] });
  const pages = await load();

  const scored: { p: Page; s: number; at: number }[] = [];
  for (const p of pages) {
    const t = p.t.toLowerCase();
    let s = 0;
    let at = -1;
    for (const w of words) {
      const i = t.indexOf(w);
      if (i < 0) {
        s = 0;
        break;
      }
      if (at < 0) at = i;
      s += t.split(w).length - 1;
    }
    if (s > 0) scored.push({ p, s: s + (p.label.toLowerCase().includes(words[0]) ? 5 : 0), at });
  }
  scored.sort((a, b) => b.s - a.s);
  const top = scored.slice(0, 8);
  if (!top.length) return Response.json({ hits: [] });

  // topic code → its page in this account
  const [{ data: subjects }, { data: units }, { data: topics }] = await Promise.all([
    db.from("subjects").select("id, slug"),
    db.from("units").select("id, number"),
    db.from("topics").select("code, subject_id, unit_id").in("code", [...new Set(top.flatMap((x) => x.p.topics))]),
  ]);
  const slug = new Map((subjects ?? []).map((s) => [s.id as string, s.slug as string]));
  const unitNo = new Map((units ?? []).map((u) => [u.id as string, u.number as number]));
  const hrefOf = new Map(
    (topics ?? []).map((t) => {
      const s = slug.get(t.subject_id as string);
      const n = t.unit_id ? unitNo.get(t.unit_id as string) : undefined;
      return [t.code as string, s ? (n ? `/subjects/${s}/unit-${n}/${t.code}` : `/subjects/${s}#topic-${t.code}`) : null];
    }),
  );

  const hits = top.map(({ p, at }) => {
    const from = Math.max(0, at - 50);
    const snippet = `${from > 0 ? "…" : ""}${p.t.slice(from, at + 90)}${at + 90 < p.t.length ? "…" : ""}`;
    const href = p.topics.map((c) => hrefOf.get(c)).find(Boolean) ?? (p.subject ? `/subjects/${p.subject}` : "/subjects");
    return { key: p.k, label: p.label, subject: p.subject, snippet, href };
  });
  return Response.json({ hits });
}
