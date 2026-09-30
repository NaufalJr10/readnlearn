"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { dashboardPath, loginErrorMessage } from "@/lib/auth-errors";
import { safeRedirectPath } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { PasswordInput } from "../ui/PasswordInput";
import { useToast } from "../ui/ToastProvider";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email: String(data.get("email")), password: String(data.get("password")), redirect: false });
    if (!result || result.error) {
      setLoading(false);
      const code = result?.error ?? "unknown";
      setError({ code, message: loginErrorMessage(code) });
      return;
    }
    const session = await getSession();
    toast({ tone: "success", title: `Welcome back${session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}!` });
    const home = dashboardPath(session?.user?.role ?? "student");
    router.replace(safeRedirectPath(params.get("callbackUrl"), home));
    router.refresh();
  }

  const statusIssue = error && ["pending", "inactive", "rejected"].includes(error.code);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className={`animate-fade-in flex gap-3 rounded-2xl border p-4 text-sm ${statusIssue ? "border-warning/30 bg-warning-soft text-warning" : "border-danger/30 bg-danger-soft text-danger"}`}
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{error.message}</p>
            {error.code === "rejected" && (
              <Link href="/contact" className="mt-1 inline-block font-semibold underline">
                Contact support
              </Link>
            )}
          </div>
        </div>
      )}
      <Field id="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <Field
        id="password"
        label="Password"
        labelAction={
          <Link href="/forgot-password" className="rounded text-sm font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        }
      >
        <PasswordInput id="password" name="password" autoComplete="current-password" required placeholder="Your password" />
      </Field>
      <Button type="submit" size="lg" loading={loading} className="w-full">
        Log in
      </Button>
    </form>
  );
}
