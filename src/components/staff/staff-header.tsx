import Link from "next/link";
import { Mark } from "@/components/mark";
import { ThemeToggle } from "@/components/theme";
import { SignOut } from "@/components/staff/sign-out";

/** The bar over /teacher and /admin, which sit outside the student app's sidebar. */
export function StaffHeader({ title, links = [] }: { title: string; links?: { href: string; label: string }[] }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[980px] items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Mark size={26} />
          <p className="font-serif text-[length:var(--text-body)] font-semibold tracking-tight">
            Semwise <span className="font-sans font-normal text-muted">· {title}</span>
          </p>
        </div>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2 py-1 text-[length:var(--text-small)] text-muted hover:bg-surface-2 hover:text-fg focus-ring"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
          <SignOut />
        </nav>
      </div>
    </header>
  );
}
