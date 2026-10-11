'use strict';
// Añadidos de T3-N7 «Junta de vecinos» (se suman a tests/scale-catalog.js)
module.exports = {
  // La campanilla que agita el presidente de la mesa (también la de la Comisión en T5): campana de mano, no timbre de mesa (🛎️)
  '🔔': { cm: 15, at: 'surface', fill: 0.88, note: 'campanilla de mano (presidente de mesa)' },
  // Solo se usa en T3-N7, como «Bolsa de pipas» sobre la mesa presidencial: una bolsa pequeña de pipas mide unos 14 cm.
  // El dibujo Fluent es un cacahuete; no hay emoji de bolsa de pipas y la etiqueta y el texto no se pueden cambiar.
  '🥜': { cm: 14, at: 'surface', fill: 0.87, note: 'bolsa de pipas o cacahuetes' },
};
