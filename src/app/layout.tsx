import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme";
import { RegisterSW } from "@/components/register-sw";
import "katex/dist/katex.min.css";
import "./globals.css";

/**
 * Two faces, clearly distinct jobs.
 *
 * Source Serif carries the course content — topic titles, outcomes, notes,
 * headings. It's drawn for screen reading and it sits beside KaTeX's maths
 * without the jolt a sans creates next to an equation.
 *
 * Inter handles the interface: labels, buttons, and every number, where its
 * tabular figures keep columns of marks and percentages from shifting.
 */
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-src",
  display: "swap",
  weight: ["400", "600", "700"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-ui",
  display: "swap",
});

const SITE = "https://iilm-os.vercel.app";
const DESCRIPTION =
  "Section E's semester in one place: every syllabus from the course plans, the mid-sem scope for each, board photos that file themselves to the lecture they came from, and an assistant that has read all of it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "IILM OS",
    template: "%s · IILM OS",
  },
  description: DESCRIPTION,
  applicationName: "IILM OS",
  openGraph: {
    type: "website",
    siteName: "IILM OS",
    title: "IILM OS — Section E's semester, in one place",
    description: DESCRIPTION,
    url: SITE,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "IILM OS — Section E's semester, in one place",
    description: DESCRIPTION,
    creator: "@iota_xx",
  },
  // icon files under app/ are picked up automatically; this pins the order
  // Safari and older browsers fall back through.
  icons: {
    icon: [
      { url: "/icon1.png", sizes: "32x32", type: "image/png" },
      { url: "/icon0.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <RegisterSW />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--surface)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                fontSize: "14px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
