import { ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { courseSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const body = await parseBody(request, courseSchema);
  if ("response" in body) return body.response;

  const course = await db.course.create({ data: { ...body.data, tutorId: tutor.id, isPublished: false }, select: { id: true } });
  return ok({ id: course.id }, { status: 201 });
}
