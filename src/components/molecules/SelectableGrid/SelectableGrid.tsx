import type { Option } from "@/lib/constants";
import { IconTile } from "@/components/atoms";
import "./SelectableGrid.css";

interface BaseProps<T extends string | number> {
  options: Option<T>[];
  /** number of columns; defaults to auto-fit */
  columns?: number;
}

interface MultiProps<T extends string | number> extends BaseProps<T> {
  mode: "multi";
  value: T[];
  onChange: (value: T[]) => void;
}

interface SingleProps<T extends string | number> extends BaseProps<T> {
  mode: "single";
  value: T | null;
  onChange: (value: T) => void;
}

export type SelectableGridProps<T extends string | number> =
  | MultiProps<T>
  | SingleProps<T>;

/** DRY core of the wizard: one grid of pick-tiles, multi or single select. The
   three pick-screens (muscles, equipment, style) all render this. */
export function SelectableGrid<T extends string | number>(
  props: SelectableGridProps<T>,
) {
  const { options, columns } = props;

  const isSelected = (value: T): boolean =>
    props.mode === "multi"
      ? props.value.includes(value)
      : props.value === value;

  const toggle = (value: T): void => {
    if (props.mode === "multi") {
      const set = new Set(props.value);
      set.has(value) ? set.delete(value) : set.add(value);
      props.onChange([...set]);
    } else {
      props.onChange(value);
    }
  };

  return (
    <div
      className="sgrid"
      style={
        columns
          ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
          : undefined
      }
    >
      {options.map((o) => (
        <IconTile
          key={String(o.value)}
          icon={o.icon}
          label={o.label}
          hint={o.hint}
          selected={isSelected(o.value)}
          marker={props.mode === "multi" ? "check" : "dot"}
          onClick={() => toggle(o.value)}
        />
      ))}
    </div>
  );
}
