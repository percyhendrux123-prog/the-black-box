import { useState } from "react";

interface CommandBarProps {
  onFire?: (prompt: string) => void;
}

/**
 * Bottom command bar — glass-blur input with FIRE button.
 *
 * v1: FIRE doesn't fire anything. Hover/click animate the button (scale + warm tint).
 * The Gemini wire is the next task.
 */
export default function CommandBar({ onFire }: CommandBarProps) {
  const [value, setValue] = useState("");

  const fire = () => {
    if (onFire) onFire(value);
    // No-op for v1 otherwise.
  };

  return (
    <form
      className="tbb-cmd"
      onSubmit={(e) => {
        e.preventDefault();
        fire();
      }}
    >
      <span className="arrow" aria-hidden>
        ▸
      </span>
      <input
        className="text"
        type="text"
        placeholder="describe the carousel you want to make…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Carousel prompt"
      />
      <button type="submit" className="fire">
        FIRE ↗
      </button>
    </form>
  );
}
