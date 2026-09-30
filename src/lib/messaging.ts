import "server-only";
import { db } from "./db";
import type { ContactDTO, ConversationDTO, MessageDTO, SearchHitDTO } from "./messaging-types";

export const THREAD_PAGE_SIZE = 40;

type Role = "student" | "tutor";

const toDto = (m: { id: string; senderId: string; recipientId: string; content: string; createdAt: Date; readAt: Date | null }): MessageDTO => ({
  id: m.id,
  senderId: m.senderId,
  recipientId: m.recipientId,
  content: m.content,
  createdAt: m.createdAt.toISOString(),
  readAt: m.readAt?.toISOString() ?? null,
});
export { toDto as messageToDto };

/**
 * Students may message any active tutor. Tutors may message their enrolled students, or reply to a student who wrote first.
 */
export async function findMessagingPartner(me: { id: string; role: Role }, partnerId: string) {
  const partner = await db.user.findFirst({ where: { id: partnerId, status: "active", role: me.role === "student" ? "tutor" : "student" }, select: { id: true, name: true, role: true } });
  if (!partner) return null;
  if (me.role === "student") return partner;

  const [enrolled, hasThread] = await Promise.all([
    db.courseEnrollment.count({ where: { student: { userId: partnerId }, course: { tutor: { userId: me.id } } } }),
    db.message.count({ where: { senderId: partnerId, recipientId: me.id } }),
  ]);
  return enrolled > 0 || hasThread > 0 ? partner : null;
}

export async function getContacts(me: { id: string; role: Role }): Promise<ContactDTO[]> {
  if (me.role === "tutor") {
    const rows = await db.courseEnrollment.findMany({
      where: { course: { tutor: { userId: me.id } }, student: { user: { status: "active" } } },
      select: { course: { select: { title: true } }, student: { select: { user: { select: { id: true, name: true } } } } },
      orderBy: { enrolledAt: "desc" },
    });
    const seen = new Map<string, ContactDTO>();
    for (const r of rows) if (!seen.has(r.student.user.id)) seen.set(r.student.user.id, { id: r.student.user.id, name: r.student.user.name, role: "student", detail: r.course.title });
    return [...seen.values()];
  }
  const rows = await db.courseEnrollment.findMany({
    where: { student: { userId: me.id }, course: { tutor: { user: { status: "active" } } } },
    select: { course: { select: { title: true, tutor: { select: { user: { select: { id: true, name: true } } } } } } },
  });
  const seen = new Map<string, ContactDTO>();
  for (const r of rows) {
    const u = r.course.tutor.user;
    if (!seen.has(u.id)) seen.set(u.id, { id: u.id, name: u.name, role: "tutor", detail: r.course.title });
  }
  return [...seen.values()];
}

export async function listConversations(meId: string): Promise<ConversationDTO[]> {
  const [latest, unread] = await Promise.all([
    db.$queryRaw<{ partner_id: string; content: string; created_at: Date; sender_id: string }[]>`
      SELECT DISTINCT ON (partner_id) partner_id, content, created_at, sender_id FROM (
        SELECT CASE WHEN sender_id = ${meId}::uuid THEN recipient_id ELSE sender_id END AS partner_id, content, created_at, sender_id
        FROM messages WHERE sender_id = ${meId}::uuid OR recipient_id = ${meId}::uuid
      ) t ORDER BY partner_id, created_at DESC`,
    db.message.groupBy({ by: ["senderId"], where: { recipientId: meId, readAt: null }, _count: { _all: true } }),
  ]);
  if (latest.length === 0) return [];

  const people = await db.user.findMany({ where: { id: { in: latest.map((l) => l.partner_id) }, status: "active" }, select: { id: true, name: true, role: true } });
  const byId = new Map(people.map((p) => [p.id, p]));
  const unreadBy = new Map(unread.map((u) => [u.senderId, u._count._all]));

  return latest
    .filter((l) => byId.has(l.partner_id))
    .map((l) => {
      const p = byId.get(l.partner_id)!;
      return {
        partnerId: p.id,
        partnerName: p.name,
        partnerRole: p.role as Role,
        lastMessage: l.content,
        lastAt: l.created_at.toISOString(),
        lastFromMe: l.sender_id === meId,
        unread: unreadBy.get(p.id) ?? 0,
      };
    })
    .sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
}

export async function getThread(meId: string, partnerId: string, opts: { before?: string; after?: string; limit?: number } = {}) {
  const limit = opts.limit ?? THREAD_PAGE_SIZE;
  const between = { OR: [{ senderId: meId, recipientId: partnerId }, { senderId: partnerId, recipientId: meId }] };

  if (opts.after) {
    const rows = await db.message.findMany({ where: { ...between, createdAt: { gt: new Date(opts.after) } }, orderBy: { createdAt: "asc" }, take: 200 });
    return { messages: rows.map(toDto), hasMore: false };
  }
  const rows = await db.message.findMany({
    where: { ...between, ...(opts.before ? { createdAt: { lt: new Date(opts.before) } } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });
  const hasMore = rows.length > limit;
  return { messages: rows.slice(0, limit).reverse().map(toDto), hasMore };
}

export async function searchMessages(meId: string, query: string): Promise<SearchHitDTO[]> {
  const term = query.trim().slice(0, 100);
  if (term.length < 2) return [];
  // Postgres LIKE treats backslash as the escape character by default.
  const pattern = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const rows = await db.$queryRaw<{ id: string; content: string; created_at: Date; partner_id: string; partner_name: string }[]>`
    SELECT m.id, m.content, m.created_at, p.id AS partner_id, p.name AS partner_name
    FROM messages m
    JOIN users p ON p.id = CASE WHEN m.sender_id = ${meId}::uuid THEN m.recipient_id ELSE m.sender_id END
    WHERE (m.sender_id = ${meId}::uuid OR m.recipient_id = ${meId}::uuid) AND p.status = 'active' AND m.content ILIKE ${pattern}
    ORDER BY m.created_at DESC LIMIT 20`;
  return rows.map((r) => ({ id: r.id, partnerId: r.partner_id, partnerName: r.partner_name, content: r.content, createdAt: r.created_at.toISOString() }));
}
