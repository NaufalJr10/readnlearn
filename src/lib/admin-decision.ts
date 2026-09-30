import "server-only";
import { z } from "zod";
import { fail, ok } from "./api";
import { getAdmin } from "./admin-auth";
import { db } from "./db";
import { emails } from "./email";
import { generateReferralCode } from "./tokens";

export async function decideAccount(userId: string, decision: "accept" | "reject") {
  const admin = await getAdmin();
  if (!admin) return fail(401, "unauthorized", "Admin authentication required.");

  if (!z.uuid().safeParse(userId).success) return fail(404, "not_found", "That account no longer exists.");

  const nextStatus = decision === "accept" ? "active" : "rejected";
  const user = await db.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({ where: { id: userId, status: "pending", role: { not: "admin" } }, data: { status: nextStatus } });
    if (updated.count === 0) return null;
    await tx.adminLog.create({ data: { adminId: admin.id, action: decision, targetUserId: userId } });
    const target = await tx.user.findUniqueOrThrow({ where: { id: userId }, include: { tutor: { include: { referralLinks: true } } } });
    if (decision === "accept" && target.tutor && target.tutor.referralLinks.length === 0) {
      await tx.referralLink.create({ data: { tutorId: target.tutor.id, code: generateReferralCode(), generatedByUserId: admin.id } });
    }
    return target;
  });

  if (!user) {
    const exists = await db.user.findUnique({ where: { id: userId }, select: { status: true } });
    return exists
      ? fail(409, "not_pending", `This account is already ${exists.status}.`)
      : fail(404, "not_found", "That account no longer exists.");
  }

  void (decision === "accept" ? emails.accountApproved(user) : emails.accountRejected(user));
  return ok({ id: user.id, status: user.status });
}
