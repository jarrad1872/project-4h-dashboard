import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { buildAgenticLaunchPlan, type AgenticLaunchMode, type AgenticLaunchSurface } from "@/lib/agentic-launch-control";
import { rebuildMission } from "@/lib/4h-rebuild-data";
import { buildLaunchBundle } from "@/lib/launch-bundles";
import { validateLaunchReadiness, type LaunchApprovalStatus } from "@/lib/launch-readiness-validator";
import {
  buildLaunchUrl,
  defaultLaunchAssetId,
  getCurrentCampaignMonth,
  launchAngles,
  launchPlatforms,
  type LaunchAngle,
  type LaunchDestination,
  type LaunchPlatform,
} from "@/lib/launch-url-builder";
import { buildPlatformUploadSheets } from "@/lib/platform-upload-sheets";
import { DataFiles } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { budgetRowsToData, campaignConfigToData, hasSupabase, normalizeLaunchChecklistItem, readFallback } from "@/lib/server-utils";
import type { BudgetData, BudgetRow, CampaignConfig, CampaignStatusData, CreativeAssetStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_BUDGET: BudgetData = {
  totalBudget: 0,
  channels: {
    linkedin: { allocated: 0, spent: 0 },
    youtube: { allocated: 0, spent: 0 },
    facebook: { allocated: 0, spent: 0 },
    instagram: { allocated: 0, spent: 0 },
  },
};

const DEFAULT_STATUS: CampaignStatusData = {
  status: "pre-launch",
  startDate: null,
  linkedinStatus: "ready",
  youtubeStatus: "ready",
  facebookStatus: "ready",
  instagramStatus: "ready",
};

function isLaunchPlatform(value: unknown): value is LaunchPlatform {
  return typeof value === "string" && (launchPlatforms as readonly string[]).includes(value);
}

function isLaunchAngle(value: unknown): value is LaunchAngle {
  return typeof value === "string" && (launchAngles as readonly string[]).includes(value);
}

export function OPTIONS() {
  return optionsResponse();
}

async function loadLaunchInputs() {
  if (!hasSupabase()) {
    return {
      checklistItems: readFallback<unknown[]>(DataFiles.launchChecklist, []).map((row) => normalizeLaunchChecklistItem(row)),
      campaignStatus: readFallback<CampaignStatusData>(DataFiles.campaignStatus, DEFAULT_STATUS),
      budget: readFallback<BudgetData>(DataFiles.budget, DEFAULT_BUDGET),
    };
  }

  const [{ data: checklistRows }, { data: campaignConfig }, { data: budgetRows }] = await Promise.all([
    supabaseAdmin.from("launch_checklist").select("*").order("platform"),
    supabaseAdmin.from("campaign_config").select("*").eq("id", 1).maybeSingle(),
    supabaseAdmin.from("budget").select("*"),
  ]);

  return {
    checklistItems: (checklistRows ?? []).map((row) => normalizeLaunchChecklistItem(row)),
    campaignStatus: campaignConfig ? campaignConfigToData(campaignConfig as CampaignConfig) : DEFAULT_STATUS,
    budget: budgetRowsToData((budgetRows ?? []) as BudgetRow[], (campaignConfig ?? null) as CampaignConfig | null),
  };
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  return okJson(buildAgenticLaunchPlan({ bundle: null, uploadSheets: [], mode: "plan", surface: "app" }));
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const trade = String(body.trade ?? "pipe.city");
    const platform = isLaunchPlatform(body.platform) ? body.platform : "linkedin";
    const angle = isLaunchAngle(body.angle) ? body.angle : "missed-call";
    const assetId = typeof body.assetId === "string" ? body.assetId : defaultLaunchAssetId(trade, angle);
    const campaignMonth = typeof body.campaignMonth === "string" ? body.campaignMonth : getCurrentCampaignMonth();
    const campaignName = typeof body.campaignName === "string" ? body.campaignName : "";
    const destination = body.destination === "signup" ? "signup" : "landing";
    const mode = ["plan", "prepare", "execute"].includes(String(body.mode)) ? body.mode as AgenticLaunchMode : "plan";
    const surface = ["app", "cli", "codex", "claude-code"].includes(String(body.surface))
      ? body.surface as AgenticLaunchSurface
      : "app";
    const creativeStatus = (body.creativeStatus ?? "missing") as CreativeAssetStatus | "missing";
    const copyApprovalStatus = (body.copyApprovalStatus ?? "missing") as LaunchApprovalStatus;
    const jarradApprovalStatus = (body.jarradApprovalStatus ?? "missing") as LaunchApprovalStatus;

    const { checklistItems, campaignStatus, budget } = await loadLaunchInputs();
    const launch = buildLaunchUrl({
      trade,
      platform,
      angle,
      assetId,
      campaignName,
      campaignMonth,
      destination: destination as LaunchDestination,
      creatorSlug: typeof body.creatorSlug === "string" ? body.creatorSlug : "",
      creatorId: typeof body.creatorId === "string" ? body.creatorId : "",
    });
    const readiness = validateLaunchReadiness({
      launch,
      checklistItems,
      campaignStatus,
      offerText: `${rebuildMission.price}. ${rebuildMission.trial}.`,
      trialText: rebuildMission.trial,
      creativeStatus,
      copyApprovalStatus,
      jarradApprovalStatus,
    });
    const bundle = buildLaunchBundle({
      launch,
      readiness,
      budget,
      creative: {
        assetId,
        status: creativeStatus,
        variantId: creativeStatus === "missing" ? null : assetId,
        imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
      },
      copy: {
        headline: typeof body.headline === "string" ? body.headline : `${launch.domain} ${angle} launch candidate`,
        primaryText: typeof body.primaryText === "string"
          ? body.primaryText
          : `${launch.domain} launch copy must include ${rebuildMission.price} and ${rebuildMission.trial}.`,
        cta: typeof body.cta === "string" ? body.cta : "Start free trial",
        offer: rebuildMission.price,
        trial: rebuildMission.trial,
        approvalStatus: copyApprovalStatus,
      },
      approvals: {
        creative: creativeStatus,
        copy: copyApprovalStatus,
        jarrad: jarradApprovalStatus,
      },
    });
    const uploadSheets = buildPlatformUploadSheets(bundle);

    return okJson({
      plan: buildAgenticLaunchPlan({
        bundle,
        uploadSheets,
        mode,
        surface,
        externalConfirmation: Boolean(body.externalConfirmation),
        serverVerifiedExternalApproval: false,
        externalAdaptersConfigured: false,
      }),
      bundle,
      readiness,
      uploadSheets,
    });
  } catch (error) {
    return errorJson("Failed to orchestrate launch", 500, String(error));
  }
}
