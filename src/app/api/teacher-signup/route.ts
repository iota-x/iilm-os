import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailDomain, universityForStaffEmail } from "@/lib/universities";

export const dynamic = "force-dynamic";

/**
 * A teacher asks for access. The account is made now (so they can sign in
 * and see where their request stands) with no class and no curriculum, and
 * marked pending. Nothing a teacher can do opens up until the admin approves
 * it at /admin — the email domain alone proves nothing about who's a teacher.
 */
export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string; department?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const department = String(body.department ?? "").trim().slice(0, 120);

  if (!name) return NextResponse.json({ error: "Your name, as students know you." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "That doesn't look like an email address." }, { status: 400 });
  }
  const university = universityForStaffEmail(email);
  if (!university) {
    return NextResponse.json(
      { error: `Semwise isn't at ${emailDomain(email)} yet. Use your university address.` },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password needs at least 8 characters." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "teacher" },
  });
  if (error || !created.user) {
    const taken = /already|registered|exists/i.test(error?.message ?? "");
    return NextResponse.json(
      { error: taken ? "There's already an account with that email — sign in instead." : (error?.message ?? "Couldn't create the account.") },
      { status: taken ? 409 : 500 },
    );
  }
  const { error: pErr } = await admin.from("profiles").upsert(
    {
      id: created.user.id,
      display_name: name,
      university_id: university.id,
      cohort_id: null,
      faculty_status: "pending",
      department: department || null,
      must_change_password: false,
    },
    { onConflict: "id" },
  );
  if (pErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, university: university.shortName });
}
