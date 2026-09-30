import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

type StatCardProps = { label: string; value: number | string; icon: LucideIcon; tone: Tone; delayMs?: number };

export function StatCard({ label, value, icon: Icon, tone, delayMs = 0 }: StatCardProps) {
  return (
    <div
      className="animate-fade-up rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <dt className="text-sm font-medium text-fg-muted">{label}</dt>
        <span className={cn("flex size-10 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <dd className="mt-2 font-display text-3xl font-extrabold">{value}</dd>
    </div>
  );
}
