import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/api";

/**
 * Bearer token auth middleware.
 * Returns a 401 response if auth fails, or null if auth passes (or is disabled).
 *
 * Auth is disabled when PUMPCANS_API_TOKEN env var is not set — this preserves
 * backwards-compat for dev environments and existing callers.
 */
export function requireAuth(request: Request): NextResponse | null {
  const token = process.env.PUMPCANS_API_TOKEN;

  // If no token configured, auth is disabled (dev/backwards-compat)
  if (!token) return null;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${token}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }
  return null; // null = auth passed
}
