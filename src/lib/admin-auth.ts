import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";
import { ADMIN_COOKIE, verifyAdminToken } from "./admin-session";

/** Verifies the cookie and confirms the admin still exists and is active. */
export async function getAdmin() {
  const store = await cookies();
  const session = await verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
  if (!session) return null;
  const admin = await db.user.findUnique({ where: { id: session.adminId }, select: { id: true, name: true, role: true, status: true } });
  return admin && admin.role === "admin" && admin.status === "active" ? admin : null;
}
