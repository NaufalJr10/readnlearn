import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: 0 });

export function formatPrice(amount: number) {
  return amount === 0 ? "Free" : currency.format(amount);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function effectivePrice(course: { price: number; discountPrice: number | null; isFree: boolean }) {
  if (course.isFree) return 0;
  return course.discountPrice ?? course.price;
}

/** Only allow same-origin relative paths to prevent open redirects via callbackUrl. */
export function safeRedirectPath(path: string | null | undefined, fallback: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}
