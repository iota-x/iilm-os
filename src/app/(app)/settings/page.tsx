import Link from "next/link";
import { getAttendance, getProfile, getSlots, getSubjects } from "@/lib/queries";
import { tenantOf } from "@/lib/universities";
import { SettingsForm } from "@/components/settings-form";
import { ThemeToggle } from "@/components/theme";
import { GeminiKeyForm } from "@/components/gemini-key-form";
import { decrypt } from "@/lib/secret";
import { Card, CardHead } from "@/components/ui";
import { ClassroomCard } from "@/components/classroom-card";
import { classroomConfigured, needsReconnect } from "@/lib/classroom";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ classroom?: string }> }) {
  const db = await createClient();
  const [profile, subjects, attendance, slots, { classroom: classroomStatus }, { data: classroomLink }] = await Promise.all([
    getProfile(),
    getSubjects(),
    getAttendance(),
    getSlots(),
    searchParams,
    db.from("classroom_links").select("*").maybeSingle(), // * so a missing 014 column doesn't hide the link
  ]);

  if (!profile) return null;
  const tenant = tenantOf(profile);
  // "Mon Linux · Tue Calculus lab" — each group's labs, from the timetable itself
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const shortOf = new Map(subjects.map((s) => [s.id, s.short_name]));
  const labLines = Object.fromEntries(
    tenant.cohort.labGroups.map((g) => [
      g,
      slots
        .filter((sl) => sl.kind === "lab" && sl.lab_group === g)
        .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
        .map((sl) => `${sl.day} ${shortOf.get(sl.subject_id ?? "") ?? "lab"}`)
        .join(" · "),
    ]),
  );

  return (
    <div className="mx-auto max-w-[620px] space-y-5">
      <div>
        <h1 className="text-[length:var(--text-page)]">Settings</h1>
        <p className="mt-1 text-[length:var(--text-small)] text-muted">
          A few things, and then you&rsquo;re done.
        </p>
      </div>

      <Card>
        <CardHead title="Your university" sub="Set when you signed up, from your college email." />
        <div className="space-y-1 p-5 text-[length:var(--text-small)]">
          <p className="font-medium">{tenant.university.name}</p>
          <p className="text-muted">{tenant.label}</p>
        </div>
      </Card>

      <Card>
        <CardHead title="Appearance" />
        <div className="p-5">
          <ThemeToggle full />
        </div>
      </Card>

      <GeminiKeyForm current={decrypt(profile.gemini_key)} />

      <SettingsForm profile={profile} subjects={subjects} attendance={attendance} labGroups={tenant.cohort.labGroups} labLines={labLines} />

      <ClassroomCard
        configured={classroomConfigured()}
        link={classroomLink ? { ...classroomLink, reconnect: needsReconnect(classroomLink.granted_scopes) } : null}
        status={classroomStatus}
      />

      {profile.is_admin ? (
      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-[length:var(--text-small)] font-semibold">Admin</h2>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">Teacher requests, roles, every board and the waitlist.</p>
        </div>
        <Link href="/admin" className="rounded-[var(--radius-control)] border border-line px-3 py-1.5 text-[length:var(--text-small)] font-medium hover:bg-surface-2 focus-ring">
          Open admin
        </Link>
      </Card>
      ) : null}

      {profile.is_admin ? (
      <Card className="p-5">
        <h2 className="text-[length:var(--text-small)] font-semibold">Adding next semester</h2>
        <p className="mt-1.5 text-[length:var(--text-small)] leading-relaxed text-muted">
          The database is built around semesters, not this one semester. When Sem 2 starts, add new
          subject files under <Code>src/data/subjects/</Code>, register the pack in{" "}
          <Code>src/data/catalogs.ts</Code>, point the cohort at it in{" "}
          <Code>src/lib/universities.ts</Code>, and run <Code>npm run seed</Code> again. Your notes,
          marks and screenshots from Sem 1 stay exactly where they are. Then{" "}
          <Code>npm run reseed</Code> to push the new curriculum into every account.
        </p>
      </Card>
      ) : null}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[length:var(--text-micro)] text-fg">
      {children}
    </code>
  );
}
