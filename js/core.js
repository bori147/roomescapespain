/* ==========================================================
   VUELVA USTED MAÑANA — Registro de temporadas y utilidades
   Se carga ANTES que los ficheros de temporada (js/seasons/sN.js).
   ========================================================== */
(function () {
  'use strict';

  window.SEASONS = [];

  /**
   * Registra una temporada. Ver docs/AUTORIA.md para el formato completo.
   * season = { id, title, subtitle, tagline, badge, intro, ending, items, levels, css? }
   */
  window.registerSeason = function registerSeason(season) {
    if (!season || !season.id) throw new Error('registerSeason: falta id');
    window.SEASONS[season.id - 1] = season;
    if (season.css && typeof document !== 'undefined') {
      const st = document.createElement('style');
      st.dataset.season = season.id;
      st.textContent = season.css;
      document.head.appendChild(st);
    }
  };

  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  /** Normaliza texto: sin tildes, mayúsculas, espacios simples. */
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/\s+/g, ' ').trim();
  /** Cifrado César sobre A-Z (k positivo cifra, negativo descifra). */
  const caesar = (txt, k) => String(txt).replace(/[A-Z]/g, (c) =>
    String.fromCharCode(((c.charCodeAt(0) - 65 + (k % 26) + 26) % 26) + 65));
  /** Escapa HTML. */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  window.GameUtils = { rand, pad, norm, caesar, esc };
})();
