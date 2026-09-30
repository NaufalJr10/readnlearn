import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-10 lg:py-10", className)}>{children}</div>;
}

export function Section({ title, action, children, id }: { title: string; action?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id ?? `${title}-heading`.replace(/\s+/g, "-")}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={id ?? `${title}-heading`.replace(/\s+/g, "-")} className="text-xl font-bold sm:text-2xl">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
