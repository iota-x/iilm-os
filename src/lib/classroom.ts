import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decrypt, encrypt } from "@/lib/secret";

/**
 * Google Classroom → planner to-dos. Each student connects their own Google
 * account once (OAuth, read-only scopes); their coursework with a due date
 * becomes to-dos on the Planner and Today, ticked off when it's turned in.
 *
 * Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (a Google Cloud OAuth
 * client, type "Web application"). Without them the feature stays hidden.
 */
export const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
];

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
  const data = (await res.json()) as { access_token?: string; refresh_token?: string; id_token?: string; error?: string; error_description?: string };
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
    const { access_token } = await token({ refresh_token: decrypt(link.refresh_token)!, grant_type: "refresh_token" });
    const { courses = [] } = await api<{ courses?: Course[] }>(access_token!, "courses", { studentId: "me", courseStates: "ACTIVE", pageSize: "50" });

    const { data: subjects } = await db.from("subjects").select("id, name, short_name").eq("user_id", userId);
    const subjectFor = (course: string) => {
      const c = course.toLowerCase();
      return (subjects ?? []).find((s) => c.includes(String(s.short_name).toLowerCase()) || c.includes(String(s.name).toLowerCase()))?.id ?? null;
    };

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
    await db.from("classroom_links").update({ last_synced_at: new Date().toISOString(), last_error: null }).eq("user_id", userId);
    return { courses: courses.length, added, updated };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await db.from("classroom_links").update({ last_error: msg.slice(0, 300) }).eq("user_id", userId);
    throw e;
  }
}
