import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page, Section } from "@/components/dashboard/Page";
import { AssignmentFormDialog } from "@/components/tutor/AssignmentFormDialog";
import { DeleteButton } from "@/components/tutor/DeleteButton";
import { GradeForm } from "@/components/tutor/GradeForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { LocalTime } from "@/components/ui/LocalTime";
import { isUuid } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAssignmentDetail } from "@/lib/tutor-data";

export const metadata: Metadata = { title: "Assignment" };
export const dynamic = "force-dynamic";

export default async function TutorAssignmentPage({ params }: PageProps<"/tutor/assignments/[id]">) {
  const { id } = await params;
  const user = await requireRole("tutor", `/tutor/assignments/${id}`);
  if (!isUuid(id)) notFound();
  const tutor = await db.tutor.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } });
  const assignment = await getAssignmentDetail(tutor.id, id);
  if (!assignment) notFound();

  const submissionByStudent = new Map(assignment.submissions.map((s) => [s.studentId, s]));
  const submittedCount = assignment.submissions.length;
  const gradedCount = assignment.submissions.filter((s) => s.gradedAt).length;

  return (
    <Page>
      <div>
        <Link href={`/tutor/batches/${assignment.batch.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-fg-muted transition-colors hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden />
          {assignment.batch.name}
        </Link>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{assignment.title}</h1>
            <p className="mt-1 text-fg-muted">
              {assignment.batch.course.title} · Due <LocalTime iso={assignment.dueDate.toISOString()} /> · {assignment.maxScore} points
            </p>
            {assignment.description && <p className="mt-3 max-w-3xl whitespace-pre-line text-fg-muted">{assignment.description}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <AssignmentFormDialog assignment={{ id: assignment.id, title: assignment.title, description: assignment.description, dueDate: assignment.dueDate.toISOString(), maxScore: assignment.maxScore }} />
            <DeleteButton
              url={`/api/tutor/assignments/${assignment.id}`}
              label="Delete"
              title="Delete this assignment?"
              description={
                <>
                  <strong className="text-fg">{assignment.title}</strong> and all {submittedCount} submission{submittedCount === 1 ? "" : "s"} will be permanently removed.
                </>
              }
              confirmLabel="Delete assignment"
              success="Assignment deleted"
              redirectTo={`/tutor/batches/${assignment.batch.id}`}
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-fg-subtle">
          {submittedCount} of {assignment.batch.students.length} submitted · {gradedCount} graded
        </p>
      </div>

      <Section title="Submissions">
        {assignment.batch.students.length === 0 ? (
          <p className="rounded-2xl bg-surface-muted p-6 text-center text-fg-muted">There are no students in this batch yet.</p>
        ) : (
          <ul className="space-y-4">
            {assignment.batch.students.map((member) => {
              const submission = submissionByStudent.get(member.studentId);
              const late = submission && submission.submittedAt.getTime() > assignment.dueDate.getTime();
              return (
                <li key={member.id} className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar name={member.student.user.name} className="size-10 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{member.student.user.name}</p>
                      <p className="truncate text-sm text-fg-muted">{member.student.user.email}</p>
                    </div>
                    {!submission ? (
                      <Badge tone="neutral">Not submitted</Badge>
                    ) : submission.gradedAt ? (
                      <Badge tone="success">
                        Graded {submission.score}/{assignment.maxScore}
                      </Badge>
                    ) : (
                      <Badge tone="primary">Needs grading</Badge>
                    )}
                    {late && <Badge tone="warning">Late</Badge>}
                  </div>
                  {submission && (
                    <div className="mt-4 space-y-4 border-t border-border pt-4">
                      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
                        <span>
                          Submitted <LocalTime iso={submission.submittedAt.toISOString()} />
                        </span>
                        <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                          Open submission <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      </p>
                      <GradeForm submissionId={submission.id} maxScore={assignment.maxScore} initialScore={submission.score} initialFeedback={submission.feedback} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </Page>
  );
}
