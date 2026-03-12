import type { TradeCopyContext, CopyAngle } from "./trade-copy-context";
import type { AdPlatform } from "./types";

export interface GeneratedAdCopy {
  primary_text: string;
  headline: string;
  cta: string;
}

// Platform-specific constraints — tighter limits to prevent truncation
const PLATFORM_GUIDELINES: Record<
  AdPlatform,
  { maxPrimaryText: number; maxHeadline: number; maxCta: number; tone: string }
> = {
  linkedin: {
    maxPrimaryText: 200,
    maxHeadline: 70,
    maxCta: 30,
    tone: "professional, B2B, industry authority",
  },
  facebook: {
    maxPrimaryText: 150,
    maxHeadline: 60,
    maxCta: 25,
    tone: "conversational, relatable, scroll-stopping",
  },
  instagram: {
    maxPrimaryText: 125,
    maxHeadline: 50,
    maxCta: 25,
    tone: "punchy, visual, action-oriented",
  },
  youtube: {
    maxPrimaryText: 150,
    maxHeadline: 60,
    maxCta: 25,
    tone: "direct, benefit-driven, curiosity",
  },
};

// Angle-specific prompt instructions — all framed around AI answering calls
const ANGLE_PROMPTS: Record<CopyAngle, string> = {
  pain: [
    "Use a MISSED CALL PAIN angle.",
    "Lead with the moment the phone rings and they can't answer.",
    "Paint the exact scenario: they're busy doing trade work, phone rings, that's a real job calling — gone.",
    "Use the busyMoment and missedCallCost from the context.",
    "The reader should FEEL the money walking out the door.",
    'Example tone: "You\'re under a house fixing a leak. Phone rings. That\'s a $2K water heater job — gone."',
  ].join(" "),

  solution: [
    "Use a SOLUTION / WHAT THE AI EMPLOYEE DOES angle.",
    "Lead with what the AI employee actually does: answers calls, qualifies leads, books jobs, texts the owner.",
    "Be concrete — describe the AI picking up the phone, asking the right questions, creating the job, sending a text.",
    "Position it as a crew member, not software.",
    'Example tone: "Pipe.City answers every call. Qualifies the lead. Books the job. Texts you the details."',
  ].join(" "),

  proof: [
    "Use a MATH / PROOF angle.",
    "Lead with the 62% stat: 62% of trade calls go unanswered.",
    "Then do the math: one answered call pays for a year of service at $39/mo.",
    "Build credibility through the numbers — missed calls = missed revenue, and the math is undeniable.",
    'Example tone: "62% of plumbing calls go unanswered. Yours won\'t. $39/mo."',
  ].join(" "),

  urgency: [
    "Use a COMPETITOR PRESSURE / URGENCY angle.",
    "Frame it as: while their phone goes to voicemail, their competitor's AI is booking those calls.",
    "Create FOMO around competitors already using AI to answer calls.",
    "Make inaction feel like losing — every unanswered call is a job for someone else.",
    'Example tone: "While your phone goes to voicemail, your competitor\'s AI is booking their calls."',
  ].join(" "),
};

/**
 * Builds a complete Gemini prompt for generating trade-specific ad copy.
 *
 * Includes an immutable product description block so Gemini always knows
 * this is a PHONE CALL ANSWERING product, not scheduling software.
 */
export function buildAdCopyPrompt(
  context: TradeCopyContext,
  angle: CopyAngle,
  platform: AdPlatform,
): string {
  const guidelines = PLATFORM_GUIDELINES[platform];
  const angleInstruction = ANGLE_PROMPTS[angle];

  const prompt = `You are writing a short, punchy ad for a trade business product. Write 1-2 sentences MAX for primary_text. Every word must earn its place.

=== PRODUCT (DO NOT DEVIATE) ===
${context.domain} is an AI employee for ${context.trade.toLowerCase()} businesses. It answers every phone call 24/7, qualifies leads with trade-specific questions, books jobs automatically, and texts the owner a summary. Your crew just got bigger.

This is a PHONE CALL ANSWERING product. NOT scheduling software. NOT invoicing. NOT quoting. The hook is always about THE PHONE RINGING when you can't answer.

=== TRADE CONTEXT ===
Trade: ${context.trade}
Domain: ${context.domain}
Who calls: ${context.callScenarios.join("; ")}
Missed call cost: ${context.missedCallCost}
Busy moment (when they can't answer): ${context.busyMoment}

=== COPY ANGLE ===
${angleInstruction}

=== PLATFORM: ${platform.toUpperCase()} ===
Tone: ${guidelines.tone}
primary_text: MAX ${guidelines.maxPrimaryText} characters (1-2 sentences, no more)
headline: MAX ${guidelines.maxHeadline} characters
cta: MAX ${guidelines.maxCta} characters

=== HARD REQUIREMENTS (violating any = failure) ===
1. Price MUST be "$39/mo" or "$39/month" or "$39 per month" — no other price.
2. MUST include "14-day free trial" somewhere in the copy.
3. MUST include "no credit card" somewhere in the copy.
4. MUST reference "${context.domain}" by name.
5. Combined text MUST mention at least one of: "call", "calls", "answer", "answers", "phone", "AI employee".
6. NEVER say "scheduling", "invoicing", "quoting", "CRM", "software", "app", "platform".
7. NEVER use: "trade business", "small business software", "saw.city" (unless the domain IS saw.city), "answered.city".
8. Keep it SHORT. No filler. No corporate speak. Sound like a tradesperson talking to another tradesperson.

=== OUTPUT FORMAT ===
Return ONLY valid JSON — no markdown, no explanation:
{
  "primary_text": "max ${guidelines.maxPrimaryText} chars",
  "headline": "max ${guidelines.maxHeadline} chars",
  "cta": "max ${guidelines.maxCta} chars"
}`;

  return prompt;
}
