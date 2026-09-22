"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Inbox,
  LayoutDashboard,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useUrlFlag } from "@/lib/client-hooks";
import { cn } from "@/lib/utils";

/**
 * Six cards, once. Opens on a new account's first visit to Today, or from
 * ?tour=1 (the Guide page and the palette link there). Seen-state is per
 * device, which is right: a new phone deserves the tour again.
 */
const KEY = "tour:seen";

const STEPS = [
  {
    icon: LayoutDashboard,
    title: "Today is the only page you need each morning",
    body: "The block to do now sits at the top with a timer. Tick the classes you attended on the right. The four numbers above tell you how far mid-sems are, how much syllabus you've started, what's done today and what's due for review.",
    href: "/",
    cta: "Today",
  },
  {
    icon: BookOpen,
    title: "Subjects hold the syllabus — and your progress on it",
    body: "Every course from its real course plan, as units and topics. Click a topic's status to move it Not started → Learning → Revising → Solid. Each subject also has a strategy for the exam, ranked resources, your notes, your photos, marks and the lab.",
    href: "/subjects",
    cta: "Subjects",
  },
  {
    icon: Inbox,
    title: "Photos file themselves",
    body: "Photograph the board in class. Share it to the app from your phone (add it to your home screen first) or upload later — the time it was taken says which lecture it was. Then one tap puts it on a topic, and “Write this up” turns it into a note.",
    href: "/inbox",
    cta: "Inbox",
  },
  {
    icon: Sparkles,
    title: "Ask knows your syllabus",
    body: "It can read a board photo, write the note, add checkpoints to a topic, put questions in the bank, or just tell you what to study tonight. It runs on your own free Gemini key — two minutes in Settings.",
    href: "/ask",
    cta: "Ask",
  },
  {
    icon: Users,
    title: "Class is the section's board",
    body: "Questions you didn't want to ask out loud, links worth sharing, notices. Reply, mark helpful, accept an answer. Everyone in Section E with an account sees it.",
    href: "/class",
    cta: "Class",
  },
  {
    icon: Search,
    title: "Lost? Press ⌘K",
    body: "Search finds pages, topics, notes, resources and actions like “set a goal”. The Guide page (bottom of the sidebar) lists every screen with what it's for and when to use it.",
    href: "/guide",
    cta: "Guide",
  },
];

function seen(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}
const noop = () => () => {};

export function Tour({ isNew }: { isNew: boolean }) {
  const router = useRouter();
  const forced = useUrlFlag("tour");
  const wasSeen = useSyncExternalStore(noop, seen, () => true);
  const [closed, setClosed] = useState(false);
  const [i, setI] = useState(0);

  const open = !closed && (forced || (isNew && !wasSeen));
  if (!open) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setClosed(true);
  }
  function finish() {
    dismiss();
    if (forced) router.replace("/");
  }

  const step = STEPS[i];
  const Icon = step.icon;
  const last = i === STEPS.length - 1;

  // portal: the page body animates with a transform, which would pin a
  // fixed overlay to the main column instead of the viewport
  return createPortal(
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      onClick={finish}
    >
      <div
        className="scale-in w-full max-w-[460px] rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/12 text-[var(--accent)]">
            <Icon size={20} />
          </span>
          <button
            onClick={finish}
            aria-label="Close tour"
            className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg focus-ring"
          >
            <X size={15} />
          </button>
        </div>
        <p id="tour-title" className="mt-4 font-serif text-[length:var(--text-lead)] font-semibold leading-tight">
          {step.title}
        </p>
        <p className="mt-2 text-[length:var(--text-small)] leading-relaxed text-muted">{step.body}</p>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden>
          {STEPS.map((_, k) => (
            <span
              key={k}
              className={cn(
                "h-1.5 rounded-full transition-all",
                k === i ? "w-6 bg-[var(--accent)]" : "w-1.5 bg-surface-3",
              )}
            />
          ))}
          <span className="ml-auto text-[length:var(--text-micro)] tabular-nums text-subtle">
            {i + 1} / {STEPS.length}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setI((k) => Math.max(0, k - 1))}
            disabled={i === 0}
            className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-control)] px-2.5 text-[length:var(--text-small)] text-muted hover:text-fg focus-ring disabled:opacity-30"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <Link
            href={step.href}
            onClick={dismiss}
            className="inline-flex h-9 items-center rounded-[var(--radius-control)] border border-line bg-surface-2 px-3 text-[length:var(--text-small)] font-medium hover:bg-surface-3 focus-ring"
          >
            Open {step.cta}
          </Link>
          <button
            onClick={last ? finish : () => setI((k) => k + 1)}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--accent)] px-3.5 text-[length:var(--text-small)] font-medium text-[var(--accent-fg)] focus-ring"
          >
            {last ? "Done" : "Next"} {last ? null : <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
