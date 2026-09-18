import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureProfile, seedUser } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // seeding is a few hundred rows

const DOMAIN = "@gg.iilm.edu";
/** first.last.26 — the college's pattern. Digits are the batch year. */
const LOCAL = /^[a-z]+(?:\.[a-z]+)+\.\d{2}$/;

/** "ankit.pandey.26" → "Ankit Pandey" */
function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(".")
    .filter((p) => !/^\d+$/.test(p))
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * Self-service sign-up for the section. Anyone with a college address can
 * make an account; it's created confirmed (no email round-trip — Supabase's
 * default mailer allows a handful an hour, which would block a whole class
 * signing up on one evening) and seeded with the curriculum before the
 * response returns, so the first page they see is complete.
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string; group?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const group = Number(body.group) === 1 ? 1 : 2;

  if (!email.endsWith(DOMAIN) || !LOCAL.test(email.slice(0, -DOMAIN.length))) {
    return NextResponse.json(
      { error: `Use your college address — it looks like first.last.26${DOMAIN}.` },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password needs at least 8 characters." }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: nameFromEmail(email) },
  });
  if (error) {
    const taken = /already|exists|registered/i.test(error.message);
    return NextResponse.json(
      { error: taken ? "That address already has an account — sign in instead." : error.message },
      { status: taken ? 409 : 500 },
    );
  }
  const userId = created.user!.id;

  try {
    // A trigger has already made the profile row (with the name from the
    // metadata above). This is a brand-new account, so the group they just
    // picked is authoritative — set it rather than deferring to the row.
    await ensureProfile(admin, userId, {
      display_name: nameFromEmail(email),
      lab_group: group,
      section: process.env.CLASS_SECTION ?? "E",
      must_change_password: false, // they chose it
    });
    const { error: gErr } = await admin
      .from("profiles")
      .update({ lab_group: group, display_name: nameFromEmail(email) })
      .eq("id", userId);
    if (gErr) throw new Error(gErr.message);
    await seedUser(admin, userId, { plan: false, personal: false });
  } catch (e) {
    // Don't leave a half-made account behind; they can try again.
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Couldn't set the account up. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
