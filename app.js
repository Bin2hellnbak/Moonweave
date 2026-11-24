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
document.querySelector('#filter-count').textContent = config.games.length;
const grid = document.querySelector('#game-grid');
function element(tag, className, text) { const node = document.createElement(tag); node.className = className; if (text) node.textContent = text; return node; }
config.games.forEach(game => {
  const url = new URL(game.url, location.href);
  if (!['https:', 'http:'].includes(url.protocol)) return;
  const card = element('article', 'game-card');
  const link = element('a', 'play-button', '▷  Play now');
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
  const tagValues = Array.isArray(game.tags) ? game.tags : (game.category ? [game.category] : []);
  const tags = [...new Set(tagValues.filter(tag => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean))];
  if (tags.length) {
    const tagList = element('ul', 'game-tags');
    tagList.setAttribute('aria-label', `${game.title} tags`);
    tags.forEach(tag => tagList.append(element('li', 'game-tag', tag)));
    body.append(tagList);
  }
  body.append(element('h3', 'game-title', game.title), element('p', 'game-description', game.description));
  const bottom = element('div', 'card-bottom');
  bottom.append(link, element('span', 'platform-note', 'Opens on Unity Play'));
  body.append(bottom); card.append(cover, body); grid.append(card);
  if (images.length > 1) createSlideshow(card, cover, images, game.title);
});

function createSlideshow(card, cover, images, title) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 4500;
  const manualDelay = 10000;
  let current = 0;
  let timer = null;
  let holdUntil = 0;
  let gesture = null;
  card.classList.add('has-slideshow');
  images.forEach(image => { image.draggable = false; });

  const controls = element('div', 'slideshow-controls');
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', `${title} screenshots`);
  for (const [direction, label, glyph] of [[-1, 'Previous', '‹'], [1, 'Next', '›']]) {
    const button = element('button', 'slideshow-arrow ' + (direction < 0 ? 'slideshow-prev' : 'slideshow-next'), glyph);
    button.type = 'button';
    button.setAttribute('aria-label', `${label} ${title} screenshot`);
    button.addEventListener('click', () => navigate(direction));
    controls.append(button);
  }
  // Screenshot navigation is separate from the Play now link.
  card.append(controls);

  function show(index) {
    const next = (index + images.length) % images.length;
    if (!images[next].complete || !images[next].naturalWidth) return;
    current = next;
    images.forEach((image, i) => {
      image.classList.toggle('is-active', i === current);
      image.setAttribute('aria-hidden', String(i !== current));
    });
  }
  function schedule() {
    clearTimeout(timer);
    timer = null;
    if (reducedMotion.matches || document.hidden || gesture) return;
    timer = setTimeout(() => {
      show(current + 1);
      schedule();
    }, Math.max(interval, holdUntil - Date.now()));
  }
  function navigate(direction) {
    show(current + direction);
    holdUntil = Date.now() + manualDelay;
    schedule();
  }
  cover.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !event.isPrimary) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    cover.setPointerCapture(event.pointerId);
    schedule();
  });
  cover.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      event.preventDefault();
      navigate(dx < 0 ? 1 : -1);
    } else schedule();
  });
  cover.addEventListener('pointercancel', () => { gesture = null; schedule(); });
  reducedMotion.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  schedule();
}
