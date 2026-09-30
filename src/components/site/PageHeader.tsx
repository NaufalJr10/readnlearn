import type { ReactNode } from "react";

type PageHeaderProps = { eyebrow: string; title: ReactNode; description?: ReactNode; children?: ReactNode };

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_20%_-10%,var(--primary-soft),transparent),radial-gradient(40rem_24rem_at_90%_0%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent)]" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="animate-fade-up text-sm font-bold uppercase tracking-wider text-primary">{eyebrow}</p>
        <h1 className="animate-fade-up mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl [animation-delay:60ms]">{title}</h1>
        {description && <p className="animate-fade-up mt-4 max-w-2xl text-lg text-fg-muted [animation-delay:120ms]">{description}</p>}
        {children && <div className="animate-fade-up mt-8 [animation-delay:180ms]">{children}</div>}
      </div>
    </section>
  );
}
