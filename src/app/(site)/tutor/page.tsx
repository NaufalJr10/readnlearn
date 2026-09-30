import { BookOpen, GraduationCap, MessageCircle, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { ReferralLinkCard } from "@/components/dashboard/ReferralLinkCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Tutor dashboard" };

export default async function TutorDashboardPage() {
  const user = await requireRole("tutor", "/tutor");
  const tutor = await db.tutor.findUniqueOrThrow({
    where: { userId: user.id },
    include: {
      courses: { orderBy: { createdAt: "desc" }, include: { _count: { select: { enrollments: true } } } },
      referralLinks: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });
  const [studentCount, unread] = await Promise.all([
    db.courseEnrollment.count({ where: { course: { tutorId: tutor.id } } }),
    db.message.count({ where: { recipientId: user.id, readAt: null } }),
  ]);
  const referral = tutor.referralLinks[0];
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <DashboardGreeting name={user.name ?? "there"} subtitle="Here's a snapshot of your teaching." />

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total students" value={studentCount} icon={GraduationCap} tone="primary" />
        <StatCard label="Active courses" value={tutor.courses.filter((c) => c.isPublished).length} icon={BookOpen} tone="success" delayMs={60} />
        <StatCard label="Rating" value={tutor.totalReviews ? Number(tutor.rating).toFixed(1) : "New"} icon={Star} tone="warning" delayMs={120} />
        <StatCard label="New messages" value={unread} icon={MessageCircle} tone="primary" delayMs={180} />
      </dl>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="courses-heading">
          <h2 id="courses-heading" className="text-2xl font-bold">
            Your courses
          </h2>
          {tutor.courses.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon={BookOpen} title="No courses yet" description="Course creation is coming in the next release. Your published courses will appear here." />
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {tutor.courses.map((course) => (
                <li key={course.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
                  <div className="min-w-0">
                    <Link href={`/courses/${course.id}`} className="font-bold transition-colors hover:text-primary">
                      {course.title}
                    </Link>
                    <p className="text-sm text-fg-muted">
                      {course._count.enrollments} student{course._count.enrollments === 1 ? "" : "s"} · {course.subject}
                    </p>
                  </div>
                  <Badge tone={course.isPublished ? "success" : "neutral"}>{course.isPublished ? "Published" : "Draft"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
        {referral && <ReferralLinkCard url={`${appUrl}/join?ref=${referral.code}`} uses={referral.usedCount} />}
      </div>
    </div>
  );
}
