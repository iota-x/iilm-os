import { BadgeCheck, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Brownie points next to a name: one for every Helpful someone else gave
 * their posts, replies and papers, three per accepted answer. Nothing at 0.
 */
export function Points({ n, className }: { n: number | undefined; className?: string }) {
  if (!n) return null;
  return (
    <span
      title={`${n} brownie point${n === 1 ? "" : "s"} — Helpful votes from classmates, and accepted answers`}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-[var(--warn-soft)] px-1.5 py-px text-[10px] font-semibold leading-4 tabular-nums text-[var(--warn)]",
        className,
      )}
    >
      <Cookie size={10} aria-hidden /> {n}
    </span>
  );
}

/** A teacher's tick on a post or a paper. */
export function Verified({ by, className }: { by: string | null | undefined; className?: string }) {
  if (!by) return null;
  return (
    <span
      title={`Verified by ${by}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[var(--good-soft)] px-1.5 py-px text-[10px] font-semibold leading-4 text-[var(--good)]",
        className,
      )}
    >
      <BadgeCheck size={11} aria-hidden /> Teacher-verified
    </span>
  );
}

/** Next to a teacher's name on the board. */
export function TeacherTag({ show }: { show: boolean | undefined }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--accent-soft)] px-1.5 py-px text-[10px] font-semibold leading-4 text-[var(--accent)]">
      Teacher
    </span>
  );
}
