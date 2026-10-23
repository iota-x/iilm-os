import { createClient } from "@supabase/supabase-js";

// Ask works on the server's shared Gemini key until a student adds their own.
// Each student gets this many shared-key questions per IST day, so one person
// can't spend the free tier for the whole class.
export const SHARED_ASK_DAILY = Number(process.env.SHARED_ASK_DAILY) || 20;

// Counts live in the vault under `_usage/`, which no student can write to (the
// bucket's policies only open each student's own `<uid>/` folder), so this
// needs the service role and no migration.
function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export function istDay(now = new Date()): string {
  return new Date(now.getTime() + 330 * 60_000).toISOString().slice(0, 10);
}

/** Use one shared-key question. Returns how many are left today, or -1 when none were. */
export async function takeSharedAsk(userId: string): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return SHARED_ASK_DAILY; // local dev without it: no cap
  const db = admin();
  const path = `_usage/${istDay()}/${userId}.json`;
  const { data } = await db.storage.from("vault").download(path);
  const used = data ? Number((JSON.parse(await data.text()) as { used?: number }).used) || 0 : 0;
  if (used >= SHARED_ASK_DAILY) return -1;
  await db.storage
    .from("vault")
    .upload(path, JSON.stringify({ used: used + 1 }), { upsert: true, contentType: "application/json" });
  return SHARED_ASK_DAILY - used - 1;
}
