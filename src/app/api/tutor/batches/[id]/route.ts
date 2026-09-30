import { notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { recomputeCourseProgress } from "@/lib/progress";
import { batchSchema } from "@/lib/schemas";
import { findOwnedBatch } from "@/lib/tutor-access";

export async function PATCH(request: Request, ctx: RouteContext<"/api/tutor/batches/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  if (!(await findOwnedBatch(tutor.id, id))) return notFound("Batch not found.");

  const body = await parseBody(request, batchSchema);
  if ("response" in body) return body.response;
  await db.batch.update({ where: { id }, data: { name: body.data.name, startDate: new Date(body.data.startDate), endDate: new Date(body.data.endDate) } });
  return ok({ id });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/tutor/batches/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const batch = await findOwnedBatch(tutor.id, id);
  if (!batch) return notFound("Batch not found.");

  await db.batch.delete({ where: { id } });
  await recomputeCourseProgress(batch.courseId);
  return ok({ deleted: true, courseId: batch.courseId });
}
