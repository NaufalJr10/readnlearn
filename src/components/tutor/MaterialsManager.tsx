"use client";

import { ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { EmptyState } from "../ui/EmptyState";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

type Material = { id: string; title: string; url: string };

export function MaterialsManager({ courseId, materials }: { courseId: string; materials: Material[] }) {
  const { run, loading, error } = useApiMutation();
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Material | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = await run(`/api/tutor/courses/${courseId}/materials`, { json: data, success: "Material added" });
    if (result.ok) setFormKey((k) => k + 1);
  }

  async function remove(id: string) {
    setRemoving(id);
    await run(`/api/tutor/materials/${id}`, { method: "DELETE", success: "Material removed" });
    setRemoving(null);
    setConfirming(null);
  }

  return (
    <div className="space-y-5">
      {materials.length === 0 ? (
        <EmptyState icon={FileText} title="No materials yet" description="Add links to readings, slides or resources. Enrolled students see them on the course page." />
      ) : (
        <ul className="space-y-2">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 pl-4 shadow-card">
              <FileText className="size-5 shrink-0 text-primary" aria-hidden />
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center gap-1.5 font-semibold hover:text-primary">
                <span className="truncate">{m.title}</span>
                <ExternalLink className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
              </a>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(m)} aria-label={`Remove ${m.title}`} title="Remove material" className="hover:bg-danger-soft hover:text-danger">
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!confirming}
        tone="danger"
        title="Remove this material?"
        description={
          <>
            <strong className="text-fg">{confirming?.title}</strong> will be removed from the course and enrolled students will no longer see it.
          </>
        }
        confirmLabel="Remove material"
        loading={!!removing}
        onConfirm={() => confirming && remove(confirming.id)}
        onCancel={() => setConfirming(null)}
      />
      <form key={formKey} onSubmit={add} className="grid gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card sm:grid-cols-[1fr_1.4fr_auto] sm:items-start" noValidate>
        <Field id="material-title" label="Title" error={error("title")}>
          <Input id="material-title" name="title" required maxLength={120} placeholder="Week 1 slides" invalid={!!error("title")} describedBy={error("title") ? "material-title-error" : undefined} />
        </Field>
        <Field id="material-url" label="Link" error={error("url")}>
          <Input id="material-url" name="url" required inputMode="url" placeholder="https://…" invalid={!!error("url")} describedBy={error("url") ? "material-url-error" : undefined} />
        </Field>
        <Button type="submit" loading={loading} className="sm:mt-[1.65rem]">
          {!loading && <Plus className="size-4" aria-hidden />}
          Add
        </Button>
      </form>
    </div>
  );
}
