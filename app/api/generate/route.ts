import { errorJson, okJson, optionsResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

type Variation = { headline: string; primaryText: string };

const PROJECT_CONTEXT = `You are writing paid ad copy for Project 4H (Saw.City).
Audience: owner-operators and 1-10 person trade teams (concrete cutters, excavators, contractors).
Offer: field service management software, self-serve onboarding, no demo call required.
Price: $149/mo.
Voice: direct, practical, field-first. No hype or fluffy claims.
Output concise, conversion-oriented copy.`;

function stripCodeFences(input: string): string {
  return input.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
}

function normalizeVariations(value: unknown): Variation[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = row as { headline?: unknown; primaryText?: unknown };
      return {
        headline: typeof item.headline === "string" ? item.headline.trim() : "",
        primaryText: typeof item.primaryText === "string" ? item.primaryText.trim() : "",
      };
    })
    .filter((row) => row.headline && row.primaryText);
}

function buildFallbackVariations(platform: string, prompt: string, tone: string, count: number): Variation[] {
  const headlines = [
    `Stop Missing Jobs While You're on Site`,
    `Self-Serve Dispatch — No Demo Call`,
    `Run Your Crew From Your Phone`,
    `$149/mo. No Contracts. No Demo.`,
    `Built for Trades. Ready in Minutes.`,
  ];
  return Array.from({ length: count }).map((_, idx) => ({
    headline: headlines[idx % headlines.length],
    primaryText: `${tone} angle on "${prompt}" — Saw.City is built for 1-10 person trade teams. Set up in minutes, skip the sales call. $149/mo.`,
  }));
}

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      platform?: string;
      prompt?: string;
      tone?: string;
      count?: number;
    };

    const platform = payload.platform?.trim().toLowerCase();
    const prompt = payload.prompt?.trim();
    const tone = payload.tone?.trim() || "Direct";
    const count = Math.max(1, Math.min(5, payload.count ?? 2));

    if (!platform || !prompt) {
      return errorJson("platform and prompt are required", 400);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return okJson({
        variations: buildFallbackVariations(platform, prompt, tone, count),
        source: "fallback",
      });
    }

    const userPrompt = `Platform: ${platform}\nTone: ${tone}\nDirection: ${prompt}\n\nGenerate ${count} ad copy variations for Saw.City.\nReturn ONLY strict JSON with this shape:\n{\n  "variations": [\n    { "headline": "...", "primaryText": "..." }\n  ]\n}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1200,
        temperature: 0.7,
        messages: [
          { role: "system", content: PROJECT_CONTEXT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return okJson({
        variations: buildFallbackVariations(platform, prompt, tone, count),
        source: "fallback",
        warning: errText,
      });
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFences(text));
    } catch {
      return okJson({
        variations: buildFallbackVariations(platform, prompt, tone, count),
        source: "fallback",
        warning: "JSON parse failed: " + text.slice(0, 200),
      });
    }

    const variations = normalizeVariations((parsed as { variations?: unknown })?.variations);
    if (!variations.length) {
      return okJson({
        variations: buildFallbackVariations(platform, prompt, tone, count),
        source: "fallback",
      });
    }

    return okJson({ variations, source: "openai" });
  } catch (error) {
    return errorJson("Failed to generate ad copy", 500, String(error));
  }
}
