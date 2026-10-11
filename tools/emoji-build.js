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
const SRC = path.join(ROOT, 'node_modules', '@lobehub', 'fluent-emoji-3d', 'assets');
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
fs.writeFileSync(path.join(ROOT, 'js', 'emoji-data.js'),
  `/* Generado por tools/emoji-build.js — no editar a mano. Imágenes: Fluent Emoji 3D (Microsoft, MIT). */\n` +
  `window.EMOJI_IMG = { base: 'img/emoji/', keys: ${JSON.stringify(keys.join(' '))} };\n`);
fs.writeFileSync(path.join(OUT, 'LICENCIA.txt'),
  'Imágenes: Fluent Emoji (estilo 3D) © Microsoft Corporation — MIT License — https://github.com/microsoft/fluentui-emoji\n' +
  'Paquete de origen: @lobehub/fluent-emoji-3d (MIT) — https://github.com/lobehub/fluent-emoji\n');
console.log(`${keys.length} imágenes (${Math.round(bytes / 1024)} KB) en img/emoji/` + (missing.size ? ` · sin imagen (se ven como emoji del sistema): ${[...missing].join(' ')}` : ''));
