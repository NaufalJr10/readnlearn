import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-lg", className)} aria-label="ReadnLearn home">
      <LogoMark />
      <span className="font-display text-xl font-extrabold tracking-tight">
        Readn<span className="text-primary">Learn</span>
      </span>
    </Link>
  );
}
