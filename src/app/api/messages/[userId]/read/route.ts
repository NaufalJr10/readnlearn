import { isUuid, notFound, ok, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/guards";
import { emitToUser } from "@/lib/realtime";

/** Marks everything the other person sent me as read and lets them see the read receipt live. */
export async function PATCH(_request: Request, ctx: RouteContext<"/api/messages/[userId]/read">) {
  const me = await requireSessionUser();
  if (!me) return unauthorized();
  const { userId } = await ctx.params;
  if (!isUuid(userId)) return notFound();

  const readAt = new Date();
  const updated = await db.message.updateMany({ where: { senderId: userId, recipientId: me.id, readAt: null }, data: { readAt } });
  if (updated.count > 0) {
    emitToUser(userId, "message:read", { readerId: me.id, readAt: readAt.toISOString() });
    emitToUser(me.id, "message:read", { readerId: me.id, readAt: readAt.toISOString() });
  }
  return ok({ marked: updated.count });
}
