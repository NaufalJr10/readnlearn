import { decideAccount } from "@/lib/admin-decision";

export async function PATCH(_request: Request, ctx: RouteContext<"/api/admin/accounts/[userId]/accept">) {
  const { userId } = await ctx.params;
  return decideAccount(userId, "accept");
}
