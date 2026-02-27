"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import type { ApprovalItem } from "@/lib/types";

export default function ApprovalPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);

  async function load() {
    const res = await fetch("/api/approval", { cache: "no-store" });
    const data = (await res.json()) as ApprovalItem[];
    setItems(data);
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

  const pending = useMemo(() => items.filter((item) => item.status === "pending"), [items]);
  const history = useMemo(() => items.filter((item) => item.status !== "pending"), [items]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Approval Queue</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Pending Items ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map((item) => (
            <div key={item.id} className="rounded border border-slate-700 p-3">
              <p className="mb-1 font-semibold">{item.id}</p>
              <p className="mb-3 text-sm text-slate-300">{item.content}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => updateStatus(item.id, "approved")}>Approve ✓</Button>
                <GhostButton onClick={() => updateStatus(item.id, "revise")}>Revise ✏️</GhostButton>
                <GhostButton className="border-red-500 text-red-400 hover:bg-red-900/40" onClick={() => updateStatus(item.id, "rejected")}>
                  Reject ✗
                </GhostButton>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-sm text-slate-400">No pending approvals.</p>}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Approval History</h2>
        <div className="space-y-2">
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border border-slate-700 px-3 py-2 text-sm">
              <span>{item.id}</span>
              <span className="capitalize text-slate-300">{item.status}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-slate-400">No decisions yet.</p>}
        </div>
      </Card>
    </div>
  );
}
