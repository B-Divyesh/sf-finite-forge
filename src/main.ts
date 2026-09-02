import './style.css';
import './illustration.css';
import {
  PRODUCTION_TICKS,
  RUN_COUNT,
  actionNames,
  actionYield,
  act,
  chooseTool,
  newCampaign,
  newRun,
  progressPercent,
  retryRun,
  runGoals,
  sunBonusAt,
  ticksRemaining,
  tools,
  type Action,
  type Campaign,
  type ToolId
} from './engine';

type Settings = { motion: boolean; sound: boolean };
type Save = { campaign: Campaign; settings: Settings };

const realKey = 'finite-forge:v3';
const demoKey = 'demo:finite-forge:v3';
const app = document.querySelector<HTMLDivElement>('#app')!;
let demo = isDemoRoute();
let save: Save;
let notice = '';
let settingsOpen = false;
let actionPulse = 0;
let audioContext: AudioContext | undefined;

function isDemoRoute() {
  return location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
}

function fresh(): Save {
  return { campaign: newCampaign(), settings: { motion: true, sound: false } };
}

function sample(): Save {
  const campaign = {
    ...newRun(3, ['bellows', 'pattern'], 2, 43),
    tick: 7,
    totalTicks: 50,
    stock: { ore: 4, parts: 3, charge: 5 }
  };
  return { campaign, settings: { motion: true, sound: false } };
}

function validSave(value: unknown): value is Save {
  const candidate = value as Partial<Save> | null;
  const campaign = candidate?.campaign as Partial<Campaign> | undefined;
  const validTools = new Set(Object.keys(tools));
  const validStatuses = new Set(['active', 'run-complete', 'failed', 'campaign-complete']);
  return Boolean(
    campaign
    && Number.isInteger(campaign.run) && Number(campaign.run) >= 1 && Number(campaign.run) <= RUN_COUNT
    && Number.isInteger(campaign.tick) && Number(campaign.tick) >= 0 && Number(campaign.tick) <= PRODUCTION_TICKS
    && campaign.deadline === PRODUCTION_TICKS
    && campaign.goal === runGoals[Number(campaign.run) - 1]
    && campaign.stock && Number(campaign.stock.ore) >= 0 && Number(campaign.stock.parts) >= 0 && Number(campaign.stock.charge) >= 0
    && Array.isArray(campaign.owned) && campaign.owned.every(tool => validTools.has(tool))
    && validStatuses.has(String(campaign.status))
    && Number.isInteger(campaign.completedRuns) && Number(campaign.completedRuns) >= 0 && Number(campaign.completedRuns) < RUN_COUNT
    && Number.isInteger(campaign.totalTicks) && Number(campaign.totalTicks) >= 0
    && candidate?.settings
  );
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
    localStorage.setItem(key, JSON.stringify(save));
    notice = 'Saved progress could not be read. A new forge run is ready.';
  }
}

function persist() {
  localStorage.setItem(demo ? demoKey : realKey, JSON.stringify(save));
}

function nav(path: string) {
  history.pushState({}, '', path);
  render(true);
}

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
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.07);
    const host = window as Window & { __finiteForgeSoundCount?: number };
    host.__finiteForgeSoundCount = (host.__finiteForgeSoundCount || 0) + 1;
  } catch {
    notice = 'Sound cues are unavailable. The forge still plays normally.';
  }
}

function produce(action: Action) {
  const before = save.campaign;
  if (before.status !== 'active') return;
  const missingMaterial = (action === 'shape' && before.stock.ore === 0) || (action === 'charge' && before.stock.parts === 0);
  save.campaign = act(before, action);
  actionPulse += 1;
  if (save.campaign.status === 'campaign-complete') notice = 'Final beacon lit before sunset. The campaign is complete.';
  else if (save.campaign.status === 'run-complete') notice = `Beacon charged with ${ticksRemaining(save.campaign)} ticks left. Choose one reset tool.`;
  else if (save.campaign.status === 'failed') notice = 'Sunset reached at tick 24. Retry this run with the same tools.';
  else if (missingMaterial) notice = `${actionNames[action]} needed material. The production tick was still used.`;
  else notice = `${actionNames[action]} completed. ${ticksRemaining(save.campaign)} ticks remain.`;
  playCue(save.campaign.status === 'run-complete' || save.campaign.status === 'campaign-complete');
  persist();
  render();
}

