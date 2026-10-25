"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createEvent } from "@/lib/actions";
import { Button, Card, inputCls } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Clubs and teachers post an event once; the whole university sees it. */
export function NewEvent() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", organiser: "", venue: "", starts: "", ends: "", url: "", body: "" });
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus size={14} /> Post an event
      </Button>
    );
  }
  const label = "text-[length:var(--text-micro)] font-medium text-muted";

  return (
    <Card className="w-full p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            try {
              // datetime-local is the poster's own clock; send it as an instant
              await createEvent({
                title: f.title,
                organiser: f.organiser,
                venue: f.venue,
                url: f.url,
                body: f.body,
                starts_at: new Date(f.starts).toISOString(),
                ends_at: f.ends ? new Date(f.ends).toISOString() : null,
              });
              toast.success("Posted — the whole university can see it");
              setOpen(false);
              setF({ title: "", organiser: "", venue: "", starts: "", ends: "", url: "", body: "" });
              router.refresh();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Couldn't post it");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[length:var(--text-small)] font-medium">Post an event or workshop</p>
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </Button>
        </div>
        <input required value={f.title} onChange={set("title")} placeholder="What is it — e.g. Hack the Night 2026" className={inputCls} />
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={f.organiser} onChange={set("organiser")} placeholder="Who's running it — club or department" className={inputCls} />
          <input value={f.venue} onChange={set("venue")} placeholder="Where — e.g. Auditorium" className={inputCls} />
          <label className="block">
            <span className={label}>Starts</span>
            <input required type="datetime-local" value={f.starts} onChange={set("starts")} className={cn(inputCls, "mt-1")} />
          </label>
          <label className="block">
            <span className={label}>Ends (optional)</span>
            <input type="datetime-local" value={f.ends} onChange={set("ends")} className={cn(inputCls, "mt-1")} />
          </label>
        </div>
        <input value={f.url} onChange={set("url")} placeholder="Registration link, if there is one" className={inputCls} />
        <textarea value={f.body} onChange={set("body")} rows={3} placeholder="Details. Markdown works." className={cn(inputCls, "h-auto resize-y py-2")} />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" disabled={pending || !f.title.trim() || !f.starts}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            Post event
          </Button>
        </div>
      </form>
    </Card>
  );
}
