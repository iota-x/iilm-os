import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { Mark } from "@/components/mark";
import { ThemeToggle } from "@/components/theme";
import { LandingWeek } from "@/components/landing-week";
import { subjects as seedSubjects, exams as seedExams } from "@/data";
import { slots as seedSlots } from "@/data/timetable";
import type { Slot, Subject } from "@/lib/db-types";
import { ACCENT_CLASS, cn, daysUntil, MIDSEM_START } from "@/lib/utils";

/**
 * The front door. Everything on it is the real data the app runs on — the
 * section's timetable, the six syllabuses — so what you see before signing
 * up is what you get after.
 */
export default function LandingPage() {
  // Seed data → the shapes WeekGrid expects. Subject ids are just slugs here.
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

  const topicCount = seedSubjects.reduce(
    (n, s) => n + s.units.reduce((m, u) => m + u.topics.length, 0),
    0,
  );
  const experimentCount = seedSubjects.reduce((n, s) => n + s.experiments.length, 0);
  const left = daysUntil(MIDSEM_START);
  const bySlug = new Map(seedSubjects.map((s) => [s.slug, s]));
  // the next few dated things — what makes someone sign up tonight rather than later
  const today = new Date().toISOString().slice(0, 10);
  const soon = seedExams
    .filter((e) => e.kind !== "mse" && e.kind !== "ese" && (e.date ? e.date >= today : Boolean(e.window)))
    .slice(0, 3)
    .map((e) => ({
      when: e.date
        ? new Date(e.date + "T00:00:00+05:30").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })
        : e.window ?? "",
      what: e.name.replace(/^.*? — /, ""),
      subject: e.subject ? bySlug.get(e.subject)?.shortName ?? "" : "",
      color: e.subject ? bySlug.get(e.subject)?.color ?? "slate" : "slate",
    }));

  return (
    <div className="min-h-dvh">
      {/* ── top bar ─────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-[1080px] items-center justify-between px-5 py-5">
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
      </header>

      <main className="mx-auto max-w-[1080px] px-5 pb-24">
        {/* ── hero ──────────────────────────────────────────── */}
        <section className="pt-10 sm:pt-16">
          <p className="text-[length:var(--text-small)] text-muted">B.Tech CSE · Semester I · Section E</p>
          <h1 className="mt-3 max-w-[18ch] font-serif text-[2.25rem] font-semibold leading-[1.1] tracking-tight sm:text-[3rem]">
            Mid-sems are in {left} days. This already knows what&rsquo;s on them.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[length:var(--text-lead)] leading-relaxed text-muted">
            Every syllabus from the course plans, the mid-sem scope for each, board photos that file
            themselves to the lecture they came from, an AI that has read all of it, and a running
            count of where you stand. Built by a classmate, for this section.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/login?mode=up"
              className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2.5 text-[length:var(--text-body)] font-medium text-[var(--accent-fg)] hover:opacity-90 focus-ring"
            >
              Create your account <ArrowRight size={16} />
            </Link>
            <p className="text-[length:var(--text-small)] text-subtle">
              Free. Your college email, a password, your lab group. About a minute.
            </p>
          </div>

          {soon.length ? (
            <ul className="mt-8 flex flex-wrap gap-2">
              {soon.map((e) => (
                <li
                  key={e.what + e.when}
                  className={cn(
                    "flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-3 py-1.5 text-[length:var(--text-small)]",
                    ACCENT_CLASS[e.color],
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sc" aria-hidden />
                  <span className="font-medium">{e.subject}</span>
                  <span className="text-muted">{e.what}</span>
                  <span className="text-subtle">· {e.when}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* ── the week, to scale ────────────────────────────── */}
        <section className="mt-14 rounded-[var(--radius-panel)] border border-line bg-surface p-4 shadow-card sm:p-5">
          <LandingWeek slots={slots} subjects={subjects} />
        </section>

        {/* ── why sign up tonight ───────────────────────────── */}
        <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-[length:var(--text-title)]">Made by someone who joined a month late</h2>
            <p className="mt-3 max-w-[52ch] text-[length:var(--text-small)] leading-relaxed text-muted">
              I walked into Section E four weeks in, with no course plans, no idea what the board
              was about, and mid-sems on the calendar. This is what I built to catch up: every
              course plan the college has handed out, read once and turned into something you can
              tick through. If you&rsquo;re behind, this is the shortest way back. If you&rsquo;re
              not, it&rsquo;s still the only place the whole semester is in one tab.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["Know the paper before you sit it", "Each subject shows exactly which units the mid-sem covers, straight from the course plan, with the unconfirmed ones flagged rather than guessed."],
              ["Practice that comes back", "Questions per topic, the viva set for next week's C lab, and spaced review that brings a topic back before you forget it — not after."],
              ["Attendance you can act on", "Tick the classes you went to. It tells you your percentage against the 75% bar, how many you can still miss, and which subject is closest to the line."],
              ["The class, in one place", "A board for the section: ask the thing you didn't ask in class, share a link that actually helped, post what a teacher said that everyone should know."],
            ].map(([h, b]) => (
              <li key={h} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
                <p className="text-[length:var(--text-small)] font-medium">{h}</p>
                <p className="mt-1.5 text-[length:var(--text-small)] leading-relaxed text-muted">{b}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── what's inside ─────────────────────────────────── */}
        <section className="mt-16 grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-serif text-[length:var(--text-figure)] font-semibold leading-none tabular-nums">
              {topicCount}
            </p>
            <h2 className="mt-3 text-[length:var(--text-lead)]">Topics, from the course plans</h2>
            <p className="mt-2 text-[length:var(--text-small)] leading-relaxed text-muted">
              Six subjects, session by session, with the mid-sem scope marked on each — plus{" "}
              {experimentCount} lab experiments with what each one asks for. Not a summary of the
              syllabus; the syllabus.
            </p>
          </div>
          <div>
            <p className="font-serif text-[length:var(--text-figure)] font-semibold leading-none">
              11:40
            </p>
            <h2 className="mt-3 text-[length:var(--text-lead)]">Photos file themselves</h2>
            <p className="mt-2 text-[length:var(--text-small)] leading-relaxed text-muted">
              Photograph the board. Share it from your phone. A photo taken at Wednesday 11:40 was
              taken during the DE+CO lecture — so that&rsquo;s where it goes, with no sorting and no
              AI involved. Upload a week late; it still knows.
            </p>
          </div>
          <div>
            <p className="font-serif text-[length:var(--text-figure)] font-semibold leading-none">
              75%
            </p>
            <h2 className="mt-3 text-[length:var(--text-lead)]">The numbers that bite</h2>
            <p className="mt-2 text-[length:var(--text-small)] leading-relaxed text-muted">
              Attendance per subject against the 75% bar, with how many you can still miss. Marks
              against the 40-and-40 rule. Spaced review so mid-sem topics come back before you
              forget them, not after.
            </p>
          </div>
        </section>

        {/* ── the subjects ──────────────────────────────────── */}
        <section className="mt-16">
          <h2 className="text-[length:var(--text-title)]">What&rsquo;s loaded</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {seedSubjects.map((s) => {
              const topics = s.units.reduce((n, u) => n + u.topics.length, 0);
              return (
                <li
                  key={s.slug}
                  className={cn(
                    "flex items-start gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3",
                    ACCENT_CLASS[s.color],
                  )}
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sc" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[length:var(--text-small)] font-medium">{s.name}</p>
                    <p className="mt-0.5 text-[length:var(--text-micro)] text-muted">
                      {s.status === "empty"
                        ? "Course plan still to come"
                        : topics
                          ? `${s.units.length} unit${s.units.length === 1 ? "" : "s"}, ${topics} topics${s.experiments.length ? `, ${s.experiments.length} experiments` : ""}`
                          : `${s.experiments.length} experiments`}
                      {s.midsemConfirmed ? " · mid-sem scope confirmed" : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── ask ───────────────────────────────────────────── */}
        <section className="mt-16 rounded-[var(--radius-panel)] border border-line bg-surface p-5 shadow-card sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="flex items-center gap-2 text-[length:var(--text-small)] text-[var(--accent)]">
                <Sparkles size={15} /> Ask
              </p>
              <h2 className="mt-2 text-[length:var(--text-title)]">
                An assistant that has already read your syllabus
              </h2>
              <p className="mt-3 max-w-[58ch] text-[length:var(--text-small)] leading-relaxed text-muted">
                Every subject, unit and topic is in its context before you type. So &ldquo;what did
                today&rsquo;s DE+CO board say?&rdquo; gets an answer that names the topic; &ldquo;turn
                it into checkpoints&rdquo; puts them on that topic; &ldquo;make questions from this
                tutorial sheet&rdquo; puts them in Practice. It reads your board photos directly.
                It will not write to your notes unless you ask it to.
              </p>
              <ul className="mt-4 space-y-1.5 text-[length:var(--text-small)] text-muted">
                {[
                  "“Explain the don’t-care rule using the example from Wednesday’s board.”",
                  "“What’s in the mid-sem for Calculus and which of it haven’t I started?”",
                  "“Five viva questions on break vs continue, with answers.”",
                ].map((q) => (
                  <li key={q} className="flex gap-2">
                    <span className="text-subtle">—</span>
                    <span className="font-serif italic">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-card)] bg-surface-2 p-4 sm:p-5">
              <h3 className="text-[length:var(--text-lead)]">It runs on a key you bring</h3>
              <p className="mt-1.5 text-[length:var(--text-small)] leading-relaxed text-muted">
                Google gives everyone a free Gemini key. Yours is yours alone — nobody else&rsquo;s
                usage counts against it, and it&rsquo;s stored only against your account.
              </p>
              <ol className="mt-4 space-y-2.5 text-[length:var(--text-small)] leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="w-4 shrink-0 tabular-nums text-subtle">1.</span>
                  <span>
                    Open{" "}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                    >
                      aistudio.google.com/apikey <ExternalLink size={11} />
                    </a>{" "}
                    with any Google account.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-4 shrink-0 tabular-nums text-subtle">2.</span>
                  <span>
                    <strong className="font-medium">Create API key.</strong> No card, no billing.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="w-4 shrink-0 tabular-nums text-subtle">3.</span>
                  <span>
                    After signing up, paste it under <strong className="font-medium">Settings → Your AI key</strong>.
                  </span>
                </li>
              </ol>
              <p className="mt-4 text-[length:var(--text-micro)] text-subtle">
                About two minutes. Without one, Ask still works on a shared key — it just gets slow
                on busy evenings.
              </p>
            </div>
          </div>
        </section>

        {/* ── your data ─────────────────────────────────────── */}
        <section className="mt-16 max-w-[62ch]">
          <h2 className="text-[length:var(--text-title)]">Your data is yours</h2>
          <p className="mt-3 text-[length:var(--text-small)] leading-relaxed text-muted">
            Notes, marks, attendance and photos are private to your account — enforced in the
            database, not just hidden in the interface. The one shared space is the class board,
            where you post as yourself.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/login?mode=up"
              className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 py-2.5 text-[length:var(--text-body)] font-medium text-[var(--accent-fg)] hover:opacity-90 focus-ring"
            >
              Create your account <ArrowRight size={16} />
            </Link>
            <p className="text-[length:var(--text-small)] text-subtle">
              Free, for Section E. Questions or bugs — post on the class board.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[1080px] px-5 pb-8 text-[length:var(--text-micro)] text-subtle">
        IILM University, Gurugram · School of Computer Science &amp; Engineering · Batch 2026–30.
        Made by Ankit Pandey, Section E.
      </footer>
    </div>
  );
}
