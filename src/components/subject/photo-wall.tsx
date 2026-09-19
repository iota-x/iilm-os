"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setAttachmentPlace, writeUpPhoto } from "@/lib/actions";
import { NotebookPen } from "lucide-react";
import type { Attachment, Slot, Topic } from "@/lib/db-types";
import { chipCls } from "@/components/ui";
import { cn, fmtTime } from "@/lib/utils";

/**
 * A subject's board photos, one row per lecture, newest first. Each photo
 * can be put on a topic here — that is what turns a photo into study
 * material the topic page can show.
 */
export function PhotoWall({
  files,
  slots,
  topics,
}: {
  files: Attachment[];
  slots: Slot[];
  topics: Topic[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const slotById = new Map(slots.map((s) => [s.id, s]));

  // group by (day, slot) — the lecture the photos came from
  const groups = new Map<string, { label: string; items: Attachment[] }>();
  for (const f of files) {
    const day = (f.taken_at ?? f.created_at).slice(0, 10);
    const slot = f.slot_id ? slotById.get(f.slot_id) : null;
    const key = `${day}|${slot?.id ?? "-"}`;
    const date = new Date(day + "T00:00:00+05:30").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    });
    const label = slot ? `${date} — ${slot.kind} ${fmtTime(slot.start_time)}` : date;
    const g = groups.get(key) ?? { label, items: [] };
    g.items.push(f);
    groups.set(key, g);
  }

  function place(id: string, topicId: string | null) {
    start(async () => {
      try {
        await setAttachmentPlace(id, { topic_id: topicId });
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't place that");
      }
    });
  }

  return (
    <div className={cn("space-y-6", pending && "opacity-70")}>
      {[...groups.values()].map((g) => (
        <section key={g.label} className="space-y-2">
          <h3 className="text-[length:var(--text-lead)]">{g.label}</h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((f) => {
              const url = `/api/vault/${f.storage_path}`;
              const topic = f.topic_id ? topics.find((t) => t.id === f.topic_id) : null;
              const at = f.taken_at ? new Date(f.taken_at) : null;
              return (
                <li
                  key={f.id}
                  className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface"
                >
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={f.caption ?? f.filename ?? "board"}
                      loading="lazy"
                      className="aspect-[4/3] w-full bg-surface-2 object-cover"
                    />
                  </a>
                  <div className="space-y-1.5 p-2.5">
                    <p className="text-[length:var(--text-micro)] text-subtle">
                      {at
                        ? at.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Kolkata",
                          })
                        : null}
                      {f.caption ? <span className="text-muted"> — {f.caption}</span> : null}
                    </p>
                    <button
                      onClick={() =>
                        start(async () => {
                          try {
                            const id = await writeUpPhoto(f.id);
                            router.push(`/notes?open=${id}`);
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Couldn't create the note");
                          }
                        })
                      }
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-line bg-surface-2 px-2 py-1 text-[length:var(--text-micro)] font-medium hover:bg-surface-3 focus-ring"
                    >
                      <NotebookPen size={12} /> Write this up
                    </button>
                    <select
                      value={f.topic_id ?? ""}
                      onChange={(e) => place(f.id, e.target.value || null)}
                      className={cn(chipCls, "w-full max-w-full truncate", topic && "text-fg")}
                      aria-label="Topic this photo belongs to"
                    >
                      <option value="">Not on a topic yet</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.session ? `${t.session} · ` : ""}
                          {t.title.slice(0, 60)}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
