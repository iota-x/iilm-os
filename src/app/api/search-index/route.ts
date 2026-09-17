import { getSearchIndex } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * The ⌘K index, fetched the first time the palette opens rather than on every
 * page render. It was costing ~0.5s of database work on every navigation and
 * every mutation, for something most page views never use.
 */
export async function GET() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  return Response.json(await getSearchIndex());
}
