"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { fetchJson, type FetchResult } from "./fetch-json";
import type { FieldErrors } from "./validation";

type RunOptions = { method?: "POST" | "PATCH" | "PUT" | "DELETE"; json?: unknown; success?: string; refresh?: boolean };

/** Runs a mutation with consistent loading state, field errors, toasts and a server-component refresh. */
export function useApiMutation() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const run = useCallback(
    async <T = unknown>(url: string, { method = "POST", json, success, refresh = true }: RunOptions = {}): Promise<FetchResult<T>> => {
      setLoading(true);
      const result = await fetchJson<T>(url, { method, json });
      setLoading(false);
      if (result.ok) {
        setErrors({});
        if (success) toast({ tone: "success", title: success });
        if (refresh) router.refresh();
      } else {
        setErrors(result.fields ?? {});
        toast({ tone: "error", title: "That didn't work", description: result.message });
      }
      return result;
    },
    [router, toast],
  );

  const error = useCallback((name: string) => errors[name]?.[0], [errors]);
  return { run, loading, errors, error };
}
