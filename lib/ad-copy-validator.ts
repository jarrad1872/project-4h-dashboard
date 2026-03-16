import { TRADE_MAP } from "./trade-utils";
import type { CopyAngle } from "./trade-copy-context";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;           // true if all hard rules pass
  hardFailures: string[];   // reasons for hard failures
  warnings: string[];       // soft warning messages
}

interface AdCopyFields {
  primary_text: string;
  headline: string;
  cta: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PRICE_PATTERN = /\$39\/mo|\$39\/month|\$39 per month/i;
const TRIAL_PATTERN = /14-day free trial/i;
const NO_CC_PATTERN = /no credit card/i;
const GENERIC_PATTERNS = [/trade business/i, /small business software/i];
const PRODUCT_MENTION_PATTERN = /\b(calls?|answers?|phone|AI employee|voice|hands-free|receptionist|screen|filter)\b/i;

const CTA_VERBS = /\b(start|try|get|book|sign|join|claim|explore|discover|launch)\b/i;

const ANGLE_TERMS: Record<string, { pattern: RegExp; label: string }> = {
  pain: {
    pattern: /\b(miss|lose|cost|without|struggle|chaos|risk|fail|gone|ring)\b/i,
    label: "pain-point",
  },
  proof: {
    pattern: /(%|more|increase|result|trust|rating|review|grow|74|85|78|\$1,?200)/i,
    label: "social-proof",
  },
  urgency: {
    pattern: /(now|today|before|season|limited|don't wait|already|behind|competitor|voicemail)/i,
    label: "urgency",
  },
  "voice-boss": {
    pattern: /\b(voice|schedule|complete|text|hands-free|truck|driving|say|just say)\b/i,
    label: "voice-boss",
  },
  "ai-employee": {
    pattern: /\b(hire|receptionist|employee|crew|team|staff|sick|quit|never miss)\b/i,
    label: "ai-employee",
  },
  "math": {
    pattern: /(\$\d|%|pay.*itself|one call|do the math|covers|return)/i,
    label: "math",
  },
  "junk-shield": {
    pattern: /\b(spam|junk|screen|filter|block|robocall|tire.?kick|garbage|bouncer)\b/i,
    label: "junk-shield",
  },
};

const CHAR_LIMITS: Record<keyof AdCopyFields, number> = {
  primary_text: 250,
  headline: 80,
  cta: 40,
};

// ─── Main validator ─────────────────────────────────────────────────────────

export function validateAdCopy(
  copy: AdCopyFields,
  tradeSlug: string,
  angle?: CopyAngle,
  tradeTerms?: string[],
): ValidationResult {
  const hardFailures: string[] = [];
  const warnings: string[] = [];

  const combined = `${copy.primary_text} ${copy.headline} ${copy.cta}`;
  const combinedLower = combined.toLowerCase();

  // ── Hard rules ──────────────────────────────────────────────────────────

  // 1. Price
  if (!PRICE_PATTERN.test(combined)) {
    hardFailures.push('Missing required pricing: must contain "$39/mo", "$39/month", or "$39 per month"');
  }

  // 2. Trial
  if (!TRIAL_PATTERN.test(combined)) {
    hardFailures.push('Missing required trial mention: must contain "14-day free trial"');
  }

  // 3. No credit card
  if (!NO_CC_PATTERN.test(combined)) {
    hardFailures.push('Missing required no-CC mention: must contain "no credit card"');
  }

  // 4. Correct domain
  const trade = TRADE_MAP[tradeSlug];
  if (trade) {
    const domainLower = trade.domain.toLowerCase();
    if (!combinedLower.includes(domainLower)) {
      hardFailures.push(`Missing trade domain: must contain "${trade.domain}"`);
    }
  } else {
    hardFailures.push(`Unknown trade slug: "${tradeSlug}" not found in TRADE_MAP`);
  }

  // 5. Forbidden domains — "saw.city" and "answered.city" only allowed for the "saw" trade
  if (tradeSlug !== "saw") {
    if (combinedLower.includes("saw.city")) {
      hardFailures.push('Forbidden domain: "saw.city" is only allowed for the "saw" trade');
    }
    if (combinedLower.includes("answered.city")) {
      hardFailures.push('Forbidden domain: "answered.city" is only allowed for the "saw" trade');
    }
  }

  // 6. Character limits
  for (const [field, limit] of Object.entries(CHAR_LIMITS) as [keyof AdCopyFields, number][]) {
    if (copy[field].length > limit) {
      hardFailures.push(`${field} exceeds ${limit} character limit (${copy[field].length} chars)`);
    }
  }

  // 7. No generic language
  for (const pattern of GENERIC_PATTERNS) {
    if (pattern.test(combined)) {
      hardFailures.push(`Contains generic language matching "${pattern.source}"`);
    }
  }

  // 8. Product mention — must reference call answering / AI employee
  if (!PRODUCT_MENTION_PATTERN.test(combined)) {
    hardFailures.push('Missing product mention: must contain "call", "calls", "answer", "answers", "phone", or "AI employee"');
  }

  // ── Soft warnings ────────────────────────────────────────────────────────

  // 1. Trade specificity — check if any trade-specific terms appear
  if (tradeTerms && tradeTerms.length > 0) {
    const hasSpecificTerm = tradeTerms.some((term) =>
      combinedLower.includes(term.toLowerCase()),
    );
    if (!hasSpecificTerm) {
      warnings.push("No trade-specific terminology found");
    }
  }

  // 2. CTA clarity — should contain an action verb
  if (!CTA_VERBS.test(copy.cta)) {
    warnings.push("CTA missing action verb");
  }

  // 3. Angle alignment (only if angle provided and not "solution")
  if (angle && angle !== "solution") {
    const check = ANGLE_TERMS[angle];
    if (check && !check.pattern.test(combined)) {
      warnings.push(`Copy angle is "${angle}" but no ${check.label} language detected`);
    }
  }

  return {
    valid: hardFailures.length === 0,
    hardFailures,
    warnings,
  };
}

// ─── Formatting helper ──────────────────────────────────────────────────────

export function formatValidationNotes(result: ValidationResult): string | null {
  if (result.warnings.length === 0) return null;
  return result.warnings.join("; ");
}
