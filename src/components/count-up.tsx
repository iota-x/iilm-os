"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up to its value on first paint — 0 → 17 over ~600ms
 * with an ease-out, so the big figures land rather than appear. Renders the
 * final value at once under reduced motion, or when the value isn't a
 * plain integer.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const target = /^\d+$/.test(value) ? Number(value) : null;
  const ref = useRef<HTMLSpanElement>(null);
  // Only the initial frame is React state; the rest is written straight to
  // the DOM from the animation loop, which keeps the effect free of setState.
  const [start] = useState(() => (target === null ? value : "0"));

  useEffect(() => {
    const el = ref.current;
    if (target === null || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(target);
      return;
    }
    const t0 = performance.now();
    const dur = 600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span ref={ref} className={className}>
      {start}
    </span>
  );
}
