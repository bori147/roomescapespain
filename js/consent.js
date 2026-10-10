/* ==========================================================
   VUELVA USTED MAÑANA — Consentimiento de cookies (RGPD / LSSI)
   - El almacenamiento técnico (partida guardada, esta preferencia) no
     necesita consentimiento.
   - La analítica solo se activa si el usuario la acepta expresamente.
   - Rechazar es tan fácil como aceptar (tres botones del mismo peso).
     La elección caduca a los 12 meses.
   - Cerrar el panel (Esc, ✕, fondo) NO escribe ninguna elección.
   API: Consent.get(), .analytics(), .onChange(fn), .open(opener), .close(), .isOpen()
   ========================================================== */
(function () {
  'use strict';

  const KEY = 'roomescapespain.consent.v1';
  const VERSION = 1;
  const MAX_AGE_MS = 365 * 24 * 3600 * 1000;
  const cfg = (window.GAME_CONFIG || {}).analytics || {};
  const analyticsAvailable = !!cfg.key;
  const inLegal = /\/legal\//.test(location.pathname);
  const cookiesUrl = (inLegal ? '' : 'legal/') + 'cookies.html';
  const listeners = [];

  function read() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY));
      if (!c || c.v !== VERSION || Date.now() - c.date > MAX_AGE_MS) return null;
      return c;
    } catch (e) { return null; }
  }
  function write(analytics) {
    const c = { v: VERSION, analytics: !!analytics, date: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* sin almacenamiento */ }
    listeners.forEach((fn) => { try { fn(c); } catch (e) { /* nada */ } });
    return c;
  }

  const root = document.documentElement;
  const ICON_X = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* ---------------- Aviso (primera capa) ---------------- */
  let banner = null;
  let ro = null;

  function measure() {
    if (!banner) return;
    // Alto ocupado abajo = alto del aviso + su separación del borde.
    // offsetHeight no cambia con la animación de entrada (transform).
    let h = 0;
    try {
      const oh = banner.offsetHeight;
      if (oh > 0) h = Math.ceil(oh + (parseFloat(getComputedStyle(banner).bottom) || 0));
    } catch (e) { h = 0; }
    root.style.setProperty('--cc-h', h + 'px');
  }

  function hideBanner() {
    if (!banner) return;
    if (ro) { try { ro.disconnect(); } catch (e) { /* nada */ } ro = null; }
    window.removeEventListener('resize', measure);
    banner.remove();
    banner = null;
    root.style.removeProperty('--cc-h');
    document.body.classList.remove('cc-open');
  }

  function showBanner() {
    if (banner || !analyticsAvailable) return;
    banner = document.createElement('div');
    banner.className = 'cc-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'ccTitle');
    banner.innerHTML = `
      <div class="cc-text">
        <h2 class="cc-title" id="ccTitle"><span aria-hidden="true">🍪</span> ¿Nos dejas medir el juego?</h2>
        <p>Solo si aceptas, contaremos —con un identificador aleatorio, nunca tu nombre— hasta dónde llega la gente y qué trámites atascan más. Tu partida se guarda igual. <a href="${cookiesUrl}">Más info</a></p>
      </div>
      <div class="cc-actions">
        <button type="button" class="cc-btn" data-cc="reject">Rechazar</button>
        <button type="button" class="cc-btn" data-cc="config">Configurar</button>
        <button type="button" class="cc-btn" data-cc="accept">Aceptar</button>
      </div>`;
    banner.querySelector('[data-cc="reject"]').addEventListener('click', () => { write(false); hideBanner(); });
    banner.querySelector('[data-cc="accept"]').addEventListener('click', () => { write(true); hideBanner(); });
    banner.querySelector('[data-cc="config"]').addEventListener('click', (e) => openPrefs(e.currentTarget));
    // Primer hijo del <body>: lo primero que encuentra un lector de pantalla
    document.body.prepend(banner);
    document.body.classList.add('cc-open');
    measure();
    if (typeof window.ResizeObserver === 'function') {
      try { ro = new ResizeObserver(measure); ro.observe(banner); } catch (e) { ro = null; }
    }
    window.addEventListener('resize', measure);
  }

  /* ---------------- Panel de configuración (segunda capa) ---------------- */
  let dlg = null;
  let opener = null;
  let inerted = [];
  let usedFallback = false;

  function onFallbackKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closePrefs(); }
  }

  function setInert(on) {
    if (on) {
      inerted = [];
      [...document.body.children].forEach((n) => {
        if (n === dlg || n.inert || n.tagName === 'SCRIPT') return;
        n.inert = true;
        if (!('inert' in n)) n.setAttribute('inert', '');
        inerted.push(n);
      });
    } else {
      inerted.forEach((n) => { n.inert = false; n.removeAttribute('inert'); });
      inerted = [];
    }
  }

  function isVisible(n) {
    return !!(n && n.isConnected && !n.closest('[hidden],[inert]') && n.getClientRects().length);
  }

  function restoreFocus() {
    let target = isVisible(opener) ? opener : null;
    if (!target) {
      // El que abrió ya no existe (p. ej. el aviso): al encabezado de la pantalla visible
      target = [...document.querySelectorAll('main h1, main h2, #main h1, #main h2')].find(isVisible) || null;
      if (target && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    }
    opener = null;
    if (target) { try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); } }
  }

  function closePrefs() {
    if (!dlg) return;
    const d = dlg;
    dlg = null;
    document.removeEventListener('keydown', onFallbackKey, true);
    if (usedFallback) setInert(false);
    try { if (d.open && typeof d.close === 'function') d.close(); } catch (e) { /* nada */ }
    d.removeAttribute('open');
    d.remove();
    root.classList.remove('cc-prefs-open');
    restoreFocus();
  }

  function choose(analytics) {
    write(analytics);
    hideBanner();
    closePrefs();
  }

  function openPrefs(from) {
    if (dlg) return;
    opener = from && from.nodeType === 1 ? from : (document.activeElement !== document.body ? document.activeElement : null);
    const cur = read();
    const anaOn = !!(cur && cur.analytics && analyticsAvailable);
    dlg = document.createElement('dialog');
    dlg.className = 'cc-dialog';
    dlg.setAttribute('aria-labelledby', 'ccPrefsTitle');
    dlg.innerHTML = `
      <div class="cc-panel">
        <div class="cc-grab" aria-hidden="true"></div>
        <div class="cc-head">
          <h2 id="ccPrefsTitle" tabindex="-1">Configurar cookies</h2>
          <button type="button" class="cc-x" data-cc="close">${ICON_X}<span class="sr-only">Cerrar sin cambiar nada</span></button>
        </div>
        <div class="cc-body">
          <p class="cc-lead">Tú decides qué medimos. Puedes cambiarlo cuando quieras desde «Configurar cookies».</p>
          <div class="cc-row">
            <div class="cc-row-t">
              <p class="cc-name"><b id="ccTecT">Técnicas</b> <span class="cc-tag">Siempre activas</span></p>
              <p class="cc-desc" id="ccTecD">Guardan tu partida, tu progreso y esta elección en tu navegador. Sin ellas el juego no puede recordar dónde te quedaste.</p>
            </div>
            <label class="cc-switch">
              <input type="checkbox" role="switch" id="ccTechnical" checked aria-disabled="true" aria-labelledby="ccTecT" aria-describedby="ccTecD">
              <span class="cc-track" aria-hidden="true"></span>
            </label>
          </div>
          <div class="cc-row">
            <div class="cc-row-t">
              <p class="cc-name"><b id="ccAnaT">Analíticas</b></p>
              <p class="cc-desc" id="ccAnaD">${analyticsAvailable
                ? 'Estadísticas de uso con un identificador aleatorio (PostHog, servidores en la UE): trámites empezados y completados, pistas y tiempo de juego. Nunca tu nombre ni tus datos de contacto.'
                : 'Ahora mismo el juego no usa analítica, así que no hay nada que activar.'}</p>
            </div>
            <label class="cc-switch">
              <input type="checkbox" role="switch" id="ccAnalytics" ${anaOn ? 'checked' : ''} ${analyticsAvailable ? '' : 'aria-disabled="true"'} aria-labelledby="ccAnaT" aria-describedby="ccAnaD">
              <span class="cc-track" aria-hidden="true"></span>
            </label>
          </div>
          <p class="cc-more">Más información en la <a href="${cookiesUrl}">política de cookies</a>.</p>
        </div>
        <div class="cc-actions">
          <button type="button" class="cc-btn" data-cc="reject">Rechazar todas</button>
          <button type="button" class="cc-btn" data-cc="save">Guardar selección</button>
          <button type="button" class="cc-btn" data-cc="accept">Aceptar todas</button>
        </div>
      </div>`;

    // Interruptores bloqueados (aria-disabled, siguen siendo enfocables y se anuncian)
    dlg.querySelectorAll('input[aria-disabled="true"]').forEach((inp) => {
      inp.addEventListener('click', (e) => e.preventDefault());
    });
    dlg.querySelector('[data-cc="close"]').addEventListener('click', () => closePrefs());
    dlg.querySelector('[data-cc="reject"]').addEventListener('click', () => choose(false));
    dlg.querySelector('[data-cc="accept"]').addEventListener('click', () => choose(analyticsAvailable));
    dlg.querySelector('[data-cc="save"]').addEventListener('click', () => {
      const inp = dlg && dlg.querySelector('#ccAnalytics');
      choose(!!(inp && inp.checked && analyticsAvailable));
    });
    // Esc / botón «atrás» de Android: cerrar sin escribir nada
    const me = dlg;
    me.addEventListener('cancel', (e) => { e.preventDefault(); if (dlg === me) closePrefs(); });
    me.addEventListener('close', () => { if (dlg === me) closePrefs(); });
    // Toque en el fondo (fuera del panel)
    me.addEventListener('click', (e) => { if (e.target === me && dlg === me) closePrefs(); });

    document.body.appendChild(dlg);
    root.classList.add('cc-prefs-open');
    usedFallback = false;
    let opened = false;
    if (typeof dlg.showModal === 'function') {
      try { dlg.showModal(); opened = true; } catch (e) { opened = false; }
    }
    if (!opened) {
      usedFallback = true;
      dlg.setAttribute('open', '');
      dlg.classList.add('cc-fallback');
      setInert(true);
      document.addEventListener('keydown', onFallbackKey, true);
    }
    const h = dlg.querySelector('#ccPrefsTitle');
    try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); }
  }

  window.Consent = {
    get: () => read(),
    analytics: () => { const c = read(); return !!(c && c.analytics && analyticsAvailable); },
    onChange: (fn) => listeners.push(fn),
    open: (from) => openPrefs(from),
    close: () => closePrefs(),
    isOpen: () => !!dlg,
  };

  function init() {
    document.querySelectorAll('[data-open-consent]').forEach((b) => {
      b.addEventListener('click', (e) => { e.preventDefault(); openPrefs(e.currentTarget); });
    });
    if (!read()) showBanner();
  }
  // El aviso entra ya, al ejecutarse este script (va al final del <body>), y no al DOMContentLoaded:
  // así no llega tras pintar el menú ni lo recoloca (CLS) mientras bajan el resto de scripts.
  // showBanner() no duplica el aviso cuando init() vuelve a pedirlo.
  if (document.body && !read()) showBanner();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
