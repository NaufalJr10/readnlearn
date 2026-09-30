import { notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { assignmentSchema } from "@/lib/schemas";
import { findOwnedBatch } from "@/lib/tutor-access";

export async function POST(request: Request, ctx: RouteContext<"/api/tutor/batches/[id]/assignments">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  if (!(await findOwnedBatch(tutor.id, id))) return notFound("Batch not found.");

  const body = await parseBody(request, assignmentSchema);
  if ("response" in body) return body.response;

  const assignment = await db.assignment.create({
    data: { batchId: id, title: body.data.title, description: body.data.description, dueDate: new Date(body.data.dueDate), maxScore: body.data.maxScore },
    select: { id: true },
  });
  return ok({ id: assignment.id }, { status: 201 });
}
