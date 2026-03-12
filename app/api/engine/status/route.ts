import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { hasSupabase } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

/** GET /api/engine/status — last engine run, current signals summary */
export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    if (!hasSupabase()) {
      return okJson({
        configured: false,
        message: "Engine requires Supabase for run logging",
        last_run: null,
        recent_runs: [],
      });
    }

    // Get last 5 engine runs
    const { data: runs, error } = await supabaseAdmin
      .from("engine_runs")
      .select("*")
      .order("run_at", { ascending: false })
      .limit(5);

    if (error) {
      // Table might not exist yet
      return okJson({
        configured: false,
        message: "engine_runs table not found — run migration 008",
        last_run: null,
        recent_runs: [],
      });
    }

    const lastRun = runs && runs.length > 0 ? runs[0] : null;

    return okJson({
      configured: true,
      last_run: lastRun
        ? {
            id: lastRun.id,
            run_at: lastRun.run_at,
            signals: lastRun.signals,
            alerts_fired: lastRun.alerts_fired,
            actions_taken: lastRun.actions_taken,
          }
        : null,
      recent_runs: (runs ?? []).map((r: { id: string; run_at: string; signals: unknown; alerts_fired: unknown }) => ({
        id: r.id,
        run_at: r.run_at,
        signal_count: Array.isArray(r.signals) ? r.signals.length : 0,
        alert_count: Array.isArray(r.alerts_fired) ? r.alerts_fired.length : 0,
      })),
    });
  } catch (err) {
    return errorJson("Failed to load engine status", 500, String(err));
  }
}
