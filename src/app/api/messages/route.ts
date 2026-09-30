import { fail, forbidden, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/guards";
import { findMessagingPartner, messageToDto } from "@/lib/messaging";
import { notify } from "@/lib/notifications";
import { formatRetry, hit, POLICIES } from "@/lib/rate-limit";
import { emitToUser } from "@/lib/realtime";
import { messageSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const me = await requireSessionUser();
  if (!me) return unauthorized();

  const body = await parseBody(request, messageSchema);
  if ("response" in body) return body.response;
  const { recipientId, content } = body.data;

  const limit = await hit(`message-send:${me.id}`, POLICIES.messageSend);
  if (!limit.allowed) return fail(429, "rate_limited", `You are sending messages too quickly. Try again in ${formatRetry(limit.retryAfterMs)}.`);

  const partner = await findMessagingPartner({ id: me.id, role: me.role }, recipientId);
  if (!partner) {
    const exists = await db.user.count({ where: { id: recipientId, status: "active" } });
    return exists ? forbidden("You can only message tutors, or students who are enrolled in your courses.") : notFound("That person is not available.");
  }

  const priorUnread = await db.message.count({ where: { senderId: me.id, recipientId, readAt: null } });
  const message = await db.message.create({ data: { senderId: me.id, recipientId, content } });
  const dto = messageToDto(message);

  emitToUser(recipientId, "message:new", dto);
  emitToUser(me.id, "message:new", dto);

  // One email per unread streak, so a chatty conversation does not flood the inbox.
  if (priorUnread === 0 && me.role === "tutor") {
    const recipient = await db.user.findUnique({ where: { id: recipientId }, select: { name: true, email: true } });
    if (recipient) void notify.newMessage(recipient, { fromName: me.name ?? "Your tutor", preview: content, inboxPath: `/student/messages?with=${me.id}` });
  }
  return ok(dto, { status: 201 });
}
