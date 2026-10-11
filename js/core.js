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
      // Capa «seasons»: por encima de los estilos base y por debajo de «overrides»
      // (ver el orden de capas en css/tokens.css y css/style.css). Los navegadores
      // sin @layer (y jsdom, cuyo analizador CSS no lo entiende) reciben el CSS tal cual.
      st.textContent = typeof window.CSSLayerBlockRule === 'function'
        ? '@layer seasons{' + season.css + '}'
        : season.css;
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

  /* Emoji como imagen (Fluent 3D, igual en todos los dispositivos). Ver tools/emoji-build.js. */
  const EI = window.EMOJI_IMG || { base: 'img/emoji/', keys: '' };
  const emojiKeys = new Set(EI.keys ? EI.keys.split(' ') : []);
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('es', { granularity: 'grapheme' }) : null;
  const graphemes = (s) => (seg ? [...seg.segment(String(s))].map((x) => x.segment) : Array.from(String(s)));
  const hexOf = (g) => Array.from(g).map((c) => c.codePointAt(0).toString(16).padStart(4, '0')).join('-');
  /** Clave de fichero de un emoji (o null si no hay imagen). */
  const emojiKey = (g) => {
    const c = hexOf(g);
    for (const k of [c, c.replace(/-fe0f/g, ''), c + '-fe0f']) if (emojiKeys.has(k)) return k;
    return null;
  };
  const BOX = EI.box || {};
  /**
   * Sustituye cada emoji con imagen por <img class="emo">; el resto del texto se escapa tal cual.
   * Los contenedores son decorativos (aria-hidden), así que alt="".
   * ground: en la sala, cada imagen baja su margen transparente inferior para apoyar de verdad.
   */
  const emojiHTML = (str, ground) => graphemes(str).map((g) => {
    const k = /\p{Extended_Pictographic}/u.test(g) ? emojiKey(g) : null;
    if (!k) return esc(g);
    const drop = ground && BOX[k] && BOX[k][0] > 1 ? ` style="translate:0 ${+(BOX[k][0] / 2.56).toFixed(2)}%"` : '';
    return `<img class="emo" src="${EI.base}${k}.webp" alt="" draggable="false" decoding="async"${drop}>`;
  }).join('');
  /**
   * Sombra de contacto ajustada a lo que se ve: anchura (en em) y centro (en % de la caja) de una fila de emoji.
   * null si algún carácter no tiene medida (se usa la sombra estándar).
   */
  const emojiShadow = (str) => {
    const gs = graphemes(str);
    if (!gs.length) return null;
    const first = emojiKey(gs[0]); const last = emojiKey(gs[gs.length - 1]);
    if (!first || !last || !BOX[first] || !BOX[last]) return null;
    const l = BOX[first][1] / 256; const r = gs.length - 1 + BOX[last][2] / 256;
    return { w: +(r - l).toFixed(3), cx: +(((l + r) / 2 / gs.length) * 100).toFixed(1) };
  };
  /** URL de la imagen de un emoji (para precargar), o null. */
  const emojiURL = (g) => { const k = emojiKey(g); return k ? EI.base + k + '.webp' : null; };

  window.GameUtils = { rand, pad, norm, caesar, esc, emojiHTML, emojiShadow, emojiURL, graphemes };
})();
