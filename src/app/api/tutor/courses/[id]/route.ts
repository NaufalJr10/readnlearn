import { fail, notFound, ok, readJson, unauthorized, validationFailed } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { coursePatchSchema, courseSchema } from "@/lib/schemas";
import { findOwnedCourse } from "@/lib/tutor-access";

export async function PATCH(request: Request, ctx: RouteContext<"/api/tutor/courses/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const course = await findOwnedCourse(tutor.id, id);
  if (!course) return notFound("Course not found.");

  const json = await readJson(request);
  const isPublishToggle = typeof json === "object" && json !== null && Object.keys(json).length === 1 && "isPublished" in json;
  if (isPublishToggle) {
    const parsed = coursePatchSchema.safeParse(json);
    if (!parsed.success) return validationFailed(parsed.error);
    await db.course.update({ where: { id }, data: { isPublished: parsed.data.isPublished } });
    return ok({ isPublished: parsed.data.isPublished });
  }

  const parsed = courseSchema.safeParse(json);
  if (!parsed.success) return validationFailed(parsed.error);
  await db.course.update({ where: { id }, data: parsed.data });
  return ok({ id });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/tutor/courses/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const course = await findOwnedCourse(tutor.id, id);
  if (!course) return notFound("Course not found.");

  const enrollments = await db.courseEnrollment.count({ where: { courseId: id } });
  if (enrollments > 0) return fail(409, "has_enrollments", `This course has ${enrollments} enrolled student${enrollments === 1 ? "" : "s"}, so it can't be deleted. Unpublish it instead.`);

  await db.course.delete({ where: { id } });
  return ok({ deleted: true });
}
