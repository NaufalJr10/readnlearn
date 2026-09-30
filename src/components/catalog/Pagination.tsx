import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationProps = { page: number; total: number; pageSize: number; basePath: string; params: Record<string, string | undefined> };

function href(basePath: string, params: PaginationProps["params"], page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value && key !== "page") search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ page, total, pageSize, basePath, params }: PaginationProps) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const linkClass = "flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-xl border border-border-strong bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
      <Link href={href(basePath, params, page - 1)} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} className={cn(linkClass, page <= 1 && disabled)}>
        <ChevronLeft className="size-4" aria-hidden />
        Previous
      </Link>
      <span className="px-2 text-sm text-fg-muted" aria-current="page">
        Page {page} of {pages}
      </span>
      <Link href={href(basePath, params, page + 1)} aria-disabled={page >= pages} tabIndex={page >= pages ? -1 : undefined} className={cn(linkClass, page >= pages && disabled)}>
        Next
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </nav>
  );
}
