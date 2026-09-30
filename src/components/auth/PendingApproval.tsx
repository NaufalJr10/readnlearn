import { MailCheck } from "lucide-react";
import { ButtonLink } from "../ui/ButtonLink";

export function PendingApproval({ email }: { email: string }) {
  return (
    <div className="animate-scale-in rounded-3xl border border-border bg-surface p-8 text-center shadow-lift" role="status">
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success">
        <MailCheck className="size-8" aria-hidden />
      </span>
      <h2 className="mt-5 text-2xl font-extrabold">You&apos;re on the list!</h2>
      <p className="mt-3 text-fg-muted">Your account is pending admin approval. You&apos;ll receive an email when approved.</p>
      <p className="mt-2 text-sm text-fg-subtle">
        We&apos;ll write to <strong className="text-fg">{email}</strong>.
      </p>
      <ButtonLink href="/" variant="secondary" className="mt-7">
        Back to home
      </ButtonLink>
    </div>
  );
}
