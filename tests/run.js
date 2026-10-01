/* ==========================================================
   Banco de pruebas: juega automáticamente cada temporada en jsdom.
   Uso:  node tests/run.js          (todas las temporadas)
         node tests/run.js 2 3      (solo las temporadas 2 y 3)
   Cada temporada N necesita js/seasons/sN.js y tests/solutions/sN.js
   ========================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function seasonFiles() {
  return fs.readdirSync(path.join(ROOT, 'js/seasons'))
    .map((f) => /^s(\d+)\.js$/.exec(f)).filter(Boolean).map((m) => +m[1]).sort((a, b) => a - b);
}

function makeDom() {
  const html = read('index.html').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<link[^>]*>/g, '');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { if (!/Not implemented/.test(e.message)) errors.push('jsdom: ' + e.message); });
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  w.scrollTo = () => {};
  w.addEventListener('error', (e) => errors.push('window.error: ' + (e.error && e.error.stack || e.message)));
  const files = ['js/config.js', 'js/core.js', ...seasonFiles().map((n) => `js/seasons/s${n}.js`), 'js/engine.js'];
  for (const f of files) {
    try { w.eval(read(f) + `\n//# sourceURL=${f}`); } catch (e) { errors.push(`Error al cargar ${f}: ${e.stack || e}`); }
  }
  return { dom, w, doc: w.document, errors };
}

// ---------------- Comprobaciones estáticas ----------------
function staticChecks(sea, sid) {
  const errs = []; const warns = [];
  const items = sea.items || {};
  if (sea.id !== sid) errs.push(`id de temporada ${sea.id} ≠ ${sid}`);
  for (const k of ['title', 'subtitle', 'badge', 'emoji', 'intro']) if (!sea[k]) errs.push(`Falta season.${k}`);
  if (!sea.ending || !sea.ending.title || !sea.ending.html) errs.push('Falta season.ending {title, html}');
  if (!Array.isArray(sea.levels)) { errs.push('season.levels no es un array'); return { errs, warns }; }
  if (sea.levels.length !== 10) warns.push(`La temporada tiene ${sea.levels.length} niveles (se esperan 10)`);
  for (const [id, it] of Object.entries(items)) {
    if (!it.emoji || !it.name || !it.desc) errs.push(`Objeto ${id}: falta emoji/name/desc`);
  }
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
    }
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
  return { errs, warns };
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
    use: (it, id) => { if (modalOpen()) throw new Error(`use(${it}, ${id}): hay un modal abierto`); R.item(it); R.click(id); },
    combo: (a, b) => { if (modalOpen()) throw new Error(`combo(${a}, ${b}): hay un modal abierto`); R.item(a); R.item(b); },
    close: () => { const x = $('.modal-x'); if (x) x.click(); },
    clickSel: (sel) => { const e = $(sel); if (!e) throw new Error(`No existe el elemento «${sel}»`); e.click(); },
    setValue: (sel, v) => {
      const e = $(sel); if (!e) throw new Error(`No existe el elemento «${sel}»`);
      e.value = String(v);
      e.dispatchEvent(new w.Event('input', { bubbles: true }));
      e.dispatchEvent(new w.Event('change', { bubbles: true }));
    },
    btn: (text) => {
      const b = $$('#modal button, #modal a').find((x) => x.textContent.includes(text));
      if (!b) throw new Error(`No hay botón con el texto «${text}» en el modal. Botones: ${$$('#modal button').map((x) => x.textContent.trim()).join(' | ')}`);
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

async function runSeason(sid) {
  const { w, doc, errors } = makeDom();
  const R = w.RoomEscape;
  const out = { sid, ok: true, lines: [], warns: [] };
  const fail = (m) => { out.ok = false; out.lines.push('  ✗ ' + m); };
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

  const h = helpers(w, R);
  for (let i = 0; i < sea.levels.length; i++) {
    const n = i + 1;
    const title = sea.levels[i].title;
    try {
      R.start(sid, n);
      if (sols[i]) {
        await Promise.race([sols[i](h), sleep(15000).then(() => { throw new Error('tiempo agotado (15 s)'); })]);
      }
      await sleep(5);
      if (errors.length) throw new Error(errors.splice(0).join('\n'));
      if (!R.pending()) throw new Error(`la solución no completa el nivel. Último diálogo: «${h.dialog().slice(0, 300)}». Inventario: [${R.state().inv.join(', ')}]. Flags: ${JSON.stringify(R.state().flags).slice(0, 300)}`);
      R.finish();
      out.lines.push(`  ✓ Nivel ${n}: ${title}`);
    } catch (e) {
      fail(`Nivel ${n} («${title}»): ${e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n      ') : e}`);
      if (h.modalOpen()) h.close();
    }
  }
  if (out.ok && R.screen() !== 'end') fail(`Al terminar el último nivel no se muestra la pantalla final (pantalla: ${R.screen()})`);
  if (errors.length) errors.forEach(fail);
  return out;
}

(async () => {
  const want = process.argv.slice(2).map(Number).filter(Boolean);
  const list = want.length ? want : seasonFiles();
  // Compatibilidad con códigos antiguos (4 cifras = temporada 1)
  let allOk = true;
  {
    const { w } = makeDom();
    const old = w.RoomEscape && w.RoomEscape.readCode('EXP-03T2-C');
    if (!old || old.season !== 1 || old.level !== 1) { console.log('✗ Los códigos antiguos (EXP-03T2-C) ya no funcionan'); allOk = false; }
  }
  for (const sid of list) {
    const r = await runSeason(sid);
    console.log(`${r.ok ? '✅' : '❌'} Temporada ${sid}`);
    r.lines.forEach((l) => console.log(l));
    r.warns.forEach((l) => console.log('  ⚠ ' + l));
    if (!r.ok) allOk = false;
  }
  console.log(allOk ? '\nTODO CORRECTO' : '\nHAY ERRORES');
  process.exit(allOk ? 0 : 1);
})();
