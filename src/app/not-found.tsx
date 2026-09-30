import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center">
      <Logo />
      <p className="mt-12 bg-gradient-to-br from-primary to-accent bg-clip-text font-display text-8xl font-extrabold text-transparent sm:text-9xl">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">This page wandered off</h1>
      <p className="mt-3 max-w-md text-lg text-fg-muted">We couldn&apos;t find what you were looking for. It may have moved, or the link might be mistyped.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">
          Go home
        </ButtonLink>
        <ButtonLink href="/courses" variant="secondary" size="lg">
          <Compass className="size-5" aria-hidden />
          Browse courses
        </ButtonLink>
      </div>
    </main>
  );
}
