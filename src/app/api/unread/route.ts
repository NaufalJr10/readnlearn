import { ok, unauthorized } from "@/lib/api";
import { requireSessionUser } from "@/lib/guards";
import { getStudentByUserId, unreadAnnouncementCount, unreadMessageCount } from "@/lib/student-data";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) return unauthorized();
  const messages = await unreadMessageCount(user.id);
  let announcements = 0;
  if (user.role === "student") {
    const student = await getStudentByUserId(user.id);
    if (student) announcements = await unreadAnnouncementCount(user.id, student.id);
  }
  return ok({ messages, announcements });
}
