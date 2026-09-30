import { ArrowLeft, CalendarClock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/dashboard/Page";
import { AttendanceForm } from "@/components/tutor/AttendanceForm";
import { Badge } from "@/components/ui/Badge";
import { LocalTime } from "@/components/ui/LocalTime";
import { isUuid } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLessonAttendance } from "@/lib/tutor-data";

export const metadata: Metadata = { title: "Take attendance" };
export const dynamic = "force-dynamic";

export default async function LessonAttendancePage({ params }: PageProps<"/tutor/lessons/[id]/attendance">) {
  const { id } = await params;
  const user = await requireRole("tutor", `/tutor/lessons/${id}/attendance`);
  if (!isUuid(id)) notFound();
  const tutor = await db.tutor.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } });
  const lesson = await getLessonAttendance(tutor.id, id);
  if (!lesson) notFound();

  const statusByMember = new Map(lesson.attendance.map((a) => [a.batchStudentId, a.status]));

  return (
    <Page className="max-w-3xl">
      <div>
        <Link href={`/tutor/batches/${lesson.batch.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-fg-muted transition-colors hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden />
          {lesson.batch.name}
        </Link>
        <p className="mt-2 text-sm font-bold uppercase tracking-wider text-primary">Attendance</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{lesson.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-4" aria-hidden />
            <LocalTime iso={lesson.scheduledAt.toISOString()} />
          </span>
          <span>{lesson.batch.course.title}</span>
          {lesson.cancelledAt && <Badge tone="danger">Cancelled</Badge>}
        </p>
      </div>
      <AttendanceForm
        lessonId={lesson.id}
        disabled={!!lesson.cancelledAt}
        rows={lesson.batch.students.map((s) => ({
          batchStudentId: s.id,
          name: s.student.user.name,
          email: s.student.user.email,
          status: statusByMember.get(s.id) ?? null,
        }))}
      />
    </Page>
  );
}
