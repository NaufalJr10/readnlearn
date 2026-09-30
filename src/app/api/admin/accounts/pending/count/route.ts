import { fail, ok } from "@/lib/api";
import { getAdmin } from "@/lib/admin-auth";
import { countPendingAccounts } from "@/lib/admin-accounts";

export async function GET() {
  if (!(await getAdmin())) return fail(401, "unauthorized", "Admin authentication required.");
  return ok({ count: await countPendingAccounts() });
}
