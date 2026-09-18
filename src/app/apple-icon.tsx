import { ImageResponse } from "next/og";
import { MARK_BLOCKS, CREAM, CREAM_DIM } from "@/components/mark";

// iOS home-screen icon. Rendered as a PNG at build time because Apple
// ignores SVG touch icons.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4b3bd6",
        }}
      >
        {/* iOS masks its own corners; the mark just needs the letter. */}
        <svg width="180" height="180" viewBox="0 0 64 64">
          {MARK_BLOCKS.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={2.5} fill={b.lit ? CREAM : CREAM_DIM} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
