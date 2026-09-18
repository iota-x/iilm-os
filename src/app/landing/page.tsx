import Link from "next/link";
import { ArrowRight, Camera, CalendarClock, ExternalLink, FolderCheck, Sparkles } from "lucide-react";
import { Mark } from "@/components/mark";
import { ThemeToggle } from "@/components/theme";
import { LandingWeek } from "@/components/landing-week";
import { subjects as seedSubjects, exams as seedExams } from "@/data";
import { slots as seedSlots } from "@/data/timetable";
import type { Slot, Subject } from "@/lib/db-types";
import { ACCENT_CLASS, cn, daysUntil, MIDSEM_START } from "@/lib/utils";

/**
 * The front door. Everything on it is the real data the app runs on — the
 * section's timetable, the six syllabuses, the dated tests — so what you
 * see before signing up is what you get after.
 */
export default function LandingPage() {
  const subjects = seedSubjects.map(
    (s) => ({ id: s.slug, slug: s.slug, name: s.name, short_name: s.shortName, color: s.color }) as Subject,
  );
  const slots = seedSlots.map(
    (s, i) =>
      ({
        id: String(i),
        day: s.day,
        periods: s.periods,
        start_time: s.start,
        end_time: s.end,
        subject_id: s.subject,
        kind: s.kind,
        lab_group: s.group,
        room: s.room,
        teacher: s.teacher,
      }) as Slot,
  );

  const topicsOf = (s: (typeof seedSubjects)[number]) =>
    s.units.reduce((m, u) => m + u.topics.length, 0);
  const topicCount = seedSubjects.reduce((n, s) => n + topicsOf(s), 0);
  const experimentCount = seedSubjects.reduce((n, s) => n + s.experiments.length, 0);
  const maxLoad = Math.max(...seedSubjects.map((s) => topicsOf(s) + s.experiments.length));
  const left = daysUntil(MIDSEM_START);
  const bySlug = new Map(seedSubjects.map((s) => [s.slug, s]));

  const today = new Date().toISOString().slice(0, 10);
  const soon = seedExams
    .filter((e) => e.kind !== "mse" && e.kind !== "ese" && (e.date ? e.date >= today : Boolean(e.window)))
    .slice(0, 3)
    .map((e) => ({
      when: e.date
        ? new Date(e.date + "T00:00:00+05:30").toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "Asia/Kolkata",
          })
        : (e.window ?? "").replace(/ 2026$/, ""),
      what: e.name.replace(/^.*? — /, ""),
      subject: e.subject ? bySlug.get(e.subject)?.shortName ?? "" : "",
      color: e.subject ? bySlug.get(e.subject)?.color ?? "slate" : "slate",
    }));

  const cta =
    "inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2.5 text-[length:var(--text-body)] font-medium text-[var(--accent-fg)] hover:opacity-90 focus-ring";

  return (
    <div className="min-h-dvh overflow-x-clip">
      {/* ── top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-line/60 bg-app/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Mark size={30} />
            <span className="font-serif text-[length:var(--text-lead)] font-semibold tracking-tight">
              IILM OS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-[length:var(--text-small)] font-medium text-muted hover:text-fg focus-ring"
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=up"
              className="rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-[length:var(--text-small)] font-medium text-[var(--accent-fg)] hover:opacity-90 focus-ring"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── hero: the copy, and the product itself ────────── */}
        <section className="mx-auto max-w-[1280px] px-5 pt-14 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
            <div>
              <p className="text-[length:var(--text-small)] text-muted">
                B.Tech CSE · Semester I · Section E
              </p>
              <h1 className="mt-4 font-serif text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.4rem]">
                Mid-sems in{" "}
                <span className="whitespace-nowrap tabular-nums">{left} days.</span>
                <br />
                This already knows what&rsquo;s on them.
              </h1>
              <p className="mt-6 max-w-[46ch] text-[length:var(--text-lead)] leading-relaxed text-muted">
                Every syllabus from the course plans. Board photos that file themselves to the
                lecture they came from. An assistant that has read all of it. Built by a classmate,
                for this section.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/login?mode=up" className={cta}>
                  Create your account <ArrowRight size={16} />
                </Link>
                <p className="text-[length:var(--text-small)] text-subtle">
                  Free. College email, a password, your lab group.
                </p>
              </div>

              {soon.length ? (
                <div className="mt-10">
                  <p className="text-[length:var(--text-micro)] text-subtle">Coming up</p>
                  <ul className="mt-2 space-y-1.5">
                    {soon.map((e) => (
                      <li
                        key={e.what + e.when}
                        className={cn(
                          "flex items-center gap-2.5 text-[length:var(--text-small)]",
                          ACCENT_CLASS[e.color],
                        )}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-sc" aria-hidden />
                        <span className="font-medium">{e.subject}</span>
                        <span className="text-muted">{e.what}</span>
                        <span className="text-subtle">— {e.when}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* the week, framed like the screen it is — bleeds off the right edge on wide screens */}
            <div className="relative">
              <div className="rounded-[var(--radius-panel)] border border-line bg-surface p-3 shadow-pop sm:p-4">
                <LandingWeek slots={slots} subjects={subjects} />
              </div>
              <p className="mt-3 text-[length:var(--text-micro)] text-subtle">
                The planner, as it is. Blocks are to scale; the hours after class are drawn, not implied.
              </p>
            </div>
          </div>
        </section>

        {/* ── why this exists ───────────────────────────────── */}
        <section className="mx-auto max-w-[1280px] px-5 pt-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <h2 className="font-serif text-[2rem] font-semibold leading-[1.15] tracking-tight">
                Made by someone who joined a month late.
              </h2>
              <p className="mt-4 max-w-[46ch] text-[length:var(--text-body)] leading-relaxed text-muted">
                I walked into Section E four weeks in, with no course plans, no idea what the board
                was about, and mid-sems on the calendar. This is what I built to catch up: every
                course plan the college has handed out, read once and turned into something you can
                tick through. If you&rsquo;re behind, this is the shortest way back. If you&rsquo;re
                not, it&rsquo;s still the only place the whole semester is in one tab.
              </p>
            </div>
            <ul className="divide-y divide-[var(--border)] border-y border-line">
              {[
                ["Know the paper before you sit it", "Each subject shows exactly which units the mid-sem covers, straight from the course plan — with the unconfirmed ones flagged rather than guessed."],
                ["Practice that comes back", "Questions per topic, the viva set for next week's C lab, and spaced review that brings a topic back before you forget it, not after."],
                ["Attendance you can act on", "Tick the classes you went to. It tells you your percentage against the 75% bar, how many you can still miss, and which subject is closest to the line."],
                ["The class, in one place", "A board for the section: ask what you didn't ask in class, share the link that actually helped, mark what was useful."],
              ].map(([h, b]) => (
                <li key={h} className="grid gap-1 py-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
                  <p className="font-serif text-[length:var(--text-lead)] font-semibold leading-snug">{h}</p>
                  <p className="text-[length:var(--text-small)] leading-relaxed text-muted">{b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── ask: a dark band, with a real exchange ────────── */}
        <section className="dark mt-24 border-y border-line bg-app text-fg">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-[length:var(--text-small)] text-[var(--accent)]">
                <Sparkles size={15} /> Ask
              </p>
              <h2 className="mt-3 font-serif text-[2rem] font-semibold leading-[1.15] tracking-tight">
                An assistant that has already read your syllabus.
              </h2>
              <p className="mt-4 max-w-[46ch] text-[length:var(--text-body)] leading-relaxed text-muted">
                Every subject, unit and topic is in its context before you type. It reads your board
                photos directly, answers on the syllabus by name, and — only when you ask — turns a
                lecture into checkpoints on the right topic or a tutorial sheet into practice
                questions. It never writes to your notes uninvited.
              </p>

              <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface p-4">
                <p className="text-[length:var(--text-small)] font-medium">It runs on a key you bring</p>
                <p className="mt-1 text-[length:var(--text-micro)] leading-relaxed text-muted">
                  Google gives everyone a free Gemini key. Yours is yours alone, stored only against
                  your account.
                </p>
                <ol className="mt-3 space-y-1.5 text-[length:var(--text-small)] text-muted">
                  <li className="flex gap-2">
                    <span className="w-4 shrink-0 tabular-nums text-subtle">1.</span>
                    <span>
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                      >
                        aistudio.google.com/apikey <ExternalLink size={11} />
                      </a>
                      , any Google account.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-4 shrink-0 tabular-nums text-subtle">2.</span>
                    <span><span className="text-fg">Create API key.</span> No card, no billing.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-4 shrink-0 tabular-nums text-subtle">3.</span>
                    <span>Paste it under <span className="text-fg">Settings → Your AI key</span>.</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* the exchange */}
            <div className="rounded-[var(--radius-panel)] border border-line bg-surface p-4 shadow-pop sm:p-6">
              <div className="space-y-4">
                <Bubble who="you">What did Wednesday&rsquo;s DE+CO board say? I have the photos but no idea what topic it was.</Bubble>
                <Bubble who="ask">
                  <p>
                    Four boards from the 11:10 lecture. The first is a 4-variable K-map,{" "}
                    <span className="font-mono text-[length:var(--text-micro)]">Σm(0,1,2,3,4,7,8,9,10,11,12,14)</span>
                    , grouped to B̄ + C̄D̄ + ĀCD + ACD̄. The second introduces{" "}
                    <strong className="font-medium text-fg">don&rsquo;t-cares</strong> — the note in the corner
                    is the rule: use an X only when it enlarges a group. The last two are the same
                    function minimised as POS.
                  </p>
                  <p className="mt-3 text-[length:var(--text-small)]">
                    That&rsquo;s three topics in your Unit 1: <em>Karnaugh maps</em>, <em>Don&rsquo;t-care
                    conditions</em>, <em>POS minimisation</em>. Want me to place the photos and add
                    checkpoints?
                  </p>
                </Bubble>
                <Bubble who="you">yes, and give me the class example as a practice question</Bubble>
                <Bubble who="ask">
                  <p>Done.</p>
                  <ul className="mt-2 space-y-1.5">
                    <Did icon={FolderCheck}>4 photos placed on 3 topics</Did>
                    <Did icon={FolderCheck}>5 checkpoints added under Karnaugh maps</Did>
                    <Did icon={FolderCheck}>1 question added: Σm(0,3,5,7,8,9,10) + d(11,12,14,15)</Did>
                  </ul>
                </Bubble>
              </div>
            </div>
          </div>
        </section>

        {/* ── photos: the mechanism, drawn ──────────────────── */}
        <section className="mx-auto max-w-[1280px] px-5 pt-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-[length:var(--text-small)] text-[var(--accent)]">
                <Camera size={15} /> Photos
              </p>
              <h2 className="mt-3 font-serif text-[2rem] font-semibold leading-[1.15] tracking-tight">
                Photograph the board. That&rsquo;s the whole job.
              </h2>
              <p className="mt-4 max-w-[46ch] text-[length:var(--text-body)] leading-relaxed text-muted">
                Your camera writes the time into every photo. The app has your timetable. A photo
                taken at Wednesday 11:40 was taken during the DE+CO lecture — so that&rsquo;s where it
                goes, with no sorting and no AI involved. Share a week&rsquo;s worth on Sunday; each one
                still lands on its own day and lecture.
              </p>
            </div>

            <ol className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Camera, k: "Taken", v: "Wed 16 Sept, 11:40", sub: "read from the photo itself" },
                { icon: CalendarClock, k: "Timetable says", v: "DE+CO lecture, 11:10–12:10", sub: "your group, that weekday" },
                { icon: FolderCheck, k: "Filed to", v: "DE+CO · Wed 16 Sept", sub: "one row per lecture, on the subject page" },
              ].map((s, i) => (
                <li
                  key={s.k}
                  className={cn(
                    "relative rounded-[var(--radius-card)] border border-line bg-surface p-4",
                    i === 2 && ACCENT_CLASS.orange,
                  )}
                >
                  <s.icon size={18} className={i === 2 ? "text-sc" : "text-subtle"} />
                  <p className="mt-3 text-[length:var(--text-micro)] text-subtle">{s.k}</p>
                  <p className="mt-0.5 text-[length:var(--text-small)] font-medium">{s.v}</p>
                  <p className="mt-1 text-[length:var(--text-micro)] text-muted">{s.sub}</p>
                  {i < 2 ? (
                    <ArrowRight
                      size={14}
                      className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-subtle sm:block"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── what's loaded: the syllabus, as bars ──────────── */}
        <section className="mx-auto max-w-[1280px] px-5 pt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-[2rem] font-semibold leading-[1.15] tracking-tight">
              What&rsquo;s loaded.
            </h2>
            <p className="text-[length:var(--text-small)] text-muted">
              {topicCount} topics and {experimentCount} lab experiments, from the course plans as handed out.
            </p>
          </div>
          <ul className="mt-6 divide-y divide-[var(--border)] border-y border-line">
            {seedSubjects.map((s) => {
              const topics = topicsOf(s);
              const load = topics + s.experiments.length;
              return (
                <li
                  key={s.slug}
                  className={cn("grid items-center gap-3 py-3.5 sm:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,2fr)]", ACCENT_CLASS[s.color])}
                >
                  <p className="flex items-center gap-2.5 text-[length:var(--text-small)] font-medium">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-sc" aria-hidden />
                    {s.name}
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-sc" style={{ width: `${(load / maxLoad) * 100}%` }} />
                  </div>
                  <p className="text-[length:var(--text-micro)] text-muted sm:text-right">
                    {s.status === "empty"
                      ? "course plan to come"
                      : [topics ? `${topics} topics` : null, s.experiments.length ? `${s.experiments.length} experiments` : null]
                          .filter(Boolean)
                          .join(", ")}
                    {s.midsemConfirmed ? " · scope confirmed" : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── close ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-[1280px] px-5 pb-24 pt-24">
          <div className="rounded-[var(--radius-panel)] border border-line bg-surface p-8 shadow-card sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
              <div>
                <h2 className="font-serif text-[2rem] font-semibold leading-[1.15] tracking-tight">
                  Your data is yours.
                </h2>
                <p className="mt-4 max-w-[52ch] text-[length:var(--text-body)] leading-relaxed text-muted">
                  Notes, marks, attendance and photos are private to your account — enforced in the
                  database, not just hidden in the interface. The one shared space is the class
                  board, where you post as yourself.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <Link href="/login?mode=up" className={cta}>
                  Create your account <ArrowRight size={16} />
                </Link>
                <p className="text-[length:var(--text-small)] text-subtle lg:text-right">
                  Free, for Section E. Bugs and questions — post on the class board.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface/60">
        <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-14">
          <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <Mark size={30} />
                <span className="font-serif text-[length:var(--text-lead)] font-semibold tracking-tight">IILM OS</span>
              </div>
              <p className="mt-4 max-w-[38ch] text-[length:var(--text-small)] leading-relaxed text-muted">
                One semester of B.Tech CSE, Section E, as a working system — the course plans,
                the timetable, what happened on the board, and where you stand.
              </p>
              <p className="mt-4 text-[length:var(--text-micro)] text-subtle">
                IILM University, Gurugram · School of Computer Science &amp; Engineering · Batch 2026–30
              </p>
            </div>

            <div>
              <p className="text-[length:var(--text-micro)] font-medium text-muted">Get in</p>
              <ul className="mt-3 space-y-2 text-[length:var(--text-small)]">
                <li><Link href="/login?mode=up" className="hover:text-[var(--accent)]">Create account</Link></li>
                <li><Link href="/login" className="hover:text-[var(--accent)]">Sign in</Link></li>
                <li>
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)]">
                    Get a Gemini key
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[length:var(--text-micro)] font-medium text-muted">Inside</p>
              <ul className="mt-3 space-y-2 text-[length:var(--text-small)] text-muted">
                <li>Planner</li>
                <li>Practice &amp; Review</li>
                <li>Inbox &amp; Ask</li>
                <li>Class board</li>
                <li>Attendance &amp; Exams</li>
              </ul>
            </div>

            <div>
              <p className="text-[length:var(--text-micro)] font-medium text-muted">Made by</p>
              <p className="mt-3 text-[length:var(--text-small)] font-medium">Ankit Pandey</p>
              <p className="text-[length:var(--text-micro)] text-muted">B.Tech CSE &rsquo;30 · Section E</p>
              <ul className="mt-3 space-y-2 text-[length:var(--text-small)]">
                <li>
                  <a href="https://x.com/iota_xx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[var(--accent)]">
                    <XLogo /> @iota_xx
                  </a>
                </li>
                <li>
                  <a href="https://github.com/iota-x" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[var(--accent)]">
                    <GitHubLogo /> iota-x
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 text-[length:var(--text-micro)] text-subtle">
            <p>Built with the course plans as handed out. Bugs and questions go on the class board.</p>
            <p>&copy; {new Date().getFullYear()} Ankit Pandey</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function XLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2H21.5l-7.5 8.57L22.8 22h-6.9l-5.4-7.06L4.3 22H1.04l8.02-9.17L.6 2h7.08l4.88 6.45L18.24 2Zm-1.21 18h1.9L7.05 3.9H5.02L17.03 20Z" />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function Bubble({ who, children }: { who: "you" | "ask"; children: React.ReactNode }) {
  const you = who === "you";
  return (
    <div className={cn("flex", you ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-[var(--radius-card)] px-4 py-3 text-[length:var(--text-small)] leading-relaxed",
          you ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-surface-2 text-fg",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Did({ icon: Icon, children }: { icon: typeof FolderCheck; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-[length:var(--text-small)] text-[var(--good)]">
      <Icon size={13} /> <span className="text-fg">{children}</span>
    </li>
  );
}
