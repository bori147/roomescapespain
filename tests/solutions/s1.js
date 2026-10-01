/* Solución automática de la Temporada 1 (una función por nivel). */
module.exports = [
  // 1. Cita previa
  async (h) => {
    h.click('reloj');
    for (let i = 0; i < 6; i++) h.clickSel('[data-d="h-1"]');
    for (let i = 0; i < 5; i++) h.clickSel('[data-d="m5"]');
    h.close();
    h.click('pc');
    h.use('justificante', 'agente');
  },
  // 2. Vuelva usted mañana
  async (h) => {
    h.click('abrigo'); h.click('maceta');
    h.use('euro', 'cafetera'); h.use('cafe', 'ventanilla');
    h.use('dni', 'fotocopiadora'); h.use('fotocopias', 'funcionaria');
  },
  // 3. El padrón
  async (h) => {
    h.click('buzon'); h.use('llavecita', 'cajon');
    h.click('archivo'); await h.keypad('0915');
    h.combo('modeloP0', 'sello'); h.use('modeloSellado', 'funcionario');
  },
  // 4. La ventanilla equivocada
  async (h) => {
    h.click('dispensador'); h.click('mando'); await h.keypad('347');
    for (const v of ['v_firma', 'v_caja', 'v_info', 'v_sellos', 'v_registro']) h.click(v);
    h.use('numeroSS', 'puerta');
  },
  // 5. Sede electrónica
  async (h) => {
    h.click('cajon'); h.use('usb', 'ordenador'); h.click('ordenador');
    h.setValue('#sB', 3); h.setValue('#sJ', 0); h.setValue('#sA', 2); h.clickSel('#sGo');
    h.setValue('#sPw', 'tobi2015'); h.clickSel('#sPwGo');
    h.clickSel('#sReq'); h.setValue('#sPin', '842'); h.clickSel('#sPinGo');
    h.close();
    h.use('acuse', 'puerta');
  },
  // 6. La renta
  async (h) => {
    for (const id of ['carpeta', 'abrigo', 'buzon', 'gafas', 'papelera']) h.click(id);
    h.click('terminal'); await h.keypad('21340');
    h.btn('Modificar'); await h.sleep(20); await h.keypad('750');
  },
  // 7. La investidura
  async (h) => {
    h.click('tribuna');
    for (const id of ['PPA', 'TRM', 'PIN', 'PSA', 'UNO']) h.clickSel(`.party[data-id="${id}"]`);
    h.clickSel('#vote');
  },
  // 8. No me consta
  async (h) => {
    h.click('trituradora');
    for (let i = 0; i < 6; i++) {
      const ord = h.flag('strips') || [3, 0, 5, 1, 4, 2];
      const j = ord.indexOf(i);
      if (j !== i) { h.clickSel(`.strip[data-i="${i}"]`); h.clickSel(`.strip[data-i="${j}"]`); }
    }
    h.close();
    h.click('caja'); await h.keypad('472');
    h.use('pendriveB', 'presidenta');
  },
  // 9. El BOE de las 23:59
  async (h) => {
    h.click('rotativa'); h.click('sobre');
    h.combo('disco', 'sobre');
    for (let i = 0; i < 3; i++) h.clickSel('#cR');
    if (!h.$('#cOut').textContent.includes('SILENCIO')) throw new Error('El descifrado no muestra SILENCIO');
    h.close();
    h.click('puerta'); await h.text('silencio');
  },
  // 10. La ventanilla única
  async (h) => {
    h.click('mesa'); h.click('ujier');
    h.combo('boli', 'declaracion');
    for (const v of [1, 2, 5]) h.clickSel(`.decl input[value="${v}"]`);
    h.btn('Firmar');
    h.use('modelo790', 'v4'); await h.keypad('2104');
    h.use('solicitud', 'v2'); h.use('solicitudSellada', 'v1');
    h.click('calendario'); h.clickSel('.cal-d[data-d="26"]'); h.close();
    h.use('resolucion', 'puerta');
  },
];
