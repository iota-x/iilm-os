"use client";

import type * as React from "react";
import { ThemeProvider as NextThemes, useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useHydrated } from "@/lib/client-hooks";
import { cn } from "@/lib/utils";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}

const OPTIONS = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "dark", icon: Moon, label: "Dark" },
  { key: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle({ full = false }: { full?: boolean }) {
  // next-themes can resolve the stored theme on the very first client render,
  // while the server has no idea what it is — so aria-checked/className differ
  // and React reports a hydration mismatch. Hold the server's answer (nothing
  // selected) until after mount, then switch to the real one.
  const { theme, setTheme } = useTheme();
  const mounted = useHydrated();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-surface-2 p-0.5 border border-line",
        full && "w-full",
      )}
      role="radiogroup"
      aria-label="Theme"
    >
      {OPTIONS.map(({ key, icon: Icon, label }) => {
        const active = mounted && theme === key;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(key)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-[7px] h-7 transition-colors focus-ring",
              full ? "flex-1 text-[length:var(--text-micro)]" : "w-7",
              active ? "bg-surface shadow-card text-fg" : "text-subtle hover:text-fg",
            )}
          >
            <Icon size={14} strokeWidth={2} />
            {full ? label : null}
          </button>
        );
      })}
    </div>
  );
}
