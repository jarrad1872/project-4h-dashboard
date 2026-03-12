#!/usr/bin/env node
/**
 * 4H Engine — automation script for Bob's VPS.
 *
 * Commands:
 *   node 4h-engine.js evaluate             Run signal + alert evaluation, send Telegram notifications
 *   node 4h-engine.js report daily          Generate and send daily report via Telegram
 *   node 4h-engine.js report weekly         Generate and send weekly report via Telegram
 *
 * Cron schedule (VPS):
 *   0 *\/6 * * *  node /path/to/4h-engine.js evaluate
 *   0 8 * * *    node /path/to/4h-engine.js report daily
 *   0 8 * * 1    node /path/to/4h-engine.js report weekly
 *
 * Environment:
 *   PUMPCANS_BASE_URL   — default: https://pumpcans.com
 *   PUMPCANS_TOKEN      — Bearer token for API auth
 *   TELEGRAM_BOT_TOKEN  — Telegram Bot API token
 *   TELEGRAM_CHAT_ID    — Jarrad's Telegram chat ID
 *   SUPABASE_URL        — Supabase project URL (for engine_runs logging)
 *   SUPABASE_SERVICE_KEY — Supabase service role key
 */

const BASE_URL = process.env.PUMPCANS_BASE_URL || 'https://pumpcans.com';
const TOKEN = process.env.PUMPCANS_TOKEN;
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function apiGet(path) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(`${BASE_URL}${path}`, { method: 'GET', headers });
  if (!res.ok) throw new Error(`API GET ${path} failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function sendTelegram(text) {
  if (!TG_TOKEN || !TG_CHAT_ID) {
    console.log('[telegram] Not configured — skipping send');
    console.log(text);
    return { ok: false, error: 'Not configured' };
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
    console.error('[telegram] Error:', data.description);
    return { ok: false, error: data.description };
  }
  return { ok: true, messageId: data.result?.message_id };
}

async function logEngineRun(signals, alertsFired, actionsTaken) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/engine_runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        signals,
        alerts_fired: alertsFired,
        actions_taken: actionsTaken,
      }),
    });
  } catch (err) {
    console.error('[engine] Failed to log run:', err.message);
  }
}

// ─── Signal & Alert Logic (mirrors lib/engine-logic.ts) ─────────────────────

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

function metricValue(m, metric) {
  switch (metric) {
    case 'spend': return m.spend;
    case 'ctr': return calcCtr(m);
    case 'cac': case 'cpa': return calcCpaPaid(m);
    case 'signups': return m.signups;
    default: return 0;
  }
}

function signalEmoji(s) {
  if (s === 'scale') return '🟢';
  if (s === 'kill') return '🔴';
  return '🟡';
}

// ─── Commands ───────────────────────────────────────────────────────────────

async function cmdEvaluate() {
  console.log('[engine] Fetching metrics...');
  const metricsData = await apiGet('/api/metrics');
  const weeks = metricsData.weeks || [];

  if (weeks.length === 0) {
    console.log('[engine] No metrics data — skipping evaluation');
    return;
  }

  const latestWeek = weeks[weeks.length - 1];
  console.log(`[engine] Latest week: ${latestWeek.weekStart}`);

  console.log('[engine] Fetching alert rules...');
  const alertRules = await apiGet('/api/alerts');

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
      const msg = [
        `🔴 *KILL SIGNAL: ${p.toUpperCase()}*`,
        '',
        `CTR: ${data.ctr.toFixed(1)}% | CPA: $${data.cpa_paid.toFixed(0)} | Activation: ${data.activation_rate.toFixed(0)}%`,
        `Spend: $${data.spend.toFixed(0)}`,
        '',
        `*Recommend:* Pause ${p} ads immediately.`,
      ].join('\n');
      notifications.push(msg);
    } else if (sig === 'scale') {
      const msg = [
        `🟢 *SCALE SIGNAL: ${p.toUpperCase()}*`,
        '',
        `CTR: ${data.ctr.toFixed(1)}% | CPA: $${data.cpa_paid.toFixed(0)} | Activation: ${data.activation_rate.toFixed(0)}%`,
        `Spend: $${data.spend.toFixed(0)}`,
        '',
        `*Recommend:* Increase ${p} budget by 50%.`,
      ].join('\n');
      notifications.push(msg);
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
        const alertData = {
          id: rule.id,
          metric: rule.metric,
          platform: p,
          operator: rule.operator,
          threshold: rule.threshold,
          action: rule.action,
          current_value: Math.round(current * 100) / 100,
        };
        alertsFired.push(alertData);

        const opLabel = rule.operator === 'gt' ? 'exceeded' : 'fell below';
        const msg = [
          `⚠️ *ALERT: ${rule.metric.toUpperCase()} ${opLabel} threshold*`,
          '',
          `Platform: ${p} | Current: ${alertData.current_value} | Threshold: ${rule.threshold}`,
          `Action: ${rule.action}`,
        ].join('\n');
        notifications.push(msg);
      }
    }
  }

  // Report
  console.log(`[engine] Signals: ${signals.map(s => `${s.platform}=${s.signal}`).join(', ') || 'none'}`);
  console.log(`[engine] Alerts fired: ${alertsFired.length}`);
  console.log(`[engine] Notifications to send: ${notifications.length}`);

  // Send notifications
  for (const msg of notifications) {
    const result = await sendTelegram(msg);
    if (result.ok) console.log(`[telegram] Sent (msg ${result.messageId})`);
  }

  // Log run
  await logEngineRun(signals, alertsFired, notifications.map(n => 'telegram_sent'));

  console.log('[engine] Evaluation complete.');
}

async function cmdReportDaily() {
  console.log('[engine] Generating daily report...');
  const report = await apiGet('/api/report/daily');

  // Also get signals for the report
  const metricsData = await apiGet('/api/metrics');
  const weeks = metricsData.weeks || [];
  const latestWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null;

  const platforms = ['linkedin', 'youtube', 'facebook', 'instagram'];
  const signals = [];

  if (latestWeek) {
    for (const p of platforms) {
      const ch = latestWeek[p];
      if (!ch || (ch.spend === 0 && ch.impressions === 0)) continue;
      signals.push({
        platform: p,
        signal: signal(ch),
        ctr: calcCtr(ch),
        activation_rate: calcActivationRate(ch),
      });
    }
  }

  const m = report.metrics_summary || { total_spend: 0, total_impressions: 0, total_clicks: 0, total_signups: 0 };

  const lines = [
    `📊 *4H Daily Report*`,
    `Campaign: ${report.campaign_status}`,
    '',
    `*Totals (latest week):*`,
    `Spend: $${m.total_spend} | Impr: ${m.total_impressions} | Clicks: ${m.total_clicks} | Signups: ${m.total_signups}`,
  ];

  if (signals.length > 0) {
    lines.push('', '*Signals:*');
    for (const s of signals) {
      lines.push(`${signalEmoji(s.signal)} ${s.platform}: ${s.signal.toUpperCase()} (CTR ${s.ctr.toFixed(1)}%, Act ${s.activation_rate.toFixed(0)}%)`);
    }
  }

  if (report.blockers && report.blockers.length > 0) {
    lines.push('', `*Blockers (${report.blockers.length}):*`);
    for (const b of report.blockers) lines.push(`• ${b}`);
  }

  const msg = lines.join('\n');
  const result = await sendTelegram(msg);
  if (result.ok) console.log(`[telegram] Daily report sent (msg ${result.messageId})`);
  else console.log('[engine] Daily report generated (telegram not sent)');
}

async function cmdReportWeekly() {
  console.log('[engine] Generating weekly report...');

  const metricsData = await apiGet('/api/metrics');
  const budgetData = await apiGet('/api/budget');
  const weeks = metricsData.weeks || [];

  if (weeks.length === 0) {
    console.log('[engine] No metrics data — skipping weekly report');
    return;
  }

  const current = weeks[weeks.length - 1];
  const previous = weeks.length > 1 ? weeks[weeks.length - 2] : null;
  const platforms = ['linkedin', 'youtube', 'facebook', 'instagram'];

  let totalSpend = 0;
  let prevTotalSpend = 0;

  const lines = [
    `📈 *4H Weekly Report — ${current.weekStart}*`,
    '',
  ];

  // Budget summary
  const budgetTotal = budgetData.totalBudget || 0;
  for (const p of platforms) totalSpend += (current[p]?.spend || 0);
  if (previous) for (const p of platforms) prevTotalSpend += (previous[p]?.spend || 0);
  const budgetPct = budgetTotal > 0 ? (totalSpend / budgetTotal * 100) : 0;

  const spendDelta = prevTotalSpend > 0 ? ` (${((totalSpend - prevTotalSpend) / prevTotalSpend * 100).toFixed(0)}%)` : '';
  lines.push(`*Budget:* $${totalSpend.toFixed(0)}${spendDelta} of $${budgetTotal} (${budgetPct.toFixed(0)}%)`);
  lines.push('', '*Platform Breakdown:*');

  for (const p of platforms) {
    const ch = current[p];
    const prev = previous ? previous[p] : null;
    if (!ch || (ch.spend === 0 && ch.impressions === 0)) continue;

    const sig = signal(ch);
    const prevSig = prev ? signal(prev) : null;
    const ctr = calcCtr(ch);
    const cpaPaid = calcCpaPaid(ch);
    const actRate = calcActivationRate(ch);

    const sigChange = prevSig && prevSig !== sig ? ` (was ${prevSig})` : '';
    lines.push(`${signalEmoji(sig)} *${p.toUpperCase()}* — ${sig.toUpperCase()}${sigChange}`);

    const prevCtr = prev ? calcCtr(prev) : undefined;
    const prevCpa = prev ? calcCpaPaid(prev) : undefined;
    const prevAct = prev ? calcActivationRate(prev) : undefined;

    function pctD(cur, prv) {
      if (!prv || prv === 0) return '';
      return ` (${((cur - prv) / prv * 100).toFixed(0)}%)`;
    }

    lines.push(`  Spend: $${ch.spend.toFixed(0)}${pctD(ch.spend, prev?.spend)} | CTR: ${ctr.toFixed(1)}%${pctD(ctr, prevCtr)} | CPA: $${cpaPaid.toFixed(0)}${pctD(cpaPaid, prevCpa)}`);
    lines.push(`  Activation: ${actRate.toFixed(0)}%${pctD(actRate, prevAct)} | Signups: ${ch.signups}${pctD(ch.signups, prev?.signups)}`);
  }

  const msg = lines.join('\n');
  const result = await sendTelegram(msg);
  if (result.ok) console.log(`[telegram] Weekly report sent (msg ${result.messageId})`);
  else console.log('[engine] Weekly report generated (telegram not sent)');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === 'help' || command === '--help') {
    console.log(`
4H Engine — automation for Bob's VPS

Commands:
  evaluate          Run signal + alert evaluation, send Telegram notifications
  report daily      Generate and send daily report via Telegram
  report weekly     Generate and send weekly report via Telegram

Environment:
  PUMPCANS_BASE_URL   (default: https://pumpcans.com)
  PUMPCANS_TOKEN      Bearer token for API auth
  TELEGRAM_BOT_TOKEN  Telegram Bot API token
  TELEGRAM_CHAT_ID    Jarrad's chat ID
  SUPABASE_URL        For engine_runs logging
  SUPABASE_SERVICE_KEY For engine_runs logging
`);
    return;
  }

  if (command === 'evaluate') {
    await cmdEvaluate();
    return;
  }

  if (command === 'report') {
    const sub = argv[1];
    if (sub === 'daily') { await cmdReportDaily(); return; }
    if (sub === 'weekly') { await cmdReportWeekly(); return; }
    console.error('Unknown report type. Use: daily, weekly');
    process.exit(1);
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

main().catch((err) => {
  console.error('[engine] Fatal error:', err);
  process.exit(1);
});
