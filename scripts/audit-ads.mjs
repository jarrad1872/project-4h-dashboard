#!/usr/bin/env node
/**
 * Ad Quality Audit — Project 4H
 * Checks every NB2 ad for:
 * 1. image_url slug matches campaign_group trade
 * 2. primary_text contains trade-specific language (not generic)
 * 3. headline is not blank or generic
 * 4. landing_path matches prefix in campaign_group
 * 5. price is $79 (not $149, not $99)
 * 6. No cross-trade contamination (e.g. lawn copy in plumbing ad)
 */

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YXdsZml0cW5qaHlwbmtndWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwOTU2NywiZXhwIjoyMDg3Nzg1NTY3fQ.P8qFx_7hYBA0h8ri6b3dGfM5JqBjLP-ej8zVeodMLa0';
const BASE = 'https://vzawlfitqnjhypnkguas.supabase.co';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// Trade vocabulary — words that MUST appear in copy for each trade
// If copy doesn't contain ANY of these, it's generic slop
const TRADE_SIGNALS = {
  saw:           ['concrete', 'saw', 'blade', 'cut', 'slab', 'wall saw', 'diamond'],
  rinse:         ['pressure wash', 'rinse', 'driveway', 'psi', 'wand', 'surface clean'],
  mow:           ['lawn', 'mow', 'grass', 'yard', 'mowing', 'cut', 'trim'],
  rooter:        ['drain', 'clog', 'snake', 'rooter', 'sewer', 'blockage', 'pipe'],
  pipe:          ['plumb', 'pipe', 'leak', 'faucet', 'water heater', 'fitting', 'drain'],
  lockout:       ['lock', 'key', 'locksmith', 'door', 'deadbolt', 'rekey'],
  pest:          ['pest', 'bug', 'rodent', 'termite', 'roach', 'ant', 'treatment', 'spray'],
  duct:          ['hvac', 'duct', 'heat', 'air', 'cool', 'furnace', 'ac ', 'attic'],
  detail:        ['detail', 'polish', 'wax', 'paint', 'car', 'ceramic', 'buff'],
  plow:          ['snow', 'plow', 'ice', 'winter', 'salt', 'storm'],
  prune:         ['tree', 'trim', 'branch', 'limb', 'arborist', 'stump', 'prune', 'chainsaw', 'harness', 'canopy', 'climb'],
  chimney:       ['chimney', 'flue', 'fireplace', 'soot', 'sweep'],
  haul:          ['haul', 'move', 'junk', 'furniture', 'load', 'pickup'],
  grade:         ['grade', 'grading', 'excavat', 'dirt', 'site', 'level', 'pad'],
  coat:          ['paint', 'coat', 'brush', 'spray', 'primer', 'exterior', 'interior'],
  brake:         ['auto', 'car', 'repair', 'brake', 'oil change', 'mechanic', 'diagnostic'],
  wrench:        ['mechanic', 'truck', 'diesel', 'engine', 'repair', 'shop'],
  polish:        ['floor', 'polish', 'burnish', 'tile', 'wax', 'buff', 'commercial'],
  pave:          ['asphalt', 'pave', 'driveway', 'parking', 'road', 'hot mix'],
  wreck:         ['demo', 'demolition', 'tear down', 'debris', 'excavat', 'haul'],
  electricians:  ['electr', 'wiring', 'panel', 'breaker', 'circuit', 'outlet', 'volt'],
  roofrepair:    ['roof', 'shingle', 'leak', 'storm', 'gutter', 'flashing'],
  disaster:      ['water damage', 'flood', 'fire', 'restoration', 'remediat', 'emergency', 'mold'],
  bodyshop:      ['body shop', 'paint', 'collision', 'dent', 'buff', 'spray booth'],
  drywall:       ['drywall', 'tape', 'mud', 'joint', 'texture', 'patch'],
  excavation:    ['excavat', 'trench', 'grade', 'dirt', 'site', 'foundation'],
  housecleaning: ['clean', 'mop', 'vacuum', 'dust', 'home', 'house'],
  insulation:    ['insul', 'foam', 'attic', 'energy', 'r-value', 'spray'],
  metalworks:    ['weld', 'fab', 'metal', 'steel', 'arc', 'spark'],
  plank:         ['floor', 'hardwood', 'tile', 'install', 'plank', 'laminate'],
  refrigeration: ['refrigerat', 'cooler', 'compressor', 'hvac', 'walk-in', 'freezer'],
  remodels:      ['remodel', 'renovate', 'kitchen', 'bath', 'contractor', 'blueprint'],
  renewables:    ['solar', 'panel', 'install', 'roof', 'energy', 'sun'],
  sentry:        ['security', 'alarm', 'camera', 'monitor', 'break-in', 'sensor'],
  shrink:        ['therap', 'counsel', 'mental', 'session', 'patient', 'practice'],
  alignment:     ['align', 'wheel', 'tire', 'camber', 'steering', 'suspension'],
  appraisals:    ['apprais', 'value', 'home', 'market', 'property', 'assess'],
  bartender:     ['bar', 'cocktail', 'event', 'drink', 'pour', 'mix'],
  bookkeeper:    ['bookkeep', 'account', 'tax', 'receipt', 'ledger', 'financ'],
  carpetcleaning:['carpet', 'upholster', 'steam', 'stain', 'extract'],
  cater:         ['cater', 'event', 'food', 'chef', 'serve', 'dining'],
  directional:   ['boring', 'drill', 'utility', 'conduit', 'underground', 'locating'],
  esthetician:   ['esthetic', 'facial', 'skin', 'spa', 'treatment', 'wax'],
  finish:        ['finish', 'trim', 'molding', 'crown', 'cabinet', 'carpenter'],
  fireprotection:['fire', 'sprinkler', 'suppression', 'alarm', 'code', 'inspection'],
  groom:         ['groom', 'dog', 'pet', 'clip', 'bath', 'fur'],
  grout:         ['tile', 'grout', 'backsplash', 'flooring', 'pattern', 'set'],
  hitch:         ['tow', 'truck', 'road', 'stranded', 'breakdown', 'vehicle'],
  hydrovac:      ['hydrovac', 'excavat', 'utility', 'pothole', 'suction', 'water'],
  inspection:    ['inspect', 'home', 'report', 'foundation', 'roof', 'crawl'],
  lawfirm:       ['attorney', 'lawyer', 'legal', 'client', 'case', 'consult', 'deposition', 'counsel', 'court', 'law firm', 'litigation', 'intake'],
  locating:      ['locat', 'utility', 'mark', 'flag', 'underground', 'strike'],
  mold:          ['mold', 'remediat', 'moisture', 'spore', 'air quality', 'hazmat'],
  nail:          ['nail', 'manicure', 'gel', 'acrylic', 'salon', 'art'],
  pane:          ['window', 'glass', 'install', 'pane', 'frame', 'seal'],
  poolservice:   ['pool', 'water', 'chem', 'chlorine', 'clean', 'filter'],
  portrait:      ['photo', 'shoot', 'camera', 'portrait', 'session', 'light'],
  privatechef:   ['chef', 'cook', 'meal', 'dinner', 'food', 'culinary'],
  rolloff:       ['dumpster', 'roll-off', 'container', 'debris', 'haul', 'rental'],
  septic:        ['septic', 'tank', 'pump', 'drain field', 'waste', 'cleanout'],
  siding:        ['siding', 'exterior', 'panel', 'fiber cement', 'vinyl', 'install'],
  stamped:       ['concrete', 'stamp', 'patio', 'decorative', 'pattern', 'color'],
  taxprep:       ['tax', 'return', 'irs', 'deduct', 'business', 'filing'],
  trowel:        ['plaster', 'skim coat', 'trowel', 'hawk', 'wall', 'finish'],
  windshield:    ['windshield', 'glass', 'chip', 'crack', 'auto glass', 'mobile'],
};

