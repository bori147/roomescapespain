/* ==========================================================
   VUELVA USTED MAÑANA — Motor del juego (con temporadas)
   ----------------------------------------------------------
   - Contrato DOM: ver index.html (spec §5). Los estilos viven en css/*.css
     y los «potenciadores» (js/ui-puzzles.js, js/ui-fx.js) escuchan los
     eventos vum:* que se emiten aquí (spec §5.4).
   - Todo lo moderno (<dialog>, popover, View Transitions, visualViewport,
     ResizeObserver, vibrate, share, clipboard…) se detecta antes de usarse;
     jsdom (tests/run.js) recorre siempre el camino síncrono de reserva.
   - g.win, closeModal y give cambian el estado de forma síncrona.
   ========================================================== */
(function () {
  'use strict';

  const SEASONS = window.SEASONS.filter(Boolean);
  const CONFIG = window.GAME_CONFIG || {};
  const SAVE_PREFIX = 'roomescapespain.save.s';   // + nº de temporada
  const META_KEY = 'roomescapespain.meta.v2';
  const OLD_SAVE_KEY = 'roomescapespain.save.v1';
  const OLD_META_KEY = 'roomescapespain.meta.v1';
  const RESUME_KEY = 'roomescapespain.resume';    // sessionStorage: volver de las páginas legales
  const BRAND = 'Vuelva usted mañana';
  const SITE_URL = (CONFIG.legal && CONFIG.legal.web) || 'https://bori147.github.io/roomescapespain/';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const pad2 = (n) => String(n).padStart(2, '0');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ico = (id) => `<svg class="ico" width="20" height="20" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const later = (fn, ms) => setTimeout(fn, ms);

  // Consultas de medios a prueba de entornos sin matchMedia
  const mq = (q) => { try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch (e) { return false; } };
  const isTouch = () => mq('(pointer: coarse)');
  const isFine = () => mq('(pointer: fine)');
  const RM = () => mq('(prefers-reduced-motion: reduce)');
  const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = () => !!(navigator.standalone || mq('(display-mode: standalone)'));
  const saveData = () => !!(navigator.connection && navigator.connection.saveData);
  // En pantallas táctiles se dice «toca» en lugar de «haz clic»
  const tap = (cap) => (isTouch() ? (cap ? 'Toca' : 'toca') : (cap ? 'Haz clic en' : 'haz clic en'));

  function readLS(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function writeLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function removeLS(k) { try { localStorage.removeItem(k); } catch (e) { /* nada */ } }

  const seasonById = (id) => SEASONS.find((s) => s.id === id);
  // Analítica (solo si el jugador la ha aceptado; ver js/analytics.js)
  const track = (event, props) => { try { if (window.Track) window.Track(event, props); } catch (e) { /* nada */ } };
  const plainTitle = (t) => String(t || '').replace(/<[^>]+>/g, '').replace(/[🌀-🫿☀-➿️]/gu, '').trim();

  // Texto plano de un fragmento HTML (sin ejecutar nada: <template> es inerte)
  const tpl = document.createElement('template');
  function strip(html) {
    tpl.innerHTML = String(html == null ? '' : html);
    return tpl.content.textContent.replace(/\s+/g, ' ').trim();
  }
  // Emoji inicial de un texto («💾 Partida cargada» → 💾 + «Partida cargada»)
  const EMOJI_LEAD = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍|⃣|\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator})*)\s*/u;
  function splitEmoji(s) {
    const m = EMOJI_LEAD.exec(String(s || ''));
    return m ? { emoji: m[1], rest: String(s).slice(m[0].length) } : { emoji: '', rest: String(s || '') };
  }
  const GLYPH = /^(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*|[\s\S])/u;
  const firstGlyph = (s) => { const m = GLYPH.exec(String(s || '').trim()); return m ? m[0] : ''; };
  const isEmojiOnly = (s) => !!s && !String(s).replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}‍️⃣\s]/gu, '');

  // ---------------- Estado ----------------
  let S = null;          // estado de la partida (temporada actual)
  let SEA = null;        // temporada actual
  let L = null;          // nivel actual
  let ITEMS = {};        // objetos de la temporada actual
  let selected = null;
  let queue = [];
  let current = null;
  let pendingWin = false;
  let ctx = null;        // contexto del clic en curso: { who, face, srcId }
  let screen = 'menu';
  let modalKey = null;
  let modalMeta = null;  // { card, body, title, cls, opener, pauseClock }
  let viewSeason = null; // temporada mostrada en la pantalla de temporada
  let booted = false;

  // ---------------- Meta (progreso global) ----------------
  const meta = Object.assign({ v: 2, progress: {}, done: {}, muted: false, last: null }, readLS(META_KEY) || {});
  const progressOf = (sid) => meta.progress[sid] || 0;
  const isUnlocked = (sid) => sid === 1 || !!meta.done[sid - 1] || progressOf(sid) > 0;
  (function migrate() {
    const oldMeta = readLS(OLD_META_KEY);
    if (oldMeta) {
      meta.progress[1] = Math.max(meta.progress[1] || 1, oldMeta.maxLevel || 1);
      if (oldMeta.finished) meta.done[1] = true;
      meta.muted = !!oldMeta.muted;
      removeLS(OLD_META_KEY);
    }
    const oldSave = readLS(OLD_SAVE_KEY);
    if (oldSave && oldSave.level) {
      oldSave.season = 1; oldSave.v = 2;
      if (!readLS(SAVE_PREFIX + 1)) writeLS(SAVE_PREFIX + 1, oldSave);
      meta.last = meta.last || 1;
      removeLS(OLD_SAVE_KEY);
    }
    // Campos nuevos (compatibles con partidas antiguas): preferencias de interfaz,
    // marcas por trámite y por temporada, y temporadas cuyo desbloqueo ya se vio.
    const obj = (v) => (v && typeof v === 'object' ? v : {});
    meta.ui = obj(meta.ui); meta.records = obj(meta.records); meta.best = obj(meta.best);
    if (!meta.seenUnlock || typeof meta.seenUnlock !== 'object') {
      meta.seenUnlock = {};
      SEASONS.forEach((s) => { if (s.id > 1 && isUnlocked(s.id)) meta.seenUnlock[s.id] = true; });
    }
    writeLS(META_KEY, meta);
  })();

  function newState(season, level) {
    return { v: 2, season, level, flags: {}, inv: [], hintIdx: 0, totalHints: 0, elapsed: 0, finished: false };
  }
  const saveKey = (sid) => SAVE_PREFIX + sid;
  function save() {
    if (S) writeLS(saveKey(S.season), S);
    writeLS(META_KEY, meta);
  }
  const readSave = (sid) => {
    const s = readLS(saveKey(sid));
    return s && s.level && seasonById(sid) && s.level <= seasonById(sid).levels.length ? s : null;
  };

  // ---------------- Código de expediente ----------------
  // Nuevo formato (5 cifras): temporada + nivel + pistas → EXP-XXXXX-X
  // Formato antiguo (4 cifras): solo nivel + pistas de la temporada 1.
  function checksum(body) {
    let sum = 0;
    for (let i = 0; i < body.length; i++) sum += body.charCodeAt(i) * (i + 3);
    return String.fromCharCode(65 + (sum % 26));
  }
  function makeCode(season, level, hints) {
    const n = (season * 100 + level) * 100 + Math.min(hints, 99);
    const body = (n * 37 + 1234).toString(36).toUpperCase().padStart(5, '0');
    return `EXP-${body}-${checksum(body)}`;
  }
  function readCode(code) {
    const c = String(code).toUpperCase().replace(/[^0-9A-Z]/g, '');
    const m = c.match(/^(?:EXP)?([0-9A-Z]{4,5})([A-Z])$/);
    if (!m || checksum(m[1]) !== m[2]) return null;
    const x = parseInt(m[1], 36) - 1234;
    if (x < 0 || x % 37 !== 0) return null;
    const n = x / 37;
    let season; let level; const hints = n % 100;
    if (m[1].length === 4) { season = 1; level = Math.floor(n / 100); }
    else { season = Math.floor(n / 10000); level = Math.floor(n / 100) % 100; }
    const sea = seasonById(season);
    if (!sea || level < 1 || level > sea.levels.length) return null;
    return { season, level, hints };
  }
  // Formato en vivo del campo de código: EXP-{cuerpo}-{control}
  function fmtCode(v) {
    let c = String(v).toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!c) return '';
    if (c.length < 3 && 'EXP'.startsWith(c)) return c;
    if (c.startsWith('EXP')) c = c.slice(3);
    c = c.slice(0, 6);
    if (c.length === 6) return `EXP-${c.slice(0, 5)}-${c[5]}`;
    if (c.length === 5 && readCode(c)) return `EXP-${c.slice(0, 4)}-${c[4]}`; // código antiguo
    return `EXP-${c}`;
  }

  // ---------------- Eventos para los potenciadores (spec §5.4) ----------------
  function emit(name, detail) {
    try { document.dispatchEvent(new CustomEvent('vum:' + name, { detail: detail || {} })); } catch (e) { /* nada */ }
  }

  // ---------------- Vibración ----------------
  const HAPTICS = { tap: 8, pick: [12, 40, 18], ok: [15, 30, 15, 30, 60], bad: [40, 60, 40], buzz: [40, 60, 40], stamp: 35, win: [20, 60, 20, 60, 120], season: [30, 40, 80, 60, 160] };
  const canVibrate = () => typeof navigator.vibrate === 'function';
  function haptic(kind) {
    try {
      const p = HAPTICS[kind];
      if (!p || !canVibrate() || !isTouch() || meta.noHaptics || document.visibilityState !== 'visible') return;
      navigator.vibrate(p);
    } catch (e) { /* nada */ }
  }

  // ---------------- Audio ----------------
  let actx = null; let master = null; let noiseBuf = null;
  const lastSfx = {};
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { if (navigator.audioSession) navigator.audioSession.type = 'ambient'; } catch (e) { /* nada */ }
      actx = new AC();
      const out = actx.createGain(); out.gain.value = 0.8;
      if (actx.createDynamicsCompressor) { const comp = actx.createDynamicsCompressor(); comp.connect(out); master = comp; } else master = out;
      out.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  const jit = (x, p) => x * (1 + (Math.random() * 2 - 1) * p);
  // Variación por sonido (no por nota, para que los acordes no desafinen entre sí)
  let pJit = 1; let gJit = 1;
  function tone(freq, dur, type = 'sine', vol = 0.07, delay = 0) {
    const t = actx.currentTime + delay;
    freq *= pJit; vol *= gJit;
    const o = actx.createOscillator(); const gn = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, { type = 'lowpass', f0 = 1000, f1 = 0, q = 0.7, vol = 0.1, delay = 0 } = {}) {
    if (!noiseBuf) {
      noiseBuf = actx.createBuffer(1, Math.floor(actx.sampleRate * 0.5), actx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = actx.currentTime + delay;
    f0 *= pJit; if (f1) f1 *= pJit; vol *= gJit;
    const src = actx.createBufferSource(); src.buffer = noiseBuf;
    const f = actx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const gn = actx.createGain(); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(gn); gn.connect(master); src.start(t); src.stop(t + dur + 0.02);
  }
  // La vibración va ANTES de mirar el silencio: g.sfx de las temporadas también vibra.
  function sfx(kind, arg) {
    const now = Date.now();
    if (lastSfx[kind] && now - lastSfx[kind] < 60) return;
    lastSfx[kind] = now;
    haptic(kind);
    if (meta.muted) return;
    try {
      if (!audio()) return;
      pJit = kind === 'click' || kind === 'type' ? 1 : jit(1, 0.025);
      gJit = kind === 'click' || kind === 'type' ? 1 : jit(1, 0.08);
      switch (kind) {
        case 'click': tone(jit(520, 0.04), 0.04, 'square', jit(0.03, 0.1)); break;
        case 'type': noise(0.02, { type: 'bandpass', f0: jit(3000, 0.04), q: 1.4, vol: jit(0.12, 0.1) }); tone(jit(1200, 0.04), 0.025, 'square', jit(0.018, 0.1)); break;
        case 'pick': {
          const n = Math.max(1, Math.min(3, arg | 0 || 1));
          [660, 740, 830].slice(0, n).forEach((f, i) => tone(f, 0.08, 'sine', 0.07, i * 0.07));
          tone(990, 0.12, 'sine', 0.07, n * 0.07);
          break;
        }
        case 'ok': tone(523, 0.1); tone(659, 0.1, 'sine', 0.07, 0.09); tone(784, 0.18, 'sine', 0.07, 0.18); break;
        case 'bad': tone(160, 0.25, 'sawtooth', 0.05); break;
        case 'buzz': tone(196, 0.09, 'square', 0.05); tone(196, 0.09, 'square', 0.05, 0.15); break;
        case 'stamp': noise(0.06, { type: 'lowpass', f0: 400, vol: 0.55 }); tone(70, 0.18, 'sine', 0.22); break;
        case 'win': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.07, i * 0.12)); break;
        case 'season':
          [392, 523, 659, 784, 659, 1046].forEach((f, i) => tone(f, 0.14, 'triangle', 0.07, i * 0.11));
          [523, 659, 784].forEach((f) => tone(f, 0.5, 'triangle', 0.045, 0.66));
          break;
        case 'paper': noise(0.18, { type: 'lowpass', f0: 4000, f1: 800, vol: 0.12 }); break;
        case 'bell': tone(1318, 0.9, 'sine', 0.06); tone(2637, 0.9, 'sine', 0.025); break;
        default: break;
      }
    } catch (e) { /* sin audio */ }
  }

  // ---------------- Regiones vivas ----------------
  function announce(text, urgent) {
    const m = $('#modal');
    let t = !m.hidden ? $('.modal-status', m) : null;
    if (t) t.setAttribute('aria-live', urgent ? 'assertive' : 'polite');
    else t = $(urgent ? '#srAlert' : '#srPolite');
    if (!t) return;
    t.textContent = '';
    later(() => { t.textContent = text; }, 50);
  }

  // ---------------- API para los niveles ----------------
  const g = {
    flag: (k) => S.flags[k],
    set: (k, v = true) => { S.flags[k] = v; },
    has: (id) => S.inv.includes(id),
    give(id) {
      if (!ITEMS[id]) throw new Error(`Objeto desconocido: ${id}`);
      if (S.inv.includes(id)) return;
      S.inv.push(id);
      newItems.add(id);
      queueGive(id);
    },
    take(id) { S.inv = S.inv.filter((x) => x !== id); newItems.delete(id); if (selected === id) setSelected(null); },
    say: (text, who) => say(text, who),
    doc(title, html) { modal({ title, html: `<div class="doc-body">${html}</div>`, cls: 'doc', kind: 'doc', sys: true, buttons: [{ label: 'Entendido', cls: 'ghost' }] }); },
    modal: (o) => modal(o),
    closeModal: () => closeModal('commit'),
    input: (o) => input(o),
    choice: (o) => choice(o),
    win() {
      if (pendingWin) return;
      pendingWin = true;
      renderDialog();
      const sc = $('#scene'); if (sc) sc.classList.add('won');
      wonPresentation();
      emit('win', {});
    },
    sfx,
    refresh: () => refresh(),
    get season() { return S.season; },
    get level() { return S.level; },
  };

  // ---------------- Ventanilla (diálogo) ----------------
  let msgSeq = 0; let shownSeq = -1; let batchIdx = 0; let batchTotal = 0;
  let log = [];
  let kbOrigin = null;   // { kind: 'hs'|'slot', id } del toque por teclado que abrió una cola
  let idleSecs = 0;
  const NUDGES = [
    'El funcionario carraspea. ¿Ha examinado usted todo lo de la sala?',
    'Consejo de la casa: los objetos de tu bandeja se pueden combinar entre sí.',
    'Pruebe la 🔍 Lupa: señala todo lo que se puede tocar.',
  ];
  const STUCK = '¿Atascado/a? La Ventanilla de Pistas 💡 atiende sin cita previa.';
  const DEFAULT_FACE = { speech: '💬', narration: '👀', item: '🎒', system: '📎' };

  function pushLog(m, unread) {
    log.push({ who: m.who ? strip(m.who) : '', face: m.face || '', text: m.text, unread: !!unread });
    if (log.length > 40) log.splice(0, log.length - 40);
  }
  // say(text, who, { kind, face, srcId }) — g.say(text, who) no cambia
  function say(text, who, opts) {
    const o = opts || {};
    let w = who === undefined ? (ctx ? ctx.who : null) : who;
    let face = o.face || null;
    if (who !== undefined && who && !face) {
      const sp = splitEmoji(strip(who));
      if (sp.emoji) { face = firstGlyph(sp.emoji); w = sp.rest || w; }
    }
    // Quien habla desde un objeto de la sala lleva su emoji (solo si es ese mismo hablante)
    if (!face && ctx && (who === undefined || (who && ctx.who && strip(who) === strip(ctx.who)))) face = ctx.face;
    const kind = o.kind || (/^[—–]/.test(strip(text)) ? 'speech' : 'narration');
    const srcId = o.srcId !== undefined ? o.srcId : (ctx ? ctx.srcId : null);
    queue.push({ text, who: w, face, kind, srcId, seq: ++msgSeq });
    emit('say', { kind, queued: !!current });
    if (!current) { batchIdx = 0; batchTotal = 0; }
    batchTotal++;
    if (!current) nextMsg();
    else renderDialog();
  }
  function nextMsg() {
    const inActs = actsFocused(); // antes de renderDialog: al ocultarse .dlg-actions el foco cae a <body>
    current = queue.shift() || null;
    if (current) { batchIdx++; pushLog(current, false); } else { batchIdx = 0; batchTotal = 0; }
    idleSecs = 0;
    renderDialog();
    if (!queue.length) endKeyboardQueue(inActs);
  }
  function clearQueue() {
    queue.forEach((m) => pushLog(m, true));
    queue = []; current = null; batchIdx = 0; batchTotal = 0;
    renderDialog();
  }
  // «Saltar»: salta a la última línea; las intermedias quedan «Sin leer» en el registro
  function skipQueue() {
    if (!queue.length) return;
    const inActs = actsFocused();
    const last = queue.pop();
    queue.forEach((m) => pushLog(m, true));
    queue = [];
    current = last; pushLog(last, false);
    batchIdx = batchTotal;
    renderDialog();
    endKeyboardQueue(inActs);
  }
  function actsFocused() {
    const a = document.activeElement;
    return !!(a && a.closest && a.closest('#dialog .dlg-actions'));
  }
  // Fin de cola: el foco nunca se queda en <body>. Con origen de teclado vuelve al objeto o casilla
  // que la abrió; si no (cola abierta con ratón o dedo) y el foco estaba en «Siguiente»/«Saltar»,
  // va al objeto que habla o al título de la sala.
  function endKeyboardQueue(inActs) {
    if (!kbOrigin) {
      if (!inActs && !actsFocused()) return;
      if (pendingWin && isFine()) { focusEl($('#btnFinish')); return; }
      const src = current && current.srcId;
      focusEl((src && visibleHs(src)) || $('#playTitle'));
      return;
    }
    const o = kbOrigin; kbOrigin = null;
    const a = document.activeElement;
    if (a && a !== document.body && !(a.closest && a.closest('#dialog'))) return; // el jugador ya está en otra parte
    if (pendingWin && isFine()) { focusEl($('#btnFinish')); return; }
    focusEl(o.kind === 'slot' ? (invNodes.get(o.id) || firstSlot()) : (visibleHs(o.id) || nextVisibleHs(o.id)) || $('#playTitle'));
  }
  function nudge() {
    const b = $('#btnNextMsg'); if (!b) return;
    b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge');
  }

  function idleText() {
    if (!S || !L) return '';
    if (idleSecs >= 120 && S.hintIdx < (L.hints || []).length) return STUCK;
    if (idleSecs >= 45) return NUDGES[Math.floor((idleSecs - 45) / 20) % NUDGES.length];
    if (S.season === 1 && S.level <= 2) {
      return isTouch()
        ? 'Toca los objetos de la sala para examinarlos. Para usar algo de tu bandeja, tócalo y luego toca dónde usarlo.'
        : 'Haz clic en los objetos de la sala para examinarlos. Para usar algo de tu bandeja, selecciónalo y luego haz clic donde quieras usarlo.';
    }
    return `🎯 ${goalOf(L)}`;
  }
  function updateIdle() {
    const e = $('#dlgIdle'); if (!e) return;
    const t = idleText();
    if (e.textContent !== t) e.textContent = t;
  }
  const useLine = () => `👉 ${tap(true)} algo de la sala para usarlo, o ${tap()} otro objeto para combinarlos.`;

  function renderDialog() {
    const d = $('#dialog');
    if (!d || !S) return;
    const msg = $('#dlgMsg'); const idle = $('#dlgIdle'); const face = $('#dlgFace'); const who = $('#dlgWho');
    if (current) {
      d.dataset.skin = current.kind;
      face.textContent = current.face || DEFAULT_FACE[current.kind] || '';
      who.textContent = current.who ? strip(current.who) : '';
      if (shownSeq !== current.seq) {
        shownSeq = current.seq;
        msg.innerHTML = current.text + (current.kind === 'item' && selected ? `<p class="dlg-use">${useLine()}</p>` : '');
        d.classList.remove('fresh'); void d.offsetWidth; d.classList.add('fresh');
      }
      idle.hidden = true;
    } else {
      d.dataset.skin = 'idle';
      face.textContent = ''; who.textContent = '';
      if (shownSeq !== 0) { shownSeq = 0; msg.innerHTML = ''; d.classList.remove('fresh'); }
      idle.hidden = pendingWin;
      updateIdle();
    }
    $('.dlg-actions', d).hidden = !queue.length;
    $('.dlg-count', d).textContent = queue.length ? `· ${batchIdx}/${batchTotal}` : '';
    d.classList.toggle('queued', !!queue.length);
    $('#btnFinish').hidden = !(pendingWin && !queue.length);
    raf(() => { d.classList.toggle('overflows', msg.scrollHeight > msg.clientHeight + 1); });
    schedulePan();
  }

  // ---------------- Avisos («Justificante») ----------------
  let toastT = null; let toastHideT = null;
  function toast(html, ms) {
    const t = $('#toast'); if (!t) return;
    clearTimeout(toastT); clearTimeout(toastHideT);
    t.innerHTML = html;
    try { if (typeof t.showPopover === 'function' && !t.matches(':popover-open')) t.showPopover(); } catch (e) { /* sin popover */ }
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    toastT = later(hideToast, ms || 2400);
  }
  function hideToast() {
    const t = $('#toast'); if (!t) return;
    t.classList.remove('show');
    toastHideT = later(() => { try { if (typeof t.hidePopover === 'function' && t.matches(':popover-open')) t.hidePopover(); } catch (e) { /* nada */ } }, 240);
  }
  // Mientras hay un modal abierto, el aviso se «grapa» a su cabecera
  function modalChip(text) {
    const box = $('#modal .modal-chips'); if (!box) return;
    const c = el('span', 'stamp sm', esc(text));
    box.append(c);
    later(() => c.remove(), 2400);
  }
  function notify(text) {
    if (!$('#modal').hidden) modalChip(text); else toast(`<span class="toast-b">${esc(text)}</span>`, 2600);
    announce(text); // el aviso es un popover que aparece ya relleno: los lectores no siempre lo leen
  }

  // Objetos recibidos: se agrupan los de una misma acción (un solo sonido y un solo aviso)
  let giveBatch = []; let giveTimer = null; let giveToast = { ids: [], at: 0 };
  let lastModal = null; // { rect, at } del último modal cerrado
  function rectOf(node) {
    try { const r = node.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? { left: r.left, top: r.top, width: r.width, height: r.height } : null; } catch (e) { return null; }
  }
  function srcRectNow() {
    if (ctx && ctx.srcId) { const n = hsNodes.get(ctx.srcId); if (n && !n.hidden) { const r = rectOf(n); if (r) return r; } }
    const m = $('#modal');
    if (!m.hidden) { const c = $('.modal-card', m); const r = c && rectOf(c); if (r) return r; }
    if (lastModal && Date.now() - lastModal.at < 500) return lastModal.rect;
    return null;
  }
  function queueGive(id) {
    giveBatch.push({ id, rect: srcRectNow() });
    clearTimeout(giveTimer);
    giveTimer = later(() => { if (!giveBatch.length) return; if (screen === 'play') refresh(); else flushGives(); }, 60);
  }
  function flushGives() {
    if (!giveBatch.length) return;
    const batch = giveBatch; giveBatch = []; clearTimeout(giveTimer);
    const ids = batch.map((b) => b.id).filter((id, i, a) => ITEMS[id] && a.indexOf(id) === i);
    if (!ids.length) return;
    sfx('pick', ids.length);
    const src = batch.find((b) => b.rect);
    emit('give', { ids, srcRect: src ? src.rect : null });
    if (!$('#modal').hidden) {
      const names = ids.map((id) => strip(ITEMS[id].name)).join(', ');
      modalChip(`📎 Grapado al expediente: ${names}`);
      announce(`Añadido a tu bandeja: ${names}`);
      return;
    }
    const now = Date.now();
    const all = now - giveToast.at < 60 ? giveToast.ids.concat(ids.filter((id) => !giveToast.ids.includes(id))) : ids;
    giveToast = { ids: all, at: now };
    toast(`<span class="toast-k">Añadido a tu bandeja</span><span class="toast-b">${all.map((id) => `${ITEMS[id].emoji} <b>${ITEMS[id].name}</b>`).join(' · ')}</span>`, 1800 + 400 * (all.length - 1));
    announce(`Añadido a tu bandeja: ${all.map((id) => strip(ITEMS[id].name)).join(', ')}`);
  }

  // ---------------- Modal (<dialog>) ----------------
  let inertEls = [];
  let docN = 0;
  let closing = false;
  function focusEl(e) {
    if (!e || typeof e.focus !== 'function') return;
    try { e.focus({ preventScroll: true }); } catch (x) { try { e.focus(); } catch (y) { /* nada */ } }
  }
  function setInert(on) {
    if (on) {
      inertEls = [...document.body.children].filter((c) => !['modal', 'toast', 'srPolite', 'srAlert'].includes(c.id) && c.tagName !== 'SCRIPT' && !c.hasAttribute('inert'));
      inertEls.forEach((c) => c.setAttribute('inert', ''));
    } else {
      inertEls.forEach((c) => c.removeAttribute('inert'));
      inertEls = [];
    }
  }
  function freezeRoom(on) {
    const b = document.body;
    // Solo la primera vez: al cambiar de modal con el teclado abierto, innerHeight ya ha encogido
    if (on && screen === 'play') { if (!b.classList.contains('room-frozen')) { b.style.setProperty('--freezeH', window.innerHeight + 'px'); b.classList.add('room-frozen'); } }
    else if (!on) { b.classList.remove('room-frozen'); b.style.removeProperty('--freezeH'); }
  }
  function captureOpener() {
    const a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement || !a.closest) return null;
    const hs = a.closest('#scene .hs[data-id]'); if (hs) return { kind: 'hs', id: hs.dataset.id };
    const sl = a.closest('#inventory .slot[data-id]'); if (sl) return { kind: 'slot', id: sl.dataset.id };
    if (a.closest('#modal')) return null;
    return { el: a };
  }
  function restoreFocus(op) {
    let t = null;
    if (op) {
      if (op.kind === 'hs') t = visibleHs(op.id) || nextVisibleHs(op.id);
      else if (op.kind === 'slot') t = invNodes.get(op.id) || firstSlot();
      else if (op.el && op.el.isConnected && !op.el.disabled && !op.el.closest('[hidden]')) t = op.el;
    }
    // Trámite ganado desde un botón de la temporada: el objeto que abrió el modal ya no admite toques
    if (screen === 'play' && pendingWin && isFine() && !$('#btnFinish').hidden) t = $('#btnFinish');
    if (!t && screen === 'play') t = $('#playTitle');
    if (!t) { const a = document.activeElement; if (a && a !== document.body) return; t = $(HEADINGS[screen]); }
    focusEl(t);
  }
  // «Pisos en alquiler — Requisitos»: h2 «Pisos en alquiler», antetítulo «Requisitos»
  function splitTitle(title) {
    const t = String(title || '');
    const i = t.indexOf(' — ');
    const main = i >= 0 ? t.slice(0, i) : t;
    const kicker = i >= 0 ? t.slice(i + 3) : '';
    const sp = splitEmoji(main);
    return { h2: sp.emoji ? `<span aria-hidden="true">${sp.emoji}</span> ${sp.rest}` : main, kicker };
  }
  const regNum = () => `${S ? `T${S.season}-${pad2(S.level)}` : 'T0-00'}-${String(++docN).padStart(4, '0')}`;
  const isPrimary = (b) => (/\bprimary\b/.test(b.cls || '') ? 1 : 0);

  // modal({ title, html, cls, buttons, onMount, onKey }) — API de las temporadas.
  // Opciones internas del motor: kind ('doc'|'puzzle'|'system'), sys (botones con data-sys), pauseClock.
  function modal(o) {
    const { title, html, cls, buttons, onMount, onKey } = o;
    const m = $('#modal');
    const wasOpen = !m.hidden && modalMeta;
    if (wasOpen) emit('modal', { phase: 'close', card: modalMeta.card, body: modalMeta.body, title: modalMeta.title, cls: modalMeta.cls, reason: 'commit' });
    const opener = wasOpen ? modalMeta.opener : captureOpener();
    m.innerHTML = '';
    const kind = o.kind || 'puzzle';
    const { h2, kicker } = splitTitle(title);
    const card = el('div', `modal-card ${cls || ''}`.trim());
    card.dataset.kind = kind;
    card.innerHTML = `<div class="modal-grab" aria-hidden="true"></div>
      <div class="modal-head"><div class="modal-titles">${kicker ? `<p class="modal-kicker" id="modalKicker">${kicker}</p>` : ''}<h2 id="modalTitle" tabindex="-1" autofocus>${h2}</h2></div><span class="modal-chips"></span><button class="modal-x" type="button" data-sys aria-label="Cerrar">${ico('i-close')}</button></div>
      ${kind === 'doc' ? `<p class="modal-masthead">MINISTERIO DE ASUNTOS PENDIENTES · Reg. salida nº ${regNum()}</p>` : ''}
      <div class="modal-body">${html || ''}</div>
      <p class="modal-status" role="status"></p>
      <div class="modal-foot"></div>`;
    const body = $('.modal-body', card);
    const foot = $('.modal-foot', card);
    const defaults = !buttons;
    const list = (buttons || [{ label: screen === 'play' ? 'Volver a la sala' : 'Cerrar', cls: 'ghost' }])
      .map((b, i) => ({ b, i })).sort((x, y) => (isPrimary(x.b) - isPrimary(y.b)) || x.i - y.i).map((x) => x.b);
    list.forEach((b) => {
      const be = el('button', 'btn ' + (b.cls || ''), b.label);
      be.type = 'button';
      if (defaults || o.sys || b.sys) be.setAttribute('data-sys', '');
      be.onclick = () => {
        sfx('click');
        const r = b.onClick ? b.onClick(closeModal, body) : true;
        if (r !== false) closeModal(b.onClick ? 'commit' : 'dismiss');
        refresh();
      };
      foot.append(be);
    });
    if (!list.length) foot.remove();
    card.classList.add(list.length ? 'has-foot' : 'no-foot');
    $('.modal-x', card).onclick = () => { sfx('click'); closeModal('x'); };
    m.append(card);
    m.setAttribute('aria-labelledby', kicker ? 'modalTitle modalKicker' : 'modalTitle');
    m.hidden = false;
    if (!m.open) {
      let native = false;
      if (typeof m.showModal === 'function') { try { m.showModal(); native = true; } catch (e) { native = false; } }
      if (!native) { m.setAttribute('open', ''); m.setAttribute('aria-modal', 'true'); setInert(true); }
    }
    modalKey = onKey || null;
    modalMeta = { card, body, title, cls: cls || '', opener, pauseClock: !!o.pauseClock };
    document.documentElement.classList.add('modal-open');
    freezeRoom(true);
    if (onMount) onMount(body, closeModal);
    if (!card.isConnected) return card; // onMount abrió otro modal o cerró este
    const isForm = !!body.querySelector('input, select, textarea, .kp-grid');
    if (isForm) card.dataset.form = '1';
    const txt = body.querySelector('input:not([type]), input[type=text], input[type=password], input[type=number], input[type=search], textarea');
    m.classList.toggle('top-align', !!txt);
    if (txt && isFine()) focusEl(txt); else focusEl($('#modalTitle', card));
    if (kind !== 'puzzle' && !wasOpen) sfx('paper');
    emit('modal', { phase: 'open', card, body, title, cls: cls || '', reason: null });
    return card;
  }

  // closeModal es SÍNCRONO: las soluciones automáticas y las temporadas dependen de ello.
  function closeModal(reason) {
    const m = $('#modal');
    if (m.hidden || closing) return;
    closing = true;
    const why = typeof reason === 'string' ? reason : 'commit';
    const mm = modalMeta;
    try {
      if (mm) {
        emit('modal', { phase: 'close', card: mm.card, body: mm.body, title: mm.title, cls: mm.cls, reason: why });
        const r = rectOf(mm.card); if (r) lastModal = { rect: r, at: Date.now() };
      }
      if (m.open && typeof m.close === 'function') { try { m.close(); } catch (e) { m.removeAttribute('open'); } } else m.removeAttribute('open');
      m.removeAttribute('aria-modal');
      m.hidden = true; m.innerHTML = ''; m.classList.remove('top-align');
      modalKey = null; modalMeta = null;
      setInert(false);
      document.documentElement.classList.remove('modal-open');
      freezeRoom(false);
      if (screen === 'play') refresh();
      restoreFocus(mm && mm.opener);
    } finally { closing = false; }
  }

  function confirmModal(title, text, yes, onYes, opts) {
    const op = opts || {};
    modal({
      title, kind: 'system', cls: 'confirm', sys: true, html: `<p>${text}</p>`,
      buttons: [{ label: op.no || 'Cancelar', cls: 'ghost' }, { label: yes, cls: op.cost ? 'cost' : 'primary', onClick() { closeModal('commit'); onYes(); return false; } }],
    });
  }

  // ---------------- Elección múltiple ----------------
  // g.choice({ title, text, options: [{ label, onPick(g) -> false para mantener abierto }], cancel: true })
  function choice(o) {
    const card = modal({
      title: o.title,
      cls: 'choice-modal' + (o.cls ? ' ' + o.cls : ''),
      buttons: o.cancel === false ? [] : [{ label: o.cancelLabel || 'Cancelar', cls: 'ghost', sys: true }],
      html: `${o.text ? `<div class="choice-text">${o.text}</div>` : ''}<div class="choice-list">${o.options.map((op, i) => `<button type="button" class="btn choice-opt" data-i="${i}">${op.label}</button>`).join('')}</div><div class="msg" id="choiceMsg"></div>`,
    });
    $$('.choice-opt', card).forEach((b) => {
      b.onclick = () => {
        sfx('click');
        const op = o.options[+b.dataset.i];
        const r = op.onPick ? op.onPick(g, (t, bad) => { const m = $('#choiceMsg', card); m.innerHTML = t; m.className = 'msg ' + (bad ? 'bad' : 'good'); }) : true;
        if (r !== false) closeModal('commit');
        refresh();
      };
    });
    return card;
  }

  // ---------------- Entrada de códigos («Casillas del Modelo 790») ----------------
  function input(o) {
    const numeric = !!o.numeric;
    const maxLen = o.maxLen || 12;
    const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'OK'];
    let val = ''; let errVal = ''; let errT = null;
    const card = modal({
      title: o.title,
      cls: 'kp-modal',
      sys: true,
      buttons: [{ label: 'Cancelar', cls: 'ghost' }],
      html: `<p id="kpPrompt"${o.text ? '' : ' class="sr-only"'}>${o.text || 'Introduce el código.'}</p>
        ${numeric ? `<div class="kp-display${maxLen > 8 ? ' long' : ''}" id="kpOut">${'<span class="kp-box" aria-hidden="true"></span>'.repeat(maxLen)}<span class="sr-only" id="kpSr"></span></div>
          <div class="kp-grid" role="group" aria-label="Teclado numérico">${KEYS.map((k) => `<button type="button" class="kp-key${k === 'OK' ? ' ok' : ''}" data-k="${k}"${k === '⌫' ? ' aria-label="Borrar última cifra"' : ''}>${k}</button>`).join('')}</div>`
          : `<div class="kp-text"><input type="text" id="kpIn" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go" maxlength="${maxLen}" placeholder="${esc(o.placeholder || '')}" aria-labelledby="kpPrompt"><button type="button" class="btn primary kp-ok">OK</button></div>`}
        <div class="kp-msg" id="kpMsg" role="alert"></div>`,
      onKey: numeric ? (e) => {
        let k = null;
        if (/^[0-9]$/.test(e.key)) k = e.key;
        else if (e.key === 'Backspace') k = '⌫';
        else if (e.key === 'Enter') k = 'OK';
        if (k == null) return;
        if (e.key === 'Enter' && e.target && e.target.closest && e.target.closest('.modal-foot, .modal-x')) return; // Enter en «Cancelar» o ✕
        e.preventDefault();
        const kb = $(`.kp-key[data-k="${k}"]`, card);
        if (kb) { kb.classList.add('press'); later(() => kb.classList.remove('press'), 90); }
        press(k);
      } : null,
    });
    const disp = $('.kp-display', card);
    const msg = $('.kp-msg', card);
    const inp = $('.kp-text input', card);
    function upd(state) {
      if (!disp) return;
      const shown = state === 'err' ? errVal : val;
      $$('.kp-box', disp).forEach((b, i) => {
        b.textContent = shown[i] || '';
        b.className = 'kp-box' + (i < shown.length ? ' on' : '') + (state === 'err' ? ' err' : state === 'ok' ? ' ok' : (i === val.length ? ' next' : ''));
      });
      const sr = $('#kpSr', card);
      if (sr) sr.textContent = `${val.length} de ${maxLen} cifras${val.length ? ': ' + [...val].join(', ') : ''}`;
    }
    function fail(text) {
      msg.textContent = '';
      msg.append(el('span', 'stamp sm', 'DENEGADO'), ' ' + text);
    }
    function submit() {
      const v = numeric ? val : inp.value.trim();
      if (!v) {
        sfx('bad');
        msg.textContent = 'Sin papeles no hay trámite. Introduzca un valor.';
        if (inp) focusEl(inp);
        return;
      }
      if (o.check(v)) {
        if (numeric) { val = v; upd('ok'); }
        closeModal('commit');
        sfx('ok');
        if (o.ok) o.ok(v);
        refresh();
      } else {
        sfx('buzz');
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        fail((o.failText && o.failText(v)) || 'Incorrecto.');
        if (S) track('wrong_answer', { season: S.season, level: S.level, level_id: `T${S.season}-N${S.level}`, puzzle: plainTitle(o.title) });
        if (numeric) {
          errVal = val; val = '';
          upd('err');
          clearTimeout(errT);
          errT = later(() => { if (card.isConnected) upd(); }, 650);
        } else if (inp) {
          inp.setAttribute('aria-invalid', 'true');
          try { inp.select(); } catch (e) { /* nada */ }
          focusEl(inp);
        }
        if (o.fail) o.fail(v);
      }
    }
    function press(k) {
      if (k === 'OK') return submit();
      sfx('type');
      clearTimeout(errT);
      if (k === '⌫') val = val.slice(0, -1);
      else if (val.length < maxLen) val += k;
      msg.textContent = '';
      upd();
      return undefined;
    }
    $$('.kp-key', card).forEach((b) => { b.onclick = () => press(String(b.dataset.k)); });
    if (inp) {
      $('.kp-ok', card).onclick = submit;
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      inp.addEventListener('input', () => { if (inp.hasAttribute('aria-invalid')) inp.removeAttribute('aria-invalid'); msg.textContent = ''; });
      focusEl(inp); // síncrono: así iOS abre el teclado
    }
    upd();
  }

  // ---------------- Render de la sala (por claves) ----------------
  const val = (v) => (typeof v === 'function' ? v(g) : v);
  const raf = (fn) => (window.requestAnimationFrame ? window.requestAnimationFrame(fn) : later(fn, 16));
  let epoch = 0;
  const hsNodes = new Map();  // id → <button class="hs">
  const hsSig = new Map();    // id → firma del último render visible
  const invNodes = new Map(); // id → <button class="slot">
  let seenHs = new Set();
  let newItems = new Set();
  let lastProgSig = '';
  let pendingPings = [];
  // Salas sin fluorescente: casas, tiendas, hemiciclos, plató, Bruselas, palacio
  const NO_TUBE = new Set(['1-5', '1-7', '2-6', '2-7', '2-8', '2-9', '3-9', '4-5', '4-9', '4-10', '5-5', '5-6', '5-9', '5-10']);
  const canHalo = () => isTouch() && (navigator.hardwareConcurrency || 0) > 4 && !saveData();

  function visibleHs(id) { const b = hsNodes.get(id); return b && b.isConnected && !b.hidden ? b : null; }
  function nextVisibleHs(id) {
    const ids = L ? L.hotspots.map((h) => h.id) : [];
    const i = ids.indexOf(id);
    for (let k = 1; k <= ids.length; k++) { const b = visibleHs(ids[(Math.max(i, 0) + k) % ids.length]); if (b) return b; }
    return null;
  }
  const firstSlot = () => $('#inventory .slot:not(.empty)');
  function hsFace(hs) {
    if (hs.sign) { const sub = hs.sub ? strip(val(hs.sub)) : ''; return isEmojiOnly(sub) ? firstGlyph(sub) : '🪧'; }
    return firstGlyph(strip(val(hs.emoji))) || '👀';
  }
  function hsName(label, vtext) {
    const l = strip(label);
    const v = strip(vtext);
    if (!v) return l;
    const n = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return n(v) === n(l) ? l : `${v} — ${l}`;
  }

  function renderScene() {
    const sc = $('#scene');
    const key = `${S.season}-${S.level}#${epoch}`;
    const floorH = L.scene.floorH ?? 32;
    const diff = { addedHs: [], removedHs: [], changedHs: [], initial: false };
    if (sc.dataset.key !== key) {
      diff.initial = true;
      sc.dataset.key = key;
      sc.innerHTML = '';
      hsNodes.clear(); hsSig.clear();
      sc.className = 'scene floor-' + (L.scene.pattern || 'plain');
      sc.style.setProperty('--wall', L.scene.wall);
      sc.style.setProperty('--floor', L.scene.floor);
      sc.style.setProperty('--floorH', floorH + '%');
      for (const c of ['wall', 'floor', 'baseboard']) { const e = el('div', c); e.setAttribute('aria-hidden', 'true'); sc.append(e); }
      for (const d of L.decor || []) {
        let e;
        if (d.kind) {
          e = el('div', 'deco deco-' + d.kind);
          if (d.l != null) Object.assign(e.style, { left: d.l + '%', top: d.t + '%', width: d.w + '%', height: d.h + '%' });
          if (d.color) e.style.setProperty('--c', d.color);
        } else {
          e = el('span', 'deco deco-emoji', d.emoji);
          Object.assign(e.style, { left: d.x + '%', top: d.y + '%', fontSize: (d.s || 5) + 'cqw', opacity: d.o ?? 1 });
          if (d.y + 0.89 * (d.s || 5) >= 100 - floorH - 1) e.classList.add('on-floor');
        }
        e.setAttribute('aria-hidden', 'true');
        sc.append(e);
      }
      for (const hs of L.hotspots) {
        const b = el('button', 'hs' + (hs.sign ? ' sign' : ''));
        b.type = 'button';
        b.dataset.id = hs.id;
        b.hidden = true;
        b.style.left = hs.x + '%';
        b.style.top = hs.y + '%';
        if (hs.sign) b.style.setProperty('--sw', (hs.w || 12) + 'cqw');
        else {
          b.style.fontSize = (hs.s || 6) + 'cqw';
          if (hs.y + 0.89 * (hs.s || 6) >= 100 - floorH - 1) b.classList.add('on-floor');
        }
        b.addEventListener('click', onHsClick);
        sc.append(b);
        hsNodes.set(hs.id, b);
      }
    }
    sc.classList.toggle('won', pendingWin);
    sc.classList.toggle('using', !!selected);
    sc.classList.toggle('halo', canHalo());
    sc.classList.toggle('tube', !NO_TUBE.has(`${S.season}-${S.level}`));
    for (const hs of L.hotspots) {
      const b = hsNodes.get(hs.id);
      if (hs.show && !hs.show(g)) {
        if (!b.hidden) { b.hidden = true; diff.removedHs.push(hs.id); }
        continue;
      }
      const label = val(hs.label);
      let sig; let inner; let vtext;
      if (hs.sign) {
        const sign = val(hs.sign); const sub = hs.sub ? val(hs.sub) : '';
        const big = sub && [...sub].length <= 4 && !/[a-z0-9]/i.test(sub);
        sig = `S|${label}|${sign}|${sub}`;
        inner = `<b>${sign}</b>${sub ? `<span class="${big ? 'sub-emoji' : ''}">${sub}</span>` : ''}`;
        vtext = strip(sign) + (sub && !big ? ' ' + strip(sub) : '');
      } else {
        const emo = val(hs.emoji); const tag = hs.tag ? val(hs.tag) : '';
        sig = `E|${label}|${emo}|${tag}`;
        inner = `<span class="hs-emoji" aria-hidden="true">${emo}</span>${tag ? `<span class="hs-tag" aria-hidden="true">${tag}</span>` : ''}`;
        vtext = tag ? strip(tag) : '';
      }
      const wasVisible = !b.hidden;
      if (hsSig.get(hs.id) !== sig) {
        b.innerHTML = inner;
        b.dataset.label = strip(label);
        b.setAttribute('aria-label', hsName(label, vtext));
        if (wasVisible && hsSig.has(hs.id)) diff.changedHs.push(hs.id);
        hsSig.set(hs.id, sig);
      }
      if (!wasVisible) { b.hidden = false; diff.addedHs.push(hs.id); }
      b.classList.toggle('unseen', !seenHs.has(hs.id));
    }
    return diff;
  }

  function renderInv() {
    const inv = $('#inventory');
    const key = `${S.season}-${S.level}#${epoch}`;
    const diff = { addedInv: [], removedInv: [] };
    if (inv.dataset.key !== key) { inv.dataset.key = key; inv.innerHTML = ''; invNodes.clear(); }
    const items = S.inv.filter((id) => ITEMS[id]);
    for (const [id, node] of invNodes) {
      if (!items.includes(id)) { node.remove(); invNodes.delete(id); diff.removedInv.push(id); }
    }
    const want = [];
    if (!items.length) {
      inv._empty = inv._empty || el('p', 'inv-empty', 'Tu bandeja está vacía (de momento)');
      want.push(inv._empty);
    }
    for (const id of items) {
      let b = invNodes.get(id);
      if (!b) {
        const it = ITEMS[id];
        b = el('button', 'slot', `<span class="slot-emoji" aria-hidden="true">${it.emoji}</span><span class="slot-name">${it.name}</span>`);
        b.type = 'button';
        b.dataset.id = id;
        b.title = strip(it.name);
        b.addEventListener('click', onSlotClick);
        invNodes.set(id, b);
        diff.addedInv.push(id);
      }
      const on = selected === id;
      b.classList.toggle('sel', on);
      b.classList.toggle('is-new', newItems.has(id));
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      want.push(b);
    }
    inv._wells = inv._wells || [];
    const wells = Math.max(4, items.length + 1) - items.length;
    for (let i = 0; i < wells; i++) {
      if (!inv._wells[i]) { const w = el('div', 'slot empty'); w.setAttribute('aria-hidden', 'true'); inv._wells[i] = w; }
      want.push(inv._wells[i]);
    }
    want.forEach((node, i) => { if (inv.children[i] !== node) inv.insertBefore(node, inv.children[i] || null); });
    while (inv.children.length > want.length) inv.lastElementChild.remove();
    inv.classList.toggle('has-sel', !!selected);
    inv.setAttribute('aria-label', `Bandeja de objetos (${items.length})`);
    $('#invCount').textContent = items.length ? `· ${items.length}` : '';
    return diff;
  }

  function syncMute() {
    const b = $('#btnMute'); if (!b) return;
    b.setAttribute('aria-pressed', meta.muted ? 'true' : 'false');
    const u = $('use', b); if (u) u.setAttribute('href', meta.muted ? '#i-speaker-off' : '#i-speaker');
  }
  function syncHint() {
    const b = $('#btnHint'); const badge = $('#hintBadge');
    if (!b || !S || !L) return;
    const idx = S.hintIdx; const total = (L.hints || []).length;
    b.classList.toggle('used', idx > 0);
    badge.hidden = !idx;
    badge.textContent = idx ? `${idx}/${total}` : '';
    b.setAttribute('aria-label', idx ? `Pedir pista (llevas ${idx} de ${total})` : 'Pedir pista');
  }

  // ---------------- Objetivo ----------------
  const OBJ_MARK = '<b>Objetivo:</b>';
  function goalHtmlOf(lv) {
    if (!lv) return '';
    if (lv.goal) return lv.goal;
    const i = String(lv.intro || '').indexOf(OBJ_MARK);
    return i >= 0 ? lv.intro.slice(i + OBJ_MARK.length).trim() : '';
  }
  const goalOf = (lv) => strip(goalHtmlOf(lv));
  function introBefore(lv) {
    const s = String(lv.intro || '');
    const i = s.indexOf(OBJ_MARK);
    return i >= 0 ? s.slice(0, i).replace(/(\s*<br\s*\/?>\s*)+$/i, '') : s;
  }
  let objOpen = false;
  // Control visible del objetivo: #objective (escritorio) o #objChip (móvil)
  let objCtl = null; // el que abrió la ficha
  function objControl() {
    if (objCtl && objCtl.isConnected && !objCtl.closest('[hidden]') && objCtl.getClientRects().length) return objCtl;
    for (const s of ['#objective', '#objChip']) { const e = $(s); if (e && !e.closest('[hidden]') && e.getClientRects().length) return e; }
    return null;
  }
  function setObjOpen(v) {
    const slip0 = $('#objSlip');
    const a = document.activeElement;
    // Si la ficha se cierra con el foco dentro (Esc, «Ver presentación»), el foco vuelve al control
    // del objetivo: así no cae a <body> y el modal de la presentación vuelve ahí al cerrarse.
    if (!v && slip0 && !slip0.hidden && a && slip0.contains(a)) { const c = objControl(); if (c) focusEl(c); }
    objOpen = !!v;
    ['#objChip', '#objective'].forEach((s) => { const e = $(s); if (e) e.setAttribute('aria-expanded', objOpen ? 'true' : 'false'); });
    const slip = $('#objSlip'); if (slip) slip.hidden = !objOpen;
  }
  function flashObjective() {
    ['#objChip', '#objective'].forEach((s) => {
      const e = $(s); if (!e) return;
      e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash');
      clearTimeout(e._flashT); e._flashT = later(() => e.classList.remove('flash'), 1200);
    });
  }

  function renderTop() {
    $('#seasonChip').textContent = `T${S.season}`;
    $('#lvlInfo').textContent = `${S.level}/${SEA.levels.length}`;
    $('#lvlTitle').textContent = plainTitle(L.title) || L.title;
    $('#timer').textContent = fmtTime(S.elapsed);
    syncMute(); syncHint();
    const goal = goalOf(L);
    for (const s of ['#objChipText', '#objText', '#objSlipText']) { const e = $(s); if (e && e.textContent !== goal) e.textContent = goal; }
  }

  function renderRoomUi() {
    const box = $('#sceneBox'); const bar = $('#roomBar');
    box.classList.toggle('using', !!selected);
    bar.classList.toggle('using', !!selected);
    const chip = $('#useChip');
    chip.hidden = !selected;
    const t = selected && ITEMS[selected] ? `${ITEMS[selected].emoji} ${strip(ITEMS[selected].name)}` : '';
    if ($('#useItem').textContent !== t) $('#useItem').textContent = t;
    setObjOpen(objOpen);
  }

  function refresh() {
    if (!S || !L || screen !== 'play') { save(); flushGives(); return; }
    const act = document.activeElement;
    const actHs = act && act.closest && act.closest('#scene .hs[data-id]');
    const actSlot = act && act.closest && act.closest('#inventory .slot[data-id]');
    const sd = renderScene(); const id = renderInv();
    renderTop(); renderRoomUi(); renderDialog();
    // El foco sobrevive: si el objeto enfocado desaparece, pasa al siguiente visible.
    // (Chrome no suelta el foco de un nodo recién ocultado hasta el siguiente pintado: se mira «hidden».)
    const gone = (n) => !n.isConnected || !!n.closest('[hidden]');
    if (document.activeElement === document.body || (act && act !== document.body && gone(act))) {
      if (actHs) focusEl(visibleHs(actHs.dataset.id) || nextVisibleHs(actHs.dataset.id) || $('#playTitle'));
      else if (actSlot) focusEl(invNodes.get(actSlot.dataset.id) || firstSlot() || $('#playTitle'));
      else if (act && act !== document.body && act.closest && act.closest('#screen-play') && $('#modal').hidden) focusEl($('#playTitle'));
    }
    if (!sd.initial) pendingPings.push(...sd.addedHs, ...sd.changedHs);
    schedulePan();
    save();
    emit('render', { addedHs: sd.addedHs, removedHs: sd.removedHs, changedHs: sd.changedHs, addedInv: id.addedInv, removedInv: id.removedInv, initial: sd.initial });
    const sig = JSON.stringify(S.flags) + '|' + S.inv.join(',');
    if (sig !== lastProgSig) { lastProgSig = sig; idleSecs = 0; emit('progress', {}); }
    flushGives();
  }

  // ---------------- Sala desplazable, plano y pistas visuales ----------------
  let panRaf = 0;
  function schedulePan() {
    if (panRaf) return;
    panRaf = raf(() => { panRaf = 0; updatePan(); });
  }
  function ping(btn) {
    btn.classList.remove('ping'); void btn.offsetWidth; btn.classList.add('ping');
    clearTimeout(btn._pingT); btn._pingT = later(() => btn.classList.remove('ping'), 1600);
  }
  function setCount(btn, n, side) {
    if (n) btn.dataset.count = String(n); else delete btn.dataset.count;
    btn.setAttribute('aria-label', `Ver la parte ${side} de la sala` + (n ? ` (${plural(n, 'objeto', 'objetos')})` : ''));
  }
  function panOverflow() { const w = $('#sceneWrap'); return !!w && w.scrollWidth - w.clientWidth > 4 && w.clientWidth > 0; }
  function updatePan() {
    const w = $('#sceneWrap');
    if (!w || screen !== 'play' || !S) { pendingPings = []; return; }
    const sw = w.scrollWidth; const cw = w.clientWidth; const max = sw - cw; const sl = w.scrollLeft;
    const on = max > 4 && cw > 0;
    const bar = $('#roomBar'); const box = $('#sceneBox'); const pl = $('#panL'); const pr = $('#panR'); const d = $('#dialog');
    bar.dataset.pan = on ? 'on' : 'off';
    const a = document.activeElement;
    pl.disabled = !(on && sl > 4);
    pr.disabled = !(on && sl < max - 4);
    if ((a === pl && pl.disabled) || (a === pr && pr.disabled)) focusEl(a === pl ? (pr.disabled ? $('#playTitle') : pr) : (pl.disabled ? $('#playTitle') : pl));
    const wr = rectOf(w);
    let nl = 0; let nr = 0; const side = {};
    if (on && wr) {
      for (const [id, b] of hsNodes) {
        if (b.hidden) continue;
        const r = rectOf(b); if (!r) continue;
        const cx = r.left + r.width / 2;
        if (cx < wr.left) { nl++; side[id] = 'left'; } else if (cx > wr.left + wr.width) { nr++; side[id] = 'right'; }
      }
    }
    setCount(pl, nl, 'izquierda'); setCount(pr, nr, 'derecha');
    if (pendingPings.length && on) {
      const s = new Set(pendingPings.map((id) => side[id]).filter(Boolean));
      if (s.has('left')) ping(pl);
      if (s.has('right')) ping(pr);
    }
    pendingPings = [];
    const plano = $('#plano');
    if (on) {
      plano.style.setProperty('--thumbW', ((cw / sw) * 100).toFixed(2) + '%');
      plano.style.setProperty('--thumbX', ((sl / cw) * 100).toFixed(2) + '%');
    }
    box.style.setProperty('--fadeL', on && sl > 4 ? '1' : '0');
    box.style.setProperty('--fadeR', on && sl < max - 4 ? '1' : '0');
    // Señal ‹ › cuando quien habla está fuera de la vista
    const sd = current && current.srcId ? side[current.srcId] : null;
    if (sd) d.dataset.side = sd; else delete d.dataset.side;
    const ds = $('#dlgSide'); const st = sd === 'left' ? '‹' : sd === 'right' ? '›' : '';
    if (ds.textContent !== st) ds.textContent = st;
  }
  function centerScene() {
    const w = $('#sceneWrap');
    if (!w) return;
    const max = w.scrollWidth - w.clientWidth;
    panIntent = false; // un desplazamiento programado no cuenta como gesto del jugador
    w.scrollLeft = max > 0 ? max / 2 : 0;
    updatePan();
  }
  function scrollRoom(dir) {
    const w = $('#sceneWrap');
    const dx = dir * w.clientWidth * 0.6;
    if (typeof w.scrollBy === 'function') { try { w.scrollBy({ left: dx, behavior: RM() ? 'auto' : 'smooth' }); return; } catch (e) { /* nada */ } }
    w.scrollLeft += dx;
  }
  // Aviso «↔ Desliza la sala»: hasta que el jugador desplace la sala por su cuenta
  let hintT = null; let panIntent = false; let panStart = 0;
  function startPanHint() {
    panIntent = false;
    if (!panOverflow() || meta.ui.panned) { hidePanHint(); return; }
    $('#panHint').hidden = false;
    $('#roomBar').classList.add('hinting');
    clearTimeout(hintT); hintT = later(hidePanHint, 6000);
  }
  function hidePanHint() {
    clearTimeout(hintT);
    const h = $('#panHint'); if (h) h.hidden = true;
    const b = $('#roomBar'); if (b) b.classList.remove('hinting');
  }
  function panIntentStart() {
    panIntent = true;
    const w = $('#sceneWrap'); panStart = w ? w.scrollLeft : 0;
    hidePanHint();
  }
  // Toques que caen cerca de un objeto (sin acertar del todo) cuentan como toque en el objeto
  function nearestHotspot(x, y) {
    const limit = isTouch() ? (selected ? 12 : 24) : 12;
    let best = null; let bestD = Infinity;
    for (const b of hsNodes.values()) {
      if (b.hidden) continue;
      const r = rectOf(b); if (!r) continue;
      const dx = Math.max(r.left - x, 0, x - (r.left + r.width));
      const dy = Math.max(r.top - y, 0, y - (r.top + r.height));
      const dd = Math.hypot(dx, dy);
      if (dd < bestD) { bestD = dd; best = b; }
    }
    return bestD <= limit ? best : null;
  }

  // ---------------- Lupa y sello de trámite completado ----------------
  let lupaT = null;
  function lupa() {
    const sc = $('#scene'); const b = $('#btnLupa');
    const on = !sc.classList.contains('reveal');
    clearTimeout(lupaT);
    sc.classList.toggle('reveal', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) {
      sfx('click');
      lupaT = later(() => { sc.classList.remove('reveal'); b.setAttribute('aria-pressed', 'false'); }, 2500);
      if (S) track('reveal_used', { season: S.season, level: S.level, level_id: `T${S.season}-N${S.level}` });
    }
  }
  let wonTimers = [];
  function wonPresentation() {
    const box = $('#sceneBox'); const st = $('#wonStamp'); const cta = $('#btnWonCta');
    if (!box) return;
    hidePanHint(); setObjOpen(false);
    box.classList.add('won');
    st.style.setProperty('--rot', (-14 + Math.random() * 8).toFixed(1) + 'deg');
    st.hidden = false;
    st.classList.remove('go'); void st.offsetWidth; st.classList.add('go');
    cta.hidden = !isTouch();
    const rm = RM();
    wonTimers.forEach(clearTimeout);
    wonTimers = [later(() => sfx('stamp'), rm ? 0 : 231), later(() => sfx('win'), rm ? 150 : 381)];
    if (!queue.length && isFine()) focusEl($('#btnFinish'));
  }
  function clearWon() {
    wonTimers.forEach(clearTimeout); wonTimers = [];
    const box = $('#sceneBox'); const st = $('#wonStamp'); const cta = $('#btnWonCta');
    if (box) box.classList.remove('won');
    if (st) { st.hidden = true; st.classList.remove('go'); }
    if (cta) cta.hidden = true;
  }

  // ---------------- Interacción ----------------
  function nope(it) {
    const n = ITEMS[it].name.toLowerCase();
    return rand([
      `Usar ${n} ahí no parece buena idea.`,
      'Eso no es competencia de este negociado. Diríjase a otra ventanilla.',
      'No. Rotundamente no. (Silencio administrativo negativo.)',
      `Lo intentas con ${n}, pero no pasa nada. Como con las reclamaciones.`,
    ]);
  }
  function setSelected(v) {
    if (selected === v) return;
    selected = v;
    emit('select', { id: v });
  }

  // Capa DOM: con mensajes en cola, tocar la sala o la bandeja solo avanza la cola.
  // (R.click y R.item no pasan por aquí: las soluciones automáticas no cambian.)
  function onHsClick(e) {
    const b = e.currentTarget;
    let x = e.clientX; let y = e.clientY;
    if (e.detail === 0) { const r = rectOf(b); if (r) { x = r.left + r.width / 2; y = r.top + r.height / 2; } }
    activateHs(b.dataset.id, { keyboard: e.detail === 0, x, y, assisted: false });
  }
  function activateHs(id, o) {
    const hs = L && L.hotspots.find((h) => h.id === id);
    if (!hs || !$('#modal').hidden) return;
    if (queue.length && !pendingWin) { sfx('click'); nextMsg(); nudge(); return; }
    if (pendingWin) return;
    idleSecs = 0;
    haptic('tap');
    emit('tap', { id, x: o.x, y: o.y, assisted: !!o.assisted });
    clickHotspot(hs);
    if (o.keyboard && queue.length && $('#modal').hidden) { kbOrigin = { kind: 'hs', id }; focusEl($('#btnNextMsg')); }
  }
  function onSlotClick(e) {
    const id = e.currentTarget.dataset.id;
    if (!$('#modal').hidden) return;
    if (queue.length && !pendingWin) { sfx('click'); nextMsg(); nudge(); return; }
    idleSecs = 0;
    clickItem(id);
    if (e.detail === 0 && queue.length && $('#modal').hidden) { kbOrigin = { kind: 'slot', id }; focusEl($('#btnNextMsg')); }
  }

  function clickHotspot(hs) {
    if (pendingWin || !$('#modal').hidden) return;
    clearQueue();
    const label = val(hs.label);
    seenHs.add(hs.id);
    ctx = { who: label, face: hsFace(hs), srcId: hs.id };
    try {
      if (selected) {
        const it = selected; setSelected(null);
        const fn = hs.use && (hs.use[it] || hs.use['*']);
        if (fn) fn(g, it); else { sfx('bad'); say(nope(it), undefined, { kind: 'system' }); } // mensajes del motor: piel «system»
      } else {
        sfx('click');
        if (hs.look) hs.look(g); else say('Nada interesante.', undefined, { kind: 'system' });
      }
    } finally { ctx = null; }
    refresh();
  }

  function clickItem(id) {
    if (pendingWin) return;
    sfx('click');
    clearQueue();
    if (selected && selected !== id) {
      const a = selected; setSelected(null);
      const key = [a, id].sort().join('+');
      const fn = L.combos && L.combos[key];
      if (fn) fn(g);
      else say(`No se te ocurre cómo combinar ${ITEMS[a].name.toLowerCase()} con ${ITEMS[id].name.toLowerCase()}.`, null, { face: '🤔', kind: 'system' });
    } else if (selected === id) {
      setSelected(null);
    } else {
      setSelected(id);
      newItems.delete(id);
      say(val(ITEMS[id].desc), ITEMS[id].name, { kind: 'item', face: firstGlyph(ITEMS[id].emoji), srcId: null });
    }
    refresh();
  }

  // ---------------- Flujo de pantallas ----------------
  const HEADINGS = { menu: '#menuTitle', season: '#seaTitle', intro: '#introTitle', play: '#playTitle', win: '#winTitle', end: '#endTitle' };
  const TITLE_MENU = `${BRAND} — Un room escape por la burocracia española`;
  const BACK = { season: ['Temporadas', 'Volver a Temporadas'], intro: ['Trámites', 'Volver a los trámites'], win: ['Trámites', 'Volver a los trámites'], end: ['Menú', 'Volver al menú'] };
  let menuShown = false;
  // show(name, { before, after, title, focus }) — «before» corre en cuanto cambia «screen»
  // (antes de mostrar nada); «after» corre ya con la pantalla visible.
  function show(name, opts) {
    const o = typeof opts === 'function' ? { after: opts } : (opts || {});
    const prev = screen;
    screen = name;
    if (o.before) o.before();
    const apply = () => {
      $$('.screen').forEach((s) => { s.hidden = s.id !== 'screen-' + name; });
      $('#topbar').classList.toggle('in-game', name === 'play');
      document.documentElement.dataset.screen = name;
      document.body.dataset.screen = name;
      const sid = name === 'menu' ? null : name === 'season' ? viewSeason : (S && S.season);
      if (sid) document.body.dataset.season = sid; else delete document.body.dataset.season;
      const bb = $('#btnBack'); const back = BACK[name];
      bb.hidden = !back;
      if (back) { $('#btnBackLabel').textContent = back[0]; bb.setAttribute('aria-label', back[1]); }
      try { window.scrollTo(0, 0); } catch (e) { /* jsdom */ }
      document.title = o.title || TITLE_MENU;
      if (name === 'menu') { if (menuShown) $('#menuTitle').classList.add('played'); menuShown = true; }
      if (name !== 'play') { hidePanHint(); setObjOpen(false); }
      if (o.after) o.after();
      const ft = typeof o.focus === 'function' ? o.focus() : o.focus;
      if (booted) focusEl(ft || $(HEADINGS[name]));
      emit('screen', { name, prev });
    };
    const vt = booted && name !== prev && typeof document.startViewTransition === 'function' && !RM() && !document.hidden;
    if (vt) {
      try {
        const t = document.startViewTransition(() => { try { apply(); } catch (e) { later(() => { throw e; }, 0); } });
        // Si otra transición la sustituye, sus promesas se rechazan: no es un error
        const quiet = (p) => { if (p && typeof p.catch === 'function') p.catch(() => {}); };
        quiet(t.ready); quiet(t.finished); quiet(t.updateCallbackDone);
      } catch (e) { apply(); }
    } else apply();
    if (name !== 'menu' && !guardArmed) needsGuard = true;
  }

  function useSeason(sid) {
    SEA = seasonById(sid);
    ITEMS = SEA.items || {};
  }

  function resetLevelUi() {
    setSelected(null); pendingWin = false; queue = []; current = null; shownSeq = -1; batchIdx = 0; batchTotal = 0;
    clearWon(); epoch++;
    seenHs = new Set(); log = []; idleSecs = 0; kbOrigin = null; lastProgSig = '';
    setObjOpen(false);
  }

  function setupLevel(n) {
    useSeason(S.season);
    L = SEA.levels[n - 1];
    S.level = n; S.flags = {}; S.inv = []; S.hintIdx = 0; S.levelStart = S.elapsed;
    resetLevelUi();
    newItems = new Set();
    // Objetos que el jugador trae de trámites anteriores
    for (const id of L.carry || []) if (ITEMS[id] && !S.inv.includes(id)) S.inv.push(id);
    if (L.init) L.init(g);
    meta.progress[S.season] = Math.max(progressOf(S.season), n);
    meta.last = S.season;
    save();
  }

  function carryHtml(lv, title) {
    const list = (lv.carry || []).filter((id) => ITEMS[id]);
    if (!list.length) return '';
    return `<div class="carry"><span class="carry-t">🎒 ${title}:</span> ${list.map((id) => `<span class="carry-i">${ITEMS[id].emoji} ${ITEMS[id].name}</span>`).join('')}</div>`;
  }

  function stars(n) {
    return `<span class="stars-l" aria-hidden="true">Dificultad</span> <span class="stars-g" aria-hidden="true">${'<span class="st on">★</span>'.repeat(n)}${'<span class="st">☆</span>'.repeat(Math.max(0, 5 - n))}</span><span class="sr-only">Dificultad: ${n} de 5</span>`;
  }

  function showIntro() {
    useSeason(S.season);
    L = SEA.levels[S.level - 1];
    const n = SEA.levels.length;
    $('#introNum').textContent = `Temporada ${S.season} · Trámite ${S.level} de ${n}`;
    $('#introTitle').textContent = L.title;
    $('#introPlace').textContent = L.place;
    $('#introStars').innerHTML = stars(L.stars) + (SEA.badge ? ` <span class="badge">${SEA.badge}</span>` : '');
    $('#introText').innerHTML = introBefore(L);
    const gh = goalHtmlOf(L);
    $('#introObjText').innerHTML = gh;
    $('#introObj').hidden = !gh;
    $('#introCarry').innerHTML = carryHtml(L, 'Traes contigo');
    show('intro', { title: `Trámite ${S.level}/${n}: «${plainTitle(L.title)}» — ${BRAND}` });
  }

  function enterPlay(resumed) {
    useSeason(S.season);
    L = SEA.levels[S.level - 1];
    resetLevelUi();
    if (resumed) newItems = new Set();
    meta.last = S.season;
    const n = SEA.levels.length;
    $('#playTitle').textContent = `Temporada ${S.season} · Trámite ${S.level} de ${n}: ${plainTitle(L.title)} — ${L.place}`;
    show('play', {
      title: `Jugando: «${plainTitle(L.title)}» (T${S.season} · ${S.level}/${n}) — ${BRAND}`,
      before: () => refresh(),
      after: () => {
        centerScene();
        flashObjective();
        startPanHint();
        emit('level', { season: S.season, level: S.level, resumed: !!resumed, overflow: panOverflow() });
      },
    });
    track('level_start', { season: S.season, level: S.level, level_id: `T${S.season}-N${S.level}`, title: L.title, resumed: !!resumed });
    if (resumed) say(`Expediente recuperado: «${plainTitle(L.title)}». 🎯 ${goalOf(L)}`, '💾 Partida cargada', { kind: 'system', srcId: null });
  }

  function finishLevel() {
    if (!pendingWin) return;
    pendingWin = false;
    clearWon();
    const sid = S.season;
    const done = S.level;
    const doneL = SEA.levels[done - 1];
    // Marcas del trámite (antes de que setupLevel ponga a cero los contadores)
    const secs = Math.max(0, S.elapsed - (S.levelStart || 0));
    const hints = S.hintIdx;
    const sol = S.hintIdx >= (doneL.hints || []).length;
    const recs = meta.records[sid] = meta.records[sid] || {};
    const prev = recs[done];
    recs[done] = prev ? { t: Math.min(prev.t, secs), h: Math.min(prev.h, hints), sol: !!(prev.sol || sol) } : { t: secs, h: hints, sol };
    track('level_complete', { season: sid, level: done, level_id: `T${sid}-N${done}`, title: doneL.title, seconds: secs, hints });
    if (done >= SEA.levels.length) {
      track('season_complete', { season: sid, seconds: S.elapsed, hints: S.totalHints });
      S.finished = true; meta.done[sid] = true;
      const b = meta.best[sid];
      meta.best[sid] = b ? { t: Math.min(b.t, S.elapsed), h: Math.min(b.h, S.totalHints) } : { t: S.elapsed, h: S.totalHints };
      if (seasonById(sid + 1)) meta.progress[sid + 1] = Math.max(progressOf(sid + 1), 1);
      save();
      showEnding();
      return;
    }
    setupLevel(done + 1);
    const n = SEA.levels.length;
    $('#resNum').textContent = `T${sid}-${String(done).padStart(3, '0')}/2026`;
    $('#winTitle').textContent = `Trámite ${done} completado: «${plainTitle(doneL.title) || doneL.title}»`;
    $('#winText').innerHTML = doneL.outro;
    $('#winStats').textContent = `⏱ ${fmtTime(secs)} en este trámite · 💡 ${plural(hints, 'pista', 'pistas')}`;
    $('#winSteps').innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k < done ? 'done' : k === done ? 'next' : ''}"></i>`).join('') + `<span class="sr-only">Llevas ${done} de ${n} trámites de esta temporada.</span>`;
    $('#winCarry').innerHTML = carryHtml(L, 'Te llevas al siguiente trámite');
    $('#winCode').textContent = makeCode(S.season, S.level, S.totalHints);
    const wc = $('#winCopy'); clearTimeout(wc._t); wc.textContent = 'Copiar'; delete wc.dataset.label;
    $('#winCopyHint').hidden = true;
    const ios = isIOS() && !isStandalone();
    const note = $('#winIosNote');
    note.hidden = !ios;
    if (ios) note.textContent = 'En iPhone, Safari puede archivar tu partida si pasas una semana sin jugar: guarda este código.';
    $('#btnNext').textContent = `Siguiente: «${plainTitle(L.title) || L.title}» ▶`;
    const ws = $('#winStamp'); ws.classList.remove('go');
    show('win', {
      title: `Trámite ${done} completado — ${BRAND}`,
      focus: isFine() ? $('#btnNext') : null,
      after: () => {
        ws.style.setProperty('--stamp-delay', '200ms');
        void ws.offsetWidth; ws.classList.add('go');
        later(() => sfx('stamp'), RM() ? 0 : 431);
      },
    });
  }

  const RANKS = (h) => (h === 0 ? 'Funcionario/a de carrera con plaza fija' : h <= 5 ? 'Gestor/a administrativo/a colegiado/a' : h <= 15 ? 'Ciudadano/a resiliente' : 'Ciudadano/a con cita previa para 2031');
  let endNext = null; let shareText = '';
  function buildShareText(sid) {
    const sea = seasonById(sid); const recs = meta.records[sid] || {};
    const cells = sea.levels.map((_, i) => { const r = recs[i + 1]; return !r ? '⬜' : r.sol ? '🟥' : r.h > 0 ? '🟨' : '🟩'; }).join('');
    return `📂 ${BRAND} — T${sid} «${plainTitle(sea.title)}»\n${cells}\n⏱ ${fmtTime(S.elapsed)} · 💡 ${plural(S.totalHints, 'pista', 'pistas')}\nCategoría: ${RANKS(S.totalHints)}\n${SITE_URL}`;
  }

  function showEnding() {
    const sid = S.season;
    const h = S.totalHints;
    const rank = RANKS(h);
    const end = SEA.ending || {};
    $('#endHead').innerHTML = end.head || `TEMPORADA ${sid}<br><small>${SEA.title}</small>`;
    $('#endTitle').textContent = end.title || `¡Temporada ${sid} completada!`;
    $('#endBody').innerHTML = end.html || '';
    const stampText = end.stamp || 'TEMPORADA SUPERADA';
    const st = $('#endStamp');
    st.textContent = stampText; st.classList.remove('go');
    const n = SEA.levels.length;
    $('#endStats').innerHTML = `<div><span>Tiempo</span><b data-count="${S.elapsed}" data-fmt="time">${fmtTime(S.elapsed)}</b></div><div><span>Pistas pedidas</span><b data-count="${h}">${h}</b></div><div><span>Trámites</span><b data-count="${n}">${n}</b></div>`;
    $('#endRank').innerHTML = `<span class="dlg-face" aria-hidden="true">🏛️</span><div class="rank-b"><span class="dlg-who">Jefatura de Negociado</span><p>—Enhorabuena. Categoría: <b>${rank}</b>.</p></div>`;
    shareText = buildShareText(sid);
    const nxt = seasonById(sid + 1);
    const bn = $('#btnEndNext');
    bn.hidden = false;
    $('#endFinal').hidden = !!nxt;
    if (nxt) {
      bn.textContent = `Temporada ${nxt.id}: ${plainTitle(nxt.title) || nxt.title} ▶`;
      endNext = () => startSeasonLevel(nxt.id, 1, false);
    } else {
      bn.textContent = '🔁 Repetir una temporada';
      endNext = () => goMenu({ focus: () => $('#seasonList .season-card'), after: scrollSeasonList });
    }
    renderTasa($('#endDonate'));
    show('end', {
      title: `Temporada ${sid} completada — ${BRAND}`,
      after: () => {
        emit('ending', { season: sid, last: !nxt, stampText });
        const finale = document.body.classList.contains('finale-on');
        const delay = finale ? 1300 : (RM() ? 0 : 300);
        st.style.setProperty('--stamp-delay', delay + 'ms');
        void st.offsetWidth; st.classList.add('go');
        if (!finale) { later(() => sfx('stamp'), delay + 231); later(() => sfx('season'), delay + 420); }
      },
    });
  }

  function fmtTime(s) {
    const hh = Math.floor(s / 3600); const mm = Math.floor((s % 3600) / 60); const ss = s % 60;
    return (hh ? hh + ':' : '') + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }

  // ---------------- Apoyo (Ko-fi) ----------------
  const donation = CONFIG.donation || {};
  const donationUrl = donation.url || (donation.kofi ? `https://ko-fi.com/${encodeURIComponent(donation.kofi)}` : '');
  const donationText = donation.text || '¡Invítame a un café!';
  function bindKofi(root) {
    $$('[data-kofi]', root || document).forEach((a) => {
      if (!donationUrl) { a.hidden = true; return; }
      a.href = donationUrl;
      a.title = donationText;
      a.setAttribute('aria-label', donationText);
      const lbl = $('.kofi-label', a); if (lbl) lbl.textContent = donationText;
      a.hidden = false;
    });
  }
  function renderTasa(box) {
    if (!box) return;
    if (!donationUrl) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    box.innerHTML = `<p class="tasa-k">Tasa voluntaria · Modelo 0-CAFÉ</p>
      <p class="tasa-t">¿Te has reído un rato? Este juego es gratuito, sin anuncios y sin registro. Si quieres agradecerlo, abona la tasa. <b>Importe: lo que tú quieras, desde 1 €.</b></p>
      <a class="kofi-btn big" data-kofi="tasa" target="_blank" rel="noopener noreferrer"><span class="kofi-cup" aria-hidden="true">☕</span><span class="kofi-label"></span></a>`;
    bindKofi(box);
  }

  // ---------------- Compartir y copiar ----------------
  function copyRaw(text, node) {
    const viaExec = () => {
      let tmp = null;
      try {
        const sel = window.getSelection && window.getSelection();
        if (node && sel && document.createRange) {
          const r = document.createRange(); r.selectNodeContents(node);
          sel.removeAllRanges(); sel.addRange(r);
        } else {
          tmp = el('textarea'); tmp.value = text; tmp.setAttribute('readonly', '');
          tmp.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
          ($('#modal').hidden ? document.body : $('#modal')).append(tmp);
          tmp.select();
        }
        return !!(document.execCommand && document.execCommand('copy'));
      } catch (e) { return false; } finally { if (tmp) tmp.remove(); }
    };
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text).then(() => true, () => viaExec());
    }
    return Promise.resolve(viaExec());
  }
  function copyText(text, btn, codeEl, hintEl) {
    if (!btn.dataset.label) btn.dataset.label = btn.innerHTML;
    copyRaw(text, codeEl).then((ok) => {
      if (ok) {
        btn.textContent = '✔ Copiado';
        sfx('ok');
        announce('Código copiado.');
        if (hintEl) hintEl.hidden = true;
        clearTimeout(btn._t);
        btn._t = later(() => { if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }, 2000);
      } else {
        const t = isTouch() ? 'Mantén pulsado el código para copiarlo.' : 'Selecciona el código y cópialo con Ctrl+C (⌘+C en Mac).';
        if (hintEl) { hintEl.textContent = t; hintEl.hidden = false; }
        announce(t);
      }
    });
  }
  // share(data, fallbackText) → 'shared' | 'aborted' | 'copied' | 'failed'
  function share(data, fallbackText) {
    const copy = () => copyRaw(fallbackText).then((ok) => (ok ? 'copied' : 'failed'));
    let native = false;
    try { native = typeof navigator.share === 'function' && (typeof navigator.canShare !== 'function' || navigator.canShare(data)); } catch (e) { native = false; }
    if (native) return navigator.share(data).then(() => 'shared', (e) => (e && e.name === 'AbortError' ? 'aborted' : copy()));
    return copy();
  }
  function shareCode(code) {
    const text = `Mi código de expediente de ${BRAND}: ${code}`;
    share({ title: BRAND, text }, text).then((r) => {
      if (r === 'copied') notify('Copiado. Pégalo donde quieras (por triplicado).');
      else if (r === 'failed') notify('No se ha podido copiar. Apunta el código a mano (como en 1987).');
    });
  }

  // ---------------- Menú ----------------
  let heroAction = null;
  function scrollSeasonList() {
    const c = $('#seasonList .season-card');
    if (c) { try { c.scrollIntoView({ block: 'center', behavior: RM() ? 'auto' : 'smooth' }); } catch (e) { /* nada */ } }
    return c;
  }
  function focusSeasonList() { const c = scrollSeasonList(); if (c) focusEl(c); }
  function shake(node) { node.classList.remove('shake'); void node.offsetWidth; node.classList.add('shake'); later(() => node.classList.remove('shake'), 450); }

  function renderMenu() {
    const cont = $('#btnContinue'); const goalP = $('#heroGoal');
    goalP.hidden = true;
    const anyProgress = SEASONS.some((s) => progressOf(s.id) > 0 || meta.done[s.id]);
    const cont3 = (sid, sv) => {
      const sea = seasonById(sid); const lv = sea.levels[sv.level - 1];
      cont.innerHTML = `▶ Continuar <small>T${sea.id} · Trámite ${sv.level}: ${lv.title}</small>`;
      goalP.textContent = `🎯 ${goalOf(lv)}`; goalP.hidden = !goalOf(lv);
      heroAction = { leaves: true, run: () => continueGame(sid) };
    };
    const last = meta.last && readSave(meta.last);
    if (last && !last.finished) cont3(last.season || meta.last, last);
    else if (!anyProgress) {
      const s1 = SEASONS[0];
      cont.innerHTML = `▶ Empezar a jugar <small>Temporada ${s1.id} · ${s1.title} · ${s1.levels.length} trámites</small>`;
      heroAction = { leaves: true, run: () => startSeasonLevel(s1.id, 1, false) };
    } else {
      const nextSea = SEASONS.find((s) => isUnlocked(s.id) && !meta.done[s.id]);
      const sv = nextSea && readSave(nextSea.id);
      if (sv && !sv.finished) cont3(nextSea.id, sv);
      else if (nextSea) {
        cont.innerHTML = `▶ Empezar la temporada ${nextSea.id} <small>${nextSea.title}</small>`;
        heroAction = { leaves: true, run: () => startSeasonLevel(nextSea.id, 1, false) };
      } else {
        cont.innerHTML = '🔁 Repetir una temporada';
        heroAction = { leaves: false, run: focusSeasonList };
      }
    }
    cont.hidden = false;

    const total = SEASONS.reduce((k, s) => k + s.levels.length, 0);
    const solved = SEASONS.reduce((k, s) => k + (meta.done[s.id] ? s.levels.length : Math.max(0, progressOf(s.id) - 1)), 0);
    const mp = $('#menuProgress');
    mp.textContent = solved ? `Llevas ${solved} de ${total} trámites resueltos` : '';
    mp.hidden = !solved;

    const list = $('#seasonList');
    list.innerHTML = '';
    let unlockedNow = false;
    SEASONS.forEach((sea) => {
      const open = isUnlocked(sea.id);
      const done = !!meta.done[sea.id];
      const n = sea.levels.length;
      const prog = done ? n : Math.max(0, progressOf(sea.id) - 1);
      const sv = readSave(sea.id);
      const cur = open && !done && (!!sv || progressOf(sea.id) > 1);
      const curLevel = sv && !sv.finished ? sv.level : progressOf(sea.id);
      const just = open && sea.id > 1 && !meta.seenUnlock[sea.id];
      const prevSea = seasonById(sea.id - 1);
      const b = el('button', ['season-card', open ? 'open' : 'locked', done && 'done', cur && 'cur', just && 'just-unlocked'].filter(Boolean).join(' '));
      b.type = 'button';
      b.dataset.sid = sea.id;
      if (!open) b.setAttribute('aria-disabled', 'true');
      const cells = Array.from({ length: n }, (_, k) => `<i${k < prog ? ' class="done"' : (cur && k === curLevel - 1 ? ' class="cur"' : '')}></i>`).join('');
      const best = meta.best[sea.id];
      const status = done ? '<span class="sc-status chip ok">Completada ✓</span>'
        : !open ? '<span class="sc-status chip lock">🔒 Bloqueada</span>'
          : cur ? `<span class="sc-status chip cur">En curso ${curLevel}/${n}</span>`
            : '<span class="sc-status chip cur">Sin empezar</span>';
      b.innerHTML = `<span class="sc-tile" aria-hidden="true">${sea.emoji || '📂'}</span>
        <span class="sc-main">
          <span class="sc-kicker">Temporada ${sea.id}${sea.badge ? ` · ${sea.badge}` : ''}</span>
          ${open ? `<span class="sc-title">${sea.title}${just ? '<span class="redact" aria-hidden="true">PENDIENTE DE TRÁMITE</span>' : ''}</span>` : `<span class="sc-title redacted"><span class="sr-only">${sea.title}</span><span class="redact" aria-hidden="true">PENDIENTE DE TRÁMITE</span></span>`}
          ${sea.subtitle ? `<span class="sc-sub">${sea.subtitle}</span>` : ''}
          ${!open && prevSea ? `<span class="sc-lock">🔒 Se desbloquea al terminar «${prevSea.title}»</span>` : ''}
          ${open ? `<span class="sc-cells" aria-hidden="true">${cells}</span>` : ''}
          ${best ? `<span class="sc-best">Mejor marca: ${fmtTime(best.t)} · ${plural(best.h, 'pista', 'pistas')}</span>` : ''}
        </span>
        ${status}
        ${just ? '<span class="stamp sm sc-unlock" aria-hidden="true">DESBLOQUEADA</span>' : ''}`;
      b.addEventListener('click', () => {
        if (!open) {
          sfx('bad'); shake(b);
          const txt = `🔒 Expediente bloqueado. Requisito previo: completar «${prevSea ? prevSea.title : ''}».`;
          toast(`<span class="toast-b">${txt}</span>`, 3200);
          announce(strip(txt));
          return;
        }
        sfx('click'); armGuard(); openSeason(sea.id);
      });
      list.append(b);
      if (just) { meta.seenUnlock[sea.id] = true; unlockedNow = true; }
    });
    if (unlockedNow) { save(); if (booted) later(() => sfx('stamp'), RM() ? 0 : 531); }
  }

  // goMenu({ focus, after }): destino del foco y tarea tras pintar; se pasan a show() porque con
  // View Transitions apply() corre más tarde y enfocaría #menuTitle por encima.
  function goMenu(o) {
    const opt = o || {};
    renderMenu();
    show('menu', { title: TITLE_MENU, focus: opt.focus, after: opt.after });
    needsGuard = false;
    if (guardArmed) {
      guardArmed = false;
      ignoreNextPop = true;
      try { history.back(); } catch (e) { ignoreNextPop = false; }
    }
  }

  function openSeason(sid) {
    track('season_open', { season: sid });
    viewSeason = sid;
    const sea = seasonById(sid);
    $('#seaNum').textContent = `Temporada ${sid}${sea.badge ? ` · ${sea.badge}` : ''}`;
    $('#seaTitle').innerHTML = `${sea.emoji ? `<span aria-hidden="true">${sea.emoji}</span> ` : ''}${sea.title}`;
    $('#seaIntro').innerHTML = sea.intro || '';
    const saved = readSave(sid);
    const play = $('#btnSeaPlay');
    const done = !!meta.done[sid];
    if (saved && !saved.finished) play.innerHTML = `▶ Continuar <small>Trámite ${saved.level}: ${sea.levels[saved.level - 1].title}</small>`;
    else play.innerHTML = done ? '🔁 Volver a jugar la temporada' : '▶ Empezar temporada';
    const grid = $('#levelGrid');
    grid.innerHTML = '';
    const prog = progressOf(sid);
    // Temporada abierta sin progreso (T1 en la primera visita, o recién desbloqueada): el 01 nunca
    // está bloqueado, sale «En curso».
    const curN = saved && !saved.finished ? saved.level : (done ? 0 : Math.max(1, prog));
    const maxL = done ? sea.levels.length : Math.max(1, prog, curN);
    const recs = meta.records[sid] || {};
    sea.levels.forEach((lv, i) => {
      const k = i + 1;
      const state = k === curN ? 'cur' : k <= maxL ? (done || k < prog ? 'done' : 'open') : 'locked';
      const rec = recs[k];
      const b = el('button', 'lvl ' + state);
      b.type = 'button';
      if (state === 'cur') b.setAttribute('aria-current', 'step');
      if (state === 'locked') b.setAttribute('aria-disabled', 'true');
      const s = state === 'done' ? `<span aria-hidden="true">✓</span><span class="sr-only">Completado${rec ? ':' : ''}</span>${rec ? ` ${fmtTime(rec.t)} · ${plural(rec.h, 'pista', 'pistas')}` : ''}`
        : state === 'cur' ? '<span class="chip cur">En curso</span>'
          : state === 'locked' ? '<span aria-hidden="true">🔒</span><span class="sr-only">Bloqueado</span>' : '';
      b.innerHTML = `<span class="lvl-n">${pad2(k)}</span><span class="lvl-t">${lv.title}</span><span class="lvl-s">${s}</span>`;
      b.onclick = () => {
        if (state === 'locked') {
          sfx('bad'); shake(b);
          const txt = `🔒 Trámite bloqueado. Antes hay que completar el trámite ${pad2(k - 1)}.`;
          toast(`<span class="toast-b">${txt}</span>`, 3000);
          announce(txt);
          return;
        }
        sfx('click'); startFromLevel(sid, k);
      };
      grid.append(b);
    });
    show('season', {
      title: `Temporada ${sid}: ${plainTitle(sea.title) || sea.title} — ${BRAND}`,
      after: () => {
        const c = $('#levelGrid .lvl.cur');
        if (c && booted && typeof c.scrollIntoView === 'function') { try { c.scrollIntoView({ block: 'nearest' }); } catch (e) { /* nada */ } }
      },
    });
  }

  function startSeasonLevel(sid, n, keepStats) {
    const prev = readSave(sid);
    S = newState(sid, n);
    if (keepStats && prev) { S.totalHints = prev.totalHints || 0; S.elapsed = prev.elapsed || 0; }
    setupLevel(n);
    showIntro();
  }

  function seasonPlay() {
    const sid = viewSeason;
    const saved = readSave(sid);
    if (saved && !saved.finished) return continueGame(sid);
    return startSeasonLevel(sid, 1, false);
  }

  function continueGame(sid) {
    const saved = readSave(sid || meta.last);
    if (!saved) return;
    S = Object.assign(newState(saved.season || sid, saved.level), saved);
    enterPlay(true);
  }

  function startFromLevel(sid, n) {
    const saved = readSave(sid);
    if (saved && !saved.finished && saved.level === n) return continueGame(sid);
    const go = () => startSeasonLevel(sid, n, true);
    if (saved && !saved.finished && saved.level !== n) {
      confirmModal('¿Cambiar de trámite?', `Tu partida de esta temporada está en el trámite ${saved.level}. ¿Quieres empezar el trámite ${n} desde el principio? (Podrás volver a cualquier trámite desbloqueado.)`, `Ir al trámite ${n}`, go);
    } else go();
    return undefined;
  }

  // ---------------- Hojas del sistema ----------------
  function loadCodeModal() {
    const card = modal({
      title: '📂 Cargar expediente',
      kind: 'system', cls: 'load', sys: true, pauseClock: true,
      html: `<p>Escribe el código de expediente que obtuviste al guardar o al completar un trámite.</p>
        <label class="field" for="codeIn">Código de expediente</label>
        <div class="code-load"><input type="text" id="codeIn" placeholder="EXP-XXXXX-X" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go" maxlength="13" aria-describedby="codeMsg"><button type="button" class="btn primary" id="codeGo" data-sys disabled>Cargar</button></div>
        <p class="msg bad" id="codeMsg" role="alert" hidden></p>`,
      buttons: [{ label: 'Cancelar', cls: 'ghost' }],
    });
    const inp = $('#codeIn', card); const go = $('#codeGo', card); const msg = $('#codeMsg', card);
    inp.addEventListener('input', (e) => {
      if (!(e.inputType && e.inputType.startsWith('delete'))) {
        const f = fmtCode(inp.value);
        if (f !== inp.value) { inp.value = f; try { inp.setSelectionRange(f.length, f.length); } catch (x) { /* nada */ } }
      }
      go.disabled = !readCode(inp.value);
      inp.removeAttribute('aria-invalid');
      msg.hidden = true;
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    go.onclick = commit;
    function commit() {
      const r = readCode(inp.value);
      if (!r) {
        sfx('bad');
        msg.textContent = '—Código no válido. Revíselo y preséntelo de nuevo (por triplicado).';
        msg.hidden = false;
        inp.setAttribute('aria-invalid', 'true');
        try { inp.select(); } catch (e) { /* nada */ }
        focusEl(inp);
        return;
      }
      sfx('click');
      const cur = readSave(r.season);
      if (cur && !cur.finished) {
        const sea = seasonById(r.season);
        confirmModal('¿Usar este código?', `Ya tienes una partida de la temporada ${r.season} en el trámite ${cur.level}. Con este código empezarás el trámite ${r.level} («${sea.levels[r.level - 1].title}») y esa partida se sustituirá.`, 'Usar el código', () => applyCode(r), { no: 'Mantener mi partida' });
      } else applyCode(r);
    }
  }
  function applyCode(r) {
    closeModal('commit');
    track('code_loaded', { season: r.season, level: r.level });
    for (let k = 1; k < r.season; k++) {
      const s = seasonById(k);
      if (s) { meta.done[k] = true; meta.progress[k] = Math.max(progressOf(k), s.levels.length); meta.seenUnlock[k + 1] = true; }
    }
    meta.progress[r.season] = Math.max(progressOf(r.season), r.level);
    S = newState(r.season, r.level); S.totalHints = r.hints;
    setupLevel(r.level);
    armGuard();
    showIntro();
  }

  function saveModal() {
    if (!S || !L) return;
    save();
    track('save_code_shown', { season: S.season, level: S.level });
    const code = makeCode(S.season, S.level, S.totalHints);
    const card = modal({
      title: '📂 Tu código de expediente',
      kind: 'system', cls: 'save', sys: true, pauseClock: true,
      html: `<p>Tu partida ya se guarda sola en este navegador. Este código sirve para seguir en otro móvil u ordenador.</p>
        <div class="code-box"><code id="saveCode">${code}</code><button type="button" class="btn" id="copyCode" data-sys>${ico('i-copy')}Copiar</button><button type="button" class="btn" id="shareCode" data-sys>${ico('i-share')}Enviármelo</button></div>
        <p class="small copy-hint" id="saveCopyHint" hidden></p>
        <p class="small">El código te lleva al inicio del trámite ${S.level} de la temporada ${S.season} («${L.title}»).</p>
        ${isIOS() && !isStandalone() ? '<p class="small ios-note">En iPhone, Safari puede archivar tu partida si pasas una semana sin jugar: guarda este código.</p>' : ''}`,
      buttons: [{ label: 'Seguir jugando', cls: 'primary' }],
    });
    $('#copyCode', card).onclick = () => copyText(code, $('#copyCode', card), $('#saveCode', card), $('#saveCopyHint', card));
    $('#shareCode', card).onclick = () => shareCode(code);
  }

  function hintModal() {
    if (!S || !L || screen !== 'play') return;
    const hs = L.hints || [];
    let fresh = -1;
    const render = (box) => {
      const idx = S.hintIdx; const total = hs.length;
      const nextIsSol = idx === total - 1;
      const shown = hs.slice(0, idx);
      box.innerHTML = `<div class="turno-head${fresh >= 0 ? ' is-new' : ''}"><span class="turno-n">Turno A-${pad2(Math.min(idx + 1, total) || 1)}</span><span class="turno-c">${idx ? `Pista ${idx} de ${total}` : `${total} pistas disponibles`}</span><span class="pips" aria-hidden="true">${hs.map((_, i) => `<i class="${[i < idx && 'on', i === total - 1 && 'sol'].filter(Boolean).join(' ')}"></i>`).join('')}</span></div>
        <p class="turno-lead">Cada pista queda anotada en tu expediente y cuenta para tu categoría final.</p>
        ${shown.length ? `<ol class="hint-list">${shown.map((h, i) => `<li class="hint${i === total - 1 ? ' sol' : ''}${i === fresh ? ' is-new' : ''}"${i === fresh ? ' tabindex="-1"' : ''}><span class="hint-k">${i === total - 1 ? 'Solución' : `Pista ${i + 1}`}</span> ${h}</li>`).join('')}</ol>` : '<p class="hint-none">Aún no has pedido ninguna pista en este trámite.</p>'}
        ${idx < total ? `<div class="turno-actions"><button type="button" id="moreHint" class="btn${nextIsSol ? ' cost' : ''}" data-sys${nextIsSol ? ' aria-expanded="false" aria-controls="solConfirm"' : ''}>${nextIsSol ? '⚠ Ver la solución…' : `🎟️ Sacar número <small>(pista ${idx + 1} de ${total})</small>`}</button></div>
          ${nextIsSol ? '<div class="turno-confirm" id="solConfirm" role="alert" hidden><p>La solución te lo cuenta todo y queda anotada en tu expediente.</p><div class="row-btns"><button type="button" class="btn ghost" id="solNo" data-sys>Mejor lo intento</button><button type="button" class="btn cost" id="solYes" data-sys>Sí, ver la solución</button></div></div>' : ''}`
        : '<p class="hint-none">Ya no quedan pistas: te lo hemos contado todo, que no es poco.</p>'}`;
      const mh = $('#moreHint', box); const conf = $('#solConfirm', box);
      if (mh) {
        mh.onclick = () => {
          if (!nextIsSol) { take(box); return; }
          sfx('click');
          conf.hidden = false; mh.setAttribute('aria-expanded', 'true');
          focusEl($('#solNo', box));
        };
      }
      if (conf) {
        $('#solYes', box).onclick = () => take(box);
        $('#solNo', box).onclick = () => { sfx('click'); conf.hidden = true; mh.setAttribute('aria-expanded', 'false'); focusEl(mh); };
      }
      if (fresh >= 0) {
        const li = $('.hint.is-new', box);
        if (li && li.scrollIntoView) { try { li.scrollIntoView({ block: 'nearest', behavior: RM() ? 'auto' : 'smooth' }); } catch (e) { /* nada */ } }
        focusEl($('#moreHint', box) || li);
      }
    };
    const take = (box) => {
      S.hintIdx++; S.totalHints++; save();
      sfx('bell'); haptic('tap');
      track('hint_request', { season: S.season, level: S.level, level_id: `T${S.season}-N${S.level}`, hint: S.hintIdx, is_solution: S.hintIdx === hs.length });
      fresh = S.hintIdx - 1;
      render(box);
      syncHint();
      idleSecs = 0;
      emit('hint', { idx: S.hintIdx, total: hs.length });
      announce(`${fresh === hs.length - 1 ? 'Solución' : `Pista ${S.hintIdx}`}: ${strip(hs[fresh])}`);
    };
    modal({
      title: '💡 Ventanilla de Pistas', kind: 'system', cls: 'hints', sys: true, pauseClock: true,
      html: '<div id="hintBox" class="turno"></div>',
      buttons: [{ label: 'Volver a la sala', cls: 'ghost' }],
      onMount: (body) => render($('#hintBox', body)),
    });
  }

  function helpModal() {
    const T = isTouch();
    const side = mq('(min-width: 1024px) and (min-height: 521px)') || mq('(orientation: landscape) and (max-height: 520px)');
    const card = (e, h, p) => `<div class="help-card"><span class="help-e" aria-hidden="true">${e}</span><h3>${h}</h3><p>${p}</p></div>`;
    const c = modal({
      title: '📘 Manual del ciudadano (edición abreviada)',
      kind: 'doc', cls: 'doc help', sys: true, pauseClock: true,
      html: `<div class="help-cards">
          ${card('🔍', 'Examina', `${T ? 'Toca' : 'Haz clic en'} lo que te llame la atención: carteles, personas, aparatos…`)}
          ${card('🎒', 'Recoge', `Lo que consigues va a tu bandeja, ${side ? 'a la derecha' : 'abajo'}.`)}
          ${card('🤝', 'Usa y combina', `${T ? 'Toca' : 'Haz clic en'} un objeto de tu bandeja y luego dónde usarlo, o ${T ? 'toca' : 'elige'} otro objeto para combinarlos.`)}
          ${card('💡', 'Pide pistas', 'La Ventanilla de Pistas atiende sin cita previa. La última pista es la solución.')}
        </div>
        ${T ? '<p class="help-tip">📱 Desliza la sala a los lados o gira el móvil para verla entera.</p>' : ''}
        <h3 class="help-h">Sobre tu partida</h3>
        <ul class="help-about">
          <li>📚 <b>${BRAND}</b> es un <i lang="en">room escape</i> de 5 temporadas con 10 trámites cada una. Cada temporada es más difícil que la anterior y se desbloquea al superar la previa.</li>
          <li>💾 Tu partida se guarda sola en este navegador.</li>
          <li>🎫 Con tu código de expediente puedes seguir en otro móvil u ordenador: lo encontrarás en «Expediente» durante la partida y al completar cada trámite.</li>
          ${isIOS() ? '<li>🍏 En iPhone, Safari puede archivar tu partida si pasas una semana sin jugar: guarda tu código de expediente.</li>' : ''}
        </ul>
        <p><button type="button" class="linklike" id="helpTips" data-sys>Repetir los consejos</button></p>
        <p class="help-bye">Buena suerte. —La va a necesitar.</p>`,
      buttons: [{ label: 'Entendido', cls: 'primary' }],
    });
    $('#helpTips', c).onclick = (e) => {
      meta.ui.tips = {}; save();
      e.currentTarget.textContent = '✔ Hecho: los consejos volverán a aparecer';
      announce('Los consejos volverán a aparecer.');
    };
  }

  function logModal() {
    if (!S) return;
    const items = log.slice().reverse();
    modal({
      title: '📋 Registro de entrada', kind: 'system', cls: 'log', sys: true, pauseClock: true,
      html: items.length
        ? `<ol class="log-list" reversed>${items.map((e) => `<li class="log-e${e.unread ? ' unread' : ''}"><div class="log-h">${e.who ? `<span class="log-who">${e.face ? `<span aria-hidden="true">${e.face}</span> ` : ''}${esc(e.who)}</span>` : ''}${e.unread ? '<span class="chip unread">Sin leer</span>' : ''}</div><div class="log-t">${e.text}</div></li>`).join('')}</ol>`
        : '<p class="log-empty">Aún no hay nada registrado en este trámite.</p>',
      buttons: [{ label: 'Volver a la sala', cls: 'ghost' }],
    });
    log.forEach((e) => { e.unread = false; });
  }

  function pauseModal() {
    if (!S || !L || screen !== 'play' || !$('#modal').hidden) return;
    setObjOpen(false);
    const vib = canVibrate() && isTouch(); // el escritorio también tiene navigator.vibrate, pero no vibra
    const code = makeCode(S.season, S.level, S.totalHints);
    const row = (act, icon, label, value, cls, extra) => `<button type="button" class="sheet-row${cls ? ' ' + cls : ''}" id="pause${act}" data-act="${act}" data-sys${extra || ''}>${ico(icon)}<span class="sheet-l">${label}</span>${value != null ? `<span class="sheet-v">${value}</span>` : ''}</button>`;
    const card = modal({
      title: '⏸ Expediente en pausa', kind: 'system', cls: 'pause', sys: true, pauseClock: true, buttons: [],
      html: `<div class="obj-box pause-obj"><span class="obj-stamp">OBJETIVO</span><p>${goalHtmlOf(L)}</p></div>
        <p class="pause-clock">⏱ <b>${fmtTime(S.elapsed)}</b> en esta temporada · T${S.season} · Trámite ${S.level} de ${SEA.levels.length}</p>
        <div class="sheet-rows">
          ${row('Resume', 'i-play', 'Seguir jugando', null, 'primary')}
          ${row('Save', 'i-ticket', 'Código de expediente', code)}
          ${row('Help', 'i-help', 'Cómo jugar')}
          ${row('Sound', meta.muted ? 'i-speaker-off' : 'i-speaker', 'Sonido', meta.muted ? 'Silenciado' : 'Activado', 'toggle', ` role="switch" aria-checked="${!meta.muted}"`)}
          ${vib ? row('Vibe', 'i-vibrate', 'Vibración', meta.noHaptics ? 'Desactivada' : 'Activada', 'toggle', ` role="switch" aria-checked="${!meta.noHaptics}"`) : ''}
          ${row('Restart', 'i-restart', 'Reiniciar este trámite', null, 'cost')}
          ${row('Season', 'i-list', 'Trámites de la temporada')}
          ${row('Exit', 'i-exit', 'Salir al menú principal')}
        </div>
        <nav class="pause-legal" aria-label="Información legal"><a href="legal/aviso-legal.html">Aviso legal</a><a href="legal/privacidad.html">Privacidad</a><a href="legal/cookies.html">Cookies</a><a href="legal/descargo.html">Descargo</a><button type="button" class="linklike" id="pauseCookies" data-sys>Configurar cookies</button></nav>`,
    });
    const on = (act, fn) => { const b = $(`#pause${act}`, card); if (b) b.onclick = fn; };
    const setRow = (act, value, checked, icon) => {
      const b = $(`#pause${act}`, card); if (!b) return;
      $('.sheet-v', b).textContent = value; b.setAttribute('aria-checked', String(checked));
      if (icon) $('use', b).setAttribute('href', '#' + icon);
    };
    on('Resume', () => { sfx('click'); closeModal('dismiss'); });
    on('Save', () => { sfx('click'); saveModal(); });
    on('Help', () => { sfx('click'); helpModal(); });
    on('Sound', () => {
      meta.muted = !meta.muted; save(); syncMute(); sfx('click');
      setRow('Sound', meta.muted ? 'Silenciado' : 'Activado', !meta.muted, meta.muted ? 'i-speaker-off' : 'i-speaker');
    });
    on('Vibe', () => {
      meta.noHaptics = !meta.noHaptics; save();
      setRow('Vibe', meta.noHaptics ? 'Desactivada' : 'Activada', !meta.noHaptics);
      haptic('tap');
    });
    on('Restart', () => {
      sfx('click');
      confirmModal('¿Reiniciar el trámite?', `Vuelves al principio de «${L.title}» con los objetos que traías. Las pistas ya pedidas siguen contando.`, 'Reiniciar', restartLevel, { cost: true });
    });
    on('Season', () => { sfx('click'); closeModal('commit'); save(); openSeason(S.season); });
    on('Exit', () => { closeModal('commit'); exitToMenu(); });
    $$('.pause-legal a', card).forEach((a) => a.addEventListener('click', () => {
      try { sessionStorage.setItem(RESUME_KEY, String(Date.now())); } catch (e) { /* nada */ }
      save();
    }));
    $('#pauseCookies', card).onclick = () => {
      closeModal('commit');
      if (window.Consent && typeof window.Consent.open === 'function') window.Consent.open($('#btnMenu'));
    };
  }
  function restartLevel() {
    const keep = S.hintIdx;
    setupLevel(S.level);
    S.hintIdx = keep; // las pistas ya pedidas siguen contando
    save();
    track('level_restart', { season: S.season, level: S.level, level_id: `T${S.season}-N${S.level}` });
    enterPlay(false);
  }
  function exitToMenu() {
    sfx('click'); save();
    if (S && !pendingWin) track('back_to_menu', { season: S.season, level: S.level, level_id: `T${S.season}-N${S.level}`, seconds_in_level: Math.max(0, S.elapsed - (S.levelStart || 0)) });
    goMenu();
  }

  function briefModal() {
    if (!L) return;
    setObjOpen(false);
    modal({
      title: `📋 ${plainTitle(L.title) || L.title} — Presentación del trámite`,
      kind: 'doc', cls: 'doc brief', sys: true,
      html: `<div class="doc-body">${L.intro}${carryHtml(L, 'Traes contigo')}</div>`,
      buttons: [{ label: 'Volver a la sala', cls: 'ghost' }],
    });
  }

  // ---------------- Botón «atrás» del sistema (guardia de historial) ----------------
  // Tras recargar con la guardia como entrada actual, la guardia ya está puesta pero nadie la usó:
  // el primer «atrás» en el menú la consumiría sin efecto visible, así que entonces se sigue atrás.
  let bootGuard = !!(history.state && history.state.vum);
  let guardArmed = bootGuard;
  let needsGuard = false;
  let ignoreNextPop = false;
  function armGuard() {
    if (guardArmed) return;
    try { history.pushState({ vum: 1 }, ''); guardArmed = true; needsGuard = false; } catch (e) { /* nada */ }
  }
  function onPopState() {
    guardArmed = false;
    const stale = bootGuard; bootGuard = false;
    if (ignoreNextPop) { ignoreNextPop = false; return; }
    const C = window.Consent;
    if (C && typeof C.isOpen === 'function' && C.isOpen()) { try { C.close(); } catch (e) { /* nada */ } needsGuard = true; return; }
    if (!$('#modal').hidden) { closeModal('back'); needsGuard = true; return; }
    if (screen === 'play') { pauseModal(); needsGuard = true; return; }
    if (screen === 'intro' || screen === 'win') { openSeason(S ? S.season : (viewSeason || 1)); needsGuard = true; return; }
    if (screen === 'season' || screen === 'end') { renderMenu(); show('menu', { title: TITLE_MENU }); needsGuard = false; return; }
    if (stale && screen === 'menu') { try { history.back(); } catch (e) { /* nada */ } }
  }

  // ---------------- Arranque ----------------
  function bind() {
    $('#btnContinue').onclick = () => {
      sfx('click');
      if (!heroAction) return;
      if (heroAction.leaves) armGuard();
      heroAction.run();
    };
    $('#btnCode').onclick = () => { sfx('click'); loadCodeModal(); };
    $('#btnHelp').onclick = () => { sfx('click'); helpModal(); };
    $('#btnSeaPlay').onclick = () => { sfx('click'); seasonPlay(); };
    $('#btnSeaBack').onclick = () => { sfx('click'); goMenu(); };
    $('#btnStart').onclick = () => { sfx('click'); enterPlay(false); };
    $('#btnIntroMenu').onclick = () => { sfx('click'); openSeason(S.season); };
    $('#btnNext').onclick = () => { sfx('click'); showIntro(); };
    $('#btnWinMenu').onclick = () => { sfx('click'); openSeason(S.season); };
    $('#btnEndMenu').onclick = () => { sfx('click'); goMenu(); };
    $('#btnEndNext').onclick = () => { sfx('click'); if (endNext) endNext(); };
    $('#btnBack').onclick = () => {
      sfx('click');
      if (screen === 'intro' || screen === 'win') openSeason(S ? S.season : (viewSeason || 1));
      else goMenu();
    };
    $('#btnHint').onclick = () => { sfx('click'); hintModal(); };
    $('#btnSave').onclick = () => { sfx('click'); saveModal(); };
    $('#btnHelp2').onclick = () => { sfx('click'); helpModal(); };
    $('#btnMenu').onclick = () => { sfx('click'); pauseModal(); };
    $('#btnMute').onclick = () => { meta.muted = !meta.muted; save(); syncMute(); sfx('click'); };

    // Objetivo: chip (móvil) y panel (escritorio) comparten estado
    const toggleObj = (e) => { sfx('click'); if (!objOpen) objCtl = e.currentTarget; setObjOpen(!objOpen); };
    $('#objChip').onclick = toggleObj;
    $('#objective').onclick = toggleObj;
    $('#btnBrief').onclick = () => { sfx('click'); briefModal(); };
    // Tocar fuera de la ficha del objetivo la cierra (y, si cae en la sala, no hace nada más)
    document.addEventListener('click', (e) => {
      if (!objOpen || !e.target.closest || e.target.closest('#objSlip, #objChip, #objective')) return;
      setObjOpen(false);
      if (e.target.closest('#scene')) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    // Ventanilla
    $('#btnNextMsg').onclick = () => { if (queue.length) { sfx('type'); nextMsg(); } };
    $('#btnSkip').onclick = () => { sfx('click'); skipQueue(); };
    $('#btnLog').onclick = () => { sfx('click'); logModal(); };
    $('#btnFinish').onclick = (e) => { e.stopPropagation(); finishLevel(); };
    $('#btnWonCta').onclick = () => finishLevel();
    $('#dialog').addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, select, textarea')) return;
      if (queue.length) { sfx('click'); nextMsg(); }
    });

    // Sala: arrastre, flechas, plano, lupa y uso de objetos
    const wrap = $('#sceneWrap');
    wrap.addEventListener('scroll', () => {
      schedulePan();
      if (panIntent && !meta.ui.panned && Math.abs(wrap.scrollLeft - panStart) > 24) { meta.ui.panned = true; save(); }
    }, { passive: true });
    ['pointerdown', 'touchstart', 'wheel'].forEach((t) => wrap.addEventListener(t, panIntentStart, { passive: true }));
    window.addEventListener('resize', () => { if (screen === 'play') schedulePan(); });
    $('#panL').onclick = () => { panIntentStart(); scrollRoom(-1); };
    $('#panR').onclick = () => { panIntentStart(); scrollRoom(1); };
    $('#plano').addEventListener('click', (e) => {
      const r = rectOf($('#plano')); if (!r) return;
      panIntentStart();
      const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const left = f * wrap.scrollWidth - wrap.clientWidth / 2;
      try { wrap.scrollTo({ left, behavior: RM() ? 'auto' : 'smooth' }); } catch (x) { wrap.scrollLeft = left; }
    });
    $('#btnLupa').onclick = lupa;
    $('#useDrop').onclick = () => {
      sfx('click');
      const id = selected;
      setSelected(null); refresh();
      // #useChip se oculta con el botón enfocado dentro: el foco vuelve a la casilla soltada
      focusEl((id && invNodes.get(id)) || firstSlot() || $('#playTitle'));
    };
    $('#scene').addEventListener('click', (e) => {
      if (e.target.closest('.hs')) return;
      const b = nearestHotspot(e.clientX, e.clientY);
      if (b) activateHs(b.dataset.id, { keyboard: false, x: e.clientX, y: e.clientY, assisted: true });
    });

    // Códigos y compartir
    $('#winCopy').onclick = () => copyText($('#winCode').textContent, $('#winCopy'), $('#winCode'), $('#winCopyHint'));
    $('#winShare').onclick = () => { sfx('click'); shareCode($('#winCode').textContent); };
    $('#btnShare').onclick = () => {
      sfx('click');
      if (S) track('share_click', { season: S.season });
      share({ title: BRAND, text: shareText }, shareText).then((r) => {
        if (r === 'copied') notify('Copiado. Pégalo donde quieras (por triplicado).');
        else if (r === 'failed') notify('No se ha podido copiar. Haz una captura de pantalla (compulsada).');
      });
    };

    // Ko-fi: todos los [data-kofi]
    bindKofi(document);
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('[data-kofi]');
      if (a) track('donate_click', { where: a.dataset.kofi, season: S ? S.season : null, level: S ? S.level : null });
    });

    // Modal: Esc (cancel), cierre nativo, telón y deslizar hacia abajo
    const m = $('#modal');
    m.addEventListener('cancel', (e) => { e.preventDefault(); closeModal('esc'); });
    // Sin 'cancel' previo solo llega aquí el «atrás» de Android (CloseWatcher)
    m.addEventListener('close', () => { if (!m.open && !m.hidden) closeModal('back'); });
    let backdropDown = false; let swipe = null;
    m.addEventListener('pointerdown', (e) => {
      backdropDown = e.target === m;
      const head = e.target.closest && e.target.closest('.modal-head, .modal-grab');
      if (!head || e.pointerType === 'mouse' || e.target.closest('button, a, input')) return;
      const card = $('.modal-card', m);
      if (!card || 'form' in card.dataset) return;
      swipe = { y: e.clientY, t: Date.now(), card, id: e.pointerId, dy: 0 };
    });
    m.addEventListener('pointermove', (e) => {
      if (!swipe || e.pointerId !== swipe.id) return;
      swipe.dy = Math.max(0, e.clientY - swipe.y);
      swipe.card.style.translate = `0 ${swipe.dy}px`;
    });
    const endSwipe = (e, cancel) => {
      if (!swipe || e.pointerId !== swipe.id) return;
      const s = swipe; swipe = null;
      s.card.style.translate = '';
      const dt = Math.max(1, Date.now() - s.t);
      if (!cancel && (s.dy > 90 || (s.dy > 24 && s.dy / dt > 0.5))) closeModal('swipe');
    };
    m.addEventListener('pointerup', (e) => endSwipe(e, false));
    m.addEventListener('pointercancel', (e) => endSwipe(e, true));
    m.addEventListener('click', (e) => {
      if (e.target !== m || !backdropDown) return;
      const card = $('.modal-card', m);
      if (card && 'form' in card.dataset) return;
      closeModal('backdrop');
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (!m.hidden) {
        if (e.key === 'Escape') { e.preventDefault(); closeModal('esc'); return; }
        if (modalKey) modalKey(e);
        return;
      }
      const C = window.Consent;
      if (C && typeof C.isOpen === 'function' && C.isOpen()) return;
      if (screen !== 'play' || !S) return;
      const t = e.target;
      const inField = !!(t && t.closest && t.closest('input, select, textarea, a, [contenteditable]'));
      if (e.key === 'Escape') { e.preventDefault(); if (objOpen) setObjOpen(false); else pauseModal(); return; }
      if ((e.key === 'h' || e.key === 'H') && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); hintModal(); return; }
      if ((e.key === 'Enter' || e.key === ' ') && queue.length && !inField) {
        // En botones (objetos, bandeja, Siguiente…) manda su propio clic
        if (t && t.closest && t.closest('button')) return;
        e.preventDefault(); sfx('type'); nextMsg();
      }
    });

    // Guardia de historial
    window.addEventListener('popstate', onPopState);
    const lazyArm = () => { if (needsGuard && !guardArmed && screen !== 'menu') armGuard(); };
    document.addEventListener('pointerdown', lazyArm, true);
    document.addEventListener('keydown', lazyArm, true);

    // Medidas para el CSS: barra superior y teclado virtual
    const tb = $('#topbar');
    const setTop = () => { const h = tb.offsetHeight; if (h > 0) document.documentElement.style.setProperty('--topH', h + 'px'); };
    if (typeof window.ResizeObserver === 'function') { try { new ResizeObserver(setTop).observe(tb); } catch (e) { /* nada */ } }
    setTop();
    const vv = window.visualViewport;
    if (vv && vv.addEventListener) {
      const syncVV = () => {
        const r = document.documentElement.style;
        r.setProperty('--vvh', vv.height + 'px');
        r.setProperty('--kb', Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) + 'px');
      };
      vv.addEventListener('resize', syncVV); vv.addEventListener('scroll', syncVV); syncVV();
    }

    // Reloj y espera
    setInterval(() => {
      if (screen !== 'play' || !S || document.hidden || pendingWin) return;
      if (!(modalMeta && modalMeta.pauseClock)) {
        S.elapsed++;
        $('#timer').textContent = fmtTime(S.elapsed);
        if (S.elapsed % 10 === 0) save();
      }
      if (!m.hidden) return;
      idleSecs++;
      // Tras 45 s sin hacer nada, la ventanilla vuelve a la línea de espera (consejos)
      if (idleSecs === 45 && current && !queue.length) { current = null; renderDialog(); }
      if (!current) updateIdle();
    }, 1000);
    window.addEventListener('pagehide', save);
    window.addEventListener('pageshow', (e) => { if (e.persisted) { try { sessionStorage.removeItem(RESUME_KEY); } catch (x) { /* nada */ } } });
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  }

  // API para los potenciadores (ui-puzzles.js, ui-fx.js), que la leen de forma perezosa
  window.VUM = {
    sfx, haptic, rm: RM, announce,
    pref(key, value) {
      if (arguments.length > 1) { meta.ui[key] = value; save(); return value; }
      return meta.ui[key];
    },
    state: () => ({ screen, season: S ? S.season : null, level: S ? S.level : null, inv: S ? S.inv.slice() : [], selected, pendingWin, queue: queue.length }),
    goal: () => goalOf(L),
  };

  // Vuelta de las páginas legales (abiertas desde la hoja de pausa): seguir donde estaba
  let resumeNow = false;
  try {
    const f = +sessionStorage.getItem(RESUME_KEY);
    sessionStorage.removeItem(RESUME_KEY);
    if (f && Date.now() - f < 30 * 60 * 1000 && meta.last) { const sv = readSave(meta.last); resumeNow = !!(sv && !sv.finished); }
  } catch (e) { /* nada */ }

  bind();
  syncMute();
  renderMenu();
  show('menu', { title: TITLE_MENU });
  if (resumeNow) continueGame(meta.last);
  booted = true;
  track('app_open', { has_save: !!meta.last, seasons_done: Object.keys(meta.done).filter((k) => meta.done[k]).length });

  // Gancho de depuración / pruebas automáticas
  window.RoomEscape = {
    g, state: () => S, level: () => L, season: () => SEA, items: () => ITEMS, makeCode, readCode, meta: () => meta,
    start: (sid, n) => { S = newState(sid, n); setupLevel(n); enterPlay(false); },
    click: (id) => {
      const hs = L.hotspots.find((h) => h.id === id);
      if (!hs) throw new Error(`Hotspot inexistente: ${id}`);
      if (hs.show && !hs.show(g)) throw new Error(`Hotspot oculto: ${id}`);
      clickHotspot(hs);
    },
    item: (id) => { if (!S.inv.includes(id)) throw new Error(`No tienes el objeto: ${id}`); clickItem(id); },
    finish: () => finishLevel(),
    pending: () => pendingWin,
    screen: () => screen,
    openSeason, renderMenu, show,
  };
})();
