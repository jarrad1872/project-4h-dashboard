import { describe, it, expect } from "vitest";
import { validateAdCopy, formatValidationNotes } from "../ad-copy-validator";
import type { ValidationResult } from "../ad-copy-validator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds a fully valid ad copy for the "pipe" trade (domain: pipe.city). */
function validCopy() {
  return {
    primary_text: "Stop losing jobs. Pipe.City helps plumbers book more work — $39/mo, 14-day free trial, no credit card required.",
    headline: "Try Pipe.City Today",
    cta: "Start Free Trial",
  };
}

/** Builds a fully valid ad copy for the "saw" trade (domain: saw.city). */
function validSawCopy() {
  return {
    primary_text: "Grow your saw business with Saw.City — $39/mo, 14-day free trial, no credit card required.",
    headline: "See Saw.City Results",
    cta: "Start Free Trial",
  };
}

// ─── Hard rules ───────────────────────────────────────────────────────────────

describe("Hard rule 1 — Price check", () => {
  it('passes with "$39/mo"', () => {
    const copy = { ...validCopy(), primary_text: "Pipe.City $39/mo 14-day free trial no credit card" };
    const result = validateAdCopy(copy, "pipe");
    expect(result.hardFailures.every((f) => !f.includes("pricing"))).toBe(true);
  });

  it('passes with "$39/month"', () => {
    const copy = { ...validCopy(), primary_text: "Pipe.City $39/month 14-day free trial no credit card" };
    const result = validateAdCopy(copy, "pipe");
    expect(result.hardFailures.every((f) => !f.includes("pricing"))).toBe(true);
  });

  it('passes with "$39 per month"', () => {
    const copy = { ...validCopy(), primary_text: "Pipe.City $39 per month 14-day free trial no credit card" };
    const result = validateAdCopy(copy, "pipe");
    expect(result.hardFailures.every((f) => !f.includes("pricing"))).toBe(true);
  });

  it("fails without price", () => {
    const copy = { ...validCopy(), primary_text: "Pipe.City 14-day free trial no credit card" };
    const result = validateAdCopy(copy, "pipe");
    expect(result.valid).toBe(false);
    expect(result.hardFailures).toContain(
      'Missing required pricing: must contain "$39/mo", "$39/month", or "$39 per month"',
    );
  });
});

describe("Hard rule 2 — Trial check", () => {
  it('passes with "14-day free trial"', () => {
    const copy = validCopy();
    const result = validateAdCopy(copy, "pipe");
    expect(result.hardFailures.every((f) => !f.includes("trial"))).toBe(true);
  });

  it("fails without trial mention", () => {
    const copy = {
      ...validCopy(),
      primary_text: "Pipe.City helps plumbers — $39/mo, no credit card required.",
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.valid).toBe(false);
    expect(result.hardFailures).toContain(
      'Missing required trial mention: must contain "14-day free trial"',
    );
  });
});

describe("Hard rule 3 — No credit card", () => {
  it('passes with "no credit card"', () => {
    const copy = validCopy();
    const result = validateAdCopy(copy, "pipe");
    expect(result.hardFailures.every((f) => !f.includes("no-CC"))).toBe(true);
  });

  it("fails without no-CC mention", () => {
    const copy = {
      ...validCopy(),
      primary_text: "Pipe.City helps plumbers — $39/mo, 14-day free trial.",
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.valid).toBe(false);
    expect(result.hardFailures).toContain(
      'Missing required no-CC mention: must contain "no credit card"',
    );
  });
});

describe("Hard rule 4 — Correct domain", () => {
  it("passes when trade domain appears in copy", () => {
    const result = validateAdCopy(validCopy(), "pipe");
    expect(result.hardFailures.every((f) => !f.includes("trade domain"))).toBe(true);
  });

  it("fails when trade domain is missing", () => {
    const copy = {
      primary_text: "Stop losing jobs — $39/mo, 14-day free trial, no credit card required.",
      headline: "Book More Jobs",
      cta: "Start Free Trial",
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.valid).toBe(false);
    expect(result.hardFailures).toContain('Missing trade domain: must contain "pipe.city"');
  });

  it("fails with unknown trade slug", () => {
    const result = validateAdCopy(validCopy(), "nonexistent_trade_xyz");
    expect(result.valid).toBe(false);
    expect(result.hardFailures).toContain(
      'Unknown trade slug: "nonexistent_trade_xyz" not found in TRADE_MAP',
    );
  });
});

