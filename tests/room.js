/* ==========================================================
   Renderiza salas a PNG para revisar la composición (realismo y proporciones).
   Uso:  node tests/room.js 2-1 [3-4 …|5|all] [--out carpeta] [--debug] [--movil]
   - Sin --debug: la sala tal como la ve el jugador al entrar (escritorio, sala grande).
   - Con --debug: además una segunda imagen «-debug» con la línea del suelo, la caja y la base
     de cada objeto (incluidos los que aparecen más tarde, en discontinua), su id y los cm reales
     que representa según tests/scale-catalog.js.
   - Con --movil: también la vista de un móvil (390×844) tal como entra el jugador.
   ========================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const M = require('./scale-model');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const OUT = path.resolve(opt('--out') || path.join(ROOT, 'shots', 'rooms'));
const DEBUG = argv.includes('--debug');
const MOVIL = argv.includes('--movil');
const sel = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');
let CAT = {};
try { CAT = require('./scale-catalog'); } catch (e) { /* sin catálogo */ }
for (const f of fs.readdirSync(__dirname).filter((x) => /^scale-catalog-.+.js$/.test(x))) Object.assign(CAT, require('./' + f));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      fs.readFile(path.join(ROOT, p), (e, d) => {
        if (e) { r.writeHead(404); return r.end('404'); }
        r.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
        r.end(d);
      });
    }).listen(0, () => resolve(srv));
  });
}

const PREP = () => {
  try {
    localStorage.setItem('roomescapespain.consent.v1', JSON.stringify({ v: 1, analytics: false, date: Date.now() }));
    localStorage.setItem('roomescapespain.meta.v2', JSON.stringify({ v: 2, progress: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10 }, done: { 1: true, 2: true, 3: true, 4: true }, muted: true, last: null, ui: { panned: true, tips: { room: 1, give: 1, select: 1, queue: 1 } } }));
    sessionStorage.setItem('roomescapespain.panhint', '1');
  } catch (e) { /* nada */ }
};

async function waitImages(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.querySelectorAll('#scene img')];
    await Promise.all(imgs.map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
  });
}

