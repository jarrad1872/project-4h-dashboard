#!/usr/bin/env node
/**
 * Project 4H Dashboard — Supabase Setup Script
 *
 * Usage:
 *   node scripts/setup-supabase.js --token <SUPABASE_PAT>
 *
 * What it does:
 *   1. Creates a new Supabase project "project-4h-dashboard" in your org
 *   2. Waits for it to be ready (~60s)
 *   3. Applies 001_schema.sql and 002_seed.sql via the REST SQL API
 *   4. Writes .env.local with NEXT_PUBLIC_SUPABASE_URL and keys
 *   5. Prints connection string for psql / Supabase dashboard
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const tokenIdx = args.indexOf('--token');
const PAT = tokenIdx >= 0 ? args[tokenIdx + 1] : process.env.SUPABASE_ACCESS_TOKEN;

if (!PAT) {
  console.error('\nMissing Supabase PAT.\n\nGet one at: https://supabase.com/dashboard/account/tokens\n\nUsage: node scripts/setup-supabase.js --token <your-token>\n');
  process.exit(1);
}

const PROJECT_NAME = 'project-4h-dashboard';
const DB_PASSWORD = generatePassword();
const REGION = 'us-east-1';

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
  let pw = '';
  for (let i = 0; i < 24; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

function apiRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.supabase.com',
      path: urlPath,
      method,
      headers: {
        Authorization: `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getOrgs() {
  const res = await apiRequest('GET', '/v1/organizations');
  if (res.status !== 200) throw new Error(`Failed to list orgs: ${JSON.stringify(res.body)}`);
  return res.body;
}

async function createProject(orgId) {
  console.log(`\nCreating project "${PROJECT_NAME}" in org ${orgId}...`);
  const res = await apiRequest('POST', '/v1/projects', {
    name: PROJECT_NAME,
    organization_id: orgId,
    db_pass: DB_PASSWORD,
    region: REGION,
    plan: 'free',
  });
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Failed to create project: ${JSON.stringify(res.body)}`);
  }
  return res.body;
}

async function waitForProject(projectRef) {
  console.log('Waiting for project to be ready (this takes ~60s)...');
  for (let i = 0; i < 24; i++) {
    await sleep(5000);
    const res = await apiRequest('GET', `/v1/projects/${projectRef}`);
    if (res.status === 200 && res.body.status === 'ACTIVE_HEALTHY') {
      console.log('Project is ready!');
      return res.body;
    }
    process.stdout.write('.');
  }
  throw new Error('Project did not become ready after 2 minutes. Check Supabase dashboard.');
}

async function runSql(projectRef, sql) {
  const res = await apiRequest('POST', `/v1/projects/${projectRef}/database/query`, { query: sql });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`SQL error (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return res.body;
}

async function getApiKeys(projectRef) {
  const res = await apiRequest('GET', `/v1/projects/${projectRef}/api-keys`);
  if (res.status !== 200) throw new Error(`Failed to get API keys: ${JSON.stringify(res.body)}`);
  return res.body;
}

async function main() {
  console.log('=== Project 4H Dashboard — Supabase Setup ===\n');

  // 1. Get org
  const orgs = await getOrgs();
  if (!orgs.length) throw new Error('No organizations found on this account.');
  const org = orgs[0];
  console.log(`Using org: ${org.name} (${org.id})`);

  // 2. Create project
  const project = await createProject(org.id);
  const projectRef = project.id || project.ref;
  console.log(`Project ref: ${projectRef}`);
  console.log(`DB password saved — keep this: ${DB_PASSWORD}`);

  // 3. Wait for ready
  await waitForProject(projectRef);

  // 4. Apply schema
  console.log('\nApplying 001_schema.sql...');
  const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '001_schema.sql'), 'utf8');
  await runSql(projectRef, schemaSql);
  console.log('Schema applied.');

  // 5. Apply seed
  console.log('Applying 002_seed.sql...');
  const seedSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '002_seed.sql'), 'utf8');
  await runSql(projectRef, seedSql);
  console.log('Seed applied — 27 ads, 6 lifecycle messages, 10 checklist items loaded.');

  // 6. Get API keys
  const keys = await getApiKeys(projectRef);
  const anonKey = keys.find((k) => k.name === 'anon')?.api_key || '';
  const serviceKey = keys.find((k) => k.name === 'service_role')?.api_key || '';
  const supabaseUrl = `https://${projectRef}.supabase.co`;

  // 7. Write .env.local
  const envContent = [
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`,
    `SUPABASE_DB_PASSWORD=${DB_PASSWORD}`,
    `SUPABASE_PROJECT_REF=${projectRef}`,
  ].join('\n') + '\n';

  fs.writeFileSync(path.join(__dirname, '..', '.env.local'), envContent);
  console.log('\n.env.local written.');

  // 8. Print summary
  console.log('\n=== DONE ===');
  console.log(`Supabase URL:     ${supabaseUrl}`);
  console.log(`Project Ref:      ${projectRef}`);
  console.log(`Anon Key:         ${anonKey.substring(0, 20)}...`);
  console.log(`Service Role Key: ${serviceKey.substring(0, 20)}...`);
  console.log(`DB Password:      ${DB_PASSWORD}`);
  console.log(`\nDashboard: https://supabase.com/dashboard/project/${projectRef}`);
  console.log(`\nNext: Deploy the dashboard to Vercel and add .env.local values as environment variables.`);
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
