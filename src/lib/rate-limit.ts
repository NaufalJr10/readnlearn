import "server-only";
import { db } from "./db";
import { applyHit, isLocked, type RateLimitPolicy, type RateLimitState } from "./rate-limit-policy";

export const POLICIES = {
  adminLogin: { limit: 3, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  userLogin: { limit: 10, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  signup: { limit: 5, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  passwordResetRequest: { limit: 5, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  referralLookup: { limit: 30, windowMs: 10 * 60_000, lockMs: 10 * 60_000 },
  contact: { limit: 5, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  messageSend: { limit: 40, windowMs: 60_000, lockMs: 60_000 },
} satisfies Record<string, RateLimitPolicy>;

export async function getLockRemainingMs(key: string) {
  const row = await db.rateLimit.findUnique({ where: { key } });
  const now = new Date();
  return isLocked(row, now) ? row!.lockedUntil!.getTime() - now.getTime() : 0;
}

/** Records one hit atomically (row lock) and reports whether it is within the policy. */
export async function hit(key: string, policy: RateLimitPolicy) {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`INSERT INTO rate_limits (key, count, window_start) VALUES (${key}, 0, now()) ON CONFLICT (key) DO NOTHING`;
    const [row] = await tx.$queryRaw<{ count: number; window_start: Date; locked_until: Date | null }[]>`
      SELECT count, window_start, locked_until FROM rate_limits WHERE key = ${key} FOR UPDATE`;
    const state: RateLimitState = { count: row!.count, windowStart: row!.window_start, lockedUntil: row!.locked_until };
    const decision = applyHit(state, policy, new Date());
    await tx.rateLimit.update({
      where: { key },
      data: { count: decision.next.count, windowStart: decision.next.windowStart, lockedUntil: decision.next.lockedUntil },
    });
    return decision;
  });
}

export async function reset(key: string) {
  await db.rateLimit.deleteMany({ where: { key } });
}

export function formatRetry(ms: number) {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
