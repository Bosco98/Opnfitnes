import { Screen } from "@/components/templates";
import { WorkoutWizard } from "@/components/organisms";

export interface WorkoutTabProps {
  onGoToSettings: () => void;
  onGoToSaved?: () => void;
}

/** Tab 1 — the full generate → run → log flow lives in the wizard. */
export function WorkoutTab({ onGoToSettings, onGoToSaved }: WorkoutTabProps) {
  return (
    <Screen bare>
      <WorkoutWizard onGoToSettings={onGoToSettings} onGoToSaved={onGoToSaved} />
    </Screen>
  );
}
