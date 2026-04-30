import { useState, useEffect, ReactNode } from "react";
import CommandBar, { GeneratedCopy } from "./components/CommandBar";
import OutputCard from "./components/OutputCard";

// ──────────────────────────────────────────────────────────────────────
// Layout primitives — keep these inline; they match the existing
// minified bundle 1:1 (Td/Ld/jd/Rd/Od/Md/Id/Dd/Ad/Vd) so the rest of
// the visual system keeps working unchanged.
// ──────────────────────────────────────────────────────────────────────

type Mode = "sohne" | "terminal";

function Frame({ mode, children }: { mode: Mode; children: ReactNode }) {
  return (
    <div className="tbb-frame" data-mode={mode}>
      {children}
    </div>
  );
}

const Lights = () => <div className="tbb-lights" aria-hidden />;
const Grain = () => <div className="tbb-grain" aria-hidden />;
const Grid = () => <div className="tbb-grid" aria-hidden />;
const Marquee = () => (
  <div className="tbb-marquee" aria-hidden>
    THE BLACK BOX
  </div>
);

function Brand({ scene = 4, total = 9 }: { scene?: number; total?: number }) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="tbb-brand">
      <span className="mark">the black box.</span>
      <span className="sep">·</span>
      <span className="scn">
        SCN <span className="num">{pad(scene)} / {pad(total)}</span>
      </span>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
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

function SessionClock() {
  const [t, setT] = useState(56537);
  useEffect(() => {
    const id = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return (
    <div className="tbb-hud" style={{ top: 32, right: 32, textAlign: "right" }}>
      SESSION <span className="num">{pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
}

const RAIL_TICKS = [
  { num: "01", label: "HOOK", top: "8%" },
  { num: "02", label: "PROBLEM", top: "22%" },
  { num: "03", label: "METHOD", top: "36%" },
  { num: "04", label: "RECEIPTS", top: "50%" },
  { num: "05", label: "SYSTEM", top: "64%" },
  { num: "06", label: "CTA", top: "78%" },
  { num: "07", label: "END", top: "92%" },
];

function Rail({ active = 4 }: { active?: number }) {
  return (
    <div className="tbb-rail">
      <div className="axis" />
      {RAIL_TICKS.map((t, i) => {
        const on = i + 1 === active;
        return (
          <div
            key={t.num}
            className={on ? "tick on" : "tick"}
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

function FootHud({ mode }: { mode: Mode }) {
  const fontLabel = mode === "terminal" ? "TERMINAL CODE" : "SOHNE BREIT EXTRAFETT";
  return (
    <>
      <div className="tbb-hud" style={{ bottom: 22, left: 28 }}>
        FONT <span className="num">{fontLabel}</span>
      </div>
      <div className="tbb-hud" style={{ bottom: 22, right: 28, textAlign: "right" }}>
        CANON <span className="num">ATLAS · #C9A961</span>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// App — owns the generated-copy state and threads it down.
// ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<Mode>("sohne");
  const [copy, setCopy] = useState<GeneratedCopy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <Frame mode={mode}>
      <Lights />
      <Grain />
      <Grid />
      <Marquee />
      <Brand scene={4} total={9} />
      <ModeToggle mode={mode} onChange={setMode} />
      <SessionClock />
      <OutputCard
        mode={mode}
        headline={copy?.headline}
        caption={copy?.caption}
        eyebrow={copy?.eyebrow}
        loading={loading}
        error={error}
      />
      <Rail active={4} />
      <CommandBar
        onResult={(c) => {
          setCopy(c);
          setError("");
        }}
        onError={setError}
        onLoadingChange={setLoading}
        loading={loading}
      />
      <FootHud mode={mode} />
    </Frame>
  );
}
