import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import "./TextArea.css";

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function TextArea({ invalid = false, className, ...rest }: TextAreaProps) {
  return (
    <div className={cn("field field--area", invalid && "field--invalid", className)}>
      <textarea className="field__input field__textarea" aria-invalid={invalid || undefined} {...rest} />
    </div>
  );
}
