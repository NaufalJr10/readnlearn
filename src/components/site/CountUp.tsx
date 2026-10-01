"use client";

import { useEffect, useRef } from "react";

const DURATION = 1600;

function format(n: number, decimals: number, suffix: string) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
}

/**
 * Counts from 0 to `value` the first time it scrolls into view. The final value is
 * server-rendered (and always available to screen readers); only the visual text animates.
 */
export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = format(value, decimals, suffix);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at mount: leave the final value alone rather than flashing back to 0.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    let frame = 0;
    el.textContent = format(0, decimals, suffix);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / DURATION, 1);
          el.textContent = format(value * (1 - Math.pow(1 - t, 3)), decimals, suffix);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = format(value, decimals, suffix);
    };
  }, [value, decimals, suffix]);

  return (
    <>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden className="tabular-nums">
        {final}
      </span>
    </>
  );
}
