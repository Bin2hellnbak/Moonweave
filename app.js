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
  const image = element('img', 'cover-image'); image.src = game.cover; image.alt = `${game.title} game artwork`; image.width = 1799; image.height = 995;
  cover.append(image, element('span', 'cover-label', game.platform));
  const body = element('div', 'game-body');
  body.append(element('span', 'game-category', game.category), element('h3', 'game-title', game.title), element('p', 'game-description', game.description));
  const bottom = element('div', 'card-bottom');
  bottom.append(element('span', 'play-button', '▷  Play now'), element('span', 'platform-note', 'Opens on Unity Play'));
  body.append(bottom); link.append(cover, body); card.append(link); grid.append(card);
});
