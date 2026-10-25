import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeCode, readState, saveLink, syncClassroom } from "@/lib/classroom";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Google sends the student back here. Who they are comes from the signed
 * state, not a cookie (the app flow has none), so writes go through the
 * service role — scoped to that one user id.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = readState(url.searchParams.get("state"));
  const back = (status: string, app?: boolean) =>
    NextResponse.redirect(app ? `semwise://classroom?status=${status}` : `${url.origin}/settings?classroom=${status}#classroom`);

  if (!state) return back("expired");
  if (url.searchParams.get("error")) return back("cancelled", state.app);
  const code = url.searchParams.get("code");
  if (!code) return back("failed", state.app);

  try {
    const { refreshToken, email } = await exchangeCode(code, `${url.origin}/api/classroom/callback`);
    if (!refreshToken) return back("no-offline", state.app);
    const db = createAdminClient();
    await saveLink(db, state.userId, refreshToken, email);
    try {
      await syncClassroom(db, state.userId);
    } catch {
      // connected anyway; the error is on the row and shows in Settings
    }
    return back("connected", state.app);
  } catch {
    return back("failed", state.app);
  }
}
