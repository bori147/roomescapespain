/* Solución automática de la Temporada 2 (una función por nivel). */
module.exports = [
  // 1. El epígrafe
  async (h) => {
    h.click('mochila');
    h.click('expositor'); h.choose('modelo 036');
    h.use('modelo036', 'mesa');
    h.setValue('#s2-causa', '111'); h.setValue('#s2-epi', '644.6'); h.setValue('#s2-dom', 'local');
    h.btn('Firmar el 036');
    h.use('modelo036Relleno', 'funcionario');
  },
  // 2. La cuota
  async (h) => {
    h.click('cartera');
    h.click('terminal'); await h.keypad('280347121534');
    h.click('mochila'); h.click('repartidor'); h.click('movil');
    h.use('vidaLaboral', 'funcionaria'); await h.keypad('230');
  },
  // 3. Nombre no disponible
  async (h) => {
    h.click('bandeja'); h.use('solicitudDen', 'pupitre');
    h.setValue('#s2-p1', 1); h.setValue('#s2-p2', 1);
    if (!h.$('#s2-prev').textContent.includes('PORRAS DEL TRÁMITE')) throw new Error('La vista previa no muestra PORRAS DEL TRÁMITE');
    h.btn('Rellenar solicitud');
    h.use('solicitudRellena', 'registradora');
    h.use('certDen', 'puerta');
  },
  // 4. Ante mí
  async (h) => {
    h.click('carpeta');
    h.click('oficial');
    for (const k of ['2', '4', '5']) h.clickSel(`.opt[data-k="${k}"]`);
    h.btn('Devolver con correcciones'); await h.keypad('10');
    h.click('mesaFirmas');
    for (const s of ['tia', 'tu', 'cunado', 'notario']) h.clickSel(`[data-s="${s}"]`);
  },
  // 5. La licencia
  async (h) => {
    h.click('arquitecta');
    h.use('plano', 'mesaDibujo');
    const clicks = { 2: 2, 8: 3, 10: 1, 13: 1, 17: 1, 18: 1, 20: 1 }; // freidora, extintor y 5 mesas
    for (const [i, n] of Object.entries(clicks)) for (let k = 0; k < n; k++) h.clickSel(`.s2-grid .tile[data-i="${i}"]`);
    h.btn('Firmar el plano');
    h.click('caja'); await h.keypad('133');
    h.use('planoFirmado', 'tecnico');
    h.use('justificanteTasa', 'tecnico'); await h.keypad('20');
  },
  // 6. La primera factura
  async (h) => {
    h.click('ramona');
    h.click('tpv');
    h.setValue('#s2-num', 'A-2027-0002'); h.setValue('#s2-nif', 'B12345674');
    h.setValue('#s2-base', '20,00'); h.setValue('#s2-iva', '3,10'); h.setValue('#s2-total', '23,10'); h.setValue('#s2-huella', '1257');
    h.btn('Emitir factura');
    h.use('facturaRamona', 'ramona');
  },
  // 7. El 303
  async (h) => {
    h.click('cajaZapatos');
    for (const k of ['harina', 'aceite', 'freidora', 'luzMar']) h.clickSel(`.opt[data-k="${k}"]`);
    h.btn('Anotar en el libro');
    h.click('movil'); await h.keypad('128');
    h.click('ordenador');
    h.setValue('#s2-c27', '483'); h.setValue('#s2-c45', '355'); h.setValue('#s2-c71', '128'); h.setValue('#s2-pago', 'nrc');
    h.btn('Presentar declaración');
  },
  // 8. El registro horario
  async (h) => {
    h.click('archivador');
    h.click('inspectora');
    h.click('inspectora'); await h.keypad('135');
    h.choose('Pagar a Lucía');
  },
  // 9. El Kit Digital
  async (h) => {
    h.click('caja'); h.use('efectivo', 'cajero');
    h.click('buzon');
    h.click('portatil'); h.choose('Editor de la web');
    for (const k of ['ue', 'prtr', 'gob', 'kit']) h.clickSel(`.opt[data-k="${k}"]`);
    h.btn('Publicar y hacer captura');
    h.click('portatil'); h.choose('Banca online');
    h.btn('Transferir'); await h.keypad('420');
    h.click('portatil'); h.choose('Portal de justificación');
    for (const k of ['captura', 'facturaAgente', 'justificantePago']) h.clickSel(`#s2-att-${k}`);
    h.clickSel('#s2-minimis'); await h.keypad('700');
    h.clickSel('#s2-present');
  },
  // 10. La inspección
  async (h) => {
    h.click('inspector');
    h.click('archivador'); await h.keypad('6446');
    h.click('inspector'); h.choose('① IVA'); await h.keypad('333');
    h.click('inspector'); h.choose('② Gastos');
    for (const k of ['cuotas', 'uniforme', 'curso', 'seguro']) h.clickSel(`.opt[data-k="${k}"]`);
    h.btn('Confirmar gastos');
    h.click('inspector'); h.choose('③ Amortización'); await h.keypad('60');
    h.click('inspector'); h.choose('④ Firmar'); h.choose('pagar en plazo'); await h.keypad('2121');
    h.use('certificadoAEAT', 'puerta');
  },
];
