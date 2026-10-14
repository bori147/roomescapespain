'use strict';
// Añadidos de T3-N7 «Junta de vecinos» (se suman a tests/scale-catalog.js)
module.exports = {
  // La campanilla que agita el presidente de la mesa (también la de la Comisión en T5): campana de mano, no timbre de mesa (🛎️).
  // Ojo: el catálogo es global; ningún otro scale-catalog-*.js redefine 🔔 (comprobado al hacer esta sala).
  '🔔': { cm: 15, at: 'surface', fill: 0.88, note: 'campanilla de mano (presidente de mesa)' },
  // «Cuenco de pipas» sobre la mesa presidencial: cuenco de unos 18 cm de ancho y ~15 cm de alto con la cuchara.
  // (🥜 vuelve a su valor del catálogo común, un solo cacahuete de 5 cm: ya no se usa en esta sala.)
  '🥣': { cm: 15, at: 'surface', fill: 0.87, note: 'cuenco con cuchara (cuenco de pipas sobre la mesa)' },
  // Doña Pura, que vota NO al primer punto «por principio» (mismo valor que tests/scale-catalog-s4-06.js)
  '🙅‍♀️': { cm: 70, at: 'any', fill: 0.88, note: 'busto de mujer con los brazos cruzados en X (cabeza, hombros y brazos): sentada tras una mesa o una fila de sillas (behind)' },
};
