"use client";

import { Link2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function SubmitAssignmentForm({ assignmentId, existingUrl }: { assignmentId: string; existingUrl?: string }) {
  const { run, loading, error } = useApiMutation();
  const [url, setUrl] = useState(existingUrl ?? "");
  const id = `submission-${assignmentId}`;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await run(`/api/student/assignments/${assignmentId}/submit`, { json: { submissionUrl: url }, success: existingUrl ? "Submission updated" : "Submitted. Good luck!" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <Field id={id} label={existingUrl ? "Update your link" : "Link to your work"} error={error("submissionUrl")} hint="Share a link to a document, repository or folder your tutor can open.">
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <Input id={id} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="pl-10" inputMode="url" invalid={!!error("submissionUrl")} describedBy={error("submissionUrl") ? `${id}-error` : `${id}-hint`} />
        </div>
      </Field>
      <Button type="submit" size="sm" loading={loading}>
        {!loading && <Send className="size-4" aria-hidden />}
        {existingUrl ? "Update submission" : "Submit"}
      </Button>
    </form>
  );
}
