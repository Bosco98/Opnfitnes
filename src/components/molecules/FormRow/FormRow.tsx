import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import "./FormRow.css";

export interface FormRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  /** stack control below label (default) or place it inline on the right */
  layout?: "stack" | "inline";
  children: ReactNode;
}

/** Labeled settings/form row. One consistent label + help + control pattern. */
export function FormRow({
  label,
  description,
  htmlFor,
  layout = "stack",
  children,
}: FormRowProps) {
  return (
    <div className={cn("form-row", `form-row--${layout}`)}>
      <div className="form-row__text">
        <label className="form-row__label" htmlFor={htmlFor}>
          {label}
        </label>
        {description && <p className="form-row__desc">{description}</p>}
      </div>
      <div className="form-row__control">{children}</div>
    </div>
  );
}
