import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { clientIp, fail, ok, readJson, validationFailed } from "@/lib/api";
import { db } from "@/lib/db";
import { emails } from "@/lib/email";
import { formatRetry, hit, POLICIES } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = await hit(`signup:${clientIp(request)}`, POLICIES.signup);
  if (!limit.allowed) return fail(429, "rate_limited", `Too many signups from this network. Try again in ${formatRetry(limit.retryAfterMs)}.`);

  const parsed = signupSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFailed(parsed.error);
  const { name, email, password, role, referralCode } = parsed.data;

  const referral = referralCode ? await db.referralLink.findUnique({ where: { code: referralCode.toLowerCase() } }) : null;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
          status: "pending",
          referredByTutorId: referral?.tutorId ?? null,
          ...(role === "tutor" ? { tutor: { create: {} } } : { student: { create: {} } }),
        },
      });
      if (referral) await tx.referralLink.update({ where: { id: referral.id }, data: { usedCount: { increment: 1 } } });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail(409, "email_taken", "An account with this email already exists.", { email: ["An account with this email already exists."] });
    }
    throw error;
  }

  void emails.signupPendingAdmin({ name, email, role });
  return ok({ status: "pending" }, { status: 201 });
}
