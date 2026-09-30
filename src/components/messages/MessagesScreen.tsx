import { MessageCircle } from "lucide-react";
import { isUuid } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { findMessagingPartner, getContacts, getThread, listConversations } from "@/lib/messaging";
import { ChatView } from "./ChatView";
import { ConversationList } from "./ConversationList";

/** Two-pane inbox on desktop; one pane at a time on phones. Shared by the student and tutor routes. */
export async function MessagesScreen({ role, withId }: { role: "student" | "tutor"; withId?: string }) {
  const basePath = `/${role}/messages`;
  const user = await requireRole(role, basePath);
  const [conversations, contacts] = await Promise.all([listConversations(user.id), getContacts({ id: user.id, role })]);

  let active: { partner: { id: string; name: string; role: "student" | "tutor" }; messages: Awaited<ReturnType<typeof getThread>> } | null = null;
  let notice: string | null = null;
  if (withId && isUuid(withId)) {
    const partner = await findMessagingPartner({ id: user.id, role }, withId);
    if (partner) active = { partner: { id: partner.id, name: partner.name, role: partner.role as "student" | "tutor" }, messages: await getThread(user.id, partner.id) };
    else notice = role === "tutor" ? "You can only message students enrolled in your courses." : "That tutor is not available.";
  }

  return (
    <div className="h-[calc(100dvh-10rem)] lg:h-dvh">
      <div className="grid h-full lg:grid-cols-[340px_1fr]">
        <ConversationList basePath={basePath} initial={conversations} contacts={contacts} activeId={active?.partner.id ?? null} className={active ? "hidden lg:flex" : "flex"} />
        {active ? (
          <ChatView
            key={active.partner.id}
            meId={user.id}
            partner={active.partner}
            initialMessages={active.messages.messages}
            initialHasMore={active.messages.hasMore}
            backHref={basePath}
          />
        ) : (
          <div className="hidden flex-col items-center justify-center gap-3 bg-bg p-8 text-center lg:flex">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <MessageCircle className="size-8" aria-hidden />
            </span>
            <h2 className="text-xl font-bold">{notice ?? "Select a conversation"}</h2>
            <p className="max-w-sm text-fg-muted">{notice ? "Pick someone from the list instead." : "Choose a conversation on the left, or start a new one with the New button."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
