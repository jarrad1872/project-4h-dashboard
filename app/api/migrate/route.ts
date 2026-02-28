/**
 * One-time migration endpoint — POST /api/migrate
 * Applies schema changes that can't run via supabase-js (DDL).
 * Requires MIGRATE_SECRET header for security.
 */
import { okJson, errorJson, optionsResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

const MIGRATION_SQL = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE ads ADD COLUMN IF NOT EXISTS workflow_stage TEXT NOT NULL DEFAULT 'concept';

UPDATE ads
SET workflow_stage = CASE
  WHEN status = 'approved' THEN 'approved'
  WHEN status = 'paused'   THEN 'uploaded'
  WHEN status = 'rejected' THEN 'concept'
  ELSE 'copy-ready'
END
WHERE workflow_stage = 'concept';

CREATE TABLE IF NOT EXISTS ad_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  format TEXT,
  primary_text TEXT,
  headline TEXT,
  cta TEXT,
  landing_path TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ad_templates_created_at_idx ON ad_templates(created_at DESC);

-- Migration 004: link ad creatives to ads via image_url
ALTER TABLE ads ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Populate image_url by matching ad_templates to ads by platform
-- Uses "saw" brand templates (concrete cutting = Saw.City product)
UPDATE ads a
SET image_url = (
  SELECT (t.utm_campaign::jsonb)->>'image_url'
  FROM ad_templates t
  WHERE t.platform = a.platform
    AND t.name LIKE 'saw-%'
    AND (t.utm_campaign::jsonb)->>'image_url' IS NOT NULL
  LIMIT 1
)
WHERE a.image_url IS NULL;
`;

export function OPTIONS() {
  return optionsResponse();
}

function buildConnectionString(): string | null {
  // Prefer explicit DATABASE_URL
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // Fall back to Supabase credentials (direct DB connection)
  const ref = process.env.SUPABASE_PROJECT_REF;
  const pass = process.env.SUPABASE_DB_PASSWORD;
  if (ref && pass) {
    // Try direct connection URL (works from Vercel/server environments)
    return `postgresql://postgres:${encodeURIComponent(pass)}@db.${ref}.supabase.co:5432/postgres`;
  }

  return null;
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-migrate-secret");
  if (secret !== process.env.MIGRATE_SECRET && process.env.MIGRATE_SECRET) {
    return errorJson("Unauthorized", 401);
  }

  // Accept optional db_url in request body (overrides env config)
  let bodyDbUrl: string | undefined;
  try {
    const body = await request.json();
    if (body?.db_url) bodyDbUrl = body.db_url;
  } catch {
    // no body is fine
  }

  const dbUrl = bodyDbUrl || buildConnectionString();
  if (!dbUrl) {
    return errorJson(
      "No database connection configured. Set DATABASE_URL, SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD, or pass db_url in request body.",
      500
    );
  }

  try {
    // Dynamic import of pg (only available server-side)
    const { Client } = await import("pg");
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

    await client.connect();
    await client.query(MIGRATION_SQL);
    await client.end();

    return okJson({ ok: true, message: "Migration 004 applied (includes image_url column + linking)" });
  } catch (error) {
    return errorJson("Migration failed", 500, String(error));
  }
}
