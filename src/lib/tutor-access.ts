import "server-only";
import { isUuid } from "./api";
import { db } from "./db";

/** Every lookup is scoped to the tutor, so another tutor's resource is indistinguishable from a missing one. */
export const findOwnedCourse = (tutorId: string, id: string) => (isUuid(id) ? db.course.findFirst({ where: { id, tutorId } }) : Promise.resolve(null));

export const findOwnedBatch = (tutorId: string, id: string) =>
  isUuid(id) ? db.batch.findFirst({ where: { id, course: { tutorId } }, include: { course: { select: { id: true, title: true } } } }) : Promise.resolve(null);

export const findOwnedLesson = (tutorId: string, id: string) =>
  isUuid(id)
    ? db.lesson.findFirst({ where: { id, batch: { course: { tutorId } } }, include: { batch: { select: { id: true, name: true, course: { select: { id: true, title: true } } } } } })
    : Promise.resolve(null);

export const findOwnedAssignment = (tutorId: string, id: string) =>
  isUuid(id) ? db.assignment.findFirst({ where: { id, batch: { course: { tutorId } } }, include: { batch: { select: { id: true, name: true, course: { select: { id: true, title: true } } } } } }) : Promise.resolve(null);

export async function batchRecipients(batchId: string) {
  const rows = await db.batchStudent.findMany({ where: { batchId }, select: { student: { select: { user: { select: { name: true, email: true } } } } } });
  return rows.map((r) => r.student.user);
}

export async function courseRecipients(courseId: string) {
  const rows = await db.courseEnrollment.findMany({ where: { courseId }, select: { student: { select: { user: { select: { name: true, email: true } } } } } });
  return rows.map((r) => r.student.user);
}
