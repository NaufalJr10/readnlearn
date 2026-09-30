"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useApiMutation } from "@/lib/use-api-mutation";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";

type DeleteButtonProps = { url: string; label: string; title: string; description: ReactNode; confirmLabel: string; success: string; redirectTo: string };

/** A destructive action with a confirmation dialog that navigates away once the resource is gone. */
export function DeleteButton({ url, label, title, description, confirmLabel, success, redirectTo }: DeleteButtonProps) {
  const router = useRouter();
  const { run, loading } = useApiMutation();
  const [open, setOpen] = useState(false);

  async function remove() {
    const result = await run(url, { method: "DELETE", success, refresh: false });
    setOpen(false);
    if (result.ok) router.push(redirectTo);
  }

  return (
    <>
      <Button variant="secondary" size="sm" className="hover:border-danger hover:bg-danger-soft hover:text-danger" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden />
        {label}
      </Button>
      <ConfirmDialog open={open} tone="danger" title={title} description={description} confirmLabel={confirmLabel} loading={loading} onConfirm={remove} onCancel={() => setOpen(false)} />
    </>
  );
}
