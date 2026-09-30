import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { inputClasses } from "./input-styles";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; describedBy?: string };

export function Textarea({ invalid, describedBy, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(inputClasses(invalid), "py-3 leading-relaxed", className)}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      {...props}
    />
  );
}