describe("Hard rule 5 — Forbidden domains", () => {
  it('"saw.city" in a non-saw trade ad fails', () => {
    const copy = {
      ...validCopy(),
      primary_text: "Pipe.City and saw.city — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.valid).toBe(false);
    expect(result.hardFailures).toContain(
      'Forbidden domain: "saw.city" is only allowed for the "saw" trade',
    );
  });

  it('"saw.city" in a saw trade ad passes', () => {
    const result = validateAdCopy(validSawCopy(), "saw");
    expect(result.hardFailures.every((f) => !f.includes("Forbidden domain"))).toBe(true);
  });

  it('"answered.city" in a non-saw trade ad fails', () => {
    const copy = {
      ...validCopy(),
      primary_text: "Pipe.City answered.city — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.valid).toBe(false);
    expect(result.hardFailures).toContain(
      'Forbidden domain: "answered.city" is only allowed for the "saw" trade',
    );
  });
});

describe("Hard rule 6 — Character limits", () => {
  it("passes when all fields are under limits", () => {
    const result = validateAdCopy(validCopy(), "pipe");
    expect(result.hardFailures.every((f) => !f.includes("character limit"))).toBe(true);
  });

  it("fails when primary_text exceeds 2000 characters", () => {
    const copy = {
      ...validCopy(),
      primary_text: "x".repeat(2001),
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.hardFailures.some((f) => f.includes("primary_text exceeds 2000 character limit"))).toBe(true);
  });

  it("fails when headline exceeds 300 characters", () => {
    const copy = {
      ...validCopy(),
      headline: "x".repeat(301),
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.hardFailures.some((f) => f.includes("headline exceeds 300 character limit"))).toBe(true);
  });

  it("fails when cta exceeds 200 characters", () => {
    const copy = {
      ...validCopy(),
      cta: "x".repeat(201),
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.hardFailures.some((f) => f.includes("cta exceeds 200 character limit"))).toBe(true);
  });
});

describe("Hard rule 7 — No generic language", () => {
  it('fails with "trade business"', () => {
    const copy = {
      ...validCopy(),
      primary_text:
        "Pipe.City for your trade business — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.valid).toBe(false);
    expect(result.hardFailures.some((f) => f.includes("trade business"))).toBe(true);
  });

  it('fails with "small business software"', () => {
    const copy = {
      ...validCopy(),
      primary_text:
        "Pipe.City is the best small business software — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe");
    expect(result.valid).toBe(false);
    expect(result.hardFailures.some((f) => f.includes("small business software"))).toBe(true);
  });

  it("passes without generic language", () => {
    const result = validateAdCopy(validCopy(), "pipe");
    expect(result.hardFailures.every((f) => !f.includes("generic language"))).toBe(true);
  });
});

// ─── Soft warnings ────────────────────────────────────────────────────────────

describe("Soft warning — Trade specificity", () => {
  it("warns when no trade terms found", () => {
    const result = validateAdCopy(validCopy(), "pipe", undefined, ["soldering", "backflow"]);
    expect(result.warnings).toContain("No trade-specific terminology found");
  });

  it("does not warn when a trade term is present", () => {
    const copy = {
      ...validCopy(),
      primary_text: "Pipe.City helps plumbers with backflow — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe", undefined, ["soldering", "backflow"]);
    expect(result.warnings).not.toContain("No trade-specific terminology found");
  });

  it("does not warn when tradeTerms is not provided", () => {
    const result = validateAdCopy(validCopy(), "pipe");
    expect(result.warnings).not.toContain("No trade-specific terminology found");
  });

  it("does not warn when tradeTerms is empty array", () => {
    const result = validateAdCopy(validCopy(), "pipe", undefined, []);
    expect(result.warnings).not.toContain("No trade-specific terminology found");
  });
});

describe("Soft warning — CTA clarity", () => {
  it("warns when CTA has no action verb", () => {
    const copy = { ...validCopy(), cta: "Pipe.City" };
    const result = validateAdCopy(copy, "pipe");
    expect(result.warnings).toContain("CTA missing action verb");
  });

  it('does not warn when CTA contains "Start"', () => {
    const copy = { ...validCopy(), cta: "Start Free Trial" };
    const result = validateAdCopy(copy, "pipe");
    expect(result.warnings).not.toContain("CTA missing action verb");
  });

  it('does not warn when CTA contains "Try"', () => {
    const copy = { ...validCopy(), cta: "Try It Now" };
    const result = validateAdCopy(copy, "pipe");
    expect(result.warnings).not.toContain("CTA missing action verb");
  });
});

describe("Soft warning — Angle alignment", () => {
  it('warns when pain angle has no pain language', () => {
    const copy = {
      ...validCopy(),
      primary_text: "Pipe.City is great — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe", "pain");
    expect(result.warnings).toContain('Copy angle is "pain" but no pain-point language detected');
  });

  it("does not warn when pain angle has pain language", () => {
    const result = validateAdCopy(validCopy(), "pipe", "pain");
    // validCopy has "losing" which matches \blose\b? Actually let's check — "losing" won't match "lose".
    // The pattern is /\b(miss|lose|cost|without|struggle|chaos|risk|fail)\b/i
    // "losing" does not match "lose" as a whole word. Let's use explicit pain language.
    const copy = {
      ...validCopy(),
      primary_text: "Don't risk losing jobs. Pipe.City — $39/mo, 14-day free trial, no credit card.",
    };
    const r = validateAdCopy(copy, "pipe", "pain");
    expect(r.warnings).not.toContain('Copy angle is "pain" but no pain-point language detected');
  });

  it('warns when proof angle has no proof language', () => {
    const copy = {
      ...validCopy(),
      primary_text: "Pipe.City is great — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe", "proof");
    expect(result.warnings).toContain('Copy angle is "proof" but no social-proof language detected');
  });

  it("does not warn when proof angle has proof language", () => {
    const copy = {
      ...validCopy(),
      primary_text: "Plumbers increase bookings 40% with Pipe.City — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe", "proof");
    expect(result.warnings).not.toContain('Copy angle is "proof" but no social-proof language detected');
  });

  it('warns when urgency angle has no urgency language', () => {
    const copy = {
      primary_text: "Pipe.City is great — $39/mo, 14-day free trial, no credit card.",
      headline: "See Pipe.City",
      cta: "Start Free Trial",
    };
    const result = validateAdCopy(copy, "pipe", "urgency");
    expect(result.warnings).toContain('Copy angle is "urgency" but no urgency language detected');
  });

  it("does not warn when urgency angle has urgency language", () => {
    const copy = {
      ...validCopy(),
      primary_text: "Don't wait — sign up for Pipe.City today. $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe", "urgency");
    expect(result.warnings).not.toContain('Copy angle is "urgency" but no urgency language detected');
  });

  it("solution angle always passes (no warning)", () => {
    const copy = {
      ...validCopy(),
      primary_text: "Pipe.City is great — $39/mo, 14-day free trial, no credit card.",
    };
    const result = validateAdCopy(copy, "pipe", "solution");
    expect(result.warnings.every((w) => !w.includes("Copy angle"))).toBe(true);
  });
});

// ─── formatValidationNotes ────────────────────────────────────────────────────

describe("formatValidationNotes", () => {
  it("returns null when no warnings", () => {
    const result: ValidationResult = { valid: true, hardFailures: [], warnings: [] };
    expect(formatValidationNotes(result)).toBeNull();
  });

  it("returns joined string when warnings exist", () => {
    const result: ValidationResult = {
      valid: true,
      hardFailures: [],
      warnings: ["CTA missing action verb", "No trade-specific terminology found"],
    };
    expect(formatValidationNotes(result)).toBe(
      "CTA missing action verb; No trade-specific terminology found",
    );
  });

  it("returns single warning as-is (no semicolons)", () => {
    const result: ValidationResult = {
      valid: true,
      hardFailures: [],
      warnings: ["CTA missing action verb"],
    };
    expect(formatValidationNotes(result)).toBe("CTA missing action verb");
  });
});

// ─── Integration ──────────────────────────────────────────────────────────────

describe("Integration", () => {
  it("a fully valid ad passes with no failures or warnings", () => {
    const copy = {
      primary_text:
        "Stop losing jobs to competitors without an online presence. Pipe.City gets plumbers booked — $39/mo, 14-day free trial, no credit card required.",
      headline: "Try Pipe.City Today",
      cta: "Start Free Trial",
    };
    const result = validateAdCopy(copy, "pipe", "pain", ["plumbers"]);
    expect(result.valid).toBe(true);
    expect(result.hardFailures).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("multiple failures accumulate correctly", () => {
    const copy = {
      primary_text: "Great small business software for your trade business.",
      headline: "Check it out",
      cta: "Hello",
    };
    const result = validateAdCopy(copy, "pipe", "pain", ["backflow"]);

    // Should have hard failures for: price, trial, no-CC, domain, 2x generic language
    expect(result.valid).toBe(false);
    expect(result.hardFailures.length).toBeGreaterThanOrEqual(5);

    // Check specific failures are present
    expect(result.hardFailures.some((f) => f.includes("pricing"))).toBe(true);
    expect(result.hardFailures.some((f) => f.includes("trial"))).toBe(true);
    expect(result.hardFailures.some((f) => f.includes("no-CC"))).toBe(true);
    expect(result.hardFailures.some((f) => f.includes("trade domain"))).toBe(true);
    expect(result.hardFailures.some((f) => f.includes("generic language"))).toBe(true);

    // Should also have soft warnings for: trade specificity, CTA verb, pain angle
    expect(result.warnings).toContain("No trade-specific terminology found");
    expect(result.warnings).toContain("CTA missing action verb");
    expect(result.warnings.some((w) => w.includes("pain"))).toBe(true);
  });
});
