import { ImageResponse } from "next/og";
import { MARK_PATH } from "@/components/mark";

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
          <path d={MARK_PATH} fill="#f7f5f1" />
        </svg>
      </div>
    ),
    size,
  );
}
