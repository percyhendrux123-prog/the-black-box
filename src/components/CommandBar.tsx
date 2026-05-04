import { useState, FormEvent } from "react";
import type { Slide } from "../types";
import { beatsForCount } from "../types";

type Props = {
  onResult: (slides: Slide[]) => void;
  onError: (msg: string) => void;
  onLoadingChange: (loading: boolean) => void;
  loading: boolean;
  count: number;
  beats?: readonly string[];
};

export default function CommandBar({
  onResult,
  onError,
  onLoadingChange,
  loading,
  count,
  beats,
}: Props) {
  const [value, setValue] = useState("");

  const fire = async () => {
    const prompt = value.trim();
    if (!prompt || loading) return;

    onLoadingChange(true);
    onError("");

    const finalBeats = beats && beats.length > 0 ? [...beats] : [...beatsForCount(count)];

    try {
      const res = await fetch("/.netlify/functions/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, count, beats: finalBeats }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        onError(data?.error || `Request failed (${res.status})`);
        return;
      }

      if (!Array.isArray(data?.slides) || data.slides.length === 0) {
        onError("Bad response shape");
        return;
      }

      const valid = data.slides.every(
        (s: unknown) =>
          typeof s === "object" &&
          s !== null &&
          typeof (s as Slide).beat === "string" &&
          (s as Slide).beat.length > 0 &&
          typeof (s as Slide).headline === "string" &&
          (s as Slide).headline.length > 0 &&
          typeof (s as Slide).caption === "string" &&
          (s as Slide).caption.length > 0 &&
          typeof (s as Slide).eyebrow === "string" &&
          (s as Slide).eyebrow.length > 0,
      );

      if (!valid) {
        onError("Bad response shape");
        return;
      }

      const slides: Slide[] = data.slides.map((s: Slide) => ({
        beat: String(s.beat),
        headline: String(s.headline),
        caption: String(s.caption),
        eyebrow: String(s.eyebrow),
      }));

      onResult(slides);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      onError(msg);
    } finally {
      onLoadingChange(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    fire();
  };

  return (
    // look-better 2026-05-01: tailwind migration — command bar chrome on
    // utilities; .fire-loading remains the animation hook in index.css.
    <form
      className="absolute bottom-11 left-1/2 -translate-x-1/2 w-[58%] bg-[rgba(20,18,20,0.5)] border border-canon/[0.28] rounded-[10px] py-[14px] px-[18px] flex items-center gap-3 backdrop-blur-xl backdrop-saturate-[1.8] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] z-[5] [transition:background_0.25s_ease,border-color_0.25s_ease,transform_0.25s_ease]"
      onSubmit={onSubmit}
    >
      <span className="font-mono text-[14px] text-canon/90" aria-hidden>
        ▸
      </span>
      <input
        className="flex-1 font-sans text-sm text-bone/[0.55] bg-transparent border-none outline-none placeholder:text-bone/[0.45]"
        type="text"
        placeholder="describe the carousel you want to make…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Carousel prompt"
        disabled={loading}
      />
      <button
        type="submit"
        className={`bg-canon text-[#0a0a0a] py-[6px] px-[14px] rounded-md font-mono text-[10px] tracking-[0.12em] uppercase cursor-pointer border-none [transition:background_0.18s_ease,transform_0.18s_ease] hover:bg-canon-warm hover:scale-[1.03] active:scale-[0.98]${loading ? " fire-loading" : ""}`}
        disabled={loading || !value.trim()}
        aria-busy={loading}
      >
        {loading ? "FIRING…" : "FIRE ↗"}
      </button>
    </form>
  );
}
