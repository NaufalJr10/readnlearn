import type { NextRequest } from "next/server";
import { ok, unauthorized } from "@/lib/api";
import { requireSessionUser } from "@/lib/guards";
import { searchMessages } from "@/lib/messaging";

export async function GET(request: NextRequest) {
  const me = await requireSessionUser();
  if (!me) return unauthorized();
  return ok(await searchMessages(me.id, request.nextUrl.searchParams.get("q") ?? ""));
}
