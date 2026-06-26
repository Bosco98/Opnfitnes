import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../Icon";
import "./Badge.css";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warn"
  | "danger";

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: IconName;
  children: ReactNode;
}

export function Badge({ tone = "neutral", icon, children }: BadgeProps) {
  return (
    <span className={cn("badge", `badge--${tone}`)}>
      {icon && <Icon name={icon} size={12} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
