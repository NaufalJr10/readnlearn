"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";

type CourseActionsProps = { courseId: string; title: string; isPublished: boolean; enrollments: number };

export function CourseActions({ courseId, title, isPublished, enrollments }: CourseActionsProps) {
  const router = useRouter();
  const { run, loading } = useApiMutation();
  const [confirming, setConfirming] = useState(false);

  async function togglePublished() {
    await run(`/api/tutor/courses/${courseId}`, { method: "PATCH", json: { isPublished: !isPublished }, success: isPublished ? "Course unpublished" : "Course published" });
  }

  async function remove() {
    const result = await run(`/api/tutor/courses/${courseId}`, { method: "DELETE", success: "Course deleted", refresh: false });
    setConfirming(false);
    if (result.ok) router.push("/tutor/courses");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant={isPublished ? "secondary" : "primary"} onClick={togglePublished} loading={loading && !confirming}>
        {isPublished ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        {isPublished ? "Unpublish" : "Publish course"}
      </Button>
      <Button variant="secondary" className="hover:border-danger hover:bg-danger-soft hover:text-danger" onClick={() => setConfirming(true)} disabled={enrollments > 0} title={enrollments > 0 ? "Courses with enrolled students can't be deleted" : undefined}>
        <Trash2 className="size-4" aria-hidden />
        Delete
      </Button>
      <ConfirmDialog
        open={confirming}
        tone="danger"
        title="Delete this course?"
        description={
          <>
            <strong className="text-fg">{title}</strong> and its batches, lessons and assignments will be permanently removed. This can&apos;t be undone.
          </>
        }
        confirmLabel="Delete course"
        loading={loading}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
