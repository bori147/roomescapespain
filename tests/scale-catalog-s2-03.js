'use strict';
/* Corrección de catálogo para T2-N3 (se fusiona encima de tests/scale-catalog.js).
   El dibujo Fluent de 📥 es una bandeja casi tan alta como ancha más una flecha grande:
   su tamaño honesto es el de una bandeja A4 (unos 35 cm de ancho), no los 12 cm de su canto. */
module.exports = {
  '📥': { cm: 30, at: 'surface', fill: 0.88, note: 'bandeja A4 de documentos (35 cm de ancho; la flecha cuenta en el alto del dibujo)' },
};
