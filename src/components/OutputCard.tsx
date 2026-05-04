import { Fragment } from "react";
import type { Mode, Slide } from "../types";

type Props = {
  mode: Mode;
  slides: Slide[];
  currentIndex: number;
  loading: boolean;
  error: string;
};

const DEFAULT_HEADLINE_LINES = ["It works.", "Every time."];
const DEFAULT_CAPTION = "312 clients · 12 weeks · the data";
const DEFAULT_EYEBROW = "— SCENE 04 / RECEIPTS";

/**
 * Splits a generated headline into up to two lines.
 * Prefers an explicit "\n", then ". ", then a midpoint word break.
 */
function splitHeadline(h: string): [string, string] {
  if (h.includes("\n")) {
    const [a, ...rest] = h.split("\n");
    return [a.trim(), rest.join(" ").trim()];
  }
  // look-better 2026-05-01: skip periods that are part of an initial/title
  // (Mr., Dr., St., U., J. Smith) so headlines don't break mid-name.
  const periodSplit = h.match(/^(.+?(?<![A-Z][a-z]?)\.)\s+(.+)$/);
  if (periodSplit) return [periodSplit[1].trim(), periodSplit[2].trim()];
  const words = h.split(/\s+/);
  if (words.length <= 3) return [h.trim(), ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export default function OutputCard({
  mode,
  slides,
  currentIndex,
  loading,
  error,
}: Props) {
  const slide: Slide | undefined =
    slides.length > 0 ? slides[Math.min(Math.max(currentIndex, 0), slides.length - 1)] : undefined;

  const [line1, line2] = slide
    ? splitHeadline(slide.headline)
    : [DEFAULT_HEADLINE_LINES[0], DEFAULT_HEADLINE_LINES[1]];

  // Error replaces eyebrow; existing card content stays.
  const eyebrowText = error
    ? `! ${error.toUpperCase()}`
    : slide
      ? `— ${slide.eyebrow.toUpperCase()}`
      : DEFAULT_EYEBROW;

  const captionText = slide ? slide.caption : DEFAULT_CAPTION;

  return (
    // look-better 2026-05-01: tailwind migration — stage + card chrome on
    // utilities; .tbb-canvas-card keeps the radial bg + 3-stack shadow,
    // .tbb-headline keeps the terminal-mode font swap, .tbb-progress keeps
    // the bottom-edge animation. Eyebrow error color uses the data-attr
    // arbitrary variant.
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[76%] aspect-[4/5] z-[4]">
      <div
        className="tbb-canvas-card absolute inset-0 rounded-[14px] py-[44px] px-10 flex flex-col justify-between text-[#0a0a0a]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="font-mono text-[11px] tracking-[0.24em] uppercase text-black/50 data-[error=1]:text-[#c0392b]"
          data-error={error ? "1" : undefined}
        >
          {eyebrowText}
        </div>

        <div>
          <div className="tbb-headline font-sans font-extrabold text-[clamp(44px,5.2vw,76px)] leading-[0.95] tracking-[-0.04em] text-[#0a0a0a] [transition:font-size_0.3s_ease]">
            {mode === "terminal" ? (
              <Fragment>
                <span>{line1.replace(/\.$/, "")}</span>
                <span className="text-canon">.</span>
                {line2 && (
                  <>
                    <br />
                    <span>{line2.replace(/\.$/, "")}</span>
                    <span className="text-canon">.</span>
                  </>
                )}
              </Fragment>
            ) : (
              <Fragment>
                {line1}
                {line2 && (
                  <>
                    <br />
                    {line2}
                  </>
                )}
              </Fragment>
            )}
          </div>
          <div className="mt-3.5 font-mono text-[11px] tracking-[0.18em] uppercase text-black/[0.45]">
            {captionText}
          </div>
        </div>

        <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-black/[0.55] flex justify-between">
          <span>BLACK BOX // 04</span>
          <span>v1.0 — atlas</span>
        </div>

        {loading && (
          <div className="tbb-progress absolute left-0 right-0 bottom-0 h-0.5" aria-hidden />
        )}
      </div>
    </div>
  );
}
