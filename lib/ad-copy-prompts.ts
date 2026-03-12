import type { TradeCopyContext, CopyAngle } from "./trade-copy-context";
import type { AdPlatform } from "./types";

export interface GeneratedAdCopy {
  primary_text: string;
  headline: string;
  cta: string;
}

// Platform-specific constraints
const PLATFORM_GUIDELINES: Record<
  AdPlatform,
  { maxPrimaryText: number; maxHeadline: number; maxCta: number; tone: string }
> = {
  linkedin: {
    maxPrimaryText: 600,
    maxHeadline: 150,
    maxCta: 100,
    tone: "professional, B2B, industry authority",
  },
  facebook: {
    maxPrimaryText: 500,
    maxHeadline: 100,
    maxCta: 80,
    tone: "conversational, relatable, scroll-stopping",
  },
  instagram: {
    maxPrimaryText: 300,
    maxHeadline: 80,
    maxCta: 60,
    tone: "punchy, visual, action-oriented",
  },
  youtube: {
    maxPrimaryText: 400,
    maxHeadline: 100,
    maxCta: 80,
    tone: "direct, benefit-driven, curiosity",
  },
};

// Angle-specific prompt instructions
const ANGLE_PROMPTS: Record<CopyAngle, string> = {
  pain: [
    "Use a PROBLEM AMPLIFICATION angle.",
    "Lead with the pain point — missed calls, lost revenue, scheduling chaos, jobs slipping through the cracks.",
    "Paint a vivid picture of the problem the reader already knows they have.",
    "Hook with the problem FIRST, then briefly introduce the solution as the relief.",
    "Use emotional triggers: frustration, wasted time, money left on the table.",
    "The reader should feel the cost of NOT acting before they see what the product does.",
  ].join(" "),

  solution: [
    "Use a FEATURE-LED / SOLUTION angle.",
    "Lead with what the app actually does and how it works for this specific trade.",
    "Highlight capabilities: scheduling, quoting, invoicing, job tracking, client comms — whatever fits the trade.",
    "Show how it slots into their existing workflow without disruption.",
    "Be concrete — mention specific actions they can take, not vague benefits.",
    "Position the product as the obvious, modern way to run their operation.",
  ].join(" "),

  proof: [
    "Use a SOCIAL PROOF angle.",
    "Lead with results, trust signals, or industry adoption.",
    "Reference numbers where possible: time saved, revenue recovered, jobs managed.",
    "Imply that other professionals in their trade are already using this.",
    "Build credibility through specificity — mention the trade by name, reference real workflows.",
    "The reader should feel they are behind the curve if they are not already on board.",
  ].join(" "),

  urgency: [
    "Use a TIME PRESSURE / URGENCY angle.",
    "Create FOMO — seasonal demand is ramping up, competitors are getting ahead, now is the time.",
    "Reference seasonality if provided in the context (e.g., spring demand, storm season, renovation season).",
    "Emphasize competitive advantage: the ones who adopt early win the best jobs.",
    "Make inaction feel risky — waiting means losing ground.",
    "Tie urgency to a concrete benefit of starting now (14-day free trial, no commitment).",
  ].join(" "),
};

/**
 * Builds a complete Gemini prompt for generating trade-specific ad copy.
 *
 * Combines the trade context, copy angle, and platform constraints into
 * a single structured prompt that enforces all hard requirements.
 */
export function buildAdCopyPrompt(
  context: TradeCopyContext,
  angle: CopyAngle,
  platform: AdPlatform,
): string {
  const guidelines = PLATFORM_GUIDELINES[platform];
  const angleInstruction = ANGLE_PROMPTS[angle];

  const tradeContextBlock = [
    `Trade: ${context.trade}`,
    `Domain: ${context.domain}`,
    `Services: ${context.services.join(", ")}`,
    `Pain points: ${context.painPoints.join(", ")}`,
    `Tools/equipment: ${context.tools.join(", ")}`,
    `Target persona: ${context.persona}`,
    context.seasonality
      ? `Seasonality: ${context.seasonality}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are an expert ad copywriter specializing in trade businesses. You write copy that sounds like it was written BY someone in the trade, FOR someone in the trade. Never generic — always specific to the trade context below.

=== TRADE CONTEXT ===
${tradeContextBlock}

=== COPY ANGLE ===
${angleInstruction}

=== PLATFORM: ${platform.toUpperCase()} ===
Tone: ${guidelines.tone}
Maximum primary_text length: ${guidelines.maxPrimaryText} characters
Maximum headline length: ${guidelines.maxHeadline} characters
Maximum cta length: ${guidelines.maxCta} characters

=== HARD REQUIREMENTS (violating any of these is a failure) ===
1. Price MUST be "$39/mo" or "$39/month" or "$39 per month" — no other price.
2. MUST include "14-day free trial" somewhere in the copy.
3. MUST include "no credit card" (as in "no credit card required") somewhere in the copy.
4. MUST reference the trade's .city domain — use "${context.domain}" (e.g., "Try ${context.domain}").
5. MUST use trade-specific language from the context above (services, tools, pain points). The reader should immediately recognize this is for THEIR trade.
6. NEVER use any of these banned phrases: "trade business", "small business software", "saw.city", "answered.city", "Saw.City".
7. Do NOT be generic. Do NOT write copy that could apply to any business. Every sentence should feel specific to ${context.trade} professionals.

=== OUTPUT FORMAT ===
Return ONLY valid JSON with exactly this structure — no markdown, no explanation, no wrapping:
{
  "primary_text": "The main ad body text (max ${guidelines.maxPrimaryText} chars)",
  "headline": "The headline (max ${guidelines.maxHeadline} chars)",
  "cta": "The call-to-action button text (max ${guidelines.maxCta} chars)"
}`;

  return prompt;
}
