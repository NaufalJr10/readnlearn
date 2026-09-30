"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

export type CourseFormValues = { id?: string; title: string; subject: string; description: string; isFree: boolean; price: number; discountPrice: number | null };

const SUBJECTS = ["Mathematics", "Programming", "Languages", "Science", "Writing", "Design", "Business", "Music", "Test Prep"];

export function CourseForm({ initial }: { initial?: CourseFormValues }) {
  const router = useRouter();
  const { run, loading, error } = useApiMutation();
  const [isFree, setIsFree] = useState(initial?.isFree ?? false);
  const editing = Boolean(initial?.id);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const discount = String(data.get("discountPrice") ?? "").trim();
    const payload = {
      title: String(data.get("title") ?? ""),
      subject: String(data.get("subject") ?? ""),
      description: String(data.get("description") ?? ""),
      isFree,
      price: isFree ? 0 : Number(data.get("price") || 0),
      discountPrice: isFree || discount === "" ? null : Number(discount),
    };
    if (editing) {
      await run(`/api/tutor/courses/${initial!.id}`, { method: "PATCH", json: payload, success: "Course updated" });
      return;
    }
    const result = await run<{ id: string }>("/api/tutor/courses", { json: payload, success: "Course created as a draft", refresh: false });
    if (result.ok) router.push(`/tutor/courses/${result.data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field id="title" label="Title" error={error("title")}>
        <Input id="title" name="title" defaultValue={initial?.title} required maxLength={120} placeholder="e.g. Calculus Made Clear" invalid={!!error("title")} describedBy={error("title") ? "title-error" : undefined} />
      </Field>
      <Field id="subject" label="Subject" error={error("subject")} hint="Students filter the catalog by subject.">
        <Input id="subject" name="subject" list="subject-options" defaultValue={initial?.subject} required maxLength={40} placeholder="e.g. Mathematics" invalid={!!error("subject")} describedBy={error("subject") ? "subject-error" : "subject-hint"} />
        <datalist id="subject-options">
          {SUBJECTS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>
      <Field id="description" label="Description" error={error("description")} hint="What will students learn? Who is it for?">
        <Textarea id="description" name="description" rows={6} defaultValue={initial?.description} required maxLength={5000} invalid={!!error("description")} describedBy={error("description") ? "description-error" : "description-hint"} />
      </Field>

      <div className="rounded-2xl border border-border bg-surface-muted/50 p-4">
        <label className="flex min-h-12 cursor-pointer items-center gap-3">
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="size-5 rounded accent-[var(--primary)]" />
          <span>
            <span className="block font-semibold">This course is free</span>
            <span className="block text-sm text-fg-muted">Students can enroll instantly.</span>
          </span>
        </label>
        {!isFree && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="price" label="Price (USD)" error={error("price")}>
              <Input id="price" name="price" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={initial && !initial.isFree ? initial.price : ""} placeholder="99.00" invalid={!!error("price")} describedBy={error("price") ? "price-error" : undefined} />
            </Field>
            <Field id="discountPrice" label="Discount price (optional)" error={error("discountPrice")}>
              <Input id="discountPrice" name="discountPrice" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={initial?.discountPrice ?? ""} placeholder="79.00" invalid={!!error("discountPrice")} describedBy={error("discountPrice") ? "discountPrice-error" : undefined} />
            </Field>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {editing ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );
}
