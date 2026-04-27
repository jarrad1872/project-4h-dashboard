"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { summarizeBeachheadImagePack } from "@/lib/beachhead-image-pack";
import {
  DEFAULT_CREATIVE_ASSET_FILTERS,
  filterCreativeAssets,
  type CreativeAssetGenerationFilter,
} from "@/lib/creative-asset-filters";
import {
  DEFAULT_CREATIVE_TOOL,
  formatCreativeAssetAngleLabel,
  formatCreativeAssetStatusLabel,
  summarizeCreativePipeline,
} from "@/lib/growth-command-center";
import {
  BEACHHEAD_IMAGE_TRADES,
  CHATGPT_IMAGE_MODEL,
  IMAGE_CREATIVE_ANGLES,
  IMAGE_CREATIVE_PLATFORMS,
} from "@/lib/image-creative-briefs";
import type { CreativeAsset, CreativeAssetAngle, CreativeAssetPlatform, CreativeAssetStatus } from "@/lib/types";

const STATUS_OPTIONS: CreativeAssetStatus[] = ["draft", "review", "approved"];
const FILTER_STATUS_OPTIONS: CreativeAssetStatus[] = ["draft", "review", "approved", "live"];
const ANGLE_OPTIONS: CreativeAssetAngle[] = ["missed-call", "demo-call", "owner-agent", "roi-math", "voice-boss", "demo", "math"];
const PLATFORM_OPTIONS: CreativeAssetPlatform[] = ["multi", "youtube", "instagram", "facebook", "linkedin"];
const GENERATION_OPTIONS: { value: CreativeAssetGenerationFilter; label: string }[] = [
  { value: "all", label: "All generation" },
  { value: "brief", label: "Prompt brief" },
  { value: "needs-generation", label: "Needs image" },
  { value: "generated", label: "Generated" },
  { value: "review-ready", label: "Review-ready" },
];

const EMPTY_FORM = {
  title: "",
  trade_slug: "pipe",
  angle: "missed-call" as CreativeAssetAngle,
  tool_used: DEFAULT_CREATIVE_TOOL,
  target_platform: "multi" as CreativeAssetPlatform,
  asset_url: "",
  thumbnail_url: "",
  prompt_text: "",
  negative_prompt: "",
  notes: "",
};