function selectTool(tool: ToolId) {
  save.campaign = chooseTool(save.campaign, tool);
  notice = `${tools[tool].name} added. Run ${save.campaign.run} starts with 24 ticks.`;
  persist();
  render();
}

function retry() {
  save.campaign = retryRun(save.campaign);
  notice = `Run ${save.campaign.run} restarted at sunrise. No tool was earned.`;
  persist();
  render();
}

function resetDemo() {
  localStorage.removeItem(demoKey);
  save = sample();
  notice = 'Sample forge restored in run three.';
  persist();
  render();
}

function startReal() {
  localStorage.removeItem(demoKey);
  nav('/');
}

function header() {
  return `<header><a class="wordmark" href="/" data-link>FINITE<br><b>FORGE</b></a><nav aria-label="Primary"><a href="/demo" data-link>Demo</a><a href="/#how" data-link>How it works</a><a href="/privacy" data-link>Privacy</a></nav></header>`;
}

function footer() {
  return `<footer><p>A five-run strategy forge with a sunset deadline.</p><p><a href="/privacy" data-link>Privacy</a> · <a href="/terms" data-link>Terms</a> · Built by Param Factory · v3.0.0</p><p>Blueprint illustration uses original generated imagery.</p></footer>`;
}

function demoBanner() {
  return demo ? `<aside class="demo" role="status"><b>Demo — sample data, nothing is saved</b><span>Run three starts stocked with two tools.</span><button data-reset-demo>Reset demo</button><button data-start-real>Start for real</button></aside>` : '';
}

function toolList() {
  if (!save.campaign.owned.length) return '<p class="no-tools">No reset tools yet.</p>';
  return `<ul class="tool-list">${save.campaign.owned.map(id => `<li><b>${tools[id].name}</b><span>${tools[id].note}</span></li>`).join('')}</ul>`;
}

function deadline() {
  const campaign = save.campaign;
  const remaining = ticksRemaining(campaign);
  const marks = Array.from({ length: PRODUCTION_TICKS }, (_, tick) => `<i class="${tick < campaign.tick ? 'spent' : tick === campaign.tick && campaign.status === 'active' ? 'now' : ''}"></i>`).join('');
  return `<section class="deadline ${remaining <= 6 ? 'urgent' : ''}" aria-label="Sunset deadline: ${remaining} of ${PRODUCTION_TICKS} production ticks remain"><div><p class="section-label">Sunset deadline</p><strong>${remaining} ticks left</strong></div><progress max="${PRODUCTION_TICKS}" value="${campaign.tick}">${campaign.tick} of ${PRODUCTION_TICKS} ticks used</progress><div class="tick-track" aria-hidden="true">${marks}</div><p><b>${campaign.tick} / ${PRODUCTION_TICKS}</b> production ticks used. Every action spends one tick.</p></section>`;
}

function resources() {
  const { stock, goal } = save.campaign;
  return `<div class="resource-grid" aria-label="Current stock: ${stock.ore} ore, ${stock.parts} parts, ${stock.charge} of ${goal} beacon charge"><div><span>Ore</span><b>${stock.ore}</b></div><div><span>Parts</span><b>${stock.parts}</b></div><div class="charge"><span>Beacon charge</span><b>${Math.min(stock.charge, goal)} / ${goal}</b></div></div>`;
}

function forecast() {
  const campaign = save.campaign;
  const count = Math.min(6, ticksRemaining(campaign));
  const rows = Array.from({ length: count }, (_, offset) => {
    const tick = campaign.tick + offset;
    const action = sunBonusAt(campaign.run, tick);
    return `<li class="${offset === 0 ? 'current' : ''}"><span>Tick ${tick + 1}</span><b>${actionNames[action]} +1</b></li>`;
  }).join('');
  return `<section class="forecast" aria-labelledby="forecast-title"><div><p class="section-label">Daylight forecast</p><h3 id="forecast-title">Use the sunlit station for +1</h3></div><ol>${rows}</ol></section>`;
}

