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
