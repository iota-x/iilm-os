import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── Card ──────────────────────────────────────────────────── */
export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface rounded-[var(--radius-card)] shadow-card dark:border dark:border-line dark:shadow-none",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHead({
  title,
  sub,
  right,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-5 pt-4 pb-3.5 border-b border-line",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="font-serif text-[length:var(--text-lead)] font-semibold">{title}</h2>
        {sub ? <p className="mt-1 text-[length:var(--text-small)] text-muted">{sub}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/* ─── Button ────────────────────────────────────────────────── */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "subtle" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({
  variant = "outline",
  size = "md",
  className,
  ...rest
}: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-ring disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap",
        size === "sm" && "h-7 px-2.5 text-[length:var(--text-micro)]",
        size === "md" && "h-9 px-3.5 text-[length:var(--text-small)]",
        size === "icon" && "h-8 w-8 text-[length:var(--text-small)]",
        variant === "primary" &&
          "bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90",
        variant === "outline" &&
          "border border-line bg-surface hover:bg-surface-2",
        variant === "subtle" && "bg-surface-2 hover:bg-surface-3",
        variant === "ghost" && "hover:bg-surface-2",
        variant === "danger" &&
          "text-[var(--bad)] hover:bg-[var(--bad-soft)] border border-transparent",
        className,
      )}
      {...rest}
    />
  );
}

/* ─── Badge ─────────────────────────────────────────────────── */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "good" | "warn" | "bad" | "subject";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[length:var(--text-micro)] font-medium leading-4 whitespace-nowrap",
        tone === "neutral" && "bg-surface-3 text-muted",
        tone === "accent" && "bg-[var(--accent-soft)] text-[var(--accent)]",
        tone === "good" && "bg-[var(--good-soft)] text-[var(--good)]",
        tone === "warn" && "bg-[var(--warn-soft)] text-[var(--warn)]",
        tone === "bad" && "bg-[var(--bad-soft)] text-[var(--bad)]",
        tone === "subject" && "bg-sc-soft text-sc",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ─── Progress bar ──────────────────────────────────────────── */
export function Bar({
  value,
  className,
  tone = "subject",
}: {
  value: number;
  className?: string;
  tone?: "subject" | "accent";
}) {
  return (
    <div
      className={cn("h-1.5 rounded-full bg-surface-3 overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          tone === "subject" ? "bg-sc" : "bg-[var(--accent)]",
        )}
        style={{ width: `${Math.max(value * 100, value > 0 ? 3 : 0)}%` }}
      />
    </div>
  );
}

/* ─── Progress ring ─────────────────────────────────────────── */
export function Ring({
  value,
  size = 44,
  stroke = 4,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--sc, var(--accent))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[length:var(--text-micro)] font-semibold tabular-nums">
        {label ?? `${Math.round(value * 100)}`}
      </span>
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────────── */
export function Empty({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-8">
      {icon ? <div className="text-subtle mb-3">{icon}</div> : null}
      <p className="text-[length:var(--text-small)] font-medium">{title}</p>
      {body ? (
        <p className="text-[length:var(--text-small)] text-muted mt-1 max-w-sm leading-relaxed">{body}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ─── Section heading ───────────────────────────────────────── */
export function SectionTitle({
  children,
  right,
  className,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 mb-3", className)}>
      <h2 className="font-serif text-[length:var(--text-lead)] font-semibold text-fg">
        {children}
      </h2>
      {right}
    </div>
  );
}

/* ─── Field ─────────────────────────────────────────────────── */
export const inputCls =
  "w-full h-10 rounded-[var(--radius-control)] border border-line bg-surface px-3.5 text-[length:var(--text-small)] placeholder:text-subtle focus-ring";
