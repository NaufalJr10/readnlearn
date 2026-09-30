import { Compass, Globe2, LineChart, Target } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = { title: "Our goal", description: "Where ReadnLearn is headed and why it matters." };

const goals = [
  {
    icon: Target,
    title: "Every learner finds their tutor",
    text: "Smart search and honest reviews help each student find a tutor whose style, subject and schedule fit them.",
  },
  {
    icon: LineChart,
    title: "Progress you can see",
    text: "Attendance, assignment scores and course progress make growth visible, which keeps motivation high.",
  },
  {
    icon: Compass,
    title: "Tutors free to teach",
    text: "We handle batches, scheduling, grading workflows and announcements, so tutors spend their time teaching.",
  },
  {
    icon: Globe2,
    title: "Learning without borders",
    text: "Free courses and a mobile-friendly experience put quality education within reach, wherever you are.",
  },
];

export default function OurGoalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our goal"
        title="A world where no curious mind learns alone"
        description="We're building the most supportive place on the internet to learn from, and teach, other people."
      />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ol className="grid gap-6 md:grid-cols-2">
          {goals.map((goal, i) => (
            <li key={goal.title} className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="absolute -right-2 -top-6 font-display text-8xl font-extrabold text-primary/[0.07] transition-transform duration-500 group-hover:scale-110" aria-hidden>
                0{i + 1}
              </span>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-sm">
                <goal.icon className="size-7" aria-hidden />
              </span>
              <h2 className="mt-6 text-2xl font-bold">{goal.title}</h2>
              <p className="mt-3 text-lg text-fg-muted">{goal.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-16 rounded-3xl border border-border bg-surface p-8 text-center shadow-card sm:p-12">
          <h2 className="text-3xl font-extrabold">Be part of the journey</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-fg-muted">Every student who signs up and every tutor who shares their knowledge brings us a step closer.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/signup" size="lg">
              Start learning
            </ButtonLink>
            <ButtonLink href="/signup?role=tutor" variant="secondary" size="lg">
              Become a tutor
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
