import './style.css';
import './illustration.css';
import { act, chooseTool, newRun, tools, type Resource, type ToolId } from './engine';

type Save = {
  owned: ToolId[];
  run: Resource;
  settings: { motion: boolean; sound: boolean };
  resetReady: boolean;
  complete: boolean;
};

const realKey = 'finite-forge:v1';
const demoKey = 'demo:finite-forge:v1';
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
  return { owned: [], run: newRun([]), settings: { motion: true, sound: false }, resetReady: false, complete: false };
}

function sample(): Save {
  return {
    owned: ['bellows', 'pattern'],
    run: { ...newRun(['bellows', 'pattern']), ore: 2, parts: 2, charge: 2, tick: 6 },
    settings: { motion: true, sound: false },
    resetReady: false,
    complete: false
  };
}

function validSave(value: unknown): value is Save {
  const candidate = value as Partial<Save> | null;
  return Boolean(candidate?.run && Array.isArray(candidate.owned) && candidate.settings);
}

function load() {
  demo = isDemoRoute();
  const key = demo ? demoKey : realKey;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    save = validSave(parsed) ? parsed : (demo ? sample() : fresh());
    save.settings = { motion: save.settings.motion !== false, sound: save.settings.sound === true };
    if (!validSave(parsed)) localStorage.setItem(key, JSON.stringify(save));
  } catch {
    save = demo ? sample() : fresh();
    notice = 'Saved progress could not be read. A new forge plan is ready.';
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
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!;
  canonical.href = `https://finite-forge.sociobot.in${demo ? '/demo' : location.pathname}`;
}

function action(kind: 'mine' | 'shape' | 'charge') {
  const before = save.run;
  save.run = act(save.run, kind, save.owned);
  if (save.run === before) return;
  actionPulse += 1;
  playCue();
  if (save.run.completed) {
    save.resetReady = true;
    notice = save.owned.length === 4
      ? 'The fifth plan is ready for its final beacon.'
      : 'Beacon charged. Choose one tool for your next plan.';
  }
  if (save.run.failed) notice = 'Sunset arrived. Revise this plan without gaining a tool.';
  persist();
  render();
}

function playCue() {
  if (!save.settings.sound) return;
  try {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = 440;
    gain.gain.setValueAtTime(0.03, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.07);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.07);
    const count = (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount || 0;
    (window as Window & { __finiteForgeSoundCount?: number }).__finiteForgeSoundCount = count + 1;
  } catch {
    notice = 'Sound cues are unavailable in this browser. The forge still plays normally.';
  }
}

function resetRun() {
  if (!save.resetReady && !save.run.failed) return;
  if (save.run.failed) {
    save.run = newRun(save.owned);
    save.resetReady = false;
    notice = 'Plan restarted. Complete it to earn the next tool.';
  } else if (save.owned.length === 4) {
    save.complete = true;
    notice = 'Final beacon lit. The five-plan campaign is complete.';
  } else {
    const tool = chooseTool(save.owned);
    if (tool) save.owned.push(tool);
    save.run = newRun(save.owned);
    save.resetReady = false;
    notice = `${tool ? tools[tool].name : 'Your current tools'} marked for the next plan.`;
  }
  persist();
  render();
}

function resetDemo() {
  localStorage.removeItem(demoKey);
  save = sample();
  notice = 'Sample forge restored at plan three.';
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
  return `<footer><p>A five-plan browser forge with a final beacon.</p><p><a href="/privacy" data-link>Privacy</a> · <a href="/terms" data-link>Terms</a> · Built by Param Factory · v1.1.0</p><p>Blueprint illustration uses original generated imagery.</p></footer>`;
}

function demoBanner() {
  return demo ? `<aside class="demo" role="status"><b>Demo — sample data, nothing is saved</b><span>Plan three starts partly stocked.</span><button data-reset-demo>Reset demo</button><button data-start-real>Start for real</button></aside>` : '';
}

