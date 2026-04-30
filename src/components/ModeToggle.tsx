import type { Mode } from "../types";

interface ModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

/**
 * Top-center pill: [SOHNE BREIT | TERMINAL].
 * Glass-blur container, gold-canon active state.
 */
export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="tbb-toggle">
      <button
        className={mode === "sohne" ? "on" : ""}
        onClick={() => onChange("sohne")}
        aria-pressed={mode === "sohne"}
      >
        SOHNE BREIT
      </button>
      <button
        className={mode === "terminal" ? "on" : ""}
        onClick={() => onChange("terminal")}
        aria-pressed={mode === "terminal"}
      >
        TERMINAL
      </button>
    </div>
  );
}
