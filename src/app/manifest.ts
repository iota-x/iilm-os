import type { MetadataRoute } from "next";

/**
 * Installable on a phone, and — the point — a share target on Android: from
 * the gallery, select the day's photos, Share → IILM OS, and they land in
 * the inbox filed by the time they were taken. No transfer to a laptop.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IILM OS",
    short_name: "IILM OS",
    description: "Your semester, one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5f1",
    theme_color: "#4b3bd6",
    icons: [
      { src: "/api/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    share_target: {
      action: "/api/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        files: [{ name: "files", accept: ["image/*", "application/pdf"] }],
      },
    },
  } as MetadataRoute.Manifest;
}
