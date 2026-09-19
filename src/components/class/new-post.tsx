"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { shrinkInBrowser } from "@/lib/shrink-browser";
import type { Subject } from "@/lib/db-types";
import { Button, Card, chipCls, inputCls } from "@/components/ui";
import { cn } from "@/lib/utils";

const KINDS = [
  ["discussion", "Discussion"],
  ["question", "Question"],
  ["resource", "Resource"],
  ["notice", "Notice"],
] as const;

export function NewPost({ subjects, defaultSubject }: { subjects: Subject[]; defaultSubject: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<string>("discussion");
  const [subject, setSubject] = useState(defaultSubject);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  function pick(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setImage(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  /** Board images live in their own public bucket under the poster's folder. */
  async function uploadImage(): Promise<string | null> {
    if (!image) return null;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Signed out");
    const small = await shrinkInBrowser(image);
    const ext = small.type === "image/png" ? "png" : "jpg";
    const key = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("board").upload(key, small, { contentType: small.type, upsert: false });
    if (error) throw new Error(error.message);
    return key;
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus size={14} /> New post
      </Button>
    );
  }

  return (
    <Card className="w-full p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            try {
              const image_path = await uploadImage();
              const id = await createPost({ title, body, url, kind, subject_slug: subject || null, image_path });
              setOpen(false);
              setTitle("");
              setBody("");
              setUrl("");
              pick(null);
              router.push(`/class/${id}`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Couldn't post");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {KINDS.map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-md px-2 py-1 text-[length:var(--text-micro)] font-medium transition-colors focus-ring",
                  kind === k ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </Button>
        </div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "question" ? "What's the question?" : "Title"}
          className={inputCls}
        />
        {kind === "resource" ? (
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={inputCls} />
        ) : null}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details, if any. Markdown works."
          rows={4}
          className={cn(inputCls, "h-auto resize-y py-2")}
        />
        {preview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="max-h-48 rounded-[var(--radius-control)] border border-line" />
            <button
              type="button"
              onClick={() => pick(null)}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-line bg-surface text-muted hover:text-fg focus-ring"
            >
              <X size={12} />
            </button>
          </div>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className={chipCls}>
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.short_name}
              </option>
            ))}
          </select>
          <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={14} /> {image ? "Change image" : "Add image"}
          </Button>
          </div>
          <Button type="submit" variant="primary" size="sm" disabled={pending || !title.trim()}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            Post
          </Button>
        </div>
      </form>
    </Card>
  );
}
