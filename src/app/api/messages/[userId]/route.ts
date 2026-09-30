import type { NextRequest } from "next/server";
import { isUuid, notFound, ok, unauthorized } from "@/lib/api";
import { requireSessionUser } from "@/lib/guards";
import { getThread } from "@/lib/messaging";

const validDate = (value: string | null) => (value && !Number.isNaN(new Date(value).getTime()) ? value : undefined);

export async function GET(request: NextRequest, ctx: RouteContext<"/api/messages/[userId]">) {
  const me = await requireSessionUser();
  if (!me) return unauthorized();
  const { userId } = await ctx.params;
  if (!isUuid(userId)) return notFound();

  const params = request.nextUrl.searchParams;
  return ok(await getThread(me.id, userId, { before: validDate(params.get("before")), after: validDate(params.get("after")) }));
}
