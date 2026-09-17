import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Streams a file out of the private `vault` bucket for the signed-in user.
 * Images in notes are written as `/api/vault/<user-id>/<file>` so they never
 * depend on an expiring signed URL.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const db = await createClient();

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const key = path.join("/");
  if (path[0] !== user.id) return new NextResponse("Forbidden", { status: 403 });

  const { data, error } = await db.storage.from("vault").download(key);
  if (error || !data) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
