import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon";
import "./EmptyState.css";

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon name={icon} size={28} strokeWidth={1.75} />
      </span>
      <h3 className="empty__title">{title}</h3>
      <p className="empty__desc">{description}</p>
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
