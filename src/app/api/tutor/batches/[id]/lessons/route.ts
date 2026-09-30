import { notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { notify } from "@/lib/notifications";
import { recomputeCourseProgress } from "@/lib/progress";
import { lessonSchema } from "@/lib/schemas";
import { batchRecipients, findOwnedBatch } from "@/lib/tutor-access";

export async function POST(request: Request, ctx: RouteContext<"/api/tutor/batches/[id]/lessons">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const batch = await findOwnedBatch(tutor.id, id);
  if (!batch) return notFound("Batch not found.");

  const body = await parseBody(request, lessonSchema);
  if ("response" in body) return body.response;

  const lesson = await db.lesson.create({
    data: { batchId: id, title: body.data.title, scheduledAt: new Date(body.data.scheduledAt), durationMinutes: body.data.durationMinutes, description: body.data.description },
  });
  await recomputeCourseProgress(batch.courseId);
  void batchRecipients(id).then((recipients) =>
    notify.lessonScheduled(recipients, {
      title: lesson.title,
      scheduledAt: lesson.scheduledAt,
      durationMinutes: lesson.durationMinutes,
      courseTitle: batch.course.title,
      batchName: batch.name,
    }),
  );
  return ok({ id: lesson.id }, { status: 201 });
}
