/* ==========================================================
   Revisión de realismo de las salas: proporciones, apoyos y solapes.
   Uso:  node tests/realism.js            (todas las salas)
         node tests/realism.js 2-1 3      (sala 2-1 y toda la temporada 3)
         node tests/realism.js --strict   (sale con código 1 si hay errores)
   Lee el catálogo de tamaños reales de tests/scale-catalog.js (emoji → {cm, at, fill}).
   at: 'floor' (apoya en el suelo), 'wall' (colgado en la pared), 'surface' (encima de un mueble:
   requiere on: '<id de decor>'), 'any' (sin regla de apoyo).
   ========================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('./scale-model');

const ROOT = path.join(__dirname, '..');
global.window = {};
const load = (f) => { const code = fs.readFileSync(path.join(ROOT, f), 'utf8'); new Function('window', 'document', code)(global.window, undefined); };
load('js/emoji-data.js'); load('js/core.js');
const seasonFiles = fs.readdirSync(path.join(ROOT, 'js/seasons')).filter((f) => /^s\d+\.js$/.test(f)).sort();
seasonFiles.forEach((f) => load('js/seasons/' + f));
const SEASONS = window.SEASONS.filter(Boolean);
let CAT = {};
try { CAT = require('./scale-catalog'); } catch (e) { console.log('⚠ Falta tests/scale-catalog.js: solo se revisan apoyos y solapes.'); }
// Añadidos por temporada (tests/scale-catalog-sN.js), para no pisarse al trabajar en paralelo
for (const f of fs.readdirSync(__dirname).filter((x) => /^scale-catalog-.+.js$/.test(x))) Object.assign(CAT, require('./' + f));

const argv = process.argv.slice(2);
const strict = argv.includes('--strict');
const sel = argv.filter((a) => !a.startsWith('--'));
const want = (s, n) => !sel.length || sel.includes(String(s)) || sel.includes(`${s}-${n}`);
const seg = new Intl.Segmenter('es', { granularity: 'grapheme' });
const glyphs = (str) => [...seg.segment(String(str))].map((x) => x.segment).filter((g) => /\p{Extended_Pictographic}/u.test(g));
const staticVal = (v) => (typeof v === 'function' ? null : v);
const tol = 0.25;

let errors = 0; let warns = 0; let checked = 0; const missingCat = new Map();
for (const sea of SEASONS) {
  sea.levels.forEach((L, i) => {
    const n = i + 1;
    if (!want(sea.id, n)) return;
    const floorH = L.scene.floorH ?? 32; const hz = M.horizonOf(floorH);
    const out = [];
    const decoTop = new Map(); const decoBox = new Map();
    for (const d of L.decor || []) {
      if (d.kind && d.l != null && d.id) { decoTop.set(d.id, d.t); decoBox.set(d.id, d); }
      if (!d.kind && d.id) { const b = M.baseOf(d.y, d.s || 5); decoTop.set(d.id, d.y - (d.s || 5) * 16 / 9 / 2); decoBox.set(d.id, { emoji: d.emoji, base: b }); }
    }
    const items = [];
    (L.decor || []).forEach((d, k) => { if (!d.kind && d.emoji) items.push({ kind: 'decor', id: d.id || `decor#${k}`, emoji: d.emoji, x: d.x, y: d.y, s: d.s || 5, on: d.on, behind: d.behind, z: d.z }); });
    for (const h of L.hotspots) {
      if (h.sign) continue;
      const e = staticVal(h.emoji);
      items.push({ kind: 'hs', id: h.id, emoji: e, x: h.x, y: h.y, s: h.s || 6, on: h.on, behind: h.behind, z: h.z, cond: !!h.show });
    }
    for (const it of items) {
      checked++;
      const base = M.baseOf(it.y, it.s);
      const g = it.emoji ? glyphs(it.emoji) : [];
      const w = it.s * Math.max(1, g.length);
      if (it.x - w / 2 < -0.5 || it.x + w / 2 > 100.5 || it.y - it.s * 0.889 < -0.5 || base > 100.5) out.push(['error', `${it.id}: se sale de la escena`]);
      if (!g.length) continue;
      const c = CAT[g[0]];
      if (!c) { missingCat.set(g[0], (missingCat.get(g[0]) || 0) + 1); continue; }
      const at = c.at || 'any';
      if (it.on) {
        const top = decoTop.get(it.on);
        if (top == null) out.push(['error', `${it.id}: on: '${it.on}' no existe en decor (ponle id)`]);
        else if (Math.abs(base - top) > 1.5) out.push(['error', `${it.id}: debería apoyar en '${it.on}' (base ${base.toFixed(1)}% vs tablero ${top.toFixed(1)}%)`]);
      } else if (at === 'floor' && !it.behind && it.z == null) {
        if (base < hz - 1) out.push(['error', `${it.id} (${g[0]}): flota — apoya en ${base.toFixed(1)}% y el suelo empieza en ${hz}% (bájalo o ponlo on: un mueble)`]);
      } else if (at === 'wall' && base > hz + 1) out.push(['warn', `${it.id} (${g[0]}): es de pared pero baja hasta el suelo (base ${base.toFixed(1)}%)`]);
      else if (at === 'surface') out.push(['warn', `${it.id} (${g[0]}): suele ir encima de un mueble: usa on: '<id>'`]);
      const cmEff = it.on ? M.cmOf(it.s, decoBox.get(it.on) ? (decoBox.get(it.on).t != null ? decoBox.get(it.on).t + decoBox.get(it.on).h : base) : base, floorH, c.fill || M.FILL)
        : M.cmOf(it.s, it.behind && decoBox.get(it.behind) && decoBox.get(it.behind).t != null ? decoBox.get(it.behind).t + decoBox.get(it.behind).h - 0.5 : base, floorH, c.fill || M.FILL);
      const ratio = cmEff / c.cm;
      // Objetos pequeños (< 30 cm): se permite exagerarlos hasta ×2,5 para que se vean y se puedan tocar
      const hi = c.cm < 30 ? 2.5 : 1 + tol;
      if (ratio > hi || ratio < 1 - tol) {
        const sOk = it.s / ratio;
        out.push([Math.abs(ratio - 1) > 0.5 ? 'error' : 'warn', `${it.id} (${g[0]}): mide ~${Math.round(cmEff)} cm y debería ~${c.cm} cm → s ≈ ${sOk.toFixed(1)}`]);
      }
    }
    // Solapes fuertes entre objetos tocables visibles a la vez (no condicionales)
    const hs = items.filter((it) => it.kind === 'hs' && !it.cond && it.emoji);
    for (let a = 0; a < hs.length; a++) for (let b = a + 1; b < hs.length; b++) {
      const A = hs[a]; const B = hs[b];
      if (A.on === B.id || B.on === A.id) continue;
      const box = (o) => { const w = o.s * Math.max(1, glyphs(o.emoji).length); const hgt = o.s * 16 / 9; return [o.x - w / 2, o.y - hgt / 2, o.x + w / 2, o.y + hgt / 2]; };
      const p = box(A); const q = box(B);
      const ix = Math.min(p[2], q[2]) - Math.max(p[0], q[0]); const iy = Math.min(p[3], q[3]) - Math.max(p[1], q[1]);
      if (ix > 0 && iy > 0) {
        const r = (ix * iy) / Math.min((p[2] - p[0]) * (p[3] - p[1]), (q[2] - q[0]) * (q[3] - q[1]));
        if (r > 0.35) out.push(['warn', `${A.id} y ${B.id} se tapan un ${Math.round(r * 100)} %`]);
      }
    }
    if (out.length) {
      console.log(`\nT${sea.id}-N${n} «${L.title}»`);
      out.forEach(([lvl, m]) => { console.log(`  ${lvl === 'error' ? '✗' : '⚠'} ${m}`); if (lvl === 'error') errors++; else warns++; });
    }
  });
}
if (missingCat.size) console.log(`\n⚠ Emoji sin tamaño en el catálogo: ${[...missingCat.keys()].join(' ')}`);
console.log(`\n${checked} objetos revisados · ${errors} errores · ${warns} avisos`);
if (strict && errors) process.exit(1);
