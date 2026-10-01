import { nowMs } from "@/lib/now";
import { ArrowLeft, CalendarClock, ClipboardCheck, ClipboardList, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonRow } from "@/components/dashboard/LessonRow";
import { Page, Section } from "@/components/dashboard/Page";
import { AssignmentFormDialog } from "@/components/tutor/AssignmentFormDialog";
import { BatchFormDialog } from "@/components/tutor/BatchFormDialog";
import { BatchStudentsManager } from "@/components/tutor/BatchStudentsManager";
import { DeleteButton } from "@/components/tutor/DeleteButton";
import { LessonCancelButton } from "@/components/tutor/LessonCancelButton";
import { LessonFormDialog } from "@/components/tutor/LessonFormDialog";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { LocalTime } from "@/components/ui/LocalTime";
import { isUuid } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTutorBatchDetail } from "@/lib/tutor-data";

export const metadata: Metadata = { title: "Manage batch" };
export const dynamic = "force-dynamic";

const statusStyle = {
  present: "bg-success-soft text-success",
  late: "bg-warning-soft text-warning",
  absent: "bg-danger-soft text-danger",
} as const;

export default async function TutorBatchPage({ params }: PageProps<"/tutor/batches/[id]">) {
  const { id } = await params;
  const user = await requireRole("tutor", `/tutor/batches/${id}`);
  if (!isUuid(id)) notFound();
  const tutor = await db.tutor.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } });
  const detail = await getTutorBatchDetail(tutor.id, id);
  if (!detail) notFound();
  const { batch, candidates } = detail;

  const heldLessons = batch.lessons.filter((l) => !l.cancelledAt && (l.scheduledAt.getTime() < nowMs() || l.attendance.length > 0));

  return (
    <Page>
      <div>
        <Link href={`/tutor/courses/${batch.course.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-fg-muted transition-colors hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden />
          {batch.course.title}
        </Link>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{batch.name}</h1>
            <p className="mt-1 text-fg-muted">
              <LocalTime iso={batch.startDate.toISOString()} style="date" utc /> to <LocalTime iso={batch.endDate.toISOString()} style="date" utc /> · {batch.students.length} student{batch.students.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BatchFormDialog batch={{ id: batch.id, name: batch.name, startDate: batch.startDate.toISOString(), endDate: batch.endDate.toISOString() }} />
            <DeleteButton
              url={`/api/tutor/batches/${batch.id}`}
              label="Delete"
              title="Permanently delete this batch?"
              description={
                <>
                  <strong className="text-danger">This cannot be undone.</strong> Deleting <strong className="text-fg">{batch.name}</strong> will permanently erase all of its lessons, attendance records and assignments (including students&apos; submissions and grades). Students stay enrolled in the course, but everything tied to this batch is gone for good.
                </>
              }
              requireText={batch.name}
              confirmLabel="Delete batch"
              success="Batch deleted"
              redirectTo={`/tutor/courses/${batch.course.id}`}
            />
          </div>
        </div>
      </div>

      <Section title="Students">
        <BatchStudentsManager
          batchId={batch.id}
          members={batch.students.map((s) => ({ studentId: s.studentId, name: s.student.user.name, email: s.student.user.email }))}
          candidates={candidates.map((c) => ({ studentId: c.studentId, name: c.student.user.name, email: c.student.user.email, otherBatch: c.student.batchStudents[0]?.batch.name }))}
        />
      </Section>

      <Section title="Lessons" action={<LessonFormDialog batchId={batch.id} />}>
        {batch.lessons.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No lessons scheduled" description="Schedule the first lesson and every student in this batch is emailed the details." />
        ) : (
          <ul className="space-y-3">
            {batch.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                title={lesson.title}
                scheduledAt={lesson.scheduledAt}
                durationMinutes={lesson.durationMinutes}
                context={lesson.attendance.length > 0 ? `${lesson.attendance.length} of ${batch.students.length} marked` : "Attendance not taken"}
                cancelled={!!lesson.cancelledAt}
                actions={
                  !lesson.cancelledAt && (
                    <div className="flex items-center gap-1">
                      <ButtonLink href={`/tutor/lessons/${lesson.id}/attendance`} variant="secondary" size="sm">
                        <ClipboardCheck className="size-4" aria-hidden />
                        <span className="hidden sm:inline">Attendance</span>
                        <span className="sr-only sm:hidden">Take attendance</span>
                      </ButtonLink>
                      <LessonFormDialog lesson={{ id: lesson.id, title: lesson.title, scheduledAt: lesson.scheduledAt.toISOString(), durationMinutes: lesson.durationMinutes, description: lesson.description }} />
                      <LessonCancelButton lessonId={lesson.id} title={lesson.title} />
                    </div>
                  )
                }
              />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Assignments" action={<AssignmentFormDialog batchId={batch.id} />}>
        {batch.assignments.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assignments yet" description="Create an assignment and students in this batch can submit their work against it." />
        ) : (
          <ul className="space-y-3">
            {batch.assignments.map((a) => (
              <li key={a.id}>
                <Link href={`/tutor/assignments/${a.id}`} className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="min-w-0">
                    <h3 className="font-bold transition-colors group-hover:text-primary">{a.title}</h3>
                    <p className="text-sm text-fg-muted">
                      Due <LocalTime iso={a.dueDate.toISOString()} /> · {a.maxScore} points
                    </p>
                  </div>
                  <Badge tone={a._count.submissions > 0 ? "primary" : "neutral"}>
                    {a._count.submissions} / {batch.students.length} submitted
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Attendance history">
        {heldLessons.length === 0 || batch.students.length === 0 ? (
          <EmptyState icon={Users} title="Nothing to show yet" description="Once lessons have taken place and attendance is marked, the history appears here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
            <table className="w-full min-w-max text-left text-sm">
              <caption className="sr-only">Attendance by student and lesson</caption>
              <thead>
                <tr className="border-b border-border text-xs text-fg-subtle">
                  <th scope="col" className="sticky left-0 bg-surface px-4 py-3 font-semibold uppercase tracking-wider">
                    Student
                  </th>
                  {heldLessons.map((l) => (
                    <th key={l.id} scope="col" className="px-3 py-3 text-center align-middle font-semibold">
                      <span className="mx-auto block min-w-28 max-w-48 text-balance break-words text-center text-base font-bold text-fg" title={l.title}>
                        {l.title}
                      </span>
                      <LocalTime iso={l.scheduledAt.toISOString()} style="date" className="block font-normal" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batch.students.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className="sticky left-0 bg-surface px-4 py-3 text-left font-medium">
                      {s.student.user.name}
                    </th>
                    {heldLessons.map((l) => {
                      const status = l.attendance.find((a) => a.batchStudentId === s.id)?.status;
                      return (
                        <td key={l.id} className="px-3 py-3 text-center">
                          {status ? (
                            <span className={`inline-flex min-w-16 justify-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[status]}`}>{status}</span>
                          ) : (
                            <span className="text-fg-subtle" aria-label="Not marked">
                              –
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </Page>
  );
}
