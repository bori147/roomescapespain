/* Solución automática de la Temporada 3 (una función por nivel). */
module.exports = [
  // 1. Se alquila (con condiciones)
  async (h) => {
    h.click('mochila'); h.click('estanteria');
    h.combo('carpeta', 'nomina');
    h.use('movil', 'impresora');
    h.combo('dossier1', 'extracto');
    h.use('dossier', 'agente');
    h.click('ordenador'); h.choose('R-03');
    await h.sleep(20); await h.keypad('3647');
    h.use('solicitudAlq', 'casero');
  },
  // 2. La hipoteca
  async (h) => {
    h.click('mesa'); h.click('caramelos');
    h.combo('boli', 'solicitudHip');
    h.use('solicitudFirmada', 'gestor'); h.close();
    h.click('simulador'); await h.keypad('5320');
    h.use('ofertaVinc', 'director');
  },
  // 3. Libre de cargas
  async (h) => {
    h.click('bolso');
    h.use('dni', 'terminal');
    h.click('terminal'); await h.keypad('4478'); h.close();
    h.click('registradora'); await h.keypad('96250');
  },
  // 4. Firme aquí, aquí y aquí
  async (h) => {
    h.click('recepcion'); h.click('carpeta');
    h.click('b1'); h.click('conyuge');
    h.click('telefono'); await h.keypad('5550147');
    h.use('certSaldo', 'oficial'); h.use('certComunidad', 'oficial'); h.use('reciboIBI', 'oficial');
    h.click('talonario'); await h.keypad('134830');
    h.click('notaria');
    ['B1', 'V', 'C', 'T', 'B2'].forEach((v, i) => h.setValue(`#s3-f${i + 1}`, v));
    h.btn('Que empiece la firma');
    h.click('notaria');
  },
  // 5. Hacienda somos todos
  async (h) => {
    h.click('cartera'); h.click('carpeta');
    h.click('catastro'); await h.keypad('4821103');
    h.click('plusvalia'); h.choose('artículo 3');
    h.use('dni', 'terminal');
    h.click('terminal');
    h.setValue('#s3-m600-base', '241000'); h.setValue('#s3-m600-cuota', '15280'); h.setValue('#s3-m600-plus', '0');
    h.btn('Presentar');
  },
  // 6. El dron del Catastro
  async (h) => {
    h.click('carpeta'); h.click('funcionaria'); h.click('estuche');
    h.combo('cinta', 'plano');
    h.click('terminal');
    h.setValue('#s3-902-ref', '4718'); h.setValue('#s3-902-sup', '60');
    h.btn('Presentar');
  },
  // 7. Junta de vecinos
  async (h) => {
    h.click('buzon');
    h.use('delegacion', 'admin');
    h.click('mesa');
    h.setValue('#s3-j1', 'A'); h.setValue('#s3-j2', 'P'); h.setValue('#s3-j3', 'B');
    h.clickSel('#s3-jgo');
    if (!h.has('acta')) throw new Error('La junta no aprueba la obra: ' + h.$('#s3-jacta').textContent.slice(-200));
    h.close();
    h.use('acta', 'admin');
  },
  // 8. Licencia de obra menor
  async (h) => {
    h.click('carpeta');
    h.use('actaFirmada', 'registro');
    h.click('sede');
    for (const d of ['visita', 'presupuesto', 'memoria', 'icio', 'gestor', 'fianza', 'sacos', 'licencia']) h.clickSel(`#s3-doc-${d}`);
    if (!h.has('licencia')) throw new Error('No se obtiene la licencia: ' + h.$('#s3-tram').textContent.slice(0, 300));
    h.close();
    h.use('licencia', 'albanil');
  },
  // 9. Letra D de «Decente»
  async (h) => {
    h.click('cajon'); h.click('herramientas');
    h.use('mechero', 'ventana'); h.use('destornillador', 'enchufe');
    h.click('portatil');
    h.setValue('#s3-cee-vent', 1); h.setValue('#s3-cee-muro', 0); h.setValue('#s3-cee-cal', 1);
    h.setValue('#s3-cee-ori', 3); h.setValue('#s3-cee-acs', 0);
    h.clickSel('#s3-cee-m2'); h.clickSel('#s3-cee-m6');
    h.btn('Calcular y registrar');
    if (!h.has('certEnergetico')) throw new Error('Certificado no registrado: ' + h.$('#s3-cee-msg').textContent);
    h.use('certEnergetico', 'inspector');
    h.choose('Vestidor');
  },
  // 10. La ITE
  async (h) => {
    h.click('caseta');
    h.use('casco', 'albanil');
    h.use('llaveAndamio', 'andamio');
    h.click('andamio');
    for (const i of [0, 6, 9, 15]) h.clickSel(`#s3-lo-${i}`);
    if (!h.has('certFachada')) throw new Error('La fachada no queda reparada');
    h.close();
    h.click('registro');
    h.clickSel('#s3-ite-C'); h.clickSel('#s3-ite-D');
    h.btn('Registrar');
    h.click('admin'); await h.keypad('7020');
    h.use('certFachada', 'tecnico'); h.use('informeITE', 'tecnico'); h.use('justDerrama', 'tecnico');
    h.use('llaves', 'puerta');
  },
];
