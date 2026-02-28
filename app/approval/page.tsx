"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import type { ApprovalItem } from "@/lib/types";

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
};

const TRADE_COLORS: Record<string, string> = {
  RINSE: "text-blue-400",
  MOW: "text-green-400",
  ROOTER: "text-orange-400",
  SAW: "text-yellow-400",
};

function tradeFromId(id: string): string {
  const match = id.match(/^(RINSE|MOW|ROOTER|SAW)-/);
  if (match) return match[1];
  return "SAW"; // original Saw.City ads
}

function tradeLabelFromId(id: string): string {
  const map: Record<string, string> = {
    RINSE: "Rinse.City",
    MOW: "Mow.City",
    ROOTER: "Rooter.City",
    SAW: "Saw.City",
  };
  return map[tradeFromId(id)] ?? id;
}

function isAdItem(item: ApprovalItem): boolean {
  return (item as any).source === "ads" || (item as any).type === "ad_copy";
}

function AdCopyCard({
  item,
  onDecision,
}: {
  item: ApprovalItem;
  onDecision: (id: string, status: ApprovalItem["status"]) => void;
}) {
  const trade = tradeFromId(item.id);
  const tradeColor = TRADE_COLORS[trade] ?? "text-slate-300";
  const platform = (item as any).platform ?? "";
  const lines = item.content.split("\n\n");

  return (
    <div className="rounded border border-slate-700 bg-slate-800/50 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${tradeColor}`}>
          {tradeLabelFromId(item.id)}
        </span>
        {platform && (
          <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            {PLATFORM_LABELS[platform] ?? platform.toUpperCase()}
          </span>
        )}
        <span className="text-xs text-slate-500">{item.id}</span>
      </div>

      <div className="mb-3 space-y-2">
        {lines.map((line, i) => {
          if (i === 0 && line.startsWith("**") && line.endsWith("**")) {
            return (
              <p key={i} className="font-semibold text-white">
                {line.replace(/\*\*/g, "")}
              </p>
            );
          }
          if (line.startsWith("CTA:")) {
            return (
              <p key={i} className="text-xs font-medium text-cyan-400">
                {line}
              </p>
            );
          }
          if (line.startsWith("UTM:")) {
            return (
              <p key={i} className="font-mono text-xs text-slate-500">
                {line}
              </p>
            );
          }
          return (
            <p key={i} className="text-sm leading-relaxed text-slate-300">
              {line}
            </p>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onDecision(item.id, "approved")}>Approve ✓</Button>
        <GhostButton onClick={() => onDecision(item.id, "revise")}>Revise ✏️</GhostButton>
        <GhostButton
          className="border-red-500 text-red-400 hover:bg-red-900/40"
          onClick={() => onDecision(item.id, "rejected")}
        >
          Reject ✗
        </GhostButton>
      </div>
    </div>
  );
}

export default function ApprovalPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/approval", { cache: "no-store" });
    const data = (await res.json()) as ApprovalItem[];
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateStatus(id: string, status: ApprovalItem["status"]) {
    await fetch("/api/approval", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    void load();
  }

  const pendingAds = useMemo(
    () => items.filter((i) => i.status === "pending" && isAdItem(i)),
    [items]
  );
  const pendingChecklist = useMemo(
    () => items.filter((i) => i.status === "pending" && !isAdItem(i)),
    [items]
  );
  const history = useMemo(() => items.filter((i) => i.status !== "pending"), [items]);

  // Group pending ads by trade
  const adsByTrade = useMemo(() => {
    const groups: Record<string, ApprovalItem[]> = {};
    for (const ad of pendingAds) {
      const trade = tradeFromId(ad.id);
      if (!groups[trade]) groups[trade] = [];
      groups[trade].push(ad);
    }
    return groups;
  }, [pendingAds]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Approval Queue</h1>
        <div className="flex gap-3 text-sm text-slate-400">
          <span>{pendingAds.length} ad{pendingAds.length !== 1 ? "s" : ""} pending</span>
          <span>·</span>
          <span>{pendingChecklist.length} checklist item{pendingChecklist.length !== 1 ? "s" : ""} pending</span>
        </div>
      </div>

      {/* Ad Copy Review */}
      {pendingAds.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ad Copy — Pending Review ({pendingAds.length})</h2>
          <p className="text-sm text-slate-400">
            New trade variants generated by Bob. Review each ad and approve, flag for revision, or reject.
            These are <span className="font-medium text-white">not live</span> until approved and uploaded to ad platforms.
          </p>

          {Object.entries(adsByTrade).map(([trade, ads]) => (
            <Card key={trade}>
              <h3 className={`mb-4 font-semibold ${TRADE_COLORS[trade] ?? "text-slate-300"}`}>
                {tradeLabelFromId(ads[0].id)} — {ads.length} ads
              </h3>
              <div className="space-y-3">
                {ads.map((ad) => (
                  <AdCopyCard key={ad.id} item={ad} onDecision={updateStatus} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Checklist items */}
      {pendingChecklist.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Checklist Items ({pendingChecklist.length})</h2>
          <div className="space-y-3">
            {pendingChecklist.map((item) => (
              <div key={item.id} className="rounded border border-slate-700 p-3">
                <p className="mb-1 font-semibold">{item.id}</p>
                <p className="mb-3 text-sm text-slate-300">{item.content}</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => updateStatus(item.id, "approved")}>Approve ✓</Button>
                  <GhostButton onClick={() => updateStatus(item.id, "revise")}>Revise ✏️</GhostButton>
                  <GhostButton
                    className="border-red-500 text-red-400 hover:bg-red-900/40"
                    onClick={() => updateStatus(item.id, "rejected")}
                  >
                    Reject ✗
                  </GhostButton>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pendingAds.length === 0 && pendingChecklist.length === 0 && !loading && (
        <Card>
          <p className="text-sm text-slate-400">No pending approvals. 🎉</p>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Approval History</h2>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border border-slate-700 px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs">{item.id}</span>
                <span
                  className={`capitalize ${
                    item.status === "approved"
                      ? "text-green-400"
                      : item.status === "rejected"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
