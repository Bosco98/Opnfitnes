import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../Icon";
import "./Button.css";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** lucide icon name shown before the label */
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const iconSize = size === "lg" ? 20 : size === "sm" ? 16 : 18;
  return (
    <button
      className={cn(
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && "btn--full",
        loading && "btn--loading",
        !children && "btn--icon-only",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <Icon name="Loader2" size={iconSize} className="btn__spinner" />
      )}
      {!loading && iconLeft && <Icon name={iconLeft} size={iconSize} />}
      {children && <span className="btn__label">{children}</span>}
      {!loading && iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}
