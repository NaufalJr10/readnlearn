import { Skeleton } from "../ui/Skeleton";

export function CardGridSkeleton({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" role="status" aria-label={label}>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-12 w-full max-w-xl" />
      <Skeleton className="mt-8 h-24 w-full rounded-2xl" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <Skeleton className="h-36 rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
