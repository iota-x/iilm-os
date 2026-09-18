import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme";
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

export const metadata: Metadata = {
  title: "IILM OS",
  description: "Syllabus, notes, planner and resources for B.Tech CSE Semester I.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#161513" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
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