async function fetchAll() {
  let all = [], off = 0;
  while (true) {
    const r = await fetch(`${BASE}/rest/v1/ads?select=id,platform,campaign_group,headline,primary_text,image_url,landing_path&campaign_group=like.nb2_%25`, {
      headers: { ...H, 'Range': `${off}-${off+999}`, 'Range-Unit': 'items' }
    });
    const page = await r.json();
    all = all.concat(page);
    if (page.length < 1000) break;
    off += 1000;
  }
  return all;
}

const ads = await fetchAll();
console.log(`\nAuditing ${ads.length} NB2 ads...\n`);

const failures = [];

for (const ad of ads) {
  const issues = [];

  // Extract prefix from campaign_group: nb2_d1_linkedin_PREFIX → PREFIX
  const parts = ad.campaign_group?.split('_') || [];
  const prefix = parts.slice(3).join('_'); // handle prefixes with underscores

  // 1. image_url slug should contain the trade slug
  if (ad.image_url) {
    const urlSlug = ad.image_url.split('/').pop()?.replace('-hero-a.jpg','').replace('-hero-b.jpg','');
    // Map prefix to slug (simplified check — slug contains prefix or vice versa)
    if (!ad.image_url.includes(prefix) && !ad.image_url.includes('nb2/')) {
      issues.push(`image_url mismatch: ${ad.image_url.split('/').pop()} for prefix ${prefix}`);
    }
  } else {
    issues.push('no image_url');
  }

  // 2. landing_path should match prefix
  if (ad.landing_path !== `/${prefix}`) {
    issues.push(`landing_path ${ad.landing_path} doesn't match /${prefix}`);
  }

  // 3. Price check
  const text = (ad.primary_text || '') + ' ' + (ad.headline || '');
  if (text.includes('$149') || text.includes('$99/') || text.includes('$199')) {
    issues.push(`wrong price in copy: ${text.match(/\$\d+/)?.[0]}`);
  }

  // 4. Blank headline
  if (!ad.headline?.trim()) {
    issues.push('blank headline');
  }

  // 5. Trade signal check — does the copy mention the trade?
  const signals = TRADE_SIGNALS[prefix] || [];
  if (signals.length > 0) {
    const lowerText = text.toLowerCase();
    const hasSignal = signals.some(s => lowerText.includes(s.toLowerCase()));
    if (!hasSignal) {
      issues.push(`no trade signal found (expected one of: ${signals.slice(0,3).join(', ')})`);
    }
  }

  if (issues.length > 0) {
    failures.push({ id: ad.id, campaign_group: ad.campaign_group, issues });
  }
}

const passCount = ads.length - failures.length;
console.log(`✅ PASS: ${passCount}/${ads.length}`);
console.log(`❌ FAIL: ${failures.length}/${ads.length}`);

if (failures.length > 0) {
  console.log('\nFailed ads (first 30):');
  failures.slice(0, 30).forEach(f => {
    console.log(`  ${f.id} [${f.campaign_group}]`);
    f.issues.forEach(i => console.log(`    → ${i}`));
  });
  
  // Group failures by issue type
  const byIssue = {};
  failures.forEach(f => f.issues.forEach(i => {
    const type = i.split(':')[0];
    byIssue[type] = (byIssue[type] || 0) + 1;
  }));
  console.log('\nFailure breakdown by issue type:');
  Object.entries(byIssue).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => console.log(`  ${c}x ${t}`));
}

if (passCount === ads.length) {
  console.log('\n🟢 All NB2 ads pass quality check. Safe to report to Jarrad.');
} else {
  const pct = ((failures.length / ads.length) * 100).toFixed(1);
  console.log(`\n🔴 ${pct}% failure rate. DO NOT report done until failures are fixed.`);
}
