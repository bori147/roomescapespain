'use strict';
// Añadidos de T3-N7 «Junta de vecinos» (se suman a tests/scale-catalog.js)
module.exports = {
  // La campanilla que agita el presidente de la mesa (también la de la Comisión en T5): campana de mano, no timbre de mesa (🛎️).
  // Ojo: el catálogo es global; ningún otro scale-catalog-*.js redefine 🔔 (comprobado al hacer esta sala).
  '🔔': { cm: 15, at: 'surface', fill: 0.88, note: 'campanilla de mano (presidente de mesa)' },
  // Solo se usa en T3-N7, etiquetado «Bolsa de pipas». El dibujo Fluent es UN cacahuete (~4–5 cm de verdad);
  // 14 cm es el tamaño de la bolsa que nombra la etiqueta (AUTORIA §7.4, regla 7). No hay emoji de bolsa de pipas
  // y la etiqueta no se puede cambiar: si el dueño acepta «Cuenco de pipas», 🥣 a 16 cm sería lo honesto.
  '🥜': { cm: 14, at: 'surface', fill: 0.87, note: 'bolsa de pipas (dibujo: un cacahuete; tamaño según la etiqueta)' },
  // Doña Pura, que vota NO al primer punto «por principio» (mismo valor que tests/scale-catalog-s4-06.js)
  '🙅‍♀️': { cm: 70, at: 'any', fill: 0.88, note: 'busto de mujer con los brazos cruzados en X (cabeza, hombros y brazos): sentada tras una mesa o una fila de sillas (behind)' },
};