function game() {
  const s = save.run;
  const goal = 6;
  const left = Math.max(0, s.deadline - s.tick);
  const status = save.complete ? 'Campaign complete' : s.completed ? 'Beacon ready' : s.failed ? 'Sunset reached' : `${left} ticks before sunset`;
  const locked = save.complete ? 'complete' : s.completed || s.failed ? 'between' : '';
  const motionClass = save.settings.motion ? `motion-on pulse-${actionPulse % 2}` : 'motion-off';
  return `<section class="game-shell ${locked} ${motionClass}" aria-label="Forge board"><div class="board-title"><p>RUN ${String(save.owned.length + 1).padStart(2, '0')} · ${status}</p><button class="quiet" data-settings aria-expanded="${settingsOpen}">Settings</button></div>
  <div class="blueprint" aria-label="Production blueprint"><div class="station ore"><span>01</span><b>ORE</b><em>${s.ore}</em></div><div class="line"></div><div class="station parts"><span>02</span><b>PARTS</b><em>${s.parts}</em></div><div class="line"></div><div class="station charge"><span>03</span><b>CHARGE</b><em>${Math.min(s.charge, goal)}/${goal}</em></div><div class="beacon ${s.completed || save.complete ? 'lit' : ''}" aria-label="Beacon ${s.completed || save.complete ? 'charged' : 'unlit'}"><i></i><b>BEACON</b></div></div>
  <div class="controls" aria-label="Production controls"><button data-action="mine" ${locked ? 'disabled' : ''}><kbd>M</kbd> Mine ore <small>+${save.owned.includes('bellows') ? 2 : 1}</small></button><button data-action="shape" ${locked ? 'disabled' : ''}><kbd>S</kbd> Shape parts <small>ore → +${save.owned.includes('pattern') ? 2 : 1}</small></button><button data-action="charge" ${locked ? 'disabled' : ''}><kbd>C</kbd> Charge beacon <small>part → +${save.owned.includes('lens') ? 2 : 1}</small></button></div>
  <p class="tickline"><b>${s.tick}</b> / ${s.deadline} production ticks used. Each action takes one tick.</p>
  ${s.completed || s.failed || save.complete ? endPanel() : ''}<div class="settings" ${settingsOpen ? '' : 'hidden'}><label><input type="checkbox" data-motion ${save.settings.motion ? 'checked' : ''}> Show board motion</label><label><input type="checkbox" data-sound ${save.settings.sound ? 'checked' : ''}> Enable sound cues</label></div></section>`;
}

function endPanel() {
  if (save.complete) return `<section class="end-panel"><h2>Final beacon lit</h2><p>You completed five forge plans. This campaign ends here.</p><button data-new-campaign>Start a new campaign</button></section>`;
  const next = chooseTool(save.owned);
  if (save.run.failed) return `<section class="end-panel"><h2>Revise this plan</h2><p>A lost plan earns no tool. Start the same plan with the tools you already marked.</p><button class="primary" data-reset>Try this plan again</button></section>`;
  if (save.owned.length === 4) return `<section class="end-panel"><h2>Light the final beacon</h2><p>This is your fifth completed plan. Finish the campaign.</p><button class="primary" data-reset>Light the final beacon</button></section>`;
  return `<section class="end-panel"><h2>Reset with one new tool</h2><p>Your next plan adds ${next ? tools[next].name : 'a tool'}: ${next ? tools[next].note : ''}</p><button class="primary" data-reset>Reset the forge</button></section>`;
}

function home() {
  setPage(demo ? 'Demo — Finite Forge' : 'Finite Forge — Plan short forge runs', demo ? 'A seeded, isolated sample of the five-plan forge campaign.' : 'Plan five short forge runs, earn four tools, and light a final beacon.');
  return `${header()}${demoBanner()}<main id="main" tabindex="-1"><section class="intro"><div><p class="eyebrow">A finite incremental game</p><h1 tabindex="-1">Build a beacon before sunset.</h1><p class="lede">For reset fans who want one complete campaign on a phone.</p><div class="hero-actions"><button class="primary" data-demo>Try it with sample data</button><span>Loads plan three with stocked materials.</span></div><ul class="facts"><li>24 visible production ticks</li><li>Progress stays in this browser</li><li>Five plans, 63 actions on the shortest path</li></ul></div><figure class="hero-art"><img src="/assets/forge-blueprint.webp" width="512" height="768" fetchpriority="high" decoding="async" alt="A blueprint drawing of a small forge connected to a beacon tower."><figcaption>Plan each production tick. The beacon ends the campaign.</figcaption></figure></section>${game()}<section id="how" class="how" tabindex="-1"><h2>How the forge works</h2><ol><li><b>Make six charges.</b><span>Mine ore, shape parts, then charge the beacon.</span></li><li><b>Reset with one tool.</b><span>Each completed plan adds one useful tool.</span></li><li><b>Light the final beacon.</b><span>Four tools lead into a fifth final plan.</span></li></ol></section><section class="limits"><h2>What the forge does not do</h2><p>It has no offline income or endless prestige layers. Your progress is stored only in this browser.</p></section><section class="included"><h2>Complete campaign included</h2><p>$0. All five plans are available now. No checkout is required.</p></section></main>${footer()}<p class="sr" aria-live="polite">${notice}</p>`;
}

