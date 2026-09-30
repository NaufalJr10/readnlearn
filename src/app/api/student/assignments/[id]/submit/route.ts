import { fail, isUuid, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/guards";
import { submissionSchema } from "@/lib/schemas";

export async function POST(request: Request, ctx: RouteContext<"/api/student/assignments/[id]/submit">) {
  const student = await requireStudent();
  if (!student) return unauthorized();
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();

  const body = await parseBody(request, submissionSchema);
  if ("response" in body) return body.response;

  const assignment = await db.assignment.findFirst({ where: { id, batch: { students: { some: { studentId: student.id } } } }, select: { id: true } });
  if (!assignment) return notFound("This assignment isn't available to you.");

  const existing = await db.submission.findUnique({ where: { assignmentId_studentId: { assignmentId: id, studentId: student.id } } });
  if (existing?.gradedAt) return fail(409, "already_graded", "This submission has been graded, so it can no longer be changed.");

  const submission = await db.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: id, studentId: student.id } },
    create: { assignmentId: id, studentId: student.id, submissionUrl: body.data.submissionUrl },
    update: { submissionUrl: body.data.submissionUrl, submittedAt: new Date() },
  });
  return ok({ id: submission.id, submittedAt: submission.submittedAt.toISOString() }, { status: existing ? 200 : 201 });
}
