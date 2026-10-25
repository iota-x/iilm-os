import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decrypt, encrypt } from "@/lib/secret";
import { resolveModel } from "@/lib/ai-model";
import { extractDeadlines } from "@/lib/deadlines";

/**
 * Google Classroom → planner to-dos. Each student connects their own Google
 * account once (OAuth, read-only scopes); their coursework with a due date
 * becomes to-dos on the Planner and Today, ticked off when it's turned in.
 * Announcements are read for deadlines too (many teachers announce rather
 * than set coursework), and posted materials are saved as resources.
 *
 * Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (a Google Cloud OAuth
 * client, type "Web application"). Without them the feature stays hidden.
 */
export const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.announcements.readonly",
  "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
];
const ANNOUNCEMENTS = SCOPES[4];
const MATERIALS = SCOPES[5];

/** Connected before announcements and materials were read: one reconnect adds them. */
export function needsReconnect(granted: string | null | undefined) {
  return granted != null && !(granted.includes(ANNOUNCEMENTS) && granted.includes(MATERIALS));
}

export function classroomConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/* ─── OAuth state: who started it, and where to send them back ─────────
   Signed rather than stored in a cookie, so the flow also works when the
   mobile app opens it in a browser that has no Semwise session. */
function sign(body: string) {
  return createHmac("sha256", `classroom:${process.env.KEY_ENCRYPTION_SECRET}`).update(body).digest("base64url");
}
export function makeState(userId: string, app: boolean) {
  const body = Buffer.from(JSON.stringify({ u: userId, a: app ? 1 : 0, t: Date.now(), n: randomBytes(6).toString("hex") })).toString("base64url");
  return `${body}.${sign(body)}`;
}
export function readState(state: string | null): { userId: string; app: boolean } | null {
  if (!state) return null;
  const [body, mac] = state.split(".");
  if (!body || !mac) return null;
  const want = Buffer.from(sign(body));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  const s = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { u: string; a: number; t: number };
  if (Date.now() - s.t > 15 * 60_000) return null; // fifteen minutes to finish signing in
  return { userId: s.u, app: s.a === 1 };
}

/**
 * `loginHint` is the Semwise account's email: Classroom lives on the college
 * Google account, and without a hint Google silently picks whichever account
 * the browser is signed into first (often a personal Gmail).
 */
export function authUrl(redirectUri: string, state: string, loginHint?: string | null) {
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "select_account consent", // always ask which account; consent so Google sends a refresh token every time
    ...(loginHint ? { login_hint: loginHint } : {}),
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

async function token(params: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      ...params,
    }),
  });
  const data = (await res.json()) as { access_token?: string; refresh_token?: string; id_token?: string; scope?: string; error?: string; error_description?: string };
  if (!res.ok || !data.access_token) throw new Error(data.error_description ?? data.error ?? `Google said ${res.status}`);
  return data;
}

export async function exchangeCode(code: string, redirectUri: string) {
  const t = await token({ code, redirect_uri: redirectUri, grant_type: "authorization_code" });
  let email: string | null = null;
  if (t.id_token) {
    try {
      email = JSON.parse(Buffer.from(t.id_token.split(".")[1], "base64url").toString("utf8")).email ?? null;
    } catch {}
  }
  return { refreshToken: t.refresh_token ?? null, accessToken: t.access_token!, email };
}

async function api<T>(accessToken: string, path: string, params: Record<string, string> = {}): Promise<T> {
  const res = await fetch(`https://classroom.googleapis.com/v1/${path}?${new URLSearchParams(params)}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Classroom said ${res.status}`);
  return data as T;
}

type Course = { id: string; name: string; section?: string };
type Due = { year: number; month: number; day: number };
type Work = { id: string; title: string; alternateLink?: string; dueDate?: Due; dueTime?: { hours?: number; minutes?: number }; state?: string };
type Submission = { courseWorkId: string; state?: string };
type Announcement = { id: string; text?: string; state?: string; creationTime?: string; updateTime?: string };
type Material = {
  driveFile?: { driveFile?: { title?: string; alternateLink?: string } };
  link?: { url?: string; title?: string };
  youtubeVideo?: { title?: string; alternateLink?: string };
  form?: { title?: string; formUrl?: string };
};
type MaterialPost = { id: string; title?: string; state?: string; materials?: Material[] };

/** Classroom's due date is UTC; the planner works in India dates. */
function istDue(d: Due, t?: { hours?: number; minutes?: number }) {
  const utc = Date.UTC(d.year, d.month - 1, d.day, t?.hours ?? 23, t?.minutes ?? 59);
  return new Date(utc + 5.5 * 3600_000).toISOString().slice(0, 10);
}

