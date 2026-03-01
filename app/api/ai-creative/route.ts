import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import sharp from "sharp";
import {
  buildCreativePrompt,
  type CreativeFormat,
  FORMAT_SPECS,
  getTradeBySlug,
  type CreativeStyle,
} from "@/lib/ai-creative";

// Nano Banana 2 (NB2)
const MODEL_NAME = "gemini-3.1-flash-image-preview"; // NB2 = Nano Banana 2 = Gemini 3.1 Flash Image

interface AiCreativeRequest {
  trade: string;
  domain?: string;
  appName?: string;
  format: CreativeFormat;
  style: CreativeStyle;
  customPrompt?: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    data?: string;
    mimeType?: string;
  };
}

function isFormat(value: string): value is CreativeFormat {
  return value in FORMAT_SPECS;
}

function isStyle(value: string): value is CreativeStyle {
  return value === "pain-point" || value === "feature-demo" || value === "social-proof" || value === "retargeting";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AiCreativeRequest>;

    if (!body.trade || !body.format || !body.style) {
      return NextResponse.json({ error: "trade, format, and style are required" }, { status: 400 });
    }

    if (!isFormat(body.format)) {
      return NextResponse.json(
        { error: `Invalid format. Use one of: ${Object.keys(FORMAT_SPECS).join(", ")}` },
        { status: 400 },
      );
    }

    if (!isStyle(body.style)) {
      return NextResponse.json(
        { error: "Invalid style. Use one of: pain-point, feature-demo, social-proof, retargeting" },
        { status: 400 },
      );
    }

    const tradeEntry = getTradeBySlug(body.trade);
    const domain = body.domain?.trim() || tradeEntry?.domain;
    const appName = body.appName?.trim() || tradeEntry?.appName;

    if (!domain || !appName) {
      return NextResponse.json(
        { error: "domain and appName are required (or pass a trade from the registry)" },
        { status: 400 },
      );
    }

    const prompt = buildCreativePrompt({
      trade: body.trade,
      domain,
      appName,
      format: body.format,
      style: body.style,
      customPrompt: body.customPrompt,
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Ensure we're using the correct SDK pattern for image generation
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    const parts = (response.candidates?.[0]?.content?.parts ?? []) as GeminiPart[];
    const imagePart = parts.find((part) => Boolean(part.inlineData?.data));

    if (!imagePart?.inlineData?.data) {
      const modelText = parts
        .map((part) => part.text)
        .filter(Boolean)
        .join("\n")
        .trim();

      return NextResponse.json(
        {
          error: "Model returned no image data",
          prompt,
          model: MODEL_NAME,
          modelText,
        },
        { status: 502 },
      );
    }

    const target = FORMAT_SPECS[body.format];
    const sourceBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    
    // NB2 returns 1:1 by default. We resize to target format.
    const pngBuffer = await sharp(sourceBuffer)
      .resize(target.width, target.height, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer();

    return NextResponse.json({
      imageBase64: pngBuffer.toString("base64"),
      mimeType: "image/png",
      prompt,
      model: MODEL_NAME,
    });
  } catch (error) {
    console.error("/api/ai-creative error", error);
    return NextResponse.json({ error: "Failed to generate creative", details: String(error) }, { status: 500 });
  }
}