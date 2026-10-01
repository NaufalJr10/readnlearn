"use client";

import { useSyncExternalStore } from "react";

type Style = "datetime" | "date" | "time" | "weekday";

const options: Record<Style, Intl.DateTimeFormatOptions> = {
  datetime: { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" },
  date: { month: "short", day: "numeric", year: "numeric" },
  time: { hour: "numeric", minute: "2-digit" },
  weekday: { weekday: "long", month: "long", day: "numeric" },
};

const subscribe = () => () => {};

/** Formats in the viewer's timezone; the server render uses UTC so the first paint is stable. */
export function LocalTime({ iso, style = "datetime", className, utc }: { iso: string; style?: Style; className?: string; utc?: boolean }) {
  const label = useSyncExternalStore(
    subscribe,
    () => new Intl.DateTimeFormat("en-US", { ...options[style], ...(utc ? { timeZone: "UTC" } : {}) }).format(new Date(iso)),
    () => new Intl.DateTimeFormat("en-US", { ...options[style], timeZone: "UTC" }).format(new Date(iso)),
  );
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
