import { MessageCircle } from "lucide-react";
import { ButtonLink } from "../ui/ButtonLink";
import { EmptyState } from "../ui/EmptyState";

export function MessagesComingSoon({ backHref }: { backHref: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="mb-8 text-3xl font-extrabold">Messages</h1>
      <EmptyState
        icon={MessageCircle}
        title="Real-time messaging is almost here"
        description="One-to-one chat between students and tutors is being built right now. You'll be able to message from this page soon."
        action={
          <ButtonLink href={backHref} variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    </div>
  );
}
