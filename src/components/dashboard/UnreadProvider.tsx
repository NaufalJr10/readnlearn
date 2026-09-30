"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchJson } from "@/lib/fetch-json";
import { subscribeToRealtime } from "@/lib/realtime-client";

const POLL_MS = 30_000;

type Unread = { messages: number; announcements: number };
type UnreadContextValue = Unread & { refresh: () => Promise<void> };

const UnreadContext = createContext<UnreadContextValue | null>(null);

export function UnreadProvider({ initial, children }: { initial: Unread; children: ReactNode }) {
  const [unread, setUnread] = useState(initial);

  const refresh = useCallback(async () => {
    const result = await fetchJson<Unread>("/api/unread", { cache: "no-store" });
    if (result.ok) setUnread(result.data);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    const unsubscribe = subscribeToRealtime("message:new", () => void refresh());
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      unsubscribe();
    };
  }, [refresh]);

  const value = useMemo(() => ({ ...unread, refresh }), [unread, refresh]);
  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export function useUnread() {
  const value = useContext(UnreadContext);
  if (!value) throw new Error("useUnread must be used within UnreadProvider");
  return value;
}
