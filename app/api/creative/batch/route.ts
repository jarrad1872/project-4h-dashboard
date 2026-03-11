import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import {
  buildCreativePrompt,
  type CreativeFormat,
  type CreativeStyle,
  FORMAT_SPECS,
  getTradeBySlug,
} from "@/lib/ai-creative";
import { backupImageToDrive } from "@/lib/drive-backup";

// Nano Banana 2 (NB2)
const MODEL_NAME = "gemini-3.1-flash-image-preview";

interface GeminiPart {
  text?: string;
  inlineData?: {
    data?: string;
    mimeType?: string;
  };
}

interface BatchJob {
  trade: string;
  format: CreativeFormat;
  style: CreativeStyle;
  customPrompt?: string;
}

interface BatchRequest {
  jobs: BatchJob[];
  push_to_assets?: boolean;
}

interface BatchResult {
  trade: string;
  format: string;
  style: string;
  status: "ok" | "error";
  image_url?: string;
  imageBase64?: string;
  driveLink?: string | null;
  error?: string;
}

function isFormat(value: string): value is CreativeFormat {
  return value in FORMAT_SPECS;
}

function isStyle(value: string): value is CreativeStyle {
  return ["pain-point", "feature-demo", "social-proof", "retargeting"].includes(value);
}

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const rl = checkRateLimit(rateLimitKey(request), { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorJson("Rate limit exceeded", 429);
  }

  try {
    const body = (await request.json()) as Partial<BatchRequest>;

    if (!Array.isArray(body.jobs) || body.jobs.length === 0) {
      return errorJson("jobs array is required and must not be empty", 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return errorJson("Missing GEMINI_API_KEY", 500);
    }

    const ai = new GoogleGenAI({ apiKey });
    const results: BatchResult[] = [];
    let succeeded = 0;
    let failed = 0;

    // Run sequentially to avoid rate limits
    for (const job of body.jobs) {
      const { trade, format, style, customPrompt } = job;

      if (!trade || !format || !style) {
        results.push({ trade: trade ?? "unknown", format: format ?? "unknown", style: style ?? "unknown", status: "error", error: "trade, format, and style are required" });
        failed++;
        continue;
      }

      if (!isFormat(format)) {
        results.push({ trade, format, style, status: "error", error: `Invalid format: ${format}. Use one of: ${Object.keys(FORMAT_SPECS).join(", ")}` });
        failed++;
        continue;
      }

      if (!isStyle(style)) {
        results.push({ trade, format, style, status: "error", error: "Invalid style. Use one of: pain-point, feature-demo, social-proof, retargeting" });
        failed++;
        continue;
      }

      const tradeEntry = getTradeBySlug(trade);
      const domain = tradeEntry?.domain;
      const appName = tradeEntry?.appName;

      if (!domain || !appName) {
        results.push({ trade, format, style, status: "error", error: `Trade slug '${trade}' not found in registry` });
        failed++;
        continue;
      }

      try {
        const prompt = buildCreativePrompt({ trade, domain, appName, format, style, customPrompt });

        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: { responseModalities: ["Text", "Image"] },
        });

        const parts = (response.candidates?.[0]?.content?.parts ?? []) as GeminiPart[];
        const imagePart = parts.find((part) => Boolean(part.inlineData?.data));

        if (!imagePart?.inlineData?.data) {
          results.push({ trade, format, style, status: "error", error: "Model returned no image data" });
          failed++;
          continue;
        }

        const target = FORMAT_SPECS[format];
        const sourceBuffer = Buffer.from(imagePart.inlineData.data, "base64");
        const pngBuffer = await sharp(sourceBuffer)
          .resize(target.width, target.height, { fit: "cover" })
          .png({ compressionLevel: 9 })
          .toBuffer();
        const pngBase64 = pngBuffer.toString("base64");

        // Backup to Google Drive (non-blocking)
        const driveLink = await backupImageToDrive({
          trade,
          format,
          style,
          imageBase64: pngBase64,
          mimeType: "image/png",
        }).catch((e) => {
          console.error("[drive-backup] batch backup failed:", e);
          return null;
        });

        results.push({
          trade,
          format,
          style,
          status: "ok",
          imageBase64: pngBase64,
          driveLink,
        });
        succeeded++;
      } catch (err) {
        results.push({ trade, format, style, status: "error", error: String(err) });
        failed++;
      }
    }

    return okJson({
      total: body.jobs.length,
      succeeded,
      failed,
      results,
    });
  } catch (err) {
    return errorJson("Batch creative generation failed", 500, String(err));
  }
}
