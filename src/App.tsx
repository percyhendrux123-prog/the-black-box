import { useState, useEffect, ReactNode } from "react";
import CommandBar from "./components/CommandBar";
import OutputCard from "./components/OutputCard";
import SlideNav from "./components/SlideNav";
import type { Mode, Slide } from "./types";
import { beatsForCount } from "./types";

// ──────────────────────────────────────────────────────────────────────
// Layout primitives — keep these inline; they match the existing
// minified bundle 1:1 (Td/Ld/jd/Rd/Od/Md/Id/Dd/Ad/Vd) so the rest of
// the visual system keeps working unchanged.
// ──────────────────────────────────────────────────────────────────────

// look-better 2026-05-01: tailwind migration — Frame chrome is utilities;
// only the radial-gradient bg lives in .tbb-frame (index.css).
function Frame({ mode, children }: { mode: Mode; children: ReactNode }) {
  return (
    <div
      className="tbb-frame relative w-full max-w-[1280px] aspect-[16/10] rounded-xl overflow-hidden border border-[#1a1a1a] isolate [transition:background_0.5s_ease]"
      data-mode={mode}
    >
      {children}
    </div>
  );
}

// look-better 2026-05-01: tailwind migration — Lights / Grain / Grid layers
const Lights = () => (
  <div
    className="tbb-lights absolute inset-0 z-[1] pointer-events-none [transition:opacity_0.5s_ease,filter_0.5s_ease]"
    aria-hidden
  />
);
const Grain = () => (
  <div
    className="tbb-grain absolute inset-0 z-[2] pointer-events-none opacity-[0.045] mix-blend-overlay bg-[length:240px_240px] [transition:opacity_0.5s_ease]"
    aria-hidden
  />
);
const Grid = () => (
  <div
    className="tbb-grid absolute inset-0 z-[3] pointer-events-none opacity-0 [transition:opacity_0.45s_ease]"
    aria-hidden
  />
);

// look-better 2026-05-01: tailwind migration — Whisper marquee
const Marquee = () => (
  <div
    className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden whitespace-nowrap font-sans text-[clamp(120px,15vw,220px)] font-black leading-none tracking-[-0.04em] text-white/[0.012] uppercase select-none mix-blend-screen z-[2] text-center"
    aria-hidden
  >
    THE BLACK BOX
  </div>
);

// look-better 2026-05-01: tailwind migration — Brand bug
// (.mark stays as a marker class; terminal-mode font swap targets it via
// attribute selector in index.css.)
function Brand({ scene = 4, total = 9 }: { scene?: number; total?: number }) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="absolute top-8 left-8 z-[5] flex items-baseline gap-3 leading-none">
      <span className="mark font-sans font-extrabold text-[17px] tracking-[-0.02em] text-bone/70 [transition:font-family_0.3s_ease,font-weight_0.3s_ease,letter-spacing_0.3s_ease,font-size_0.3s_ease]">
        the black box.
      </span>
      <span className="font-mono text-[11px] text-bone/[0.28]">·</span>
      <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone/[0.45]">
        SCN <span className="text-bone/[0.72]">{pad(scene)} / {pad(total)}</span>
      </span>
    </div>
  );
}

// look-better 2026-05-01: tailwind migration — Mode toggle pill
function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const base =
    "border-none px-4 py-[7px] font-mono text-[10px] tracking-[0.14em] uppercase cursor-pointer transition-all duration-200";
  const active = "bg-canon text-[#0a0a0a]";
  const inactive = "bg-transparent text-bone/60";
  return (
    <div className="flex bg-white/[0.035] border border-canon/[0.22] rounded-[20px] overflow-hidden backdrop-blur-[20px] backdrop-saturate-[1.8]">
      <button
        className={`${base} ${mode === "sohne" ? active : inactive}`}
        onClick={() => onChange("sohne")}
        aria-pressed={mode === "sohne"}
      >
        SOHNE BREIT
      </button>
      <button
        className={`${base} ${mode === "terminal" ? active : inactive}`}
        onClick={() => onChange("terminal")}
        aria-pressed={mode === "terminal"}
      >
        TERMINAL
      </button>
    </div>
  );
}

