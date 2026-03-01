"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import type { AdPlatform } from "@/lib/types";
import type { CreativeFormat, CreativeStyle } from "@/lib/ai-creative";

const PLATFORM_FORMAT_MAP: Record<AdPlatform, CreativeFormat> = {
  linkedin: "linkedin-single",
  facebook: "meta-square",
  instagram: "instagram-story",
  youtube: "youtube-thumb",
};

const STYLES: { value: CreativeStyle; label: string }[] = [
  { value: "pain-point", label: "Pain Point" },
  { value: "feature-demo", label: "Feature Demo" },
  { value: "social-proof", label: "Social Proof" },
  { value: "retargeting", label: "Retargeting" },
];

export function AIGeneratePanel({
  trade = "saw",
  platform,
  onUseVariation,
}: {
  trade?: string;
  platform: AdPlatform;
  /** @deprecated — panel now generates image creatives, not text variations */
  onUseVariation?: (variation: { headline: string; primaryText: string }) => void;
}) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [style, setStyle] = useState<CreativeStyle>("pain-point");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/png");

  const format = PLATFORM_FORMAT_MAP[platform] ?? "linkedin-single";

  async function generate() {
    setLoading(true);
    setError(null);
    setImageBase64(null);

    try {
      const res = await fetch("/api/ai-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade,
          format,
          style,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to generate creative");
      }

      setImageBase64(data.imageBase64 ?? null);
      setImageMime(data.mimeType ?? "image/png");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate creative");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-base font-semibold">🎨 AI Generate Creative</h3>
      <textarea
        className="w-full rounded border border-slate-600 bg-slate-900 p-2 text-sm"
        rows={3}
        placeholder="Optional: describe the angle, audience, or scene you want…"
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Platform / Format
          <select
            disabled
            className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2 text-sm text-slate-300"
            value={platform}
          >
            <option value="linkedin">LinkedIn ({format})</option>
            <option value="youtube">YouTube ({format})</option>
            <option value="facebook">Facebook ({format})</option>
            <option value="instagram">Instagram ({format})</option>
          </select>
        </label>

        <label className="text-sm">
          Style
          <select
            className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2 text-sm"
            value={style}
            onChange={(e) => setStyle(e.target.value as CreativeStyle)}
          >
            {STYLES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Button onClick={generate} disabled={loading}>
        {loading ? "Generating…" : "Generate Creative"}
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {imageBase64 && (
        <div className="rounded border border-slate-700 bg-slate-900 p-2">
          <img
            src={`data:${imageMime};base64,${imageBase64}`}
            alt="Generated creative"
            className="w-full rounded"
          />
        </div>
      )}
    </Card>
  );
}
