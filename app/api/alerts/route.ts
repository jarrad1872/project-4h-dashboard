import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { readFallback } from "@/lib/server-utils";

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

function readAlerts(): AlertRule[] {
  return readFallback<AlertRule[]>(DataFiles.alerts, []);
}

function writeAlerts(alerts: AlertRule[]): void {
  writeJsonFile(DataFiles.alerts, alerts);
}

export function OPTIONS() {
  return optionsResponse();
}

/** GET /api/alerts — list all alert rules */
export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    return okJson(readAlerts());
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

    const validMetrics = ["spend", "ctr", "cac", "signups"];
    const validPlatforms = ["linkedin", "youtube", "facebook", "instagram", "all"];
    const validOperators = ["gt", "lt"];
    const validActions = ["notify", "kill", "scale"];

    if (!body.metric || !validMetrics.includes(body.metric)) {
      return errorJson(`metric is required. Use one of: ${validMetrics.join(", ")}`, 400);
    }
    if (!body.platform || !validPlatforms.includes(body.platform)) {
      return errorJson(`platform is required. Use one of: ${validPlatforms.join(", ")}`, 400);
    }
    if (!body.operator || !validOperators.includes(body.operator)) {
      return errorJson(`operator is required. Use one of: ${validOperators.join(", ")}`, 400);
    }
    if (body.threshold === undefined || typeof body.threshold !== "number") {
      return errorJson("threshold (number) is required", 400);
    }
    if (!body.action || !validActions.includes(body.action)) {
      return errorJson(`action is required. Use one of: ${validActions.join(", ")}`, 400);
    }

    const alert: AlertRule = {
      id: `alert-${Date.now()}`,
      metric: body.metric,
      platform: body.platform,
      operator: body.operator,
      threshold: body.threshold,
      action: body.action,
      created_at: isoNow(),
    };

    const alerts = readAlerts();
    alerts.push(alert);
    writeAlerts(alerts);

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

    const alerts = readAlerts();
    const index = alerts.findIndex((a) => a.id === id);

    if (index < 0) {
      return errorJson("Alert not found", 404);
    }

    const deleted = alerts.splice(index, 1)[0];
    writeAlerts(alerts);

    return okJson({ ok: true, deleted });
  } catch (err) {
    return errorJson("Failed to delete alert", 500, String(err));
  }
}
