/* ==========================================================
   VUELVA USTED MAÑANA — Efectos de presentación (paquete P6)
   ----------------------------------------------------------
   Módulo independiente que escucha los eventos vum:* del motor
   (spec §5.4) y añade el movimiento y los avisos de ambiente:
     · «Justificante de entrega»: el objeto vuela a la bandeja (vum:give)
     · respuesta al toque: pulso del objeto + anillo (vum:tap)
     · bandeja desbordada: #tray.ovf-l/.ovf-r y #trayMore «+N ›»
     · vistazo a la sala la primera vez que se puede deslizar (vum:level)
     · inactividad: destello de lo no examinado (45 s) y aviso en 💡 (120 s)
     · pósits de primera vez (VUM.pref('tips'): room, give, select, queue)
     · final de temporada «EXPEDIENTE CERRADO» con recuento (vum:ending)
     · «fantasma» de salida de los modales y «CONFORME» del teclado
   Reglas: se carga ANTES de engine.js y lee window.VUM de forma perezosa.
   Todo se comprueba antes de usarse (animate, matchMedia, rAF, rects…):
   en jsdom (tests/run.js) nada está maquetado y cada efecto se queda en
   nada. Ningún efecto cambia el estado del juego ni retrasa g.win,
   closeModal o give, que siguen siendo síncronos en el motor.
   Por decisión del integrador: sin Wake Lock y sin consejo de instalación.
   ========================================================== */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const W = window; const D = document;
  const $ = (s, r) => (r || D).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || D).querySelectorAll(s));
  const later = (fn, ms) => setTimeout(fn, ms || 0);
  const raf = (fn) => (typeof W.requestAnimationFrame === 'function' ? W.requestAnimationFrame(fn) : setTimeout(() => fn(Date.now()), 16));
  const caf = (id) => { try { if (typeof W.cancelAnimationFrame === 'function') W.cancelAnimationFrame(id); clearTimeout(id); } catch (e) { /* nada */ } };
  const now = () => (W.performance && typeof W.performance.now === 'function' ? W.performance.now() : Date.now());
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const el = (tag, cls, text) => { const e = D.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  // ---------------- Entorno (todo a prueba de jsdom) ----------------
  const mq = (q) => { try { return !!(W.matchMedia && W.matchMedia(q).matches); } catch (e) { return false; } };
  const V = () => W.VUM || null;
  function RM() {
    const v = V();
    try { if (v && typeof v.rm === 'function') return !!v.rm(); } catch (e) { /* nada */ }
    return mq('(prefers-reduced-motion: reduce)');
  }
  const coarse = () => mq('(pointer: coarse)');
  const fine = () => mq('(pointer: fine)');
  const saveData = () => { try { return !!(navigator.connection && navigator.connection.saveData); } catch (e) { return false; } };
  // Gama baja: 4 núcleos o menos, o ahorro de datos → sin vuelos (la bandeja sigue respondiendo con .arrived)
  const lowEnd = () => { const c = navigator.hardwareConcurrency; return (typeof c === 'number' && c > 0 && c <= 4) || saveData(); };
  const canAnimate = (n) => !!n && typeof n.animate === 'function';
  function rectOf(n) {
    if (!n || !n.isConnected || typeof n.getBoundingClientRect !== 'function') return null;
    try { const r = n.getBoundingClientRect(); return r && r.width > 0 && r.height > 0 ? r : null; } catch (e) { return null; }
  }
  const vw = () => W.innerWidth || D.documentElement.clientWidth || 0;
  const vh = () => W.innerHeight || D.documentElement.clientHeight || 0;
  const visible = () => D.visibilityState !== 'hidden';

  // Puente con el motor (siempre opcional)
  function sfx(kind) { const v = V(); try { if (v && typeof v.sfx === 'function') v.sfx(kind); } catch (e) { /* nada */ } }
  function haptic(kind) { const v = V(); try { if (v && typeof v.haptic === 'function') v.haptic(kind); } catch (e) { /* nada */ } }
  function announce(text) { const v = V(); try { if (v && typeof v.announce === 'function') v.announce(text); } catch (e) { /* nada */ } }
  function pref(key, value) {
    const v = V(); if (!v || typeof v.pref !== 'function') return undefined;
    try { return arguments.length > 1 ? v.pref(key, value) : v.pref(key); } catch (e) { return undefined; }
  }
  function state() { const v = V(); try { return v && typeof v.state === 'function' ? (v.state() || {}) : {}; } catch (e) { return {}; } }
  function track(event, props) { try { if (typeof W.Track === 'function') W.Track(event, props); } catch (e) { /* nada */ } }

  const modalOpen = () => { const m = D.getElementById('modal'); return !!m && !m.hidden; };
  let screen = 'menu';
  const inPlay = () => screen === 'play';

  // Un fallo en un efecto nunca debe romper el motor: se relanza fuera del flujo síncrono del evento
  // (así tests/run.js lo ve como error, pero g.win, closeModal o give terminan igual).
  function on(name, fn) {
    D.addEventListener('vum:' + name, (e) => {
      try { fn((e && e.detail) || {}); } catch (err) { later(() => { throw err; }); }
    });
  }
  const safe = (fn) => function () { try { return fn.apply(this, arguments); } catch (err) { later(() => { throw err; }); return undefined; } };

  // Quita una clase y la vuelve a poner para que la animación se repita
  function restartClass(n, cls, ms) {
    if (!n) return;
    n.classList.remove(cls);
    void n.offsetWidth;
    n.classList.add(cls);
    clearTimeout(n['_fx_' + cls]);
    n['_fx_' + cls] = later(() => n.classList.remove(cls), ms);
  }
  function fmtTime(s) {
    s = Math.max(0, Math.round(s));
    const hh = Math.floor(s / 3600); const mm = Math.floor((s % 3600) / 60); const ss = s % 60;
    return (hh ? hh + ':' : '') + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }

  // ==========================================================
  // 1) «Justificante de entrega»: el objeto vuela a la bandeja (spec §9.3)
  // ==========================================================
  const FLY_MS = 420; const STAGGER = 90;
  let pendingGive = null; // objetos recibidos con un modal abierto: vuelan desde la tarjeta al cerrarse

  function slotOf(id) {
    const inv = D.getElementById('inventory'); if (!inv) return null;
    return $$('.slot[data-id]', inv).find((s) => s.dataset.id === id) || null;
  }
  // Lleva la casilla a la vista dentro de la bandeja (sin tocar el scroll de la página)
  function revealSlot(slot) {
    const inv = D.getElementById('inventory');
    const ir = rectOf(inv); const sr = rectOf(slot);
    if (!ir || !sr) return;
    const pad = 8;
    if (inv.scrollWidth > inv.clientWidth + 1) {
      if (sr.right > ir.right - pad) inv.scrollLeft += sr.right - ir.right + pad;
      else if (sr.left < ir.left + pad) inv.scrollLeft -= ir.left + pad - sr.left;
    }
    if (inv.scrollHeight > inv.clientHeight + 1) {
      if (sr.bottom > ir.bottom - pad) inv.scrollTop += sr.bottom - ir.bottom + pad;
      else if (sr.top < ir.top + pad) inv.scrollTop -= ir.top + pad - sr.top;
    }
  }
  function arrived(slot) {
    if (!slot) return;
    slot.classList.remove('fly-dest');
    restartClass(slot, 'arrived', RM() ? 900 : 360);
  }
  function flyOne(id, src) {
    const slot = slotOf(id);
    if (!slot) return;
    revealSlot(slot);
    const dr = rectOf(slot);
    if (!dr || RM() || lowEnd() || !visible()) { arrived(slot); return; }
    const emo = $('.slot-emoji', slot);
    const er = rectOf(emo) || dr;
    const dx = er.left + er.width / 2; const dy = er.top + er.height / 2;
    const s = src || { left: vw() / 2 - 30, top: vh() / 2 - 30, width: 60, height: 60 };
    const sx = s.left + s.width / 2; const sy = s.top + s.height / 2;
    const outer = el('div', 'fly-item'); outer.setAttribute('aria-hidden', 'true');
    const inner = el('span', 'fly-in', (emo && emo.textContent) || '📄');
    outer.append(inner);
    outer.style.left = dx + 'px'; outer.style.top = dy + 'px';
    if (!canAnimate(outer)) { arrived(slot); return; }
    D.body.append(outer);
    slot.classList.add('fly-dest');
    let done = false;
    const finish = () => { if (done) return; done = true; outer.remove(); arrived(slot); };
    try {
      // X con salida suave y Y con entrada-salida: el objeto describe un arco hasta la casilla
      outer.animate([{ transform: `translateX(${sx - dx}px)` }, { transform: 'translateX(0)' }], { duration: FLY_MS, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
      const a = inner.animate([
        { transform: `translateY(${sy - dy}px) scale(1.6)`, opacity: 0.9 },
        { transform: `translateY(${(sy - dy) * 0.35 - 24}px) scale(1.35)`, opacity: 1, offset: 0.45 },
        { transform: 'translateY(0) scale(1)', opacity: 1 },
      ], { duration: FLY_MS, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
      a.onfinish = finish; a.oncancel = finish;
    } catch (e) { finish(); return; }
    later(finish, FLY_MS + 160); // por si el navegador no avisa del final
  }
  function flyAll(ids, src) {
    ids.forEach((id, i) => { if (i === 0) flyOne(id, src); else later(safe(() => flyOne(id, src)), i * STAGGER); });
    const settle = (ids.length - 1) * STAGGER + (RM() || lowEnd() ? 120 : FLY_MS + 120);
    later(safe(() => coachGive(ids)), settle);
  }
  on('give', (d) => {
    const ids = Array.isArray(d.ids) ? d.ids.filter(Boolean) : [];
    if (!ids.length || !inPlay()) return;
    if (modalOpen()) { // vuela desde la tarjeta cuando el modal se cierre
      pendingGive = { ids: (pendingGive ? pendingGive.ids : []).concat(ids.filter((id) => !(pendingGive && pendingGive.ids.includes(id)))) };
      return;
    }
    flyAll(ids, d.srcRect || null);
  });

  // ==========================================================
  // 2) Respuesta al toque: pulso del objeto + anillo (spec §1.5)
  // ==========================================================
  function ring(x, y) {
    if (!isFinite(x) || !isFinite(y)) return;
    const r = el('span', 'tap-ring'); r.setAttribute('aria-hidden', 'true');
    r.style.left = x + 'px'; r.style.top = y + 'px';
    D.body.append(r);
    let gone = false;
    const kill = () => { if (!gone) { gone = true; r.remove(); } };
    r.addEventListener('animationend', kill);
    later(kill, RM() ? 260 : 460);
  }
  on('tap', (d) => {
    const hs = $$('#scene .hs[data-id]').find((h) => h.dataset.id === d.id);
    const r = rectOf(hs);
    if (!r) return;
    restartClass(hs, 'hs-tapped', 300);
    const assisted = !!d.assisted || !isFinite(d.x) || !isFinite(d.y);
    ring(assisted ? r.left + r.width / 2 : d.x, assisted ? r.top + r.height / 2 : d.y);
    if (coarse()) restartClass(hs, 'show-label', 1200);
  });

  // ==========================================================
  // 3) Bandeja desbordada: sombras laterales y «+N ›» (spec §7.6)
  // ==========================================================
  let ovfRaf = 0;
  function trayOverflow() {
    ovfRaf = 0;
    const tray = D.getElementById('tray'); const inv = D.getElementById('inventory'); const more = D.getElementById('trayMore');
    if (!tray || !inv) return;
    const ir = inPlay() ? rectOf(inv) : null;
    let l = false; let r = false; let n = 0; let axis = 'x';
    if (ir) {
      const maxX = inv.scrollWidth - inv.clientWidth; const maxY = inv.scrollHeight - inv.clientHeight;
      axis = maxX > 2 || maxY <= 2 ? 'x' : 'y';
      if (axis === 'x') { l = inv.scrollLeft > 2; r = inv.scrollLeft < maxX - 2; } else { l = inv.scrollTop > 2; r = inv.scrollTop < maxY - 2; }
      if (r) {
        n = $$('.slot[data-id]', inv).filter((s) => {
          const sr = rectOf(s); if (!sr) return false;
          return axis === 'x' ? sr.right > ir.right + 2 : sr.bottom > ir.bottom + 2;
        }).length;
      }
    }
    tray.classList.toggle('ovf-l', l);
    tray.classList.toggle('ovf-r', r);
    if (!more) return;
    if (n > 0) {
      const txt = `+${n} ${axis === 'x' ? '›' : '▾'}`;
      if (more.dataset.n !== String(n) || more.textContent !== txt) {
        more.dataset.n = String(n);
        more.dataset.axis = axis;
        more.textContent = txt;
        more.setAttribute('aria-label', `Ver ${n} ${n === 1 ? 'objeto más' : 'objetos más'}`);
      }
      more.hidden = false;
    } else {
      if (!more.hidden) more.hidden = true;
      delete more.dataset.n;
    }
  }
  function queueOverflow() { if (!ovfRaf) ovfRaf = raf(safe(trayOverflow)); }
  function bindTray() {
    const inv = D.getElementById('inventory'); const more = D.getElementById('trayMore');
    if (inv && !inv._fxTray) {
      inv._fxTray = true;
      inv.addEventListener('scroll', queueOverflow, { passive: true });
      if (typeof W.ResizeObserver === 'function') { try { new W.ResizeObserver(queueOverflow).observe(inv); } catch (e) { /* nada */ } }
    }
    if (more && !more._fxTray) {
      more._fxTray = true;
      more.addEventListener('click', safe(() => {
        const i = D.getElementById('inventory'); if (!i) return;
        const behavior = RM() ? 'auto' : 'smooth';
        const y = more.dataset.axis === 'y';
        const by = Math.round((y ? i.clientHeight : i.clientWidth) * 0.8);
        if (typeof i.scrollBy === 'function') { try { i.scrollBy(y ? { top: by, behavior } : { left: by, behavior }); } catch (e) { if (y) i.scrollTop += by; else i.scrollLeft += by; } } else if (y) i.scrollTop += by; else i.scrollLeft += by;
        sfx('click');
      }));
    }
  }
  W.addEventListener('resize', queueOverflow, { passive: true });
  on('render', () => { bindTray(); queueOverflow(); });

  // ==========================================================
  // 4) Vistazo a la sala: la primera vez se desliza un poco y vuelve
  // ==========================================================
  const PEEK_KEY = 'roomescapespain.peek';
  let peeked = false; let peekRaf = 0; let peekT = 0; let peekOn = false;
  function peekedThisSession() {
    if (peeked) return true;
    try { return W.sessionStorage.getItem(PEEK_KEY) === '1'; } catch (e) { return false; }
  }
  function stopPeek() {
    if (!peekOn) return;
    peekOn = false; caf(peekRaf); clearTimeout(peekT);
    D.dispatchEvent(new CustomEvent('fx:peek-end'));
  }
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function tween(wrap, from, to, ms, done) {
    const t0 = now();
    const step = () => {
      if (!peekOn) return;
      const t = clamp((now() - t0) / ms, 0, 1);
      wrap.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) peekRaf = raf(step); else done();
    };
    peekRaf = raf(step);
  }
  function peek() {
    const wrap = D.getElementById('sceneWrap');
    if (!wrap || !rectOf(wrap)) return false;
    const max = wrap.scrollWidth - wrap.clientWidth;
    if (max <= 4) return false;
    peeked = true;
    try { W.sessionStorage.setItem(PEEK_KEY, '1'); } catch (e) { /* nada */ }
    const s0 = wrap.scrollLeft;
    const dist = max * 0.18;
    const to = s0 + dist <= max ? s0 + dist : s0 - dist; // si ya está a la derecha, se asoma a la izquierda
    peekOn = true;
    tween(wrap, s0, to, 450, () => {
      peekT = later(() => { if (peekOn) tween(wrap, wrap.scrollLeft, s0, 450, () => stopPeek()); }, 250);
    });
    return true;
  }
  ['touchstart', 'pointerdown', 'wheel'].forEach((t) => W.addEventListener(t, stopPeek, { capture: true, passive: true }));

  // ==========================================================
  // 5) Inactividad: destello a los 45 s y aviso en 💡 a los 120 s
  // ==========================================================
  let idleT45 = 0; let idleT120 = 0; let levelKey = '';
  const nudged = new Set();
  function clearIdle() { clearTimeout(idleT45); clearTimeout(idleT120); idleT45 = idleT120 = 0; }
  function resetIdle() {
    clearIdle();
    if (!inPlay()) return;
    idleT45 = later(safe(glint), 45000);
    idleT120 = later(safe(hintNudge), 120000);
  }
  function quiet() { const st = state(); return inPlay() && !modalOpen() && visible() && !st.pendingWin && !D.body.classList.contains('finale-on'); }
  function glint() {
    if (!quiet()) return;
    const wr = rectOf(D.getElementById('sceneWrap'));
    if (!wr) return;
    const list = $$('#scene .hs.unseen:not([hidden])').filter((h) => {
      const r = rectOf(h); if (!r) return false;
      const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
      return cx > wr.left && cx < wr.right && cy > wr.top && cy < wr.bottom;
    }).slice(0, 8);
    list.forEach((h, i) => later(() => { if (h.isConnected && !h.hidden) restartClass(h, 'glint', RM() ? 1500 : 1000); }, i * 120));
  }
  function hintNudge() {
    if (!quiet() || nudged.has(levelKey)) return;
    const b = D.getElementById('btnHint');
    if (!rectOf(b)) return;
    const badge = D.getElementById('hintBadge');
    const m = badge && !badge.hidden ? /(\d+)\s*\/\s*(\d+)/.exec(badge.textContent || '') : null;
    if (m && +m[1] >= +m[2]) return; // ya no quedan pistas
    nudged.add(levelKey);
    restartClass(b, 'nudge', RM() ? 2400 : 1500);
    const st = state();
    track('hint_nudge', { season: st.season, level: st.level, level_id: st.season ? `T${st.season}-N${st.level}` : undefined });
  }
  on('progress', resetIdle);
  W.addEventListener('pointerdown', () => { if (inPlay()) resetIdle(); }, { capture: true, passive: true });
  W.addEventListener('keydown', () => { if (inPlay()) resetIdle(); }, { capture: true });
  D.addEventListener('visibilitychange', () => { if (visible()) resetIdle(); else clearIdle(); });

  // ==========================================================
  // 6) Pósits de primera vez (coachmarks)
  // ==========================================================
  const COPY = {
    room: ['👆 Toca lo que te llame la atención: carteles, personas, aparatos…', '👆 Haz clic en lo que te llame la atención: carteles, personas, aparatos…'],
    give: ['🎒 Lo que recoges va aquí. Tócalo para seleccionarlo.', '🎒 Lo que recoges va aquí. Haz clic en él para seleccionarlo.'],
    select: ['Ahora toca a quién o dónde usarlo… o toca otro objeto para combinarlos.', 'Ahora haz clic en a quién o dónde usarlo… o en otro objeto para combinarlos.'],
    queue: ['Toca «Siguiente» para seguir leyendo.', 'Pulsa «Siguiente» (o Intro) para seguir leyendo.'],
  };
  let coach = null; let coachT = 0;
  function tips() { const t = pref('tips'); return t && typeof t === 'object' ? t : {}; }
  const seen = (k) => !!tips()[k];
  function markSeen(k) { const t = Object.assign({}, tips()); t[k] = true; pref('tips', t); }
  function dismissCoach() {
    if (!coach) return;
    const c = coach; coach = null; clearTimeout(coachT);
    D.removeEventListener('scroll', onCoachScroll, true);
    if (RM() || !canAnimate(c)) { c.remove(); return; }
    c.classList.add('out');
    later(() => c.remove(), 180);
  }
  function onCoachScroll() { dismissCoach(); }
  /** Coloca un pósit junto a target sin taparlo (encima si cabe; si no, debajo). */
  function showCoach(key, target) {
    if (!V() || seen(key) || coach || !quiet()) return false;
    const t = rectOf(target);
    if (!t) return false;
    const c = el('div', 'coach');
    c.setAttribute('role', 'note');
    c.dataset.k = key;
    const text = COPY[key][fine() && !coarse() ? 1 : 0];
    c.append(el('p', 'coach-t', text));
    c.style.visibility = 'hidden';
    D.body.append(c);
    const cr = rectOf(c);
    if (!cr) { c.remove(); return false; }
    const gap = 14; const m = 8; const W0 = vw(); const H0 = vh();
    const top0 = (rectOf(D.getElementById('topbar')) || { bottom: 0 }).bottom;
    const above = t.top - gap - cr.height >= Math.max(m, key === 'room' ? 0 : top0);
    const below = t.bottom + gap + cr.height <= H0 - m;
    const up = above && (!below || key !== 'room' || t.top - cr.height > H0 - t.bottom - cr.height);
    let top = up ? t.top - gap - cr.height : t.bottom + gap;
    top = clamp(top, m, Math.max(m, H0 - cr.height - m));
    const cx = t.left + t.width / 2;
    const left = clamp(cx - cr.width / 2, m, Math.max(m, W0 - cr.width - m));
    c.style.left = Math.round(left) + 'px';
    c.style.top = Math.round(top) + 'px';
    c.style.setProperty('--ax', Math.round(clamp(cx - left, 18, cr.width - 18)) + 'px');
    c.classList.add(up ? 'is-above' : 'is-below');
    c.style.visibility = '';
    coach = c;
    markSeen(key);
    announce(text.replace(/^[^\p{L}«]+/u, ''));
    D.addEventListener('scroll', onCoachScroll, { capture: true, passive: true });
    coachT = later(dismissCoach, 9000);
    return true;
  }
  // Cualquier toque o tecla lo cierra (sin tragarse el toque: lo de debajo responde)
  W.addEventListener('pointerdown', () => { if (coach) later(dismissCoach, 0); }, { capture: true, passive: true });
  W.addEventListener('keydown', () => { if (coach) dismissCoach(); }, { capture: true });
  W.addEventListener('resize', () => { if (coach) dismissCoach(); }, { passive: true });

  function coachRoom() {
    if (seen('room') || !quiet()) return;
    const wr = rectOf(D.getElementById('sceneWrap')); if (!wr) return;
    const cx = vw() / 2; const cy = (wr.top + wr.bottom) / 2;
    let best = null; let bd = Infinity;
    $$('#scene .hs[data-id]:not([hidden])').forEach((h) => {
      const r = rectOf(h); if (!r) return;
      const x = r.left + r.width / 2; const y = r.top + r.height / 2;
      if (x < wr.left + 8 || x > wr.right - 8 || y < wr.top + 4 || y > wr.bottom - 4) return;
      const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (d < bd) { bd = d; best = h; }
    });
    if (best) showCoach('room', best);
  }
  function coachGive(ids) {
    if (seen('give') || !ids || !ids.length) return;
    const slot = slotOf(ids[ids.length - 1]);
    if (slot) showCoach('give', slot);
  }
  on('select', (d) => {
    if (!d.id || seen('select')) return;
    later(safe(() => {
      const chip = D.getElementById('useChip');
      const target = chip && !chip.hidden && rectOf(chip) ? chip : slotOf(d.id);
      if (coach && coach.dataset.k === 'give') dismissCoach();
      showCoach('select', target);
    }), 80);
  });
  on('say', (d) => {
    if (!d.queued || seen('queue')) return;
    later(safe(() => {
      const b = D.getElementById('btnNextMsg');
      if (b && !b.closest('[hidden]')) showCoach('queue', b);
    }), 80);
  });

  // ==========================================================
  // 7) Final de temporada «EXPEDIENTE CERRADO» (spec §9.6) — ≤ 1600 ms, se salta con un toque
  // ==========================================================
  let fin = null; // { overlay, confetti, timers[], impact, rm, skipClick }
  const BITS = ['📄', '🧾', '📎', '✉️', '🖇️'];
  function confetti(n) {
    const box = el('div', 'fx-confetti'); box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) {
      const b = el('i', null, BITS[i % BITS.length]);
      const x = (i + 0.5) / n * 100 + (Math.random() * 6 - 3);
      b.style.setProperty('--x', clamp(x, 2, 98).toFixed(1) + '%');
      b.style.setProperty('--dx', Math.round(Math.random() * 120 - 60) + 'px');
      b.style.setProperty('--r0', Math.round(Math.random() * 90 - 45) + 'deg');
      b.style.setProperty('--r1', Math.round(Math.random() * 540 - 270) + 'deg');
      b.style.setProperty('--s', Math.round(20 + Math.random() * 12) + 'px');
      b.style.setProperty('--d', Math.round(1400 + Math.random() * 800) + 'ms');
      b.style.setProperty('--dl', Math.round(Math.random() * 350) + 'ms');
      box.append(b);
    }
    D.body.append(box);
    later(() => box.remove(), 2600);
    return box;
  }
  function countUp() {
    const nodes = $$('#screen-end [data-count]');
    if (!nodes.length || RM()) return;
    const items = nodes.map((n) => ({ n, to: +n.dataset.count || 0, time: n.dataset.fmt === 'time', final: n.textContent }));
    const fmt = (it, v) => (it.time ? fmtTime(v) : String(Math.round(v)));
    const t0 = now(); const ms = 900;
    const step = () => {
      const t = clamp((now() - t0) / ms, 0, 1); const k = 1 - Math.pow(1 - t, 3);
      items.forEach((it) => { if (it.n.isConnected) it.n.textContent = t >= 1 ? it.final : fmt(it, it.to * k); });
      if (t < 1) raf(step);
    };
    items.forEach((it) => { it.n.textContent = fmt(it, 0); });
    raf(step);
  }
  function endFinale(skipped) {
    if (!fin) return;
    const f = fin; fin = null;
    f.timers.forEach(clearTimeout);
    W.removeEventListener('pointerdown', onFinaleTap, true);
    W.removeEventListener('keydown', onFinaleKey, true);
    D.body.classList.remove('finale-on'); // los cafés de Ko-fi vuelven en el acto
    if (skipped) {
      // El sello de la esquina aterriza ya (y suena aquí si el del final no llegó a sonar)
      const st = D.getElementById('endStamp');
      if (st && st.classList.contains('go')) { st.style.setProperty('--stamp-delay', '0ms'); st.classList.remove('go'); void st.offsetWidth; st.classList.add('go'); }
      if (!f.impact) { later(() => { sfx('stamp'); haptic('season'); }, f.rm ? 0 : 231); later(() => sfx('season'), f.rm ? 150 : 381); }
      f.overlay.remove();
    } else if (f.rm || !canAnimate(f.overlay)) f.overlay.remove();
    else { f.overlay.classList.add('out'); later(() => f.overlay.remove(), 320); }
    if (!f.rm && screen === 'end') countUp();
  }
  function onFinaleTap() {
    if (!fin) return;
    // El toque solo salta el final: el clic que lo sigue no llega a lo que haya debajo
    fin.skipClick = true;
    later(() => { swallow = false; }, 700);
    swallow = true;
    endFinale(true);
  }
  let swallow = false;
  W.addEventListener('click', (e) => { if (swallow) { swallow = false; e.preventDefault(); e.stopPropagation(); } }, true);
  function onFinaleKey(e) {
    if (!fin) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') e.preventDefault();
    endFinale(true);
  }
  on('ending', (d) => {
    if (fin) endFinale(false);
    // Reclamar el final de forma SÍNCRONA: el motor deja de sonar su propio sello
    D.body.classList.add('finale-on');
    const rm = RM();
    const ov = el('div', 'finale'); ov.setAttribute('aria-hidden', 'true');
    const sheet = el('div', 'finale-sheet');
    sheet.append(el('p', 'finale-k', `Ministerio de Asuntos Pendientes · Temporada ${d.season || ''}`.trim()));
    const st = el('div', 'stamp finale-stamp', d.stampText || 'EXPEDIENTE CERRADO');
    sheet.append(st);
    sheet.append(el('p', 'finale-reg', `Reg. salida nº T${d.season || 0}-FIN/2026`));
    ov.append(sheet);
    D.body.append(ov);
    fin = { overlay: ov, timers: [], impact: false, rm, skipClick: false };
    const T = (fn, ms) => fin.timers.push(later(safe(fn), ms));
    const STAMP_DELAY = 200; // la hoja entra; el sello impacta al 55 % de 420 ms
    const impact = rm ? 0 : STAMP_DELAY + 231;
    if (!rm) { st.style.setProperty('--stamp-delay', STAMP_DELAY + 'ms'); st.classList.add('go'); }
    T(() => {
      if (!fin) return;
      fin.impact = true;
      sfx('stamp'); haptic('season');
      if (!rm) confetti(lowEnd() ? 10 : 18);
    }, impact);
    T(() => sfx('season'), impact + 150);
    T(() => endFinale(false), rm ? 900 : 1300); // + 300 ms de fundido = 1600 ms en total
    W.addEventListener('pointerdown', onFinaleTap, true);
    W.addEventListener('keydown', onFinaleKey, true);
  });

  // ==========================================================
  // 8) Salida de los modales: «fantasma» que se desvanece (y «CONFORME» del teclado)
  // ==========================================================
  const GHOST_PROPS = ['display', 'position', 'top', 'right', 'bottom', 'left', 'box-sizing', 'width', 'height', 'min-height',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius', 'background-color', 'background-image',
    'background-size', 'background-position', 'background-repeat', 'color', 'font-family', 'font-size', 'font-weight', 'font-style',
    'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line', 'text-overflow', 'white-space',
    'box-shadow', 'opacity', 'transform', 'rotate', 'scale', 'translate', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
    'flex-basis', 'align-items', 'align-self', 'justify-content', 'gap', 'grid-template-columns', 'grid-template-rows', 'grid-column',
    'grid-row', 'order', 'overflow-x', 'overflow-y', 'visibility', 'vertical-align', 'list-style-type', 'object-fit', 'fill', 'stroke',
    'stroke-width', 'mix-blend-mode', 'z-index', '-webkit-mask-image', 'mask-image', '-webkit-mask-size', 'mask-size', 'outline'];
  const STRIP = /^(id|for|name|href|role|tabindex|autofocus|title|aria-.+|data-.+|on.+)$/i;
  function copyStyles(src, dst) {
    let cs; try { cs = W.getComputedStyle(src); } catch (e) { return; }
    let txt = '';
    for (const p of GHOST_PROPS) { const v = cs.getPropertyValue(p); if (v) txt += `${p}:${v};`; }
    dst.setAttribute('style', txt + 'animation:none;transition:none;pointer-events:none;');
  }
  function ghost(card, keypadOk) {
    if (RM() || !card || !card.isConnected) return;
    const r = rectOf(card);
    if (!r || r.bottom < 0 || r.top > vh()) return;
    const src = [card].concat($$('*', card));
    if (src.length > 500) return; // tarjetas enormes: sin fantasma
    const clone = card.cloneNode(true);
    const dst = [clone].concat($$('*', clone));
    for (let i = 0; i < src.length && i < dst.length; i++) {
      const s = src[i]; const c = dst[i];
      if (!(s instanceof W.Element)) continue;
      const svgInner = s.ownerSVGElement && s.ownerSVGElement !== null;
      if (!svgInner) copyStyles(s, c);
      for (const a of Array.prototype.slice.call(c.attributes)) if (STRIP.test(a.name)) c.removeAttribute(a.name);
      if (s.scrollTop || s.scrollLeft) { c._st = s.scrollTop; c._sl = s.scrollLeft; }
    }
    const g = el('div', 'modal-ghost' + (keypadOk ? ' is-ok' : ''));
    g.setAttribute('aria-hidden', 'true');
    g.setAttribute('inert', '');
    g.style.left = r.left + 'px'; g.style.top = r.top + 'px';
    g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    clone.style.position = 'relative'; clone.style.inset = 'auto'; clone.style.margin = '0';
    clone.style.width = '100%'; clone.style.height = '100%'; clone.style.transform = 'none';
    clone.style.translate = 'none'; clone.style.scale = 'none'; clone.style.rotate = 'none'; clone.style.opacity = '1';
    g.append(clone);
    if (keypadOk) {
      const disp = $('.kp-display', card) || $('.kp-text', card);
      const dr = rectOf(disp);
      const st = el('span', 'stamp sm ok fx-conforme', 'CONFORME');
      st.style.setProperty('--cy', (dr ? dr.top + dr.height / 2 - r.top : r.height / 2) + 'px');
      g.append(st);
      g.style.setProperty('--ghost-delay', '380ms');
    }
    D.body.append(g);
    dst.forEach((c) => { if (c._st) c.scrollTop = c._st; if (c._sl) c.scrollLeft = c._sl; });
    let gone = false;
    const kill = () => { if (!gone) { gone = true; g.remove(); } };
    g.addEventListener('animationend', (e) => { if (e.target === g) kill(); });
    later(kill, (keypadOk ? 380 : 0) + 140 + 200);
  }
  on('modal', (d) => {
    if (d.phase === 'open') { dismissCoach(); return; }
    if (d.phase !== 'close') return;
    const card = d.card;
    const cardRect = rectOf(card);
    const kpOk = d.reason === 'commit' && !!card && card.classList && card.classList.contains('kp-modal')
      && (!!$('.kp-box.ok', card) || (!!$('.kp-text input', card) && !$('.kp-text input[aria-invalid="true"]', card)));
    if (d.reason !== 'commit' || kpOk) ghost(card, kpOk);
    // Lo recibido mientras el modal estaba abierto vuela ahora desde la tarjeta
    if (pendingGive && d.reason) {
      const ids = pendingGive.ids; pendingGive = null;
      const src = cardRect ? { left: cardRect.left, top: cardRect.top, width: cardRect.width, height: cardRect.height } : null;
      later(safe(() => {
        if (modalOpen()) { pendingGive = { ids }; return; } // se ha abierto otro modal: esperar
        if (inPlay()) flyAll(ids, src);
      }), 0);
    }
  });

  // ==========================================================
  // Pantallas y niveles
  // ==========================================================
  on('screen', (d) => {
    const prev = screen;
    screen = d.name || screen;
    if (screen !== 'play') { clearIdle(); stopPeek(); dismissCoach(); pendingGive = null; }
    if (prev === 'end' && screen !== 'end' && fin) endFinale(false);
    if (screen === 'play') { bindTray(); queueOverflow(); resetIdle(); }
  });
  on('level', (d) => {
    levelKey = `${d.season}-${d.level}`;
    resetIdle();
    bindTray(); queueOverflow();
    let wait = 700;
    if (d.overflow && !pref('panned') && !peekedThisSession() && !RM()) {
      // Tras el centrado y el destello del objetivo, la sala se asoma a un lado y vuelve
      later(safe(() => { if (inPlay() && !modalOpen() && peek()) { /* el pósit espera al final */ } }), 350);
      wait = 350 + 450 + 250 + 450 + 150;
    }
    if (!seen('room')) {
      const go = safe(() => { if (peekOn) { D.addEventListener('fx:peek-end', () => later(safe(coachRoom), 120), { once: true }); return; } coachRoom(); });
      later(go, wait);
    }
  });
  on('win', () => { clearIdle(); stopPeek(); dismissCoach(); });
})();
