"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchJson } from "@/lib/fetch-json";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { useToast } from "../ui/ToastProvider";

type EnrollButtonProps = { courseId: string; isFree: boolean; viewerRole: "student" | "tutor" | null; enrolled: boolean };

export function EnrollButton({ courseId, isFree, viewerRole, enrolled }: EnrollButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  if (enrolled) {
    return (
      <ButtonLink href="/student" variant="secondary" size="lg" className="w-full">
        <CheckCircle2 className="size-5 text-success" aria-hidden />
        You&apos;re enrolled · Go to dashboard
      </ButtonLink>
    );
  }

  if (!viewerRole) {
    return (
      <div className="space-y-3">
        <ButtonLink href={`/login?callbackUrl=${encodeURIComponent(`/courses/${courseId}`)}`} size="lg" className="w-full">
          Enroll Now
        </ButtonLink>
        <p className="text-center text-sm text-fg-subtle">You&apos;ll be asked to log in or create a free account.</p>
      </div>
    );
  }

  if (viewerRole === "tutor") {
    return <p className="rounded-xl bg-surface-muted p-4 text-sm text-fg-muted">You&apos;re signed in as a tutor. Switch to a student account to enroll.</p>;
  }

  async function enroll() {
    setLoading(true);
    const result = await fetchJson<{ enrolled: boolean }>("/api/enrollments", { method: "POST", json: { courseId } });
    setLoading(false);
    if (result.ok) {
      toast({ tone: "success", title: "You're enrolled! 🎉", description: "Find this course on your dashboard." });
      router.refresh();
    } else {
      toast({ tone: result.status === 402 ? "info" : "error", title: result.status === 402 ? "Checkout coming soon" : "Couldn't enroll", description: result.message });
    }
  }

  return (
    <Button size="lg" className="w-full" loading={loading} onClick={enroll}>
      {isFree ? "Enroll Now · Free" : "Enroll Now"}
    </Button>
  );
}
