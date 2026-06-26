import { Button } from "@/components/atoms";
import "./StepNav.css";

export interface StepNavProps {
  onPrev?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showPrev?: boolean;
  /** hint shown above the buttons, e.g. "Pick at least one" */
  hint?: string;
}

/** Sticky previous / next footer for the wizard. */
export function StepNav({
  onPrev,
  onNext,
  nextLabel = "Next",
  nextDisabled = false,
  showPrev = true,
  hint,
}: StepNavProps) {
  return (
    <div className="step-nav">
      {hint && <p className="step-nav__hint">{hint}</p>}
      <div className="step-nav__row">
        {showPrev && (
          <Button
            variant="secondary"
            size="lg"
            iconLeft="ArrowLeft"
            onClick={onPrev}
          >
            Back
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          iconRight="ArrowRight"
          fullWidth
          disabled={nextDisabled}
          onClick={onNext}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
