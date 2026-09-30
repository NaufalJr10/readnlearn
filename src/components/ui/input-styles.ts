import { cn } from "@/lib/utils";

export function inputClasses(invalid?: boolean, className?: string) {
  return cn(
    "block w-full min-h-12 rounded-xl border bg-surface px-4 text-base text-fg placeholder:text-fg-subtle transition-colors duration-150 sm:text-sm",
    "focus:outline-none focus:ring-4 focus:ring-ring/20",
    invalid ? "border-danger focus:border-danger" : "border-border-strong hover:border-fg-subtle focus:border-primary",
    className,
  );
}
