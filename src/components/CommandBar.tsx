import { useState, FormEvent } from "react";

export type GeneratedCopy = {
  headline: string;
  caption: string;
  eyebrow: string;
};

type Props = {
  onResult: (copy: GeneratedCopy) => void;
  onError: (msg: string) => void;
  onLoadingChange: (loading: boolean) => void;
  loading: boolean;
};

export default function CommandBar({
  onResult,
  onError,
  onLoadingChange,
  loading,
}: Props) {
  const [value, setValue] = useState("");

  const fire = async () => {
    const prompt = value.trim();
    if (!prompt || loading) return;

    onLoadingChange(true);
    onError("");

    try {
      const res = await fetch("/.netlify/functions/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        onError(data?.error || `Request failed (${res.status})`);
        return;
      }

      if (!data?.headline || !data?.caption || !data?.eyebrow) {
        onError("Bad response shape");
        return;
      }

      onResult({
        headline: String(data.headline),
        caption: String(data.caption),
        eyebrow: String(data.eyebrow),
      });
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
    <form className="tbb-cmd" onSubmit={onSubmit}>
      <span className="arrow" aria-hidden>
        ▸
      </span>
      <input
        className="text"
        type="text"
        placeholder="describe the carousel you want to make…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Carousel prompt"
        disabled={loading}
      />
      <button
        type="submit"
        className={`fire${loading ? " fire-loading" : ""}`}
        disabled={loading || !value.trim()}
        aria-busy={loading}
      >
        {loading ? "FIRING…" : "FIRE ↗"}
      </button>
    </form>
  );
}
