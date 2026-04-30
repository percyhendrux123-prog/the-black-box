interface Tick {
  num: string;
  label: string;
  top: string;
}

const TICKS: Tick[] = [
  { num: "01", label: "HOOK", top: "8%" },
  { num: "02", label: "PROBLEM", top: "22%" },
  { num: "03", label: "METHOD", top: "36%" },
  { num: "04", label: "RECEIPTS", top: "50%" },
  { num: "05", label: "SYSTEM", top: "64%" },
  { num: "06", label: "CTA", top: "78%" },
  { num: "07", label: "END", top: "92%" },
];

interface TimecodeRailProps {
  active?: number; // 1-indexed scene number
}

/**
 * Right-edge scene rail — 7 ticks + red-orange playhead at the active scene.
 */
export default function TimecodeRail({ active = 4 }: TimecodeRailProps) {
  return (
    <div className="tbb-rail">
      <div className="axis" />
      {TICKS.map((t, i) => {
        const isActive = i + 1 === active;
        return (
          <div
            key={t.num}
            className={isActive ? "tick on" : "tick"}
            style={{ top: t.top }}
          >
            {t.num}
            <span className="label">{t.label}</span>
          </div>
        );
      })}
      <div className="tbb-play" />
    </div>
  );
}
