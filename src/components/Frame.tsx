import type { ReactNode } from "react";
import type { Mode } from "../types";

interface FrameProps {
  mode: Mode;
  children: ReactNode;
}

/**
 * Outermost dark stage container.
 * Holds the 16:10 aspect, the radial-gradient background, and exposes
 * `data-mode` so descendant layers can react via CSS attribute selectors.
 */
export default function Frame({ mode, children }: FrameProps) {
  return (
    <div className="tbb-frame" data-mode={mode}>
      {children}
    </div>
  );
}
