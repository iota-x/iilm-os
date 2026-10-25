import { NextResponse } from "next/server";
import { requestAuth } from "@/lib/supabase/server";
import { authUrl, classroomConfigured, makeState } from "@/lib/classroom";

export const dynamic = "force-dynamic";

/**
 * Start connecting Google Classroom. The web app links here and gets
 * redirected to Google. The mobile app calls it with its bearer token and
 * `?app=1&json=1`, gets `{ url }` back, opens that in a browser, and is sent
 * back to semwise://classroom when it's done.
 */
export async function GET(req: Request) {
  if (!classroomConfigured()) return NextResponse.json({ error: "Classroom isn't set up on this server yet." }, { status: 503 });
  const { user } = await requestAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const app = url.searchParams.get("app") === "1";
  const google = authUrl(`${url.origin}/api/classroom/callback`, makeState(user.id, app));
  return url.searchParams.get("json") === "1" ? NextResponse.json({ url: google }) : NextResponse.redirect(google);
}
