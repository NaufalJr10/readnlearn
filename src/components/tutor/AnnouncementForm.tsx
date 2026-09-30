"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

type CourseOption = { id: string; title: string; batches: { id: string; name: string }[] };

export function AnnouncementForm({ courses, defaultCourseId }: { courses: CourseOption[]; defaultCourseId?: string }) {
  const { run, loading, error } = useApiMutation();
  const [courseId, setCourseId] = useState(defaultCourseId ?? courses[0]?.id ?? "");
  const [formKey, setFormKey] = useState(0);
  const batches = courses.find((c) => c.id === courseId)?.batches ?? [];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const batchId = String(data.get("batchId") ?? "");
    const result = await run<{ notified: number }>("/api/tutor/announcements", {
      json: { courseId, batchId: batchId || null, title: data.get("title"), content: data.get("content") },
    });
    if (result.ok) setFormKey((k) => k + 1);
  }

  return (
    <Card className="p-5 sm:p-6">
      <form key={formKey} onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="announce-course" label="Course" error={error("courseId")}>
            <Select id="announce-course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="announce-batch" label="Send to" error={error("batchId")}>
            <Select id="announce-batch" name="batchId" defaultValue="" key={courseId}>
              <option value="">Everyone enrolled in the course</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  Only {b.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field id="announce-title" label="Title" error={error("title")}>
          <Input id="announce-title" name="title" required maxLength={120} placeholder="e.g. No class next Tuesday" invalid={!!error("title")} describedBy={error("title") ? "announce-title-error" : undefined} />
        </Field>
        <Field id="announce-content" label="Message" error={error("content")} hint="Everyone in the audience also receives this by email.">
          <Textarea id="announce-content" name="content" rows={5} required maxLength={5000} invalid={!!error("content")} describedBy={error("content") ? "announce-content-error" : "announce-content-hint"} />
        </Field>
        <Button type="submit" loading={loading}>
          {!loading && <Send className="size-4" aria-hidden />}
          Post announcement
        </Button>
      </form>
    </Card>
  );
}
