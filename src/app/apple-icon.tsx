import { ImageResponse } from "next/og";

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
          background: "#4f46e5",
          color: "#fff",
          fontSize: 104,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        I
      </div>
    ),
    size,
  );
}
