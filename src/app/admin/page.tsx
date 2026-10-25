import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminDeletePost, adminRejectTeacher, adminSetAdmin, adminSetTeacher } from "@/lib/staff-actions";
import { cohortById, cohortLabel } from "@/lib/universities";
import { StaffHeader } from "@/components/staff/staff-header";
import { ActionButton } from "@/components/staff/action-button";
import { Badge, Card, CardHead, inputCls } from "@/components/ui";
import { relativeDay } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  display_name: string | null;
  cohort_id: string | null;
  is_admin: boolean;
  is_faculty: boolean;
  faculty_status: string | null;
  department: string | null;
};

/**
 * The admin's desk: teacher requests, who holds which role, every board's
 * latest posts, and the colleges asking to be next. Reads go through the
 * service role, so the admin check below is the only gate — keep it first.
 */
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/admin");
  if (!profile.is_admin) notFound();
  const { q = "" } = await searchParams;

  const svc = createAdminClient();
  const since = daysAgo(7);
  const [{ data: people }, users, { data: posts }, { data: waitlist }, counts] = await Promise.all([
    svc.from("profiles").select("id, display_name, cohort_id, is_admin, is_faculty, faculty_status, department"),
    svc.auth.admin.listUsers({ perPage: 1000 }),
    svc.from("posts").select("id, title, kind, cohort_id, created_at, anonymous").order("created_at", { ascending: false }).limit(25),
    svc.from("waitlist").select("email, domain, college, created_at").order("created_at", { ascending: false }).limit(200),
    Promise.all(
      [
        svc.from("posts").select("id", { count: "exact", head: true }).gte("created_at", since),
        svc.from("papers").select("id", { count: "exact", head: true }),
        svc.from("events").select("id", { count: "exact", head: true }).gte("starts_at", daysAgo(0)),
      ].map(async (p) => (await p).count ?? 0),
    ),
  ]);
  const email = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const rows = ((people ?? []) as ProfileRow[]).map((p) => ({ ...p, email: email.get(p.id) ?? "" }));
  const pending = rows.filter((p) => p.faculty_status === "pending" && !p.is_faculty);
  const teachers = rows.filter((p) => p.is_faculty);
  const students = rows.filter((p) => p.cohort_id);
  const needle = q.trim().toLowerCase();
  const found = needle
    ? rows.filter((p) => `${p.display_name ?? ""} ${p.email}`.toLowerCase().includes(needle)).slice(0, 30)
    : [];
  const domains = new Map<string, number>();
  for (const w of waitlist ?? []) domains.set(w.domain, (domains.get(w.domain) ?? 0) + 1);
  const classOf = (id: string | null) => {
    const c = cohortById(id);
    return c ? cohortLabel(c) : id ? id : "—";
  };
  const [postsWeek, paperCount, upcoming] = counts;

  return (
    <div className="min-h-dvh">
      <StaffHeader title="Admin" links={[{ href: "/teacher", label: "Teacher view" }, { href: "/", label: "App" }]} />
      <main className="mx-auto max-w-[980px] space-y-6 px-4 py-6">
        <h1 className="text-[length:var(--text-page)]">Admin</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Students", students.length],
            ["Teachers", teachers.length],
            ["Posts this week", postsWeek],
            ["Past papers", paperCount],
            ["Upcoming events", upcoming],
          ].map(([label, n]) => (
            <Card key={label} className="px-4 py-3">
              <p className="text-[length:var(--text-title)] font-semibold tabular-nums">{n}</p>
              <p className="text-[length:var(--text-micro)] text-subtle">{label}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardHead title={`Teacher requests${pending.length ? ` (${pending.length})` : ""}`} sub="Check the name and email are a real teacher's before approving — approval lets them read every class's board." />
          {pending.length ? (
            <ul className="divide-y divide-[var(--border)]">
              {pending.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="font-medium">{p.display_name}</p>
                    <p className="text-[length:var(--text-micro)] text-subtle">{p.email}{p.department ? ` · ${p.department}` : ""}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <ActionButton action={adminSetTeacher.bind(null, p.id, true)} variant="primary" done="Approved">Approve</ActionButton>
                    <ActionButton action={adminRejectTeacher.bind(null, p.id)} confirm="Sure? Reject" done="Rejected">Reject</ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-[length:var(--text-small)] text-muted">
              None waiting. Teachers ask at <Link href="/teacher/signin" className="text-[var(--accent)] hover:underline">/teacher/signin</Link>.
            </p>
          )}
        </Card>

        <Card>
          <CardHead title="Teachers" />
          {teachers.length ? (
            <ul className="divide-y divide-[var(--border)]">
              {teachers.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="font-medium">{p.display_name}</p>
                    <p className="text-[length:var(--text-micro)] text-subtle">{p.email}{p.department ? ` · ${p.department}` : ""}</p>
                  </div>
                  <ActionButton action={adminSetTeacher.bind(null, p.id, false)} confirm="Sure? Remove" done="Teacher access removed">Remove access</ActionButton>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-[length:var(--text-small)] text-muted">No teachers yet.</p>
          )}
        </Card>

        <Card>
          <CardHead title="People" sub="Find anyone by name or email to change their role." />
          <form className="px-5 pt-4">
            <input name="q" defaultValue={q} placeholder="Name or email" className={inputCls} />
          </form>
          {found.length ? (
            <ul className="mt-2 divide-y divide-[var(--border)]">
              {found.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      {p.display_name}
                      {p.is_admin ? <Badge tone="accent">admin</Badge> : null}
                      {p.is_faculty ? <Badge tone="good">teacher</Badge> : null}
                    </p>
                    <p className="text-[length:var(--text-micro)] text-subtle">{p.email} · {classOf(p.cohort_id)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <ActionButton action={adminSetTeacher.bind(null, p.id, !p.is_faculty)} confirm="Sure?" done="Saved">
                      {p.is_faculty ? "Remove teacher" : "Make teacher"}
                    </ActionButton>
                    {p.id !== profile.id ? (
                      <ActionButton action={adminSetAdmin.bind(null, p.id, !p.is_admin)} confirm="Sure?" done="Saved">
                        {p.is_admin ? "Remove admin" : "Make admin"}
                      </ActionButton>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-[length:var(--text-small)] text-muted">{needle ? "Nobody matches." : `${rows.length} accounts in all.`}</p>
          )}
        </Card>

        <Card>
          <CardHead title="Latest on every board" sub="Anonymous posts show as anonymous here too; who wrote one is in post_owners if it ever needs acting on." />
          <ul className="divide-y divide-[var(--border)]">
            {(posts ?? []).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5">
                <div className="min-w-0">
                  <Link href={`/class/${p.id}`} className="font-medium hover:underline focus-ring rounded">{p.title}</Link>
                  <p className="text-[length:var(--text-micro)] text-subtle">
                    {p.kind}{p.anonymous ? " · anonymous" : ""} · {classOf(p.cohort_id)} · {relativeDay(p.created_at.slice(0, 10))}
                  </p>
                </div>
                <ActionButton action={adminDeletePost.bind(null, p.id)} confirm="Delete?" done="Deleted" variant="ghost">Delete</ActionButton>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHead title="Colleges asking for Semwise" sub="Sign-ups from addresses we don't support yet." />
          {domains.size ? (
            <ul className="divide-y divide-[var(--border)]">
              {[...domains.entries()].sort((a, b) => b[1] - a[1]).map(([d, n]) => (
                <li key={d} className="flex items-center justify-between px-5 py-2.5 text-[length:var(--text-small)]">
                  <span>{d} <span className="text-subtle">{(waitlist ?? []).find((w) => w.domain === d && w.college)?.college ?? ""}</span></span>
                  <span className="tabular-nums text-muted">{n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-[length:var(--text-small)] text-muted">Nobody on the waitlist yet.</p>
          )}
        </Card>
      </main>
    </div>
  );
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400_000).toISOString();
}
