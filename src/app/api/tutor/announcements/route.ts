import { fail, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { notify } from "@/lib/notifications";
import { announcementSchema } from "@/lib/schemas";
import { batchRecipients, courseRecipients, findOwnedCourse } from "@/lib/tutor-access";

export async function POST(request: Request) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const body = await parseBody(request, announcementSchema);
  if ("response" in body) return body.response;
  const { courseId, batchId, title, content } = body.data;

  const course = await findOwnedCourse(tutor.id, courseId);
  if (!course) return notFound("Course not found.");
  if (batchId && !(await db.batch.findFirst({ where: { id: batchId, courseId }, select: { id: true } }))) {
    return fail(422, "validation_error", "That batch does not belong to this course.", { batchId: ["Choose a batch from this course"] });
  }

  const announcement = await db.announcement.create({ data: { courseId, batchId, tutorId: tutor.id, title, content }, select: { id: true } });
  const recipients = await (batchId ? batchRecipients(batchId) : courseRecipients(courseId));
  void notify.announcement(recipients, { title, content, courseTitle: course.title, tutorName: tutor.user.name });
  return ok({ id: announcement.id, notified: recipients.length }, { status: 201 });
}
