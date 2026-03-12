import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { hasSupabase, readFallback } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export interface AlertRule {
  id: string;
  metric: "spend" | "ctr" | "cac" | "signups";
  platform: "linkedin" | "youtube" | "facebook" | "instagram" | "all";
  operator: "gt" | "lt";
  threshold: number;
  action: "notify" | "kill" | "scale";
  created_at: string;
}

// ─── File-based fallback ─────────────────────────────────────────────────────

function readAlertsFile(): AlertRule[] {
  return readFallback<AlertRule[]>(DataFiles.alerts, []);
}

function writeAlertsFile(alerts: AlertRule[]): void {
  writeJsonFile(DataFiles.alerts, alerts);
}

// ─── Shared validation ───────────────────────────────────────────────────────

const validMetrics = ["spend", "ctr", "cac", "signups"];
const validPlatforms = ["linkedin", "youtube", "facebook", "instagram", "all"];
const validOperators = ["gt", "lt"];
const validActions = ["notify", "kill", "scale"];

function validateAlertBody(body: Partial<AlertRule>): string | null {
  if (!body.metric || !validMetrics.includes(body.metric))
    return `metric is required. Use one of: ${validMetrics.join(", ")}`;
  if (!body.platform || !validPlatforms.includes(body.platform))
    return `platform is required. Use one of: ${validPlatforms.join(", ")}`;
  if (!body.operator || !validOperators.includes(body.operator))
    return `operator is required. Use one of: ${validOperators.join(", ")}`;
  if (body.threshold === undefined || typeof body.threshold !== "number")
    return "threshold (number) is required";
  if (!body.action || !validActions.includes(body.action))
    return `action is required. Use one of: ${validActions.join(", ")}`;
  return null;
}

export function OPTIONS() {
  return optionsResponse();
}

/** GET /api/alerts — list all alert rules */
export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    if (hasSupabase()) {
      const { data, error } = await supabaseAdmin
        .from("alert_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Table might not exist yet — fall back to file
        return okJson(readAlertsFile());
      }
      return okJson(data ?? []);
    }
    return okJson(readAlertsFile());
  } catch (err) {
    return errorJson("Failed to load alerts", 500, String(err));
  }
}

/** POST /api/alerts — create a new alert rule */
export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const body = (await request.json()) as Partial<AlertRule>;

    const validationError = validateAlertBody(body);
    if (validationError) return errorJson(validationError, 400);

    const alert: AlertRule = {
      id: `alert-${Date.now()}`,
      metric: body.metric!,
      platform: body.platform!,
      operator: body.operator!,
      threshold: body.threshold!,
      action: body.action!,
      created_at: isoNow(),
    };

    if (hasSupabase()) {
      const { error } = await supabaseAdmin
        .from("alert_rules")
        .insert(alert);

      if (error) {
        // Fall back to file if table doesn't exist
        const alerts = readAlertsFile();
        alerts.push(alert);
        writeAlertsFile(alerts);
      }
    } else {
      const alerts = readAlertsFile();
      alerts.push(alert);
      writeAlertsFile(alerts);
    }

    return okJson(alert, 201);
  } catch (err) {
    return errorJson("Failed to create alert", 500, String(err));
  }
}

/** DELETE /api/alerts?id=<id> — delete an alert rule */
export async function DELETE(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorJson("id query parameter is required", 400);
    }

    if (hasSupabase()) {
      const { data, error } = await supabaseAdmin
        .from("alert_rules")
        .delete()
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        // Fall back to file
        const alerts = readAlertsFile();
        const index = alerts.findIndex((a) => a.id === id);
        if (index < 0) return errorJson("Alert not found", 404);
        const deleted = alerts.splice(index, 1)[0];
        writeAlertsFile(alerts);
        return okJson({ ok: true, deleted });
      }

      if (!data) return errorJson("Alert not found", 404);
      return okJson({ ok: true, deleted: data });
    }

    const alerts = readAlertsFile();
    const index = alerts.findIndex((a) => a.id === id);
    if (index < 0) return errorJson("Alert not found", 404);
    const deleted = alerts.splice(index, 1)[0];
    writeAlertsFile(alerts);
    return okJson({ ok: true, deleted });
  } catch (err) {
    return errorJson("Failed to delete alert", 500, String(err));
  }
}
