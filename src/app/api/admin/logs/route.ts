import { fail, ok } from "@/lib/api";
import { getAdmin } from "@/lib/admin-auth";
import { listAuditLog } from "@/lib/admin-accounts";

export async function GET() {
  if (!(await getAdmin())) return fail(401, "unauthorized", "Admin authentication required.");
  return ok(await listAuditLog(50));
}
