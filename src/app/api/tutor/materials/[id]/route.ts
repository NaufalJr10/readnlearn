import { isUuid, notFound, ok, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/tutor/materials/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();

  const removed = await db.material.deleteMany({ where: { id, course: { tutorId: tutor.id } } });
  return removed.count === 0 ? notFound("Material not found.") : ok({ deleted: true });
}
