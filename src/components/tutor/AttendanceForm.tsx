"use client";

import { CheckCheck, Users } from "lucide-react";
import { useState } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { cn } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

type Status = "present" | "late" | "absent";
type Row = { batchStudentId: string; name: string; email: string; status: Status | null };

const options: { value: Status; label: string; active: string }[] = [
  { value: "present", label: "Present", active: "border-success bg-success-soft text-success" },
  { value: "late", label: "Late", active: "border-warning bg-warning-soft text-warning" },
  { value: "absent", label: "Absent", active: "border-danger bg-danger-soft text-danger" },
];

export function AttendanceForm({ lessonId, rows, disabled }: { lessonId: string; rows: Row[]; disabled?: boolean }) {
  const { run, loading } = useApiMutation();
  const [statuses, setStatuses] = useState<Record<string, Status | null>>(() => Object.fromEntries(rows.map((r) => [r.batchStudentId, r.status])));

  if (rows.length === 0) {
    return <EmptyState icon={Users} title="No students in this batch" description="Add students to the batch first, then you can take attendance." />;
  }

  const marked = Object.values(statuses).filter(Boolean).length;

  async function save() {
    const records = Object.entries(statuses)
      .filter((entry): entry is [string, Status] => entry[1] !== null)
      .map(([batchStudentId, status]) => ({ batchStudentId, status }));
    await run(`/api/tutor/lessons/${lessonId}/attendance`, { method: "PUT", json: { records }, success: "Attendance saved" });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted" aria-live="polite">
          {marked} of {rows.length} marked
        </p>
        <Button variant="secondary" size="sm" disabled={disabled} onClick={() => setStatuses(Object.fromEntries(rows.map((r) => [r.batchStudentId, "present" as Status])))}>
          <CheckCheck className="size-4" aria-hidden />
          Mark all present
        </Button>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.batchStudentId} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={row.name} className="size-10 text-sm" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{row.name}</p>
                <p className="truncate text-sm text-fg-muted">{row.email}</p>
              </div>
            </div>
            <div role="radiogroup" aria-label={`Attendance for ${row.name}`} className="grid grid-cols-3 gap-2 sm:w-80">
              {options.map((option) => {
                const selected = statuses[row.batchStudentId] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => setStatuses((s) => ({ ...s, [row.batchStudentId]: option.value }))}
                    className={cn(
                      "min-h-12 rounded-xl border-2 px-2 text-sm font-semibold transition-all duration-150 disabled:opacity-50",
                      selected ? option.active : "border-border text-fg-muted hover:border-border-strong hover:bg-surface-muted",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={save} loading={loading} disabled={disabled || marked === 0}>
          Save attendance
        </Button>
      </div>
    </div>
  );
}
