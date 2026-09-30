import { nowMs } from "@/lib/now";
import { ArrowLeft, CalendarClock, ClipboardList, ExternalLink, FileText, Megaphone, MessageCircle, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnouncementItem } from "@/components/dashboard/AnnouncementItem";
import { LessonRow } from "@/components/dashboard/LessonRow";
import { Page, Section } from "@/components/dashboard/Page";
import { ReviewForm } from "@/components/student/ReviewForm";
import { SubmitAssignmentForm } from "@/components/student/SubmitAssignmentForm";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { LocalTime } from "@/components/ui/LocalTime";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/api";
import { getStudentByUserId, getStudentCourseDetail } from "@/lib/student-data";

export const metadata: Metadata = { title: "Course" };
export const dynamic = "force-dynamic";

export default async function StudentCoursePage({ params }: PageProps<"/student/courses/[id]">) {
  const { id } = await params;
  const user = await requireRole("student", `/student/courses/${id}`);
  const student = await getStudentByUserId(user.id);
  if (!student || !isUuid(id)) notFound();
  const detail = await getStudentCourseDetail(user.id, student.id, id);
  if (!detail) notFound();
  const { enrollment, course, lessons, assignments, announcements, review } = detail;

  const upcoming = lessons.filter((l) => l.scheduledAt.getTime() >= nowMs() && !l.cancelledAt);
  const past = lessons.filter((l) => l.scheduledAt.getTime() < nowMs() || l.cancelledAt).reverse();

  return (
    <Page>
      <div>
        <Link href="/student/courses" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-fg-muted transition-colors hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden />
          My courses
        </Link>
        <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Badge tone="primary">{course.subject}</Badge>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
            <p className="mt-1 text-lg text-fg-muted">with {course.tutor.user.name}</p>
          </div>
          <ButtonLink href={`/student/messages?with=${course.tutor.user.id}`} variant="secondary">
            <MessageCircle className="size-4" aria-hidden />
            Message tutor
          </ButtonLink>
        </div>
        <ProgressBar value={enrollment.progressPercentage} label="Course progress" className="mt-5 max-w-xl" />
        {course.batches.length === 0 && (
          <p className="mt-4 rounded-xl bg-warning-soft p-4 text-sm font-medium text-warning">
            You&apos;re enrolled, but your tutor hasn&apos;t added you to a batch yet. Lessons and assignments appear once you&apos;re in one.
          </p>
        )}
      </div>

      <Section title="Lessons">
        {lessons.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No lessons yet" description="Scheduled lessons for your batch will show up here." />
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-fg-subtle">Upcoming</h3>
                <ul className="space-y-3">
                  {upcoming.map((l) => (
                    <LessonRow key={l.id} title={l.title} scheduledAt={l.scheduledAt} durationMinutes={l.durationMinutes} context={l.batch.name} />
                  ))}
                </ul>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-fg-subtle">Past & cancelled</h3>
                <ul className="space-y-3">
                  {past.map((l) => (
                    <LessonRow key={l.id} title={l.title} scheduledAt={l.scheduledAt} durationMinutes={l.durationMinutes} context={l.batch.name} cancelled={!!l.cancelledAt} status={l.attendance[0]?.status ?? null} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Section>

      <Section title="Assignments">
        {assignments.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assignments yet" description="Your tutor's assignments will appear here with their due dates." />
        ) : (
          <ul className="space-y-4">
            {assignments.map((a) => {
              const submission = a.submissions[0];
              const overdue = a.dueDate.getTime() < nowMs();
              return (
                <li key={a.id} className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold">{a.title}</h3>
                      <p className="text-sm text-fg-subtle">
                        {a.batch.name} · Due <LocalTime iso={a.dueDate.toISOString()} /> · {a.maxScore} points
                      </p>
                    </div>
                    {submission?.gradedAt ? (
                      <Badge tone="success">
                        Graded · {submission.score}/{a.maxScore}
                      </Badge>
                    ) : submission ? (
                      <Badge tone="primary">Submitted</Badge>
                    ) : overdue ? (
                      <Badge tone="danger">Overdue</Badge>
                    ) : (
                      <Badge tone="warning">To do</Badge>
                    )}
                  </div>
                  {a.description && <p className="mt-3 whitespace-pre-line text-fg-muted">{a.description}</p>}

                  {submission?.gradedAt ? (
                    <div className="mt-4 rounded-xl bg-success-soft p-4">
                      <p className="font-semibold text-success">
                        Score: {submission.score} / {a.maxScore}
                      </p>
                      {submission.feedback && <p className="mt-1 whitespace-pre-line text-fg-muted">{submission.feedback}</p>}
                      <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                        Your submission <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-4 border-t border-border pt-4">
                      {overdue && !submission && <p className="mb-3 text-sm text-danger">This is past its due date. You can still submit, and your tutor will see when.</p>}
                      <SubmitAssignmentForm assignmentId={a.id} existingUrl={submission?.submissionUrl} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Materials">
        {course.materials.length === 0 ? (
          <EmptyState icon={FileText} title="No materials yet" description="Links, readings and resources from your tutor will be listed here." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {course.materials.map((m) => (
              <li key={m.id}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
                >
                  <FileText className="size-5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1 truncate font-semibold">{m.title}</span>
                  <ExternalLink className="size-4 shrink-0 text-fg-subtle" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Announcements">
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements" description="Course announcements from your tutor will appear here." />
        ) : (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <AnnouncementItem key={a.id} title={a.title} content={a.content} context={course.title} createdAt={a.createdAt} unread={a.reads.length === 0} expanded />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Rate this course" id="review">
        <div className="max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-card">
          <p className="mb-4 flex items-center gap-2 text-fg-muted">
            <Star className="size-4 text-amber-400" aria-hidden />
            Your feedback helps other students choose well.
          </p>
          <ReviewForm courseId={course.id} initialRating={review?.rating} initialComment={review?.comment} />
        </div>
      </Section>
    </Page>
  );
}
