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
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { createClient } from "@/lib/supabase/client";
import { updateNote, deleteNote, recordAttachment } from "@/lib/actions";
import type { Note, Subject, Topic } from "@/lib/db-types";
import { Markdown } from "@/components/markdown";
import { Button, chipCls } from "@/components/ui";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Minus,
  Bold,
  Italic,
  Link2,
  Table as TableIcon,
  FunctionSquare,
  Braces,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type View = "write" | "split" | "read";

/** Notion-style "/" commands. `sel` (when given) is a [start,end] range within
 *  the snippet to select as a placeholder; otherwise the caret goes to `caret`. */
type SlashCmd = {
  label: string;
  hint: string;
  keys: string;
  icon: typeof Heading1;
  snippet: string;
  caret: number;
  sel?: [number, number];
};

const SLASH: SlashCmd[] = [
  { label: "Heading 1", hint: "Big section title", keys: "h1 heading title", icon: Heading1, snippet: "# ", caret: 2 },
  { label: "Heading 2", hint: "Medium heading", keys: "h2 heading subtitle", icon: Heading2, snippet: "## ", caret: 3 },
  { label: "Heading 3", hint: "Small heading", keys: "h3 heading", icon: Heading3, snippet: "### ", caret: 4 },
  { label: "Bullet list", hint: "A simple bullet", keys: "bullet ul list unordered point", icon: List, snippet: "- ", caret: 2 },
  { label: "Numbered list", hint: "Ordered list", keys: "number ol ordered list", icon: ListOrdered, snippet: "1. ", caret: 3 },
  { label: "Checklist", hint: "To-do checkbox", keys: "todo check task box", icon: ListChecks, snippet: "- [ ] ", caret: 6 },
  { label: "Quote", hint: "Block quote", keys: "quote blockquote", icon: Quote, snippet: "> ", caret: 2 },
  { label: "Code block", hint: "Fenced code", keys: "code block fenced pre", icon: Code2, snippet: "```\n\n```", caret: 4 },
  { label: "Inline code", hint: "Monospace text", keys: "code inline mono", icon: Braces, snippet: "`code`", caret: 1, sel: [1, 5] },
  { label: "Bold", hint: "Bold text", keys: "bold strong", icon: Bold, snippet: "**bold**", caret: 2, sel: [2, 6] },
  { label: "Italic", hint: "Italic text", keys: "italic emphasis", icon: Italic, snippet: "*italic*", caret: 1, sel: [1, 7] },
  { label: "Link", hint: "Hyperlink", keys: "link url href", icon: Link2, snippet: "[text](url)", caret: 1, sel: [1, 5] },
  { label: "Divider", hint: "Horizontal line", keys: "divider hr line rule separator", icon: Minus, snippet: "---\n", caret: 4 },
  { label: "Table", hint: "2-column table", keys: "table grid", icon: TableIcon, snippet: "| Column | Column |\n| --- | --- |\n| Cell | Cell |\n", caret: 2, sel: [2, 8] },
  { label: "Math block", hint: "LaTeX equation", keys: "math latex equation formula", icon: FunctionSquare, snippet: "$$\n\n$$", caret: 3 },
];

/** Caret pixel position inside a textarea, via a mirror element. */
function caretXY(ta: HTMLTextAreaElement, pos: number): { top: number; left: number; height: number } {
  const div = document.createElement("div");
  const cs = getComputedStyle(ta);
  for (const p of [
    "boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
    "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "wordSpacing", "tabSize",
  ] as const) {
    (div.style as unknown as Record<string, string>)[p] = cs[p as keyof CSSStyleDeclaration] as string;
  }
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";
  div.style.overflow = "hidden";
  div.textContent = ta.value.slice(0, pos);
  const span = document.createElement("span");
  span.textContent = ta.value.slice(pos) || ".";
  div.appendChild(span);
  document.body.appendChild(div);
  const top = span.offsetTop - ta.scrollTop;
  const left = span.offsetLeft - ta.scrollLeft;
  const height = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
  document.body.removeChild(div);
  return { top, left, height };
}

