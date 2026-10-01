import { PartyPopper } from "lucide-react";
import { ButtonLink } from "../ui/ButtonLink";

export function AccountCreated() {
  return (
    <div className="animate-scale-in rounded-3xl border border-border bg-surface p-8 text-center shadow-lift" role="status">
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success">
        <PartyPopper className="size-8" aria-hidden />
      </span>
      <h2 className="mt-5 text-2xl font-extrabold">Your account is ready!</h2>
      <p className="mt-3 text-fg-muted">Log in to start browsing courses and joining batches.</p>
      <ButtonLink href="/login" className="mt-7">
        Log in
      </ButtonLink>
    </div>
  );
}
