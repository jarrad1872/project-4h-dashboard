import { describe, expect, it } from 'vitest';
import {
  buildMetaAdsArchiveUrl,
  formatMetaValidationMarkdown,
  runMetaValidation,
  summarizeMetaValidationResult,
} from '../competitive-intel-meta';

describe('competitive intel Meta validation helper', () => {
  it('builds an ads_archive URL with the required query parameters', () => {
    const url = buildMetaAdsArchiveUrl({
      accessToken: 'secret-token',
      searchTerm: 'smith.ai',
      countries: ['US', 'CA'],
      limit: 10,
      apiVersion: 'v99.0',
    });

    expect(url.origin).toBe('https://graph.facebook.com');
    expect(url.pathname).toBe('/v99.0/ads_archive');
    expect(url.searchParams.get('search_terms')).toBe('smith.ai');
    expect(url.searchParams.get('ad_reached_countries')).toBe('["US","CA"]');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.get('access_token')).toBe('secret-token');
  });

  it('summarizes advertiser and platform coverage from a payload', () => {
    const summary = summarizeMetaValidationResult({
      data: [
        {
          page_name: 'Smith.ai',
          publisher_platforms: ['facebook', 'instagram'],
          ad_snapshot_url: 'https://www.facebook.com/ads/library/?id=1',
        },
        {
          page_name: 'Smith.ai',
          publisher_platforms: ['facebook'],
          ad_snapshot_url: 'https://www.facebook.com/ads/library/?id=2',
        },
        {
          page_name: 'Jobber',
          publisher_platforms: ['instagram'],
          ad_snapshot_url: 'https://www.facebook.com/ads/library/?id=3',
        },
      ],
    });

    expect(summary.adsFound).toBe(3);
    expect(summary.advertiserCount).toBe(2);
    expect(summary.topAdvertisers[0]).toEqual({ advertiserName: 'Smith.ai', adsFound: 2 });
    expect(summary.platforms).toEqual(['facebook', 'instagram']);
    expect(summary.sampleSnapshotUrls).toHaveLength(3);
  });

  it('runs validation over each search term and returns markdown output', async () => {
    const validationRun = await runMetaValidation({
      accessToken: 'secret-token',
      apiVersion: 'v99.0',
      searchTerms: ['smith.ai', 'ai receptionist'],
      fetchImpl: async (url) => ({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              page_name: url.searchParams.get('search_terms'),
              publisher_platforms: ['facebook'],
              ad_snapshot_url: `https://example.com/${url.searchParams.get('search_terms')}`,
            },
          ],
        }),
      }),
      generatedAt: '2026-04-01T00:00:00.000Z',
    });

    expect(validationRun.results).toHaveLength(2);
    expect(validationRun.results[0].summary.adsFound).toBe(1);

    const markdown = formatMetaValidationMarkdown(validationRun);
    expect(markdown).toContain('## Meta Access Validation');
    expect(markdown).toContain('### smith.ai');
    expect(markdown).toContain('Ads found: 1');
    expect(markdown).toContain('https://graph.facebook.com/v99.0/ads_archive');
  });
});
