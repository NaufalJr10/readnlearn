import { BookOpen, Layers, Plus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/dashboard/Page";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { PriceTag } from "@/components/catalog/PriceTag";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTutorCourses } from "@/lib/tutor-data";

export const metadata: Metadata = { title: "Your courses" };
export const dynamic = "force-dynamic";

export default async function TutorCoursesPage() {
  const user = await requireRole("tutor", "/tutor/courses");
  const tutor = await db.tutor.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } });
  const courses = await getTutorCourses(tutor.id);

  return (
    <Page>
      <PageHeading
        eyebrow="Teaching"
        title="Your courses"
        description="Create courses, organize them into batches and publish them when you are ready."
        action={
          <ButtonLink href="/tutor/courses/new">
            <Plus className="size-4" aria-hidden />
            New course
          </ButtonLink>
        }
      />
      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Create your first course"
          description="Start with a title and description. You can add batches, lessons and assignments after that."
          action={<ButtonLink href="/tutor/courses/new">Create a course</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <li key={course.id}>
              <Link href={`/tutor/courses/${course.id}`} className="group block h-full rounded-2xl border border-border bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="primary">{course.subject}</Badge>
                  <Badge tone={course.isPublished ? "success" : "neutral"}>{course.isPublished ? "Published" : "Draft"}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-bold transition-colors group-hover:text-primary">{course.title}</h2>
                <p className="mt-2 line-clamp-2 text-fg-muted">{course.description}</p>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="flex items-center gap-4 text-sm text-fg-subtle">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4" aria-hidden />
                      {course._count.enrollments}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="size-4" aria-hidden />
                      {course._count.batches} batch{course._count.batches === 1 ? "" : "es"}
                    </span>
                  </p>
                  <PriceTag price={Number(course.price)} discountPrice={course.discountPrice === null ? null : Number(course.discountPrice)} isFree={course.isFree} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
