import { clientIp, fail, ok, readJson, validationFailed } from "@/lib/api";
import { emails } from "@/lib/email";
import { formatRetry, hit, POLICIES } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationFailed(parsed.error);

  const limit = await hit(`contact:${clientIp(request)}`, POLICIES.contact);
  if (!limit.allowed) return fail(429, "rate_limited", `You've sent a few messages already. Try again in ${formatRetry(limit.retryAfterMs)}.`);

  await emails.contactMessage(parsed.data);
  return ok({ sent: true });
}