(async () => {
  // Lista de salas
  global.window = {};
  const ld = (f) => new Function('window', 'document', fs.readFileSync(path.join(ROOT, f), 'utf8'))(global.window, undefined);
  ld('js/emoji-data.js'); ld('js/core.js');
  fs.readdirSync(path.join(ROOT, 'js/seasons')).filter((f) => /^s\d+\.js$/.test(f)).sort().forEach((f) => ld('js/seasons/' + f));
  const all = []; window.SEASONS.filter(Boolean).forEach((s) => s.levels.forEach((_, i) => all.push([s.id, i + 1])));
  const rooms = (!sel.length || sel.includes('all')) ? all : all.filter(([s, n]) => sel.includes(String(s)) || sel.includes(`${s}-${n}`));
  if (!rooms.length) { console.log('Ninguna sala coincide'); return; }

  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve(); const base = `http://localhost:${srv.address().port}/?prueba=1`;
  const browser = await chromium.launch({ channel: 'msedge', headless: true }).catch(() => chromium.launch({ channel: 'chrome', headless: true }));
  const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1200 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript(PREP);
  await ctx.route(/posthog|ko-fi/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  for (const [s, n] of rooms) {
    const name = `${s}-${String(n).padStart(2, '0')}`;
    await page.evaluate(([a, b]) => { window.RoomEscape.start(a, b); }, [s, n]);
    await page.waitForTimeout(150); await waitImages(page);
    await page.locator('#scene').screenshot({ path: path.join(OUT, name + '.png') });
    if (DEBUG) {
      await page.evaluate(({ cat, model }) => {
        const L = window.RoomEscape.level(); const sc = document.getElementById('scene');
        const floorH = L.scene.floorH ?? 32; const hz = 100 - floorH;
        const K = (56.25 * hz / 100) / model.WALL_CM;
        const depth = (b) => (b <= hz ? 1 : 1 + (model.DEPTH_MAX - 1) * Math.min(1, (b - hz) / floorH));
        const seg = new Intl.Segmenter('es', { granularity: 'grapheme' });
        const gl = (str) => [...seg.segment(String(str))].map((x) => x.segment).filter((g) => /\p{Extended_Pictographic}/u.test(g));
        const ov = document.createElement('div');
        ov.id = 'dbg';
        ov.style.cssText = 'position:absolute;inset:0;z-index:1000;pointer-events:none;font:600 11px/1.1 system-ui';
        let svg = `<svg viewBox="0 0 100 56.25" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">`;
        svg += `<line x1="0" x2="100" y1="${hz * 0.5625}" y2="${hz * 0.5625}" stroke="#00b3ff" stroke-width=".15" stroke-dasharray=".8 .4"/>`;
        for (const d of L.decor || []) {
          if (d.kind && d.l != null) svg += `<rect x="${d.l}" y="${d.t * 0.5625}" width="${d.w}" height="${d.h * 0.5625}" fill="none" stroke="#ff9800" stroke-width=".12"/>` + (d.id ? `<text x="${d.l + 0.3}" y="${d.t * 0.5625 + 1.2}" font-size="1.1" fill="#ff9800">${d.id}</text>` : '');
        }
        svg += '</svg>';
        ov.innerHTML = svg;
        const label = (x, y, txt, color) => { const t = document.createElement('div'); t.textContent = txt; t.style.cssText = `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,0);background:${color};color:#fff;padding:1px 4px;border-radius:3px;white-space:nowrap`; ov.append(t); };
        const box = (x, y, w, hgt, color, dashed) => { const b = document.createElement('div'); b.style.cssText = `position:absolute;left:${x - w / 2}%;top:${y - hgt / 2}%;width:${w}%;height:${hgt}%;border:2px ${dashed ? 'dashed' : 'solid'} ${color}`; ov.append(b); };
        const items = [];
        (L.decor || []).forEach((d, k) => { if (!d.kind && d.emoji) items.push({ id: d.id || `decor${k}`, emoji: d.emoji, x: d.x, y: d.y, s: d.s || 5, deco: true }); });
        for (const h of L.hotspots) {
          if (h.sign) continue;
          let e = h.emoji; if (typeof e === 'function') { try { e = e(window.RoomEscape.g); } catch (x) { e = '?'; } }
          items.push({ id: h.id, emoji: e, x: h.x, y: h.y, s: h.s || 6, cond: !!h.show });
        }
        for (const it of items) {
          const g = gl(it.emoji); const w = it.s * Math.max(1, g.length); const hgt = it.s * 16 / 9;
          const base = it.y + hgt / 2;
          const c = cat[g[0]];
          const cm = it.s * (c && c.fill ? c.fill : model.FILL) / (K * depth(base));
          const ok = c ? (cm / c.cm >= 0.75 && cm / c.cm <= (c.cm < 30 ? 2.5 : 1.25)) : null;
          const color = it.deco ? 'rgba(120,120,120,.9)' : ok === false ? '#e53935' : ok ? '#2e7d32' : '#6d4c41';
          box(it.x, it.y, w, hgt, color, it.cond);
          if (it.cond) { const gh = document.createElement('div'); gh.innerHTML = window.GameUtils.emojiHTML(it.emoji); gh.style.cssText = `position:absolute;left:${it.x}%;top:${it.y}%;transform:translate(-50%,-50%);font-size:${it.s}cqw;opacity:.45;display:flex;line-height:0`; ov.append(gh); }
          label(it.x, base, `${it.id} ${Math.round(cm)}${c ? '/' + c.cm : ''}cm`, color);
        }
        sc.append(ov);
      }, { cat: CAT, model: { WALL_CM: M.WALL_CM, DEPTH_MAX: M.DEPTH_MAX, FILL: M.FILL } });
      await page.waitForTimeout(80);
      await page.locator('#scene').screenshot({ path: path.join(OUT, name + '-debug.png') });
      await page.evaluate(() => { const d = document.getElementById('dbg'); if (d) d.remove(); });
    }
  }
  await ctx.close();
  if (MOVIL) {
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await mctx.addInitScript(PREP);
    await mctx.route(/posthog|ko-fi/, (r) => r.abort());
    const mp = await mctx.newPage();
    mp.on('pageerror', (e) => errs.push(e.message));
    await mp.goto(base, { waitUntil: 'networkidle' });
    for (const [s, n] of rooms) {
      await mp.evaluate(([a, b]) => window.RoomEscape.start(a, b), [s, n]);
      await mp.waitForTimeout(200); await waitImages(mp);
      await mp.screenshot({ path: path.join(OUT, `${s}-${String(n).padStart(2, '0')}-movil.png`) });
    }
    await mctx.close();
  }
  await browser.close(); srv.close();
  console.log(`${rooms.length} sala(s) en ${OUT}${errs.length ? '\nErrores: ' + errs.join(' | ') : ''}`);
})();
