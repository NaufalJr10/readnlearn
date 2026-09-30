"use client";

import { LogOut, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchJson } from "@/lib/fetch-json";
import { Button } from "../ui/Button";
import { LogoMark } from "../ui/LogoMark";
import { usePendingCount } from "./PendingCountProvider";

export function AdminHeader() {
  const router = useRouter();
  const { count } = usePendingCount();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetchJson("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex items-center gap-2.5 rounded-lg">
          <LogoMark />
          <span className="hidden sm:block">
            <span className="block font-display text-lg font-extrabold leading-tight">ReadnLearn</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" aria-hidden />
              Admin console
            </span>
          </span>
        </Link>
        <nav aria-label="Admin" className="flex items-center gap-2">
          <Link
            href="/admin#pending"
            className="relative inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary-soft px-3.5 text-sm font-semibold text-primary-soft-fg transition-colors hover:bg-primary-soft/70"
          >
            <UserCheck className="size-4" aria-hidden />
            <span>Pending</span>
            <span
              key={count}
              className={`animate-scale-in inline-flex min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${count > 0 ? "bg-primary text-white" : "bg-surface text-fg-muted"}`}
              aria-label={`${count} pending account${count === 1 ? "" : "s"}`}
            >
              {count}
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} loading={loggingOut}>
            {!loggingOut && <LogOut className="size-4" aria-hidden />}
            <span className="hidden sm:inline">Log out</span>
            <span className="sr-only sm:hidden">Log out</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
