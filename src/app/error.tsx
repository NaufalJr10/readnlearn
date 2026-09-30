"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex min-h-[70dvh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-7xl font-extrabold text-danger/80">500</p>
      <h1 className="mt-4 text-3xl font-extrabold">Something went wrong on our side</h1>
      <p className="mt-3 max-w-md text-lg text-fg-muted">
        Sorry about that. It&apos;s usually temporary, so please try again. If it keeps happening, let us know.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-fg-subtle">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={reset}>
          <RotateCcw className="size-5" aria-hidden />
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary" size="lg">
          Go home
        </ButtonLink>
      </div>
    </main>
  );
}
