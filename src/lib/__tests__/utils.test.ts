import { effectivePrice, formatPrice, initials, normalizeEmail, safeRedirectPath } from "../utils";

describe("formatPrice", () => {
  it("shows Free for zero", () => expect(formatPrice(0)).toBe("Free"));
  it("formats whole and fractional dollars", () => {
    expect(formatPrice(129)).toBe("$129");
    expect(formatPrice(9.5)).toBe("$9.5");
  });
});

describe("effectivePrice", () => {
  it("prefers free, then discount, then list price", () => {
    expect(effectivePrice({ price: 100, discountPrice: 80, isFree: true })).toBe(0);
    expect(effectivePrice({ price: 100, discountPrice: 80, isFree: false })).toBe(80);
    expect(effectivePrice({ price: 100, discountPrice: null, isFree: false })).toBe(100);
  });
});

describe("initials", () => {
  it("uses up to two words", () => {
    expect(initials("amara okafor")).toBe("AO");
    expect(initials("  Admin ")).toBe("A");
    expect(initials("Mary Jane Watson")).toBe("MJ");
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => expect(normalizeEmail("  Jane@Example.COM ")).toBe("jane@example.com"));
});

describe("safeRedirectPath", () => {
  it("allows same-origin paths", () => expect(safeRedirectPath("/courses/1?x=2", "/")).toBe("/courses/1?x=2"));
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "", null, undefined])("rejects %p", (value) => {
    expect(safeRedirectPath(value, "/student")).toBe("/student");
  });
});
