import { BookOpen, Compass, MessageCircle, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { QuickLink } from "@/components/dashboard/QuickLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Student dashboard" };

export default async function StudentDashboardPage() {
  const user = await requireRole("student", "/student");
  const enrollments = await db.courseEnrollment.findMany({
    where: { student: { userId: user.id } },
    orderBy: { enrolledAt: "desc" },
    include: { course: { select: { id: true, title: true, subject: true, tutor: { select: { user: { select: { name: true } } } } } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <DashboardGreeting name={user.name ?? "there"} subtitle="Here's what's happening with your learning today." />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/courses" icon={Compass} title="Browse courses" text="Find something new to learn" />
        <QuickLink href="/tutors" icon={Users} title="Tutor directory" text="Meet expert tutors" />
        <QuickLink href="/student/messages" icon={MessageCircle} title="Messages" text="Chat with your tutors" />
      </div>

      <section className="mt-12" aria-labelledby="my-courses">
        <h2 id="my-courses" className="text-2xl font-bold">
          My courses
        </h2>
        {enrollments.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={BookOpen}
              title="You haven't enrolled in a course yet"
              description="Explore the catalog and start with a free course. Your progress will show up here."
              action={<ButtonLink href="/courses">Explore courses</ButtonLink>}
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {enrollments.map((e) => (
              <li key={e.id} className="rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{e.course.subject}</p>
                <Link href={`/courses/${e.course.id}`} className="mt-1 block text-lg font-bold transition-colors hover:text-primary">
                  {e.course.title}
                </Link>
                <p className="text-sm text-fg-muted">with {e.course.tutor.user.name}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
                    role="progressbar"
                    aria-valuenow={e.progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${e.course.title} progress`}
                  >
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${e.progressPercentage}%` }} />
                  </div>
                  <span className="text-sm font-semibold">{e.progressPercentage}%</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
