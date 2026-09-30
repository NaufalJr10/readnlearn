import type { ApiError, ApiSuccess } from "./api";
import type { FieldErrors } from "./validation";

export type FetchResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string; fields?: FieldErrors };

/** Client-side helper that normalizes the API's { data } / { error } envelope. */
export async function fetchJson<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<FetchResult<T>> {
  const { json, ...rest } = init ?? {};
  try {
    const response = await fetch(url, {
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
    const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;
    if (response.ok && body && "data" in body) return { ok: true, data: body.data };
    const error = body && "error" in body ? body.error : null;
    return { ok: false, status: response.status, message: error?.message ?? "Something went wrong. Please try again.", fields: error?.fields };
  } catch {
    return { ok: false, status: 0, message: "We couldn't reach the server. Check your connection and try again." };
  }
}
