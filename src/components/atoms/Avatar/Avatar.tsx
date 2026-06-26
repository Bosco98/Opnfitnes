import { cn } from "@/lib/cn";
import "./Avatar.css";

interface AvatarProps {
  initials: string;
  color: string; // OKLCH hue 0-360
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  outline?: boolean;
}

export function Avatar({
  initials,
  color,
  size = "md",
  className,
  style,
  outline = false,
}: AvatarProps) {
  return (
    <div
      className={cn(
        "avatar",
        `avatar--${size}`,
        outline && "avatar--outline",
        className
      )}
      style={{ "--hue": color, ...style } as React.CSSProperties}
      aria-hidden="true"
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
