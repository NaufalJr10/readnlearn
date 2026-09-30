"use client";

import { Pencil, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { localInputToIso, toLocalInputValue } from "@/lib/datetime";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";

type LessonFormDialogProps = { batchId?: string; lesson?: { id: string; title: string; scheduledAt: string; durationMinutes: number; description: string } };

export function LessonFormDialog({ batchId, lesson }: LessonFormDialogProps) {
  const { run, loading, error } = useApiMutation();
  const [open, setOpen] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get("title") ?? ""),
      scheduledAt: localInputToIso(String(data.get("scheduledAt") ?? "")),
      durationMinutes: Number(data.get("durationMinutes")),
      description: String(data.get("description") ?? ""),
    };
    const result = lesson
      ? await run(`/api/tutor/lessons/${lesson.id}`, { method: "PATCH", json: payload, success: "Lesson updated. Students are being notified of the change." })
      : await run(`/api/tutor/batches/${batchId}/lessons`, { json: payload, success: "Lesson scheduled. Students are being notified." });
    if (result.ok) setOpen(false);
  }

  return (
    <>
      {lesson ? (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Edit ${lesson.title}`}>
          <Pencil className="size-4" aria-hidden />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Schedule lesson
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={lesson ? "Edit lesson" : "Schedule a lesson"} description="Students in this batch are emailed automatically.">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field id="lesson-title" label="Title" error={error("title")}>
            <Input id="lesson-title" name="title" defaultValue={lesson?.title} required maxLength={120} placeholder="e.g. Derivatives: the chain rule" invalid={!!error("title")} describedBy={error("title") ? "lesson-title-error" : undefined} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <Field id="lesson-when" label="Date & time" error={error("scheduledAt")} hint="In your local timezone.">
              <Input id="lesson-when" name="scheduledAt" type="datetime-local" defaultValue={lesson ? toLocalInputValue(lesson.scheduledAt) : ""} required invalid={!!error("scheduledAt")} describedBy={error("scheduledAt") ? "lesson-when-error" : "lesson-when-hint"} />
            </Field>
            <Field id="lesson-duration" label="Minutes" error={error("durationMinutes")}>
              <Input id="lesson-duration" name="durationMinutes" type="number" min={5} max={480} step={5} defaultValue={lesson?.durationMinutes ?? 60} required invalid={!!error("durationMinutes")} describedBy={error("durationMinutes") ? "lesson-duration-error" : undefined} />
            </Field>
          </div>
          <Field id="lesson-description" label="Description (optional)" error={error("description")}>
            <Textarea id="lesson-description" name="description" rows={3} defaultValue={lesson?.description} maxLength={2000} />
          </Field>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {lesson ? "Save lesson" : "Schedule lesson"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
