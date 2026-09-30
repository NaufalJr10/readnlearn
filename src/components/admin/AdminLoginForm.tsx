"use client";

import { AlertCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { fetchJson } from "@/lib/fetch-json";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { PasswordInput } from "../ui/PasswordInput";
import { useToast } from "../ui/ToastProvider";

export function AdminLoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<{ message: string; locked: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setLoading(true);
    setError(null);
    const result = await fetchJson<{ name: string }>("/api/admin/login", { method: "POST", json: data });
    if (result.ok) {
      toast({ tone: "success", title: "Welcome back, Admin" });
      router.replace("/admin");
      router.refresh();
      return;
    }
    setLoading(false);
    setError({ message: result.message, locked: result.status === 429 });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && (
        <div role="alert" className="animate-fade-in flex gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm font-semibold text-danger">
          {error.locked ? <Lock className="mt-0.5 size-5 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />}
          {error.message}
        </div>
      )}
      <Field id="username" label="Username">
        <Input id="username" name="username" autoComplete="username" required autoCapitalize="none" spellCheck={false} placeholder="Admin" />
      </Field>
      <Field id="password" label="Password">
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" size="lg" loading={loading} disabled={error?.locked} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
