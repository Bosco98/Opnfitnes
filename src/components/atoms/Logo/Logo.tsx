import "./Logo.css";

export interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

/** Brand mark: a blueprint-style "pulse" glyph + wordmark. Pure SVG. */
export function Logo({ size = 28, withWordmark = true }: LogoProps) {
  return (
    <span className="logo">
      <svg
        className="logo__mark"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
      >
        <rect
          x="1.25"
          y="1.25"
          width="29.5"
          height="29.5"
          rx="8"
          stroke="var(--accent)"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <path
          d="M5 17h4l2.5-7 4 13 3-9 2 3h6.5"
          stroke="var(--accent)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span className="logo__word">
          Opn<span className="logo__word-accent">Fitnes</span>
        </span>
      )}
    </span>
  );
}
