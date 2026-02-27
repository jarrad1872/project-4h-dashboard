"use client";

import { useState } from "react";
import { Button, GhostButton } from "@/components/ui";

export function OverviewActions() {
  const [loading, setLoading] = useState(false);

  async function launchAll() {
    setLoading(true);
    try {
      await fetch("/api/campaign-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "live",
          startDate: new Date().toISOString(),
          linkedinStatus: "live",
          youtubeStatus: "live",
          facebookStatus: "live",
          instagramStatus: "live",
        }),
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  async function pauseAll() {
    setLoading(true);
    try {
      await fetch("/api/actions/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "all" }),
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={loading} onClick={launchAll}>
        Launch All
      </Button>
      <GhostButton disabled={loading} onClick={pauseAll}>
        Pause All
      </GhostButton>
      <GhostButton onClick={() => (window.location.href = "/scorecard")}>Add Metric Entry</GhostButton>
    </div>
  );
}