/** Is the caret sitting in a "/word" at the start of its line? */
function detectSlash(value: string, caret: number): { at: number; query: string } | null {
  const before = value.slice(0, caret);
  const m = before.match(/(?:^|\n)\/([\w-]*)$/);
  if (!m) return null;
  return { at: caret - m[1].length - 1, query: m[1] };
}

export function NoteEditor({
  note,
  subjects,
  topics,
  onChanged,
  onDeleted,
  expanded,
  onToggleExpanded,
  listOpen,
  onToggleList,
}: {
  note: Note;
  subjects: Subject[];
  topics: Topic[];
  onChanged: (n: Note) => void;
  onDeleted: (id: string) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  listOpen?: boolean;
  onToggleList?: () => void;
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
  const exportRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  // Turn the whole note (text, tables, math, images) into one image and either
  // share it (mobile → WhatsApp etc.) or download it. Snapshots the hidden
  // full-width render below so the capture is complete, not the scrolled view.
  async function shareNote() {
    const el = exportRef.current;
    if (!el || sharing) return;
    setSharing(true);
    try {
      // The rendered <img>s are loading="lazy" and may be unloaded; preload each
      // URL with a fresh Image() (which reliably fires load/error and warms the
      // cache) so html-to-image can embed them. 6s guard so it never hangs.
      const srcs = [...new Set(Array.from(el.querySelectorAll("img")).map((i) => i.src).filter(Boolean))];
      await Promise.all(
        srcs.map(
          (src) =>
            new Promise((r) => {
              const im = new Image();
              const done = () => r(null);
              im.onload = done;
              im.onerror = done;
              im.src = src;
              setTimeout(done, 6000);
            }),
        ),
      );
      const dataUrl = await toPng(el, { backgroundColor: "#ffffff", pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const safe = (title || "note").replace(/[^\w\s-]/g, "").trim().slice(0, 50) || "note";
      const file = new File([blob], `${safe}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: title || "Note" });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = file.name;
        a.click();
        toast.success("Image downloaded — send it to your friends");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error("Couldn't create the image");
    } finally {
      setSharing(false);
    }
  }

  // "/" command menu
  const [slash, setSlash] = useState<{ at: number; query: string; top: number; left: number } | null>(null);
  const [slashIdx, setSlashIdx] = useState(0);
  const slashList = slash
    ? SLASH.filter((c) => {
        const q = slash.query.toLowerCase();
        return !q || c.label.toLowerCase().includes(q) || c.keys.includes(q);
      })
    : [];

  function refreshSlash() {
    const ta = taRef.current;
    if (!ta) return;
    const d = detectSlash(ta.value, ta.selectionStart);
    if (!d) {
      setSlash(null);
      return;
    }
    const { top, left, height } = caretXY(ta, d.at);
    setSlash({ ...d, top: top + height + 4, left });
    setSlashIdx(0);
  }

  function applySlash(cmd: SlashCmd) {
    const ta = taRef.current;
    if (!ta || !slash) return;
    const caret = ta.selectionStart;
    const base = slash.at;
    const next = content.slice(0, base) + cmd.snippet + content.slice(caret);
    setContent(next);
    setDirty(true);
    setSlash(null);
    requestAnimationFrame(() => {
      ta.focus();
      if (cmd.sel) {
        ta.selectionStart = base + cmd.sel[0];
        ta.selectionEnd = base + cmd.sel[1];
      } else {
        ta.selectionStart = ta.selectionEnd = base + cmd.caret;
      }
    });
  }

  function onEditorKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!slash || slashList.length === 0) return;
    const idx = Math.min(slashIdx, slashList.length - 1);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSlashIdx((i) => (i + 1) % slashList.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSlashIdx((i) => (i - 1 + slashList.length) % slashList.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      applySlash(slashList[idx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSlash(null);
    }
  }

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
        {onToggleList ? (
          <Button
            variant="ghost"
            size="icon"
            title={listOpen ? "Hide notes list" : "Show notes list"}
            aria-label={listOpen ? "Hide notes list" : "Show notes list"}
            onClick={onToggleList}
          >
            {listOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </Button>
        ) : null}
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
        <Button
          variant="ghost"
          size="icon"
          title="Share / export as image"
          aria-label="Share note as image"
          onClick={shareNote}
          disabled={sharing || !content.trim()}
        >
          {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[length:var(--text-micro)] text-subtle tabular-nums">
            {saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}
          </span>
          {onToggleExpanded ? (
            <Button
              variant="ghost"
              size="icon"
              title={expanded ? "Exit full screen (Esc)" : "Full-screen writing"}
              aria-label={expanded ? "Exit full screen" : "Full-screen writing"}
              onClick={onToggleExpanded}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>
          ) : null}
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
          className="flex-1 min-w-[180px] bg-transparent text-[length:var(--text-body)] font-semibold tracking-tight outline-none placeholder:text-subtle placeholder:font-normal"
        />
        <select
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId("");
            save({ subject_id: e.target.value || null, topic_id: null });
          }}
          className={chipCls}
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
            className={cn(chipCls, "max-w-[240px]")}
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
          <div className="relative min-h-0 border-r border-line">
            <textarea
              ref={taRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setDirty(true);
                refreshSlash();
              }}
              onKeyDown={onEditorKeyDown}
              onKeyUp={refreshSlash}
              onClick={refreshSlash}
              onBlur={() => setTimeout(() => setSlash(null), 120)}
              onPaste={onPaste}
              placeholder={PLACEHOLDER}
              spellCheck={false}
              className="editor h-full w-full resize-none bg-transparent px-4 py-3.5 outline-none placeholder:text-subtle"
            />
            {slash && slashList.length > 0 ? (
              <ul
                className="absolute z-30 max-h-72 w-64 overflow-y-auto rounded-lg border border-line bg-surface py-1 shadow-[var(--shadow)]"
                style={{ top: slash.top, left: Math.max(8, Math.min(slash.left, 9999)) }}
              >
                <li className="px-2.5 pb-1 pt-0.5 text-[length:var(--text-micro)] font-medium uppercase tracking-wide text-subtle">
                  Blocks
                </li>
                {slashList.map((c, i) => {
                  const Icon = c.icon;
                  const active = i === Math.min(slashIdx, slashList.length - 1);
                  return (
                    <li key={c.label}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySlash(c);
                        }}
                        onMouseEnter={() => setSlashIdx(i)}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors",
                          active ? "bg-[var(--accent-soft)]" : "hover:bg-surface-2",
                        )}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] border border-line bg-surface-2 text-muted">
                          <Icon size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[length:var(--text-small)] font-medium leading-tight">{c.label}</span>
                          <span className="block truncate text-[length:var(--text-micro)] text-subtle">{c.hint}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
        {view !== "write" ? (
          <div className="overflow-y-auto px-4 py-3.5">
            {content.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-[length:var(--text-small)] text-subtle">Nothing to preview yet.</p>
            )}
          </div>
        ) : null}
      </div>

      {/* Full render used only for the share/export image. Kept in the viewport
          but invisible (opacity-0, behind everything) so lazy images actually
          load; the captured inner node is opaque, so the PNG isn't transparent. */}
      <div aria-hidden className="pointer-events-none fixed left-0 top-0 -z-10 opacity-0">
      <div
        ref={exportRef}
        data-theme="light"
        className="w-[760px] bg-white px-8 py-7 text-[#1b1915]"
      >
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-[#1b1915]">{title || "Untitled"}</h1>
        <p className="mb-4 border-b border-[#e6e1d7] pb-3 text-[13px] text-[#6b665c]">
          {(subjects.find((s) => s.id === subjectId)?.name ?? "") + (subjectId ? " · " : "")}IILM OS notes
        </p>
        {content.trim() ? <Markdown>{content}</Markdown> : null}
      </div>
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
