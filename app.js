'use strict';
const config = window.MOONWEAVE;
const root = document.documentElement;
const themeOptions = ['dark', 'light', 'system'];
const accentOptions = ['purple', 'blue', 'rose'];
const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
const storageKey = 'moonweave.appearance.v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch {}
let theme = themeOptions.includes(saved.theme) ? saved.theme : config.defaultTheme;
let accent = accentOptions.includes(saved.accent) ? saved.accent : config.defaultAccent;
function applyAppearance() {
  root.dataset.theme = theme === 'system' ? (systemTheme.matches ? 'light' : 'dark') : theme;
  root.dataset.accent = accent;
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
  document.querySelectorAll('[data-accent-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.accentChoice === accent)));
  document.querySelector('meta[name="theme-color"]').content = root.dataset.theme === 'dark' ? '#100e18' : '#f7f5fc';
}
function saveAppearance() { try { localStorage.setItem(storageKey, JSON.stringify({theme, accent})); } catch {} }
applyAppearance();
systemTheme.addEventListener('change', applyAppearance);
document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => { theme = button.dataset.themeChoice; applyAppearance(); saveAppearance(); }));
document.querySelectorAll('[data-accent-choice]').forEach(button => button.addEventListener('click', () => { accent = button.dataset.accentChoice; applyAppearance(); saveAppearance(); }));
document.querySelector('#reset-appearance').addEventListener('click', () => { theme = config.defaultTheme; accent = config.defaultAccent; applyAppearance(); saveAppearance(); });
const toggle = document.querySelector('#appearance-toggle');
const panel = document.querySelector('#appearance-panel');
function closePanel() { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); });
document.addEventListener('click', event => { if (!panel.contains(event.target) && !toggle.contains(event.target)) closePanel(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { closePanel(); toggle.focus(); } });
document.querySelectorAll('[data-site-name]').forEach(element => { element.textContent = config.name; });
document.title = `${config.name} · A little space for games`;
document.querySelector('#site-intro').textContent = config.intro;
document.querySelector('#copyright').textContent = `© ${new Date().getFullYear()} ${config.name}`;
document.querySelector('#game-count').textContent = `${config.games.length} ${config.games.length === 1 ? 'game' : 'games'}`;
document.querySelector('#filter-count').textContent = config.games.length;
const grid = document.querySelector('#game-grid');
function element(tag, className, text) { const node = document.createElement(tag); node.className = className; if (text) node.textContent = text; return node; }
config.games.forEach(game => {
  const url = new URL(game.url, location.href);
  if (!['https:', 'http:'].includes(url.protocol)) return;
  const card = element('article', 'game-card');
  const link = element('a', 'game-link');
  link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `Play ${game.title} on ${game.platform} (opens in a new tab)`);
  const cover = element('div', 'game-cover');
  const screenshots = game.screenshots?.length ? game.screenshots : [{ src: game.cover, alt: `${game.title} game artwork` }];
  const images = screenshots.map((shot, index) => {
    const image = element('img', 'cover-image' + (screenshots.length > 1 ? ' slideshow-slide' + (index === 0 ? ' is-active' : '') : ''));
    image.src = shot.src; image.alt = shot.alt; image.width = 1280; image.height = 720;
    image.decoding = 'async';
    image.setAttribute('aria-hidden', String(index !== 0));
    cover.append(image);
    return image;
  });
  cover.append(element('span', 'cover-label', game.platform));
  const body = element('div', 'game-body');
  body.append(element('span', 'game-category', game.category), element('h3', 'game-title', game.title), element('p', 'game-description', game.description));
  const bottom = element('div', 'card-bottom');
  bottom.append(element('span', 'play-button', '▷  Play now'), element('span', 'platform-note', 'Opens on Unity Play'));
  body.append(bottom); link.append(cover, body); card.append(link); grid.append(card);
  if (images.length > 1) createSlideshow(card, cover, images, game.title);
});

function createSlideshow(card, cover, images, title) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let timer = null;
  card.classList.add('has-slideshow');
  const controls = element('div', 'slideshow-controls');
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', `${title} screenshots`);
  const pause = element('button', 'slideshow-pause');
  pause.type = 'button';
  const dots = element('div', 'slideshow-dots');
  const choices = images.map((image, index) => {
    const button = element('button', 'slideshow-dot');
    button.type = 'button';
    button.setAttribute('aria-label', `Show screenshot ${index + 1}: ${image.alt}`);
    button.addEventListener('click', () => { show(index); schedule(); });
    dots.append(button);
    return button;
  });
  controls.append(pause, dots);
  // Controls are siblings of the play link, keeping buttons out of the anchor.
  card.append(controls);
  function show(index) {
    if (!images[index].complete || !images[index].naturalWidth) return;
    current = index;
    images.forEach((image, i) => {
      image.classList.toggle('is-active', i === current);
      image.setAttribute('aria-hidden', String(i !== current));
      choices[i].setAttribute('aria-current', String(i === current));
    });
  }
  function schedule() {
    clearInterval(timer);
    timer = null;
    pause.textContent = paused ? 'Play slides' : 'Pause slides';
    pause.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${title} screenshot slideshow`);
    if (paused || hovered || focused || document.hidden) return;
    timer = setInterval(() => show((current + 1) % images.length), 4500);
  }
  pause.addEventListener('click', () => { paused = !paused; schedule(); });
  card.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  card.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  card.addEventListener('focusin', () => { focused = true; schedule(); });
  card.addEventListener('focusout', event => {
    if (!card.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  images[0].addEventListener('load', () => show(current), { once: true });
  choices[0].setAttribute('aria-current', 'true');
  schedule();
}
