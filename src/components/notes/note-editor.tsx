"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Eye,
  ImagePlus,
  Loader2,
  Pencil,
  Pin,
  PinOff,
  Sigma,
  Trash2,
  Columns2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateNote, deleteNote, recordAttachment } from "@/lib/actions";
import type { Note, Subject, Topic } from "@/lib/db-types";
import { Markdown } from "@/components/markdown";
import { Button, inputCls } from "@/components/ui";
import { cn } from "@/lib/utils";

type View = "write" | "split" | "read";

export function NoteEditor({
  note,
  subjects,
  topics,
  onChanged,
  onDeleted,
}: {
  note: Note;
  subjects: Subject[];
  topics: Topic[];
  onChanged: (n: Note) => void;
  onDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [subjectId, setSubjectId] = useState(note.subject_id ?? "");
  const [topicId, setTopicId] = useState(note.topic_id ?? "");
  const [pinned, setPinned] = useState(note.pinned);
  const [view, setView] = useState<View>("split");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // No reset effect needed: the parent renders this with key={note.id},
  // so opening a different note remounts the component with fresh state.

  const save = useCallback(
    async (patch: Partial<Note>) => {
      setSaving(true);
      try {
        await updateNote(note.id, patch);
        onChanged({ ...note, ...patch, updated_at: new Date().toISOString() } as Note);
        setDirty(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [note, onChanged],
  );

  // debounced autosave
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      save({ title, content });
    }, 900);
    return () => clearTimeout(t);
  }, [title, content, dirty, save]);

  // ⌘S / Ctrl+S
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save({ title, content });
        toast.success("Saved");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [title, content, save]);

  function insertAtCursor(text: string) {
    const ta = taRef.current;
    if (!ta) {
      setContent((c) => c + text);
      setDirty(true);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + text.length;
    });
  }

  const uploadImage = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not signed in");

        const ext = file.name.split(".").pop() || "png";
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
          note_id: note.id,
          subject_id: subjectId || null,
        });

        insertAtCursor(`\n\n![${file.name}](/api/vault/${key})\n\n`);
        toast.success("Screenshot added");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note.id, subjectId, content],
  );

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;
    e.preventDefault();
    uploadImage(file);
  }

  function onDrop(e: React.DragEvent) {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    e.preventDefault();
    uploadImage(file);
  }

  const subjectTopics = topics.filter((t) => t.subject_id === subjectId);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-line">
        <div className="flex gap-0.5 bg-surface-2 rounded-lg p-0.5 border border-line">
          {(
            [
              ["write", Pencil, "Write"],
              ["split", Columns2, "Split"],
              ["read", Eye, "Read"],
            ] as const
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={label}
              aria-label={label}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-[7px] transition-colors focus-ring",
                view === v ? "bg-surface shadow-card" : "text-subtle hover:text-fg",
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          title="Insert screenshot"
          aria-label="Insert screenshot"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
            e.target.value = "";
          }}
        />

        <Button
          variant="ghost"
          size="icon"
          title="Insert math block"
          aria-label="Insert math block"
          onClick={() => insertAtCursor("\n$$\n\n$$\n")}
        >
          <Sigma size={14} />
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11.5px] text-subtle tabular-nums">
            {saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            title={pinned ? "Unpin" : "Pin"}
            aria-label={pinned ? "Unpin" : "Pin"}
            onClick={() => {
              setPinned(!pinned);
              save({ pinned: !pinned });
            }}
          >
            {pinned ? <Pin size={14} className="text-[var(--accent)]" /> : <PinOff size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete note"
            aria-label="Delete note"
            onClick={async () => {
              if (!confirm("Delete this note? This can't be undone.")) return;
              await deleteNote(note.id);
              onDeleted(note.id);
              toast.success("Note deleted");
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* meta */}
      <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-line">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          placeholder="Note title"
          className="flex-1 min-w-[180px] bg-transparent text-[15px] font-semibold tracking-tight outline-none placeholder:text-subtle placeholder:font-normal"
        />
        <select
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId("");
            save({ subject_id: e.target.value || null, topic_id: null });
          }}
          className={`${inputCls} h-7 w-auto text-[12px] py-0`}
        >
          <option value="">No subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.short_name}
            </option>
          ))}
        </select>
        {subjectTopics.length ? (
          <select
            value={topicId}
            onChange={(e) => {
              setTopicId(e.target.value);
              save({ topic_id: e.target.value || null });
            }}
            className={`${inputCls} h-7 w-auto max-w-[220px] text-[12px] py-0`}
          >
            <option value="">No topic</option>
            {subjectTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.session ? `${t.session} · ` : ""}
                {t.title.slice(0, 48)}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {/* body */}
      <div
        className={cn(
          "flex-1 min-h-0 grid",
          view === "split" ? "md:grid-cols-2" : "grid-cols-1",
        )}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {view !== "read" ? (
          <textarea
            ref={taRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            onPaste={onPaste}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="editor w-full h-full min-h-[420px] resize-none bg-transparent px-4 py-3.5 outline-none placeholder:text-subtle border-r border-line"
          />
        ) : null}
        {view !== "write" ? (
          <div className="overflow-y-auto px-4 py-3.5">
            {content.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-[12.5px] text-subtle">Nothing to preview yet.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const PLACEHOLDER = `Markdown works. So does math:

Inline $f'(c) = 0$, or a block:

$$
\\lim_{(x,y)\\to(0,0)} \\frac{x^2 y}{x^4 + y^2}
$$

Paste a screenshot straight into this box and it uploads.
⌘S saves. Autosave runs anyway.`;
