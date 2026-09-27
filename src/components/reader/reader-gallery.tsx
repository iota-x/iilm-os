"use client";

import { useState } from "react";
import { BookOpen, PenLine } from "lucide-react";
import { PageReader, type ReaderPage } from "./page-reader";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  /** annotation key: the file name for deck pages, the attachment id for photos */
  key: string;
  storagePath: string;
  caption: string;
}

const src = (path: string) => `/api/vault/${path}`;
const userOf = (items: GalleryItem[]) => items[0]?.storagePath.split("/")[0] ?? "";

/**
 * A grid of pages or board photos. Clicking one opens the in-app reader
 * (next/previous, whiteboard ink) instead of a raw image in a new tab.
 */
export function ReaderGallery({
  items,
  title,
  variant,
  boardsKey,
}: {
  items: GalleryItem[];
  title: string;
  variant: "pages" | "photos";
  /** lets the reader add blank whiteboard pages after these */
  boardsKey?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const pages: ReaderPage[] = items.map((i) => ({ key: i.key, src: src(i.storagePath), caption: i.caption }));

  return (
    <>
      <ul className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => (
          <li key={f.key + f.storagePath} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
            <button
              onClick={() => setOpen(i)}
              className="group relative block w-full text-left focus-ring"
              aria-label={`Open ${f.caption || "page"} in the reader`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(f.storagePath)}
                alt={f.caption}
                loading="lazy"
                className={cn(
                  "w-full bg-white",
                  variant === "photos" && "aspect-[4/3] bg-surface-2 object-cover",
                )}
              />
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[length:var(--text-micro)] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <PenLine size={11} /> Open · write on it
              </span>
            </button>
            {f.caption ? (
              <p className="px-2.5 py-2 text-[length:var(--text-micro)] leading-snug text-muted">{f.caption}</p>
            ) : null}
          </li>
        ))}
      </ul>
      {open !== null ? (
        <PageReader
          pages={pages}
          start={open}
          title={title}
          userId={userOf(items)}
          boardsKey={boardsKey}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}

/** Whole decks for a subject, each one a button that opens the reader at page 1. */
export function DeckShelf({ decks }: { decks: { name: string; items: GalleryItem[] }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const deck = open !== null ? decks[open] : null;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {decks.map((d, i) => (
          <button
            key={d.name}
            onClick={() => setOpen(i)}
            className="flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-[length:var(--text-small)] font-medium transition-colors hover:bg-surface-2 focus-ring"
          >
            <BookOpen size={15} className="text-sc" />
            {d.name}
            <span className="tabular-nums text-subtle">{d.items.length} pages</span>
          </button>
        ))}
      </div>
      {deck ? (
        <PageReader
          pages={deck.items.map((i) => ({ key: i.key, src: src(i.storagePath), caption: i.caption }))}
          start={0}
          title={deck.name}
          userId={userOf(deck.items)}
          boardsKey={`deck-${deck.name}`}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
