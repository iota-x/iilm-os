import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Turns a one-time token from an email link (magic link, password reset,
 * invite) into a signed-in session, then sends the person on. Standard
 * Supabase SSR pattern; the session lands in cookies like a normal login.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") ?? "/";
  const to = new URL(next.startsWith("/") ? next : "/", req.url);

  if (token_hash && type) {
    const db = await createClient();
    const { error } = await db.auth.verifyOtp({ token_hash, type });
    if (!error) return NextResponse.redirect(to);
  }
  to.pathname = "/login";
  to.search = "";
  return NextResponse.redirect(to);
}
