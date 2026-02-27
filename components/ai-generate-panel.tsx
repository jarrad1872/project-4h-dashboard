"use client";

import { useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import type { AdPlatform } from "@/lib/types";

type Variation = { headline: string; primaryText: string };

const tones = ["Direct", "Friendly", "Urgent", "Authority", "Practical"];

export function AIGeneratePanel({
  platform,
  onUseVariation,
}: {
  platform: AdPlatform;
  onUseVariation: (variation: Variation) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState(tones[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          prompt,
          tone,
          count: 2,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to generate copy");
      }

      setVariations(Array.isArray(data?.variations) ? data.variations : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate copy");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-base font-semibold">🤖 AI Generate</h3>
      <textarea
        className="w-full rounded border border-slate-600 bg-slate-900 p-2 text-sm"
        rows={3}
        placeholder="Describe the ad angle or audience you want..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Platform
          <select
            disabled
            className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2 text-sm text-slate-300"
            value={platform}
          >
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>
        </label>

        <label className="text-sm">
          Tone
          <select
            className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2 text-sm"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            {tones.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Button onClick={generate} disabled={loading || !prompt.trim()}>
        {loading ? "Generating..." : "Generate Variations"}
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="space-y-3">
        {variations.map((variation, idx) => (
          <div key={`${variation.headline}-${idx}`} className="rounded border border-slate-700 bg-slate-900 p-3">
            <p className="text-sm font-semibold">Variation {idx + 1}: {variation.headline}</p>
            <p className="mt-1 text-sm text-slate-300">{variation.primaryText}</p>
            <GhostButton className="mt-3" onClick={() => onUseVariation(variation)}>
              Use This
            </GhostButton>
          </div>
        ))}
      </div>
    </Card>
  );
}
