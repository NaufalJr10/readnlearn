"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";
import { inputClasses } from "./input-styles";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean; describedBy?: string };

export function PasswordInput({ invalid, describedBy, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={inputClasses(invalid, `pr-12 ${className ?? ""}`)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
      </button>
    </div>
  );
}
