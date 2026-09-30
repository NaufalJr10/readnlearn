import { NextResponse } from "next/server";
import type { z } from "zod";
import { fieldErrors, type FieldErrors } from "./validation";

export type ApiError = { error: { code: string; message: string; fields?: FieldErrors } };
export type ApiSuccess<T> = { data: T };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ data }, init);
}

export function fail(status: number, code: string, message: string, fields?: FieldErrors) {
  return NextResponse.json<ApiError>({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}

export function validationFailed(error: z.ZodError) {
  return fail(422, "validation_error", "Please fix the highlighted fields.", fieldErrors(error));
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<{ data: z.output<S> } | { response: NextResponse }> {
  const parsed = schema.safeParse(await readJson(request));
  return parsed.success ? { data: parsed.data } : { response: validationFailed(parsed.error as z.ZodError) };
}

export const unauthorized = () => fail(401, "unauthorized", "Please log in to continue.");
export const forbidden = (message = "You don't have access to this.") => fail(403, "forbidden", message);
export const notFound = (message = "We couldn't find that.") => fail(404, "not_found", message);

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
