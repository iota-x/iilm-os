"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eraser,
  Hand,
  Highlighter,
  LayoutGrid,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Minus,
  Pen,
  Plus,
  Redo2,
  StickyNote,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { pageNoteOf } from "@/data/page-notes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * A full-screen reader for note pages, slides and board photos — with a
 * whiteboard layer on every page. Pen, highlighter, eraser and typed text;
 * everything is saved to the user's own storage as
 * `<user>/annotations/<page key>.json`, so it follows them to any device and
 * the same DENotes page carries the same ink whichever topic opened it.
 *
 * Coordinates are stored as fractions of the page's width and height, so ink
 * stays put at any zoom or screen size.
 */

export interface ReaderPage {
  /** stable id for this page's ink — the file name for deck pages */
  key: string;
  /** image url; null = a blank whiteboard page */
  src: string | null;
  caption?: string;
}

type Tool = "view" | "pen" | "hl" | "eraser" | "text";
type Stroke = { kind: "pen" | "hl"; color: string; w: number; pts: number[] };
type TextItem = { kind: "text"; x: number; y: number; text: string; color: string; size: number };
type Item = Stroke | TextItem;
type SaveState = "idle" | "saving" | "saved" | "error";

const PEN_COLORS = ["#1b1915", "#c92a2a", "#1b6bc9", "#0c7a54"];
const HL_COLORS = ["#ffd43b", "#8ce99a", "#ffa8d6", "#74c0fc"];
const PEN_WIDTHS = [0.0022, 0.004, 0.0075]; // fraction of page width
const HL_WIDTH = 0.02;
const TEXT_SIZE = 0.024;
const BLANK_ASPECT = 1 / 1.414; // A4 portrait

const inkPath = (uid: string, key: string) => `${uid}/annotations/${encodeURIComponent(key)}.json`;
const boardsPath = (uid: string, ctx: string) => `${uid}/annotations/boards-${encodeURIComponent(ctx)}.json`;
const myNotePath = (uid: string, key: string) => `${uid}/pagenotes/${encodeURIComponent(key)}.json`;

