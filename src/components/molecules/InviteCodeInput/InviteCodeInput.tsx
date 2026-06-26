import { useState, useRef } from "react";
import { cn } from "@/lib/cn";
import "./InviteCodeInput.css";

interface InviteCodeInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  className?: string;
}

export function InviteCodeInput({ value, onChange, length = 8, className }: InviteCodeInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const displayChars = value.padEnd(length, " ").split("");

  return (
    <div
      className={cn("invite-code", focused && "invite-code--focused", className)}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="text"
        className="invite-code__hidden-input"
        value={value}
        onChange={(e) => {
          const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
          onChange(raw.slice(0, length));
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={length}
        autoComplete="off"
        spellCheck="false"
      />
      
      <div className="invite-code__display">
        {displayChars.map((char, i) => (
          <div key={i} className={cn("invite-code__char", char !== " " && "invite-code__char--filled", value.length === i && focused && "invite-code__char--cursor")}>
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}
