import { ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/guards";
import { announcementReadSchema } from "@/lib/schemas";
import { announcementVisibleTo } from "@/lib/student-data";

/** Marks the given announcements (or every visible one when no ids are sent) as read. */
export async function POST(request: Request) {
  const student = await requireStudent();
  if (!student) return unauthorized();
  const body = await parseBody(request, announcementReadSchema);
  if ("response" in body) return body.response;

  const visible = await db.announcement.findMany({
    where: { ...announcementVisibleTo(student.id), reads: { none: { userId: student.userId } }, ...(body.data.ids ? { id: { in: body.data.ids } } : {}) },
    select: { id: true },
  });
  if (visible.length > 0) {
    await db.announcementRead.createMany({ data: visible.map((a) => ({ announcementId: a.id, userId: student.userId })), skipDuplicates: true });
  }
  return ok({ marked: visible.length });
}