export function PageReader({
  pages: basePages,
  start,
  title,
  userId,
  boardsKey,
  onClose,
}: {
  pages: ReaderPage[];
  start: number;
  title: string;
  userId: string;
  /** when set, blank whiteboard pages can be added after the last page */
  boardsKey?: string;
  onClose: () => void;
}) {
  const [db] = useState(() => createClient());
  const [boards, setBoards] = useState(0);
  const pages: ReaderPage[] = [
    ...basePages,
    ...Array.from({ length: boards }, (_, i) => ({
      key: `board-${boardsKey}-${i + 1}`,
      src: null,
      caption: `Blank page ${i + 1}`,
    })),
  ];
  const [index, setIndex] = useState(Math.min(start, Math.max(0, basePages.length - 1)));
  const page = pages[Math.min(index, pages.length - 1)];

  const [tool, setTool] = useState<Tool>("view");
  const [penColor, setPenColor] = useState(PEN_COLORS[1]);
  const [hlColor, setHlColor] = useState(HL_COLORS[0]);
  const [penWidth, setPenWidth] = useState(PEN_WIDTHS[1]);
  const [zoom, setZoom] = useState(1);
  const [thumbs, setThumbs] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [save, setSave] = useState<SaveState>("idle");
  const [panel, setPanel] = useState(true);

  // the reader's own explainer for this page (mine), and the user's own notes
  const note = pageNoteOf(page.key);
  const [myNotes, setMyNotes] = useState<Record<string, string>>({});
  const myNote = myNotes[page.key];
  const [noteSave, setNoteSave] = useState<SaveState>("idle");

  // ink per page, loaded lazily and kept for the session
  const [inks, setInks] = useState<Record<string, Item[]>>({});
  const items: Item[] | null = inks[page.key] ?? null;
  const setItems = (next: Item[]) => setInks((m) => ({ ...m, [page.key]: next }));
  // undo/redo per page; the counts live in state so the buttons can render them
  const undoStack = useRef<Item[][]>([]);
  const redoStack = useRef<Item[][]>([]);
  const [stackSizes, setStackSizes] = useState({ undo: 0, redo: 0 });
  const syncStacks = () => setStackSizes({ undo: undoStack.current.length, redo: redoStack.current.length });

  /* ── blank boards count ─────────────────────────────────────── */
  useEffect(() => {
    if (!boardsKey) return;
    db.storage
      .from("vault")
      .download(boardsPath(userId, boardsKey))
      .then(async ({ data }) => {
        if (data) setBoards(Number(JSON.parse(await data.text()).count) || 0);
      })
      .catch(() => {});
  }, [boardsKey, db, userId]);

  const addBoard = async () => {
    if (!boardsKey) return;
    const next = boards + 1;
    setBoards(next);
    // the new page isn't in `pages` until the next render, so don't clamp here
    setIndex(basePages.length + next - 1);
    setConfirmClear(false);
    setStackSizes({ undo: 0, redo: 0 });
    setTool("pen");
    await db.storage
      .from("vault")
      .upload(boardsPath(userId, boardsKey), new Blob([JSON.stringify({ count: next })], { type: "application/json" }), {
        upsert: true,
        contentType: "application/json",
      });
  };

  /* ── load this page's ink ───────────────────────────────────── */
  const loaded = inks[page.key] !== undefined;
  useEffect(() => {
    undoStack.current = [];
    redoStack.current = [];
    if (loaded) return;
    const key = page.key;
    db.storage
      .from("vault")
      .download(inkPath(userId, key))
      .then(async ({ data }) => {
        const got: Item[] = data ? (JSON.parse(await data.text()).items ?? []) : [];
        setInks((m) => (m[key] ? m : { ...m, [key]: got }));
      })
      .catch(() => setInks((m) => (m[key] ? m : { ...m, [key]: [] })));
  }, [page.key, loaded, db, userId]);

  // load the user's own notes for this page
  const myLoaded = myNotes[page.key] !== undefined;
  useEffect(() => {
    if (myLoaded) return;
    const key = page.key;
    db.storage
      .from("vault")
      .download(myNotePath(userId, key))
      .then(async ({ data }) => {
        const md = data ? String(JSON.parse(await data.text()).md ?? "") : "";
        setMyNotes((m) => (m[key] !== undefined ? m : { ...m, [key]: md }));
      })
      .catch(() => setMyNotes((m) => (m[key] !== undefined ? m : { ...m, [key]: "" })));
  }, [page.key, myLoaded, db, userId]);

  // save the user's notes, debounced per page
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notePending = useRef<{ key: string; md: string } | null>(null);
  const flushNote = useCallback(async () => {
    const job = notePending.current;
    if (!job) return;
    notePending.current = null;
    setNoteSave("saving");
    const { error } = await db.storage
      .from("vault")
      .upload(myNotePath(userId, job.key), new Blob([JSON.stringify({ v: 1, md: job.md })], { type: "application/json" }), {
        upsert: true,
        contentType: "application/json",
      });
    setNoteSave(error ? "error" : "saved");
  }, [db, userId]);
  const editMyNote = (key: string, md: string) => {
    setMyNotes((m) => ({ ...m, [key]: md }));
    notePending.current = { key, md };
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(flushNote, 700);
  };
  useEffect(() => {
    return () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
      void flushNote();
    };
  }, [page.key, flushNote]);

  /* ── saving: debounced, per page ────────────────────────────── */
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ key: string; items: Item[] } | null>(null);
  const flush = useCallback(async () => {
    const job = pending.current;
    if (!job) return;
    pending.current = null;
    setSave("saving");
    const { error } = await db.storage
      .from("vault")
      .upload(
        inkPath(userId, job.key),
        new Blob([JSON.stringify({ v: 1, items: job.items })], { type: "application/json" }),
        { upsert: true, contentType: "application/json" },
      );
    setSave(error ? "error" : "saved");
  }, [db, userId]);

  const commit = (next: Item[]) => {
    if (items) undoStack.current.push(items);
    redoStack.current = [];
    syncStacks();
    setItems(next);
    pending.current = { key: page.key, items: next };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 700);
  };
  // leaving a page (or closing) writes straight away
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      void flush();
    };
  }, [page.key, flush]);

  const undo = () => {
    const prev = undoStack.current.pop();
    if (!prev || !items) return;
    redoStack.current.push(items);
    syncStacks();
    setItems(prev);
    pending.current = { key: page.key, items: prev };
    void flush();
  };
  const redo = () => {
    const next = redoStack.current.pop();
    if (!next || !items) return;
    undoStack.current.push(items);
    syncStacks();
    setItems(next);
    pending.current = { key: page.key, items: next };
    void flush();
  };

  /* ── navigation ─────────────────────────────────────────────── */
  const jump = (i: number) => {
    setIndex(Math.max(0, Math.min(pages.length - 1, i)));
    setConfirmClear(false);
    setStackSizes({ undo: 0, redo: 0 });
  };
  const go = (d: number) => jump(index + d);

  const [editing, setEditing] = useState<{ x: number; y: number; text: string; color: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" || t.tagName === "INPUT") return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod) return;
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
      else if (e.key === "v") setTool("view");
      else if (e.key === "p") setTool("pen");
      else if (e.key === "h") setTool("hl");
      else if (e.key === "e") setTool("eraser");
      else if (e.key === "t") setTool("text");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // no page scroll behind the reader
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // a sidebar click changes the route — close so the new page shows
  const pathname = usePathname();
  const startPath = useRef(pathname);
  useEffect(() => {
    if (pathname !== startPath.current) onClose();
  }, [pathname, onClose]);

  /* ── sizing: fit the page to the stage, then zoom ───────────── */
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 800, h: 600 });
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const aspect = page.src ? (aspects[page.src] ?? BLANK_ASPECT) : BLANK_ASPECT;
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStage({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = 24;
  const fitW = Math.max(200, Math.min(stage.w - pad * 2, (stage.h - pad * 2) * aspect));
  const pageW = Math.round(fitW * zoom);
  const pageH = Math.round(pageW / aspect);

  /* ── drawing ────────────────────────────────────────────────── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef<Stroke | null>(null);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    if (c.width !== pageW * dpr || c.height !== pageH * dpr) {
      c.width = pageW * dpr;
      c.height = pageH * dpr;
    }
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, pageW, pageH);
    const all = [...(items ?? []), ...(live.current ? [live.current] : [])];
    for (const it of all) {
      if (it.kind === "text") {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = it.color;
        const px = it.size * pageW;
        ctx.font = `500 ${px}px -apple-system, "Segoe UI", sans-serif`;
        ctx.textBaseline = "top";
        it.text.split("\n").forEach((line, i) => ctx.fillText(line, it.x * pageW, it.y * pageH + i * px * 1.25));
        continue;
      }
      const p = it.pts;
      if (p.length < 2) continue;
      ctx.globalAlpha = it.kind === "hl" ? 0.38 : 1;
      ctx.globalCompositeOperation = it.kind === "hl" ? "multiply" : "source-over";
      ctx.strokeStyle = it.color;
      ctx.lineWidth = it.w * pageW;
      ctx.lineCap = it.kind === "hl" ? "butt" : "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(p[0] * pageW, p[1] * pageH);
      if (p.length === 2) ctx.lineTo(p[0] * pageW + 0.01, p[1] * pageH);
      for (let i = 2; i < p.length - 2; i += 2) {
        const mx = ((p[i] + p[i + 2]) / 2) * pageW;
        const my = ((p[i + 1] + p[i + 3]) / 2) * pageH;
        ctx.quadraticCurveTo(p[i] * pageW, p[i + 1] * pageH, mx, my);
      }
      if (p.length >= 4) ctx.lineTo(p[p.length - 2] * pageW, p[p.length - 1] * pageH);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }, [items, pageW, pageH]);

  useEffect(draw, [draw]);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  // hit test for the eraser and for editing text: distance in page pixels
  const hit = (it: Item, x: number, y: number) => {
    const R = 10;
    if (it.kind === "text") {
      const px = it.size * pageW;
      const lines = it.text.split("\n");
      const w = Math.max(...lines.map((l) => l.length)) * px * 0.55;
      const h = lines.length * px * 1.25;
      const X = x * pageW, Y = y * pageH, x0 = it.x * pageW, y0 = it.y * pageH;
      return X >= x0 - R && X <= x0 + w + R && Y >= y0 - R && Y <= y0 + h + R;
    }
    const tol = R + (it.w * pageW) / 2;
    for (let i = 0; i < it.pts.length; i += 2) {
      const dx = (it.pts[i] - x) * pageW, dy = (it.pts[i + 1] - y) * pageH;
      if (dx * dx + dy * dy <= tol * tol) return true;
    }
    return false;
  };

  const swipe = useRef<{ x: number; y: number } | null>(null);
  const erasedAny = useRef(false);

  const onDown = (e: React.PointerEvent) => {
    if (!items) return;
    const { x, y } = pos(e);
    if (tool === "view") {
      swipe.current = { x: e.clientX, y: e.clientY };
      return;
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (tool === "pen" || tool === "hl") {
      live.current = {
        kind: tool,
        color: tool === "pen" ? penColor : hlColor,
        w: tool === "pen" ? penWidth : HL_WIDTH,
        pts: [x, y],
      };
      draw();
    } else if (tool === "eraser") {
      erasedAny.current = false;
      eraseAt(x, y);
    } else if (tool === "text") {
      // keep focus off the canvas so the text box that opens keeps it
      e.preventDefault();
      const existing = [...items].reverse().find((it) => it.kind === "text" && hit(it, x, y)) as TextItem | undefined;
      if (existing) {
        commit(items.filter((it) => it !== existing));
        setEditing({ x: existing.x, y: existing.y, text: existing.text, color: existing.color });
      } else {
        setEditing({ x, y, text: "", color: penColor });
      }
    }
  };

  const eraseAt = (x: number, y: number) => {
    if (!items) return;
    const keep = items.filter((it) => !hit(it, x, y));
    if (keep.length !== items.length) {
      erasedAny.current = true;
      commit(keep);
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (tool === "pen" || tool === "hl") {
      if (!live.current) return;
      const { x, y } = pos(e);
      const p = live.current.pts;
      const dx = (x - p[p.length - 2]) * pageW, dy = (y - p[p.length - 1]) * pageH;
      if (dx * dx + dy * dy < 2) return;
      p.push(+x.toFixed(4), +y.toFixed(4));
      draw();
    } else if (tool === "eraser" && e.buttons) {
      const { x, y } = pos(e);
      eraseAt(x, y);
    }
  };

  const onUp = (e: React.PointerEvent) => {
    if (tool === "view" && swipe.current) {
      const dx = e.clientX - swipe.current.x, dy = e.clientY - swipe.current.y;
      swipe.current = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && zoom === 1) go(dx < 0 ? 1 : -1);
      return;
    }
    if (live.current && items) {
      const s = live.current;
      live.current = null;
      commit([...items, s]);
    }
  };

  const commitText = () => {
    if (!editing || !items) return;
    const text = editing.text.trimEnd();
    setEditing(null);
    if (text) commit([...items, { kind: "text", x: editing.x, y: editing.y, text, color: editing.color, size: TEXT_SIZE }]);
  };

  const clearPage = () => {
    if (!items?.length) return;
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 2500);
      return;
    }
    setConfirmClear(false);
    commit([]);
  };

  /* ── ui ─────────────────────────────────────────────────────── */
  const toolBtn = (t: Tool, icon: React.ReactNode, label: string) => (
    <button
      key={t}
      onClick={() => setTool(t)}
      title={label}
      aria-label={label}
      aria-pressed={tool === t}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-[var(--radius-control)] transition-colors focus-ring",
        tool === t ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {icon}
    </button>
  );

  const palette = tool === "hl" ? HL_COLORS : PEN_COLORS;
  const current = tool === "hl" ? hlColor : penColor;
  const inkCount = items?.length ?? 0;

  const ui = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)] md:left-[var(--reader-inset-left,264px)]" role="dialog" aria-label={title}>
      {/* top bar */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-line bg-surface px-3 py-2">
        <div className="mr-auto min-w-0">
          <p className="truncate text-[length:var(--text-small)] font-semibold">{title}</p>
          <p className="truncate text-[length:var(--text-micro)] text-subtle">
            {index + 1} / {pages.length}
            {page.caption ? ` · ${page.caption}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-0.5 rounded-[10px] border border-line p-0.5">
          {toolBtn("view", <Hand size={16} />, "Move / swipe pages (V)")}
          {toolBtn("pen", <Pen size={16} />, "Pen (P)")}
          {toolBtn("hl", <Highlighter size={16} />, "Highlighter (H)")}
          {toolBtn("text", <Type size={16} />, "Text — click to write, click text to edit (T)")}
          {toolBtn("eraser", <Eraser size={16} />, "Eraser (E)")}
        </div>

        {tool === "pen" || tool === "hl" || tool === "text" ? (
          <div className="flex items-center gap-1">
            {(tool === "text" ? PEN_COLORS : palette).map((c) => (
              <button
                key={c}
                onClick={() => (tool === "hl" ? setHlColor(c) : setPenColor(c))}
                aria-label={`colour ${c}`}
                className={cn(
                  "h-6 w-6 rounded-full border-2 focus-ring",
                  (tool === "text" ? penColor : current) === c ? "border-[var(--fg)]" : "border-transparent",
                )}
                style={{ background: c }}
              />
            ))}
            {tool === "pen"
              ? PEN_WIDTHS.map((w, i) => (
                  <button
                    key={w}
                    onClick={() => setPenWidth(w)}
                    aria-label={`thickness ${i + 1}`}
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-[var(--radius-control)] focus-ring",
                      penWidth === w ? "bg-surface-3" : "hover:bg-surface-2",
                    )}
                  >
                    <span className="rounded-full bg-[var(--fg)]" style={{ width: 3 + i * 3, height: 3 + i * 3 }} />
                  </button>
                ))
              : null}
          </div>
        ) : null}

        <div className="flex items-center gap-0.5">
          <IconBtn label="Undo (⌘Z)" onClick={undo} disabled={!stackSizes.undo}>
            <Undo2 size={16} />
          </IconBtn>
          <IconBtn label="Redo (⇧⌘Z)" onClick={redo} disabled={!stackSizes.redo}>
            <Redo2 size={16} />
          </IconBtn>
          <IconBtn label={confirmClear ? "Tap again to clear this page" : "Clear this page"} onClick={clearPage} disabled={!inkCount}>
            <Trash2 size={16} className={confirmClear ? "text-[var(--bad)]" : undefined} />
          </IconBtn>
          <span className="mx-1 h-5 w-px bg-[var(--border)]" />
          <IconBtn label="Zoom out" onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))} disabled={zoom === 1}>
            <Minus size={16} />
          </IconBtn>
          <span className="w-9 text-center text-[length:var(--text-micro)] tabular-nums text-muted">{Math.round(zoom * 100)}%</span>
          <IconBtn label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.5))} disabled={zoom >= 3}>
            <Plus size={16} />
          </IconBtn>
          <IconBtn
            label={panel ? "Hide takeaways" : "Takeaways & your notes"}
            onClick={() => setPanel((v) => !v)}
            active={panel}
          >
            {panel ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </IconBtn>
          <IconBtn label="All pages" onClick={() => setThumbs((v) => !v)} active={thumbs}>
            <LayoutGrid size={16} />
          </IconBtn>
          {boardsKey ? (
            <IconBtn label="Add a blank page" onClick={addBoard}>
              <StickyNote size={16} />
            </IconBtn>
          ) : null}
          <span
            className={cn(
              "ml-1 hidden w-14 text-[length:var(--text-micro)] sm:inline",
              save === "error" ? "text-[var(--bad)]" : "text-subtle",
            )}
          >
            {save === "saving" ? "Saving…" : save === "saved" ? "Saved" : save === "error" ? "Not saved" : ""}
          </span>
          <IconBtn label="Close (Esc)" onClick={onClose}>
            <X size={18} />
          </IconBtn>
        </div>
      </div>

      {/* stage + takeaways panel */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div className="relative min-h-0 flex-1">
        <div ref={stageRef} className="absolute inset-0 overflow-auto">
          <div className="flex min-h-full min-w-full items-center justify-center" style={{ padding: pad }}>
            <div
              className="relative shrink-0 overflow-hidden rounded-[4px] bg-white shadow-[var(--shadow)]"
              style={{ width: pageW, height: pageH }}
            >
              {page.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={page.src}
                  src={page.src}
                  alt={page.caption ?? `page ${index + 1}`}
                  draggable={false}
                  onLoad={(e) => {
                    const im = e.currentTarget;
                    const src = page.src!;
                    if (im.naturalWidth && im.naturalHeight)
                      setAspects((m) => (m[src] ? m : { ...m, [src]: im.naturalWidth / im.naturalHeight }));
                  }}
                  className="pointer-events-none absolute inset-0 h-full w-full select-none"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, transparent calc(100% - 1px), rgb(27 107 201 / 0.14) calc(100% - 1px))",
                    backgroundSize: `100% ${Math.max(18, Math.round(pageH / 34))}px`,
                  }}
                />
              )}
              <canvas
                ref={canvasRef}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                className={cn(
                  "absolute inset-0 h-full w-full",
                  tool === "view" ? "cursor-grab touch-pan-y" : "touch-none",
                  tool === "pen" || tool === "hl" ? "cursor-crosshair" : "",
                  tool === "text" ? "cursor-text" : "",
                  tool === "eraser" ? "cursor-cell" : "",
                )}
                style={{ width: pageW, height: pageH }}
              />
              {editing ? (
                <textarea
                  ref={(el) => {
                    if (el && document.activeElement !== el) setTimeout(() => el.focus(), 0);
                  }}
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                  onBlur={commitText}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      commitText();
                    } else if (e.key === "Escape") {
                      e.stopPropagation();
                      setEditing(null);
                    }
                  }}
                  placeholder="Type, Enter to place"
                  rows={Math.max(1, editing.text.split("\n").length)}
                  className="absolute resize-none rounded border border-[var(--accent)] bg-white/90 p-0.5 font-medium outline-none"
                  style={{
                    left: editing.x * pageW,
                    top: editing.y * pageH,
                    color: editing.color,
                    fontSize: TEXT_SIZE * pageW,
                    lineHeight: 1.25,
                    minWidth: 140,
                  }}
                />
              ) : null}
              {items === null ? (
                <div className="absolute right-2 top-2 rounded bg-surface/90 px-2 py-0.5 text-[length:var(--text-micro)] text-subtle">
                  loading ink…
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* page arrows */}
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous page"
          className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/95 shadow-[var(--shadow-sm)] transition-opacity hover:bg-surface-2 disabled:opacity-0 focus-ring"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => go(1)}
          disabled={index >= pages.length - 1}
          aria-label="Next page"
          className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/95 shadow-[var(--shadow-sm)] transition-opacity hover:bg-surface-2 disabled:opacity-0 focus-ring"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {panel ? (
        <aside className="flex min-h-0 shrink-0 flex-col border-t border-line bg-surface max-md:max-h-[46vh] md:min-w-[320px] md:max-w-[460px] md:basis-[38%] md:border-l md:border-t-0">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {note ? (
              <section>
                <p className="flex items-center gap-1.5 text-[length:var(--text-micro)] font-medium uppercase tracking-wide text-subtle">
                  <Sparkles size={12} className="text-sc" /> Takeaways
                </p>
                <p className="mt-1.5 text-[length:var(--text-small)] font-semibold leading-snug">{note.title}</p>
                <ul className="mt-2 space-y-1.5">
                  {note.points.map((pt, i) => (
                    <li key={i} className="flex gap-2 text-[length:var(--text-small)] leading-relaxed text-muted">
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
            ) : (
              <section>
                <p className="text-[length:var(--text-micro)] font-medium uppercase tracking-wide text-subtle">Takeaways</p>
                <p className="mt-1.5 text-[length:var(--text-small)] leading-relaxed text-subtle">
                  No takeaways written for this page yet — jot your own below.
                </p>
              </section>
            )}

            <section className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between">
                <p className="text-[length:var(--text-micro)] font-medium uppercase tracking-wide text-subtle">Your notes</p>
                <span
                  className={cn(
                    "text-[length:var(--text-micro)]",
                    noteSave === "error" ? "text-[var(--bad)]" : "text-subtle",
                  )}
                >
                  {noteSave === "saving" ? "Saving…" : noteSave === "saved" ? "Saved" : ""}
                </span>
              </div>
              <textarea
                value={myNote ?? ""}
                disabled={myNote === undefined}
                onChange={(e) => editMyNote(page.key, e.target.value)}
                placeholder="Write your own points, doubts, examples… (saved automatically)"
                className="mt-1.5 min-h-[180px] w-full flex-1 resize-y rounded-[10px] border border-line bg-surface-2/50 p-3 text-[length:var(--text-small)] leading-relaxed outline-none focus:border-[var(--accent)] focus-ring"
              />
              <p className="mt-1 text-[length:var(--text-micro)] text-subtle">
                Kept per page — it follows this page wherever you open it.
              </p>
            </section>
          </div>
        </aside>
      ) : null}
      </div>

      {/* thumbnails */}
      {thumbs ? (
        <div className="flex gap-2 overflow-x-auto border-t border-line bg-surface px-3 py-2">
          {pages.map((p, i) => (
            <button
              key={p.key}
              onClick={() => jump(i)}
              className={cn(
                "relative h-20 shrink-0 overflow-hidden rounded border-2 bg-white focus-ring",
                i === index ? "border-[var(--accent)]" : "border-transparent hover:border-[var(--border-strong)]",
              )}
              style={{ width: p.src ? undefined : 56 }}
              title={p.caption}
            >
              {p.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.src} alt="" loading="lazy" className="h-full w-auto" />
              ) : (
                <StickyNote size={16} className="mx-auto text-subtle" />
              )}
              <span className="absolute bottom-0 left-0 rounded-tr bg-black/60 px-1 text-[10px] text-white tabular-nums">
                {i + 1}
              </span>
              {(inks[p.key]?.length ?? 0) > 0 ? (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--accent)]" title="has your ink" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  return createPortal(ui, document.body);
}

function IconBtn({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-[var(--radius-control)] transition-colors focus-ring disabled:opacity-35",
        active ? "bg-surface-3 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
