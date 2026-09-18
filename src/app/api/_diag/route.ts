import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Temporary: where the function runs, and what a query costs from there. */
export async function GET() {
  const db = await createClient();

  const t0 = Date.now();
  await db.from("subjects").select("id").limit(1); // warm
  const warmup = Date.now() - t0;

  const t1 = Date.now();
  await Promise.all([
    db.from("subjects").select("id, slug, name, short_name, color, status, has_lab").order("sort_order"),
    db.from("units").select("id, subject_id, number, title, in_midsem").order("number"),
    db.from("topics").select("id, subject_id, unit_id, code, title, status, in_midsem, weight").order("sort_order"),
  ]);
  const navTree = Date.now() - t1;

  const t2 = Date.now();
  await db.from("topics").select("id").limit(1);
  const single = Date.now() - t2;

  return Response.json({
    functionRegion: process.env.VERCEL_REGION ?? "local",
    firstQueryMs: warmup,
    navTreeMs: navTree,
    singleQueryMs: single,
  });
}
