import { NextResponse } from "next/server";
import { requestAuth } from "@/lib/supabase/server";
import { syncClassroom } from "@/lib/classroom";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Sync now — POST with the web cookie or the mobile app's bearer token. */
export async function POST(req: Request) {
  const { db, user } = await requestAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await syncClassroom(db, user.id));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sync failed" }, { status: 502 });
  }
}
