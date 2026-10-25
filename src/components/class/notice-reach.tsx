"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { markNoticeRead } from "@/lib/actions";
import { Card } from "@/components/ui";

/**
 * Opening a notice counts as reading it. Everyone sees how many of the class
 * have; whoever posted it (and teachers, and the admin) can see who hasn't.
 */
export function NoticeReach({
  postId,
  reach,
}: {
  postId: string;
  reach: { seen: number; total: number; unseen: string[] | null } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    markNoticeRead(postId)
      .then(() => router.refresh()) // so this visit is in the count
      .catch(() => {});
  }, [postId, router]);

  if (!reach || !reach.total) return null;
  const pct = Math.round((reach.seen / reach.total) * 100);
  const unseen = reach.unseen;

  return (
    <Card className="px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[length:var(--text-small)]">
          <Eye size={14} className="text-subtle" />
          Seen by <strong className="tabular-nums">{reach.seen}</strong> of{" "}
          <span className="tabular-nums">{reach.total}</span> in the class
        </p>
        {unseen && unseen.length ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded text-[length:var(--text-micro)] text-[var(--accent)] hover:underline focus-ring"
          >
            {open ? "Hide" : `Who hasn't (${unseen.length})`}
          </button>
        ) : null}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden>
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      </div>
      {open && unseen ? (
        <p className="mt-2 text-[length:var(--text-micro)] leading-relaxed text-muted">{unseen.join(", ")}</p>
      ) : null}
    </Card>
  );
}
