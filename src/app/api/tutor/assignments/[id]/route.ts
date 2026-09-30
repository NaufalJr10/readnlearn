import { fail, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { assignmentSchema } from "@/lib/schemas";
import { findOwnedAssignment } from "@/lib/tutor-access";

export async function PATCH(request: Request, ctx: RouteContext<"/api/tutor/assignments/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const assignment = await findOwnedAssignment(tutor.id, id);
  if (!assignment) return notFound("Assignment not found.");

  const body = await parseBody(request, assignmentSchema);
  if ("response" in body) return body.response;

  if (body.data.maxScore < assignment.maxScore) {
    const highest = await db.submission.aggregate({ where: { assignmentId: id }, _max: { score: true } });
    const top = highest._max.score ?? 0;
    if (top > body.data.maxScore) {
      return fail(422, "validation_error", `A student already scored ${top}, so the maximum score can't go below that.`, { maxScore: [`Must be at least ${top}`] });
    }
  }

  await db.assignment.update({
    where: { id },
    data: { title: body.data.title, description: body.data.description, dueDate: new Date(body.data.dueDate), maxScore: body.data.maxScore },
  });
  return ok({ id });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/tutor/assignments/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const assignment = await findOwnedAssignment(tutor.id, id);
  if (!assignment) return notFound("Assignment not found.");

  await db.assignment.delete({ where: { id } });
  return ok({ deleted: true, batchId: assignment.batchId });
}
