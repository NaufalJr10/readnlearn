import { ok, unauthorized } from "@/lib/api";
import { requireSessionUser } from "@/lib/guards";
import { listConversations } from "@/lib/messaging";

export async function GET() {
  const me = await requireSessionUser();
  if (!me) return unauthorized();
  return ok(await listConversations(me.id));
}
