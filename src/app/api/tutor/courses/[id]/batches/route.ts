import { notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { batchSchema } from "@/lib/schemas";
import { findOwnedCourse } from "@/lib/tutor-access";

export async function POST(request: Request, ctx: RouteContext<"/api/tutor/courses/[id]/batches">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  if (!(await findOwnedCourse(tutor.id, id))) return notFound("Course not found.");

  const body = await parseBody(request, batchSchema);
  if ("response" in body) return body.response;

  const batch = await db.batch.create({
    data: { courseId: id, name: body.data.name, startDate: new Date(body.data.startDate), endDate: new Date(body.data.endDate) },
    select: { id: true },
  });
  return ok({ id: batch.id }, { status: 201 });
}
