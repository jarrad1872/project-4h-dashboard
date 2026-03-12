import { GoogleGenAI } from "@google/genai";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";
import { adToDb, hasSupabase, logActivity, normalizeAd, statusToWorkflowStage } from "@/lib/server-utils";
import { isoNow } from "@/lib/file-db";
import { TRADE_MAP, getCreativeUrls } from "@/lib/trade-utils";
import { getTradeContext, getLiveTradeSlugs, type CopyAngle } from "@/lib/trade-copy-context";
import { buildAdCopyPrompt, type GeneratedAdCopy } from "@/lib/ad-copy-prompts";
import { validateAdCopy, formatValidationNotes } from "@/lib/ad-copy-validator";
import type { Ad, AdPlatform } from "@/lib/types";

export const dynamic = "force-dynamic";

const COPY_MODEL = "gemini-2.0-flash";
const ALL_PLATFORMS: AdPlatform[] = ["linkedin", "facebook", "instagram", "youtube"];
const ALL_ANGLES: CopyAngle[] = ["pain", "solution", "proof", "urgency"];

interface GenerateRequest {
  trades: string[] | "all";
  platforms: string[] | "all";
  angles: string[] | "all";
  dryRun?: boolean;
}

interface GenerationFailure {
  trade: string;
  platform: string;
  angle: string;
  reason: string;
}

export function OPTIONS(request: Request) {
  return optionsResponse(request);
}

function parseList(value: string[] | "all", allValues: string[]): string[] {
  if (value === "all") return allValues;
  return value;
}

/**
 * Call Gemini to generate ad copy, parse the JSON response.
 */
async function generateCopy(
  ai: GoogleGenAI,
  prompt: string,
): Promise<GeneratedAdCopy | null> {
  const response = await ai.models.generateContent({
    model: COPY_MODEL,
    contents: prompt,
  });

  const text = response.text?.trim();
  if (!text) return null;

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  const parsed = JSON.parse(cleaned) as GeneratedAdCopy;
  if (!parsed.primary_text || !parsed.headline || !parsed.cta) return null;
  return parsed;
}

/**
 * Look up existing NB2 image URL for a trade.
 * Falls back to the standard storage URL if no existing ad found.
 */
