import { CheckCircle2, History, LogIn, LogOut, XCircle, type LucideIcon } from "lucide-react";
import type { AuditEntry } from "@/lib/admin-accounts";
import { cn } from "@/lib/utils";
import { RelativeTime } from "./RelativeTime";

const actions: Record<string, { icon: LucideIcon; label: string; className: string }> = {
  accept: { icon: CheckCircle2, label: "Accepted", className: "bg-success-soft text-success" },
  reject: { icon: XCircle, label: "Rejected", className: "bg-danger-soft text-danger" },
  login: { icon: LogIn, label: "Admin signed in", className: "bg-primary-soft text-primary" },
  logout: { icon: LogOut, label: "Admin signed out", className: "bg-surface-muted text-fg-muted" },
};

export function AuditLogCard({ entries }: { entries: AuditEntry[] }) {
  return (
    <section aria-labelledby="audit-heading" className="h-fit rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <History className="size-5 text-fg-subtle" aria-hidden />
        <h2 id="audit-heading" className="font-bold">
          Audit log
        </h2>
      </div>
      {entries.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-fg-muted">No admin activity yet.</p>
      ) : (
        <ol className="divide-y divide-border">
          {entries.map((entry) => {
            const action = actions[entry.action] ?? actions.login!;
            return (
              <li key={entry.id} className="flex gap-3 px-5 py-3.5">
                <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", action.className)}>
                  <action.icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">
                    {action.label}
                    {entry.targetName && <span className="font-normal text-fg-muted"> {entry.targetName}</span>}
                  </p>
                  {entry.targetEmail && <p className="truncate text-fg-subtle">{entry.targetEmail}</p>}
                  <RelativeTime iso={entry.timestamp} className="text-xs text-fg-subtle" />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
