"use client";

import { UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { EmptyState } from "../ui/EmptyState";
import { Modal } from "../ui/Modal";

type Person = { studentId: string; name: string; email: string; otherBatch?: string };

export function BatchStudentsManager({ batchId, members, candidates }: { batchId: string; members: Person[]; candidates: Person[] }) {
  const { run, loading } = useApiMutation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<Person | null>(null);
  const [confirming, setConfirming] = useState<Person | null>(null);
  const available = candidates.filter((c) => !c.otherBatch);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function add() {
    const result = await run(`/api/tutor/batches/${batchId}/students`, { json: { studentIds: [...selected] }, success: `Added ${selected.size} student${selected.size === 1 ? "" : "s"}` });
    if (result.ok) {
      setOpen(false);
      setSelected(new Set());
    }
  }

  async function remove(person: Person) {
    setRemoving(person);
    await run(`/api/tutor/batches/${batchId}/students?studentId=${person.studentId}`, { method: "DELETE", success: "Student removed from batch" });
    setRemoving(null);
    setConfirming(null);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)} disabled={candidates.length === 0} title={candidates.length === 0 ? "Every enrolled student is already in this batch" : undefined}>
          <UserPlus className="size-4" aria-hidden />
          Add students
        </Button>
      </div>
      {members.length === 0 ? (
        <EmptyState icon={Users} title="No students in this batch" description="Add students who have enrolled in the course. They will see this batch's lessons and assignments." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <li key={m.studentId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 pr-2 shadow-card">
              <Avatar name={m.name} className="size-10 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{m.name}</p>
                <p className="truncate text-sm text-fg-muted">{m.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(m)} aria-label={`Remove ${m.name} from batch`} className="hover:bg-danger-soft hover:text-danger">
                <UserMinus className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirming}
        tone="danger"
        title="Remove this student?"
        description={
          <>
            <strong className="text-fg">{confirming?.name}</strong> will be removed from this batch and will no longer see its lessons and assignments. They stay enrolled in the course.
          </>
        }
        confirmLabel="Remove student"
        loading={!!removing}
        onConfirm={() => confirming && remove(confirming)}
        onCancel={() => setConfirming(null)}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add students to this batch" description="Only students enrolled in the course are listed. Students already in another batch of this course can’t be added.">
        <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {candidates.map((c) => (
            <li key={c.studentId}>
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-3 transition-colors hover:bg-surface-muted has-checked:bg-primary-soft has-disabled:cursor-not-allowed has-disabled:opacity-60 has-disabled:hover:bg-transparent">
                <input type="checkbox" checked={selected.has(c.studentId)} disabled={!!c.otherBatch} onChange={() => toggle(c.studentId)} className="size-5 rounded accent-[var(--primary)]" />
                <Avatar name={c.name} className="size-9 text-xs" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="block truncate text-sm text-fg-muted">{c.email}</span>
                  {c.otherBatch && <span className="block truncate text-sm font-semibold text-warning">Already in batch “{c.otherBatch}”</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" className="min-h-10 rounded text-sm font-semibold text-primary hover:underline" onClick={() => setSelected(selected.size === available.length ? new Set() : new Set(available.map((c) => c.studentId)))}>
            {selected.size === available.length ? "Clear selection" : "Select all"}
          </button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={add} loading={loading} disabled={selected.size === 0}>
              Add {selected.size > 0 ? selected.size : ""} selected
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
