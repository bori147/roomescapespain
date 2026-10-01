/* Solución automática de la Temporada 4 (una función por nivel). */
module.exports = [
  // 1. Te ha tocado mesa
  async (h) => {
    h.click('abrigo'); h.click('carpeta'); h.click('movil'); h.click('cunado');
    h.use('billete', 'funcionario');
    if (h.flag('excusa')) throw new Error('El billete no debería valer como excusa');
    h.use('congreso', 'funcionario');
    h.click('funcionario'); await h.text('03-013-C');
  },
  // 2. Voto por correo
  async (h) => {
    h.click('bolso');
    h.click('dispensador'); h.choose('B ·');
    h.use('turno', 'ventanilla'); await h.keypad('54845');
    h.combo('papeletas', 'sobreVotacion'); h.choose('NIDAC');
    h.use('sobreVotoAbierto', 'pegamento');
    h.combo('sobreMesa', 'sobreVoto');
    h.combo('certificado', 'sobreMesa');
    h.use('sobreMesa', 'pegamento');
    h.use('sobreListo', 'ventanilla');
  },
  // 3. El mitin
  async (h) => {
    h.click('teleprompter');
    [1, 2, 0, 1, 1].forEach((v, i) => h.setValue(`#s4-tp-${i}`, v));
    h.clickSel('#s4-tp-go');
  },
  // 4. La encuesta
  async (h) => {
    h.click('cajon'); h.use('manopla', 'horno'); h.click('encimera'); h.close();
    h.click('puerta'); await h.keypad('1816');
  },
  // 5. El debate
  async (h) => {
    h.click('maquillaje'); h.click('atril');
    for (const k of [1, 3, 2, 0, 3, 2]) h.clickSel(`.choice-opt[data-i="${k}"]`);
  },
  // 6. Jornada electoral
  async (h) => {
    h.click('cola');
    ['A', 'R', 'R', 'R', 'A', 'R', 'R'].forEach((d, i) => h.clickSel(`[data-v="${i}"][data-d="${d}"]`));
    h.clickSel('#s4-cerrar');
    h.click('urna'); h.close();
    h.click('acta');
    const sol = { ALA: 2, FAROL: 1, NIDAC: 2, CANA: 1, UVA: 2, TIC: 1, BLANCO: 1, NULO: 6, VOTANTES: 16 };
    for (const [k, v] of Object.entries(sol)) h.setValue(`#s4-acta-${k}`, v);
    h.clickSel('#s4-acta-go');
  },
  // 7. El escrutinio
  async (h) => {
    h.click('chaqueta');
    h.click('calculadora'); h.setValue('#s4-calc-a', 1901); h.setValue('#s4-calc-b', 2); h.clickSel('#s4-calc-go');
    if (!h.$('#s4-calc-out').textContent.includes('950,5')) throw new Error('La calculadora no divide bien');
    h.close();
    h.click('proclamacion');
    const sol = { ALA: 5, FAROL: 5, NIDAC: 2, CANA: 3, UVA: 2, TIC: 0 };
    for (const [k, v] of Object.entries(sol)) h.setValue(`#s4-pr-${k}`, v);
    h.clickSel('#s4-pr-go');
  },
  // 8. La Junta Electoral
  async (h) => {
    h.click('carpeta');
    h.click('sede'); await h.text('PLAZOS-2718'); await h.sleep(10); h.close();
    h.click('registro');
    h.setValue('#s4-f-org', 1); h.setValue('#s4-f-tipo', 2); h.setValue('#s4-f-dia', 10);
    h.clickSel('#s4-f-go');
  },
  // 9. Los pactos
  async (h) => {
    h.click('tribuna');
    for (const id of ['NIDAC', 'UVA', 'ZIG', 'ASPA']) h.clickSel(`.party[data-id="${id}"]`);
    h.clickSel('#s4-vote');
  },
  // 10. Moción de censura
  async (h) => {
    h.click('ujier'); h.choose('Begoña Mudanza');
    h.use('servilleta', 'maquina');
    h.setValue('#s4-key', 'Mudanza'); h.clickSel('#s4-dec');
    if (!h.$('#s4-out').textContent.includes('ME ABSTENDRE YO SOLA')) throw new Error('El descifrado no es correcto: ' + h.$('#s4-out').textContent);
    h.close();
    h.click('marcador'); await h.keypad('401724');
  },
];
