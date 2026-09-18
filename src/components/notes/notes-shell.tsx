"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Pin, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { createNote } from "@/lib/actions";
import type { Note, Subject, Topic } from "@/lib/db-types";
import { NoteEditor } from "./note-editor";
import { Button, Card, Empty, inputCls } from "@/components/ui";
import { ACCENT_CLASS, cn, relativeDay } from "@/lib/utils";

export function NotesShell({
  initialNotes,
  subjects,
  topics,
}: {
  initialNotes: Note[];
  subjects: Subject[];
  topics: Topic[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const openParam = params.get("open");

  const [notes, setNotes] = useState(initialNotes);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("");
  const [picked, setPicked] = useState<string | null>(null);

  // Adjust state during render when the props/URL change, rather than in an
  // effect — see react.dev "You Might Not Need an Effect".
  const [seenNotes, setSeenNotes] = useState(initialNotes);
  if (seenNotes !== initialNotes) {
    setSeenNotes(initialNotes);
    setNotes(initialNotes);
  }

  const [seenParam, setSeenParam] = useState(openParam);
  if (seenParam !== openParam) {
    setSeenParam(openParam);
    setPicked(null);
  }

  const selected = picked ?? openParam;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return notes
      .filter((n) => (filter ? n.subject_id === filter : true))
      .filter((n) =>
        needle
          ? n.title.toLowerCase().includes(needle) || n.content.toLowerCase().includes(needle)
          : true,
      );
  }, [notes, q, filter]);

  const current = notes.find((n) => n.id === selected) ?? null;

  async function newNote() {
    try {
      const id = await createNote({ subject_id: filter || null });
      setPicked(id);
      router.refresh();
      toast.success("New note");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create note");
    }
  }

  return (
    /* A writing surface, not a page of cards: both columns own the viewport
       height and scroll inside themselves, so the note never sits in a short
       box with dead space under it. */
    <div className="grid gap-4 lg:h-[calc(100dvh-11rem)] lg:min-h-[520px] lg:grid-cols-[320px_1fr]">
      {/* list */}
      <Card className="flex max-h-[45dvh] min-h-0 flex-col overflow-hidden lg:max-h-none">
        <div className="p-2.5 border-b border-line space-y-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search notes"
              className={`${inputCls} pl-8 h-8 text-[length:var(--text-small)]`}
            />
          </div>
          <div className="flex gap-1.5">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`${inputCls} h-8 flex-1 text-[length:var(--text-small)]`}
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.short_name}
                </option>
              ))}
            </select>
            <Button variant="primary" size="icon" onClick={newNote} aria-label="New note">
              <Plus size={15} />
            </Button>
          </div>
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-[var(--border)] overflow-y-auto">
          {filtered.length ? (
            filtered.map((n) => {
              const subject = subjects.find((s) => s.id === n.subject_id) ?? null;
              const active = n.id === selected;
              return (
                <li key={n.id} className={cn(subject ? ACCENT_CLASS[subject.color] : "")}>
                  <button
                    onClick={() => setPicked(n.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 transition-colors focus-ring",
                      active ? "bg-sc-soft" : "hover:bg-surface-2",
                    )}
                  >
                    <div className="flex items-start gap-1.5">
                      {n.pinned ? (
                        <Pin size={11} className="mt-1 shrink-0 text-[var(--accent)]" />
                      ) : null}
                      <p
                        className={cn(
                          "text-[length:var(--text-small)] leading-snug line-clamp-2",
                          active ? "font-semibold text-sc" : "font-medium",
                        )}
                      >
                        {n.title || "Untitled"}
                      </p>
                    </div>
                    {excerpt(n.content) ? (
                      <p className="mt-0.5 line-clamp-1 text-[length:var(--text-micro)] text-muted">
                        {excerpt(n.content)}
                      </p>
                    ) : null}
                    <p className="text-[length:var(--text-micro)] text-subtle mt-1 flex items-center gap-1.5">
                      {subject ? <span className="text-sc font-medium">{subject.short_name}</span> : null}
                      <span>{relativeDay(n.updated_at.slice(0, 10))}</span>
                    </p>
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-8 text-center text-[length:var(--text-small)] text-muted">
              {q || filter ? "No matches." : "No notes yet."}
            </li>
          )}
        </ul>
      </Card>

      {/* editor */}
      <Card className="flex min-h-[420px] flex-col overflow-hidden lg:min-h-0">
        {current ? (
          <NoteEditor
            key={current.id}
            note={current}
            subjects={subjects}
            topics={topics}
            onChanged={(n) => setNotes((prev) => prev.map((x) => (x.id === n.id ? n : x)))}
            onDeleted={(id) => {
              setNotes((prev) => prev.filter((x) => x.id !== id));
              setPicked(null);
              router.refresh();
            }}
          />
        ) : (
          <div className="grid flex-1 place-items-center">
          <Empty
            icon={<FileText size={26} strokeWidth={1.5} />}
            title="No note open"
            body="Pick one from the list, or start a new one. Markdown and LaTeX both render, and a screenshot pasted into the editor uploads itself."
            action={
              <Button variant="primary" size="sm" onClick={newNote}>
                <Plus size={14} /> New note
              </Button>
            }
          />
          </div>
        )}
      </Card>
    </div>
  );
}

/** First real line of the note, with the markdown furniture stripped off. */
function excerpt(content: string): string {
  for (const line of content.split("\n")) {
    const clean = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")       // images carry no meaning here
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")    // links keep their text
      .replace(/^[#>\-*\s]+/, "")
      .replace(/[*_`]/g, "")
      .trim();
    if (clean) return clean.slice(0, 90);
  }
  return "";
}
