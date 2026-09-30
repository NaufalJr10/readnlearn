"use client";

import { useSyncExternalStore } from "react";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

function relative(iso: string, now: number) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
};

/** Renders an absolute date on the server and upgrades to "5 minutes ago" on the client. */
export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () => relative(iso, Math.floor(Date.now() / 60_000) * 60_000),
    () => new Date(iso).toISOString().slice(0, 10),
  );
  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString()} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
