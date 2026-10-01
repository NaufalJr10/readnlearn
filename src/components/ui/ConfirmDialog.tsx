"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Input } from "./Input";

type ConfirmDialogProps = {
  open: boolean;
  tone: "success" | "danger";
  title: string;
  description: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  /** When set, the user must type this exact text before the confirm button is enabled. */
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, tone, title, description, confirmLabel, loading, requireText, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const inputId = useId();
  const [typed, setTyped] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setTyped("");
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const Icon = tone === "danger" ? AlertTriangle : CheckCircle2;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) onCancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !loading) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-border bg-surface p-0 text-fg shadow-lift open:animate-scale-in"
    >
      <div className="p-6 sm:p-7">
        <span className={cn("mb-4 flex size-12 items-center justify-center rounded-2xl", tone === "danger" ? "bg-danger-soft text-danger" : "bg-success-soft text-success")}>
          <Icon className="size-6" aria-hidden />
        </span>
        <h2 id={titleId} className="text-xl font-bold">
          {title}
        </h2>
        <div id={descId} className="mt-2 text-fg-muted">
          {description}
        </div>
        {requireText && (
          <div className="mt-5">
            <label htmlFor={inputId} className="text-sm font-semibold">
              Type <span className="select-all rounded bg-danger-soft px-1.5 py-0.5 font-bold text-danger">{requireText}</span> to confirm
            </label>
            <Input id={inputId} className="mt-2" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} disabled={loading} />
          </div>
        )}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading} autoFocus>
            Cancel
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading} disabled={!!requireText && typed.trim() !== requireText}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
