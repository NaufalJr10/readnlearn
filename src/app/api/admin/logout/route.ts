import { cookies } from "next/headers";
import { ok } from "@/lib/api";
import { getAdmin } from "@/lib/admin-auth";
import { ADMIN_COOKIE } from "@/lib/admin-session";
import { db } from "@/lib/db";

export async function POST() {
  const admin = await getAdmin();
  if (admin) await db.adminLog.create({ data: { adminId: admin.id, action: "logout" } });
  (await cookies()).delete(ADMIN_COOKIE);
  return ok({ loggedOut: true });
}
