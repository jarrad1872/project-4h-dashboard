"use client";

import { useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import {
  type CreativeFormat,
  FORMAT_SPECS,
  getTradeBySlug,
  type CreativeStyle,
  styleLabel,
  TRADE_DOMAIN_REGISTRY,
} from "@/lib/ai-creative";

interface CreativeResponse {
  imageBase64: string;
  mimeType: string;
  prompt: string;
  model: string;
}

const styleOptions: CreativeStyle[] = ["pain-point", "feature-demo", "social-proof", "retargeting"];
const formatOptions = Object.entries(FORMAT_SPECS) as [CreativeFormat, (typeof FORMAT_SPECS)[CreativeFormat]][];

export default function GeneratePage() {
  const [trade, setTrade] = useState<string>(TRADE_DOMAIN_REGISTRY[0]?.slug ?? "concrete-cutting");
  const [format, setFormat] = useState<CreativeFormat>("linkedin-single");
  const [style, setStyle] = useState<CreativeStyle>("pain-point");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [creative, setCreative] = useState<CreativeResponse | null>(null);

  const selectedTrade = useMemo(() => getTradeBySlug(trade) ?? TRADE_DOMAIN_REGISTRY[0], [trade]);

  const dataUrl = creative ? `data:${creative.mimeType};base64,${creative.imageBase64}` : null;

  async function generateCreative() {
    if (!selectedTrade) return;

    setLoading(true);
    setError(null);
    setSavedNotice(null);

    try {
      const res = await fetch("/api/ai-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade: selectedTrade.slug,
          domain: selectedTrade.domain,
          appName: selectedTrade.appName,
          format,
          style,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      const data = (await res.json()) as CreativeResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate creative");
      }

      setCreative(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown generation error");
    } finally {
      setLoading(false);
    }
  }

  function saveToLibrary() {
    if (!creative || !selectedTrade) return;

    try {
      const key = "ai-creative-library";
      const nextRecord = {
        id: `creative-${Date.now()}`,
        createdAt: new Date().toISOString(),
        trade: selectedTrade.slug,
        domain: selectedTrade.domain,
        appName: selectedTrade.appName,
        format,
        style,
        prompt: creative.prompt,
        mimeType: creative.mimeType,
        imageBase64: creative.imageBase64,
      };

      const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      const trimmed = [nextRecord, ...existing].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(trimmed));
      setSavedNotice("Saved to browser creative library.");
    } catch {
      setSavedNotice("Could not save to local library on this browser.");
    }
  }

  function downloadCreative() {
    if (!dataUrl || !selectedTrade) return;

    const link = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = dataUrl;
    link.download = `${selectedTrade.slug}-${format}-${style}-${stamp}.png`;
    link.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Creative Studio</h1>
        <p className="mt-1 text-sm text-slate-400">Generate trade-specific ad creatives with Nano Banana Pro.</p>
      </div>

      <Card className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Trade</span>
            <select
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
            >
              {TRADE_DOMAIN_REGISTRY.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  Tier {entry.tier} · {entry.trade} ({entry.domain})
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 text-sm">
            <span className="text-slate-300">Style</span>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStyle(option)}
                  className={[
                    "rounded-md border px-3 py-2 text-left text-sm",
                    style === option
                      ? "border-green-400 bg-green-500/15 text-green-300"
                      : "border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800",
                  ].join(" ")}
                >
                  {styleLabel(option)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <span className="text-slate-300">Format</span>
          <div className="grid gap-2 md:grid-cols-2">
            {formatOptions.map(([key, spec]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormat(key)}
                className={[
                  "rounded-md border px-3 py-3 text-left",
                  format === key
                    ? "border-green-400 bg-green-500/10"
                    : "border-slate-600 bg-slate-900 hover:bg-slate-800",
                ].join(" ")}
              >
                <p className="font-semibold text-slate-100">{spec.label}</p>
                <p className="text-xs text-slate-400">
                  {spec.width}×{spec.height} · {spec.note}
                </p>
              </button>
            ))}
          </div>
        </div>

        <label className="block space-y-2 text-sm">
          <span className="text-slate-300">Custom Prompt (optional override)</span>
          <textarea
            rows={5}
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
            placeholder="Optional. Leave blank to use trade-aware prompt templates."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generateCreative} disabled={loading}>
            {loading ? "Generating…" : "Generate"}
          </Button>
          <GhostButton onClick={generateCreative} disabled={loading || !creative}>
            Regenerate
          </GhostButton>
        </div>
      </Card>

      {error && <p className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

      {creative && dataUrl && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Generated Creative</h2>
            <p className="text-xs text-slate-400">
              {selectedTrade?.appName} · {FORMAT_SPECS[format].width}×{FORMAT_SPECS[format].height} · {styleLabel(style)}
            </p>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-700 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="AI generated ad creative" className="w-full" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveToLibrary}>Approve &amp; Save to Library</Button>
            <GhostButton onClick={downloadCreative}>Download</GhostButton>
            <GhostButton onClick={generateCreative} disabled={loading}>
              Regenerate
            </GhostButton>
          </div>

          {savedNotice && <p className="text-sm text-green-300">{savedNotice}</p>}

          <details className="rounded border border-slate-700 bg-slate-900 p-3 text-xs text-slate-400">
            <summary className="cursor-pointer text-slate-300">Prompt + Model Details</summary>
            <p className="mt-2">Model: {creative.model}</p>
            <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed">{creative.prompt}</pre>
          </details>
        </Card>
      )}
    </div>
  );
}
