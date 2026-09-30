import type { ReactNode } from "react";

type FieldProps = { id: string; label: string; error?: string; hint?: ReactNode; children: ReactNode; labelAction?: ReactNode };

export function Field({ id, label, error, hint, children, labelAction }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
        </label>
        {labelAction}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="animate-fade-in text-sm font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
