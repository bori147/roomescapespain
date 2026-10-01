/* ==========================================================
   VUELVA USTED MAÑANA — Consentimiento de cookies (RGPD / LSSI)
   - El almacenamiento técnico (partida guardada, esta preferencia) no
     necesita consentimiento.
   - La analítica solo se activa si el usuario la acepta expresamente.
   - Rechazar es tan fácil como aceptar. La elección caduca a los 12 meses.
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

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  let banner = null;
  function hideBanner() { if (banner) { banner.remove(); banner = null; } }

  function showBanner() {
    if (banner || !analyticsAvailable) return;
    banner = el('div', 'cc-banner');
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
      <p><b>🍪 ¿Nos ayudas a mejorar el juego?</b><br>
      Guardamos tu partida en tu navegador (imprescindible para jugar). Además, <b>solo si lo aceptas</b>,
      usamos analítica para saber hasta dónde llega la gente y qué trámites atascan más.
      No hay publicidad. <a href="${cookiesUrl}">Política de cookies</a>.</p>
      <div class="cc-actions">
        <button class="cc-btn" data-cc="reject">Rechazar</button>
        <button class="cc-btn" data-cc="config">Configurar</button>
        <button class="cc-btn" data-cc="accept">Aceptar</button>
      </div>`;
    banner.querySelector('[data-cc="reject"]').onclick = () => { write(false); hideBanner(); };
    banner.querySelector('[data-cc="accept"]').onclick = () => { write(true); hideBanner(); };
    banner.querySelector('[data-cc="config"]').onclick = () => openPrefs();
    document.body.appendChild(banner);
  }

  function openPrefs() {
    const cur = read();
    const ov = el('div', 'cc-overlay');
    ov.innerHTML = `
      <div class="cc-panel" role="dialog" aria-modal="true" aria-label="Configuración de cookies">
        <h3>Configuración de cookies</h3>
        <div class="cc-row">
          <div><b>Técnicas (necesarias)</b><br><small>Guardan tu partida, tu progreso y esta elección en tu navegador. Sin ellas el juego no puede recordar dónde te quedaste.</small></div>
          <label class="cc-switch"><input type="checkbox" checked disabled><span></span></label>
        </div>
        <div class="cc-row">
          <div><b>Analíticas</b><br><small>${analyticsAvailable
            ? 'Estadísticas de uso con un identificador aleatorio (PostHog, servidores en la UE): niveles empezados y completados, pistas, tiempo de juego. Nunca tu nombre ni tus datos de contacto.'
            : 'Actualmente el juego no usa analítica, así que no hay nada que activar.'}</small></div>
          <label class="cc-switch"><input type="checkbox" id="ccAnalytics" ${cur && cur.analytics ? 'checked' : ''} ${analyticsAvailable ? '' : 'disabled'}><span></span></label>
        </div>
        <p><small>Más información en la <a href="${cookiesUrl}">política de cookies</a>. Puedes cambiar tu elección en cualquier momento desde «Configurar cookies», al pie de la página.</small></p>
        <div class="cc-actions">
          <button class="cc-btn" data-cc="reject">Rechazar todas</button>
          <button class="cc-btn" data-cc="save">Guardar selección</button>
          <button class="cc-btn" data-cc="accept">Aceptar todas</button>
        </div>
      </div>`;
    const close = () => ov.remove();
    ov.querySelector('[data-cc="reject"]').onclick = () => { write(false); hideBanner(); close(); };
    ov.querySelector('[data-cc="accept"]').onclick = () => { write(analyticsAvailable); hideBanner(); close(); };
    ov.querySelector('[data-cc="save"]').onclick = () => { write(ov.querySelector('#ccAnalytics').checked); hideBanner(); close(); };
    ov.onclick = (e) => { if (e.target === ov) close(); };
    document.body.appendChild(ov);
  }

  window.Consent = {
    get: () => read(),
    analytics: () => { const c = read(); return !!(c && c.analytics && analyticsAvailable); },
    onChange: (fn) => listeners.push(fn),
    open: () => openPrefs(),
  };

  function init() {
    document.querySelectorAll('[data-open-consent]').forEach((b) => {
      b.addEventListener('click', (e) => { e.preventDefault(); openPrefs(); });
    });
    if (!read()) showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
