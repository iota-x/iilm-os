"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function me() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: p } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { db, userId: user.id, admin: Boolean(p?.is_admin), teacher: Boolean(p?.is_faculty) };
}

/* ─── teachers ──────────────────────────────────────────────── */

/** One post, as many classes as the teacher picks. Returns how many it went to. */
export async function teacherPost(input: { title: string; body?: string; kind: string; cohorts: string[]; due_date?: string | null }) {
  const { db, teacher, admin } = await me();
  if (!teacher && !admin) throw new Error("Teacher access hasn't been approved yet.");
  if (!input.cohorts.length) throw new Error("Pick at least one class.");
  const { data, error } = await db.rpc("teacher_post", {
    p_title: input.title,
    p_body: input.body ?? "",
    p_kind: input.kind,
    p_cohorts: input.cohorts,
    // only sent when set, so posting still works before migration 014 adds it
    ...(input.due_date ? { p_due: input.due_date } : {}),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/teacher");
  revalidatePath("/class");
  return data as number;
}

/* ─── admin ─────────────────────────────────────────────────── */

async function asAdmin() {
  const ctx = await me();
  if (!ctx.admin) throw new Error("Admins only.");
  return { ...ctx, service: createAdminClient() };
}

/**
 * Approve or remove a teacher. Goes through the service role: the profile
 * guard (migration 013) won't let anyone, admin included, flip these from
 * the app's own session.
 */
export async function adminSetTeacher(userId: string, on: boolean) {
  const { service } = await asAdmin();
  const { error } = await service
    .from("profiles")
    .update({ is_faculty: on, faculty_status: on ? "approved" : "rejected" })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

/** A pending request turned down: the account stays, with nothing opened up. */
export async function adminRejectTeacher(userId: string) {
  return adminSetTeacher(userId, false);
}

export async function adminSetAdmin(userId: string, on: boolean) {
  const { service, userId: self } = await asAdmin();
  if (userId === self && !on) throw new Error("You can't remove your own admin — ask another admin.");
  const { error } = await service.from("profiles").update({ is_admin: on }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

/** Remove any post on any board (moderation). RLS already lets the admin. */
export async function adminDeletePost(id: string) {
  const { db } = await asAdmin();
  const { data: row } = await db.from("posts").select("image_path").eq("id", id).maybeSingle();
  const { error } = await db.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (row?.image_path) await db.storage.from("board").remove([row.image_path]);
  revalidatePath("/admin");
  revalidatePath("/class");
}
