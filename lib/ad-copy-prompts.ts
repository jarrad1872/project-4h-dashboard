import type { TradeCopyContext, CopyAngle } from "./trade-copy-context";
import type { AdPlatform } from "./types";

export interface GeneratedAdCopy {
  primary_text: string;
  headline: string;
  cta: string;
}

// Platform-specific constraints — tighter limits to prevent truncation
// Budget allocation: Facebook 40%, Instagram 30%, YouTube 20%, LinkedIn 10%
const PLATFORM_GUIDELINES: Record<
  AdPlatform,
  { maxPrimaryText: number; maxHeadline: number; maxCta: number; tone: string; audience: string }
> = {
  facebook: {
    maxPrimaryText: 150,
    maxHeadline: 60,
    maxCta: 25,
    tone: "conversational, relatable, scroll-stopping",
    audience: "PRIMARY channel (40% budget). 70% of trade owners use Facebook daily. Solo operators and small crews scroll the feed between jobs. Write like you're talking to a buddy at the supply house.",
  },
  instagram: {
    maxPrimaryText: 125,
    maxHeadline: 50,
    maxCta: 25,
    tone: "punchy, visual, action-oriented",
    audience: "HIGH-PRIORITY channel (30% budget). Younger trade owners and crews. Reels-first platform — copy must work without visuals since this is text-only. Ultra-short, hooks in first line.",
  },
  youtube: {
    maxPrimaryText: 150,
    maxHeadline: 60,
    maxCta: 25,
    tone: "direct, benefit-driven, curiosity",
    audience: "SECONDARY channel (20% budget). Trade owners watching how-to and equipment content. Pre-roll ads — first 5 seconds must hook or they skip. Write the copy that makes them NOT skip.",
  },
  linkedin: {
    maxPrimaryText: 200,
    maxHeadline: 70,
    maxCta: 30,
    tone: "professional, B2B, industry authority",
    audience: "TERTIARY channel (10% budget). Only 28% of blue-collar workers use LinkedIn. Target owners of larger operations (5+ trucks), office managers, and franchise owners. More formal, business-outcome focused.",
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
    "Lead with one of these real stats:",
    "- 74% of trade calls go completely unanswered (NextPhone)",
    "- 85% of callers who reach voicemail hang up and call the next guy",
    "- 78% of customers book with whoever answers first",
    "- Average missed call costs $1,200 in lost revenue",
    "- Less than 3% of callers leave a voicemail",
    "Pick the stat that hits hardest for this trade. Then do the math: one answered call pays for a year of service at $39/mo.",
    "Build credibility through the numbers — missed calls = missed revenue, and the math is undeniable.",
    'Example tone: "74% of plumbing calls go unanswered. Yours won\'t. $39/mo."',
  ].join(" "),

  urgency: [
    "Use a COMPETITOR PRESSURE / URGENCY angle.",
    "Frame it as: while their phone goes to voicemail, their competitor's AI is booking those calls.",
    "Create FOMO around competitors already using AI to answer calls.",
    "Make inaction feel like losing — every unanswered call is a job for someone else.",
    'Example tone: "While your phone goes to voicemail, your competitor\'s AI is booking their calls."',
  ].join(" "),

  "ai-employee": [
    "Use an AI EMPLOYEE / RECEPTIONIST COMPARISON angle.",
    "Position the product as hiring a team member, not buying software.",
    "Compare to a full-time receptionist: they cost $35K+/year, call in sick, quit. This one is $39/mo and never misses a day.",
    "Use language like 'hire', 'crew member', 'new employee', 'your receptionist'.",
    "Make it feel like adding a person to the team, not installing an app.",
    'Example tone: "Hire a receptionist that never calls in sick. Pipe.City — $39/mo."',
  ].join(" "),

  "math": [
    "Use a PURE MATH / ROI angle.",
    "Lead with a specific calculation the reader can verify in their head.",
    "Use concrete numbers: 74% of calls unanswered × $1,200 per missed call = real dollar loss.",
    "Or: $39/mo ÷ $1,200 per answered call = pays for itself in one call.",
    "Or: $39/mo × 12 = $468/year. One answered call covers it.",
    "The math must be simple, specific, and undeniable. No vague claims.",
    'Example tone: "$39/mo. One call covers the whole year. Do the math."',
  ].join(" "),

  "junk-shield": [
    "Use a JUNK CALL SCREENING angle.",
    "Lead with the frustration of spam calls, robocalls, and tire-kickers.",
    "The AI screens every call — blocks spam, filters junk, only passes real leads.",
    "Returning customers get recognized: 'Hello again, Mike — how can I help?'",
    "Position it as a bouncer for your phone: keeps the garbage out, lets the money in.",
    'Example tone: "Spam, robocalls, tire-kickers — filtered. Real jobs? Booked. $39/mo."',
  ].join(" "),

  "voice-boss": [
    "Use a VOICE BOSS / RUN YOUR BUSINESS BY VOICE angle.",
    "Lead with the Owner Agent — the ability to manage your entire business by voice from your truck, job site, or couch.",
    "Use a specific ownerAgentScenario from the context as the hook.",
    "Show that it's not just call answering — it's a full AI employee you can talk to.",
    "Emphasize: schedule jobs, complete jobs, text customers, check your day — all by voice.",
    "Position it as freedom: hands on the wheel, mouth running the business.",
    'Example tone: "Driving between jobs? Just say: Schedule Mike for Thursday at seven. Done."',
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
${context.domain} is an AI employee for ${context.trade.toLowerCase()} businesses. It answers every phone call 24/7, qualifies leads with trade-specific questions, books jobs automatically, and texts the owner a summary. It screens junk calls (spam, robocalls, tire-kickers) and greets returning customers by name ("Hello again, Mike"). Plus: an Owner Agent you can talk to by voice — schedule jobs, complete jobs, text customers, check your day, all hands-free from your truck. Your crew just got bigger.

This is a PHONE CALL ANSWERING + VOICE BUSINESS MANAGEMENT product. NOT scheduling software. NOT invoicing. NOT quoting. The hook is always about THE PHONE RINGING when you can't answer, OR running your business by voice.

=== TRADE CONTEXT ===
Trade: ${context.trade}
Domain: ${context.domain}
Who calls: ${context.callScenarios.join("; ")}
Missed call cost: ${context.missedCallCost}
Busy moment (when they can't answer): ${context.busyMoment}
Owner voice commands: ${context.ownerAgentScenarios.join("; ")}

=== COPY ANGLE ===
${angleInstruction}

=== PLATFORM: ${platform.toUpperCase()} ===
Tone: ${guidelines.tone}
Audience: ${guidelines.audience}
primary_text: MAX ${guidelines.maxPrimaryText} characters (1-2 sentences, no more)
headline: MAX ${guidelines.maxHeadline} characters
cta: MAX ${guidelines.maxCta} characters

=== SOCIAL PROOF (use where natural, don't force) ===
- Built by a concrete cutter who was tired of missing calls on the job site
- Serving 20+ trades from plumbing to painting
- One answered call pays for a year of service
- Every action the AI takes queues for your approval — you stay in control

=== CREATIVE DIVERSITY (CRITICAL) ===
Do NOT use the formula: "[busy moment]. [missed call]. [domain] answers. $39/mo. Trial."
Vary your structure. Try these emotional beats:
- Guilt: checking voicemail at dinner, seeing 3 missed leads
- Frustration: paying for Google Ads then missing the calls they generate
- Embarrassment: customer says "I called you three times"
- Relief: waking up to a text saying "3 jobs booked while you slept"
- Pride: "My AI handles the phone so I can handle the work"
Be creative. Surprise the reader. Break patterns.

=== HARD REQUIREMENTS (violating any = failure) ===
1. Price MUST be "$39/mo" or "$39/month" or "$39 per month" — no other price.
2. MUST include "14-day free trial" somewhere in the copy.
3. MUST include "no credit card" somewhere in the copy.
4. MUST reference "${context.domain}" by name.
5. Combined text MUST mention at least one of: "call", "calls", "answer", "answers", "phone", "AI employee", "voice", "hands-free", "receptionist", "screen", "filter".
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
