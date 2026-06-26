import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../Icon";
import "./Stat.css";

export interface StatProps {
  value: string | number;
  label: string;
  icon?: IconName;
  /** visual weight — drives the box + number size in the analytics grid */
  emphasis?: "lg" | "md" | "sm";
  tone?: "default" | "accent" | "success";
  suffix?: string;
}

export function Stat({
  value,
  label,
  icon,
  emphasis = "md",
  tone = "default",
  suffix,
}: StatProps) {
  return (
    <div className={cn("stat", `stat--${emphasis}`, `stat--${tone}`)}>
      <div className="stat__head">
        {icon && (
          <span className="stat__icon">
            <Icon name={icon} size={emphasis === "lg" ? 18 : 15} />
          </span>
        )}
        <span className="stat__label">{label}</span>
      </div>
      <div className="stat__value num">
        {value}
        {suffix && <span className="stat__suffix">{suffix}</span>}
      </div>
    </div>
  );
}
