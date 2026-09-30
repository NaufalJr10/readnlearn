"use client";

import { BarChart3, BookOpen, Compass, Globe, LayoutDashboard, LogOut, Megaphone, MessageCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Logo } from "../ui/Logo";
import { useUnread } from "./UnreadProvider";

type NavItem = { href: string; label: string; short?: string; icon: LucideIcon; badge?: "messages" | "announcements"; exact?: boolean };

const navigation: Record<"student" | "tutor", NavItem[]> = {
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/student/courses", label: "My courses", short: "Courses", icon: BookOpen },
    { href: "/student/announcements", label: "Announcements", short: "News", icon: Megaphone, badge: "announcements" },
    { href: "/student/messages", label: "Messages", icon: MessageCircle, badge: "messages" },
    { href: "/courses", label: "Browse", icon: Compass },
  ],
  tutor: [
    { href: "/tutor", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/tutor/courses", label: "Courses", icon: BookOpen },
    { href: "/tutor/announcements", label: "Announcements", short: "News", icon: Megaphone },
    { href: "/tutor/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/tutor/messages", label: "Messages", icon: MessageCircle, badge: "messages" },
  ],
};

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-white" aria-label={`${count} unread`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function AppShell({ role, name, children }: { role: "student" | "tutor"; name: string; children: ReactNode }) {
  const pathname = usePathname();
  const unread = useUnread();
  const items = navigation[role];
  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface p-5 lg:flex">
        <Logo href={`/${role}`} />
        <nav aria-label="Dashboard" className="mt-8 flex-1">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item) ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all duration-200",
                    isActive(item) ? "bg-primary-soft text-primary-soft-fg" : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                  )}
                >
                  <item.icon className="size-5" aria-hidden />
                  {item.label}
                  {item.badge && <Badge count={unread[item.badge]} />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 px-1">
            <Avatar name={name} className="size-10 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="text-xs capitalize text-fg-subtle">{role}</p>
            </div>
          </div>
          <div className="mt-3 grid gap-1">
            <Link href="/" className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg">
              <Globe className="size-4" aria-hidden />
              Public site
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-left text-sm text-fg-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <LogOut className="size-4" aria-hidden />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/85 px-4 backdrop-blur-xl lg:hidden">
          <Logo href={`/${role}`} />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex size-12 items-center justify-center rounded-xl text-fg-muted transition-colors hover:bg-surface-muted"
            aria-label="Log out"
          >
            <LogOut className="size-5" />
          </button>
        </header>
        <main id="main">{children}</main>
      </div>

      <nav aria-label="Dashboard" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-5">
          {items.map((item) => {
            const count = item.badge ? unread[item.badge] : 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item) ? "page" : undefined}
                  className={cn("relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors", isActive(item) ? "text-primary" : "text-fg-subtle")}
                >
                  <span className="relative">
                    <item.icon className="size-6" aria-hidden />
                    {count > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-white" aria-label={`${count} unread`}>
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </span>
                  <span aria-hidden>{item.short ?? item.label}</span>
                  <span className="sr-only">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
