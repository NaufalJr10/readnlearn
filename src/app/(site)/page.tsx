import type { CSSProperties, ReactNode } from "react";
import Form from "next/form";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  MessagesSquare,
  Quote,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { CourseCard } from "@/components/catalog/CourseCard";
import { subjectStyle } from "@/components/catalog/SubjectArt";
import { CountUp } from "@/components/site/CountUp";
import { HeroVisual } from "@/components/site/HeroVisual";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { featuredCourses, listSubjects, platformStats } from "@/lib/catalog";

export const revalidate = 300;

const steps = [
  { icon: Search, title: "Discover", text: "Browse courses and tutors by subject, price and rating until something clicks." },
  { icon: CalendarCheck, title: "Join a batch", text: "Enroll and join a small group with a clear schedule of live lessons." },
  { icon: ClipboardCheck, title: "Practice & grow", text: "Hand in assignments, get thoughtful feedback and watch your progress climb." },
];

const testimonials = [
  { quote: "I went from dreading calculus to actually looking forward to lessons. The feedback on every assignment made all the difference.", name: "Maya C.", role: "Student, Calculus Made Clear" },
  { quote: "Batches and attendance used to live in three spreadsheets. Now it's all in one place and my students always know what's next.", name: "Daniel R.", role: "Tutor, Programming" },
  { quote: "Messaging my tutor between lessons meant I never got stuck for long. It feels like having a study buddy who's an expert.", name: "Omar H.", role: "Student, Languages" },
];

const faqs = [
  { q: "Is ReadnLearn free to use?", a: "Creating an account is free, and many tutors offer free courses. Use the Free filter in the course catalog to find them. Paid courses show their price up front." },
  { q: "How do batches and live lessons work?", a: "When you enroll in a course you join a small batch of students. Your tutor schedules lessons for the batch, and you'll see every upcoming lesson in your dashboard." },
  { q: "Can I talk to my tutor outside of lessons?", a: "Yes. Every student has a direct message thread with their tutor, so questions can be answered between lessons instead of piling up." },
  { q: "How do I become a tutor?", a: "Choose “Apply to teach” when signing up. Every tutor account is reviewed before it goes live, and once approved you can publish courses and run batches." },
];

const reveal = (delayMs = 0) => ({ "--reveal-delay": `${delayMs}ms` }) as CSSProperties;

