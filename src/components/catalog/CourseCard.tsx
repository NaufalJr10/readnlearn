import { Users } from "lucide-react";
import Link from "next/link";
import type { CourseSummary } from "@/lib/catalog";
import { Badge } from "../ui/Badge";
import { RatingStars } from "../ui/RatingStars";
import { PriceTag } from "./PriceTag";
import { SubjectArt } from "./SubjectArt";

export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <SubjectArt subject={course.subject} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="primary">{course.subject}</Badge>
          {course.discountPrice !== null && !course.isFree && <Badge tone="success">Sale</Badge>}
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug">
          <Link href={`/courses/${course.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:text-primary">
            {course.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-fg-muted">by {course.tutor.name}</p>
        <p className="mt-3 line-clamp-2 text-sm text-fg-muted">{course.description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="space-y-1">
            <RatingStars rating={course.rating} reviews={course.totalReviews} />
            <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
              <Users className="size-3.5" aria-hidden />
              {course.enrollmentCount} enrolled
            </p>
          </div>
          <PriceTag price={course.price} discountPrice={course.discountPrice} isFree={course.isFree} />
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-transparent transition group-focus-within:ring-ring" aria-hidden />
    </article>
  );
}
