import { okJson } from "@/lib/api";
import { getSalesRepAccessStatus, SALES_REP_CODE_HEADER } from "@/lib/sales-write-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = getSalesRepAccessStatus(request);
  const productionRepCodeConfigured = Boolean(process.env.PUMPCANS_DUSTIN_REP_CODE ?? process.env.PUMPCANS_SALES_REP_CODE);

  return okJson(
    {
      unlocked: access.ok,
      mode: access.mode,
      repId: access.repId,
      repCodeHeader: SALES_REP_CODE_HEADER,
      productionRepCodeConfigured,
      message: access.ok
        ? "Sales field mode is unlocked for CRM writes."
        : "Enter Dustin's configured rep access code to unlock production CRM writes.",
    },
    200,
    request,
  );
}
