"use client";

import { useEffect } from "react";

/**
 * Fades in every `[data-reveal]` element as it scrolls into view.
 * Content is fully visible without JS: elements are only hidden once this has
 * mounted, and anything already on screen at that point is revealed immediately.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    const reveal = (el: Element) => el.setAttribute("data-revealed", "");

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const fold = window.innerHeight;
    for (const el of elements) {
      if (el.getBoundingClientRect().top < fold) reveal(el);
      else observer.observe(el);
    }
    root.setAttribute("data-reveal-ready", "");

    return () => {
      observer.disconnect();
      root.removeAttribute("data-reveal-ready");
    };
  }, []);

  return null;
}
