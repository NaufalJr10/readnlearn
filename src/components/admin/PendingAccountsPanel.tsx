"use client";

import { Check, Inbox, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { PendingAccount } from "@/lib/admin-accounts";
import { fetchJson } from "@/lib/fetch-json";
import { cn } from "@/lib/utils";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { EmptyState } from "../ui/EmptyState";
import { useToast } from "../ui/ToastProvider";
import { usePendingCount } from "./PendingCountProvider";
import { RelativeTime } from "./RelativeTime";

type RoleFilter = "all" | "student" | "tutor";
type Decision = { account: PendingAccount; action: "accept" | "reject" };

const roleTabs: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "student", label: "Students" },
  { value: "tutor", label: "Tutors" },
];

export function PendingAccountsPanel({ initialAccounts }: { initialAccounts: PendingAccount[] }) {
  const router = useRouter();
  const toast = useToast();
  const { count, refresh } = usePendingCount();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [working, setWorking] = useState(false);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (count === accounts.length) return;
    let cancelled = false;
    void fetchJson<PendingAccount[]>("/api/admin/accounts/pending", { cache: "no-store" }).then((result) => {
      if (!cancelled && result.ok) setAccounts(result.data);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resync only when the polled count changes
  }, [count]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts.filter((a) => (role === "all" || a.role === role) && (!q || a.email.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)));
  }, [accounts, query, role]);

  const counts = useMemo(
    () => ({ all: accounts.length, student: accounts.filter((a) => a.role === "student").length, tutor: accounts.filter((a) => a.role === "tutor").length }),
    [accounts],
  );

  async function confirm() {
    if (!decision) return;
    const { account, action } = decision;
    setWorking(true);
    const result = await fetchJson<{ status: string }>(`/api/admin/accounts/${account.id}/${action}`, { method: "PATCH" });
    setWorking(false);
    setDecision(null);

    if (!result.ok && result.status !== 409 && result.status !== 404) {
      toast({ tone: "error", title: `Couldn't ${action} ${account.name}`, description: result.message });
      return;
    }
    if (result.ok) {
      toast({
        tone: "success",
        title: action === "accept" ? `${account.name} is now active` : `${account.name} was rejected`,
        description: action === "accept" ? "They've been emailed that they can log in." : "They've been notified by email.",
      });
    } else {
      toast({ tone: "info", title: "Already handled", description: result.message });
    }

    setLeaving((s) => new Set(s).add(account.id));
    window.setTimeout(() => {
      setAccounts((all) => all.filter((a) => a.id !== account.id));
      setLeaving((s) => {
        const next = new Set(s);
        next.delete(account.id);
        return next;
      });
      void refresh();
      router.refresh();
    }, 280);
  }

  const rowActions = (account: PendingAccount) => (
    <div className="flex gap-2">
      <Button size="sm" variant="success" onClick={() => setDecision({ account, action: "accept" })} aria-label={`Accept ${account.name}`}>
        <Check className="size-4" aria-hidden />
        Accept
      </Button>
      <Button size="sm" variant="secondary" className="hover:border-danger hover:bg-danger-soft hover:text-danger" onClick={() => setDecision({ account, action: "reject" })} aria-label={`Reject ${account.name}`}>
        <X className="size-4" aria-hidden />
        Reject
      </Button>
    </div>
  );

  return (
    <section id="pending" aria-labelledby="pending-heading" className="min-w-0 scroll-mt-24 rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="pending-heading" className="text-xl font-bold">
            Pending accounts
          </h2>
          <p className="text-sm text-fg-muted">Oldest signups first, so nobody waits too long.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div role="tablist" aria-label="Filter by role" className="flex rounded-xl bg-surface-muted p-1">
            {roleTabs.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                type="button"
                aria-selected={role === tab.value}
                onClick={() => setRole(tab.value)}
                className={cn(
                  "flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-all",
                  role === tab.value ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg",
                )}
              >
                {tab.label}
                <span className="text-xs text-fg-subtle">{counts[tab.value]}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <label htmlFor="pending-search" className="sr-only">
              Search pending accounts by name or email
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              id="pending-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
              className="min-h-12 w-full rounded-xl border border-border-strong bg-surface pl-10 pr-4 text-base transition-colors placeholder:text-fg-subtle hover:border-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring/20 sm:w-64 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={Inbox}
            title={accounts.length === 0 ? "You're all caught up!" : "No matches"}
            description={accounts.length === 0 ? "There are no accounts waiting for review. New signups will appear here automatically." : "No pending accounts match your search or filter."}
          />
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Accounts waiting for approval</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-fg-subtle">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Account
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Role
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Signed up
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((account) => (
                  <tr
                    key={account.id}
                    className={cn(
                      "animate-fade-in transition-all duration-300 hover:bg-surface-muted/60",
                      leaving.has(account.id) && "translate-x-4 opacity-0",
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={account.name} className="size-10 text-sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-fg">{account.name}</p>
                          <p className="truncate text-fg-muted">{account.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={account.role === "tutor" ? "primary" : "neutral"} className="capitalize">
                        {account.role}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-fg-muted">
                      <RelativeTime iso={account.createdAt} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">{rowActions(account)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {visible.map((account) => (
              <li key={account.id} className={cn("animate-fade-in space-y-4 p-5 transition-all duration-300", leaving.has(account.id) && "translate-x-4 opacity-0")}>
                <div className="flex items-center gap-3">
                  <Avatar name={account.name} className="size-11 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{account.name}</p>
                    <p className="truncate text-sm text-fg-muted">{account.email}</p>
                  </div>
                  <Badge tone={account.role === "tutor" ? "primary" : "neutral"} className="capitalize">
                    {account.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <RelativeTime iso={account.createdAt} className="text-sm text-fg-subtle" />
                  {rowActions(account)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={decision !== null}
        tone={decision?.action === "reject" ? "danger" : "success"}
        title={decision?.action === "reject" ? "Reject this account?" : "Accept this account?"}
        description={
          decision && (
            <>
              <strong className="text-fg">{decision.account.name}</strong> ({decision.account.email}) will{" "}
              {decision.action === "accept" ? "be able to log in as a " + decision.account.role : "not be able to log in"}, and we&apos;ll email them to let them know.
            </>
          )
        }
        confirmLabel={decision?.action === "reject" ? "Reject Account" : "Accept Account"}
        loading={working}
        onConfirm={confirm}
        onCancel={() => setDecision(null)}
      />
    </section>
  );
}
