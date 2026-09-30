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

type AssignmentFormDialogProps = { batchId?: string; assignment?: { id: string; title: string; description: string; dueDate: string; maxScore: number } };

export function AssignmentFormDialog({ batchId, assignment }: AssignmentFormDialogProps) {
  const { run, loading, error } = useApiMutation();
  const [open, setOpen] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get("title") ?? ""),
      description: String(data.get("description") ?? ""),
      dueDate: localInputToIso(String(data.get("dueDate") ?? "")),
      maxScore: Number(data.get("maxScore")),
    };
    const result = assignment
      ? await run(`/api/tutor/assignments/${assignment.id}`, { method: "PATCH", json: payload, success: "Assignment updated" })
      : await run(`/api/tutor/batches/${batchId}/assignments`, { json: payload, success: "Assignment created" });
    if (result.ok) setOpen(false);
  }

  return (
    <>
      {assignment ? (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" aria-hidden />
          Edit
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          New assignment
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={assignment ? "Edit assignment" : "Create an assignment"}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field id="assignment-title" label="Title" error={error("title")}>
            <Input id="assignment-title" name="title" defaultValue={assignment?.title} required maxLength={120} placeholder="e.g. Limits practice set" invalid={!!error("title")} describedBy={error("title") ? "assignment-title-error" : undefined} />
          </Field>
          <Field id="assignment-description" label="Instructions" error={error("description")}>
            <Textarea id="assignment-description" name="description" rows={4} defaultValue={assignment?.description} maxLength={5000} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <Field id="assignment-due" label="Due date & time" error={error("dueDate")}>
              <Input id="assignment-due" name="dueDate" type="datetime-local" defaultValue={assignment ? toLocalInputValue(assignment.dueDate) : ""} required invalid={!!error("dueDate")} describedBy={error("dueDate") ? "assignment-due-error" : undefined} />
            </Field>
            <Field id="assignment-max" label="Max score" error={error("maxScore")}>
              <Input id="assignment-max" name="maxScore" type="number" min={1} max={1000} defaultValue={assignment?.maxScore ?? 100} required invalid={!!error("maxScore")} describedBy={error("maxScore") ? "assignment-max-error" : undefined} />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {assignment ? "Save assignment" : "Create assignment"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
