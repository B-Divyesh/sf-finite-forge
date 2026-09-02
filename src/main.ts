import './style.css';
import './illustration.css';
import { actionNames, addAction, challengeFor, chooseTool, maxIntegrity, newCampaign, planShiftCounts, progressPercent, recordActiveTime, removeAction, retryPlan, runProgram, stocksMatch, submitProgram, tools, totalCampaignShifts, type Action, type Campaign, type ToolId } from './engine';

type Save = { campaign: Campaign; settings: { motion: boolean; sound: boolean } };
const realKey = 'finite-forge:v2';
const demoKey = 'demo:finite-forge:v2';
const app = document.querySelector<HTMLDivElement>('#app')!;
let demo = isDemoRoute();
let save: Save;
let notice = '';
let settingsOpen = false;
let actionPulse = 0;
let audioContext: AudioContext | undefined;
let lastInteraction = performance.now();

function isDemoRoute() { return location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1'; }
function fresh(): Save { return { campaign: newCampaign(), settings: { motion: true, sound: false } }; }
function sample(): Save {
  const campaign = { ...newCampaign(), plan: 3, shift: 2, owned: ['bellows', 'pattern'] as ToolId[], completedShifts: 11, integrity: 3, activeSeconds: 720 };
  return { campaign, settings: { motion: true, sound: false } };
}
function validSave(value: unknown): value is Save {
  const candidate = value as Partial<Save> | null;
  return Boolean(candidate?.campaign && Array.isArray(candidate.campaign.owned) && Array.isArray(candidate.campaign.program) && candidate.settings);
}
function load() {
  demo = isDemoRoute();
  const key = demo ? demoKey : realKey;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) || 'null');
    save = validSave(parsed) ? parsed : (demo ? sample() : fresh());
    save.settings = { motion: save.settings.motion !== false, sound: save.settings.sound === true };
    if (!validSave(parsed)) localStorage.setItem(key, JSON.stringify(save));
  } catch {
    save = demo ? sample() : fresh();
    notice = 'Saved progress could not be read. A new forge plan is ready.';
  }
}
function persist() { localStorage.setItem(demo ? demoKey : realKey, JSON.stringify(save)); }
function noteInteraction() {
  const now = performance.now();
  save.campaign = recordActiveTime(save.campaign, (now - lastInteraction) / 1000);
  lastInteraction = now;
}
function nav(path: string) { history.pushState({}, '', path); render(true); }
function setPage(title: string, description: string) {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = description;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = title;
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')!.content = description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://finite-forge.sociobot.in${demo ? '/demo' : location.pathname}`;
}
function playCue(success = false) {
  if (!save.settings.sound) return;
  try {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = success ? 620 : 440;
    gain.gain.setValueAtTime(0.03, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.07);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + 0.07);
    const host = window as Window & { __finiteForgeSoundCount?: number };
    host.__finiteForgeSoundCount = (host.__finiteForgeSoundCount || 0) + 1;
  } catch { notice = 'Sound cues are unavailable. The forge still plays normally.'; }
}
function programAction(action: Action) {
  noteInteraction();
  const before = save.campaign.program.length;
  save.campaign = addAction(save.campaign, action);
  if (save.campaign.program.length === before) return;
  actionPulse += 1; playCue(); persist(); render();
}
function undoAction() { noteInteraction(); save.campaign = removeAction(save.campaign); persist(); render(); }
function fireShift() {
  noteInteraction();
  const outcome = submitProgram(save.campaign);
  if (outcome.campaign === save.campaign) { notice = 'Fill every program slot before running this shift.'; render(); return; }
  save.campaign = outcome.campaign;
  if (outcome.correct) notice = save.campaign.status === 'active' ? 'Shift matched. The next blueprint is ready.' : save.campaign.status === 'plan-complete' ? 'Plan complete. Choose one tool for the reset.' : 'Final beacon lit. All 30 planning shifts are complete.';
  else notice = save.campaign.status === 'failed' ? 'The plan lost all integrity. Retry it with the same tools.' : `That program missed the target. ${save.campaign.integrity} integrity remains.`;
  playCue(outcome.correct); persist(); render();
}
function selectTool(tool: ToolId) { noteInteraction(); save.campaign = chooseTool(save.campaign, tool); notice = `${tools[tool].name} added. Plan ${save.campaign.plan} is ready.`; persist(); render(); }
function retry() { noteInteraction(); save.campaign = retryPlan(save.campaign); notice = `Plan ${save.campaign.plan} restarted. No tool was earned.`; persist(); render(); }
function resetDemo() { localStorage.removeItem(demoKey); save = sample(); notice = 'Sample forge restored in plan three.'; persist(); render(); }
function startReal() { localStorage.removeItem(demoKey); nav('/'); }

