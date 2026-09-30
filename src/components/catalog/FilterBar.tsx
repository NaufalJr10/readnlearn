"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Select } from "../ui/Select";
import { Spinner } from "../ui/Spinner";

export type FilterOption = { value: string; label: string };
export type FilterDef = { name: string; label: string; options: FilterOption[] };

type FilterBarProps = { searchLabel: string; searchPlaceholder: string; filters: FilterDef[] };

export function FilterBar({ searchLabel, searchPlaceholder, filters }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const search = next.toString();
    startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false }));
  }

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (query === current) return;
    const timer = window.setTimeout(() => update({ q: query.trim() }), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce keyed on the typed query only
  }, [query]);

  const activeCount = filters.filter((f) => params.get(f.name)).length;

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-card sm:p-4">
      <form role="search" onSubmit={(e) => (e.preventDefault(), update({ q: query.trim() }))} className="flex gap-2">
        <label htmlFor="catalog-search" className="sr-only">
          {searchLabel}
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            id="catalog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="block min-h-12 w-full rounded-xl border border-border-strong bg-surface pl-12 pr-11 text-base text-fg placeholder:text-fg-subtle transition-colors hover:border-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring/20 sm:text-sm"
          />
          {pending && <Spinner className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-primary" label="Updating results" />}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-controls="catalog-filters"
          className="relative flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl border border-border-strong px-3 text-sm font-semibold text-fg transition-colors hover:border-primary hover:text-primary md:hidden"
        >
          <SlidersHorizontal className="size-5" aria-hidden />
          <span className="sr-only">Filters</span>
          {activeCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{activeCount}</span>
          )}
        </button>
      </form>

      <div id="catalog-filters" className={cn("mt-3 gap-3 md:grid", showFilters ? "grid" : "hidden", filters.length >= 3 ? "md:grid-cols-4" : "md:grid-cols-3")}>
        {filters.map((filter) => (
          <div key={filter.name}>
            <label htmlFor={`filter-${filter.name}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-fg-subtle">
              {filter.label}
            </label>
            <Select id={`filter-${filter.name}`} value={params.get(filter.name) ?? ""} onChange={(e) => update({ [filter.name]: e.target.value })}>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
        {(activeCount > 0 || params.get("q")) && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                startTransition(() => router.replace(pathname, { scroll: false }));
              }}
              className="flex min-h-12 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            >
              <X className="size-4" aria-hidden />
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
