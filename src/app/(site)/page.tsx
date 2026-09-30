import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardCheck, GraduationCap, MessagesSquare, Search, Sparkles, Star } from "lucide-react";
import { CourseCard } from "@/components/catalog/CourseCard";
import { HeroVisual } from "@/components/site/HeroVisual";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { featuredCourses, platformStats } from "@/lib/catalog";

export const revalidate = 300;

const steps = [
  { icon: Search, title: "Discover", text: "Browse courses and tutors by subject, price and rating until something clicks." },
  { icon: CalendarCheck, title: "Join a batch", text: "Enroll and join a small group with a clear schedule of live lessons." },
  { icon: ClipboardCheck, title: "Practice & grow", text: "Hand in assignments, get thoughtful feedback and watch your progress climb." },
];

const features = [
  { icon: MessagesSquare, title: "Talk to your tutor", text: "One-to-one messaging keeps questions from piling up." },
  { icon: CalendarCheck, title: "Lessons on a schedule", text: "Batches and lesson reminders keep everyone on track." },
  { icon: ClipboardCheck, title: "Real feedback", text: "Scores and written feedback on every assignment." },
  { icon: GraduationCap, title: "Vetted tutors", text: "Every tutor account is reviewed before it goes live." },
];

const testimonials = [
  { quote: "I went from dreading calculus to actually looking forward to lessons. The feedback on every assignment made all the difference.", name: "Maya C.", role: "Student, Calculus Made Clear" },
  { quote: "Batches and attendance used to live in three spreadsheets. Now it's all in one place and my students always know what's next.", name: "Daniel R.", role: "Tutor, Programming" },
  { quote: "Messaging my tutor between lessons meant I never got stuck for long. It feels like having a study buddy who's an expert.", name: "Omar H.", role: "Student, Languages" },
];

export default async function HomePage() {
  const [courses, stats] = await Promise.all([featuredCourses(), platformStats()]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_15%_-10%,var(--primary-soft),transparent),radial-gradient(50rem_30rem_at_100%_10%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent)]"
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur">
              <Sparkles className="size-4" aria-hidden />
              Learning that feels personal
            </p>
            <h1 className="animate-fade-up mt-6 text-4xl font-extrabold sm:text-5xl lg:text-6xl [animation-delay:60ms]">
              Learn anything with a tutor who{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">truly gets you</span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-lg text-fg-muted sm:text-xl [animation-delay:120ms]">
              ReadnLearn brings students and expert tutors together with live lessons, small batches, real feedback and a direct line to your teacher.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row [animation-delay:180ms]">
              <ButtonLink href="/signup" size="lg">
                Start learning free
                <ArrowRight className="size-5" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/courses" variant="secondary" size="lg">
                Browse courses
              </ButtonLink>
            </div>
            <ul className="animate-fade-up mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted [animation-delay:240ms]">
              {["Free courses available", "Vetted tutors", "Learn at your pace"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section aria-label="ReadnLearn in numbers" className="border-y border-border bg-surface">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { label: "Published courses", value: stats.courses },
            { label: "Expert tutors", value: stats.tutors },
            { label: "Active learners", value: stats.students },
            { label: "Average rating", value: stats.averageRating ? `${stats.averageRating.toFixed(1)}★` : "New" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="text-sm text-fg-muted">{stat.label}</dt>
              <dd className="order-first font-display text-3xl font-extrabold text-fg sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Popular right now" title="Courses students love" description="Hand-picked, highly rated courses to get you started today." />
            <ButtonLink href="/courses" variant="secondary" className="shrink-0">
              View all courses
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How it works" title="From curious to confident in three steps" align="center" />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border border-border bg-bg p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <span className="absolute right-6 top-5 font-display text-5xl font-extrabold text-primary/10" aria-hidden>
                  {i + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-sm">
                  <step.icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-fg-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Everything in one place"
            title="Built for how learning actually happens"
            description="Lessons, assignments, announcements and conversations live side by side, so nobody has to hunt for anything."
          />
          <ButtonLink href="/about" variant="secondary" className="mt-8">
            Learn more about us
          </ButtonLink>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature.title} className="rounded-2xl border border-border bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <feature.icon className="size-7 text-primary" aria-hidden />
              <h3 className="mt-4 font-bold">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-fg-muted">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Kind words" title="Loved by students and tutors" align="center" />
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.name}>
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-bg p-7">
                  <div className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-fg">“{t.quote}”</blockquote>
                  <figcaption className="mt-6">
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-fg-subtle">{t.role}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 py-14 text-center text-white shadow-lift sm:px-12 sm:py-16">
          <div className="absolute -left-16 -top-16 size-64 rounded-full bg-white/10" aria-hidden />
          <div className="absolute -bottom-20 -right-10 size-72 rounded-full bg-white/10" aria-hidden />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">Ready to start learning?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-indigo-100">Create your free account in under a minute. Whether you&apos;re here to learn or to teach, there&apos;s a place for you.</p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-white px-7 font-semibold text-indigo-700 shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
            >
              Join as a student
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link
              href="/signup?role=tutor"
              className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/40 px-7 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Apply to teach
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
