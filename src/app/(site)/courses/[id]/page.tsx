import { ArrowLeft, CalendarRange, CheckCircle2, Clock, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/catalog/EnrollButton";
import { PriceTag } from "@/components/catalog/PriceTag";
import { ReviewList } from "@/components/catalog/ReviewList";
import { SubjectArt } from "@/components/catalog/SubjectArt";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { getSessionUser } from "@/lib/auth";
import { getCourse } from "@/lib/catalog";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/courses/[id]">): Promise<Metadata> {
  const course = await getCourse((await params).id);
  return course ? { title: course.title, description: course.description.slice(0, 160) } : { title: "Course not found" };
}

const included = ["Live lessons in a small batch", "Assignments with personal feedback", "Direct messaging with your tutor", "Course announcements & reminders"];

export default async function CoursePage({ params }: PageProps<"/courses/[id]">) {
  const { id } = await params;
  const [course, user] = await Promise.all([getCourse(id), getSessionUser()]);
  if (!course) notFound();

  const enrolled =
    user?.role === "student"
      ? Boolean(await db.courseEnrollment.findFirst({ where: { courseId: course.id, student: { userId: user.id } }, select: { id: true } }))
      : false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link href="/courses" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-fg-muted transition-colors hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden />
        All courses
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_380px]">
        <article className="min-w-0">
          <div className="group overflow-hidden rounded-3xl border border-border shadow-card">
            <SubjectArt subject={course.subject} className="h-48 sm:h-64" />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge tone="primary">{course.subject}</Badge>
            <RatingStars rating={course.rating} reviews={course.totalReviews} size="md" />
          </div>
          <h1 className="animate-fade-up mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{course.title}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
            <span className="flex items-center gap-1.5">
              <Users className="size-4" aria-hidden />
              {course.enrollmentCount} student{course.enrollmentCount === 1 ? "" : "s"} enrolled
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarRange className="size-4" aria-hidden />
              {course.batchCount} batch{course.batchCount === 1 ? "" : "es"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              Updated {formatDate(course.updatedAt)}
            </span>
          </p>

          <section className="mt-10" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-2xl font-bold">
              About this course
            </h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-fg-muted">{course.description}</p>
          </section>

          <section className="mt-10 rounded-2xl border border-border bg-surface p-6 shadow-card" aria-labelledby="tutor-heading">
            <h2 id="tutor-heading" className="text-sm font-bold uppercase tracking-wider text-fg-subtle">
              Your tutor
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <Avatar name={course.tutor.name} className="size-16 text-xl" />
              <div>
                <Link href={`/tutors/${course.tutor.id}`} className="block text-xl font-bold transition-colors hover:text-primary">
                  {course.tutor.name}
                </Link>
                <div className="mt-1">
                  <RatingStars rating={course.tutor.rating} reviews={course.tutor.totalReviews} />
                </div>
              </div>
            </div>
            {course.tutor.bio && <p className="mt-4 text-fg-muted">{course.tutor.bio}</p>}
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Specialties">
              {course.tutor.specialties.map((s) => (
                <li key={s}>
                  <Badge>{s}</Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="mb-5 text-2xl font-bold">
              Student reviews
            </h2>
            <ReviewList reviews={course.reviews} />
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-lift">
            <PriceTag price={course.price} discountPrice={course.discountPrice} isFree={course.isFree} size="lg" />
            {course.discountPrice !== null && !course.isFree && (
              <p className="mt-1 text-sm font-semibold text-success">Save {Math.round((1 - course.discountPrice / course.price) * 100)}% for a limited time</p>
            )}
            <div className="mt-6">
              <EnrollButton courseId={course.id} isFree={course.isFree} viewerRole={user?.role ?? null} enrolled={enrolled} />
            </div>
            <h2 className="mt-7 text-sm font-bold">What&apos;s included</h2>
            <ul className="mt-3 space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-fg-muted">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
