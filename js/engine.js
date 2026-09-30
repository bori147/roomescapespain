/* ==========================================================
   VUELVA USTED MAÑANA — Motor del juego
   ========================================================== */
(function () {
  'use strict';

  const LEVELS = window.LEVELS;
  const ITEMS = window.ITEMS;
  const SAVE_KEY = 'roomescapespain.save.v1';
  const META_KEY = 'roomescapespain.meta.v1';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const rand = (a) => a[Math.floor(Math.random() * a.length)];

  function readLS(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function writeLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  // ---------------- Estado ----------------
  let S = null;          // estado de la partida
  let L = null;          // nivel actual
  let selected = null;   // objeto de inventario seleccionado
  let queue = [];        // cola de mensajes
  let current = null;    // mensaje mostrado
  let pendingWin = false;
  let ctxWho = null;
  let screen = 'menu';
  let modalKey = null;

  const meta = Object.assign({ maxLevel: 1, muted: false, finished: false }, readLS(META_KEY) || {});

  function newState(level) {
    return { v: 1, level, flags: {}, inv: [], hintIdx: 0, totalHints: 0, elapsed: 0, finished: false };
  }
  function save() {
    if (S) writeLS(SAVE_KEY, S);
    writeLS(META_KEY, meta);
  }

  // ---------------- Código de expediente ----------------
  // Codifica nivel + pistas usadas en un código tipo EXP-03T2-K
  function checksum(body) {
    let sum = 0;
    for (let i = 0; i < body.length; i++) sum += body.charCodeAt(i) * (i + 3);
    return String.fromCharCode(65 + (sum % 26));
  }
  function makeCode(level, hints) {
    const n = level * 100 + Math.min(hints, 99);
    const body = (n * 37 + 1234).toString(36).toUpperCase().padStart(4, '0');
    return `EXP-${body}-${checksum(body)}`;
  }
  function readCode(code) {
    const c = String(code).toUpperCase().replace(/[^0-9A-Z]/g, '');
    const m = c.match(/^(?:EXP)?([0-9A-Z]{4})([A-Z])$/);
    if (!m || checksum(m[1]) !== m[2]) return null;
    const x = parseInt(m[1], 36) - 1234;
    if (x % 37 !== 0) return null;
    const n = x / 37;
    const level = Math.floor(n / 100);
    if (level < 1 || level > LEVELS.length) return null;
    return { level, hints: n % 100 };
  }

  // ---------------- Audio ----------------
  let actx = null;
  function tone(freq, dur, type = 'sine', vol = 0.07, delay = 0) {
    const t = actx.currentTime + delay;
    const o = actx.createOscillator(); const gn = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function sfx(kind) {
    if (meta.muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      switch (kind) {
        case 'click': tone(520, 0.04, 'square', 0.03); break;
        case 'pick': tone(660, 0.08); tone(990, 0.12, 'sine', 0.07, 0.07); break;
        case 'ok': tone(523, 0.1); tone(659, 0.1, 'sine', 0.07, 0.09); tone(784, 0.18, 'sine', 0.07, 0.18); break;
        case 'bad': tone(160, 0.25, 'sawtooth', 0.05); break;
        case 'stamp': tone(90, 0.15, 'square', 0.09); tone(60, 0.2, 'sine', 0.1, 0.02); break;
        case 'win': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.07, i * 0.12)); break;
        default: break;
      }
    } catch (e) { /* sin audio */ }
  }

  // ---------------- API para los niveles ----------------
  const g = {
    flag: (k) => S.flags[k],
    set: (k, v = true) => { S.flags[k] = v; },
    has: (id) => S.inv.includes(id),
    give(id) {
      if (S.inv.includes(id)) return;
      S.inv.push(id);
      toast(`${ITEMS[id].emoji} <b>${ITEMS[id].name}</b>`, 'Nuevo objeto');
      sfx('pick');
    },
    take(id) { S.inv = S.inv.filter((x) => x !== id); if (selected === id) selected = null; },
    say,
    doc(title, html) { modal({ title, html: `<div class="doc-body">${html}</div>`, cls: 'doc' }); },
    modal: (o) => modal(o),
    closeModal: () => closeModal(),
    input: (o) => input(o),
    win() {
      if (pendingWin) return;
      pendingWin = true;
      sfx('win');
      renderDialog();
      $('#scene').classList.add('won');
    },
    sfx,
    refresh: () => refresh(),
  };

  // ---------------- Mensajes ----------------
  function say(text, who) {
    queue.push({ text, who: who === undefined ? ctxWho : who });
    if (!current) nextMsg();
    else renderDialog();
  }
  function nextMsg() {
    current = queue.shift() || null;
    renderDialog();
  }
  function clearQueue() { queue = []; current = null; renderDialog(); }
  function renderDialog() {
    const d = $('#dialog');
    if (!d) return;
    let html = '';
    if (current) {
      html += (current.who ? `<div class="dlg-who">${current.who}</div>` : '') + `<div class="dlg-text">${current.text}</div>`;
      if (queue.length) html += `<div class="dlg-more">▼ Continuar (${queue.length})</div>`;
    } else if (!pendingWin) {
      html = `<div class="dlg-idle">${selected ? `Usando <b>${ITEMS[selected].emoji} ${ITEMS[selected].name}</b>: haz clic en algo de la sala o en otro objeto.` : 'Haz clic en los objetos de la sala para examinarlos. Selecciona un objeto de tu inventario y haz clic en algo para usarlo.'}</div>`;
    }
    if (pendingWin && !queue.length) html += '<button class="btn primary dlg-next" id="btnFinish">📨 Trámite completado — continuar ▶</button>';
    d.innerHTML = html;
    d.classList.toggle('clickable', !!queue.length);
    const bf = $('#btnFinish');
    if (bf) bf.onclick = (e) => { e.stopPropagation(); finishLevel(); };
  }

  // ---------------- Toast ----------------
  let toastT = null;
  function toast(html, title) {
    const t = $('#toast');
    t.innerHTML = (title ? `<small>${title}</small>` : '') + `<div>${html}</div>`;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ---------------- Modal ----------------
  function modal({ title, html, cls, buttons, onMount, onKey }) {
    const m = $('#modal');
    m.innerHTML = '';
    const card = el('div', 'modal-card ' + (cls || ''));
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.innerHTML = `<div class="modal-head"><h3>${title || ''}</h3><button class="modal-x" aria-label="Cerrar">✕</button></div><div class="modal-body">${html || ''}</div><div class="modal-foot"></div>`;
    const body = $('.modal-body', card);
    const foot = $('.modal-foot', card);
    const btns = buttons || [{ label: 'Cerrar', cls: 'primary' }];
    btns.forEach((b) => {
      const be = el('button', 'btn ' + (b.cls || ''), b.label);
      be.onclick = () => {
        sfx('click');
        const r = b.onClick ? b.onClick(closeModal, body) : true;
        if (r !== false) closeModal();
        refresh();
      };
      foot.append(be);
    });
    $('.modal-x', card).onclick = () => { closeModal(); };
    m.append(card);
    m.hidden = false;
    modalKey = onKey || null;
    m.onclick = (e) => { if (e.target === m) closeModal(); };
    if (onMount) onMount(body, closeModal);
    const f = card.querySelector('input:not([type=checkbox]), select');
    if (f && window.matchMedia('(pointer: fine)').matches) f.focus();
    return card;
  }
  function closeModal() {
    const m = $('#modal');
    if (m.hidden) return;
    m.hidden = true; m.innerHTML = ''; modalKey = null;
    if (screen === 'play') refresh();
  }

  // ---------------- Entrada de códigos ----------------
  function input(o) {
    const numeric = !!o.numeric;
    const maxLen = o.maxLen || 12;
    let val = '';
    const card = modal({
      title: o.title,
      cls: 'kp-modal',
      buttons: [{ label: 'Cancelar' }],
      html: `${o.text ? `<p>${o.text}</p>` : ''}
        ${numeric ? `<div class="kp-display"></div>
          <div class="kp-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'OK'].map((k) => `<button class="kp-key ${k === 'OK' ? 'ok' : ''}" data-k="${k}">${k}</button>`).join('')}</div>`
          : `<div class="kp-text"><input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="${maxLen}" placeholder="${o.placeholder || ''}"><button class="btn primary kp-ok">OK</button></div>`}
        <div class="kp-msg"></div>`,
      onKey: numeric ? (e) => {
        if (/^[0-9]$/.test(e.key)) press(e.key);
        else if (e.key === 'Backspace') press('⌫');
        else if (e.key === 'Enter') press('OK');
        else return;
        e.preventDefault();
      } : null,
    });
    const disp = $('.kp-display', card);
    const msg = $('.kp-msg', card);
    const inp = $('.kp-text input', card);
    function upd() {
      if (!disp) return;
      const slots = [];
      for (let i = 0; i < maxLen; i++) slots.push(`<span class="${i < val.length ? 'on' : ''}">${val[i] || '·'}</span>`);
      disp.innerHTML = slots.join('');
    }
    function submit() {
      const v = numeric ? val : inp.value.trim();
      if (!v) return;
      if (o.check(v)) {
        closeModal();
        sfx('ok');
        if (o.ok) o.ok(v);
        refresh();
      } else {
        sfx('bad');
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        msg.textContent = (o.failText && o.failText(v)) || 'Incorrecto.';
        val = ''; if (inp) inp.value = '';
        upd();
      }
    }
    function press(k) {
      if (k === 'OK') return submit();
      sfx('click');
      if (k === '⌫') val = val.slice(0, -1);
      else if (val.length < maxLen) val += k;
      msg.textContent = '';
      upd();
    }
    $$('.kp-key', card).forEach((b) => { b.onclick = () => press(String(b.dataset.k)); });
    if (inp) {
      $('.kp-ok', card).onclick = submit;
      inp.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
      setTimeout(() => inp.focus(), 30);
    }
    upd();
  }

  // ---------------- Render ----------------
  const val = (v) => (typeof v === 'function' ? v(g) : v);

  function renderScene() {
    const sc = $('#scene');
    sc.innerHTML = '';
    sc.className = 'scene floor-' + (L.scene.pattern || 'plain') + (pendingWin ? ' won' : '') + (selected ? ' using' : '');
    sc.style.setProperty('--wall', L.scene.wall);
    sc.style.setProperty('--floor', L.scene.floor);
    sc.style.setProperty('--floorH', (L.scene.floorH || 32) + '%');
    sc.append(el('div', 'wall'), el('div', 'floor'), el('div', 'baseboard'));

    for (const d of L.decor || []) {
      if (d.kind) {
        const e = el('div', 'deco deco-' + d.kind);
        if (d.l != null) Object.assign(e.style, { left: d.l + '%', top: d.t + '%', width: d.w + '%', height: d.h + '%' });
        sc.append(e);
      } else {
        const e = el('span', 'deco deco-emoji', d.emoji);
        Object.assign(e.style, { left: d.x + '%', top: d.y + '%', fontSize: (d.s || 5) + 'cqw', opacity: d.o ?? 1 });
        sc.append(e);
      }
    }

    for (const hs of L.hotspots) {
      if (hs.show && !hs.show(g)) continue;
      const b = el('button', 'hs' + (hs.sign ? ' sign' : ''));
      b.style.left = hs.x + '%';
      b.style.top = hs.y + '%';
      const label = val(hs.label);
      b.dataset.label = label;
      b.setAttribute('aria-label', label);
      b.dataset.id = hs.id;
      if (hs.sign) {
        b.style.width = (hs.w || 12) + 'cqw';
        const sub = hs.sub ? val(hs.sub) : '';
        const big = sub && [...sub].length <= 4 && !/[a-z0-9]/i.test(sub);
        b.innerHTML = `<b>${val(hs.sign)}</b>${sub ? `<span class="${big ? 'sub-emoji' : ''}">${sub}</span>` : ''}`;
      } else {
        b.style.fontSize = (hs.s || 6) + 'cqw';
        b.innerHTML = `<span class="hs-emoji">${val(hs.emoji)}</span>${hs.tag ? `<span class="hs-tag">${val(hs.tag)}</span>` : ""}`;
      }
      b.onclick = () => clickHotspot(hs);
      sc.append(b);
    }
  }

  function renderInv() {
    const inv = $('#inventory');
    inv.innerHTML = '';
    const slots = Math.max(8, S.inv.length);
    for (let i = 0; i < slots; i++) {
      const id = S.inv[i];
      if (!id) { inv.append(el('div', 'slot empty')); continue; }
      const it = ITEMS[id];
      const b = el('button', 'slot' + (selected === id ? ' sel' : ''), `<span class="slot-emoji">${it.emoji}</span><span class="slot-name">${it.name}</span>`);
      b.title = it.name;
      b.onclick = () => clickItem(id);
      inv.append(b);
    }
  }

  function renderTop() {
    $('#lvlInfo').innerHTML = `<b>${S.level}/10</b><span class="lvl-title"> · ${L.title}</span>`;
    $('#timer').textContent = fmtTime(S.elapsed);
    $('#btnMute').textContent = meta.muted ? '🔇' : '🔊';
  }

  function refresh() {
    if (!S || !L || screen !== 'play') { save(); return; }
    renderScene(); renderInv(); renderTop(); renderDialog();
    save();
  }

  // ---------------- Interacción ----------------
  function nope(it) {
    const n = ITEMS[it].name.toLowerCase();
    return rand([
      `Usar ${n} ahí no parece buena idea.`,
      `Eso no es competencia de este negociado. Diríjase a otra ventanilla.`,
      `No. Rotundamente no. (Silencio administrativo negativo.)`,
      `Lo intentas con ${n}, pero no pasa nada. Como con las reclamaciones.`,
    ]);
  }

  function clickHotspot(hs) {
    if (pendingWin || !$('#modal').hidden) return;
    clearQueue();
    const label = val(hs.label);
    ctxWho = label;
    try {
      if (selected) {
        const it = selected; selected = null;
        const fn = hs.use && (hs.use[it] || hs.use['*']);
        if (fn) fn(g, it); else { sfx('bad'); g.say(nope(it)); }
      } else {
        sfx('click');
        if (hs.look) hs.look(g); else g.say('Nada interesante.');
      }
    } finally { ctxWho = null; }
    refresh();
  }

  function clickItem(id) {
    if (pendingWin) return;
    sfx('click');
    clearQueue();
    if (selected && selected !== id) {
      const a = selected; selected = null;
      const key = [a, id].sort().join('+');
      const fn = L.combos && L.combos[key];
      if (fn) fn(g);
      else g.say(`No se te ocurre cómo combinar ${ITEMS[a].name.toLowerCase()} con ${ITEMS[id].name.toLowerCase()}.`);
    } else if (selected === id) {
      selected = null;
    } else {
      selected = id;
      g.say(val(ITEMS[id].desc), `${ITEMS[id].emoji} ${ITEMS[id].name}`);
    }
    refresh();
  }

  // ---------------- Flujo de pantallas ----------------
  function show(name) {
    screen = name;
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'screen-' + name; });
    $('#topbar').classList.toggle('in-game', name === 'play');
    window.scrollTo(0, 0);
  }

  function setupLevel(n) {
    L = LEVELS[n - 1];
    S.level = n; S.flags = {}; S.inv = []; S.hintIdx = 0;
    selected = null; pendingWin = false; queue = []; current = null;
    if (L.init) L.init(g);
    meta.maxLevel = Math.max(meta.maxLevel, n);
    save();
  }

  function showIntro() {
    L = LEVELS[S.level - 1];
    $('#introNum').textContent = `TRÁMITE ${S.level} / ${LEVELS.length}`;
    $('#introTitle').textContent = L.title;
    $('#introPlace').textContent = L.place;
    $('#introStars').innerHTML = 'Dificultad: ' + '<span class="st on">★</span>'.repeat(L.stars) + '<span class="st">★</span>'.repeat(5 - L.stars);
    $('#introText').innerHTML = L.intro;
    show('intro');
  }

  function enterPlay(resumed) {
    L = LEVELS[S.level - 1];
    selected = null; pendingWin = false; queue = []; current = null;
    show('play');
    refresh();
    if (resumed) say(`Expediente recuperado. Continúas en el trámite ${S.level}: «${L.title}».`, '💾 Partida cargada');
  }

  function finishLevel() {
    if (!pendingWin) return;
    pendingWin = false;
    const done = S.level;
    const doneL = LEVELS[done - 1];
    sfx('stamp');
    if (done >= LEVELS.length) {
      S.finished = true; meta.finished = true;
      save();
      showEnding();
      return;
    }
    setupLevel(done + 1);
    $('#resNum').textContent = `${String(done).padStart(3, '0')}/2026`;
    $('#winTitle').textContent = `Trámite ${done} completado: «${doneL.title}»`;
    $('#winText').innerHTML = doneL.outro;
    $('#winCode').textContent = makeCode(S.level, S.totalHints);
    show('win');
    const st = $('#screen-win .stamp');
    st.classList.remove('go'); void st.offsetWidth; st.classList.add('go');
  }

  function showEnding() {
    const h = S.totalHints;
    const rank = h === 0 ? 'Funcionario/a de carrera con plaza fija' : h <= 5 ? 'Gestor/a administrativo/a colegiado/a' : h <= 15 ? 'Ciudadano/a resiliente' : 'Ciudadano/a con cita previa para 2031';
    $('#endStats').innerHTML = `<div><span>Tiempo total</span><b>${fmtTime(S.elapsed)}</b></div><div><span>Pistas pedidas</span><b>${h}</b></div><div><span>Categoría</span><b>${rank}</b></div>`;
    show('end');
    sfx('win');
  }

  function fmtTime(s) {
    const hh = Math.floor(s / 3600); const mm = Math.floor((s % 3600) / 60); const ss = s % 60;
    return (hh ? hh + ':' : '') + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }

  // ---------------- Menú ----------------
  function renderMenu() {
    const saved = readLS(SAVE_KEY);
    const cont = $('#btnContinue');
    if (saved && saved.level && !saved.finished) {
      cont.hidden = false;
      cont.innerHTML = `▶ Continuar partida <small>Trámite ${saved.level}: ${LEVELS[saved.level - 1].title}</small>`;
    } else cont.hidden = true;

    const grid = $('#levelGrid');
    grid.innerHTML = '';
    LEVELS.forEach((lv, i) => {
      const n = i + 1;
      const open = n <= meta.maxLevel;
      const b = el('button', 'lvl ' + (open ? 'open' : 'locked'), `<span class="lvl-n">${n}</span><span class="lvl-t">${open ? lv.title : '🔒'}</span>`);
      b.disabled = !open;
      b.onclick = () => startFromLevel(n);
      grid.append(b);
    });
  }

  function confirmModal(title, text, yes, onYes) {
    modal({
      title, html: `<p>${text}</p>`,
      buttons: [{ label: 'Cancelar' }, { label: yes, cls: 'primary', onClick() { setTimeout(onYes, 0); return true; } }],
    });
  }

  function newGame() {
    const saved = readLS(SAVE_KEY);
    const go = () => { S = newState(1); setupLevel(1); showIntro(); };
    if (saved && saved.level > 1 && !saved.finished) {
      confirmModal('¿Empezar de cero?', `Tienes una partida guardada en el trámite ${saved.level}. Si empiezas de nuevo se sobrescribirá (los trámites desbloqueados se mantienen en el menú).`, 'Empezar de cero', go);
    } else go();
  }

  function continueGame() {
    const saved = readLS(SAVE_KEY);
    if (!saved) return;
    S = Object.assign(newState(saved.level), saved);
    enterPlay(true);
  }

  function startFromLevel(n) {
    const saved = readLS(SAVE_KEY);
    const go = () => {
      const hints = saved ? saved.totalHints || 0 : 0;
      const el2 = saved ? saved.elapsed || 0 : 0;
      S = newState(n); S.totalHints = hints; S.elapsed = el2;
      setupLevel(n); showIntro();
    };
    if (saved && !saved.finished && saved.level === n) return continueGame();
    if (saved && !saved.finished && saved.level !== n) {
      confirmModal('¿Cambiar de trámite?', `Tu partida guardada está en el trámite ${saved.level}. ¿Quieres empezar el trámite ${n} desde el principio? (Podrás volver a cualquier trámite desbloqueado desde el menú.)`, `Ir al trámite ${n}`, go);
    } else go();
  }

  function loadCodeModal() {
    modal({
      title: '📂 Cargar expediente',
      html: `<p>Introduce tu <b>código de expediente</b> (lo obtienes con el botón 💾 Guardar durante la partida o al completar un trámite).</p>
        <div class="kp-text"><input type="text" id="codeIn" placeholder="EXP-XXXX-X" autocomplete="off" autocapitalize="characters" spellcheck="false"></div>
        <div class="kp-msg" id="codeMsg"></div>`,
      buttons: [{ label: 'Cancelar' }, { label: 'Cargar', cls: 'primary', onClick(close, body) {
        const r = readCode($('#codeIn', body).value);
        if (!r) { sfx('bad'); $('#codeMsg', body).textContent = 'Código no válido. Revíselo y preséntelo de nuevo (por triplicado).'; return false; }
        setTimeout(() => {
          S = newState(r.level); S.totalHints = r.hints;
          setupLevel(r.level);
          showIntro();
        }, 0);
        return true;
      } }],
    });
    const i = $('#codeIn');
    i.onkeydown = (e) => { if (e.key === 'Enter') $('#modal .modal-foot .primary').click(); };
  }

  function saveModal() {
    save();
    const code = makeCode(S.level, S.totalHints);
    modal({
      title: '💾 Partida guardada',
      html: `<p>✔ Tu partida se ha guardado <b>en este navegador</b>. Además se guarda sola con cada acción: puedes cerrar la pestaña cuando quieras y pulsar <b>Continuar</b> al volver.</p>
        <p>Para seguir en <b>otro dispositivo o navegador</b>, apunta tu código de expediente:</p>
        <div class="code-box"><code id="saveCode">${code}</code><button class="btn" id="copyCode">📋 Copiar</button></div>
        <p class="small">El código te lleva al inicio del trámite ${S.level} («${L.title}»).</p>`,
    });
    $('#copyCode').onclick = () => {
      const done = () => { $('#copyCode').textContent = '✔ Copiado'; sfx('ok'); };
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, () => selectCode());
      else selectCode();
    };
    function selectCode() {
      const r = document.createRange(); r.selectNodeContents($('#saveCode'));
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
  }

  function hintModal() {
    const hs = L.hints || [];
    const render = (body) => {
      const shown = hs.slice(0, S.hintIdx);
      body.innerHTML = `<p class="small">Ventanilla de Atención al Ciudadano Atascado. Cada pista queda registrada en su expediente (y cuenta en tu puntuación final).</p>
        ${shown.length ? `<ol class="hint-list">${shown.map((h) => `<li>${h}</li>`).join('')}</ol>` : '<p><i>Aún no has pedido ninguna pista en este trámite.</i></p>'}
        ${S.hintIdx < hs.length ? `<button class="btn primary" id="moreHint">${S.hintIdx === 0 ? 'Pedir una pista' : S.hintIdx === hs.length - 1 ? 'Pedir la solución' : 'Pedir otra pista'}</button>` : '<p class="small">No quedan más pistas. Ya le hemos contado todo, que no es poco.</p>'}`;
      const mh = $('#moreHint', body);
      if (mh) mh.onclick = () => { S.hintIdx++; S.totalHints++; save(); sfx('pick'); render(body); };
    };
    modal({ title: '💡 Pistas', html: '<div id="hintBox"></div>', onMount: (body) => render($('#hintBox', body)) });
  }

  function helpModal() {
    modal({
      title: '📘 Cómo jugar',
      cls: 'doc',
      html: `<div class="doc-body">
        <p><b>Vuelva usted mañana</b> es un <i>room escape</i>: en cada sala tienes que resolver un trámite para poder salir.</p>
        <ul>
          <li>🔍 <b>Haz clic</b> en los objetos y personajes de la sala para examinarlos o hablar con ellos.</li>
          <li>🎒 Lo que recojas aparece en tu <b>inventario</b>. Haz clic en un objeto para seleccionarlo (y leer su descripción).</li>
          <li>🤝 Con un objeto seleccionado, haz clic en algo de la sala para <b>usarlo ahí</b>, o en otro objeto del inventario para <b>combinarlos</b>. Vuelve a pulsarlo para soltarlo.</li>
          <li>💡 Si te atascas, pide una <b>pista</b>. La tercera pista de cada trámite es la solución.</li>
          <li>💾 La partida se <b>guarda sola</b> en este navegador. Con el botón Guardar obtienes un <b>código de expediente</b> para continuar en otro dispositivo.</li>
        </ul>
        <p>Son 10 trámites, cada uno más difícil que el anterior. Buena suerte. La va a necesitar.</p></div>`,
    });
  }

  // ---------------- Arranque ----------------
  function bind() {
    $('#btnNew').onclick = () => { sfx('click'); newGame(); };
    $('#btnContinue').onclick = () => { sfx('click'); continueGame(); };
    $('#btnCode').onclick = () => { sfx('click'); loadCodeModal(); };
    $('#btnHelp').onclick = () => { sfx('click'); helpModal(); };
    $('#btnStart').onclick = () => { sfx('click'); enterPlay(false); };
    $('#btnIntroMenu').onclick = () => { sfx('click'); renderMenu(); show('menu'); };
    $('#btnNext').onclick = () => { sfx('click'); showIntro(); };
    $('#btnWinMenu').onclick = () => { sfx('click'); renderMenu(); show('menu'); };
    $('#btnEndMenu').onclick = () => { renderMenu(); show('menu'); };
    $('#btnEndAgain').onclick = () => { S = newState(1); setupLevel(1); showIntro(); };
    $('#btnHint').onclick = () => { sfx('click'); hintModal(); };
    $('#btnSave').onclick = () => { sfx('click'); saveModal(); };
    $('#btnMenu').onclick = () => { sfx('click'); save(); renderMenu(); show('menu'); };
    $('#btnHelp2').onclick = () => { sfx('click'); helpModal(); };
    $('#btnMute').onclick = () => { meta.muted = !meta.muted; save(); renderTop(); sfx('click'); };
    $('#dialog').onclick = () => { if (queue.length) { sfx('click'); nextMsg(); } };
    $('#winCopy').onclick = () => {
      const c = $('#winCode').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(c).then(() => { $('#winCopy').textContent = '✔ Copiado'; });
    };

    document.addEventListener('keydown', (e) => {
      const m = $('#modal');
      if (!m.hidden) {
        if (e.key === 'Escape') { closeModal(); return; }
        if (modalKey) modalKey(e);
        return;
      }
      if (screen === 'play' && (e.key === 'Enter' || e.key === ' ') && queue.length && document.activeElement === document.body) {
        e.preventDefault(); nextMsg();
      }
    });

    setInterval(() => {
      if (screen === 'play' && S && !document.hidden && !pendingWin) {
        S.elapsed++;
        $('#timer').textContent = fmtTime(S.elapsed);
        if (S.elapsed % 10 === 0) save();
      }
    }, 1000);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  }

  bind();
  renderMenu();
  show('menu');

  // Gancho de depuración / pruebas automáticas
  window.RoomEscape = {
    g, state: () => S, level: () => L, makeCode, readCode,
    click: (id) => { const hs = L.hotspots.find((h) => h.id === id); if (hs) clickHotspot(hs); },
    item: (id) => clickItem(id),
    finish: () => finishLevel(),
    pending: () => pendingWin,
  };
})();
