import { act, type Action, type Campaign } from '../src/engine';

type Node = { campaign: Campaign; parent?: Node; action?: Action };
const actions: Action[] = ['mine', 'shape', 'charge'];
const solutionCache = new Map<string, Action[]>();

function campaignKey(campaign: Campaign) {
  return [campaign.run, campaign.shift, campaign.tick, campaign.deadline, campaign.goal, [...campaign.owned].sort().join(','), campaign.stock.ore, campaign.stock.parts, campaign.stock.charge].join('|');
}

function stateKey(campaign: Campaign) {
  return `${campaign.stock.ore},${campaign.stock.parts},${campaign.stock.charge}`;
}

function replay(node: Node): Action[] {
  const path: Action[] = [];
  for (let cursor: Node | undefined = node; cursor.parent; cursor = cursor.parent) path.push(cursor.action!);
  return path.reverse();
}

/**
 * Finds a shortest winning action sequence for one authored shift. Caching is
 * deliberately keyed by all gameplay inputs, so the exhaustive tool-order
 * test still solves every distinct owned-tool state rather than skipping it.
 */
export function winningActions(start: Campaign): Action[] {
  const key = campaignKey(start);
  const cached = solutionCache.get(key);
  if (cached) return [...cached];

  let frontier = new Map<string, Node>([[stateKey(start), { campaign: start }]]);
  for (let depth = start.tick; depth < start.deadline; depth += 1) {
    const next = new Map<string, Node>();
    for (const node of frontier.values()) {
      for (const action of actions) {
        const campaign = act(node.campaign, action);
        const child = { campaign, parent: node, action };
        if (campaign.status === 'shift-complete' || campaign.status === 'run-complete' || campaign.status === 'campaign-complete') {
          const path = replay(child);
          solutionCache.set(key, path);
          return [...path];
        }
        if (campaign.status !== 'active') continue;
        const stockKey = stateKey(campaign);
        if (!next.has(stockKey)) next.set(stockKey, child);
      }
    }
    frontier = next;
  }
  throw new Error(`Run ${start.run}, shift ${start.shift} has no winning path before tick ${start.deadline}.`);
}

export function clearWinningActionCache() {
  solutionCache.clear();
}
