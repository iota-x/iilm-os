/**
 * npm run reseed
 *
 * Push the current curriculum into every account. Run it after editing
 * anything under src/data/ — a course plan arriving, a corrected scope —
 * so the whole section sees it, not just the account `npm run seed` uses.
 *
 * Never touches notes, marks, photos, attendance, goals or the class board:
 * the seed only upserts curriculum rows by their natural keys. The personal
 * 18-day plan and the strategies written to one student go only to the
 * SEED_EMAIL account, as before.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { seedUser, SeedError } from "../src/lib/seed";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const OWNER = (process.env.SEED_EMAIL ?? "").toLowerCase();

async function main() {
  const { data, error } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const users = data.users.filter((u) => u.email);
  console.log(`\n\x1b[1mReseeding ${users.length} account${users.length === 1 ? "" : "s"}\x1b[0m\n`);

  let ok = 0;
  const failed: string[] = [];
  for (const u of users) {
    const mine = u.email!.toLowerCase() === OWNER;
    const t0 = Date.now();
    try {
      await seedUser(db, u.id, { plan: mine, personal: mine });
      ok++;
      console.log(`  ✓ ${u.email!.padEnd(38)} ${((Date.now() - t0) / 1000).toFixed(1)}s${mine ? "  (owner: plan + personal)" : ""}`);
    } catch (e) {
      failed.push(u.email!);
      console.log(`  ✗ ${u.email!.padEnd(38)} ${e instanceof SeedError ? e.step + ": " : ""}${(e as Error).message}`);
    }
  }
  console.log(`\n${ok} done${failed.length ? `, ${failed.length} failed: ${failed.join(", ")}` : ""}.\n`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
