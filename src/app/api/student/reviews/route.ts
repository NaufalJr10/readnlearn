import { ok, parseBody, unauthorized, forbidden } from "@/lib/api";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/guards";
import { refreshCourseRatings } from "@/lib/progress";
import { reviewSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const student = await requireStudent();
  if (!student) return unauthorized();
  const body = await parseBody(request, reviewSchema);
  if ("response" in body) return body.response;
  const { courseId, rating, comment } = body.data;

  const enrollment = await db.courseEnrollment.findUnique({ where: { studentId_courseId: { studentId: student.id, courseId } }, include: { course: { select: { tutorId: true } } } });
  if (!enrollment) return forbidden("Only enrolled students can review a course.");

  await db.review.upsert({
    where: { courseId_studentId: { courseId, studentId: student.id } },
    create: { courseId, studentId: student.id, tutorId: enrollment.course.tutorId, rating, comment },
    update: { rating, comment },
  });
  await refreshCourseRatings(courseId);
  return ok({ saved: true });
}