// New: count toggle pill — 5 / 7 / 10. Matches ModeToggle styling.
function CountToggle({ count, onChange }: { count: number; onChange: (n: number) => void }) {
  const base =
    "border-none px-4 py-[7px] font-mono text-[10px] tracking-[0.14em] uppercase cursor-pointer transition-all duration-200";
  const active = "bg-canon text-[#0a0a0a]";
  const inactive = "bg-transparent text-bone/60";
  const opts = [5, 7, 10] as const;
  return (
    <div className="flex bg-white/[0.035] border border-canon/[0.22] rounded-[20px] overflow-hidden backdrop-blur-[20px] backdrop-saturate-[1.8]">
      {opts.map((n) => (
        <button
          key={n}
          className={`${base} ${count === n ? active : inactive}`}
          onClick={() => onChange(n)}
          aria-pressed={count === n}
          aria-label={`${n} slides`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

// Wraps ModeToggle + CountToggle into a single centered top cluster so
// both pills sit on the top edge without overlapping the brand bug.
function TopControls({
  mode,
  onModeChange,
  count,
  onCountChange,
}: {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  count: number;
  onCountChange: (n: number) => void;
}) {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[5] flex items-center gap-3">
      <ModeToggle mode={mode} onChange={onModeChange} />
      <CountToggle count={count} onChange={onCountChange} />
    </div>
  );
}

// look-better 2026-05-01: tailwind migration — Session HUD clock
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
    <div className="absolute top-8 right-8 text-right font-mono text-[11px] tracking-[0.18em] uppercase text-bone/[0.32] z-[5]">
      SESSION <span className="text-bone/[0.72]">{pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
}

// look-better 2026-05-01: tailwind migration — Timecode rail.
// `.tick` and `.on` stay as marker classes for the ::after pseudo defined
// in index.css (which grows the right-edge dash on the active tick).
//
// New: rail is now parametric — it accepts `beats` + `activeBeat` and
// interpolates tick top% evenly between 8% and 92%. The flare cap chases
// the active tick with a 0.25s ease.
function Rail({
  beats,
  activeBeat,
}: {
  beats: readonly string[];
  activeBeat: string;
}) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const n = beats.length;
  const top = (i: number) => {
    if (n <= 1) return 50;
    return 8 + ((92 - 8) * i) / (n - 1);
  };
  const activeIdx = Math.max(
    0,
    beats.findIndex((b) => b === activeBeat),
  );
  const flareTop = beats.length > 0 ? top(activeIdx) : 50;
  return (
    <div className="tbb-rail absolute right-8 top-1/2 -translate-y-1/2 h-[62%] w-[130px] pointer-events-none z-[5]">
      <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10" />
      {beats.map((label, i) => {
        const on = i === activeIdx;
        const num = pad(i + 1);
        return (
          <div
            key={`${num}-${label}`}
            className={`tick${on ? " on" : ""} absolute right-0 -translate-y-1/2 font-mono text-[9px] tracking-[0.18em] uppercase pr-4 text-right w-full leading-[1.4] ${on ? "text-bone" : "text-bone/[0.32]"}`}
            style={{ top: `${top(i)}%` }}
          >
            {num}
            <span className={`block text-[8px] mt-[3px] tracking-[0.16em] ${on ? "text-bone/70" : "text-bone/[0.28]"}`}>
              {label}
            </span>
          </div>
        );
      })}
      <div
        className="absolute right-0 w-[22px] h-px bg-flare shadow-[0_0_12px_rgba(255,84,54,0.8)] -translate-y-1/2 [transition:top_0.25s_ease]"
        style={{ top: `${flareTop}%` }}
      />
    </div>
  );
}

// look-better 2026-05-01: tailwind migration — Foot HUD
function FootHud({ mode }: { mode: Mode }) {
  const fontLabel = mode === "terminal" ? "TERMINAL CODE" : "SOHNE BREIT EXTRAFETT";
  return (
    <>
      <div className="absolute bottom-[22px] left-[28px] font-mono text-[11px] tracking-[0.18em] uppercase text-bone/[0.32] z-[5]">
        FONT <span className="text-bone/[0.72]">{fontLabel}</span>
      </div>
      <div className="absolute bottom-[22px] right-[28px] text-right font-mono text-[11px] tracking-[0.18em] uppercase text-bone/[0.32] z-[5]">
        CANON <span className="text-bone/[0.72]">ATLAS · #C9A961</span>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// App — owns the generated-copy state and threads it down.
// ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<Mode>("sohne");
  const [count, setCount] = useState<number>(5);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const beats = beatsForCount(count);

  const activeBeat =
    slides.length > 0 && currentIndex < slides.length
      ? slides[currentIndex].beat
      : beats[0] ?? "";

  const sceneNum = slides.length > 0 ? currentIndex + 1 : 0;
  const totalNum = slides.length;

  const handleCountChange = (n: number) => {
    if (n === count) return;
    setCount(n);
    // Changing count invalidates the prior carousel — it was generated
    // for a different beat list.
    setSlides([]);
    setCurrentIndex(0);
    setError("");
  };

  const handleResult = (next: Slide[]) => {
    setSlides(next);
    setCurrentIndex(0);
    setError("");
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setCurrentIndex((i) => Math.min(slides.length - 1, i + 1));

  return (
    <Frame mode={mode}>
      <Lights />
      <Grain />
      <Grid />
      <Marquee />
      <Brand scene={sceneNum} total={totalNum} />
      <TopControls
        mode={mode}
        onModeChange={setMode}
        count={count}
        onCountChange={handleCountChange}
      />
      <SessionClock />
      <OutputCard
        mode={mode}
        slides={slides}
        currentIndex={currentIndex}
        loading={loading}
        error={error}
      />
      <Rail beats={beats} activeBeat={activeBeat} />
      <SlideNav
        current={currentIndex}
        total={slides.length}
        onPrev={goPrev}
        onNext={goNext}
      />
      <CommandBar
        onResult={handleResult}
        onError={setError}
        onLoadingChange={setLoading}
        loading={loading}
        count={count}
        beats={beats}
      />
      <FootHud mode={mode} />
    </Frame>
  );
}
