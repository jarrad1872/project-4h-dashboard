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
  driveLink?: string | null;
}

const styleOptions: CreativeStyle[] = ["pain-point", "feature-demo", "social-proof", "retargeting"];
const formatOptions = Object.entries(FORMAT_SPECS) as [CreativeFormat, (typeof FORMAT_SPECS)[CreativeFormat]][];

const ASSET_SLOTS = [
  { key: "hero_a", label: "Hero A (Zoom)" },
  { key: "hero_b", label: "Hero B (Wide)" },
  { key: "og_nb2", label: "OG (NB2)" },
];

export default function GeneratePage() {
  const [trade, setTrade] = useState<string>(TRADE_DOMAIN_REGISTRY[0]?.slug ?? "pipe");
  const [format, setFormat] = useState<CreativeFormat>("linkedin-single");
  const [style, setStyle] = useState<CreativeStyle>("pain-point");
  const [targetSlot, setTargetSlot] = useState<string>("hero_a");
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

  async function saveToAssets() {
    if (!creative || !selectedTrade) return;
    setLoading(true);
    setSavedNotice(null);

    try {
      const res = await fetch("/api/trade-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade_slug: selectedTrade.slug,
          asset_type: targetSlot,
          imageBase64: creative.imageBase64,
          notes: `Generated via AI Studio (Style: ${style}, Format: ${format})`,
        }),
      });

      if (!res.ok) throw new Error("Failed to save asset");
      setSavedNotice(`Successfully saved to ${selectedTrade.slug} ${targetSlot} slot.`);
    } catch (err) {
      setError("Failed to push to trade assets.");
    } finally {
      setLoading(false);
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Creative Studio</h1>
          <p className="mt-1 text-sm text-slate-400">Generate and stage trade assets using Nano Banana 2.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                Model: NB2 (Gemini 3.1)
            </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 h-fit">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Configuration</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs">
                    <span className="font-bold uppercase text-slate-500">Target Trade</span>
                    <select
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    >
                    {TRADE_DOMAIN_REGISTRY.map((entry) => (
                        <option key={entry.slug} value={entry.slug}>
                        Tier {entry.tier} · {entry.trade}
                        </option>
                    ))}
                    </select>
                </label>

                <label className="space-y-1.5 text-xs">
                    <span className="font-bold uppercase text-slate-500">Campaign Style</span>
                    <select
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
                    value={style}
                    onChange={(e) => setStyle(e.target.value as CreativeStyle)}
                    >
                    {styleOptions.map((option) => (
                        <option key={option} value={option}>{styleLabel(option)}</option>
                    ))}
                    </select>
                </label>
            </div>

            <div className="space-y-1.5 text-xs">
            <span className="font-bold uppercase text-slate-500">Output Format</span>
            <div className="grid gap-2 grid-cols-2">
                {formatOptions.map(([key, spec]) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => setFormat(key)}
                    className={[
                    "rounded-md border p-3 text-left transition-all",
                    format === key
                        ? "border-white bg-white/5 shadow-inner"
                        : "border-slate-700 bg-slate-900 hover:border-slate-500",
                    ].join(" ")}
                >
                    <p className={`text-xs font-black ${format === key ? "text-white" : "text-slate-400"}`}>{spec.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                    {spec.width}×{spec.height}
                    </p>
                </button>
                ))}
            </div>
            </div>

            <label className="block space-y-1.5 text-xs">
            <span className="font-bold uppercase text-slate-500">Prompt Override</span>
            <textarea
                rows={4}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
                placeholder="Leave blank for trade-aware prompt system."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
            />
            </label>

            <div className="pt-2">
            <Button onClick={generateCreative} disabled={loading} className="w-full py-4 text-base font-black uppercase tracking-widest">
                {loading ? "Generating Image…" : "Run Nano Banana 2"}
            </Button>
            </div>
        </Card>

        <div className="space-y-6">
            {!creative && (
                <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-500">
                    <span className="text-4xl mb-4 opacity-20">🎨</span>
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-40">Ready for generation</p>
                </div>
            )}

            {creative && dataUrl && (
                <Card className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={dataUrl} alt="AI generated ad creative" className="w-full shadow-2xl" />
                    </div>

                    <div className="p-2 space-y-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase text-slate-500">Master Asset Staging</span>
                            <div className="flex gap-2">
                                <select
                                    value={targetSlot}
                                    onChange={(e) => setTargetSlot(e.target.value)}
                                    className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-500"
                                >
                                    {ASSET_SLOTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                                <Button onClick={saveToAssets} disabled={loading} className="bg-white text-slate-950 px-6 font-bold uppercase text-[10px]">
                                    Push to Trade Assets
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                            <GhostButton onClick={downloadCreative} className="text-[10px] font-bold uppercase">Download Local</GhostButton>
                            <GhostButton onClick={generateCreative} disabled={loading} className="text-[10px] font-bold uppercase">Regenerate</GhostButton>
                        </div>
                    </div>

                    {creative.driveLink && (
                        <a
                            href={creative.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded border border-blue-800/40 bg-blue-950/20 px-3 py-2 text-[11px] font-bold text-blue-400 hover:text-blue-300 animate-in zoom-in-95 duration-300"
                        >
                            ☁ Backed up to Drive →
                        </a>
                    )}

                    {savedNotice && (
                        <div className="rounded border border-green-800/40 bg-green-950/20 px-3 py-2 text-[11px] font-bold text-green-400 animate-in zoom-in-95 duration-300">
                            ✓ {savedNotice}
                        </div>
                    )}

                    {error && (
                         <div className="rounded border border-red-800/40 bg-red-950/20 px-3 py-2 text-[11px] font-bold text-red-400">
                            ✗ {error}
                        </div>
                    )}

                    <details className="rounded border border-slate-800 bg-slate-950 p-3 text-[10px] text-slate-500">
                        <summary className="cursor-pointer font-bold uppercase text-slate-400 hover:text-slate-300 transition-colors">Prompt & Metadata</summary>
                        <div className="mt-4 space-y-2">
                            <p><span className="font-bold text-slate-400">Model:</span> {creative.model}</p>
                            <pre className="whitespace-pre-wrap bg-slate-900 p-2 rounded border border-slate-800 leading-relaxed">{creative.prompt}</pre>
                        </div>
                    </details>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}