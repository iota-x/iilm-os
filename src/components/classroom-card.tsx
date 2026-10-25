"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { disconnectClassroom } from "@/lib/actions";
import { Button, Card } from "@/components/ui";
import { relativeDay } from "@/lib/utils";

const STATUS: Record<string, string> = {
  connected: "Connected — your coursework is on the Planner now.",
  cancelled: "Cancelled — nothing was connected.",
  expired: "That link timed out. Try connecting again.",
  "no-offline": "Google didn't grant ongoing access. Try again and allow access when asked.",
  failed: "Google didn't let that through. Try again — if it keeps failing, your college may block outside apps.",
};

/**
 * Settings: connect Google Classroom. Coursework with a due date becomes
 * planner to-dos, synced every morning and on demand.
 */
export function ClassroomCard({
  configured,
  link,
  status,
}: {
  configured: boolean;
  link: { google_email: string | null; last_synced_at: string | null; last_error: string | null; reconnect?: boolean } | null;
  status?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [armed, setArmed] = useState(false);

  return (
    <Card className="p-5" id="classroom">
      <h2 className="flex items-center gap-2 text-[length:var(--text-small)] font-semibold">
        <GraduationCap size={15} /> Google Classroom
      </h2>
      <p className="mt-1.5 max-w-prose text-[length:var(--text-small)] leading-relaxed text-muted">
        Every assignment with a due date, from every class you&rsquo;re in, lands on your Planner and Today — and ticks itself off
        once you&rsquo;ve turned it in. Dates in announcements become to-dos too, and posted PDFs and links are saved under the
        subject. Read-only: Semwise can&rsquo;t post, submit or see your grades.
      </p>
      {configured && status && STATUS[status] ? (
        <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[length:var(--text-micro)]">{STATUS[status]}</p>
      ) : null}

      {!configured ? (
        <p className="mt-3 text-[length:var(--text-micro)] text-subtle">Not switched on for this server yet.</p>
      ) : link ? (
        <div className="mt-3 space-y-2">
          <p className="text-[length:var(--text-small)]">
            Connected{link.google_email ? <> as <span className="font-medium">{link.google_email}</span></> : null}
            {link.last_synced_at ? <span className="text-subtle"> · synced {relativeDay(link.last_synced_at.slice(0, 10))}</span> : null}
          </p>
          {link.reconnect ? (
            <p className="rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-[length:var(--text-micro)]">
              Semwise can now read announcements and class materials too.{" "}
              <a href="/api/classroom/connect" className="font-medium text-[var(--accent)] underline underline-offset-2">
                Reconnect once
              </a>{" "}
              to allow it.
            </p>
          ) : null}
          {link.last_error ? (
            <p className="rounded-lg bg-[var(--bad-soft)] px-3 py-2 text-[length:var(--text-micro)] text-[var(--bad)]">Last sync failed: {link.last_error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await fetch("/api/classroom/sync", { method: "POST" });
                  const d = await res.json().catch(() => ({}));
                  if (!res.ok) toast.error(d.error ?? "Sync failed");
                  else
                    toast.success(
                      `${d.courses} class${d.courses === 1 ? "" : "es"} checked — ${d.added} new, ${d.updated} updated` +
                        (d.materials ? `, ${d.materials} material${d.materials === 1 ? "" : "s"} saved` : ""),
                    );
                  router.refresh();
                })
              }
            >
              {pending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Sync now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                if (!armed) {
                  setArmed(true);
                  setTimeout(() => setArmed(false), 4000);
                  return;
                }
                start(async () => {
                  await disconnectClassroom();
                  toast.success("Disconnected — the to-dos it added stay");
                  router.refresh();
                });
              }}
            >
              {armed ? "Sure? Disconnect" : "Disconnect"}
            </Button>
          </div>
        </div>
      ) : (
        <a
          href="/api/classroom/connect"
          className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-1.5 text-[length:var(--text-small)] font-medium text-[var(--accent-fg)] focus-ring"
        >
          Connect Google Classroom
        </a>
      )}
    </Card>
  );
}
