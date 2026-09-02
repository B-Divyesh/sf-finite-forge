export type ToolId = 'bellows' | 'pattern' | 'lens' | 'stockpile';
export type Action = 'mine' | 'shape' | 'charge';
export type Stock = { ore: number; parts: number; charge: number };
export type CampaignStatus = 'active' | 'shift-complete' | 'run-complete' | 'failed' | 'campaign-complete';
export type Campaign = {
  run: number;
  shift: number;
  tick: number;
  deadline: number;
  goal: number;
  stock: Stock;
  owned: ToolId[];
  status: CampaignStatus;
  completedRuns: number;
  completedShifts: number;
  totalTicks: number;
};

export const actionNames: Record<Action, string> = {
  mine: 'Mine ore',
  shape: 'Shape parts',
  charge: 'Charge beacon'
};

export const tools: Record<ToolId, { name: string; note: string }> = {
  bellows: { name: 'Bellows', note: 'Mining makes one extra ore.' },
  pattern: { name: 'Pattern plate', note: 'Shaping makes one extra part.' },
  lens: { name: 'Focusing lens', note: 'Charging makes one extra charge.' },
  stockpile: { name: 'Stock bin', note: 'Each shift starts with one ore and one part.' }
};

/** Each shift has a visible, finite work budget. */
export const PRODUCTION_TICKS = 24;
export const RUN_COUNT = 5;
export const SHIFTS_PER_RUN = 6;
export const CAMPAIGN_SHIFT_COUNT = RUN_COUNT * SHIFTS_PER_RUN;
/** Every tool order requires at least this many production decisions to finish. */
export const MINIMUM_CAMPAIGN_TICKS = 400;
/** A documented planning estimate, used only to state the intended session shape. */
export const PLANNING_SECONDS_PER_TICK = 5;

// Thirty authored blueprints turn five beacon runs into a complete, evening-length campaign.
// The final value in each row is kept as `runGoals` for concise run summaries and save validation.
export const shiftGoals = [
  [13, 13, 14, 14, 15, 15],
  [15, 15, 16, 16, 17, 17],
  [17, 17, 18, 18, 19, 19],
  [19, 19, 20, 20, 21, 21],
  [22, 22, 23, 23, 24, 24]
] as const;
export const runGoals = shiftGoals.map(goals => goals[goals.length - 1]) as [15, 17, 19, 21, 24];
const actions: Action[] = ['mine', 'shape', 'charge'];

function startingStock(owned: ToolId[]): Stock {
  return owned.includes('stockpile') ? { ore: 1, parts: 1, charge: 0 } : { ore: 0, parts: 0, charge: 0 };
}

function goalAt(run: number, shift: number): number {
  return shiftGoals[run - 1][shift - 1];
}

export function newShift(
  run: number,
  shift: number,
  owned: ToolId[],
  completedRuns = run - 1,
  completedShifts = (run - 1) * SHIFTS_PER_RUN + shift - 1,
  totalTicks = 0
): Campaign {
  return {
    run,
    shift,
    tick: 0,
    deadline: PRODUCTION_TICKS,
    goal: goalAt(run, shift),
    stock: startingStock(owned),
    owned: [...owned],
    status: 'active',
    completedRuns,
    completedShifts,
    totalTicks
  };
}

export function newRun(run: number, owned: ToolId[], completedRuns = run - 1, totalTicks = 0, completedShifts = (run - 1) * SHIFTS_PER_RUN): Campaign {
  return newShift(run, 1, owned, completedRuns, completedShifts, totalTicks);
}

export function newCampaign(): Campaign {
  return newRun(1, [], 0, 0, 0);
}

export function sunBonusAt(run: number, tick: number, shift = 1): Action {
  return actions[(run * 2 + shift + tick * 2) % actions.length];
}

function toolFor(action: Action): ToolId {
  return action === 'mine' ? 'bellows' : action === 'shape' ? 'pattern' : 'lens';
}

export function actionYield(campaign: Campaign, action: Action): number {
  return 1 + Number(sunBonusAt(campaign.run, campaign.tick, campaign.shift) === action) + Number(campaign.owned.includes(toolFor(action)));
}

export function act(campaign: Campaign, action: Action): Campaign {
  if (campaign.status !== 'active') return campaign;
  const stock = { ...campaign.stock };
  const amount = actionYield(campaign, action);
  if (action === 'mine') stock.ore += amount;
  if (action === 'shape' && stock.ore > 0) {
    stock.ore -= 1;
    stock.parts += amount;
  }
  if (action === 'charge' && stock.parts > 0) {
    stock.parts -= 1;
    stock.charge += amount;
  }

  const tick = campaign.tick + 1;
  const totalTicks = campaign.totalTicks + 1;
  const won = stock.charge >= campaign.goal;
  const status: CampaignStatus = won
    ? (campaign.run === RUN_COUNT && campaign.shift === SHIFTS_PER_RUN
      ? 'campaign-complete'
      : campaign.shift === SHIFTS_PER_RUN ? 'run-complete' : 'shift-complete')
    : tick >= campaign.deadline ? 'failed' : 'active';
  return { ...campaign, stock, tick, totalTicks, status };
}

export function advanceShift(campaign: Campaign): Campaign {
  if (campaign.status !== 'shift-complete') return campaign;
  return newShift(campaign.run, campaign.shift + 1, campaign.owned, campaign.completedRuns, campaign.completedShifts + 1, campaign.totalTicks);
}

export function chooseTool(campaign: Campaign, tool: ToolId): Campaign {
  if (campaign.status !== 'run-complete' || campaign.owned.includes(tool) || campaign.run >= RUN_COUNT) return campaign;
  const owned = [...campaign.owned, tool];
  return newRun(campaign.run + 1, owned, campaign.completedRuns + 1, campaign.totalTicks, campaign.completedShifts + 1);
}

export function retryRun(campaign: Campaign): Campaign {
  if (campaign.status !== 'failed') return campaign;
  return newShift(campaign.run, campaign.shift, campaign.owned, campaign.completedRuns, campaign.completedShifts, campaign.totalTicks);
}

export function ticksRemaining(campaign: Campaign): number {
  return Math.max(0, campaign.deadline - campaign.tick);
}

export function completedShiftCount(campaign: Campaign): number {
  return campaign.completedShifts + Number(['shift-complete', 'run-complete', 'campaign-complete'].includes(campaign.status));
}

export function progressPercent(campaign: Campaign): number {
  const runProgress = Math.min(1, campaign.stock.charge / campaign.goal);
  const shiftProgress = campaign.status === 'active' ? runProgress : 1;
  return Math.round(((campaign.completedShifts + shiftProgress) / CAMPAIGN_SHIFT_COUNT) * 100);
}

export function plannedCampaignMinutes(): number {
  return Number((MINIMUM_CAMPAIGN_TICKS * PLANNING_SECONDS_PER_TICK / 60).toFixed(1));
}
