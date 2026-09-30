import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { TutorSummary } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { RatingStars } from "../ui/RatingStars";

export function TutorCard({ tutor }: { tutor: TutorSummary }) {
  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center gap-4">
        <Avatar name={tutor.name} className="size-14 text-lg ring-4 ring-primary-soft transition-transform duration-300 group-hover:scale-105" />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">
            <Link href={`/tutors/${tutor.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:text-primary">
              {tutor.name}
            </Link>
          </h3>
          <RatingStars rating={tutor.rating} reviews={tutor.totalReviews} />
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm text-fg-muted">{tutor.bio || "This tutor hasn't added a bio yet."}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Specialties">
        {tutor.specialties.slice(0, 3).map((s) => (
          <li key={s}>
            <Badge>{s}</Badge>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="flex items-center gap-1.5 text-fg-muted">
          <BookOpen className="size-4" aria-hidden />
          {tutor.courseCount} course{tutor.courseCount === 1 ? "" : "s"}
        </span>
        {tutor.hourlyRate > 0 && (
          <span className="font-semibold text-fg">
            {formatPrice(tutor.hourlyRate)}
            <span className="font-normal text-fg-subtle">/hr</span>
          </span>
        )}
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-transparent transition group-focus-within:ring-ring" aria-hidden />
    </article>
  );
}
