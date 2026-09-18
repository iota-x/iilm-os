/**
 * The IILM OS mark: a bracketed serif "I" — the same letterform family as the
 * headings — set in paper-cream on the accent. This is the single source for
 * the sidebar, the mobile bar, the login page, the favicon and the touch icon;
 * the SVG path below is copied verbatim into icon.svg and apple-icon.tsx.
 */

/** Bracketed serif I on a 64×64 grid. Stem 7 wide, serifs 26 wide. */
export const MARK_PATH =
  "M19 16h26v5h-7.5q-2 0-2 2v18q0 2 2 2H45v5H19v-5h7.5q2 0 2-2V23q0-2-2-2H19z";

export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className={className}
      style={{ flexShrink: 0 }}
    >
      <rect width="64" height="64" rx="14" fill="var(--accent)" />
      <path d={MARK_PATH} fill="var(--accent-fg)" />
    </svg>
  );
}
