import { describe, expect, it } from 'vitest';
import { addAction, challengeFor, chooseTool, maxIntegrity, newCampaign, planShiftCounts, progressPercent, recordActiveTime, retryPlan, runProgram, stocksMatch, submitProgram, totalCampaignShifts, type Action, type Campaign, type ToolId } from '../src/engine';

function solveShift(campaign: Campaign, thinkSeconds = 0): Campaign {
  const challenge = challengeFor(campaign.plan, campaign.shift, campaign.owned);
  let next = recordActiveTime(campaign, thinkSeconds);
  for (const action of challenge.solution) next = addAction(next, action);
  const outcome = submitProgram(next);
  expect(outcome.correct).toBe(true);
  return outcome.campaign;
}
function solvePlan(campaign: Campaign, thinkSeconds = 0): Campaign {
  const count = planShiftCounts[campaign.plan - 1];
  for (let shift = 0; shift < count; shift += 1) campaign = solveShift(campaign, thinkSeconds);
  return campaign;
}
function wrongProgram(campaign: Campaign): Action[] {
  const challenge = challengeFor(campaign.plan, campaign.shift, campaign.owned);
  const candidates: Action[] = ['mine', 'shape', 'charge'];
  for (let encoded = 0; encoded < 3 ** challenge.slots; encoded += 1) {
    const program = Array.from({ length: challenge.slots }, (_, slot) => candidates[Math.floor(encoded / (3 ** slot)) % 3]);
    if (!stocksMatch(runProgram(challenge.stock, program, challenge.boosts, campaign.owned), challenge.target)) return program;
  }
  throw new Error('challenge unexpectedly accepts every program');
}

describe('Finite Forge deterministic strategy campaign', () => {
  it('generates thirty distinct, reproducible planning shifts', () => {
    const ids = new Set<string>();
    const blueprints = new Set<string>();
    for (let plan = 1; plan <= 5; plan += 1) for (let shift = 0; shift < planShiftCounts[plan - 1]; shift += 1) {
      const first = challengeFor(plan, shift, []);
      expect(challengeFor(plan, shift, [])).toEqual(first);
      expect(stocksMatch(runProgram(first.stock, first.solution, first.boosts, []), first.target)).toBe(true);
      ids.add(first.id);
      blueprints.add(JSON.stringify({ slots: first.slots, stock: first.stock, boosts: first.boosts, target: first.target, solution: first.solution }));
    }
    expect(ids.size).toBe(totalCampaignShifts);
    expect(blueprints.size).toBe(totalCampaignShifts);
  });

  it('exercises strategic tool choice with different later-plan outcomes', () => {
    let base = solvePlan(newCampaign());
    const bellowsPath = chooseTool(base, 'bellows');
    const sundialPath = chooseTool(base, 'sundial');
    const bellowsOrder = challengeFor(2, 0, bellowsPath.owned);
    const sundialOrder = challengeFor(2, 0, sundialPath.owned);
    expect(bellowsOrder.target).not.toEqual(sundialOrder.target);
    expect(maxIntegrity(bellowsPath.owned)).toBe(3);
    expect(maxIntegrity(sundialPath.owned)).toBe(4);
  });

  it('loses a plan after three wrong programs and recovers without a tool', () => {
    let campaign = newCampaign();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      for (const action of wrongProgram(campaign)) campaign = addAction(campaign, action);
      campaign = submitProgram(campaign).campaign;
    }
    expect(campaign.status).toBe('failed');
    expect(campaign.owned).toEqual([]);
    campaign = retryPlan(campaign);
    expect(campaign).toMatchObject({ status: 'active', plan: 1, shift: 0, completedShifts: 0, owned: [] });
  });

  it('@claim:campaign-duration measures a complete 30-minute scripted campaign across all 30 shifts', () => {
    let campaign = newCampaign();
    const choices: ToolId[] = ['sundial', 'bellows', 'pattern', 'lens'];
    const planProgress: number[] = [];
    let programmedChoices = 0;
    for (let plan = 1; plan <= 5; plan += 1) {
      for (let shift = 0; shift < planShiftCounts[plan - 1]; shift += 1) {
        programmedChoices += challengeFor(campaign.plan, campaign.shift, campaign.owned).slots;
        campaign = solveShift(campaign, 60);
      }
      planProgress.push(campaign.completedShifts);
      if (plan < 5) campaign = chooseTool(campaign, choices[plan - 1]);
    }
    expect(planProgress).toEqual([4, 9, 15, 22, 30]);
    expect(programmedChoices).toBe(130);
    expect(campaign.status).toBe('campaign-complete');
    expect(campaign.activeSeconds / 60).toBe(30);
    expect(progressPercent(campaign)).toBe(100);
  });
});
