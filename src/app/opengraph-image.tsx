import { ImageResponse } from "next/og";
import { MARK_BLOCKS, CREAM, CREAM_DIM } from "@/components/mark";

/**
 * The card that shows when the link is pasted into WhatsApp, Discord, X.
 * Rendered by Satori, so: plain elements only inside <svg>, no CSS
 * variables, and the serif has to be fetched as a TTF.
 */
export const runtime = "nodejs";
export const alt = "IILM OS — Section E's semester, in one place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Source Serif 4 SemiBold, via Google Fonts' TTF endpoint. Falls back to the default serif. */
async function serif(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:60.0)" } }, // old UA → TTF, not woff2
    ).then((r) => r.text());
    const url = css.match(/src: url\(([^)]+)\) format\('truetype'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const font = await serif();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#f7f5f1",
          color: "#1b1915",
          fontFamily: font ? "Source Serif 4, serif" : "serif",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#4b3bd6" />
            {MARK_BLOCKS.map((b, i) => (
              <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={2.5} fill={b.lit ? CREAM : CREAM_DIM} />
            ))}
          </svg>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.5 }}>IILM OS</div>
        </div>

        {/* the pitch */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2, maxWidth: 800 }}>
            Section E&rsquo;s semester, in one place.
          </div>
          <div
            style={{
              fontSize: 27,
              lineHeight: 1.35,
              color: "#6b665c",
              maxWidth: 760,
            }}
          >
            Every syllabus from the course plans. Board photos that file themselves. An assistant
            that has read all of it. Free, for B.Tech CSE Semester I.
          </div>
        </div>

        {/* the week, abstracted — the mark's blocks, large and faint, bottom right */}
        <svg
          width="300"
          height="300"
          viewBox="0 0 64 64"
          style={{ position: "absolute", right: 56, top: 24 }}
        >
          {MARK_BLOCKS.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={2.5}
              fill={b.lit ? "#4b3bd6" : "#d9d3ec"}
            />
          ))}
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#9a948a" }}>
          <span>iilm-os.vercel.app</span>
          <span>IILM University, Gurugram · Batch 2026–30</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Source Serif 4", data: font, weight: 600, style: "normal" }] : [],
    },
  );
}
