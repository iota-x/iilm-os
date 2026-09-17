import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, MapPin, Repeat2 } from "lucide-react";
import {
  getProfile,
  getSubjects,
  getTopics,
  getTasks,
  getPlanDays,
  getSlots,
  getNotes,
} from "@/lib/queries";
import { dueForReview, reviewStateOf } from "@/lib/review";
import { TaskList } from "@/components/task-list";
import { QuickAdd } from "@/components/quick-add";
import { Badge, Bar, Card, CardHead, Ring } from "@/components/ui";
import {
  ACCENT_CLASS,
  cn,
  daysUntil,
  fmtTime,
  istNowMinutes,
  istToday,
  istWeekday,
  MIDSEM_START,
  progressOf,
  toMinutes,
  relativeDay,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [profile, subjects, topics, planDays, slots, notes] = await Promise.all([
    getProfile(),
    getSubjects(),
    getTopics(),
    getPlanDays(),
    getSlots(),
    getNotes({ limit: 5 }),
  ]);

  const today = istToday();
  const weekday = istWeekday();
  const now = istNowMinutes();
  const group = profile?.lab_group ?? 2;

  const due = dueForReview(topics);
  const dueMidsem = due.filter((d) => d.topic.in_midsem).length;
  const soon = topics.filter((t) => reviewStateOf(t).bucket === "soon").length;

  const todayTasks = await getTasks({ date: today });
  const overdue = (await getTasks({ to: today })).filter(
    (t) => t.status === "todo" && t.due_date !== today,
  );

  const plan = planDays.find((d) => d.date === today);
  const left = daysUntil(MIDSEM_START);

  const todaySlots = slots
    .filter((s) => s.day === weekday && (s.lab_group === null || s.lab_group === group))
    .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));

  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  // mid-sem progress per subject
  const midsemStats = subjects.map((s) => {
    const own = topics.filter((t) => t.subject_id === s.id && t.in_midsem);
    return {
      subject: s,
      total: own.length,
      progress: progressOf(own.map((t) => t.status)),
      untouched: own.filter((t) => t.status === "not_started").length,
    };
  });

  const overallMidsem = progressOf(
    topics.filter((t) => t.in_midsem).map((t) => t.status),
  );

  const doneToday = todayTasks.filter((t) => t.status === "done").length;
  const plannedMin = todayTasks.reduce((a, t) => a + (t.minutes ?? 0), 0);
  const doneMin = todayTasks
    .filter((t) => t.status === "done")
    .reduce((a, t) => a + (t.minutes ?? 0), 0);

  const gapSubjects = subjects.filter((s) => s.gaps.length > 0);

  return (
    <div className="space-y-6">
      {/* ── header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">
            {greeting()}
            {profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="text-[13px] text-muted mt-0.5">
            {new Date(today + "T00:00:00+05:30").toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "Asia/Kolkata",
            })}
            {plan?.headline ? <> · {plan.headline}</> : null}
          </p>
        </div>
        <QuickAdd subjects={subjects} defaultDate={today} />
      </div>

      {/* ── review queue ───────────────────────────────────── */}
      {due.length ? (
        <Link href="/review" className="block focus-ring rounded-[14px]">
          <Card className="overflow-hidden transition-colors hover:bg-surface-2/40">
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Repeat2 size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold leading-tight">
                  {due.length} topic{due.length === 1 ? "" : "s"} due for review
                </p>
                <p className="mt-0.5 text-[12px] leading-tight text-muted">
                  {dueMidsem ? `${dueMidsem} in the mid-sem scope · ` : ""}
                  {due[0].review.daysUntilDue !== null && due[0].review.daysUntilDue < 0
                    ? `oldest is ${-due[0].review.daysUntilDue} day${due[0].review.daysUntilDue === -1 ? "" : "s"} overdue`
                    : "all due today"}
                  {soon ? ` · ${soon} more within 2 days` : ""}
                </p>
              </div>
              <ArrowRight size={15} className="shrink-0 text-subtle" />
            </div>
          </Card>
        </Link>
      ) : null}

      {/* ── countdown strip ────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Ring value={Math.max(0, Math.min(1, 1 - left / 18))} size={48} label={String(left)} />
            <div>
              <p className="text-[13px] font-semibold leading-tight">days to mid-sems</p>
              <p className="text-[12px] text-muted leading-tight mt-0.5">
                5–11 Oct · unconfirmed
              </p>
            </div>
          </div>

          <div className="h-9 w-px bg-[var(--border)] hidden sm:block" />

          <div>
            <p className="text-[12px] text-muted">Mid-sem syllabus covered</p>
            <div className="flex items-center gap-2.5 mt-1.5">
              <Bar value={overallMidsem} tone="accent" className="w-28" />
              <span className="text-[13px] font-semibold tabular-nums">
                {Math.round(overallMidsem * 100)}%
              </span>
            </div>
          </div>

          <div className="h-9 w-px bg-[var(--border)] hidden sm:block" />

          <div>
            <p className="text-[12px] text-muted">Today</p>
            <p className="text-[13px] font-semibold mt-1 tabular-nums">
              {doneToday}/{todayTasks.length} blocks
              {plannedMin ? (
                <span className="text-muted font-normal">
                  {" · "}
                  {Math.round(doneMin / 60 * 10) / 10}h of {Math.round(plannedMin / 60 * 10) / 10}h
                </span>
              ) : null}
            </p>
          </div>

          {plan?.phase ? (
            <div className="ml-auto">
              <Badge tone="accent">{phaseLabel(plan.phase)}</Badge>
            </div>
          ) : null}
        </div>
        {plan?.note ? (
          <p className="border-t border-line bg-surface-2 px-4 py-2.5 text-[12.5px] text-muted leading-relaxed">
            {plan.note}
          </p>
        ) : null}
      </Card>

      {/* ── gaps warning ───────────────────────────────────── */}
      {gapSubjects.length ? (
        <Card className="border-[var(--warn)]/35">
          <div className="flex gap-3 px-4 py-3">
            <AlertTriangle size={16} className="text-[var(--warn)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">
                {gapSubjects.length} subject{gapSubjects.length > 1 ? "s" : ""} missing material
              </p>
              <p className="text-[12.5px] text-muted mt-0.5 leading-relaxed">
                {gapSubjects.map((s, i) => (
                  <span key={s.id}>
                    {i > 0 ? " · " : ""}
                    <Link
                      href={`/subjects/${s.slug}`}
                      className="underline underline-offset-2 hover:text-fg"
                    >
                      {s.short_name}
                    </Link>{" "}
                    <span className="text-subtle">({s.gaps.length})</span>
                  </span>
                ))}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] items-start">
        {/* ── left column ──────────────────────────────────── */}
        <div className="space-y-5">
          {overdue.length ? (
            <Card>
              <CardHead
                title="Carried over"
                sub={`${overdue.length} unfinished from earlier days`}
                right={<Badge tone="warn">{overdue.length}</Badge>}
              />
              <TaskList tasks={overdue} subjects={subjects} showDate />
            </Card>
          ) : null}

          <Card>
            <CardHead
              title="Today's plan"
              sub={
                plannedMin
                  ? `${Math.round(plannedMin / 60 * 10) / 10} hours across ${todayTasks.length} blocks`
                  : undefined
              }
              right={
                <Link
                  href="/planner"
                  className="text-[12px] text-muted hover:text-fg inline-flex items-center gap-1 focus-ring rounded"
                >
                  Planner <ArrowRight size={12} />
                </Link>
              }
            />
            <TaskList
              tasks={todayTasks}
              subjects={subjects}
              emptyText="No blocks for today. Add one, or open the planner."
            />
          </Card>

          <Card>
            <CardHead title="Mid-sem readiness" sub="Units in scope only" />
            <ul className="divide-y divide-[var(--border)]">
              {midsemStats
                .sort((a, b) => a.progress - b.progress)
                .map(({ subject, total, progress, untouched }) => (
                  <li key={subject.id} className={cn("px-4 py-3", ACCENT_CLASS[subject.color])}>
                    <Link
                      href={`/subjects/${subject.slug}`}
                      className="flex items-center gap-3 focus-ring rounded"
                    >
                      <Ring value={progress} size={38} stroke={3.5} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium truncate">{subject.name}</p>
                        <p className="text-[11.5px] text-muted mt-0.5">
                          {total === 0 ? (
                            <span className="text-[var(--warn)]">no syllabus loaded</span>
                          ) : untouched === 0 ? (
                            "all topics started"
                          ) : (
                            `${untouched} of ${total} topics untouched`
                          )}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-subtle shrink-0" />
                    </Link>
                  </li>
                ))}
            </ul>
          </Card>
        </div>

        {/* ── right column ─────────────────────────────────── */}
        <div className="space-y-5">
          <Card>
            <CardHead
              title={`${fullDay(weekday)}'s classes`}
              sub={`Lab group ${group}`}
              right={
                <Link
                  href="/planner"
                  className="text-[12px] text-muted hover:text-fg focus-ring rounded"
                >
                  Week
                </Link>
              }
            />
            {todaySlots.length ? (
              <ul className="divide-y divide-[var(--border)]">
                {todaySlots.map((s) => {
                  const subject = s.subject_id ? subjectById[s.subject_id] : null;
                  const start = toMinutes(s.start_time);
                  const end = toMinutes(s.end_time);
                  const isNow = now >= start && now < end;
                  const past = now >= end;
                  return (
                    <li
                      key={s.id}
                      className={cn(
                        "px-4 py-2.5 flex items-start gap-3",
                        subject ? ACCENT_CLASS[subject.color] : "",
                        past && "opacity-45",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1 self-stretch rounded-full shrink-0",
                          isNow ? "bg-sc" : "bg-surface-3",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[13px] font-medium truncate">
                            {subject ? (
                              <Link
                                href={`/subjects/${subject.slug}`}
                                className="hover:text-sc focus-ring rounded"
                              >
                                {subject.name}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </p>
                          {isNow ? <Badge tone="subject">now</Badge> : null}
                        </div>
                        <p className="text-[11.5px] text-muted mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Clock size={11} />
                            {fmtTime(s.start_time)}–{fmtTime(s.end_time)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} />
                            {s.room}
                          </span>
                          {s.kind === "lab" ? <Badge tone="neutral">Lab</Badge> : null}
                        </p>
                        {s.teacher ? (
                          <p className="text-[11px] text-subtle mt-0.5">{s.teacher}</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 py-6 text-[12.5px] text-muted text-center">
                No classes today. Full day for study.
              </p>
            )}
          </Card>

          <Card>
            <CardHead
              title="Recent notes"
              right={
                <Link
                  href="/notes"
                  className="text-[12px] text-muted hover:text-fg focus-ring rounded"
                >
                  All
                </Link>
              }
            />
            {notes.length ? (
              <ul className="divide-y divide-[var(--border)]">
                {notes.map((n) => {
                  const subject = n.subject_id ? subjectById[n.subject_id] : null;
                  return (
                    <li key={n.id} className={cn(subject ? ACCENT_CLASS[subject.color] : "")}>
                      <Link
                        href={`/notes?open=${n.id}`}
                        className="block px-4 py-2.5 hover:bg-surface-2 transition-colors focus-ring"
                      >
                        <p className="text-[13px] font-medium truncate">{n.title}</p>
                        <p className="text-[11.5px] text-muted mt-0.5 flex items-center gap-2">
                          {subject ? <Badge tone="subject">{subject.short_name}</Badge> : null}
                          <span>{relativeDay(n.updated_at.slice(0, 10))}</span>
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 py-6 text-[12.5px] text-muted text-center">
                No notes yet. Hit Add above.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = Math.floor(istNowMinutes() / 60);
  if (h < 5) return "Still up";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Night";
}

function fullDay(d: string) {
  return (
    { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" } as Record<string, string>
  )[d] ?? d;
}

function phaseLabel(p: string) {
  return (
    {
      triage: "Phase 0 · Triage",
      "first-pass": "Phase 1 · First pass",
      drill: "Phase 2 · Drill",
      revise: "Phase 3 · Revision",
      exams: "Exam week",
    } as Record<string, string>
  )[p] ?? p;
}
