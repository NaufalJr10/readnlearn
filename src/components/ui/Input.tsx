import type { InputHTMLAttributes } from "react";
import { inputClasses } from "./input-styles";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; describedBy?: string };

export function Input({ invalid, describedBy, className, ...props }: InputProps) {
  return <input className={inputClasses(invalid, className)} aria-invalid={invalid || undefined} aria-describedby={describedBy} {...props} />;
}
