export type Mode = "sohne" | "terminal";

export type Slide = {
  beat: string;
  headline: string;
  caption: string;
  eyebrow: string;
};

export type CarouselResponse = {
  slides: Slide[];
};

export const CANON_5_BEATS = ["HOOK", "TENSION", "MECHANISM", "SHIFT", "DOOR"] as const;
export const CANON_7_BEATS = ["HOOK", "PROBLEM", "METHOD", "RECEIPTS", "SYSTEM", "CTA", "END"] as const;
export const CANON_10_BEATS = ["HOOK", "STAKES", "TENSION", "FRICTION", "MECHANISM", "PROOF", "SHIFT", "SYSTEM", "CTA", "DOOR"] as const;

export function beatsForCount(n: number): readonly string[] {
  if (n <= 5) return CANON_5_BEATS.slice(0, n);
  if (n <= 7) return CANON_7_BEATS.slice(0, n);
  return CANON_10_BEATS.slice(0, n);
}
