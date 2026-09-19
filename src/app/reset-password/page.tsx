import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries";
import { Mark } from "@/components/mark";
import { WelcomeForm } from "@/components/welcome-form";

export const dynamic = "force-dynamic";

/** Where the password-reset email lands. The link signed them in; now they choose a new one. */
export default async function ResetPasswordPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center gap-2.5">
          <Mark size={32} />
          <p className="font-serif text-[length:var(--text-lead)] font-semibold tracking-tight">IILM OS</p>
        </div>
        <h1 className="text-[length:var(--text-page)]">New password</h1>
        <p className="mt-2 text-[length:var(--text-small)] leading-relaxed text-muted">
          The link in your email signed you in. Choose a new password and you&rsquo;re done.
        </p>
        <WelcomeForm />
      </div>
    </div>
  );
}
