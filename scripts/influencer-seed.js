const INFLUENCER_SHORTLIST = [
  {
    creator_name: 'Mike Andes',
    trade: 'Lawn Care',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@MikeAndes',
    estimated_reach: '80K+ operators',
    deal_page: 'mow.city/mikeandes',
    status: 'identified',
  },
  {
    creator_name: "Brian's Lawn Maintenance",
    trade: 'Lawn Care',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@BriansLawnMaintenance',
    estimated_reach: '150K+ operators',
    deal_page: 'mow.city/brianslawn',
    status: 'identified',
  },
  {
    creator_name: 'AC Service Tech LLC',
    trade: 'HVAC',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@ACServiceTech',
    estimated_reach: '90K+ techs/owners',
    deal_page: 'duct.city/acservicetech',
    status: 'identified',
  },
  {
    creator_name: 'Blades of Grass Lawn Care',
    trade: 'Lawn Care',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/channel/UCPIZI7',
    estimated_reach: '300K+ operators',
    deal_page: 'mow.city/bladesofgrass',
    status: 'identified',
  },
  {
    creator_name: 'HVAC School (Bryan Orr)',
    trade: 'HVAC',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@HVACSchool',
    estimated_reach: '60K+ techs/owners',
    deal_page: 'duct.city/hvacschool',
    status: 'identified',
  },
  {
    creator_name: 'Roofing Insights (Dmitry)',
    trade: 'Roofing',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@RoofingInsights3.0',
    estimated_reach: '60K+ contractors',
    deal_page: 'roofrepair.city/roofinginsights',
    status: 'identified',
  },
  {
    creator_name: 'Electrician U (Dustin Stelzer)',
    trade: 'Electrical',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@ElectricianU',
    estimated_reach: '120K+ electricians',
    deal_page: 'electricians.city/electricianu',
    status: 'identified',
  },
  {
    creator_name: 'Roger Wakefield',
    trade: 'Plumbing',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@rogerplumbing',
    estimated_reach: '120K+ contractor-adjacent',
    deal_page: 'pipe.city/rogerwakefield',
    status: 'identified',
  },
  {
    creator_name: 'King of Pressure Washing',
    trade: 'Pressure Washing',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@kingofpressurewash',
    estimated_reach: '35K+ operators',
    deal_page: 'rinse.city/kingofpw',
    status: 'identified',
  },
  {
    creator_name: 'Painting Business Pro (Barstow)',
    trade: 'Painting',
    platform: 'youtube',
    channel_url: 'https://www.youtube.com/@PaintingBusinessPro',
    estimated_reach: '36K operators',
    deal_page: 'coat.city/paintingbizpro',
    status: 'identified',
  },
];

const SYNC_FIELDS = ['creator_name', 'trade', 'platform', 'channel_url', 'estimated_reach', 'deal_page'];

function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function normalizeUrl(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\/+$/, '').toLowerCase();
}

function findExistingInfluencer(existingRows, seed) {
  const seedUrl = normalizeUrl(seed.channel_url);
  if (seedUrl) {
    const byChannelUrl = existingRows.find((row) => normalizeUrl(row.channel_url) === seedUrl);
    if (byChannelUrl) return byChannelUrl;
  }

  const seedName = normalizeText(seed.creator_name);
  const seedTrade = normalizeText(seed.trade);
  const seedPlatform = normalizeText(seed.platform);

  return (
    existingRows.find(
      (row) =>
        normalizeText(row.creator_name) === seedName &&
        normalizeText(row.trade) === seedTrade &&
        normalizeText(row.platform) === seedPlatform,
    ) || null
  );
}

function buildUpdatePayload(existing, seed) {
  const update = {};

  for (const field of SYNC_FIELDS) {
    const nextValue = seed[field] ?? null;
    const currentValue = existing[field] ?? null;
    const hasSeedValue = typeof nextValue === 'string' ? nextValue.trim().length > 0 : nextValue !== null;

    if (!hasSeedValue) {
      continue;
    }

    if (field === 'channel_url') {
      if (normalizeUrl(nextValue) !== normalizeUrl(currentValue)) {
        update[field] = nextValue;
      }
      continue;
    }

    if (normalizeText(nextValue) !== normalizeText(currentValue)) {
      update[field] = nextValue;
    }
  }

  return update;
}

async function runInfluencerSeed({ shortlist = INFLUENCER_SHORTLIST, listInfluencers, createInfluencer, updateInfluencer }) {
  if (typeof listInfluencers !== 'function') throw new Error('listInfluencers is required');
  if (typeof createInfluencer !== 'function') throw new Error('createInfluencer is required');
  if (typeof updateInfluencer !== 'function') throw new Error('updateInfluencer is required');

  const existingRows = [...((await listInfluencers()) || [])];
  const operations = [];

  for (const seed of shortlist) {
    const existing = findExistingInfluencer(existingRows, seed);

    if (!existing) {
      const created = await createInfluencer(seed);
      existingRows.push(created || { ...seed });
      operations.push({ action: 'created', creator_name: seed.creator_name, id: created?.id ?? null, changed_fields: [] });
      continue;
    }

    const update = buildUpdatePayload(existing, seed);
    const changedFields = Object.keys(update);

    if (changedFields.length === 0) {
      operations.push({ action: 'skipped', creator_name: seed.creator_name, id: existing.id ?? null, changed_fields: [] });
      continue;
    }

    if (!existing.id) {
      operations.push({ action: 'skipped', creator_name: seed.creator_name, id: null, changed_fields: [] });
      continue;
    }

    const updated = await updateInfluencer(existing.id, update);
    const rowIndex = existingRows.findIndex((row) => row.id === existing.id);
    if (rowIndex >= 0) {
      existingRows[rowIndex] = { ...existingRows[rowIndex], ...update, ...(updated || {}) };
    }

    operations.push({ action: 'updated', creator_name: seed.creator_name, id: existing.id, changed_fields: changedFields });
  }

  const created = operations.filter((operation) => operation.action === 'created').length;
  const updated = operations.filter((operation) => operation.action === 'updated').length;
  const skipped = operations.filter((operation) => operation.action === 'skipped').length;

  return {
    created,
    updated,
    skipped,
    operations,
  };
}

module.exports = {
  INFLUENCER_SHORTLIST,
  findExistingInfluencer,
  buildUpdatePayload,
  runInfluencerSeed,
};
