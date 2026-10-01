/* Solución automática de la Temporada 5 (una función por nivel). */
module.exports = [
  // 1. Las oposiciones
  async (h) => {
    h.click('abrigo');
    h.use('dni', 'tribunal');
    h.click('conserje');
    h.combo('boli', 'impreso'); await h.keypad('1147');
    h.use('impresoOk', 'conserje');
    h.combo('hoja', 'lapiz');
    ['A', 'B', 'A', 'B', 'B'].forEach((o, i) => h.clickSel(`#s5-a${i + 1}${o}`));
    h.close();
    h.use('hoja', 'tribunal');
  },
  // 2. La toma de posesión
  async (h) => {
    h.click('maletin');
    h.click('terminal'); await h.keypad('3906');
    h.use('ticket', 'tecnico');
    h.click('cajon'); await h.keypad('2209');
    h.use('grapadora', 'conserje');
    h.use('llave', 'almacen');
    h.click('almacen'); h.choose('PAT-0317-B');
    h.combo('cargador', 'portatil');
    h.use('silla', 'mesa'); h.use('portatilOk', 'mesa');
    h.click('subse'); h.choose('«Prometo por mi conciencia');
  },
  // 3. Presupuestos prorrogados
  async (h) => {
    h.click('archivo'); await h.keypad('1403');
    if (!h.has('pres2023')) throw new Error('No se obtuvo el presupuesto 2023');
    h.click('cuadro');
    const v = { AP2: 180, SA1: 310, SA6: 200, IV2: 140, IV6: 110, IVT: 500, MR1: 120, T1: 1100, T2: 800, T6: 500, TT: 2400 };
    for (const [k, x] of Object.entries(v)) h.setValue(`#s5-b-${k}`, x);
    h.btn('Someter');
  },
  // 4. Los fondos europeos
  async (h) => {
    h.click('papelera');
    h.click('plataforma');
    ['V', 'D', 'C', 'X', 'X', 'D', 'C', 'X', 'V', 'X', 'X'].forEach((c, i) => h.setValue(`#s5-f${i + 1}`, c));
    h.btn('Enviar');
  },
  // 5. Bruselas
  async (h) => {
    h.click('cabina');
    if (!h.has('nota')) throw new Error('Falta la nota');
    // Comprobación del cifrado: la nota debe decodificarse con el Reglamento 2026/97
    h.click('regB');
    const ps = [...h.$$('#modal .doc-body p')].map((p) => p.textContent).filter((t) => /^\(\d\)/.test(t))
      .map((t) => t.replace(/^\(\d\)\s*/, '').split(/\s+/).map((w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '')).filter(Boolean));
    const pairs = [[3, 26], [3, 27], [3, 1], [2, 28], [4, 4], [1, 19], [6, 27], [5, 8], [6, 29], [5, 11], [2, 27], [5, 13]];
    const msg = pairs.map(([c, p]) => ps[c - 1][p - 1]).join(' ');
    if (msg !== 'LA CLAVE ES EL DIA Y EL MES DE ENTRADA EN VIGOR') throw new Error('Mensaje descifrado incorrecto: ' + msg);
    h.close();
    h.click('puerta'); await h.keypad('2007');
  },
  // 6. El Senado
  async (h) => {
    h.click('mesa');
    // Orden reglamentario: supresión (E2, E6), modificación (E1, E3, E5, E8), adición (E4, E7)
    h.clickSel('#s5-e2-y');
    h.clickSel('#s5-e6-y'); // decae
    h.clickSel('#s5-e1-n');
    h.clickSel('#s5-e3-n');
    h.clickSel('#s5-e5-y'); // decae
    h.clickSel('#s5-e8-y');
    h.clickSel('#s5-e4-y');
    h.clickSel('#s5-e7-y');
    h.clickSel('#s5-esend');
  },
  // 7. El Tribunal Constitucional
  async (h) => {
    h.click('registro'); await h.keypad('0809');
  },
  // 8. El órgano bloqueado
  async (h) => {
    h.click('urna');
    for (const id of [1, 3, 6, 8]) h.clickSel(`.s5-cand[data-id="${id}"]`);
    h.clickSel('#s5-vote');
  },
  // 9. El Consejo de Ministros
  async (h) => {
    h.click('maquina');
    h.setValue('#s5-vkey', 'cafe'); h.clickSel('#s5-vgo');
    const out = h.$('#s5-vout').textContent;
    if (!out.includes('ORDEN ALFABETICO DE APELLIDO')) throw new Error('Descifrado incorrecto: ' + out);
    h.close();
    h.click('cartera'); await h.keypad('2413');
    h.use('decreto9', 'presidente');
  },
  // 10. El laberinto del Estado
  async (h) => {
    h.click('plano');
    for (const [x, y] of [[1, 0], [1, 2], [0, 2], [2, 2], [2, 4], [4, 4]]) h.clickSel(`.s5-mz[data-x="${x}"][data-y="${y}"]`);
    h.close();
    if (!h.has('selloRegistro')) throw new Error('No se obtuvo el Sello de Registro');
    h.click('recibos'); h.close();
    h.click('vHacienda'); await h.keypad('5');
    h.click('teletipo');
    for (let i = 0; i < 7; i++) h.clickSel('#s5-cR');
    if (!h.$('#s5-cOut').textContent.includes('ESTRELLAS DE LA BANDERA')) throw new Error('El telegrama no se descifra con 7');
    h.close();
    h.click('vEuropa'); await h.keypad('3');
    h.click('puertas'); h.choose('Puerta 1');
    h.click('caja'); await h.keypad('3517');
    h.use('decreto10', 'mesaPres');
  },
];
