import { Icon, type IconName } from "@/components/atoms";
import "./PhaseList.css";

export interface PhaseListProps {
  title: string;
  icon: IconName;
  items: string[];
  tone?: "warn" | "accent";
  selectable?: boolean;
  selectedIndices?: Set<number>;
  onSelectionChange?: (indices: Set<number>) => void;
}

/** Warmup / cooldown checklist with optional per-item swap selection. */
export function PhaseList({
  title,
  icon,
  items,
  tone = "accent",
  selectable,
  selectedIndices,
  onSelectionChange,
}: PhaseListProps) {
  if (items.length === 0) return null;

  const toggle = (i: number) => {
    if (!onSelectionChange || !selectedIndices) return;
    const next = new Set(selectedIndices);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    onSelectionChange(next);
  };

  return (
    <section className={`phase phase--${tone}`}>
      <h3 className="phase__title">
        <Icon name={icon} size={16} /> {title}
      </h3>
      <ul className="phase__list">
        {items.map((item, i) => {
          const isSelected = selectable && selectedIndices?.has(i);
          return (
            <li
              className={`phase__item${isSelected ? " phase__item--selected" : ""}`}
              key={i}
            >
              <Icon name="Check" size={14} strokeWidth={3} className="phase__tick" />
              <span className="phase__item-text">{item}</span>
              {selectable && (
                <button
                  type="button"
                  className={`phase__swap${isSelected ? " phase__swap--on" : ""}`}
                  aria-label={isSelected ? `Deselect "${item}"` : `Select "${item}" to swap`}
                  aria-pressed={isSelected}
                  onClick={() => toggle(i)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