function activeBoard() {
  const campaign = save.campaign;
  return `${deadline()}${resources()}${forecast()}<div class="controls" aria-label="Production controls"><button data-action="mine"><kbd>M</kbd><span>Mine ore<small>+${actionYield(campaign, 'mine')} ore</small></span></button><button data-action="shape"><kbd>S</kbd><span>Shape parts<small>1 ore → +${actionYield(campaign, 'shape')} parts</small></span></button><button data-action="charge"><kbd>C</kbd><span>Charge beacon<small>1 part → +${actionYield(campaign, 'charge')} charge</small></span></button></div><p class="production-note">A missing input still spends the tick. Read the next six sunlight bonuses before acting.</p>`;
}

function endPanel() {
  const campaign = save.campaign;
  if (campaign.status === 'campaign-complete') return `<section class="end-panel"><h2>Final beacon lit</h2><p>You charged five beacons before sunset. This campaign ends here.</p><dl><div><dt>Runs complete</dt><dd>5 / 5</dd></div><div><dt>Production ticks</dt><dd>${campaign.totalTicks}</dd></div></dl><button class="primary" data-new-campaign>Start a new campaign</button></section>`;
  if (campaign.status === 'failed') return `<section class="end-panel danger"><h2>Sunset reached</h2><p>The beacon reached ${campaign.stock.charge} of ${campaign.goal} charge when tick 24 ended.</p><button class="primary" data-retry>Retry this run</button></section>`;
  if (campaign.status === 'run-complete') return `<section class="end-panel"><h2>Choose one reset tool</h2><p>The next beacon needs more charge. Pick one tool before the next sunrise.</p><div class="tool-choices">${(Object.keys(tools) as ToolId[]).filter(id => !campaign.owned.includes(id)).map(id => `<button data-tool="${id}"><b>${tools[id].name}</b><span>${tools[id].note}</span></button>`).join('')}</div></section>`;
  return '';
}

function game() {
  const campaign = save.campaign;
  const completed = campaign.completedRuns + Number(campaign.status === 'run-complete' || campaign.status === 'campaign-complete');
  const motionClass = save.settings.motion ? `motion-on pulse-${actionPulse % 2}` : 'motion-off';
  const state = campaign.status === 'active' ? `${ticksRemaining(campaign)} TICKS TO SUNSET` : campaign.status.replace('-', ' ').toUpperCase();
  return `<section class="game-shell ${motionClass}" aria-label="Forge production board"><div class="board-title"><div><h2>RUN ${String(campaign.run).padStart(2, '0')} · ${state}</h2><p>Charge target: ${campaign.goal}</p></div><button class="quiet" data-settings aria-expanded="${settingsOpen}">Settings</button></div><div class="campaign-progress"><progress value="${progressPercent(campaign)}" max="100" aria-label="Campaign ${progressPercent(campaign)} percent complete"></progress><b>${completed}/${RUN_COUNT} runs complete</b></div>${campaign.status === 'active' ? activeBoard() : `${deadline()}${resources()}${endPanel()}`}<section class="toolbox"><h3>Reset tools</h3>${toolList()}</section><div class="settings" ${settingsOpen ? '' : 'hidden'}><label><input type="checkbox" data-motion ${save.settings.motion ? 'checked' : ''}> Show board motion</label><label><input type="checkbox" data-sound ${save.settings.sound ? 'checked' : ''}> Enable sound cues</label></div></section>`;
}

function home() {
  setPage(demo ? 'Demo — Finite Forge' : 'Finite Forge — Build a beacon before sunset', demo ? 'Play a stocked, isolated forge run with a 24-tick sunset deadline.' : 'Build five beacons with 24 production ticks per run before sunset.');
  return `${header()}${demoBanner()}<main id="main" tabindex="-1"><section class="intro"><div><p class="eyebrow">A finite strategy game</p><h1 tabindex="-1">Build a beacon before sunset.</h1><p class="lede">For reset fans who want a complete campaign with a deadline.</p><div class="hero-actions"><button class="primary" data-demo>Try it with sample data</button><span>Opens run three with stock and two tools.</span></div><ul class="facts"><li>24 production ticks per run</li><li>Five runs with a final ending</li><li>Progress stays in this browser</li></ul></div><figure class="hero-art"><img src="/assets/forge-blueprint.webp" width="512" height="768" fetchpriority="high" decoding="async" alt="A blueprint drawing of a small forge connected to a beacon tower."><figcaption>Use the daylight forecast, choose reset tools, and beat sunset.</figcaption></figure></section>${game()}<section id="how" class="how" tabindex="-1"><h2>How the forge works</h2><ol><li><b>Read the daylight.</b><span>The sunlit station makes one extra unit on that tick.</span></li><li><b>Charge before tick 24.</b><span>Mine ore, shape parts, and charge the beacon before sunset.</span></li><li><b>Choose each reset.</b><span>Keep one new tool, then build the fifth and final beacon.</span></li></ol></section><section class="limits"><h2>What the forge does not do</h2><p>It has no idle timers, offline income, or endless prestige layers. Progress changes only when you act.</p></section><section class="included"><h2>Complete campaign included</h2><p>$0. All five runs are available now. No checkout is required.</p></section></main>${footer()}<p class="sr" aria-live="polite">${notice}</p>`;
}

