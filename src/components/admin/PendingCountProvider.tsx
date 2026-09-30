"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchJson } from "@/lib/fetch-json";

const POLL_MS = 15_000;

type PendingCount = { count: number; refresh: () => Promise<void> };

const PendingCountContext = createContext<PendingCount | null>(null);

export function PendingCountProvider({ initialCount, children }: { initialCount: number; children: ReactNode }) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);

  const refresh = useCallback(async () => {
    const result = await fetchJson<{ count: number }>("/api/admin/accounts/pending/count", { cache: "no-store" });
    if (result.ok) setCount(result.data.count);
    else if (result.status === 401) router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return <PendingCountContext.Provider value={{ count, refresh }}>{children}</PendingCountContext.Provider>;
}

export function usePendingCount() {
  const value = useContext(PendingCountContext);
  if (!value) throw new Error("usePendingCount must be used within PendingCountProvider");
  return value;
}
