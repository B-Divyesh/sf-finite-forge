import { describe, expect, it } from 'vitest';
import { act, newRun, chooseTool } from '../src/engine';
describe('Finite Forge deterministic loop', () => {
  it('@claim:reaches-end-screen completes a scripted run', () => {
    let s = newRun([]); for (let i=0;i<6;i++) { s=act(s,'mine',[]); s=act(s,'shape',[]); s=act(s,'charge',[]); } expect(s.completed).toBe(true);
  });
  it('@claim:restart-resets-state starts an empty new run', () => { const prior = newRun(['bellows']); expect(newRun(['bellows'])).toEqual({...prior, ore:0,parts:0,charge:0,tick:0}); });
  it('ends when the deadline is spent', () => { let s=newRun([]); for(let i=0;i<24;i++) s=act(s,'mine',[]); expect(s.failed).toBe(true); });
  it('offers exactly one next tool', () => expect(chooseTool(['bellows','pattern'])).toBe('lens'));
});
