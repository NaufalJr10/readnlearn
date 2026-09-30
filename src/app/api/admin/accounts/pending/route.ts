import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { getAdmin } from "@/lib/admin-auth";
import { listPendingAccounts } from "@/lib/admin-accounts";

export async function GET(request: NextRequest) {
  if (!(await getAdmin())) return fail(401, "unauthorized", "Admin authentication required.");
  const params = request.nextUrl.searchParams;
  return ok(await listPendingAccounts({ q: params.get("q") ?? undefined, role: params.get("role") ?? undefined }));
}
