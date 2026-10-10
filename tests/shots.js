/* ==========================================================
   Capturas de pantalla de todas las pantallas del juego (revisión visual).
   Uso:  node tests/shots.js [carpeta_salida] [móvil|escritorio|horizontal ...]
   Requiere Microsoft Edge o Chrome instalado (usa playwright-core, sin descargar navegadores).
   ========================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'shots'));
const ONLY = process.argv.slice(3);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.xml': 'text/xml', '.txt': 'text/plain' };

const VIEWPORTS = {
  movil: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  escritorio: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  horizontal: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
};

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

// Estado: progreso desbloqueado, cookies rechazadas (salvo en la primera captura)
const UNLOCK = `(() => { try {
  localStorage.setItem('roomescapespain.consent.v1', JSON.stringify({ v: 1, analytics: false, date: Date.now() }));
  localStorage.setItem('roomescapespain.meta.v2', JSON.stringify({ v: 2, progress: {1:10,2:10,3:6,4:1,5:1}, done: {1:true,2:true}, muted: true, last: 3 }));
  localStorage.setItem('roomescapespain.save.s3', JSON.stringify({ v: 2, season: 3, level: 6, flags: {}, inv: [], hintIdx: 0, totalHints: 4, elapsed: 2710, finished: false }));
  sessionStorage.setItem('roomescapespain.panhint', '1');
} catch (e) {} })();`;

const R = 'window.RoomEscape';
const SCENES = [
  { name: '01-primera-visita-cookies', fresh: true, run: async () => {} },
  { name: '02-menu', run: async () => {} },
  { name: '03-temporada', run: async (p) => p.evaluate(`${R}.openSeason(2)`) },
  { name: '04-intro-nivel', run: async (p) => { await p.evaluate(`${R}.openSeason(1)`); await p.click('.lvl:nth-child(4)'); } },
  { name: '05-juego-inicio', run: async (p) => p.evaluate(`${R}.start(1,1)`) },
  { name: '06-juego-dialogo', run: async (p) => p.evaluate(`${R}.start(1,2); ${R}.click('abrigo'); ${R}.click('maceta')`) },
  { name: '07-juego-inventario-seleccion', run: async (p) => p.evaluate(`${R}.start(2,4); ${R}.item('dni')`) },
  { name: '08-modal-documento', run: async (p) => p.evaluate(`${R}.start(1,1); ${R}.click('cartel')`) },
  { name: '09-modal-teclado', run: async (p) => p.evaluate(`${R}.start(1,3); ${R}.click('archivo')`) },
  { name: '10-modal-texto', run: async (p) => p.evaluate(`${R}.start(1,9); ${R}.click('puerta')`) },
  { name: '11-modal-eleccion', run: async (p) => p.evaluate(`${R}.start(2,10); ${R}.g.choice({ title: '🕴️ Comprobaciones del inspector', text: '—Vamos por partes. ¿Qué comprobación quiere resolver?', options: [{label:'① El IVA del ejercicio'},{label:'② Los gastos deducibles ✅'},{label:'③ La amortización de la freidora'},{label:'④ Firmar el acta'}] })`) },
  { name: '12-modal-coalicion', run: async (p) => p.evaluate(`${R}.start(1,7); ${R}.click('tribuna'); document.querySelector('.party[data-id="PPA"]').click(); document.querySelector('.party[data-id="PRR"]').click(); document.getElementById('vote').click()`) },
  { name: '13-modal-sede', run: async (p) => p.evaluate(`${R}.start(1,5); ${R}.click('ordenador')`) },
  { name: '14-modal-tiras', run: async (p) => p.evaluate(`${R}.start(1,8); ${R}.click('trituradora')`) },
  { name: '15-modal-pistas', run: async (p) => { await p.evaluate(`${R}.start(1,6)`); await p.click('#btnHint'); await p.click('#moreHint'); } },
  { name: '16-modal-guardar', run: async (p) => { await p.evaluate(`${R}.start(3,6)`); await p.click('#btnSave'); } },
  { name: '17-modal-ayuda', run: async (p) => { await p.evaluate(`${R}.start(1,1)`); await p.click('#btnHelp2'); } },
  { name: '18-nivel-completado', run: async (p) => p.evaluate(`${R}.start(2,3); ${R}.g.win(); ${R}.finish()`) },
  { name: '19-fin-temporada', run: async (p) => p.evaluate(`${R}.start(1,10); ${R}.g.win(); ${R}.finish()`) },
  { name: '20-juego-temporada5', run: async (p) => p.evaluate(`${R}.start(5,10)`) },
  { name: '21-juego-temporada4-hemiciclo', run: async (p) => p.evaluate(`${R}.start(4,9)`) },
  { name: '22-legal-cookies', url: 'legal/cookies.html', run: async () => {} },
];

(async () => {
  const srv = await serve();
  const base = `http://localhost:${srv.address().port}/`;
  const browser = await chromium.launch({ channel: 'msedge', headless: true }).catch(() => chromium.launch({ channel: 'chrome', headless: true }));
  const vps = ONLY.length ? ONLY : Object.keys(VIEWPORTS);
  let n = 0; const errors = [];
  for (const vp of vps) {
    fs.mkdirSync(path.join(OUT, vp), { recursive: true });
    for (const sc of SCENES) {
      const ctx = await browser.newContext({ ...VIEWPORTS[vp], reducedMotion: 'reduce', locale: 'es-ES' });
      await ctx.route(/posthog|ko-fi\.com/, (r) => r.abort());
      if (!sc.fresh) await ctx.addInitScript(UNLOCK);
      const page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(`${vp}/${sc.name}: ${e.message}`));
      try {
        await page.goto(base + (sc.url || '?prueba=1'), { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await sc.run(page);
        await page.waitForTimeout(350);
        await page.screenshot({ path: path.join(OUT, vp, sc.name + '.png'), fullPage: false });
        n++;
      } catch (e) { errors.push(`${vp}/${sc.name}: ${e.message.split('\n')[0]}`); }
      await ctx.close();
    }
  }
  await browser.close(); srv.close();
  console.log(`${n} capturas en ${OUT}`);
  if (errors.length) { console.log('Errores:\n  ' + errors.join('\n  ')); process.exitCode = 1; }
})();
