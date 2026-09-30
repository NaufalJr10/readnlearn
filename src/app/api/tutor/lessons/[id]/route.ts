import { fail, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/guards";
import { notify } from "@/lib/notifications";
import { recomputeCourseProgress } from "@/lib/progress";
import { lessonSchema } from "@/lib/schemas";
import { batchRecipients, findOwnedLesson } from "@/lib/tutor-access";

export async function PATCH(request: Request, ctx: RouteContext<"/api/tutor/lessons/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const lesson = await findOwnedLesson(tutor.id, id);
  if (!lesson) return notFound("Lesson not found.");
  if (lesson.cancelledAt) return fail(409, "cancelled", "This lesson was cancelled. Schedule a new one instead.");

  const body = await parseBody(request, lessonSchema);
  if ("response" in body) return body.response;
  const scheduledAt = new Date(body.data.scheduledAt);
  const timeChanged = scheduledAt.getTime() !== lesson.scheduledAt.getTime() || body.data.durationMinutes !== lesson.durationMinutes;

  await db.lesson.update({
    where: { id },
    data: { title: body.data.title, scheduledAt, durationMinutes: body.data.durationMinutes, description: body.data.description },
  });
  if (timeChanged) {
    void batchRecipients(lesson.batchId).then((recipients) =>
      notify.lessonScheduled(recipients, {
        title: body.data.title,
        scheduledAt,
        durationMinutes: body.data.durationMinutes,
        courseTitle: lesson.batch.course.title,
        batchName: lesson.batch.name,
        changed: true,
      }),
    );
  }
  return ok({ id });
}

/** DELETE cancels the lesson, so attendance history and student calendars stay consistent. */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/tutor/lessons/[id]">) {
  const tutor = await requireTutor();
  if (!tutor) return unauthorized();
  const { id } = await ctx.params;
  const lesson = await findOwnedLesson(tutor.id, id);
  if (!lesson) return notFound("Lesson not found.");
  if (lesson.cancelledAt) return ok({ cancelled: true });

  await db.lesson.update({ where: { id }, data: { cancelledAt: new Date() } });
  await recomputeCourseProgress(lesson.batch.course.id);
  void batchRecipients(lesson.batchId).then((recipients) =>
    notify.lessonCancelled(recipients, { title: lesson.title, scheduledAt: lesson.scheduledAt, courseTitle: lesson.batch.course.title }),
  );
  return ok({ cancelled: true });
}
