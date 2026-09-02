import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_SHIFT_COUNT,
  MINIMUM_CAMPAIGN_TICKS,
  PLANNING_SECONDS_PER_TICK,
  PRODUCTION_TICKS,
  RUN_COUNT,
  SHIFTS_PER_RUN,
  act,
  actionYield,
  advanceShift,
  chooseTool,
  newCampaign,
  plannedCampaignMinutes,
  progressPercent,
  retryRun,
  shiftGoals,
  sunBonusAt,
  ticksRemaining,
  type Action,
  type Campaign,
  type ToolId
} from '../src/engine';
import { clearWinningActionCache, winningActions } from './game-helpers';

function play(campaign: Campaign, actions: Action[]): Campaign {
  return actions.reduce((state, action) => act(state, action), campaign);
}

function winShift(campaign: Campaign): Campaign {
  return play(campaign, winningActions(campaign));
}

function winRun(campaign: Campaign): Campaign {
  for (let shift = 1; shift <= SHIFTS_PER_RUN; shift += 1) {
    campaign = winShift(campaign);
    if (shift < SHIFTS_PER_RUN) campaign = advanceShift(campaign);
  }
  return campaign;
}

function permutations<T>(values: T[]): T[][] {
  return values.length === 0 ? [[]] : values.flatMap((value, index) => permutations([...values.slice(0, index), ...values.slice(index + 1)]).map(rest => [value, ...rest]));
}

describe('Finite Forge deterministic sunset campaign', () => {
  it('regression: uses 24 production ticks and loses when sunset arrives', () => {
    let campaign = newCampaign();
    expect(PRODUCTION_TICKS).toBe(24);
    expect(campaign).toMatchObject({ shift: 1, tick: 0, deadline: 24, status: 'active' });
    for (let tick = 0; tick < 24; tick += 1) campaign = act(campaign, 'mine');
    expect(campaign).toMatchObject({ tick: 24, deadline: 24, status: 'failed' });
    expect(ticksRemaining(campaign)).toBe(0);
  });

  it('keeps the daylight forecast and production results deterministic', () => {
    const first = newCampaign();
    const second = newCampaign();
    const script: Action[] = ['mine', 'shape', 'charge', 'mine', 'mine', 'shape'];
    expect(script.reduce((state, action) => act(state, action), first)).toEqual(script.reduce((state, action) => act(state, action), second));
    expect(Array.from({ length: 24 }, (_, tick) => sunBonusAt(1, tick, 1))).toEqual(Array.from({ length: 24 }, (_, tick) => sunBonusAt(1, tick, 1)));
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
    expect(retried).toMatchObject({ run: 1, shift: 1, tick: 0, deadline: 24, owned: [], status: 'active', completedRuns: 0, completedShifts: 0 });
    expect(retried.stock).toEqual({ ore: 0, parts: 0, charge: 0 });
  });

  it('@claim:campaign-duration ships five runs, six blueprints per run, and a 33.3-minute planning budget', () => {
    expect(RUN_COUNT).toBe(5);
    expect(SHIFTS_PER_RUN).toBe(6);
    expect(CAMPAIGN_SHIFT_COUNT).toBe(30);
    expect(PRODUCTION_TICKS).toBe(24);
    expect(MINIMUM_CAMPAIGN_TICKS).toBe(400);
    expect(PLANNING_SECONDS_PER_TICK).toBe(5);
    expect(plannedCampaignMinutes()).toBe(33.3);
    expect(plannedCampaignMinutes()).toBeGreaterThanOrEqual(30);
    expect(plannedCampaignMinutes()).toBeLessThanOrEqual(45);
    expect(shiftGoals.flat()).toHaveLength(30);
  });

  it('completes all five runs and thirty authored blueprints through a deterministic scripted campaign', () => {
    const toolOrder: ToolId[] = ['lens', 'pattern', 'bellows', 'stockpile'];
    let campaign = newCampaign();
    let completed = 0;
    for (let run = 1; run <= RUN_COUNT; run += 1) {
      campaign = winRun(campaign);
      completed += SHIFTS_PER_RUN;
      expect(campaign.status).toBe(run === RUN_COUNT ? 'campaign-complete' : 'run-complete');
      if (run < RUN_COUNT) campaign = chooseTool(campaign, toolOrder[run - 1]);
    }
    expect(completed).toBe(CAMPAIGN_SHIFT_COUNT);
    expect(campaign.status).toBe('campaign-complete');
    expect(campaign.totalTicks).toBeGreaterThanOrEqual(MINIMUM_CAMPAIGN_TICKS);
    expect(progressPercent(campaign)).toBe(100);
  });

  it('keeps every reset-tool order winnable before each sunset', () => {
    clearWinningActionCache();
    const orders = permutations<ToolId>(['bellows', 'pattern', 'lens', 'stockpile']);
    expect(orders).toHaveLength(24);
    let solvedOrders = 0;
    let solvedShifts = 0;
    let shortestCampaign = Number.POSITIVE_INFINITY;
    for (const toolOrder of orders) {
      let campaign = newCampaign();
      for (let run = 1; run <= RUN_COUNT; run += 1) {
        for (let shift = 1; shift <= SHIFTS_PER_RUN; shift += 1) {
          campaign = winShift(campaign);
          expect(campaign.tick).toBeLessThanOrEqual(PRODUCTION_TICKS);
          solvedShifts += 1;
          if (shift < SHIFTS_PER_RUN) campaign = advanceShift(campaign);
        }
        if (run < RUN_COUNT) campaign = chooseTool(campaign, toolOrder[run - 1]);
      }
      expect(campaign.status).toBe('campaign-complete');
      shortestCampaign = Math.min(shortestCampaign, campaign.totalTicks);
      solvedOrders += 1;
    }
    expect(solvedOrders).toBe(24);
    expect(solvedShifts).toBe(24 * CAMPAIGN_SHIFT_COUNT);
    expect(shortestCampaign).toBeGreaterThanOrEqual(MINIMUM_CAMPAIGN_TICKS);
  });
});
