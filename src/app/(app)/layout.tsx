import Link from "next/link";
import { CommandPalette } from "@/components/command-palette";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { getNavTree, getProfile } from "@/lib/queries";
import { daysUntil, MIDSEM_START } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [tree, profile] = await Promise.all([getNavTree(), getProfile()]);
  const left = daysUntil(MIDSEM_START);

  return (
    <div className="flex min-h-dvh">
      <Sidebar tree={tree} displayName={profile?.display_name ?? null} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />

        {left > 0 ? (
          <div className="hidden h-11 shrink-0 items-center justify-end gap-3 border-b border-line px-6 md:flex">
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[length:var(--text-micro)] font-medium focus-ring hover:bg-surface-3"
              title="Days until mid-semester exams begin"
            >
              <span className="font-semibold tabular-nums">{left}</span>
              <span className="text-muted">days to mid-sems</span>
            </Link>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 md:px-6">{children}</main>

        <footer className="mx-auto w-full max-w-[1100px] px-4 py-6 text-[length:var(--text-micro)] text-subtle md:px-6">
          B.Tech CSE Semester I · IILM University, Gurugram · Section E · Lab Group{" "}
          {profile?.lab_group ?? 2}
        </footer>
      </div>

      <CommandPalette />
    </div>
  );
}
