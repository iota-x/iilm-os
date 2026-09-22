"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Target,
  BookOpen,
  CalendarCheck,
  CalendarRange,
  Dumbbell,
  ChevronRight,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Link2,
  LogOut,
  NotebookPen,
  Repeat2,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
} from "lucide-react";
import { useLocalStorage } from "@/lib/client-hooks";
import type { NavSubject } from "@/lib/queries";
import { Mark } from "@/components/mark";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SearchTrigger } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme";

const GROUPS: { label: string | null; links: { href: string; label: string; icon: typeof Target; exact?: boolean }[] }[] = [
  {
    label: null,
    links: [{ href: "/", label: "Today", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Study",
    links: [
      { href: "/goals", label: "Goals", icon: Target },
      { href: "/planner", label: "Planner", icon: CalendarRange },
      { href: "/review", label: "Review", icon: Repeat2 },
      { href: "/practice", label: "Practice", icon: Dumbbell },
      { href: "/ask", label: "Ask", icon: Sparkles },
    ],
  },
  {
    label: "Material",
    links: [
      { href: "/notes", label: "Notes", icon: NotebookPen },
      { href: "/inbox", label: "Inbox", icon: Inbox },
      { href: "/resources", label: "Resources", icon: Link2 },
    ],
  },
  {
    label: "College",
    links: [
      { href: "/class", label: "Class", icon: Users },
      { href: "/attendance", label: "Attendance", icon: CalendarCheck },
      { href: "/exams", label: "Exams", icon: GraduationCap },
    ],
  },
];
const LINKS = GROUPS.flatMap((g) => g.links);

const NO_OVERRIDES: Record<string, boolean> = {};

const OPEN_KEY = "iilm-os:sidebar-open-subjects";
const COLLAPSED_KEY = "iilm-os:sidebar-collapsed";

export function Sidebar({
  tree,
  displayName,
}: {
  tree: NavSubject[];
  displayName: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Only subjects you've explicitly toggled are stored. Anything absent falls
  // back to "open if it's the subject you're currently on", so the tree follows
  // you around without an effect — and you can still collapse the active one.
  const [openMap, setOpenMap] = useLocalStorage<Record<string, boolean>>(OPEN_KEY, NO_OVERRIDES);
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(COLLAPSED_KEY, false);

  const activeSlug = useMemo(() => {
    const m = pathname.match(/^\/subjects\/([^/]+)/);
    return m ? m[1] : null;
  }, [pathname]);

  const isOpen = (slug: string) => openMap[slug] ?? slug === activeSlug;

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function toggle(slug: string) {
    setOpenMap({ ...openMap, [slug]: !isOpen(slug) });
  }

  if (collapsed) {
    return (
      <aside className="sticky top-0 hidden h-dvh w-[52px] shrink-0 flex-col items-center gap-1 border-r border-line bg-surface/60 py-3 md:flex">
        <button
          onClick={() => setCollapsed(false)}
          className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg focus-ring"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>
        <div className="my-1 h-px w-6 bg-line" />
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg focus-ring",
                active ? "bg-surface-2 text-fg" : "text-subtle hover:bg-surface-2 hover:text-fg",
              )}
            >
              <Icon size={16} />
            </Link>
          );
        })}
        <Link
          href="/subjects"
          title="Subjects"
          aria-label="Subjects"
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg focus-ring",
            pathname.startsWith("/subjects")
              ? "bg-surface-2 text-fg"
              : "text-subtle hover:bg-surface-2 hover:text-fg",
          )}
        >
          <BookOpen size={16} />
        </Link>
      </aside>
    );
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-line bg-surface/60 md:flex">
      {/* brand + collapse */}
      <div className="flex h-14 shrink-0 items-center gap-2 px-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 focus-ring rounded">
          <Mark size={28} />
          <span className="truncate font-serif text-[length:var(--text-lead)] font-semibold tracking-tight">IILM OS</span>
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg focus-ring"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div className="px-3 pb-2">
        <SearchTrigger className="w-full justify-start" />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {GROUPS.map((g) => (
          <div key={g.label ?? "top"} className={g.label ? "mt-3" : ""}>
            {g.label ? (
              <p className="mb-1 px-2 text-[length:var(--text-micro)] font-medium text-subtle">{g.label}</p>
            ) : null}
            <ul className="space-y-0.5">
              {g.links.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex h-8 items-center gap-2 rounded-lg px-2 text-[length:var(--text-small)] font-medium transition-colors focus-ring",
                        active
                          ? "bg-surface-2 text-fg"
                          : "text-muted hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <Icon size={15} strokeWidth={2} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-4 mb-1 flex items-center justify-between px-2">
          <span className="text-[length:var(--text-micro)] font-medium text-subtle">
            Subjects
          </span>
          <Link
            href="/subjects"
            className="text-[length:var(--text-micro)] text-subtle hover:text-fg focus-ring rounded px-1"
          >
            All
          </Link>
        </div>

        <ul className="space-y-0.5">
          {tree.map((subject) => {
            const open = isOpen(subject.slug);
            const isActive = activeSlug === subject.slug;
            // Lab-only courses (Linux) have no units at all — their syllabus is
            // the experiment list, so count that instead of showing nothing.
            const labOnly = subject.units.length === 0 && subject.experiments.length > 0;
            const total = labOnly
              ? subject.experiments.length
              : subject.units.reduce((n, u) => n + u.topics.length, 0);
            const done = labOnly
              ? subject.experiments.filter((e) => e.status === "done").length
              : subject.units.reduce(
                  (n, u) => n + u.topics.filter((t) => t.status === "mastered").length,
                  0,
                );

            return (
              <li key={subject.id}>
                <div
                  className={cn(
                    "group flex items-center rounded-lg transition-colors",
                    isActive ? "bg-surface-2" : "hover:bg-surface-2/60",
                  )}
                >
                  <button
                    onClick={() => toggle(subject.slug)}
                    aria-expanded={open}
                    aria-label={open ? `Collapse ${subject.name}` : `Expand ${subject.name}`}
                    className="grid h-8 w-6 shrink-0 place-items-center rounded-l-lg text-subtle hover:text-fg focus-ring"
                  >
                    <ChevronRight
                      size={13}
                      className={cn("transition-transform", open && "rotate-90")}
                    />
                  </button>
                  <Link
                    href={`/subjects/${subject.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2 focus-ring rounded-r-lg"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: `var(--c-${subject.color})` }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[length:var(--text-small)]",
                        isActive ? "font-medium text-fg" : "text-muted",
                      )}
                      title={subject.name}
                    >
                      {subject.short_name}
                    </span>
                    {total > 0 ? (
                      <span
                        className="h-1 w-10 shrink-0 overflow-hidden rounded-full bg-surface-3"
                        title={`${done} of ${total} solid`}
                        aria-label={`${done} of ${total} solid`}
                      >
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${Math.max(done ? 6 : 0, Math.round((done / total) * 100))}%`, background: `var(--c-${subject.color})` }}
                        />
                      </span>
                    ) : (
                      <span className="shrink-0 text-[length:var(--text-micro)] text-subtle">—</span>
                    )}
                  </Link>
                </div>

                {open ? (
                  <ul className="ml-[11px] mt-0.5 space-y-0.5 border-l border-line pl-2">
                    {labOnly ? (
                      subject.experiments.map((e) => (
                        <li key={e.id}>
                          <Link
                            href={`/subjects/${subject.slug}?tab=lab`}
                            className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-surface-2 focus-ring"
                            title={`Experiment ${e.number} — ${e.title}`}
                          >
                            <span className="shrink-0 text-[length:var(--text-micro)] tabular-nums text-subtle">
                              {e.number}
                            </span>
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate text-[length:var(--text-micro)]",
                                e.status === "done" ? "text-subtle line-through" : "text-muted",
                              )}
                            >
                              {e.title}
                            </span>
                          </Link>
                        </li>
                      ))
                    ) : subject.units.length === 0 ? (
                      <li className="px-2 py-1.5 text-[length:var(--text-micro)] text-subtle">
                        No units yet — course plan missing.
                      </li>
                    ) : (
                      subject.units.map((unit) => {
                        const n = unit.topics.length;
                        const solid = unit.topics.filter((t) => t.status === "mastered").length;
                        const touched = unit.topics.filter((t) => t.status !== "not_started").length;
                        return (
                          <li key={unit.id}>
                            <Link
                              href={`/subjects/${subject.slug}/unit-${unit.number}`}
                              className="group/unit flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-2 focus-ring"
                              title={`Unit ${unit.number} — ${unit.title} · ${touched} of ${n} started, ${solid} solid`}
                            >
                              <span className="w-4 shrink-0 text-[length:var(--text-micro)] font-semibold tabular-nums text-subtle">
                                {unit.number}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[length:var(--text-micro)] text-muted group-hover/unit:text-fg">
                                  {unit.title}
                                </span>
                                {/* faint = started, solid = mastered */}
                                <span className="relative mt-1 block h-[3px] w-full overflow-hidden rounded-full bg-surface-3">
                                  <span
                                    className="absolute inset-y-0 left-0 rounded-full opacity-35"
                                    style={{ width: `${n ? Math.round((touched / n) * 100) : 0}%`, background: `var(--c-${subject.color})` }}
                                  />
                                  <span
                                    className="absolute inset-y-0 left-0 rounded-full"
                                    style={{ width: `${n ? Math.round((solid / n) * 100) : 0}%`, background: `var(--c-${subject.color})` }}
                                  />
                                </span>
                              </span>
                              <span className="shrink-0 text-[10px] tabular-nums text-subtle">
                                {solid}/{n}
                              </span>
                            </Link>
                          </li>
                        );
                      })
                    )}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* user row, pinned */}
      <div className="shrink-0 border-t border-line p-2">
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2 focus-ring"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-3 text-[length:var(--text-micro)] font-semibold text-muted">
              {(displayName ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-[length:var(--text-micro)] text-muted">
              {displayName ?? "Set your name"}
            </span>
            <Settings size={13} className="shrink-0 text-subtle" />
          </Link>
          <button
            onClick={signOut}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg focus-ring"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
        <div className="mt-1.5 px-1">
          <ThemeToggle full />
        </div>
      </div>
    </aside>
  );
}
