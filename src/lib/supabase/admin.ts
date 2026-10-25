import { createClient } from "@supabase/supabase-js";

/**
 * The service-role client: bypasses RLS and the profile guard. Only for
 * server code that has already checked who is asking (the admin page,
 * teacher sign-up) — never hand its results straight to a client.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
