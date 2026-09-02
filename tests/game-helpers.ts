import { act, type Action, type Campaign } from '../src/engine';

export function winningActions(start: Campaign): Action[] {
  const actions: Action[] = ['mine', 'shape', 'charge'];
  let frontier = new Map<string, { campaign: Campaign; path: Action[] }>([
    [`${start.stock.ore},${start.stock.parts},${start.stock.charge}`, { campaign: start, path: [] }]
  ]);

  for (let depth = start.tick; depth < start.deadline; depth += 1) {
    const next = new Map<string, { campaign: Campaign; path: Action[] }>();
    for (const node of frontier.values()) {
      for (const action of actions) {
        const campaign = act(node.campaign, action);
        const path = [...node.path, action];
        if (campaign.status === 'run-complete' || campaign.status === 'campaign-complete') return path;
        if (campaign.status !== 'active') continue;
        const key = `${campaign.stock.ore},${campaign.stock.parts},${campaign.stock.charge}`;
        if (!next.has(key)) next.set(key, { campaign, path });
      }
    }
    frontier = next;
  }
  throw new Error(`Run ${start.run} has no winning path before tick ${start.deadline}.`);
}
