"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { saveCaught, type CaughtSave } from "@/lib/actions";
import { shrinkInBrowser } from "@/lib/shrink-browser";
import { textFromChatFile } from "@/lib/unzip-text";
import type { Subject } from "@/lib/db-types";
import { Badge, Button, Card, chipCls, inputCls } from "@/components/ui";
import { cn, fmtDate } from "@/lib/utils";

type Found = Omit<CaughtSave, "add" | "share" | "board_id"> & { in_planner: boolean; on_board: string | null };
type Row = CaughtSave & { in_planner: boolean };

/**
 * Most teachers post deadlines on WhatsApp or the ERP. Paste the message,
 * drop a screenshot or an exported group chat, check what Semwise read, and
 * save: to-dos on your Planner, and a notice on the class board so nobody
 * else in the class has to do this for the same deadline.
 *
 * Opened by /planner?catch=new; `stash` is set instead when the Android
 * share sheet sent a message here (/api/share parks it in the vault).
 */
export function CatchDeadlines({ subjects, stash }: { subjects: Subject[]; stash?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [chatName, setChatName] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [saving, startSave] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const ranStash = useRef(false);

  async function read(payload: { text?: string; image?: { data: string; mediaType: string }; stash?: string }) {
    setReading(true);
    setRows(null);
    try {
      const res = await fetch("/api/catch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { items?: Found[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't read that.");
      setRows(
        (data.items ?? []).map((i) => ({
          ...i,
          add: !i.in_planner,
          share: !i.on_board,
          board_id: i.on_board,
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that.");
    } finally {
      setReading(false);
    }
  }

  useEffect(() => {
    if (!stash || ranStash.current) return;
    ranStash.current = true;
    void read({ stash });
    router.replace("/planner?catch=new", { scroll: false }); // a refresh shouldn't try the stash again
  }, [stash, router]);

  async function pick(file: File | undefined | null) {
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const small = await shrinkInBrowser(file);
      if (image) URL.revokeObjectURL(image.url);
      setImage({ file: small, url: URL.createObjectURL(small) });
      return;
    }
    try {
      const chat = await textFromChatFile(file);
      setText(chat);
      setChatName(file.name);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open that file.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let img: { data: string; mediaType: string } | undefined;
    if (image) {
      const buf = new Uint8Array(await image.file.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      img = { data: btoa(bin), mediaType: image.file.type };
    }
    await read({ text, image: img });
  }

  function patch(i: number, p: Partial<Row>) {
    setRows((rs) => rs && rs.map((r, j) => (j === i ? { ...r, ...p } : r)));
  }

  function save() {
    const chosen = (rows ?? []).filter((r) => r.add || (r.share && !r.board_id));
    if (!chosen.length) return;
    startSave(async () => {
      try {
        const { added, shared, error } = await saveCaught(chosen);
        const done = [added ? `${added} added to your Planner` : "", shared ? `${shared} posted to the class board` : ""].filter(Boolean).join(" · ");
        if (error) toast.error(error);
        if (done || !error) toast.success(done || "Already saved");
        if (added || shared || !error) close();
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save.");
      }
    });
  }

  function close() {
    if (image) URL.revokeObjectURL(image.url);
    router.replace("/planner", { scroll: false });
  }

  const chosen = (rows ?? []).filter((r) => r.add || (r.share && !r.board_id)).length;

  return (
    <Card className="w-full p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[length:var(--text-lead)]">Catch deadlines</h2>
          <p className="mt-0.5 max-w-[60ch] text-[length:var(--text-small)] text-muted">
            Paste a WhatsApp message or an ERP notice, or add a screenshot or an exported group chat. You check the dates before
            anything is saved.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={close} aria-label="Close">
          <X size={15} />
        </Button>
      </div>

      {rows === null ? (
        <form onSubmit={submit} className="mt-3 space-y-2">
          {chatName ? (
            <p className="flex items-center gap-2 text-[length:var(--text-small)]">
              <Badge tone="accent">Chat</Badge> {chatName} · the last six weeks are read
              <button type="button" className="text-muted underline underline-offset-2 hover:text-fg" onClick={() => { setText(""); setChatName(null); }}>
                remove
              </button>
            </p>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={(e) => {
                const f = [...e.clipboardData.files].find((x) => x.type.startsWith("image/"));
                if (f) {
                  e.preventDefault();
                  void pick(f);
                }
              }}
              rows={5}
              placeholder={"e.g. \"DE assignment 3 submit by Friday in the lab. C quiz on pointers 4/11\""}
              className={cn(inputCls, "h-auto py-2.5 leading-relaxed")}
            />
          )}
          {image ? (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local blob preview */}
              <img src={image.url} alt="Screenshot to read" className="max-h-40 rounded-lg border border-line" />
              <button
                type="button"
                onClick={() => { URL.revokeObjectURL(image.url); setImage(null); }}
                className="absolute -right-2 -top-2 rounded-full border border-line bg-surface p-0.5 focus-ring"
                aria-label="Remove screenshot"
              >
                <X size={12} />
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus size={14} /> Screenshot or chat export
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.txt,.zip,text/plain,application/zip"
              className="hidden"
              onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }}
            />
            <Button type="submit" variant="primary" size="sm" disabled={reading || (!text.trim() && !image)}>
              {reading ? <Loader2 size={13} className="animate-spin" /> : null}
              {reading ? "Reading…" : "Find the dates"}
            </Button>
          </div>
        </form>
      ) : rows.length === 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[length:var(--text-small)] text-muted">No upcoming deadlines in that. Past dates are skipped.</p>
          <Button variant="outline" size="sm" onClick={() => setRows(null)}>Try another</Button>
        </div>
      ) : (
        <div className="mt-3">
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-line">
            {rows.map((r, i) => (
              <li key={i} className="space-y-2 px-3 py-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={r.add}
                    onChange={(e) => patch(i, { add: e.target.checked })}
                    className="mt-3 size-4 accent-[var(--accent)]"
                    aria-label="Add to my Planner"
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <input value={r.title} onChange={(e) => patch(i, { title: e.target.value })} className={inputCls} aria-label="To-do" />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <input type="date" value={r.due_date} onChange={(e) => patch(i, { due_date: e.target.value })} className={chipCls} aria-label="Due" />
                      {r.due_time ? <span className="text-[length:var(--text-micro)] text-muted">by {r.due_time}</span> : null}
                      <select value={r.subject} onChange={(e) => patch(i, { subject: e.target.value })} className={chipCls} aria-label="Subject">
                        <option value="">No subject</option>
                        {subjects.map((s) => (
                          <option key={s.slug} value={s.slug}>{s.short_name}</option>
                        ))}
                      </select>
                      <Badge>{r.kind}</Badge>
                      {r.in_planner ? <Badge tone="good">on your Planner</Badge> : null}
                    </div>
                    {r.quote ? <p className="text-[length:var(--text-micro)] italic text-subtle">&ldquo;{r.quote}&rdquo;</p> : null}
                    {r.board_id ? (
                      <p className="text-[length:var(--text-micro)] text-muted">Already on the class board — saving links your to-do to it.</p>
                    ) : (
                      <label className="flex w-fit items-center gap-1.5 text-[length:var(--text-micro)] text-muted">
                        <input type="checkbox" checked={r.share} onChange={(e) => patch(i, { share: e.target.checked })} className="accent-[var(--accent)]" />
                        Post to the class board, due {fmtDate(r.due_date)}
                      </label>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRows(null)}>Back</Button>
            <Button variant="primary" size="sm" onClick={save} disabled={saving || !chosen}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : null}
              Save {chosen || ""}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
