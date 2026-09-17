"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/* localStorage is an external store, so it gets read through
   useSyncExternalStore rather than an effect that calls setState. The server
   snapshot is always `null`, so SSR and the hydration pass agree, and the
   stored value takes over on the first client render after that. */

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function serverSnapshot() {
  return null;
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null; // private mode, blocked site data
    }
  }, [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);

  const value = useMemo<T>(() => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
    // `fallback` is expected to be a module-level constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const set = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore — the UI still works, it just won't be remembered */
      }
      emit();
    },
    [key],
  );

  return [value, set] as const;
}

/** false during SSR and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
