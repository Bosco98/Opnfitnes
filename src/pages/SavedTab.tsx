import { useRef, useState } from "react";
import type { SavedWorkout } from "@/types";
import { Button, Icon } from "@/components/atoms";
import { ExerciseTable, PhaseList, SummaryChips } from "@/components/molecules";
import { TimerSession } from "@/components/organisms";
import { Screen } from "@/components/templates";
import { useHistory } from "@/hooks/useHistory";
import { useSavedWorkouts } from "@/hooks/useSavedWorkouts";
import { APP_WORKOUTS } from "@/lib/appWorkouts";
import "./SavedTab.css";

type Phase = "list" | "detail" | "session";
type Source = "user" | "app";

interface SelectedItem {
  workout: SavedWorkout;
  source: Source;
}

export interface SavedTabProps {
  onGoToWorkout?: () => void;
}

export function SavedTab({ onGoToWorkout }: SavedTabProps) {
  const { saved, remove } = useSavedWorkouts();
  const { log, setStatus } = useHistory();
  const [phase, setPhase] = useState<Phase>("list");
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const activeLogId = useRef<string | null>(null);

  const handleSelect = (workout: SavedWorkout, source: Source) => {
    setSelected({ workout, source });
    setPhase("detail");
  };

  const handleStartSession = () => {
    if (!selected) return;
    const entry = log(selected.workout.config, selected.workout.name, "completed");
    activeLogId.current = entry.id;
    setPhase("session");
  };

  const handleFinish = () => {
    activeLogId.current = null;
    setSelected(null);
    setPhase("list");
  };

  const handleGiveUp = () => {
    if (activeLogId.current) setStatus(activeLogId.current, "skipped");
    activeLogId.current = null;
    setPhase("detail");
  };

  /* ---- Session ----------------------------------------------------------- */
  if (phase === "session" && selected) {
    return (
      <Screen bare>
        <TimerSession
          workout={selected.workout.workout}
          durationMin={selected.workout.config.duration}
          autoStart={true}
          onFinish={handleFinish}
          onGiveUp={handleGiveUp}
        />
      </Screen>
    );
  }

  /* ---- Detail ------------------------------------------------------------ */
  if (phase === "detail" && selected) {
    const sw = selected.workout;
    return (
      <Screen bare>
        <div className="saved-detail">
          <button
            type="button"
            className="saved-detail__back"
            onClick={() => setPhase("list")}
            aria-label="Back to saved list"
          >
            <Icon name="ChevronLeft" size={16} /> Saved
          </button>

          <header className="saved-detail__header">
            <div className="saved-detail__eyebrow">
              <Icon name={selected.source === "user" ? "Heart" : "Sparkles"} size={13} />
              {selected.source === "user" ? "Saved workout" : "App workout"}
            </div>
            <h1 className="saved-detail__name">{sw.name}</h1>
            <div className="saved-detail__meta">
              <span><Icon name="Timer" size={14} /> {sw.workout.estMinutes} min</span>
              <span><Icon name="ListChecks" size={14} /> {sw.workout.exercises.length} exercises</span>
            </div>
          </header>

          <SummaryChips config={sw.config} />

          <PhaseList
            title="Warmup"
            icon="Flame"
            items={sw.workout.warmup}
            tone="warn"
          />

          <div className="saved-detail__main">
            <h2 className="saved-detail__section">
              <Icon name="Dumbbell" size={16} /> Main workout
            </h2>
            <ExerciseTable exercises={sw.workout.exercises} />
          </div>

          <PhaseList
            title="Cooldown"
            icon="HeartPulse"
            items={sw.workout.cooldown}
            tone="accent"
          />

          <div className="saved-detail__actions">
            <Button
              variant="accent"
              size="lg"
              iconLeft="Play"
              fullWidth
              onClick={handleStartSession}
            >
              Start workout
            </Button>
            {selected.source === "user" && (
              <Button
                variant="ghost"
                size="sm"
                iconLeft="Trash2"
                onClick={() => {
                  remove(sw.id);
                  setPhase("list");
                }}
              >
                Delete saved workout
              </Button>
            )}
          </div>
        </div>
      </Screen>
    );
  }

  /* ---- List -------------------------------------------------------------- */
  return (
    <Screen>
      <div className="saved-list">
        <h1 className="saved-list__title">Saved workouts</h1>

        {/* User saved section */}
        <section className="saved-list__section">
          <h2 className="saved-list__section-heading">
            <Icon name="Heart" size={14} /> Your saved
          </h2>
          {saved.length === 0 ? (
            <div className="saved-list__empty">
              <p className="saved-list__empty-text">Nothing saved yet.</p>
              {onGoToWorkout && (
                <button
                  type="button"
                  className="saved-list__generate-link"
                  onClick={onGoToWorkout}
                >
                  Generate a workout <Icon name="ArrowRight" size={14} />
                </button>
              )}
            </div>
          ) : (
            <ul className="saved-list__items">
              {saved.map((sw) => (
                <WorkoutListItem
                  key={sw.id}
                  item={sw}
                  source="user"
                  onSelect={handleSelect}
                />
              ))}
            </ul>
          )}
        </section>

        <hr className="saved-list__divider" />

        {/* App workouts section */}
        <section className="saved-list__section">
          <h2 className="saved-list__section-heading">
            <Icon name="Sparkles" size={14} /> Our Selection
          </h2>
          <ul className="saved-list__items">
            {APP_WORKOUTS.map((sw) => (
              <WorkoutListItem
                key={sw.id}
                item={sw}
                source="app"
                onSelect={handleSelect}
              />
            ))}
          </ul>
        </section>
      </div>
    </Screen>
  );
}

function WorkoutListItem({
  item,
  source,
  onSelect,
}: {
  item: SavedWorkout;
  source: Source;
  onSelect: (item: SavedWorkout, source: Source) => void;
}) {
  return (
    <li>
      <button
        type="button"
        className="saved-list__item"
        onClick={() => onSelect(item, source)}
      >
        <div className="saved-list__item-icon">
          <Icon name={source === "user" ? "Heart" : "Sparkles"} size={18} />
        </div>
        <div className="saved-list__item-body">
          <span className="saved-list__item-name">{item.name}</span>
          <span className="saved-list__item-meta">
            {item.workout.estMinutes} min · {item.workout.exercises.length} exercises
          </span>
        </div>
        <Icon name="ChevronRight" size={18} className="saved-list__item-arrow" />
      </button>
    </li>
  );
}
