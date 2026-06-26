import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../Icon";
import "./TextField.css";

export interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: IconName;
  /** trailing interactive node, e.g. a show/hide button */
  trailing?: ReactNode;
  invalid?: boolean;
}

export function TextField({
  iconLeft,
  trailing,
  invalid = false,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <div className={cn("field", invalid && "field--invalid", className)}>
      {iconLeft && (
        <span className="field__icon">
          <Icon name={iconLeft} size={18} />
        </span>
      )}
      <input
        className="field__input"
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {trailing && <span className="field__trailing">{trailing}</span>}
    </div>
  );
}
