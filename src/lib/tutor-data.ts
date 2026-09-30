import "server-only";
import { db } from "./db";

const DAY_MS = 86_400_000;

export async function getTutorDashboard(tutor: { id: string; userId: string }) {
  const now = new Date();
  const [students, activeCourses, lessonsThisWeek, unreadMessages, recentAnnouncements] = await Promise.all([
    db.$queryRaw<{ count: bigint }[]>`
      SELECT count(DISTINCT e.student_id) AS count FROM course_enrollments e JOIN courses c ON c.id = e.course_id WHERE c.tutor_id = ${tutor.id}::uuid`,
    db.course.count({ where: { tutorId: tutor.id, isPublished: true } }),
    db.lesson.findMany({
      where: { cancelledAt: null, scheduledAt: { gte: now, lte: new Date(now.getTime() + 7 * DAY_MS) }, batch: { course: { tutorId: tutor.id } } },
      orderBy: { scheduledAt: "asc" },
      include: { batch: { select: { id: true, name: true, course: { select: { title: true } } } } },
    }),
    db.message.count({ where: { recipientId: tutor.userId, readAt: null } }),
    db.announcement.findMany({
      where: { tutorId: tutor.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { course: { select: { title: true } }, batch: { select: { name: true } } },
    }),
  ]);
  return { totalStudents: Number(students[0]?.count ?? 0), activeCourses, lessonsThisWeek, unreadMessages, recentAnnouncements };
}

export function getTutorCourses(tutorId: string) {
  return db.course.findMany({
    where: { tutorId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true, batches: true } } },
  });
}

export async function getTutorCourseDetail(tutorId: string, courseId: string) {
  return db.course.findFirst({
    where: { id: courseId, tutorId },
    include: {
      _count: { select: { enrollments: true } },
      materials: { orderBy: { createdAt: "desc" } },
      batches: { orderBy: { startDate: "desc" }, include: { _count: { select: { students: true, lessons: true, assignments: true } } } },
    },
  });
}

export async function getTutorBatchDetail(tutorId: string, batchId: string) {
  const batch = await db.batch.findFirst({
    where: { id: batchId, course: { tutorId } },
    include: {
      course: { select: { id: true, title: true } },
      students: { orderBy: { enrolledAt: "asc" }, include: { student: { include: { user: { select: { id: true, name: true, email: true } } } } } },
      lessons: { orderBy: { scheduledAt: "asc" }, include: { attendance: { select: { batchStudentId: true, status: true } } } },
      assignments: { orderBy: { dueDate: "asc" }, include: { _count: { select: { submissions: true } } } },
    },
  });
  if (!batch) return null;

  const candidates = await db.courseEnrollment.findMany({
    where: { courseId: batch.courseId, student: { batchStudents: { none: { batchId } } } },
    orderBy: { enrolledAt: "asc" },
    include: { student: { include: { user: { select: { name: true, email: true } } } } },
  });
  return { batch, candidates };
}

export async function getLessonAttendance(tutorId: string, lessonId: string) {
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, batch: { course: { tutorId } } },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          course: { select: { id: true, title: true } },
          students: { orderBy: { enrolledAt: "asc" }, include: { student: { include: { user: { select: { name: true, email: true } } } } } },
        },
      },
      attendance: { select: { batchStudentId: true, status: true } },
    },
  });
  return lesson;
}

export async function getAssignmentDetail(tutorId: string, assignmentId: string) {
  return db.assignment.findFirst({
    where: { id: assignmentId, batch: { course: { tutorId } } },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          course: { select: { id: true, title: true } },
          students: { orderBy: { enrolledAt: "asc" }, include: { student: { include: { user: { select: { id: true, name: true, email: true } } } } } },
        },
      },
      submissions: true,
    },
  });
}

