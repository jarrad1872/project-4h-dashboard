#!/usr/bin/env node
/**
 * 4H CLI — operate the 4H advertising campaign from the command line.
 *
 * Config:
 *   PUMPCANS_BASE_URL  — default: https://pumpcans.com
 *   PUMPCANS_TOKEN     — Bearer token (optional if API auth disabled)
 *
 * Usage:
 *   node scripts/4h-cli.js <command> [options]
 *   npm run cli -- <command> [options]
 *
 * Note on creative formats:
 *   The API uses CreativeFormat values: linkedin-single, meta-square, instagram-story, youtube-thumb
 *   The CLI also accepts shorthand aliases: hero_a (→ linkedin-single), hero_b (→ meta-square), og_nb2 (→ meta-square)
 */

const BASE_URL = process.env.PUMPCANS_BASE_URL || 'https://pumpcans.com';
const TOKEN = process.env.PUMPCANS_TOKEN;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    console.error('API error:', JSON.stringify(err, null, 2));
    process.exit(1);
  }
  return res.json();
}

function parseArgs(argv) {
  const args = {};
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i += 2;
      } else {
        args[key] = true;
        i++;
      }
    } else {
      i++;
    }
  }
  return args;
}

function printTable(rows, columns) {
  if (!rows || rows.length === 0) {
    console.log('(no results)');
    return;
  }
  const cols = columns || Object.keys(rows[0]);
  const widths = cols.map((col) =>
    Math.max(col.length, ...rows.map((r) => String(r[col] ?? '').length))
  );
  const header = cols.map((col, i) => col.padEnd(widths[i])).join('  ');
  const divider = widths.map((w) => '-'.repeat(w)).join('  ');
  console.log(header);
  console.log(divider);
  for (const row of rows) {
    console.log(cols.map((col, i) => String(row[col] ?? '').padEnd(widths[i])).join('  '));
  }
}

// Map CLI shorthand format names to API CreativeFormat values
const FORMAT_ALIAS = {
  hero_a: 'linkedin-single',
  hero_b: 'meta-square',
  og_nb2: 'meta-square',
};

function resolveFormat(fmt) {
  return FORMAT_ALIAS[fmt] || fmt;
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function cmdAds(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));
  const useTable = Boolean(flags.table);

  if (sub === 'list') {
    const qs = new URLSearchParams();
    if (flags.status && flags.status !== 'all') qs.set('status', flags.status);
    if (flags.platform && flags.platform !== 'all') qs.set('platform', flags.platform);
    const data = await api('GET', `/api/ads?${qs}`);
    let rows = Array.isArray(data) ? data : [];
    if (flags.trade) rows = rows.filter((a) => a.campaign_group?.includes(flags.trade) || a.id?.startsWith(flags.trade));
    if (useTable) {
      printTable(rows, ['id', 'platform', 'status', 'workflow_stage', 'headline', 'created_at']);
    } else {
      printJson(rows);
    }
    return;
  }

  if (sub === 'approve') {
    if (flags.all) {
      // Fetch all pending (or filtered) ads and approve each
      const qs = new URLSearchParams({ status: flags.status || 'pending' });
      if (flags.trade) qs.set('trade', flags.trade);
      let ads = await api('GET', `/api/ads?${qs}`);
      if (!Array.isArray(ads)) ads = [];
      if (flags.trade) ads = ads.filter((a) => a.campaign_group?.includes(flags.trade) || a.id?.startsWith(flags.trade));
      if (ads.length === 0) { console.log('No matching ads to approve.'); return; }
      console.log(`Approving ${ads.length} ad(s)...`);
      for (const ad of ads) {
        await api('PATCH', `/api/ads/${ad.id}`, { status: 'approved' });
        console.log(`  ✓ ${ad.id}`);
      }
      console.log('Done.');
      return;
    }
    if (!flags.id) { console.error('--id or --all is required'); process.exit(1); }
    const result = await api('PATCH', `/api/ads/${flags.id}`, { status: 'approved' });
    printJson(result);
    return;
  }

  if (sub === 'reject') {
    if (!flags.id) { console.error('--id is required'); process.exit(1); }
    const result = await api('PATCH', `/api/ads/${flags.id}`, { status: 'rejected' });
    printJson(result);
    return;
  }

  console.error('Unknown ads subcommand. Use: list, approve, reject');
  process.exit(1);
}

async function cmdCampaign(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));
  const useTable = Boolean(flags.table);

  if (sub === 'status') {
    const data = await api('GET', '/api/campaign-status');
    if (useTable) {
      printTable([data], ['status', 'startDate', 'linkedinStatus', 'youtubeStatus', 'facebookStatus', 'instagramStatus']);
    } else {
      printJson(data);
    }
    return;
  }

  if (sub === 'set-status') {
    if (!flags.status) { console.error('--status is required (active|paused|pre-launch)'); process.exit(1); }
    const result = await api('PATCH', '/api/campaign-status', { status: flags.status });
    printJson(result);
    return;
  }

  console.error('Unknown campaign subcommand. Use: status, set-status');
  process.exit(1);
}

