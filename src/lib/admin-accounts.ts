import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";

export type PendingAccount = { id: string; name: string; email: string; role: "student" | "tutor"; createdAt: string };

export async function listPendingAccounts(filters: { q?: string; role?: string } = {}): Promise<PendingAccount[]> {
  const where: Prisma.UserWhereInput = { status: "pending", role: { in: ["student", "tutor"] } };
  if (filters.role === "student" || filters.role === "tutor") where.role = filters.role;
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }];
  }
  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    take: 500,
  });
  return users.map((u) => ({ ...u, role: u.role as PendingAccount["role"], createdAt: u.createdAt.toISOString() }));
}

export function countPendingAccounts() {
  return db.user.count({ where: { status: "pending", role: { in: ["student", "tutor"] } } });
}

export type AuditEntry = { id: string; action: string; timestamp: string; targetName: string | null; targetEmail: string | null };

export async function listAuditLog(take = 20): Promise<AuditEntry[]> {
  const logs = await db.adminLog.findMany({
    orderBy: { timestamp: "desc" },
    take,
    include: { targetUser: { select: { name: true, email: true } } },
  });
  return logs.map((l) => ({
    id: l.id,
    action: l.action,
    timestamp: l.timestamp.toISOString(),
    targetName: l.targetUser?.name ?? null,
    targetEmail: l.targetUser?.email ?? null,
  }));
}
