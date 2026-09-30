import { ArrowLeft, BookOpen, CalendarDays, MessageCircle, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCard } from "@/components/catalog/CourseCard";
import { ReviewList } from "@/components/catalog/ReviewList";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSessionUser } from "@/lib/auth";
import { getTutor } from "@/lib/catalog";
import { formatDate, formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/tutors/[id]">): Promise<Metadata> {
  const tutor = await getTutor((await params).id);
  return tutor ? { title: tutor.name, description: tutor.bio.slice(0, 160) } : { title: "Tutor not found" };
}

export default async function TutorPage({ params }: PageProps<"/tutors/[id]">) {
  const { id } = await params;
  const [tutor, user] = await Promise.all([getTutor(id), getSessionUser()]);
  if (!tutor) notFound();

  const stats = [
    { icon: Star, label: "Rating", value: tutor.totalReviews ? tutor.rating.toFixed(1) : "New" },
    { icon: MessageCircle, label: "Reviews", value: tutor.totalReviews },
    { icon: BookOpen, label: "Courses", value: tutor.courses.length },
    { icon: CalendarDays, label: "Joined", value: formatDate(tutor.joinedAt) },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_26rem_at_10%_-20%,var(--primary-soft),transparent)]" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link href="/tutors" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-fg-muted transition-colors hover:text-primary">
            <ArrowLeft className="size-4" aria-hidden />
            All tutors
          </Link>
          <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar name={tutor.name} className="animate-scale-in size-24 text-3xl ring-8 ring-surface shadow-lift" />
              <div>
                <h1 className="animate-fade-up text-3xl font-extrabold sm:text-4xl">{tutor.name}</h1>
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Specialties">
                  {tutor.specialties.map((s) => (
                    <li key={s}>
                      <Badge tone="primary">{s}</Badge>
                    </li>
                  ))}
                </ul>
                {tutor.hourlyRate > 0 && (
                  <p className="mt-3 text-fg-muted">
                    <span className="font-display text-xl font-extrabold text-fg">{formatPrice(tutor.hourlyRate)}</span> per hour
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              {user ? (
                user.id !== tutor.userId && (
                  <ButtonLink href={`/${user.role}/messages?with=${tutor.userId}`} size="lg">
                    <MessageCircle className="size-5" aria-hidden />
                    Message Tutor
                  </ButtonLink>
                )
              ) : (
                <ButtonLink href={`/login?callbackUrl=${encodeURIComponent(`/tutors/${tutor.id}`)}`} variant="secondary" size="lg">
                  <MessageCircle className="size-5" aria-hidden />
                  Log in to message
                </ButtonLink>
              )}
            </div>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                <dt className="flex items-center gap-1.5 text-sm text-fg-subtle">
                  <stat.icon className="size-4" aria-hidden />
                  {stat.label}
                </dt>
                <dd className="mt-1 font-display text-2xl font-extrabold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <section aria-labelledby="bio-heading">
          <h2 id="bio-heading" className="text-2xl font-bold">
            About {tutor.name.split(" ")[0]}
          </h2>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-fg-muted">{tutor.bio || "This tutor hasn't written a bio yet."}</p>
          <h2 className="mb-5 mt-12 text-2xl font-bold">What students say</h2>
          <ReviewList reviews={tutor.reviews} />
        </section>
        <section aria-labelledby="courses-heading">
          <h2 id="courses-heading" className="text-2xl font-bold">
            Courses by {tutor.name.split(" ")[0]}
          </h2>
          <div className="mt-5">
            {tutor.courses.length === 0 ? (
              <EmptyState icon={BookOpen} title="No courses yet" description="This tutor hasn't published a course yet. Check back soon!" />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {tutor.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
