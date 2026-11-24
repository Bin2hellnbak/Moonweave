'use strict';

// Local calendar dates, compared as UTC day numbers so DST cannot shorten a window.
function moonweaveEaster(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return new Date(year, Math.floor(n / 31) - 1, n % 31 + 1);
}

function moonweaveSeason(date = new Date()) {
  const day = d => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
  const today = day(date), year = date.getFullYear();
  for (const y of [year - 1, year, year + 1]) {
    for (const [name, holiday] of [
      ['christmas', new Date(y, 11, 25)],
      ['halloween', new Date(y, 9, 31)],
      ['easter', moonweaveEaster(y)]
    ]) {
      if (Math.abs(today - day(holiday)) <= 14) return name;
    }
  }
  return null;
}

(() => {
  const toggle = document.querySelector('#seasonal-toggle');
  const canvas = document.querySelector('#seasonal-background');
  if (!toggle || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) { toggle.disabled = true; return; }
  const storageKey = 'moonweave.seasonal.v1';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'off'; } catch {}
  let season = null, sprites = [], particles = [], width = 0, height = 0;
  let frame = null, last = 0, midnight = null;
  const random = (min, max) => min + Math.random() * (max - min);

  function sprite(kind, variant, light) {
    const sheet = document.createElement('canvas');
    sheet.width = sheet.height = 96;
    const c = sheet.getContext('2d');
    c.translate(48, 48);
    if (kind === 'christmas') {
      // Six branching arms, with a soft halo and a crisp crystalline centre.
      c.strokeStyle = light ? '#829dbb' : '#e4efff';
      c.shadowColor = light ? '#bbd2e8' : '#b8d4ff';
      c.shadowBlur = 5;
      c.lineWidth = 1.9;
      c.lineCap = 'round';
      for (let arm = 0; arm < 6; arm++) {
        c.save(); c.rotate(arm * Math.PI / 3);
        c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -29);
        for (const y of [-13, -21]) {
          const twig = variant % 2 ? 7 : 5;
          c.moveTo(-twig, y + 5); c.lineTo(0, y); c.lineTo(twig, y + 5);
        }
        c.stroke(); c.restore();
      }
      c.fillStyle = light ? '#a1b9d0' : '#f9fcff';
      c.beginPath(); c.arc(0, 0, 2.8, 0, Math.PI * 2); c.fill();
    } else if (kind === 'halloween') {
      // A lobed maple silhouette, with a central stem and fine branching veins.
      const colours = [['#eaa74f','#b14b38'],['#db7451','#863c40'],['#e9bd5a','#b77738'],['#d08a59','#914341']][variant % 4];
      const gradient = c.createLinearGradient(-18, -30, 22, 33);
      gradient.addColorStop(0, colours[0]); gradient.addColorStop(1, colours[1]);
      c.fillStyle = gradient; c.strokeStyle = colours[1]; c.lineWidth = 1;
      const leaf = new Path2D('M0,-36 L7,-20 L16,-27 L15,-11 L31,-17 L26,-2 L37,0 L22,14 L25,24 L8,21 L3,29 L0,40 L-3,29 L-8,21 L-25,24 L-22,14 L-37,0 L-26,-2 L-31,-17 L-15,-11 L-16,-27 L-7,-20 Z');
      c.fill(leaf); c.stroke(leaf);
      c.strokeStyle = '#6b3a3066'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(0, 33); c.lineTo(0, -27);
      for (const [x,y] of [[-23,6],[23,6],[-14,-12],[14,-12],[-17,19],[17,19]]) {
        c.moveTo(0, y + 11); c.lineTo(x, y);
      }
      c.stroke();
    } else {
      const colours = [['#c0a4ef','#8762c0'],['#f2b6c9','#c87a9d'],['#9bcfc5','#568e9c'],['#efd39a','#c69d58']][variant % 4];
      const egg = new Path2D('M0,-34 C17,-34 27,-8 27,9 C27,40 -27,40 -27,9 C-27,-8 -17,-34 0,-34 Z');
      c.save(); c.clip(egg);
      const gradient = c.createLinearGradient(-22, -20, 27, 28);
      gradient.addColorStop(0, colours[0]); gradient.addColorStop(1, colours[1]);
      c.fillStyle = gradient; c.fillRect(-40,-40,80,80);
      c.strokeStyle = '#fff4dfcc'; c.fillStyle = '#fff4dfcc'; c.lineWidth = 3;
      for (const y of [-12, 16]) {
        c.beginPath();
        for (let x = -32; x <= 32; x += 8) { const yy = y + (x % 16 === 0 ? 3 : -3); if (x === -32) c.moveTo(x,yy); else c.lineTo(x,yy); }
        c.stroke();
      }
      for (const x of [-15,0,15]) { c.beginPath(); c.arc(x,2,2.5,0,Math.PI*2); c.fill(); }
      const shine = c.createRadialGradient(-10,-17,1,-10,-17,21);
      shine.addColorStop(0,'#ffffff55'); shine.addColorStop(1,'#ffffff00');
      c.fillStyle = shine; c.fillRect(-35,-38,70,76); c.restore();
      c.strokeStyle = light ? '#9478a744' : '#ffffff33'; c.lineWidth = 1; c.stroke(egg);
    }
    return sheet;
  }

  function rebuild() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (!season || !enabled) return;
    const light = document.documentElement.dataset.theme === 'light';
    sprites = Array.from({length:4}, (_, i) => sprite(season, i, light));
    const snow = season === 'christmas';
    const count = Math.round(Math.min(width, 1600) / (snow ? 19 : 53));
    particles = Array.from({length:Math.max(snow ? 24 : 9, count)}, () => {
      const depth = Math.random();
      return {x:random(-30,width+30), y:random(-40,height+40), size:snow?random(6,19):random(24,43),
        speed:(snow?10:12)+depth*(snow?20:14), drift:random(-4,5), phase:random(0,Math.PI*2),
        rotation:random(0,Math.PI*2), spin:random(-.35,.35), opacity:(snow?.24:.28)+depth*.34,
        depth, sprite:Math.floor(random(0,4)), time:random(0,20)};
    });
  }

  function draw(delta) {
    ctx.clearRect(0,0,width,height);
    for (const p of particles) {
      p.time += delta;
      p.y += p.speed * delta; p.x += p.drift * delta; p.rotation += p.spin * delta;
      if (p.y > height + 50) { p.y = -50; p.x = random(-20,width+20); }
      if (p.x < -70) p.x = width + 50;
      if (p.x > width + 70) p.x = -50;
      const sway = Math.sin(p.time * (season==='christmas'?.45:.7) + p.phase) * (season==='christmas'?12:25);
      const tumble = season==='halloween' ? .55 + Math.abs(Math.cos(p.time*.55+p.phase))*.45 : 1;
      ctx.save(); ctx.globalAlpha = p.opacity;
      ctx.translate(p.x+sway,p.y); ctx.rotate(p.rotation); ctx.scale(tumble,1);
      ctx.drawImage(sprites[p.sprite],-p.size/2,-p.size/2,p.size,p.size); ctx.restore();
    }
  }
  function stop() { if (frame !== null) cancelAnimationFrame(frame); frame = null; last = 0; }
  function animate(now) {
    draw(last ? Math.min((now-last)/1000,.05) : 0); last = now;
    frame = requestAnimationFrame(animate);
  }
  function refresh() {
    stop(); season = moonweaveSeason();
    toggle.setAttribute('aria-checked',String(enabled));
    const active = enabled && !!season;
    canvas.hidden = !active;
    document.documentElement.dataset.season = active ? season : 'none';
    rebuild();
    if (active && !document.hidden) {
      if (motion.matches) draw(0); else frame = requestAnimationFrame(animate);
    }
    clearTimeout(midnight);
    const now = new Date();
    midnight = setTimeout(refresh,new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)-now+100);
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(storageKey,enabled?'on':'off'); } catch {}
    refresh();
  });
  document.querySelector('#reset-appearance').addEventListener('click', () => {
    enabled = true;
    try { localStorage.removeItem(storageKey); } catch {}
    refresh();
  });
  window.addEventListener('resize',refresh);
  document.addEventListener('visibilitychange',refresh);
  motion.addEventListener('change',refresh);
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-accent']});
  refresh();
})();

