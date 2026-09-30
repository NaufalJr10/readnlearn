import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { clientIp, fail, ok, readJson, validationFailed } from "@/lib/api";
import { ADMIN_COOKIE, adminCookieOptions, signAdminToken } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { formatRetry, getLockRemainingMs, hit, POLICIES, reset } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limitKey = `admin-login:${clientIp(request)}`;
  const lockedMs = await getLockRemainingMs(limitKey);
  if (lockedMs > 0) return fail(429, "locked", `Too many failed attempts. Try again in ${formatRetry(lockedMs)}.`);

  const parsed = adminLoginSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFailed(parsed.error);

  const admin = await db.user.findFirst({ where: { role: "admin", status: "active" } });
  const usernameMatches = admin?.email === parsed.data.username.toLowerCase();
  const passwordMatches = admin ? await bcrypt.compare(parsed.data.password, admin.passwordHash) : false;

  if (!admin || !usernameMatches || !passwordMatches) {
    const decision = await hit(limitKey, POLICIES.adminLogin);
    if (decision.next.lockedUntil) {
      return fail(429, "locked", `Too many failed attempts. Admin login is locked for ${formatRetry(decision.retryAfterMs)}.`);
    }
    const remaining = POLICIES.adminLogin.limit - decision.next.count;
    return fail(401, "invalid_credentials", `Incorrect username or password. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`);
  }

  await reset(limitKey);
  await db.adminLog.create({ data: { adminId: admin.id, action: "login" } });
  (await cookies()).set(ADMIN_COOKIE, await signAdminToken(admin.id), adminCookieOptions);
  return ok({ name: admin.name });
}
