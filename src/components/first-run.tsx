"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface FirstRunStep {
  key: string;
  label: string;
  why: string;
  href: string;
  done: boolean;
}

/**
 * The five things a new account should do, ticking themselves off as they
 * happen. Gone once all five are done, or dismissed — the dismissal lives
 * in localStorage, so it costs nothing and comes back on a new device,
 * which is the right behaviour for a device you haven't set up.
 */
export function FirstRun({ steps }: { steps: FirstRunStep[] }) {
  const remaining = steps.filter((s) => !s.done).length;
  // localStorage isn't there on the server, so read it once after mount
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);
  const wasDismissed = (() => {
    try {
      return mounted && localStorage.getItem("first-run-dismissed") === "1";
    } catch {
      return false;
    }
  })();

  if (!mounted || remaining === 0 || dismissed || wasDismissed) return null;

  return (
    <Card className="border border-[var(--accent)]/30">
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div>
          <p className="font-serif text-[length:var(--text-lead)] font-semibold">
            Five things, then it runs itself
          </p>
          <p className="mt-0.5 text-[length:var(--text-small)] text-muted">
            {remaining === steps.length
              ? "None done yet — start anywhere."
              : `${steps.length - remaining} of ${steps.length} done.`}{" "}
            <Link href="/guide" className="text-[var(--accent)] hover:underline">
              Not sure what&rsquo;s where? Read the guide.
            </Link>
          </p>
        </div>
        <button
          onClick={() => {
            try {
              localStorage.setItem("first-run-dismissed", "1");
            } catch {}
            setDismissed(true);
          }}
          className="rounded p-1 text-subtle hover:text-fg focus-ring"
          aria-label="Hide this"
          title="Hide — it won't come back on this device"
        >
          <X size={15} />
        </button>
      </div>
      <ol className="mt-3 divide-y divide-[var(--border)] border-t border-line">
        {steps.map((s) => (
          <li key={s.key}>
            <Link
              href={s.href}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface-2 focus-ring",
                s.done && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                  s.done ? "border-[var(--good)] bg-[var(--good)] text-white" : "border-border-strong",
                )}
              >
                {s.done ? <Check size={12} strokeWidth={3} className="pop" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[length:var(--text-small)] font-medium", s.done && "line-through")}>
                  {s.label}
                </span>
                <span className="block text-[length:var(--text-micro)] text-muted">{s.why}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
