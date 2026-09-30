import { decideAccount } from "@/lib/admin-decision";

export async function PATCH(_request: Request, ctx: RouteContext<"/api/admin/accounts/[userId]/reject">) {
  const { userId } = await ctx.params;
  return decideAccount(userId, "reject");
}
