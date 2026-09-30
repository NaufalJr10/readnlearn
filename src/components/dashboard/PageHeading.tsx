import type { ReactNode } from "react";

type PageHeadingProps = { title: string; description?: string; action?: ReactNode; eyebrow?: string };

export function PageHeading({ title, description, action, eyebrow }: PageHeadingProps) {
  return (
    <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm font-bold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-lg text-fg-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
