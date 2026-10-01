"use client";

import { Ban } from "lucide-react";
import { useState } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export function LessonCancelButton({ lessonId, title }: { lessonId: string; title: string }) {
  const { run, loading } = useApiMutation();
  const [open, setOpen] = useState(false);

  async function cancel() {
    const result = await run(`/api/tutor/lessons/${lessonId}`, { method: "DELETE", success: "Lesson cancelled. Students are being notified." });
    if (result.ok) setOpen(false);
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Cancel ${title}`} title="Cancel lesson" className="hover:bg-danger-soft hover:text-danger">
        <Ban className="size-4" aria-hidden />
      </Button>
      <ConfirmDialog
        open={open}
        tone="danger"
        title="Cancel this lesson?"
        description={
          <>
            <strong className="text-fg">{title}</strong> will be marked as cancelled and everyone in the batch will be emailed.
          </>
        }
        confirmLabel="Cancel lesson"
        loading={loading}
        onConfirm={cancel}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