function simplePage(kind: 'privacy' | 'terms' | '404') {
  const data = kind === 'privacy'
    ? ['Privacy — Finite Forge', 'Privacy', 'Finite Forge stores campaign progress and settings in your browser. It sends no analytics or game data to another service.']
    : kind === 'terms'
      ? ['Terms — Finite Forge', 'Terms', 'Finite Forge is a local browser game. The complete five-run campaign is included without payment.']
      : ['Not found — Finite Forge', 'This page is not in the forge.', 'Return to the forge board to continue your campaign.'];
  setPage(data[0], data[2]);
  return `${header()}<main id="main" tabindex="-1" class="document"><h1 tabindex="-1">${data[1]}</h1><p>${data[2]}</p>${kind === '404' ? '<a class="primary linkbutton" href="/" data-link>Return to the forge</a>' : ''}</main>${footer()}<p class="sr" aria-live="polite">${data[1]}</p>`;
}

function wire() {
  app.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach(anchor => anchor.addEventListener('click', event => { event.preventDefault(); nav(anchor.getAttribute('href')!); }));
  app.querySelector('[data-demo]')?.addEventListener('click', () => nav('/demo'));
  app.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => produce(button.dataset.action as Action)));
  app.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(button => button.addEventListener('click', () => selectTool(button.dataset.tool as ToolId)));
  app.querySelector('[data-retry]')?.addEventListener('click', retry);
  app.querySelector('[data-reset-demo]')?.addEventListener('click', resetDemo);
  app.querySelector('[data-start-real]')?.addEventListener('click', startReal);
  app.querySelector('[data-new-campaign]')?.addEventListener('click', () => { save = fresh(); persist(); notice = 'A new campaign is ready at sunrise.'; render(); });
  app.querySelector<HTMLButtonElement>('[data-settings]')?.addEventListener('click', () => { settingsOpen = !settingsOpen; render(); });
  app.querySelector<HTMLInputElement>('[data-motion]')?.addEventListener('change', event => { save.settings.motion = (event.target as HTMLInputElement).checked; persist(); render(); });
  app.querySelector<HTMLInputElement>('[data-sound]')?.addEventListener('change', event => { save.settings.sound = (event.target as HTMLInputElement).checked; persist(); render(); });
}

function focusRoute() {
  const target = location.hash ? document.querySelector<HTMLElement>(location.hash) : document.querySelector<HTMLElement>('h1');
  if (target) requestAnimationFrame(() => {
    if (location.hash) target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: Boolean(location.hash) });
  });
}

function render(moveFocus = false) {
  load();
  const path = location.pathname;
  app.innerHTML = path === '/' || path === '/demo' ? home() : path === '/privacy' ? simplePage('privacy') : path === '/terms' ? simplePage('terms') : simplePage('404');
  wire();
  if (moveFocus) focusRoute();
}

window.addEventListener('popstate', () => render(true));
document.querySelector<HTMLAnchorElement>('.skip')?.addEventListener('click', () => requestAnimationFrame(() => document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true })));
window.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if (!['/', '/demo'].includes(location.pathname) || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
  const keys: Record<string, Action> = { m: 'mine', s: 'shape', c: 'charge' };
  const action = keys[event.key.toLowerCase()];
  if (action) {
    event.preventDefault();
    produce(action);
  }
});

let lastFrame = performance.now();
let accumulator = 0;
function loop(now: number) {
  const delta = Math.min(100, now - lastFrame);
  lastFrame = now;
  if (!document.hidden) {
    accumulator += delta;
    while (accumulator >= 1000 / 60) accumulator -= 1000 / 60;
  }
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => { lastFrame = performance.now(); accumulator = 0; });
requestAnimationFrame(loop);
render();
