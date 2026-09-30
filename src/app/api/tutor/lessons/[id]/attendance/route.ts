import { fail, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { recomputeProgress } from "@/lib/progress";
import { attendanceSchema } from "@/lib/schemas";
import { findOwnedLesson } from "@/lib/tutor-access";

export async function PUT(request: Request, ctx: RouteContext<"/api/tutor/lessons/[id]/attendance">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const lesson = await findOwnedLesson(tutor.id, id);
  if (!lesson) return notFound("Lesson not found.");
  if (lesson.cancelledAt) return fail(409, "cancelled", "Attendance can't be taken for a cancelled lesson.");

  const body = await parseBody(request, attendanceSchema);
  if ("response" in body) return body.response;

  const members = await db.batchStudent.findMany({ where: { batchId: lesson.batchId }, select: { id: true, studentId: true } });
  const studentByMember = new Map(members.map((m) => [m.id, m.studentId]));
  if (body.data.records.some((r) => !studentByMember.has(r.batchStudentId))) {
    return fail(422, "invalid_student", "One of those students is not in this lesson's batch.");
  }

  await db.$transaction(
    body.data.records.map((r) =>
      db.attendance.upsert({
        where: { lessonId_batchStudentId: { lessonId: id, batchStudentId: r.batchStudentId } },
        create: { lessonId: id, batchStudentId: r.batchStudentId, status: r.status },
        update: { status: r.status },
      }),
    ),
  );
  const studentIds = new Set(body.data.records.map((r) => studentByMember.get(r.batchStudentId)!));
  await Promise.all([...studentIds].map((studentId) => recomputeProgress(studentId, lesson.batch.course.id)));
  return ok({ saved: body.data.records.length });
}
