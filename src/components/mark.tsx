/**
 * The IILM OS mark: a week, drawn to scale — three days of blocks, with the
 * class that's on right now lit. It's the planner's timetable reduced to an
 * icon, which is the one picture this product owns.
 *
 * Single source for the sidebar, the mobile bar, the login and landing pages,
 * the favicon and the touch/PWA icons. Blocks are on a 64×64 grid.
 */

export const MARK_BLOCKS: { x: number; y: number; w: number; h: number; lit?: boolean }[] = [
  { x: 14, y: 14, w: 10, h: 13 },
  { x: 14, y: 31, w: 10, h: 19 },
  { x: 27, y: 14, w: 10, h: 9 },
  { x: 27, y: 27, w: 10, h: 23, lit: true },
  { x: 40, y: 19, w: 10, h: 16 },
  { x: 40, y: 39, w: 10, h: 11 },
];

/** Dim blocks as a solid colour — Satori (the PNG icon renderer) ignores opacity. */
export const CREAM = "#f7f5f1";
export const CREAM_DIM = "#aaa1e5"; // cream at 55% over the accent

/** The blocks as SVG. `dim` is the colour for the blocks that aren't lit. */
export function MarkBlocks({ fill, dim }: { fill: string; dim: string }) {
  return (
    <g>
      {MARK_BLOCKS.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={2.5} fill={b.lit ? fill : dim} />
      ))}
    </g>
  );
}

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
      <MarkBlocks fill="var(--accent-fg)" dim="color-mix(in srgb, var(--accent-fg) 55%, var(--accent))" />
    </svg>
  );
}
