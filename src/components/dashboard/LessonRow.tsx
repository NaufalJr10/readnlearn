import { nowMs } from "@/lib/now";
import { CalendarClock, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../ui/Badge";
import { LocalTime } from "../ui/LocalTime";

type LessonRowProps = {
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  context: string;
  cancelled?: boolean;
  status?: "present" | "absent" | "late" | null;
  actions?: ReactNode;
};

const statusTone = { present: "success", late: "warning", absent: "danger" } as const;

export function LessonRow({ title, scheduledAt, durationMinutes, context, cancelled, status, actions }: LessonRowProps) {
  const past = scheduledAt.getTime() < nowMs();
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card">
      <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary-soft-fg">
        <CalendarClock className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${cancelled ? "text-fg-subtle line-through" : ""}`}>{title}</p>
        <p className="truncate text-sm text-fg-muted">{context}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-fg-subtle">
          <LocalTime iso={scheduledAt.toISOString()} />
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {durationMinutes} min
          </span>
        </p>
      </div>
      {actions}
      {cancelled ? <Badge tone="danger">Cancelled</Badge> : status ? <Badge tone={statusTone[status]} className="capitalize">{status}</Badge> : past ? <Badge>Past</Badge> : null}
    </li>
  );
}
