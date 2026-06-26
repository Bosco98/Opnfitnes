import { Button, Icon } from "@/components/atoms";
import "./WorkoutIntro.css";

export interface WorkoutIntroProps {
  name: string;
  hasKey: boolean;
  lastWorkoutName?: string;
  onBegin: () => void;
  onLogManually: () => void;
  onTimer: () => void;
  onGoToSettings: () => void;
  onGoToSaved?: () => void;
}

/** First workout screen. Greets the user, presents three mode cards. */
export function WorkoutIntro({
  name,
  hasKey,
  lastWorkoutName,
  onBegin,
  onLogManually,
  onTimer,
  onGoToSettings,
  onGoToSaved,
}: WorkoutIntroProps) {
  return (
    <div className="intro">
      <div className="intro__glow" aria-hidden />

      <div className="intro__hero">
       
        <h1 className="intro__title">
          {name ? (
            <>
              Ready to move,
              <br />
              <span className="intro__name">{name}</span>?
            </>
          ) : (
            <>
              Your training,
              <br />
              <span className="intro__name">simplified.</span>
            </>
          )}
        </h1>

        <p className="intro__sub">
          Build AI workouts, log sessions, or run a timer — your workout at your device.
        </p>

        {lastWorkoutName && (
          <div className="intro__last">
            <Icon name="RotateCcw" size={14} />
            <span>
              Last: <strong>{lastWorkoutName}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="intro__modes">
        {onGoToSaved && (
          <button
            type="button"
            className="intro__card"
            onClick={onGoToSaved}
          >
            <div className="intro__card-icon-wrap intro__card-icon-wrap--saved">
              <Icon name="Heart" size={22} />
            </div>
            <div className="intro__card-body">
              <span className="intro__card-title">View workouts</span>
              <span className="intro__card-hint">
                View and replay your past sessions
              </span>
            </div>
            <Icon name="ArrowRight" size={18} className="intro__card-arrow" />
          </button>
        )}

        {/* Build — primary card, full width */}
        {hasKey ? (
          <button
            type="button"
            className="intro__card intro__card--build"
            onClick={onBegin}
          >
            <div className="intro__card-icon-wrap intro__card-icon-wrap--build">
              <Icon name="Sparkles" size={22} />
            </div>
            <div className="intro__card-body">
              <span className="intro__card-title">Build workout</span>
              <span className="intro__card-hint">
                AI picks exercises for your gear and goals
              </span>
            </div>
            <Icon name="ArrowRight" size={18} className="intro__card-arrow" />
          </button>
        ) : (
          <div className="intro__card intro__card--gate">
            <div className="intro__card-icon-wrap intro__card-icon-wrap--muted">
              <Icon name="KeyRound" size={22} />
            </div>
            <div className="intro__card-body">
              <span className="intro__card-title">Build workout</span>
              <span className="intro__card-hint">
                Add your OpenRouter key to start generating
              </span>
            </div>
            <Button
              variant="accent"
              size="sm"
              iconRight="ArrowRight"
              onClick={onGoToSettings}
            >
              Set up key
            </Button>
          </div>
        )}

        {/* Log + Timer — secondary cards, side by side */}
        <div className="intro__cards-row">
          <button
            type="button"
            className="intro__card intro__card--secondary"
            onClick={onLogManually}
          >
            <div className="intro__card-icon-wrap intro__card-icon-wrap--log">
              <Icon name="ListChecks" size={20} />
            </div>
            <span className="intro__card-title">Log workout</span>
            <span className="intro__card-hint">Record what you did</span>
          </button>

          <button
            type="button"
            className="intro__card intro__card--secondary"
            onClick={onTimer}
          >
            <div className="intro__card-icon-wrap intro__card-icon-wrap--timer">
              <Icon name="Timer" size={20} />
            </div>
            <span className="intro__card-title">Timer</span>
            <span className="intro__card-hint">Countdown, Tabata, Stopwatch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
