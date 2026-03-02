import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/api";

/**
 * Bearer token auth middleware.
 * Returns a 401 response if auth fails, or null if auth passes.
 *
 * Behaviour:
 * - No PUMPCANS_API_TOKEN env var → auth disabled entirely (dev/backwards-compat)
 * - No Authorization header → allowed through (same-origin dashboard calls)
 * - Authorization header present but wrong → 401
 * - Authorization header correct → allowed through
 *
 * The dashboard UI never needs to send a token (it's protected by its own
 * access-code layer). The token is only required for external CLI/agent callers
 * who explicitly include an Authorization header.
 */
export function requireAuth(request: Request): NextResponse | null {
  const token = process.env.PUMPCANS_API_TOKEN;

  // Auth disabled — no token configured
  if (!token) return null;

  const authHeader = request.headers.get("Authorization");

  // No header → allow through (same-origin dashboard, unauthenticated reads, etc.)
  if (!authHeader) return null;

  // Header present but wrong → reject
  if (authHeader !== `Bearer ${token}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }

  return null; // correct token
}
