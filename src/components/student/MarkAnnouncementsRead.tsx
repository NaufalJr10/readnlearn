"use client";

import { useEffect } from "react";
import { fetchJson } from "@/lib/fetch-json";
import { useUnread } from "../dashboard/UnreadProvider";

/** Marks the announcements shown on the page as read shortly after they are seen. */
export function MarkAnnouncementsRead({ ids }: { ids: string[] }) {
  const { refresh } = useUnread();
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    const timer = window.setTimeout(async () => {
      const result = await fetchJson("/api/student/announcements/read", { method: "POST", json: { ids: key.split(",") } });
      if (result.ok) void refresh();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [key, refresh]);

  return null;
}
