import { BookOpen, Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/dashboard/Page";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireRole } from "@/lib/auth";
import { getStudentByUserId, getStudentCourses } from "@/lib/student-data";

export const metadata: Metadata = { title: "My courses" };
export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  const user = await requireRole("student", "/student/courses");
  const student = await getStudentByUserId(user.id);
  if (!student) notFound();
  const enrollments = await getStudentCourses(student.id);

  return (
    <Page>
      <PageHeading
        eyebrow="Learning"
        title="My courses"
        description="Track your progress and jump into lessons, assignments and materials."
        action={<ButtonLink href="/courses" variant="secondary">Browse more</ButtonLink>}
      />
      {enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Enroll in a free course to get started. Your tutor will add you to a batch with scheduled lessons."
          action={<ButtonLink href="/courses">Explore courses</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {enrollments.map((e) => (
            <li key={e.id}>
              <Link href={`/student/courses/${e.course.id}`} className="group block h-full rounded-2xl border border-border bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="primary">{e.course.subject}</Badge>
                  {e.course.batches.length === 0 && <Badge tone="warning">Awaiting batch</Badge>}
                </div>
                <h2 className="mt-3 text-xl font-bold transition-colors group-hover:text-primary">{e.course.title}</h2>
                <p className="text-sm text-fg-muted">with {e.course.tutor.user.name}</p>
                <p className="mt-3 line-clamp-2 text-fg-muted">{e.course.description}</p>
                {e.course.batches.length > 0 && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-fg-subtle">
                    <Layers className="size-4" aria-hidden />
                    {e.course.batches.map((b) => b.name).join(", ")}
                  </p>
                )}
                <ProgressBar value={e.progressPercentage} label={`${e.course.title} progress`} className="mt-5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
