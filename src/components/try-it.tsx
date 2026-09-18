import { Hand } from "lucide-react";

/** The badge that says a demo is live. Loud on purpose. */
export function TryIt({ children = "Try it — drag the slider" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--accent)] px-2.5 py-1 text-[length:var(--text-micro)] font-semibold text-[var(--accent-fg)]">
      <Hand size={12} /> {children}
    </span>
  );
}
