/* ==========================================================
   Banco de pruebas: juega automáticamente cada temporada en jsdom
   y vigila las reglas del rediseño para que nada se rompa en silencio.
   Uso:  node tests/run.js          (todas las temporadas)
         node tests/run.js 2 3      (solo las temporadas 2 y 3)
   Cada temporada N necesita js/seasons/sN.js y tests/solutions/sN.js
   Qué comprueba (ver docs/AUTORIA.md §7):
   - Globales: CSS en capas (@layer, también los <style> incrustados), contraste
     de las fichas de color, grafía de la marca, juego no instalable, ?v= coherente,
     scripts enlazados y orden de carga de hojas y scripts.
   - Contrato de QA (spec §13): ganchos de index.html, API window.RoomEscape,
     g.give / g.win / closeModal síncronos, teclado, y las hojas del sistema
     (pistas, código, ayuda, registro, pausa, cargar) abren y cierran sin errores.
   - Por temporada: datos bien formados, avisos de emoji modernos y hotspots
     pequeños, códigos de expediente, cada nivel resoluble con su solución,
     guardas de los arreglos de CSS sobre contenido congelado y etiquetas de
     botones del motor que no choquen con los textos de las soluciones.
   ========================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** true si el fichero existe y tiene algo más que comentarios (los ficheros «placeholder» no cuentan). */
const hasCode = (p) => exists(p) && read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').trim().length > 0;

function seasonFiles() {
  return fs.readdirSync(path.join(ROOT, 'js/seasons'))
    .map((f) => /^s(\d+)\.js$/.exec(f)).filter(Boolean).map((m) => +m[1]).sort((a, b) => a - b);
}

// El rediseño se considera «cimentado» en cuanto css/tokens.css tiene algo más que comentarios (paquete P1).
// Antes de eso, las comprobaciones que dependen del rediseño se informan como omitidas. A partir de ahí son
// estrictas: si falta o cambia la declaración exacta del orden de capas, falla (no se vuelve a «modo aviso»).
const LAYER_ORDER = ['reset', 'tokens', 'base', 'components', 'scene', 'play', 'screens', 'modals', 'puzzles', 'fx', 'seasons', 'overrides'];
const FOUNDATION = hasCode('css/tokens.css');
const PUZZLES_JS = hasCode('js/ui-puzzles.js');

// ---------------- Orden de carga de los scripts (el de index.html) ----------------
const LOADABLE = /^js\/(config|core|seasons\/s\d+|ui-puzzles|ui-fx|engine)\.js$/; // consent.js y analytics.js no se cargan en jsdom
function scriptOrder() {
  const html = read('index.html');
  const notes = [];
  const srcs = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"'?#]+)[^"']*["'][^>]*>/g)].map((m) => m[1].replace(/^\.\//, ''));
  // Un script local enlazado que no existe es un error (no se convierte en «guarda omitida»)
  const broken = srcs.filter((f) => !/^(?:[a-z]+:)?\/\//i.test(f) && !exists(f));
  let files = srcs.filter((f) => LOADABLE.test(f) && exists(f));
  const seasons = seasonFiles().map((n) => `js/seasons/s${n}.js`);
  const missing = seasons.filter((f) => !files.includes(f));
  if (missing.length) notes.push(`index.html no enlaza ${missing.join(', ')} (añade su <script> antes de js/ui-puzzles.js)`);
  if (!files.includes('js/engine.js')) { // index.html irreconocible: orden de siempre
    files = ['js/config.js', 'js/core.js', ...seasons, ...['js/ui-puzzles.js', 'js/ui-fx.js'].filter(exists), 'js/engine.js'];
  } else if (missing.length) {
    const at = files.findIndex((f) => /ui-puzzles|ui-fx|engine/.test(f));
    files.splice(at, 0, ...missing);
  }
  return { files, notes, broken };
}
const ORDER = scriptOrder();

// Etiquetas de botones del sistema ([data-sys]) vistas durante cada ejecución (para el control de «agujas»).
function watchSysButtons(w, sink) {
  const grab = (el) => {
    if (!el || el.nodeType !== 1) return;
    const list = [];
    if (el.matches('[data-sys]')) list.push(el);
    list.push(...el.querySelectorAll('[data-sys]'));
    for (const b of list) {
      const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
      const a = (b.getAttribute('aria-label') || '').trim();
      for (const s of [t, a]) if (s) sink.add(s);
    }
  };
  const mo = new w.MutationObserver((recs) => {
    for (const r of recs) {
      if (r.type === 'childList') r.addedNodes.forEach(grab);
      const tgt = r.target && (r.target.nodeType === 1 ? r.target : r.target.parentElement);
      if (tgt && tgt.closest) grab(tgt.closest('[data-sys]'));
    }
  });
  mo.observe(w.document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-sys', 'aria-label'] });
  return mo;
}

function makeDom(seed) {
  const html = read('index.html').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<link[^>]*>/g, '');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) errors.push('jsdom: ' + e.message); });
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.matchMedia = (q) => ({ matches: false, media: String(q), onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } });
  w.scrollTo = () => {};
  w.addEventListener('error', (e) => errors.push('window.error: ' + (e.error && e.error.stack || e.message)));
  const sys = new Set();
  watchSysButtons(w, sys);
  // «Recarga»: el almacenamiento de una sesión anterior, antes de que arranquen los scripts
  if (seed) { try { w.localStorage.clear(); for (const [k, v] of Object.entries(seed)) w.localStorage.setItem(k, v); } catch (e) { errors.push('localStorage: ' + e.message); } }
  // Orden de index.html: config, core, temporadas, ui-puzzles y ui-fx (si existen), engine.
  for (const f of ORDER.files) {
    try { w.eval(read(f) + `\n//# sourceURL=${f}`); } catch (e) { errors.push(`Error al cargar ${f}: ${e.stack || e}`); }
  }
  return { dom, w, doc: w.document, errors, sys };
}

// ---------------- CSS: todo dentro de @layer ----------------
/** Divide CSS en sentencias de primer nivel { prelude, block|null, line }. Respeta cadenas y comentarios. */
function cssTopLevel(src) {
  const s = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const out = []; const bad = [];
  let depth = 0; let start = 0; let prelude = ''; let bStart = 0;
  const lineAt = (i) => s.slice(0, i).split('\n').length + (s.slice(i).match(/^\s*/)[0].split('\n').length - 1);
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'") { // cadena: saltar hasta la comilla de cierre
      for (i++; i < s.length && s[i] !== c; i++) if (s[i] === '\\') i++;
      continue;
    }
    if (depth === 0) {
      if (c === '{') { prelude = s.slice(start, i); bStart = i + 1; depth = 1; } else if (c === ';') { out.push({ prelude: s.slice(start, i), block: null, line: lineAt(start) }); start = i + 1; } else if (c === '}') { bad.push(`llave «}» sobrante (línea ${lineAt(i)})`); start = i + 1; }
    } else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) { out.push({ prelude, block: s.slice(bStart, i), line: lineAt(start) }); start = i + 1; }
  }
  if (depth) bad.push('faltan llaves de cierre al final del fichero');
  else if (s.slice(start).trim()) out.push({ prelude: s.slice(start), block: null, line: lineAt(start) });
  return { out, bad };
}
const TOP_OK = new Set(['layer', 'font-face', 'property', 'view-transition', 'charset']);
/** Devuelve la lista de reglas fuera de capa. Los envoltorios @supports/@media/@container solo pueden contener capas. */
function unlayeredRules(src, lineBase = 0) {
  const { out, bad } = cssTopLevel(src);
  const errs = bad.slice();
  for (const st of out) {
    const p = st.prelude.trim().replace(/\s+/g, ' ');
    if (!p) { if (st.block !== null && st.block.trim()) errs.push(`bloque sin selector (línea ${lineBase + st.line})`); continue; }
    const at = /^@([\w-]+)/.exec(p);
    const name = at ? at[1].toLowerCase() : null;
    if (name && TOP_OK.has(name)) continue;
    if (name === 'import' && /\blayer\b/.test(p)) continue;
    if (name === 'supports' || name === 'media' || name === 'container') {
      if (st.block === null) { errs.push(`«${p.slice(0, 60)}» sin bloque (línea ${lineBase + st.line})`); continue; }
      errs.push(...unlayeredRules(st.block, lineBase + st.line - 1));
      continue;
    }
    errs.push(`«${p.slice(0, 70)}${p.length > 70 ? '…' : ''}» fuera de @layer (línea ${lineBase + st.line})`);
  }
  return errs;
}

