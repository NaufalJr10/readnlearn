import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { LogoMark } from "@/components/ui/LogoMark";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main id="main" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_50%_-10%,var(--primary-soft),transparent),radial-gradient(30rem_20rem_at_100%_100%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent)]"
        aria-hidden
      />
      <div className="animate-scale-in w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-lift sm:p-10">
          <div className="flex items-center gap-3">
            <LogoMark className="size-11" />
            <div>
              <p className="font-display text-lg font-extrabold">ReadnLearn</p>
              <p className="flex items-center gap-1 text-sm font-semibold text-primary">
                <ShieldCheck className="size-4" aria-hidden />
                Admin console
              </p>
            </div>
          </div>
          <h1 className="mt-8 text-2xl font-extrabold">Sign in to continue</h1>
          <p className="mt-1.5 text-fg-muted">Restricted area. Access attempts are logged.</p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-fg-subtle">
          Not an admin?{" "}
          <Link href="/" className="font-semibold text-primary hover:underline">
            Back to ReadnLearn
          </Link>
        </p>
      </div>
    </main>
  );
}
