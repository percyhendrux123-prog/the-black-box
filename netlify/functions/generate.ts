import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

// System prompt is locked. Don't let user prompt override it.
const SYSTEM = `You generate short carousel slide copy.
Return ONLY valid JSON with this exact shape, no markdown, no code fences, no commentary:
{"headline": string, "caption": string, "eyebrow": string}

Rules:
- headline: max 8 words, two-line punchy. Use a period or short break for line two.
- caption: one line, supporting detail (numbers, names, proof). Max 12 words.
- eyebrow: max 3 words, scene label, ALL CAPS or Title Case.
- No markdown. No quotes around values beyond JSON requirement. No trailing prose.`;

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
  try {
    const parsed = JSON.parse(event.body || "{}");
    prompt = (parsed.prompt ?? "").toString().trim();
  } catch {
    return json(400, { error: "Body must be JSON: { prompt: string }" });
  }

  if (!prompt) {
    return json(400, { error: "Missing 'prompt' in body" });
  }
  if (prompt.length > 2000) {
    return json(400, { error: "Prompt too long (max 2000 chars)" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 256,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Defensive parse — strip code fences if model still emits them.
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let payload: { headline?: string; caption?: string; eyebrow?: string };
    try {
      payload = JSON.parse(cleaned);
    } catch {
      return json(502, { error: "Model returned non-JSON", raw: text.slice(0, 400) });
    }

    const headline = (payload.headline ?? "").toString().trim();
    const caption = (payload.caption ?? "").toString().trim();
    const eyebrow = (payload.eyebrow ?? "").toString().trim();

    if (!headline || !caption || !eyebrow) {
      return json(502, { error: "Model returned incomplete shape", got: payload });
    }

    return json(200, { headline, caption, eyebrow });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return json(500, { error: `Gemini call failed: ${msg}` });
  }
};
