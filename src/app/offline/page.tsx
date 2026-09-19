import type { Metadata } from "next";
import { Mark } from "@/components/mark";
import { Retry } from "./retry";

export const metadata: Metadata = { title: "Offline" };

/**
 * Served by the service worker when a page can't be fetched. Static on
 * purpose — no session, no data — so it can be cached at install time.
 */
export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-[36ch] text-center">
        <Mark size={40} className="mx-auto" />
        <h1 className="mt-5 text-[length:var(--text-title)]">No connection.</h1>
        <p className="mt-2 text-[length:var(--text-small)] leading-relaxed text-muted">
          Nothing is stored on this device — every page is live, so there&rsquo;s nothing to show
          until the signal comes back. Photos you take now will still file themselves by class when
          you share them later.
        </p>
        <Retry />
      </div>
    </main>
  );
}
