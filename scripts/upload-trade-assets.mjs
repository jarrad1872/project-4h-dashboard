/**
 * Upload existing hero + OG images for 20 live trades to Supabase Storage
 * and populate the trade_assets table.
 *
 * Source:
 *   hero: projects/sawcity-lite/docs/project-4h/creative-assets/hero-originals/{prefix}-hero.png
 *   og:   projects/sawcity-lite/docs/project-4h/creative-assets/og-originals/{prefix}-og.png
 */

import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://vzawlfitqnjhypnkguas.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YXdsZml0cW5qaHlwbmtndWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwOTU2NywiZXhwIjoyMDg3Nzg1NTY3fQ.P8qFx_7hYBA0h8ri6b3dGfM5JqBjLP-ej8zVeodMLa0";
const BUCKET = "ad-creatives";
const BASE = "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/creative-assets";

// file prefix → trade_slug (matches trade_assets table)
const TRADES = [
  { prefix: "saw",     slug: "concrete-cutting" },
  { prefix: "rinse",   slug: "pressure-washing" },
  { prefix: "mow",     slug: "lawn-care" },
  { prefix: "rooter",  slug: "drain-cleaning" },
  { prefix: "pipe",    slug: "plumbing" },
  { prefix: "lockout", slug: "locksmith" },
  { prefix: "pest",    slug: "pest-control" },
  { prefix: "duct",    slug: "hvac" },
  { prefix: "detail",  slug: "auto-detailing" },
  { prefix: "plow",    slug: "snow-removal" },
  { prefix: "prune",   slug: "tree-service" },
  { prefix: "chimney", slug: "chimney-sweep" },
  { prefix: "haul",    slug: "hauling" },
  { prefix: "grade",   slug: "grading" },
  { prefix: "coat",    slug: "painting" },
  { prefix: "brake",   slug: "auto-repair" },
  { prefix: "wrench",  slug: "mechanic" },
  { prefix: "polish",  slug: "floor-polishing" },
  { prefix: "pave",    slug: "paving" },
  { prefix: "wreck",   slug: "demolition" },
];

async function uploadFile(localPath, storagePath) {
  const buffer = fs.readFileSync(localPath);
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "image/png",
        "x-upsert": "true",
      },
      body: buffer,
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed (${res.status}): ${err}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

async function upsertAsset(trade_slug, asset_type, image_url) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/trade_assets`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      trade_slug,
      asset_type,
      image_url,
      status: "pending",
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DB upsert failed (${res.status}): ${err}`);
  }
}

async function main() {
  const results = { ok: [], failed: [] };

  for (const { prefix, slug } of TRADES) {
    for (const type of ["hero", "og"]) {
      const folder = type === "hero" ? "hero-originals" : "og-originals";
      const localPath = path.join(BASE, folder, `${prefix}-${type}.png`);
      const storagePath = `trade-${type}s/${slug}-${type}.png`;

      if (!fs.existsSync(localPath)) {
        console.log(`⚠️  MISSING: ${localPath}`);
        results.failed.push({ slug, type, reason: "file not found" });
        continue;
      }

      try {
        const url = await uploadFile(localPath, storagePath);
        await upsertAsset(slug, type, url);
        const size = (fs.statSync(localPath).size / 1024 / 1024).toFixed(1);
        console.log(`✅ ${slug} ${type} (${size}MB) → ${url}`);
        results.ok.push({ slug, type, url });
      } catch (err) {
        console.error(`❌ ${slug} ${type}: ${err.message}`);
        results.failed.push({ slug, type, reason: err.message });
      }
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`✅ Uploaded: ${results.ok.length}/40`);
  console.log(`❌ Failed:   ${results.failed.length}`);
  if (results.failed.length) {
    console.log("Failures:", JSON.stringify(results.failed, null, 2));
  }

  // Verify a sample from Supabase
  const check = await fetch(
    `${SUPABASE_URL}/rest/v1/trade_assets?select=trade_slug,asset_type,image_url,status&not.image_url=is.null&order=trade_slug`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  const rows = await check.json();
  console.log(`\nDB rows with image_url: ${rows.length}`);
}

main().catch(console.error);
