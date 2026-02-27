"use client";

import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import type { LifecycleMessage } from "@/lib/types";

export default function LifecyclePage() {
  const [rows, setRows] = useState<LifecycleMessage[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<LifecycleMessage>>({});

  async function load() {
    const res = await fetch("/api/lifecycle", { cache: "no-store" });
    const data = (await res.json()) as LifecycleMessage[];
    setRows(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(id: string) {
    await fetch("/api/lifecycle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, id }),
    });
    setEditing(null);
    setDraft({});
    void load();
  }

  async function toggleStatus(row: LifecycleMessage) {
    await fetch("/api/lifecycle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status: row.status === "active" ? "paused" : "active" }),
    });
    void load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lifecycle Messaging</h1>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="p-2">asset_id</th>
              <th className="p-2">channel</th>
              <th className="p-2">timing</th>
              <th className="p-2">subject</th>
              <th className="p-2">message</th>
              <th className="p-2">goal</th>
              <th className="p-2">status</th>
              <th className="p-2">actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isEditing = editing === row.id;
              return (
                <tr key={row.id} className="border-t border-slate-700 align-top">
                  <td className="p-2">{row.asset_id}</td>
                  <td className="p-2">{row.channel}</td>
                  <td className="p-2">{row.timing}</td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        className="w-full rounded border border-slate-600 bg-slate-800 p-1"
                        value={(draft.subject as string) ?? row.subject}
                        onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
                      />
                    ) : (
                      row.subject || "—"
                    )}
                  </td>
                  <td className="max-w-sm p-2">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        className="w-full rounded border border-slate-600 bg-slate-800 p-1"
                        value={(draft.message as string) ?? row.message}
                        onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                      />
                    ) : (
                      <span className="line-clamp-2">{row.message}</span>
                    )}
                  </td>
                  <td className="p-2">{row.goal}</td>
                  <td className="p-2 capitalize">{row.status}</td>
                  <td className="p-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button onClick={() => save(row.id)}>Save</Button>
                        <GhostButton
                          onClick={() => {
                            setEditing(null);
                            setDraft({});
                          }}
                        >
                          Cancel
                        </GhostButton>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <GhostButton
                          onClick={() => {
                            setEditing(row.id);
                            setDraft({ subject: row.subject, message: row.message });
                          }}
                        >
                          Edit
                        </GhostButton>
                        <GhostButton onClick={() => toggleStatus(row)}>{row.status === "active" ? "Pause" : "Activate"}</GhostButton>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
