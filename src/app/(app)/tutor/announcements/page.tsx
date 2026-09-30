import { Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { AnnouncementItem } from "@/components/dashboard/AnnouncementItem";
import { Page, Section } from "@/components/dashboard/Page";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { AnnouncementForm } from "@/components/tutor/AnnouncementForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAnnouncementHistory } from "@/lib/tutor-data";

export const metadata: Metadata = { title: "Announcements" };
export const dynamic = "force-dynamic";

export default async function TutorAnnouncementsPage() {
  const user = await requireRole("tutor", "/tutor/announcements");
  const tutor = await db.tutor.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } });
  const [courses, history] = await Promise.all([
    db.course.findMany({ where: { tutorId: tutor.id }, orderBy: { title: "asc" }, select: { id: true, title: true, batches: { orderBy: { startDate: "desc" }, select: { id: true, name: true } } } }),
    getAnnouncementHistory(tutor.id),
  ]);

  return (
    <Page className="max-w-4xl">
      <PageHeading eyebrow="Communication" title="Announcements" description="Post to a whole course or a single batch. Students are notified by email." />

      {courses.length === 0 ? (
        <EmptyState icon={Megaphone} title="Create a course first" description="Announcements are posted to a course or one of its batches." action={<ButtonLink href="/tutor/courses/new">Create a course</ButtonLink>} />
      ) : (
        <AnnouncementForm courses={courses} />
      )}

      <Section title="History">
        {history.length === 0 ? (
          <EmptyState icon={Megaphone} title="Nothing posted yet" description="Your announcements will be listed here." />
        ) : (
          <ul className="space-y-3">
            {history.map((a) => (
              <AnnouncementItem key={a.id} title={a.title} content={a.content} context={a.batch ? `${a.course.title} · ${a.batch.name}` : `${a.course.title} · whole course`} createdAt={a.createdAt} expanded />
            ))}
          </ul>
        )}
      </Section>
    </Page>
  );
}
