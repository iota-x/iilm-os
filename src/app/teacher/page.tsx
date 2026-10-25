import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Clock, Eye, HelpCircle, Megaphone, ThumbsUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPapers, getProfile } from "@/lib/queries";
import { classesOf, subjectNamesOf } from "@/lib/staff";
import { StaffHeader } from "@/components/staff/staff-header";
import { TeacherPostForm } from "@/components/staff/teacher-post-form";
import { VerifyPost } from "@/components/class/verify-post";
import { VerifyPaper } from "@/components/papers/verify-paper";
import { Badge, Card, CardHead, Empty } from "@/components/ui";
import { relativeDay } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  user_id: string | null;
  cohort_id: string;
  subject_slug: string | null;
  kind: string;
  title: string;
  created_at: string;
  verified_by: string | null;
  answer_reply_id: string | null;
  post_votes?: { count: number }[];
  replies?: { count: number }[];
};

/**
 * A teacher's home. Post once to any of their classes, see who has read the
 * notices, put a tick on what the class rates highest, and see the
 * questions nobody has answered yet — which is where a class is stuck.
 */
export default async function TeacherPage() {
  const profile = await getProfile();
  if (!profile) redirect("/teacher/signin");
  const teacher = Boolean(profile.is_faculty) || profile.is_admin;
  const links = profile.is_admin ? [{ href: "/admin", label: "Admin" }] : [];

  if (!teacher) {
    return (
      <Shell links={links}>
        <Card className="p-6">
          {profile.faculty_status === "pending" ? (
            <Empty
              icon={<Clock size={26} strokeWidth={1.5} />}
              title="Your request is with the admin"
              body={`Signed in as ${profile.display_name ?? "you"}. Teacher tools open here as soon as it's approved — usually within a day.`}
            />
          ) : profile.faculty_status === "rejected" ? (
            <Empty
              icon={<HelpCircle size={26} strokeWidth={1.5} />}
              title="Teacher access wasn't approved"
              body="If that's a mistake, ask the Semwise admin to look again."
            />
          ) : (
            <Empty
              icon={<HelpCircle size={26} strokeWidth={1.5} />}
              title="This page is for teachers"
              body="Teachers request access from the teacher sign-in page."
              action={<Link href="/" className="text-[var(--accent)] hover:underline">Back to your Today</Link>}
            />
          )}
        </Card>
      </Shell>
    );
  }

  const db = await createClient();
  const classes = classesOf(profile.university_id);
  const classLabel = new Map(classes.map((c) => [c.id, c.label]));
  const subjects = subjectNamesOf(profile.university_id);

  const [mineRes, resourcesRes, questionsRes, papers] = await Promise.all([
    db.from("posts").select("id, user_id, cohort_id, subject_slug, kind, title, created_at, verified_by, answer_reply_id")
      .eq("user_id", profile.id).order("created_at", { ascending: false }).limit(30),
    db.from("posts").select("id, user_id, cohort_id, subject_slug, kind, title, created_at, verified_by, answer_reply_id, post_votes(count)")
      .eq("kind", "resource").is("verified_by", null).order("created_at", { ascending: false }).limit(300),
    db.from("posts").select("id, user_id, cohort_id, subject_slug, kind, title, created_at, verified_by, answer_reply_id, replies!post_id(count)")
      .eq("kind", "question").is("answer_reply_id", null).order("created_at", { ascending: false }).limit(200),
    getPapers(),
  ]);

  const mine = (mineRes.data ?? []) as Row[];
  // one post to five classes is five rows; show it once with every class it went to
  const sent = new Map<string, { row: Row; ids: string[]; classes: string[] }>();
  for (const r of mine) {
    const key = `${r.title}|${r.kind}|${r.created_at.slice(0, 16)}`;
    const g = sent.get(key) ?? { row: r, ids: [], classes: [] };
    g.ids.push(r.id);
    g.classes.push(classLabel.get(r.cohort_id) ?? r.cohort_id);
    sent.set(key, g);
  }
  const reach = new Map<string, { seen: number; total: number }>();
  await Promise.all(
    mine.filter((r) => r.kind === "notice").slice(0, 20).map(async (r) => {
      const { data } = await db.rpc("notice_reach", { p_id: r.id });
      const row = Array.isArray(data) ? data[0] : null;
      if (row) reach.set(r.id, { seen: row.seen, total: row.total });
    }),
  );

  const votes = (r: Row) => r.post_votes?.[0]?.count ?? 0;
  const worthTicking = [
    ...((resourcesRes.data ?? []) as Row[]).filter((r) => votes(r) > 0).map((r) => ({
      kind: "post" as const, id: r.id, title: r.title, votes: votes(r), subject: r.subject_slug, where: classLabel.get(r.cohort_id) ?? "",
    })),
    ...papers.filter((p) => !p.verified_by && p.helpful > 0).map((p) => ({
      kind: "paper" as const, id: p.id, title: p.title || `${p.exam} ${p.year}`, votes: p.helpful, subject: p.subject_slug, where: "Past papers",
    })),
  ].sort((a, b) => b.votes - a.votes).slice(0, 10);

  const questions = (questionsRes.data ?? []) as Row[];
  const bySubject = new Map<string, Row[]>();
  for (const q of questions) {
    const k = q.subject_slug ?? "";
    bySubject.set(k, [...(bySubject.get(k) ?? []), q]);
  }
  const stuck = [...bySubject.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <Shell links={links}>
      <div>
        <h1 className="text-[length:var(--text-page)]">Good to see you{profile.display_name ? `, ${profile.display_name}` : ""}</h1>
        <p className="mt-1 text-[length:var(--text-small)] text-muted">
          Post once and every class you pick sees it on their board. Students see a Teacher tag next to your name.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="flex items-center gap-2 text-[length:var(--text-lead)]"><Megaphone size={16} /> Post to your classes</h2>
        <TeacherPostForm cohorts={classes.map((c) => ({ id: c.id, label: c.label }))} />
      </section>

      <Card>
        <CardHead title="What you've posted" sub="Notices show how many of each class have opened them." />
        {sent.size ? (
          <ul className="divide-y divide-[var(--border)]">
            {[...sent.values()].map(({ row, ids, classes: to }) => {
              const seen = ids.map((id) => reach.get(id)).filter(Boolean) as { seen: number; total: number }[];
              const s = seen.reduce((a, x) => a + x.seen, 0);
              const t = seen.reduce((a, x) => a + x.total, 0);
              return (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link href={`/class/${row.id}`} className="font-medium hover:underline focus-ring rounded">{row.title}</Link>
                    <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
                      {row.kind} · {to.join(", ")} · {relativeDay(row.created_at.slice(0, 10))}
                    </p>
                  </div>
                  {row.kind === "notice" && t ? (
                    <span className="flex items-center gap-1.5 text-[length:var(--text-small)] tabular-nums text-muted" title="Opened by / students in those classes">
                      <Eye size={13} /> {s} of {t} read
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-4 text-[length:var(--text-small)] text-muted">Nothing yet — your first notice goes in the box above.</p>
        )}
      </Card>

      <Card>
        <CardHead
          title={<span className="flex items-center gap-2"><BadgeCheck size={15} /> Worth a tick</span>}
          sub="What students rate most helpful and no teacher has verified yet. Your tick puts it higher on their board."
        />
        {worthTicking.length ? (
          <ul className="divide-y divide-[var(--border)]">
            {worthTicking.map((w) => (
              <li key={`${w.kind}-${w.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  {w.kind === "post" ? (
                    <Link href={`/class/${w.id}`} className="font-medium hover:underline focus-ring rounded">{w.title}</Link>
                  ) : (
                    <span className="font-medium">{w.title}</span>
                  )}
                  <p className="mt-0.5 flex items-center gap-2 text-[length:var(--text-micro)] text-subtle">
                    {w.subject ? <Badge tone="neutral">{subjects.get(w.subject) ?? w.subject}</Badge> : null}
                    {w.where}
                    <span className="inline-flex items-center gap-1 tabular-nums"><ThumbsUp size={11} /> {w.votes}</span>
                  </p>
                </div>
                {w.kind === "post" ? <VerifyPost id={w.id} verified={false} /> : <VerifyPaper id={w.id} verified={false} />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-4 text-[length:var(--text-small)] text-muted">Nothing waiting — when students start upvoting resources, the top ones show up here.</p>
        )}
      </Card>

      <Card>
        <CardHead
          title={<span className="flex items-center gap-2"><HelpCircle size={15} /> Where they&rsquo;re stuck</span>}
          sub="Questions on the boards with no accepted answer yet, by subject."
        />
        {stuck.length ? (
          <div className="divide-y divide-[var(--border)]">
            {stuck.map(([slug, qs]) => (
              <div key={slug || "none"} className="px-5 py-3">
                <p className="flex items-center gap-2 text-[length:var(--text-small)] font-medium">
                  {slug ? (subjects.get(slug) ?? slug) : "No subject"}
                  <Badge tone="warn">{qs.length} open</Badge>
                </p>
                <ul className="mt-1.5 space-y-1">
                  {qs.slice(0, 5).map((q) => (
                    <li key={q.id} className="text-[length:var(--text-small)]">
                      <Link href={`/class/${q.id}`} className="hover:underline focus-ring rounded">{q.title}</Link>
                      <span className="text-[length:var(--text-micro)] text-subtle">
                        {"  "}{classLabel.get(q.cohort_id) ?? ""} · {q.replies?.[0]?.count ?? 0} replies
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-4 text-[length:var(--text-small)] text-muted">No open questions on any board right now.</p>
        )}
      </Card>
    </Shell>
  );
}

function Shell({ children, links }: { children: React.ReactNode; links: { href: string; label: string }[] }) {
  return (
    <div className="min-h-dvh">
      <StaffHeader title="Teachers" links={links} />
      <main className="mx-auto max-w-[980px] space-y-6 px-4 py-6">{children}</main>
    </div>
  );
}
