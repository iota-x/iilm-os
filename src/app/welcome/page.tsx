import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries";
import { Mark } from "@/components/mark";
import { WelcomeForm } from "@/components/welcome-form";

export const dynamic = "force-dynamic";

/**
 * Where a new account lands. Every account starts with the same password,
 * so nothing else in the app is reachable until this is done.
 */
export default async function WelcomePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.must_change_password) redirect("/");

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center gap-2.5">
          <Mark size={32} />
          <p className="font-serif text-[length:var(--text-lead)] font-semibold tracking-tight">
            IILM OS
          </p>
        </div>
        <h1 className="text-[length:var(--text-page)]">
          Welcome{profile.display_name ? `, ${profile.display_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-[length:var(--text-small)] leading-relaxed text-muted">
          This account was set up for you with a shared starting password. Choose your own before
          anything else — it&rsquo;s the only thing keeping your notes and marks yours.
        </p>
        <WelcomeForm />
      </div>
    </div>
  );
}
