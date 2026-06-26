import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import "./Screen.css";

export interface ScreenProps {
  title?: string;
  /** left-aligned header slot, e.g. a back button */
  back?: ReactNode;
  /** right-aligned header slot, e.g. an action button */
  action?: ReactNode;
  /** when true, no built-in header (the content owns the top) */
  bare?: boolean;
  children: ReactNode;
}

/** Page-level layout shell for a tab. Consistent title row + scroll body. */
export function Screen({ title, back, action, bare = false, children }: ScreenProps) {
  return (
    <div className={cn("screen", bare && "screen--bare")}>
      {!bare && title && (
        <header className="screen__header">
          {back && <div className="screen__back">{back}</div>}
          <h1 className="screen__title">{title}</h1>
          {action && <div className="screen__action">{action}</div>}
        </header>
      )}
      <div className="screen__body">{children}</div>
    </div>
  );
}
