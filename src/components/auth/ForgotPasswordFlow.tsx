"use client";

import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { fetchJson } from "@/lib/fetch-json";
import type { FieldErrors } from "@/lib/validation";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { PasswordInput } from "../ui/PasswordInput";
import { useToast } from "../ui/ToastProvider";

type Step = "request" | "reset" | "done";

export function ForgotPasswordFlow() {
  const toast = useToast();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function requestCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    const result = await fetchJson("/api/account/forgot-password", { method: "POST", json: { email } });
    setLoading(false);
    if (result.ok) {
      setErrors({});
      setStep("reset");
      toast({ tone: "success", title: "Check your inbox", description: "If an account exists for that email, a 6-digit code is on its way." });
    } else {
      setErrors(result.fields ?? {});
      if (!result.fields) toast({ tone: "error", title: "Couldn't send a code", description: result.message });
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setLoading(true);
    const result = await fetchJson("/api/account/reset-password", { method: "POST", json: { ...data, email } });
    setLoading(false);
    if (result.ok) {
      setStep("done");
    } else {
      setErrors(result.fields ?? {});
      if (!result.fields) toast({ tone: "error", title: "Couldn't reset password", description: result.message });
    }
  }

  const err = (name: string) => errors[name]?.[0];

  if (step === "done") {
    return (
      <div className="animate-scale-in text-center" role="status">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success">
          <ShieldCheck className="size-8" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold">Password updated</h1>
        <p className="mt-2 text-fg-muted">You can now log in with your new password.</p>
        <ButtonLink href="/login" size="lg" className="mt-8 w-full">
          Go to login
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <KeyRound className="size-7" aria-hidden />
      </span>
      <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">{step === "request" ? "Forgot your password?" : "Enter your code"}</h1>
      <p className="mt-2 text-fg-muted">
        {step === "request" ? (
          "No worries. Enter your email and we'll send you a 6-digit reset code."
        ) : (
          <>
            We sent a code to <strong className="text-fg">{email}</strong>. It expires in 15 minutes.
          </>
        )}
      </p>

      {step === "request" ? (
        <form onSubmit={requestCode} className="mt-8 space-y-5" noValidate>
          <Field id="email" label="Email" error={err("email")}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              invalid={!!err("email")}
              describedBy={err("email") ? "email-error" : undefined}
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Send reset code
          </Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="mt-8 space-y-5" noValidate>
          <Field id="code" label="6-digit code" error={err("code")}>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              required
              placeholder="••••••"
              className="text-center font-mono text-2xl tracking-[0.5em] sm:text-2xl"
              invalid={!!err("code")}
              describedBy={err("code") ? "code-error" : undefined}
            />
          </Field>
          <Field id="password" label="New password" error={err("password")} hint="At least 8 characters with upper & lowercase letters and a number.">
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              invalid={!!err("password")}
              describedBy={err("password") ? "password-error" : "password-hint"}
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Reset password
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" className="min-h-10 rounded font-semibold text-fg-muted hover:text-fg" onClick={() => setStep("request")}>
              Use a different email
            </button>
            <button type="button" className="min-h-10 rounded font-semibold text-primary hover:underline" onClick={() => requestCode()} disabled={loading}>
              Resend code
            </button>
          </div>
        </form>
      )}

      <Link href="/login" className="mt-8 inline-flex min-h-10 items-center gap-1.5 rounded text-sm font-semibold text-fg-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden />
        Back to login
      </Link>
    </>
  );
}
