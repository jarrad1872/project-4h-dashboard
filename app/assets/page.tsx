"use client";

import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import {
  DEFAULT_CREATIVE_TOOL,
  formatCreativeAssetAngleLabel,
  formatCreativeAssetStatusLabel,
  summarizeCreativePipeline,
} from "@/lib/growth-command-center";
import type { CreativeAsset, CreativeAssetAngle, CreativeAssetPlatform, CreativeAssetStatus } from "@/lib/types";

const STATUS_OPTIONS: CreativeAssetStatus[] = ["draft", "review", "approved", "live"];
const ANGLE_OPTIONS: CreativeAssetAngle[] = ["missed-call", "voice-boss", "demo", "math"];
const PLATFORM_OPTIONS: CreativeAssetPlatform[] = ["multi", "youtube", "instagram", "facebook", "linkedin"];

const EMPTY_FORM = {
  title: "",
  trade_slug: "pipe",
  angle: "missed-call" as CreativeAssetAngle,
  tool_used: DEFAULT_CREATIVE_TOOL,
  target_platform: "multi" as CreativeAssetPlatform,
  asset_url: "",
  thumbnail_url: "",
  notes: "",
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

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
      thumbnailFile !== null
        ? {
            upload_base64: await fileToBase64(thumbnailFile),
            upload_file_name: thumbnailFile.name,
            upload_content_type: thumbnailFile.type,
            upload_target: "thumbnail",
          }
        : {};

    await fetch("/api/creative-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        thumbnail_url: form.thumbnail_url || null,
        asset_url: form.asset_url || null,
        notes: form.notes || null,
        ...uploadPayload,
      }),
    });

    setForm(EMPTY_FORM);
    setThumbnailFile(null);
    setSavingId(null);
    await load();
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

  async function deleteAsset(id: string) {
    if (!window.confirm("Delete this creative asset?")) return;
    setSavingId(id);
    await fetch(`/api/creative-assets/${id}`, { method: "DELETE" });
    setSavingId(null);
    await load();
  }

  const summary = summarizeCreativePipeline(assets);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Creative Assets</h1>
          <p className="mt-1 text-sm text-slate-400">
            AI UGC video and thumbnail tracking for the plumbing pilot. CEO and CMO approval still gate anything marked live.
          </p>
        </div>
        <p className="text-sm text-slate-500">{assets.length} assets tracked</p>
      </div>

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

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Add AI UGC asset</h2>
          <p className="text-sm text-slate-500">
            Paste a hosted video link, record the model or tool used, and optionally upload a thumbnail to Supabase storage.
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
            placeholder="Video URL"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="url"
            value={form.thumbnail_url}
            onChange={(event) => setForm((current) => ({ ...current, thumbnail_url: event.target.value }))}
            placeholder="Thumbnail URL (optional)"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <label className="flex items-center rounded-lg border border-dashed border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400">
            <span className="mr-2">Upload thumbnail</span>
            <input type="file" accept="image/*" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} />
          </label>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
            Live is only valid after approved. Keep video links external and use uploaded thumbnails for card previews.
          </div>
        </div>
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
        ) : (
          assets.map((asset) => (
            <Card key={asset.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{asset.title}</h2>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {asset.trade_slug} · {formatCreativeAssetAngleLabel(asset.angle)} · {asset.tool_used}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs uppercase text-slate-300">
                  {formatCreativeAssetStatusLabel(asset.status)}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-[180px,1fr]">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                  {asset.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.thumbnail_url} alt={asset.title} className="h-40 w-full object-cover" />
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

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Video link</label>
                    <input
                      type="url"
                      defaultValue={asset.asset_url ?? ""}
                      onBlur={(event) => void updateAsset(asset.id, { asset_url: event.target.value || null })}
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
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
