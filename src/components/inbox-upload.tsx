"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { deleteAttachment, recordAttachment, setAttachmentCaption } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import type { Attachment, Subject } from "@/lib/db-types";
import { Button, inputCls } from "@/components/ui";
import { cn, fmtDate } from "@/lib/utils";

const MAX_BYTES = 25 * 1024 * 1024; // the vault bucket's limit

function prettySize(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function InboxUpload({
  files,
  subjects,
}: {
  files: Attachment[];
  subjects: Subject[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [pending, start] = useTransition();

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
    for (const file of chosen) {
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is over 25 MB`);
        continue;
      }
      setBusy(file.name);
      try {
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
          subject_id: subjectId || null,
        });
        done++;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Couldn't upload ${file.name}`);
      }
    }
    setBusy(null);
    if (done) {
      toast.success(`${done} file${done === 1 ? "" : "s"} added`);
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

  return (
    <div className="space-y-4">
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
          "rounded-[14px] border border-dashed p-6 text-center transition-colors",
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
          {busy ? `Uploading ${busy}…` : "Drop photos of the board, notes or PDFs here"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-[length:var(--text-micro)] leading-relaxed text-muted">
          Photograph the whiteboard on your phone and add it straight from here. Images and PDFs,
          up to 25 MB each.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={!!busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            Choose files
          </Button>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={cn(inputCls, "h-8 w-auto text-[length:var(--text-micro)]")}
            aria-label="Tag these with a subject"
          >
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.short_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* what's in there */}
      {files.length ? (
        <ul className={cn("grid gap-3 sm:grid-cols-2", pending && "opacity-70")}>
          {files.map((f) => {
            const url = `/api/vault/${f.storage_path}`;
            const isImage = (f.mime ?? "").startsWith("image/");
            const subject = subjects.find((s) => s.id === f.subject_id);
            return (
              <li
                key={f.id}
                className="group overflow-hidden rounded-[14px] border border-line bg-surface"
              >
                <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={f.filename ?? "upload"}
                      loading="lazy"
                      className="h-40 w-full bg-surface-2 object-cover"
                    />
                  ) : (
                    <div className="grid h-40 w-full place-items-center bg-surface-2 text-subtle">
                      <FileText size={26} strokeWidth={1.5} />
                    </div>
                  )}
                </a>

                <div className="p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-[length:var(--text-micro)]" title={f.filename ?? ""}>
                      {f.filename ?? "file"}
                    </span>
                    <a
                      href={url}
                      download={f.filename ?? undefined}
                      className="shrink-0 rounded p-1 text-subtle hover:text-fg focus-ring"
                      aria-label="Download"
                      title="Download"
                    >
                      <Download size={13} />
                    </a>
                    <button
                      onClick={() => run(() => deleteAttachment(f.id))}
                      className="shrink-0 rounded p-1 text-subtle opacity-0 transition-opacity hover:text-[var(--bad)] focus-ring group-hover:opacity-100"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="mt-0.5 text-[length:var(--text-micro)] text-subtle">
                    {[subject?.short_name, prettySize(f.size_bytes), fmtDate(f.created_at)]
                      .filter(Boolean)
                      .join("\u2002\u2002")}
                  </p>

                  <input
                    defaultValue={f.caption ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (f.caption ?? "")) {
                        run(() => setAttachmentCaption(f.id, e.target.value));
                      }
                    }}
                    placeholder="What is this? e.g. LMVT board work"
                    className={cn(inputCls, "mt-1.5 h-7 text-[length:var(--text-micro)]")}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-6 text-center text-[length:var(--text-small)] text-muted">
          Nothing here yet. Whatever you add shows up for Claude to work from.
        </p>
      )}
    </div>
  );
}
