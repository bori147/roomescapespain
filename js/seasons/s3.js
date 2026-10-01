/* ==========================================================
   VUELVA USTED MAÑANA — Temporada 3: «Mi casa es un expediente»
   Sátira. Todos los personajes, bancos, empresas y organismos
   concretos son ficticios.
   ========================================================== */
(function () {
  'use strict';
  const { rand, norm } = window.GameUtils;

  /** 225000 -> «225.000» (sin depender de Intl). */
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const digits = (v) => String(v).replace(/[^\d]/g, '');

  // =========================================================
  //  DATOS DE LOS PUZLES
  // =========================================================

  // ---------- Nivel 1: anuncios de alquiler ----------
  const PISOS = [
    { ref: 'V-02', dir: 'C/ Ventanilla, 2 — Bajo interior', renta: 600, com: 'incluida', planta: 'Bajo', asc: 'No', masc: 'Sí, todas', mult: 3, gar: 1, nota: '«Con encanto». El encanto es una humedad con forma de península.' },
    { ref: 'D-15', dir: 'Av. de la Demora, 15 — 2º', renta: 900, com: '150 €', planta: '2º', asc: 'Sí', masc: 'Sí, todas', mult: 2.5, gar: 0, nota: '«Comunidad con piscina» (la piscina es de la comunidad de al lado).' },
    { ref: 'S-04', dir: 'Pl. del Silencio, 4 — 5º', renta: 700, com: 'incluida', planta: '5º', asc: 'No', masc: 'Sí, todas', mult: 3, gar: 1, nota: '«Ideal para deportistas».' },
    { ref: 'O-09', dir: 'C/ del Olvido, 9 — 1º', renta: 800, com: 'incluida', planta: '1º', asc: 'No', masc: 'Solo perros pequeños', mult: 3, gar: 1, nota: '«Luminoso» (tiene una bombilla).' },
    { ref: 'P-21', dir: 'C/ del Plazo, 21 — 4º', renta: 800, com: '100 €', planta: '4º', asc: 'Sí', masc: 'Sí, todas', mult: 3.5, gar: 0, nota: '«Para perfiles solventes». El casero busca un inquilino que gane más que él.' },
    { ref: 'T-07', dir: 'Callejón del Trámite, 7 — 2º', renta: 700, com: '90 €', planta: '2º', asc: 'No', masc: 'Sí, todas', mult: 3, gar: 3, nota: '«Garantías para la tranquilidad de ambas partes» (sobre todo de una).' },
    { ref: 'R-03', dir: 'Ronda del Sello, 3 — 3º', renta: 700, com: '80 €', planta: '3º', asc: 'Sí', masc: 'Gatos sí, perros no', mult: 3, gar: 2, nota: '«Totalmente reformado» (en 1992).' },
    { ref: 'E-01', dir: 'C/ Mayor del Expediente, 1 — 2º (estudio)', renta: 500, com: 'incluida', planta: '2º', asc: 'No', masc: 'Sí, todas', mult: 4, gar: 6, nota: '«Estudio diáfano»: la cama está en la cocina, que está en el baño.' },
  ];
  const fmtMult = (m) => String(m).replace('.', ',');

  // ---------- Nivel 4: firmantes ----------
  const FIRMANTES = {
    B1: 'Apoderado del banco del vendedor',
    V: 'Don Anselmo (vendedor)',
    C: 'Doña Visitación (cónyuge del vendedor)',
    T: 'Tú (comprador/a)',
    B2: 'Apoderada de tu banco',
    AG: 'Agente de la inmobiliaria',
  };
  const FIRMA_OK = ['B1', 'V', 'C', 'T', 'B2'];

  // ---------- Nivel 6: plano del sótano ----------
  const SOTANO = [
    ['Contadores', 'Pasillo', 'Pasillo', 'Pasillo', 'Pasillo'],
    ['T3871', 'T2290', 'T5174', 'T6602', 'T4718'],
    ['Pasillo', 'Ascensor', 'Caldera', 'T9035', 'Contadores'],
  ];

  // ---------- Nivel 7: junta de propietarios ----------
  const J_OWN = [
    { id: 'tu', name: 'Tú (3ºB), presidente/a', c: 9 },
    { id: 'fondo', name: 'Ladrillo Feliz Capital (2ºA)', c: 12 },
    { id: 'rem', name: 'Doña Remedios (1ºA)', c: 11 },
    { id: 'pel', name: 'Matrimonio Peláez (2ºB), delegado en Doña Remedios', c: 10 },
    { id: 'ful', name: 'Don Fulgencio (1ºB)', c: 11 },
    { id: 'paco', name: 'Bar «El Recurso» (local)', c: 16 },
    { id: 'ber', name: 'Sr. Bermejo (3ºA)', c: 10 },
    { id: 'pura', name: 'Doña Pura (4ºA)', c: 11 },
    { id: 'yer', name: 'Yeray (4ºB), por videollamada', c: 10 },
  ];
  const J_PTS = {
    P: 'Cambiar el portero automático (derrama de 1.800 €)',
    A: 'Pintar el portal (derrama de 3.000 €)',
    B: 'Prohibir las bicicletas en el portal',
    R: 'Obra del 3ºB: cerramiento de la terraza',
  };
  function juntaVote(o, pt, ctx) {
    const { pos, approved, voted, prevRes, deleg } = ctx;
    const ok = (x) => approved.includes(x);
    switch (o) {
      case 'tu': return pt === 'R' ? 'Y' : 'A';
      case 'fondo': return deleg ? (pt === 'R' ? 'Y' : 'A') : null;
      case 'rem': case 'pel':
        if (pt === 'R') return ok('P') ? 'Y' : 'N';
        return pt === 'B' ? 'N' : 'Y';
      case 'ful':
        if (pt === 'P' || pt === 'A') return 'N';
        if (pt === 'B') return 'Y';
        return (ok('P') || ok('A')) ? 'N' : 'Y';
      case 'paco':
        if (ok('B')) return null;
        if (pt === 'B' || pt === 'A') return 'N';
        if (pt === 'R') return ok('A') ? 'N' : 'Y';
        return 'Y';
      case 'ber':
        if (pt === 'R') return voted.includes('B') ? 'Y' : 'N';
        return pt === 'P' ? 'N' : 'Y';
      case 'pura':
        if (pos === 0) return 'N';
        if (pt === 'R') return ok('A') ? 'Y' : 'N';
        return 'Y';
      case 'yer':
        if (pos === 0) return 'A';
        return prevRes ? 'N' : 'Y';
      default: return null;
    }
  }
  function juntaSim(seq, deleg) {
    const approved = []; const voted = []; let prevRes = null; const rows = [];
    seq.forEach((pt, pos) => {
      let yo = 0; let yc = 0; let no = 0; let nc = 0; const votes = [];
      for (const o of J_OWN) {
        const v = juntaVote(o.id, pt, { pos, approved, voted, prevRes, deleg });
        votes.push(v);
        if (v === 'Y') { yo++; yc += o.c; } else if (v === 'N') { no++; nc += o.c; }
      }
      const pass = pt === 'R' ? (yo >= 7 && yc >= 60) : (yo > no && yc > nc);
      rows.push({ pt, votes, yo, yc, no, nc, pass });
      if (pass) approved.push(pt);
      voted.push(pt); prevRes = pass;
    });
    return { ok: approved.includes('R'), rows };
  }

  // ---------- Nivel 8: tramitación de la licencia ----------
  const T8_LIMIT = 24;
  const DOCS8 = [
    { id: 'visita', name: 'Visita técnica del albañil', d: 2, req: () => true },
    { id: 'presupuesto', name: 'Presupuesto detallado de la obra', d: 3, req: (h) => h.visita },
    { id: 'memoria', name: 'Memoria técnica valorada', d: 4, req: (h) => h.presupuesto },
    { id: 'proyecto', name: 'Proyecto visado por el Colegio', d: 20, req: () => true },
    { id: 'nomayor', name: 'Certificado de «no es obra mayor»', d: 5, req: () => true },
    { id: 'patrimonio', name: 'Informe de Patrimonio Histórico', d: 15, req: () => true },
    { id: 'icio', name: 'Autoliquidación del ICIO y de la tasa', d: 1, req: (h) => h.memoria || h.proyecto },
    { id: 'gestor', name: 'Contrato con gestor de residuos', d: 3, req: () => true },
    { id: 'fianza', name: 'Fianza de gestión de residuos', d: 2, req: (h) => h.gestor && (h.memoria || h.proyecto) },
    { id: 'sacos', name: 'Comunicación de uso de sacos de escombro', d: 1, req: (h) => h.presupuesto },
    { id: 'contenedor', name: 'Licencia de vía pública (contenedor)', d: 10, req: (h) => h.licencia },
    { id: 'licencia', name: '🏗️ LICENCIA DE OBRA MENOR', d: 5, req: (h, g) => g.flag('actaOK') && (h.memoria || h.proyecto) && h.icio && h.fianza && (h.sacos || h.contenedor) },
  ];

  // ---------- Nivel 9: certificado energético ----------
  const CEE = {
    vent: { label: 'Ventanas', opts: ['Vidrio simple', 'Doble vidrio', 'Triple vidrio'], pts: [30, 15, 5], real: 1 },
    muro: { label: 'Aislamiento de muros', opts: ['Sin aislamiento', 'Cámara con aislamiento', 'Aislamiento exterior (SATE)'], pts: [35, 15, 5], real: 0 },
    cal: { label: 'Calefacción', opts: ['Caldera de gasoil', 'Caldera de gas convencional', 'Caldera de gas de condensación', 'Aerotermia'], pts: [30, 20, 10, 3], real: 1 },
    ori: { label: 'Orientación del salón', opts: ['Norte', 'Este', 'Sur', 'Oeste'], pts: [15, 10, 5, 10], real: 3 },
    acs: { label: 'Agua caliente', opts: ['Termo eléctrico', 'Con la caldera', 'Solar'], pts: [10, 5, 0], real: 0 },
  };
  const MEJORAS = [
    { id: 'm1', name: 'Cambiar las ventanas a triple vidrio', cost: 6500, set: ['vent', 2] },
    { id: 'm2', name: 'Insuflar aislamiento en la cámara de aire', cost: 2400, set: ['muro', 1] },
    { id: 'm3', name: 'Aislamiento exterior (SATE)', cost: 9000, set: ['muro', 2] },
    { id: 'm4', name: 'Caldera de gas de condensación', cost: 2800, set: ['cal', 2] },
    { id: 'm5', name: 'Aerotermia', cost: 7500, set: ['cal', 3] },
    { id: 'm6', name: 'Conectar el agua caliente a la caldera', cost: 300, set: ['acs', 1] },
    { id: 'm7', name: 'Placas solares para el agua caliente', cost: 3200, set: ['acs', 2] },
    { id: 'm8', name: 'Burletes y cortinas térmicas', cost: 150, set: null },
    { id: 'm9', name: 'Pintar la fachada de blanco «para que rebote el sol»', cost: 1200, set: null },
  ];
  const ceeLetter = (p) => (p <= 20 ? 'A' : p <= 35 ? 'B' : p <= 50 ? 'C' : p <= 65 ? 'D' : p <= 80 ? 'E' : p <= 95 ? 'F' : 'G');

  // ---------- Nivel 10: fachada (cada martillazo agrieta las vecinas) ----------
  const LO_START = [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1];
  const LO_COLS = ['A', 'B', 'C', 'D'];
  const loPress = (st, i) => {
    const r = Math.floor(i / 4); const c = i % 4; const s = st.slice();
    for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr; const cc = c + dc;
      if (rr >= 0 && rr < 4 && cc >= 0 && cc < 4) s[rr * 4 + cc] ^= 1;
    }
    return s;
  };

  // =========================================================
  //  OBJETOS
  // =========================================================
  const NOTA_SIMPLE = `<b>Nota simple — Finca 4478</b> (C/ del Olvido 14, esc. dcha., 3ºB). Titular: <b>Anselmo Prisas Prisas</b>. Fecha de la nota: 1/10/2026.<br>
    <small>Inscr. 3ª (2005): hipoteca, Caja del Ocaso, 120.000 € · Anot. A (03/02/2012): embargo Ayuntamiento, 3.200 € · Inscr. 4ª (2015): cancelación de la hipoteca de la inscr. 3ª · Anot. B (11/06/2019): embargo Agencia Tributaria, 4.400 € · Anot. D (08/01/2020): embargo Gimnasio Siempre Fuerte, 600 € · Nota marginal (05/06/2023): prórroga de la anot. B por 4 años · Inscr. 5ª (2021): hipoteca, Banco Ibérico de Ahorros Perpetuos, 90.000 € · Anot. C (17/10/2023): embargo Comunidad de Propietarios, 1.850 €.<br>
    Las anotaciones de embargo caducan a los 4 años de su fecha, salvo prórroga anotada. Las hipotecas siguen vigentes mientras no se inscriba su cancelación.</small>`;

  const ITEMS = {
    // Nivel 1
    nomina: { emoji: '📃', name: 'Nómina', desc: '<b>Nómina de septiembre.</b> Neto a percibir: <b>2.400 €</b> al mes. Bruto: más. Ilusión: menos.' },
    movil: { emoji: '📱', name: 'Tu móvil', desc: `💬 <b>Tu pareja:</b> «Repaso lo que hablamos: 1) Entre alquiler y comunidad (si no va incluida), <b>máximo 1.000 € al mes</b>. 2) Michi viene con nosotros: <b>tienen que admitir gatos</b>. 3) <b>Bajos no</b>, que Michi se escapa. 4) Si es un <b>tercero o más alto, con ascensor</b>, que tu espalda ya no está para subir la compra. 5) Para la entrada <b>solo tenemos lo que hay en la cuenta</b>, ni un euro más. ¡Suerte! 😘»<br>🏦 <b>App del banco:</b> saldo disponible <b>4.000,00 €</b>. <i>(La agencia lo quiere impreso. En papel. Como en 1995.)</i>` },
    carpeta: { emoji: '📁', name: 'Carpeta azul vacía', desc: 'Una carpeta azul con la etiqueta «DOSSIER DEL INQUILINO PERFECTO». Está vacía, como la nevera de un inquilino perfecto.' },
    extracto: { emoji: '🧾', name: 'Extracto bancario', desc: 'Extracto impreso: saldo disponible <b>4.000,00 €</b>. Es todo lo que tienes. La impresora lo ha sacado con cierto desprecio.' },
    dossier1: { emoji: '📂', name: 'Dossier (a medias)', desc: 'Carpeta con tu nómina. Le falta el extracto bancario para ser un dossier como Dios manda.' },
    dossier: { emoji: '📘', name: 'Dossier del inquilino', desc: 'Dossier completo: nómina y extracto bancario. Lo has grapado con mimo. Es lo más ordenado que has hecho en tu vida.' },
    solicitudAlq: { emoji: '📝', name: 'Solicitud de alquiler', desc: 'Solicitud para el piso <b>R-03</b> (Ronda del Sello, 3), con el pago de entrada calculado. Hay que entregársela al casero.' },
    // Nivel 2
    solicitudHip: { emoji: '📄', name: 'Solicitud de hipoteca', desc: 'Solicitud de financiación en blanco. Siete páginas para pedir dinero y treinta para explicar por qué te lo van a negar. Hay que firmarla.' },
    boli: { emoji: '🖊️', name: 'Bolígrafo del banco', desc: 'Bolígrafo con el logo del Banco Ibérico de Ahorros Perpetuos. Es lo único que el banco regala.' },
    solicitudFirmada: { emoji: '✍️', name: 'Solicitud firmada', desc: 'Tu solicitud de hipoteca, firmada. Has firmado en 14 sitios. En uno decías que renunciabas a algo. No sabes a qué.' },
    fein: { emoji: '📑', name: 'FEIN (tres ofertas)', desc: 'La Ficha Europea de Información Normalizada con las tres ofertas del banco. El gestor te la puede volver a enseñar.' },
    ofertaVinc: { emoji: '📜', name: 'Oferta vinculante', desc: 'Oferta vinculante de la hipoteca variable «Euríbor Feliz» con vida, hogar, Cuenta Premium y tarjeta. Coste del primer año: 5.320 €. Vinculante para ti; para el banco, ya veremos.' },
    // Nivel 3
    dni: { emoji: '🪪', name: 'DNI', desc: 'Tu DNI. <b>Fecha de nacimiento: 20/10/1991.</b> Renovado en la temporada pasada, con sangre, sudor y cita previa.' },
    anuncio: { emoji: '🏷️', name: 'Anuncio del piso', desc: '«SE VENDE precioso <b>3ºB con ascensor</b> en C/ del Olvido, 14. 72 m², trastero, «libre de cargas». 225.000 €. Vendedor: Anselmo Prisas.» (Lo de «libre de cargas» lo ha escrito él.)' },
    notaSimple: { emoji: '📋', name: 'Nota simple (finca 4478)', desc: NOTA_SIMPLE },
    certCargas: { emoji: '📜', name: 'Certificación de cargas', desc: 'Certificación registral: cargas vigentes de la finca 4478 por un total de 96.250 €.' },
    // Nivel 4
    arras: { emoji: '🤝', name: 'Contrato de arras', desc: '<b>Contrato de arras penitenciales.</b> Precio de la vivienda: <b>225.000 €</b>. Entregados en concepto de arras: <b>22.500 €</b> (el 10 %). Si te echas atrás, los pierdes. Si se echa atrás él, te devuelve el doble. Él no se va a echar atrás.' },
    borrador: { emoji: '📄', name: 'Borrador de la escritura', desc: `<b>Borrador de escritura de compraventa.</b> Comparecen: el vendedor, su cónyuge, el comprador, y los apoderados de los dos bancos. <i>(Nadie más.)</i><br>
      <b>Precio:</b> 225.000 €. <b>Forma de pago:</b> del precio se descuentan (1) las arras ya entregadas; (2) el <b>saldo pendiente real</b> de la hipoteca que grava la finca, que se paga con cheque al banco acreedor según su certificado (no el importe inscrito en el Registro); y (3) el importe de los <b>embargos vigentes</b> según la nota simple, que se retiene para pagarlos. El resto se entrega al vendedor en cheque bancario.` },
    certSaldo: { emoji: '🏦', name: 'Certificado de saldo pendiente', desc: 'Certificado del banco del vendedor: saldo pendiente real de su hipoteca a día de hoy: <b>61.420 €</b>. (Lo inscrito eran 90.000 €, pero el señor Anselmo ha ido pagando. Algo.)' },
    certComunidad: { emoji: '🏢', name: 'Certificado de la comunidad', desc: 'Certificado del administrador: el 3ºB debe <b>1.850 €</b> de cuotas (los mismos del embargo). «Estar al corriente» es un concepto que el señor Anselmo desconoce.' },
    reciboIBI: { emoji: '🧾', name: 'Recibo del IBI', desc: 'Último recibo del IBI del 3ºB. Pagado. Milagrosamente.' },
    cheque: { emoji: '💶', name: 'Cheque al vendedor', desc: 'Cheque bancario a favor de Anselmo Prisas por <b>134.830 €</b>. Nunca habías tenido tantos euros en la mano. Y tampoco ahora: son del señor Anselmo.' },
    // Nivel 5
    escritura: { emoji: '📘', name: 'Copia de la escritura', desc: '<b>Escritura de compraventa</b>, firmada el <b>15 de octubre de 2026</b>. Vivienda 3ºB, esc. dcha., C/ del Olvido 14. Precio: <b>225.000 €</b>. Superficie construida: <b>72 m²</b>. Destino: vivienda habitual.' },
    reciboIBI5: { emoji: '🧾', name: 'Recibo del IBI', desc: 'Recibo del IBI. Referencia catastral (versión corta): <b>4821103</b>. La versión larga tiene 20 caracteres y no cabe en ningún formulario.' },
    certVR: { emoji: '📊', name: 'Certificado de valor de referencia', desc: 'Certificado del Catastro: valor de referencia de tu vivienda: <b>241.000 €</b>. Más de lo que pagaste. El Catastro tiene mucha fe en tu barrio.' },
    noSujecion: { emoji: '✅', name: 'Diligencia de no sujeción', desc: 'Diligencia de la ventanilla de plusvalía: «el comprador no es sujeto pasivo en esta compraventa». Firmada a regañadientes.' },
    // Nivel 6
    escritura6: { emoji: '📘', name: 'Escritura (trastero)', desc: 'Escritura del 3ºB. <b>Anejo: trastero en planta sótano</b>, que linda: al <b>Norte</b>, con el cuarto de contadores; al <b>Sur</b>, con el pasillo; al <b>Este</b>, con otro trastero; y al <b>Oeste</b>, con el muro de fachada.' },
    notificacion: { emoji: '✉️', name: 'Notificación del Catastro', desc: '«Mediante dron, este Centro ha detectado que su vivienda mide <b>96 m²</b> y que su trastero es el <b>3871</b>. Si no está conforme, presente el modelo 902 con la referencia correcta de su trastero y la superficie útil real.» El trastero 3871 es del vecino. Y lo de los 96 m², de los sueños del dron.' },
    cinta: { emoji: '📏', name: 'Cinta métrica', desc: 'Cinta métrica de 5 metros. Combínala con algo que haya que medir.' },
    plano: { emoji: '🗺️', name: 'Plano de tu vivienda (sin cotas)', desc: 'El plano de tu piso que tiene el Catastro: dibujado a mano, sin una sola medida. Con una cinta métrica lo arreglas.' },
    planoAcotado: { emoji: '📐', name: 'Plano acotado', desc: `<b>Tu piso, medido por ti:</b> Salón 5,00 × 4,00 · Dormitorio 4,00 × 3,50 · Cocina 3,00 × 2,50 · Baño 2,50 × 2,00 · Pasillo 5,00 × 1,10 · Cuarto interior (sin ventana) 2,50 × 2,00 · Terraza cubierta 4,00 × 1,50 · Patio de luces (el Catastro lo cuenta como tuyo) 4,00 × 4,00 · Altillo (altura libre 1,20 m) 3,00 × 2,00. <small>(metros)</small>` },
    // Nivel 7
    delegacion: { emoji: '✉️', name: 'Delegación de voto', desc: '«Ladrillo Feliz Capital, propietaria del 2ºA, delega su voto en <b>el/la presidente/a</b> de la comunidad, que votará lo mismo que vote él/ella.» Firmado: un fondo con sede en un buzón de otro país.' },
    acta: { emoji: '📜', name: 'Acta de la junta', desc: 'Acta de la junta: <b>aprobada la obra del 3ºB</b> (cerramiento de terraza). Falta la firma del administrador.' },
    // Nivel 8
    actaFirmada: { emoji: '📜', name: 'Acta de la junta (firmada)', desc: 'El acta de la junta, firmada por el administrador. Autoriza tu obra. Te costó tres puntos del orden del día y una vecina enfadada.' },
    licencia: { emoji: '🏗️', name: 'Licencia de obra menor', desc: 'LICENCIA DE OBRA MENOR. Concedida. Horario de obra: de lunes a viernes de 9:00 a 14:00, salvo agosto, fiestas patronales, y cuando el vecino de abajo esté de siesta.' },
    // Nivel 9
    mechero: { emoji: '🔥', name: 'Mechero', desc: 'Un mechero de la cocina. Para encender los fuegos... o para cierto truco de técnico certificador.' },
    destornillador: { emoji: '🪛', name: 'Destornillador', desc: 'Destornillador plano. Sirve para quitar tapas. Y para comprobar lo que hay detrás de ellas.' },
    certEnergetico: { emoji: '🟩', name: 'Certificado energético (D)', desc: 'Certificado de eficiencia energética: letra <b>D</b> (65 puntos) tras las mejoras previstas. Ni verde ni rojo: amarillito. Como el BOE.' },
    // Nivel 10
    casco: { emoji: '⛑️', name: 'Casco de obra', desc: 'Un casco blanco de obra. Te queda grande, pero te da un aire de autoridad.' },
    llaveAndamio: { emoji: '🔑', name: 'Llave del andamio', desc: 'La llave del candado del andamio. Lleva un llavero de «Reformas Tomás: si no hay grietas, las hacemos».' },
    certFachada: { emoji: '🧱', name: 'Certificado de reparación', desc: 'Certificado de reparación de la fachada: cero grietas. Por primera vez desde 1974.' },
    informeITE: { emoji: '📗', name: 'Informe de ITE válido', desc: 'Informes de ITE de Carmen Cimiento y Diego Dintel, registrados. Los únicos veraces.' },
    justDerrama: { emoji: '💸', name: 'Justificante de la derrama', desc: 'Justificante de pago de tu parte de la derrama: 7.020 €. Te ha dolido más que la hipoteca.' },
    llaves: { emoji: '🗝️', name: 'Llaves de casa', desc: 'Las llaves de TU casa. Tres llaves, un mando del garaje (no tienes garaje) y un llavero con forma de expediente.' },
  };

  // =========================================================
  //  MODALES ESPECÍFICOS
  // =========================================================

  // ---- Nivel 1: tablón de pisos ----
  function pisosDoc(g) {
    g.doc('🏘️ Pisos en alquiler — Inmobiliaria «Pisos Ya (o Nunca)»', `<table class="tbl s3-tbl">
      <tr><th>Ref.</th><th>Dirección</th><th>Renta</th><th>Comunidad</th><th>Ascensor</th><th>Mascotas</th><th>Ingresos exigidos</th><th>Garantía adicional</th></tr>
      ${PISOS.map((p) => `<tr><td><b>${p.ref}</b></td><td>${p.dir}<br><i class="tiny">${p.nota}</i></td><td>${p.renta} €</td><td>${p.com}</td><td>${p.asc}</td><td>${p.masc}</td><td>${fmtMult(p.mult)} × renta</td><td>${p.gar === 0 ? 'ninguna' : `${p.gar} mes${p.gar > 1 ? 'es' : ''}`}</td></tr>`).join('')}
      </table><p class="small">Todos los precios son mensuales. Fotos hechas con gran angular de 360°.</p>`);
  }

  function ordenadorL1(g) {
    g.choice({
      title: '💻 Ordenador de la agencia — Nueva solicitud',
      text: 'Borja gira la pantalla hacia ti: —Elija piso. Solo uno. Si el casero lo rechaza, su dossier va a la papelera... digo, al archivo.',
      options: PISOS.map((p) => ({
        label: `${p.ref} · ${p.dir}`,
        onPick(gg, msg) {
          if (p.ref !== 'R-03') {
            gg.sfx('bad');
            msg(rand([
              '—Uy, con ese no le sale. O no cumple usted, o no le cumple a usted. Repase sus condiciones y las del anuncio.',
              '—El sistema de «scoring» lo ha rechazado. No me pregunte por qué: el sistema no da explicaciones. Como el casero.',
              '—Ese no. Le aseguro que no. Revise bien todo, que aquí no se devuelve nada.',
            ]), true);
            return false;
          }
          setTimeout(() => gg.input({
            title: '💶 Pago a la firma — R-03',
            text: '—Muy bien. Ahora dígame cuánto tendrá que pagar <b>el día de la firma</b>, en euros, sin decimales. Según nuestras condiciones. Si lo calcula mal, no hay contrato.',
            numeric: true, maxLen: 5,
            check: (v) => +v === 3647,
            failText: (v) => (+v === 2800 ? '—Se olvida usted de los gastos de gestión. Que no son honorarios. Son gastos. De gestión.' : +v === 3500 ? '—Casi. Los gastos de gestión llevan IVA. Como todo lo bueno.' : '—No cuadra. Lea bien las condiciones de la agencia: mensualidad, fianza, garantía y gestión.'),
            ok: () => {
              gg.give('solicitudAlq');
              gg.say('—3.647 €. Correcto. Aquí tiene la solicitud para el R-03. Désela al propietario, que está ahí mismo mirando a los candidatos como quien elige melones.', 'Borja (agente)');
            },
          }), 0);
          return true;
        },
      })),
    });
  }

  // ---- Nivel 2: documentos del banco ----
  function feinDoc(g) {
    g.doc('📑 FEIN — Ficha Europea de Información Normalizada', `<p>Capital solicitado: <b>180.000 €</b>. Plazo: 30 años. Cliente: tú (de momento).</p>
      <p><b>Opción 1 — Hipoteca Fija «Tranquilidad».</b> TIN: <b>3,30 %</b>. Sin comisión de apertura.<br>
      Bonificaciones opcionales (cada producto contratado resta al TIN): seguro de vida −0,25 · seguro de hogar −0,20 · Cuenta Nómina Premium −0,15 · tarjeta de crédito −0,10 · alarma −0,10.</p>
      <p><b>Opción 2 — Hipoteca Variable «Euríbor Feliz».</b> TIN: <b>Euríbor + 0,60 %</b>. Comisión de apertura: <b>0,25 % del capital</b>.<br>
      Bonificaciones opcionales: seguro de vida −0,40 · seguro de hogar −0,15 · Cuenta Nómina Premium −0,20 · tarjeta de crédito −0,05 · seguro de protección de pagos −0,20.</p>
      <p><b>Opción 3 — Hipoteca Mixta «Ni Fu Ni Fa».</b> TIN: <b>2,10 %</b> (¡el más bajo!). Comisión de apertura: <b>1.000 €</b>.<br>
      Productos <b>obligatorios</b> (no bonifican): seguro de vida, seguro de hogar y alarma. Bonificaciones opcionales: Cuenta Nómina Premium −0,10 · tarjeta de crédito −0,10 · protección de pagos −0,10.</p>
      <p class="tiny">Puntos porcentuales. El precio de los productos figura en el folleto comercial. La FEIN no es vinculante; la oferta vinculante, tampoco mucho.</p>`);
  }

  // ---- Nivel 4: mesa de firmas ----
  function firmaModal(g) {
    const opts = (sel) => ['<option value="">— elige —</option>', ...Object.entries(FIRMANTES).map(([k, n]) => `<option value="${k}" ${sel === k ? 'selected' : ''}>${n}</option>`)].join('');
    g.modal({
      title: '✒️ Orden de firma de la escritura',
      html: `<p class="small">La notaria lo deja en tus manos: —Usted ha hablado con todos. Dígame en qué orden firman los <b>otorgantes</b>. Yo firmo la última, como siempre.</p>
        ${[1, 2, 3, 4, 5].map((i) => `<label class="field">${i}.º en firmar <select id="s3-f${i}">${opts('')}</select></label>`).join('')}
        <div class="msg" id="s3-fmsg"></div>`,
      buttons: [{ label: 'Cancelar' }, { label: '✒️ Que empiece la firma', cls: 'primary', onClick(close, body) {
        const seq = [1, 2, 3, 4, 5].map((i) => body.querySelector(`#s3-f${i}`).value);
        const m = body.querySelector('#s3-fmsg');
        const bad = (t) => { g.sfx('bad'); m.className = 'msg bad'; m.innerHTML = t; return false; };
        if (seq.some((x) => !x) || new Set(seq).size !== 5) return bad('Faltan firmantes o hay alguien repetido. Firmar dos veces no vale doble.');
        if (seq.includes('AG')) return bad('La notaria levanta una ceja: —La agente inmobiliaria no comparece en esta escritura. Ella cobra, pero no firma. Lea el borrador.');
        if (seq.join() !== FIRMA_OK.join()) {
          return bad(rand([
            'A mitad de la firma alguien se levanta indignado: «¡Así no firmo!». Se rompe un bolígrafo de 400 €. Vuelta a empezar.',
            'Doña Visitación se cruza de brazos. El apoderado mira el reloj. La notaria suspira. Ese orden no contenta a todos.',
            'Alguien protesta: ese orden incumple sus condiciones. La notaria guarda el bolígrafo bueno.',
          ]));
        }
        g.set('firmado');
        g.say('Firman todos, uno detrás de otro, sin un solo grito. La notaria estampa su firma la última y lee en voz alta las 47 páginas. Nadie escucha nada. Es precioso.', 'Notaria');
        return true;
      } }],
    });
  }

  // ---- Nivel 5: modelo 600 ----
  function m600Modal(g) {
    g.modal({
      title: '🖥️ Modelo 600 — Transmisiones Patrimoniales',
      html: `<div class="doc-body s3-form">
        <p class="small">Autoliquidación del comprador. Importes en euros, sin decimales ni puntos.</p>
        <label class="field">Casilla 1 · Base imponible <input id="s3-m600-base" inputmode="numeric" autocomplete="off"></label>
        <label class="field">Casilla 2 · Cuota de ITP a ingresar <input id="s3-m600-cuota" inputmode="numeric" autocomplete="off"></label>
        <label class="field">Casilla 3 · Plusvalía municipal a cargo del comprador <input id="s3-m600-plus" inputmode="numeric" autocomplete="off"></label>
        <div class="msg" id="s3-m600-msg"></div></div>`,
      buttons: [{ label: 'Cancelar' }, { label: '📨 Presentar', cls: 'primary', onClick(close, body) {
        const v = ['base', 'cuota', 'plus'].map((k) => digits(body.querySelector(`#s3-m600-${k}`).value));
        const want = ['241000', '15280', '0'];
        const wrong = v.filter((x, i) => x === '' || +x !== +want[i]).length;
        const m = body.querySelector('#s3-m600-msg');
        if (wrong) {
          g.sfx('bad'); m.className = 'msg bad';
          m.innerHTML = `Liquidación rechazada: ${wrong === 1 ? 'una casilla no cuadra' : `${wrong} casillas no cuadran`}. ${rand(['Revise base, tipos y reducciones.', 'Hacienda no se equivoca. Usted, sí.', 'Le recordamos que el error puede acarrear recargo, sanción y mirada de desaprobación.'])}`;
          return false;
        }
        g.say('«Autoliquidación presentada: 15.280 € de ITP.» Lo pagas con los ahorros de la entrada que ya no tienes y un préstamo de tu madre. Y la plusvalía, que la pague quien tiene que pagarla.', 'Agencia Tributaria autonómica');
        g.win();
        return true;
      } }],
    });
  }

  // ---- Nivel 6: plano del sótano y modelo 902 ----
  function sotanoModal(g) {
    const cell = (t) => {
      if (t[0] === 'T') return `<div class="s3-cell s3-tr">Trastero<br><b>${t.slice(1)}</b></div>`;
      const cls = { Pasillo: 's3-pas', Contadores: 's3-cont', Ascensor: 's3-asc', Caldera: 's3-cal' }[t];
      return `<div class="s3-cell ${cls}">${t}</div>`;
    };
    g.modal({
      title: '🗺️ Plano catastral — Planta sótano, C/ del Olvido 14',
      cls: 'wide',
      html: `<div class="s3-plan-wrap">
        <div class="s3-fach">muro de<br>fachada</div>
        <div class="s3-plan">${SOTANO.map((row) => row.map(cell).join('')).join('')}</div>
        <div class="s3-fach">muro de<br>fachada</div>
        <div class="s3-rose"><span>▼</span><b>N</b><small>La flecha señala el NORTE</small></div>
      </div>
      <p class="small">Los trasteros figuran con su referencia catastral. Plano elaborado por dron. El dron, según el piloto, «a veces vuela un poco del revés».</p>`,
    });
  }
  function m902Modal(g) {
    g.modal({
      title: '📝 Modelo 902 — Declaración de alteración catastral',
      html: `<div class="doc-body s3-form">
        <label class="field">Referencia catastral de su trastero (4 cifras) <input id="s3-902-ref" inputmode="numeric" autocomplete="off"></label>
        <label class="field">Superficie útil real de la vivienda (m²) <input id="s3-902-sup" inputmode="decimal" autocomplete="off"></label>
        <div class="msg" id="s3-902-msg"></div></div>`,
      buttons: [{ label: 'Cancelar' }, { label: '📨 Presentar', cls: 'primary', onClick(close, body) {
        const ref = digits(body.querySelector('#s3-902-ref').value);
        const sup = parseFloat(String(body.querySelector('#s3-902-sup').value).replace(',', '.'));
        const m = body.querySelector('#s3-902-msg');
        const bad = (t) => { g.sfx('bad'); m.className = 'msg bad'; m.innerHTML = t; return false; };
        if (ref === '3871') return bad('—El 3871 es el que le asignó el dron. Si fuera ese, no estaría usted aquí. Mire bien hacia dónde apunta el norte.');
        if (ref !== '4718') return bad('—Ese trastero no encaja con los linderos de su escritura.');
        if (sup === 96) return bad('—96 m² es lo que dice el dron. Usted venía a llevarle la contraria.');
        if (sup !== 60) return bad('—Esa superficie no cuadra con las normas de medición. ¿Qué computa y qué no?');
        g.say('—Trastero 4718 y 60 m² útiles. Correcto. Se rectifica el Catastro... lo que, por cierto, actualiza su valor catastral. Al alza. Ya le llegará el IBI nuevo. De nada.', 'Funcionaria del Catastro');
        g.win();
        return true;
      } }],
    });
  }

  // ---- Nivel 7: orden del día de la junta ----
  function juntaModal(g) {
    const sel = (i) => `<select id="s3-j${i}"><option value="">— (sin punto) —</option>${['P', 'A', 'B'].map((k) => `<option value="${k}">${J_PTS[k]}</option>`).join('')}</select>`;
    g.modal({
      title: '🔔 Junta de propietarios — Orden del día',
      cls: 'wide',
      html: `<p class="small">Como presidente/a, decides qué puntos se votan antes y en qué orden. Tu obra va siempre en el último punto, por estatutos.</p>
        <label class="field">Punto 1 ${sel(1)}</label><label class="field">Punto 2 ${sel(2)}</label><label class="field">Punto 3 ${sel(3)}</label>
        <p><b>Último punto:</b> ${J_PTS.R}</p>
        <div class="row-btns"><button class="btn primary" id="s3-jgo">🔔 Celebrar la junta</button></div>
        <div id="s3-jacta"></div>`,
      onMount(body) {
        body.querySelector('#s3-jgo').onclick = () => {
          const out = body.querySelector('#s3-jacta');
          const pts = [1, 2, 3].map((i) => body.querySelector(`#s3-j${i}`).value).filter(Boolean);
          if (new Set(pts).size !== pts.length) { g.sfx('bad'); out.innerHTML = '<div class="msg bad">No se puede votar dos veces lo mismo en la misma junta. (En la siguiente, sí: es tradición.)</div>'; return; }
          const seq = [...pts, 'R'];
          const r = juntaSim(seq, !!g.flag('deleg'));
          const sym = { Y: '✅ sí', N: '❌ no', A: '➖ abst.', null: '🚪 ausente' };
          out.innerHTML = `<div class="paper-note s3-acta"><b>ACTA DE LA JUNTA</b>${r.rows.map((row, i) => `
            <p><b>Punto ${i + 1}: ${J_PTS[row.pt]}</b></p>
            <table class="tbl s3-tbl">${J_OWN.map((o, k) => `<tr><td>${o.name} (${o.c} %)</td><td>${sym[row.votes[k]]}</td></tr>`).join('')}</table>
            <p class="small">Sí: ${row.yo} propietarios / ${row.yc} % · No: ${row.no} propietarios / ${row.nc} % → <b>${row.pass ? 'APROBADO' : 'RECHAZADO'}</b></p>`).join('')}</div>`;
          if (r.ok) {
            g.give('acta');
            g.sfx('ok');
            out.insertAdjacentHTML('beforeend', '<div class="msg good">¡Tu obra queda aprobada! Ahora el administrador tiene que firmar el acta.</div>');
          } else {
            g.sfx('bad');
            out.insertAdjacentHTML('beforeend', '<div class="msg bad">Tu obra no sale. Se convoca otra junta «en segunda convocatoria», media hora después. Los vecinos ya están sacando las pipas.</div>');
          }
        };
      },
    });
  }

  // ---- Nivel 8: tramitación ----
  function tramModal(g) {
    g.modal({
      title: '🏛️ Sede de Urbanismo — Mi expediente',
      cls: 'wide',
      html: '<div id="s3-tram"></div>',
      onMount(body) {
        const box = body.querySelector('#s3-tram');
        const st = () => g.flag('tram') || { have: {}, days: 0, dead: false };
        const render = (msg, bad) => {
          const s = st();
          box.innerHTML = `<div class="lcd">Día hábil ${s.days} de ${T8_LIMIT} · El albañil empieza el día ${T8_LIMIT}</div>
            <p class="small">Solo se tramita un documento a la vez. Cada solicitud tarda lo que indica; si la deniegan por falta de documentación, pierde usted <b>1 día</b> (y no le dirán qué falta).</p>
            <div class="s3-docs">${DOCS8.map((d) => `<button class="opt ${s.have[d.id] ? 'on' : ''}" id="s3-doc-${d.id}" ${s.dead ? 'disabled' : ''}>${s.have[d.id] ? '✔ ' : ''}${d.name}<br><span class="tiny">${d.d} día${d.d > 1 ? 's' : ''}</span></button>`).join('')}</div>
            <div class="msg ${bad ? 'bad' : 'good'}">${msg || ''}</div>
            <div class="row-btns"><button class="btn" id="s3-tram-reset">🔄 Desistir y empezar de nuevo</button></div>`;
          box.querySelector('#s3-tram-reset').onclick = () => { g.set('tram', { have: {}, days: 0, dead: false }); g.sfx('click'); render('Expediente archivado. Empieza de cero. El albañil, paciente, vuelve a contar.'); };
          DOCS8.forEach((d) => {
            box.querySelector(`#s3-doc-${d.id}`).onclick = () => {
              const s2 = st();
              if (s2.dead || s2.have[d.id]) return;
              if (!d.req(s2.have, g)) {
                s2.days += 1; g.sfx('bad');
                const dead = s2.days > T8_LIMIT; s2.dead = dead; g.set('tram', s2);
                return render(dead ? `Solicitud denegada... y se acabó el plazo (día ${s2.days}). El albañil se ha ido a otra obra hasta 2028. Desista y empiece de nuevo.` : `«${d.name}»: SOLICITUD DENEGADA. Falta documentación. Cuál, no se lo podemos decir: protección de datos.`, true);
              }
              s2.days += d.d; s2.have[d.id] = true;
              if (s2.days > T8_LIMIT) {
                s2.dead = true; g.set('tram', s2); g.sfx('bad');
                return render(`Concedido «${d.name}», pero ya es el día ${s2.days}. El albañil se ha ido a otra obra hasta 2028. Desista y empiece de nuevo.`, true);
              }
              g.set('tram', s2); g.sfx('ok');
              if (d.id === 'licencia') {
                g.give('licencia');
                return render(`🎉 ¡LICENCIA CONCEDIDA el día ${s2.days}! Corre a dársela al albañil antes de que cambie de opinión.`);
              }
              return render(`Concedido: «${d.name}».`);
            };
          });
        };
        render();
      },
    });
  }

  // ---- Nivel 9: certificado energético ----
  function ceeModal(g) {
    const sel = (k) => `<label class="field">${CEE[k].label} <select id="s3-cee-${k}"><option value="">— elige —</option>${CEE[k].opts.map((o, i) => `<option value="${i}">${o}</option>`).join('')}</select></label>`;
    g.modal({
      title: '💻 Registro de certificados energéticos',
      cls: 'wide',
      html: `<div class="s3-form">
        <p class="small"><b>1. Estado actual de la vivienda</b> (tal y como está hoy).</p>
        ${Object.keys(CEE).map(sel).join('')}
        <p class="small"><b>2. Mejoras que te comprometes a hacer</b> (con tu dinero).</p>
        ${MEJORAS.map((m) => `<label class="chk"><input type="checkbox" id="s3-cee-${m.id}"> ${m.name} — <b>${fmt(m.cost)} €</b></label>`).join('<br>')}
        <div class="msg" id="s3-cee-msg"></div></div>`,
      buttons: [{ label: 'Cancelar' }, { label: '📨 Calcular y registrar', cls: 'primary', onClick(close, body) {
        const m = body.querySelector('#s3-cee-msg');
        const bad = (t) => { g.sfx('bad'); m.className = 'msg bad'; m.innerHTML = t; return false; };
        const cur = {};
        for (const k of Object.keys(CEE)) {
          const v = body.querySelector(`#s3-cee-${k}`).value;
          if (v === '') return bad('Rellene todas las casillas del estado actual.');
          cur[k] = +v;
        }
        if (Object.keys(CEE).some((k) => cur[k] !== CEE[k].real)) return bad('El inspector compara tus datos con la vivienda y frunce el ceño: el estado actual declarado no coincide con la realidad. Revisa ventanas, muros, calefacción, orientación y agua caliente.');
        const base = Object.keys(CEE).reduce((a, k) => a + CEE[k].pts[cur[k]], 0);
        let cost = 0;
        for (const mj of MEJORAS) {
          if (!body.querySelector(`#s3-cee-${mj.id}`).checked) continue;
          cost += mj.cost;
          if (mj.set) cur[mj.set[0]] = Math.max(cur[mj.set[0]], mj.set[1]);
        }
        const pts = Object.keys(CEE).reduce((a, k) => a + CEE[k].pts[cur[k]], 0);
        const L = ceeLetter(pts);
        if (cost > 3000) return bad(`Estado actual: ${base} puntos (${ceeLetter(base)}). Con esas mejoras: ${pts} puntos (${L})... pero cuestan ${fmt(cost)} € y tu saldo es de 3.000 €. El banco ya no te presta ni el bolígrafo.`);
        if (pts > 65) return bad(`Estado actual: ${base} puntos (${ceeLetter(base)}). Con esas mejoras: ${pts} puntos → letra <b>${L}</b>. Insuficiente: para la cédula hace falta una D o mejor.`);
        g.give('certEnergetico');
        g.say(`Estado actual: ${base} puntos (letra ${ceeLetter(base)}). Con las mejoras: ${pts} puntos → letra <b>${L}</b>. Certificado registrado. Ahora, al inspector de la cédula.`, 'Registro de certificados');
        return true;
      } }],
    });
  }

  // ---- Nivel 10: fachada ----
  function fachadaModal(g) {
    g.modal({
      title: '🧱 Fachada desde el andamio',
      html: `<p class="small">Cada martillazo repara una pieza agrietada... o agrieta una sana. Y la vibración hace lo mismo con las piezas de <b>arriba, abajo, izquierda y derecha</b>. Deja la fachada sin una sola grieta.</p>
        <div id="s3-lo"></div>
        <div class="row-btns"><button class="btn" id="s3-lo-reset">🔄 Empezar de nuevo (el seguro lo cubre)</button></div>
        <div class="msg" id="s3-lo-msg"></div>`,
      onMount(body) {
        const box = body.querySelector('#s3-lo');
        const render = () => {
          const st = g.flag('lo') || LO_START.slice();
          const done = st.every((x) => !x);
          box.innerHTML = `<div class="s3-lo-grid"><span></span>${LO_COLS.map((c) => `<span class="s3-lo-h">${c}</span>`).join('')}
            ${[0, 1, 2, 3].map((r) => `<span class="s3-lo-h">${r + 1}</span>${[0, 1, 2, 3].map((c) => { const i = r * 4 + c; return `<button class="tile ${st[i] ? 'on' : ''}" id="s3-lo-${i}" title="${LO_COLS[c]}${r + 1}">${st[i] ? '⚡' : ''}</button>`; }).join('')}`).join('')}</div>`;
          box.querySelectorAll('.tile').forEach((b) => {
            b.onclick = () => {
              if (g.has('certFachada')) return;
              const i = +b.id.split('-').pop();
              const ns = loPress(g.flag('lo') || LO_START.slice(), i);
              g.set('lo', ns); g.sfx('click'); render();
              if (ns.every((x) => !x)) {
                g.give('certFachada'); g.sfx('ok');
                const m = body.querySelector('#s3-lo-msg'); m.className = 'msg good';
                m.innerHTML = '✔ ¡Fachada sin grietas! Tomás te firma el certificado de reparación con el lápiz de la oreja.';
              }
            };
          });
          if (done && g.has('certFachada')) { const m = body.querySelector('#s3-lo-msg'); m.className = 'msg good'; m.textContent = 'La fachada está perfecta. No la toques, que se rompe.'; }
        };
        body.querySelector('#s3-lo-reset').onclick = () => { if (g.has('certFachada')) return; g.set('lo', LO_START.slice()); g.sfx('click'); render(); };
        render();
      },
    });
  }

  function informesDoc(g) {
    g.doc('📌 Informes de ITE (tablón del portal)', `<p>El Ayuntamiento ha recibido <b>cuatro</b> informes de ITE del edificio. Cada técnico, o dice <b>siempre</b> la verdad, o miente en <b>todo</b> su informe (afirmación y presupuesto incluidos).</p>
      <ul>
        <li><b>A — Arq. Adela Andamio:</b> «De los cuatro, solo uno dice la verdad.» Presupuesto: fachada 12.000 €; la cubierta no necesita nada.</li>
        <li><b>B — Arq. Bruno Bóveda:</b> «Adela Andamio y Carmen Cimiento mienten.» Presupuesto: 150.000 € (incluye jacuzzi comunitario en la azotea).</li>
        <li><b>C — Arq. Carmen Cimiento:</b> «El informe de Diego Dintel dice la verdad.» Presupuesto: reparación de la fachada, <b>48.000 €</b>.</li>
        <li><b>D — Arq. Diego Dintel:</b> «De Adela Andamio y Bruno Bóveda, al menos uno miente.» Presupuesto: impermeabilización de la cubierta, <b>25.200 €</b>.</li>
      </ul>
      <p class="small">Solo se admiten los informes veraces. La obra total es la suma de lo que presupuesten los informes veraces.</p>`);
  }

  function registroITEModal(g) {
    g.modal({
      title: '🗃️ Registro municipal de ITE',
      html: `<p class="small">Marca los informes que presentas como veraces. Si cuelas uno falso o te dejas uno veraz, se rechaza todo (y te miran mal).</p>
        ${['A — Adela Andamio', 'B — Bruno Bóveda', 'C — Carmen Cimiento', 'D — Diego Dintel'].map((n, i) => `<label class="chk"><input type="checkbox" id="s3-ite-${'ABCD'[i]}"> ${n}</label>`).join('<br>')}
        <div class="msg" id="s3-ite-msg"></div>`,
      buttons: [{ label: 'Cancelar' }, { label: '📨 Registrar', cls: 'primary', onClick(close, body) {
        const v = [...'ABCD'].filter((k) => body.querySelector(`#s3-ite-${k}`).checked).join('');
        if (v !== 'CD') {
          g.sfx('bad');
          const m = body.querySelector('#s3-ite-msg'); m.className = 'msg bad';
          m.innerHTML = 'REGISTRO RECHAZADO: la selección contiene algún informe falso o le falta alguno veraz. Los técnicos mentirosos sonríen.';
          return false;
        }
        g.give('informeITE');
        g.say('Registrados los informes de Carmen Cimiento y Diego Dintel. Fachada: 48.000 €. Cubierta: 25.200 €. El jacuzzi comunitario queda, oficialmente, descartado.', 'Registro de ITE');
        return true;
      } }],
    });
  }

  // =========================================================
  //  NIVELES
  // =========================================================
  const LEVELS = [
    // ------------------------------------------------------ 1
    {
      title: 'Se alquila (con condiciones)',
      place: 'Inmobiliaria «Pisos Ya (o Nunca)»',
      stars: 2,
      intro: 'Necesitas un piso. Tú, tu pareja y Michi, el gato. En la inmobiliaria hay 47 candidatos por anuncio, y el casero elige como quien elige melones.<br><br>Los pisos tienen sus requisitos, tu pareja tiene los suyos y tu cuenta corriente tiene los de la física.<br><br><b>Objetivo:</b> prepara un dossier impecable, elige el único piso que os vale a todos, calcula lo que pagarás el día de la firma y entrega la solicitud al casero.',
      outro: 'El casero acepta tu solicitud... para dentro de dos años, cuando acabe la lista de espera. Mientras tanto, haces cuentas: lo que te piden de alquiler cada mes es más que una cuota de hipoteca. Rumbo al banco.',
      scene: { wall: '#e6dfcf', floor: '#9c8a74', floorH: 32, pattern: 'wood' },
      decor: [
        { kind: 'board', l: 9, t: 12, w: 22, h: 22 },
        { kind: 'window', l: 68, t: 8, w: 13, h: 26 },
        { kind: 'counter', l: 54, t: 56, w: 30, h: 9 },
        { kind: 'shelf', l: 36, t: 32, w: 12, h: 2 },
        { kind: 'rug', l: 20, t: 74, w: 22, h: 12, color: '#6b8f71' },
        { emoji: '🧍', x: 24, y: 78, s: 4, o: 0.85 }, { emoji: '🧍‍♀️', x: 35, y: 77, s: 4, o: 0.85 },
      ],
      hotspots: [
        { id: 'tablon', x: 20, y: 22, sign: 'PISOS EN ALQUILER', sub: '🏘️', w: 15, label: 'Tablón de anuncios', look: pisosDoc },
        { id: 'condiciones', x: 20, y: 44, sign: 'CONDICIONES', sub: '📜', w: 12, label: 'Condiciones de la agencia',
          look(g) {
            g.doc('📜 Condiciones generales de contratación', `<p>El día de la firma, el inquilino abona:</p>
              <ul><li>La <b>primera mensualidad</b> de renta.</li>
              <li><b>Fianza legal:</b> 1 mensualidad de renta.</li>
              <li><b>Garantía adicional:</b> las mensualidades de renta que indique cada anuncio.</li>
              <li><b>Gastos de gestión del expediente:</b> 1 mensualidad de renta <b>+ 21 % de IVA</b>.</li></ul>
              <p>La comunidad (si no va incluida) no se paga a la firma: se paga cada mes, con la renta.</p>
              <p><b>Solvencia:</b> sus ingresos netos mensuales deben ser <b>al menos</b> las veces la renta que indique el anuncio (renta sin comunidad).</p>
              <p class="tiny">Los gastos de gestión no son honorarios de agencia, que eso ya no se le puede cobrar al inquilino. Son gastos de gestión. Que es distinto. Porque lo decimos nosotros.</p>`);
          } },
        { id: 'estanteria', x: 42, y: 25, emoji: '🗂️', s: 5, label: 'Estantería de carpetas',
          look(g) {
            if (g.flag('carp')) return g.say('Carpetas de otros candidatos. Una tiene una carta de recomendación de un obispo.');
            g.set('carp'); g.give('carpeta');
            g.say('Coges una carpeta azul: «DOSSIER DEL INQUILINO PERFECTO». La agencia las regala. Es lo único que regala.');
          } },
        { id: 'foto', x: 56, y: 20, emoji: '🖼️', s: 5, label: 'Foto del «piso piloto»',
          look(g) { g.say('La foto del piso piloto: 30 m² que, con gran angular, parecen el Palacio Real. Al fondo se intuye un pie del fotógrafo.'); } },
        { id: 'impresora', x: 44, y: 60, emoji: '🖨️', s: 6, label: 'Impresora de la agencia',
          look(g) { g.say('Una impresora con un cartel: «Solo para clientes. Imprimir cuesta 2 €. Mirarla, 1 €».'); },
          use: {
            movil(g) {
              if (g.has('extracto') || g.flag('dossierOK') || g.has('dossier')) return g.say('Ya tienes el extracto. Imprimir otro sería despilfarrar papel (y 2 €).');
              g.give('extracto');
              g.say('Mandas el extracto desde la app. La impresora se lo piensa, carraspea y lo escupe. Saldo: 4.000 €. Hasta la impresora parece decepcionada.');
            },
          } },
        { id: 'agente', x: 63, y: 47, emoji: '🕴️', s: 8, label: 'Borja, agente inmobiliario',
          look(g) {
            if (g.flag('dossierOK')) return g.say('—Ya tengo su dossier. Elija piso en el ordenador. Solo uno, que esto no es un buffet.', 'Borja (agente)');
            g.say('—Sin dossier no le enseño ni el ascensor. Quiero una carpeta con su <b>nómina</b> y un <b>extracto bancario impreso</b>. Impreso, ¿eh? Las pantallas mienten.', 'Borja (agente)');
          },
          use: {
            dossier(g) {
              g.take('dossier'); g.set('dossierOK');
              g.say('—Nómina, extracto... Perfecto. Es usted un candidato de categoría B-más. Ahora elija piso en el ordenador. Y calcule bien, que luego vienen los lloros.', 'Borja (agente)');
            },
            dossier1(g) { g.say('—Le falta el extracto bancario. Impreso.', 'Borja (agente)'); },
            nomina(g) { g.say('—Suelta no. En carpeta. Aquí las cosas se hacen con estilo.', 'Borja (agente)'); },
            movil(g) { g.say('—No miro móviles ajenos. Imprímalo.', 'Borja (agente)'); },
          } },
        { id: 'ordenador', x: 77, y: 51, emoji: '💻', s: 6, label: 'Ordenador de la agencia',
          look(g) {
            if (!g.flag('dossierOK')) return g.say('Borja tapa la pantalla con la mano: —Primero el dossier.', 'Borja (agente)');
            if (g.has('solicitudAlq')) return g.say('La solicitud ya está impresa. Entrégasela al casero.');
            ordenadorL1(g);
          } },
        { id: 'casero', x: 91, y: 58, emoji: '🧓', s: 8, label: 'Don Ulpiano, el casero',
          look(g) {
            g.say(rand([
              '—Yo solo alquilo a gente seria. Sin niños, sin perros, sin fiestas y, a ser posible, sin vida.',
              '—Tengo catorce pisos. Todos heredados. Yo también he luchado mucho, ¿eh? En el notario, sobre todo.',
              '—Tráigame una solicitud como Dios manda y hablamos. Bueno, hablo yo.',
            ]), 'Don Ulpiano (casero)');
          },
          use: {
            solicitudAlq(g) {
              g.take('solicitudAlq');
              g.say('—R-03, 3.647 € a la firma, nómina, extracto... ¿y un gato? Bueno, si es un gato serio... Queda usted aceptado/a. ¡Enhorabuena! Pasa usted a la lista de espera. Es el número 1. De la lista de espera.', 'Don Ulpiano (casero)');
              g.win();
            },
            dossier(g) { g.say('—El dossier se lo da a Borja, que para eso le pago... digo, le paga usted.', 'Don Ulpiano (casero)'); },
          } },
        { id: 'mochila', x: 11, y: 83, emoji: '🎒', s: 5, label: 'Tu mochila',
          look(g) {
            if (g.flag('moch')) return g.say('Quedan unas llaves de un piso compartido en el que ya no vives y un táper vacío.');
            g.set('moch'); g.give('nomina'); g.give('movil');
            g.say('En la mochila: tu última nómina y el móvil, con un mensaje de tu pareja sin leer. Léelo (selecciónalo en el inventario).');
          } },
        { id: 'candidatos', x: 30, y: 62, emoji: '👔', s: 5, label: 'Otros candidatos',
          look(g) {
            g.say(rand([
              '—Yo he traído nómina, aval de mis padres, carta de mi párroco y un análisis de sangre. Por si acaso.',
              '—Somos 47 para el mismo piso. Dicen que lo van a sortear. Entre los que tengan aval bancario y apellido compuesto.',
              '—Llevo dos años buscando. Ya me sé de memoria todas las humedades de la ciudad.',
            ]), 'Candidato/a');
          } },
        { id: 'agua', x: 52, y: 84, emoji: '🚰', s: 5, label: 'Dispensador de agua',
          look(g) { g.say('«Agua para clientes: 0,50 €». Es agua del grifo. Con gastos de gestión.'); } },
        { id: 'planta', x: 96, y: 86, emoji: '🪴', s: 4, label: 'Planta',
          look(g) { g.say('Una planta de plástico. Es lo único de la agencia que no tiene precio por metro cuadrado.'); } },
      ],
      combos: {
        'carpeta+nomina'(g) { g.take('carpeta'); g.take('nomina'); g.give('dossier1'); g.say('Metes la nómina en la carpeta. Ya tienes medio dossier. Falta el extracto.'); },
        'dossier1+extracto'(g) { g.take('dossier1'); g.take('extracto'); g.give('dossier'); g.say('Grapas el extracto. Dossier completo. Lo miras con orgullo de padre.'); },
      },
      hints: [
        'Registra la mochila y la estantería. Borja quiere una carpeta con la nómina y un extracto bancario impreso: la impresora acepta cosas desde el móvil.',
        'Combina carpeta + nómina y luego el extracto. Tras entregar el dossier, lee el móvil (mensaje de tu pareja), el tablón y las condiciones: descarta cada piso que incumpla algo, incluida la solvencia (nómina) y el dinero que tienes (4.000 €).',
        'Usa el móvil en la impresora; combina carpeta + nómina + extracto; dale el dossier a Borja. En el ordenador elige R-03 (Ronda del Sello): 700 + 700 + 2 × 700 + 847 (700 + 21 %) = 3.647. Entrega la solicitud al casero.',
      ],
    },

    // ------------------------------------------------------ 2
    {
      title: 'La hipoteca',
      place: 'Banco Ibérico de Ahorros Perpetuos — Oficina 0001',
      stars: 2,
      intro: 'Has encontrado un piso para comprar: un 3ºB con ascensor, «libre de cargas». Solo necesitas que el banco te preste <b>180.000 €</b>. Durante 30 años. A cambio de tu alma, en cómodos plazos.<br><br>El banco ofrece tres hipotecas, cada una con su ristra de «productos vinculados». El cartel grande promete un 0,99 %. Los carteles grandes siempre prometen.<br><br><b>Objetivo:</b> averigua el coste real del primer año de la opción más barata, consigue la oferta vinculante y preséntasela al director.',
      outro: 'Oferta vinculante concedida. El banco te presta el dinero... siempre que la tasación y el Registro confirmen que el piso existe y no debe nada. El vendedor dice que está «libre de cargas». Lo dice él.',
      scene: { wall: '#d9e1e6', floor: '#8a8f94', floorH: 32, pattern: 'tiles' },
      decor: [
        { kind: 'screen', l: 42, t: 8, w: 18, h: 16 },
        { kind: 'counter', l: 28, t: 57, w: 38, h: 9 },
        { kind: 'column', l: 3, t: 6, w: 3, h: 62 },
        { kind: 'rug', l: 60, t: 76, w: 24, h: 12, color: '#3d5a80' },
        { emoji: '💺', x: 78, y: 82, s: 4, o: 0.85 },
      ],
      hotspots: [
        { id: 'euribor', x: 51, y: 16, emoji: '📈', s: 5, label: 'Pantalla de cotizaciones',
          look(g) { g.say('<b>EURÍBOR HOY: 2,40 %</b> · Hace un año: 3,10 % · Récord histórico: 5,39 % · Índice de sonrisa del director: 98 %', 'Pantalla de cotizaciones'); } },
        { id: 'tae', x: 22, y: 22, sign: '¡TAE 0,99 %!', sub: '*ver condiciones', w: 13, label: 'Cartel publicitario gigante',
          look(g) {
            g.doc('¡¡HIPOTECA AL 0,99 % TAE!!*', `<p class="big-num">0,99 % TAE*</p>
              <p class="tiny">*Durante los 3 primeros meses, para clientes que contraten 11 productos, domicilien la nómina, la pensión y la de sus padres, tengan un yate amarrado en una de nuestras oficinas costeras y nos lo pidan en latín. Después: lo que diga la FEIN. Esta oferta no aparece en la FEIN. Esta oferta no existe.</p>`);
          } },
        { id: 'guia', x: 84, y: 22, sign: 'CÓMO COMPARAR', sub: '🧮', w: 13, label: 'Guía «Cómo comparar hipotecas»',
          look(g) {
            g.doc('🧮 Cómo comparar hipotecas (versión para humanos)', `<p>Cortesía de la <i>Asociación de Hipotecados Anónimos</i>. Para comparar ofertas, calcula el <b>coste del primer año</b>:</p>
              <p class="paper-note">Coste del 1.er año = capital × TIN final<br>+ lo que pagas por los productos contratados <b>ese primer año</b><br>+ comisiones (apertura).</p>
              <ul><li>El <b>TIN final</b> es el TIN de partida menos las bonificaciones de los productos que contrates.</li>
              <li>Un producto solo compensa si el interés que te ahorra es mayor que lo que cuesta.</li>
              <li>Para simplificar, los intereses del primer año se calculan sobre el capital inicial.</li>
              <li>Ojo a los precios mensuales: un año tiene 12 meses, aunque el banco prefiera no recordártelo.</li></ul>
              <p class="small">Y no te fíes de la TAE de los carteles.</p>`);
          } },
        { id: 'gestor', x: 40, y: 49, emoji: '🤵', s: 8, label: 'Íñigo, gestor de hipotecas',
          look(g) {
            if (g.has('fein') || g.has('ofertaVinc')) { feinDoc(g); return; }
            g.say('—Para estudiar su operación necesito su <b>solicitud de hipoteca firmada</b>. Los impresos están en la mesa. ¿Bolígrafo? Los bolígrafos del banco no son para los clientes. Bueno, los del bol sí.', 'Íñigo (gestor)');
          },
          use: {
            solicitudFirmada(g) {
              g.take('solicitudFirmada'); g.give('fein');
              g.say('—Perfecto. Aquí tiene la FEIN con nuestras tres opciones. Cuando sepa cuál le sale más barata, métalo en el simulador. Yo le recomendaría la mixta, que tiene el TIN más bajo... y la mejor comisión. Para mí.', 'Íñigo (gestor)');
              feinDoc(g);
            },
            solicitudHip(g) { g.say('—Sin firmar no vale. Firme aquí, aquí, aquí y en las otras once páginas.', 'Íñigo (gestor)'); },
          } },
        { id: 'mesa', x: 56, y: 52, emoji: '🗃️', s: 6, label: 'Mesa de impresos',
          look(g) {
            if (g.flag('imp')) return g.say('Impresos de seguros, de alarmas, de planes de pensiones y uno para «solicitar no recibir más impresos».');
            g.set('imp'); g.give('solicitudHip');
            g.say('Coges una solicitud de hipoteca. Siete páginas. La letra pequeña tiene letra pequeña.');
          } },
        { id: 'caramelos', x: 66, y: 52, emoji: '🍬', s: 5, label: 'Bol de caramelos',
          look(g) {
            if (g.flag('boliT')) return g.say('Quedan caramelos de menta del año del euro. Mejor no.');
            g.set('boliT'); g.give('boli');
            g.say('Entre caramelos de menta fosilizados hay un bolígrafo con el logo del banco. Lo coges. Es lo único gratis de la oficina.');
          } },
        { id: 'folleto', x: 12, y: 60, emoji: '📰', s: 5, label: 'Revistero con folletos',
          look(g) {
            g.doc('📰 Folleto: «Protege lo que más quieres (a nosotros)»', `<table class="tbl">
              <tr><td>🛡️ Seguro de vida «Por si acaso»</td><td>45 €/mes</td></tr>
              <tr><td>🏠 Seguro de hogar «Techo»</td><td>250 €/año</td></tr>
              <tr><td>💳 Cuenta Nómina Premium (mantenimiento)</td><td>10 €/mes</td></tr>
              <tr><td>💳 Tarjeta de crédito «Oro de Pirita»</td><td>60 €/año — ¡<b>primer año gratis</b>!</td></tr>
              <tr><td>🚨 Alarma «Ojo Avizor»</td><td>35 €/mes</td></tr>
              <tr><td>☂️ Seguro de protección de pagos</td><td>390 €/año</td></tr></table>
              <p class="small">Precios sin compromiso (el compromiso es suyo).</p>`);
          } },
        { id: 'simulador', x: 84, y: 52, emoji: '🖥️', s: 6, label: 'Simulador de hipotecas',
          look(g) {
            if (g.has('ofertaVinc')) return g.say('El simulador te felicita con una animación de confeti. Lleva la oferta al director.');
            if (!g.has('fein')) return g.say('«Introduzca su FEIN para comenzar». Sin la ficha del gestor, el simulador solo muestra fotos de familias felices en la playa.');
            g.input({
              title: '🖥️ Simulador — Oferta vinculante',
              text: 'Introduzca el <b>coste del primer año</b> de la combinación más barata posible (en euros, sin decimales). Solo se emitirá oferta vinculante para la opción óptima. (Así nadie podrá decir que no le informamos.)',
              numeric: true, maxLen: 5,
              check: (v) => +v === 5320,
              failText: (v) => (+v === 5340 ? 'Casi. Hay un producto que te ahorra un pelín más de lo que cuesta. Por 20 €, pero los 20 € son tuyos.' : +v === 5350 ? 'Has contratado algo que cuesta más de lo que te ahorra. El banco aplaude. Tú no deberías.' : +v === 5750 ? 'La mixta, la del TIN más bajo... con sus productos obligatorios. No es la más barata.' : rand(['No es la combinación más barata. Repasa las tres opciones, los precios del folleto y el Euríbor.', 'Incorrecto. ¿Has pasado los precios mensuales a anuales? ¿Y la comisión de apertura?', 'Ese número le gusta mucho al banco. Demasiado.'])),
              ok: () => { g.give('ofertaVinc'); g.say('«OPCIÓN 2 — VARIABLE. Coste primer año: 5.320 €. Oferta vinculante emitida.» El gestor pone cara de haber perdido una comisión.', 'Simulador'); },
            });
          } },
        { id: 'director', x: 93, y: 40, emoji: '🚪', s: 11, label: 'Despacho del director',
          look(g) { g.say('Una puerta con placa dorada: «DIRECTOR. Llame antes de entrar. O mejor, no llame». Dentro se oye un campo de golf en la tele.'); },
          use: {
            ofertaVinc(g) {
              g.take('ofertaVinc');
              g.say('El director lee la oferta, suspira y la firma: —Euríbor más 0,60 con cuatro productos... Usted ha leído la letra pequeña. Eso no se hace. Bienvenido/a a la familia del Banco Ibérico. Para siempre.', 'Director');
              g.win();
            },
            fein(g) { g.say('—Eso es la FEIN, no una oferta. Pase por el simulador.', 'Director (desde dentro)'); },
          } },
        { id: 'cliente', x: 30, y: 82, emoji: '😭', s: 5, label: 'Cliente sollozando',
          look(g) { g.say('—Firmé la del cartel del 0,99 %. Me cobraron el yate. Y yo no tenía yate.', 'Cliente'); } },
        { id: 'hucha', x: 52, y: 80, emoji: '🐷', s: 6, label: 'Hucha gigante',
          look(g) { g.say('Una hucha decorativa de un metro. Tiene una ranura para meter, pero ninguna para sacar. Muy del banco.'); } },
        { id: 'calendario', x: 68, y: 22, emoji: '📅', s: 4, label: 'Calendario de pared',
          look(g) { g.say('Un calendario de 2008 abierto en septiembre. Nadie se ha atrevido a pasar la hoja.'); } },
      ],
      combos: {
        'boli+solicitudHip'(g) { g.take('solicitudHip'); g.give('solicitudFirmada'); g.say('Firmas en catorce sitios. En el último te tiembla un poco la mano. Es normal.'); },
      },
      hints: [
        'Consigue la FEIN: coge una solicitud en la mesa, el bolígrafo del bol de caramelos, combínalos y entrega la solicitud firmada al gestor. El cartel del 0,99 % es humo.',
        'Calcula el coste del 1.er año de cada opción con la guía: capital × TIN final + productos del primer año + apertura. El Euríbor está en la pantalla; los precios, en el folleto (pasa los mensuales a anuales; la tarjeta es gratis el primer año). Un producto solo compensa si ahorra más de lo que cuesta.',
        'La más barata es la Opción 2 (Euríbor 2,40 + 0,60 = 3,00 %) con vida, hogar, Cuenta Premium y tarjeta: TIN 2,20 % → 3.960 + 540 + 250 + 120 + 0 + 450 (apertura) = 5.320. Mete 5320 en el simulador y entrega la oferta al despacho del director.',
      ],
    },

    // ------------------------------------------------------ 3
    {
      title: 'Libre de cargas',
      place: 'Registro de la Propiedad n.º 3 de Villatrámite',
      stars: 3,
      intro: 'El piso que vas a comprar es un precioso <b>3ºB con ascensor</b>. El vendedor jura que está «libre de cargas». El banco, que no se fía ni de su madre, exige una certificación del Registro.<br><br>Para pedirla hay que saber el número de finca. Y para entenderla, hay que saber leer una nota simple, que de simple solo tiene el nombre.<br><br><b>Objetivo:</b> encuentra la finca correcta, pide su nota simple y di a la registradora el importe total de las cargas que <b>siguen vigentes</b>.',
      outro: 'Certificación expedida: el piso «libre de cargas» arrastra 96.250 € en cargas vigentes. El vendedor dice que «eso se arregla en la notaría». Y, sorprendentemente, tiene razón: se arregla en la notaría. Con tu dinero.',
      scene: { wall: '#e9e2cf', floor: '#6f5a46', floorH: 32, pattern: 'wood' },
      decor: [
        { kind: 'shelf', l: 4, t: 22, w: 16, h: 2 }, { kind: 'shelf', l: 4, t: 38, w: 16, h: 2 },
        { emoji: '📚', x: 8, y: 34, s: 4, o: 0.9 }, { emoji: '📚', x: 16, y: 34, s: 4, o: 0.9 },
        { kind: 'counter', l: 42, t: 56, w: 30, h: 9 },
        { kind: 'flag', l: 52, t: 6, w: 5, h: 8 },
        { emoji: '🪑', x: 26, y: 84, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'libro', x: 12, y: 16, emoji: '📕', s: 5, label: 'Libro índice de fincas',
          look(g) {
            g.doc('📕 Libro índice — C/ del Olvido, 14', `<table class="tbl s3-tbl">
              <tr><th>Escalera izquierda</th><th>Finca</th><th>Escalera derecha</th><th>Finca</th></tr>
              <tr><td>Bajo A</td><td>4461</td><td>Local comercial</td><td>4472</td></tr>
              <tr><td>Bajo B</td><td>4462</td><td>1ºA</td><td>4473</td></tr>
              <tr><td>1ºA</td><td>4463</td><td>1ºB</td><td>4474</td></tr>
              <tr><td>1ºB</td><td>4464</td><td>2ºA</td><td>4475</td></tr>
              <tr><td>2ºA</td><td>4465</td><td>2ºB</td><td>4476</td></tr>
              <tr><td>2ºB</td><td>4466</td><td>3ºA</td><td>4477</td></tr>
              <tr><td>3ºA</td><td>4467</td><td><b>3ºB</b></td><td>4478</td></tr>
              <tr><td><b>3ºB</b></td><td>4471</td><td>4ºA</td><td>4479</td></tr>
              <tr><td>—</td><td>—</td><td>4ºB</td><td>4480</td></tr></table>
              <p class="small">Hay dos 3ºB. Como hay dos de casi todo en este edificio, salvo ascensores.</p>`);
          } },
        { id: 'plano', x: 30, y: 24, sign: 'PLANO DEL EDIFICIO', sub: 'División horizontal', w: 15, label: 'Plano de división horizontal',
          look(g) {
            g.doc('📐 Plano de división horizontal — C/ del Olvido, 14', `<div class="s3-twin">
              <div><b>ESCALERA IZQUIERDA</b><br>Bajos A y B, y del 1º al 3º.<br>🪜 <b>Sin ascensor</b> (hueco reservado desde 1979, «para cuando haya presupuesto»).</div>
              <div><b>ESCALERA DERECHA</b><br>Local, y del 1º al 4º.<br>🛗 <b>Con ascensor</b> (cuando funciona).</div></div>
              <p class="small">Inscrito en 2001. Revisado por última vez en 2001.</p>`);
          } },
        { id: 'tasador', x: 76, y: 22, emoji: '🧐', s: 6, label: 'Informe del tasador (en un clip)',
          look(g) { g.doc('🧐 Informe de tasación', '<p>Valor de tasación: <b>225.000 €</b>. Exactamente lo que pide el vendedor. Exactamente lo que necesita el banco. Exactamente lo que estabas temiendo.</p><p class="small">Visita realizada: desde el coche, en doble fila.</p>'); } },
        { id: 'reloj', x: 89, y: 15, emoji: '🕰️', s: 4, label: 'Reloj',
          look(g) { g.say('Horario de atención: de 9:00 a 14:00. Son las 13:58. La registradora ya tiene el bolso en la mano.'); } },
        { id: 'terminal', x: 34, y: 58, emoji: '🖥️', s: 7, label: 'Terminal de publicidad registral',
          look(g) {
            if (!g.flag('ident')) return g.say('«Identifíquese para solicitar información registral.» Hay un lector de documentos que parpadea con impaciencia.', 'Terminal');
            g.input({
              title: '🖥️ Solicitud de nota simple', text: 'Introduzca el <b>número de finca</b> registral.', numeric: true, maxLen: 4,
              check: (v) => ['4478', '4471'].includes(v),
              failText: () => 'Finca inexistente o no consultable. Igual que su paciencia.',
              ok: (v) => {
                if (v === '4471') {
                  g.doc('📋 Nota simple — Finca 4471', `<p>C/ del Olvido 14, <b>escalera izquierda</b>, 3ºB. 58 m².</p>
                    <p><b>Titular:</b> Doña Casilda Ruiz Quiñones, por herencia (1996).</p>
                    <p><b>Cargas:</b> ninguna. Doña Casilda no debe nada a nadie desde 1963.</p>
                    <p class="small">Esta finca no es la que te quieren vender: ni es del señor Anselmo, ni tiene ascensor.</p>`);
                  return;
                }
                g.give('notaSimple');
                g.doc('📋 Nota simple — Finca 4478', `<p>C/ del Olvido 14, escalera derecha, 3ºB. 72 m². <b>Titular:</b> Anselmo Prisas Prisas (compraventa, 2005). Fecha de la nota: <b>1 de octubre de 2026</b>.</p>
                  <table class="tbl s3-tbl">
                  <tr><td>Inscripción 1ª (2001)</td><td>Obra nueva y división horizontal.</td></tr>
                  <tr><td>Inscripción 2ª (14/05/2005)</td><td>Compraventa a favor de Anselmo Prisas.</td></tr>
                  <tr><td>Inscripción 3ª (14/05/2005)</td><td>Hipoteca a favor de Caja de Ahorros del Ocaso: 120.000 €.</td></tr>
                  <tr><td>Anotación letra A (03/02/2012)</td><td>Embargo a favor del Ayuntamiento (IBI): 3.200 €.</td></tr>
                  <tr><td>Inscripción 4ª (20/09/2015)</td><td>Cancelación total de la hipoteca de la inscripción 3ª.</td></tr>
                  <tr><td>Anotación letra B (11/06/2019)</td><td>Embargo a favor de la Agencia Tributaria: 4.400 €.</td></tr>
                  <tr><td>Anotación letra D (08/01/2020)</td><td>Embargo a favor de Gimnasio Siempre Fuerte S.L. (cuotas): 600 €.</td></tr>
                  <tr><td>Inscripción 5ª (02/03/2021)</td><td>Hipoteca a favor de Banco Ibérico de Ahorros Perpetuos: 90.000 €.</td></tr>
                  <tr><td>Nota marginal (05/06/2023)</td><td>Prórroga de la anotación letra B por cuatro años más.</td></tr>
                  <tr><td>Anotación letra C (17/10/2023)</td><td>Embargo a favor de la Comunidad de Propietarios: 1.850 €.</td></tr></table>
                  <p class="tiny">Las anotaciones de embargo <b>caducan a los 4 años</b> de su fecha, salvo que conste su prórroga. Las hipotecas siguen vigentes mientras no se inscriba su cancelación. Esta nota tiene valor meramente informativo, como casi todo.</p>`);
              },
            });
          },
          use: {
            dni(g) {
              if (g.flag('ident')) return g.say('Ya estás identificado/a. El lector te reconoce y, por un momento, parece alegrarse.');
              g.set('ident');
              g.say('El lector traga tu DNI, lo mira, lo duda y lo devuelve. «Identificación correcta. Puede solicitar notas simples.»', 'Terminal');
            },
          } },
        { id: 'registradora', x: 58, y: 47, emoji: '👩‍⚖️', s: 8, label: 'Doña Inmaculada, registradora',
          look(g) {
            if (!g.has('notaSimple')) return g.say('—La certificación de cargas se la doy cuando me diga usted qué cargas tiene la finca. Pida la nota simple en el terminal. Con su número de finca, que yo no adivino.', 'Registradora');
            g.input({
              title: '👩‍⚖️ Certificación de cargas',
              text: '—A ver. Según la nota simple, ¿cuál es el <b>importe total de las cargas que siguen vigentes</b> hoy? Sume solo lo que sigue vivo, que lo muerto no paga.',
              numeric: true, maxLen: 6,
              check: (v) => +v === 96250,
              failText: (v) => (+v === 230050 ? '—Ha sumado hasta a los difuntos. Hay hipotecas canceladas y embargos caducados.' : +v === 91850 ? '—¿Y la prórroga de la letra B? Las notas marginales también se leen.' : +v === 96850 ? '—El gimnasio ya no cuenta: su embargo caducó sin prórroga.' : rand(['—No. Repase fechas: lo cancelado no cuenta y lo caducado tampoco.', '—Incorrecto. Aquí no se suma «a ojo», se suma con fechas.'])),
              ok: () => {
                g.give('certCargas');
                g.say('—96.250 €: hipoteca de 90.000, Hacienda (prorrogada) y la comunidad. Exacto. Aquí tiene la certificación. «Libre de cargas», decía... Son las 14:00. Cerramos. Que le vaya bonito.', 'Registradora');
                g.win();
              },
            });
          } },
        { id: 'bolso', x: 16, y: 72, emoji: '👜', s: 6, label: 'Tu bolsa',
          look(g) {
            if (g.flag('bolso')) return g.say('Pañuelos, un caramelo del banco (no) y la llave del piso de alquiler que no conseguiste.');
            g.set('bolso'); g.give('dni'); g.give('anuncio');
            g.say('En la bolsa llevas tu DNI y el anuncio del piso que quieres comprar.');
          } },
        { id: 'archivo', x: 86, y: 62, emoji: '🗄️', s: 8, label: 'Archivo de legajos',
          look(g) { g.say('Legajos desde 1861. Huele a papel antiguo, a humedad y a herencias mal repartidas.'); } },
        { id: 'cola', x: 44, y: 83, emoji: '👴', s: 5, label: 'Señor en la cola',
          look(g) { g.say('—Yo vengo a ver si mi finca sigue siendo mía. Desde que mi cuñado vino a «ayudarme con unos papeles», lo compruebo cada mes.', 'Señor'); } },
        { id: 'cartel', x: 74, y: 40, sign: 'AVISO', sub: '📢', w: 10, label: 'Aviso',
          look(g) { g.say('«Se ruega no confundir la nota simple con una nota sencilla. La nota simple es complicada. La nota sencilla no existe.»'); } },
      ],
      hints: [
        'Mira tu bolsa. El anuncio habla de un 3ºB con ascensor; en el libro índice hay dos 3ºB. El plano del edificio te dirá cuál es. Identifícate en el terminal con el DNI.',
        'Es la finca 4478 (escalera derecha, la del ascensor). En la nota simple, descarta la hipoteca cancelada y las anotaciones caducadas (4 años desde su fecha, salvo prórroga). Fecha de la nota: 1/10/2026.',
        'Usa el DNI en el terminal y pide la finca 4478. Vigentes: hipoteca de la inscripción 5ª (90.000) + letra B prorrogada en 2023 (4.400) + letra C de 2023 (1.850) = 96.250. Díselo a la registradora.',
      ],
    },

    // ------------------------------------------------------ 4
    {
      title: 'Firme aquí, aquí y aquí',
      place: 'Notaría de Doña Leocadia Fe-Pública',
      stars: 3,
      intro: 'Día de la firma. En la notaría: el vendedor, su mujer, dos apoderados de banco, una agente inmobiliaria que pasaba por aquí a cobrar, la notaria... y tú, con más papeles que una papelería.<br><br>Faltan documentos, falta calcular el cheque y, sobre todo, falta que cada uno firme en el orden que exige.<br><br><b>Objetivo:</b> reúne la documentación, extiende el cheque correcto al vendedor y organiza el orden de firma.',
      outro: 'Escritura firmada. Eres propietario/a de un piso y de una deuda de 30 años. Pero la fiesta dura poco: a la salida, un señor muy amable te recuerda que tienes 30 días hábiles para pagar los impuestos.',
      scene: { wall: '#d8c8a8', floor: '#5a4232', floorH: 34, pattern: 'carpet' },
      decor: [
        { kind: 'counter', l: 18, t: 60, w: 62, h: 8 },
        { kind: 'board', l: 82, t: 10, w: 13, h: 18 },
        { kind: 'shelf', l: 3, t: 30, w: 12, h: 2 },
        { emoji: '📚', x: 9, y: 26, s: 4, o: 0.9 },
        { kind: 'window', l: 36, t: 6, w: 10, h: 20 },
      ],
      hotspots: [
        { id: 'notaria', x: 57, y: 30, emoji: '👩‍⚖️', s: 7, label: 'Doña Leocadia, notaria',
          look(g) {
            if (!g.flag('docsOK')) return g.say('—No firmamos nada hasta que mi oficial tenga toda la documentación. Y yo firmo la última, como siempre. Es lo único que me gusta de este oficio.', 'Notaria');
            if (!g.flag('chequeOK')) return g.say('—Falta el cheque al vendedor. Calcúlelo bien: aquí todo el mundo cuenta, y el señor Anselmo, dos veces.', 'Notaria');
            if (!g.flag('firmado')) { firmaModal(g); return; }
            g.say('—Queda autorizada la escritura. Enhorabuena: es usted propietario/a. Y deudor/a. Las dos cosas a la vez, como casi todo el mundo.', 'Notaria');
            g.win();
          } },
        { id: 'recepcion', x: 8, y: 50, emoji: '💁', s: 6, label: 'Recepcionista',
          look(g) {
            if (g.flag('borr')) return g.say('—El borrador ya se lo di. Léalo, que para eso lo imprimimos en papel de 120 gramos.', 'Recepcionista');
            g.set('borr'); g.give('borrador');
            g.say('—Aquí tiene el borrador de la escritura. Léalo bien: luego la notaria lo lee en voz alta y nadie escucha.', 'Recepcionista');
          } },
        { id: 'oficial', x: 21, y: 44, emoji: '🧑‍💻', s: 6, label: 'Oficial de la notaría',
          look(g) {
            if (g.flag('docsOK')) return g.say('—Documentación completa. Ahora el cheque al vendedor, en el talonario de la mesa.', 'Oficial');
            const need = { certSaldo: 'el certificado de saldo pendiente de la hipoteca del vendedor (se lo da su banco)', certComunidad: 'el certificado de deudas con la comunidad (llame al administrador)', reciboIBI: 'el último recibo del IBI (lo tendrá el vendedor... o quien mande en casa)' };
            const miss = Object.keys(need).filter((k) => !(g.flag('dlv') || []).includes(k));
            g.say(`—Para preparar la escritura me falta: ${miss.map((k) => need[k]).join('; ')}.`, 'Oficial');
          },
          use: Object.fromEntries(['certSaldo', 'certComunidad', 'reciboIBI'].map((k) => [k, (g) => {
            const d = g.flag('dlv') || [];
            g.take(k); d.push(k); g.set('dlv', d);
            if (d.length === 3) { g.set('docsOK'); g.sfx('stamp'); g.say('—¡Completo! Ahora extienda el cheque al vendedor en el talonario. Y lea bien la forma de pago del borrador.', 'Oficial'); }
            else g.say(`—Recibido. Van ${d.length} de 3.`, 'Oficial');
          }])) },
        { id: 'b1', x: 27, y: 52, emoji: '🧔', s: 6, label: 'Apoderado del banco del vendedor',
          look(g) {
            if (!g.flag('saldoT')) { g.set('saldoT'); g.give('certSaldo'); g.say('—Traigo el certificado de saldo pendiente: 61.420 €. Tome, para el oficial.', 'Apoderado (banco del vendedor)'); }
            g.say('—Yo firmo <b>antes que el vendedor</b>. Nadie vende mi garantía sin que yo la cancele primero. Antes, ¿eh? Inmediatamente o no, me da igual, pero antes.', 'Apoderado (banco del vendedor)');
          } },
        { id: 'vendedor', x: 38, y: 52, emoji: '👴', s: 6, label: 'Don Anselmo, el vendedor',
          look(g) {
            g.say('—¿El recibo del IBI? Eso lo lleva mi mujer, que es la que manda. Y otra cosa: <b>mi mujer firma antes que el comprador</b>, que si no, luego el comprador se arrepiente y ella se enfada.', 'Don Anselmo');
          } },
        { id: 'conyuge', x: 49, y: 52, emoji: '👵', s: 6, label: 'Doña Visitación, cónyuge del vendedor',
          look(g) {
            if (!g.flag('ibiT')) { g.set('ibiT'); g.give('reciboIBI'); g.say('—El recibo del IBI, aquí lo tengo, en el bolso. Pagado, que en esta casa se paga todo... salvo la comunidad y Hacienda.', 'Doña Visitación'); }
            g.say('—Yo firmo <b>pegadita a mi marido: justo antes o justo después</b>. Y <b>nunca justo después de un banco</b>, que me da alergia.', 'Doña Visitación');
          } },
        { id: 'b2', x: 64, y: 52, emoji: '👩‍💼', s: 6, label: 'Apoderada de tu banco',
          look(g) { g.say('—Yo firmo la hipoteca <b>justo después del comprador</b>. Ni antes, ni dos puestos después: justo después. Es lo que dice el protocolo, y el protocolo soy yo.', 'Apoderada (tu banco)'); } },
        { id: 'agente', x: 77, y: 52, emoji: '💃', s: 6, label: 'Agente inmobiliaria',
          look(g) { g.say('—Yo también firmo, ¿eh? Por si acaso. Para que quede claro que esta venta es mía y que mi factura del 3 % + IVA también.', 'Agente inmobiliaria'); } },
        { id: 'tarjetas', x: 88, y: 19, emoji: '📇', s: 5, label: 'Corcho con tarjetas',
          look(g) { g.say('Entre tarjetas de cerrajeros y de un tarotista, una dice: «Fincas Morosas S.L. — Administración de comunidades. Tel. <b>555 01 47</b>».'); } },
        { id: 'telefono', x: 92, y: 50, emoji: '☎️', s: 5, label: 'Teléfono de la notaría',
          look(g) {
            if (g.flag('comT')) return g.say('Ya hablaste con el administrador. Te ha puesto la musiquita de espera en la cabeza para toda la semana.');
            g.input({
              title: '☎️ Teléfono', text: 'Marca el número.', numeric: true, maxLen: 9,
              check: (v) => v === '5550147',
              failText: () => '«El número marcado no existe.» Como la cita previa.',
              ok: () => { g.set('comT'); g.give('certComunidad'); g.say('Tras 18 minutos de «Para Elisa», el administrador te envía un certificado por fax (sí, por fax): el 3ºB debe 1.850 € a la comunidad.', 'Fincas Morosas S.L.'); },
            });
          } },
        { id: 'talonario', x: 45, y: 74, emoji: '📒', s: 6, label: 'Talonario de cheques bancarios',
          look(g) {
            if (g.flag('chequeOK')) return g.say('El cheque ya está extendido y entregado. El señor Anselmo lo mira como a un nieto.');
            if (!g.flag('docsOK')) return g.say('—Los cheques, cuando la documentación esté completa —dice el oficial, apartándote el talonario con un dedo.');
            g.input({
              title: '💶 Cheque bancario al vendedor', text: 'Importe del cheque a favor de Anselmo Prisas (euros, sin decimales). Lee la forma de pago del borrador.', numeric: true, maxLen: 6,
              check: (v) => +v === 134830,
              failText: (v) => (+v === 106250 ? '—¿Ha descontado la hipoteca inscrita? Se paga el saldo REAL, según el certificado del banco.' : +v === 136680 || +v === 139230 ? '—Se ha dejado algún embargo vigente sin retener. La nota simple, señor/a, la nota simple.' : +v === 134230 ? '—¿El gimnasio? Ese embargo está caducado. No retenga de más, que el señor Anselmo llora.' : rand(['—No cuadra. Precio, menos arras, menos saldo real de la hipoteca, menos embargos vigentes.', '—El oficial niega con la cabeza. El señor Anselmo, también, pero por otras razones.'])),
              ok: () => { g.set('chequeOK'); g.say('—134.830 €. Correcto. El vendedor recibe el cheque con lágrimas en los ojos: «Es lo más bonito que me ha pasado desde mi boda». Su mujer le mira. «...Igual de bonito».', 'Oficial'); },
            });
          } },
        { id: 'carpeta', x: 14, y: 82, emoji: '💼', s: 6, label: 'Tu cartera de documentos',
          look(g) {
            if (g.flag('carp')) return g.say('Solo te queda un folleto del banco y la esperanza.');
            g.set('carp'); g.give('notaSimple'); g.give('arras');
            g.say('Sacas la nota simple del Registro y el contrato de arras. Los traes sudados de tanto apretarlos.');
          } },
        { id: 'cuadro', x: 75, y: 18, emoji: '🖼️', s: 4, label: 'Cuadro',
          look(g) { g.say('Óleo de un notario del siglo XIX dando fe de algo. Tiene cara de no fiarse del pintor.'); } },
      ],
      hints: [
        'Pide el borrador en recepción y saca tus papeles de la cartera. El oficial necesita tres documentos: el apoderado del banco del vendedor tiene uno, Doña Visitación otro, y el del administrador se pide por teléfono (el número está en el corcho).',
        'Cheque = precio − arras − saldo REAL de la hipoteca (certificado, no lo inscrito) − embargos vigentes de la nota simple (los mismos que en el Registro). Para el orden de firma, escucha a cada firmante; la agente inmobiliaria no comparece.',
        'Teléfono 5550147. Cheque: 225.000 − 22.500 − 61.420 − 4.400 − 1.850 = 134.830. Orden: apoderado del banco del vendedor, Don Anselmo, Doña Visitación, tú, apoderada de tu banco. Luego habla con la notaria.',
      ],
    },

    // ------------------------------------------------------ 5
    {
      title: 'Hacienda somos todos (tú más)',
      place: 'Oficina Liquidadora y Ayuntamiento — Ventanillas compartidas',
      stars: 3,
      intro: 'Comprar un piso usado tributa por el <b>ITP</b>. Y en la ventanilla de al lado, el Ayuntamiento quiere cobrarte la <b>plusvalía municipal</b>, «que total, alguien la tiene que pagar».<br><br>Tramos, valores de referencia, tipos reducidos con letra pequeña y una ordenanza que nadie ha leído.<br><br><b>Objetivo:</b> presenta el modelo 600 con la base imponible, la cuota de ITP y la plusvalía que te corresponde pagar a ti (si es que te corresponde algo).',
      outro: 'Impuestos pagados. Ya eres propietario/a a todos los efectos... salvo a efectos catastrales: una carta del Catastro asegura que tu piso mide 96 m² y que tu trastero es el del vecino.',
      scene: { wall: '#cfd8cc', floor: '#7d8378', floorH: 32, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 30, t: 56, w: 44, h: 9 },
        { kind: 'flag', l: 50, t: 5, w: 5, h: 8 },
        { kind: 'board', l: 4, t: 10, w: 22, h: 30 },
        { emoji: '🪑', x: 84, y: 84, s: 4, o: 0.8 }, { emoji: '🪑', x: 90, y: 84, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'tramos', x: 15, y: 18, sign: 'ITP · TIPOS', sub: '📊', w: 12, label: 'Cartel de tipos del ITP',
          look(g) {
            g.doc('📊 Impuesto sobre Transmisiones Patrimoniales — vivienda usada', `<p><b>Base imponible:</b> el <b>mayor</b> de estos dos valores: el precio escriturado o el valor de referencia del Catastro.</p>
              <table class="tbl"><tr><td>Parte de la base hasta 200.000 €</td><td>6 %</td></tr><tr><td>Parte de la base que exceda de 200.000 €</td><td>8 %</td></tr></table>
              <p><b>Tipo reducido del 4 %</b> (sobre toda la base), si se cumplen <b>las dos</b> condiciones:</p>
              <ul><li>El comprador es <b>menor de 35 años</b> en la fecha de la escritura.</li><li>La base imponible <b>no supera 240.000 €</b>.</li></ul>`);
          } },
        { id: 'bonif', x: 15, y: 33, sign: 'BONIFICACIONES', sub: '🎁', w: 12, label: 'Cartel de bonificaciones',
          look(g) {
            g.doc('🎁 Bonificaciones en la cuota', `<ul><li><b>20 %</b> de bonificación para viviendas de <b>menos de 70 m² construidos</b> según escritura.</li>
              <li><b>50 %</b> para familias numerosas. (Un gato no computa como miembro de la unidad familiar, aunque mande más que nadie.)</li>
              <li><b>100 %</b> para quien entienda a la primera este cartel.</li></ul>`);
          } },
        { id: 'catastro', x: 36, y: 22, emoji: '🏧', s: 6, label: 'Quiosco del Catastro',
          look(g) {
            if (g.has('certVR')) return g.say('El quiosco imprime un anuncio: «¿Sabía que el valor de referencia NO es el valor de mercado? Nosotros tampoco».');
            g.input({
              title: '🏧 Consulta de valor de referencia', text: 'Introduzca la <b>referencia catastral</b> (versión corta, 7 cifras).', numeric: true, maxLen: 7,
              check: (v) => v === '4821103',
              failText: () => 'Referencia inexistente. O existe, pero en otro municipio, en otra dimensión.',
              ok: () => { g.give('certVR'); g.say('El quiosco imprime: «Valor de referencia 2026 de su inmueble: 241.000 €». Más de lo que pagaste. El Catastro cree mucho en ti.', 'Quiosco del Catastro'); },
            });
          } },
        { id: 'ordenanza', x: 60, y: 22, emoji: '📖', s: 5, label: 'Ordenanza fiscal (en un atril)',
          look(g) {
            g.doc('📖 Ordenanza fiscal del Impuesto sobre el Incremento de Valor de los Terrenos («plusvalía»)', `<p><b>Art. 1. Hecho imponible.</b> El incremento de valor de los terrenos urbanos que se pone de manifiesto al transmitirlos.</p>
              <p><b>Art. 2. Exenciones.</b> Las que diga la ley, y las de las personas que hayan esperado más de tres horas en esta ventanilla (en estudio desde 2009).</p>
              <p><b>Art. 3. Sujeto pasivo.</b> En las transmisiones a título oneroso (compraventas), es sujeto pasivo el <b>transmitente</b>, es decir, <b>quien vende</b>.</p>
              <p><b>Art. 4. Base imponible.</b> Se calculará con una fórmula que ocupa 14 páginas y un anexo.</p>
              <p><b>Art. 5. Plazo.</b> 30 días hábiles desde la transmisión.</p>
              <p><b>Art. 6. Recaudación.</b> Si el transmitente no paga, la ventanilla intentará cobrárselo al comprador igualmente, por si cuela.</p>`);
          } },
        { id: 'plusvalia', x: 44, y: 46, sign: 'PLUSVALÍA', sub: '🙋‍♂️', w: 11, label: 'Ventanilla de plusvalía (Ayuntamiento)',
          look(g) {
            if (g.has('noSujecion')) return g.say('—Ya le di la diligencia. No me mire así, que yo solo intento cobrar.', 'Funcionario de plusvalía');
            g.choice({
              title: '🙋‍♂️ Ventanilla de plusvalía',
              text: '—Por la compraventa del 3ºB, son <b>2.130 €</b> de plusvalía. ¿Paga con tarjeta o con lágrimas?',
              options: [
                { label: 'Pagar los 2.130 € (para no discutir)', onPick(gg, msg) { gg.sfx('bad'); msg('Vas a pagar... y el datáfono se cuelga. Una señal. Antes de regalar 2.130 €, ¿por qué no lees la ordenanza?', true); return false; } },
                { label: '«Según el artículo 1, no me toca pagar»', onPick(gg, msg) { gg.sfx('bad'); msg('—El artículo 1 dice QUÉ se paga, no QUIÉN. Siguiente argumento.', true); return false; } },
                { label: '«Según el artículo 3, la paga quien vende»', onPick(gg) { gg.give('noSujecion'); gg.say('—...Artículo 3. Sujeto pasivo: el transmitente. Vaya. Alguien se ha leído la ordenanza. Tenga su diligencia de no sujeción. (Por si colaba.)', 'Funcionario de plusvalía'); } },
                { label: '«Según el artículo 6, ya me lo cobrarán si no paga él»', onPick(gg, msg) { gg.sfx('bad'); msg('—¡Exacto! Pues pague. ...Ah, no, espere: eso no le obliga a nada. Pero usted lo ha dicho como si sí.', true); return false; } },
              ],
            });
          } },
        { id: 'funcionaria', x: 62, y: 47, emoji: '👩‍💼', s: 7, label: 'Funcionaria de la Oficina Liquidadora',
          look(g) {
            if (!g.has('noSujecion')) return g.say('—Antes de liquidar el ITP, resuelva lo de la plusvalía en la ventanilla de al lado. Si no, el sistema se lía y me lía a mí.', 'Funcionaria');
            g.say('—Ya puede presentar el modelo 600 en el terminal. Identifíquese con el DNI, eso sí.', 'Funcionaria');
          } },
        { id: 'terminal', x: 80, y: 50, emoji: '🖥️', s: 6, label: 'Terminal del modelo 600',
          look(g) {
            if (!g.flag('ident')) return g.say('«Identifíquese con su documento de identidad.»', 'Terminal');
            if (!g.has('noSujecion')) return g.say('«Error 600-P: plusvalía pendiente de aclarar. Diríjase a la ventanilla de plusvalía.»', 'Terminal');
            m600Modal(g);
          },
          use: {
            dni(g) { g.set('ident'); g.say('«Identificado/a. Fecha de nacimiento: 20/10/1991. Bienvenido/a, contribuyente.»', 'Terminal'); },
          } },
        { id: 'cartera', x: 12, y: 80, emoji: '👛', s: 5, label: 'Tu cartera',
          look(g) {
            if (g.flag('cart')) return g.say('Una tarjeta del videoclub. Hace tiempo que no existe el videoclub. Ni tu saldo.');
            g.set('cart'); g.give('dni');
            g.say('Sacas el DNI. Fecha de nacimiento: 20/10/1991.');
          } },
        { id: 'carpeta', x: 24, y: 82, emoji: '🗂️', s: 5, label: 'Tu carpeta de la compra',
          look(g) {
            if (g.flag('carpT')) return g.say('Fotocopias de fotocopias. Y el folleto del 0,99 % TAE, que guardas como recordatorio.');
            g.set('carpT'); g.give('escritura'); g.give('reciboIBI5');
            g.say('Sacas la copia de la escritura y el recibo del IBI que te dio Doña Visitación.');
          } },
        { id: 'cola', x: 52, y: 82, emoji: '🧍', s: 5, label: 'Contribuyente en la cola',
          look(g) { g.say('—Yo pagué la plusvalía de la vendedora sin darme cuenta. Ahora ella me manda postales desde Benidorm.', 'Contribuyente'); } },
        { id: 'reloj', x: 88, y: 16, emoji: '⏰', s: 4, label: 'Reloj',
          look(g) { g.say('Faltan 29 días hábiles para que acabe el plazo. Aquí eso es mañana.'); } },
      ],
      hints: [
        'Saca tus papeles (cartera y carpeta). El valor de referencia lo da el quiosco del Catastro con la referencia del recibo del IBI. En la plusvalía, lee la ordenanza antes de pagar nada.',
        'La base es el MAYOR entre precio (225.000) y valor de referencia (241.000). ¿Tipo reducido? Tienes 34 años el día de la escritura... pero mira el límite de la base. La bonificación del 20 % exige menos de 70 m² (la escritura dice 72). La plusvalía la paga quien vende (art. 3).',
        'Quiosco: 4821103. Plusvalía: «Según el artículo 3». Usa el DNI en el terminal. Modelo 600: base 241000; cuota 200.000 × 6 % + 41.000 × 8 % = 12.000 + 3.280 = 15280; plusvalía 0.',
      ],
    },

    // ------------------------------------------------------ 6
    {
      title: 'El dron del Catastro',
      place: 'Gerencia del Catastro — Atención al público',
      stars: 4,
      intro: 'Un dron del Catastro ha sobrevolado tu edificio y ha llegado a dos conclusiones: que tu piso mide <b>96 m²</b> (contando el patio de luces, «que tiene mucha luz») y que tu trastero es el <b>3871</b>, que casualmente es el del vecino.<br><br>Toca medir, leer planos y llevar la contraria al dron.<br><br><b>Objetivo:</b> presenta el modelo 902 con la referencia correcta de tu trastero y la superficie útil real de tu vivienda.',
      outro: 'Catastro rectificado. Tu piso mide lo que mide, tu trastero es tuyo y tu IBI sube igual. Ahora quieres cerrar la terraza para ganar un poco de espacio. Para eso, primero, la comunidad de vecinos.',
      scene: { wall: '#dfe3e8', floor: '#8c8f93', floorH: 30, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 52, t: 58, w: 34, h: 9 },
        { kind: 'screen', l: 66, t: 9, w: 16, h: 14 },
        { kind: 'flag-eu', l: 88, t: 8, w: 7, h: 9 },
        { kind: 'rug', l: 8, t: 78, w: 30, h: 10, color: '#7a6a8c' },
      ],
      hotspots: [
        { id: 'plansot', x: 24, y: 20, sign: 'PLANO DEL SÓTANO', sub: 'C/ del Olvido 14', w: 16, label: 'Plano catastral del sótano', look: sotanoModal },
        { id: 'normas', x: 46, y: 20, sign: 'NORMAS DE MEDICIÓN', sub: '📏', w: 14, label: 'Normas de medición',
          look(g) {
            g.doc('📏 Normas para el cálculo de la superficie útil', `<ul>
              <li>Superficie útil: el suelo de la vivienda <b>dentro de sus muros</b>. Se cuentan todas las habitaciones, pasillos y cuartos interiores.</li>
              <li>Las <b>terrazas cubiertas</b> computan al <b>50 %</b>.</li>
              <li>Los <b>patios</b> y terrazas descubiertas <b>no computan</b>, aunque tengan mucha luz.</li>
              <li>Las zonas con <b>altura libre inferior a 1,50 m</b> <b>no computan</b>.</li>
              <li>Los trasteros situados fuera de la vivienda no computan.</li></ul>
              <p class="small">Superficie de un rectángulo: largo × ancho. (Lo ponemos por si el dron lee esto.)</p>`);
          } },
        { id: 'ortofoto', x: 74, y: 16, emoji: '🛰️', s: 5, label: 'Pantalla con la ortofoto',
          look(g) { g.say('La ortofoto del dron muestra tu terraza en azul: la ha catalogado como «piscina». Es una lona de cuando llovió en 2019.'); } },
        { id: 'funcionaria', x: 62, y: 49, emoji: '👩‍💼', s: 7, label: 'Funcionaria del Catastro',
          look(g) {
            if (!g.flag('planoT')) {
              g.set('planoT'); g.give('plano');
              g.say('—¿Que su piso no mide 96? Pues mídalo. Tenga el plano que tenemos: sin cotas, que las cotas las carga el diablo. Cuando lo tenga todo, rellene el 902 en el terminal.', 'Funcionaria');
              return;
            }
            g.say('—Necesito la referencia de SU trastero, según los linderos de su escritura, y la superficie útil real según las normas. Nada de «a ojo».', 'Funcionaria');
          } },
        { id: 'terminal', x: 79, y: 50, emoji: '🖥️', s: 6, label: 'Terminal del modelo 902', look: m902Modal },
        { id: 'carpeta', x: 10, y: 60, emoji: '🗂️', s: 5, label: 'Tu carpeta',
          look(g) {
            if (g.flag('carpT')) return g.say('Facturas, garantías y la nota simple, que ya te sabes de memoria.');
            g.set('carpT'); g.give('escritura6'); g.give('notificacion');
            g.say('Sacas la escritura (con la descripción del trastero) y la notificación del Catastro.');
          } },
        { id: 'estuche', x: 30, y: 62, emoji: '🧰', s: 5, label: 'Caja de herramientas (olvidada por un técnico)',
          look(g) {
            if (g.flag('cintaT')) return g.say('Un nivel, un lápiz de carpintero y una brújula rota que apunta a la máquina de café.');
            g.set('cintaT'); g.give('cinta');
            g.say('Un técnico se ha dejado la caja de herramientas. Tomas prestada una cinta métrica. Ya se la devolverás. En unos años.');
          } },
        { id: 'dron', x: 40, y: 40, emoji: '🛸', s: 5, label: 'El dron, colgado del techo',
          look(g) { g.say('El dron culpable, colgado del techo como trofeo. Tiene una pegatina: «Este lado arriba». Está colgado del revés.'); } },
        { id: 'cafe', x: 92, y: 74, emoji: '☕', s: 5, label: 'Máquina de café',
          look(g) { g.say('Café: 0,80 €. Superficie útil del vaso: 0,003 m². El Catastro dice que 0,005.'); } },
        { id: 'vecino', x: 50, y: 82, emoji: '🙎‍♂️', s: 5, label: 'Vecino del 2ºA (en la cola)',
          look(g) { g.say('—A mí el dron me ha dicho que tengo un trastero de más. Ojalá. No me haga devolvérselo, que ya he metido la bici.', 'Vecino'); } },
        { id: 'cartelTurno', x: 8, y: 30, emoji: '🎫', s: 4, label: 'Dispensador de turnos',
          look(g) { g.say('Turno C-0001. No hay nadie más: el resto de la ciudad aún no ha abierto la carta del dron.'); } },
      ],
      combos: {
        'cinta+plano'(g) { g.take('plano'); g.give('planoAcotado'); g.say('Mides todo, habitación por habitación. Hasta el altillo, a gatas. Apuntas las medidas en el plano. Míralo en el inventario.'); },
      },
      hints: [
        'Saca la escritura y la notificación de tu carpeta, pide el plano a la funcionaria y combínalo con la cinta métrica de la caja de herramientas. Lee las normas de medición.',
        'En el plano del sótano, la flecha del norte apunta hacia ABAJO: el norte está abajo, el sur arriba, el este a la izquierda y el oeste a la derecha. Busca el trastero con contadores al norte, pasillo al sur, otro trastero al este y fachada al oeste. Para la superficie: suma habitaciones; terraza cubierta al 50 %; ni patio ni altillo.',
        'Trastero 4718. Superficie: 20 + 14 + 7,5 + 5 + 5,5 + 5 (cuarto interior) + 3 (la mitad de la terraza de 6) = 60 m². Preséntalo en el terminal: 4718 y 60.',
      ],
    },

    // ------------------------------------------------------ 7
    {
      title: 'Junta de vecinos',
      place: 'Portal de C/ del Olvido 14 — Junta ordinaria',
      stars: 4,
      intro: 'Quieres cerrar la terraza. Toca fachada, así que necesitas el permiso de la <b>junta de propietarios</b>. Y como eres nuevo/a, el sorteo anual te ha nombrado... <b>presidente/a de la comunidad</b>. Enhorabuena.<br><br>Como presidente/a, decides qué otros puntos se votan antes que el tuyo y en qué orden. Cada vecino tiene sus manías. Y los ausentes... no siempre están tan ausentes.<br><br><b>Objetivo:</b> consigue que la junta apruebe tu obra y que el administrador firme el acta.',
      outro: 'Obra aprobada. Doña Pura ha impugnado el acta «por principio», pero el administrador dice que se le pasará. Con el acta en la mano, vas al Ayuntamiento a pedir la licencia de obra. ¿Qué podría salir mal?',
      scene: { wall: '#e4d6bd', floor: '#6c6158', floorH: 36, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 34, t: 60, w: 32, h: 7 },
        { kind: 'board', l: 3, t: 10, w: 14, h: 22 },
        { emoji: '🪑', x: 20, y: 86, s: 4, o: 0.8 }, { emoji: '🪑', x: 80, y: 86, s: 4, o: 0.8 },
        { emoji: '🛗', x: 96, y: 40, s: 5, o: 0.7 },
      ],
      hotspots: [
        { id: 'convocatoria', x: 10, y: 21, sign: 'CONVOCATORIA', sub: '📌', w: 11, label: 'Convocatoria de la junta',
          look(g) {
            g.doc('📌 Convocatoria de junta ordinaria', `<p>Puntos que el presidente/a puede incluir, en el orden que decida:</p>
              <ul><li>${J_PTS.P}</li><li>${J_PTS.A}</li><li>${J_PTS.B}</li></ul>
              <p><b>Último punto (obligatorio):</b> ${J_PTS.R}.</p>
              <p class="small">Cada punto se vota una sola vez. Lo que se aprueba en un punto ya cuenta como aprobado en los siguientes.</p>`);
          } },
        { id: 'estatutos', x: 26, y: 18, emoji: '📘', s: 5, label: 'Estatutos de la comunidad',
          look(g) {
            g.doc('📘 Estatutos (redactados en 1974 por el del 4ºA, que era notario aficionado)', `<ul>
              <li><b>Puntos ordinarios</b> (portero, pintura, bicis...): se aprueban si hay <b>más votos a favor que en contra</b>, tanto en número de propietarios como en cuotas. Las abstenciones y los ausentes no cuentan. Un empate es un no.</li>
              <li><b>Obras que alteran la fachada:</b> requieren el voto a favor de al menos <b>tres cuartas partes de los propietarios</b> (7 de 9) que sumen, además, al menos el <b>60 % de las cuotas</b>.</li>
              <li>El presidente/a no vota en los puntos ordinarios: modera. En las obras de su propia vivienda, sí vota.</li>
              <li>Las delegaciones de voto solo valen si se entregan al administrador antes de la junta.</li></ul>`);
          } },
        { id: 'coef', x: 40, y: 18, emoji: '📊', s: 5, label: 'Cuadro de coeficientes',
          look(g) {
            g.doc('📊 Coeficientes de participación', `<table class="tbl">${J_OWN.map((o) => `<tr><td>${o.name}</td><td>${o.c} %</td></tr>`).join('')}<tr><td><b>Total (9 propietarios)</b></td><td><b>100 %</b></td></tr></table>`);
          } },
        { id: 'buzon', x: 88, y: 20, emoji: '📬', s: 5, label: 'Buzón de la comunidad',
          look(g) {
            if (g.flag('buz')) return g.say('Publicidad de cerrajeros, una citación del juzgado para el 1ºB y un folleto de «compramos su piso al contado».');
            g.set('buz'); g.give('delegacion');
            g.say('En el buzón: dos cartas. Una de los Peláez (2ºB): «Delegamos nuestro voto en Doña Remedios; votaremos lo mismo que ella». Ya la tiene Remedios. La otra, del fondo del 2ºA, delega en el presidente... que eres tú. Te la guardas.');
          } },
        { id: 'admin', x: 62, y: 48, emoji: '🧑‍💼', s: 6, label: 'El administrador de fincas',
          look(g) {
            if (g.has('acta')) return g.say('—Tráigame el acta y se la firmo. Es lo único que firmo sin leer.', 'Administrador');
            g.say(`—Soy el administrador, de Fincas Morosas S.L. Yo levanto acta y cobro. ${g.flag('deleg') ? 'La delegación del fondo ya está registrada.' : 'Si alguien le ha dado una delegación de voto, entréguemela antes de empezar.'} La mesa presidencial es suya, presidente/a.`, 'Administrador');
          },
          use: {
            delegacion(g) { g.take('delegacion'); g.set('deleg'); g.say('—Delegación del 2ºA registrada: el fondo votará lo mismo que usted. Un fondo de inversión obedeciendo a un vecino. Esto no lo había visto nunca.', 'Administrador'); },
            acta(g) { g.take('acta'); g.say('—Firmado. Su obra queda aprobada. Doña Pura dice que lo va a impugnar, pero lo dice de todo desde 1981. Enhorabuena, presidente/a. Ahora, a por la licencia.', 'Administrador'); g.win(); },
          } },
        { id: 'mesa', x: 50, y: 56, emoji: '🔔', s: 5, label: 'Mesa presidencial (orden del día)', look: juntaModal },
        { id: 'remedios', x: 14, y: 52, emoji: '👵', s: 6, label: 'Doña Remedios (1ºA)',
          look(g) { g.say('—Yo voto que sí a lo del portero automático y a pintar, que el portal está hecho un asco. A lo de las bicis, que no: mi nieto viene en bici. ¿Lo de tu terraza? Solo si <b>antes</b> se ha aprobado el portero automático, que no oigo a mi nieto cuando llama. Y los Peláez votan lo que yo, que me han delegado.', 'Doña Remedios'); } },
        { id: 'fulgencio', x: 25, y: 52, emoji: '🧓', s: 6, label: 'Don Fulgencio (1ºB)',
          look(g) { g.say('—Yo, a todo lo que sea derrama, que NO: ni portero ni pintura. Lo de prohibir las bicis, que sí. ¿Tu terraza? Me da igual, voto que sí... salvo que en esta junta ya se haya aprobado alguna derrama: entonces, por despecho, que no.', 'Don Fulgencio'); } },
        { id: 'paco', x: 36, y: 52, emoji: '🧑‍🍳', s: 6, label: 'Paco, del bar «El Recurso» (local)',
          look(g) { g.say('—Lo de las bicis, NO: mis mejores clientes vienen en bici. Y como se apruebe, me voy al bar y no vuelvo en toda la junta. Pintar, tampoco, que me cierran la terraza un día. El portero, sí. ¿Tu obra? Que sí... a no ser que antes se haya aprobado pintar: si pintan, que nadie más toque la fachada en un año.', 'Paco (bar)'); } },
        { id: 'bermejo', x: 74, y: 52, emoji: '🧔', s: 6, label: 'Sr. Bermejo (3ºA)',
          look(g) { g.say('—El portero, no: yo tengo el telefonillo de 1974 y funciona. Pintar y prohibir bicis, sí. ¿Lo tuyo? Solo si antes se ha <b>votado</b> lo de las bicis, salga lo que salga. Que conste en acta que yo lo pedí.', 'Sr. Bermejo'); } },
        { id: 'pura', x: 85, y: 52, emoji: '👩‍🦳', s: 6, label: 'Doña Pura (4ºA)',
          look(g) { g.say('—Yo, al <b>primer punto</b> que se vote, siempre NO. Por principio. Luego, a todo que sí... menos a tu terraza: a eso solo si antes se ha aprobado pintar el portal. Si el portal está bonito, que cada uno haga en su casa lo que quiera.', 'Doña Pura'); } },
        { id: 'yeray', x: 75, y: 80, emoji: '💻', s: 5, label: 'Yeray (4ºB), por videollamada',
          look(g) { g.say('—¿Se me oye? En el primer punto me abstengo, que estoy conectándome. Luego, para equilibrar, voto siempre <b>lo contrario de lo que salió en el punto anterior</b>: si se aprobó, no; si se rechazó, sí. Es mi filosofía de vida.', 'Yeray (videollamada)'); } },
        { id: 'pipas', x: 34, y: 82, emoji: '🥜', s: 4, label: 'Bolsa de pipas',
          look(g) { g.say('Pipas para la junta. Las juntas de vecinos son el único espectáculo en directo que sigue siendo gratis.'); } },
      ],
      hints: [
        'Habla con todos los vecinos y apunta sus condiciones. Lee los estatutos: tu obra necesita 7 de 9 propietarios y el 60 %. Sin el voto del fondo del 2ºA no llegas: está en el buzón; entrégasela al administrador.',
        'Necesitas a Remedios y los Peláez (portero aprobado antes), a Paco (sin bicis aprobadas ni pintura aprobada), a Bermejo (bicis votadas) y a Yeray (el punto anterior al tuyo debe salir rechazado). Doña Pura vota que no al primer punto: úsalo para «quemar» un punto que te convenga que se rechace.',
        'Entrega la delegación al administrador. Orden del día: 1) Pintar el portal (sale rechazado), 2) Portero automático (aprobado), 3) Prohibir bicis (rechazado). Tu obra sale con 7 propietarios y el 78 %. Dale el acta al administrador.',
      ],
    },

    // ------------------------------------------------------ 8
    {
      title: 'Licencia de obra menor',
      place: 'Ayuntamiento de Villatrámite — Área de Urbanismo',
      stars: 4,
      intro: 'Tienes el acta de la comunidad. Tienes al albañil. Te falta la <b>licencia de obra menor</b>. «Menor» porque los papeles son mayores.<br><br>Cada documento depende de otros, algunos se piden entre sí en bucle, y los plazos corren: el albañil empieza dentro de <b>24 días hábiles</b>. Si no tienes licencia para entonces, se va a otra obra hasta 2028.<br><br><b>Objetivo:</b> averigua qué documentos necesitas de verdad, tramítalos en un orden posible y dentro de plazo, y entrega la licencia al albañil.',
      outro: 'Licencia concedida con el plazo justo. Tomás, el albañil, cierra la terraza en tres días... y te avisa: para poder alquilar o vender algún día, necesitarás la cédula de habitabilidad. Y para la cédula, el certificado energético.',
      scene: { wall: '#d6dbe0', floor: '#77706a', floorH: 32, pattern: 'tiles' },
      init(g) { g.set('tram', { have: {}, days: 0, dead: false }); },
      decor: [
        { kind: 'counter', l: 6, t: 56, w: 66, h: 8 },
        { kind: 'flag', l: 82, t: 6, w: 5, h: 8 },
        { kind: 'screen', l: 75, t: 26, w: 12, h: 10 },
        { emoji: '🪴', x: 95, y: 84, s: 4, o: 0.9 },
      ],
      hotspots: [
        { id: 'requisitos', x: 13, y: 20, sign: 'REQUISITOS', sub: 'Licencia obra menor', w: 14, label: 'Requisitos de la licencia',
          look(g) {
            g.doc('📋 Licencia de obra menor — Requisitos', `<ul>
              <li>Autorización de la comunidad de propietarios (acta), aportada en Registro.</li>
              <li>Documento técnico: <b>memoria técnica valorada</b> <i>o</i> <b>proyecto visado</b>.</li>
              <li>Justificante de la autoliquidación del <b>ICIO y la tasa</b>.</li>
              <li><b>Fianza de gestión de residuos</b>.</li>
              <li>Medio de evacuación de escombros: <b>licencia de vía pública para contenedor</b> <i>o</i> <b>comunicación de uso de sacos</b> (obras pequeñas).</li>
              <li>En edificios catalogados, además, informe de Patrimonio Histórico.</li></ul>`);
          } },
        { id: 'carta', x: 30, y: 20, sign: 'CARTA DE SERVICIOS', sub: '⏱️', w: 14, label: 'Carta de servicios',
          look(g) {
            g.doc('⏱️ Carta de servicios: plazos de tramitación', `<table class="tbl">${DOCS8.map((d) => `<tr><td>${d.name.replace('🏗️ ', '')}</td><td>${d.d} día${d.d > 1 ? 's' : ''} hábil${d.d > 1 ? 'es' : ''}</td></tr>`).join('')}</table>
              <p class="small">Plazos orientativos. Muy orientativos. Las solicitudes denegadas consumen 1 día.</p>`);
          } },
        { id: 'catalogo', x: 46, y: 16, emoji: '🪧', s: 5, label: 'Placa del catálogo de edificios',
          look(g) { g.say('«Catálogo municipal de edificios protegidos. C/ del Olvido, 14: <b>NO CATALOGADO</b>. Valor histórico: ninguno. Valor sentimental: el de sus vecinos.»'); } },
        { id: 'registro', x: 12, y: 44, sign: 'REGISTRO', sub: '🧑‍💼', w: 10, label: 'Ventanilla de Registro',
          look(g) { g.say(g.flag('actaOK') ? '—El acta ya consta. Siga con lo suyo en la Sede.' : '—Si tiene la autorización de la comunidad, entréguemela aquí. Sin acta no hay licencia, ni aunque traiga al Papa.', 'Registro'); },
          use: { actaFirmada(g) { g.take('actaFirmada'); g.set('actaOK'); g.sfx('stamp'); g.say('—Acta registrada. ¡PUM! Sello. Ahora tramite lo demás en la Sede de Urbanismo.', 'Registro'); } } },
        { id: 'viapublica', x: 29, y: 44, sign: 'VÍA PÚBLICA', sub: '🚧', w: 11, label: 'Ventanilla de Vía Pública',
          look(g) { g.say('—¿Contenedor? Para poner un contenedor en la calle necesita licencia de vía pública, y para eso necesita... la licencia de obra. ¿Que la licencia de obra pide el contenedor? Ya. Es un círculo. Muy bonito, ¿verdad? ...Si la obra es pequeña, pruebe con <b>sacos</b>, que no ocupan vía pública.', 'Vía Pública'); } },
        { id: 'residuos', x: 46, y: 44, sign: 'RESIDUOS', sub: '♻️', w: 10, label: 'Ventanilla de Residuos',
          look(g) { g.say('—La fianza de residuos exige el <b>contrato con un gestor de residuos</b> y la estimación de escombros, que viene en el <b>documento técnico</b> (memoria o proyecto). Sin las dos cosas, ni lo intente.', 'Residuos'); } },
        { id: 'tributos', x: 63, y: 44, sign: 'TRIBUTOS', sub: '💶', w: 10, label: 'Ventanilla de Tributos',
          look(g) { g.say('—El ICIO se calcula sobre el presupuesto de ejecución que figura en el <b>documento técnico</b> (memoria o proyecto). Sin él no sé cuánto cobrarle. Y cobrarle es lo que más me gusta.', 'Tributos'); } },
        { id: 'sede', x: 81, y: 31, emoji: '🖥️', s: 5, label: 'Terminal de la Sede de Urbanismo', look: tramModal },
        { id: 'albanil', x: 86, y: 62, emoji: '👷', s: 7, label: 'Tomás, el albañil',
          look(g) { g.say('—Yo empiezo dentro de 24 días hábiles. Si no hay licencia, me voy a otra obra. Para el <b>presupuesto</b> tengo que <b>ir a verla</b> antes, claro. En el presupuesto pondré que el escombro cabe en <b>sacos</b>: menos de un metro cúbico.', 'Tomás (albañil)'); },
          use: {
            licencia(g) { g.take('licencia'); g.say('—¡Licencia! Pues el lunes empiezo. Bueno, el martes, que el lunes es San Expediente. Y no se preocupe, que en tres días le cierro la terraza. O en tres semanas. Tres algo.', 'Tomás (albañil)'); g.win(); },
          } },
        { id: 'arquitecta', x: 66, y: 76, emoji: '👩‍🔧', s: 6, label: 'Tu prima, arquitecta técnica',
          look(g) { g.say('—La <b>memoria valorada</b> te la hago en 4 días, pero necesito el <b>presupuesto del albañil</b>. Un proyecto visado son 20 días: para cerrar una terraza es matar moscas a cañonazos. Y de Patrimonio, olvídate si el edificio no está catalogado.', 'Tu prima (arquitecta)'); } },
        { id: 'folleto', x: 46, y: 80, emoji: '📰', s: 5, label: 'Folleto de una gestoría',
          look(g) { g.say('«GESTORÍA RÁPIDA: ¡El certificado de “no es obra mayor” es IMPRESCINDIBLE! (No lo pide nadie, pero por si acaso.) Solo 300 €.» El folleto huele a comisión.'); } },
        { id: 'carpeta', x: 14, y: 80, emoji: '🗂️', s: 5, label: 'Tu carpeta',
          look(g) {
            if (g.flag('carpT')) return g.say('Ya has sacado el acta. Lo demás son recuerdos de la junta: un hueso de aceituna de Paco y una amenaza de Doña Pura.');
            g.set('carpT'); g.give('actaFirmada');
            g.say('Sacas el acta de la junta, firmada por el administrador. Huele a pipas.');
          } },
        { id: 'reloj', x: 64, y: 16, emoji: '🕰️', s: 4, label: 'Reloj',
          look(g) { g.say('El reloj del Área de Urbanismo va con 20 minutos de retraso. Como todo lo demás, pero en minutos.'); } },
      ],
      hints: [
        'Saca el acta de tu carpeta y aporta el acta en la ventanilla de Registro. Lee los requisitos y la carta de servicios, y escucha a todas las ventanillas, al albañil y a tu prima: cada uno te dice qué necesita cada documento.',
        'El contenedor es un bucle: usa sacos (necesitan el presupuesto). El proyecto visado (20 días) no cabe en el plazo: usa la memoria valorada. El edificio no está catalogado (sin Patrimonio) y el certificado de «no es obra mayor» no lo pide nadie.',
        'Acta en Registro. En la Sede, por este orden: visita (2), presupuesto (3), memoria (4), ICIO (1), gestor de residuos (3), fianza (2), sacos (1) y licencia (5): día 21. Entrega la licencia a Tomás.',
      ],
    },

    // ------------------------------------------------------ 9
    {
      title: 'Letra D de «Decente»',
      place: 'Tu piso (recién reformado)',
      stars: 5,
      intro: 'Para tener la <b>cédula de habitabilidad</b> necesitas un <b>certificado de eficiencia energética</b> de letra D o mejor. El técnico certificador te ha dejado su guía y una nota: «Rellénalo tú, que yo certifico desde casa».<br><br>Habrá que averiguar cómo es de verdad tu piso, sin fiarse de las apariencias, y decidir qué mejoras pagar con lo poco que te queda.<br><br><b>Objetivo:</b> registra un certificado energético de letra D o mejor sin pasarte de presupuesto y consigue la cédula de habitabilidad.',
      outro: 'Cédula de habitabilidad concedida: tu casa es, oficialmente, habitable. Lo celebras con Michi. Pero al bajar la basura ves un cartel nuevo en el portal: «EDIFICIO PRECINTADO — ITE DESFAVORABLE».',
      scene: { wall: '#f0e6d2', floor: '#a7825d', floorH: 30, pattern: 'wood' },
      decor: [
        { kind: 'window', l: 40, t: 8, w: 14, h: 28 },
        { kind: 'counter', l: 62, t: 58, w: 22, h: 8 },
        { kind: 'rug', l: 18, t: 76, w: 28, h: 12, color: '#b5651d' },
        { emoji: '🛋️', x: 30, y: 80, s: 8, o: 0.95 },
        { emoji: '🐈', x: 40, y: 86, s: 3, o: 0.95 },
      ],
      hotspots: [
        { id: 'ventana', x: 47, y: 22, emoji: '🪟', s: 6, label: 'Ventana del salón',
          look(g) { g.say('Una ventana con su cristal. ¿Simple? ¿Doble? A simple vista, transparente. Que es lo mínimo que se le pide a un cristal.'); },
          use: {
            mechero(g) { g.set('llamas'); g.say('Acercas la llama del mechero al cristal y miras el reflejo: ves <b>cuatro</b> llamitas. Michi también las ve y se asusta.'); },
          } },
        { id: 'guia', x: 15, y: 20, sign: 'GUÍA DEL CERTIFICADOR', sub: '📗', w: 16, label: 'Guía del técnico certificador',
          look(g) {
            g.doc('📗 Guía rápida del certificador (CEE simplificado municipal)', `<table class="tbl s3-tbl">
              <tr><th>Elemento</th><th>Puntos</th></tr>
              <tr><td>Ventanas: vidrio simple / doble / triple</td><td>30 / 15 / 5</td></tr>
              <tr><td>Muros: sin aislamiento / cámara con aislamiento / SATE</td><td>35 / 15 / 5</td></tr>
              <tr><td>Calefacción: gasoil / gas convencional / gas de condensación / aerotermia</td><td>30 / 20 / 10 / 3</td></tr>
              <tr><td>Orientación del salón: norte / este / sur / oeste</td><td>15 / 10 / 5 / 10</td></tr>
              <tr><td>Agua caliente: termo eléctrico / con la caldera / solar</td><td>10 / 5 / 0</td></tr></table>
              <p><b>Letras:</b> A ≤ 20 · B 21–35 · C 36–50 · <b>D 51–65</b> · E 66–80 · F 81–95 · G ≥ 96 puntos.</p>
              <p><b>Trucos del oficio:</b></p><ul>
              <li>Para saber cuántos vidrios tiene una ventana, acerca una llama: <b>cada hoja de vidrio refleja dos llamas</b>.</li>
              <li>Para ver el aislamiento, quita la tapa de un enchufe de pared exterior.</li>
              <li>Orientación: si el sol entra por la <b>mañana</b>, mira al <b>este</b>; a <b>mediodía</b>, al <b>sur</b>; por la <b>tarde</b>, al <b>oeste</b>; si no entra nunca, al <b>norte</b>.</li>
              <li>Las calderas de gas anteriores a 2010 que no dicen «condensación» son convencionales.</li></ul>`);
          } },
        { id: 'catalogo', x: 66, y: 20, emoji: '📰', s: 5, label: 'Catálogo de mejoras',
          look(g) {
            g.doc('📰 Catálogo «Reforma tu letra» — precios cerrados (dicen)', `<table class="tbl">${MEJORAS.map((m) => `<tr><td>${m.name}</td><td>${fmt(m.cost)} €</td></tr>`).join('')}</table>
              <p class="small">Los burletes y la pintura blanca no computan en el certificado, pero quedan monísimos.</p>`);
          } },
        { id: 'requisitos', x: 82, y: 20, emoji: '📋', s: 5, label: 'Requisitos de habitabilidad',
          look(g) {
            g.doc('📋 Cédula de habitabilidad — requisitos mínimos', `<ul>
              <li>Certificado de eficiencia energética de letra <b>D o mejor</b>.</li>
              <li><b>Dormitorio:</b> mínimo 6 m² y ventana al exterior.</li>
              <li><b>Despacho:</b> ventana al exterior.</li>
              <li><b>Trastero interior:</b> sin ventana, máximo 4 m².</li>
              <li><b>Vestidor:</b> sin requisitos de ventana; máximo 6 m².</li></ul>
              <p class="small">Toda pieza debe declararse con un uso que cumpla sus requisitos.</p>`);
          } },
        { id: 'nevera', x: 72, y: 46, emoji: '🧊', s: 5, label: 'Nota en la nevera',
          look(g) { g.say('Nota de tu pareja: «Las persianas del salón: por la mañana no entra ni un rayo, pero a partir de las cinco de la tarde aquello es un horno. Compra cortinas. Y no te gastes más de lo que tenemos. Te quiero.»'); } },
        { id: 'cajon', x: 80, y: 52, emoji: '🗄️', s: 5, label: 'Cajón de la cocina',
          look(g) {
            if (g.flag('mech')) return g.say('Gomas elásticas, pilas gastadas y la garantía de una tostadora que ya no existe.');
            g.set('mech'); g.give('mechero');
            g.say('Entre gomas y pilas encuentras un mechero.');
          } },
        { id: 'enchufe', x: 27, y: 46, emoji: '🔌', s: 4, label: 'Enchufe de la pared exterior',
          look(g) { g.say('Un enchufe en el muro de fachada. La tapa está atornillada. Detrás se esconde la verdad sobre tu aislamiento.'); },
          use: {
            destornillador(g) { g.set('camara'); g.say('Quitas la tapa: detrás del ladrillo hay una <b>cámara de aire vacía</b>. Ni lana, ni corcho, ni nada: aire y una pelusa de 1974.'); },
          } },
        { id: 'caldera', x: 92, y: 30, emoji: '♨️', s: 5, label: 'Caldera',
          look(g) { g.say('Placa de la caldera: «Caldera mural de <b>gas natural</b>. Año de fabricación: <b>1998</b>. Tipo: estándar». De condensación, nada. De ruido, mucho.'); } },
        { id: 'termo', x: 92, y: 52, emoji: '🛁', s: 5, label: 'Baño (termo)',
          look(g) { g.say('En el baño hay un <b>termo eléctrico</b> de 80 litros. El agua caliente dura exactamente lo que tardas en enjabonarte.'); } },
        { id: 'cuarto', x: 8, y: 50, emoji: '🚪', s: 9, label: 'Cuarto interior',
          look(g) { g.say('El cuarto interior: <b>2,50 × 2,00 m</b> (5 m²). <b>No tiene ventana</b>. Tu pareja lo llama «el dormitorio de invitados»; los invitados lo llaman «la celda».'); } },
        { id: 'herramientas', x: 12, y: 82, emoji: '🧰', s: 5, label: 'Caja de herramientas',
          look(g) {
            if (g.flag('dest')) return g.say('Tornillos sobrantes de la reforma. Siempre sobran tornillos. Nadie sabe de dónde.');
            g.set('dest'); g.give('destornillador');
            g.say('Coges un destornillador plano.');
          } },
        { id: 'movil', x: 52, y: 80, emoji: '📱', s: 4, label: 'Tu móvil (en el suelo)',
          look(g) { g.say('App del banco: saldo disponible <b>3.000 €</b>. Notificación: «¿Le interesa un préstamo personal al 14 % TAE?». No.'); } },
        { id: 'portatil', x: 66, y: 52, emoji: '💻', s: 5, label: 'Portátil (registro de certificados)',
          look(g) {
            if (g.has('certEnergetico') || g.flag('cedula')) return g.say('Certificado registrado. El portátil se ha puesto en modo ahorro de energía, por solidaridad.');
            ceeModal(g);
          } },
        { id: 'inspector', x: 60, y: 82, emoji: '🕵️', s: 6, label: 'Inspector de habitabilidad',
          look(g) { g.say('—Para la cédula, tráigame el certificado energético registrado. Letra D o mejor. Y prepárese: luego le preguntaré por cada habitación.', 'Inspector'); },
          use: {
            certEnergetico(g) {
              g.choice({
                title: '🕵️ Inspección de habitabilidad',
                text: '—Certificado D, correcto. Ahora, ese cuarto interior de 5 m² sin ventana... ¿Cómo lo declara?',
                options: ['Dormitorio', 'Despacho', 'Trastero interior', 'Vestidor'].map((u) => ({
                  label: u,
                  onPick(gg, msg) {
                    if (u !== 'Vestidor') {
                      gg.sfx('bad');
                      msg({ Dormitorio: '—¿Dormitorio sin ventana? Eso no es un dormitorio, es un zulo con cama.', Despacho: '—Un despacho necesita ventana. Aunque teletrabaje usted mirando una pared.', 'Trastero interior': '—Un trastero interior no puede pasar de 4 m². Este tiene 5.' }[u], true);
                      return false;
                    }
                    gg.take('certEnergetico'); gg.set('cedula');
                    gg.say('—Vestidor de 5 m². Perfecto: sin ventana y menos de 6 m². Aquí tiene su <b>cédula de habitabilidad</b>. Su casa es habitable. Oficialmente. Lo de vivir ya es cosa suya.', 'Inspector');
                    gg.win();
                    return true;
                  },
                })),
              });
            },
          } },
      ],
      hints: [
        'Investiga la casa: el cajón de la cocina y la caja de herramientas tienen lo que necesitas. Usa el mechero en la ventana y el destornillador en el enchufe. Lee la guía, la caldera, el baño y la nota de la nevera.',
        'Cuatro llamas = dos vidrios (doble). Cámara vacía = sin aislamiento. Caldera de gas de 1998 sin condensación = convencional. Sol por la tarde = oeste. Termo eléctrico. Eso da 90 puntos (F). Necesitas bajar a 65 o menos con 3.000 € como máximo.',
        'En el portátil: Doble vidrio, Sin aislamiento, Caldera de gas convencional, Oeste, Termo eléctrico; mejoras: insuflar aislamiento (2.400) + conectar el agua caliente a la caldera (300) → 65 puntos, letra D. Dale el certificado al inspector y declara el cuarto como Vestidor.',
      ],
    },

    // ------------------------------------------------------ 10
    {
      title: 'La ITE',
      place: 'Portal de C/ del Olvido 14 — Edificio precintado',
      stars: 5,
      intro: 'La <b>Inspección Técnica del Edificio</b> ha salido desfavorable y el Ayuntamiento ha precintado el portal. Contigo fuera. Y con Michi dentro.<br><br>El técnico municipal solo levantará el precinto con tres cosas: la <b>fachada reparada</b>, un <b>informe de ITE veraz</b> registrado y el <b>pago de tu parte de la derrama</b>. Cuatro arquitectos han presentado informes. No todos dicen la verdad.<br><br><b>Objetivo:</b> repara la fachada, registra solo los informes veraces, paga tu derrama exacta y recupera las llaves de tu casa.',
      outro: 'El técnico municipal arranca el precinto. Subes las escaleras (el ascensor está en la ITE del año que viene), abres la puerta y Michi te mira como diciendo: «¿Dónde estabas?». Estabas en un expediente. Pero ya has vuelto.',
      scene: { wall: '#c9b79a', floor: '#6a6560', floorH: 30, pattern: 'tiles' },
      decor: [
        { kind: 'board', l: 3, t: 8, w: 15, h: 24 },
        { kind: 'column', l: 46, t: 4, w: 3, h: 66 },
        { kind: 'box', l: 80, t: 76, w: 12, h: 10, color: '#8a6d4a' },
        { emoji: '🚧', x: 70, y: 86, s: 5, o: 0.9 },
        { emoji: '🧱', x: 24, y: 88, s: 3, o: 0.9 },
      ],
      hotspots: [
        { id: 'informes', x: 10, y: 20, sign: 'INFORMES ITE', sub: '📌', w: 11, label: 'Tablón con los informes de ITE', look: informesDoc },
        { id: 'estatutos', x: 25, y: 18, emoji: '📘', s: 5, label: 'Estatutos (reparto de gastos)',
          look(g) {
            g.doc('📘 Estatutos — Reparto de gastos extraordinarios', `<ul>
              <li><b>Fachada:</b> se reparte entre <b>todos</b> los propietarios según su coeficiente.</li>
              <li><b>Cubierta y ascensor:</b> se reparten <b>solo entre las viviendas</b>, en proporción a sus coeficientes. Los <b>locales comerciales están exentos</b> «porque no usan el tejado» (lo usan, pero el bar tiene buen abogado).</li>
              <li>Las cantidades se redondean al euro, aunque aquí siempre salen exactas, porque Dios es administrador de fincas.</li></ul>`);
          } },
        { id: 'coef', x: 37, y: 18, emoji: '📊', s: 5, label: 'Cuadro de coeficientes',
          look(g) {
            g.doc('📊 Coeficientes de participación', `<table class="tbl">${J_OWN.map((o) => `<tr><td>${o.name.replace(', presidente/a', '').replace(', delegado en Doña Remedios', '').replace(', por videollamada', '')}</td><td>${o.c} %</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>100 %</b></td></tr></table>`);
          } },
        { id: 'precinto', x: 60, y: 14, sign: 'PRECINTADO', sub: 'ITE desfavorable', w: 13, label: 'Cartel del Ayuntamiento',
          look(g) { g.say('«EDIFICIO PRECINTADO POR ITE DESFAVORABLE. Prohibido el paso a toda persona, gato o expediente. Firmado: el técnico municipal (que está ahí al lado, comiéndose un bocadillo).»'); } },
        { id: 'puerta', x: 92, y: 46, emoji: '🚪', s: 13, label: 'Puerta del portal (precintada)',
          look(g) {
            if (g.flag('precOff')) return g.say('El precinto ya no está. Usa tus llaves.');
            g.say('Una cinta roja y blanca cruza la puerta. Al otro lado, en la ventana del 3ºB, Michi te observa con desprecio.');
          },
          use: {
            llaves(g) {
              if (!g.flag('precOff')) return g.say('Primero tiene que quitar el precinto el técnico municipal.');
              g.take('llaves');
              g.say('Metes la llave. Gira. La puerta se abre. Hueles a portal recién pintado... no, eso no se aprobó. Huele a portal. A tu portal.');
              g.win();
            },
          } },
        { id: 'tecnico', x: 76, y: 52, emoji: '👷‍♂️', s: 6, label: 'Técnico municipal',
          look(g) {
            if (g.flag('precOff')) return g.say('—Precinto levantado. Le doy cinco años antes de la próxima ITE. Disfrútelos.', 'Técnico municipal');
            const need = { certFachada: 'el certificado de reparación de la fachada', informeITE: 'el informe de ITE veraz, registrado', justDerrama: 'el justificante de pago de su parte de la derrama' };
            const miss = Object.keys(need).filter((k) => !(g.flag('dlv') || []).includes(k));
            g.say(`—Para levantar el precinto me falta: ${miss.map((k) => need[k]).join('; ')}. Y date prisa, que se me acaba el bocadillo.`, 'Técnico municipal');
          },
          use: Object.fromEntries(['certFachada', 'informeITE', 'justDerrama'].map((k) => [k, (g) => {
            const d = g.flag('dlv') || [];
            g.take(k); d.push(k); g.set('dlv', d); g.sfx('stamp');
            if (d.length === 3) {
              g.set('precOff'); g.give('llaves');
              g.say('—Fachada, informe y derrama. Todo en regla. ¡RAS! Arranca el precinto. —Aquí tiene sus llaves, que las había requisado «por protocolo».', 'Técnico municipal');
            } else g.say(`—Recibido. Llevo ${d.length} de 3. El bocadillo, 2 de 3.`, 'Técnico municipal');
          }])) },
        { id: 'andamio', x: 58, y: 44, emoji: '🏗️', s: 9, label: 'Andamio de la fachada',
          look(g) {
            if (!g.flag('andamioOK')) return g.say('El andamio está cerrado con un candado. Un cartel: «Prohibido subir sin casco y sin permiso de Tomás».');
            fachadaModal(g);
          },
          use: { llaveAndamio(g) { g.take('llaveAndamio'); g.set('andamioOK'); g.say('Abres el candado y subes al andamio. Desde aquí ves la fachada: llena de grietas. Toca martillo.'); } } },
        { id: 'albanil', x: 38, y: 56, emoji: '👷', s: 6, label: 'Tomás, el albañil',
          look(g) {
            if (g.flag('llaveT')) return g.say('—Recuerda: cada martillazo arregla la pieza que golpeas si está agrietada (y la agrieta si está sana), y lo mismo hace con las de arriba, abajo, izquierda y derecha. Es el oficio.', 'Tomás (albañil)');
            g.say('—¿Quieres arreglar la fachada tú? Sin casco no te doy la llave del andamio, que luego el seguro me pregunta. Hay uno en la caseta de obra.', 'Tomás (albañil)');
          },
          use: { casco(g) { g.take('casco'); g.set('llaveT'); g.give('llaveAndamio'); g.say('—Con casco, ya eres de la profesión. Toma la llave del andamio. Ojo: cada martillazo afecta también a las piezas de arriba, abajo, izquierda y derecha.', 'Tomás (albañil)'); } } },
        { id: 'caseta', x: 12, y: 60, emoji: '🛖', s: 8, label: 'Caseta de obra',
          look(g) {
            if (g.flag('cascoT')) return g.say('Dentro: un calendario de 1997, un transistor y un bocadillo de chorizo con fecha de caducidad en latín.');
            g.set('cascoT'); g.give('casco');
            g.say('En la caseta hay un casco de obra colgado. Te lo pones. Te queda grande, pero da autoridad.');
          } },
        { id: 'registro', x: 26, y: 58, emoji: '🗃️', s: 6, label: 'Buzón del Registro municipal de ITE', look: registroITEModal },
        { id: 'admin', x: 52, y: 80, emoji: '🧑‍💼', s: 6, label: 'El administrador (cobrando la derrama)',
          look(g) {
            if (g.has('justDerrama') || (g.flag('dlv') || []).includes('justDerrama')) return g.say('—Pagado. Ya puede usted volver a quejarse del administrador como un vecino más.', 'Administrador');
            g.input({
              title: '💸 Derrama de la ITE',
              text: '—Dígame cuánto le toca pagar a usted, el 3ºB. Exacto. Las obras son las de los informes veraces, repartidas según los estatutos. Si me dice de menos, no le doy justificante; si me dice de más, tampoco (aunque me encantaría).',
              numeric: true, maxLen: 5,
              check: (v) => +v === 7020,
              failText: (v) => (+v === 6588 ? '—Ha repartido la cubierta también entre el local. El bar está exento de la cubierta.' : +v === 7843 ? '—Ha exonerado al bar también de la fachada. Esa la pagamos todos.' : +v === 1080 || +v === 13500 ? '—Esos son números de un informe mentiroso.' : rand(['—No. Fachada entre todos, cubierta solo entre viviendas. Y solo los presupuestos veraces.', '—Incorrecto. Revise qué informes dicen la verdad antes de hacer cuentas.'])),
              ok: () => { g.give('justDerrama'); g.say('—7.020 €: 4.320 de fachada y 2.700 de cubierta. Exacto. Aquí tiene el justificante. Y la factura de mis honorarios, que va aparte.', 'Administrador'); },
            });
          } },
        { id: 'pura', x: 88, y: 76, emoji: '👩‍🦳', s: 5, label: 'Doña Pura, en la acera',
          look(g) { g.say('—Yo voté que no a la ITE. Por principio. Ahora llevo dos días durmiendo en casa de mi hermana, que también vota que no a todo. Nos entendemos.', 'Doña Pura'); } },
      ],
      hints: [
        'Tres frentes: (1) casco de la caseta → Tomás te da la llave del andamio → usa la llave en el andamio y repara la fachada; (2) lee los informes del tablón: unos mienten y otros no; (3) con los presupuestos veraces, calcula tu derrama con los estatutos y los coeficientes.',
        'Lógica: si Diego (D) mintiera, Adela y Bruno dirían la verdad... pero Adela dice que solo uno la dice: contradicción. Así que D es veraz, y por tanto C también, y A y B mienten. Derrama: fachada 48.000 × 9 %; cubierta 25.200 repartida solo entre viviendas (el local, 16 %, exento). Fachada: cada golpe cambia la pieza y sus vecinas en cruz.',
        'Fachada: golpea A1, C2, B3 y D4. Registro de ITE: marca solo C y D. Derrama: 48.000 × 9 % = 4.320 + 25.200 × 9/84 = 2.700 → 7020. Entrega certificado, informe y justificante al técnico municipal y usa las llaves en la puerta.',
      ],
    },
  ];

  // =========================================================
  //  REGISTRO DE LA TEMPORADA
  // =========================================================
  window.registerSeason({
    id: 3,
    title: 'Mi casa es un expediente',
    subtitle: 'Alquilar, hipotecarse, registrar, tributar y reformar. En ese orden. Si te dejan.',
    badge: 'Propietario',
    emoji: '🏠',
    intro: 'Quieres un techo. Uno cualquiera. Entre tú y él se interponen un casero, un banco, el Registro, una notaría, Hacienda, el Catastro, tus vecinos, el Ayuntamiento y un dron. Diez expedientes te separan de las llaves.',
    items: ITEMS,
    levels: LEVELS,
    ending: {
      head: 'REGISTRO DE LA PROPIEDAD<br><small>Certificación de dominio</small>',
      title: '¡Ya tienes casa! (Más o menos)',
      html: `<div class="s3-deed">
          <div class="s3-deed-row"><small>FINCA</small><b>4478 · C/ del Olvido 14, 3ºB</b></div>
          <div class="s3-deed-row"><small>SUPERFICIE ÚTIL</small><b>60 m² (72 en escritura, 96 según el dron)</b></div>
          <div class="s3-deed-row"><small>CARGAS</small><b>Hipoteca variable a 30 años · Euríbor + 0,60</b></div>
          <div class="s3-deed-row"><small>OCUPANTES</small><b>Tú, tu pareja y Michi (que manda)</b></div>
        </div>
        <p>Tras un casero, un banco, el Registro, una notaria, Hacienda, el Catastro, una junta de vecinos, una licencia, un certificado energético y una ITE, por fin abres la puerta de tu casa.</p>
        <p>Te quedan <b>359 cuotas</b> de hipoteca, una derrama pendiente para el ascensor y la próxima ITE en cinco años. Pero esta noche duermes en lo tuyo. <b>Bueno, en lo del banco.</b></p>`,
      stamp: 'LLAVES ENTREGADAS',
    },
    css: `
      .s3-tbl th { text-align: left; font-size: 12px; border-bottom: 2px solid var(--line, #ccc); padding: 4px; }
      .s3-tbl td { vertical-align: top; }
      .s3-tbl td:last-child { text-align: left; font-weight: 500; }
      .s3-form input[type=text], .s3-form input:not([type]), .s3-form select { font: inherit; padding: 6px 8px; border: 1px solid rgba(0,0,0,.3); border-radius: 6px; }
      .s3-form .chk { font-size: 14px; }
      .s3-twin { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .s3-twin > div { border: 2px dashed rgba(0,0,0,.3); border-radius: 8px; padding: 10px; }
      .s3-plan-wrap { display: grid; grid-template-columns: auto 1fr auto; gap: 6px; align-items: stretch; position: relative; }
      .s3-fach { writing-mode: vertical-rl; text-orientation: mixed; font-size: 11px; background: #8d7f6e; color: #fff; border-radius: 4px; padding: 6px 3px; text-align: center; }
      .s3-plan { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; }
      .s3-cell { min-height: 54px; border: 2px solid #333; border-radius: 4px; display: grid; place-items: center; text-align: center; font-size: 12px; line-height: 1.2; padding: 2px; }
      .s3-tr { background: #f6e7b4; }
      .s3-pas { background: #e7e7e7; color: #666; }
      .s3-cont { background: #cfe3f5; }
      .s3-asc { background: #d9d2e9; }
      .s3-cal { background: #f3c9b8; }
      .s3-rose { grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; font-size: 13px; }
      .s3-rose span { font-size: 26px; color: #b3261e; }
      .s3-acta { margin-top: 10px; max-height: 340px; overflow: auto; }
      .s3-acta .tbl { font-size: 12px; margin: 2px 0; }
      .s3-docs { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 6px; margin: 8px 0; }
      .s3-docs .opt[disabled] { opacity: .5; cursor: default; }
      .s3-lo-grid { display: grid; grid-template-columns: 24px repeat(4, 52px); gap: 4px; justify-content: center; align-items: center; margin: 10px auto; }
      .s3-lo-h { text-align: center; font-weight: 800; font-size: 13px; }
      .s3-lo-grid .tile { background: #e9e4da; }
      .s3-lo-grid .tile.on { background: #c96b4b; color: #fff; }
      .s3-deed { border: 2px solid #7a6040; border-radius: 10px; padding: 12px 14px; background: #fbf6ea; margin: 0 auto 12px; max-width: 460px; text-align: left; }
      .s3-deed-row { display: flex; flex-direction: column; margin-bottom: 6px; }
      .s3-deed-row small { font-size: 10px; letter-spacing: .08em; color: #7a6040; }
    `,
  });
})();
