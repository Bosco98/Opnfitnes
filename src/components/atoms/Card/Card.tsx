import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** raised = stronger surface + shadow; flat = subtle bordered surface */
  elevation?: "flat" | "raised";
  pad?: "sm" | "md" | "lg" | "none";
  children: ReactNode;
}

export function Card({
  elevation = "flat",
  pad = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn("card", `card--${elevation}`, `card--pad-${pad}`, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
