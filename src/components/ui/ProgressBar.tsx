import { cn } from "@/lib/utils";

export function ProgressBar({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-semibold tabular-nums">{value}%</span>
    </div>
  );
}