const EMPTY_CONCEPT_FORM = {
  trade_slug: "pipe",
  angle: "missed-call" as (typeof IMAGE_CREATIVE_ANGLES)[number],
  target_platform: "multi" as CreativeAssetPlatform,
};

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [conceptForm, setConceptForm] = useState(EMPTY_CONCEPT_FORM);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetUploads, setAssetUploads] = useState<Record<string, File | null>>({});
  const [variantDirections, setVariantDirections] = useState<Record<string, string>>({});
  const [variantErrors, setVariantErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState(DEFAULT_CREATIVE_ASSET_FILTERS);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/creative-assets", { cache: "no-store" });
    const data = await response.json();
    setAssets(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createAsset() {
    setSavingId("new");
    const uploadPayload =
      assetFile !== null
        ? {
            upload_base64: await fileToBase64(assetFile),
            upload_file_name: assetFile.name,
            upload_content_type: assetFile.type,
            upload_target: "asset",
          }
        : {};

    await fetch("/api/creative-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        thumbnail_url: form.thumbnail_url || null,
        asset_url: form.asset_url || null,
        prompt_text: form.prompt_text || null,
        negative_prompt: form.negative_prompt || null,
        notes: form.notes || null,
        provider: "chatgpt-pro",
        model: form.tool_used,
        generation_status: assetFile ? "generated" : "manual",
        ...uploadPayload,
      }),
    });

    setForm(EMPTY_FORM);
    setAssetFile(null);
    setSavingId(null);
    await load();
  }

  async function createImageConcept() {
    setSavingId("concept");
    await fetch("/api/image-concepts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(conceptForm),
    });
    setSavingId(null);
    await load();
  }

  async function createPromptSet() {
    setSavingId("concept-set");
    await fetch("/api/image-concepts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch: true,
        target_platform: conceptForm.target_platform,
      }),
    });
    setSavingId(null);
    await load();
  }

  async function createReplacementVariant(asset: CreativeAsset) {
    const savingKey = `variant-${asset.id}`;
    const revisionInstruction =
      variantDirections[asset.id]?.trim() ||
      "Create a stronger replacement that keeps the same trade, offer, and visible proof while fixing the weakest visual issue.";

    setSavingId(savingKey);
    const response = await fetch("/api/image-concepts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parent_asset_id: asset.id,
        revision_instruction: revisionInstruction,
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setVariantErrors((current) => ({
        ...current,
        [asset.id]: data?.error ?? "Failed to create replacement variant.",
      }));
      setSavingId(null);
      return;
    }

    setVariantErrors((current) => ({ ...current, [asset.id]: "" }));
    setVariantDirections((current) => ({ ...current, [asset.id]: "" }));
    setSavingId(null);
    await load();
  }

  async function copyGenerationPacket(asset: CreativeAsset) {
    const packet = [
      `Model: ${asset.model ?? DEFAULT_CREATIVE_TOOL}`,
      `Provider: ${asset.provider ?? "chatgpt-pro"}`,
      `Trade: ${asset.trade_slug}`,
      `Angle: ${formatCreativeAssetAngleLabel(asset.angle)}`,
      `Platform: ${asset.target_platform}`,
      `Dimensions: ${asset.dimensions ?? "Use the platform crop from the prompt"}`,
      asset.source_image_url ? `Source image: ${asset.source_image_url}` : null,
      "",
      "Prompt:",
      asset.prompt_text ?? "",
      "",
      "Avoid:",
      asset.negative_prompt ?? "",
      "",
      "Output:",
      "Generate one paid-social image. Keep any text minimal and legible. Do not publish or launch the asset.",
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    await navigator.clipboard.writeText(packet);
    setCopiedId(asset.id);
  }

  async function updateAsset(id: string, patch: Partial<CreativeAsset>) {
    setSavingId(id);
    await fetch(`/api/creative-assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSavingId(null);
    await load();
  }

  async function uploadGeneratedAsset(asset: CreativeAsset) {
    const file = assetUploads[asset.id];
    if (!file) return;

    setSavingId(asset.id);
    await fetch(`/api/creative-assets/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upload_base64: await fileToBase64(file),
        upload_file_name: file.name,
        upload_content_type: file.type,
        upload_target: "asset",
        generation_status: "generated",
        status: "review",
        notes: asset.notes ?? "Generated image uploaded for Jarrad review.",
      }),
    });
    setAssetUploads((current) => ({ ...current, [asset.id]: null }));
    setSavingId(null);
    await load();
  }

  async function deleteAsset(id: string) {
    if (!window.confirm("Delete this creative asset?")) return;
    setSavingId(id);
    await fetch(`/api/creative-assets/${id}`, { method: "DELETE" });
    setSavingId(null);
    await load();
  }

  const filteredAssets = useMemo(() => filterCreativeAssets(assets, filters), [assets, filters]);
  const tradeOptions = useMemo(
    () => Array.from(new Set(assets.map((asset) => asset.trade_slug))).sort((a, b) => a.localeCompare(b)),
    [assets],
  );
  const summary = summarizeCreativePipeline(filteredAssets);
  const imagePack = useMemo(() => summarizeBeachheadImagePack(assets), [assets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Creative Lab</h1>
          <p className="mt-1 text-sm text-slate-400">
            ChatGPT Pro image prompts, generated assets, and approval tracking. Jarrad approval still gates anything marked live.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {filteredAssets.length} shown / {assets.length} assets tracked
        </p>
      </div>

      <Card className="space-y-3">
        <div className="grid gap-3 md:grid-cols-5">
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value as CreativeAssetStatus | "all" }))
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            <option value="all">All status</option>
            {FILTER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatCreativeAssetStatusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={filters.trade_slug}
            onChange={(event) => setFilters((current) => ({ ...current, trade_slug: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            <option value="all">All trades</option>
            {tradeOptions.map((trade) => (
              <option key={trade} value={trade}>
                {trade}.city
              </option>
            ))}
          </select>
          <select
            value={filters.angle}
            onChange={(event) =>
              setFilters((current) => ({ ...current, angle: event.target.value as CreativeAssetAngle | "all" }))
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            <option value="all">All angles</option>
            {ANGLE_OPTIONS.map((angle) => (
              <option key={angle} value={angle}>
                {formatCreativeAssetAngleLabel(angle)}
              </option>
            ))}
          </select>
          <select
            value={filters.generation}
            onChange={(event) =>
              setFilters((current) => ({ ...current, generation: event.target.value as CreativeAssetGenerationFilter }))
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            {GENERATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <GhostButton onClick={() => setFilters(DEFAULT_CREATIVE_ASSET_FILTERS)}>Clear filters</GhostButton>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Draft", value: summary.draft, color: "text-slate-200" },
          { label: "Review", value: summary.review, color: "text-amber-300" },
          { label: "Approved", value: summary.approved, color: "text-emerald-300" },
          { label: "Live", value: summary.live, color: "text-cyan-300" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${item.color}`}>{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-cyan-900/60 bg-cyan-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Q-01 image pack</p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {imagePack.generated} / {imagePack.expectedTotal} generated, {imagePack.remaining} remaining
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {imagePack.complete
                ? "The first beachhead pack is uploaded and in review. Jarrad approval still gates live use."
                : "Copy a packet, generate the image here with ChatGPT Pro, upload it on the same card, then send it to review."}
            </p>
          </div>
          <div className="grid min-w-64 gap-2 text-sm text-slate-300">
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-300"
                style={{ width: `${Math.round((imagePack.generated / imagePack.expectedTotal) * 100)}%` }}
              />
            </div>
            <p>
              {imagePack.complete ? "Status: " : "Next: "}
              <span className="font-semibold text-white">
                {imagePack.complete
                  ? "ready for review"
                  : imagePack.next
                    ? `${imagePack.next.title} (${formatCreativeAssetAngleLabel(imagePack.next.angle)})`
                    : "image pack generated"}
              </span>
            </p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-emerald-900/60 bg-emerald-950/10">
        <div>
          <h2 className="text-lg font-semibold text-white">Create {CHATGPT_IMAGE_MODEL} prompt brief</h2>
          <p className="text-sm text-slate-500">
            Save a trade-specific prompt for generation here with the Pro plan. The app does not call the OpenAI API or publish anything externally.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
          <select
            value={conceptForm.trade_slug}
            onChange={(event) => setConceptForm((current) => ({ ...current, trade_slug: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            {BEACHHEAD_IMAGE_TRADES.map((trade) => (
              <option key={trade.slug} value={trade.slug}>
                {trade.domain}
              </option>
            ))}
          </select>
          <select
            value={conceptForm.angle}
            onChange={(event) =>
              setConceptForm((current) => ({ ...current, angle: event.target.value as (typeof IMAGE_CREATIVE_ANGLES)[number] }))
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            {IMAGE_CREATIVE_ANGLES.map((angle) => (
              <option key={angle} value={angle}>
                {formatCreativeAssetAngleLabel(angle)}
              </option>
            ))}
          </select>
          <select
            value={conceptForm.target_platform}
            onChange={(event) =>
              setConceptForm((current) => ({ ...current, target_platform: event.target.value as CreativeAssetPlatform }))
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            {IMAGE_CREATIVE_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <Button disabled={savingId === "concept"} onClick={() => void createImageConcept()}>
            {savingId === "concept" ? "Creating..." : "Create prompt brief"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-900/50 bg-slate-950/40 px-3 py-2">
          <p className="text-xs text-slate-500">
            Seed the full beachhead set once: 5 trades x 4 angles for the selected platform. Existing prompt briefs are skipped.
          </p>
          <GhostButton disabled={savingId === "concept-set"} onClick={() => void createPromptSet()}>
            {savingId === "concept-set" ? "Creating set..." : "Create 20-prompt set"}
          </GhostButton>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Add generated image asset</h2>
          <p className="text-sm text-slate-500">
            Generate the image in this chat with the Pro plan, then upload it here with the model, prompt, and review notes.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Asset title"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            value={form.trade_slug}
            onChange={(event) => setForm((current) => ({ ...current, trade_slug: event.target.value }))}
            placeholder="Trade slug"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <div className="space-y-1">
            <input
              type="text"
              list="creative-tool-options"
              value={form.tool_used}
              onChange={(event) => setForm((current) => ({ ...current, tool_used: event.target.value }))}
              placeholder="Tool used"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            />
            <datalist id="creative-tool-options">
              <option value={DEFAULT_CREATIVE_TOOL} />
              <option value="gpt-image-1.5" />
              <option value="gemini-2.0-flash" />
              <option value="veo-2.0-generate-001" />
            </datalist>
            <p className="text-xs text-slate-500">Use a real model or tool name so review history stays attributable.</p>
          </div>
          <select
            value={form.angle}
            onChange={(event) => setForm((current) => ({ ...current, angle: event.target.value as CreativeAssetAngle }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            {ANGLE_OPTIONS.map((angle) => (
              <option key={angle} value={angle}>
                {formatCreativeAssetAngleLabel(angle)}
              </option>
            ))}
          </select>
          <select
            value={form.target_platform}
            onChange={(event) => setForm((current) => ({ ...current, target_platform: event.target.value as CreativeAssetPlatform }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            {PLATFORM_OPTIONS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <input
            type="url"
            value={form.asset_url}
            onChange={(event) => setForm((current) => ({ ...current, asset_url: event.target.value }))}
            placeholder="Asset URL"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="url"
            value={form.thumbnail_url}
            onChange={(event) => setForm((current) => ({ ...current, thumbnail_url: event.target.value }))}
            placeholder="Preview URL (optional)"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <label className="flex items-center rounded-lg border border-dashed border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400">
            <span className="mr-2">Upload generated image</span>
            <input type="file" accept="image/*" onChange={(event) => setAssetFile(event.target.files?.[0] ?? null)} />
          </label>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
            Live is only valid after approved. The app stores images and lineage; generation happens here in the Pro workflow.
          </div>
        </div>
        <textarea
          value={form.prompt_text}
          onChange={(event) => setForm((current) => ({ ...current, prompt_text: event.target.value }))}
          rows={4}
          placeholder="Prompt used to generate this image"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
        <textarea
          value={form.negative_prompt}
          onChange={(event) => setForm((current) => ({ ...current, negative_prompt: event.target.value }))}
          rows={2}
          placeholder="Negative prompt or avoid-list"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          rows={3}
          placeholder="Angle notes, edit direction, CTA, or approval context"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
        <div className="flex justify-end">
          <Button disabled={savingId === "new" || !form.title.trim()} onClick={() => void createAsset()}>
            {savingId === "new" ? "Saving..." : "Add asset"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <Card>Loading creative assets...</Card>
        ) : assets.length === 0 ? (
          <Card>No creative assets saved yet.</Card>
        ) : filteredAssets.length === 0 ? (
          <Card>No creative assets match the current filters.</Card>
        ) : (
          filteredAssets.map((asset) => (
            <Card key={asset.id} className="space-y-4">
              {(() => {
                const previewUrl = asset.thumbnail_url ?? asset.asset_url;

                return (
                  <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{asset.title}</h2>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {asset.trade_slug} · {formatCreativeAssetAngleLabel(asset.angle)} · {asset.model ?? asset.tool_used}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase text-slate-300">
                  {formatCreativeAssetStatusLabel(asset.status)}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-[180px,1fr]">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt={asset.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-slate-600">No thumbnail</div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Target platform</label>
                      <select
                        value={asset.target_platform}
                        onChange={(event) =>
                          void updateAsset(asset.id, { target_platform: event.target.value as CreativeAssetPlatform })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        {PLATFORM_OPTIONS.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Status</label>
                      <select
                        value={asset.status}
                        onChange={(event) =>
                          void updateAsset(asset.id, { status: event.target.value as CreativeAssetStatus })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {formatCreativeAssetStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Prompt brief</label>
                      <input
                        type="text"
                        value={asset.prompt_brief_id ?? "manual"}
                        readOnly
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Generation</label>
                      <input
                        type="text"
                        value={asset.generation_status ?? "manual"}
                        readOnly
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Variant</label>
                      <input
                        type="text"
                        defaultValue={asset.variant_id ?? ""}
                        onBlur={(event) => void updateAsset(asset.id, { variant_id: event.target.value || null })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Parent</label>
                      <input
                        type="text"
                        value={asset.parent_asset_id ?? "root concept"}
                        readOnly
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Asset link</label>
                    <input
                      type="url"
                      defaultValue={asset.asset_url ?? ""}
                      onBlur={(event) => void updateAsset(asset.id, { asset_url: event.target.value || null })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                    <label className="mb-2 block text-xs uppercase tracking-wide text-slate-500">Generated image upload</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setAssetUploads((current) => ({ ...current, [asset.id]: event.target.files?.[0] ?? null }))
                        }
                        className="min-w-0 flex-1 text-sm text-slate-400"
                      />
                      <GhostButton
                        disabled={!assetUploads[asset.id] || savingId === asset.id}
                        onClick={() => void uploadGeneratedAsset(asset)}
                      >
                        {savingId === asset.id ? "Uploading..." : "Upload result"}
                      </GhostButton>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                    <label className="mb-2 block text-xs uppercase tracking-wide text-slate-500">Replacement variant</label>
                    <textarea
                      rows={2}
                      value={variantDirections[asset.id] ?? ""}
                      onChange={(event) => setVariantDirections((current) => ({ ...current, [asset.id]: event.target.value }))}
                      placeholder="Describe what v2/v3 should fix or preserve"
                      className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                    <GhostButton disabled={savingId === `variant-${asset.id}`} onClick={() => void createReplacementVariant(asset)}>
                      {savingId === `variant-${asset.id}` ? "Creating variant..." : "Create v2/v3 prompt"}
                    </GhostButton>
                    {variantErrors[asset.id] ? <p className="mt-2 text-xs text-rose-300">{variantErrors[asset.id]}</p> : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Prompt</label>
                    <textarea
                      rows={4}
                      defaultValue={asset.prompt_text ?? ""}
                      onBlur={(event) => void updateAsset(asset.id, { prompt_text: event.target.value || null })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Avoid</label>
                    <textarea
                      rows={2}
                      defaultValue={asset.negative_prompt ?? ""}
                      onBlur={(event) => void updateAsset(asset.id, { negative_prompt: event.target.value || null })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Notes</label>
                    <textarea
                      rows={3}
                      defaultValue={asset.notes ?? ""}
                      onBlur={(event) => void updateAsset(asset.id, { notes: event.target.value || null })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <GhostButton disabled={!asset.prompt_text} onClick={() => void copyGenerationPacket(asset)}>
                  {copiedId === asset.id ? "Copied packet" : "Copy packet"}
                </GhostButton>
                <GhostButton disabled={asset.status === "review"} onClick={() => void updateAsset(asset.id, { status: "review" })}>
                  Send to review
                </GhostButton>
                <GhostButton disabled={asset.status === "approved"} onClick={() => void updateAsset(asset.id, { status: "approved" })}>
                  Approve
                </GhostButton>
                <Button
                  disabled={asset.status !== "approved" || savingId === asset.id}
                  onClick={() => void updateAsset(asset.id, { status: "live" })}
                >
                  Mark live
                </Button>
                <GhostButton disabled={savingId === asset.id} onClick={() => void deleteAsset(asset.id)}>
                  Delete
                </GhostButton>
              </div>
                  </>
                );
              })()}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
