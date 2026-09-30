import { BookOpen, CalendarClock, GraduationCap, Megaphone, MessageCircle, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { AnnouncementItem } from "@/components/dashboard/AnnouncementItem";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { LessonRow } from "@/components/dashboard/LessonRow";
import { Page, Section } from "@/components/dashboard/Page";
import { ReferralLinkCard } from "@/components/dashboard/ReferralLinkCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTutorDashboard } from "@/lib/tutor-data";

export const metadata: Metadata = { title: "Tutor dashboard" };
export const dynamic = "force-dynamic";

export default async function TutorDashboardPage() {
  const user = await requireRole("tutor", "/tutor");
  const tutor = await db.tutor.findUniqueOrThrow({ where: { userId: user.id }, include: { referralLinks: { orderBy: { createdAt: "asc" }, take: 1 } } });
  const { totalStudents, activeCourses, lessonsThisWeek, unreadMessages, recentAnnouncements } = await getTutorDashboard({ id: tutor.id, userId: user.id });
  const referral = tutor.referralLinks[0];
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <Page>
      <DashboardGreeting name={user.name ?? "there"} subtitle="Here's a snapshot of your teaching." />

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total students" value={totalStudents} icon={GraduationCap} tone="primary" />
        <StatCard label="Active courses" value={activeCourses} icon={BookOpen} tone="success" delayMs={60} />
        <StatCard label="Lessons this week" value={lessonsThisWeek.length} icon={CalendarClock} tone="warning" delayMs={120} />
        <StatCard label="New messages" value={unreadMessages} icon={MessageCircle} tone="primary" delayMs={180} />
      </dl>

      <div className="grid gap-10 xl:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <Section title="Upcoming lessons this week" action={<ButtonLink href="/tutor/courses" variant="secondary" size="sm">Manage courses</ButtonLink>}>
            {lessonsThisWeek.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No lessons in the next 7 days"
                description="Schedule a lesson from a batch page and your students will be notified."
                action={<ButtonLink href="/tutor/courses"><Plus className="size-4" aria-hidden />Go to courses</ButtonLink>}
              />
            ) : (
              <ul className="space-y-3">
                {lessonsThisWeek.map((lesson) => (
                  <li key={lesson.id}>
                    <Link href={`/tutor/batches/${lesson.batch.id}`} className="block rounded-2xl transition-transform hover:-translate-y-0.5">
                      <ul>
                        <LessonRow title={lesson.title} scheduledAt={lesson.scheduledAt} durationMinutes={lesson.durationMinutes} context={`${lesson.batch.course.title} · ${lesson.batch.name}`} />
                      </ul>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Recent announcements" action={<Link href="/tutor/announcements" className="text-sm font-semibold text-primary hover:underline">Post new</Link>}>
            {recentAnnouncements.length === 0 ? (
              <EmptyState icon={Megaphone} title="No announcements yet" description="Share news or reminders with a batch or a whole course. They are emailed automatically." action={<ButtonLink href="/tutor/announcements" variant="secondary">Write one</ButtonLink>} />
            ) : (
              <ul className="space-y-3">
                {recentAnnouncements.map((a) => (
                  <AnnouncementItem key={a.id} title={a.title} content={a.content} context={a.batch ? `${a.course.title} · ${a.batch.name}` : a.course.title} createdAt={a.createdAt} />
                ))}
              </ul>
            )}
          </Section>
        </div>
        {referral && <ReferralLinkCard url={`${appUrl}/join?ref=${referral.code}`} uses={referral.usedCount} />}
      </div>
    </Page>
  );
}