function simplePage(kind: 'privacy' | 'terms' | '404') {
  const data = kind === 'privacy'
    ? ['Privacy — Finite Forge', 'Privacy', 'Finite Forge stores game progress and settings in your browser. It sends no analytics or game data to another service.']
    : kind === 'terms'
      ? ['Terms — Finite Forge', 'Terms', 'Finite Forge is a local browser game. The complete five-plan campaign is included without payment.']
      : ['Not found — Finite Forge', 'This page is not in the forge.', 'Return to the forge board to continue your campaign.'];
  setPage(data[0], data[2]);
  return `${header()}<main id="main" tabindex="-1" class="document"><h1 tabindex="-1">${data[1]}</h1><p>${data[2]}</p>${kind === '404' ? '<a class="primary linkbutton" href="/" data-link>Return to the forge</a>' : ''}</main>${footer()}<p class="sr" aria-live="polite">${data[1]}</p>`;
}

function wire() {
  app.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach(anchor => anchor.addEventListener('click', event => {
    event.preventDefault();
    nav(anchor.getAttribute('href')!);
  }));
  app.querySelector('[data-demo]')?.addEventListener('click', () => nav('/demo'));
  app.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => action(button.dataset.action as 'mine' | 'shape' | 'charge')));
  app.querySelector('[data-reset]')?.addEventListener('click', resetRun);
  app.querySelector('[data-reset-demo]')?.addEventListener('click', resetDemo);
  app.querySelector('[data-start-real]')?.addEventListener('click', startReal);
  app.querySelector('[data-new-campaign]')?.addEventListener('click', () => { save = fresh(); persist(); notice = 'A new five-plan campaign is ready.'; render(); });
  app.querySelector<HTMLButtonElement>('[data-settings]')?.addEventListener('click', () => { settingsOpen = !settingsOpen; render(); });
  app.querySelector<HTMLInputElement>('[data-motion]')?.addEventListener('change', event => { save.settings.motion = (event.target as HTMLInputElement).checked; persist(); render(); });
  app.querySelector<HTMLInputElement>('[data-sound]')?.addEventListener('change', event => { save.settings.sound = (event.target as HTMLInputElement).checked; persist(); render(); });
}

function focusRoute() {
  const target = location.hash ? document.querySelector<HTMLElement>(location.hash) : document.querySelector<HTMLElement>('h1');
  if (!target) return;
  requestAnimationFrame(() => {
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
document.querySelector<HTMLAnchorElement>('.skip')?.addEventListener('click', () => {
  requestAnimationFrame(() => document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true }));
});
window.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if (!['/', '/demo'].includes(location.pathname) || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
  const keys: Record<string, 'mine' | 'shape' | 'charge'> = { m: 'mine', s: 'shape', c: 'charge' };
  const actionName = keys[event.key.toLowerCase()];
  if (actionName) {
    event.preventDefault();
    action(actionName);
  }
});

let last = performance.now();
let accumulator = 0;
function loop(now: number) {
  const delta = Math.min(250, now - last);
  last = now;
  if (!document.hidden) {
    accumulator += delta;
    while (accumulator >= 1000 / 60) accumulator -= 1000 / 60;
  }
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => { last = performance.now(); });
requestAnimationFrame(loop);
render();
