"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Check, FileText, Loader2, Paperclip, Square, Wrench } from "lucide-react";
import { toast } from "sonner";
import { saveAskThread } from "@/lib/actions";
import type { Attachment, AskTurn } from "@/lib/db-types";
import { Card } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

type Turn = AskTurn;

const SUGGESTIONS = [
  "Turn today's lecture into checkpoints",
  "Make questions out of this tutorial sheet",
  "Write these board photos up as a note",
  "What should I study tonight?",
];

export function AskChat({
  files,
  threadId: initialThreadId = null,
  initialTurns = [],
}: {
  files: Attachment[];
  threadId?: string | null;
  initialTurns?: Turn[];
}) {
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>(initialTurns);
  const threadRef = useRef<string | null>(initialThreadId);
  const turnsRef = useRef<Turn[]>(initialTurns);
  turnsRef.current = turns;
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);

  // the composer grows with what's typed, up to ~8 lines, and shrinks back
  function fit(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    const history = [...turns, { role: "user" as const, content: message, images: picked.length }];
    setTurns([...history, { role: "assistant", content: "", tools: [] }]);
    setDraft("");
    requestAnimationFrame(() => fit(boxRef.current));
    setBusy(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          attachmentIds: picked,
        }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(j.error ?? "Request failed");
      }
      setPicked([]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let changedData = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as {
            type: string;
            text?: string;
            name?: string;
            summary?: string;
          };
          if (ev.type === "tool") changedData = true;
          // Build a new turn object rather than mutating the existing one —
          // this updater runs twice under StrictMode, and appending in place
          // duplicated every chunk of streamed text.
          setTurns((prev) => {
            const last = prev[prev.length - 1];
            if (!last || last.role !== "assistant") return prev;
            const updated: Turn = { ...last };
            if (ev.type === "text") {
              updated.content = last.content + (ev.text ?? "");
            } else if (ev.type === "tool") {
              updated.tools = [...(last.tools ?? []), ev.summary ?? ev.name ?? "did something"];
            } else if (ev.type === "error") {
              updated.content = last.content + `\n\n**${ev.text}**`;
            } else {
              return prev;
            }
            return [...prev.slice(0, -1), updated];
          });
        }
      }

      // the exchange is complete — keep it. The first save names the
      // conversation and puts its id in the URL so a reload lands back here.
      try {
        const id = await saveAskThread(threadRef.current, turnsRef.current);
        if (!threadRef.current) {
          threadRef.current = id;
          window.history.replaceState(null, "", `/ask?t=${id}`);
        }
      } catch {
        // saving is a convenience; the answer is already on screen
      }

      // tools wrote to the database — refresh so the rest of the app catches up
      if (changedData) router.refresh();
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setTurns((prev) => prev.slice(0, -1));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  // PDFs are attachable too — Gemini reads them directly
  const attachable = files.filter((f) => {
    const m = f.mime ?? "";
    return m.startsWith("image/") || m === "application/pdf";
  });

  return (
    <div className="space-y-3">
      {turns.length === 0 ? (
        <Card className="p-5">
          <p className="text-[length:var(--text-small)] font-medium">Ask about your course</p>
          <p className="mt-1 max-w-[62ch] text-[length:var(--text-small)] leading-relaxed text-muted">
            This one can change your data — add checkpoints to a topic, put questions in the bank,
            write a note. Attach a board photo from your inbox and it will read it.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void send(s)}
                className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[length:var(--text-micro)] text-muted transition-colors hover:text-fg focus-ring"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {turns.map((t, i) => (
        <div key={i} className={cn(t.role === "user" && "flex justify-end")}>
          {t.role === "user" ? (
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[var(--accent)] px-3.5 py-2 text-[length:var(--text-small)] text-[var(--accent-fg)]">
              {t.content}
              {t.images ? (
                <span className="mt-1 block text-[length:var(--text-micro)] opacity-80">
                  {t.images} image{t.images === 1 ? "" : "s"} attached
                </span>
              ) : null}
            </div>
          ) : (
            <Card className="p-3.5">
              {t.tools?.length ? (
                <ul className="mb-2 space-y-1 border-b border-line pb-2">
                  {t.tools.map((s, k) => (
                    <li
                      key={k}
                      className="flex items-center gap-1.5 text-[length:var(--text-micro)] text-[var(--good)]"
                    >
                      <Check size={12} /> {s}
                    </li>
                  ))}
                </ul>
              ) : null}
              {t.content ? (
                <div className="prose-note text-[length:var(--text-small)]">
                  <Markdown>{t.content}</Markdown>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[length:var(--text-small)] text-subtle">
                  <Loader2 size={13} className="animate-spin" /> thinking
                </span>
              )}
            </Card>
          )}
        </div>
      ))}
      <div ref={endRef} />

      {/* attach from inbox */}
      {attachable.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[length:var(--text-micro)] text-subtle">
            <Paperclip size={12} /> attach:
          </span>
          {attachable.slice(0, 12).map((f) => {
            const on = picked.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() =>
                  setPicked((p) => (on ? p.filter((x) => x !== f.id) : [...p, f.id]))
                }
                title={f.filename ?? ""}
                className={cn(
                  "h-11 w-11 overflow-hidden rounded-lg border transition-colors focus-ring",
                  on ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-line",
                )}
              >
                {(f.mime ?? "").startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/vault/${f.storage_path}`}
                    alt={f.filename ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-surface-2 text-subtle">
                    <FileText size={15} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        className="sticky bottom-3 flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 shadow-pop"
      >
        <textarea
          ref={boxRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            fit(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
          rows={1}
          placeholder="Ask, or tell it what happened in class…"
          className="max-h-[200px] min-h-[36px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1.5 text-[length:var(--text-small)] leading-relaxed outline-none placeholder:text-subtle"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-subtle hover:text-fg focus-ring"
            aria-label="Stop"
          >
            <Square size={13} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!draft.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] disabled:opacity-40 focus-ring"
            aria-label="Send"
          >
            <ArrowUp size={15} />
          </button>
        )}
      </form>

      <p className="flex items-center gap-1.5 px-1 text-[length:var(--text-micro)] text-subtle">
        <Wrench size={11} /> It can add checkpoints, questions and notes directly. Check what it
        writes — it can be wrong.
      </p>
    </div>
  );
}
