"use client";

import { usePathname } from "next/navigation";

/** A short settle each time the route changes. Keyed on the path so the
 *  animation re-runs; the CSS turns it off under reduced motion. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-in">
      {children}
    </div>
  );
}
