"use client";

import { Gift, GraduationCap, Presentation } from "lucide-react";
import { useState, type FormEvent } from "react";
import { fetchJson } from "@/lib/fetch-json";
import type { FieldErrors } from "@/lib/validation";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { PasswordInput } from "../ui/PasswordInput";
import { useToast } from "../ui/ToastProvider";
import { PendingApproval } from "./PendingApproval";
import { RoleOption } from "./RoleOption";

type Role = "student" | "tutor";
type SignupFormProps = { initialRole: Role; referral: { code: string; tutorName: string } | null };

export function SignupForm({ initialRole, referral }: SignupFormProps) {
  const toast = useToast();
  const [role, setRole] = useState<Role>(initialRole);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setLoading(true);
    const result = await fetchJson("/api/account/signup", { method: "POST", json: { ...data, role, referralCode: referral?.code } });
    setLoading(false);
    if (result.ok) {
      setSubmittedEmail(String(data.email));
      return;
    }
    setErrors(result.fields ?? {});
    if (!result.fields) toast({ tone: "error", title: "Couldn't create your account", description: result.message });
  }

  if (submittedEmail) return <PendingApproval email={submittedEmail} />;

  const err = (name: string) => errors[name]?.[0];

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {referral && (
        <p className="animate-fade-in flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-sm text-primary-soft-fg">
          <Gift className="size-5 shrink-0" aria-hidden />
          <span>
            You were invited by <strong>{referral.tutorName}</strong>. Welcome!
          </span>
        </p>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">I want to…</legend>
        <div className="grid grid-cols-2 gap-3" role="radiogroup">
          <RoleOption value="student" selected={role === "student"} onSelect={setRole} icon={GraduationCap} title="Learn" subtitle="Join as a student" />
          <RoleOption value="tutor" selected={role === "tutor"} onSelect={setRole} icon={Presentation} title="Teach" subtitle="Join as a tutor" />
        </div>
      </fieldset>

      <Field id="name" label="Full name" error={err("name")}>
        <Input id="name" name="name" autoComplete="name" required placeholder="Jane Doe" invalid={!!err("name")} describedBy={err("name") ? "name-error" : undefined} />
      </Field>
      <Field id="email" label="Email" error={err("email")}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          invalid={!!err("email")}
          describedBy={err("email") ? "email-error" : undefined}
        />
      </Field>
      <Field id="password" label="Password" error={err("password")} hint="At least 8 characters with upper & lowercase letters and a number.">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="Create a strong password"
          invalid={!!err("password")}
          describedBy={err("password") ? "password-error" : "password-hint"}
        />
      </Field>
      <Button type="submit" size="lg" loading={loading} className="w-full">
        Create {role} account
      </Button>
      <p className="text-center text-xs text-fg-subtle">New accounts are reviewed by an admin before you can log in.</p>
    </form>
  );
}
