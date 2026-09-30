import { fieldErrors, resetPasswordSchema, signupSchema } from "../validation";

const valid = { name: "Jane Doe", email: "  Jane@Example.com ", password: "Secret123", role: "student" };

describe("signupSchema", () => {
  it("normalizes email and accepts valid input", () => {
    const result = signupSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("jane@example.com");
  });

  it("rejects admin as a self-service role", () => {
    const result = signupSchema.safeParse({ ...valid, role: "admin" });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).role).toBeDefined();
  });

  it.each([
    ["short", "Ab1"],
    ["no uppercase", "secret123"],
    ["no lowercase", "SECRET123"],
    ["no digit", "SecretPass"],
  ])("rejects a weak password (%s)", (_label, password) => {
    const result = signupSchema.safeParse({ ...valid, password });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).password?.length).toBeGreaterThan(0);
  });

  it("rejects invalid emails", () => {
    expect(signupSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires exactly six digits", () => {
    const base = { email: "a@b.co", password: "Secret123" };
    expect(resetPasswordSchema.safeParse({ ...base, code: "123456" }).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ ...base, code: "12345" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ ...base, code: "12345a" }).success).toBe(false);
  });
});
