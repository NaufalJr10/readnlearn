import { clientIp, fail, ok, readJson, validationFailed } from "@/lib/api";
import { db } from "@/lib/db";
import { emails } from "@/lib/email";
import { formatRetry, hit, POLICIES } from "@/lib/rate-limit";
import { generateResetCode, hashResetCode, RESET_CODE_TTL_MS } from "@/lib/tokens";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFailed(parsed.error);
  const { email } = parsed.data;

  const byIp = await hit(`reset-request-ip:${clientIp(request)}`, POLICIES.passwordResetRequest);
  const byEmail = await hit(`reset-request:${email}`, POLICIES.passwordResetRequest);
  const blocked = [byIp, byEmail].find((d) => !d.allowed);
  if (blocked) return fail(429, "rate_limited", `Too many reset requests. Try again in ${formatRetry(blocked.retryAfterMs)}.`);

  const user = await db.user.findUnique({ where: { email } });
  if (user && user.role !== "admin" && user.status === "active") {
    const code = generateResetCode();
    await db.$transaction([
      db.passwordReset.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } }),
      db.passwordReset.create({ data: { userId: user.id, tokenHash: hashResetCode(user.id, code), expiresAt: new Date(Date.now() + RESET_CODE_TTL_MS) } }),
    ]);
    void emails.passwordResetCode(user, code);
  }

  return ok({ sent: true });
}