async function cmdBudget(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));
  const useTable = Boolean(flags.table);

  if (sub === 'status') {
    const data = await api('GET', '/api/budget');
    if (useTable && data.channels) {
      const rows = Object.entries(data.channels).map(([platform, ch]) => ({
        platform,
        allocated: ch.allocated,
        spent: ch.spent,
        remaining: ch.allocated - ch.spent,
      }));
      printTable(rows, ['platform', 'allocated', 'spent', 'remaining']);
    } else {
      printJson(data);
    }
    return;
  }

  if (sub === 'set') {
    if (!flags.platform) { console.error('--platform is required'); process.exit(1); }
    if (flags.amount === undefined) { console.error('--amount is required'); process.exit(1); }
    const result = await api('PATCH', '/api/budget', { platform: flags.platform, spent: Number(flags.amount) });
    printJson(result);
    return;
  }

  console.error('Unknown budget subcommand. Use: status, set');
  process.exit(1);
}

async function cmdMetrics(subArgs) {
  const flags = parseArgs(subArgs);
  const fmt = flags.format || 'json';
  const data = await api('GET', '/api/metrics');

  if (fmt === 'table' || flags.table) {
    const weeks = data.weeks || [];
    if (weeks.length === 0) { console.log('No metrics data.'); return; }
    const platforms = ['linkedin', 'youtube', 'facebook', 'instagram'];
    const rows = [];
    for (const week of weeks) {
      for (const p of platforms) {
        const ch = week[p] || {};
        rows.push({ week: week.weekStart, platform: p, spend: ch.spend, impressions: ch.impressions, clicks: ch.clicks, signups: ch.signups });
      }
    }
    printTable(rows, ['week', 'platform', 'spend', 'impressions', 'clicks', 'signups']);
  } else {
    printJson(data);
  }
}

async function cmdReport(subArgs) {
  const sub = subArgs[0];

  if (sub === 'daily') {
    const data = await api('GET', '/api/report/daily');

    console.log('\n📊 4H Daily Report —', data.generated_at);
    console.log('═══════════════════════════════════════');
    console.log(`Campaign Status: ${data.campaign_status}`);
    console.log(`\nAds:`);
    console.log(`  Total: ${data.ads.total}`);
    console.log(`  Pending approval: ${data.ads.pending_approval}`);
    console.log(`  Approved: ${data.ads.approved}`);
    console.log(`  Live: ${data.ads.live}`);
    console.log(`  By status: ${JSON.stringify(data.ads.by_status)}`);
    console.log(`\nBudget:`);
    console.log(`  Total allocated: $${data.budget.total_allocated}`);
    console.log(`  Total spent: $${data.budget.total_spent}`);
    for (const [p, b] of Object.entries(data.budget.by_platform)) {
      console.log(`  ${p}: $${b.allocated} allocated, $${b.spent} spent (${b.pct_used}%)`);
    }
    if (data.metrics_summary) {
      const m = data.metrics_summary;
      console.log(`\nLast Week:`);
      console.log(`  Spend: $${m.total_spend} | Impressions: ${m.total_impressions} | Clicks: ${m.total_clicks} | Signups: ${m.total_signups}`);
    }
    if (data.blockers.length > 0) {
      console.log(`\n⚠️  Blockers (${data.blockers.length}):`);
      for (const b of data.blockers) console.log(`  • ${b}`);
    } else {
      console.log('\n✅ No blockers');
    }
    console.log('');
    return;
  }

  console.error('Unknown report subcommand. Use: daily');
  process.exit(1);
}

