/* Solución automática de la Temporada 4 (una función por nivel). */
module.exports = [
  // 1. Te ha tocado mesa (trae: escritura del piso, de la T3)
  async (h) => {
    h.click('abrigo'); h.click('carpeta'); h.click('movil'); h.click('cunado');
    h.use('billete', 'funcionario');
    if (h.flag('excusa')) throw new Error('El billete no debería valer como excusa');
    h.use('congreso', 'funcionario');
    h.click('funcionario');
    if (h.modalOpen()) throw new Error('Sin acreditar el domicilio no debería pedir la mesa');
    h.use('escritura', 'funcionario');
    h.click('funcionario'); await h.text('03-013-C');
    if (!h.has('credencial')) throw new Error('Falta la credencial');
  },
  // 2. Voto por correo (trae: DNI)
  async (h) => {
    h.click('bolso');
    h.click('dispensador'); h.choose('B ·');
    h.use('turno', 'ventanilla');
    h.use('dni', 'ventanilla'); await h.keypad('54845');
    h.combo('papeletas', 'sobreVotacion'); h.choose('NIDAC');
    h.use('sobreVotoAbierto', 'pegamento');
    h.combo('sobreMesa', 'sobreVoto');
    h.combo('certificado', 'sobreMesa');
    h.use('sobreMesa', 'pegamento');
    h.use('sobreListo', 'ventanilla');
  },
  // 3. El mitin (trae: acreditación de la consultora)
  async (h) => {
    h.click('teleprompter');
    if (h.modalOpen()) throw new Error('El teleprompter no debería abrirse sin acreditación');
    h.use('acreditacion', 'segurata');
    h.click('teleprompter');
    [1, 2, 0, 1, 1].forEach((v, i) => h.setValue(`#s4-tp-${i}`, v));
    h.clickSel('#s4-tp-go');
  },
  // 4. La encuesta (trae: orden de trabajo)
  async (h) => {
    h.click('cajon');
    if (h.has('manopla')) throw new Error('El chef no debería dejar abrir el cajón sin la orden');
    h.use('encargo', 'chef');
    h.click('cajon'); h.use('manopla', 'horno'); h.click('encimera'); h.close();
    h.click('puerta'); await h.keypad('1816');
  },
  // 5. El debate (trae: barómetro sin cocinar)
  async (h) => {
    h.click('maquillaje');
    h.use('barometro', 'asesor');
    h.click('atril');
    for (const k of [1, 3, 2, 0, 3, 2]) h.clickSel(`.choice-opt[data-i="${k}"]`);
  },
  // 6. Jornada electoral (trae: credencial, justificante del voto por correo)
  async (h) => {
    h.click('cola');
    ['A', 'R', 'R', 'R', 'A', 'R', 'R'].forEach((d, i) => h.clickSel(`[data-v="${i}"][data-d="${d}"]`));
    h.clickSel('#s4-cerrar');
    h.use('credencial', 'policia');
    h.click('urna'); h.close();
    h.use('justificante', 'interventora');
    h.click('acta');
    const sol = { ALA: 2, FAROL: 1, NIDAC: 2, CANA: 1, UVA: 2, TIC: 1, BLANCO: 1, NULO: 6, VOTANTES: 16 };
    for (const [k, v] of Object.entries(sol)) h.setValue(`#s4-acta-${k}`, v);
    h.clickSel('#s4-acta-go');
  },
  // 7. El escrutinio (trae: copia del acta de la mesa)
  async (h) => {
    h.use('actaCopia', 'totales');
    h.click('calculadora'); h.setValue('#s4-calc-a', 1901); h.setValue('#s4-calc-b', 2); h.clickSel('#s4-calc-go');
    if (!h.$('#s4-calc-out').textContent.includes('950,5')) throw new Error('La calculadora no divide bien');
    h.close();
    h.click('proclamacion');
    const sol = { ALA: 5, FAROL: 5, NIDAC: 2, CANA: 3, UVA: 2, TIC: 0 };
    for (const [k, v] of Object.entries(sol)) h.setValue(`#s4-pr-${k}`, v);
    h.clickSel('#s4-pr-go');
  },
  // 8. La Junta Electoral (trae: credencial, copia del acta)
  async (h) => {
    h.click('carpeta');
    h.click('sede'); await h.text('PLAZOS-2718'); await h.sleep(10); h.close();
    h.use('credencial', 'registro'); h.use('actaCopia', 'registro');
    h.click('registro');
    h.setValue('#s4-f-org', 1); h.setValue('#s4-f-tipo', 2); h.setValue('#s4-f-dia', 12);
    h.clickSel('#s4-f-go');
  },
  // 9. Los pactos (trae: acta de proclamación, resolución de la Junta)
  async (h) => {
    h.use('actaProcl', 'letrado'); h.use('resolucion', 'letrado');
    h.click('tribuna');
    for (const id of ['NIDAC', 'UVA', 'ZIG', 'ASPA']) h.clickSel(`.party[data-id="${id}"]`);
    h.clickSel('#s4-vote');
  },
  // 10. Moción de censura (trae: acuerdo de gobierno, pinganillo)
  async (h) => {
    h.use('pinganillo', 'sonido');
    h.click('ujier'); h.choose('Begoña Mudanza');
    h.use('servilleta', 'maquina');
    h.setValue('#s4-key', 'Mudanza'); h.clickSel('#s4-dec');
    if (!h.$('#s4-out').textContent.includes('ME ABSTENDRE YO SOLA')) throw new Error('El descifrado no es correcto: ' + h.$('#s4-out').textContent);
    h.close();
    h.use('acuerdo', 'presidenta');
    h.click('marcador'); await h.keypad('401724');
  },
];
