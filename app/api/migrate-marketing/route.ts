/**
 * One-shot migration: creates marketing_events table in 4H Supabase.
 * This endpoint will be removed after the migration runs.
 * Campaign attribution data lives here (4H DB), NOT in sawcity-lite.
 */
import { okJson, errorJson, optionsResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

const SQL = `
CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name TEXT NOT NULL,
  tenant_id TEXT,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  trade TEXT,
  landing_variant TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  props JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_marketing_events_name_created
  ON marketing_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_events_utm
  ON marketing_events(utm_source, utm_campaign, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_events_tenant_created
  ON marketing_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_events_visitor_created
  ON marketing_events(visitor_id, created_at DESC);
`;

export function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return errorJson("DATABASE_URL not configured", 500);
  }

  try {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    await client.query(SQL);
    await client.end();
    return okJson({ ok: true, message: "marketing_events table created in 4H database" });
  } catch (err) {
    return errorJson("Migration failed", 500, String(err));
  }
}
