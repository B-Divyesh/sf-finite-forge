import { describe, expect, it } from 'vitest';
import {
  PRODUCTION_TICKS,
  RUN_COUNT,
  act,
  actionYield,
  chooseTool,
  newCampaign,
  progressPercent,
  retryRun,
  runGoals,
  sunBonusAt,
  ticksRemaining,
  type Action,
  type Campaign,
  type ToolId
} from '../src/engine';
import { winningActions } from './game-helpers';

function play(campaign: Campaign, actions: Action[]): Campaign {
  return actions.reduce((state, action) => act(state, action), campaign);
}

function winRun(campaign: Campaign): Campaign {
  return play(campaign, winningActions(campaign));
}

function permutations<T>(values: T[]): T[][] {
  return values.length === 0 ? [[]] : values.flatMap((value, index) => permutations([...values.slice(0, index), ...values.slice(index + 1)]).map(rest => [value, ...rest]));
}

describe('Finite Forge deterministic sunset campaign', () => {
  it('regression: uses 24 production ticks and loses when sunset arrives', () => {
    let campaign = newCampaign();
    expect(PRODUCTION_TICKS).toBe(24);
    expect(campaign).toMatchObject({ tick: 0, deadline: 24, status: 'active' });
    for (let tick = 0; tick < 24; tick += 1) campaign = act(campaign, 'mine');
    expect(campaign).toMatchObject({ tick: 24, deadline: 24, status: 'failed' });
    expect(ticksRemaining(campaign)).toBe(0);
  });

  it('keeps the daylight forecast and production results deterministic', () => {
    const first = newCampaign();
    const second = newCampaign();
    const script: Action[] = ['mine', 'shape', 'charge', 'mine', 'mine', 'shape'];
    expect(script.reduce((state, action) => act(state, action), first)).toEqual(script.reduce((state, action) => act(state, action), second));
    expect(Array.from({ length: 24 }, (_, tick) => sunBonusAt(1, tick))).toEqual(Array.from({ length: 24 }, (_, tick) => sunBonusAt(1, tick)));
  });

  it('@claim:reset-tools makes every reset tool change production or starting stock', () => {
    const base = newCampaign();
    expect(actionYield({ ...base, owned: ['bellows'] }, 'mine')).toBe(actionYield(base, 'mine') + 1);
    expect(actionYield({ ...base, owned: ['pattern'] }, 'shape')).toBe(actionYield(base, 'shape') + 1);
    expect(actionYield({ ...base, owned: ['lens'] }, 'charge')).toBe(actionYield(base, 'charge') + 1);
    const won = winRun(base);
    const stocked = chooseTool(won, 'stockpile');
    expect(stocked.stock).toEqual({ ore: 1, parts: 1, charge: 0 });
  });

  it('retries a sunset loss at tick zero without granting a tool', () => {
    let campaign = newCampaign();
    for (let tick = 0; tick < PRODUCTION_TICKS; tick += 1) campaign = act(campaign, 'mine');
    const retried = retryRun(campaign);
    expect(retried).toMatchObject({ run: 1, tick: 0, deadline: 24, owned: [], status: 'active', completedRuns: 0 });
    expect(retried.stock).toEqual({ ore: 0, parts: 0, charge: 0 });
  });

  it('completes all five runs through a deterministic scripted campaign', () => {
    const toolOrder: ToolId[] = ['lens', 'pattern', 'bellows', 'stockpile'];
    let campaign = newCampaign();
    const ticks: number[] = [];
    for (let run = 1; run <= RUN_COUNT; run += 1) {
      campaign = winRun(campaign);
      ticks.push(campaign.tick);
      if (run < RUN_COUNT) campaign = chooseTool(campaign, toolOrder[run - 1]);
    }
    expect(runGoals).toEqual([12, 14, 17, 19, 36]);
    expect(ticks.every(tick => tick <= PRODUCTION_TICKS)).toBe(true);
    expect(campaign.status).toBe('campaign-complete');
    expect(progressPercent(campaign)).toBe(100);
  });

  it('keeps every reset-tool order winnable before each sunset', () => {
    for (const toolOrder of permutations<ToolId>(['bellows', 'pattern', 'lens', 'stockpile'])) {
      let campaign = newCampaign();
      for (let run = 1; run <= RUN_COUNT; run += 1) {
        campaign = winRun(campaign);
        expect(campaign.tick).toBeLessThanOrEqual(PRODUCTION_TICKS);
        if (run < RUN_COUNT) campaign = chooseTool(campaign, toolOrder[run - 1]);
      }
      expect(campaign.status).toBe('campaign-complete');
    }
  });
});
