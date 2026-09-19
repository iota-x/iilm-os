"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * "3 new" on a post you've already read. The count of replies you last saw
 * lives in localStorage — it's a per-device convenience, not data, so it
 * doesn't need a table or a request.
 */
const KEY = "class:seen";

function read(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}
let cache = "";
let parsed: Record<string, number> = {};
function snapshot() {
  let raw = "";
  try {
    raw = localStorage.getItem(KEY) ?? "";
  } catch {}
  if (raw !== cache) {
    cache = raw;
    parsed = read();
  }
  return parsed;
}
const EMPTY: Record<string, number> = {};

export function useSeen() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

/** Drop on the post page: records how many replies you've now seen. */
export function MarkSeen({ postId, replies }: { postId: string; replies: number }) {
  useEffect(() => {
    try {
      const map = read();
      if (map[postId] === replies) return;
      map[postId] = replies;
      localStorage.setItem(KEY, JSON.stringify(map));
      listeners.forEach((fn) => fn());
    } catch {}
  }, [postId, replies]);
  return null;
}

/** "2 new" — only once you've opened the post before and it has grown since. */
export function NewSince({ postId, replies }: { postId: string; replies: number }) {
  const seen = useSeen();
  const last = seen[postId];
  if (last === undefined || replies <= last) return null;
  const n = replies - last;
  return (
    <span className="rounded-full bg-[var(--accent)] px-1.5 py-px text-[10px] font-semibold leading-4 text-[var(--accent-fg)]">
      {n} new
    </span>
  );
}
