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
        { transform: `translateY(${sy - dy}px) scale(1.6)` },
        { transform: 'translateY(0) scale(1)' },
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
          return axis === 'x' ? sr.left + sr.width / 2 > ir.right : sr.top + sr.height / 2 > ir.bottom; // la que asoma a medias cuenta si no se ve su mitad
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
  let peekWrap = null;
  function stopPeek() {
    if (!peekOn) return;
    peekOn = false; caf(peekRaf); clearTimeout(peekT);
    if (peekWrap) { peekWrap.style.scrollBehavior = ''; peekWrap.style.scrollSnapType = ''; peekWrap = null; }
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
    // Cada paso fija scrollLeft a mano: sin desplazamiento suave ni imán mientras dura
    peekWrap = wrap; wrap.style.scrollBehavior = 'auto'; wrap.style.scrollSnapType = 'none';
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
  // Anillo efímero alrededor de un rectángulo (destello de inactividad, aviso en 💡). Nunca recibe toques.
  function halo(r, cls, ms) {
    if (!r || RM()) return;
    const h = el('span', 'fx-halo ' + cls); h.setAttribute('aria-hidden', 'true');
    const pad = 6; const w = r.width + pad * 2; const hh = r.height + pad * 2;
    h.style.left = (r.left + r.width / 2) + 'px'; h.style.top = (r.top + r.height / 2) + 'px';
    h.style.width = Math.round(w) + 'px'; h.style.height = Math.round(hh) + 'px';
    D.body.append(h);
    let gone = false;
    const kill = () => { if (!gone) { gone = true; h.remove(); } };
    h.addEventListener('animationend', (e) => { if (e.target === h) kill(); });
    later(kill, ms);
  }
  function glint() {
    if (!quiet()) return;
    const wr = rectOf(D.getElementById('sceneWrap'));
    if (!wr) return;
    const list = $$('#scene .hs.unseen:not([hidden])').filter((h) => {
      const r = rectOf(h); if (!r) return false;
      const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
      return cx > wr.left && cx < wr.right && cy > wr.top && cy < wr.bottom;
    }).slice(0, 8);
    const rm = RM();
    list.forEach((h, i) => later(safe(() => {
      if (!h.isConnected || h.hidden || !quiet()) return;
      restartClass(h, 'glint', rm ? 1500 : 760);
      halo(rectOf(h), 'is-glint', 900);
    }), i * 120));
  }
  function hintNudge() {
    if (!quiet() || nudged.has(levelKey)) return;
    const b = D.getElementById('btnHint');
    const r = rectOf(b);
    if (!r) return;
    const badge = D.getElementById('hintBadge');
    const m = badge && !badge.hidden ? /(\d+)\s*\/\s*(\d+)/.exec(badge.textContent || '') : null;
    if (m && +m[1] >= +m[2]) return; // ya no quedan pistas
    nudged.add(levelKey);
    const rm = RM();
    restartClass(b, 'nudge', rm ? 2400 : 1500);
    if (!rm) { halo(r, 'is-nudge', 1500); }
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
    select: ['Ahora toca a quién o dónde usarlo… o toca otro objeto para combinarlos.', 'Ahora haz clic en la persona o el sitio donde usarlo… o en otro objeto para combinarlos.'],
    queue: ['Toca «Siguiente» para seguir leyendo.', 'Pulsa «Siguiente» (o Intro) para seguir leyendo.'],
  };
  const COACH_MS = 10000;
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
  // Solo los desplazamientos que mueven lo señalado (página, sala, bandeja) retiran el pósit
  function onCoachScroll(e) {
    const t = e && e.target;
    if (!t || t === D || t === D.documentElement || t === D.body || t.id === 'sceneWrap' || t.id === 'inventory') dismissCoach();
  }
  /** Lo señalado ha de verse: su centro dentro de la pantalla y sin nada encima (p. ej. una casilla de la bandeja
      que ha quedado fuera de su recorte, o la bandeja bajo el pliegue en horizontal). */
  function onScreen(target, t) {
    const x = t.left + t.width / 2; const y = t.top + t.height / 2;
    if (x < 0 || y < 0 || x > vw() || y > vh()) return false;
    let hit = null; try { hit = D.elementFromPoint(x, y); } catch (e) { return true; }
    return !!hit && (hit === target || target.contains(hit) || hit.contains(target));
  }
  // El aviso «Añadido a tu bandeja» va en la capa superior (popover): ningún z-index lo supera
  function toastShown() {
    const t = D.getElementById('toast'); if (!t || !rectOf(t)) return false;
    let open = false; try { open = t.matches(':popover-open'); } catch (e) { /* sin popover */ }
    return t.classList.contains('show') || open;
  }
  const overlaps = (a, b, m) => a.left < b.right + m && a.right > b.left - m && a.top < b.bottom + m && a.bottom > b.top - m;
  /** Coloca un pósit junto a target sin taparlo: encima o debajo, donde quepa mejor. Si no cabe sin taparlo, no sale
      (y no cuenta como visto). No recibe toques: cualquier toque lo retira y llega igualmente a lo que haya debajo. */
  function showCoach(key, target, avoid) {
    if (!V() || seen(key) || coach || !quiet()) return false;
    const t = rectOf(target);
    if (!t || !onScreen(target, t)) return false; // no cuenta como visto: saldrá la próxima vez que se vea
    const c = el('div', 'coach');
    c.setAttribute('aria-hidden', 'true'); // se anuncia aparte (VUM.announce), sin duplicar
    c.dataset.k = key;
    const text = COPY[key][fine() && !coarse() ? 1 : 0];
    c.append(el('p', 'coach-t', text));
    c.style.visibility = 'hidden';
    D.body.append(c);
    const cr = rectOf(c);
    if (!cr) { c.remove(); return false; }
    const gap = 14; const m = 8; const W0 = vw(); const H0 = vh();
    // Bajo la barra superior no se ve bien: el borde útil empieza debajo de ella
    const top0 = Math.max(m, ((rectOf(D.getElementById('topbar')) || { bottom: 0 }).bottom || 0) + 4);
    const roomUp = t.top - gap - top0; const roomDown = H0 - m - (t.bottom + gap);
    const fitsUp = roomUp >= cr.height; const fitsDown = roomDown >= cr.height;
    // Sala: preferimos debajo (no tapa la mitad de arriba de la sala); resto: encima (bandeja, ventanilla, chip de uso)
    const pref0 = key === 'room' ? !fitsDown && (fitsUp || roomUp > roomDown) : fitsUp || (!fitsDown && roomUp > roomDown);
    const cx = t.left + t.width / 2;
    const left = clamp(cx - cr.width / 2, m, Math.max(m, W0 - cr.width - m));
    const place = (isUp) => {
      const top = clamp(isUp ? t.top - gap - cr.height : t.bottom + gap, top0, Math.max(top0, H0 - cr.height - m));
      return { up: isUp, left, top, right: left + cr.width, bottom: top + cr.height };
    };
    // Lo que no se debe tapar (el texto que se está leyendo, el aviso de la bandeja): se elige el lado que menos lo pisa
    const nogo = (avoid || []).map(rectOf).concat(toastShown() ? [rectOf(D.getElementById('toast'))] : []).filter(Boolean);
    const area = (b) => nogo.reduce((a, r) => a + Math.max(0, Math.min(b.right, r.right) - Math.max(b.left, r.left)) * Math.max(0, Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top)), 0);
    const opts = [place(pref0), place(!pref0)].filter((b) => !overlaps(b, t, 2));
    if (!opts.length) { c.remove(); return false; }
    const box = opts.reduce((a, b) => (area(b) < area(a) ? b : a));
    const up = box.up; const top = box.top;
    c.style.left = Math.round(left) + 'px';
    c.style.top = Math.round(top) + 'px';
    c.style.setProperty('--ax', Math.round(clamp(cx - left, 18, cr.width - 18)) + 'px');
    c.classList.add(up ? 'is-above' : 'is-below');
    c.style.visibility = '';
    coach = c; coachVW = W0; coachVH = H0;
    markSeen(key);
    announce(text.replace(/^[^\p{L}«]+/u, ''));
    D.addEventListener('scroll', onCoachScroll, { capture: true, passive: true });
    coachT = later(dismissCoach, COACH_MS);
    return true;
  }
  // Cualquier toque o tecla lo cierra (sin tragarse el toque: lo de debajo responde)
  W.addEventListener('pointerdown', () => { if (coach) dismissCoach(); }, { capture: true, passive: true });
  W.addEventListener('keydown', () => { if (coach) dismissCoach(); }, { capture: true });
  // Girar el móvil o cambiar el ancho lo retira; la barra de direcciones que sube y baja (solo el alto, poco) no
  let coachVW = 0; let coachVH = 0;
  W.addEventListener('resize', () => { if (coach && (vw() !== coachVW || Math.abs(vh() - coachVH) > 140)) dismissCoach(); }, { passive: true });

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
  // Espera a que se retire el aviso de la bandeja (1800 ms + 400 por objeto extra): debajo de él no se leería
  function coachGive(ids, tries) {
    if (seen('give') || !ids || !ids.length) return;
    tries = tries || 0;
    const inv = D.getElementById('inventory');
    if (inv && inv.classList.contains('has-sel')) return; // ya ha seleccionado algo: el consejo llega tarde
    if (toastShown() && tries < 30) { later(safe(() => coachGive(ids, tries + 1)), 200); return; }
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
      if (b && !b.closest('[hidden]')) showCoach('queue', b, [D.getElementById('dlgMsg')]);
    }), 80);
  });

  // ==========================================================
  // 7) Final de temporada «EXPEDIENTE CERRADO» (spec §9.6) — ≤ 1600 ms, se salta con un toque
  // ==========================================================
  let fin = null; // { overlay, timers[], impact, rm }
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
  // Las cifras se ponen a cero al empezar el final (no se ven las definitivas a través del velo) y suben al acabar
  let countItems = null;
  const fmtCount = (it, v) => (it.time ? fmtTime(v) : String(Math.round(v)));
  function zeroCounts() {
    const nodes = $$('#screen-end [data-count]');
    if (!nodes.length || RM()) { countItems = null; return; }
    countItems = nodes.map((n) => ({ n, to: +n.dataset.count || 0, time: n.dataset.fmt === 'time', final: n.textContent }));
    countItems.forEach((it) => { it.n.textContent = fmtCount(it, 0); });
  }
  function countUp() {
    if (!countItems) zeroCounts();
    const items = (countItems || []).filter((it) => it.n.isConnected); countItems = null;
    if (!items.length) return;
    const fmt = fmtCount;
    const t0 = now(); const ms = 900;
    const step = () => {
      const t = clamp((now() - t0) / ms, 0, 1); const k = 1 - Math.pow(1 - t, 3);
      items.forEach((it) => { if (it.n.isConnected) it.n.textContent = t >= 1 ? it.final : fmt(it, it.to * k); });
      if (t < 1) raf(step);
    };
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
    else { f.overlay.classList.add('out'); later(() => f.overlay.remove(), 300); }
    if (!f.rm && screen === 'end') countUp();
    else if (countItems) { countItems.forEach((it) => { if (it.n.isConnected) it.n.textContent = it.final; }); countItems = null; }
  }
  // La capa no recibe toques (las sondas y lo de debajo la atraviesan): el toque se recoge aquí, salta el final
  // y el clic que lo sigue no llega a lo que hubiera debajo.
  let swallowT = 0;
  function onFinaleTap() {
    if (!fin) return;
    swallow = true;
    clearTimeout(swallowT); swallowT = later(() => { swallow = false; }, 700);
    endFinale(true);
  }
  let swallow = false;
  W.addEventListener('click', (e) => { if (swallow) { swallow = false; e.preventDefault(); e.stopPropagation(); } }, true);
  function onFinaleKey(e) {
    if (!fin) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') e.preventDefault();
    endFinale(true);
  }
  // Toda temporada terminada se cierra con su sello (spec §9.6). «last» (no hay temporada siguiente: los 50 trámites)
  // solo cambia el membrete de la hoja.
  on('ending', (d) => {
    if (fin) endFinale(false);
    // Reclamar el final de forma SÍNCRONA: el motor deja de sonar su propio sello
    D.body.classList.add('finale-on');
    dismissCoach();
    const rm = RM();
    if (!rm) zeroCounts();
    const ov = el('div', 'finale' + (rm ? ' is-static' : '') + (d.last ? ' is-last' : ''));
    ov.setAttribute('aria-hidden', 'true');
    const sheet = el('div', 'finale-sheet');
    const n = d.season ? `Temporada ${d.season}` : '';
    sheet.append(el('p', 'finale-k', d.last ? 'Ministerio de Asuntos Pendientes · Los 50 trámites' : `Ministerio de Asuntos Pendientes${n ? ' · ' + n : ''}`));
    const st = el('div', 'stamp finale-stamp', d.stampText || 'EXPEDIENTE CERRADO');
    sheet.append(st);
    sheet.append(el('p', 'finale-reg', `Reg. salida nº T${d.season || 0}-FIN/${new Date().getFullYear()} · Archívese`));
    ov.append(sheet);
    D.body.append(ov);
    fin = { overlay: ov, timers: [], impact: false, rm };
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
  // Se copia el estilo calculado de cada nodo: así el fantasma se ve igual fuera del <dialog> (las reglas de ui-modals
  // dependen de #modal) sin conocer esas reglas. Sin animaciones ni transiciones.
  const GHOST_PROPS = ['display', 'position', 'top', 'right', 'bottom', 'left', 'box-sizing', 'width', 'height',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius', 'background-color', 'background-image',
    'background-size', 'background-position', 'background-repeat', 'color', 'font-family', 'font-size', 'font-weight', 'font-style',
    'font-variant-numeric', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line', 'text-overflow',
    'white-space', 'text-shadow', 'box-shadow', 'opacity', 'transform', 'rotate', 'scale', 'translate', 'flex-direction', 'flex-wrap',
    'flex-grow', 'flex-shrink', 'flex-basis', 'align-items', 'align-self', 'justify-content', 'row-gap', 'column-gap',
    'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'order', 'overflow-x', 'overflow-y', 'visibility',
    'vertical-align', 'list-style-type', 'fill', 'stroke', 'mix-blend-mode', 'z-index',
    '-webkit-mask-image', 'mask-image', '-webkit-mask-size', 'mask-size', '-webkit-line-clamp', '-webkit-box-orient'];
  const STRIP = /^(id|for|name|href|role|tabindex|autofocus|title|popover|aria-.+|data-.+|on.+)$/i;
  // Copiar el estilo cuesta ~0,5 ms por nodo en un móvil medio y se paga dentro del toque de cerrar (spec §1.5):
  // por encima de este tope la tarjeta se cierra sin fantasma
  const MAX_GHOST_NODES = 80;
  function copyStyles(src, dst) {
    let cs; try { cs = W.getComputedStyle(src); } catch (e) { return; }
    let txt = '';
    for (let i = 0; i < GHOST_PROPS.length; i++) { const v = cs.getPropertyValue(GHOST_PROPS[i]); if (v) txt += `${GHOST_PROPS[i]}:${v};`; }
    dst.setAttribute('style', txt + 'animation:none;transition:none;pointer-events:none;');
  }
  /** Construye (sin insertarlo) el fantasma de la tarjeta que se cierra. Debe llamarse con la tarjeta aún maquetada. */
  const okBox = (n) => { n.style.borderColor = 'var(--green)'; n.style.backgroundColor = 'var(--green-bg)'; n.style.color = 'var(--green)'; };
  /** Versión ligera (gama baja o movimiento reducido): solo las casillas en verde y el «CONFORME», sin copiar la tarjeta.
      Con movimiento reducido queda quieta 380 ms y se retira sin fundido. */
  function buildConforme(card) {
    const disp = $('.kp-display', card) || $('.kp-text', card);
    const dr = rectOf(disp);
    if (!dr || dr.bottom < 0 || dr.top > vh()) return null;
    const clone = disp.cloneNode(true);
    const src = [disp].concat($$('*', disp)); const dst = [clone].concat($$('*', clone));
    for (let i = 0; i < src.length && i < dst.length; i++) {
      if (!src[i].ownerSVGElement) copyStyles(src[i], dst[i]);
      for (const a of Array.prototype.slice.call(dst[i].attributes)) if (STRIP.test(a.name)) dst[i].removeAttribute(a.name);
      if (dst[i].tagName === 'INPUT') { try { dst[i].value = src[i].value; } catch (e) { /* nada */ } }
    }
    const cs = clone.style; cs.position = 'relative'; cs.inset = 'auto'; cs.margin = '0'; cs.width = '100%'; cs.height = '100%';
    $$('.kp-box', clone).forEach(okBox);
    if (clone.tagName === 'INPUT') okBox(clone);
    $$('input', clone).forEach(okBox);
    const g = el('div', 'modal-ghost is-ok is-lite');
    g.setAttribute('aria-hidden', 'true'); g.setAttribute('inert', '');
    g.style.left = dr.left + 'px'; g.style.top = dr.top + 'px'; g.style.width = dr.width + 'px'; g.style.height = dr.height + 'px';
    // Un papel tenue justo detrás de las casillas (no de toda la franja): así no flotan sueltas sobre la sala
    const boxes = $$('.kp-box', disp).map(rectOf).filter(Boolean);
    const u = boxes.length ? boxes.reduce((a, b) => ({ left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom) }))
      : { left: dr.left, top: dr.top, right: dr.right, bottom: dr.bottom };
    const back = el('div', 'fx-lite-card');
    const pad = 12;
    back.style.left = Math.round(u.left - dr.left - pad) + 'px'; back.style.top = Math.round(u.top - dr.top - pad) + 'px';
    back.style.width = Math.round(u.right - u.left + pad * 2) + 'px'; back.style.height = Math.round(u.bottom - u.top + pad * 2) + 'px';
    g.append(back, clone);
    const st = el('span', 'stamp sm ok fx-conforme', 'CONFORME');
    st.style.setProperty('--cy', Math.round(u.bottom - dr.top + 4) + 'px');
    g.append(st);
    const scrim = el('div', 'modal-ghost-scrim is-ok');
    scrim.setAttribute('aria-hidden', 'true');
    return { g, scrim, scrolls: [], keypadOk: true, rm: RM() };
  }
  function buildGhost(card, keypadOk) {
    if (!card || !card.isConnected) return null;
    // Gama baja o movimiento reducido: sin fantasma de la tarjeta; el teclado, solo su «CONFORME»
    if (RM() || lowEnd()) return keypadOk ? buildConforme(card) : null;
    const r = rectOf(card);
    if (!r || r.bottom < 0 || r.top > vh()) return null;
    const src = [card].concat($$('*', card));
    if (src.length > MAX_GHOST_NODES) return null; // tarjetas enormes: sin fantasma (no se paga el coste al cerrar)
    const clone = card.cloneNode(true);
    const dst = [clone].concat($$('*', clone));
    const scrolls = [];
    for (let i = 0; i < src.length && i < dst.length; i++) {
      const s = src[i]; const c = dst[i];
      if (!s.ownerSVGElement) copyStyles(s, c); // el interior de un <svg> hereda de su <svg>
      if (s === D.activeElement) { c.style.outline = 'none'; c.style.boxShadow = 'none'; } // sin anillo de foco en el fantasma
      for (const a of Array.prototype.slice.call(c.attributes)) if (STRIP.test(a.name) && !(a.name === 'href' && s.ownerSVGElement)) c.removeAttribute(a.name); // <use href> se queda
      if (s.scrollTop || s.scrollLeft) scrolls.push([c, s.scrollTop, s.scrollLeft]);
      if (c.tagName === 'INPUT' || c.tagName === 'TEXTAREA') { try { c.value = s.value; } catch (e) { /* nada */ } }
      if (c.tagName === 'SELECT') { try { c.selectedIndex = s.selectedIndex; } catch (e) { /* nada */ } }
    }
    const g = el('div', 'modal-ghost' + (keypadOk ? ' is-ok' : ''));
    g.setAttribute('aria-hidden', 'true');
    g.setAttribute('inert', '');
    // Si el papel lo pinta el <dialog> (tarjeta transparente dentro de una hoja), el fantasma es la hoja entera
    const dlg = card.parentElement;
    const dr0 = dlg && dlg.id === 'modal' ? rectOf(dlg) : null;
    let dcs = null; try { dcs = dr0 ? W.getComputedStyle(dlg) : null; } catch (e) { dcs = null; }
    let ccs = null; try { ccs = W.getComputedStyle(card); } catch (e) { ccs = null; }
    const clear = (c) => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c);
    const sheet = !!(dcs && ccs && clear(ccs.backgroundColor) && !clear(dcs.backgroundColor));
    const box = sheet ? dr0 : r;
    g.style.left = box.left + 'px'; g.style.top = box.top + 'px';
    g.style.width = box.width + 'px'; g.style.height = box.height + 'px';
    const cs = clone.style;
    if (sheet) {
      ['background-color', 'background-image', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius', 'box-shadow']
        .forEach((p) => { const v = dcs.getPropertyValue(p); if (v) g.style.setProperty(p, v); });
      g.style.boxSizing = 'border-box'; g.style.overflow = 'hidden';
      const bl = parseFloat(dcs.borderLeftWidth) || 0; const bt = parseFloat(dcs.borderTopWidth) || 0;
      cs.position = 'absolute'; cs.inset = 'auto'; cs.margin = '0';
      cs.left = (r.left - box.left - bl) + 'px'; cs.top = (r.top - box.top - bt) + 'px';
      cs.width = r.width + 'px'; cs.height = r.height + 'px';
    } else {
      cs.position = 'relative'; cs.inset = 'auto'; cs.margin = '0'; cs.width = '100%'; cs.height = '100%';
    }
    cs.transform = 'none'; cs.translate = 'none'; cs.scale = 'none'; cs.rotate = 'none'; cs.opacity = '1';
    g.append(clone);
    if (keypadOk) {
      const disp = $('.kp-display', card) || $('.kp-text', card);
      const dr = rectOf(disp);
      // El sello cae sobre el borde inferior de las casillas (o de la casilla de texto), sin tapar las cifras
      const st = el('span', 'stamp sm ok fx-conforme', 'CONFORME');
      st.style.setProperty('--cy', Math.round(dr ? dr.bottom - box.top + 4 : r.top - box.top + r.height / 2) + 'px');
      g.append(st);
      // Las casillas se pintan en verde a mano: el .ok recién puesto puede estar aún en plena transición
      $$('.kp-box', clone).forEach((b, i) => { const s = $$('.kp-box', card)[i]; if (s && s.classList.contains('ok')) okBox(b); });
      $$('.kp-text input', clone).forEach((i) => { okBox(i); i.style.boxShadow = '0 0 0 2px var(--green)'; });
    }
    const scrim = el('div', 'modal-ghost-scrim' + (keypadOk ? ' is-ok' : ''));
    scrim.setAttribute('aria-hidden', 'true');
    // El velo imita el real: el ::backdrop del <dialog>, o el propio <dialog> cuando ocupa toda la pantalla
    // y hace de velo (color y desenfoque de ui-modals). Si no, el de la casa (--scrim).
    try {
      const veil = (st2) => {
        scrim.style.backgroundColor = st2.backgroundColor;
        const bf = st2.getPropertyValue('backdrop-filter') || st2.getPropertyValue('-webkit-backdrop-filter');
        if (bf && bf !== 'none') { scrim.style.setProperty('backdrop-filter', bf); scrim.style.setProperty('-webkit-backdrop-filter', bf); }
      };
      const bd = dlg && dlg.id === 'modal' ? W.getComputedStyle(dlg, '::backdrop') : null;
      if (bd && !clear(bd.backgroundColor)) veil(bd);
      else if (!sheet && dcs && dr0 && !clear(dcs.backgroundColor) && dr0.width >= vw() - 2 && dr0.height >= vh() - 2) veil(dcs);
    } catch (e) { /* sin ::backdrop: el velo de la casa */ }
    return { g, scrim, scrolls, keypadOk, rm: false };
  }
  function showGhost(gh) {
    const { g, scrim, scrolls, keypadOk, rm } = gh;
    D.body.append(scrim, g);
    scrolls.forEach(([c, t, l]) => { c.scrollTop = t; c.scrollLeft = l; });
    let gone = false;
    const kill = () => {
      if (gone) return;
      gone = true; g.remove(); scrim.remove();
      W.removeEventListener('pointerdown', kill, true);
    };
    g.addEventListener('animationend', (e) => { if (e.target === g) kill(); });
    later(kill, rm ? 380 : (keypadOk ? 380 : 0) + 140 + 200);
    // Un toque durante la salida no espera: el fantasma se va
    W.addEventListener('pointerdown', kill, { capture: true, passive: true });
  }
  const screenNow = () => state().screen || screen;
  on('modal', (d) => {
    if (d.phase === 'open') { dismissCoach(); return; }
    if (d.phase !== 'close') return;
    const card = d.card;
    const cardRect = rectOf(card);
    const isKp = !!card && !!card.classList && card.classList.contains('kp-modal');
    const kpOk = d.reason === 'commit' && isKp
      && (!!$('.kp-box.ok', card) || (!$('.kp-display', card) && !!$('.kp-text input', card) && !$('.kp-text input[aria-invalid="true"]', card)));
    // El fantasma se construye ahora (tarjeta aún maquetada) y se inserta cuando closeModal ha terminado, solo si el
    // modal no se ha vuelto a abrir ni ha cambiado la pantalla (sería un fantasma encima de otra cosa).
    const gh = (d.reason && d.reason !== 'commit') || kpOk ? buildGhost(card, kpOk) : null;
    const scr = screenNow();
    if (gh) {
      const go = safe(() => { if (!modalOpen() && screenNow() === scr) showGhost(gh); });
      if (typeof W.queueMicrotask === 'function') W.queueMicrotask(go); else Promise.resolve().then(go);
    }
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
      later(safe(() => { if (inPlay() && !modalOpen()) peek(); }), 350);
      wait = 350 + 450 + 250 + 450 + 150;
    }
    if (!seen('room')) {
      const go = safe(() => { if (peekOn) { D.addEventListener('fx:peek-end', () => later(safe(coachRoom), 120), { once: true }); return; } coachRoom(); });
      later(go, wait);
    }
  });
  on('win', () => { clearIdle(); stopPeek(); dismissCoach(); });
})();