/** Store a newly connected account. `db` may be the service role (the callback has no session in the app flow). */
export async function saveLink(db: SupabaseClient, userId: string, refreshToken: string, email: string | null) {
  const { error } = await db.from("classroom_links").upsert(
    { user_id: userId, refresh_token: encrypt(refreshToken), google_email: email, connected_at: new Date().toISOString(), last_error: null },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}

/**
 * Pull the student's coursework into their to-dos. Matches on the Classroom
 * id, so re-running updates titles and dates instead of duplicating, and
 * marks a to-do done once it's turned in. Returns what changed.
 */
export async function syncClassroom(db: SupabaseClient, userId: string) {
  const { data: link } = await db.from("classroom_links").select("refresh_token").eq("user_id", userId).maybeSingle();
  if (!link) throw new Error("Classroom isn't connected.");
  try {
    const { access_token, scope } = await token({ refresh_token: decrypt(link.refresh_token)!, grant_type: "refresh_token" });
    const granted = scope ?? "";
    // separate write: before migration 014 the column doesn't exist, and that mustn't fail the sync
    await db.from("classroom_links").update({ granted_scopes: granted }).eq("user_id", userId);
    const { courses = [] } = await api<{ courses?: Course[] }>(access_token!, "courses", { studentId: "me", courseStates: "ACTIVE", pageSize: "50" });

    const { data: subjects } = await db.from("subjects").select("id, slug, name, short_name, code, teacher").eq("user_id", userId);
    const subjectRow = (course: string) => {
      const c = course.toLowerCase();
      return (subjects ?? []).find((s) => c.includes(String(s.short_name).toLowerCase()) || c.includes(String(s.name).toLowerCase())) ?? null;
    };
    const subjectFor = (course: string) => subjectRow(course)?.id ?? null;

    const cutoff = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10); // ignore long-past work
    const wanted: { external_id: string; title: string; detail: string; due_date: string; subject_id: string | null; done: boolean }[] = [];
    for (const course of courses) {
      const [{ courseWork = [] }, { studentSubmissions = [] }] = await Promise.all([
        api<{ courseWork?: Work[] }>(access_token!, `courses/${course.id}/courseWork`, { pageSize: "100", orderBy: "dueDate desc" }),
        api<{ studentSubmissions?: Submission[] }>(access_token!, `courses/${course.id}/courseWork/-/studentSubmissions`, { userId: "me", pageSize: "200" }),
      ]);
      const handedIn = new Set(studentSubmissions.filter((s) => s.state === "TURNED_IN" || s.state === "RETURNED").map((s) => s.courseWorkId));
      for (const w of courseWork) {
        if (!w.dueDate || w.state === "DELETED") continue;
        const due = istDue(w.dueDate, w.dueTime);
        if (due < cutoff) continue;
        wanted.push({
          external_id: `classroom:${w.id}`,
          title: `${w.title} — ${course.name}`.slice(0, 200),
          detail: w.alternateLink ?? "",
          due_date: due,
          subject_id: subjectFor(course.name),
          done: handedIn.has(w.id),
        });
      }
    }

    const { data: have } = await db.from("tasks").select("id, external_id, title, due_date, status").eq("user_id", userId).eq("source", "classroom");
    const byExt = new Map((have ?? []).map((t) => [t.external_id as string, t]));
    let added = 0;
    let updated = 0;
    for (const w of wanted) {
      const cur = byExt.get(w.external_id);
      const status = w.done ? "done" : cur?.status === "done" ? "done" : "todo"; // never un-tick what the student ticked
      if (!cur) {
        const { error } = await db.from("tasks").insert({
          user_id: userId, title: w.title, detail: w.detail, due_date: w.due_date, subject_id: w.subject_id,
          kind: "admin", source: "classroom", external_id: w.external_id, status,
          completed_at: status === "done" ? new Date().toISOString() : null,
        });
        if (error) throw new Error(error.message);
        added++;
      } else if (cur.title !== w.title || cur.due_date !== w.due_date || cur.status !== status) {
        const { error } = await db.from("tasks").update({
          title: w.title, due_date: w.due_date, status,
          ...(status === "done" && cur.status !== "done" ? { completed_at: new Date().toISOString() } : {}),
        }).eq("id", cur.id);
        if (error) throw new Error(error.message);
        updated++;
      }
    }

    // extras: a failure here is logged, never allowed to undo the coursework sync above
    const extra = async (what: string, run: () => Promise<number>) => {
      try {
        return await run();
      } catch (e) {
        console.error(`classroom: ${what} failed for ${userId}`, e);
        return 0;
      }
    };
    const materials = granted.includes(MATERIALS) ? await extra("materials", () => syncMaterials(db, userId, access_token!, courses, subjectFor)) : 0;
    const fromAnnouncements = granted.includes(ANNOUNCEMENTS)
      ? await extra("announcements", () => syncAnnouncements(db, userId, access_token!, courses, subjects ?? [], subjectRow))
      : 0;

    await db.from("classroom_links").update({ last_synced_at: new Date().toISOString(), last_error: null }).eq("user_id", userId);
    return { courses: courses.length, added: added + fromAnnouncements, updated, materials, reconnect: needsReconnect(granted) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await db.from("classroom_links").update({ last_error: msg.slice(0, 300) }).eq("user_id", userId);
    throw e;
  }
}

/** Posted materials (PDFs, links, videos) → resources under the class's subject. Matched on the URL. */
async function syncMaterials(
  db: SupabaseClient,
  userId: string,
  accessToken: string,
  courses: Course[],
  subjectFor: (course: string) => string | null,
) {
  const found: { title: string; url: string; kind: string; why: string; subject_id: string | null }[] = [];
  for (const course of courses) {
    const { courseWorkMaterial = [] } = await api<{ courseWorkMaterial?: MaterialPost[] }>(
      accessToken,
      `courses/${course.id}/courseWorkMaterials`,
      { pageSize: "100" },
    );
    for (const post of courseWorkMaterial) {
      if (post.state && post.state !== "PUBLISHED") continue;
      for (const m of post.materials ?? []) {
        const file = m.driveFile?.driveFile;
        const item = file?.alternateLink
          ? { title: file.title ?? "File", url: file.alternateLink, kind: /\.pdf$/i.test(file.title ?? "") ? "pdf" : "article" }
          : m.youtubeVideo?.alternateLink
            ? { title: m.youtubeVideo.title ?? "Video", url: m.youtubeVideo.alternateLink, kind: "video" }
            : m.link?.url
              ? { title: m.link.title ?? m.link.url, url: m.link.url, kind: "article" }
              : m.form?.formUrl
                ? { title: m.form.title ?? "Form", url: m.form.formUrl, kind: "tool" }
                : null;
        if (item) found.push({ ...item, title: item.title.slice(0, 200), why: `${course.name}${post.title ? ` — ${post.title}` : ""}`.slice(0, 300), subject_id: subjectFor(course.name) });
      }
    }
  }
  if (!found.length) return 0;
  const { data: have } = await db.from("resources").select("url").eq("user_id", userId).in("url", found.map((f) => f.url));
  const known = new Set((have ?? []).map((r) => r.url as string));
  const fresh = found.filter((f, i) => !known.has(f.url) && found.findIndex((g) => g.url === f.url) === i);
  if (!fresh.length) return 0;
  const { error } = await db.from("resources").insert(
    fresh.map((f) => ({ user_id: userId, ...f, source: "Google Classroom", rank: 9, is_curated: false })),
  );
  if (error) throw new Error(error.message);
  return fresh.length;
}

/**
 * Announcements from the last fortnight, read once each for deadlines
 * ("quiz next Tuesday", "file due 4/11"). Needs migration 014's
 * seen_announcements; before it, announcements are skipped rather than
 * read again on every sync.
 */
async function syncAnnouncements(
  db: SupabaseClient,
  userId: string,
  accessToken: string,
  courses: Course[],
  subjects: { id: string; slug: string; name: string; short_name: string | null; code: string | null; teacher: string | null }[],
  subjectRow: (course: string) => { id: string; slug: string } | null,
) {
  const { data: link, error } = await db.from("classroom_links").select("seen_announcements").eq("user_id", userId).maybeSingle();
  if (error || !link) return 0;
  const seen = new Set((link.seen_announcements as string[] | null) ?? []);
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString();

  const fresh: { id: string; course: Course; text: string; at: string }[] = [];
  for (const course of courses) {
    const { announcements = [] } = await api<{ announcements?: Announcement[] }>(accessToken, `courses/${course.id}/announcements`, {
      pageSize: "30",
      orderBy: "updateTime desc",
    });
    for (const a of announcements) {
      const at = a.updateTime ?? a.creationTime ?? "";
      if (a.state && a.state !== "PUBLISHED") continue;
      if (!a.text?.trim() || at < since || seen.has(a.id)) continue;
      fresh.push({ id: a.id, course, text: a.text.trim(), at });
    }
  }
  if (!fresh.length) return 0;

  const { data: prof } = await db.from("profiles").select("gemini_key").eq("id", userId).maybeSingle();
  const resolved = resolveModel(decrypt(prof?.gemini_key ?? null));
  if (!resolved) return 0; // no AI key on this server: leave them unseen for when there is one

  const today = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
  const text = fresh
    .map((a) => {
      const s = subjectRow(a.course.name);
      return `Announcement in "${a.course.name}"${s ? ` (subject ${s.slug})` : ""}, posted ${a.at.slice(0, 10)}:\n${a.text}`;
    })
    .join("\n\n---\n\n");
  const items = await extractDeadlines({ model: resolved.model, today, subjects, text, source: "Google Classroom announcements" });

  const idOf = new Map(subjects.map((s) => [s.slug, s.id]));
  let added = 0;
  for (const it of items) {
    const key = `classroom-ann:${it.due_date}:${it.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
    const { error: insErr } = await db.from("tasks").insert({
      user_id: userId,
      title: it.title,
      detail: it.quote || null,
      due_date: it.due_date,
      subject_id: idOf.get(it.subject) ?? null,
      kind: "admin",
      source: "classroom",
      external_id: key,
      status: "todo",
    });
    if (!insErr) added++;
    else if (insErr.code !== "23505") throw new Error(insErr.message);
  }
  const keep = [...fresh.map((a) => a.id), ...seen].slice(0, 300);
  await db.from("classroom_links").update({ seen_announcements: keep }).eq("user_id", userId);
  return added;
}
