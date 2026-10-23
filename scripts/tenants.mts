// npm run tenants [-- --sql]
//
// Mirror src/lib/universities.ts into the universities and cohorts tables
// (migration 012), so profiles, the class board and its policies can refer
// to them. Run it after adding a university or a class. --sql prints the same
// rows as SQL instead (that's how the migration's own rows were made).
import { createClient } from "@supabase/supabase-js";
import { UNIVERSITIES } from "../src/lib/universities";

const universities = UNIVERSITIES.map((u) => ({
  id: u.id,
  name: u.name,
  short_name: u.shortName,
  city: u.city,
  email_domains: u.domains,
  active: true,
}));
const cohorts = UNIVERSITIES.flatMap((u) =>
  u.cohorts.map((c) => ({
    id: c.id,
    university_id: u.id,
    programme: c.programme,
    semester: c.semester,
    section: c.section,
    batch: c.batch,
    lab_groups: c.labGroups,
    catalog: c.catalog,
    active: true,
  })),
);

if (process.argv.includes("--sql")) {
  const lit = (v: unknown): string =>
    v === null || v === undefined
      ? "null"
      : Array.isArray(v)
        ? `array[${v.map(lit).join(", ")}]${v.length ? "" : "::text[]"}`
        : typeof v === "number" || typeof v === "boolean"
          ? String(v)
          : `'${String(v).replace(/'/g, "''")}'`;
  const insert = (table: string, rows: Record<string, unknown>[]) => {
    const cols = Object.keys(rows[0]);
    const sets = cols.filter((c) => c !== "id").map((c) => `${c} = excluded.${c}`).join(", ");
    return `insert into ${table} (${cols.join(", ")}) values\n${rows
      .map((r) => `  (${cols.map((c) => lit(r[c])).join(", ")})`)
      .join(",\n")}\non conflict (id) do update set ${sets};`;
  };
  console.log(insert("universities", universities));
  console.log(insert("cohorts", cohorts).replace(/array\[(\d+(?:, \d+)*)\]/g, "array[$1]::smallint[]").replace(/array\[\]::text\[\]/g, "array[]::smallint[]"));
} else {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const u = await db.from("universities").upsert(universities);
  if (u.error) throw new Error(`universities: ${u.error.message} (is migration 012 applied?)`);
  const c = await db.from("cohorts").upsert(cohorts);
  if (c.error) throw new Error(`cohorts: ${c.error.message}`);
  console.log(`${universities.length} universities, ${cohorts.length} cohorts synced`);
}
