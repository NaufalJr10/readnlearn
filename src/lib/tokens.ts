import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const RESET_CODE_TTL_MS = 15 * 60_000;
export const RESET_CODE_MAX_ATTEMPTS = 5;

export function generateResetCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function secret() {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("NEXTAUTH_SECRET is not set");
  return value;
}

export function hashResetCode(userId: string, code: string) {
  return createHmac("sha256", secret()).update(`${userId}:${code}`).digest("hex");
}

export function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

const REFERRAL_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateReferralCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i++) code += REFERRAL_ALPHABET[randomInt(0, REFERRAL_ALPHABET.length)];
  return code;
}
