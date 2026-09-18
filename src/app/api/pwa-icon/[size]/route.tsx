import { ImageResponse } from "next/og";
import { MARK_PATH } from "@/components/mark";

/** The mark as a PNG at whatever size the manifest asks for. */
export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size: raw } = await ctx.params;
  const size = Math.min(1024, Math.max(48, Number(raw) || 192));
  // Maskable icons get cropped to a circle/squircle by the launcher, so the
  // letter sits inside the safe zone (the inner 80%).
  const glyph = Math.round(size * 0.8);
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
        <svg width={glyph} height={glyph} viewBox="0 0 64 64">
          <path d={MARK_PATH} fill="#f7f5f1" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
