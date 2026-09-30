import { Clock, Mail, MessageSquareHeart } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHeader } from "@/components/site/PageHeader";

export const metadata: Metadata = { title: "Contact us", description: "Questions, feedback or partnership ideas? We'd love to hear from you." };

const details = [
  { icon: Mail, title: "Email", text: "support@readnlearn.com" },
  { icon: Clock, title: "Response time", text: "Usually within one business day" },
  { icon: MessageSquareHeart, title: "Feedback", text: "Ideas that make learning better are always welcome" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="We'd love to hear from you" description="Questions about an account, a course or teaching on ReadnLearn? Send us a note." />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:px-8">
        <ul className="space-y-4">
          {details.map((d) => (
            <li key={d.title} className="flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <d.icon className="size-6" aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">{d.title}</h2>
                <p className="text-fg-muted">{d.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <ContactForm />
      </section>
    </>
  );
}
