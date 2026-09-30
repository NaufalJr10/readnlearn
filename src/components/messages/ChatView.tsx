"use client";

import { ArrowLeft, Check, CheckCheck, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { fetchJson } from "@/lib/fetch-json";
import type { MessageDTO } from "@/lib/messaging-types";
import { emitTyping, subscribeToRealtime } from "@/lib/realtime-client";
import { cn } from "@/lib/utils";
import { useUnread } from "../dashboard/UnreadProvider";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { LocalTime } from "../ui/LocalTime";
import { useToast } from "../ui/ToastProvider";

const POLL_MS = 12_000;
const MAX_LENGTH = 2000;
export const CONVERSATIONS_CHANGED = "rnl:conversations-changed";

type ChatViewProps = {
  meId: string;
  partner: { id: string; name: string; role: "student" | "tutor" };
  initialMessages: MessageDTO[];
  initialHasMore: boolean;
  backHref: string;
};

const noopSubscribe = () => () => {};
const dayKey = (iso: string) => new Date(iso).toDateString();

function merge(current: MessageDTO[], incoming: MessageDTO[]) {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, { ...byId.get(m.id), ...m });
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ChatView({ meId, partner, initialMessages, initialHasMore, backHref }: ChatViewProps) {
  const toast = useToast();
  const { refresh: refreshUnread } = useUnread();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [messages, setMessages] = useState(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastTypingSent = useRef(0);
  const typingTimer = useRef<number | undefined>(undefined);
  const latestRef = useRef(messages);
  useEffect(() => {
    latestRef.current = messages;
  }, [messages]);

  const hasUnreadFromPartner = messages.some((m) => m.senderId === partner.id && !m.readAt);

  const scrollToBottom = useCallback(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (stickToBottom.current) scrollToBottom();
  }, [messages, partnerTyping, scrollToBottom]);

  useEffect(() => {
    if (!hasUnreadFromPartner) return;
    let cancelled = false;
    void fetchJson(`/api/messages/${partner.id}/read`, { method: "PATCH" }).then((result) => {
      if (cancelled || !result.ok) return;
      const readAt = new Date().toISOString();
      setMessages((all) => all.map((m) => (m.senderId === partner.id && !m.readAt ? { ...m, readAt } : m)));
      void refreshUnread();
      window.dispatchEvent(new Event(CONVERSATIONS_CHANGED));
    });
    return () => {
      cancelled = true;
    };
  }, [hasUnreadFromPartner, partner.id, refreshUnread]);

  useEffect(() => {
    const offNew = subscribeToRealtime("message:new", (m) => {
      const inThisThread = (m.senderId === partner.id && m.recipientId === meId) || (m.senderId === meId && m.recipientId === partner.id);
      if (inThisThread) setMessages((all) => merge(all, [m]));
      if (m.senderId === partner.id) setPartnerTyping(false);
      window.dispatchEvent(new Event(CONVERSATIONS_CHANGED));
    });
    const offRead = subscribeToRealtime("message:read", ({ readerId, readAt }) => {
      if (readerId !== partner.id) return;
      setMessages((all) => all.map((m) => (m.senderId === meId && !m.readAt ? { ...m, readAt } : m)));
    });
    const offTyping = subscribeToRealtime("typing", ({ userId, typing }) => {
      if (userId !== partner.id) return;
      window.clearTimeout(typingTimer.current);
      setPartnerTyping(typing);
      if (typing) typingTimer.current = window.setTimeout(() => setPartnerTyping(false), 4000);
    });
    return () => {
      offNew();
      offRead();
      offTyping();
      window.clearTimeout(typingTimer.current);
    };
  }, [meId, partner.id]);

  // Fallback for when the socket is unavailable (e.g. plain `next start`): pick up anything newer than what we have.
  const catchUp = useCallback(async () => {
    const last = latestRef.current.at(-1)?.createdAt;
    const url = last ? `/api/messages/${partner.id}?after=${encodeURIComponent(last)}` : `/api/messages/${partner.id}`;
    const result = await fetchJson<{ messages: MessageDTO[] }>(url, { cache: "no-store" });
    if (result.ok && result.data.messages.length > 0) setMessages((all) => merge(all, result.data.messages));
  }, [partner.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void catchUp();
    }, POLL_MS);
    window.addEventListener("focus", catchUp);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", catchUp);
    };
  }, [catchUp]);

  async function loadOlder() {
    const first = messages[0]?.createdAt;
    if (!first) return;
    setLoadingOlder(true);
    const el = scroller.current;
    const previousHeight = el?.scrollHeight ?? 0;
    stickToBottom.current = false;
    const result = await fetchJson<{ messages: MessageDTO[]; hasMore: boolean }>(`/api/messages/${partner.id}?before=${encodeURIComponent(first)}`, { cache: "no-store" });
    setLoadingOlder(false);
    if (!result.ok) return toast({ tone: "error", title: "Couldn't load earlier messages", description: result.message });
    setMessages((all) => merge(all, result.data.messages));
    setHasMore(result.data.hasMore);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - previousHeight;
    });
  }

  function onDraftChange(value: string) {
    setDraft(value);
    const now = Date.now();
    if (value && now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now;
      emitTyping(partner.id, true);
    }
    if (!value) {
      lastTypingSent.current = 0;
      emitTyping(partner.id, false);
    }
  }

  async function send() {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    const result = await fetchJson<MessageDTO>("/api/messages", { method: "POST", json: { recipientId: partner.id, content } });
    setSending(false);
    if (!result.ok) return toast({ tone: "error", title: "Message not sent", description: result.message });
    stickToBottom.current = true;
    setDraft("");
    lastTypingSent.current = 0;
    emitTyping(partner.id, false);
    setMessages((all) => merge(all, [result.data]));
    window.dispatchEvent(new Event(CONVERSATIONS_CHANGED));
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  const lastMine = messages.findLast((m) => m.senderId === meId);
  const remaining = MAX_LENGTH - draft.length;

  return (
    <section aria-label={`Conversation with ${partner.name}`} className="flex h-full min-h-0 flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-3 sm:px-5">
        <Link href={backHref} className="flex size-11 items-center justify-center rounded-xl text-fg-muted transition-colors hover:bg-surface-muted lg:hidden" aria-label="Back to conversations">
          <ArrowLeft className="size-5" />
        </Link>
        <Avatar name={partner.name} className="size-11 text-sm" />
        <div className="min-w-0">
          <h2 className="truncate font-bold">{partner.name}</h2>
          <p className="h-5 text-sm text-fg-subtle" aria-live="polite">
            {partnerTyping ? <span className="text-primary">typing…</span> : <Badge tone={partner.role === "tutor" ? "primary" : "neutral"} className="capitalize">{partner.role}</Badge>}
          </p>
        </div>
      </header>

      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
        role="log"
        aria-live="polite"
        aria-label="Messages"
      >
        {hasMore && (
          <div className="mb-4 flex justify-center">
            <Button variant="secondary" size="sm" onClick={loadOlder} loading={loadingOlder}>
              Load earlier messages
            </Button>
          </div>
        )}
        {messages.length === 0 && (
          <p className="mx-auto mt-16 max-w-xs text-center text-fg-muted">This is the start of your conversation with {partner.name}. Say hello 👋</p>
        )}
        <ul className="space-y-1.5">
          {messages.map((m, i) => {
            const mine = m.senderId === meId;
            const startsNewDay = mounted && (i === 0 || dayKey(messages[i - 1]!.createdAt) !== dayKey(m.createdAt));
            const sameSenderAsPrev = i > 0 && messages[i - 1]!.senderId === m.senderId && !startsNewDay;
            return (
              <li key={m.id}>
                {startsNewDay && (
                  <div className="my-4 flex justify-center">
                    <LocalTime iso={m.createdAt} style="weekday" className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-fg-subtle" />
                  </div>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start", !sameSenderAsPrev && "pt-2")}>
                  <div className={cn("max-w-[85%] sm:max-w-[70%]", mine ? "items-end" : "items-start", "flex flex-col")}>
                    <p
                      className={cn(
                        "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                        mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-border bg-surface text-fg",
                      )}
                    >
                      {m.content}
                    </p>
                    <span className="mt-0.5 flex items-center gap-1 px-1 text-[11px] text-fg-subtle">
                      <LocalTime iso={m.createdAt} style="time" />
                      {mine && m.id === lastMine?.id && (m.readAt ? <><CheckCheck className="size-3.5 text-primary" aria-hidden />Seen</> : <><Check className="size-3.5" aria-hidden />Sent</>)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border bg-surface p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <label htmlFor="message-draft" className="sr-only">
            Message to {partner.name}
          </label>
          <textarea
            id="message-draft"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => emitTyping(partner.id, false)}
            rows={1}
            maxLength={MAX_LENGTH}
            placeholder="Write a message…"
            className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-border-strong bg-surface px-4 py-3 text-base text-fg placeholder:text-fg-subtle transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring/20 sm:text-sm"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <Button onClick={send} loading={sending} disabled={!draft.trim()} className="size-12 shrink-0 !px-0" aria-label="Send message">
            {!sending && <Send className="size-5" aria-hidden />}
          </Button>
        </div>
        <p className={cn("mt-1.5 h-4 px-1 text-xs", remaining < 100 ? "text-warning" : "text-fg-subtle")}>{remaining < 300 ? `${remaining} characters left` : "Enter to send · Shift+Enter for a new line"}</p>
      </div>
    </section>
  );
}
