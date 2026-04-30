import type { Mode } from "../types";

interface OutputCardProps {
  mode: Mode;
}

/**
 * The 4:5 OUTPUT card — the "render-here" stage.
 * For v1 the content is hardcoded to the locked mockup copy:
 *   eyebrow "— SCENE 04 / RECEIPTS"
 *   headline "It works. / Every time."
 *   caption "312 clients · 12 weeks · the data"
 *   footer "BLACK BOX // 04"  +  "v1.0 — atlas"
 *
 * In Terminal mode the headline switches to JetBrains Mono and the
 * sentence-ending periods accent in canon-gold (#C9A961).
 */
export default function OutputCard({ mode }: OutputCardProps) {
  return (
    <div className="tbb-stage">
      <div className="tbb-canvas-card">
        <div className="tbb-eyebrow">— SCENE 04 / RECEIPTS</div>
        <div>
          <div className="tbb-headline">
            {mode === "terminal" ? (
              <>
                <span style={{ color: "#0a0a0a" }}>It works</span>
                <span className="accent">.</span>
                <br />
                <span style={{ color: "#0a0a0a" }}>Every time</span>
                <span className="accent">.</span>
              </>
            ) : (
              <>
                It works.
                <br />
                Every time.
              </>
            )}
          </div>
          <div className="tbb-caption">312 clients · 12 weeks · the data</div>
        </div>
        <div className="tbb-canvas-foot">
          <span>BLACK BOX // 04</span>
          <span>v1.0 — atlas</span>
        </div>
      </div>
    </div>
  );
}
