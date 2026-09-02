export type ToolId = 'bellows' | 'pattern' | 'lens' | 'stockpile';
export type Action = 'mine' | 'shape' | 'charge';
export type Stock = { ore: number; parts: number; charge: number };
export type CampaignStatus = 'active' | 'run-complete' | 'failed' | 'campaign-complete';
export type Campaign = {
  run: number;
  tick: number;
  deadline: number;
  goal: number;
  stock: Stock;
  owned: ToolId[];
  status: CampaignStatus;
  completedRuns: number;
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
  stockpile: { name: 'Stock bin', note: 'Each new run starts with one ore and one part.' }
};

export const PRODUCTION_TICKS = 24;
export const RUN_COUNT = 5;
export const runGoals = [12, 14, 17, 19, 36] as const;
const actions: Action[] = ['mine', 'shape', 'charge'];

function startingStock(owned: ToolId[]): Stock {
  return owned.includes('stockpile') ? { ore: 1, parts: 1, charge: 0 } : { ore: 0, parts: 0, charge: 0 };
}

export function newRun(run: number, owned: ToolId[], completedRuns = run - 1, totalTicks = 0): Campaign {
  return {
    run,
    tick: 0,
    deadline: PRODUCTION_TICKS,
    goal: runGoals[run - 1],
    stock: startingStock(owned),
    owned: [...owned],
    status: 'active',
    completedRuns,
    totalTicks
  };
}

export function newCampaign(): Campaign {
  return newRun(1, [], 0, 0);
}

export function sunBonusAt(run: number, tick: number): Action {
  return actions[(run * 2 + tick * 2) % actions.length];
}

function toolFor(action: Action): ToolId {
  return action === 'mine' ? 'bellows' : action === 'shape' ? 'pattern' : 'lens';
}

export function actionYield(campaign: Campaign, action: Action): number {
  return 1 + Number(sunBonusAt(campaign.run, campaign.tick) === action) + Number(campaign.owned.includes(toolFor(action)));
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
    ? (campaign.run === RUN_COUNT ? 'campaign-complete' : 'run-complete')
    : tick >= campaign.deadline ? 'failed' : 'active';
  return { ...campaign, stock, tick, totalTicks, status };
}

export function chooseTool(campaign: Campaign, tool: ToolId): Campaign {
  if (campaign.status !== 'run-complete' || campaign.owned.includes(tool) || campaign.run >= RUN_COUNT) return campaign;
  const owned = [...campaign.owned, tool];
  return newRun(campaign.run + 1, owned, campaign.completedRuns + 1, campaign.totalTicks);
}

export function retryRun(campaign: Campaign): Campaign {
  if (campaign.status !== 'failed') return campaign;
  return newRun(campaign.run, campaign.owned, campaign.completedRuns, campaign.totalTicks);
}

export function ticksRemaining(campaign: Campaign): number {
  return Math.max(0, campaign.deadline - campaign.tick);
}

export function progressPercent(campaign: Campaign): number {
  const runProgress = Math.min(1, campaign.stock.charge / campaign.goal);
  return Math.round(((campaign.completedRuns + runProgress) / RUN_COUNT) * 100);
}
