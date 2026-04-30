import { Fragment } from "react";

type Props = {
  mode: "sohne" | "terminal";
  headline?: string;
  caption?: string;
  eyebrow?: string;
  loading?: boolean;
  error?: string;
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
  const periodSplit = h.match(/^(.+?\.)\s+(.+)$/);
  if (periodSplit) return [periodSplit[1].trim(), periodSplit[2].trim()];
  const words = h.split(/\s+/);
  if (words.length <= 3) return [h.trim(), ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export default function OutputCard({
  mode,
  headline,
  caption,
  eyebrow,
  loading = false,
  error = "",
}: Props) {
  const [line1, line2] = headline
    ? splitHeadline(headline)
    : [DEFAULT_HEADLINE_LINES[0], DEFAULT_HEADLINE_LINES[1]];

  // Error replaces eyebrow; existing card content stays.
  const eyebrowText = error
    ? `! ${error.toUpperCase()}`
    : eyebrow
      ? `— ${eyebrow.toUpperCase()}`
      : DEFAULT_EYEBROW;

  const captionText = caption || DEFAULT_CAPTION;

  return (
    <div className="tbb-stage">
      <div className="tbb-canvas-card">
        <div className="tbb-eyebrow" data-error={error ? "1" : undefined}>
          {eyebrowText}
        </div>

        <div>
          <div className="tbb-headline">
            {mode === "terminal" ? (
              <Fragment>
                <span style={{ color: "#0a0a0a" }}>{line1.replace(/\.$/, "")}</span>
                <span className="accent">.</span>
                {line2 && (
                  <>
                    <br />
                    <span style={{ color: "#0a0a0a" }}>{line2.replace(/\.$/, "")}</span>
                    <span className="accent">.</span>
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
          <div className="tbb-caption">{captionText}</div>
        </div>

        <div className="tbb-canvas-foot">
          <span>BLACK BOX // 04</span>
          <span>v1.0 — atlas</span>
        </div>

        {loading && <div className="tbb-progress" aria-hidden />}
      </div>
    </div>
  );
}
