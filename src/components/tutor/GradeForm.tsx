"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

type GradeFormProps = { submissionId: string; maxScore: number; initialScore: number | null; initialFeedback: string | null };

export function GradeForm({ submissionId, maxScore, initialScore, initialFeedback }: GradeFormProps) {
  const { run, loading, error } = useApiMutation();
  const [score, setScore] = useState(initialScore === null ? "" : String(initialScore));
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const graded = initialScore !== null;
  const id = `grade-${submissionId}`;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await run(`/api/tutor/submissions/${submissionId}/grade`, {
      method: "PATCH",
      json: { score: score === "" ? -1 : Number(score), feedback },
      success: "Graded. The student has been notified.",
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[140px_1fr]" noValidate>
      <Field id={`${id}-score`} label={`Score / ${maxScore}`} error={error("score")}>
        <Input
          id={`${id}-score`}
          type="number"
          min={0}
          max={maxScore}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
          invalid={!!error("score")}
          describedBy={error("score") ? `${id}-score-error` : undefined}
        />
      </Field>
      <Field id={`${id}-feedback`} label="Feedback" error={error("feedback")}>
        <Textarea id={`${id}-feedback`} rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={3000} placeholder="What went well? What should they work on?" />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" loading={loading}>
          {!loading && <Check className="size-4" aria-hidden />}
          {graded ? "Update grade" : "Save grade"}
        </Button>
      </div>
    </form>
  );
}