export default async function HomePage() {
  const [courses, stats, subjects] = await Promise.all([featuredCourses(), platformStats(), listSubjects()]);
  const rating = stats.averageRating ? Number(stats.averageRating) : null;

  return (
    <>
      <ScrollReveal />

      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_15%_-10%,var(--primary-soft),transparent),radial-gradient(50rem_30rem_at_100%_10%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
          <div className="animate-drift absolute -top-32 left-1/3 size-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-fg shadow-sm backdrop-blur">
              <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
                <Sparkles className="size-3.5" aria-hidden />
              </span>
              Learning that feels personal
            </p>
            <h1 className="animate-fade-up mt-6 text-4xl font-extrabold sm:text-5xl lg:text-6xl [animation-delay:60ms]">
              Learn anything with a tutor who{" "}
              <span className="animate-gradient-x bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent">
                truly gets you
              </span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-lg text-fg-muted sm:text-xl [animation-delay:120ms]">
              ReadnLearn brings students and expert tutors together with live lessons, small batches, real feedback and a direct line to your teacher.
            </p>

            <Form action="/courses" role="search" className="animate-fade-up mt-9 max-w-xl [animation-delay:180ms]">
              <label htmlFor="hero-search" className="sr-only">
                Search courses
              </label>
              <div className="group flex items-center gap-2 rounded-2xl border border-border-strong bg-surface p-2 shadow-card transition-all duration-200 focus-within:border-primary focus-within:shadow-lift focus-within:ring-4 focus-within:ring-ring/20">
                <Search className="ml-2 size-5 shrink-0 text-fg-subtle transition-colors group-focus-within:text-primary" aria-hidden />
                <input
                  id="hero-search"
                  name="q"
                  type="search"
                  autoComplete="off"
                  placeholder="What do you want to learn?"
                  className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-fg placeholder:text-fg-subtle focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98] sm:px-5"
                >
                  <span className="hidden sm:inline">Find courses</span>
                  <ArrowRight className="size-4" aria-hidden />
                  <span className="sr-only sm:hidden">Search</span>
                </button>
              </div>
            </Form>

            {subjects.length > 0 && (
              <div className="animate-fade-up mt-4 flex flex-wrap items-center gap-2 text-sm [animation-delay:220ms]">
                <span className="text-fg-subtle">Popular:</span>
                {subjects.slice(0, 5).map((subject) => (
                  <Link
                    key={subject}
                    href={`/courses?subject=${encodeURIComponent(subject)}`}
                    className="rounded-full border border-border bg-surface/70 px-3 py-1 font-medium text-fg-muted transition-all hover:-translate-y-px hover:border-primary/50 hover:text-primary"
                  >
                    {subject}
                  </Link>
                ))}
              </div>
            )}

            <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-x-5 gap-y-4 [animation-delay:280ms]">
              <div className="flex -space-x-3" aria-hidden>
                {testimonials.map((t) => (
                  <Avatar key={t.name} name={t.name} className="size-10 text-xs ring-2 ring-bg" />
                ))}
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-fg-muted ring-2 ring-bg">
                  <Users className="size-4" />
                </span>
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                  {rating && <span className="ml-1 font-semibold text-fg">{rating.toFixed(1)}</span>}
                </div>
                <p className="text-fg-muted">
                  {stats.students > 0 ? `Join ${stats.students.toLocaleString("en-US")} learners already on ReadnLearn` : "Free courses · Vetted tutors · Learn at your pace"}
                </p>
              </div>
              <Link href="/signup" className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Start free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* ───────────── Stats ───────────── */}
      <section aria-label="ReadnLearn in numbers" className="border-y border-border bg-surface">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { label: "Published courses", value: stats.courses, icon: BookOpen },
            { label: "Expert tutors", value: stats.tutors, icon: GraduationCap },
            { label: "Active learners", value: stats.students, icon: Users },
            { label: "Average rating", value: rating, icon: Star },
          ].map((stat, i) => (
            <div
              key={stat.label}
              data-reveal
              style={reveal(i * 90)}
              className="flex flex-col items-center gap-1 border-border py-10 text-center max-md:[&:nth-child(-n+2)]:border-b md:[&:not(:first-child)]:border-l max-md:even:border-l"
            >
              <dt className="order-last flex items-center gap-1.5 text-sm text-fg-muted">
                <stat.icon className="size-4 text-primary" aria-hidden />
                {stat.label}
              </dt>
              <dd className="font-display text-3xl font-extrabold text-fg sm:text-4xl">
                {stat.value === null ? "New" : <CountUp value={stat.value} decimals={stat.label === "Average rating" ? 1 : 0} suffix={stat.label === "Average rating" ? "★" : ""} />}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────────── Subjects ───────────── */}
      {subjects.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
          <div data-reveal>
            <SectionHeading eyebrow="Explore" title="Find your subject" description="Jump straight into the area you want to grow in." />
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {subjects.slice(0, 6).map((subject, i) => {
              const { icon: Icon, gradient } = subjectStyle(subject);
              return (
                <li key={subject} data-reveal style={reveal(i * 60)}>
                  <Link
                    href={`/courses?subject=${encodeURIComponent(subject)}`}
                    className="group flex h-full flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift"
                  >
                    <span className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`}>
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="flex w-full items-center justify-between gap-2 font-semibold">
                      {subject}
                      <ArrowRight className="size-4 -translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ───────────── Featured courses ───────────── */}
      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div data-reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Popular right now" title="Courses students love" description="Hand-picked, highly rated courses to get you started today." />
            <ButtonLink href="/courses" variant="secondary" className="group shrink-0">
              View all courses
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </ButtonLink>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <li key={course.id} data-reveal style={reveal((i % 3) * 100)} className="flex [&>article]:flex-1">
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ───────────── How it works ───────────── */}
      <section className="relative overflow-hidden bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-reveal>
            <SectionHeading eyebrow="How it works" title="From curious to confident in three steps" align="center" />
          </div>
          <div className="relative mt-14">
            <div className="absolute left-[16%] right-[16%] top-14 hidden border-t-2 border-dashed border-border-strong md:block" aria-hidden />
            <ol className="relative grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step.title} data-reveal style={reveal(i * 140)} className="relative">
                  <div className="group h-full rounded-2xl border border-border bg-bg p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift">
                    <span className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lift ring-8 ring-surface transition-transform duration-300 group-hover:scale-110">
                      <step.icon className="size-6" aria-hidden />
                      <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-surface text-xs font-extrabold text-primary shadow-card">{i + 1}</span>
                    </span>
                    <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-fg-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────── Features (bento) ───────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div data-reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Everything in one place"
            title="Built for how learning actually happens"
            description="Lessons, assignments, announcements and conversations live side by side, so nobody has to hunt for anything."
          />
          <ButtonLink href="/about" variant="secondary" className="shrink-0">
            Learn more about us
          </ButtonLink>
        </div>

        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          <FeatureCard
            delay={0}
            className="lg:col-span-2"
            icon={MessagesSquare}
            title="Talk to your tutor"
            text="One-to-one messaging keeps questions from piling up between lessons."
            visual={
              <div className="space-y-2.5 text-sm" aria-hidden>
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-white transition-transform duration-500 group-hover:-translate-x-1">
                  Stuck on question 4, can you take a look?
                </p>
                <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-muted px-3.5 py-2 text-fg transition-transform duration-500 group-hover:translate-x-1">
                  Of course! Try the chain rule on the inner function first 👀
                </p>
              </div>
            }
          />
          <FeatureCard
            delay={100}
            icon={CalendarCheck}
            title="Lessons on a schedule"
            text="Batches and lesson reminders keep everyone on track."
            visual={
              <div className="flex gap-2" aria-hidden>
                {["Mon", "Wed", "Fri"].map((day, i) => (
                  <span
                    key={day}
                    className={`flex flex-1 flex-col items-center rounded-xl border py-2 text-xs font-semibold transition-all duration-300 group-hover:-translate-y-0.5 ${i === 1 ? "border-primary/40 bg-primary-soft text-primary-soft-fg" : "border-border bg-bg text-fg-muted"}`}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    {day}
                    <span className="mt-0.5 font-display text-base text-fg">{["5pm", "6pm", "5pm"][i]}</span>
                  </span>
                ))}
              </div>
            }
          />
          <FeatureCard
            delay={0}
            icon={ClipboardCheck}
            title="Real feedback"
            text="Scores and written feedback on every assignment."
            visual={
              <div className="flex items-center gap-4" aria-hidden>
                <span className="relative flex size-16 items-center justify-center rounded-full bg-[conic-gradient(var(--success)_90%,var(--surface-muted)_0)]">
                  <span className="flex size-12 items-center justify-center rounded-full bg-surface font-display text-sm font-extrabold text-success">18/20</span>
                </span>
                <p className="flex-1 rounded-xl bg-success-soft px-3 py-2 text-xs text-fg-muted">“Clear working, just watch the sign in step 3.”</p>
              </div>
            }
          />
          <FeatureCard
            delay={100}
            className="lg:col-span-2"
            icon={GraduationCap}
            title="Vetted tutors"
            text="Every tutor account is reviewed before it goes live, so you learn from people who know their stuff."
            visual={
              <div className="flex flex-wrap gap-2" aria-hidden>
                {["Mathematics", "Programming", "Languages", "Science"].map((s, i) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-semibold transition-all duration-300 group-hover:border-success/40"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <BadgeCheck className="size-4 text-success" />
                    {s}
                  </span>
                ))}
              </div>
            }
          />
        </ul>
      </section>

      {/* ───────────── Testimonials ───────────── */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-reveal>
            <SectionHeading eyebrow="Kind words" title="Loved by students and tutors" align="center" />
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <li key={t.name} data-reveal style={reveal(i * 120)}>
                <figure className="group relative flex h-full flex-col rounded-2xl border border-border bg-bg p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift">
                  <Quote className="absolute right-6 top-6 size-10 text-primary/10 transition-colors duration-300 group-hover:text-primary/20" aria-hidden />
                  <div className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-fg">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <Avatar name={t.name} className="size-10 text-sm" />
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-sm text-fg-subtle">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div data-reveal>
          <SectionHeading eyebrow="FAQ" title="Questions, answered" description="Still curious? We're happy to help." />
          <ButtonLink href="/contact" variant="secondary" className="mt-8">
            Contact us
          </ButtonLink>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={faq.q}
              data-reveal
              style={reveal(i * 80)}
              name="home-faq"
              className="group rounded-2xl border border-border bg-surface shadow-card transition-colors open:border-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-semibold transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted transition-all duration-300 group-open:rotate-180 group-open:bg-primary-soft group-open:text-primary">
                  <ChevronDown className="size-4" aria-hidden />
                </span>
              </summary>
              <p className="animate-fade-in px-5 pb-5 text-fg-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div
          data-reveal
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 py-14 text-center text-white shadow-lift sm:px-12 sm:py-20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.15)_1px,transparent_0)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden />
          <div className="animate-drift absolute -left-16 -top-16 size-64 rounded-full bg-white/10" aria-hidden />
          <div className="animate-drift absolute -bottom-20 -right-10 size-72 rounded-full bg-fuchsia-400/20 blur-2xl [animation-delay:-7s]" aria-hidden />
          <h2 className="relative text-3xl font-extrabold sm:text-5xl">Ready to start learning?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Create your free account in under a minute. Whether you&apos;re here to learn or to teach, there&apos;s a place for you.
          </p>
          <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-white px-7 font-semibold text-indigo-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            >
              Join as a student
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              href="/signup?role=tutor"
              className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/40 px-7 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Apply to teach
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

type FeatureCardProps = {
  icon: typeof Search;
  title: string;
  text: string;
  visual: ReactNode;
  delay: number;
  className?: string;
};

function FeatureCard({ icon: Icon, title, text, visual, delay, className = "" }: FeatureCardProps) {
  return (
    <li data-reveal style={reveal(delay)} className={className}>
      <div className="group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-border bg-surface p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift">
        <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
        <div>
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
            <Icon className="size-5" aria-hidden />
          </span>
          <h3 className="mt-5 text-lg font-bold">{title}</h3>
          <p className="mt-1.5 max-w-md text-sm text-fg-muted">{text}</p>
        </div>
        {visual}
      </div>
    </li>
  );
}
