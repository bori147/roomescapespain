/* ==========================================================
   VUELVA USTED MAÑANA — Configuración editable
   ========================================================== */
window.GAME_CONFIG = {
  donation: {
    // Usuario de Ko-fi: el botón enlaza a https://ko-fi.com/<kofi>
    kofi: 'R7H627ZTOM',
    // Texto y color del botón (los mismos que el widget oficial de Ko-fi)
    text: '¡Invítame a un café!',
    color: '#72a4f2',
    // Opcional: cualquier otro enlace de pago (si se rellena, sustituye a Ko-fi)
    url: '',
  },

  // Analítica de producto (PostHog, servidores en la UE).
  // Solo se carga si el jugador ACEPTA la analítica en el aviso de cookies.
  // Mientras `key` esté vacía no se carga nada y no se muestra el aviso de cookies
  // (el juego solo usa almacenamiento técnico, que no requiere consentimiento).
  analytics: {
    key: '',                               // clave pública del proyecto: 'phc_...'
    host: 'https://eu.i.posthog.com',      // región UE
  },

  // Datos del titular (aviso legal y privacidad)
  legal: {
    titular: 'Gerard Bori',
    nif: '43457655Y',
    domicilio: 'Barcelona, 08013, España',
    email: '',                             // correo de contacto (obligatorio por la LSSI)
    web: 'https://bori147.github.io/roomescapespain/',
    actualizado: '1 de octubre de 2026',
  },
};
