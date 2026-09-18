/**
 * Pushes src/data/* into Supabase.
 *
 *   npm run seed
 *
 * Idempotent — re-run it any time you edit the syllabus files (e.g. after the
 * Digital Electronics course plan turns up). It upserts by natural key and
 * never touches your notes, tasks, marks or screenshots.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { ensureProfile, seedUser } from "../src/lib/seed";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;

if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ok = (label: string, n?: number | string) =>
  console.log(`  \x1b[32m✓\x1b[0m ${label}${n !== undefined ? ` \x1b[2m(${n})\x1b[0m` : ""}`);

function die(label: string, error: unknown): never {
  console.error(`\n  \x1b[31m✗\x1b[0m ${label}`);
  console.error(error);
  process.exit(1);
}

async function getOrCreateUser(): Promise<string> {
  const { data: list, error: listErr } = await db.auth.admin.listUsers({ perPage: 200 });
  if (listErr) die("listing users", listErr);
  const existing = list.users.find((u) => u.email?.toLowerCase() === EMAIL!.toLowerCase());
  if (existing) {
    ok(`user ${EMAIL} (existing)`);
    return existing.id;
  }
  if (!PASSWORD) {
    die(
      "creating user",
      `No user with email ${EMAIL} exists and SEED_PASSWORD is not set. Either sign up in the app first, or set SEED_PASSWORD in .env.local.`,
    );
  }
  const { data, error } = await db.auth.admin.createUser({
    email: EMAIL!,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) die("creating user", error);
  ok(`user ${EMAIL} (created)`);
  return data.user!.id;
}

async function main() {
  if (!EMAIL) {
    console.error("Missing SEED_EMAIL in .env.local");
    process.exit(1);
  }
  console.log("\n\x1b[1mSeeding IILM OS\x1b[0m\n");
  const userId = await getOrCreateUser();
  const name = await ensureProfile(db, userId, {
    display_name: process.env.SEED_DISPLAY_NAME?.trim() || EMAIL.split("@")[0],
    lab_group: 2,
  });
  ok(`profile (${name})`);
  await seedUser(db, userId, { plan: true, personal: true }, ok);
  console.log("\n\x1b[1m\x1b[32mDone.\x1b[0m Run `npm run dev` and sign in as " + EMAIL + "\n");
}

main().catch((e) => die("seed", e));
