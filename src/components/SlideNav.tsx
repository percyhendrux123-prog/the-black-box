import { useEffect, useCallback } from "react";

type Props = {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

const pad = (n: number) => n.toString().padStart(2, "0");

export default function SlideNav({ current, total, onPrev, onNext }: Props) {
  const atStart = current <= 0;
  const atEnd = total === 0 || current >= total - 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      if (e.key === "ArrowLeft") {
        if (!atStart) {
          e.preventDefault();
          onPrev();
        }
      } else if (e.key === "ArrowRight") {
        if (!atEnd) {
          e.preventDefault();
          onNext();
        }
      }
    },
    [atStart, atEnd, onPrev, onNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // atlas-mood: cream #F5F1E8 = `bone`, mono, hairline canon/[0.32] borders,
  // hover canon/[0.6]. ≥44px tap targets. Centered, bottom-[100px].
  const baseBtn =
    "min-w-[44px] min-h-[44px] flex items-center justify-center bg-transparent border border-canon/[0.32] rounded-md font-mono text-[14px] text-bone cursor-pointer [transition:border-color_0.18s_ease,color_0.18s_ease,background_0.18s_ease] hover:border-canon/[0.6] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-canon/[0.32]";

  return (
    <nav
      className="absolute bottom-[100px] left-1/2 -translate-x-1/2 z-[5] flex items-center gap-3"
      aria-label="Slide navigation"
    >
      <button
        type="button"
        className={baseBtn}
        onClick={onPrev}
        disabled={atStart}
        aria-label="Previous slide"
      >
        ←
      </button>
      <span
        className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone/[0.55] min-w-[60px] text-center"
        aria-live="polite"
      >
        {pad(total === 0 ? 0 : current + 1)} / {pad(total)}
      </span>
      <button
        type="button"
        className={baseBtn}
        onClick={onNext}
        disabled={atEnd}
        aria-label="Next slide"
      >
        →
      </button>
    </nav>
  );
}
