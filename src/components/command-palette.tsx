"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CornerDownLeft,
  ExternalLink,
  Layers,
  LayoutDashboard,
  Link2,
  Search,
  StickyNote,
  Target,
} from "lucide-react";
import { useHydrated } from "@/lib/client-hooks";
import type { SearchDoc } from "@/lib/queries";
import { cn } from "@/lib/utils";

const PAGES: SearchDoc[] = [
  { kind: "page", title: "Today", href: "/", subtitle: "Dashboard" },
  { kind: "page", title: "Subjects", href: "/subjects" },
  { kind: "page", title: "Planner", href: "/planner", subtitle: "Timetable and the 18-day plan" },
  { kind: "page", title: "Notes", href: "/notes" },
  { kind: "page", title: "Resources", href: "/resources" },
  { kind: "page", title: "Exams", href: "/exams", subtitle: "Marking scheme" },
  { kind: "page", title: "Settings", href: "/settings" },
];

const ICON = {
  page: LayoutDashboard,
  subject: BookOpen,
  unit: Layers,
  topic: Target,
  note: StickyNote,
  resource: Link2,
} as const;

const GROUP_LABEL: Record<SearchDoc["kind"], string> = {
  page: "Go to",
  subject: "Subjects",
  unit: "Units",
  topic: "Topics",
  note: "Notes",
  resource: "Resources",
};

const GROUP_ORDER: SearchDoc["kind"][] = ["page", "subject", "unit", "topic", "note", "resource"];

/** Subsequence match — "lim" hits "Limits", "diffeq" hits "Differential equations". */
function score(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;

  const exact = t.indexOf(q);
  if (exact === 0) return 1000;
  if (exact > 0) return 800 - exact;

  // word-boundary initials, e.g. "pmv" -> "Partial ... Mean Value"
  let qi = 0;
  let last = -1;
  let gaps = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (last >= 0) gaps += i - last - 1;
      last = i;
      qi++;
    }
  }
  if (qi < q.length) return -1;
  return 400 - Math.min(gaps, 200);
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo(() => [...PAGES, ...docs], [docs]);

  const ranked = useMemo(() => {
    if (!query.trim()) {
      return [...PAGES, ...docs.filter((d) => d.kind === "subject")];
    }
    return all
      .map((d) => ({
        doc: d,
        s: Math.max(score(query, d.title), score(query, d.subtitle ?? "") - 120),
      }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((r) => r.doc);
  }, [query, all, docs]);

  // Results are ranked by score but rendered in group order, so the index the
  // arrow keys walk has to be assigned in the order things actually appear —
  // otherwise Enter opens whatever scored highest, not what's highlighted.
  const grouped = useMemo(() => {
    const out: { label: string; items: { doc: SearchDoc; index: number }[] }[] = [];
    let i = 0;
    for (const kind of GROUP_ORDER) {
      const items = ranked.filter((d) => d.kind === kind).map((doc) => ({ doc, index: i++ }));
      if (items.length) out.push({ label: GROUP_LABEL[kind], items });
    }
    return out;
  }, [ranked]);

  const results = useMemo(
    () => grouped.flatMap((g) => g.items.map((x) => x.doc)),
    [grouped],
  );

  const run = useCallback(
    (doc: SearchDoc) => {
      setOpen(false);
      setQuery("");
      if (/^https?:\/\//.test(doc.href)) {
        window.open(doc.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(doc.href);
      }
    },
    [router],
  );

  // ⌘K / Ctrl+K anywhere, Esc to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // let anything on the page open it: window.dispatchEvent(new Event("open-command-palette"))
  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("open-command-palette", onOpen);
    return () => window.removeEventListener("open-command-palette", onOpen);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    setLoading(true);
    fetch("/api/search-index")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: SearchDoc[]) => setDocs(d))
      .catch(() => loadedRef.current = false) // let a failed load retry next open
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <button
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-line px-3.5">
          <Search size={16} className="shrink-0 text-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const doc = results[active];
                if (doc) run(doc);
              }
            }}
            placeholder="Search topics, notes, resources…"
            className="h-12 flex-1 bg-transparent text-[length:var(--text-body)] outline-none placeholder:text-subtle"
          />
          <kbd className="hidden sm:block rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[length:var(--text-micro)] text-subtle">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-1.5">
          {loading && !docs.length ? (
            <p className="px-4 py-8 text-center text-[length:var(--text-small)] text-subtle">Loading…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-[length:var(--text-small)] text-subtle">
              Nothing matches “{query}”.
            </p>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="mb-1">
                <div className="px-3.5 py-1 text-[length:var(--text-micro)] font-medium text-subtle">
                  {group.label}
                </div>
                {group.items.map(({ doc, index }) => {
                  const Icon = ICON[doc.kind];
                  const isActive = index === active;
                  const external = /^https?:\/\//.test(doc.href);
                  return (
                    <button
                      key={`${doc.kind}-${doc.href}-${index}`}
                      data-index={index}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => run(doc)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors",
                        isActive ? "bg-surface-2" : "hover:bg-surface-2/60",
                      )}
                    >
                      <Icon size={14} className="shrink-0 text-subtle" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[length:var(--text-small)] text-fg">{doc.title}</span>
                        {doc.subtitle ? (
                          <span className="block truncate text-[length:var(--text-micro)] text-subtle">
                            {doc.subtitle}
                          </span>
                        ) : null}
                      </span>
                      {doc.meta === "mid-sem" ? (
                        <span className="shrink-0 rounded bg-surface-3 px-1.5 py-0.5 text-[length:var(--text-micro)] text-muted">
                          mid-sem
                        </span>
                      ) : null}
                      {external ? (
                        <ExternalLink size={12} className="shrink-0 text-subtle" />
                      ) : isActive ? (
                        <CornerDownLeft size={12} className="shrink-0 text-subtle" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-line px-3.5 py-2 text-[length:var(--text-micro)] text-subtle">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface-2 px-1">↑</kbd>
            <kbd className="rounded border border-line bg-surface-2 px-1">↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface-2 px-1">↵</kbd> open
          </span>
          <span className="ml-auto">{results.length} results</span>
        </div>
      </div>
    </div>
  );
}

/** The button in the header. Dispatches the event the palette listens for. */
export function SearchTrigger({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const mac = hydrated && /Mac|iPhone|iPad/.test(navigator.platform ?? "");

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 text-[length:var(--text-micro)] text-subtle transition-colors hover:bg-surface-3 hover:text-muted focus-ring",
        className,
      )}
      aria-label="Search"
      title="Search (⌘K)"
    >
      <Search size={14} />
      <span className="hidden lg:inline">Search…</span>
      <kbd className="hidden lg:inline rounded border border-line bg-surface px-1 text-[length:var(--text-micro)]">
        {mac ? "⌘" : "Ctrl "}K
      </kbd>
    </button>
  );
}
