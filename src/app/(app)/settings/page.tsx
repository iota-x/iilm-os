import { getAttendance, getProfile, getSubjects } from "@/lib/queries";
import { SettingsForm } from "@/components/settings-form";
import { ThemeToggle } from "@/components/theme";
import { Card, CardHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [profile, subjects, attendance] = await Promise.all([
    getProfile(),
    getSubjects(),
    getAttendance(),
  ]);

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-[620px] space-y-5">
      <div>
        <h1 className="text-[length:var(--text-page)]">Settings</h1>
        <p className="mt-1 text-[length:var(--text-small)] text-muted">
          Four things, and then you&rsquo;re done.
        </p>
      </div>

      <Card>
        <CardHead title="Appearance" />
        <div className="p-5">
          <ThemeToggle full />
        </div>
      </Card>

      <SettingsForm profile={profile} subjects={subjects} attendance={attendance} />

      <Card className="p-5">
        <h2 className="text-[length:var(--text-small)] font-semibold">Adding next semester</h2>
        <p className="mt-1.5 text-[length:var(--text-small)] leading-relaxed text-muted">
          The database is built around semesters, not this one semester. When Sem 2 starts, add new
          subject files under <Code>src/data/subjects/</Code>, bump the semester number in{" "}
          <Code>src/data/index.ts</Code>, and run <Code>npm run seed</Code> again. Your notes,
          marks and screenshots from Sem 1 stay exactly where they are.
        </p>
      </Card>
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
