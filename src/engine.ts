export type ToolId = 'bellows' | 'pattern' | 'lens' | 'sundial';
export type Resource = { ore: number; parts: number; charge: number; tick: number; deadline: number; completed: boolean; failed: boolean };
export const tools: Record<ToolId, { name: string; note: string }> = {
  bellows: { name: 'Bellows', note: 'Mine 2 ore at once.' },
  pattern: { name: 'Pattern plate', note: 'Shape 2 parts at once.' },
  lens: { name: 'Focusing lens', note: 'Charge 2 at once.' },
  sundial: { name: 'Sun dial', note: 'Add 2 production ticks.' }
};
export const newRun = (owned: ToolId[] = []): Resource => ({ ore: 0, parts: 0, charge: 0, tick: 0, deadline: 24 + (owned.includes('sundial') ? 2 : 0), completed: false, failed: false });
export function act(s: Resource, action: 'mine' | 'shape' | 'charge', owned: ToolId[]): Resource {
  if (s.completed || s.failed) return s;
  const next = { ...s, tick: s.tick + 1 };
  if (action === 'mine') next.ore += owned.includes('bellows') ? 2 : 1;
  if (action === 'shape' && next.ore > 0) { next.ore--; next.parts += owned.includes('pattern') ? 2 : 1; }
  if (action === 'charge' && next.parts > 0) { next.parts--; next.charge += owned.includes('lens') ? 2 : 1; }
  if (next.charge >= 6) next.completed = true;
  if (!next.completed && next.tick >= next.deadline) next.failed = true;
  return next;
}
export function chooseTool(owned: ToolId[]): ToolId | null { return (Object.keys(tools) as ToolId[]).find(t => !owned.includes(t)) ?? null; }
export function canFinishCampaign(owned: ToolId[]): boolean { return owned.length >= 4; }
