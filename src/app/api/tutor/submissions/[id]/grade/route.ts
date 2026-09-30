import { fail, isUuid, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { notify } from "@/lib/notifications";
import { gradeSchema } from "@/lib/schemas";

export async function PATCH(request: Request, ctx: RouteContext<"/api/tutor/submissions/[id]/grade">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();

  const submission = await db.submission.findFirst({
    where: { id, assignment: { batch: { course: { tutorId: tutor.id } } } },
    include: {
      assignment: { select: { title: true, maxScore: true, batch: { select: { course: { select: { title: true } } } } } },
      student: { select: { user: { select: { name: true, email: true } } } },
    },
  });
  if (!submission) return notFound("Submission not found.");

  const body = await parseBody(request, gradeSchema);
  if ("response" in body) return body.response;
  const { score, feedback } = body.data;
  if (score > submission.assignment.maxScore) {
    return fail(422, "validation_error", `The maximum score for this assignment is ${submission.assignment.maxScore}.`, { score: [`At most ${submission.assignment.maxScore}`] });
  }

  await db.submission.update({ where: { id }, data: { score, feedback, gradedAt: new Date() } });
  void notify.assignmentGraded(submission.student.user, {
    assignmentTitle: submission.assignment.title,
    courseTitle: submission.assignment.batch.course.title,
    score,
    maxScore: submission.assignment.maxScore,
    feedback,
  });
  return ok({ id, score });
}
