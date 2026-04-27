import { errorJson } from "@/lib/api";

export function requireSalesWriteAuth(request: Request) {
  const url = new URL(request.url);
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (isLocalhost) return null;

  const expected = process.env.PUMPCANS_API_TOKEN;
  const provided = request.headers.get("Authorization");
  if (expected && provided === `Bearer ${expected}`) return null;

  return errorJson(
    "Sales CRM writes are internal-only. Use localhost or an authenticated Bob/CLI request.",
    403,
    undefined,
    request,
  );
}
