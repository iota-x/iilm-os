import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Command, Compass } from "lucide-react";
import { APP_MAP } from "@/lib/app-map";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Guide" };

/**
 * The whole app on one page: every screen, what it's for, when you'd open
 * it — and the loop a normal week runs on. Kept in sync with the sidebar
 * and the palette by reading the same map.
 */
export default function GuidePage() {
  return (
    <div className="mx-auto max-w-[820px] space-y-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-[length:var(--text-page)]">
          <Compass size={22} className="text-[var(--accent)]" /> Where everything is
        </h1>
        <p className="mt-1 max-w-[62ch] text-[length:var(--text-small)] leading-relaxed text-muted">
          Fourteen pages, four groups. If you only remember one thing: press{" "}
          <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd>{" "}
          (or <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">Ctrl K</kbd>)
          anywhere and type what you want — a page, a topic, a note, or an action like &ldquo;set a goal&rdquo;.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/?tour=1"
            className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--accent)] px-3 text-[length:var(--text-small)] font-medium text-[var(--accent-fg)] focus-ring"
          >
            Take the two-minute tour
          </Link>
        </div>
      </div>

      {/* ── a week in the app ───────────────────────────── */}
      <Card className="p-5">
        <p className="font-serif text-[length:var(--text-lead)] font-semibold">How a week runs</p>
        <ol className="mt-3 space-y-3 text-[length:var(--text-small)] leading-relaxed">
          {WEEK.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-3 text-[length:var(--text-micro)] font-semibold tabular-nums text-muted">
                {i + 1}
              </span>
              <span>
                <span className="font-medium text-fg">{step.title}</span>{" "}
                <span className="text-muted">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      {/* ── every page ──────────────────────────────────── */}
      {APP_MAP.map((group) => (
        <section key={group.label} className="space-y-3">
          <div>
            <h2 className="text-[length:var(--text-title)]">{group.label}</h2>
            <p className="text-[length:var(--text-small)] text-muted">{group.intro}</p>
          </div>
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {group.pages.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="group flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2 focus-ring"
                  >
                    <span className="w-24 shrink-0 pt-px text-[length:var(--text-small)] font-medium">{p.label}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[length:var(--text-small)] leading-relaxed">{p.blurb}</span>
                      <span className="mt-0.5 block text-[length:var(--text-micro)] leading-relaxed text-subtle">
                        {p.when}
                      </span>
                    </span>
                    <ArrowRight size={14} className="mt-1 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ))}

      {/* ── shortcuts ───────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-[length:var(--text-title)]">
          <Command size={16} /> Shortcuts and small things
        </h2>
        <Card className="p-5">
          <ul className="grid gap-x-8 gap-y-2 text-[length:var(--text-small)] leading-relaxed sm:grid-cols-2">
            {TIPS.map((t) => (
              <li key={t} className="flex gap-2 text-muted">
                <span className="select-none text-subtle">·</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

const WEEK = [
  {
    title: "Morning — open Today.",
    body: "Tick the classes you attended, read the one block queued up, press Start. Ten minutes on Review first if anything's due.",
  },
  {
    title: "In class — photograph the board.",
    body: "Share the photos to the app from your phone (or upload later). Each one is filed to the lecture it was taken in.",
  },
  {
    title: "Evening — place and write.",
    body: "Open the subject's Photos tab, put each photo on its topic, hit “Write this up” or ask Ask to. Mark the topic Learning.",
  },
  {
    title: "Whenever — collect.",
    body: "A link worth keeping goes in Resources or on the Class board. A question you didn't ask goes on the board too.",
  },
  {
    title: "Weekend — check the numbers.",
    body: "Exams shows where you stand per paper and your internals against the 40% bar; Attendance shows how many classes you can still miss.",
  },
  {
    title: "Before a test — drill.",
    body: "Practice the topic's question bank, move it to Revising, then Solid when you can do it cold. Review brings it back before you forget.",
  },
];

const TIPS = [
  "⌘K / Ctrl K opens search from anywhere — pages, topics, notes, resources, and actions.",
  "Enter sends in Ask; Shift+Enter makes a new line.",
  "The focus timer keeps running if you leave the page; the clock shows in the tab title.",
  "On a phone, Add to Home Screen — then “Share” from your camera roll sends photos straight in.",
  "Every task row has a quiet “skip” on hover, so a bad week doesn't become a wall.",
  "Click a topic's status to cycle Not started → Learning → Revising → Solid; confidence 1–5 sets when it comes back in Review.",
  "The subject sidebar shows units only; the topics are on the subject page.",
  "Light, dark and system themes are at the bottom of the sidebar.",
];
