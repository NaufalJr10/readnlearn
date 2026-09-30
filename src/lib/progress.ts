import "server-only";
import { db } from "./db";

/** Progress = share of a student's scheduled lessons in this course that they attended (present or late). */
export async function recomputeProgress(studentId: string, courseId: string) {
  const [total, attended] = await Promise.all([
    db.lesson.count({ where: { cancelledAt: null, batch: { courseId, students: { some: { studentId } } } } }),
    db.attendance.count({
      where: { status: { in: ["present", "late"] }, lesson: { cancelledAt: null, batch: { courseId } }, batchStudent: { studentId } },
    }),
  ]);
  const percentage = total === 0 ? 0 : Math.min(100, Math.round((attended / total) * 100));
  await db.courseEnrollment.updateMany({ where: { studentId, courseId }, data: { progressPercentage: percentage } });
}

export async function recomputeCourseProgress(courseId: string) {
  const enrollments = await db.courseEnrollment.findMany({ where: { courseId }, select: { studentId: true } });
  await Promise.all(enrollments.map((e) => recomputeProgress(e.studentId, courseId)));
}

export async function refreshCourseRatings(courseId: string) {
  await db.$executeRaw`
    UPDATE courses c SET rating = COALESCE(s.avg, 0), total_reviews = COALESCE(s.cnt, 0)
    FROM (SELECT ROUND(AVG(rating)::numeric, 2) AS avg, COUNT(*)::int AS cnt FROM reviews WHERE course_id = ${courseId}::uuid) s
    WHERE c.id = ${courseId}::uuid`;
  await db.$executeRaw`
    UPDATE tutors t SET rating = COALESCE(s.avg, 0), total_reviews = COALESCE(s.cnt, 0)
    FROM (SELECT ROUND(AVG(rating)::numeric, 2) AS avg, COUNT(*)::int AS cnt FROM reviews
          WHERE tutor_id = (SELECT tutor_id FROM courses WHERE id = ${courseId}::uuid)) s
    WHERE t.id = (SELECT tutor_id FROM courses WHERE id = ${courseId}::uuid)`;
}
