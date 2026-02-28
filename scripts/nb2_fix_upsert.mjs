/**
 * Post-generation fix: alter the check constraint and upsert all 60 trade_assets rows
 * Run after images are generated and uploaded.
 * 
 * Requires the check constraint to allow: hero_a, hero_b, og_nb2
 * SQL migration needed (run in Supabase SQL editor):
 *   ALTER TABLE trade_assets DROP CONSTRAINT trade_assets_asset_type_check;
 *   ALTER TABLE trade_assets ADD CONSTRAINT trade_assets_asset_type_check 
 *     CHECK (asset_type IN ('hero', 'og', 'hero_a', 'hero_b', 'og_nb2'));
 */

const SUPABASE_URL = 'https://vzawlfitqnjhypnkguas.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YXdsZml0cW5qaHlwbmtndWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwOTU2NywiZXhwIjoyMDg3Nzg1NTY3fQ.P8qFx_7hYBA0h8ri6b3dGfM5JqBjLP-ej8zVeodMLa0';

const slugs = [
  'concrete-cutting', 'pressure-washing', 'lawn-care', 'drain-cleaning',
  'plumbing', 'locksmith', 'pest-control', 'hvac', 'auto-detailing',
  'snow-removal', 'tree-service', 'chimney-sweep', 'hauling', 'grading',
  'painting', 'auto-repair', 'mechanic', 'floor-polishing', 'paving', 'demolition'
];

async function upsertTradeAsset(tradeSlug, assetType, imageUrl) {
  const url = `${SUPABASE_URL}/rest/v1/trade_assets`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      trade_slug: tradeSlug,
      asset_type: assetType,
      image_url: imageUrl,
      status: 'pending',
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upsert failed ${response.status}: ${text}`);
  }
  return true;
}

async function main() {
  let success = 0;
  let fail = 0;
  const failures = [];

  for (const slug of slugs) {
    const assets = [
      {
        type: 'hero_a',
        url: `${SUPABASE_URL}/storage/v1/object/public/ad-creatives/trade-heros/nb2/${slug}-hero-a.jpg`,
      },
      {
        type: 'hero_b',
        url: `${SUPABASE_URL}/storage/v1/object/public/ad-creatives/trade-heros/nb2/${slug}-hero-b.jpg`,
      },
      {
        type: 'og_nb2',
        url: `${SUPABASE_URL}/storage/v1/object/public/ad-creatives/trade-ogs/nb2/${slug}-og.jpg`,
      },
    ];

    for (const asset of assets) {
      try {
        await upsertTradeAsset(slug, asset.type, asset.url);
        console.log(`✓ ${slug} / ${asset.type}`);
        success++;
      } catch (err) {
        console.error(`✗ ${slug} / ${asset.type}: ${err.message.slice(0, 100)}`);
        failures.push({ slug, type: asset.type, error: err.message.slice(0, 100) });
        fail++;
      }
    }
  }

  console.log(`\nDone: ${success} success, ${fail} failed`);
  if (failures.length) {
    console.log('Failures:', JSON.stringify(failures, null, 2));
  }
}

main().catch(console.error);
