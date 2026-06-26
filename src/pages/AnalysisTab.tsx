import { useState } from "react";
import { Screen } from "@/components/templates";
import { AnalyticsDashboard, WorkoutTimeline } from "@/components/organisms";
import { Button, EmptyState, Icon } from "@/components/atoms";
import { useHistory } from "@/hooks/useHistory";
import { useUserSettings } from "@/hooks/useSettings";

export interface AnalysisTabProps {
  onGenerate: () => void;
}

type View = "dashboard" | "log";

export function AnalysisTab({ onGenerate }: AnalysisTabProps) {
  const { history } = useHistory();
  const { user } = useUserSettings();
  const [view, setView] = useState<View>("dashboard");

  if (history.length === 0) {
    return (
      <Screen title="Insights">
        <EmptyState
          icon="BarChart3"
          title="No data yet"
          description="Complete your first workout and your trends, streaks, and muscle balance will show up here."
          action={
            <Button variant="accent" iconRight="ArrowRight" onClick={onGenerate}>
              Generate a workout
            </Button>
          }
        />
      </Screen>
    );
  }

  if (view === "log") {
    return (
      <Screen
        title="Workout Log"
        back={
          <Button
            variant="ghost"
            size="sm"
            iconLeft="ChevronLeft"
            onClick={() => setView("dashboard")}
            aria-label="Back to Insights"
          />
        }
      >
        <WorkoutTimeline logs={history} />
      </Screen>
    );
  }

  const completedCount = history.filter((l) => l.status === "completed").length;

  return (
    <Screen
      title="Insights"
      action={
        <button
          type="button"
          className="screen__action-badge"
          onClick={() => setView("log")}
          aria-label={`View workout log — ${completedCount} completed`}
        >
          <Icon name="Clock" size={14} />
          <span className="screen__action-badge-num num">{completedCount}</span>
        </button>
      }
    >
      <AnalyticsDashboard
        history={history}
        fitnessLevel={user.fitnessLevel}
      />
    </Screen>
  );
}
