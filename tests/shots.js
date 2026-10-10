/* ==========================================================
   Capturas de pantalla de todas las pantallas del juego (revisión visual)
   + sondas automáticas de maquetación en cada captura.
   Uso:  node tests/shots.js [carpeta_salida] [vistas…] [opciones]
     vistas:   movil-320 movil-360 movil-360c movil-se movil-corto movil-safari movil
               horizontal horizontal-se tablet portatil escritorio   (sin vistas = todas)
               alias: moviles (todas las movil*), horizontales, telefonos (móviles + horizontales)
     --escenas=05,23-27,pausa   solo esas escenas (números, rangos o parte del nombre)
     --motion                   con animaciones (por defecto: prefers-reduced-motion: reduce)
     --estricto | --suave       fuerza que las sondas fallen (exit 1) o solo avisen.
                                Por defecto son estrictas cuando el rediseño está completo
                                (tokens + CSS de escena, juego, pantallas, modales y puzles con contenido).
     --paralelo=N               capturas simultáneas (por defecto 4)
   Requiere Microsoft Edge o Chrome instalado (usa playwright-core, sin descargar navegadores).
   Deja las PNG en <carpeta>/<vista>/<escena>.png y un informe.json con todas las sondas.
   ========================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..');
const ARGS = process.argv.slice(2);
const FLAGS = Object.fromEntries(ARGS.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v === undefined ? true : v]; }));
const POS = ARGS.filter((a) => !a.startsWith('--'));
const OUT = path.resolve(POS[0] || path.join(ROOT, 'shots'));
const deaccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'text/xml', '.txt': 'text/plain', '.json': 'application/json' };

// ---------------- Matriz de vistas (spec §13) ----------------
const phone = (width, height) => ({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const VIEWPORTS = {
  'movil-320': phone(320, 568),
  'movil-360': phone(360, 740),
  'movil-360c': phone(360, 640),
  'movil-se': phone(375, 667),
  'movil-corto': phone(375, 553),
  'movil-safari': phone(390, 664),
  movil: phone(390, 844),
  horizontal: phone(844, 390),
  'horizontal-se': phone(667, 375),
  tablet: phone(768, 1024),
  portatil: { viewport: { width: 1366, height: 650 }, deviceScaleFactor: 1 },
  escritorio: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const ALIASES = {
  moviles: Object.keys(VIEWPORTS).filter((k) => k.startsWith('movil')),
  horizontales: ['horizontal', 'horizontal-se'],
  telefonos: Object.keys(VIEWPORTS).filter((k) => k.startsWith('movil') || k.startsWith('horizontal')),
  todas: Object.keys(VIEWPORTS),
};

// ---------------- ¿Está completo el rediseño? (decide si las sondas fallan o avisan) ----------------
const hasCode = (p) => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').trim().length > 0; } catch (e) { return false; } };
const REDESIGN_FILES = ['css/ui-scene.css', 'css/ui-play.css', 'css/ui-screens.css', 'css/ui-modals.css', 'css/ui-puzzles.css'];
// Cimientos = css/tokens.css con algo más que comentarios (no se mira una línea concreta: si la declaración de
// capas falta o cambia, lo detecta tests/run.js y aquí las sondas siguen siendo estrictas).
const REDESIGN = hasCode('css/tokens.css') && REDESIGN_FILES.every(hasCode);
const STRICT = FLAGS.estricto ? true : FLAGS.suave ? false : REDESIGN;

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

// ---------------- Estados iniciales (localStorage) ----------------
const CONSENT = `localStorage.setItem('roomescapespain.consent.v1', JSON.stringify({ v: 1, analytics: false, date: Date.now() }));`;
// meta.ui: preferencias de interfaz que el motor recuerda. panned = ya sabe deslizar la sala.
// tips: avisos de primera vez ya vistos (coachmarks de js/ui-fx.js, que lee VUM.pref('tips')[clave]); el motor guarda
// meta.ui.tips como mapa y «Repetir los consejos» lo vacía. Si ui-fx.js añade un aviso con otra clave, ponla aquí
// o las capturas saldrán con pósits encima de los hotspots. panned: ya sabe deslizar la sala (sin aviso ni «peek»).
const META_UI = { panned: true, tips: { room: true, give: true, select: true, queue: true } };
// Progreso desbloqueado y cookies rechazadas (salvo en las escenas «fresh» o «consent»)
const UNLOCK = `(() => { try {
  ${CONSENT}
  localStorage.setItem('roomescapespain.meta.v2', JSON.stringify({ v: 2, progress: {1:10,2:10,3:6,4:1,5:1}, done: {1:true,2:true}, muted: true, last: 3, ui: ${JSON.stringify(META_UI)} }));
  localStorage.setItem('roomescapespain.save.s3', JSON.stringify({ v: 2, season: 3, level: 6, flags: {}, inv: [], hintIdx: 0, totalHints: 4, elapsed: 2710, finished: false }));
  sessionStorage.setItem('roomescapespain.panhint', '1');
} catch (e) {} })();`;
// Primera visita con las cookies ya decididas: menú sin progreso ni aviso
const FIRST_VISIT = `(() => { try { ${CONSENT} } catch (e) {} })();`;

// ---------------- Escenas ----------------
class Skip extends Error {}
const R = 'window.RoomEscape';
/** En móvil los botones Código y Ayuda viven en la hoja «Expediente en pausa»: si no se ven, se abre #btnMenu y se pulsa la fila. */
async function topbarOrSheet(p, sel, rowId, rowText) {
  if (await p.isVisible(sel)) return p.click(sel);
  await p.click('#btnMenu');
  await p.waitForSelector('#modal:not([hidden])', { timeout: 2000 }).catch(() => { throw new Skip(`${sel} no está visible y #btnMenu no abre la hoja de pausa`); });
  if (await p.$(rowId)) return p.click(rowId);
  const row = p.locator('#modal button, #modal a').filter({ hasText: rowText }).first();
  if (!(await row.count())) throw new Skip(`la hoja de pausa no tiene la fila «${rowText}»`);
  await row.click();
}
async function drainQueue(p) {
  for (let i = 0; i < 12; i++) {
    if (await p.isVisible('#btnSkip')) { await p.click('#btnSkip'); return; }
    if (!(await p.isVisible('#btnNextMsg'))) return;
    await p.click('#btnNextMsg');
  }
}
const SCENES = [
  { name: '01-primera-visita-cookies', init: 'fresh', run: async () => {} },
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
  { name: '16-modal-guardar', run: async (p) => { await p.evaluate(`${R}.start(3,6)`); await topbarOrSheet(p, '#btnSave', '#pauseSave', /C[óo]digo/); } },
  { name: '17-modal-ayuda', run: async (p) => { await p.evaluate(`${R}.start(1,1)`); await topbarOrSheet(p, '#btnHelp2', '#pauseHelp', /C[óo]mo jugar|Ayuda/); } },
  { name: '18-nivel-completado', run: async (p) => p.evaluate(`${R}.start(2,3); ${R}.g.win(); ${R}.finish()`) },
  { name: '19-fin-temporada', run: async (p) => p.evaluate(`${R}.start(1,10); ${R}.g.win(); ${R}.finish()`) },
  { name: '20-juego-temporada5', run: async (p) => p.evaluate(`${R}.start(5,10)`) },
  { name: '21-juego-temporada4-hemiciclo', run: async (p) => p.evaluate(`${R}.start(4,9)`) },
  { name: '22-legal-cookies', url: 'legal/cookies.html', run: async () => {} },
  // --- Escenas del rediseño ---
  { name: '23-pausa', run: async (p) => {
    await p.evaluate(`${R}.start(1,4)`);
    await p.click('#btnMenu');
    await p.waitForTimeout(80);
    const ok = await p.evaluate(`${R}.screen() === 'play' && !document.getElementById('modal').hidden`);
    if (!ok) throw new Skip('#btnMenu no abre la hoja «Expediente en pausa»');
  } },
  { name: '24-registro', run: async (p) => {
    await p.evaluate(`${R}.start(1,2); ${R}.click('abrigo'); ${R}.click('maceta')`);
    if (!(await p.$('#btnLog'))) throw new Skip('no existe #btnLog (Registro de entrada)');
    await drainQueue(p);
    await p.click('#btnLog');
  } },
  { name: '25-usando-objeto', run: async (p) => { await p.evaluate(`${R}.start(2,4); ${R}.item('dni')`); await drainQueue(p); } },
  { name: '26-tramite-ganado-sala', run: async (p) => p.evaluate(`${R}.start(2,3); ${R}.g.win()`) },
  { name: '27-s3-plano', run: async (p) => p.evaluate(`${R}.start(3,6); ${R}.click('plansot')`) },
  { name: '28-s5-cafe', run: async (p) => p.evaluate(`${R}.start(5,4); ${R}.item('portatilOk'); ${R}.click('plataforma'); ${R}.item('cuadroOk'); ${R}.click('plataforma'); ${R}.click('plataforma')`) },
  { name: '29-s5-presupuesto', run: async (p) => p.evaluate(`${R}.start(5,3); ${R}.click('cuadro')`) },
  { name: '30-s4-calendario', run: async (p) => p.evaluate(`${R}.start(4,8); ${R}.click('calendario')`) },
  { name: '31-menu-primera-visita', init: 'first', run: async () => {} },
  { name: '32-bandeja-9-objetos', run: async (p) => { await p.evaluate(`(() => { ${R}.start(4,1);
    const ids = Object.keys(${R}.items());
    for (const id of ids) { const inv = ${R}.state().inv; if (inv.length >= 9) break; if (!inv.includes(id)) ${R}.g.give(id); }
    const first = ${R}.state().inv[0]; ${R}.item(first); ${R}.item(first); // seleccionar y soltar: fuerza el repintado de la bandeja
  })()`); await drainQueue(p); } },
];

