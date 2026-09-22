/**
 * npm run onboard [--dry]
 *
 * Creates an account for every student in scripts/roster.csv and seeds the
 * curriculum into it. Idempotent: existing accounts are left alone except
 * for a curriculum re-seed (which never touches notes, marks or photos).
 *
 * roster.csv columns:  email,name,group
 *   email  — the college address, e.g. priya.sharma.26@gg.iilm.edu
 *   name   — optional; derived from the email when blank ("Priya Sharma")
 *   group  — lab group, 1 or 2
 *
 * New accounts get CLASS_DEFAULT_PASSWORD from .env.local and are flagged
 * must_change_password, so the first thing they see is a screen to set
 * their own. The roster is gitignored — it's sixty people's names.
 */

import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ensureProfile, seedUser } from "../src/lib/seed";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEFAULT_PASSWORD = process.env.CLASS_DEFAULT_PASSWORD;
const SECTION = process.env.CLASS_SECTION ?? "E";
const DOMAIN = "@gg.iilm.edu";
const dry = process.argv.includes("--dry");

const db = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

type Student = { email: string; name: string; group: 1 | 2 };

/** "priya.sharma.26@gg.iilm.edu" → "Priya Sharma" */
function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(".")
    .filter((p) => !/^\d+$/.test(p))
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function readRoster(): Student[] {
  const path = join(process.cwd(), "scripts", "roster.csv");
  if (!existsSync(path)) {
    console.error("No scripts/roster.csv. Copy scripts/roster.example.csv and fill it in.");
    process.exit(1);
  }
  const rows = readFileSync(path, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const out: Student[] = [];
  const seen = new Set<string>();
  for (const [i, line] of rows.entries()) {
    const [emailRaw, nameRaw, groupRaw] = line.split(",").map((c) => c.trim());
    if (i === 0 && emailRaw.toLowerCase() === "email") continue; // header
    const email = emailRaw.toLowerCase();
    if (!email.endsWith(DOMAIN)) {
      console.error(`  line ${i + 1}: ${email} is not a ${DOMAIN} address — skipped`);
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    const group = Number(groupRaw) === 1 ? 1 : 2;
    out.push({ email, name: nameRaw || nameFromEmail(email), group });
  }
  return out;
}

async function main() {
  const roster = readRoster();
  console.log(`\n\x1b[1mOnboarding ${roster.length} students${dry ? " (dry run)" : ""}\x1b[0m\n`);

  const { data: list, error } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const idByEmail = new Map(list.users.map((u) => [u.email?.toLowerCase() ?? "", u.id]));

  let created = 0;
  let seeded = 0;
  for (const s of roster) {
    let id = idByEmail.get(s.email);
    const isNew = !id;

    if (isNew) {
      if (!DEFAULT_PASSWORD) {
        console.error("CLASS_DEFAULT_PASSWORD is not set in .env.local — can't create accounts.");
        process.exit(1);
      }
      if (dry) {
        console.log(`  would create  ${s.email.padEnd(36)} ${s.name} · group ${s.group}`);
        continue;
      }
      const { data, error: cErr } = await db.auth.admin.createUser({
        email: s.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { name: s.name },
      });
      if (cErr) {
        console.error(`  ! ${s.email}: ${cErr.message}`);
        continue;
      }
      id = data.user!.id;
      created++;
    } else if (dry) {
      console.log(`  exists        ${s.email.padEnd(36)} ${s.name} · group ${s.group}`);
      continue;
    }

    await ensureProfile(db, id!, {
      display_name: s.name,
      lab_group: s.group,
      section: SECTION,
      must_change_password: isNew,
    });
    if (isNew) {
      // the trigger made the row before us; the roster's group wins on a new account
      await db.from("profiles").update({ lab_group: s.group, display_name: s.name }).eq("id", id!);
    }

    await seedUser(db, id!, { plan: false, personal: false });
    seeded++;
    console.log(`  ${isNew ? "created" : "updated"}  ${s.email.padEnd(36)} ${s.name} · group ${s.group}`);
  }

  console.log(`\n\x1b[32m✓\x1b[0m ${created} created, ${seeded} seeded.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
