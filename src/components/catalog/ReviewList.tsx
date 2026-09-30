import { MessageSquareQuote } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { EmptyState } from "../ui/EmptyState";
import { RatingStars } from "../ui/RatingStars";

type Review = { id: string; rating: number; comment: string; author: string; createdAt: string; courseTitle?: string };

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <EmptyState icon={MessageSquareQuote} title="No reviews yet" description="Reviews from enrolled students will appear here." />;
  }
  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start gap-3">
            <Avatar name={review.author} className="size-10 text-sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="font-semibold">{review.author}</p>
                <time className="text-sm text-fg-subtle" dateTime={review.createdAt}>
                  {formatDate(review.createdAt)}
                </time>
              </div>
              <RatingStars rating={review.rating} />
              {review.courseTitle && <p className="mt-1 text-xs text-fg-subtle">on {review.courseTitle}</p>}
              {review.comment && <p className="mt-2 text-fg-muted">{review.comment}</p>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
