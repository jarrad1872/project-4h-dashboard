#!/usr/bin/env node
/**
 * 4H CLI — operate the 4H advertising campaign from the command line.
 *
 * Config:
 *   PUMPCANS_BASE_URL  — default: https://pumpcans.com
 *   PUMPCANS_TOKEN     — Bearer token (optional if API auth disabled)
 *   TELEGRAM_BOT_TOKEN — Telegram Bot API token (for notify commands)
 *   TELEGRAM_CHAT_ID   — Jarrad's Telegram chat ID
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
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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

async function sendTelegram(text) {
  if (!TG_TOKEN || !TG_CHAT_ID) {
    console.error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      text,
      parse_mode: 'Markdown',
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error('Telegram error:', data.description);
    process.exit(1);
  }
  return data;
}

// Signal logic (mirrors lib/metrics.ts)
function calcCtr(m) { return m.impressions ? (m.clicks / m.impressions) * 100 : 0; }
function calcCpaPaid(m) { return m.paid ? m.spend / m.paid : 0; }
function calcActivationRate(m) { return m.signups ? (m.activations / m.signups) * 100 : 0; }
function signal(m) {
  const ctr = calcCtr(m);
  const cpaPaid = calcCpaPaid(m);
  const activationRate = calcActivationRate(m);
  if (m.spend >= 300 && (ctr < 0.9 || activationRate < 20 || cpaPaid > 600)) return 'kill';
  if (ctr >= 1.6 && activationRate >= 35 && (cpaPaid === 0 || cpaPaid <= 350)) return 'scale';
  return 'watch';
}
function signalEmoji(s) {
  if (s === 'scale') return '🟢';
  if (s === 'kill') return '🔴';
  return '🟡';
}
function metricValue(m, metric) {
  switch (metric) {
    case 'spend': return m.spend;
    case 'ctr': return calcCtr(m);
    case 'cac': case 'cpa': return calcCpaPaid(m);
    case 'signups': return m.signups;
    default: return 0;
  }
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

  if (sub === 'archive') {
    const campaignGroup = flags['campaign-group'] || flags.campaignGroup;
    if (!campaignGroup) { console.error('--campaign-group is required (e.g. nb2)'); process.exit(1); }
    // Archive pending ads matching the campaign group
    const statuses = ['pending', 'approved', 'paused'];
    let totalArchived = 0;
    for (const fromStatus of statuses) {
      const result = await api('POST', '/api/ads/bulk-status', {
        newStatus: 'rejected',
        fromStatus,
        campaignGroupContains: campaignGroup,
      });
      const count = result.updated ?? 0;
      if (count > 0) console.log(`  Archived ${count} ${fromStatus} ads`);
      totalArchived += (typeof count === 'number' ? count : 0);
    }
    console.log(`Done. Archived ${totalArchived || 'all matching'} ads with campaign group "${campaignGroup}".`);
    return;
  }

  console.error('Unknown ads subcommand. Use: list, approve, reject, archive');
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

  if (sub === 'recommend') {
    await cmdBudgetRecommend();
    return;
  }

  console.error('Unknown budget subcommand. Use: status, set, recommend');
  process.exit(1);
}

async function cmdMetrics(subArgs) {
  const sub = subArgs[0];

  if (sub === 'ingest') {
    await cmdMetricsIngest(subArgs.slice(1));
    return;
  }

  if (sub === 'import') {
    await cmdMetricsImport(subArgs.slice(1));
    return;
  }

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

async function cmdMetricsIngest(subArgs) {
  const flags = parseArgs(subArgs);
  const required = ['platform', 'week'];
  for (const r of required) {
    if (!flags[r]) { console.error(`--${r} is required`); process.exit(1); }
  }

  const row = {
    week_start: flags.week,
    platform: flags.platform,
    spend: Number(flags.spend || 0),
    impressions: Number(flags.impressions || 0),
    clicks: Number(flags.clicks || 0),
    signups: Number(flags.signups || 0),
    activations: Number(flags.activations || 0),
    paid: Number(flags.paid || 0),
  };

  console.log(`Ingesting metrics for ${row.platform} week ${row.week_start}...`);
  const result = await api('POST', '/api/metrics', row);
  console.log('Done.');
  printJson(result);
}

async function cmdMetricsImport(subArgs) {
  const flags = parseArgs(subArgs);
  if (!flags.file) { console.error('--file is required'); process.exit(1); }

  const fs = await import('node:fs');
  const raw = fs.readFileSync(flags.file, 'utf-8');
  const lines = raw.trim().split('\n');

  if (lines.length < 2) {
    console.error('CSV must have a header row and at least one data row');
    process.exit(1);
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const expectedCols = ['week_start', 'platform', 'spend', 'impressions', 'clicks', 'signups', 'activations', 'paid'];

  // Map header to expected columns
  const colMap = {};
  for (const col of expectedCols) {
    const idx = header.indexOf(col);
    if (idx >= 0) colMap[col] = idx;
  }

  if (colMap.week_start === undefined || colMap.platform === undefined) {
    console.error(`CSV header must include at minimum: week_start, platform`);
    console.error(`Found: ${header.join(', ')}`);
    process.exit(1);
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length < 2) continue; // skip empty lines

    rows.push({
      week_start: vals[colMap.week_start],
      platform: vals[colMap.platform],
      spend: Number(vals[colMap.spend] || 0),
      impressions: Number(vals[colMap.impressions] || 0),
      clicks: Number(vals[colMap.clicks] || 0),
      signups: Number(vals[colMap.signups] || 0),
      activations: Number(vals[colMap.activations] || 0),
      paid: Number(vals[colMap.paid] || 0),
    });
  }

  console.log(`Importing ${rows.length} metric rows from ${flags.file}...`);
  const result = await api('POST', '/api/metrics/batch', rows);
  console.log(`Done. Inserted: ${result.inserted}`);
  if (result.errors) {
    console.log('Errors:');
    for (const e of result.errors) console.log(`  - ${e}`);
  }
}

async function cmdReport(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));

  if (sub === 'daily') {
    const data = await api('GET', '/api/report/daily');

    if (flags.send) {
      // Build Telegram message and send
      const m = data.metrics_summary || { total_spend: 0, total_impressions: 0, total_clicks: 0, total_signups: 0 };
      const lines = [
        `📊 *4H Daily Report*`,
        `Campaign: ${data.campaign_status}`,
        '',
        `*Totals (latest week):*`,
        `Spend: $${m.total_spend} | Impr: ${m.total_impressions} | Clicks: ${m.total_clicks} | Signups: ${m.total_signups}`,
      ];
      if (data.blockers && data.blockers.length > 0) {
        lines.push('', `*Blockers (${data.blockers.length}):*`);
        for (const b of data.blockers) lines.push(`• ${b}`);
      }
      await sendTelegram(lines.join('\n'));
      console.log('Daily report sent to Telegram.');
      return;
    }

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

  if (sub === 'weekly') {
    const data = await api('GET', '/api/report/weekly');

    if (flags.send) {
      const lines = [
        `📈 *4H Weekly Report — ${data.week_start}*`,
        '',
        `*Budget:* $${data.total_spend} of $${data.budget_total} (${data.budget_used_pct}%)`,
        '',
        '*Platform Breakdown:*',
      ];
      for (const p of (data.platforms || [])) {
        if (p.spend === 0 && p.ctr === 0) continue;
        const emoji = p.signal === 'scale' ? '🟢' : p.signal === 'kill' ? '🔴' : '🟡';
        const sigChange = p.prev_signal && p.prev_signal !== p.signal ? ` (was ${p.prev_signal})` : '';
        lines.push(`${emoji} *${p.platform.toUpperCase()}* — ${p.signal.toUpperCase()}${sigChange}`);
        lines.push(`  Spend: $${p.spend} | CTR: ${p.ctr}% | CPA: $${p.cpa_paid}`);
        lines.push(`  Activation: ${p.activation_rate}% | Signups: ${p.signups}`);
      }
      await sendTelegram(lines.join('\n'));
      console.log('Weekly report sent to Telegram.');
      return;
    }

    console.log(`\n📈 4H Weekly Report — ${data.week_start}`);
    console.log('═══════════════════════════════════════');
    console.log(`Budget: $${data.total_spend} of $${data.budget_total} (${data.budget_used_pct}%)`);
    console.log('');
    for (const p of (data.platforms || [])) {
      const emoji = p.signal === 'scale' ? '🟢' : p.signal === 'kill' ? '🔴' : '🟡';
      const sigChange = p.prev_signal && p.prev_signal !== p.signal ? ` (was ${p.prev_signal})` : '';
      console.log(`${emoji} ${p.platform.toUpperCase()} — ${p.signal.toUpperCase()}${sigChange}`);
      console.log(`   Spend: $${p.spend} | CTR: ${p.ctr}% | CPA: $${p.cpa_paid}`);
      console.log(`   Activation: ${p.activation_rate}% | Signups: ${p.signups}`);
    }
    console.log('');
    return;
  }

  console.error('Unknown report subcommand. Use: daily, weekly');
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

// ─── Phase 1: Notify ──────────────────────────────────────────────────────────

async function cmdNotify(subArgs) {
  const sub = subArgs[0];

  if (sub === 'test') {
    const msg = [
      '🔧 *4H Engine — Test Message*',
      '',
      'Telegram notifications are working.',
      `Sent at: ${new Date().toISOString()}`,
    ].join('\n');
    await sendTelegram(msg);
    console.log('Test message sent to Telegram.');
    return;
  }

  if (sub === 'send') {
    const flags = parseArgs(subArgs.slice(1));
    if (!flags.message) { console.error('--message is required'); process.exit(1); }
    await sendTelegram(flags.message);
    console.log('Message sent to Telegram.');
    return;
  }

  console.error('Unknown notify subcommand. Use: test, send');
  process.exit(1);
}

// ─── Phase 3: Engine + Signals ────────────────────────────────────────────────

async function cmdEngine(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));

  if (sub === 'evaluate') {
    const metricsData = await api('GET', '/api/metrics');
    const weeks = metricsData.weeks || [];

    if (weeks.length === 0) {
      console.log('No metrics data — nothing to evaluate.');
      return;
    }

    const latestWeek = weeks[weeks.length - 1];
    console.log(`Evaluating week: ${latestWeek.weekStart}\n`);

    const alertRules = await api('GET', '/api/alerts');
    const platforms = ['linkedin', 'youtube', 'facebook', 'instagram'];
    const signals = [];
    const alertsFired = [];
    const notifications = [];

    // Evaluate signals
    for (const p of platforms) {
      const ch = latestWeek[p];
      if (!ch || (ch.spend === 0 && ch.impressions === 0)) continue;

      const sig = signal(ch);
      const data = {
        platform: p,
        signal: sig,
        ctr: calcCtr(ch),
        cpa_paid: calcCpaPaid(ch),
        activation_rate: calcActivationRate(ch),
        spend: ch.spend,
      };
      signals.push(data);

      if (sig === 'kill') {
        notifications.push([
          `🔴 *KILL SIGNAL: ${p.toUpperCase()}*`,
          '',
          `CTR: ${data.ctr.toFixed(1)}% | CPA: $${data.cpa_paid.toFixed(0)} | Activation: ${data.activation_rate.toFixed(0)}%`,
          `Spend: $${data.spend.toFixed(0)}`,
          '',
          `*Recommend:* Pause ${p} ads immediately.`,
        ].join('\n'));
      } else if (sig === 'scale') {
        notifications.push([
          `🟢 *SCALE SIGNAL: ${p.toUpperCase()}*`,
          '',
          `CTR: ${data.ctr.toFixed(1)}% | CPA: $${data.cpa_paid.toFixed(0)} | Activation: ${data.activation_rate.toFixed(0)}%`,
          `Spend: $${data.spend.toFixed(0)}`,
          '',
          `*Recommend:* Increase ${p} budget by 50%.`,
        ].join('\n'));
      }
    }

    // Evaluate alerts
    for (const rule of alertRules) {
      const targetPlatforms = rule.platform === 'all' ? platforms : [rule.platform];
      for (const p of targetPlatforms) {
        const ch = latestWeek[p];
        if (!ch) continue;
        const current = metricValue(ch, rule.metric);
        let triggered = false;
        if (rule.operator === 'gt' && current > rule.threshold) triggered = true;
        if (rule.operator === 'lt' && current < rule.threshold) triggered = true;
        if (triggered) {
          alertsFired.push({ id: rule.id, metric: rule.metric, platform: p, current: Math.round(current * 100) / 100, threshold: rule.threshold });
          const opLabel = rule.operator === 'gt' ? 'exceeded' : 'fell below';
          notifications.push(`⚠️ *ALERT: ${rule.metric.toUpperCase()} ${opLabel} threshold*\nPlatform: ${p} | Current: ${Math.round(current * 100) / 100} | Threshold: ${rule.threshold}`);
        }
      }
    }

    // Print results
    console.log('Signals:');
    for (const s of signals) {
      console.log(`  ${signalEmoji(s.signal)} ${s.platform}: ${s.signal.toUpperCase()} (CTR ${s.ctr.toFixed(1)}%, CPA $${s.cpa_paid.toFixed(0)}, Act ${s.activation_rate.toFixed(0)}%)`);
    }
    if (signals.length === 0) console.log('  (no active platforms)');

    if (alertsFired.length > 0) {
      console.log(`\nAlerts Fired (${alertsFired.length}):`);
      for (const a of alertsFired) {
        console.log(`  ⚠️  ${a.platform} ${a.metric}: ${a.current} (threshold: ${a.threshold})`);
      }
    }

    if (notifications.length > 0) {
      console.log(`\nNotifications: ${notifications.length}`);
    }

    const isDryRun = flags['dry-run'] || flags.dry;

    if (isDryRun) {
      console.log('\n[DRY RUN] Would send the following Telegram messages:');
      for (const n of notifications) {
        console.log('---');
        console.log(n);
      }
      return;
    }

    if (flags.execute && notifications.length > 0) {
      console.log('\nSending Telegram notifications...');
      for (const msg of notifications) {
        await sendTelegram(msg);
        console.log('  ✓ Sent');
      }
      console.log('Done.');
    } else if (notifications.length > 0) {
      console.log('\nUse --execute to send notifications, or --dry-run to preview.');
    }
    return;
  }

  if (sub === 'status') {
    const data = await api('GET', '/api/engine/status');
    printJson(data);
    return;
  }

  console.error('Unknown engine subcommand. Use: evaluate, status');
  process.exit(1);
}

async function cmdSignals(subArgs) {
  const metricsData = await api('GET', '/api/metrics');
  const weeks = metricsData.weeks || [];

  if (weeks.length === 0) {
    console.log('No metrics data.');
    return;
  }

  const latestWeek = weeks[weeks.length - 1];
  console.log(`\n📡 Signals for week: ${latestWeek.weekStart}\n`);

  const platforms = ['linkedin', 'youtube', 'facebook', 'instagram'];
  const rows = [];

  for (const p of platforms) {
    const ch = latestWeek[p];
    if (!ch) continue;
    const sig = signal(ch);
    rows.push({
      platform: p,
      signal: `${signalEmoji(sig)} ${sig.toUpperCase()}`,
      spend: `$${ch.spend}`,
      ctr: `${calcCtr(ch).toFixed(1)}%`,
      cpa_paid: `$${calcCpaPaid(ch).toFixed(0)}`,
      activation: `${calcActivationRate(ch).toFixed(0)}%`,
      signups: ch.signups,
    });
  }

  printTable(rows, ['platform', 'signal', 'spend', 'ctr', 'cpa_paid', 'activation', 'signups']);
  console.log('');
}

// ─── Phase 5: Morning ─────────────────────────────────────────────────────────

async function cmdMorning() {
  console.log('\n☀️  4H Morning Check\n═══════════════════════════════════════\n');

  // 1. Daily report
  const report = await api('GET', '/api/report/daily');
  console.log(`Campaign: ${report.campaign_status}`);
  console.log(`Ads: ${report.ads.total} total, ${report.ads.approved} approved, ${report.ads.pending_approval} pending`);

  const m = report.metrics_summary;
  if (m) {
    console.log(`\nLast Week: $${m.total_spend} spend | ${m.total_impressions} impr | ${m.total_clicks} clicks | ${m.total_signups} signups`);
  }

  // 2. Signals
  const metricsData = await api('GET', '/api/metrics');
  const weeks = metricsData.weeks || [];
  if (weeks.length > 0) {
    const latestWeek = weeks[weeks.length - 1];
    const platforms = ['linkedin', 'youtube', 'facebook', 'instagram'];

    console.log(`\nSignals (${latestWeek.weekStart}):`);
    for (const p of platforms) {
      const ch = latestWeek[p];
      if (!ch || (ch.spend === 0 && ch.impressions === 0)) continue;
      const sig = signal(ch);
      console.log(`  ${signalEmoji(sig)} ${p}: ${sig.toUpperCase()} (CTR ${calcCtr(ch).toFixed(1)}%, CPA $${calcCpaPaid(ch).toFixed(0)}, Act ${calcActivationRate(ch).toFixed(0)}%)`);
    }

    // 3. Alert check
    const alertRules = await api('GET', '/api/alerts');
    let alertCount = 0;
    for (const rule of alertRules) {
      const targetPlatforms = rule.platform === 'all' ? platforms : [rule.platform];
      for (const p of targetPlatforms) {
        const ch = latestWeek[p];
        if (!ch) continue;
        const current = metricValue(ch, rule.metric);
        let triggered = false;
        if (rule.operator === 'gt' && current > rule.threshold) triggered = true;
        if (rule.operator === 'lt' && current < rule.threshold) triggered = true;
        if (triggered) {
          if (alertCount === 0) console.log('\nFired Alerts:');
          alertCount++;
          console.log(`  ⚠️  ${p} ${rule.metric}: ${Math.round(current * 100) / 100} (threshold: ${rule.threshold})`);
        }
      }
    }
    if (alertCount === 0) console.log('\nNo alerts firing.');
  }

  // 4. Blockers
  if (report.blockers.length > 0) {
    console.log(`\nBlockers (${report.blockers.length}):`);
    for (const b of report.blockers) console.log(`  • ${b}`);
  } else {
    console.log('\n✅ No blockers.');
  }

  // 5. Budget recommendations
  if (weeks.length > 0) {
    const latestWeek = weeks[weeks.length - 1];
    const platforms = ['linkedin', 'youtube', 'facebook', 'instagram'];
    const recs = [];
    for (const p of platforms) {
      const ch = latestWeek[p];
      if (!ch || (ch.spend === 0 && ch.impressions === 0)) continue;
      const sig = signal(ch);
      if (sig === 'scale') recs.push(`  📈 ${p}: Increase budget by 50%`);
      if (sig === 'kill') recs.push(`  🛑 ${p}: Pause — underperforming`);
    }
    if (recs.length > 0) {
      console.log('\nRecommendations:');
      for (const r of recs) console.log(r);
    }
  }

  console.log('\n═══════════════════════════════════════\n');
}

// ─── Phase 6: Influencer ──────────────────────────────────────────────────────

async function cmdInfluencer(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));
  const useTable = Boolean(flags.table);

  if (sub === 'list') {
    const qs = new URLSearchParams();
    if (flags.status) qs.set('status', flags.status);
    const data = await api('GET', `/api/influencers?${qs}`);
    const rows = Array.isArray(data) ? data : [];

    if (useTable || !flags.json) {
      printTable(rows, ['id', 'creator_name', 'trade', 'platform', 'status', 'deal_page', 'updated_at']);
    } else {
      printJson(rows);
    }
    return;
  }

  if (sub === 'add') {
    if (!flags.creator || !flags.trade) {
      console.error('Required: --creator --trade [--channel] [--platform youtube]');
      process.exit(1);
    }
    const result = await api('POST', '/api/influencers', {
      creator_name: flags.creator,
      trade: flags.trade,
      platform: flags.platform || 'youtube',
      channel_url: flags.channel || null,
      estimated_reach: flags.reach || null,
      deal_page: flags['deal-page'] || null,
    });
    console.log('Influencer added.');
    printJson(result);
    return;
  }

  if (sub === 'update') {
    if (!flags.id) { console.error('--id is required'); process.exit(1); }
    const update = {};
    if (flags.status) update.status = flags.status;
    if (flags.note || flags.notes) update.notes = flags.note || flags.notes;
    if (flags['deal-page']) update.deal_page = flags['deal-page'];
    if (flags.code) update.referral_code = flags.code;
    if (flags.contact) update.last_contact_at = flags.contact;

    if (Object.keys(update).length === 0) {
      console.error('Provide at least one field to update: --status, --note, --deal-page, --code, --contact');
      process.exit(1);
    }

    const result = await api('PATCH', `/api/influencers/${flags.id}`, update);
    console.log('Influencer updated.');
    printJson(result);
    return;
  }

  if (sub === 'seed') {
    console.log('Seeding influencer pipeline from static data...');
    const creators = [
      { creator_name: "Mike Andes", trade: "Lawn Care", platform: "youtube", channel_url: "https://www.youtube.com/@MikeAndes", estimated_reach: "80K+ operators", deal_page: "mow.city/mikeandes", status: "identified" },
      { creator_name: "Brian's Lawn Maintenance", trade: "Lawn Care", platform: "youtube", channel_url: "https://www.youtube.com/@BriansLawnMaintenance", estimated_reach: "150K+ operators", deal_page: "mow.city/brianslawn", status: "identified" },
      { creator_name: "AC Service Tech LLC", trade: "HVAC", platform: "youtube", channel_url: "https://www.youtube.com/@ACServiceTech", estimated_reach: "90K+ techs/owners", deal_page: "duct.city/acservicetech", status: "identified" },
      { creator_name: "Blades of Grass Lawn Care", trade: "Lawn Care", platform: "youtube", channel_url: "https://www.youtube.com/channel/UCPIZI7", estimated_reach: "300K+ operators", deal_page: "mow.city/bladesofgrass", status: "identified" },
      { creator_name: "HVAC School (Bryan Orr)", trade: "HVAC", platform: "youtube", channel_url: "https://www.youtube.com/@HVACSchool", estimated_reach: "60K+ techs/owners", deal_page: "duct.city/hvacschool", status: "identified" },
      { creator_name: "Roofing Insights (Dmitry)", trade: "Roofing", platform: "youtube", channel_url: "https://www.youtube.com/@RoofingInsights3.0", estimated_reach: "60K+ contractors", deal_page: "roofrepair.city/roofinginsights", status: "identified" },
      { creator_name: "Electrician U (Dustin Stelzer)", trade: "Electrical", platform: "youtube", channel_url: "https://www.youtube.com/@ElectricianU", estimated_reach: "120K+ electricians", deal_page: "electricians.city/electricianu", status: "identified" },
      { creator_name: "Roger Wakefield", trade: "Plumbing", platform: "youtube", channel_url: "https://www.youtube.com/@rogerplumbing", estimated_reach: "120K+ contractor-adjacent", deal_page: "pipe.city/rogerwakefield", status: "identified" },
      { creator_name: "King of Pressure Washing", trade: "Pressure Washing", platform: "youtube", channel_url: "https://www.youtube.com/@kingofpressurewash", estimated_reach: "35K+ operators", deal_page: "rinse.city/kingofpw", status: "identified" },
      { creator_name: "Painting Business Pro (Barstow)", trade: "Painting", platform: "youtube", channel_url: "https://www.youtube.com/@PaintingBusinessPro", estimated_reach: "36K operators", deal_page: "coat.city/paintingbizpro", status: "identified" },
    ];

    for (const c of creators) {
      try {
        await api('POST', '/api/influencers', c);
        console.log(`  ✓ ${c.creator_name}`);
      } catch {
        console.log(`  ✗ ${c.creator_name} (may already exist)`);
      }
    }
    console.log('Done.');
    return;
  }

  console.error('Unknown influencer subcommand. Use: list, add, update, seed');
  process.exit(1);
}

// ─── Phase 7: Budget Recommend ────────────────────────────────────────────────

async function cmdBudgetRecommend() {
  const metricsData = await api('GET', '/api/metrics');
  const budgetData = await api('GET', '/api/budget');
  const weeks = metricsData.weeks || [];

  if (weeks.length === 0) {
    console.log('No metrics data — can\'t make recommendations.');
    return;
  }

  const latestWeek = weeks[weeks.length - 1];
  const platforms = ['linkedin', 'youtube', 'facebook', 'instagram'];

  console.log(`\n💰 Budget Recommendations (${latestWeek.weekStart})\n`);

  for (const p of platforms) {
    const ch = latestWeek[p];
    if (!ch) continue;

    const sig = signal(ch);
    const current = budgetData.channels?.[p]?.allocated ?? 0;

    if (sig === 'scale') {
      const recommended = Math.round(current * 1.5);
      console.log(`  📈 ${p.toUpperCase()}: INCREASE $${current} → $${recommended} (+50%)`);
      console.log(`     CTR ${calcCtr(ch).toFixed(1)}%, CPA $${calcCpaPaid(ch).toFixed(0)}, Activation ${calcActivationRate(ch).toFixed(0)}%`);
    } else if (sig === 'kill') {
      console.log(`  🛑 ${p.toUpperCase()}: PAUSE (currently $${current})`);
      console.log(`     CTR ${calcCtr(ch).toFixed(1)}%, CPA $${calcCpaPaid(ch).toFixed(0)}, Activation ${calcActivationRate(ch).toFixed(0)}%`);
    } else {
      console.log(`  🟡 ${p.toUpperCase()}: HOLD at $${current}`);
      console.log(`     CTR ${calcCtr(ch).toFixed(1)}%, CPA $${calcCpaPaid(ch).toFixed(0)}, Activation ${calcActivationRate(ch).toFixed(0)}%`);
    }
    console.log('');
  }
}

// ─── Generate Copy ────────────────────────────────────────────────────────────

async function cmdGenerateCopy(subArgs) {
  const flags = parseArgs(subArgs);

  const trades = !flags.trades || flags.trades === 'all' ? 'all' : flags.trades.split(',');
  const platforms = !flags.platforms || flags.platforms === 'all' ? 'all' : flags.platforms.split(',');
  const angles = !flags.angles || flags.angles === 'all' ? 'all' : flags.angles.split(',');
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);

  console.log(`Generating ad copy...`);
  console.log(`  Trades:    ${Array.isArray(trades) ? trades.join(', ') : trades}`);
  console.log(`  Platforms: ${Array.isArray(platforms) ? platforms.join(', ') : platforms}`);
  console.log(`  Angles:    ${Array.isArray(angles) ? angles.join(', ') : angles}`);
  console.log(`  Dry run:   ${dryRun}`);
  console.log('');

  const result = await api('POST', '/api/ads/generate', {
    trades,
    platforms,
    angles,
    dryRun,
  });

  console.log(`Generated: ${result.generated}`);
  console.log(`Validated: ${result.validated}`);
  console.log(`Failed:    ${result.failed_validation}`);

  if (result.validation_failures?.length > 0) {
    console.log('\nValidation failures:');
    for (const f of result.validation_failures) {
      console.log(`  ✗ ${f.trade}/${f.platform}/${f.angle}: ${f.reason}`);
    }
  }

  if (dryRun && result.ads?.length > 0) {
    console.log('\nPreview (dry run):');
    for (const ad of result.ads) {
      console.log(`\n--- ${ad.id || `${ad.trade}/${ad.platform}/${ad.angle}`} ---`);
      console.log(`Headline: ${ad.headline}`);
      if (ad.primary_text) {
        console.log(`Copy: ${ad.primary_text.slice(0, 200)}${ad.primary_text.length > 200 ? '...' : ''}`);
      }
    }
  }
}

// ─── Context Generate ─────────────────────────────────────────────────────────

async function cmdContext(subArgs) {
  const sub = subArgs[0];
  const flags = parseArgs(subArgs.slice(1));

  if (sub === 'generate') {
    if (!flags.trade) { console.error('--trade <slug> is required'); process.exit(1); }
    console.log(`Generating trade context for "${flags.trade}"...`);
    console.log('(Not yet implemented — manually add context to lib/trade-copy-context.ts)');
    console.log(`\nTemplate:\n  ${flags.trade}: {`);
    console.log(`    trade: "Trade Name",`);
    console.log(`    domain: "${flags.trade}.city",`);
    console.log(`    callScenarios: ["who calls and why 1", "who calls and why 2", "who calls and why 3"],`);
    console.log(`    missedCallCost: "$X,000 job gone to the next contractor",`);
    console.log(`    busyMoment: "what they're doing when they can't answer",`);
    console.log(`  },`);
    return;
  }

  console.error('Unknown context subcommand. Use: generate');
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
  ads archive --campaign-group <group>

  generate-copy [--trades pipe,mow|all] [--platforms linkedin,facebook|all] [--angles pain,solution|all] [--dry-run]

  context generate --trade <slug>

  campaign status [--table]
  campaign set-status --status active|paused|pre-launch

  budget status [--table]
  budget set --platform <p> --amount <n>
  budget recommend

  metrics [--format json|table] [--table]
  metrics ingest --platform <p> --week <YYYY-MM-DD> --spend <n> --impressions <n> --clicks <n> --signups <n> --activations <n> --paid <n>
  metrics import --file <csv-file>

  report daily [--send]
  report weekly [--send]

  creative gen --trade <slug> --format hero_a|hero_b|og_nb2|linkedin-single|... --style pain-point|... [--push]
  creative batch --file <json-file>

  alerts list [--table]
  alerts add --metric spend|ctr|cac|signups --platform linkedin|... --op gt|lt --threshold <n> --action notify|kill|scale
  alerts remove --id <id>

  launch check

  notify test
  notify send --message "text"

  engine evaluate [--dry-run | --execute]
  engine status

  signals

  morning

  influencer list [--status contacted] [--table]
  influencer add --creator "Name" --trade "Trade" [--channel "url"] [--platform youtube]
  influencer update --id <id> [--status contacted] [--note "Emailed 2026-03-10"]
  influencer seed

Config:
  PUMPCANS_BASE_URL   (default: https://pumpcans.com)
  PUMPCANS_TOKEN      (optional Bearer token)
  TELEGRAM_BOT_TOKEN  (for notify/report --send)
  TELEGRAM_CHAT_ID    (for notify/report --send)
`);
    return;
  }

  const command = argv[0];
  const subArgs = argv.slice(1);

  const commands = {
    ads: cmdAds,
    'generate-copy': cmdGenerateCopy,
    context: cmdContext,
    campaign: cmdCampaign,
    budget: cmdBudget,
    metrics: cmdMetrics,
    report: cmdReport,
    creative: cmdCreative,
    alerts: cmdAlerts,
    launch: cmdLaunch,
    notify: cmdNotify,
    engine: cmdEngine,
    signals: cmdSignals,
    morning: cmdMorning,
    influencer: cmdInfluencer,
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
