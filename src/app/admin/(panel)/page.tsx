import { GraduationCap, Hourglass, Presentation, Users } from "lucide-react";
import { AuditLogCard } from "@/components/admin/AuditLogCard";
import { PendingAccountsPanel } from "@/components/admin/PendingAccountsPanel";
import { StatCard } from "@/components/admin/StatCard";
import { listAuditLog, listPendingAccounts } from "@/lib/admin-accounts";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [pending, auditLog, activeStudents, activeTutors] = await Promise.all([
    listPendingAccounts(),
    listAuditLog(12),
    db.user.count({ where: { role: "student", status: "active" } }),
    db.user.count({ where: { role: "tutor", status: "active" } }),
  ]);

  const stats = [
    { label: "Pending review", value: pending.length, icon: Hourglass, tone: "warning" as const },
    { label: "Pending tutors", value: pending.filter((p) => p.role === "tutor").length, icon: Presentation, tone: "primary" as const },
    { label: "Active students", value: activeStudents, icon: GraduationCap, tone: "success" as const },
    { label: "Active tutors", value: activeTutors, icon: Users, tone: "primary" as const },
  ];

  return (
    <>
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Account approvals</h1>
        <p className="mt-2 text-fg-muted">Review new signups and keep ReadnLearn a trusted place to learn.</p>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delayMs={i * 60} />
        ))}
      </dl>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_340px]">
        <PendingAccountsPanel initialAccounts={pending} />
        <AuditLogCard entries={auditLog} />
      </div>
    </>
  );
}
