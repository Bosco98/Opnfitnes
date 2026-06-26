import "./StepHeader.css";

export interface StepHeaderProps {
  step: number; // 1-based
  total: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

/** Wizard screen header: progress segments + the step's title/subtitle. */
export function StepHeader({
  step,
  total,
  eyebrow,
  title,
  subtitle,
}: StepHeaderProps) {
  return (
    <header className="step-header">
      <div
        className="step-header__progress"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${step} of ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              "step-header__seg" +
              (i < step ? " step-header__seg--done" : "")
            }
          />
        ))}
      </div>
      <div className="step-header__meta num">
        {eyebrow} · {step}/{total}
      </div>
      <h1 className="step-header__title">{title}</h1>
      {subtitle && <p className="step-header__sub">{subtitle}</p>}
    </header>
  );
}
