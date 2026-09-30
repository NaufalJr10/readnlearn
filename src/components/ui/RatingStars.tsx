import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating, reviews, size = "sm" }: { rating: number; reviews?: number; size?: "sm" | "md" }) {
  const icon = size === "md" ? "size-4.5" : "size-3.5";
  if (reviews === 0) return <span className="text-sm text-fg-subtle">No reviews yet</span>;
  return (
    <span
      className="inline-flex items-center gap-1.5"
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5${reviews !== undefined ? ` from ${reviews} reviews` : ""}`}
    >
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(icon, i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-transparent text-border-strong")} />
        ))}
      </span>
      <span className={cn("font-semibold text-fg", size === "md" ? "text-base" : "text-sm")} aria-hidden>
        {rating.toFixed(1)}
      </span>
      {reviews !== undefined && (
        <span className="text-sm text-fg-subtle" aria-hidden>
          ({reviews})
        </span>
      )}
    </span>
  );
}