async function getExistingImageUrl(tradeSlug: string): Promise<string | null> {
  if (!hasSupabase()) return null;

  const { data } = await supabaseAdmin
    .from("ads")
    .select("image_url")
    .ilike("campaign_group", `%${tradeSlug}%`)
    .not("image_url", "is", null)
    .limit(1)
    .single();

  if (data?.image_url) return data.image_url as string;

  // Fallback to standard NB2 creative URL
  const urls = getCreativeUrls(tradeSlug);
  return urls.c1;
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  // Rate limit: 5 requests per minute (each generates multiple ads)
  const rl = checkRateLimit(rateLimitKey(request), { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorJson("Rate limit exceeded", 429, { retryAfterMs: rl.retryAfterMs }, request);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorJson("Missing GEMINI_API_KEY", 500, undefined, request);
  }

  try {
    const body = (await request.json()) as Partial<GenerateRequest>;

    const trades = parseList(body.trades ?? "all", getLiveTradeSlugs());
    const platforms = parseList(body.platforms ?? "all", ALL_PLATFORMS) as AdPlatform[];
    const angles = parseList(body.angles ?? "all", ALL_ANGLES) as CopyAngle[];
    const dryRun = body.dryRun ?? false;

    // Validate inputs
    for (const t of trades) {
      if (!getTradeContext(t)) {
        return errorJson(`Unknown trade: "${t}". Available: ${getLiveTradeSlugs().join(", ")}`, 400, undefined, request);
      }
    }
    for (const p of platforms) {
      if (!ALL_PLATFORMS.includes(p)) {
        return errorJson(`Invalid platform: "${p}". Use: ${ALL_PLATFORMS.join(", ")}`, 400, undefined, request);
      }
    }
    for (const a of angles) {
      if (!ALL_ANGLES.includes(a)) {
        return errorJson(`Invalid angle: "${a}". Use: ${ALL_ANGLES.join(", ")}`, 400, undefined, request);
      }
    }

    const ai = new GoogleGenAI({ apiKey });
    const now = isoNow();
    const ads: Ad[] = [];
    const failures: GenerationFailure[] = [];

    // Cache image URLs per trade
    const imageUrlCache: Record<string, string | null> = {};

    for (const tradeSlug of trades) {
      const context = getTradeContext(tradeSlug)!;
      const tradeInfo = TRADE_MAP[tradeSlug];
      const tradeTerms = [...context.callScenarios];

      // Get image URL once per trade
      if (!(tradeSlug in imageUrlCache)) {
        imageUrlCache[tradeSlug] = await getExistingImageUrl(tradeSlug);
      }
      const imageUrl = imageUrlCache[tradeSlug];

      for (const platform of platforms) {
        for (const angle of angles) {
          const prompt = buildAdCopyPrompt(context, angle, platform);
          let copy: GeneratedAdCopy | null = null;
          let attempt = 0;
          let lastError = "";

          // Try up to 2 times (initial + 1 retry)
          while (attempt < 2 && !copy) {
            attempt++;
            try {
              const generated = await generateCopy(ai, prompt);
              if (!generated) {
                lastError = "Model returned empty or unparseable response";
                continue;
              }

              // Validate
              const result = validateAdCopy(generated, tradeSlug, angle, tradeTerms);
              if (result.valid) {
                copy = generated;

                // Build and save ad
                const id = `${tradeSlug}_${platform}_${angle}_${Date.now()}`;
                const campaignGroup = `gen_${tradeSlug}_${angle}`;
                const validationNotes = formatValidationNotes(result);

                const ad = normalizeAd({
                  id,
                  platform,
                  campaign_group: campaignGroup,
                  format: platform === "linkedin" ? "linkedin-single" : platform === "instagram" ? "instagram-story" : "meta-square",
                  primary_text: generated.primary_text,
                  headline: generated.headline,
                  cta: generated.cta,
                  landing_path: `/${tradeSlug}`,
                  utm_source: platform,
                  utm_medium: "paid-social",
                  utm_campaign: `gen_2026-03_${tradeSlug}_${angle}`,
                  utm_content: angle,
                  utm_term: "owners_1-10",
                  status: "pending",
                  workflow_stage: statusToWorkflowStage("pending"),
                  image_url: imageUrl,
                  creative_variant: 1,
                  angle,
                  validation_notes: validationNotes,
                  generation_model: COPY_MODEL,
                  created_at: now,
                  updated_at: now,
                });

                if (!dryRun && hasSupabase()) {
                  const dbPayload = adToDb(ad);
                  const { error } = await supabaseAdmin.from("ads").insert(dbPayload);
                  if (error) {
                    console.error(`[generate] DB insert failed for ${id}:`, error.message);
                  } else {
                    // Log activity (non-blocking)
                    logActivity({
                      entity_type: "ad",
                      entity_id: id,
                      action: "generated",
                      new_value: { angle, platform, trade: tradeSlug, model: COPY_MODEL },
                      note: `AI-generated ${angle} copy for ${tradeInfo?.label ?? tradeSlug}`,
                    }).catch(() => {});
                  }
                }

                ads.push(ad);
              } else {
                lastError = result.hardFailures.join("; ");
                // On first failure, retry (loop continues)
                copy = null;
              }
            } catch (err) {
              lastError = String(err);
            }
          }

          if (!copy) {
            failures.push({
              trade: tradeSlug,
              platform,
              angle,
              reason: lastError || "Unknown generation failure",
            });
          }
        }
      }
    }

    return okJson({
      generated: ads.length + failures.length,
      validated: ads.length,
      failed_validation: failures.length,
      dry_run: dryRun,
      ads: dryRun ? ads : ads.map((a) => ({ id: a.id, trade: a.landing_path?.replace("/", ""), platform: a.platform, angle: a.angle, headline: a.headline })),
      validation_failures: failures,
    }, 200, request);
  } catch (error) {
    console.error("[generate] Fatal error:", error);
    return errorJson("Failed to generate ads", 500, String(error), request);
  }
}
