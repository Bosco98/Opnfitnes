import type { Exercise } from "@/types";
import "./ExerciseTable.css";

export interface ExerciseTableProps {
  exercises: Exercise[];
  selectable?: boolean;
  selectedIndices?: Set<number>;
  onSelectionChange?: (indices: Set<number>) => void;
}

/** The generated workout, rendered as a table on wider phones and as stacked
   rows on narrow ones (the table collapses via CSS, same markup). */
export function ExerciseTable({
  exercises,
  selectable,
  selectedIndices,
  onSelectionChange,
}: ExerciseTableProps) {
  const toggle = (i: number) => {
    if (!onSelectionChange || !selectedIndices) return;
    const next = new Set(selectedIndices);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    onSelectionChange(next);
  };

  return (
    <div className="ex-table" role="table" aria-label="Workout exercises">
      <div className="ex-table__head" role="row">
        <span role="columnheader">Exercise</span>
        <span role="columnheader" className="num">
          Sets / Reps
        </span>
        <span role="columnheader">How to perform</span>
        {selectable && <span role="columnheader" aria-label="Swap" />}
      </div>
      <ol className="ex-table__body">
        {exercises.map((ex, i) => {
          const isSelected = selectable && selectedIndices?.has(i);
          return (
            <li
              className={`ex-row${isSelected ? " ex-row--selected" : ""}`}
              role="row"
              key={`${ex.name}-${i}`}
            >
              <span className="ex-row__index num" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="ex-row__main">
                <span className="ex-row__name" role="cell">
                  {ex.name}
                </span>
                <span className="ex-row__sets num" role="cell">
                  {ex.setsReps}
                </span>
                <span className="ex-row__how" role="cell">
                  {ex.howTo}
                </span>
              </div>
              {selectable && (
                <button
                  type="button"
                  className={`ex-row__swap${isSelected ? " ex-row__swap--on" : ""}`}
                  aria-label={isSelected ? `Deselect ${ex.name}` : `Select ${ex.name} to swap`}
                  aria-pressed={isSelected}
                  onClick={() => toggle(i)}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
