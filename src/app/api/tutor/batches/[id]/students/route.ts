import { z } from "zod";
import { fail, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { recomputeProgress } from "@/lib/progress";
import { batchStudentsSchema } from "@/lib/schemas";
import { findOwnedBatch } from "@/lib/tutor-access";

export async function POST(request: Request, ctx: RouteContext<"/api/tutor/batches/[id]/students">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const batch = await findOwnedBatch(tutor.id, id);
  if (!batch) return notFound("Batch not found.");

  const body = await parseBody(request, batchStudentsSchema);
  if ("response" in body) return body.response;
  const studentIds = [...new Set(body.data.studentIds)];

  const enrolled = await db.courseEnrollment.count({ where: { courseId: batch.courseId, studentId: { in: studentIds } } });
  if (enrolled !== studentIds.length) return fail(422, "not_enrolled", "Only students enrolled in this course can be added to its batches.");

  const created = await db.batchStudent.createMany({ data: studentIds.map((studentId) => ({ batchId: id, studentId })), skipDuplicates: true });
  await Promise.all(studentIds.map((studentId) => recomputeProgress(studentId, batch.courseId)));
  return ok({ added: created.count }, { status: 201 });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/tutor/batches/[id]/students">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const batch = await findOwnedBatch(tutor.id, id);
  if (!batch) return notFound("Batch not found.");

  const studentId = new URL(request.url).searchParams.get("studentId") ?? "";
  if (!z.uuid().safeParse(studentId).success) return fail(422, "validation_error", "Choose a student to remove.");

  const removed = await db.batchStudent.deleteMany({ where: { batchId: id, studentId } });
  if (removed.count === 0) return notFound("That student is not in this batch.");
  await recomputeProgress(studentId, batch.courseId);
  return ok({ removed: true });
}
