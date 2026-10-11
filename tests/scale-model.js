/* ==========================================================
   Modelo de escala de las salas (realismo y proporciones).
   La sala es un escenario visto de frente:
   - Pared del fondo: ocupa el alto de la escena menos el suelo (floorH %). Representa WALL_CM cm reales.
   - Suelo: franja inferior; lo que apoya más abajo está más cerca y se ve más grande (hasta DEPTH_MAX).
   - Unidades del juego: x, y en % del ancho/alto de la escena; s (tamaño de un emoji) en cqw
     (1 cqw = 1 % del ancho). La escena es 16:9, así que su alto mide 56,25 cqw.
   - Un emoji de tamaño s ocupa s cqw de ancho y s cqw de alto (= s·16/9 % del alto).
     Su base (donde apoya) está en  y + 0,889·s  (% del alto).
   - Las imágenes Fluent 3D llenan ~90 % de su caja (FILL); el catálogo puede afinarlo por emoji.
   Fórmula:  s ≈ cm_reales × K × profundidad / fill,  con  K = altoPared_cqw / WALL_CM.
   ========================================================== */
'use strict';

const SCENE_H_CQW = 56.25;
const WALL_CM = 320;      // alto real visible de la pared del fondo (techo de oficina ~3 m + algo de margen)
const DEPTH_MAX = 1.3;    // lo más cercano (borde inferior) se ve un 30 % más grande que junto a la pared
const FILL = 0.9;

const horizonOf = (floorH) => 100 - floorH;
const kOf = (floorH) => (SCENE_H_CQW * horizonOf(floorH) / 100) / WALL_CM;           // cqw por cm junto a la pared
const baseOf = (y, s) => y + (s * 16 / 9) / 2;                                       // % del alto
const depthOf = (base, floorH) => {
  const h = horizonOf(floorH);
  if (base <= h) return 1;
  return 1 + (DEPTH_MAX - 1) * Math.min(1, (base - h) / floorH);
};
/** Tamaño s (cqw) que debe tener un objeto de `cm` reales que apoya en `base` (% alto). */
const sizeFor = (cm, base, floorH, fill = FILL) => cm * kOf(floorH) * depthOf(base, floorH) / fill;
/** Centímetros reales que representa un emoji de tamaño s apoyado en `base`. */
const cmOf = (s, base, floorH, fill = FILL) => s * fill / (kOf(floorH) * depthOf(base, floorH));
/** Alto en % de la escena de algo de `cm` reales apoyado en `base` (para muebles hechos con decor kind). */
const pctFor = (cm, base, floorH) => cm * kOf(floorH) * depthOf(base, floorH) / SCENE_H_CQW * 100;
/** y (centro) para que un emoji de tamaño s apoye exactamente en `base`. */
const yFor = (base, s) => base - (s * 16 / 9) / 2;

module.exports = { SCENE_H_CQW, WALL_CM, DEPTH_MAX, FILL, horizonOf, kOf, baseOf, depthOf, sizeFor, cmOf, pctFor, yFor };

/** Base (% alto) de algo colgado en la pared cuyo borde inferior está a `cmAboveFloor` cm del suelo. */
const wallBaseFor = (cmAboveFloor, floorH) => horizonOf(floorH) - cmAboveFloor * kOf(floorH) / SCENE_H_CQW * 100;
module.exports.wallBaseFor = wallBaseFor;

// Calculadora:  node tests/scale-model.js <floorH> <cm> [base%]   → tamaño s y centro y
//               node tests/scale-model.js <floorH> pared <cm_altura_borde_inferior> <cm_objeto>
if (require.main === module) {
  const [fh, a, b, c] = process.argv.slice(2);
  const floorH = +fh || 32;
  if (a === 'pared') {
    const base = wallBaseFor(+b, floorH); const s = sizeFor(+c, base, floorH);
    console.log(`floorH ${floorH}: objeto de pared de ${c} cm con el borde inferior a ${b} cm → s ≈ ${s.toFixed(2)}, y ≈ ${yFor(base, s).toFixed(2)} (base ${base.toFixed(2)}%)`);
  } else if (a) {
    const base = b != null ? +b : horizonOf(floorH) + floorH * 0.5;
    const s = sizeFor(+a, base, floorH);
    console.log(`floorH ${floorH}: objeto de ${a} cm apoyado en base ${base.toFixed(2)}% (profundidad ×${depthOf(base, floorH).toFixed(2)}) → s ≈ ${s.toFixed(2)}, y ≈ ${yFor(base, s).toFixed(2)}`);
    console.log(`  (un mueble de ${a} cm de alto con el pie en ${base.toFixed(2)}% mide h ≈ ${pctFor(+a, base, floorH).toFixed(2)} % de la escena)`);
  } else console.log('Uso: node tests/scale-model.js <floorH> <cm> [base%]  |  node tests/scale-model.js <floorH> pared <cm_borde_inferior> <cm_objeto>');
}
