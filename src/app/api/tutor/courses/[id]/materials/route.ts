import { notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { materialSchema } from "@/lib/schemas";
import { findOwnedCourse } from "@/lib/tutor-access";

export async function POST(request: Request, ctx: RouteContext<"/api/tutor/courses/[id]/materials">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  if (!(await findOwnedCourse(tutor.id, id))) return notFound("Course not found.");

  const body = await parseBody(request, materialSchema);
  if ("response" in body) return body.response;

  const material = await db.material.create({ data: { courseId: id, ...body.data }, select: { id: true } });
  return ok({ id: material.id }, { status: 201 });
}
