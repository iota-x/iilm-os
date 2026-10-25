import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncClassroom } from "@/lib/classroom";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Every connected student, once a day (vercel.json crons). Vercel sends
 * `Authorization: Bearer $CRON_SECRET`; anything else is turned away.
 */
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = createAdminClient();
  const { data: links } = await db.from("classroom_links").select("user_id");
  let ok = 0;
  let failed = 0;
  for (const l of links ?? []) {
    try {
      await syncClassroom(db, l.user_id as string);
      ok++;
    } catch {
      failed++;
    }
  }
  return NextResponse.json({ ok, failed });
}
