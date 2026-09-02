export type ToolId = 'bellows' | 'pattern' | 'lens' | 'sundial';
export type Action = 'mine' | 'shape' | 'charge';
export type Stock = { ore: number; parts: number; charge: number };
export type CampaignStatus = 'active' | 'plan-complete' | 'failed' | 'campaign-complete';
export type Campaign = { plan: number; shift: number; integrity: number; owned: ToolId[]; program: Action[]; status: CampaignStatus; completedShifts: number; mistakes: number; activeSeconds: number };
export type Challenge = { id: string; slots: number; stock: Stock; boosts: Action[]; target: Stock; solution: Action[] };

export const actionNames: Record<Action, string> = { mine: 'Mine ore', shape: 'Shape parts', charge: 'Charge beacon' };
export const tools: Record<ToolId, { name: string; note: string }> = {
  bellows: { name: 'Bellows', note: 'Every mine action makes one extra ore.' },
  pattern: { name: 'Pattern plate', note: 'Every shape action makes one extra part.' },
  lens: { name: 'Focusing lens', note: 'Every charge action makes one extra charge.' },
  sundial: { name: 'Sun dial', note: 'Each plan can survive one extra missed shift.' }
};
export const planShiftCounts = [4, 5, 6, 7, 8] as const;
export const totalCampaignShifts = planShiftCounts.reduce((sum, count) => sum + count, 0);
const actions: Action[] = ['mine', 'shape', 'charge'];

export function maxIntegrity(owned: ToolId[]): number { return owned.includes('sundial') ? 4 : 3; }
export function newCampaign(): Campaign { return { plan: 1, shift: 0, integrity: 3, owned: [], program: [], status: 'active', completedShifts: 0, mistakes: 0, activeSeconds: 0 }; }
export function globalShiftIndex(plan: number, shift: number): number { return planShiftCounts.slice(0, plan - 1).reduce((sum, count) => sum + count, 0) + shift; }

function actionYield(action: Action, boosted: boolean, owned: ToolId[]): number {
  const tool: Partial<Record<Action, ToolId>> = { mine: 'bellows', shape: 'pattern', charge: 'lens' };
  return 1 + Number(boosted) + Number(Boolean(tool[action] && owned.includes(tool[action]!)));
}

export function runProgram(stock: Stock, program: Action[], boosts: Action[], owned: ToolId[]): Stock {
  return program.reduce<Stock>((next, action, slot) => {
    const value = actionYield(action, boosts[slot] === action, owned);
    if (action === 'mine') return { ...next, ore: next.ore + value };
    if (action === 'shape') return next.ore > 0 ? { ...next, ore: next.ore - 1, parts: next.parts + value } : next;
    return next.parts > 0 ? { ...next, parts: next.parts - 1, charge: next.charge + value } : next;
  }, { ...stock });
}

export function challengeFor(plan: number, shift: number, owned: ToolId[]): Challenge {
  const index = globalShiftIndex(plan, shift);
  const slots = plan === 1 ? 2 : plan <= 3 ? 3 : 4;
  const stock = { ore: 2 + ((index + plan) % 3), parts: 2 + ((index * 2 + plan) % 3), charge: (index + plan) % 2 };
  const boosts = Array.from({ length: slots }, (_, slot) => actions[(index + plan + slot * 2) % actions.length]);
  const solution = Array.from({ length: slots }, (_, slot) => {
    const digit = Math.floor((index + plan * 7) / (3 ** slot));
    return actions[(digit + slot + plan) % actions.length];
  });
  return { id: `P${plan}-S${shift + 1}`, slots, stock, boosts, solution, target: runProgram(stock, solution, boosts, owned) };
}

export function addAction(campaign: Campaign, action: Action): Campaign {
  if (campaign.status !== 'active') return campaign;
  const challenge = challengeFor(campaign.plan, campaign.shift, campaign.owned);
  return campaign.program.length < challenge.slots ? { ...campaign, program: [...campaign.program, action] } : campaign;
}
export function removeAction(campaign: Campaign): Campaign { return campaign.status === 'active' && campaign.program.length ? { ...campaign, program: campaign.program.slice(0, -1) } : campaign; }
export function stocksMatch(left: Stock, right: Stock): boolean { return left.ore === right.ore && left.parts === right.parts && left.charge === right.charge; }

export function submitProgram(campaign: Campaign): { campaign: Campaign; result: Stock; correct: boolean } {
  const challenge = challengeFor(campaign.plan, campaign.shift, campaign.owned);
  const result = runProgram(challenge.stock, campaign.program, challenge.boosts, campaign.owned);
  if (campaign.status !== 'active' || campaign.program.length !== challenge.slots) return { campaign, result, correct: false };
  const correct = stocksMatch(result, challenge.target);
  if (!correct) {
    const integrity = campaign.integrity - 1;
    return { result, correct, campaign: { ...campaign, integrity, mistakes: campaign.mistakes + 1, program: [], status: integrity === 0 ? 'failed' : 'active' } };
  }
  const completedShifts = campaign.completedShifts + 1;
  const lastShift = campaign.shift + 1 === planShiftCounts[campaign.plan - 1];
  const status: CampaignStatus = lastShift ? (campaign.plan === 5 ? 'campaign-complete' : 'plan-complete') : 'active';
  return { result, correct, campaign: { ...campaign, shift: lastShift ? campaign.shift : campaign.shift + 1, completedShifts, program: [], status } };
}

export function chooseTool(campaign: Campaign, tool: ToolId): Campaign {
  if (campaign.status !== 'plan-complete' || campaign.owned.includes(tool) || campaign.plan >= 5) return campaign;
  const owned = [...campaign.owned, tool];
  return { ...campaign, plan: campaign.plan + 1, shift: 0, integrity: maxIntegrity(owned), owned, program: [], status: 'active' };
}
export function retryPlan(campaign: Campaign): Campaign {
  if (campaign.status !== 'failed') return campaign;
  return { ...campaign, shift: 0, integrity: maxIntegrity(campaign.owned), program: [], status: 'active', completedShifts: globalShiftIndex(campaign.plan, 0) };
}
export function recordActiveTime(campaign: Campaign, seconds: number): Campaign { return campaign.status !== 'campaign-complete' && seconds > 0 ? { ...campaign, activeSeconds: campaign.activeSeconds + Math.min(seconds, 90) } : campaign; }
export function progressPercent(campaign: Campaign): number { return Math.round((campaign.completedShifts / totalCampaignShifts) * 100); }
