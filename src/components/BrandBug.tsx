interface BrandBugProps {
  scene?: number;
  total?: number;
}

/**
 * Top-left channel/studio mark: "the black box. · SCN 04 / 09".
 * Söhne Breit Extrafett stand-in (Inter 800) in Sohne mode,
 * JetBrains Mono in Terminal mode — switched via parent data-mode.
 */
export default function BrandBug({ scene = 4, total = 9 }: BrandBugProps) {
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