function pickScenes() {
  const f = FLAGS.escenas || FLAGS.scenes;
  if (!f || f === true) return SCENES;
  const want = String(f).split(',').map((s) => s.trim()).filter(Boolean);
  return SCENES.filter((sc) => {
    const n = parseInt(sc.name, 10);
    return want.some((w) => {
      const r = /^(\d+)-(\d+)$/.exec(w);
      if (r) return n >= +r[1] && n <= +r[2];
      if (/^\d+$/.test(w)) return n === +w;
      return sc.name.includes(deaccent(w));
    });
  });
}
function pickViewports() {
  const list = POS.slice(1).flatMap((v) => ALIASES[deaccent(v)] || [deaccent(v)]);
  const bad = list.filter((v) => !VIEWPORTS[v]);
  if (bad.length) { console.log(`Vistas desconocidas: ${bad.join(', ')}. Disponibles: ${Object.keys(VIEWPORTS).join(', ')} (o ${Object.keys(ALIASES).join(', ')})`); process.exit(2); }
  return list.length ? [...new Set(list)] : Object.keys(VIEWPORTS);
}

// ---------------- Sondas (se ejecutan en la página después de cada captura) ----------------
/* eslint-disable no-undef */
function probePage(o) {
  const F = []; const W = [];
  const vw = innerWidth; const vh = innerHeight;
  // Ancho configurado de la vista: en móvil emulado, innerWidth crece si algo desborda (el navegador «aleja» la página)
  const cfgW = o.vw || vw;
  const de = document.documentElement; const body = document.body;
  const short = (el) => {
    if (!el || el.nodeType !== 1) return String(el);
    if (el.id) return '#' + el.id;
    const c = [...el.classList].slice(0, 2).join('.');
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
    return el.tagName.toLowerCase() + (c ? '.' + c : '') + (t ? ` «${t}»` : '');
  };
  const shown = (el) => {
    if (!el || !el.isConnected) return false;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1;
  };
  const srOnly = (el) => { const r = el.getBoundingClientRect(); return r.width <= 2 || r.height <= 2; };
  const inView = (r) => r.top >= -1 && r.left >= -1 && r.bottom <= vh + 1 && r.right <= vw + 1;
  const hitsSelf = (el) => {
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2, 0), vw - 1); const y = Math.min(Math.max(r.top + r.height / 2, 0), vh - 1);
    const h = document.elementFromPoint(x, y);
    return { ok: !!h && (h === el || el.contains(h)), hit: h };
  };
  const modal = document.getElementById('modal');
  const modalOpen = !!modal && !modal.hidden && shown(modal);
  const cc = [...document.querySelectorAll('dialog[open]')].find((d) => d !== modal);
  const anyModal = modalOpen || !!cc;
  const screenEl = [...document.querySelectorAll('main .screen')].find((s) => !s.hidden);
  const screen = body.dataset.screen || (screenEl ? screenEl.id.replace('screen-', '') : (o.isGame ? '?' : 'externa'));
  const finale = body.classList.contains('finale-on');

  // 1) Sin desbordamiento horizontal: ni la página se desplaza a los lados ni hay contenido cortado por los bordes
  const sw = Math.max(de.scrollWidth, body ? body.scrollWidth : 0);
  const culprits = [];
  for (const el of document.querySelectorAll('body *')) {
    if (culprits.length >= 3) break;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || el.ownerSVGElement) continue; // el interior de un SVG cuenta como su <svg>
    if (!((r.right > cfgW + 1 && r.left < cfgW - 1) || (r.left < -1 && r.right > 1))) continue;
    if (!shown(el)) continue;
    let clipped = false; // dentro de un contenedor con scroll o recorte propio (p. ej. la sala desplazable): no cuenta
    for (let a = el.parentElement; a && a !== body && a !== de; a = a.parentElement) { if (getComputedStyle(a).overflowX !== 'visible') { clipped = true; break; } }
    if (clipped || culprits.some((c) => c.contains(el))) continue;
    culprits.push(el);
  }
  if (sw > cfgW + 1 || vw > cfgW + 1) F.push(`desbordamiento horizontal: la página mide ${Math.max(sw, vw)}px en ${cfgW}px (${culprits.map(short).join(', ') || '¿?'})`);
  else if (culprits.length) F.push(`contenido cortado por los bordes de la pantalla: ${culprits.map((c) => { const r = c.getBoundingClientRect(); return `${short(c)} [${Math.round(r.left)}…${Math.round(r.right)} de ${cfgW}]`; }).join(', ')}`);

  // 2) Juego: la página no se desplaza y la ventanilla y la bandeja se ven enteras
  if (screen === 'play') {
    const se = document.scrollingElement || de;
    if (se.scrollHeight > vh + 1) F.push(`la página de juego se desplaza (alto ${se.scrollHeight}px en ${vh}px)`);
    for (const sel of ['#dialog', '#tray']) {
      const el = document.querySelector(sel) || (sel === '#tray' ? document.querySelector('.inv-wrap') : null);
      if (!el || !shown(el)) { F.push(`${sel} no se ve en el juego`); continue; }
      const r = el.getBoundingClientRect();
      if (!inView(r)) F.push(`${sel} se sale de la pantalla (top ${Math.round(r.top)}, bottom ${Math.round(r.bottom)} de ${vh})`);
    }
    // 2b) En el teléfono la ventanilla enseña al menos 3 líneas de texto: las pistas viven ahí.
    //     (Con el aviso de cookies a la vista cede a propósito hasta una línea: body.cc-open, ui-play.css.)
    const db = document.querySelector('#dialog .dlg-body');
    if (o.phone && db && shown(db) && !body.classList.contains('cc-open')) {
      const lh = parseFloat(getComputedStyle(db).lineHeight) || parseFloat(getComputedStyle(db).fontSize) * 1.4;
      const lines = db.clientHeight / lh;
      if (lines < 2.95) F.push(`la ventanilla (.dlg-body) solo enseña ${lines.toFixed(1)} líneas (${db.clientHeight}px con líneas de ${Math.round(lh)}px; mínimo 3)`);
    }
  }

  // 3) Pantallas de papel en el teléfono: el botón principal a la vista y sin tapar
  if (o.phone && !anyModal && screenEl && screen !== 'play') {
    const prim = [...screenEl.querySelectorAll('.btn.primary')].filter(shown);
    if (prim.length) {
      const good = prim.filter((b) => inView(b.getBoundingClientRect()) && hitsSelf(b).ok);
      if (!good.length) {
        const b = prim[0]; const r = b.getBoundingClientRect(); const hs = hitsSelf(b);
        F.push(`el botón principal ${short(b)} no está a la vista sin desplazar (top ${Math.round(r.top)}, bottom ${Math.round(r.bottom)} de ${vh}${hs.ok ? '' : `; tapado por ${short(hs.hit)}`})`);
      }
    }
  }

  // 4) Ko-fi visible y pulsable cuando no hay modal ni final
  if (o.isGame && !anyModal && !finale) {
    const k = [...document.querySelectorAll('[data-kofi], #kofiFloat')].filter((el) => shown(el) && inView(el.getBoundingClientRect()));
    if (!k.length) F.push('ninguna entrada de Ko-fi ([data-kofi] o #kofiFloat) visible en pantalla');
    else if (!k.some((el) => hitsSelf(el).ok)) F.push(`el Ko-fi está tapado (${k.map((el) => `${short(el)} bajo ${short(hitsSelf(el).hit)}`).join('; ')})`);
  }

  // 5) Texto legible: ≥ 12px fuera de la sala (11px solo en las clases documentadas de DOC11); ≥ 10px dentro.
  //    Los glifos emoji (objetos, decorado, ☕) no son texto: no cuentan.
  const EMOJI_ONLY = /^(?:[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u200D\uFE0E\uFE0F\u20E3]|\s)+$/u;
  const DOC11 = '.dni-card .dni-data small, .s3-deed-row small, .s4-cred small, .s5-end-card small, .s2-wall, .s5-cal-g b, .s5-mz small, .is-new, .redact, .stamp, .modal-masthead, .wm-stamp';
  const small = new Map();
  const tw = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const txt = n.nodeValue.trim();
    if (!txt || EMOJI_ONLY.test(txt)) continue;
    const el = n.parentElement;
    if (!el || small.has(el) || el.closest('script,style,noscript,title,svg,.hs-emoji,.deco-emoji,.sub-emoji')) continue;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (fs >= 12) continue;
    if (!shown(el)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    const rr = rg.getBoundingClientRect();
    if (rr.width <= 2 || rr.height <= 2) continue; // sr-only y similares
    const inRoom = !!el.closest('#scene');
    if (inRoom) { if (fs < 10) small.set(el, `${short(el)} ${fs}px (sala)`); continue; }
    if (fs >= 11 && el.closest(DOC11)) continue;
    small.set(el, `${short(el)} ${fs}px`);
  }
  if (small.size) F.push(`texto demasiado pequeño (${small.size}): ${[...small.values()].slice(0, 6).join('; ')}${small.size > 6 ? '…' : ''}`);

  // 6) Centros de hotspots: cada uno recibe su propio toque (nada de flechas, chips ni avisos encima)
  const sceneBox = document.getElementById('sceneBox') || document.querySelector('.scene-box');
  const won = (sceneBox && sceneBox.classList.contains('won')) || !!document.querySelector('#scene.won');
  if (screen === 'play' && !anyModal && !won) {
    const wrap = document.getElementById('sceneWrap') || document.getElementById('scene');
    const wr = wrap ? wrap.getBoundingClientRect() : null;
    for (const hs of document.querySelectorAll('#scene .hs')) {
      if (hs.hidden || !shown(hs)) continue;
      const r = hs.getBoundingClientRect();
      const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
      if (!wr || cx < wr.left + 1 || cx > wr.right - 1 || cy < wr.top + 1 || cy > wr.bottom - 1) continue; // fuera de lo visible (sala desplazada)
      if (cx < 0 || cy < 0 || cx >= vw || cy >= vh) continue;
      const h = document.elementFromPoint(cx, cy);
      const owner = h && h.closest('.hs');
      const id = hs.dataset.id || short(hs);
      if (owner === hs) continue;
      // Desviación deliberada: si lo tapa OTRO hotspot solo se avisa (el contenido de las temporadas está congelado y
      // tests/run.js ya avisa de los solapamientos); cualquier otra cosa encima (flechas, chips, avisos) falla.
      if (owner) W.push(`el hotspot «${owner.dataset.id}» tapa el centro de «${id}»`);
      else F.push(`el centro del hotspot «${id}» lo tapa ${short(h)}${h && h.closest('.pan') ? ' (flecha de desplazamiento)' : ''}`);
    }
  }

  // 6b) El justificante (toast) nunca tapa la sala
  if (screen === 'play' && sceneBox) {
    const t = document.getElementById('toast');
    if (t && shown(t) && (t.textContent || '').trim()) {
      const A = t.getBoundingClientRect(); const B = sceneBox.getBoundingClientRect();
      const ix = Math.min(A.right, B.right) - Math.max(A.left, B.left); const iy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      if (ix > 1 && iy > 1) F.push(`el aviso #toast tapa la sala (${Math.round(ix)}×${Math.round(iy)} px)`);
    }
  }

  // 7) Táctil: objetivos de 44×44 px fuera de la sala (salvo enlaces dentro de un texto)
  if (o.touch) {
    const scope = cc || (modalOpen ? modal : body);
    // Solo los tableros densos que no caben a 44 px en 320 px de ancho avisan (si miden ≥ 24). Teclado (.kp-grid),
    // filas de partidos (.party-grid) y opciones (.opt-grid) son botones normales: < 44 px falla.
    const BOARDS = '.cal-grid, .tile-grid, .s2-grid, #s5-maze, .s5-cal-g, .s3-lo-grid';
    const sel = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="switch"], [role="radio"], [role="checkbox"], [role="tab"], [tabindex]:not([tabindex="-1"])';
    const bad = []; const meh = [];
    for (const el of scope.querySelectorAll(sel)) {
      if (el.closest('#scene') || el.disabled || el.closest('[inert], [aria-hidden="true"], .vum-native')) continue;
      if (scope === body && el.closest('#modal, dialog')) continue;
      if (!shown(el) || srOnly(el)) continue;
      const cs = getComputedStyle(el);
      if (el.matches('a, .linklike') && cs.display === 'inline') {
        const host = el.parentElement;
        if (host && host.textContent.trim().length > el.textContent.trim().length + 2) continue; // enlace dentro de un texto
      }
      let r = el.getBoundingClientRect();
      const lab = el.matches('input[type="checkbox"], input[type="radio"]') ? (el.closest('label') || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`))) : null;
      if (lab) { const lr = lab.getBoundingClientRect(); r = { width: Math.max(r.width, lr.width), height: Math.max(r.height, lr.height) }; }
      // Zona de toque ampliada con un ::before/::after absoluto (p. ej. un chip de 32 px con 44 px de zona útil)
      for (const pe of ['::before', '::after']) {
        const ps = getComputedStyle(el, pe);
        if (ps.content === 'none' || ps.content === 'normal' || ps.position !== 'absolute' || ps.pointerEvents === 'none' || ps.display === 'none') continue;
        r = { width: Math.max(r.width, parseFloat(ps.width) || 0), height: Math.max(r.height, parseFloat(ps.height) || 0) };
      }
      if (r.width >= 43.5 && r.height >= 43.5) continue;
      const d = `${short(el)} ${Math.round(r.width)}×${Math.round(r.height)}`;
      if (el.closest(BOARDS) && r.width >= 24 && r.height >= 24) meh.push(d); else bad.push(d);
    }
    if (bad.length) F.push(`objetivos táctiles < 44×44 (${bad.length}): ${bad.slice(0, 6).join('; ')}${bad.length > 6 ? '…' : ''}`);
    if (meh.length) W.push(`casillas de tablero < 44×44 pero ≥ 24 (${meh.length}): ${meh.slice(0, 4).join('; ')}${meh.length > 4 ? '…' : ''}`);
  }

  // 8) El sello no pisa el título (resolución y final)
  const pairs = { win: ['#winStamp', '#winTitle'], end: ['#endStamp', '#endTitle'] }[screen];
  if (pairs) {
    const [a, b] = pairs.map((s) => document.querySelector(s));
    if (a && b && shown(a) && shown(b)) {
      const A = a.getBoundingClientRect(); const B = b.getBoundingClientRect();
      const ix = Math.min(A.right, B.right) - Math.max(A.left, B.left); const iy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      if (ix > 1 && iy > 1) F.push(`el sello ${pairs[0]} pisa el título ${pairs[1]} (${Math.round(ix)}×${Math.round(iy)} px)`);
    }
  }
  // 9) Capas en un navegador real (jsdom no entiende @layer): ninguna regla de nuestras hojas fuera de @layer y la CSS
  //    de cada temporada inyectada como un único bloque «@layer seasons{…}» (si no, ganaría a @layer overrides).
  if (typeof CSSLayerBlockRule === 'function') {
    const isA = (r, ctor) => typeof window[ctor] === 'function' && r instanceof window[ctor];
    const topOk = (r) => isA(r, 'CSSLayerBlockRule') || isA(r, 'CSSLayerStatementRule') || isA(r, 'CSSFontFaceRule') || isA(r, 'CSSPropertyRule')
      || (r.constructor && r.constructor.name === 'CSSViewTransitionRule') || (isA(r, 'CSSImportRule') && r.layerName != null);
    const wrapper = (r) => isA(r, 'CSSSupportsRule') || isA(r, 'CSSMediaRule') || isA(r, 'CSSContainerRule');
    const loose = [];
    const walk = (rules, where) => {
      for (const r of rules) {
        if (topOk(r)) continue;
        if (wrapper(r)) { walk(r.cssRules, where); continue; }
        loose.push(`${where}: ${r.cssText.replace(/\s+/g, ' ').slice(0, 50)}`);
      }
    };
    for (const sh of document.styleSheets) {
      if (sh.href && !sh.href.startsWith(location.origin)) continue;
      let rules; try { rules = sh.cssRules; } catch (e) { continue; }
      const own = sh.ownerNode;
      const where = sh.href ? sh.href.slice(location.origin.length + 1).split('?')[0] : (own && own.dataset && own.dataset.season ? `<style data-season="${own.dataset.season}">` : '<style>');
      walk(rules, where);
    }
    if (loose.length) F.push(`CSS fuera de @layer en el navegador (${loose.length}): ${loose.slice(0, 3).join('; ')}${loose.length > 3 ? '…' : ''}`);
    const notSeasons = [...document.querySelectorAll('style[data-season]')].filter((st) => {
      const rs = st.sheet ? [...st.sheet.cssRules] : [];
      return !(rs.length === 1 && isA(rs[0], 'CSSLayerBlockRule') && rs[0].name === 'seasons');
    }).map((st) => st.dataset.season);
    if (notSeasons.length) F.push(`CSS de temporada fuera de un único «@layer seasons{…}» (temporadas ${notSeasons.join(', ')}; lo inyecta js/core.js)`);
  }
  return { screen, fails: F, warns: W };
}
/* eslint-enable no-undef */

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.max(1, n) }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}

async function main() {
  const vps = pickViewports();
  const scenes = pickScenes();
  const motion = !!FLAGS.motion;
  const par = Math.max(1, parseInt(FLAGS.paralelo, 10) || 4);
  const srv = await serve();
  const base = `http://localhost:${srv.address().port}/`;
  const browser = await chromium.launch({ channel: 'msedge', headless: true }).catch(() => chromium.launch({ channel: 'chrome', headless: true }));
  const jobs = vps.flatMap((vp) => scenes.map((sc) => ({ vp, sc })));
  for (const vp of vps) fs.mkdirSync(path.join(OUT, vp), { recursive: true });
  let n = 0; const errors = []; const skips = []; const report = [];
  console.log(`${jobs.length} capturas (${vps.length} vista${vps.length > 1 ? "s" : ""} × ${scenes.length} escena${scenes.length > 1 ? "s" : ""})${motion ? ', con animaciones' : ''}; sondas ${STRICT ? 'ESTRICTAS' : 'en modo aviso (rediseño incompleto: --estricto para forzar)'}…`);
  await pool(jobs, par, async ({ vp, sc }) => {
    const opt = VIEWPORTS[vp];
    const ctx = await browser.newContext({ ...opt, reducedMotion: motion ? 'no-preference' : 'reduce', locale: 'es-ES' });
    await ctx.route(/posthog|ko-fi\.com/, (r) => r.abort());
    if (sc.init !== 'fresh') await ctx.addInitScript(sc.init === 'first' ? FIRST_VISIT : UNLOCK);
    const page = await ctx.newPage();
    const tag = `${vp}/${sc.name}`;
    page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
    try {
      await page.goto(base + (sc.url || '?prueba=1'), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await sc.run(page);
      await page.waitForTimeout(motion ? 1800 : 350);
      await page.screenshot({ path: path.join(OUT, vp, sc.name + '.png'), fullPage: false });
      n++;
      const touch = !!opt.hasTouch; const { width: w, height: h } = opt.viewport;
      const res = await page.evaluate(probePage, { touch, phone: touch && (w <= 760 || h <= 520), isGame: !sc.url, vw: w, vh: h });
      report.push({ vista: vp, escena: sc.name, pantalla: res.screen, fallos: res.fails, avisos: res.warns });
    } catch (e) {
      if (e instanceof Skip) skips.push(`${tag}: ${e.message}`);
      else errors.push(`${tag}: ${e.message.split('\n')[0]}`);
    }
    await ctx.close();
  });
  await browser.close(); srv.close();

  const order = (a, b) => vps.indexOf(a.vista) - vps.indexOf(b.vista) || a.escena.localeCompare(b.escena);
  report.sort(order);
  fs.writeFileSync(path.join(OUT, 'informe.json'), JSON.stringify({ fecha: new Date().toISOString(), estricto: STRICT, rediseno: REDESIGN, animaciones: motion, capturas: report, errores: errors, omitidas: skips }, null, 2));
  const fails = report.flatMap((r) => r.fallos.map((f) => `${r.vista}/${r.escena}: ${f}`));
  const warns = report.flatMap((r) => r.avisos.map((f) => `${r.vista}/${r.escena}: ${f}`));
  console.log(`${n} capturas en ${OUT}`);
  // Agrupa «vista/escena: mensaje» por tipo de mensaje (para que el resumen quepa en la consola)
  const kind = (m) => m.replace(/\s*\(.*$/s, '').replace(/:.*$/s, '').replace(/«[^»]*»/g, '«…»').replace(/#[\w-]+/g, '#…').trim();
  const grouped = (list) => {
    const m = new Map();
    for (const x of list) {
      const i = x.indexOf(': '); const where = x.slice(0, i); const msg = x.slice(i + 2); const k = kind(msg);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push({ where, msg });
    }
    return [...m].sort((a, b) => b[1].length - a[1].length);
  };
  if (skips.length) {
    console.log(`\nEscenas omitidas (${skips.length}; necesitan algo que este código aún no tiene):`);
    for (const [, xs] of grouped(skips)) console.log(`  ⏭ ${xs[0].where.split('/')[1]}: ${xs[0].msg} (${xs.length} vista${xs.length > 1 ? 's' : ''})`);
  }
  if (fails.length && STRICT) console.log(`\nSondas FALLIDAS (${fails.length}):\n  ✗ ` + fails.join('\n  ✗ '));
  else if (fails.length) {
    console.log(`\nSondas que fallarán cuando el rediseño esté completo (${fails.length}; detalle en informe.json):`);
    for (const [k, xs] of grouped(fails)) console.log(`  ⚠ ${k} ×${xs.length} — p. ej. ${xs[0].where}: ${xs[0].msg.slice(0, 150)}`);
  }
  if (warns.length > 20) {
    console.log(`\nAvisos (${warns.length}; detalle en informe.json):`);
    for (const [k, xs] of grouped(warns)) console.log(`  ⚠ ${k} ×${xs.length} — p. ej. ${xs[0].where}: ${xs[0].msg.slice(0, 150)}`);
  } else if (warns.length) console.log(`\nAvisos (${warns.length}):\n  ⚠ ` + warns.join('\n  ⚠ '));
  if (errors.length) console.log('\nErrores:\n  ' + errors.join('\n  '));
  if (!fails.length && !errors.length) console.log('\nSondas: todo correcto');
  console.log(`Informe completo: ${path.join(OUT, 'informe.json')}`);
  if (errors.length || (STRICT && fails.length)) process.exitCode = 1;
}

module.exports = { VIEWPORTS, SCENES, probePage, UNLOCK, FIRST_VISIT };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
