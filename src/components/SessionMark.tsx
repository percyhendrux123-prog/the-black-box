import { useEffect, useState } from "react";

/**
 * Top-right SESSION 15:42:17 — live ticking timer.
 * Starts at the mockup's anchor time and ticks forward each second so the page
 * feels alive without scaring the eye with motion.
 */
export default function SessionMark() {
  // Anchor at 15:42:17 to match the mockup, then tick from there.
  const ANCHOR = 15 * 3600 + 42 * 60 + 17;
  const [seconds, setSeconds] = useState(ANCHOR);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600) % 24;
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const stamp = `${pad(h)}:${pad(m)}:${pad(s)}`;

  return (
    <div className="tbb-hud" style={{ top: 32, right: 32, textAlign: "right" }}>
      SESSION <span className="num">{stamp}</span>
    </div>
  );
}
