import { jwtVerify, SignJWT } from "jose";

export const ADMIN_COOKIE = "rnl_admin";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

function key() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(adminId: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_SECONDS}s`)
    .setAudience("readnlearn-admin")
    .sign(key());
}

export async function verifyAdminToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"], audience: "readnlearn-admin" });
    return payload.role === "admin" && payload.sub ? { adminId: payload.sub } : null;
  } catch {
    return null;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: ADMIN_SESSION_SECONDS,
};