function header() { return `<header><a class="wordmark" href="/" data-link>FINITE<br><b>FORGE</b></a><nav aria-label="Primary"><a href="/demo" data-link>Demo</a><a href="/#how" data-link>How it works</a><a href="/privacy" data-link>Privacy</a></nav></header>`; }
function footer() { return `<footer><p>A five-plan strategy forge with a final beacon.</p><p><a href="/privacy" data-link>Privacy</a> · <a href="/terms" data-link>Terms</a> · Built by Param Factory · v2.0.0</p><p>Blueprint illustration uses original generated imagery.</p></footer>`; }
function demoBanner() { return demo ? `<aside class="demo" role="status"><b>Demo — sample data, nothing is saved</b><span>Plan three starts with two tools and 11 solved shifts.</span><button data-reset-demo>Reset demo</button><button data-start-real>Start for real</button></aside>` : ''; }
function stockCells(label: string, stock: { ore: number; parts: number; charge: number }, className = '') {
  return `<div class="stock ${className}" aria-label="${label}: ${stock.ore} ore, ${stock.parts} parts, ${stock.charge} charge"><span>${label}</span><b><i>Ore</i>${stock.ore}</b><b><i>Parts</i>${stock.parts}</b><b><i>Charge</i>${stock.charge}</b></div>`;
}
function toolList() {
  if (!save.campaign.owned.length) return '<p class="no-tools">No reset tools yet.</p>';
  return `<ul class="tool-list">${save.campaign.owned.map(id => `<li><b>${tools[id].name}</b><span>${tools[id].note}</span></li>`).join('')}</ul>`;
}
function activeBoard() {
  const campaign = save.campaign;
  const challenge = challengeFor(campaign.plan, campaign.shift, campaign.owned);
  const projected = runProgram(challenge.stock, campaign.program, challenge.boosts, campaign.owned);
  const complete = campaign.program.length === challenge.slots;
  const matches = complete && stocksMatch(projected, challenge.target);
  return `<div class="briefing"><div><p class="section-label">Starting stock</p>${stockCells('Start', challenge.stock)}</div><div><p class="section-label">Exact order</p>${stockCells('Target', challenge.target, 'target')}</div></div>
  <section class="forecast" aria-labelledby="forecast-title"><div><p class="section-label">Shift forecast</p><h3 id="forecast-title">Program ${challenge.slots} actions</h3></div><ol>${challenge.boosts.map((boost, slot) => `<li><span>Slot ${slot + 1}</span><b>+1 ${boost === 'mine' ? 'ore from mining' : boost === 'shape' ? 'part from shaping' : 'charge from charging'}</b></li>`).join('')}</ol></section>
  <div class="program" aria-label="Current action program"><p class="section-label">Your program</p><ol>${Array.from({ length: challenge.slots }, (_, slot) => `<li class="${campaign.program[slot] ? 'filled' : ''}"><span>${slot + 1}</span>${campaign.program[slot] ? actionNames[campaign.program[slot]] : 'Choose an action'}</li>`).join('')}</ol></div>
  <div class="controls" aria-label="Planning controls"><button data-action="mine"><kbd>M</kbd> Mine ore</button><button data-action="shape"><kbd>S</kbd> Shape parts</button><button data-action="charge"><kbd>C</kbd> Charge beacon</button></div>
  <div class="projection">${stockCells('Projected', projected, matches ? 'match' : '')}<p>${complete ? (matches ? 'The projection matches the order.' : 'The projection misses the order. Undo and revise it.') : `${challenge.slots - campaign.program.length} program slot${challenge.slots - campaign.program.length === 1 ? '' : 's'} left.`}</p></div>
  <div class="commit"><button class="quiet" data-undo ${campaign.program.length ? '' : 'disabled'}>Undo last action</button><button class="primary" data-submit ${complete ? '' : 'disabled'}>Run this shift</button></div>`;
}
function endPanel() {
  const campaign = save.campaign;
  if (campaign.status === 'campaign-complete') {
    const minutes = Math.max(1, Math.round(campaign.activeSeconds / 60));
    return `<section class="end-panel"><h2>Final beacon lit</h2><p>You solved all ${totalCampaignShifts} planning shifts across five forge plans.</p><dl><div><dt>Active planning</dt><dd>${minutes} min</dd></div><div><dt>Revisions</dt><dd>${campaign.mistakes}</dd></div></dl><button data-new-campaign>Start a new campaign</button></section>`;
  }
  if (campaign.status === 'failed') return `<section class="end-panel"><h2>Revise plan ${campaign.plan}</h2><p>This plan lost its integrity. It earns no tool, but your earlier tools remain.</p><button class="primary" data-retry>Retry this plan</button></section>`;
  if (campaign.status === 'plan-complete') return `<section class="end-panel"><h2>Choose one reset tool</h2><p>Your choice changes every remaining blueprint. The other tools remain available after later plans.</p><div class="tool-choices">${(Object.keys(tools) as ToolId[]).filter(id => !campaign.owned.includes(id)).map(id => `<button data-tool="${id}"><b>${tools[id].name}</b><span>${tools[id].note}</span></button>`).join('')}</div></section>`;
  return '';
}
function game() {
  const campaign = save.campaign;
  const totalInPlan = planShiftCounts[campaign.plan - 1];
  const motionClass = save.settings.motion ? `motion-on pulse-${actionPulse % 2}` : 'motion-off';
  return `<section class="game-shell ${motionClass}" aria-label="Forge planning board"><div class="board-title"><div><h2>PLAN ${String(campaign.plan).padStart(2, '0')} · ${campaign.status === 'active' ? `SHIFT ${campaign.shift + 1}/${totalInPlan}` : campaign.status.replace('-', ' ').toUpperCase()}</h2><div class="integrity" aria-label="${campaign.integrity} plan integrity remaining">Integrity ${'◆'.repeat(campaign.integrity)}${'◇'.repeat(maxIntegrity(campaign.owned) - campaign.integrity)}</div></div><button class="quiet" data-settings aria-expanded="${settingsOpen}">Settings</button></div>
  <div class="campaign-progress"><progress value="${campaign.completedShifts}" max="${totalCampaignShifts}" aria-label="Campaign ${progressPercent(campaign)} percent complete"></progress><b>${campaign.completedShifts}/${totalCampaignShifts} shifts solved</b></div>
  ${campaign.status === 'active' ? activeBoard() : endPanel()}
  <section class="toolbox"><h3>Reset tools</h3>${toolList()}</section>
  <div class="settings" ${settingsOpen ? '' : 'hidden'}><label><input type="checkbox" data-motion ${save.settings.motion ? 'checked' : ''}> Show board motion</label><label><input type="checkbox" data-sound ${save.settings.sound ? 'checked' : ''}> Enable sound cues</label></div></section>`;
}
function home() {
  setPage(demo ? 'Demo — Finite Forge' : 'Finite Forge — Plan a beacon campaign', demo ? 'A seeded, isolated sample of the five-plan strategy campaign.' : 'Program 30 forge shifts, choose reset tools, and finish a finite beacon campaign.');
  return `${header()}${demoBanner()}<main id="main" tabindex="-1"><section class="intro"><div><p class="eyebrow">A finite strategy game</p><h1 tabindex="-1">Plan a beacon campaign.</h1><p class="lede">For reset fans who want one thoughtful game with a clear ending.</p><div class="hero-actions"><button class="primary" data-demo>Try it with sample data</button><span>Opens plan three with two tools.</span></div><ul class="facts"><li>30 planning shifts across five plans</li><li>About 30–45 minutes for one campaign</li><li>Progress stays in this browser</li></ul></div><figure class="hero-art"><img src="/assets/forge-blueprint.webp" width="512" height="768" fetchpriority="high" decoding="async" alt="A blueprint drawing of a small forge connected to a beacon tower."><figcaption>Match each order, choose reset tools, and finish the beacon.</figcaption></figure></section>${game()}<section id="how" class="how" tabindex="-1"><h2>How the forge works</h2><ol><li><b>Read the order.</b><span>Compare the starting stock, exact target, and slot bonuses.</span></li><li><b>Program the shift.</b><span>Choose two to six actions. Revise the projection before running it.</span></li><li><b>Choose each reset.</b><span>Solve every shift, pick one tool, and complete plan five.</span></li></ol></section><section class="limits"><h2>What the forge does not do</h2><p>It has no idle timers, offline income, or endless prestige layers. Progress changes only when you act.</p></section><section class="included"><h2>Complete campaign included</h2><p>$0. All five plans are available now. No checkout is required.</p></section></main>${footer()}<p class="sr" aria-live="polite">${notice}</p>`;
}
function simplePage(kind: 'privacy' | 'terms' | '404') {
  const data = kind === 'privacy' ? ['Privacy — Finite Forge', 'Privacy', 'Finite Forge stores campaign progress and settings in your browser. It sends no analytics or game data to another service.'] : kind === 'terms' ? ['Terms — Finite Forge', 'Terms', 'Finite Forge is a local browser game. The complete five-plan campaign is included without payment.'] : ['Not found — Finite Forge', 'This page is not in the forge.', 'Return to the forge board to continue your campaign.'];
  setPage(data[0], data[2]);
  return `${header()}<main id="main" tabindex="-1" class="document"><h1 tabindex="-1">${data[1]}</h1><p>${data[2]}</p>${kind === '404' ? '<a class="primary linkbutton" href="/" data-link>Return to the forge</a>' : ''}</main>${footer()}<p class="sr" aria-live="polite">${data[1]}</p>`;
}
function wire() {
  app.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach(anchor => anchor.addEventListener('click', event => { event.preventDefault(); nav(anchor.getAttribute('href')!); }));
  app.querySelector('[data-demo]')?.addEventListener('click', () => nav('/demo'));
  app.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => programAction(button.dataset.action as Action)));
  app.querySelector('[data-undo]')?.addEventListener('click', undoAction);
  app.querySelector('[data-submit]')?.addEventListener('click', fireShift);
  app.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(button => button.addEventListener('click', () => selectTool(button.dataset.tool as ToolId)));
  app.querySelector('[data-retry]')?.addEventListener('click', retry);
  app.querySelector('[data-reset-demo]')?.addEventListener('click', resetDemo);
  app.querySelector('[data-start-real]')?.addEventListener('click', startReal);
  app.querySelector('[data-new-campaign]')?.addEventListener('click', () => { save = fresh(); persist(); notice = 'A new five-plan campaign is ready.'; render(); });
  app.querySelector<HTMLButtonElement>('[data-settings]')?.addEventListener('click', () => { settingsOpen = !settingsOpen; render(); });
  app.querySelector<HTMLInputElement>('[data-motion]')?.addEventListener('change', event => { save.settings.motion = (event.target as HTMLInputElement).checked; persist(); render(); });
  app.querySelector<HTMLInputElement>('[data-sound]')?.addEventListener('change', event => { save.settings.sound = (event.target as HTMLInputElement).checked; persist(); render(); });
}
function focusRoute() { const target = location.hash ? document.querySelector<HTMLElement>(location.hash) : document.querySelector<HTMLElement>('h1'); if (target) requestAnimationFrame(() => { if (location.hash) target.scrollIntoView({ block: 'start' }); target.focus({ preventScroll: Boolean(location.hash) }); }); }
function render(moveFocus = false) { load(); lastInteraction = performance.now(); const path = location.pathname; app.innerHTML = path === '/' || path === '/demo' ? home() : path === '/privacy' ? simplePage('privacy') : path === '/terms' ? simplePage('terms') : simplePage('404'); wire(); if (moveFocus) focusRoute(); }
window.addEventListener('popstate', () => render(true));
document.querySelector<HTMLAnchorElement>('.skip')?.addEventListener('click', () => requestAnimationFrame(() => document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true })));
window.addEventListener('keydown', event => { const target = event.target as HTMLElement; if (!['/', '/demo'].includes(location.pathname) || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return; const keys: Record<string, Action> = { m: 'mine', s: 'shape', c: 'charge' }; const action = keys[event.key.toLowerCase()]; if (action) { event.preventDefault(); programAction(action); } if ((event.key === 'Backspace' || event.key === 'Delete') && save.campaign.program.length) { event.preventDefault(); undoAction(); } if (event.key === 'Enter' && save.campaign.status === 'active') { const challenge = challengeFor(save.campaign.plan, save.campaign.shift, save.campaign.owned); if (save.campaign.program.length === challenge.slots) { event.preventDefault(); fireShift(); } } });
let last = performance.now(); let accumulator = 0;
function loop(now: number) { const delta = Math.min(250, now - last); last = now; if (!document.hidden) { accumulator += delta; while (accumulator >= 1000 / 60) accumulator -= 1000 / 60; } requestAnimationFrame(loop); }
document.addEventListener('visibilitychange', () => { last = performance.now(); }); requestAnimationFrame(loop); render();
