import Link from "next/link";
import { Logo } from "../ui/Logo";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "Browse courses" },
      { href: "/tutors", label: "Find a tutor" },
      { href: "/signup", label: "Create an account" },
    ],
  },
  {
    title: "Teach",
    links: [
      { href: "/signup?role=tutor", label: "Become a tutor" },
      { href: "/login", label: "Tutor login" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/our-goal", label: "Our goal" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-fg-muted">Learning feels better with a great tutor beside you. We make finding one simple.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-fg-subtle">{column.title}</h2>
            <ul className="mt-4 space-y-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-10 items-center text-sm text-fg-muted transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-6 text-sm text-fg-subtle sm:px-6 lg:px-8">© {new Date().getFullYear()} ReadnLearn. Made for curious minds.</p>
      </div>
    </footer>
  );
}
