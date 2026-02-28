"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface CreativeMeta {
  model: string;
  generated_at: string;
  hero_url: string;
  landing_url: string;
  accent_color: string;
  trade_slug: string;
  image_url: string;
  dimensions: string;
}

interface Creative {
  id: string;
  name: string;        // e.g. "rinse-instagram"
  platform: string;
  format: string;
  headline: string;    // e.g. "Rinse.City — Pressure Washing"
  primaryText: string; // ad copy
  cta: string;         // model (legacy mapping)
  landing_path: string;// hero URL (legacy mapping)
  utm_campaign: string;// JSON blob with rich metadata
  created_at: string;
  // parsed
  meta?: CreativeMeta;
  tradeSlug?: string;
}

const TRADE_LABELS: Record<string, { emoji: string; color: string }> = {
  rinse:  { emoji: "💧", color: "#3B82F6" },
  saw:    { emoji: "🪚", color: "#F97316" },
  mow:    { emoji: "🌿", color: "#22C55E" },
  rooter: { emoji: "🔧", color: "#8B5CF6" },
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📱",
  facebook:  "👥",
  linkedin:  "💼",
  youtube:   "▶️",
};

function parseCreative(raw: Record<string, unknown>): Creative {
  const c = raw as Creative;
  try {
    c.meta = JSON.parse(c.utm_campaign) as CreativeMeta;
  } catch {
    c.meta = undefined;
  }
  c.tradeSlug = c.name.split("-")[0];
  return c;
}

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs leading-relaxed text-slate-300">
        {text}
      </pre>
      <button
        onClick={() => { void navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute right-2 top-2 rounded px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function PromptBlock({ prompt }: { prompt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
      >
        <span>{open ? "▼" : "▶"}</span>
        <span>Full Generation Prompt</span>
      </button>
      {open && (
        <div className="mt-2">
          <CopyBlock text={prompt} />
        </div>
      )}
    </div>
  );
}

function CreativeCard({ c }: { c: Creative }) {
  const trade = TRADE_LABELS[c.tradeSlug ?? ""] ?? { emoji: "🏙️", color: "#64748B" };
  const icon = PLATFORM_ICONS[c.platform] ?? "📢";
  const imageUrl = c.meta?.image_url;
  const model = c.meta?.model ?? c.cta ?? "—";
  const heroUrl = c.meta?.hero_url ?? c.landing_path ?? "—";
  const generatedAt = c.meta?.generated_at ? new Date(c.meta.generated_at).toLocaleDateString() : "—";
  const dimensions = c.meta?.dimensions ?? c.format ?? "—";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
      {/* Image */}
      <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={c.name}
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <p className="text-slate-500 text-sm">No image</p>
        )}
      </div>

      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: trade.color }}
            >
              {trade.emoji} {c.headline?.split("—")[0]?.trim() ?? c.tradeSlug}
            </span>
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
              {icon} {c.platform}
            </span>
          </div>
          <span className="text-xs text-slate-500">{dimensions}</span>
        </div>

        {/* Ad Copy */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Ad Copy</p>
          <CopyBlock text={c.primaryText || c.primary_text || ""} />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-500">Model</span>
            <p className="font-mono text-slate-300 truncate">{model}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Generated</span>
            <p className="text-slate-300">{generatedAt}</p>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-slate-500">Hero Asset</span>
            <a href={heroUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-blue-400 hover:underline">
              {heroUrl}
            </a>
          </div>
          {c.meta?.landing_url && (
            <div className="col-span-2">
              <span className="font-semibold text-slate-500">Landing Page</span>
              <a href={c.meta.landing_url} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline">
                {c.meta.landing_url}
              </a>
            </div>
          )}
        </div>

        {/* Full Prompt (collapsible) */}
        {c.utm_campaign && (
          <PromptBlock prompt={
            `--- GENERATION BRIEF ---\nTrade:     ${c.headline}\nPlatform:  ${c.platform} (${dimensions})\nModel:     ${model}\nHero URL:  ${heroUrl}\nLanding:   ${c.meta?.landing_url ?? "—"}\nGenerated: ${generatedAt}\n\n--- AD COPY ---\n${c.primaryText || (c as unknown as Record<string,string>).primary_text || ""}`.trimEnd()
          } />
        )}

        {/* Actions */}
        {imageUrl && (
          <div className="flex gap-2 pt-1">
            <a
              href={imageUrl}
              download={`${c.name}-ad.png`}
              className="flex-1 rounded-md bg-slate-700 px-3 py-1.5 text-center text-xs font-medium text-slate-200 hover:bg-slate-600"
            >
              ⬇ Download
            </a>
            <button
              onClick={() => { void navigator.clipboard.writeText(imageUrl); alert("Image URL copied!"); }}
              className="flex-1 rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600"
            >
              🔗 Copy URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreativesPage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/templates", { cache: "no-store" })
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        setCreatives(data.map(parseCreative));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const trades = ["all", ...Array.from(new Set(creatives.map(c => c.tradeSlug ?? "").filter(Boolean)))];

  const filtered = filter === "all" ? creatives : creatives.filter(c => c.tradeSlug === filter);

  // Group by trade
  const grouped = filtered.reduce<Record<string, Creative[]>>((acc, c) => {
    const key = c.tradeSlug ?? "unknown";
    (acc[key] ??= []).push(c);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading creatives…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ad Creatives</h1>
          <p className="mt-1 text-sm text-slate-400">
            {creatives.length} creatives — prompts, assets, and model metadata for every ad
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {trades.map(t => {
            const info = TRADE_LABELS[t];
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === t
                    ? "bg-green-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                style={filter === t && info ? { backgroundColor: info.color } : {}}
              >
                {info?.emoji} {t === "all" ? "All Trades" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grouped by trade */}
      {Object.entries(grouped).map(([trade, cards]) => {
        const info = TRADE_LABELS[trade];
        const tradeLabel = cards[0]?.headline ?? trade;
        return (
          <section key={trade}>
            <div className="mb-4 flex items-center gap-3">
              <div
                className="h-1 w-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: info?.color ?? "#64748B", width: 12, height: 12 }}
              />
              <h2 className="text-lg font-semibold text-white">
                {info?.emoji} {tradeLabel}
              </h2>
              <span className="text-xs text-slate-500">{cards.length} creatives</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map(c => <CreativeCard key={c.id} c={c} />)}
            </div>
          </section>
        );
      })}

      {!creatives.length && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
          No creatives found. Generate some from the AI Studio.
        </div>
      )}
    </div>
  );
}
