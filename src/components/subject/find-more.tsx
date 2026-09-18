"use client";

import { useState } from "react";
import { Search, MonitorPlay, Globe, GraduationCap, X } from "lucide-react";
import { Button, inputCls } from "@/components/ui";

/**
 * No API key needed — these open a real search in a new tab, scoped to the
 * topic. Anything good that comes back can be saved with Add.
 */
const ENGINES = [
  {
    key: "yt",
    label: "YouTube",
    icon: MonitorPlay,
    build: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  },
  {
    key: "web",
    label: "Web",
    icon: Globe,
    build: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    key: "notes",
    label: "Notes & PDFs",
    icon: GraduationCap,
    build: (q: string) =>
      `https://www.google.com/search?q=${encodeURIComponent(q + " notes solved examples filetype:pdf")}`,
  },
] as const;

export function FindMore({ seed, subject }: { seed?: string; subject: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(seed ?? "");

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Search size={14} /> Find more
      </Button>
    );
  }

  const query = `${q || seed || subject} ${subject}`.trim();

  return (
    <div className="bg-surface border border-line rounded-[14px] p-3 shadow-pop w-full max-w-[460px] animate-in">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Topic to search for"
          className={inputCls}
        />
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
          <X size={14} />
        </Button>
      </div>
      <p className="text-[length:var(--text-micro)] text-subtle mt-2">
        Searching for <span className="text-muted">&ldquo;{query}&rdquo;</span>
      </p>
      <div className="flex flex-wrap gap-2 mt-2.5">
        {ENGINES.map(({ key, label, icon: Icon, build }) => (
          <a key={key} href={build(query)} target="_blank" rel="noreferrer noopener">
            <Button variant="subtle" size="sm">
              <Icon size={13} /> {label}
            </Button>
          </a>
        ))}
      </div>
      <p className="text-[length:var(--text-micro)] text-muted mt-2.5 leading-relaxed">
        Found something good? Save it with <strong>Add → link</strong> so it sticks around.
      </p>
    </div>
  );
}
