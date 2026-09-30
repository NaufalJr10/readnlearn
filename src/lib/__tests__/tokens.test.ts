import { generateReferralCode, generateResetCode, hashResetCode, safeEqualHex } from "../tokens";

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-secret";
});

describe("generateResetCode", () => {
  it("always returns six digits", () => {
    for (let i = 0; i < 200; i++) expect(generateResetCode()).toMatch(/^\d{6}$/);
  });
});

describe("hashResetCode", () => {
  it("is deterministic per user and code", () => {
    expect(hashResetCode("u1", "123456")).toBe(hashResetCode("u1", "123456"));
  });
  it("binds the code to the user", () => {
    expect(hashResetCode("u1", "123456")).not.toBe(hashResetCode("u2", "123456"));
  });
  it("compares hashes safely", () => {
    const hash = hashResetCode("u1", "123456");
    expect(safeEqualHex(hash, hashResetCode("u1", "123456"))).toBe(true);
    expect(safeEqualHex(hash, hashResetCode("u1", "654321"))).toBe(false);
    expect(safeEqualHex(hash, "abcd")).toBe(false);
  });
});

describe("generateReferralCode", () => {
  it("uses an unambiguous lowercase alphabet", () => {
    for (let i = 0; i < 100; i++) expect(generateReferralCode()).toMatch(/^[a-hj-km-np-z2-9]{8}$/);
  });
});
