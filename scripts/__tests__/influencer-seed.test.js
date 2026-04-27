import { describe, expect, it } from 'vitest';
import { INFLUENCER_SHORTLIST, runInfluencerSeed } from '../influencer-seed';

function createInMemoryInfluencerApi(initialRows = []) {
  const rows = initialRows.map((row) => ({ ...row }));
  let idCounter = 1;

  return {
    listInfluencers: async () => rows.map((row) => ({ ...row })),
    createInfluencer: async (payload) => {
      const created = { id: `seed-${idCounter++}`, ...payload };
      rows.push(created);
      return { ...created };
    },
    updateInfluencer: async (id, patch) => {
      const index = rows.findIndex((row) => row.id === id);
      if (index < 0) {
        throw new Error(`missing influencer: ${id}`);
      }

      rows[index] = { ...rows[index], ...patch };
      return { ...rows[index] };
    },
    snapshot: () => rows.map((row) => ({ ...row })),
  };
}

describe('influencer seed helper', () => {
  it('creates shortlist rows when pipeline is empty', async () => {
    const api = createInMemoryInfluencerApi();

    const result = await runInfluencerSeed({
      shortlist: INFLUENCER_SHORTLIST,
      listInfluencers: api.listInfluencers,
      createInfluencer: api.createInfluencer,
      updateInfluencer: api.updateInfluencer,
    });

    expect(result.created).toBe(INFLUENCER_SHORTLIST.length);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(api.snapshot()).toHaveLength(INFLUENCER_SHORTLIST.length);
  });

  it('is idempotent across reruns and does not create duplicates', async () => {
    const api = createInMemoryInfluencerApi();

    await runInfluencerSeed({
      shortlist: INFLUENCER_SHORTLIST,
      listInfluencers: api.listInfluencers,
      createInfluencer: api.createInfluencer,
      updateInfluencer: api.updateInfluencer,
    });

    const secondRun = await runInfluencerSeed({
      shortlist: INFLUENCER_SHORTLIST,
      listInfluencers: api.listInfluencers,
      createInfluencer: api.createInfluencer,
      updateInfluencer: api.updateInfluencer,
    });

    expect(secondRun.created).toBe(0);
    expect(secondRun.updated).toBe(0);
    expect(secondRun.skipped).toBe(INFLUENCER_SHORTLIST.length);
    expect(api.snapshot()).toHaveLength(INFLUENCER_SHORTLIST.length);
  });

  it('updates canonical shortlist fields without resetting workflow status', async () => {
    const seed = INFLUENCER_SHORTLIST[0];
    const api = createInMemoryInfluencerApi([
      {
        id: 'existing-1',
        creator_name: seed.creator_name,
        trade: seed.trade,
        platform: seed.platform,
        channel_url: `${seed.channel_url}/`,
        estimated_reach: '10 operators',
        deal_page: 'mow.city/legacy',
        status: 'contacted',
        notes: 'already in active thread',
      },
    ]);

    const result = await runInfluencerSeed({
      shortlist: [seed],
      listInfluencers: api.listInfluencers,
      createInfluencer: api.createInfluencer,
      updateInfluencer: api.updateInfluencer,
    });

    const [row] = api.snapshot();

    expect(result.created).toBe(0);
    expect(result.updated).toBe(1);
    expect(result.skipped).toBe(0);
    expect(row.estimated_reach).toBe(seed.estimated_reach);
    expect(row.deal_page).toBe(seed.deal_page);
    expect(row.status).toBe('contacted');
    expect(row.notes).toBe('already in active thread');
  });
});
