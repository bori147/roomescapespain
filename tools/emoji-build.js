/* ==========================================================
   Copia a img/emoji/ las imágenes Fluent 3D (Microsoft, licencia MIT) de los emoji
   que usa el juego y genera js/emoji-data.js con la lista.
   Uso: node tools/emoji-build.js   (ejecútalo tras añadir emoji nuevos a una temporada)
   Fuente: node_modules/@lobehub/fluent-emoji-3d (devDependency; no se publica).
   ========================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
// Busca el paquete subiendo directorios (sirve también desde una copia de trabajo anidada)
const SRC = (() => {
  try { return path.join(path.dirname(require.resolve('@lobehub/fluent-emoji-3d/package.json', { paths: [ROOT] })), 'assets'); } catch (e) { return path.join(ROOT, 'node_modules', '@lobehub', 'fluent-emoji-3d', 'assets'); }
})();
const OUT = path.join(ROOT, 'img', 'emoji');
const SCAN = ['index.html', 'js/engine.js', 'js/ui-fx.js', 'js/ui-puzzles.js',
  ...fs.readdirSync(path.join(ROOT, 'js', 'seasons')).filter((f) => /^s\d+\.js$/.test(f)).map((f) => 'js/seasons/' + f)];

if (!fs.existsSync(SRC)) { console.error('Falta @lobehub/fluent-emoji-3d: ejecuta npm install'); process.exit(1); }
const have = new Set(fs.readdirSync(SRC).map((f) => f.replace(/\.webp$/, '')));
const code = (g) => [...g].map((c) => c.codePointAt(0).toString(16).padStart(4, '0')).join('-');
// Mismo orden de búsqueda que GameUtils.emojiKey (js/core.js)
const keyFor = (g) => { const c = code(g); return [c, c.replace(/-fe0f/g, ''), c + '-fe0f'].find((k) => have.has(k)) || null; };

const seg = new Intl.Segmenter('es', { granularity: 'grapheme' });
const found = new Map(); const missing = new Set();
for (const f of SCAN) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  for (const { segment: g } of seg.segment(fs.readFileSync(p, 'utf8'))) {
    if (!/\p{Extended_Pictographic}/u.test(g)) continue;
    const k = keyFor(g);
    if (k) found.set(k, g); else missing.add(g);
  }
}
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.webp') && !found.has(f.slice(0, -5))) fs.unlinkSync(path.join(OUT, f));
let bytes = 0;
for (const k of found.keys()) {
  fs.copyFileSync(path.join(SRC, k + '.webp'), path.join(OUT, k + '.webp'));
  bytes += fs.statSync(path.join(OUT, k + '.webp')).size;
}
const keys = [...found.keys()].sort();

// Caja visible de cada imagen (canal alfa, en px de 256): [margen inferior, borde izquierdo, borde derecho].
// El motor baja cada imagen su margen inferior para que apoye de verdad y ajusta la sombra a su anchura.
// Se mide con el navegador de las pruebas (playwright-core + Edge/Chrome); si no está, se conservan las medidas previas.
async function measure(list) {
  const prev = {};
  try { const w = {}; new Function('window', fs.readFileSync(path.join(ROOT, 'js', 'emoji-data.js'), 'utf8'))(w); Object.assign(prev, (w.EMOJI_IMG && w.EMOJI_IMG.box) || {}); } catch (e) { /* primera vez */ }
  let chromium;
  try { ({ chromium } = require('playwright-core')); } catch (e) { chromium = null; }
  const todo = list.filter((k) => !prev[k]);
  const box = {};
  if (todo.length && chromium) {
    const browser = await chromium.launch({ channel: 'msedge', headless: true }).catch(() => chromium.launch({ channel: 'chrome', headless: true }));
    const page = await browser.newPage();
    const data = todo.map((k) => [k, 'data:image/webp;base64,' + fs.readFileSync(path.join(OUT, k + '.webp')).toString('base64')]);
    Object.assign(box, await page.evaluate(async (items) => {
      const res = {}; const c = document.createElement('canvas'); c.width = c.height = 256;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      for (const [k, src] of items) {
        const im = new Image(); im.src = src; await im.decode();
        ctx.clearRect(0, 0, 256, 256); ctx.drawImage(im, 0, 0, 256, 256);
        const a = ctx.getImageData(0, 0, 256, 256).data;
        let minX = 256; let maxX = -1; let maxY = -1;
        for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) if (a[(y * 256 + x) * 4 + 3] > 40) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }
        res[k] = maxY < 0 ? [0, 0, 256] : [255 - maxY, minX, maxX + 1];
      }
      return res;
    }, data));
    await browser.close();
  } else if (todo.length) console.warn(`⚠ Sin navegador para medir ${todo.length} imágenes nuevas: se dibujarán sin ajuste de apoyo.`);
  const out = {};
  for (const k of list) if (box[k] || prev[k]) out[k] = box[k] || prev[k];
  return out;
}

(async () => {
  const box = await measure(keys);
  fs.writeFileSync(path.join(ROOT, 'js', 'emoji-data.js'),
    `/* Generado por tools/emoji-build.js — no editar a mano. Imágenes: Fluent Emoji 3D (Microsoft, MIT).\n` +
    `   box: parte visible de cada imagen en px de 256 → [margen inferior, borde izquierdo, borde derecho]. */\n` +
    `window.EMOJI_IMG = { base: 'img/emoji/', keys: ${JSON.stringify(keys.join(' '))},\n  box: ${JSON.stringify(box)} };\n`);
  fs.writeFileSync(path.join(OUT, 'LICENCIA.txt'),
    'Imágenes: Fluent Emoji (estilo 3D) © Microsoft Corporation — MIT License — https://github.com/microsoft/fluentui-emoji\n' +
    'Paquete de origen: @lobehub/fluent-emoji-3d (MIT) — https://github.com/lobehub/fluent-emoji\n');
  console.log(`${keys.length} imágenes (${Math.round(bytes / 1024)} KB) en img/emoji/` + (missing.size ? ` · sin imagen (se ven como emoji del sistema): ${[...missing].join(' ')}` : ''));
})();
