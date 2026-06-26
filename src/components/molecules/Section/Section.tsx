import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/atoms";
import "./Section.css";

export interface SectionProps {
  title: string;
  icon?: IconName;
  caption?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** Titled content card used across the analytics dashboard. */
export function Section({ title, icon, caption, action, children }: SectionProps) {
  return (
    <section className="section">
      <header className="section__head">
        <div className="section__head-top">
          <h2 className="section__title">
            {icon && <Icon name={icon} size={16} />}
            {title}
          </h2>
          {action && <div className="section__action">{action}</div>}
        </div>
        {caption && <p className="section__caption">{caption}</p>}
      </header>
      <div className="section__body">{children}</div>
    </section>
  );
}
