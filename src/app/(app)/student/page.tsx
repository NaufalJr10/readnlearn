import { BookOpen, CalendarClock, Compass, Megaphone, MessageCircle, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/admin/StatCard";
import { AnnouncementItem } from "@/components/dashboard/AnnouncementItem";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { LessonRow } from "@/components/dashboard/LessonRow";
import { Page, Section } from "@/components/dashboard/Page";
import { QuickLink } from "@/components/dashboard/QuickLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireRole } from "@/lib/auth";
import { getStudentByUserId, getStudentDashboard } from "@/lib/student-data";

export const metadata: Metadata = { title: "Student dashboard" };
export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await requireRole("student", "/student");
  const student = await getStudentByUserId(user.id);
  if (!student) notFound();
  const { enrollments, upcomingLessons, announcements, unreadAnnouncements, unreadMessages } = await getStudentDashboard(user.id, student.id);

  return (
    <Page>
      <DashboardGreeting name={user.name ?? "there"} subtitle="Here's what's happening with your learning today." />

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Enrolled courses" value={enrollments.length} icon={BookOpen} tone="primary" />
        <StatCard label="Upcoming lessons" value={upcomingLessons.length} icon={CalendarClock} tone="success" delayMs={60} />
        <StatCard label="Unread announcements" value={unreadAnnouncements} icon={Megaphone} tone="warning" delayMs={120} />
        <StatCard label="Unread messages" value={unreadMessages} icon={MessageCircle} tone="primary" delayMs={180} />
      </dl>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href="/courses" icon={Compass} title="Browse courses" text="Find something new to learn" />
        <QuickLink href="/tutors" icon={Users} title="Tutor directory" text="Meet expert tutors" />
        <QuickLink href="/student/messages" icon={MessageCircle} title="Messages" text={unreadMessages ? `${unreadMessages} unread` : "Chat with your tutors"} />
      </div>

      <div className="grid gap-10 xl:grid-cols-2">
        <Section title="Upcoming lessons">
          {upcomingLessons.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No lessons scheduled" description="When your tutor schedules a lesson for one of your batches, it will show up here." />
          ) : (
            <ul className="space-y-3">
              {upcomingLessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  title={lesson.title}
                  scheduledAt={lesson.scheduledAt}
                  durationMinutes={lesson.durationMinutes}
                  context={`${lesson.batch.course.title} · ${lesson.batch.name}`}
                />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Announcements" action={<Link href="/student/announcements" className="text-sm font-semibold text-primary hover:underline">View all</Link>}>
          {announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="Nothing new" description="Announcements from your tutors will appear here." />
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <AnnouncementItem key={a.id} title={a.title} content={a.content} context={a.course.title} author={a.tutor.user.name} createdAt={a.createdAt} unread={a.reads.length === 0} />
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="My courses" action={enrollments.length > 0 && <Link href="/student/courses" className="text-sm font-semibold text-primary hover:underline">View all</Link>}>
        {enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="You haven't enrolled in a course yet"
            description="Explore the catalog and start with a free course. Your progress will show up here."
            action={<ButtonLink href="/courses">Explore courses</ButtonLink>}
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {enrollments.slice(0, 4).map((e) => (
              <li key={e.id} className="rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{e.course.subject}</p>
                <Link href={`/student/courses/${e.course.id}`} className="mt-1 block text-lg font-bold transition-colors hover:text-primary">
                  {e.course.title}
                </Link>
                <p className="text-sm text-fg-muted">with {e.course.tutor.user.name}</p>
                <ProgressBar value={e.progressPercentage} label={`${e.course.title} progress`} className="mt-4" />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Page>
  );
}
