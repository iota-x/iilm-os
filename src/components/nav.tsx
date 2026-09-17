"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Settings,
  Link2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme";
import { createClient } from "@/lib/supabase/client";
import { cn, daysUntil, MIDSEM_START } from "@/lib/utils";
import { Button } from "@/components/ui";

const LINKS = [
  { href: "/", label: "Today", icon: LayoutDashboard, exact: true },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/planner", label: "Planner", icon: CalendarRange },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/resources", label: "Resources", icon: Link2 },
  { href: "/exams", label: "Exams", icon: GraduationCap },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const left = daysUntil(MIDSEM_START);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-app/85 backdrop-blur-xl border-b border-line">
      <div className="mx-auto max-w-[1180px] px-4">
        <div className="flex h-14 items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0 focus-ring rounded">
            <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-[var(--accent)] text-[var(--accent-fg)] text-[12px] font-bold">
              I
            </span>
            <span className="text-[14px] font-semibold tracking-tight hidden sm:block">
              IILM OS
            </span>
          </Link>

          <nav className="flex-1 min-w-0 overflow-x-auto">
            <ul className="flex items-center gap-0.5">
              {LINKS.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 h-8 text-[13px] font-medium transition-colors focus-ring whitespace-nowrap",
                        active
                          ? "bg-surface-2 text-fg"
                          : "text-muted hover:text-fg hover:bg-surface-2",
                      )}
                    >
                      <Icon size={15} strokeWidth={2} />
                      <span className="hidden md:inline">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {left > 0 ? (
              <Link
                href="/exams"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 h-8 text-[12px] font-medium focus-ring hover:bg-surface-3"
                title="Days until mid-semester exams begin"
              >
                <span className="tabular-nums font-semibold">{left}</span>
                <span className="text-muted">days to mid-sems</span>
              </Link>
            ) : null}
            <ThemeToggle />
            <Link href="/settings" aria-label="Settings">
              <Button variant="ghost" size="icon">
                <Settings size={15} />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut size={15} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
