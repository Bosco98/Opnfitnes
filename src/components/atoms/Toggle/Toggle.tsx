import { cn } from "@/lib/cn";
import "./Toggle.css";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** when false the label is visually hidden but kept for a11y */
  showLabel?: boolean;
  disabled?: boolean;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  showLabel = false,
  disabled = false,
  id,
}: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={showLabel ? undefined : label}
      disabled={disabled}
      className={cn("toggle", checked && "toggle--on")}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__track">
        <span className="toggle__thumb" />
      </span>
      {showLabel && <span className="toggle__label">{label}</span>}
    </button>
  );
}
