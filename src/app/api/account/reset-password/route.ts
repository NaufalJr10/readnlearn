import bcrypt from "bcryptjs";
import { fail, ok, readJson, validationFailed } from "@/lib/api";
import { db } from "@/lib/db";
import { reset } from "@/lib/rate-limit";
import { hashResetCode, RESET_CODE_MAX_ATTEMPTS, safeEqualHex } from "@/lib/tokens";
import { resetPasswordSchema } from "@/lib/validation";

const INVALID = "That code is invalid or has expired. Request a new one.";

export async function POST(request: Request) {
  const parsed = resetPasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFailed(parsed.error);
  const { email, code, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.role === "admin") return fail(400, "invalid_code", INVALID, { code: [INVALID] });

  const token = await db.passwordReset.findFirst({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!token || token.attempts >= RESET_CODE_MAX_ATTEMPTS) return fail(400, "invalid_code", INVALID, { code: [INVALID] });

  if (!safeEqualHex(token.tokenHash, hashResetCode(user.id, code))) {
    const attempts = token.attempts + 1;
    await db.passwordReset.update({
      where: { id: token.id },
      data: { attempts, ...(attempts >= RESET_CODE_MAX_ATTEMPTS ? { usedAt: new Date() } : {}) },
    });
    const message = attempts >= RESET_CODE_MAX_ATTEMPTS ? INVALID : "That code doesn't match. Check your email and try again.";
    return fail(400, "invalid_code", message, { code: [message] });
  }

  const consumed = await db.passwordReset.updateMany({ where: { id: token.id, usedAt: null }, data: { usedAt: new Date() } });
  if (consumed.count === 0) return fail(400, "invalid_code", INVALID, { code: [INVALID] });

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  await reset(`user-login:${email}`);
  return ok({ reset: true });
}