async function cmdCreative(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));

  if (sub === 'gen') {
    const { trade, format: rawFormat, style, push: doPush, prompt: customPrompt } = flags;
    if (!trade || !rawFormat || !style) {
      console.error('--trade, --format, and --style are required');
      process.exit(1);
    }
    const format = resolveFormat(rawFormat);
    console.log(`Generating creative for trade=${trade} format=${format} style=${style}...`);
    const result = await api('POST', '/api/ai-creative', { trade, format, style, customPrompt });
    if (result.imageBase64) {
      console.log(`✓ Generated. Drive link: ${result.driveLink || 'n/a'}`);
      if (doPush) {
        console.log('Pushing to trade-assets...');
        const assetType = rawFormat.startsWith('hero_a') ? 'hero_a' :
          rawFormat.startsWith('hero_b') ? 'hero_b' : 'og_nb2';
        await api('POST', '/api/trade-assets', {
          trade_slug: trade,
          asset_type: assetType,
          imageBase64: result.imageBase64,
        });
        console.log('✓ Pushed to trade-assets.');
      }
      printJson({ trade, format, style, driveLink: result.driveLink, model: result.model });
    } else {
      printJson(result);
    }
    return;
  }

  if (sub === 'batch') {
    const { file } = flags;
    if (!file) { console.error('--file is required'); process.exit(1); }
    const fs = await import('node:fs');
    const raw = fs.readFileSync(file, 'utf-8');
    const batchData = JSON.parse(raw);
    // Resolve format aliases in jobs
    if (batchData.jobs) {
      batchData.jobs = batchData.jobs.map((j) => ({ ...j, format: resolveFormat(j.format) }));
    }
    console.log(`Running batch of ${batchData.jobs?.length ?? 0} jobs...`);
    const result = await api('POST', '/api/creative/batch', batchData);
    console.log(`\nResults: ${result.succeeded}/${result.total} succeeded (${result.failed} failed)\n`);
    for (const r of result.results || []) {
      const icon = r.status === 'ok' ? '✓' : '✗';
      console.log(`${icon} ${r.trade} / ${r.format} / ${r.style}${r.error ? `: ${r.error}` : ''}`);
    }
    return;
  }

  console.error('Unknown creative subcommand. Use: gen, batch');
  process.exit(1);
}

async function cmdAlerts(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));
  const useTable = Boolean(flags.table);

  if (sub === 'list') {
    const data = await api('GET', '/api/alerts');
    if (useTable) {
      printTable(Array.isArray(data) ? data : [], ['id', 'metric', 'platform', 'operator', 'threshold', 'action', 'created_at']);
    } else {
      printJson(data);
    }
    return;
  }

  if (sub === 'add') {
    const { metric, platform, op, threshold, action } = flags;
    if (!metric || !platform || !op || threshold === undefined || !action) {
      console.error('Required: --metric --platform --op --threshold --action');
      process.exit(1);
    }
    const result = await api('POST', '/api/alerts', {
      metric,
      platform,
      operator: op,
      threshold: Number(threshold),
      action,
    });
    printJson(result);
    return;
  }

  if (sub === 'remove') {
    if (!flags.id) { console.error('--id is required'); process.exit(1); }
    const result = await api('DELETE', `/api/alerts?id=${flags.id}`);
    printJson(result);
    return;
  }

  console.error('Unknown alerts subcommand. Use: list, add, remove');
  process.exit(1);
}

async function cmdLaunch(subArgs) {
  const sub = subArgs[0];

  if (sub === 'check') {
    const data = await api('GET', '/api/launch-checklist');
    const items = Array.isArray(data) ? data : [];
    const checked = items.filter((i) => i.checked).length;
    const unchecked = items.filter((i) => !i.checked);

    console.log(`\n🚀 Launch Checklist: ${checked}/${items.length} ready\n`);
    if (unchecked.length > 0) {
      console.log('Blockers:');
      for (const item of unchecked) {
        console.log(`  ✗ [${item.platform}] ${item.label}`);
      }
    } else {
      console.log('✅ All checklist items complete!');
    }
    console.log('');
    return;
  }

  console.error('Unknown launch subcommand. Use: check');
  process.exit(1);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === '--help' || argv[0] === 'help') {
    console.log(`
4H CLI — operate the 4H campaign without the dashboard UI

Commands:
  ads list [--status pending|approved|live] [--platform linkedin|...] [--trade <slug>] [--table]
  ads approve --id <id>
  ads approve --all [--trade <slug>] [--status pending]
  ads reject --id <id>

  campaign status [--table]
  campaign set-status --status active|paused|pre-launch

  budget status [--table]
  budget set --platform <p> --amount <n>

  metrics [--format json|table] [--table]

  report daily

  creative gen --trade <slug> --format hero_a|hero_b|og_nb2|linkedin-single|... --style pain-point|... [--push]
  creative batch --file <json-file>

  alerts list [--table]
  alerts add --metric spend|ctr|cac|signups --platform linkedin|... --op gt|lt --threshold <n> --action notify|kill|scale
  alerts remove --id <id>

  launch check

Config:
  PUMPCANS_BASE_URL  (default: https://pumpcans.com)
  PUMPCANS_TOKEN     (optional Bearer token)
`);
    return;
  }

  const command = argv[0];
  const subArgs = argv.slice(1);

  const commands = {
    ads: cmdAds,
    campaign: cmdCampaign,
    budget: cmdBudget,
    metrics: cmdMetrics,
    report: cmdReport,
    creative: cmdCreative,
    alerts: cmdAlerts,
    launch: cmdLaunch,
  };

  const handler = commands[command];
  if (!handler) {
    console.error(`Unknown command: ${command}`);
    console.error(`Available commands: ${Object.keys(commands).join(', ')}`);
    process.exit(1);
  }

  await handler(subArgs);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