// ---------------- Contraste (WCAG 2.x, luminancia relativa) ----------------
function hexRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) { if (parseInt(h.slice(6), 16) < 255) return null; h = h.slice(0, 6); }
  if (h.length !== 6) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminance([r, g, b]) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const la = luminance(a); const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
/** Fichas de color de :root (primera definición) y acentos de temporada de css/tokens.css. */
function parseTokens(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const tok = {};
  for (const m of clean.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)) if (!(m[1] in tok)) tok[m[1]] = m[2];
  const accents = {};
  for (const m of clean.matchAll(/\[data-season=["']?(\d+)["']?\][^{]*\{([^}]*)\}/g)) {
    const a = /--accent\s*:\s*(#[0-9a-fA-F]{3,8})\b/.exec(m[2]);
    if (a) accents[m[1]] = a[1];
  }
  return { tok, accents };
}
// Tabla de contraste del spec §2 (texto ≥ 4.5; no texto ≥ 3). Valores literales = colores fijos documentados.
const CONTRAST_PAIRS = [
  ['ink', 'canvas', 4.5], ['ink', 'paper', 4.5], ['ink', 'surface', 4.5],
  ['ink-2', 'canvas', 4.5], ['ink-2', 'sunken', 4.5],
  ['ink-3', 'canvas', 4.5], ['ink-3', 'paper', 4.5], ['ink-3', 'sunken', 4.5], ['ink-3', 'surface', 4.5],
  ['#FFFFFF', 'red', 4.5], ['red', 'paper', 4.5], ['red-ink', 'paper', 4.5], ['red-ink', 'red-bg', 4.5],
  ['green', 'green-bg', 4.5], ['#FFFFFF', 'green', 4.5],
  ['ink', 'marker', 4.5], ['ink', 'marker-soft', 4.5], ['ink-3', 'marker-soft', 4.5],
  ['focus', 'canvas', 3], ['focus', 'surface', 3], ['focus', 'paper', 3],
  ['ink', 'kofi', 4.5],
  ['star-on|#A37B00', 'paper', 3], ['star-off|#8A7C63', 'paper', 3], ['switch-off|#7D7262', 'paper', 3],
  ['lcd-fg', 'lcd-bg', 4.5],
];
function contrastChecks() {
  const errs = []; let n = 0;
  const { tok, accents } = parseTokens(read('css/tokens.css'));
  const val = (k) => {
    if (k[0] === '#') return k;
    const [name, fallback] = k.split('|');
    return tok[name] || fallback || null;
  };
  const check = (fg, bg, min, label) => {
    const a = hexRgb(fg || ''); const b = hexRgb(bg || '');
    if (!a || !b) { errs.push(`contraste ${label}: color no encontrado o no opaco en css/tokens.css`); return; }
    const r = contrast(a, b); n++;
    if (r + 1e-9 < min) errs.push(`contraste ${label} = ${r.toFixed(2)}:1 (mínimo ${min}:1)`);
  };
  for (const [f, b, min] of CONTRAST_PAIRS) check(val(f), val(b), min, `${f.split('|')[0]} sobre ${b}`);
  // Acentos: blanco (--on-accent) sobre el acento de cada temporada (y el de :root)
  const onAccent = tok['on-accent'] || '#FFFFFF';
  if (!tok.accent) errs.push('falta --accent en :root');
  else check(onAccent, tok.accent, 4.5, 'on-accent sobre accent (:root)');
  for (const sid of seasonFiles()) {
    if (!accents[sid]) { errs.push(`falta el acento de la temporada ${sid} ([data-season="${sid}"]{--accent:…})`); continue; }
    check(onAccent, accents[sid], 4.5, `on-accent sobre el acento T${sid}`);
  }
  return { errs, n };
}

// ---------------- Emoji modernos (posible «tofu» en Windows 10 / Android antiguos) ----------------
// Emoji 12.0 es el último bien soportado. Se avisa de los posteriores (12.1+, 13, 14, 15…).
const EMOJI_OK_1FA = [[0x1FA70, 0x1FA73], [0x1FA78, 0x1FA7A], [0x1FA80, 0x1FA82], [0x1FA90, 0x1FA95]];
const EMOJI_NEW_CP = new Set([0x1F6D6, 0x1F6D7, 0x1F6DC, 0x1F6DD, 0x1F6DE, 0x1F6DF, 0x1F90C, 0x1F972, 0x1F977, 0x1F978, 0x1F979,
  0x1F9A3, 0x1F9A4, 0x1F9AB, 0x1F9AC, 0x1F9AD, 0x1F9CB, 0x1F9CC, 0x1F7F0]);
const EMOJI_NEW_ZWJ = [/\u{1F9D1}‍/u, /[\u{1F935}\u{1F470}]‍/u, /\u{1F408}‍⬛/u, /\u{1F43B}‍❄/u, /❤️?‍/u,
  /\u{1F62E}‍/u, /\u{1F635}‍/u, /\u{1F636}‍/u, /\u{1F9D4}‍/u, /\u{1F3F3}️?‍⚧/u];
function modernEmoji(str) {
  if (typeof str !== 'string' || !str) return [];
  const found = new Set();
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (EMOJI_NEW_CP.has(cp)) found.add(ch);
    else if (cp >= 0x1FA70 && cp <= 0x1FAFF && !EMOJI_OK_1FA.some(([a, b]) => cp >= a && cp <= b)) found.add(ch);
  }
  for (const re of EMOJI_NEW_ZWJ) { const m = new RegExp(re.source + '[^\\s]*', 'u').exec(str); if (m) found.add(m[0]); }
  return [...found];
}
/** Evalúa un campo que puede ser texto o función (g) => texto, con estados vacío y «todo activo». */
function variants(v) {
  if (typeof v !== 'function') return [v];
  const out = [];
  for (const on of [false, true]) {
    const g = { flag: () => on, has: () => on, state: () => ({}), set() {}, give() {}, take() {}, say() {} };
    try { out.push(v(g)); } catch (e) { /* depende de estado que no simulamos */ }
  }
  return out;
}

// ---------------- Comprobaciones estáticas por temporada ----------------
function staticChecks(sea, sid) {
  const errs = []; const warns = [];
  const items = sea.items || {};
  if (sea.id !== sid) errs.push(`id de temporada ${sea.id} ≠ ${sid}`);
  for (const k of ['title', 'subtitle', 'badge', 'emoji', 'intro']) if (!sea[k]) errs.push(`Falta season.${k}`);
  if (!sea.ending || !sea.ending.title || !sea.ending.html) errs.push('Falta season.ending {title, html}');
  if (!Array.isArray(sea.levels)) { errs.push('season.levels no es un array'); return { errs, warns }; }
  if (sea.levels.length !== 10) warns.push(`La temporada tiene ${sea.levels.length} niveles (se esperan 10)`);
  const emojiWarn = new Map(); // emoji → dónde
  const noteEmoji = (v, where) => { for (const x of variants(v)) for (const e of modernEmoji(x)) if (!emojiWarn.has(e)) emojiWarn.set(e, where); };
  noteEmoji(sea.emoji, 'emoji de la temporada');
  for (const [id, it] of Object.entries(items)) {
    if (!it.emoji || !it.name || !it.desc) errs.push(`Objeto ${id}: falta emoji/name/desc`);
    noteEmoji(it.emoji, `objeto «${id}»`);
  }
  const small = [];
  sea.levels.forEach((L, i) => {
    const tag = `Nivel ${i + 1} («${L.title}»)`;
    for (const k of ['title', 'place', 'intro', 'outro']) if (!L[k]) errs.push(`${tag}: falta ${k}`);
    if (!(L.stars >= 1 && L.stars <= 5)) errs.push(`${tag}: stars debe ser 1..5`);
    if (!L.scene || !L.scene.wall || !L.scene.floor) errs.push(`${tag}: falta scene.wall/floor`);
    if (!Array.isArray(L.hints) || L.hints.length < 3) errs.push(`${tag}: necesita al menos 3 pistas`);
    const ids = new Set();
    for (const h of L.hotspots || []) {
      if (!h.id) errs.push(`${tag}: hotspot sin id`);
      if (ids.has(h.id)) errs.push(`${tag}: id de hotspot duplicado «${h.id}»`);
      ids.add(h.id);
      if (!(h.x >= 2 && h.x <= 98 && h.y >= 2 && h.y <= 98)) errs.push(`${tag}: hotspot ${h.id} fuera de la escena (x=${h.x}, y=${h.y})`);
      if (!h.label) errs.push(`${tag}: hotspot ${h.id} sin label`);
      if (!h.look && !h.use) errs.push(`${tag}: hotspot ${h.id} sin look ni use`);
      if (!h.sign && !h.emoji) errs.push(`${tag}: hotspot ${h.id} sin emoji ni sign`);
      for (const k of Object.keys(h.use || {})) if (k !== '*' && !items[k]) errs.push(`${tag}: hotspot ${h.id} usa objeto inexistente «${k}»`);
      if (!h.sign && typeof h.s === 'number' && h.s < 5) small.push(`N${i + 1} ${h.id} (s: ${h.s})`);
      noteEmoji(h.emoji, `N${i + 1} hotspot «${h.id}»`);
      if (h.sign) noteEmoji(h.sub, `N${i + 1} cartel «${h.id}»`);
    }
    for (const id of L.carry || []) if (!items[id]) errs.push(`${tag}: carry con objeto inexistente «${id}»`);
    if (sid >= 2 && !(L.carry && L.carry.length)) errs.push(`${tag}: falta «carry» (objetos que trae del trámite anterior / temporada anterior)`);
    for (const k of Object.keys(L.combos || {})) {
      const parts = k.split('+');
      if (parts.length !== 2) { errs.push(`${tag}: combo mal formado «${k}»`); continue; }
      if ([...parts].sort().join('+') !== k) errs.push(`${tag}: la clave de combo «${k}» debe ir en orden alfabético: «${[...parts].sort().join('+')}»`);
      for (const p of parts) if (!items[p]) errs.push(`${tag}: combo «${k}» con objeto inexistente «${p}»`);
    }
    // Solapamientos aproximados (solo aviso)
    const boxes = (L.hotspots || []).filter((h) => h.x != null).map((h) => {
      let w; let hh;
      if (h.sign) { w = h.w || 12; hh = 12; } else { const s = h.s || 6; const n = typeof h.emoji === 'string' ? Math.max(1, [...h.emoji.replace(/‍|️/g, '')].length) : 1; w = s * Math.min(n, 4) * 0.95; hh = s * 16 / 9 * 0.95; }
      return { id: h.id, cond: !!h.show, x0: h.x - w / 2, x1: h.x + w / 2, y0: h.y - hh / 2, y1: h.y + hh / 2 };
    });
    for (let a = 0; a < boxes.length; a++) {
      for (let b = a + 1; b < boxes.length; b++) {
        const A = boxes[a]; const B = boxes[b];
        if (A.cond || B.cond) continue;
        const ix = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
        const iy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
        if (ix > 0 && iy > 0) {
          const inter = ix * iy;
          const minArea = Math.min((A.x1 - A.x0) * (A.y1 - A.y0), (B.x1 - B.x0) * (B.y1 - B.y0));
          if (inter / minArea > 0.3) warns.push(`${tag}: «${A.id}» y «${B.id}» se solapan mucho (${Math.round((inter / minArea) * 100)}%)`);
        }
      }
    }
  });
  if (small.length) warns.push(`Hotspots con s < 5 (difíciles de tocar en el móvil; usa s: 5 o más): ${small.join(', ')}`);
  if (emojiWarn.size) warns.push(`Emoji posteriores a Emoji 12.0 (pueden verse como □ en Windows 10 y Android antiguos): ${[...emojiWarn].map(([e, w]) => `${e} (${w})`).join(', ')}`);
  return { errs, warns };
}

// ---------------- Comprobaciones globales (una vez) ----------------
function globalChecks() {
  const errs = []; const warns = []; const oks = []; const skips = [];
  const strictOr = (msg) => (FOUNDATION ? errs : warns).push(msg);

  // 1. Todas las hojas de estilo en capas
  const cssFiles = fs.readdirSync(path.join(ROOT, 'css')).filter((f) => f.endsWith('.css')).map((f) => 'css/' + f);
  if (exists('legal/legal.css')) cssFiles.push('legal/legal.css');
  const layerErrs = [];
  for (const f of cssFiles) {
    const e = unlayeredRules(read(f));
    if (e.length) layerErrs.push(`${f}: ${e.length} regla(s) sin capa; p. ej. ${e.slice(0, 2).join('; ')}`);
  }
  if (!FOUNDATION) skips.push(`CSS en capas: omitido mientras css/tokens.css esté vacío (solo comentarios); ${layerErrs.length} fichero(s) aún sin capas`);
  else if (layerErrs.length) errs.push(...layerErrs.map((m) => 'CSS sin capa → ' + m));
  else oks.push(`CSS en capas: ${cssFiles.length} hojas sin reglas fuera de @layer`);
  if (FOUNDATION) {
    const decl = `@layer ${LAYER_ORDER.join(', ')};`;
    const firstStmt = (f) => { const m = /@layer\s+[\w-]+(?:\s*,\s*[\w-]+)+\s*;/.exec(read(f)); return m ? m[0].replace(/\s+/g, ' ').replace(/ ,/g, ',') : null; };
    for (const f of ['css/tokens.css', 'css/style.css']) {
      const got = exists(f) ? firstStmt(f) : null;
      if (got !== decl) errs.push(`${f} debe declarar el orden de capas exacto «${decl}» (tiene: ${got || 'nada'})`);
    }
  }

  // 2. Contraste de las fichas de color (§2)
  if (!FOUNDATION) skips.push('Contraste de fichas: omitido (css/tokens.css aún vacío)');
  else {
    const c = contrastChecks();
    if (c.errs.length) errs.push(...c.errs);
    else oks.push(`Contraste: ${c.n} pares de la tabla §2 cumplen AA (texto ≥ 4,5:1; no texto ≥ 3:1)`);
  }

  // 3. Grafía de la marca: «Vuelva usted mañana»
  const brandFiles = ['README.md', 'index.html', '404.html', ...fs.readdirSync(path.join(ROOT, 'legal')).filter((f) => f.endsWith('.html')).map((f) => 'legal/' + f)].filter(exists);
  let brandBad = 0;
  for (const f of brandFiles) {
    const bad = [...read(f).matchAll(/vuelva\s+usted\s+mañana/gi)].map((m) => m[0]).filter((t) => t !== 'Vuelva usted mañana' && t !== t.toUpperCase() && t !== t.toLowerCase());
    if (bad.length) { brandBad++; (f === 'README.md' ? errs : { push: strictOr }).push(`${f}: la marca se escribe «Vuelva usted mañana» (encontrado «${bad[0]}» ×${bad.length})`); }
  }
  if (!brandBad) oks.push(`Marca: «Vuelva usted mañana» bien escrita en ${brandFiles.length} ficheros`);

  // 4. El juego NO es instalable y no mantiene la pantalla encendida (decisión del propietario)
  const idx = read('index.html');
  if (/<link[^>]+rel=["']?manifest/i.test(idx)) errs.push('index.html enlaza un manifest: el juego no debe ser instalable');
  if (/apple-touch-icon/i.test(idx)) errs.push('index.html declara apple-touch-icon: el juego no debe ser instalable');
  for (const f of ['manifest.webmanifest', 'img/icon-180.png', 'img/icon-192.png', 'img/icon-512.png', 'img/icon-maskable-512.png']) if (exists(f)) errs.push(`${f} no debe existir (el juego no es instalable)`);
  const jsFiles = ['js', 'js/seasons'].flatMap((d) => fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith('.js')).map((f) => `${d}/${f}`));
  for (const f of jsFiles) {
    const src = read(f);
    if (/serviceWorker\s*\.\s*register/.test(src)) errs.push(`${f} registra un service worker (prohibido: el juego no es instalable)`);
    if (/wakeLock/.test(src)) errs.push(`${f} usa Wake Lock (prohibido: no se mantiene la pantalla encendida)`);
    if (/a(?:ñ|n)adir\s+a\s+(?:la\s+)?pantalla\s+de\s+inicio/i.test(src)) errs.push(`${f} invita a «Añadir a pantalla de inicio» (prohibido)`);
  }

  // 5. Versionado ?v= coherente en index.html (todas las hojas y scripts locales con el mismo número)
  const vers = [...idx.matchAll(/(?:href|src)=["']((?:css|js)\/[^"'?]+)\?v=([^"'&]+)["']/g)].map((m) => ({ f: m[1], v: m[2] }));
  const vset = new Set(vers.map((x) => x.v));
  const unversioned = [...idx.matchAll(/(?:href|src)=["']((?:css|js)\/[^"'?]+\.(?:css|js))["']/g)].map((m) => m[1]);
  if (vset.size > 1) errs.push(`index.html mezcla versiones ?v= (${[...vset].join(', ')}): súbelas todas a la vez (docs/PUBLICAR.md)`);
  if (unversioned.length) errs.push(`index.html enlaza sin ?v=: ${unversioned.join(', ')}`);
  const linkedCss = new Set(vers.filter((x) => x.f.endsWith('.css')).map((x) => x.f));
  const unlinked = cssFiles.filter((f) => f.startsWith('css/') && !linkedCss.has(f));
  if (unlinked.length) warns.push(`Hojas de estilo que index.html no enlaza: ${unlinked.join(', ')}`);
  if (vset.size === 1 && !unversioned.length) oks.push(`Versionado: ${vers.length} recursos con ?v=${[...vset][0]}`);
  warns.push(...ORDER.notes);
  if (ORDER.broken.length) errs.push(`index.html enlaza scripts que no existen: ${ORDER.broken.join(', ')}`);

  // 6. Orden de carga de index.html (spec §4): las capas las declara la primera hoja; los realzadores
  //    (ui-puzzles, ui-fx) se cargan después de las temporadas y antes del motor, como scripts clásicos.
  const cssOrder = [...idx.matchAll(/<link\b[^>]*rel=["']?stylesheet[^>]*>/gi)].map((m) => (/href=["']([^"'?#]+)/.exec(m[0]) || [])[1]).filter(Boolean);
  const CSS_WANT = ['css/tokens.css', 'css/style.css', 'css/ui-components.css', 'css/ui-scene.css', 'css/ui-play.css', 'css/ui-screens.css', 'css/ui-modals.css', 'css/ui-puzzles.css', 'css/ui-fx.css', 'css/consent.css'];
  const cssKnown = cssOrder.filter((f) => CSS_WANT.includes(f));
  const cssExpected = CSS_WANT.filter((f) => cssKnown.includes(f));
  if (cssKnown.join() !== cssExpected.join()) strictOr(`index.html: las hojas de estilo deben ir en el orden ${CSS_WANT.map((f) => f.slice(4, -4)).join(', ')} (tiene: ${cssKnown.map((f) => f.slice(4, -4)).join(', ')})`);
  else if (FOUNDATION && cssOrder[0] !== 'css/tokens.css') errs.push(`index.html: la primera hoja de estilo debe ser css/tokens.css (declara el orden de capas); es ${cssOrder[0] || 'ninguna'}`);
  else if (cssKnown.length) oks.push(`Orden de las hojas: ${cssKnown.length} en el orden del spec, empezando por ${cssOrder[0]}`);
  const scriptTags = [...idx.matchAll(/<script\b[^>]*\bsrc=["']([^"'?#]+)[^>]*>/g)].map((m) => ({ f: m[1].replace(/^\.\//, ''), tag: m[0] }));
  const JS_RANK = (f) => {
    const order = ['js/config.js', 'js/consent.js', 'js/analytics.js', 'js/core.js', 'SEASON', 'js/ui-puzzles.js', 'js/ui-fx.js', 'js/engine.js'];
    return order.indexOf(/^js\/seasons\/s\d+\.js$/.test(f) ? 'SEASON' : f);
  };
  const ranked = scriptTags.filter((s) => JS_RANK(s.f) >= 0);
  const outOfOrder = ranked.filter((s, i) => i && JS_RANK(s.f) < JS_RANK(ranked[i - 1].f));
  if (outOfOrder.length) errs.push(`index.html: scripts fuera de orden (${outOfOrder.map((s) => s.f).join(', ')}); el orden es config, consent, analytics, core, temporadas, ui-puzzles, ui-fx, engine`);
  const nonClassic = ranked.filter((s) => /\b(async|defer)\b|type=["']?module/i.test(s.tag));
  if (nonClassic.length) errs.push(`index.html: ${nonClassic.map((s) => s.f).join(', ')} debe(n) cargarse como script clásico (sin async, defer ni type="module")`);
  if (!outOfOrder.length && !nonClassic.length) oks.push(`Orden de los scripts: ${ranked.length} scripts clásicos en el orden del spec (realzadores antes de engine.js)`);

  // 7. Hojas <style> incrustadas en las páginas HTML: también en capas
  const htmlFiles = ['index.html', '404.html', ...fs.readdirSync(path.join(ROOT, 'legal')).filter((f) => f.endsWith('.html')).map((f) => 'legal/' + f)].filter(exists);
  for (const f of htmlFiles) {
    for (const m of read(f).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
      const e = unlayeredRules(m[1]);
      if (e.length) strictOr(`CSS sin capa → ${f} (<style> incrustado): ${e.length} regla(s); p. ej. ${e.slice(0, 2).join('; ')}`);
    }
  }

  // 8. Enlaces opcionales del rediseño: informar si aún son «placeholder»
  const pending =['css/ui-scene.css', 'css/ui-play.css', 'css/ui-screens.css', 'css/ui-modals.css', 'css/ui-puzzles.css', 'css/ui-fx.css', 'js/ui-puzzles.js', 'js/ui-fx.js'].filter((f) => !hasCode(f));
  if (pending.length) skips.push(`Pendientes de rellenar (sus guardas se omiten): ${pending.join(', ')}`);
  return { errs, warns, oks, skips };
}

// ---------------- Agujas: textos de botón que usan las soluciones ----------------
const NEEDLES_BASE = ['Presentar', 'Firmar', 'Registrar', 'Enviar', 'Someter', 'Transferir', 'Modificar', 'Rellenar solicitud', 'Que empiece la firma',
  'Publicar y hacer captura', 'Emitir factura', 'Devolver con correcciones', 'Confirmar gastos', 'Calcular y registrar', 'Anotar en el libro'];
function solutionNeedles() {
  const set = new Set(NEEDLES_BASE);
  const dir = path.join(ROOT, 'tests/solutions');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
    for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(/h\.btn\(\s*(['"`])([^'"`]+)\1\s*\)/g)) set.add(m[2]);
  }
  return [...set];
}
const NEEDLES = solutionNeedles();
function needleCollisions(labels) {
  const hits = [];
  for (const l of labels) for (const n of NEEDLES) if (l.includes(n)) hits.push(`«${l}» contiene «${n}»`);
  return hits;
}

// ---------------- Ayudantes para las soluciones ----------------
function helpers(w, R) {
  const doc = w.document;
  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => [...doc.querySelectorAll(s)];
  const modalOpen = () => !$('#modal').hidden;
  const h = {
    R, g: R.g, w, doc, $, $$, sleep, modalOpen,
    has: (id) => R.state().inv.includes(id),
    flag: (k) => R.state().flags[k],
    dialog: () => ($('#dialog') ? $('#dialog').textContent.trim() : ''),
    click: (id) => { if (modalOpen()) throw new Error(`click(${id}): hay un modal abierto; ciérralo antes con h.close()`); R.click(id); },
    used: new Set(),
    use: (it, id) => { if (modalOpen()) throw new Error(`use(${it}, ${id}): hay un modal abierto`); h.used.add(it); R.item(it); R.click(id); },
    combo: (a, b) => { if (modalOpen()) throw new Error(`combo(${a}, ${b}): hay un modal abierto`); h.used.add(a); h.used.add(b); R.item(a); R.item(b); },
    close: () => { const x = $('.modal-x'); if (x) x.click(); },
    clickSel: (sel) => { const e = $(sel); if (!e) throw new Error(`No existe el elemento «${sel}»`); e.click(); },
    setValue: (sel, v) => {
      const e = $(sel); if (!e) throw new Error(`No existe el elemento «${sel}»`);
      e.value = String(v);
      e.dispatchEvent(new w.Event('input', { bubbles: true }));
      e.dispatchEvent(new w.Event('change', { bubbles: true }));
    },
    // Botones de la temporada por su texto. Los botones del sistema ([data-sys]: ✕, pie por defecto, Lupa, chips) no cuentan.
    btn: (text) => {
      const all = $$('#modal button:not([data-sys]), #modal a:not([data-sys])');
      const b = all.find((x) => x.textContent.includes(text));
      if (!b) throw new Error(`No hay botón con el texto «${text}» en el modal. Botones: ${all.map((x) => x.textContent.trim()).join(' | ')}`);
      b.click();
    },
    choose: (text) => {
      const b = $$('.choice-opt').find((x) => x.textContent.includes(text));
      if (!b) throw new Error(`No hay opción «${text}». Opciones: ${$$('.choice-opt').map((x) => x.textContent.trim()).join(' | ')}`);
      b.click();
    },
    async keypad(code) {
      await sleep(5);
      if (!$('.kp-grid')) throw new Error(`keypad(${code}): no hay teclado numérico abierto`);
      for (const ch of String(code)) {
        const k = $(`.kp-key[data-k="${ch}"]`);
        if (!k) throw new Error(`keypad: tecla «${ch}» inexistente`);
        k.click();
      }
      $('.kp-key[data-k="OK"]').click();
      await sleep(5);
      if ($('.kp-grid')) throw new Error(`keypad(${code}) rechazado: «${$('.kp-msg') ? $('.kp-msg').textContent : ''}»`);
    },
    async text(t) {
      await sleep(40);
      const i = $('.kp-text input');
      if (!i) throw new Error(`text(${t}): no hay campo de texto abierto`);
      i.value = t;
      $('.kp-ok').click();
      await sleep(5);
      if ($('.kp-text input') && $('.kp-msg') && $('.kp-msg').textContent) throw new Error(`text(${t}) rechazado: «${$('.kp-msg').textContent}»`);
    },
  };
  return h;
}

// ---------------- Guardas de los arreglos sobre contenido congelado ----------------
// El CSS del núcleo (@layer overrides) y los realzadores de js/ui-puzzles.js arreglan cosas de las temporadas
// sin tocarlas. Si alguien cambia el marcado de la temporada, estas guardas avisan de que el arreglo ya no aplica.
const settle = () => sleep(40); // deja correr los realzadores (rAF / MutationObserver)
const tableStacked = (h, sel) => {
  const t = h.$(sel);
  if (!t) throw new Error(`no aparece «${sel}»`);
  if (!t.classList.contains('tbl-stack')) throw new Error(`«${sel}» no recibe .tbl-stack (fichas en el móvil)`);
  const tds = [...t.querySelectorAll('td')];
  const labelled = tds.filter((td) => (td.getAttribute('data-label') || '').trim());
  if (!tds.length || labelled.length < tds.length * 0.8) throw new Error(`«${sel}»: solo ${labelled.length} de ${tds.length} celdas tienen data-label`);
};
const GUARDS = [
  { sid: 1, level: 10, name: 'S1-N10 calendario: huecos iniciales explícitos (el arreglo de S4 no le afecta)',
    async run(h) {
      h.click('calendario'); await settle();
      if (!h.$('#modal .cal-grid')) throw new Error('no se abre el calendario (.cal-grid)');
      if (h.$('#modal .cal-grid > .cal-h + .cal-d')) throw new Error('el día 1 va pegado a la cabecera: el arreglo «.cal-h + .cal-d {grid-column-start:6}» lo movería al sábado');
    } },
  { sid: 4, level: 8, name: 'S4-N8 calendario: el 1 de junio de 2030 sigue a la cabecera (arreglo → sábado)',
    async run(h) {
      h.click('calendario'); await settle();
      const d = h.$('#modal .cal-grid > .cal-h + .cal-d');
      if (!d) throw new Error('no existe «#modal .cal-grid > .cal-h + .cal-d»: el arreglo de @layer overrides ya no coloca el día 1');
      if (!/^1(?!\d)/.test(d.textContent.trim())) throw new Error(`la primera casilla es «${d.textContent.trim()}», no el día 1`);
    } },
  { sid: 3, level: 6, name: 'S3-N6 plano del sótano: .s3-plan presente (rejilla de 5 columnas fluida)',
    async run(h) {
      h.click('plansot'); await settle();
      if (!h.$('#modal .s3-plan')) throw new Error('el plano ya no usa .s3-plan: revisa el arreglo de @layer overrides');
      if (!h.$('#modal .s3-plan .s3-cell')) throw new Error('el plano no tiene .s3-cell');
    } },
  { sid: 3, level: 1, needs: 'puzzles', name: 'S3-N1 Pisos en alquiler: tabla → fichas (.tbl-stack + td[data-label])',
    async run(h) { h.click('tablon'); await settle(); tableStacked(h, '#modal table.s3-tbl'); } },
  { sid: 5, level: 4, needs: 'puzzles', name: 'S5-N4 Caja de facturas: tabla → fichas',
    async run(h) { h.click('caja'); await settle(); tableStacked(h, '#modal table.s5-fac'); } },
  { sid: 5, level: 4, needs: 'puzzles', name: 'S5-N4 CAFÉ-MRR: fichas y selects #s5-f* manejables con h.setValue',
    async run(h) {
      h.use('portatilOk', 'plataforma'); h.use('cuadroOk', 'plataforma'); h.click('plataforma'); await settle();
      tableStacked(h, '#modal table.s5-fac');
      const sels = h.$$('#modal select[id^="s5-f"]');
      if (sels.length < 11) throw new Error(`solo hay ${sels.length} selects #s5-f* (se esperan 11)`);
      const opts = [...sels[0].options].map((o) => o.value).filter(Boolean);
      const v = opts[opts.length - 1];
      h.setValue('#s5-f1', v); await settle();
      const s1 = h.$('#s5-f1');
      if (!s1 || s1.value !== v) throw new Error(`#s5-f1 no conserva el valor «${v}» tras h.setValue (valor: «${s1 && s1.value}»)`);
    } },
  { sid: 5, level: 3, needs: 'puzzles', name: 'S5-N3 Cuadro de créditos: .s5-bud NO se convierte en fichas',
    async run(h) {
      h.click('cuadro'); await settle();
      const t = h.$('#modal table.s5-bud');
      if (!t) throw new Error('no aparece table.s5-bud');
      if (t.classList.contains('tbl-stack')) throw new Error('.s5-bud no debe recibir .tbl-stack (tiene su propia columna fija)');
    } },
];

// ---------------- Contrato de QA (spec §13) y hojas del sistema ----------------
// Ganchos que usan las pruebas y las capturas: si alguno desaparece o deja de ser síncrono, falla aquí con un mensaje claro
// (y no 50 niveles más abajo con un «No existe el elemento»).
const HOOK_IDS = ['modal', 'dialog', 'scene', 'btnHint', 'btnSave', 'btnHelp2', 'btnMute', 'btnMenu', 'panL', 'panR', 'winCode', 'levelGrid'];
const API = ['g', 'state', 'level', 'season', 'items', 'makeCode', 'readCode', 'meta', 'start', 'click', 'item', 'finish', 'pending', 'screen', 'openSeason', 'renderMenu', 'show'];
async function contractChecks() {
  const errs = []; const oks = []; const skips = [];
  const { w, doc, errors, sys } = makeDom();
  const R = w.RoomEscape;
  if (!R) return { errs: ['El motor no se ha cargado: ' + errors.join(' | ')], oks, skips, labels: sys };
  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => [...doc.querySelectorAll(s)];
  const isOpen = () => !$('#modal').hidden;
  const shut = () => { const x = $('#modal .modal-x'); if (x) x.click(); if (isOpen() && R.g.closeModal) R.g.closeModal(); };
  const need = (cond, msg) => { if (!cond) throw new Error(msg); };
  const passed = [];
  const step = async (name, fn) => {
    try {
      await fn();
      if (errors.length) throw new Error(errors.splice(0).join(' | '));
      passed.push(name);
    } catch (e) {
      errs.push(`Contrato de QA «${name === 'SHEETS' ? 'hojas del sistema' : name}»: ${e.message}`);
      errors.splice(0);
      try { if (isOpen()) shut(); } catch (x) { /* nada */ }
    }
  };

  await step('ganchos de index.html y API window.RoomEscape', () => {
    const miss = HOOK_IDS.filter((id) => !doc.getElementById(id));
    need(!miss.length, `faltan ${miss.map((i) => '#' + i).join(', ')}`);
    need($('#modal').hidden, '#modal debe arrancar con el atributo hidden (las pruebas lo leen)');
    const api = API.filter((k) => R[k] == null);
    need(!api.length, `a window.RoomEscape le faltan ${api.join(', ')}`);
  });
  await step('.lvl hijos directos de #levelGrid', () => {
    R.openSeason(1);
    const n = $$('#levelGrid > .lvl').length;
    need(n === w.SEASONS[0].levels.length, `#levelGrid tiene ${n} .lvl como hijos directos (se esperan ${w.SEASONS[0].levels.length}; tests/shots.js usa .lvl:nth-child(4))`);
  });
  await step('sala: #scene .floor y .hs[data-id]', () => {
    R.start(1, 1);
    need($('#scene .floor'), 'no existe #scene .floor');
    need($$('#scene .hs[data-id]').length > 0, 'no hay .hs[data-id] en #scene');
  });
  await step('g.give síncrono y .slot en la bandeja', () => {
    R.start(1, 1);
    const items = R.items();
    const id = Object.keys(items).find((k) => !R.state().inv.includes(k));
    R.g.give(id);
    need(R.state().inv.includes(id), `tras g.give('${id}') el objeto no está en el inventario en el mismo instante`);
    R.item(id); R.item(id); // seleccionar y soltar: repinta la bandeja (fuera de una acción, give no tiene por qué repintar)
    const slot = $(`.slot[data-id="${id}"]`) || $$('.slot').find((s) => s.textContent.includes(items[id].name));
    need(slot, `no hay ningún .slot con «${items[id].name}» en la bandeja`);
  });
  await step('teclado: .kp-grid, .kp-key[data-k] (0-9, ⌫, OK), .kp-msg y cierre síncrono', () => {
    R.start(1, 3); R.click('archivo');
    need(isOpen() && $('#modal .kp-grid'), 'S1-N3 «archivo» no abre el teclado numérico');
    const keys = $$('#modal .kp-key[data-k]').map((k) => k.dataset.k);
    const miss = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', 'OK'].filter((k) => !keys.includes(k));
    need(!miss.length, `faltan teclas .kp-key[data-k] ${miss.join(', ')}`);
    need($('#modal .kp-msg'), 'falta .kp-msg');
    need($('#modal .modal-x'), 'falta .modal-x');
    R.g.closeModal();
    need($('#modal').hidden, 'g.closeModal() no deja #modal[hidden] en el mismo instante');
  });
  await step('g.win síncrono, #btnFinish y #winCode', () => {
    R.start(2, 3); R.g.win();
    need(R.pending() === true, 'tras g.win() pending() no es true en el mismo instante');
    need($('#btnFinish'), 'no existe #btnFinish tras g.win()');
    R.finish();
    need(R.screen() === 'win', `tras finish() la pantalla es «${R.screen()}», no «win»`);
    need(/^EXP-/.test(($('#winCode').textContent || '').trim()), '#winCode no muestra el código EXP-…');
  });
  await step('sala ganada y no cerrada: al recargar y «Continuar» sigue ganada (sin bloqueo)', async () => {
    // T1-N1 de verdad: la jugada ganadora gasta el justificante. Si se sale antes de «Continuar»,
    // la partida guardada debe recordar la victoria; si no, el nivel queda sin salida.
    const sol = require(path.join(ROOT, 'tests/solutions/s1.js'))[0];
    w.localStorage.clear();
    R.start(1, 1);
    await sol(helpers(w, R));
    await settle();
    need(R.pending() === true, 'la solución de T1-N1 no deja la sala ganada');
    const store = {};
    for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); store[k] = w.localStorage.getItem(k); }
    const d2 = makeDom(store);
    const R2 = d2.w.RoomEscape;
    need(R2, 'el motor no arranca al recargar: ' + d2.errors.join(' | '));
    const cont = d2.doc.querySelector('#btnContinue');
    need(cont && !cont.hidden, 'tras recargar no hay «Continuar» en el menú');
    cont.click();
    await settle();
    need(R2.screen() === 'play', `«Continuar» lleva a «${R2.screen()}», no a la sala`);
    need(R2.state().season === 1 && R2.state().level === 1, '«Continuar» no vuelve a T1-N1');
    need(R2.pending() === true, 'al volver a una sala ganada pending() no es true: el nivel queda bloqueado (objetos gastados)');
    need(!d2.doc.querySelector('#btnFinish').hidden, '#btnFinish no está visible al volver a una sala ganada');
    R2.finish();
    need(R2.screen() === 'win', `tras finish() la pantalla es «${R2.screen()}», no «win»`);
    need(R2.state().level === 2, `tras cerrar la sala recuperada el nivel es ${R2.state().level}, no 2`);
    if (d2.errors.length) throw new Error(d2.errors.join(' | '));
    d2.w.close();
    w.localStorage.clear();
  });

  // Hojas del sistema: se abren y se cierran sin errores en jsdom (camino sin showModal), y sus botones [data-sys]
  // entran en el control de agujas. Nada de esto lo tocan las soluciones de las temporadas.
  const sheets = [];
  const openClose = async (label, open) => {
    if (isOpen()) shut();
    await open();
    await settle();
    if (!isOpen()) return false;
    sheets.push(label);
    shut(); await settle();
    need(!isOpen(), `«${label}» no se cierra con ✕ / g.closeModal()`);
    return true;
  };
  await step('SHEETS', async () => {
    R.start(1, 6);
    const click = (sel) => () => { const b = $(sel); if (b) b.click(); };
    await openClose('Pistas', () => { $('#btnHint').click(); const mh = $('#modal #moreHint'); need(mh, 'la Ventanilla de Pistas no tiene #moreHint'); mh.click(); });
    await openClose('Código', click('#btnSave'));
    await openClose('Ayuda', click('#btnHelp2'));
    if ($('#btnLog')) await openClose('Registro', click('#btnLog'));
    // Pausa («Expediente en pausa») y sus filas, si #btnMenu abre una hoja (antes del rediseño salía al menú)
    $('#btnMenu').click(); await settle();
    if (isOpen()) {
      sheets.push('Pausa');
      for (const [row, label] of [['#pauseSave', 'Pausa › Código'], ['#pauseHelp', 'Pausa › Cómo jugar'], ['#pauseRestart', 'Pausa › Reiniciar (sin confirmar)']]) {
        if (!isOpen()) { $('#btnMenu').click(); await settle(); }
        const r = $('#modal ' + row);
        if (!r) continue;
        r.click(); await settle();
        if (isOpen()) sheets.push(label);
        shut(); await settle();
      }
      need(R.screen() === 'play', `cerrar la pausa no vuelve al juego (pantalla «${R.screen()}»)`);
    }
    R.renderMenu(); R.show('menu');
    if ($('#btnCode')) await openClose('Cargar código', click('#btnCode'));
  });
  passed.forEach((n) => oks.push(n === 'SHEETS' ? `hojas del sistema: se abren y se cierran sin errores (${sheets.join(', ') || 'ninguna'})` : n));
  const lab = [...sys];
  if (lab.length) oks.push(`botones del sistema vistos en esas hojas: ${lab.length} etiquetas distintas (pasan al control de agujas)`);
  await sleep(5);
  return { errs, oks, skips, labels: sys };
}

async function runGuards(sid, out, sysLabels) {
  const mine = GUARDS.filter((g) => g.sid === sid);
  const { w, errors, sys } = makeDom();
  const R = w.RoomEscape;
  if (!R) return;
  // Las CSS de temporada se inyectan dentro de @layer seasons (core.js)
  const st = w.document.querySelector(`style[data-season="${sid}"]`);
  if (st) {
    // jsdom no entiende @layer (no tiene CSSLayerBlockRule): si core.js lo detecta y en jsdom inyecta el CSS tal cual,
    // basta con que el código de core.js envuelva la CSS en «@layer seasons{…}» para los navegadores reales.
    const layered = /^\s*@layer\s+seasons\s*\{/.test(st.textContent);
    const coreSrc = read('js/core.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''); // sin comentarios
    const srcOk = !w.CSSLayerBlockRule && /@layer\s+seasons\s*\{/.test(coreSrc);
    if (FOUNDATION && !layered && !srcOk) out.fail('La CSS de la temporada no se inyecta como «@layer seasons{…}» (js/core.js)');
    else if (layered || srcOk) out.lines.push('  ✓ Guarda: CSS de temporada dentro de @layer seasons');
  }
  for (const gd of mine) {
    if (gd.needs === 'puzzles' && !PUZZLES_JS) { out.skips.push(`Guarda omitida (js/ui-puzzles.js vacío): ${gd.name}`); continue; }
    try {
      R.start(sid, gd.level);
      const h = helpers(w, R);
      await gd.run(h);
      if (errors.length) throw new Error(errors.splice(0).join(' | '));
      out.lines.push(`  ✓ Guarda: ${gd.name}`);
      if (h.modalOpen()) h.close();
    } catch (e) {
      out.fail(`Guarda «${gd.name}»: ${e.message}`);
      if (!w.document.querySelector('#modal').hidden) { const x = w.document.querySelector('.modal-x'); if (x) x.click(); }
    }
  }
  await sleep(5);
  sys.forEach((l) => sysLabels.add(l));
}

async function runSeason(sid) {
  const { w, doc, errors, sys } = makeDom();
  const R = w.RoomEscape;
  const out = { sid, ok: true, lines: [], warns: [], skips: [] };
  const fail = (m) => { out.ok = false; out.lines.push('  ✗ ' + m); };
  out.fail = fail;
  if (!R) { fail('El motor no se ha cargado. ' + errors.join('\n')); return out; }
  const sea = w.SEASONS[sid - 1];
  if (!sea) { fail(`No hay temporada ${sid} registrada. ${errors.join('\n')}`); return out; }
  const st = staticChecks(sea, sid);
  st.errs.forEach(fail);
  out.warns.push(...st.warns);
  if (errors.length) errors.splice(0).forEach((e) => fail(e));

  const solPath = `tests/solutions/s${sid}.js`;
  if (!exists(solPath)) { fail(`Falta ${solPath}`); return out; }
  const sols = require(path.join(ROOT, solPath));
  if (!Array.isArray(sols) || sols.length !== sea.levels.length) fail(`${solPath} debe exportar un array con ${sea.levels.length} funciones`);

  // Comprobación de códigos de expediente
  for (let l = 1; l <= sea.levels.length; l++) {
    const r = R.readCode(R.makeCode(sid, l, 7));
    if (!r || r.season !== sid || r.level !== l || r.hints !== 7) fail(`Código de expediente incorrecto para T${sid} N${l}`);
  }

  // Humo: un toque en el fondo de la sala (lejos de todo) no debe lanzar errores
  try {
    R.start(sid, 1);
    const fl = doc.querySelector('#scene .floor');
    if (fl) fl.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: -5000, clientY: -5000 }));
    if (errors.length) fail('Error al tocar el fondo de la sala: ' + errors.splice(0).join(' | '));
  } catch (e) { fail('Error al tocar el fondo de la sala: ' + e.message); }

  const h = helpers(w, R);
  const givenBefore = new Set();
  const origGive = R.g.give; const origTake = R.g.take;
  let givenNow = new Set();
  R.g.give = (id) => { givenNow.add(id); return origGive(id); };
  R.g.take = (id) => { h.used.add(id); return origTake(id); };
  for (let i = 0; i < sea.levels.length; i++) {
    const n = i + 1;
    const title = sea.levels[i].title;
    const carry = sea.levels[i].carry || [];
    givenNow = new Set(); h.used = new Set();
    try {
      if (sid >= 2 && n >= 2) {
        const bad = carry.filter((id) => !givenBefore.has(id));
        if (bad.length) throw new Error(`carry incluye objetos que no se consiguen en ningún trámite anterior de la temporada: ${bad.join(', ')}`);
      }
      R.start(sid, n);
      if (sols[i]) {
        await Promise.race([sols[i](h), sleep(15000).then(() => { throw new Error('tiempo agotado (15 s)'); })]);
      }
      await sleep(5);
      if (errors.length) throw new Error(errors.splice(0).join('\n'));
      if (!R.pending()) throw new Error(`la solución no completa el nivel. Último diálogo: «${h.dialog().slice(0, 300)}». Inventario: [${R.state().inv.join(', ')}]. Flags: ${JSON.stringify(R.state().flags).slice(0, 300)}`);
      if (sid >= 2 && carry.length && !carry.some((id) => h.used.has(id))) throw new Error(`no se usa ninguno de los objetos traídos (carry: ${carry.join(', ')}). Al menos uno debe usarse en un hotspot, combinarse o entregarse.`);
      R.finish();
      out.lines.push(`  ✓ Nivel ${n}: ${title}${carry.length ? ` [trae: ${carry.join(', ')}]` : ''}`);
    } catch (e) {
      fail(`Nivel ${n} («${title}»): ${e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n      ') : e}`);
      if (h.modalOpen()) h.close();
    }
    givenNow.forEach((id) => givenBefore.add(id));
  }
  if (out.ok && R.screen() !== 'end') fail(`Al terminar el último nivel no se muestra la pantalla final (pantalla: ${R.screen()})`);
  if (errors.length) errors.forEach(fail);

  // Guardas de contenido congelado (en un DOM aparte, para no alterar la partida de la solución)
  const sysLabels = new Set(sys);
  await runGuards(sid, out, sysLabels);

  // Ningún botón del motor o de un realzador puede contener el texto que buscan las soluciones
  const hits = needleCollisions(sysLabels);
  if (hits.length) fail(`Botones del sistema ([data-sys]) que chocan con textos de las soluciones: ${hits.join('; ')}`);
  else if (sysLabels.size) out.lines.push(`  ✓ Botones del sistema: ${sysLabels.size} etiquetas distintas, ninguna choca con las soluciones`);
  else out.skips.push('Control de agujas: el motor aún no marca ningún botón con [data-sys]');
  return out;
}

(async () => {
  const want = process.argv.slice(2).map(Number).filter(Boolean);
  const list = want.length ? want : seasonFiles();
  let allOk = true;

  const gl = globalChecks();
  console.log(`${gl.errs.length ? '❌' : '✅'} Comprobaciones globales${FOUNDATION ? '' : ' (rediseño aún sin cimientos: css/tokens.css vacío; las reglas nuevas se avisan, no fallan)'}`);
  gl.oks.forEach((l) => console.log('  ✓ ' + l));
  gl.errs.forEach((l) => console.log('  ✗ ' + l));
  gl.skips.forEach((l) => console.log('  ⏭ ' + l));
  gl.warns.forEach((l) => console.log('  ⚠ ' + l));
  if (gl.errs.length) allOk = false;

  // Compatibilidad con códigos antiguos (4 cifras = temporada 1)
  {
    const { w } = makeDom();
    const old = w.RoomEscape && w.RoomEscape.readCode('EXP-03T2-C');
    if (!old || old.season !== 1 || old.level !== 1) { console.log('✗ Los códigos antiguos (EXP-03T2-C) ya no funcionan'); allOk = false; }
  }

  // Contrato de QA (ganchos, API, síncronos) y hojas del sistema, con su control de agujas
  {
    const c = await contractChecks();
    const hits = needleCollisions(c.labels);
    if (hits.length) c.errs.push(`Botones del sistema ([data-sys]) de las hojas del motor que chocan con textos de las soluciones: ${hits.join('; ')}`);
    console.log(`${c.errs.length ? '❌' : '✅'} Contrato de QA (spec §13)`);
    c.oks.forEach((l) => console.log('  ✓ ' + l));
    c.errs.forEach((l) => console.log('  ✗ ' + l));
    c.skips.forEach((l) => console.log('  ⏭ ' + l));
    if (c.errs.length) allOk = false;
  }
  for (const sid of list) {
    const r = await runSeason(sid);
    console.log(`${r.ok ? '✅' : '❌'} Temporada ${sid}`);
    r.lines.forEach((l) => console.log(l));
    r.skips.forEach((l) => console.log('  ⏭ ' + l));
    r.warns.forEach((l) => console.log('  ⚠ ' + l));
    if (!r.ok) allOk = false;
  }
  console.log(allOk ? '\nTODO CORRECTO' : '\nHAY ERRORES');
  process.exit(allOk ? 0 : 1);
})();
