export type RateLimitState = { count: number; windowStart: Date; lockedUntil: Date | null };
export type RateLimitPolicy = { limit: number; windowMs: number; lockMs: number };
export type RateLimitDecision = { allowed: boolean; retryAfterMs: number; next: RateLimitState };

/** Pure fixed-window + lockout step: records one hit against `state` at time `now`. */
export function applyHit(state: RateLimitState | null, policy: RateLimitPolicy, now: Date): RateLimitDecision {
  if (state?.lockedUntil && state.lockedUntil > now) {
    return { allowed: false, retryAfterMs: state.lockedUntil.getTime() - now.getTime(), next: state };
  }
  const windowExpired = !state || now.getTime() - state.windowStart.getTime() >= policy.windowMs || state.lockedUntil !== null;
  const base: RateLimitState = windowExpired ? { count: 0, windowStart: now, lockedUntil: null } : state;
  const count = base.count + 1;
  if (count >= policy.limit) {
    const lockedUntil = new Date(now.getTime() + policy.lockMs);
    return { allowed: count === policy.limit, retryAfterMs: policy.lockMs, next: { count, windowStart: base.windowStart, lockedUntil } };
  }
  return { allowed: true, retryAfterMs: 0, next: { ...base, count } };
}

export function isLocked(state: RateLimitState | null, now: Date) {
  return Boolean(state?.lockedUntil && state.lockedUntil > now);
}
