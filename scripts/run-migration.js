const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'db.vzawlfitqnjhypnkguas.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '8qAWqw028$gw27CELYJhY6rS',
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/003_dashboard_v2.sql'), 'utf8');

async function run() {
  await client.connect();
  console.log('Connected to Supabase!');
  await client.query(sql);
  console.log('Migration applied!');
  
  const r = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='ads' AND column_name='workflow_stage'");
  console.log('workflow_stage column:', r.rows.length > 0 ? 'EXISTS ✅' : 'MISSING ❌');
  
  const r2 = await client.query("SELECT COUNT(*) FROM ad_templates");
  console.log('ad_templates table exists, rows:', r2.rows[0].count);
  
  await client.end();
}
run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
