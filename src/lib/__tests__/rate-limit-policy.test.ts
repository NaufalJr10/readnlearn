import { applyHit, isLocked, type RateLimitPolicy } from "../rate-limit-policy";

const policy: RateLimitPolicy = { limit: 3, windowMs: 15 * 60_000, lockMs: 15 * 60_000 };
const t0 = new Date("2026-01-01T00:00:00Z");
const at = (ms: number) => new Date(t0.getTime() + ms);

describe("applyHit", () => {
  it("counts hits within the window", () => {
    const first = applyHit(null, policy, t0);
    expect(first).toMatchObject({ allowed: true, next: { count: 1, lockedUntil: null } });
    const second = applyHit(first.next, policy, at(1000));
    expect(second.next.count).toBe(2);
    expect(second.next.lockedUntil).toBeNull();
  });

  it("locks for 15 minutes on the third failed admin attempt", () => {
    let state = applyHit(null, policy, t0).next;
    state = applyHit(state, policy, at(1000)).next;
    const third = applyHit(state, policy, at(2000));
    expect(third.next.lockedUntil).toEqual(at(2000 + policy.lockMs));
    expect(isLocked(third.next, at(3000))).toBe(true);
  });

  it("rejects hits while locked and reports remaining time", () => {
    const locked = { count: 3, windowStart: t0, lockedUntil: at(10 * 60_000) };
    const decision = applyHit(locked, policy, at(4 * 60_000));
    expect(decision.allowed).toBe(false);
    expect(decision.retryAfterMs).toBe(6 * 60_000);
    expect(decision.next).toBe(locked);
  });

  it("starts a fresh window after the lock expires", () => {
    const locked = { count: 3, windowStart: t0, lockedUntil: at(15 * 60_000) };
    const decision = applyHit(locked, policy, at(16 * 60_000));
    expect(decision).toMatchObject({ allowed: true, next: { count: 1, lockedUntil: null } });
  });

  it("resets the count when the window expires without a lock", () => {
    const state = { count: 2, windowStart: t0, lockedUntil: null };
    expect(applyHit(state, policy, at(policy.windowMs)).next.count).toBe(1);
  });
});
