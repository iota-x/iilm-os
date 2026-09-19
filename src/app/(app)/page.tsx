import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, MapPin } from "lucide-react";
import {
  getProfile,
  getSubjects,
  getTopics,
  getTasks,
  getPlanDays,
  getSlots,
  getNotes,
  getExperiments,
} from "@/lib/queries";
import { attendanceBySubject } from "@/lib/attendance";
import { AttendanceToday } from "@/components/attendance-today";
import { getAttendance, getClassMarks } from "@/lib/queries";
import { dueForReview, reviewStateOf } from "@/lib/review";
import { TaskList } from "@/components/task-list";
import { QuickAdd } from "@/components/quick-add";
import { Badge, Card, CardHead, Ring } from "@/components/ui";
import { CountUp } from "@/components/count-up";
import { FirstRun } from "@/components/first-run";
import { getGoals, getInboxFiles } from "@/lib/queries";
import {
  ACCENT_CLASS,
  cn,
  fmtTime,
  istNowMinutes,
  istToday,
  istWeekday,
  examCountdown,
  progressOf,
  toMinutes,
  relativeDay,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [profile, subjects, topics, experiments, planDays, slots, notes] = await Promise.all([
    getProfile(),
    getSubjects(),
    getTopics(),
    getExperiments(),
    getPlanDays(),
    getSlots(),
    getNotes({ limit: 5 }),
  ]);

  const today = istToday();
  const weekday = istWeekday();
  const now = istNowMinutes();
  const group = profile?.lab_group ?? 2;

  const due = dueForReview(topics);
  const soon = topics.filter((t) => reviewStateOf(t).bucket === "soon").length;

  const [classMarks, attendanceBaseline] = await Promise.all([getClassMarks(), getAttendance()]);
  const todayMarks = classMarks.filter((m) => m.on_date === today);
  const attendanceRows = attendanceBySubject(subjects, classMarks, attendanceBaseline);
  const atRisk = attendanceRows.filter((r) => r.pct !== null && r.pct < 75);

  const todayTasks = await getTasks({ date: today });
  const overdue = (await getTasks({ to: today })).filter(
    (t) => t.status === "todo" && t.due_date !== today,
  );

  const plan = planDays.find((d) => d.date === today);
  const countdown = examCountdown();

  const todaySlots = slots
    .filter((s) => s.day === weekday && (s.lab_group === null || s.lab_group === group))
    .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));

  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  // Mid-sem progress per subject. A lab-only course like Linux has no topics at
  // all — its syllabus is the experiment list — so measure whichever of the two
  // the course actually has.
  const midsemStats = subjects.map((s) => {
    const own = topics.filter((t) => t.subject_id === s.id && t.in_midsem);
    if (own.length) {
      return {
        subject: s,
        total: own.length,
        noun: own.length === 1 ? "topic" : "topics",
        progress: progressOf(own.map((t) => t.status)),
        untouched: own.filter((t) => t.status === "not_started").length,
      };
    }
    const labs = experiments.filter((e) => e.subject_id === s.id);
    return {
      subject: s,
      total: labs.length,
      noun: labs.length === 1 ? "experiment" : "experiments",
      progress: progressOf(labs.map((e) => e.status)),
      untouched: labs.filter((e) => e.status === "not_started").length,
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

  // Only subjects still missing their syllabus. A complete subject can carry
  // a gap note (Linux: the marking scheme is unconfirmed) without needing
  // "material" — that note lives on its own page.
  const gapSubjects = subjects.filter((s) => s.status !== "complete");

  // The first-run checklist: what this account has and hasn't done yet.
  const [goals, inbox] = await Promise.all([getGoals(), getInboxFiles()]);
  const firstRun = [
    {
      key: "key",
      label: "Add your Gemini key",
      why: "Ask runs on your own free key — two minutes at aistudio.google.com.",
      href: "/settings",
      done: Boolean(profile?.gemini_key),
    },
    {
      key: "goal",
      label: "Set a goal",
      why: "Pick a subject and a date; each day's share lands here on Today.",
      href: "/goals",
      done: goals.some((g) => g.status === "active"),
    },
    {
      key: "photo",
      label: "Share a board photo from your phone",
      why: "It files itself to the lecture it was taken in.",
      href: "/inbox",
      done: inbox.length > 0,
    },
    {
      key: "attend",
      label: "Tick today's classes",
      why: "Attendance against the 75% bar, from what you actually went to.",
      href: "/attendance",
      done: classMarks.length > 0,
    },
    {
      key: "status",
      label: "Mark one topic as started",
      why: "Status and confidence decide when a topic comes back for review.",
      href: `/subjects/${subjects[0]?.slug ?? ""}`,
      done: topics.some((t) => t.status !== "not_started"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[length:var(--text-page)]">
            {greeting()}
            {profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="mt-1 text-[length:var(--text-small)] text-muted">
            {new Date(today + "T00:00:00+05:30").toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "Asia/Kolkata",
            })}
            {plan?.headline ? <span className="text-subtle"> — {plan.headline}</span> : null}
          </p>
          {plan?.phase ? (
            <p className="mt-2">
              <Badge tone="accent">{phaseLabel(plan.phase)}</Badge>
            </p>
          ) : null}
          <p className="hidden">
          </p>
        </div>
        <QuickAdd subjects={subjects} defaultDate={today} />
      </div>

      <FirstRun steps={firstRun} />

      {/* ── the four numbers worth glancing at ─────────────── */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] bg-[var(--border)] shadow-card sm:grid-cols-4 dark:shadow-none">
        <Figure
          value={countdown.chip?.n ?? "—"}
          unit={countdown.chip && /^\d+$/.test(countdown.chip.n) ? "days" : undefined}
          label={countdown.chip?.label.replace(/^days? /, "") ?? "mid-sems done"}
          note={countdown.note}
          href="/exams"
        />
        <Figure
          value={`${Math.round(overallMidsem * 100)}%`}
          label="of the mid-sem syllabus"
          note={`${topics.filter((t) => t.in_midsem && t.status !== "not_started").length} of ${topics.filter((t) => t.in_midsem).length} topics started`}
          href="/subjects"
        />
        <Figure
          value={`${doneToday}/${todayTasks.length}`}
          label="blocks done today"
          note={
            plannedMin
              ? `${Math.round((doneMin / 60) * 10) / 10}h of ${Math.round((plannedMin / 60) * 10) / 10}h planned`
              : "nothing planned"
          }
          href="/planner"
        />
        <Figure
          value={due.length ? String(due.length) : "—"}
          label={due.length === 1 ? "topic due to review" : "topics due to review"}
          note={
            due.length
              ? due[0].review.daysUntilDue !== null && due[0].review.daysUntilDue < 0
                ? `oldest ${-due[0].review.daysUntilDue} days overdue`
                : "all due today"
              : soon
                ? `${soon} coming up within 2 days`
                : "nothing scheduled"
          }
          href="/review"
          emphasis={due.length > 0}
        />
      </div>

      {atRisk.length ? (
        <Link
          href="/attendance"
          className="flex items-center gap-2.5 rounded-[var(--radius-control)] px-1 py-1 text-[length:var(--text-small)] focus-ring"
        >
          <AlertTriangle size={15} className="shrink-0 text-[var(--warn)]" />
          <span className="min-w-0 flex-1">
            <span className="font-medium">{atRisk.map((r) => r.subject.short_name).join(", ")}</span>{" "}
            <span className="text-muted">
              below 75%. {atRisk[0].needToAttend} classes in a row fixes the worst of it.
            </span>
          </span>
          <ArrowRight size={14} className="shrink-0 text-subtle" />
        </Link>
      ) : null}

      {/* ── what's missing ─────────────────────────────────── */}
      {gapSubjects.length ? (
        <p className="text-[length:var(--text-small)] leading-relaxed text-muted">
          Still waiting on course material for{" "}
          {gapSubjects.map((s, i) => (
            <span key={s.id}>
              {i > 0 ? (i === gapSubjects.length - 1 ? " and " : ", ") : ""}
              <Link
                href={`/subjects/${s.slug}`}
                className="text-fg underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-current"
              >
                {s.short_name}
              </Link>
            </span>
          ))}
          .
        </p>
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
                  className="text-[length:var(--text-micro)] text-muted hover:text-fg inline-flex items-center gap-1 focus-ring rounded"
                >
                  Planner <ArrowRight size={12} />
                </Link>
              }
            />
            <TaskList
              tasks={todayTasks}
              subjects={subjects}
              emptyText="Nothing planned for today. Set a goal and each day\u2019s share appears here."
            />
          </Card>

          <Card>
            <CardHead title="Mid-sem readiness" sub="Units in scope only" />
            <ul className="divide-y divide-[var(--border)]">
              {midsemStats
                .sort((a, b) => a.progress - b.progress)
                .map(({ subject, total, noun, progress, untouched }) => (
                  <li key={subject.id} className={cn("px-4 py-3", ACCENT_CLASS[subject.color])}>
                    <Link
                      href={`/subjects/${subject.slug}`}
                      className="flex items-center gap-3 focus-ring rounded"
                    >
                      <Ring value={progress} size={38} stroke={3.5} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[length:var(--text-small)] font-medium truncate">{subject.name}</p>
                        <p className="text-[length:var(--text-micro)] text-muted mt-0.5">
                          {total === 0 ? (
                            <span className="text-[var(--warn)]">no syllabus loaded</span>
                          ) : untouched === 0 ? (
                            `all ${noun} started`
                          ) : (
                            `${untouched} of ${total} ${noun} untouched`
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
                  className="text-[length:var(--text-micro)] text-muted hover:text-fg focus-ring rounded"
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
                          <p className="text-[length:var(--text-small)] font-medium truncate">
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
                        <p className="text-[length:var(--text-micro)] text-muted mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
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
                          <p className="text-[length:var(--text-micro)] text-subtle mt-0.5">{s.teacher}</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 py-6 text-[length:var(--text-small)] text-muted text-center">
                No classes today. Full day for study.
              </p>
            )}

            {todaySlots.length ? (
              <div className="border-t border-line">
                <AttendanceToday
                  date={today}
                  dayLabel={fullDay(weekday)}
                  slots={todaySlots}
                  subjects={subjects}
                  marks={todayMarks}
                />
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHead
              title="Recent notes"
              right={
                <Link
                  href="/notes"
                  className="text-[length:var(--text-micro)] text-muted hover:text-fg focus-ring rounded"
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
                        <p className="text-[length:var(--text-small)] font-medium truncate">{n.title}</p>
                        <p className="text-[length:var(--text-micro)] text-muted mt-0.5 flex items-center gap-2">
                          {subject ? <Badge tone="subject">{subject.short_name}</Badge> : null}
                          <span>{relativeDay(n.updated_at.slice(0, 10))}</span>
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 py-6 text-[length:var(--text-small)] text-muted text-center">
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

/** One number, its unit, and the line of context that makes it mean something. */
function Figure({
  value,
  unit,
  label,
  note,
  href,
  emphasis,
}: {
  value: string;
  unit?: string;
  label: string;
  note?: string;
  href: string;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group bg-surface px-4 py-4 transition-colors hover:bg-surface-2 focus-ring"
    >
      <p
        className={cn(
          "font-sans font-semibold tracking-[-0.03em] text-[length:var(--text-figure)] leading-none tabular-nums",
          emphasis ? "text-[var(--accent)]" : "text-fg",
        )}
      >
        {/^\d+$/.test(value) ? <CountUp value={value} /> : value}
        {unit ? (
          <span className="ml-1.5 align-baseline text-[length:var(--text-small)] font-normal tracking-normal text-subtle">
            {unit}
          </span>
        ) : null}
      </p>
      <p className="mt-2.5 text-[length:var(--text-small)] text-fg">{label}</p>
      {note ? <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">{note}</p> : null}
    </Link>
  );
}
