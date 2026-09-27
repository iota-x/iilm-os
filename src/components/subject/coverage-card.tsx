import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import type { Coverage } from "@/data/coverage";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Where this topic is in the notes you've been handed, and — loudly — what
 * those notes leave out.
 */
export function CoverageCard({ coverage }: { coverage: Coverage }) {
  const alert = coverage.status !== "covered";
  return (
    <Card className={cn(alert && "border-[var(--warn)]/35", coverage.status === "missing" && "border-[var(--bad)]/40")}>
      {alert ? (
        <div className="flex gap-3 border-b border-line px-4 py-3">
          <AlertTriangle
            size={16}
            className={cn(
              "mt-0.5 shrink-0",
              coverage.status === "missing" ? "text-[var(--bad)]" : "text-[var(--warn)]",
            )}
          />
          <div className="min-w-0">
            <p className="text-[length:var(--text-small)] font-semibold">
              {coverage.status === "missing" ? "Not in your notes" : "Your notes are missing part of this"}
            </p>
            {coverage.missing ? (
              <p className="mt-1 text-[length:var(--text-small)] leading-relaxed text-muted">{coverage.missing}</p>
            ) : null}
            {coverage.learnFrom ? (
              <p className="mt-1 text-[length:var(--text-small)] leading-relaxed text-muted">
                <span className="font-medium text-fg">Learn it from: </span>
                {coverage.learnFrom}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      {coverage.sources.length ? (
        <div className="px-4 py-3">
          <p className="flex items-center gap-1.5 text-[length:var(--text-small)] font-semibold">
            {alert ? (
              <FileText size={14} className="text-subtle" />
            ) : (
              <CheckCircle2 size={14} className="text-[var(--good)]" />
            )}
            In your notes
          </p>
          <ul className="mt-1.5 space-y-1">
            {coverage.sources.map((s, i) => (
              <li key={i} className="flex gap-2 text-[length:var(--text-small)] leading-relaxed text-muted">
                <span className="select-none text-subtle">·</span>
                <span>
                  <span className="font-medium text-fg">{s.file}</span>{" "}
                  <span className="tabular-nums">{s.where}</span>
                  {s.what ? <span> — {s.what}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
