import type { Mode } from "../types";

interface CornerHUDProps {
  mode: Mode;
}

/**
 * Bottom-corner HUD readouts:
 *   bottom-left:  FONT <name>
 *   bottom-right: CANON ATLAS · #C9A961
 */
export default function CornerHUD({ mode }: CornerHUDProps) {
  const fontLabel = mode === "terminal" ? "TERMINAL CODE" : "SOHNE BREIT EXTRAFETT";
  return (
    <>
      <div className="tbb-hud" style={{ bottom: 22, left: 28 }}>
        FONT <span className="num">{fontLabel}</span>
      </div>
      <div
        className="tbb-hud"
        style={{ bottom: 22, right: 28, textAlign: "right" }}
      >
        CANON <span className="num">ATLAS · #C9A961</span>
      </div>
    </>
  );
}
