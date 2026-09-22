"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { setTaskStatus } from "@/lib/actions";
import type { Subject, Task } from "@/lib/db-types";
import { Badge, Card } from "@/components/ui";
import { ACCENT_CLASS, cn, fmtDuration } from "@/lib/utils";

/**
 * The one block to do now, with a timer on it. Start counts the block's
 * minutes down (or 25 if it has none); the tab title shows the clock so
 * you can leave the page open and see it from any tab. Done ticks the task.
 * Timer state lives in localStorage, so a reload or a wander to another
 * page doesn't lose it.
 */
const KEY = "focus:timer";

interface Saved {
  taskId: string;
  total: number; // seconds
  endsAt: number | null; // epoch ms while running
  left: number; // seconds remaining while paused
}

// A tiny external store over localStorage, so the timer survives reloads
// and navigation and hydrates without an effect.
const listeners = new Set<() => void>();
let cacheRaw: string | null = null;
let cacheVal: Saved | null = null;
function read(): Saved | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheVal = raw ? (JSON.parse(raw) as Saved) : null;
    } catch {
      cacheVal = null;
    }
  }
  return cacheVal;
}
function write(v: Saved | null) {
  try {
    if (v) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((fn) => fn());
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}
const serverSnapshot = () => null;

export function Focus({
  task,
  queue,
  subject,
}: {
  task: Task | null;
  /** how many blocks are still ahead today after this one */
  queue: number;
  subject: Subject | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const total = (task?.minutes || 25) * 60;
  const stored = useSyncExternalStore(subscribe, read, serverSnapshot);
  // only this task's timer counts; a stale one for another block is ignored
  const saved = stored && task && stored.taskId === task.id ? stored : null;
  const [now, setNow] = useState(() => Date.now());
  const titleRef = useRef<string>("");

  const running = Boolean(saved?.endsAt);
  const left = saved
    ? saved.endsAt
      ? Math.max(0, Math.round((saved.endsAt - now) / 1000))
      : saved.left
    : total;
  const finished = saved !== null && left === 0;
  const progress = saved ? 1 - left / saved.total : 0;

  // tick while running; mirror the clock into the tab title; stop at zero
  useEffect(() => {
    if (!running) return;
    if (!titleRef.current) titleRef.current = document.title;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const cur = read();
      if (cur?.endsAt && cur.endsAt - t <= 0) {
        write({ ...cur, endsAt: null, left: 0 });
        toast.success("Time's up — mark it done or take five more.");
      }
    }, 500);
    return () => {
      clearInterval(id);
      if (titleRef.current) {
        document.title = titleRef.current;
        titleRef.current = "";
      }
    };
  }, [running]);
  useEffect(() => {
    if (running) document.title = `${clock(left)} · ${task?.title ?? "Focus"}`;
  }, [left, running, task?.title]);

  function update(v: Saved | null) {
    write(v);
  }
  function begin() {
    if (!task) return;
    update({ taskId: task.id, total, endsAt: Date.now() + left * 1000, left });
    setNow(Date.now());
  }
  function extend() {
    if (!task) return;
    update({ taskId: task.id, total: 300, endsAt: Date.now() + 300_000, left: 300 });
    setNow(Date.now());
  }
  function pause() {
    if (!saved) return;
    update({ ...saved, endsAt: null, left });
  }
  function reset() {
    update(null);
  }
  function done() {
    if (!task) return;
    start(async () => {
      await setTaskStatus(task.id, "done");
      update(null);
      toast.success(`Done — ${fmtDuration(task.minutes || 25)} banked.`);
      router.refresh();
    });
  }
  function skip() {
    if (!task) return;
    start(async () => {
      await setTaskStatus(task.id, "skipped");
      update(null);
      router.refresh();
    });
  }

  if (!task) {
    return (
      <Card className="p-5">
        <p className="text-[length:var(--text-small)] font-medium">Nothing queued for now</p>
        <p className="mt-1 text-[length:var(--text-small)] text-muted">
          Every block for today is done or nothing was planned.{" "}
          <Link href="/goals" className="text-[var(--accent)] hover:underline">
            Set a goal
          </Link>{" "}
          and tomorrow&rsquo;s share lands here.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden p-5", subject ? ACCENT_CLASS[subject.color] : "")}>
      {/* progress wash along the bottom edge */}
      <div
        className="absolute inset-x-0 bottom-0 h-1 bg-surface-3"
        aria-hidden
      >
        <div
          className="h-full bg-sc transition-[width] duration-500"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[length:var(--text-micro)] font-medium uppercase tracking-wide text-subtle">
            {running ? "Focusing" : finished ? "Time's up" : "Up next"}
          </p>
          <p className="mt-1 font-serif text-[length:var(--text-lead)] font-semibold leading-tight">{task.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {subject ? (
              <Link href={`/subjects/${subject.slug}`}>
                <Badge tone="subject">{subject.short_name}</Badge>
              </Link>
            ) : null}
            <span className="text-[length:var(--text-micro)] text-subtle">
              {fmtDuration(task.minutes || 25)}
              {queue ? ` · ${queue} more after this` : " · last one today"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-serif text-[2rem] font-semibold tabular-nums leading-none tracking-tight",
              finished && "text-sc",
            )}
            aria-live="off"
          >
            {clock(left)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!running ? (
          <button
            onClick={finished ? extend : begin}
            disabled={pending}
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] bg-sc px-3.5 text-[length:var(--text-small)] font-medium text-white focus-ring disabled:opacity-50"
          >
            <Play size={14} /> {finished ? "5 more minutes" : saved ? "Resume" : "Start"}
          </button>
        ) : (
          <button
            onClick={pause}
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] border border-line bg-surface-2 px-3.5 text-[length:var(--text-small)] font-medium hover:bg-surface-3 focus-ring"
          >
            <Pause size={14} /> Pause
          </button>
        )}
        <button
          onClick={done}
          disabled={pending}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] border px-3.5 text-[length:var(--text-small)] font-medium focus-ring",
            finished
              ? "border-sc bg-sc text-white"
              : "border-line bg-surface-2 hover:bg-surface-3",
          )}
        >
          <Check size={14} /> Done
        </button>
        {saved ? (
          <button
            onClick={reset}
            aria-label="Reset timer"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] text-subtle hover:text-fg focus-ring"
          >
            <RotateCcw size={14} />
          </button>
        ) : null}
        <button
          onClick={skip}
          disabled={pending}
          className="ml-auto inline-flex h-9 items-center gap-1 rounded-[var(--radius-control)] px-2 text-[length:var(--text-micro)] text-subtle hover:text-fg focus-ring"
        >
          Skip <SkipForward size={12} />
        </button>
      </div>
    </Card>
  );
}

function clock(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
