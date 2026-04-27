const DEFAULT_META_GRAPH_VERSION = 'v22.0';
const DEFAULT_META_LIMIT = 25;
const DEFAULT_SEARCH_TERMS = ['ai receptionist', 'plumber software', 'smith.ai'];
const DEFAULT_META_FIELDS = [
  'id',
  'ad_archive_id',
  'page_id',
  'page_name',
  'ad_snapshot_url',
  'ad_delivery_start_time',
  'ad_delivery_stop_time',
  'ad_creative_body',
  'ad_creative_link_title',
  'cta_text',
  'link_url',
  'publisher_platforms',
  'ad_active_status',
];

function normalizeSearchTerms(value) {
  if (Array.isArray(value)) {
    return value
      .map((term) => String(term || '').trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') return [...DEFAULT_SEARCH_TERMS];

  return value
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
}

function normalizeCountries(value) {
  if (Array.isArray(value)) {
    return value
      .map((country) => String(country || '').trim().toUpperCase())
      .filter(Boolean);
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return ['US'];
  }

  return value
    .split(',')
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);
}

function normalizeFields(value) {
  if (Array.isArray(value)) {
    return value
      .map((field) => String(field || '').trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return [...DEFAULT_META_FIELDS];
  }

  return value
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);
}

function redactMetaAccessToken(input) {
  const url = new URL(String(input));
  if (url.searchParams.has('access_token')) {
    url.searchParams.set('access_token', '[redacted]');
  }
  return url.toString();
}

function buildMetaAdsArchiveUrl(options) {
  const accessToken = String(options.accessToken || '').trim();
  const searchTerm = String(options.searchTerm || '').trim();

  if (!accessToken) {
    throw new Error('META_ACCESS_TOKEN is required for Meta validation.');
  }

  if (!searchTerm) {
    throw new Error('searchTerm is required.');
  }

  const apiVersion = String(options.apiVersion || DEFAULT_META_GRAPH_VERSION).trim();
  const fields = normalizeFields(options.fields);
  const countries = normalizeCountries(options.countries);
  const limit = Number(options.limit || DEFAULT_META_LIMIT);
  const activeStatus = String(options.activeStatus || 'ACTIVE').trim().toUpperCase();
  const adType = String(options.adType || 'ALL').trim().toUpperCase();
  const searchType = String(options.searchType || 'KEYWORD_UNORDERED').trim().toUpperCase();
  const baseUrl = String(options.baseUrl || 'https://graph.facebook.com').replace(/\/+$/, '');

  const url = new URL(`${baseUrl}/${apiVersion}/ads_archive`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('search_terms', searchTerm);
  url.searchParams.set('ad_reached_countries', JSON.stringify(countries));
  url.searchParams.set('fields', fields.join(','));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('ad_active_status', activeStatus);
  url.searchParams.set('ad_type', adType);
  url.searchParams.set('search_type', searchType);

  return url;
}

function summarizeMetaValidationResult(result) {
  const ads = Array.isArray(result.data) ? result.data : [];
  const advertisers = new Map();
  const platforms = new Set();
  const snapshotLinks = [];

  for (const ad of ads) {
    const advertiserName = typeof ad.page_name === 'string' && ad.page_name.trim().length > 0
      ? ad.page_name.trim()
      : 'Unknown advertiser';

    advertisers.set(advertiserName, (advertisers.get(advertiserName) || 0) + 1);

    const publisherPlatforms = Array.isArray(ad.publisher_platforms) ? ad.publisher_platforms : [];
    for (const platform of publisherPlatforms) {
      if (typeof platform === 'string' && platform.trim().length > 0) {
        platforms.add(platform.trim());
      }
    }

    if (typeof ad.ad_snapshot_url === 'string' && ad.ad_snapshot_url.trim().length > 0 && snapshotLinks.length < 5) {
      snapshotLinks.push(ad.ad_snapshot_url.trim());
    }
  }

  const topAdvertisers = Array.from(advertisers.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([advertiserName, adsFound]) => ({ advertiserName, adsFound }));

  return {
    adsFound: ads.length,
    advertiserCount: advertisers.size,
    topAdvertisers,
    platforms: Array.from(platforms).sort(),
    sampleSnapshotUrls: snapshotLinks,
    paging: result.paging || null,
  };
}

async function validateMetaSearchTerm(options) {
  const url = buildMetaAdsArchiveUrl(options);
  const response = await (options.fetchImpl || fetch)(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = await response.json().catch(() => null);
  const requestUrl = redactMetaAccessToken(url);

  if (!response.ok) {
    return {
      ok: false,
      searchTerm: options.searchTerm,
      requestUrl,
      status: response.status,
      error: payload?.error?.message || `Meta request failed with status ${response.status}.`,
      payload,
    };
  }

  return {
    ok: true,
    searchTerm: options.searchTerm,
    requestUrl,
    status: response.status,
    payload,
    summary: summarizeMetaValidationResult(payload),
  };
}

async function runMetaValidation(options) {
  const searchTerms = normalizeSearchTerms(options.searchTerms);
  const results = [];

  for (const searchTerm of searchTerms) {
    results.push(
      await validateMetaSearchTerm({
        ...options,
        searchTerm,
      }),
    );
  }

  return {
    generatedAt: options.generatedAt || new Date().toISOString(),
    apiVersion: String(options.apiVersion || DEFAULT_META_GRAPH_VERSION).trim(),
    countries: normalizeCountries(options.countries),
    limit: Number(options.limit || DEFAULT_META_LIMIT),
    activeStatus: String(options.activeStatus || 'ACTIVE').trim().toUpperCase(),
    adType: String(options.adType || 'ALL').trim().toUpperCase(),
    searchTerms,
    results,
  };
}

function formatTopAdvertisers(topAdvertisers) {
  if (!Array.isArray(topAdvertisers) || topAdvertisers.length === 0) {
    return '- No advertisers returned.';
  }

  return topAdvertisers
    .map((entry) => `- ${entry.advertiserName}: ${entry.adsFound} ads`)
    .join('\n');
}

function formatSnapshotUrls(snapshotUrls) {
  if (!Array.isArray(snapshotUrls) || snapshotUrls.length === 0) {
    return '- No snapshot URLs returned.';
  }

  return snapshotUrls
    .map((url) => `- ${url}`)
    .join('\n');
}

function formatMetaValidationMarkdown(validationRun) {
  const header = [
    '## Meta Access Validation',
    '',
    `Generated: ${validationRun.generatedAt}`,
    `API version: ${validationRun.apiVersion}`,
    `Countries: ${validationRun.countries.join(', ')}`,
    `Limit per term: ${validationRun.limit}`,
    `Active status: ${validationRun.activeStatus}`,
    `Ad type: ${validationRun.adType}`,
  ];

  const sections = validationRun.results.map((result) => {
    if (!result.ok) {
      return [
        `### ${result.searchTerm}`,
        '',
        `Status: failed (${result.status})`,
        `Request: ${result.requestUrl}`,
        `Error: ${result.error}`,
      ].join('\n');
    }

    return [
      `### ${result.searchTerm}`,
      '',
      `Status: ok (${result.status})`,
      `Request: ${result.requestUrl}`,
      `Ads found: ${result.summary.adsFound}`,
      `Advertisers found: ${result.summary.advertiserCount}`,
      `Platforms: ${result.summary.platforms.join(', ') || 'none returned'}`,
      '',
      'Top advertisers:',
      formatTopAdvertisers(result.summary.topAdvertisers),
      '',
      'Sample snapshot URLs:',
      formatSnapshotUrls(result.summary.sampleSnapshotUrls),
    ].join('\n');
  });

  return [...header, '', ...sections].join('\n');
}

module.exports = {
  DEFAULT_META_FIELDS,
  DEFAULT_META_GRAPH_VERSION,
  DEFAULT_META_LIMIT,
  DEFAULT_SEARCH_TERMS,
  buildMetaAdsArchiveUrl,
  formatMetaValidationMarkdown,
  normalizeCountries,
  normalizeFields,
  normalizeSearchTerms,
  redactMetaAccessToken,
  runMetaValidation,
  summarizeMetaValidationResult,
  validateMetaSearchTerm,
};
