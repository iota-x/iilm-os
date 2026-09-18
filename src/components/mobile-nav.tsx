"use client";

import { Mark } from "@/components/mark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  CalendarRange,
  Dumbbell,
  GraduationCap,
  Inbox,
  Users,
  Target,
  LayoutDashboard,
  Link2,
  NotebookPen,
  Repeat2,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn, daysUntil, MIDSEM_START } from "@/lib/utils";
import { SearchTrigger } from "@/components/command-palette";

const LINKS = [
  { href: "/", label: "Today", icon: LayoutDashboard, exact: true },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
    { href: "/goals", label: "Goals", icon: Target },
{ href: "/review", label: "Review", icon: Repeat2 },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/planner", label: "Planner", icon: CalendarRange },
  { href: "/ask", label: "Ask", icon: Sparkles },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/class", label: "Class", icon: Users },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/resources", label: "Resources", icon: Link2 },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/exams", label: "Exams", icon: GraduationCap },
];

export function MobileNav() {
  const pathname = usePathname();
  const left = daysUntil(MIDSEM_START);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-app/85 backdrop-blur-xl md:hidden">
      <div className="flex h-14 items-center gap-2 px-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 focus-ring rounded">
          <Mark size={28} />
        </Link>
        <SearchTrigger className="flex-1 justify-start" />
        {left > 0 ? (
          <Link
            href="/exams"
            className="shrink-0 rounded-lg border border-line bg-surface-2 px-2 py-1 text-[length:var(--text-micro)] tabular-nums"
            title="Days until mid-semester exams begin"
          >
            {left}d
          </Link>
        ) : null}
        <Link href="/settings" aria-label="Settings" className="shrink-0 p-1.5 text-subtle">
          <Settings size={16} />
        </Link>
      </div>

      <nav className="overflow-x-auto px-2 pb-1.5">
        <ul className="flex items-center gap-0.5">
          {LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[length:var(--text-small)] font-medium transition-colors focus-ring",
                    active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <Icon size={15} strokeWidth={2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
