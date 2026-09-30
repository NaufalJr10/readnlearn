"use client";

import { Pencil, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toDateInputValue } from "@/lib/datetime";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

type BatchFormDialogProps = { courseId?: string; batch?: { id: string; name: string; startDate: string; endDate: string } };

export function BatchFormDialog({ courseId, batch }: BatchFormDialogProps) {
  const { run, loading, error } = useApiMutation();
  const [open, setOpen] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = batch
      ? await run(`/api/tutor/batches/${batch.id}`, { method: "PATCH", json: data, success: "Batch updated" })
      : await run(`/api/tutor/courses/${courseId}/batches`, { json: data, success: "Batch created" });
    if (result.ok) setOpen(false);
  }

  return (
    <>
      {batch ? (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" aria-hidden />
          Edit
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          New batch
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={batch ? "Edit batch" : "Create a batch"} description="A batch is a group of students who take the course together on one schedule.">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field id="batch-name" label="Batch name" error={error("name")}>
            <Input id="batch-name" name="name" defaultValue={batch?.name} required maxLength={80} placeholder="e.g. Autumn 2026 evening group" invalid={!!error("name")} describedBy={error("name") ? "batch-name-error" : undefined} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="batch-start" label="Start date" error={error("startDate")}>
              <Input id="batch-start" name="startDate" type="date" defaultValue={batch ? toDateInputValue(batch.startDate) : ""} required invalid={!!error("startDate")} describedBy={error("startDate") ? "batch-start-error" : undefined} />
            </Field>
            <Field id="batch-end" label="End date" error={error("endDate")}>
              <Input id="batch-end" name="endDate" type="date" defaultValue={batch ? toDateInputValue(batch.endDate) : ""} required invalid={!!error("endDate")} describedBy={error("endDate") ? "batch-end-error" : undefined} />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {batch ? "Save batch" : "Create batch"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
