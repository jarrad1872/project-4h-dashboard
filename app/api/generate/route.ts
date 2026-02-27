import Anthropic from "@anthropic-ai/sdk";
import { errorJson, okJson, optionsResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

type Variation = { headline: string; primaryText: string };

const MODEL_CANDIDATES = [
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-opus-4-1-20250805",
  "claude-sonnet-4-5-20250929",
];

const PROJECT_CONTEXT = `You are writing paid ad copy for Project 4H (Saw.City).
Audience: owner-operators and 1-10 person trade teams.
Offer: self-serve onboarding, no demo call required.
Price: $149/mo.
Voice: direct, practical, field-first.
Avoid hype and fluffy claims.
Output concise conversion-oriented copy.`;

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
  const audience = "1-10 person trade teams";
  const headlines = [
    `Stop Missing Jobs While You're on Site`,
    `Self-Serve Dispatch for ${audience}`,
    `${platform[0].toUpperCase() + platform.slice(1)} Leads to Booked Work Faster`,
    `Go Live Today — No Demo Call Needed`,
  ];

  return Array.from({ length: count }).map((_, idx) => ({
    headline: headlines[idx % headlines.length],
    primaryText: `${tone} angle: ${prompt}. Saw.City is built for ${audience}. Set up in minutes, skip the demo call, and run your workflow for $149/mo.`,
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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return okJson({
        variations: buildFallbackVariations(platform, prompt, tone, count),
        source: "fallback",
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const userPrompt = `Platform: ${platform}\nTone: ${tone}\nDirection: ${prompt}\n\nGenerate ${count} variations.\nReturn strict JSON only with this shape:\n{\n  \"variations\": [\n    { \"headline\": \"...\", \"primaryText\": \"...\" }\n  ]\n}`;

    let lastError = "Unknown Anthropic error";

    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await anthropic.messages.create({
          model,
          max_tokens: 1200,
          system: PROJECT_CONTEXT,
          temperature: 0.7,
          messages: [{ role: "user", content: userPrompt }],
        });

        const text = response.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n")
          .trim();

        const parsed = JSON.parse(stripCodeFences(text));
        const variations = normalizeVariations(parsed?.variations);

        if (!variations.length) {
          return errorJson("AI response did not contain usable variations", 502, text);
        }

        return okJson({ variations });
      } catch (error) {
        lastError = String(error);
      }
    }

    return okJson({
      variations: buildFallbackVariations(platform, prompt, tone, count),
      source: "fallback",
      warning: lastError,
    });
  } catch (error) {
    return errorJson("Failed to generate ad copy", 500, String(error));
  }
}
