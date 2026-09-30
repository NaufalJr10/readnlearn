import { ArrowLeft, CalendarRange, Layers, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page, Section } from "@/components/dashboard/Page";
import { BatchFormDialog } from "@/components/tutor/BatchFormDialog";
import { CourseActions } from "@/components/tutor/CourseActions";
import { CourseForm } from "@/components/tutor/CourseForm";
import { MaterialsManager } from "@/components/tutor/MaterialsManager";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LocalTime } from "@/components/ui/LocalTime";
import { isUuid } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTutorCourseDetail } from "@/lib/tutor-data";

export const metadata: Metadata = { title: "Manage course" };
export const dynamic = "force-dynamic";

export default async function TutorCoursePage({ params }: PageProps<"/tutor/courses/[id]">) {
  const { id } = await params;
  const user = await requireRole("tutor", `/tutor/courses/${id}`);
  if (!isUuid(id)) notFound();
  const tutor = await db.tutor.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } });
  const course = await getTutorCourseDetail(tutor.id, id);
  if (!course) notFound();

  return (
    <Page>
      <div>
        <Link href="/tutor/courses" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-fg-muted transition-colors hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden />
          All courses
        </Link>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{course.subject}</Badge>
              <Badge tone={course.isPublished ? "success" : "neutral"}>{course.isPublished ? "Published" : "Draft"}</Badge>
              <span className="flex items-center gap-1.5 text-sm text-fg-subtle">
                <Users className="size-4" aria-hidden />
                {course._count.enrollments} enrolled
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
            {course.isPublished && (
              <Link href={`/courses/${course.id}`} className="mt-1 inline-block text-sm font-semibold text-primary hover:underline">
                View public page
              </Link>
            )}
          </div>
          <CourseActions courseId={course.id} title={course.title} isPublished={course.isPublished} enrollments={course._count.enrollments} />
        </div>
      </div>

      <Section title="Batches" action={<BatchFormDialog courseId={course.id} />}>
        {course.batches.length === 0 ? (
          <EmptyState icon={Layers} title="No batches yet" description="Create a batch, add enrolled students to it, then schedule lessons and assignments for that group." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {course.batches.map((batch) => (
              <li key={batch.id}>
                <Link href={`/tutor/batches/${batch.id}`} className="group block h-full rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                  <h3 className="text-lg font-bold transition-colors group-hover:text-primary">{batch.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
                    <CalendarRange className="size-4" aria-hidden />
                    <LocalTime iso={batch.startDate.toISOString()} style="date" utc /> to <LocalTime iso={batch.endDate.toISOString()} style="date" utc />
                  </p>
                  <p className="mt-3 text-sm text-fg-subtle">
                    {batch._count.students} student{batch._count.students === 1 ? "" : "s"} · {batch._count.lessons} lesson{batch._count.lessons === 1 ? "" : "s"} · {batch._count.assignments} assignment{batch._count.assignments === 1 ? "" : "s"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Materials">
        <MaterialsManager courseId={course.id} materials={course.materials.map((m) => ({ id: m.id, title: m.title, url: m.url }))} />
      </Section>

      <Section title="Course details">
        <Card className="p-5 sm:p-8">
          <CourseForm
            initial={{
              id: course.id,
              title: course.title,
              subject: course.subject,
              description: course.description,
              isFree: course.isFree,
              price: Number(course.price),
              discountPrice: course.discountPrice === null ? null : Number(course.discountPrice),
            }}
          />
        </Card>
      </Section>
    </Page>
  );
}
