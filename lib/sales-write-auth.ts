import { errorJson } from "@/lib/api";
import { salesReps } from "@/lib/sales-rep-pipeline";

export const SALES_REP_CODE_HEADER = "x-sales-rep-code";

export function getSalesRepAccessStatus(request: Request) {
  const url = new URL(request.url);
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (isLocalhost) {
    return {
      ok: true,
      mode: "local",
      repId: salesReps[0]?.id ?? "rep-az-founding",
    };
  }

  const expectedRepCode = process.env.PUMPCANS_DUSTIN_REP_CODE ?? process.env.PUMPCANS_SALES_REP_CODE;
  const providedRepCode = request.headers.get(SALES_REP_CODE_HEADER);
  if (expectedRepCode && providedRepCode === expectedRepCode) {
    return {
      ok: true,
      mode: "rep-code",
      repId: salesReps[0]?.id ?? "rep-az-founding",
    };
  }

  const expected = process.env.PUMPCANS_API_TOKEN;
  const provided = request.headers.get("Authorization");
  if (expected && provided === `Bearer ${expected}`) {
    return {
      ok: true,
      mode: "api-token",
      repId: null,
    };
  }

  return {
    ok: false,
    mode: "locked",
    repId: null,
  };
}

export function requireSalesWriteAuth(request: Request) {
  const access = getSalesRepAccessStatus(request);
  if (access.ok) return null;

  return errorJson(
    "Sales CRM writes are locked. Use localhost, an authenticated Bob/CLI request, or Dustin's configured rep access code.",
    403,
    undefined,
    request,
  );
}
