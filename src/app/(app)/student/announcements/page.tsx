import { Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnouncementItem } from "@/components/dashboard/AnnouncementItem";
import { Page } from "@/components/dashboard/Page";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { MarkAnnouncementsRead } from "@/components/student/MarkAnnouncementsRead";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcementVisibleTo, getStudentByUserId } from "@/lib/student-data";

export const metadata: Metadata = { title: "Announcements" };
export const dynamic = "force-dynamic";

export default async function StudentAnnouncementsPage() {
  const user = await requireRole("student", "/student/announcements");
  const student = await getStudentByUserId(user.id);
  if (!student) notFound();

  const announcements = await db.announcement.findMany({
    where: announcementVisibleTo(student.id),
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      course: { select: { title: true } },
      batch: { select: { name: true } },
      tutor: { select: { user: { select: { name: true } } } },
      reads: { where: { userId: user.id }, select: { userId: true } },
    },
  });
  const unreadIds = announcements.filter((a) => a.reads.length === 0).map((a) => a.id);

  return (
    <Page>
      <PageHeading eyebrow="Inbox" title="Announcements" description="News and reminders from your tutors, newest first." />
      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="When a tutor posts to one of your courses or batches, you'll see it here and get an email." />
      ) : (
        <ul className="space-y-4">
          {announcements.map((a) => (
            <AnnouncementItem
              key={a.id}
              title={a.title}
              content={a.content}
              context={a.batch ? `${a.course.title} · ${a.batch.name}` : a.course.title}
              author={a.tutor.user.name}
              createdAt={a.createdAt}
              unread={a.reads.length === 0}
              expanded
            />
          ))}
        </ul>
      )}
      <MarkAnnouncementsRead ids={unreadIds} />
    </Page>
  );
}
