/* ==========================================================
   VUELVA USTED MAÑANA — Configuración editable
   ========================================================== */
window.GAME_CONFIG = {
  donation: {
    // Enlace de pago de Stripe (Payment Link) con «el cliente elige el importe».
    // Pega aquí tu enlace, p. ej.: 'https://buy.stripe.com/xxxxxxxxxxxx'
    // Mientras esté vacío, los botones de apoyo no se muestran.
    url: '',

    // Opcional: enlaces de importe fijo. Si los rellenas, aparecerán como botones
    // rápidos (1 €, 3 €, 5 €, 10 €). Si los dejas vacíos, solo se muestra el botón
    // de «importe libre», que usa `url`.
    fixed: {
      1: '',
      3: '',
      5: '',
      10: '',
    },
  },
};
