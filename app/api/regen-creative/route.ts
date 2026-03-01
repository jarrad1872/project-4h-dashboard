/**
 * POST /api/regen-creative
 * Regenerate a single trade creative image via Gemini NB2 and overwrite it in Supabase Storage.
 *
 * Body:
 *   storagePath  — path within the bucket, e.g. "nb2-creatives/coat-c1.jpg"
 *   prompt       — user's custom prompt describing the image to generate
 *   label        — optional label for logging (e.g. "coat C1 — Hands-on zoom")
 */

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MODEL = "gemini-3.1-flash-image-preview";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "ad-creatives";

interface RegenRequest {
  storagePath: string;
  prompt: string;
  label?: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: { data?: string; mimeType?: string };
}

const ISOMETRIC_STYLE =
  "Style: professional isometric 3D illustration, Blender-quality render, Pixar-inspired diorama. " +
  "Rich saturated colors. Deep dark navy #0f172a background. " +
  "Dramatic three-point cinematic lighting — key light upper-left, fill right, rim outline. " +
  "No text. No logos. No words anywhere in the image. Square composition. High resolution.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RegenRequest>;

    if (!body.storagePath || !body.prompt?.trim()) {
      return NextResponse.json({ error: "storagePath and prompt are required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    // Build the full generation prompt
    const fullPrompt = `${body.prompt.trim()}. ${ISOMETRIC_STYLE}`;

    // Generate with Gemini NB2
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: fullPrompt,
      config: { responseModalities: ["TEXT", "IMAGE"] },
    });

    // Extract the image
    const parts: GeminiPart[] = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);
    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ error: "Gemini returned no image data" }, { status: 502 });
    }

    const imgBuffer = Buffer.from(imagePart.inlineData.data, "base64");

    // Upload to Supabase Storage (overwrite)
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${body.storagePath}`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
      },
      body: imgBuffer,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      return NextResponse.json({ error: `Storage upload failed: ${text}` }, { status: 502 });
    }

    // Return the public URL with cache-busting param
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${body.storagePath}?t=${Date.now()}`;
    return NextResponse.json({ url: publicUrl, label: body.label ?? body.storagePath });
  } catch (err) {
    console.error("[regen-creative]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
