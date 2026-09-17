import { Nav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Nav />
      <main className="flex-1 mx-auto w-full max-w-[1180px] px-4 py-6">{children}</main>
      <footer className="mx-auto w-full max-w-[1180px] px-4 py-6 text-[11px] text-subtle">
        B.Tech CSE Semester I · IILM University, Gurugram · Section E · Lab Group 2
      </footer>
    </div>
  );
}
