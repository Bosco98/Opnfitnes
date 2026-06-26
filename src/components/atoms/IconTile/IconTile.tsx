import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../Icon";
import "./IconTile.css";

export interface IconTileProps {
  icon: IconName | string;
  label: string;
  hint?: string;
  selected?: boolean;
  disabled?: boolean;
  /** "check" for multi-select, "dot" for single-select radio feel */
  marker?: "check" | "dot";
  onClick?: () => void;
}

/** The signature square pick-tile used across the wizard. Selection is shown by
   accent border + fill + a marker — never color alone (a11y). */
export function IconTile({
  icon,
  label,
  hint,
  selected = false,
  disabled = false,
  marker = "check",
  onClick,
}: IconTileProps) {
  return (
    <button
      type="button"
      className={cn("tile", selected && "tile--selected")}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="tile__marker" aria-hidden>
        {selected && (
          <Icon name={marker === "check" ? "Check" : "Check"} size={13} strokeWidth={3} />
        )}
      </span>
      <span className="tile__icon">
        <Icon name={icon} size={26} strokeWidth={1.75} />
      </span>
      <span className="tile__label">{label}</span>
      {hint && <span className="tile__hint">{hint}</span>}
    </button>
  );
}
