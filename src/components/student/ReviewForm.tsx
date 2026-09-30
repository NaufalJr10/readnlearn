"use client";

import { Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Textarea } from "../ui/Textarea";

export function ReviewForm({ courseId, initialRating = 0, initialComment = "" }: { courseId: string; initialRating?: number; initialComment?: string }) {
  const { run, loading, error } = useApiMutation();
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await run("/api/student/reviews", { json: { courseId, rating, comment }, success: "Thanks for your review!" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Your rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onClick={() => setRating(value)}
              className="flex size-12 items-center justify-center rounded-xl transition-transform hover:scale-110"
            >
              <Star className={cn("size-7 transition-colors", value <= rating ? "fill-amber-400 text-amber-400" : "text-border-strong")} />
            </button>
          ))}
        </div>
        {error("rating") && <p role="alert" className="mt-1 text-sm font-medium text-danger">{error("rating")}</p>}
      </fieldset>
      <Field id="review-comment" label="Comment (optional)" error={error("comment")}>
        <Textarea id="review-comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you like? What could be better?" />
      </Field>
      <Button type="submit" loading={loading} disabled={rating === 0}>
        {initialRating ? "Update review" : "Post review"}
      </Button>
    </form>
  );
}
