import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";

/** Course-wide announcements reach every enrolled student; batch announcements only that batch's students. */
export function announcementVisibleTo(studentId: string): Prisma.AnnouncementWhereInput {
  return {
    course: { enrollments: { some: { studentId } } },
    OR: [{ batchId: null }, { batch: { students: { some: { studentId } } } }],
  };
}

export async function getStudentByUserId(userId: string) {
  return db.student.findUnique({ where: { userId }, select: { id: true } });
}

export async function unreadMessageCount(userId: string) {
  return db.message.count({ where: { recipientId: userId, readAt: null } });
}

export async function unreadAnnouncementCount(userId: string, studentId: string) {
  return db.announcement.count({ where: { ...announcementVisibleTo(studentId), reads: { none: { userId } } } });
}

export async function getStudentDashboard(userId: string, studentId: string) {
  const now = new Date();
  const [enrollments, upcomingLessons, announcements, unreadAnnouncements, unreadMessages] = await Promise.all([
    db.courseEnrollment.findMany({
      where: { studentId },
      orderBy: { enrolledAt: "desc" },
      include: { course: { select: { id: true, title: true, subject: true, tutor: { select: { user: { select: { name: true } } } } } } },
    }),
    db.lesson.findMany({
      where: { cancelledAt: null, scheduledAt: { gte: now }, batch: { students: { some: { studentId } } } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { batch: { select: { name: true, course: { select: { id: true, title: true } } } } },
    }),
    db.announcement.findMany({
      where: announcementVisibleTo(studentId),
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { course: { select: { title: true } }, tutor: { select: { user: { select: { name: true } } } }, reads: { where: { userId }, select: { userId: true } } },
    }),
    unreadAnnouncementCount(userId, studentId),
    unreadMessageCount(userId),
  ]);
  return { enrollments, upcomingLessons, announcements, unreadAnnouncements, unreadMessages };
}

export async function getStudentCourses(studentId: string) {
  return db.courseEnrollment.findMany({
    where: { studentId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          subject: true,
          description: true,
          tutor: { select: { user: { select: { name: true } } } },
          batches: { where: { students: { some: { studentId } } }, select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function getStudentCourseDetail(userId: string, studentId: string, courseId: string) {
  const enrollment = await db.courseEnrollment.findUnique({ where: { studentId_courseId: { studentId, courseId } } });
  if (!enrollment) return null;

  const batchFilter = { students: { some: { studentId } } };
  const [course, lessons, assignments, announcements, review] = await Promise.all([
    db.course.findUniqueOrThrow({
      where: { id: courseId },
      include: {
        tutor: { select: { id: true, user: { select: { id: true, name: true } } } },
        materials: { orderBy: { createdAt: "desc" } },
        batches: { where: batchFilter, select: { id: true, name: true, startDate: true, endDate: true } },
      },
    }),
    db.lesson.findMany({
      where: { batch: { courseId, ...batchFilter } },
      orderBy: { scheduledAt: "asc" },
      include: { batch: { select: { name: true } }, attendance: { where: { batchStudent: { studentId } }, select: { status: true } } },
    }),
    db.assignment.findMany({
      where: { batch: { courseId, ...batchFilter } },
      orderBy: { dueDate: "asc" },
      include: { batch: { select: { name: true } }, submissions: { where: { studentId } } },
    }),
    db.announcement.findMany({
      where: { ...announcementVisibleTo(studentId), courseId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { reads: { where: { userId }, select: { userId: true } } },
    }),
    db.review.findUnique({ where: { courseId_studentId: { courseId, studentId } } }),
  ]);
  return { enrollment, course, lessons, assignments, announcements, review };
}
