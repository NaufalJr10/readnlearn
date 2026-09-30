import { HeartHandshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = { title: "About us", description: "Our mission is to make great tutoring accessible to every learner." };

const values = [
  { icon: HeartHandshake, title: "People first", text: "Learning is a relationship. We build tools that strengthen the bond between student and tutor, not replace it." },
  { icon: ShieldCheck, title: "Trust by design", text: "Every account is reviewed before it goes live, so students and tutors can focus on learning together." },
  { icon: Sparkles, title: "Delight in the details", text: "Clear schedules, thoughtful feedback and an interface that gets out of your way." },
  { icon: Users, title: "Open to everyone", text: "Free courses, flexible pricing and a platform that works on any device, anywhere." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About ReadnLearn"
        title="We believe everyone learns better with the right guide"
        description="ReadnLearn started with a simple idea: the best learning happens when a curious student meets a tutor who genuinely cares."
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading eyebrow="Our mission" title="Make great tutoring accessible to every learner" />
          <div className="mt-6 space-y-5 text-lg text-fg-muted">
            <p>
              Great tutors change lives, but finding one has always been hard, and teaching well means juggling schedules, spreadsheets and scattered messages.
            </p>
            <p>
              We built ReadnLearn to fix that. Students discover tutors and courses that fit them, join small batches, and get real feedback. Tutors get one calm
              place to run their classes, from lessons and attendance to assignments and announcements.
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white shadow-lift">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10" aria-hidden />
          <p className="relative font-display text-2xl font-bold leading-snug sm:text-3xl">
            “Teaching is not about filling a bucket, but lighting a fire.”
          </p>
          <p className="relative mt-4 text-indigo-100">That spark is what we design for, every single day.</p>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What we value" title="The principles behind every feature" align="center" />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <li key={value.title} className="rounded-2xl border border-border bg-bg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <value.icon className="size-8 text-primary" aria-hidden />
                <h3 className="mt-4 text-lg font-bold">{value.title}</h3>
                <p className="mt-2 text-fg-muted">{value.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold">Come learn with us</h2>
        <p className="mt-4 text-lg text-fg-muted">Whether you&apos;re here to learn something new or to share what you know, we&apos;d love to have you.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/signup" size="lg">
            Create your account
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Get in touch
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
