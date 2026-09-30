import { Megaphone } from "lucide-react";
import { Badge } from "../ui/Badge";
import { LocalTime } from "../ui/LocalTime";

type AnnouncementItemProps = { title: string; content: string; context: string; author?: string; createdAt: Date; unread?: boolean; expanded?: boolean };

export function AnnouncementItem({ title, content, context, author, createdAt, unread, expanded }: AnnouncementItemProps) {
  return (
    <li className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Megaphone className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{title}</h3>
            {unread && <Badge tone="primary">New</Badge>}
          </div>
          <p className="text-sm text-fg-subtle">
            {context}
            {author ? ` · ${author}` : ""} · <LocalTime iso={createdAt.toISOString()} style="date" />
          </p>
          <p className={`mt-2 whitespace-pre-line text-fg-muted ${expanded ? "" : "line-clamp-3"}`}>{content}</p>
        </div>
      </div>
    </li>
  );
}
