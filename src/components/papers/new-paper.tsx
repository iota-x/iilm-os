"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createPaper } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import type { Subject } from "@/lib/db-types";
import { Button, Card, chipCls, inputCls } from "@/components/ui";

const EXAMS = [
  ["end-sem", "End-sem"],
  ["mid-sem", "Mid-sem"],
  ["quiz", "Quiz / class test"],
  ["other", "Other"],
] as const;

const MAX = 10 * 1024 * 1024;

/** Add a past paper: a PDF or a photo of it, or a link to one. */
export function NewPaper({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear() - 1));
  const [exam, setExam] = useState<string>("end-sem");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  async function upload(): Promise<string | null> {
    if (!file) return null;
    if (file.size > MAX) throw new Error("That file is over 10 MB — try a smaller scan, or share a link.");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Signed out");
    const ext = (file.name.split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `${user.id}/papers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("board").upload(key, file, { contentType: file.type || "application/pdf" });
    if (error) throw new Error(error.message);
    return key;
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus size={14} /> Add a paper
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
              const file_path = await upload();
              await createPaper({ subject_slug: subject, year: Number(year), exam, title, file_path, url });
              toast.success("Added — every section on your syllabus can see it now");
              setOpen(false);
              setTitle("");
              setUrl("");
              setFile(null);
              router.refresh();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Couldn't add it");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[length:var(--text-small)] font-medium">Add a past paper</p>
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select required value={subject} onChange={(e) => setSubject(e.target.value)} className={chipCls}>
            <option value="" disabled>Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.slug}>{s.short_name}</option>
            ))}
          </select>
          <select value={exam} onChange={(e) => setExam(e.target.value)} className={chipCls}>
            {EXAMS.map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
          <input
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`${chipCls} w-24`}
            aria-label="Year"
          />
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Anything to add — e.g. Set B, with solutions" className={inputCls} />
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" accept="application/pdf,image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button type="button" size="sm" onClick={() => fileRef.current?.click()}>
            <FileUp size={14} /> {file ? file.name.slice(0, 32) : "PDF or photo"}
          </Button>
          <span className="text-[length:var(--text-micro)] text-subtle">or</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="a link to it (Drive, etc.)" className={`${inputCls} min-w-0 flex-1`} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" disabled={pending || !subject || (!file && !url.trim())}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            Add paper
          </Button>
        </div>
      </form>
    </Card>
  );
}
