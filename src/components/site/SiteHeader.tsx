"use client";

import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { dashboardPath } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { Logo } from "../ui/Logo";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/tutors", label: "Tutors" },
  { href: "/about", label: "About" },
  { href: "/our-goal", label: "Our Goal" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const open = openOnPath === pathname;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const user = session?.user;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled || open ? "border-border bg-surface/85 shadow-sm backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive(link.href) ? "bg-primary-soft text-primary-soft-fg" : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {status === "loading" ? (
            <div className="h-10 w-44" aria-hidden />
          ) : user ? (
            <>
              <ButtonLink href={dashboardPath(user.role)} variant="secondary" size="sm">
                <LayoutDashboard className="size-4" aria-hidden />
                Dashboard
              </ButtonLink>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4" aria-hidden />
                Log out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex size-12 items-center justify-center rounded-xl text-fg transition-colors hover:bg-surface-muted lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpenOnPath(open ? null : pathname)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="animate-fade-in border-t border-border bg-surface px-4 pb-6 pt-3 lg:hidden">
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-xl px-4 text-base font-medium",
                      isActive(link.href) ? "bg-primary-soft text-primary-soft-fg" : "text-fg hover:bg-surface-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
            {user ? (
              <>
                <ButtonLink href={dashboardPath(user.role)} variant="secondary">
                  Dashboard
                </ButtonLink>
                <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="secondary">
                  Log in
                </ButtonLink>
                <ButtonLink href="/signup">Get started</ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
