import { cn, formatPrice } from "@/lib/utils";

type PriceTagProps = { price: number; discountPrice: number | null; isFree: boolean; size?: "md" | "lg" };

export function PriceTag({ price, discountPrice, isFree, size = "md" }: PriceTagProps) {
  const big = size === "lg" ? "text-3xl" : "text-lg";
  if (isFree) return <span className={cn("font-display font-extrabold text-success", big)}>Free</span>;
  if (discountPrice !== null) {
    return (
      <span className="flex items-baseline gap-2">
        <span className="text-sm text-fg-subtle line-through">
          <span className="sr-only">Was </span>
          {formatPrice(price)}
        </span>
        <span className={cn("font-display font-extrabold text-fg", big)}>
          <span className="sr-only">Now </span>
          {formatPrice(discountPrice)}
        </span>
      </span>
    );
  }
  return <span className={cn("font-display font-extrabold text-fg", big)}>{formatPrice(price)}</span>;
}