export function getAnnouncementHistory(tutorId: string) {
  return db.announcement.findMany({
    where: { tutorId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { course: { select: { title: true } }, batch: { select: { name: true } } },
  });
}

export async function getTutorAnalytics(tutorId: string) {
  const [courses, batches, engagement, dailyLogins, completion] = await Promise.all([
    db.course.findMany({
      where: { tutorId },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, price: true, discountPrice: true, isFree: true, rating: true, totalReviews: true, _count: { select: { enrollments: true } } },
    }),
    db.$queryRaw<{ id: string; name: string; course_title: string; records: bigint; attended: bigint; avg_score: string | null }[]>`
      SELECT b.id, b.name, c.title AS course_title,
        (SELECT count(*) FROM attendance a JOIN lessons l ON l.id = a.lesson_id WHERE l.batch_id = b.id AND l.cancelled_at IS NULL) AS records,
        (SELECT count(*) FROM attendance a JOIN lessons l ON l.id = a.lesson_id WHERE l.batch_id = b.id AND l.cancelled_at IS NULL AND a.status IN ('present', 'late')) AS attended,
        (SELECT round(avg(s.score::numeric / asg.max_score * 100), 1) FROM submissions s JOIN assignments asg ON asg.id = s.assignment_id
          WHERE asg.batch_id = b.id AND s.score IS NOT NULL) AS avg_score
      FROM batches b JOIN courses c ON c.id = b.course_id WHERE c.tutor_id = ${tutorId}::uuid ORDER BY c.title, b.name`,
    db.$queryRaw<{ students: bigint; active_7d: bigint; logins_30d: bigint }[]>`
      WITH roster AS (
        SELECT DISTINCT st.user_id FROM students st JOIN course_enrollments e ON e.student_id = st.id JOIN courses c ON c.id = e.course_id WHERE c.tutor_id = ${tutorId}::uuid)
      SELECT (SELECT count(*) FROM roster) AS students,
        (SELECT count(DISTINCT le.user_id) FROM login_events le WHERE le.user_id IN (SELECT user_id FROM roster) AND le.created_at >= now() - interval '7 days') AS active_7d,
        (SELECT count(*) FROM login_events le WHERE le.user_id IN (SELECT user_id FROM roster) AND le.created_at >= now() - interval '30 days') AS logins_30d`,
    db.$queryRaw<{ day: string; logins: bigint }[]>`
      SELECT to_char(d::date, 'YYYY-MM-DD') AS day, count(le.id) AS logins
      FROM generate_series(current_date - 13, current_date, interval '1 day') d
      LEFT JOIN login_events le ON le.created_at::date = d::date AND le.user_id IN (
        SELECT st.user_id FROM students st JOIN course_enrollments e ON e.student_id = st.id JOIN courses c ON c.id = e.course_id WHERE c.tutor_id = ${tutorId}::uuid)
      GROUP BY d ORDER BY d`,
    db.$queryRaw<{ slots: bigint; attended: bigint }[]>`
      SELECT count(*) AS slots,
        count(*) FILTER (WHERE a.status IN ('present', 'late')) AS attended
      FROM lessons l
      JOIN batches b ON b.id = l.batch_id JOIN courses c ON c.id = b.course_id
      JOIN batch_students bs ON bs.batch_id = l.batch_id
      LEFT JOIN attendance a ON a.lesson_id = l.id AND a.batch_student_id = bs.id
      WHERE c.tutor_id = ${tutorId}::uuid AND l.cancelled_at IS NULL AND l.scheduled_at < now()`,
  ]);

  const courseRows = courses.map((c) => {
    const unitPrice = c.isFree ? 0 : Number(c.discountPrice ?? c.price);
    return { id: c.id, title: c.title, enrollments: c._count.enrollments, revenue: unitPrice * c._count.enrollments, rating: Number(c.rating), reviews: c.totalReviews };
  });
  const batchRows = batches.map((b) => {
    const records = Number(b.records);
    return {
      id: b.id,
      name: b.name,
      courseTitle: b.course_title,
      attendanceRate: records === 0 ? null : Math.round((Number(b.attended) / records) * 100),
      avgScore: b.avg_score === null ? null : Number(b.avg_score),
    };
  });
  const e = engagement[0];
  const students = Number(e?.students ?? 0);
  const slots = Number(completion[0]?.slots ?? 0);

  return {
    courses: courseRows,
    batches: batchRows,
    totals: {
      enrollments: courseRows.reduce((sum, c) => sum + c.enrollments, 0),
      revenue: courseRows.reduce((sum, c) => sum + c.revenue, 0),
      averageRating: (() => {
        const rated = courseRows.filter((c) => c.reviews > 0);
        const reviews = rated.reduce((sum, c) => sum + c.reviews, 0);
        return reviews === 0 ? null : rated.reduce((sum, c) => sum + c.rating * c.reviews, 0) / reviews;
      })(),
    },
    engagement: {
      students,
      activeLast7Days: Number(e?.active_7d ?? 0),
      loginsPerStudent30d: students === 0 ? 0 : Math.round((Number(e?.logins_30d ?? 0) / students) * 10) / 10,
      lessonCompletionRate: slots === 0 ? null : Math.round((Number(completion[0]?.attended ?? 0) / slots) * 100),
      dailyLogins: dailyLogins.map((d) => ({ day: d.day, logins: Number(d.logins) })),
    },
  };
}
