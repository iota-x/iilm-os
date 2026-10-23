import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ensureProfile, seedUser } from "@/lib/seed";
import { cohortById, emailDomain, emailProblem, nameFromEmail, universityForEmail } from "@/lib/universities";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // seeding is a few hundred rows

/**
 * Self-service sign-up. Anyone with an address at a university Semwise runs
 * at (lib/universities) can make an account in one of its classes; it's
 * created confirmed (no email round-trip — Supabase's default mailer allows
 * a handful an hour, which would block a whole class signing up on one
 * evening) and seeded with that class's curriculum before the response
 * returns, so the first page they see is complete.
 *
 * An address from anywhere else goes on the waitlist instead, with the
 * college name they typed, so we know where to go next.
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string; cohort?: string; group?: number; college?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "That doesn't look like an email address." }, { status: 400 });
  }

  const university = universityForEmail(email);
  if (!university) {
    await joinWaitlist(admin, email, String(body.college ?? "").trim().slice(0, 120));
    return NextResponse.json(
      {
        waitlisted: true,
        error: `Semwise isn't at ${emailDomain(email)} yet. You're on the list — we'll email you when your college is in.`,
      },
      { status: 404 },
    );
  }
  const problem = emailProblem(email, university);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "Password needs at least 8 characters." }, { status: 400 });
  }

  const cohort = cohortById(body.cohort) ?? university.cohorts[0];
  if (cohort.universityId !== university.id) {
    return NextResponse.json({ error: `Pick your class at ${university.shortName}.` }, { status: 400 });
  }
  const group = cohort.labGroups.includes(Number(body.group)) ? Number(body.group) : (cohort.labGroups[0] ?? 1);

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
    // metadata above). This is a brand-new account, so the class and group
    // they just picked are authoritative — set them rather than deferring.
    await ensureProfile(admin, userId, {
      display_name: nameFromEmail(email),
      lab_group: group,
      section: cohort.section ?? undefined,
      must_change_password: false, // they chose it
      university_id: university.id,
      cohort_id: cohort.id,
    });
    const { error: gErr } = await admin
      .from("profiles")
      .update({ lab_group: group, display_name: nameFromEmail(email) })
      .eq("id", userId);
    if (gErr) throw new Error(gErr.message);
    await seedUser(admin, userId, { plan: false, personal: false, cohort });
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

/**
 * Remember someone whose college isn't in yet. The waitlist table comes with
 * migration 012; before that, a file in the private vault does the job.
 */
async function joinWaitlist(admin: SupabaseClient, email: string, college: string) {
  const row = { email, domain: emailDomain(email), college: college || null };
  const { error } = await admin.from("waitlist").upsert(row, { onConflict: "email" });
  if (!error) return;
  await admin.storage
    .from("vault")
    .upload(`_waitlist/${row.domain}/${encodeURIComponent(email)}.json`, JSON.stringify({ ...row, at: new Date().toISOString() }), {
      upsert: true,
      contentType: "application/json",
    });
}
