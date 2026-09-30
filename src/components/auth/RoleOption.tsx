"use client";

import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "student" | "tutor";
type RoleOptionProps = { value: Role; selected: boolean; onSelect: (role: Role) => void; icon: LucideIcon; title: string; subtitle: string };

export function RoleOption({ value, selected, onSelect, icon: Icon, title, subtitle }: RoleOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = value === "student" ? "tutor" : "student";
          onSelect(next);
          (e.currentTarget.parentElement?.querySelector(`[data-role="${next}"]`) as HTMLButtonElement | null)?.focus();
        }
      }}
      tabIndex={selected ? 0 : -1}
      data-role={value}
      className={cn(
        "relative flex min-h-24 flex-col items-start rounded-2xl border-2 p-4 text-left transition-all duration-200",
        selected ? "border-primary bg-primary-soft shadow-sm" : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted",
      )}
    >
      <Icon className={cn("size-6", selected ? "text-primary" : "text-fg-subtle")} aria-hidden />
      <span className="mt-2 font-bold">{title}</span>
      <span className="text-sm text-fg-muted">{subtitle}</span>
      <span
        className={cn(
          "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full transition-all",
          selected ? "scale-100 bg-primary text-white" : "scale-75 border-2 border-border-strong",
        )}
        aria-hidden
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
