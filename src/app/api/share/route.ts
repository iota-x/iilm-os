import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exifDate, filenameDate, matchSession } from "@/lib/capture";
import { shrinkOnServer } from "@/lib/shrink-server";

export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Android share target. The gallery POSTs the selected photos here as a
 * multipart form; each is filed by its capture time against the timetable
 * exactly as the inbox upload does, then the browser is sent to /inbox.
 *
 * Text with no photos — a WhatsApp message, or an exported group chat
 * (.txt) — is a deadline to catch instead: it's parked in the student's own
 * vault folder and the Planner's catch panel reads the dates out of it.
 *
 * The installed app shares Chrome's cookies, so the normal session applies.
 */
export async function POST(req: Request) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/inbox", req.url), 303);
  }

  const form = await req.formData();
  const all = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const isText = (f: File) => f.type.startsWith("text/") || /\.txt$/i.test(f.name);
  const files = all.filter((f) => !isText(f));
  const text = String(form.get("text") ?? form.get("title") ?? "").trim();

  if (!files.length) {
    const chats = await Promise.all(all.filter(isText).map((f) => f.text()));
    const body = [text, ...chats].filter(Boolean).join("\n\n").slice(0, 2_000_000);
    if (!body) return NextResponse.redirect(new URL("/planner?catch=new", req.url), 303);
    const id = randomBytes(9).toString("hex");
    const { error } = await db.storage
      .from("vault")
      .upload(`${user.id}/_catch/${id}.txt`, new TextEncoder().encode(body), { contentType: "text/plain", upsert: false });
    const to = new URL("/planner", req.url);
    to.searchParams.set("catch", error ? "new" : id);
    return NextResponse.redirect(to, 303);
  }

  const [{ data: profile }, { data: slots }] = await Promise.all([
    db.from("profiles").select("lab_group").eq("id", user.id).single(),
    db.from("timetable_slots").select("id, day, start_time, end_time, subject_id, kind, lab_group"),
  ]);
  const labGroup = profile?.lab_group ?? 2;

  let done = 0;
  let filed = 0;
  for (const file of files) {
    if (file.size > MAX_BYTES || !file.size) continue;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const at =
      (/^image\/jpe?g$/.test(file.type) ? exifDate(bytes) : null) ??
      filenameDate(file.name) ??
      new Date(file.lastModified || Date.now());
    const match = matchSession(at, slots ?? [], labGroup);

    const small = await shrinkOnServer(bytes, file.type);
    const ext = small.mime === "image/jpeg" ? "jpg" : file.name.split(".").pop() || "bin";
    const key = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await db.storage
      .from("vault")
      .upload(key, small.bytes, { contentType: small.mime, upsert: false });
    if (upErr) continue;

    const { error } = await db.from("attachments").insert({
      user_id: user.id,
      storage_path: key,
      filename: file.name,
      mime: small.mime,
      size_bytes: small.bytes.length,
      note_id: null,
      subject_id: match.slot?.subject_id ?? null,
      slot_id: match.slot?.id ?? null,
      taken_at: at.toISOString(),
      caption: text || null,
    });
    if (error) continue;
    done++;
    if (match.slot) filed++;
  }

  const url = new URL("/inbox", req.url);
  url.searchParams.set("shared", String(done));
  url.searchParams.set("filed", String(filed));
  return NextResponse.redirect(url, 303);
}
