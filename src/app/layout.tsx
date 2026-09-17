import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "IILM OS",
  description: "Syllabus, notes, planner and resources for B.Tech CSE Semester I.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                fontSize: "13px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
