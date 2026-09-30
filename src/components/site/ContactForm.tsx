"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { fetchJson } from "@/lib/fetch-json";
import type { FieldErrors } from "@/lib/validation";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { useToast } from "../ui/ToastProvider";

export function ContactForm() {
  const toast = useToast();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setLoading(true);
    const result = await fetchJson("/api/contact", { method: "POST", json: data });
    setLoading(false);
    if (result.ok) {
      setErrors({});
      form.reset();
      toast({ tone: "success", title: "Message sent!", description: "Thanks for reaching out. We'll reply soon." });
    } else {
      setErrors(result.fields ?? {});
      toast({ tone: "error", title: "Couldn't send your message", description: result.message });
    }
  }

  const err = (name: string) => errors[name]?.[0];

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Your name" error={err("name")}>
            <Input id="name" name="name" autoComplete="name" required placeholder="Jane Doe" invalid={!!err("name")} describedBy={err("name") ? "name-error" : undefined} />
          </Field>
          <Field id="email" label="Email" error={err("email")}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              invalid={!!err("email")}
              describedBy={err("email") ? "email-error" : undefined}
            />
          </Field>
        </div>
        <Field id="subject" label="Subject" error={err("subject")}>
          <Input id="subject" name="subject" required placeholder="How can we help?" invalid={!!err("subject")} describedBy={err("subject") ? "subject-error" : undefined} />
        </Field>
        <Field id="message" label="Message" error={err("message")}>
          <Textarea
            id="message"
            name="message"
            rows={6}
            required
            placeholder="Tell us a bit more…"
            invalid={!!err("message")}
            describedBy={err("message") ? "message-error" : undefined}
          />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
          {!loading && <Send className="size-4" aria-hidden />}
          Send message
        </Button>
      </form>
    </Card>
  );
}
