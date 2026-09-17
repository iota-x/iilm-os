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
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight">Settings</h1>
        <p className="text-[13px] text-muted mt-0.5">Preferences and attendance tracking.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHead title="Appearance" />
        <div className="p-4">
          <ThemeToggle full />
        </div>
      </Card>

      <SettingsForm profile={profile} subjects={subjects} attendance={attendance} />

      <Card className="max-w-2xl p-4">
        <h2 className="text-[13px] font-semibold">Adding next semester</h2>
        <p className="text-[12.5px] text-muted mt-1.5 leading-relaxed">
          The database is built around semesters, not this one semester. When Sem 2 starts, add
          new subject files under <code className="font-mono text-[12px]">src/data/subjects/</code>,
          bump the semester number in{" "}
          <code className="font-mono text-[12px]">src/data/index.ts</code>, and run{" "}
          <code className="font-mono text-[12px]">npm run seed</code> again. Your notes, marks and
          screenshots from Sem 1 stay exactly where they are.
        </p>
      </Card>
    </div>
  );
}
