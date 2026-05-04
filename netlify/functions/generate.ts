import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Default beat sets for the carousel structure
const CANON_5_BEATS = ["HOOK", "TENSION", "MECHANISM", "SHIFT", "DOOR"] as const;
const CANON_7_BEATS = ["HOOK", "PROBLEM", "METHOD", "RECEIPTS", "SYSTEM", "CTA", "END"] as const;
const CANON_10_BEATS = ["HOOK", "STAKES", "TENSION", "FRICTION", "MECHANISM", "PROOF", "SHIFT", "SYSTEM", "CTA", "DOOR"] as const;

function defaultBeatsForCount(count: number): string[] {
  if (count <= 5) return [...CANON_5_BEATS].slice(0, count);
  if (count <= 7) return [...CANON_7_BEATS].slice(0, count);
  return [...CANON_10_BEATS].slice(0, count);
}

const buildSystemPrompt = (beats: string[]) => `You generate carousel slide copy. Return ONLY valid JSON with this exact shape, no markdown, no code fences, no commentary:
{"slides": [{"beat": string, "headline": string, "caption": string, "eyebrow": string}, ...]}

You will produce EXACTLY ${beats.length} slides, in order, with these beat tags: ${beats.join(", ")}.

Per slide:
- beat: the assigned beat name verbatim from the list above.
- headline: max 8 words, two-line punchy. Use a period or short break for line two.
- caption: one line, supporting detail (numbers, names, proof). Max 12 words.
- eyebrow: max 3 words, scene label, ALL CAPS or Title Case.

No markdown. No quotes around values beyond JSON requirement. No trailing prose.`;

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: {
    "content-type": "application/json",
    "cache-control": "no-store",
  },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "POST only" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(500, { error: "GEMINI_API_KEY is not configured on the server" });
  }

  let prompt = "";
  let count = 5;
  let beats: string[] = [];
  try {
    const parsed = JSON.parse(event.body || "{}");
    prompt = (parsed.prompt ?? "").toString().trim();
    if (typeof parsed.count === "number" && parsed.count >= 1 && parsed.count <= 10) {
      count = Math.floor(parsed.count);
    }
    if (Array.isArray(parsed.beats) && parsed.beats.every((b: unknown) => typeof b === "string" && b.length > 0)) {
      beats = parsed.beats.slice(0, 10);
    }
  } catch {
    return json(400, { error: "Body must be JSON: { prompt: string, count?: number, beats?: string[] }" });
  }

  if (!prompt) {
    return json(400, { error: "Missing 'prompt' in body" });
  }
  if (prompt.length > 4000) {
    return json(400, { error: "Prompt too long (max 4000 chars)" });
  }

  // If beats provided, beats.length wins. Otherwise use count to derive beats.
  const finalBeats = beats.length > 0 ? beats : defaultBeatsForCount(count);
  const finalCount = finalBeats.length;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: buildSystemPrompt(finalBeats),
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            slides: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  beat: { type: SchemaType.STRING },
                  headline: { type: SchemaType.STRING },
                  caption: { type: SchemaType.STRING },
                  eyebrow: { type: SchemaType.STRING },
                },
                required: ["beat", "headline", "caption", "eyebrow"],
              },
            },
          },
          required: ["slides"],
        },
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let payload: { slides?: Array<{ beat?: string; headline?: string; caption?: string; eyebrow?: string }> };
    try {
      payload = JSON.parse(cleaned);
    } catch {
      return json(502, { error: "Model returned non-JSON", raw: text.slice(0, 400) });
    }

    if (!Array.isArray(payload.slides) || payload.slides.length !== finalCount) {
      return json(502, { error: `Model returned wrong slide count (expected ${finalCount}, got ${payload.slides?.length ?? 0})`, got: payload });
    }

    const slides = payload.slides.map((s) => ({
      beat: (s.beat ?? "").toString().trim(),
      headline: (s.headline ?? "").toString().trim(),
      caption: (s.caption ?? "").toString().trim(),
      eyebrow: (s.eyebrow ?? "").toString().trim(),
    }));

    if (slides.some((s) => !s.beat || !s.headline || !s.caption || !s.eyebrow)) {
      return json(502, { error: "Model returned incomplete slide shape", got: slides });
    }

    return json(200, { slides });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return json(500, { error: `Gemini call failed: ${msg}` });
  }
};
