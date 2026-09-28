"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Check, ChevronUp, PenLine, RotateCcw, Sparkles, X } from "lucide-react";
import { pageNoteOf } from "@/data/page-notes";
import { setTopicStatus } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import type { TopicStatus } from "@/lib/db-types";
import { PageReader, type ReaderPage } from "./page-reader";
import { cn } from "@/lib/utils";

/**
 * The default way to read a deck: a vertical scroll-snap feed — flick or scroll
 * and the next page snaps into place, no button. Each page carries its own
 * takeaways and an editable "your notes" box (shared with the focused reader).
 * Scrolling *is* studying: pages tick "seen" as they pass, a "read today" count
 * and progress bar fill up, and a one-tap Got it / Revisit rides along.
 *
 * Drawing lives in the focused reader (PageReader), opened per page from here —
 * a still page is easier to write on than a scrolling one.
 */

const notePath = (uid: string, key: string) => `${uid}/pagenotes/${encodeURIComponent(key)}.json`;
const progPath = (uid: string, key: string) => `${uid}/progress/${encodeURIComponent(key)}.json`;
const istToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

interface Progress {
  seen: Record<string, string>; // page key → ISO date first seen
  got: string[];
  revisit: string[];
}

export function ReaderFeed({
  pages,
  start = 0,
  title,
  userId,
  progressKey,
  topicId,
  topicStatus,
  boardsKey,
  onClose,
}: {
  pages: ReaderPage[];
  start?: number;
  title: string;
  userId: string;
  /** where seen/got/revisit is stored — a topic code or deck name */
  progressKey: string;
  /** when the feed is one topic, its id, so passing pages can nudge it to "learning" */
  topicId?: string;
  topicStatus?: TopicStatus;
  boardsKey?: string;
  onClose: () => void;
}) {
  const [db] = useState(() => createClient());
  const [index, setIndex] = useState(0);
  const [drawAt, setDrawAt] = useState<number | null>(null);

  /* ── progress: seen / got / revisit ─────────────────────────── */
  const [prog, setProg] = useState<Progress>({ seen: {}, got: [], revisit: [] });
  const progLoaded = useRef(false);
  useEffect(() => {
    db.storage
      .from("vault")
      .download(progPath(userId, progressKey))
      .then(async ({ data }) => {
        if (data) {
          const p = JSON.parse(await data.text());
          setProg({ seen: p.seen ?? {}, got: p.got ?? [], revisit: p.revisit ?? [] });
        }
        progLoaded.current = true;
      })
      .catch(() => {
        progLoaded.current = true;
      });
  }, [db, userId, progressKey]);

  const progRef = useRef(prog);
  useEffect(() => {
    progRef.current = prog;
  }, [prog]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveProg = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void db.storage
        .from("vault")
        .upload(progPath(userId, progressKey), new Blob([JSON.stringify(progRef.current)], { type: "application/json" }), {
          upsert: true,
          contentType: "application/json",
        });
    }, 600);
  }, [db, userId, progressKey]);

  // nudge the topic to "learning" the first time any page is seen
  const nudged = useRef(false);
  const markSeen = useCallback(
    (key: string) => {
      if (!progLoaded.current) return;
      setProg((p) => (p.seen[key] ? p : { ...p, seen: { ...p.seen, [key]: istToday() } }));
      if (!nudged.current && topicId && topicStatus === "not_started") {
        nudged.current = true;
        void setTopicStatus(topicId, "learning");
      }
    },
    [topicId, topicStatus],
  );
  useEffect(() => {
    if (progLoaded.current) saveProg();
  }, [prog, saveProg]);

  const toggleMark = (key: string, kind: "got" | "revisit") => {
    setProg((p) => {
      const inGot = p.got.includes(key);
      const inRev = p.revisit.includes(key);
      const got = p.got.filter((k) => k !== key);
      const revisit = p.revisit.filter((k) => k !== key);
      if (kind === "got" && !inGot) got.push(key);
      if (kind === "revisit" && !inRev) revisit.push(key);
      return { ...p, got, revisit };
    });
  };

  const seenCount = pages.filter((p) => prog.seen[p.key]).length;
  const readToday = Object.values(prog.seen).filter((d) => d === istToday()).length;

  /* ── which section is in view ───────────────────────────────── */
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) {
          const i = Number((vis.target as HTMLElement).dataset.i);
          setIndex(i);
          markSeen(pages[i].key);
        }
      },
      { root, threshold: [0.5, 0.75] },
    );
    sectionRefs.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, [pages, markSeen]);

  const scrollToSection = (i: number) => {
    const el = sectionRefs.current[Math.max(0, Math.min(pages.length - 1, i))];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // open at the page the user clicked (no smooth scroll on first paint)
  const jumped = useRef(false);
  useEffect(() => {
    if (jumped.current || start <= 0) return;
    jumped.current = true;
    const el = sectionRefs.current[Math.min(start, pages.length - 1)];
    el?.scrollIntoView({ block: "start" });
    setIndex(Math.min(start, pages.length - 1));
  }, [start, pages.length]);

  /* ── lazy-load each page's "your notes" as it nears view ─────── */
  const [notes, setNotes] = useState<Record<string, string>>({});
  const loadNote = useCallback(
    (key: string) => {
      if (notes[key] !== undefined) return;
      db.storage
        .from("vault")
        .download(notePath(userId, key))
        .then(async ({ data }) => {
          const md = data ? String(JSON.parse(await data.text()).md ?? "") : "";
          setNotes((m) => (m[key] !== undefined ? m : { ...m, [key]: md }));
        })
        .catch(() => setNotes((m) => (m[key] !== undefined ? m : { ...m, [key]: "" })));
    },
    [db, userId, notes],
  );
  // load the note for the visible page and its neighbours
  useEffect(() => {
    [index - 1, index, index + 1].forEach((i) => pages[i] && loadNote(pages[i].key));
  }, [index, pages, loadNote]);

  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const editNote = (key: string, md: string) => {
    setNotes((m) => ({ ...m, [key]: md }));
    if (noteTimers.current[key]) clearTimeout(noteTimers.current[key]);
    noteTimers.current[key] = setTimeout(() => {
      void db.storage
        .from("vault")
        .upload(notePath(userId, key), new Blob([JSON.stringify({ v: 1, md })], { type: "application/json" }), {
          upsert: true,
          contentType: "application/json",
        });
    }, 700);
  };

  /* ── keyboard + no body scroll ──────────────────────────────── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const pathname = usePathname();
  const startPath = useRef(pathname);
  useEffect(() => {
    if (pathname !== startPath.current) onClose();
  }, [pathname, onClose]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (drawAt !== null) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" || t.tagName === "INPUT") return;
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        scrollToSection(index + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToSection(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pct = Math.round(((index + 1) / pages.length) * 100);

  const ui = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)] md:left-[var(--reader-inset-left,264px)]">
      {/* top bar + progress */}
      <div className="shrink-0 border-b border-line bg-surface">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="mr-auto min-w-0">
            <p className="truncate text-[length:var(--text-small)] font-semibold">{title}</p>
            <p className="text-[length:var(--text-micro)] text-subtle">
              page {index + 1} of {pages.length} · {seenCount} seen
              {readToday > 0 ? ` · ${readToday} read today` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close (Esc)"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] text-muted hover:bg-surface-2 hover:text-fg focus-ring"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-1 w-full bg-surface-3">
          <div className="h-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* the feed */}
      <div ref={scrollRef} className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto scroll-smooth">
        {pages.map((page, i) => {
          const note = pageNoteOf(page.key);
          const got = prog.got.includes(page.key);
          const revisit = prog.revisit.includes(page.key);
          return (
            <section
              key={page.key + i}
              data-i={i}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              className="flex h-full snap-start snap-always flex-col md:flex-row"
            >
              {/* page image */}
              <div className="relative grid min-h-0 flex-1 place-items-center bg-[var(--bg)] p-3 max-md:h-[46%] max-md:flex-none">
                {page.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={page.src}
                    alt={page.caption ?? `page ${i + 1}`}
                    loading={Math.abs(i - index) <= 2 ? "eager" : "lazy"}
                    className="max-h-full max-w-full rounded-[6px] bg-white object-contain shadow-[var(--shadow-sm)]"
                  />
                ) : (
                  <div className="grid h-full w-full max-w-md place-items-center rounded-[6px] border border-dashed border-line bg-white text-subtle">
                    Blank page
                  </div>
                )}
                <button
                  onClick={() => setDrawAt(i)}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-line bg-surface/95 px-3 py-1.5 text-[length:var(--text-micro)] font-medium shadow-[var(--shadow-sm)] hover:bg-surface-2 focus-ring"
                >
                  <PenLine size={13} /> Draw / write on page
                </button>
              </div>

              {/* takeaways + your notes + got it */}
              <aside className="flex min-h-0 flex-col border-t border-line bg-surface md:w-[380px] md:shrink-0 md:border-l md:border-t-0 lg:w-[420px]">
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
                  {note ? (
                    <section>
                      <p className="flex items-center gap-1.5 text-[length:var(--text-micro)] font-medium uppercase tracking-wide text-subtle">
                        <Sparkles size={12} className="text-sc" /> Takeaways
                      </p>
                      <p className="mt-1.5 text-[length:var(--text-small)] font-semibold leading-snug">{note.title}</p>
                      <ul className="mt-2 space-y-1.5">
                        {note.points.map((pt, k) => (
                          <li key={k} className="flex gap-2 text-[length:var(--text-small)] leading-relaxed text-muted">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sc" aria-hidden />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                      {note.watch ? (
                        <p className="mt-2.5 rounded-[8px] border border-[var(--warn)]/35 bg-[var(--warn-soft)] px-2.5 py-1.5 text-[length:var(--text-small)] leading-relaxed text-[var(--warn)]">
                          <span className="font-semibold">Watch out — </span>
                          {note.watch}
                        </p>
                      ) : null}
                    </section>
                  ) : page.caption ? (
                    <section>
                      <p className="text-[length:var(--text-micro)] font-medium uppercase tracking-wide text-subtle">This page</p>
                      <p className="mt-1.5 text-[length:var(--text-small)] leading-relaxed text-muted">{page.caption}</p>
                    </section>
                  ) : null}

                  <section className="flex min-h-0 flex-1 flex-col">
                    <p className="text-[length:var(--text-micro)] font-medium uppercase tracking-wide text-subtle">Your notes</p>
                    <textarea
                      value={notes[page.key] ?? ""}
                      disabled={notes[page.key] === undefined}
                      onChange={(e) => editNote(page.key, e.target.value)}
                      placeholder="Write your own points… (saved automatically)"
                      className="mt-1.5 min-h-[110px] w-full flex-1 resize-y rounded-[10px] border border-line bg-surface-2/50 p-3 text-[length:var(--text-small)] leading-relaxed outline-none focus:border-[var(--accent)] focus-ring"
                    />
                  </section>
                </div>

                {/* got it / revisit */}
                <div className="flex shrink-0 items-center gap-2 border-t border-line px-4 py-2.5">
                  <button
                    onClick={() => toggleMark(page.key, "got")}
                    aria-pressed={got}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-control)] border px-3 py-2 text-[length:var(--text-small)] font-medium transition-colors focus-ring",
                      got
                        ? "border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]"
                        : "border-line text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <Check size={15} /> Got it
                  </button>
                  <button
                    onClick={() => toggleMark(page.key, "revisit")}
                    aria-pressed={revisit}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-control)] border px-3 py-2 text-[length:var(--text-small)] font-medium transition-colors focus-ring",
                      revisit
                        ? "border-[var(--warn)] bg-[var(--warn-soft)] text-[var(--warn)]"
                        : "border-line text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <RotateCcw size={15} /> Revisit
                  </button>
                </div>
              </aside>
            </section>
          );
        })}
      </div>

      {/* next hint */}
      {index < pages.length - 1 ? (
        <button
          onClick={() => scrollToSection(index + 1)}
          aria-label="Next page"
          className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-surface/90 px-3 py-1 text-[length:var(--text-micro)] text-muted shadow-[var(--shadow-sm)] hover:bg-surface-2 focus-ring max-md:hidden"
        >
          <ChevronUp size={13} className="rotate-180" /> scroll for next
        </button>
      ) : null}

      {drawAt !== null ? (
        <PageReader
          pages={pages}
          start={drawAt}
          title={title}
          userId={userId}
          boardsKey={boardsKey}
          onClose={() => {
            const k = pages[drawAt]?.key;
            setDrawAt(null);
            // the note may have changed in the focused reader — refetch it
            if (k)
              setNotes((m) => {
                const rest = { ...m };
                delete rest[k];
                return rest;
              });
          }}
        />
      ) : null}
    </div>
  );

  return createPortal(ui, document.body);
}
