"use client";

import { MessageSquarePlus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";
import type { ContactDTO, ConversationDTO, SearchHitDTO } from "@/lib/messaging-types";
import { subscribeToRealtime } from "@/lib/realtime-client";
import { cn } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { CONVERSATIONS_CHANGED } from "./ChatView";
import { RelativeTime } from "../admin/RelativeTime";

type ConversationListProps = { basePath: string; initial: ConversationDTO[]; contacts: ContactDTO[]; activeId: string | null; className?: string };

export function ConversationList({ basePath, initial, contacts, activeId, className }: ConversationListProps) {
  const [conversations, setConversations] = useState(initial);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ term: string; hits: SearchHitDTO[] } | null>(null);
  const [picking, setPicking] = useState(false);

  const refresh = useCallback(async () => {
    const result = await fetchJson<ConversationDTO[]>("/api/messages/conversations", { cache: "no-store" });
    if (result.ok) setConversations(result.data);
  }, []);

  useEffect(() => {
    const off = subscribeToRealtime("message:new", () => void refresh());
    window.addEventListener(CONVERSATIONS_CHANGED, refresh);
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 30_000);
    return () => {
      off();
      window.removeEventListener(CONVERSATIONS_CHANGED, refresh);
      window.removeEventListener("focus", refresh);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const term = query.trim();
  const searchable = term.length >= 2;
  const hits = searchable && searchResult?.term === term ? searchResult.hits : null;
  const searching = searchable && searchResult?.term !== term;

  useEffect(() => {
    if (!searchable) return;
    const timer = window.setTimeout(async () => {
      const result = await fetchJson<SearchHitDTO[]>(`/api/messages/search?q=${encodeURIComponent(term)}`, { cache: "no-store" });
      setSearchResult({ term, hits: result.ok ? result.data : [] });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [term, searchable]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? conversations.filter((c) => c.partnerName.toLowerCase().includes(term)) : conversations;
  }, [conversations, query]);

  const withActive = useMemo(() => {
    if (!activeId || conversations.some((c) => c.partnerId === activeId)) return visible;
    const contact = contacts.find((c) => c.id === activeId);
    return contact ? [{ partnerId: contact.id, partnerName: contact.name, partnerRole: contact.role, lastMessage: null, lastAt: null, lastFromMe: false, unread: 0 }, ...visible] : visible;
  }, [activeId, conversations, contacts, visible]);

  return (
    <aside className={cn("flex min-h-0 flex-col border-border bg-surface lg:border-r", className)} aria-label="Conversations">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-extrabold">Messages</h1>
          <Button size="sm" variant="secondary" onClick={() => setPicking(true)}>
            <MessageSquarePlus className="size-4" aria-hidden />
            New
          </Button>
        </div>
        <div className="relative">
          <label htmlFor="conversation-search" className="sr-only">
            Search conversations and message history
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            id="conversation-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people and messages"
            className="min-h-12 w-full rounded-xl border border-border-strong bg-surface pl-10 pr-10 text-base transition-colors placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring/20 sm:text-sm"
          />
          {searching && <Spinner className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-primary" label="Searching" />}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {withActive.length === 0 && !hits?.length ? (
          <p className="p-8 text-center text-sm text-fg-muted">{query ? "No conversations match your search." : "No conversations yet. Start one with the New button."}</p>
        ) : (
          <ul className="divide-y divide-border">
            {withActive.map((c) => (
              <li key={c.partnerId}>
                <Link
                  href={`${basePath}?with=${c.partnerId}`}
                  aria-current={c.partnerId === activeId ? "page" : undefined}
                  className={cn("flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted", c.partnerId === activeId && "bg-primary-soft/60")}
                >
                  <Avatar name={c.partnerName} className="size-11 text-sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate", c.unread > 0 ? "font-bold" : "font-semibold")}>{c.partnerName}</span>
                      {c.lastAt && <RelativeTime iso={c.lastAt} className="shrink-0 text-xs text-fg-subtle" />}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn("truncate text-sm", c.unread > 0 ? "font-medium text-fg" : "text-fg-muted")}>
                        {c.lastMessage ? `${c.lastFromMe ? "You: " : ""}${c.lastMessage}` : "New conversation"}
                      </span>
                      {c.unread > 0 && (
                        <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-white" aria-label={`${c.unread} unread`}>
                          {c.unread > 99 ? "99+" : c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {hits && hits.length > 0 && (
          <div className="border-t border-border">
            <h2 className="bg-surface-muted px-4 py-2 text-xs font-bold uppercase tracking-wider text-fg-subtle">Messages matching “{query.trim()}”</h2>
            <ul className="divide-y divide-border">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <Link href={`${basePath}?with=${hit.partnerId}`} className="block px-4 py-3 transition-colors hover:bg-surface-muted">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold">{hit.partnerName}</span>
                      <RelativeTime iso={hit.createdAt} className="shrink-0 text-xs text-fg-subtle" />
                    </span>
                    <span className="line-clamp-2 text-sm text-fg-muted">{hit.content}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Modal open={picking} onClose={() => setPicking(false)} title="Start a conversation" description="Choose who you would like to message.">
        {contacts.length === 0 ? (
          <p className="rounded-xl bg-surface-muted p-5 text-center text-sm text-fg-muted">
            {basePath.includes("tutor") ? "Students appear here once they enroll in one of your courses." : "Enroll in a course to message its tutor, or open any tutor profile and choose Message Tutor."}
          </p>
        ) : (
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {contacts.map((c) => (
              <li key={c.id}>
                <Link href={`${basePath}?with=${c.id}`} onClick={() => setPicking(false)} className="flex min-h-14 items-center gap-3 rounded-xl px-3 transition-colors hover:bg-surface-muted">
                  <Avatar name={c.name} className="size-10 text-sm" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{c.name}</span>
                    <span className="block truncate text-sm text-fg-muted">{c.detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </aside>
  );
}
