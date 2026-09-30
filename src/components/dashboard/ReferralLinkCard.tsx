"use client";

import { Check, Copy, Gift } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";

export function ReferralLinkCard({ url, uses }: { url: string; uses: number }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ tone: "success", title: "Referral link copied" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ tone: "error", title: "Couldn't copy", description: "Select the link and copy it manually." });
    }
  }

  return (
    <section aria-labelledby="referral-heading" className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-card">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
        <Gift className="size-6" aria-hidden />
      </span>
      <h2 id="referral-heading" className="mt-4 text-lg font-bold">
        Invite students
      </h2>
      <p className="mt-1 text-sm text-fg-muted">Share your personal link. Students who join through it are linked to you.</p>
      <label htmlFor="referral-url" className="sr-only">
        Your referral link
      </label>
      <input
        id="referral-url"
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="mt-4 block min-h-12 w-full rounded-xl border border-border-strong bg-surface-muted px-4 font-mono text-sm text-fg"
      />
      <Button onClick={copy} className="mt-3 w-full" variant={copied ? "success" : "primary"}>
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {copied ? "Copied!" : "Copy link"}
      </Button>
      <p className="mt-3 text-center text-sm text-fg-subtle">
        {uses} signup{uses === 1 ? "" : "s"} so far
      </p>
    </section>
  );
}
