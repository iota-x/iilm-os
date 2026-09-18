"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAttachment,
  recordAttachment,
  setAttachmentCaption,
  setAttachmentPlace,
} from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { exifDate, filenameDate, matchSession } from "@/lib/capture";
import type { Attachment, Slot, Subject } from "@/lib/db-types";
import { Button, inputCls } from "@/components/ui";
import { ACCENT_CLASS, cn, fmtTime } from "@/lib/utils";

const MAX_BYTES = 25 * 1024 * 1024; // the vault bucket's limit
const EXIF_WINDOW = 256 * 1024; // EXIF sits in the first few KB; this is generous

function prettySize(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** When a file was captured: EXIF, then the filename, then the file's own clock. */
async function capturedAt(file: File): Promise<Date> {
  if (/^image\/jpe?g$/.test(file.type)) {
    const head = new Uint8Array(await file.slice(0, EXIF_WINDOW).arrayBuffer());
    const ex = exifDate(head);
    if (ex) return ex;
  }
  return filenameDate(file.name) ?? new Date(file.lastModified);
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}
function fmtDay(key: string) {
  return new Date(key + "T00:00:00+05:30").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  });
}

export function InboxUpload({
  files,
  subjects,
  slots,
  labGroup,
}: {
  files: Attachment[];
  subjects: Subject[];
  slots: Slot[];
  labGroup: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [override, setOverride] = useState(""); // force a subject on everything uploaded now
  const [pending, start] = useTransition();

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const slotById = new Map(slots.map((s) => [s.id, s]));

  async function uploadAll(list: FileList | File[]) {
    const chosen = Array.from(list);
    if (!chosen.length) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not signed in");
      return;
    }

    let done = 0;
    let filed = 0;
    for (const file of chosen) {
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is over 25 MB`);
        continue;
      }
      setBusy(file.name);
      try {
        const at = await capturedAt(file);
        const match = matchSession(at, slots, labGroup);
        const subjectId = override || match.slot?.subject_id || null;
        if (subjectId) filed++;

        const ext = file.name.split(".").pop() || "bin";
        const key = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("vault")
          .upload(key, file, { contentType: file.type, upsert: false });
        if (error) throw error;

        await recordAttachment({
          storage_path: key,
          filename: file.name,
          mime: file.type,
          size_bytes: file.size,
          note_id: null,
          subject_id: subjectId,
          taken_at: at.toISOString(),
          slot_id: override ? null : (match.slot?.id ?? null),
        });
        done++;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Couldn't upload ${file.name}`);
      }
    }
    setBusy(null);
    if (done) {
      const left = done - filed;
      toast.success(
        left === 0
          ? `${done} added, all filed to their class`
          : `${done} added — ${left} still need${left === 1 ? "s" : ""} a subject`,
      );
      router.refresh();
    }
  }

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "That didn't work");
      }
    });
  }

  // Group by the day the photo was taken, newest day first.
  const days = new Map<string, Attachment[]>();
  for (const f of files) {
    const k = dayKey(f.taken_at ?? f.created_at);
    days.set(k, [...(days.get(k) ?? []), f]);
  }

  return (
    <div className="space-y-5">
      {/* drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void uploadAll(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-[var(--radius-panel)] border border-dashed p-6 text-center transition-colors",
          dragging ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-line bg-surface",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadAll(e.target.files);
            e.target.value = "";
          }}
        />

        <Upload size={20} className="mx-auto text-subtle" />
        <p className="mt-2 text-[length:var(--text-small)] font-medium">
          {busy ? `Uploading ${busy}…` : "Add the day's photos"}
        </p>
        <p className="mx-auto mt-1 max-w-md text-[length:var(--text-micro)] leading-relaxed text-muted">
          Each photo is filed by when it was taken — a board photographed at Wednesday 11:40 goes
          to that lecture, nothing to sort. Pick a subject only for photos taken outside class,
          like notes you wrote up later.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={!!busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            Choose photos
          </Button>
          <select
            value={override}
            onChange={(e) => setOverride(e.target.value)}
            className={cn(inputCls, "h-8 w-auto text-[length:var(--text-micro)]")}
            aria-label="Force a subject on this upload"
          >
            <option value="">File by time taken</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                All to {s.short_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* the inbox, by day */}
      {days.size ? (
        [...days.entries()].map(([key, items]) => (
          <section key={key} className={cn("space-y-2", pending && "opacity-70")}>
            <h2 className="text-[length:var(--text-lead)]">{fmtDay(key)}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((f) => {
                const url = `/api/vault/${f.storage_path}`;
                const isImage = (f.mime ?? "").startsWith("image/");
                const subject = f.subject_id ? subjectById.get(f.subject_id) : null;
                const slot = f.slot_id ? slotById.get(f.slot_id) : null;
                const at = f.taken_at ? new Date(f.taken_at) : null;
                // A photo with no class yet: that day's classes as one-tap chips.
                const chips =
                  !subject && at
                    ? matchSession(at, slots, labGroup).candidates.filter(
                        (c, i, arr) => arr.findIndex((x) => x.subject_id === c.subject_id) === i,
                      )
                    : [];

                return (
                  <li
                    key={f.id}
                    className={cn(
                      "group overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface",
                      subject ? ACCENT_CLASS[subject.color] : "",
                    )}
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={f.filename ?? "upload"}
                          loading="lazy"
                          className="h-44 w-full bg-surface-2 object-cover"
                        />
                      ) : (
                        <div className="grid h-44 w-full place-items-center bg-surface-2 text-subtle">
                          <FileText size={26} strokeWidth={1.5} />
                        </div>
                      )}
                    </a>

                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {subject ? (
                            <p className="text-[length:var(--text-small)] font-medium text-sc">
                              {subject.short_name}
                              {slot ? (
                                <span className="font-normal text-muted">
                                  {" "}
                                  · {slot.kind} {fmtTime(slot.start_time)}
                                </span>
                              ) : null}
                            </p>
                          ) : chips.length ? (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="mr-0.5 text-[length:var(--text-micro)] text-muted">
                                Which class?
                              </span>
                              {chips.map((c) => {
                                const cs = c.subject_id ? subjectById.get(c.subject_id) : null;
                                if (!cs) return null;
                                return (
                                  <button
                                    key={c.id}
                                    onClick={() =>
                                      run(() =>
                                        setAttachmentPlace(f.id, { subject_id: cs.id, slot_id: c.id }),
                                      )
                                    }
                                    className={cn(
                                      "rounded-md bg-sc-soft px-1.5 py-0.5 text-[length:var(--text-micro)] font-medium text-sc transition-shadow hover:ring-1 hover:ring-sc focus-ring",
                                      ACCENT_CLASS[cs.color],
                                    )}
                                  >
                                    {cs.short_name}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <select
                              value=""
                              onChange={(e) =>
                                e.target.value &&
                                run(() => setAttachmentPlace(f.id, { subject_id: e.target.value }))
                              }
                              className={cn(inputCls, "h-7 w-auto text-[length:var(--text-micro)]")}
                              aria-label="Subject"
                            >
                              <option value="">Which subject?</option>
                              {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.short_name}
                                </option>
                              ))}
                            </select>
                          )}
                          <p className="mt-0.5 truncate text-[length:var(--text-micro)] text-subtle">
                            {[
                              at
                                ? at.toLocaleTimeString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "Asia/Kolkata",
                                  })
                                : null,
                              prettySize(f.size_bytes),
                              f.filename,
                            ]
                              .filter(Boolean)
                              .join("  ")}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center">
                          <a
                            href={url}
                            download={f.filename ?? undefined}
                            className="rounded p-1 text-subtle hover:text-fg focus-ring"
                            aria-label="Download"
                            title="Download"
                          >
                            <Download size={13} />
                          </a>
                          <button
                            onClick={() => run(() => deleteAttachment(f.id))}
                            className="rounded p-1 text-subtle opacity-0 transition-opacity hover:text-[var(--bad)] focus-ring group-hover:opacity-100"
                            aria-label="Delete"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <input
                        defaultValue={f.caption ?? ""}
                        onBlur={(e) => {
                          if (e.target.value !== (f.caption ?? "")) {
                            run(() => setAttachmentCaption(f.id, e.target.value));
                          }
                        }}
                        placeholder="What's on it? Optional."
                        className={cn(inputCls, "mt-2 h-7 text-[length:var(--text-micro)]")}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      ) : (
        <p className="py-6 text-center text-[length:var(--text-small)] text-muted">
          Nothing here yet. Whatever you add shows up for Claude to work from.
        </p>
      )}
    </div>
  );
}
