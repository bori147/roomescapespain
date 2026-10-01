/* ==========================================================
   VUELVA USTED MAÑANA — Temporada 5: «Las altas esferas»
   Sátira. Todos los personajes, grupos parlamentarios, cargos y
   organismos concretos son ficticios.
   ========================================================== */
(function () {
  'use strict';
  const { rand, norm, caesar } = window.GameUtils;

  // =========================================================
  //  UTILIDADES
  // =========================================================
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  /** Calendario mensual en HTML. marks = { día: 'texto del festivo' } */
  function calHTML(y, m, marks = {}) {
    const first = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7; // 0 = lunes
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    let h = `<div class="s5-cal"><div class="s5-cal-t">${MONTHS[m]} ${y}</div><div class="s5-cal-g">${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<b>${d}</b>`).join('')}`;
    for (let i = 0; i < first; i++) h += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const wd = (first + d - 1) % 7;
      h += `<span class="${wd >= 5 ? 'we' : ''}${marks[d] ? ' hol' : ''}">${d}</span>`;
    }
    h += '</div>';
    const notes = Object.entries(marks).map(([d, t]) => `<b>${d}</b>: ${t}`).join(' · ');
    if (notes) h += `<div class="s5-cal-n">${notes}</div>`;
    return h + '</div>';
  }
  const digits = (v) => String(v == null ? '' : v).replace(/\D/g, '');

  // =========================================================
  //  OBJETOS
  // =========================================================
  const DNI_DESC = 'DNI nº <b>07345189-R</b>. PACIENTE SUFRIDO/A, CIUDADANO/A. <b>Válido hasta el 01-10-2036.</b> Lo renovaste en octubre de 2026, con sangre, sudor y cita previa. Desde entonces no te has separado de él.';
  const ITEMS = {
    // Traídos de temporadas anteriores
    dni: { emoji: '🪪', name: 'Tu DNI', desc: DNI_DESC },
    cartaMesa: { emoji: '✉️', name: 'Carta de la Junta Electoral', desc: 'Carta certificada de la Junta Electoral de Zona de Villatrámite, de las que dan miedo.<br>Destinatario: <b>PACIENTE SUFRIDO/A, CIUDADANO/A</b><br>Domicilio: <b>C/ del Olvido 14, 3ºB</b>, Villatrámite.<br>«Ha sido usted designado/a para formar parte de la <b>Mesa 03-013-C</b> en las elecciones anticipadas…». Otra vez. Es la carta que te hizo opositar.' },
    // Nivel 1
    boli: { emoji: '🖊️', name: 'Bolígrafo azul', desc: 'Bolígrafo de propaganda de una academia: «Aprobar es fácil (si apruebas)». Escribe. Por ahora.' },
    cuadernillo: { emoji: '📘', name: 'Cuadernillo de preguntas', desc: 'El cuadernillo del primer ejercicio: cinco preguntas. Para leerlo con calma, siéntate en tu pupitre.' },
    hoja: { emoji: '📄', name: 'Hoja de respuestas', desc: 'Hoja de lectura óptica. <b>Rellénese EXCLUSIVAMENTE con lápiz del nº 2.</b> Cualquier otra cosa será anulada por la máquina, que no tiene sentido del humor. (Combínala con algo para escribir.)' },
    impreso: { emoji: '📋', name: 'Impreso L-2 (en blanco)', desc: 'Impreso L-2: «Solicitud de material fungible de escritura (lápiz)». Campo obligatorio: <b>nº de opositor</b>. Al pie: «Rellénese con bolígrafo: el lápiz se borra».' },
    impresoOk: { emoji: '🗒️', name: 'Impreso L-2 relleno', desc: 'Impreso L-2 relleno a bolígrafo con tu número de opositor. Canjeable por un (1) lápiz.' },
    lapiz: { emoji: '✏️', name: 'Lápiz del nº 2', desc: 'Un lápiz del nº 2, con punta. Te ha costado un impreso, un bolígrafo y diez minutos de examen.' },
    apto: { emoji: '🎓', name: 'Certificado de APTO', desc: 'Certificado del tribunal calificador: <b>APTO/A</b>. Opositor/a nº <b>1147</b> · DNI 07345189-R. Debajo, tres sellos más: segundo, tercer y cuarto ejercicio. Sin este papel no se toma posesión de nada.' },
    // Nivel 2
    ticket: { emoji: '🎫', name: 'Ticket INC-3906', desc: 'Ticket del CAU: «Incidencia INC-3906. El usuario no tiene ordenador. Prioridad: baja. Causa probable: el usuario».' },
    portatil: { emoji: '💻', name: 'Portátil sin batería', desc: 'Un portátil de 2014 con pegatina del CAU. Batería: 0 %. Sin cargador: «el cargador, en el almacén», dijo el técnico, como quien dice «en Narnia».' },
    cargador: { emoji: '🔌', name: 'Cargador', desc: 'Un cargador de portátil enrollado con mimo. Es lo único ordenado de todo el almacén.' },
    portatilOk: { emoji: '🖥️', name: 'Tu portátil (con cargador)', desc: 'Portátil de 2014 con su cargador, inventariado a tu nombre por el CAU. Arranca en once minutos y pide 43 actualizaciones. Funciona, que no es poco. Fondo de pantalla: Michi, durmiendo sobre el tema 237.' },
    tarjeta: { emoji: '💳', name: 'Tarjeta de empleado público', desc: 'Tarjeta de empleado público con chip: PACIENTE SUFRIDO/A, CIUDADANO/A · Cuerpo Superior de Tramitadores · <b>NRP 3906</b>. Abre tornos, lectores de tarjetas y, con suerte, alguna puerta.' },
    grapadora: { emoji: '📎', name: 'Grapadora', desc: 'Una grapadora metálica de 1992, pesada como un expediente sancionador. Con grapas, que es lo raro.' },
    llave: { emoji: '🔑', name: 'Llave del almacén', desc: 'Llave del almacén de la planta 3. Llavero: «NO PERDER (OTRA VEZ)».' },
    silla: { emoji: '💺', name: 'Silla PAT-0317-B', desc: 'Tu silla reglamentaria, nº de inventario PAT-0317-B. Gira. Cojea un poco. Es perfecta.' },
    // Nivel 3
    pres2023: { emoji: '📒', name: 'Presupuesto 2023', desc: '<b>Presupuestos Generales 2023</b> (los últimos aprobados). Totales por capítulos, en miles de €:<br>Cap. 1 Personal: <b>1.000</b> · Cap. 2 Gastos corrientes: 760 · Cap. 6 Inversiones: 540 · Total: 2.300.<br><small>Los importes de 2023 por ministerio ya no sirven: desde entonces hubo siete reorganizaciones y un ministerio se perdió en una mudanza.</small>' },
    cuadroOk: { emoji: '📊', name: 'Cuadro de créditos fiscalizado', desc: 'Cuadro de créditos prorrogados 2033, con el sello del Interventor: «<b>Fiscalización de conformidad</b>». Acredita que existe crédito para la cofinanciación nacional de los fondos europeos. Es el papel más valioso del Ministerio (y el único sin café).' },
    // Nivel 4
    adenda2: { emoji: '📃', name: 'Adenda nº 2 (arrugada)', desc: '<b>ADENDA Nº 2 a la Guía de elegibilidad.</b> «No son elegibles los gastos de catering, aperitivos ni vinos de honor, aunque sean ecológicos, de kilómetro cero o se sirvan en vajilla reciclada.»' },
    informe: { emoji: '📑', name: 'Informe del auditor europeo', desc: 'Informe de auditoría, ref. MRR-2032-1147: «<b>Hito alcanzado. Fondos justificados.</b>» Firmado a las 23:59:58 del 31 de diciembre, con un asentimiento. La Representación en Bruselas lo espera como agua de mayo.' },
    // Nivel 5
    nota: { emoji: '✉️', name: 'Nota cifrada', desc: 'Nota interna de la Representación Permanente:<br><code class="cipher">(3,26) (3,27) (3,1) (2,28) (4,4) (1,19) (6,27) (5,8) (6,29) (5,11) (2,27) (5,13)</code><br>Al pie: «Cifrado por el método habitual. Si no lo conoce, pregunte al becario (o lea su manual)».' },
    grapadoraUE: { emoji: '📎', name: 'Grapadora homologada UE', desc: 'Regalo de la Representación Permanente: grapadora homologada conforme al <b>Reglamento (UE) 2032/97</b> (grapa única, ángulo de 45°). «Para que en España se enteren». Pesa casi tanto como la de 1992 del conserje.' },
    // Nivel 6
    textoLey: { emoji: '📄', name: 'Texto aprobado (sin grapar)', desc: 'El texto definitivo de la Ley de Simplificación de Reclamaciones, tal como sale de las votaciones. Hojas sueltas: el Letrado no lo remite al Pleno sin grapar «conforme a la normativa europea».' },
    ley: { emoji: '📘', name: 'Ley de Simplificación de Reclamaciones', desc: '<b>Ley de Simplificación de Reclamaciones</b>, aprobada y publicada en el BOE. Grapa única, ángulo de 45°. «Los ciudadanos podrán presentar reclamaciones debidamente motivadas en el plazo de quince días naturales, por escrito, en la ventanilla correspondiente o en la de al lado.»' },
    // Nivel 7
    acuseTC: { emoji: '🧾', name: 'Copia sellada de las alegaciones', desc: 'Copia sellada por el Registro General del Tribunal Constitucional: alegaciones del Gobierno en el <b>recurso 1147-2033</b>, presentadas en plazo. Nota a lápiz del funcionario: «Recurso paralizado: falta renovar el Consejo Superior de la Toga».' },
    // Nivel 8
    nombramiento: { emoji: '📰', name: 'Nombramiento de ministro/a', desc: 'BOE de esta mañana: «Real Decreto por el que se nombra <b>Ministro/a de Asuntos Pendientes</b> a PACIENTE SUFRIDO/A, CIUDADANO/A». Tinta todavía fresca. Sin esto, en el Consejo de Ministros no te dejan ni sentarte (y, siendo nuevo/a, tampoco te dejan con esto).' },
    // Nivel 9
    decreto9: { emoji: '📜', name: 'Real Decreto (sin firmar)', desc: 'Real Decreto de Simplificación, Unificación y Racionalización de las Simplificaciones Anteriores. Le falta la aprobación del Presidente.' },
    rdAprobado: { emoji: '📜', name: 'Real Decreto 1147/2036 (aprobado)', desc: '<b>Real Decreto 1147/2036</b>, aprobado en el Consejo de Ministros del 1 de octubre de 2036. Disposición adicional única: nombra a PACIENTE SUFRIDO/A, CIUDADANO/A <b>Presidente/a de la Comisión para la Simplificación Total</b>, con acceso a la Caja de los Cuatro Sellos.' },
    // Nivel 10
    selloRegistro: { emoji: '🟥', name: 'Sello de Registro', desc: 'Sello del Registro General. Leyenda grabada: <b>«EL SIETE»</b>.' },
    selloHacienda: { emoji: '🟩', name: 'Sello de Hacienda', desc: 'Sello de Hacienda. Lleva grabada su cifra: <b>5</b> (lo que cuesta un timbre, cómo no).' },
    selloEuropa: { emoji: '🟦', name: 'Sello de Europa', desc: 'Sello de la Representación ante la UE. Cifra: <b>3</b>. Doce estrellas entre cuatro: la aritmética comunitaria.' },
    selloSenado: { emoji: '🟨', name: 'Sello del Senado', desc: 'Sello del Senado. Cifra: <b>1</b>, la de la única puerta honrada del edificio.' },
    decreto10: { emoji: '📜', name: 'Decreto de Simplificación Total', desc: '<b>Decreto de Simplificación Total.</b> Artículo único: «Quedan suprimidos todos los trámites, salvo este». Solo falta tu firma en la mesa presidencial.' },
  };

  // =========================================================
  //  NIVEL 1 — Las oposiciones
  // =========================================================
  const L1Q = [
    { q: 'Continúe la serie: <b>3 · 4 · 7 · 16 · 43 · ¿?</b>', o: ['124', '129', '86', '130'] },
    { q: 'Continúe la serie: <b>A · C · F · J · ¿?</b>', o: ['Ñ', 'O', 'P', 'N'] },
    { q: 'Ningún jefe de negociado contesta al teléfono. Algunos funcionarios que contestan al teléfono son interinos. Por tanto, necesariamente:', o: ['Algunos interinos no son jefes de negociado.', 'Ningún interino es jefe de negociado.', 'Todos los interinos contestan al teléfono.', 'Algunos jefes de negociado son interinos.'] },
    { q: '¿Cuántos temas <b>vigentes</b> tiene el temario oficial de esta convocatoria?', o: ['450', '451', '452', '500'] },
    { q: 'Un auxiliar tarda 3 días en informar un expediente. Su jefe tarda el doble que él más uno. Y el jefe del jefe, el doble que el jefe más uno. ¿Cuántos días pasa el expediente, en total, entre los tres?', o: ['17', '25', '21', '15'] },
  ];
  const L1KEY = ['A', 'B', 'A', 'B', 'B'];
  const L1_INSTR = '<p class="small"><b>Instrucciones:</b> marque una sola respuesta por pregunta. En las series de letras se utiliza el <b>alfabeto español de 27 letras</b> (A … N, Ñ, O … Z). Las erratas publicadas en el tablón de anuncios <b>prevalecen</b> sobre este cuadernillo.</p>';
  function l1QuestionsHTML(withButtons, ans) {
    return L1Q.map((x, i) => `<div class="s5-q"><p><b>${i + 1}.</b> ${x.q}</p><div class="s5-qo">${x.o.map((o, j) => {
      const L = 'ABCD'[j];
      return withButtons
        ? `<button class="opt s5-ans ${ans[i] === L ? 'on' : ''}" id="s5-a${i + 1}${L}" data-q="${i}" data-o="${L}"><b>${L})</b> ${o}</button>`
        : `<span><b>${L})</b> ${o}</span>`;
    }).join('')}</div></div>`).join('');
  }
  function answerModal(g) {
    g.modal({
      title: '✏️ Hoja de respuestas (a lápiz)',
      cls: 'wide',
      html: `${L1_INSTR}<div id="s5-sheet"></div><p class="small">Las respuestas se marcan a lápiz y se guardan solas. Cuando termines, entrega la hoja al tribunal.</p>`,
      onMount(body) {
        const box = body.querySelector('#s5-sheet');
        const render = () => {
          const ans = g.flag('ans') || [];
          box.innerHTML = l1QuestionsHTML(true, ans);
          box.querySelectorAll('.s5-ans').forEach((b) => {
            b.onclick = () => {
              const a = (g.flag('ans') || [null, null, null, null, null]).slice();
              a[+b.dataset.q] = b.dataset.o;
              g.set('ans', a);
              g.sfx('click');
              render();
            };
          });
        };
        render();
      },
    });
  }

  // =========================================================
  //  NIVEL 2 — Toma de posesión
  // =========================================================
  function l2Posesion(g) {
    g.say('—Perfecto. Firme aquí, aquí y aquí. Queda usted en posesión de su cargo. Bienvenido/a a la casa. No toque nada.', 'Subsecretaria');
    g.say('—Tome su tarjeta de empleado público: lleva su NRP y abre los lectores de todos los ministerios. Y el portátil, lléveselo: está inventariado a su nombre y le seguirá a cada destino. Como una maldición, pero con cargador.', 'Subsecretaria');
    g.give('tarjeta'); g.give('portatilOk');
    g.win();
  }

  // =========================================================
  //  NIVEL 3 — Presupuestos
  // =========================================================
  const BUD_ROWS = [
    ['AP', 'Asuntos Pendientes', [420, null, 100, 700]],
    ['SA', 'Simplificación Administrativa', [null, 90, null, 600]],
    ['IV', 'Igualdad de Ventanillas', [250, null, null, null]],
    ['MR', 'Reuniones y Comisiones', [null, 390, 90, 600]],
    ['T', '<b>TOTAL</b>', [null, null, null, null]],
  ];
  const BUD_COLS = ['1', '2', '6', 'T'];
  const BUD_SOL = { AP2: 180, SA1: 310, SA6: 200, IV2: 140, IV6: 110, IVT: 500, MR1: 120, T1: 1100, T2: 800, T6: 500, TT: 2400 };
  function budgetModal(g) {
    const vals = g.flag('bud') || {};
    const head = '<tr><th>Sección</th><th>Cap. 1<br><small>Personal</small></th><th>Cap. 2<br><small>Corrientes</small></th><th>Cap. 6<br><small>Inversiones</small></th><th>Total</th></tr>';
    const rows = BUD_ROWS.map(([k, name, cells]) => `<tr class="${k === 'T' ? 's5-tot' : ''}"><td>${name}</td>${cells.map((v, i) => {
      const id = k + BUD_COLS[i];
      return v != null ? `<td>${v.toLocaleString('es-ES')}</td>` : `<td class="s5-stain"><input id="s5-b-${id}" data-k="${id}" inputmode="numeric" autocomplete="off" value="${vals[id] || ''}"></td>`;
    }).join('')}</tr>`).join('');
    g.modal({
      title: '📊 Cuadro de créditos prorrogados 2033',
      cls: 'wide',
      html: `<p class="small">Importes en <b>miles de euros</b>. Las casillas manchadas de café están en blanco: rellénalas. Cada fila suma su total; cada columna, el suyo.</p>
        <div class="s5-scroll"><table class="s5-bud">${head}${rows}</table></div><div class="msg" id="s5-bmsg"></div>`,
      onMount(body) {
        body.querySelectorAll('input[data-k]').forEach((inp) => {
          inp.oninput = () => { const v = g.flag('bud') || {}; v[inp.dataset.k] = digits(inp.value); g.set('bud', v); };
          inp.onchange = inp.oninput;
        });
      },
      buttons: [
        { label: 'Cancelar' },
        { label: '🧐 Someter a fiscalización', cls: 'primary', onClick(close, body) {
          const v = {};
          body.querySelectorAll('input[data-k]').forEach((inp) => { v[inp.dataset.k] = +digits(inp.value); });
          g.set('bud', Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x ? String(x) : ''])));
          const msg = body.querySelector('#s5-bmsg');
          if (Object.keys(BUD_SOL).every((k) => v[k] === BUD_SOL[k])) {
            g.closeModal();
            g.say('El Interventor repasa el cuadro con una regla de madera, fila a fila, columna a columna. Suspira. Sella. «Fiscalización de conformidad». Es la primera vez que lo dice desde 2023 y le tiembla la voz. Te entrega el cuadro sellado: «Guárdelo como oro. Sin él, no hay crédito ni para un clip».', 'Interventor General');
            g.give('cuadroOk');
            g.win();
            return true;
          }
          g.sfx('bad');
          msg.className = 'msg bad';
          if (v.TT === 2 || v.TT === 24 || v.TT === 2400000) msg.textContent = '«¿Y esas unidades?», gruñe el Interventor. «El cuadro va en MILES de euros».';
          else msg.textContent = rand(['«Esto no cuadra», dice el Interventor, y le pone catorce reparos con tinta roja.', '«Reparo suspensivo». El Interventor no explica cuál falla: «Eso sería asesorar, y yo fiscalizo».', 'El Interventor suma de cabeza y niega despacio. Alguna casilla no casa con el techo de gasto o con las sumas.']);
          return false;
        } },
      ],
    });
  }

  // =========================================================
  //  NIVEL 4 — Fondos europeos
  // =========================================================
  const FACT = [
    { r: 'R-01', n: '2032/031', c: 'Paneles solares para la sede del Ministerio', m: 'Ciudad Sede', f: '12/03/2032', p: 'Transferencia', i: '18.000 €', s: 'V' },
    { r: 'R-02', n: '2032/044', c: '40 portátiles para el Ayuntamiento', m: 'Villabajo', f: '15/01/2032', p: 'Transferencia', i: '24.000 €', s: 'D' },
    { r: 'R-03', n: '2032/052', c: 'Despliegue de fibra óptica', m: 'Quintanilla del Expediente', f: '02/05/2032', p: 'Transferencia', i: '31.000 €', s: 'C' },
    { r: 'R-04', n: '2032/060', c: 'Caldera de gasóleo «de bajo consumo» para el colegio', m: 'Villarriba', f: '20/04/2032', p: 'Transferencia', i: '9.500 €', s: 'X' },
    { r: 'R-05', n: '2032/071', c: 'Catering de churros ecológicos (Porras del Trámite, S.L.) para la jornada «La Transición Verde y Tú»', m: 'Ciudad Sede', f: '05/06/2032', p: 'Transferencia', i: '3.200 €', s: 'X' },
    { r: 'R-06', n: '2032/083', c: 'Licencia de software de gestión de expedientes', m: 'Ciudad Sede', f: '30/06/2032', p: 'Efectivo', i: '900 €', s: 'D' },
    { r: 'R-07', n: '2032/090', c: 'Puntos de recarga para coches eléctricos', m: 'Villarriba', f: '14/09/2032', p: 'Transferencia', i: '12.000 €', s: 'C' },
    { r: 'R-08', n: '2032/031', c: 'Instalación fotovoltaica en la sede del Ministerio', m: 'Ciudad Sede', f: '20/03/2032', p: 'Transferencia', i: '18.000 €', s: 'X' },
    { r: 'R-09', n: '2032/118', c: 'Sustitución de bombillas por LED en el Ayuntamiento', m: 'Villabajo', f: '31/12/2032', p: 'Transferencia', i: '4.400 €', s: 'V' },
    { r: 'R-10', n: '2032/112', c: 'Coche eléctrico oficial para el Secretario de Estado', m: 'Ciudad Sede', f: '22/11/2032', p: 'Efectivo', i: '38.000 €', s: 'X' },
    { r: 'R-11', n: '2033/002', c: 'Licencias de videoconferencia', m: 'Ciudad Sede', f: '03/01/2033', p: 'Transferencia', i: '2.100 €', s: 'X' },
  ];
  const CATS = [['', '— Sin clasificar —'], ['V', '🌱 Verde'], ['D', '💾 Digital'], ['C', '🏘️ Cohesión'], ['X', '⛔ No elegible']];
  const factTable = () => `<table class="s5-fac"><tr><th>Reg.</th><th>Nº factura</th><th>Concepto</th><th>Municipio</th><th>Fecha</th><th>Pago</th><th>Importe</th></tr>${FACT.map((x) => `<tr><td>${x.r}</td><td>${x.n}</td><td>${x.c}</td><td>${x.m}</td><td>${x.f}</td><td>${x.p}</td><td>${x.i}</td></tr>`).join('')}</table>`;
  function cafeModal(g) {
    const sel = g.flag('cls') || {};
    g.modal({
      title: '💻 Plataforma CAFÉ-MRR — Justificación',
      cls: 'wide',
      html: `<p class="small">Asigne cada factura a su componente o márquela como no elegible. El auditor revisará el conjunto: o todo bien, o nada.</p>
        <div class="s5-scroll"><table class="s5-fac"><tr><th>Reg.</th><th>Nº factura</th><th>Concepto</th><th>Municipio</th><th>Fecha</th><th>Pago</th><th>Importe</th><th>Componente</th></tr>
        ${FACT.map((x, i) => `<tr><td>${x.r}</td><td>${x.n}</td><td>${x.c}</td><td>${x.m}</td><td>${x.f}</td><td>${x.p}</td><td>${x.i}</td><td><select id="s5-f${i + 1}" data-i="${i}">${CATS.map(([v, t]) => `<option value="${v}" ${sel[i] === v ? 'selected' : ''}>${t}</option>`).join('')}</select></td></tr>`).join('')}
        </table></div><div class="msg" id="s5-fmsg"></div>`,
      onMount(body) {
        body.querySelectorAll('select[data-i]').forEach((s) => {
          s.onchange = () => { const v = g.flag('cls') || {}; v[s.dataset.i] = s.value; g.set('cls', v); };
        });
      },
      buttons: [
        { label: 'Cancelar' },
        { label: '🇪🇺 Enviar a Bruselas', cls: 'primary', onClick(close, body) {
          const v = {};
          body.querySelectorAll('select[data-i]').forEach((s) => { v[s.dataset.i] = s.value; });
          g.set('cls', v);
          const msg = body.querySelector('#s5-fmsg');
          if (FACT.some((x, i) => !v[i])) { g.sfx('bad'); msg.className = 'msg bad'; msg.textContent = 'Quedan facturas sin clasificar. La plataforma no admite «ya lo miraré».'; return false; }
          if (FACT.every((x, i) => v[i] === x.s)) {
            g.closeModal();
            g.say('El auditor revisa factura por factura. No parpadea. Ni siquiera ante los churros. Al final, asiente una vez (es su forma de sonreír) y firma su informe: «Hito alcanzado. Fondos justificados». Te lo entrega. Suenan las doce. Alguien descorcha el cava, que, por cierto, tampoco es elegible.', 'Auditor europeo');
            g.give('informe');
            g.win();
            return true;
          }
          g.sfx('bad'); msg.className = 'msg bad';
          msg.textContent = rand(['El auditor devuelve la justificación sin decir palabra. Hay al menos un error. No dirá cuál: eso sería «asistencia técnica», y está en otro programa.', '«Irregularidad detectada». El auditor anota algo en una libreta negra. Revise la guía, las adendas y el padrón.', 'Rechazada. «En Bruselas no se clasifica a ojo», dice el auditor, mirándote a ti y a tu ojo.']);
          return false;
        } },
      ],
    });
  }

  // =========================================================
  //  NIVEL 5 — Bruselas (cifrado considerando-palabra)
  // =========================================================
  const REG_B = [
    'Las diferencias entre los Estados miembros en el grapado de documentos oficiales dificultan la libre circulación de expedientes y constituyen un obstáculo para el mercado interior.',
    'En algunos Estados la grapa se coloca en la esquina superior izquierda, en otros en la derecha y en uno de ellos, que no se citará, en el centro exacto del documento.',
    'Es necesario, por tanto, establecer normas comunes que den seguridad jurídica a los ciudadanos, a las administraciones y a los fabricantes de grapadoras, que son la clave del sector.',
    'El día a día de los funcionarios demuestra que un expediente mal grapado se pierde con el doble de facilidad que uno bien grapado, según un estudio que también se perdió.',
    'Conviene prever un periodo transitorio de un mes desde la entrada en vigor para que las grapadoras existentes puedan reciclarse o, en su defecto, jubilarse con dignidad.',
    'Dado que los objetivos del presente Reglamento no pueden ser alcanzados de manera suficiente por los Estados miembros, la Unión puede adoptar medidas de conformidad con el principio de subsidiariedad.',
  ];
  const REG_A = [
    'La curvatura excesiva de los pepinos administrativos ha generado graves controversias en las ventanillas de varios Estados miembros durante los últimos quince años.',
    'Un pepino administrativo no podrá presentar una curvatura superior a diez milímetros por cada diez centímetros de longitud, salvo autorización expresa del Comité de Hortalizas.',
    'Es preciso crear dicho Comité, que se reunirá en Bruselas el primer lunes de cada mes y elaborará un informe anual sobre la curvatura media europea.',
    'Los pepinos que no cumplan esta norma serán destinados a ensaladas de uso interno de las instituciones, con el fin de evitar el despilfarro.',
    'El control de la curvatura se realizará con un transportador de ángulos homologado, que deberá calibrarse cada día laborable antes de las nueve.',
    'La Comisión evaluará la aplicación del presente Reglamento y propondrá, en su caso, ampliar su ámbito a calabacines, berenjenas y otros vegetales con ambición normativa.',
  ];
  function regDoc(g, which) {
    const A = which === 'A';
    const cons = A ? REG_A : REG_B;
    g.doc(A ? '📘 Reglamento (UE) 2032/118' : '📙 Reglamento (UE) 2032/97', `<div class="s5-eu">
      <p class="s5-eu-h">DIARIO OFICIAL DE LA UNIÓN EUROPEA · <b>${A ? 'L 66 · 12.6.2032' : 'L 77 · 30.6.2032'}</b></p>
      <p><b>REGLAMENTO (UE) ${A ? '2032/118' : '2032/97'} DEL PARLAMENTO EUROPEO Y DEL CONSEJO</b><br>de ${A ? '2 de junio' : '3 de marzo'} de 2032<br>relativo a ${A ? 'la curvatura de los pepinos administrativos' : 'la armonización del grapado de documentos oficiales'}</p>
      <p class="small">Considerando lo siguiente:</p>
      ${cons.map((c, i) => `<p>(${i + 1}) ${c}</p>`).join('')}
      <p class="small">HAN ADOPTADO EL PRESENTE REGLAMENTO: […] ${A ? 'Artículos 1 a 14: medición, tolerancias, recurso de alzada del pepino.' : 'Artículos 1 a 8: grapa única, ángulo de 45°, prohibición del clip.'}</p>
      <p><b>Artículo ${A ? '15' : '9'}. Entrada en vigor.</b> El presente Reglamento entrará en vigor el <b>vigésimo día siguiente</b> al de su publicación en el Diario Oficial de la Unión Europea.</p></div>`);
  }

  // =========================================================
  //  NIVEL 6 — Senado (enmiendas)
  // =========================================================
  const LAW0 = 'Artículo único. Los ciudadanos podrán presentar reclamaciones en el plazo de treinta días naturales, por escrito y por triplicado, en la ventanilla correspondiente.';
  const LAW_OK = 'Artículo único. Los ciudadanos podrán presentar reclamaciones debidamente motivadas en el plazo de quince días naturales, por escrito, en la ventanilla correspondiente o en la de al lado.';
  const ENM = [
    { n: 1, g: 'GAC', t: 'Modificación', d: 'Sustitúyase «treinta» por «noventa».', from: 'treinta', to: 'noventa' },
    { n: 2, g: 'GRF', t: 'Supresión', d: 'Suprímase «y por triplicado».', from: ' y por triplicado', to: '' },
    { n: 3, g: 'GPA', t: 'Modificación', d: 'Sustitúyase «naturales» por «hábiles».', from: 'naturales', to: 'hábiles' },
    { n: 4, g: 'GAC', t: 'Adición', d: 'Añádase al final, tras «correspondiente»: «o en la de al lado».', from: 'correspondiente.', to: 'correspondiente o en la de al lado.' },
    { n: 5, g: 'GRF', t: 'Modificación', d: 'Sustitúyase «noventa» por «sesenta».', from: 'noventa', to: 'sesenta' },
    { n: 6, g: 'GPA', t: 'Supresión', d: 'Suprímase «por escrito y».', from: 'por escrito y ', to: '' },
    { n: 7, g: 'GMI', t: 'Adición', d: 'Añádase tras «reclamaciones»: «debidamente motivadas».', from: 'reclamaciones', to: 'reclamaciones debidamente motivadas' },
    { n: 8, g: 'GRF', t: 'Modificación', d: 'Sustitúyase «treinta» por «quince».', from: 'treinta', to: 'quince' },
  ];
  const ST_TXT = { ok: '✔ Aprobada', no: '✘ Rechazada', dec: '⊘ Decae' };
  function senadoModal(g) {
    g.modal({
      title: '🔔 Mesa de la Comisión — Votación de enmiendas',
      cls: 'wide',
      html: '<div id="s5-sen"></div>',
      onMount(body) {
        const box = body.querySelector('#s5-sen');
        const render = (m, bad) => {
          const text = g.flag('law') || LAW0;
          const st = g.flag('enm') || {};
          box.innerHTML = `<p class="small">Procesa cada enmienda <b>en el orden reglamentario</b>: márcala como aprobada o rechazada según el resultado de la votación. Si al aprobarla el texto al que se refiere ya no existe, decae.</p>
            <div class="s5-law" id="s5-law">${text}</div>
            <div class="s5-enm">${ENM.map((e) => `<div class="s5-enm-r ${st[e.n] ? 'done' : ''}"><span><b>E${e.n}</b> · ${e.g} · <i>${e.t}</i><br>${e.d}</span>
              ${st[e.n] ? `<span class="s5-st s5-st-${st[e.n]}">${ST_TXT[st[e.n]]}</span>` : `<span class="s5-enm-b"><button class="btn" id="s5-e${e.n}-y">Aprobar</button><button class="btn" id="s5-e${e.n}-n">Rechazar</button></span>`}</div>`).join('')}</div>
            <div class="row-btns"><button class="btn" id="s5-ereset">↺ Repetir la votación</button><button class="btn primary" id="s5-esend">📨 Remitir al Pleno</button></div>
            <div class="msg ${m ? (bad ? 'bad' : 'good') : ''}">${m || ''}</div>`;
          ENM.forEach((e) => {
            const y = box.querySelector(`#s5-e${e.n}-y`);
            if (!y) return;
            const act = (approve) => {
              const cur = g.flag('law') || LAW0;
              const s = Object.assign({}, g.flag('enm') || {});
              let note;
              if (!cur.includes(e.from)) { s[e.n] = 'dec'; note = `La enmienda ${e.n} decae: el texto al que se refiere ya no existe.`; }
              else if (approve) { s[e.n] = 'ok'; g.set('law', cur.replace(e.from, e.to)); note = `Enmienda ${e.n} aprobada e incorporada al texto.`; }
              else { s[e.n] = 'no'; note = `Enmienda ${e.n} rechazada.`; }
              g.set('enm', s); g.sfx('click'); render(note);
            };
            y.onclick = () => act(true);
            box.querySelector(`#s5-e${e.n}-n`).onclick = () => act(false);
          });
          box.querySelector('#s5-ereset').onclick = () => { g.set('law', LAW0); g.set('enm', {}); g.sfx('click'); render('Se repite la votación desde el principio. Los senadores suspiran.'); };
          box.querySelector('#s5-esend').onclick = () => {
            const s = g.flag('enm') || {};
            if (ENM.some((e) => !s[e.n])) { g.sfx('bad'); return render('Quedan enmiendas sin tramitar. Ni las que decaen se saltan: hay que dejar constancia de que decaen.', true); }
            if ((g.flag('law') || LAW0) === LAW_OK) {
              g.closeModal();
              g.set('lawOk');
              g.say('El Letrado compara el texto con el acta de votación, palabra por palabra. «Conforme». Imprime el texto definitivo y te lo tiende en hojas sueltas: —Antes de remitirlo al Pleno, grápelo. Conforme a la normativa europea, que nos tienen vigilados. Con clip, ni se le ocurra.', 'Letrado Mayor');
              g.give('textoLey');
              return null;
            }
            g.sfx('bad');
            render('El Letrado frunce el ceño: «Este texto no es el que resulta de las votaciones». Revise qué se aprueba, qué se rechaza y en qué orden se vota. Pulse «Repetir la votación».', true);
            return null;
          };
        };
        render();
      },
    });
  }

  // =========================================================
  //  NIVEL 7 — Tribunal Constitucional (calendario)
  // =========================================================
  const TC_CAL = () => calHTML(2033, 6, { 22: 'Santa Diligencia (festivo local de la sede del Tribunal)' })
    + calHTML(2033, 7, { 15: 'festivo nacional' })
    + calHTML(2033, 8, {});

  // =========================================================
  //  NIVEL 8 — Renovación del Consejo bloqueado
  // =========================================================
  const CANDS = [
    { id: 1, n: 'Dña. Amparo Recurso', g: 'F', j: true, y: 22, p: 'ABL', prof: 'Jueza de carrera' },
    { id: 2, n: 'D. Bernardo Plazo', g: 'M', j: true, y: 18, p: 'BDB', prof: 'Juez de carrera' },
    { id: 3, n: 'Dña. Celia Sumario', g: 'F', j: false, y: 30, p: 'CMC', prof: 'Jurista (catedrática)' },
    { id: 4, n: 'D. Diego Providencia', g: 'M', j: true, y: 9, p: 'ABL', prof: 'Juez de carrera' },
    { id: 5, n: 'Dña. Elena Diligencia', g: 'F', j: true, y: 16, p: 'BDB', prof: 'Jueza de carrera' },
    { id: 6, n: 'D. Fermín Auto', g: 'M', j: false, y: 25, p: 'PCP', prof: 'Jurista (abogado)' },
    { id: 7, n: 'Dña. Gloria Fallo', g: 'F', j: false, y: 12, p: 'URC', prof: 'Jurista (abogada)' },
    { id: 8, n: 'D. Hugo Instancia', g: 'M', j: true, y: 20, p: 'MIX', prof: 'Juez de carrera' },
  ];
  const GROUPS = [
    { id: 'ABL', name: 'Alianza por el Bloqueo', seats: 130, emoji: '🧱', x: 10, y: 50,
      say: '—Votaremos sí si en la lista hay al menos un candidato nuestro y ninguno del BDB. Con el BDB, ni a heredar.' },
    { id: 'BDB', name: 'Bloque del Desbloqueo', seats: 120, emoji: '🔓', x: 90, y: 50,
      say: '—Desbloquearemos si hay al menos dos candidatos nuestros, si no está Amparo Recurso y si todos los candidatos tienen al menos diez años de experiencia. Es decir: desbloquearemos cuando nos desbloqueen.' },
    { id: 'CMC', name: 'Coalición Mesa Camilla', seats: 40, emoji: '🛋️', x: 22, y: 80,
      say: '—Sí, si va Celia Sumario. Pero si va Diego Providencia, no: nos debe una cena desde 2014.' },
    { id: 'PCP', name: 'Plataforma Ciudadana del Puente', seats: 30, emoji: '🌉', x: 40, y: 84,
      say: '—Queremos al menos dos juristas que no sean jueces de carrera. Eso sí: Celia Sumario y Gloria Fallo juntas, no. Se pelean por el último croissant.' },
    { id: 'URC', name: 'Unión de Regantes Constitucionales', seats: 20, emoji: '🚿', x: 60, y: 84,
      say: '—Votamos siempre lo contrario que el BDB. Y además exigimos que entre los cuatro sumen al menos 80 años de experiencia: esto no es un máster.' },
    { id: 'MIX', name: 'Grupo Mixto', seats: 10, emoji: '🎲', x: 78, y: 80,
      say: '—Votaremos sí solo si está Hugo Instancia y si nuestro voto es decisivo: o sea, si sin nosotros no se llega a 210 y con nosotros sí.' },
  ];
  const SEATS8 = Object.fromEntries(GROUPS.map((x) => [x.id, x.seats]));
  function votes8(ids) {
    const L = CANDS.filter((c) => ids.includes(c.id));
    const has = (id) => ids.includes(id);
    const sumY = L.reduce((a, c) => a + c.y, 0);
    const v = {};
    v.ABL = L.some((c) => c.p === 'ABL') && !L.some((c) => c.p === 'BDB');
    v.BDB = L.filter((c) => c.p === 'BDB').length >= 2 && !has(1) && L.every((c) => c.y >= 10);
    v.CMC = has(3) && !has(4);
    v.PCP = L.filter((c) => !c.j).length >= 2 && !(has(3) && has(7));
    v.URC = !v.BDB && sumY >= 80;
    const t0 = Object.keys(v).filter((k) => v[k]).reduce((a, k) => a + SEATS8[k], 0);
    v.MIX = has(8) && t0 < 210 && t0 + 10 >= 210;
    return Object.keys(v).filter((k) => v[k]).reduce((a, k) => a + SEATS8[k], 0);
  }
  function renovModal(g) {
    g.modal({
      title: '🗳️ Votación de la lista de vocales',
      cls: 'wide',
      html: '<div id="s5-ren"></div>',
      onMount(body) {
        const box = body.querySelector('#s5-ren');
        const render = (m, bad) => {
          const sel = g.flag('sel') || [];
          box.innerHTML = `<p class="small">Selecciona exactamente <b>cuatro</b> candidatos y somete la lista a votación. Mayoría reforzada de tres quintos: <b>210</b> de 350.</p>
            <div class="s5-cands">${CANDS.map((c) => `<button class="opt s5-cand ${sel.includes(c.id) ? 'on' : ''}" data-id="${c.id}"><b>${c.n}</b><br><small>${c.prof} · ${c.y} años de experiencia · propuesta del ${c.p}</small></button>`).join('')}</div>
            <div class="row-btns"><button class="btn primary" id="s5-vote">🗳️ Someter a votación</button></div>
            <div class="msg ${m ? (bad ? 'bad' : 'good') : ''}">${m || ''}</div>`;
          box.querySelectorAll('.s5-cand').forEach((b) => {
            b.onclick = () => {
              const id = +b.dataset.id; const s = (g.flag('sel') || []).slice();
              const i = s.indexOf(id); if (i >= 0) s.splice(i, 1); else s.push(id);
              g.set('sel', s); g.sfx('click'); render();
            };
          });
          box.querySelector('#s5-vote').onclick = () => {
            const s = g.flag('sel') || [];
            if (s.length !== 4) { g.sfx('bad'); return render(`La lista debe tener exactamente cuatro vocales. Llevas ${s.length}.`, true); }
            const L = CANDS.filter((c) => s.includes(c.id));
            if (L.filter((c) => c.g === 'F').length !== 2 || L.filter((c) => c.j).length < 2) {
              g.sfx('bad'); return render('La Mesa ni siquiera admite la lista a trámite: incumple la Ley Orgánica (paridad y número mínimo de jueces de carrera).', true);
            }
            const t = votes8(s);
            if (t >= 210) {
              g.closeModal();
              g.say(`¡${t} votos a favor! Por primera vez en 2.000 días, el Consejo Superior de la Toga se renueva. Los portavoces se abrazan, se hacen una foto y, acto seguido, se acusan mutuamente de haber cedido.`, 'Presidencia de la Cámara');
              g.say('Esa misma noche suena el teléfono. Es el Presidente del Gobierno: «Alguien capaz de desbloquear eso es capaz de cualquier cosa». A la mañana siguiente, el BOE publica tu nombramiento. Te lo traen recién impreso.', 'Presidencia de la Cámara');
              g.give('nombramiento');
              g.win();
              return null;
            }
            g.sfx('bad');
            return render(`Resultado: <b>${t}</b> votos a favor. Se necesitan 210. El Consejo sigue caducado un día más (y van 2.001).`, true);
          };
        };
        render();
      },
    });
  }

  // =========================================================
  //  NIVEL 9 — Consejo de Ministros (Vigenère)
  // =========================================================
  const vig = (txt, key, dir) => {
    const k = norm(key).replace(/[^A-Z]/g, '');
    if (!k) return txt;
    let i = 0;
    return txt.replace(/[A-Z]/g, (c) => {
      const s = k.charCodeAt(i++ % k.length) - 65;
      return String.fromCharCode(((c.charCodeAt(0) - 65 + dir * s + 26 * 4) % 26) + 65);
    });
  };
  const PLAIN9 = 'LA CARTERA ROJA SE ABRE CON EL NUMERO DE ASIENTO DE CADA MINISTRO POR ORDEN ALFABETICO DE APELLIDO';
  const CIPHER9 = vig(PLAIN9, 'CAFE', 1);
  function vigModal(g) {
    g.modal({
      title: '📠 Máquina de cifra del Consejo (modelo 1898)',
      html: `<p class="small">Introduce la clave del día y la máquina descifra el orden del día. Funciona con manivela y con fe.</p>
        <div class="cipher-box"><div class="cipher-in">${CIPHER9}</div>
        <div class="kp-text"><input type="text" id="s5-vkey" maxlength="12" autocomplete="off" placeholder="CLAVE"><button class="btn primary" id="s5-vgo">Descifrar</button></div>
        <div class="cipher-out" id="s5-vout">${g.flag('vk') ? vig(CIPHER9, g.flag('vk'), -1) : '…'}</div></div>`,
      onMount(body) {
        const inp = body.querySelector('#s5-vkey');
        inp.value = g.flag('vk') || '';
        const go = () => {
          const k = norm(inp.value).replace(/[^A-Z]/g, '');
          if (!k) return;
          g.set('vk', k); g.sfx('click');
          body.querySelector('#s5-vout').textContent = vig(CIPHER9, k, -1);
        };
        body.querySelector('#s5-vgo').onclick = go;
        inp.onkeydown = (e) => { if (e.key === 'Enter') go(); };
      },
    });
  }

  // =========================================================
  //  NIVEL 10 — El laberinto del Estado
  // =========================================================
  // Cada celda: letra + flecha (U/D/L/R). La última (4,4) es Presidencia.
  const MAZE = [
    ['ER', 'LD', 'OR', 'AR', 'AL'],
    ['NU', 'NL', 'UD', 'VL', 'LL'],
    ['IR', 'SL', 'ED', 'UU', 'UU'],
    ['AD', 'ED', 'OD', 'CR', 'SD'],
    ['VU', 'IL', 'TR', 'OR', 'E*'],
  ];
  const ARROW = { U: '↑', D: '↓', L: '←', R: '→', '*': '🏛️' };
  const DIRS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
  function mazeModal(g) {
    g.modal({
      title: '🧭 Laberinto de remisiones',
      cls: 'wide',
      html: '<div id="s5-maze"></div>',
      onMount(body) {
        const box = body.querySelector('#s5-maze');
        const render = (m, bad) => {
          const path = g.flag('mz') || [[0, 0]];
          const [cx, cy] = path[path.length - 1];
          const word = path.map(([x, y]) => MAZE[y][x][0]).join('');
          let h = `<p class="small">Cada ventanilla te remite en la dirección de su flecha, <b>a la distancia que quieras</b> (puedes pasar por delante de otras sin detenerte). No puedes detenerte dos veces en la misma. En cada ventanilla donde te detienes recoges su letra. Presidencia (🏛️) solo admite expedientes que lleguen por <b>la ruta más corta posible</b>.</p><div class="s5-mz-g">`;
          for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
              const c = MAZE[y][x];
              const idx = path.findIndex((p) => p[0] === x && p[1] === y);
              const cls = ['s5-mz'];
              if (idx >= 0) cls.push('vis');
              if (x === cx && y === cy) cls.push('cur');
              if (x === 4 && y === 4) cls.push('goal');
              h += `<button class="${cls.join(' ')}" data-x="${x}" data-y="${y}"><b>${c[0]}</b><i>${ARROW[c[1]]}</i>${idx >= 0 ? `<small>${idx + 1}</small>` : ''}</button>`;
            }
          }
          h += `</div><p class="s5-mz-w">Letras recogidas: <b>${word}</b></p><div class="row-btns"><button class="btn" id="s5-mzreset">↺ Volver a Registro (inicio)</button></div><div class="msg ${m ? (bad ? 'bad' : 'good') : ''}">${m || ''}</div>`;
          box.innerHTML = h;
          box.querySelector('#s5-mzreset').onclick = () => { g.set('mz', [[0, 0]]); g.sfx('click'); render(); };
          box.querySelectorAll('.s5-mz').forEach((b) => {
            b.onclick = () => {
              if (g.has('selloRegistro')) return render('Ya tienes el Sello de Registro. No tientes al laberinto.');
              const p = (g.flag('mz') || [[0, 0]]).slice();
              const [px, py] = p[p.length - 1];
              if (px === 4 && py === 4) return render('El expediente ya está en Presidencia. Vuelve a Registro para intentarlo de nuevo.', true);
              const x = +b.dataset.x; const y = +b.dataset.y;
              const [dx, dy] = DIRS[MAZE[py][px][1]];
              let ok = false;
              for (let k = 1; k < 5; k++) if (px + dx * k === x && py + dy * k === y) ok = true;
              if (!ok) { g.sfx('bad'); return render('Esa ventanilla no está en la dirección a la que te remiten. Aquí se va donde dice la flecha.', true); }
              if (p.some((q) => q[0] === x && q[1] === y)) { g.sfx('bad'); return render('Ya te has detenido en esa ventanilla. No te van a atender dos veces: ni una, en realidad.', true); }
              p.push([x, y]); g.set('mz', p); g.sfx('click');
              if (x === 4 && y === 4) {
                const w = p.map(([qx, qy]) => MAZE[qy][qx][0]).join('');
                if (w === 'ELSIETE') {
                  g.give('selloRegistro');
                  return render('🏛️ Presidencia acepta el expediente: ruta más corta y letras en regla: «EL SIETE». Te entregan el Sello de Registro.');
                }
                g.sfx('bad');
                return render(`Presidencia rechaza el expediente: «${w}» no significa nada y además ha dado demasiadas vueltas. Vuelve a Registro.`, true);
              }
              return render();
            };
          });
        };
        render();
      },
    });
  }
  const PLAIN10 = 'EL SELLO DE EUROPA ES EL NUMERO DE ESTRELLAS DE LA BANDERA DIVIDIDO ENTRE CUATRO';
  const CIPHER10 = caesar(PLAIN10, 7);
  function teletipoModal(g) {
    g.modal({
      title: '📠 Teletipo de la Representación',
      html: `<p class="small">TELEGRAMA CIFRADO. «Para descifrarlo, retroceda cada letra tantas posiciones como indique la cifra del Sello de Registro.» Gira el rodillo:</p>
        <div class="cipher-box"><div class="cipher-in">${CIPHER10}</div>
        <div class="cipher-ctl"><button class="btn" id="s5-cL">◀</button><span id="s5-cK"></span><button class="btn" id="s5-cR">▶</button></div>
        <div class="cipher-out" id="s5-cOut"></div></div>`,
      onMount(body) {
        let k = g.flag('shift') || 0;
        const upd = () => {
          body.querySelector('#s5-cK').textContent = `Retroceso: ${k}`;
          body.querySelector('#s5-cOut').textContent = caesar(CIPHER10, -k);
          g.set('shift', k);
        };
        body.querySelector('#s5-cL').onclick = () => { k = (k + 25) % 26; g.sfx('click'); upd(); };
        body.querySelector('#s5-cR').onclick = () => { k = (k + 1) % 26; g.sfx('click'); upd(); };
        upd();
      },
    });
  }
  const SELLOS = ['selloRegistro', 'selloHacienda', 'selloEuropa', 'selloSenado'];

  // =========================================================
  //  NIVELES
  // =========================================================
  const LEVELS = [
    // ------------------------------------------------------ 1
    {
      title: 'Las oposiciones',
      place: 'Pabellón Polideportivo — Primer ejercicio',
      stars: 2,
      intro: 'La moción de censura cayó por un voto, la presidenta disolvió las Cortes y, en el buzón de la C/ del Olvido 14, te esperaba otra carta certificada: <b>te ha vuelto a tocar mesa</b>. Fue la gota que colmó la urna. Si no puedes con el sistema, únete a él: decides <b>opositar</b>.<br><br>Un año después (500 temas, una academia online y Michi durmiendo encima del tema 237), llega el primer ejercicio: 40.000 aspirantes para 12 plazas. La nota de corte es de 10 sobre 10. Y la hoja de respuestas solo admite lápiz del nº 2, que, naturalmente, no traes.<br><br>Llevas tu DNI de siempre y, para no perder la motivación, la carta de la Junta.<br><br><b>Objetivo:</b> identifícate ante el tribunal, consigue un lápiz, rellena la hoja sin un solo error y entrégala.',
      outro: '«APTO/A». El tribunal te devuelve el DNI y te entrega el certificado con una mezcla de sorpresa y lástima. Tras el segundo, tercer y cuarto ejercicio (y un año de impugnaciones), tu nombre aparece en el BOE de septiembre de 2032. Ya eres funcionario/a de carrera. Ahora solo falta tomar posesión… y para eso hará falta el certificado.',
      scene: { wall: '#d9d4c7', floor: '#a8875f', floorH: 36, pattern: 'wood' },
      carry: ['dni', 'cartaMesa'],
      decor: [
        { kind: 'window', l: 3, t: 8, w: 12, h: 24 },
        { kind: 'flag', l: 62, t: 5, w: 5, h: 8 },
        { kind: 'counter', l: 38, t: 45, w: 26, h: 9 },
        { emoji: '🪑', x: 20, y: 72, s: 4, o: 0.7 }, { emoji: '🪑', x: 48, y: 70, s: 4, o: 0.7 },
        { emoji: '🪑', x: 66, y: 72, s: 4, o: 0.7 }, { emoji: '🪑', x: 28, y: 88, s: 4, o: 0.7 },
        { emoji: '🧑‍🎓', x: 70, y: 86, s: 4, o: 0.6 },
      ],
      hotspots: [
        { id: 'tablon', x: 24, y: 22, sign: 'TABLÓN', sub: '📌', w: 13, label: 'Tablón de anuncios',
          look(g) {
            g.doc('📌 TABLÓN DE ANUNCIOS', `<p class="tiny">En cumplimiento de la normativa de protección de datos, <b>no se publica el DNI</b> de los aspirantes. Se publica su domicilio completo, que es menos comprometido.</p>
              <p><b>LISTA PROVISIONAL DE ADMITIDOS</b> <small>(marzo)</small></p>
              <table class="tbl"><tr><td>ABAD TRÁMITE, ROSA</td><td>Pza. de la Ventanilla 3, 1ºA</td><td>0001</td></tr><tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>C/ del Olvido 14, 3ºA</td><td>0814</td></tr><tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>C/ del Olvido 14, 3ºB</td><td>0815</td></tr><tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>C/ del Olvido 41, 3ºB</td><td>0816</td></tr><tr><td>ZAPATA ZAPATA, ZOE</td><td>Avda. del Silencio 2</td><td>40.112</td></tr></table>
              <p><b>LISTA DEFINITIVA DE ADMITIDOS</b> <small>(mayo, tras el plazo de subsanación. <b>Sustituye a la provisional y renumera a todos los aspirantes.</b>)</small></p>
              <table class="tbl"><tr><td>ABAD TRÁMITE, ROSA</td><td>Pza. de la Ventanilla 3, 1ºA</td><td>0003</td></tr><tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>C/ del Olvido 41, 3ºB</td><td>1146</td></tr><tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>C/ del Olvido 14, 3ºB</td><td>1147</td></tr><tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>C/ del Olvido 14, 3ºA</td><td>1148</td></tr><tr><td>ZAPATA ZAPATA, ZOE</td><td>Avda. del Silencio 2</td><td>39.877</td></tr></table>
              <p class="tiny">(Sí: tu vecino/a del 3ºA se llama exactamente como tú. Os confundís el correo desde 2029.)</p>
              <hr>
              <p><b>FE DE ERRATAS Nº 1.</b> En la pregunta 2 del primer ejercicio, donde dice «A · C · F · J», debe decir «<b>B · D · G · K</b>».</p>
              <p><b>FE DE ERRATAS Nº 2.</b> En la pregunta 5, donde dice «el doble que él más uno», debe decir «el doble que él menos uno» (en ambas frases).</p>
              <p><b>CORRECCIÓN DE ERRORES de la Fe de erratas nº 2.</b> Queda sin efecto. La pregunta 5 se mantiene en su redacción original. Disculpen las molestias (no las sentimos).</p>`);
          } },
        { id: 'reloj', x: 50, y: 13, emoji: '🕰️', s: 5, label: 'Reloj del pabellón',
          look(g) { g.say('Quedan 87 minutos. El reloj lleva parado desde las oposiciones de 2009, pero el tribunal lo considera oficial.'); } },
        { id: 'silencio', x: 80, y: 20, sign: 'SILENCIO', sub: 'Examen en curso', w: 14, label: 'Cartel de silencio',
          look(g) { g.say('«SILENCIO. EXAMEN EN CURSO». Debajo, a boli: «...y en 2032, y en 2033, y en 2034».'); } },
        { id: 'tribunal', x: 51, y: 37, emoji: '👩‍⚖️', s: 7, label: 'Tribunal calificador',
          look(g) {
            if (!g.flag('ident')) return g.say('—Identifíquese antes de empezar. Muéstreme su DNI (selecciónelo y úselo conmigo). Sin DNI, no hay cuadernillo.', 'Presidenta del tribunal');
            g.say('—Cuando termine, entrégueme la hoja de respuestas. Solo se admite lápiz del nº 2. Material lo reparte el conserje, previo impreso.', 'Presidenta del tribunal');
          },
          use: {
            dni(g) {
              if (g.flag('ident')) return g.say('—Ya le he identificado. Dos veces sería sospechoso.', 'Presidenta del tribunal');
              g.set('ident');
              g.take('dni');
              g.say('—07345189-R... válido hasta 2036. Correcto. El DNI se queda en mi mesa hasta que me entregue la hoja: es el protocolo antichuletas. Aquí tiene el cuadernillo y la hoja de respuestas. Tiene 90 minutos. Bueno, 87. Y no copie del de al lado: copia mal.', 'Presidenta del tribunal');
              g.say('—Ah, y en la lista definitiva hay tres aspirantes con su mismo nombre. Su número de opositor es el que corresponde a SU domicilio exacto. Si no se lo sabe de memoria, vendrá en cualquier carta oficial que le hayan mandado.', 'Presidenta del tribunal');
              g.give('cuadernillo'); g.give('hoja');
            },
            cartaMesa(g) { g.say('—¿Una citación de mesa electoral? ¿De hace un año? ¿Y aún la lleva encima? Ah, motivación. Lo entiendo: yo oposité por una multa de aparcamiento. Eso sí, fíjese: ahí sale su domicilio completo. Para encontrar su número de opositor, le viene de perlas.', 'Presidenta del tribunal'); },
            hoja(g) {
              const a = g.flag('ans') || [];
              if (!a.some(Boolean)) return g.say('—¿En blanco? Valiente. Pero no. Rellénela primero (a lápiz).', 'Presidenta del tribunal');
              if (a.filter(Boolean).length < 5) return g.say('—Le faltan respuestas. Aquí no hay penalización por fallo: hay eliminación.', 'Presidenta del tribunal');
              if (L1KEY.every((k, i) => a[i] === k)) {
                g.take('hoja');
                g.say('El tribunal pasa la hoja por la lectora óptica. Pitido. Silencio. Otro pitido. —Cinco de cinco. APTO/A. Es usted el único de los 40.000. ¿Seguro que no es de una academia?', 'Presidenta del tribunal');
                g.say('—Tome: su DNI y su certificado de APTO. Los siguientes ejercicios se los iré sellando ahí. No lo pierda: sin él no tomará posesión ni de una silla.', 'Presidenta del tribunal');
                g.give('dni'); g.give('apto');
                g.win();
              } else {
                g.sfx('bad');
                g.say('La lectora óptica pita en tono grave. —NO APTO. Hay al menos un error. No le diré cuál: el secreto de las deliberaciones es sagrado. Repase el cuadernillo... y el tablón. (Puede corregir la hoja: aquí se borra a lápiz, para eso es de lápiz.)', 'Presidenta del tribunal');
              }
            },
            boli(g) { g.say('—No, gracias. Ya tenemos bolígrafos. Ninguno escribe, pero tenemos.', 'Presidenta del tribunal'); },
            impreso(g) { g.say('—El material es cosa del conserje. Yo solo suspendo.', 'Presidenta del tribunal'); },
            impresoOk(g) { g.say('—Eso, al conserje. Yo no doy lápices: los firmo.', 'Presidenta del tribunal'); },
          } },
        { id: 'abrigo', x: 8, y: 48, emoji: '🧥', s: 6, label: 'Tu abrigo',
          look(g) {
            if (!g.flag('coat')) { g.set('coat'); g.say('En los bolsillos: un bolígrafo azul de la academia, un caramelo para los nervios (te lo comes) y pelos de Michi. Muchos pelos de Michi.'); g.give('boli'); return; }
            g.say('Solo quedan apuntes del tema 237 hechos un acordeón (y mordisqueados por Michi). Ese tema nunca cae.');
          } },
        { id: 'conserje', x: 91, y: 50, emoji: '👷', s: 7, label: 'Conserje',
          look(g) {
            if (g.has('lapiz')) return g.say('—Ya tiene su lápiz. El siguiente, en la próxima convocatoria.', 'Conserje');
            if (!g.flag('imp')) {
              g.set('imp');
              g.say('—¿Lápiz del nº 2? Tengo cajas. Pero no se los puedo dar sin el impreso L-2 de solicitud de material, debidamente cumplimentado. Tome uno. Se rellena con bolígrafo, que el lápiz se borra.', 'Conserje');
              g.give('impreso');
              return;
            }
            g.say('—Impreso L-2 relleno con su número de opositor, y le doy el lápiz. Sin impreso, ni la goma.', 'Conserje');
          },
          use: {
            impresoOk(g) { g.take('impresoOk'); g.say('—Número de opositor... correcto. Aquí tiene: un lápiz del nº 2. Con punta y todo. No diga que no le cuidamos.', 'Conserje'); g.give('lapiz'); },
            impreso(g) { g.say('—En blanco no me vale. Rellénelo. Con bolígrafo.', 'Conserje'); },
            dni(g) { g.say('—No le pido el DNI, le pido el impreso. Que es otra cosa.', 'Conserje'); },
            cartaMesa(g) { g.say('—¿Mesa electoral? A mí me tocó cuatro veces seguidas. Por eso me hice conserje de oposiciones: aquí las cartas no llegan. Guárdesela, que lleva su dirección y eso siempre sirve para algo.', 'Conserje'); },
          } },
        { id: 'pupitre', x: 34, y: 74, emoji: '🪑', s: 7, label: 'Tu pupitre',
          look(g) {
            if (!g.has('cuadernillo')) return g.say('Tu pupitre, con una pegatina: «Ocupe el asiento con su número de opositor». Bueno, pues este. De momento no tienes nada que leer en él.');
            g.doc('📘 Primer ejercicio — Cuadernillo', L1_INSTR + l1QuestionsHTML(false, []));
          } },
        { id: 'vecino', x: 57, y: 76, emoji: '🧑‍🎓', s: 6, label: 'Opositor de al lado',
          look(g) {
            g.say(rand([
              '—Yo he marcado todo C. Estadísticamente, algo caerá. Es mi sexta convocatoria.',
              '—¿El tablón? Yo no leo el tablón. Si fuera importante, lo pondrían en el cuadernillo.',
              '—Dicen que el temario tiene 500 temas, pero mi academia dice que 452. Mi academia nunca se equivoca. Bueno, una vez.',
            ]), 'Opositor de al lado');
          } },
        { id: 'temario', x: 82, y: 76, emoji: '📚', s: 7, label: 'Temario oficial (14 kg)',
          look(g) {
            g.doc('📚 TEMARIO OFICIAL — Cuerpo Superior de Tramitadores', `<p><b>500 temas.</b> Se recomienda carretilla.</p>
              <ul><li>Bloque I (temas 1 a 100): Derecho constitucional y otras ficciones.</li>
              <li>Bloque II (101 a 150): Diligencias a caballo y otros medios de notificación.</li>
              <li>Bloque III (151 a 300): Teoría y práctica de la cola.</li>
              <li>Bloque IV (301 a 499): El silencio administrativo (un tema por cada tipo de silencio).</li>
              <li>Tema 500: Otros.</li></ul>
              <p><b>MODIFICACIONES DEL TEMARIO</b></p>
              <ul><li>Resolución de 3 de febrero: se suprimen los temas 101 a 150, ambos incluidos (ya no se notifica a caballo, salvo en casos excepcionales).</li>
              <li>Resolución de 9 de febrero: el tema 7 se desdobla en los temas 7-bis y 7-ter. El tema 7 original desaparece.</li>
              <li>Resolución de 30 de febrero: se añade el tema 501, «Novedades legislativas de esta mañana».</li></ul>
              <p class="tiny">Nota de la Secretaría del tribunal: se ruega a los aspirantes que comprueben la validez de las resoluciones antes de estudiárselas. Las fechas imposibles producen resoluciones nulas de pleno derecho.</p>`);
          } },
        { id: 'bombo', x: 68, y: 52, emoji: '🎱', s: 5, label: 'Bombo del sorteo de temas',
          look(g) { g.say('El bombo para el ejercicio oral. Sale la bola 237: «El silencio administrativo positivo: mito o leyenda». La que se comió Michi. Por suerte, el oral es dentro de seis meses.'); } },
        { id: 'papelera', x: 18, y: 86, emoji: '🗑️', s: 5, label: 'Papelera',
          look(g) { g.say('Un folleto de academia: «El 100 % de nuestros alumnos aprobados, aprueban». Y un lápiz... no: un palito de helado. Falsa alarma.'); } },
        { id: 'folleto', x: 45, y: 86, emoji: '📄', s: 4, label: 'Hoja tirada en el suelo',
          look(g) { g.say('Una hoja de respuestas de la convocatoria de 2019, rellena a bolígrafo. Anulada. Su dueño sigue opositando.'); } },
      ],
      combos: {
        'boli+impreso'(g) {
          g.input({
            title: '🖊️ Impreso L-2', text: 'Campo obligatorio: <b>nº de opositor</b> (4 cifras).', numeric: true, maxLen: 4,
            check: (v) => v === '1147',
            failText: (v) => (v === '0815' ? 'Ese es tu número de la lista provisional. ¿Sigue vigente esa lista?'
              : (['1146', '1148', '0814', '0816'].includes(v) ? 'Ese número es de alguien que se llama como tú, pero no vive donde tú. Comprueba tu domicilio exacto (calle, número y piso).' : 'Ese número no te corresponde. Consulta las listas del tablón.')),
            ok: () => { g.take('impreso'); g.give('impresoOk'); g.say('Rellenas el impreso con tu mejor letra. Nº de opositor: 1147. Ahora, al conserje.'); },
          });
        },
        'boli+hoja'(g) { g.say('Ni se te ocurra: «EXCLUSIVAMENTE lápiz del nº 2». La lectora óptica anula todo lo azul, incluido el cielo.'); },
        'hoja+lapiz'(g) { answerModal(g); },
        'cuadernillo+lapiz'(g) { g.say('No escribas en el cuadernillo: las respuestas van en la hoja. (Combina el lápiz con la hoja.)'); },
      },
      hints: [
        'Identifícate ante el tribunal usando con él el DNI que traes. En el abrigo hay un bolígrafo. El conserje te dará un impreso para pedir el lápiz.',
        'El impreso se rellena con bolígrafo y pide tu número de opositor: usa la lista DEFINITIVA del tablón, y entre los homónimos, el de TU domicilio exacto (viene en la carta de la Junta Electoral). Y no ignores las erratas del tablón ni las modificaciones del temario (alguna no es válida).',
        'Domicilio: C/ del Olvido 14, 3ºB → 1147. P2 con erratas: B·D·G·K → +5 con la Ñ = O. P4: 500 − 50 + 1 = 451 (la resolución del 30 de febrero es nula). P5: 3 + 7 + 15 = 25 (la errata 2 quedó sin efecto).',
        'Solución: DNI al tribunal → abrigo (boli) → conserje (impreso) → boli + impreso: 1147 → impreso relleno al conserje → lápiz + hoja: A, B, A, B, B → entrega la hoja al tribunal.',
      ],
    },

    // ------------------------------------------------------ 2
    {
      title: 'La toma de posesión',
      place: 'Ministerio de Asuntos Pendientes — Planta 3',
      stars: 2,
      intro: '¡Tu nombramiento ha salido en el BOE! Septiembre de 2032: hoy tomas posesión como <b>Técnico/a Superior de Tramitación</b>. Traes el DNI y el certificado de APTO que te dio el tribunal.<br><br>Pequeño problema: te han asignado el despacho 3.17, que está vacío. Ni silla ni ordenador. Y la Subsecretaria no da posesión a nadie que no esté «efectivamente en su puesto de trabajo».<br><br><b>Objetivo:</b> monta tu puesto (tu silla y un ordenador operativo en tu mesa), acredítate con tu certificado de APTO y presta juramento o promesa ante la Subsecretaria.',
      outro: 'Toma de posesión formalizada. Ya tienes tarjeta de empleado público (NRP 3906), silla, un portátil que te seguirá allá donde vayas y un trienio en camino. Tu primer destino: la Dirección General de Presupuestos, donde llevan casi diez años sin presupuestos. Mucho trabajo, poca materia.',
      scene: { wall: '#e6e0d2', floor: '#8b8f94', floorH: 34, pattern: 'tiles' },
      carry: ['dni', 'apto'],
      decor: [
        { kind: 'counter', l: 3, t: 55, w: 26, h: 8 },
        { kind: 'counter', l: 60, t: 60, w: 20, h: 7 },
        { kind: 'window', l: 70, t: 8, w: 8, h: 22 },
        { kind: 'flag', l: 40, t: 4, w: 4, h: 7 },
        { kind: 'box', l: 42, t: 70, w: 5, h: 6, color: '#a07a4c' },
      ],
      hotspots: [
        { id: 'boe', x: 14, y: 20, sign: 'BOE', sub: '📰', w: 11, label: 'BOE en el tablón',
          look(g) {
            g.doc('📰 BOLETÍN OFICIAL DEL ESTADO', `<p class="small">Núm. 210 · Sección II.A · Nombramientos</p>
              <p><b>Orden APE/317/2032, por la que se nombra funcionarios de carrera del Cuerpo Superior de Tramitadores del Estado.</b></p>
              <table class="s5-t"><tr><th>Apellidos y nombre</th><th>DNI</th><th>NRP</th><th>Destino</th></tr>
              <tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>***4581**</td><td>2190</td><td>Asuntos Pendientes</td></tr>
              <tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>***4518**</td><td>3906</td><td>Asuntos Pendientes</td></tr>
              <tr><td>PACIENTE SUFRIDO/A, CIUDADANO/A</td><td>***5189**</td><td>4471</td><td>Asuntos Pendientes</td></tr>
              <tr><td>PACIENCIA SUFRIDA, CIUDADANA</td><td>***3451**</td><td>1187</td><td>Asuntos Pendientes</td></tr></table>
              <p class="tiny">En cumplimiento de la normativa de protección de datos, el DNI se publica de forma parcial: solo se muestran las cifras que ocupan las posiciones <b>cuarta a séptima</b>. NRP: Número de Registro de Personal. (Sí, hay cuatro personas que se llaman como tú. Bienvenido/a a la Administración.)</p>`);
          } },
        { id: 'maletin', x: 6, y: 84, emoji: '💼', s: 5, label: 'Tu maletín',
          look(g) {
            if (!g.flag('mal')) { g.set('mal'); g.say('En el maletín: una foto de la toma de posesión que aún no ha ocurrido (optimismo), una foto de Michi y un táper de porras que te ha puesto la tía Remedios: «Para el primer día. De Porras del Trámite, que se note de dónde vienes».'); return; }
            g.say('Queda el táper de porras. Frías, pero con dignidad. Lo reservas para el microondas de la planta 3, que tiene una cola de 40 minutos.');
          } },
        { id: 'terminal', x: 10, y: 50, emoji: '🖥️', s: 6, label: 'Terminal de autoservicio del CAU',
          look(g) {
            if (g.flag('tk')) return g.say('«Su incidencia INC-3906 ya está registrada. Tiempo estimado de resolución: entre 5 minutos y la jubilación.»', 'Terminal del CAU');
            g.input({
              title: '🖥️ CAU — Alta de incidencia', text: 'Solicitud de equipo informático. Introduzca su <b>NRP</b> (4 cifras).', numeric: true, maxLen: 4,
              check: (v) => v === '3906',
              failText: (v) => (['2190', '4471', '1187'].includes(v) ? 'Ese NRP pertenece a otra persona (que se llama como usted, pero no es usted). El sistema le desea suerte.' : 'NRP no encontrado. Consulte su nombramiento en el BOE.'),
              ok: () => { g.set('tk'); g.say('Bip. «Incidencia INC-3906 registrada.» La impresora escupe un ticket. Recójalo en el mostrador del CAU.', 'Terminal del CAU'); g.give('ticket'); },
            });
          } },
        { id: 'tecnico', x: 22, y: 47, emoji: '🧑‍💻', s: 6, label: 'Técnico del CAU',
          look(g) {
            if (g.flag('pcGiven')) return g.say('—Si no enciende, apáguelo y vuélvalo a encender. Si tampoco, abra otra incidencia.', 'Técnico del CAU');
            g.say('—Sin ticket, la incidencia no existe. Y si no existe, no le puedo dar un ordenador. Saque ticket en el terminal con su NRP.', 'Técnico del CAU');
          },
          use: {
            ticket(g) { g.take('ticket'); g.set('pcGiven'); g.say('—INC-3906... Aquí tiene: un portátil de 2014. Batería al 0 %. El cargador está en el almacén. ¿Dónde está la llave del almacén? Pregunte al conserje. ¿Qué quiere el conserje? Nadie lo sabe.', 'Técnico del CAU'); g.give('portatil'); },
            portatil(g) { g.say('—El cargador, en el almacén. Ya se lo he dicho. Abra otra incidencia si quiere que se lo repita.', 'Técnico del CAU'); },
          } },
        { id: 'conserje', x: 37, y: 60, emoji: '👷', s: 6, label: 'Conserje',
          look(g) {
            if (g.flag('keyGiven')) return g.say('—Ya le he dado la llave. Devuélvamela antes de 2040.', 'Conserje');
            g.say('—¿La llave del almacén? Se la dejo... si me trae una grapadora. Desde que Informática se llevó la mía en 2019, no grapo. Un conserje que no grapa no es nada.', 'Conserje');
          },
          use: {
            grapadora(g) { g.take('grapadora'); g.set('keyGiven'); g.say('—¡Una grapadora de las buenas, metálica! Clac, clac. Qué sonido. Tome la llave del almacén, se la ha ganado.', 'Conserje'); g.give('llave'); },
          } },
        { id: 'almacen', x: 34, y: 30, emoji: '🚪', s: 11, label: (g) => (g.flag('alm') ? 'Almacén (abierto)' : 'Almacén (cerrado con llave)'),
          look(g) {
            if (!g.flag('alm')) return g.say('Cerrado con llave. En la puerta: «ALMACÉN. Prohibido el paso a toda persona, incluido el personal».');
            if (g.flag('chair')) return g.say('Cajas, cables y un archivador de 1977 con la etiqueta «Urgente».');
            g.choice({
              title: '📦 Almacén — Sillas', text: 'Entre cables y cajas hay cuatro sillas, cada una con su etiqueta de inventario. Solo puedes llevarte la que te corresponde.',
              options: [
                { label: 'Silla ergonómica — PAT-0317-A (pegatina: «Director General»)', onPick(gg, msg) { msg('—¡Eh! —grita alguien desde el pasillo—. ¡Esa es la del Director General! Déjela o le abro expediente.', true); return false; } },
                { label: 'Silla giratoria — PAT-0317-B', onPick(gg) { gg.set('chair'); gg.give('silla'); gg.say('Coges la silla PAT-0317-B. Cojea un poco. Es tuya. Por fin algo es tuyo.'); } },
                { label: 'Silla de diseño — PAT-0371-B', onPick(gg, msg) { msg('Esa es del despacho 3.71. Y además es incomodísima: es «de diseño».', true); return false; } },
                { label: 'Taburete — PAT-3170-B', onPick(gg, msg) { msg('Un taburete de 1970. Se desmonta con solo mirarlo. Y no es el de tu inventario.', true); return false; } },
              ],
            });
          },
          use: {
            llave(g) { g.take('llave'); g.set('alm'); g.say('La llave gira con un quejido. Dentro: cuatro sillas, mil cables y, sobre una caja, un cargador de portátil con una etiqueta: «Para el que venga». Te lo llevas.'); g.give('cargador'); },
          } },
        { id: 'despacho', x: 52, y: 18, sign: 'DESPACHO 3.17', sub: '🚪', w: 14, label: 'Puerta del despacho 3.17',
          look(g) {
            g.doc('📋 Inventario de bienes muebles — Despacho 3.17', `<table class="tbl">
              <tr><td>Mesa de oficina (PAT-0317-M)</td><td>Presente</td></tr>
              <tr><td>Silla giratoria (<b>PAT-0317-B</b>)</td><td>En almacén (traslado)</td></tr>
              <tr><td>Ordenador portátil</td><td>Pendiente de asignación por el CAU</td></tr>
              <tr><td>Papelera</td><td>Presente (llena)</td></tr></table>
              <p class="small">Para la asignación de equipo informático, solicítelo en el terminal del CAU con su NRP.</p>`);
          } },
        { id: 'calendario', x: 66, y: 22, emoji: '📅', s: 5, label: 'Calendario de la planta',
          look(g) { g.doc('📅 Calendario laboral — Septiembre 2032', `${calHTML(2032, 8, { 20: 'San Trienio (festivo local)' })}<p class="small">Sábados, domingos y festivos: no laborables. (Los lunes, técnicamente laborables.)</p>`); } },
        { id: 'formula', x: 86, y: 18, sign: 'FÓRMULA', sub: '📜', w: 12, label: 'Fórmula enmarcada',
          look(g) {
            g.doc('📜 Fórmula de juramento o promesa', `<p>«¿Juráis o prometéis por vuestra conciencia y honor cumplir fielmente las obligaciones del cargo con lealtad al Rey, y guardar y hacer guardar la Constitución como norma fundamental del Estado?»</p>
              <p class="small">El interesado responderá <b>«Juro»</b> o <b>«Prometo»</b>, seguido de la fórmula. Ambas opciones son igualmente válidas. Las improvisaciones, no.</p>`);
          } },
        { id: 'pantalla', x: 50, y: 56, emoji: '🖥️', s: 5, label: 'Pantalla del compañero (de vacaciones)',
          look(g) {
            g.doc('🖥️ Correo — Respuesta automática', `<p><b>Asunto:</b> Fuera de la oficina</p>
              <p>Estaré fuera de la oficina hasta el <b>viernes 17 de septiembre, inclusive</b>. Me reincorporaré el <b>primer día laborable siguiente</b>. Para cualquier urgencia, no hay urgencias.</p>
              <div class="paper-note">Pósit en el monitor: «Clave del cajón = día y mes en que vuelvo (DDMM). ¡Que no se me olvide!»</div>`);
          } },
        { id: 'cajon', x: 52, y: 80, emoji: '🗄️', s: 6, label: 'Cajonera del compañero (candado de 4 cifras)',
          look(g) {
            if (g.flag('drawer')) return g.say('Solo quedan sobres de azúcar de seis cafeterías distintas y un manual de «Cómo desconectar en vacaciones», sin abrir.');
            g.input({
              title: '🗄️ Cajonera', text: 'Candado de 4 cifras.', numeric: true, maxLen: 4,
              check: (v) => v === '2109',
              failText: (v) => (v === '2009' ?'Casi... pero ese día, ¿trabajaba alguien en esta planta?' : 'El candado no cede. Tu compañero, de vacaciones, sonríe en algún lugar.'),
              ok: () => { g.set('drawer'); g.say('Clic. Dentro, entre sobres de azúcar: una grapadora metálica de 1992. Un tesoro.'); g.give('grapadora'); },
            });
          } },
        { id: 'mesa', x: 70, y: 64, emoji: (g) => (g.flag('sentado') ? (g.flag('pc') ? '💺💻' : '💺') : (g.flag('pc') ? '💻' : '🗃️')), s: 6,
          label: (g) => `Tu mesa${g.flag('sentado') ? ' (con silla' : ''}${g.flag('pc') ? (g.flag('sentado') ? ' y portátil)' : ' (con portátil)') : (g.flag('sentado') ? ')' : ' (vacía)')}`,
          look(g) {
            if (g.flag('sentado') && g.flag('pc')) return g.say('Tu puesto de trabajo, completo: silla que cojea, portátil que se actualiza. Ya puedes presentarte ante la Subsecretaria.');
            g.say(`Tu mesa (PAT-0317-M). ${g.flag('sentado') ? 'Ya tiene tu silla.' : 'Le falta tu silla.'} ${g.flag('pc') ? 'Ya tiene portátil.' : 'Le falta un ordenador operativo.'}`);
          },
          use: {
            silla(g) { g.take('silla'); g.set('sentado'); g.say('Colocas la silla PAT-0317-B frente a la mesa y te sientas. Gira. Cojea. Es tu silla. Lloras un poquito.'); },
            portatilOk(g) { g.take('portatilOk'); g.set('pc'); g.say('Enchufas el portátil. Arranca. Pide actualizar. Actualiza. Pide reiniciar. Reinicia. Funciona. Milagro.'); },
            portatil(g) { g.say('Sin batería no arranca, y un ordenador que no arranca no cuenta como «operativo». Busca el cargador.'); },
          } },
        { id: 'subse', x: 87, y: 50, emoji: '👩‍💼', s: 7, label: 'Subsecretaria',
          look(g) {
            if (!(g.flag('sentado') && g.flag('pc'))) return g.say(`—Solo doy posesión a quien está efectivamente en su puesto: sentado en SU silla, ante SU mesa y con un ordenador operativo.${g.flag('acred') ? '' : ' Y antes, acredítese: entrégueme el certificado de APTO del tribunal, que aquí se ha colado más de uno.'}`, 'Subsecretaria');
            if (!g.flag('acred')) return g.say('—Muy bien el puesto. Ahora acredítese: entrégueme su certificado de APTO. Sin él, usted es una persona sentada en una silla del Estado. Eso tiene otro nombre.', 'Subsecretaria');
            g.choice({
              title: '🤚 Juramento o promesa', text: '—Ponga la mano aquí y repita la fórmula reglamentaria. Exactamente.',
              options: [
                { label: '«Juro por mi conciencia y honor cumplir fielmente las obligaciones del cargo con lealtad al Rey, y guardar y hacer guardar la Constitución como norma fundamental del Estado.»', onPick: l2Posesion },
                { label: '«Juro cumplir fielmente las obligaciones del cargo, salvo en agosto y los viernes por la tarde.»', onPick(gg, msg) { msg('—Eso es el convenio colectivo, no la fórmula. Otra vez.', true); return false; } },
                { label: '«Prometo guardar y hacer guardar los expedientes en el cajón hasta que prescriban.»', onPick(gg, msg) { msg('—Eso lo haremos, pero no se jura en voz alta. Otra vez.', true); return false; } },
                { label: '«Prometo por mi conciencia y honor cumplir fielmente las obligaciones del cargo con lealtad al Rey, y guardar y hacer guardar la Constitución como norma fundamental del Estado.»', onPick: l2Posesion },
              ],
            });
          },
          use: {
            apto(g) {
              g.take('apto'); g.set('acred');
              g.say('—APTO/A, opositor/a 1147, DNI 07345189-R... Coincide con el BOE. Acreditado/a. Me lo quedo para su expediente personal, donde descansará en paz.', 'Subsecretaria');
              if (!(g.flag('sentado') && g.flag('pc'))) g.say('—Ahora, su puesto: silla y ordenador operativo en su mesa. Luego hablamos.', 'Subsecretaria');
            },
            dni(g) { g.say('—Sí, sí, ya veo que es usted. Pero el DNI no dice que haya aprobado nada. Quiero el certificado de APTO.', 'Subsecretaria'); },
          } },
        { id: 'cafetera', x: 24, y: 82, emoji: '☕', s: 5, label: 'Máquina de café de la planta',
          look(g) { g.say('Un cartel: «Fuera de servicio desde la última reorganización». Debajo, otro: «Se ha creado un grupo de trabajo para estudiar su reparación».'); } },
        { id: 'planta', x: 95, y: 84, emoji: '🪴', s: 5, label: 'Planta',
          look(g) { g.say('Una planta con etiqueta de inventario: PAT-0001. Es el bien mueble más antiguo del Ministerio. Y el único que no ha pedido traslado.'); } },
      ],
      combos: {
        'cargador+portatil'(g) { g.take('cargador'); g.take('portatil'); g.give('portatilOk'); g.say('Conectas el cargador al portátil. Una lucecita naranja. Esperanza.'); },
      },
      hints: [
        'Tu NRP sale en el BOE, pero hay cuatro personas que se llaman como tú. El DNI publicado está enmascarado: compara con el tuyo (lo traes en el inventario). A la Subsecretaria tendrás que entregarle el certificado de APTO.',
        'El terminal del CAU te da un ticket para el técnico. El conserje cambia la llave del almacén por una grapadora, y la grapadora está en la cajonera del compañero: mira su respuesta automática y el calendario.',
        'Tu DNI 07345189: cifras 4.ª a 7.ª = 4518 → NRP 3906. El compañero vuelve el martes 21 (el lunes 20 es festivo) → cajonera 2109.',
        'Solución: terminal 3906 → ticket al técnico → cajonera 2109 → grapadora al conserje → llave en el almacén (cargador) → silla PAT-0317-B → cargador + portátil → silla y portátil a la mesa → certificado de APTO a la Subsecretaria → Subsecretaria: «Juro…» o «Prometo…» con la fórmula completa.',
      ],
    },

    // ------------------------------------------------------ 3
    {
      title: 'Presupuestos prorrogados',
      place: 'Ministerio de Hacienda — Sala del Interventor',
      stars: 3,
      intro: 'Te destinan a la Dirección General de Presupuestos, con tu tarjeta recién estrenada y tu portátil a cuestas. Los últimos Presupuestos Generales se aprobaron en 2023; desde entonces, prórroga tras prórroga.<br><br>31 de diciembre de 2032. El Interventor General no deja salir a nadie hasta que el <b>cuadro de créditos prorrogados de 2033</b> cuadre. El problema: alguien derramó un café encima y faltan once casillas.<br><br><b>Objetivo:</b> reconstruye el cuadro de créditos y supera la fiscalización del Interventor.',
      outro: 'Fiscalización de conformidad. El cuadro cuadra, y te lo llevas sellado. Como premio, te encargan algo «sencillito»: justificar ante Bruselas los fondos europeos antes de que acabe el año. Y para eso hará falta acreditar crédito: o sea, tu cuadro. Es 31 de diciembre. Son las 23:00.',
      scene: { wall: '#cdd5cf', floor: '#6f5b4b', floorH: 33, pattern: 'wood' },
      carry: ['tarjeta', 'portatilOk'],
      decor: [
        { kind: 'counter', l: 34, t: 50, w: 32, h: 9 },
        { kind: 'window', l: 86, t: 30, w: 10, h: 20 },
        { kind: 'shelf', l: 3, t: 44, w: 14, h: 2 },
        { kind: 'flag', l: 40, t: 5, w: 4, h: 6 },
        { emoji: '🪑', x: 50, y: 74, s: 5, o: 0.85 },
      ],
      hotspots: [
        { id: 'interventor', x: 50, y: 40, emoji: '🧐', s: 8, label: 'Interventor General',
          look(g) {
            g.say('—Nadie sale de esta sala hasta que el cuadro de créditos cuadre. Al céntimo. Bueno, al millar de euros, que es como va el cuadro.', 'Interventor General');
            g.say('—Las reglas están en el acuerdo de techo de gasto, en la pared. Y lo que haga falta de 2023, en el archivo. La clave del archivo... la tiene apuntada alguien que ya se jubiló. En un pósit. Pegado al archivo. Por seguridad.', 'Interventor General');
          } },
        { id: 'cuadro', x: 26, y: 22, sign: 'CUADRO DE CRÉDITOS', sub: '📊', w: 16, label: 'Cuadro de créditos (manchado de café)', look: budgetModal },
        { id: 'techo', x: 74, y: 22, sign: 'TECHO DE GASTO', sub: '🧱', w: 15, label: 'Acuerdo de techo de gasto',
          look(g) {
            g.doc('🧱 Acuerdo del Consejo de Ministros — Techo de gasto 2033', `<p>Para el ejercicio 2033, con presupuesto prorrogado (otra vez), se acuerda:</p>
              <ol><li>El límite de gasto no financiero es de <b>2,4 millones de euros</b>, que se repartirá íntegramente entre las cuatro secciones.</li>
              <li>El total del <b>Capítulo 1</b> (Personal) será el del ejercicio 2023 incrementado en un <b>10 %</b> (diez años de subidas salariales, trienios y una paga extra que nadie entiende, todo junto).</li>
              <li>El total del <b>Capítulo 2</b> superará al del <b>Capítulo 6</b> en exactamente <b>300.000 €</b>.</li></ol>
              <p class="small">Recuerde: el cuadro de créditos se expresa en <b>miles de euros</b>.</p>`);
          } },
        { id: 'placa', x: 50, y: 13, sign: 'PLACA', sub: '🏅', w: 12, label: 'Placa conmemorativa',
          look(g) { g.say('«En esta sala se aprobaron los últimos Presupuestos Generales del Estado, el 14 de marzo de 2023. Desde entonces: prórroga, prórroga, prórroga.»'); } },
        { id: 'archivo', x: 9, y: 60, emoji: '🗄️', s: 9, label: (g) => (g.flag('lector') ? 'Archivo (cerradura de 4 cifras)' : 'Archivo (lector de tarjetas y cerradura)'),
          look(g) {
            if (g.flag('arch')) return g.say('El archivo está abierto. Solo quedan presupuestos de 1998 que alguien guardó «por si acaso».');
            if (!g.flag('lector')) return g.say('El archivo tiene un lector de tarjetas y una cerradura de 4 cifras. La pantallita parpadea: «IDENTIFÍQUESE CON SU TARJETA DE EMPLEADO PÚBLICO. Después, la clave». Doble seguridad para unos presupuestos que nadie quiere robar.');
            g.input({
              title: '🗄️ Archivo de Presupuestos', text: 'Cerradura de 4 cifras.', numeric: true, maxLen: 4,
              check: (v) => v === '1403',
              failText: () => 'El archivo no se abre. Prorroga su negativa.',
              ok: () => { g.set('arch'); g.say('El archivo se abre. Encuentras el Presupuesto 2023 liquidado, con un lacito. Lo tratan como una reliquia.'); g.give('pres2023'); },
            });
          },
          use: {
            tarjeta(g) {
              if (g.flag('lector')) return g.say('El lector ya te ha reconocido. Ahora quiere la clave, no tu cara.');
              g.set('lector');
              g.say('Pasas la tarjeta. Bip. «NRP 3906 — Personal de la Dirección General de Presupuestos. Acceso concedido. Introduzca la clave». Es la primera vez que una máquina del Estado te reconoce a la primera.');
            },
            portatilOk(g) { g.say('Tu portátil no tiene ranura para archivos metálicos. Y el archivo no tiene USB. Incompatibles, como Hacienda y la alegría.'); },
          } },
        { id: 'postit', x: 9, y: 37, emoji: '🗒️', s: 4, label: 'Pósit sobre el archivo',
          look(g) { g.say('«Clave del archivo: día y mes en que se aprobaron los últimos Presupuestos (DDMM). Ya nadie se acuerda, así que es segurísima.»'); } },
        { id: 'cafe', x: 62, y: 52, emoji: '☕', s: 5, label: 'Taza de café volcada',
          look(g) { g.say('La culpable. Una taza con el lema «I ❤ el déficit». Aún gotea sobre el suelo. Nadie la recoge: no hay partida para fregonas.'); } },
        { id: 'calculadora', x: 38, y: 52, emoji: '🧮', s: 5, label: 'Calculadora',
          look(g) { g.say('Una calculadora oficial. Le faltan las teclas del 7 y del 9: recortes. Tendrás que sumar de cabeza, como en 1978 (o con tu portátil, si arranca antes de 2034).'); },
          use: {
            portatilOk(g) { g.say('Abres la calculadora de tu portátil. «Instalando actualización 1 de 43». Para cuando termine, ya habrá presupuestos nuevos. Mejor de cabeza.'); },
          } },
        { id: 'tijeras', x: 26, y: 82, emoji: '✂️', s: 5, label: 'Tijeras de los recortes',
          look(g) { g.say('Las tijeras de los recortes. Están melladas de tanto usarlas. Hay una solicitud para comprar unas nuevas, recortada por la mitad.'); } },
        { id: 'hucha', x: 82, y: 78, emoji: '🐷', s: 5, label: 'Hucha «Fondo de contingencia»',
          look(g) { g.say('Fondo de contingencia del Estado: 3,20 €, un botón y un vale de descuento caducado. Para imprevistos.'); } },
        { id: 'telefono', x: 92, y: 60, emoji: '☎️', s: 5, label: 'Teléfono rojo',
          look(g) { g.say('—¿Diga? ¿Bruselas? ¿El déficit? ...Se corta. Mejor así.', 'Teléfono rojo'); } },
        { id: 'carpetas', x: 62, y: 84, emoji: '📂', s: 5, label: 'Carpetas de enmiendas',
          look(g) { g.say('Enmiendas a la totalidad a los Presupuestos de 2024, 2025, 2026… y así hasta 2033. Ninguna llegó a votarse porque no hubo presupuestos que enmendar.'); } },
      ],
      hints: [
        'El archivo tiene el Presupuesto 2023: primero identifícate en su lector con tu tarjeta de empleado público; la clave está en el pósit y en la placa. Lee bien el acuerdo de techo de gasto, y ojo con las unidades.',
        'Total general = 2.400 (miles). Cap. 1 = 1.000 × 1,10 = 1.100. Cap. 2 + Cap. 6 = 1.300 y Cap. 2 − Cap. 6 = 300. Luego completa filas y columnas.',
        'Tarjeta en el lector del archivo y clave 1403. Totales: Cap. 1 = 1.100, Cap. 2 = 800, Cap. 6 = 500, total 2.400.',
        'Casillas: AP cap. 2 = 180; SA cap. 1 = 310, cap. 6 = 200; IV cap. 2 = 140, cap. 6 = 110, total 500; MR cap. 1 = 120; totales 1.100 / 800 / 500 / 2.400.',
      ],
    },

    // ------------------------------------------------------ 4
    {
      title: 'Los fondos europeos',
      place: 'Oficina de Gestión del Plan de Recuperación',
      stars: 3,
      intro: 'Es 31 de diciembre de 2032, 23:00. Si a medianoche no están <b>justificados los fondos europeos</b>, hay que devolverlos a Bruselas. Con intereses. Y con vergüenza.<br><br>Traes tu portátil (la plataforma solo funciona en equipos dados de alta por el CAU) y el cuadro de créditos fiscalizado (sin crédito acreditado, no se justifica ni un euro). Te esperan una caja de facturas, una guía de elegibilidad de 300 páginas, unas adendas que nadie ha leído y un auditor europeo que no parpadea.<br><br><b>Objetivo:</b> abre la plataforma CAFÉ-MRR y clasifica cada factura en su componente (o márcala como no elegible). El auditor solo firma si todo está bien.',
      outro: 'Fondos justificados a las 23:59:58, y el informe del auditor en tu mano. Bruselas te felicita... y te convoca a una reunión del Consejo para «armonizar criterios». Mañana, 1 de enero, que en Bruselas es laborable si hay algo que armonizar. Te llevan en un avión que despega dentro de una hora. El informe va contigo: la Representación Permanente lo está esperando.',
      scene: { wall: '#dfe6ee', floor: '#5d6b7a', floorH: 34, pattern: 'carpet' },
      carry: ['portatilOk', 'cuadroOk'],
      decor: [
        { kind: 'flag-eu', l: 45, t: 6, w: 9, h: 11 },
        { kind: 'counter', l: 36, t: 58, w: 26, h: 8 },
        { kind: 'shelf', l: 12, t: 46, w: 16, h: 2 },
        { kind: 'screen', l: 40, t: 22, w: 18, h: 14 },
        { emoji: '🪑', x: 48, y: 78, s: 5, o: 0.85 },
      ],
      hotspots: [
        { id: 'plataforma', x: 48, y: 52, emoji: (g) => (g.flag('pc') ? '💻' : '🔌'), s: 7,
          label: (g) => (g.flag('pc') ? (g.flag('credito') ? 'Plataforma CAFÉ-MRR (en tu portátil)' : 'Plataforma CAFÉ-MRR (pide el certificado de crédito)') : 'Puesto libre con toma de red'),
          look(g) {
            if (!g.flag('pc')) return g.say('Un puesto libre con toma de red. Un cartel: «La plataforma CAFÉ-MRR solo funciona en equipos dados de alta por el CAU. Equipos particulares, abstenerse. Equipos del CAU, también, si no arrancan».');
            if (!g.flag('credito')) return g.say('La plataforma arranca (tras 43 actualizaciones) y muestra: «PASO 1 DE 1: adjunte el certificado de existencia de crédito para la cofinanciación nacional. Sin crédito acreditado, no se puede justificar ni un euro».', 'Plataforma CAFÉ-MRR');
            cafeModal(g);
          },
          use: {
            portatilOk(g) {
              g.take('portatilOk'); g.set('pc');
              g.say('Enchufas tu portátil a la toma de red. Once minutos de arranque, 43 actualizaciones y una foto de Michi después, se abre la plataforma CAFÉ-MRR. Son las 23:14.');
            },
            cuadroOk(g) {
              if (!g.flag('pc')) return g.say('¿Adjuntarlo dónde? Primero necesitas la plataforma abierta en un equipo dado de alta por el CAU.');
              g.take('cuadroOk'); g.set('credito');
              g.say('Escaneas el cuadro de créditos fiscalizado. «Crédito acreditado. Fiscalización de conformidad: verificada». La plataforma, sorprendida, te deja pasar al paso 2 de 1.', 'Plataforma CAFÉ-MRR');
            },
          } },
        { id: 'auditor', x: 79, y: 50, emoji: '🕵️', s: 7, label: 'Auditor europeo',
          look(g) {
            g.say('—Clasifique todas las facturas en la plataforma. Le recuerdo que primero se comprueba si un gasto es elegible y, solo si lo es, se le asigna componente. Yo firmo si todo es correcto. Si algo falla, no firmo. No doy pistas: eso es asistencia técnica, y va en otro programa.', 'Auditor europeo');
          } },
        { id: 'guia', x: 20, y: 40, emoji: '📕', s: 5, label: 'Guía de elegibilidad (300 páginas)',
          look(g) {
            g.doc('📕 Guía de elegibilidad — Resumen ejecutivo (págs. 1 a 300)', `<p><b>A) ELEGIBILIDAD.</b> Un gasto es elegible si cumple <b>todo</b> lo siguiente:</p>
              <ol><li>Factura fechada entre el <b>1 de febrero y el 31 de diciembre de 2032</b>, ambos incluidos.</li>
              <li>No pagada en efectivo por importe <b>superior a 1.000 €</b>.</li>
              <li>Principio DNSH («no causar un perjuicio significativo»): ningún gasto relacionado con combustibles fósiles (gasóleo, gasolina, butano…).</li>
              <li>Doble financiación: si dos facturas tienen el <b>mismo número</b>, solo se imputa la de <b>menor número de registro</b>; la otra no es elegible.</li></ol>
              <p><b>B) COMPONENTES</b> (solo para gastos elegibles):</p>
              <ul><li><b>Verde</b>: renovables, eficiencia energética y movilidad eléctrica.</li>
              <li><b>Digital</b>: equipos informáticos, software y conectividad.</li>
              <li><b>Cohesión</b>: cualquier actuación en un municipio de <b>menos de 5.000 habitantes</b>. Prevalece sobre Verde y Digital.</li></ul>
              <p class="tiny">Las adendas publicadas modifican esta guía. Págs. 2 a 299: logotipos obligatorios.</p>`);
          } },
        { id: 'tablon', x: 26, y: 20, sign: 'ADENDAS', sub: '📌', w: 12, label: 'Tablón de adendas',
          look(g) {
            g.doc('📌 Tablón de adendas', `<p><b>ADENDA Nº 1.</b> Se modifica el apartado A.1 de la Guía: el periodo de elegibilidad comienza el <b>1 de enero de 2032</b> (y sigue terminando el 31 de diciembre de 2032).</p>
              <p><b>ADENDA Nº 2.</b> <i>(Aquí solo queda una chincheta y un trocito de papel. Alguien se la llevó. O la tiró.)</i></p>
              <p><b>ADENDA Nº 3.</b> Se recuerda la obligatoriedad de incluir el logotipo en todos los documentos, incluidos los pósits.</p>`);
          } },
        { id: 'padron', x: 72, y: 20, sign: 'PADRÓN', sub: '🏘️', w: 12, label: 'Extracto del padrón',
          look(g) {
            g.doc('🏘️ Padrón municipal (cifras oficiales a 1 de enero)', `<table class="tbl"><tr><td>Ciudad Sede</td><td>1.204.330</td></tr><tr><td>Villabajo</td><td>5.012</td></tr><tr><td>Villarriba</td><td>4.987</td></tr><tr><td>Quintanilla del Expediente</td><td>312</td></tr></table><p class="small">Villarriba y Villabajo llevan años discutiendo quién tiene más habitantes. Ahora ya lo saben.</p>`);
          } },
        { id: 'caja', x: 14, y: 74, emoji: '📦', s: 7, label: 'Caja de facturas',
          look(g) { g.doc('📦 Caja de facturas', `<p class="small">Once facturas, ordenadas por número de registro de entrada (R-01 es la primera que entró).</p><div class="s5-scroll">${factTable()}</div>`); } },
        { id: 'papelera', x: 34, y: 84, emoji: '🗑️', s: 5, label: 'Papelera',
          look(g) {
            if (!g.flag('ad2')) { g.set('ad2'); g.say('Entre envoltorios de turrón aparece un papel arrugado con una chincheta: ¡la Adenda nº 2!'); g.give('adenda2'); return; }
            g.say('Envoltorios de turrón y un borrador de discurso: «Hemos ejecutado el 100 % de los fondos (de los que hemos ejecutado)».');
          } },
        { id: 'becario', x: 88, y: 80, emoji: '🧑‍🎓', s: 6, label: 'Becario',
          look(g) {
            g.say(rand([
              '—Yo esta mañana he ordenado el tablón. He tirado lo que sobraba. Bueno, lo que me parecía que sobraba.',
              '—En la universidad no me explicaron qué es el DNSH. Aquí tampoco. Creo que nadie lo sabe, pero todos lo aplican.',
              '—El de las bombillas me preguntó si el 31 de diciembre todavía cuenta. Le dije que sí, que «ambos incluidos» significa ambos incluidos.',
              '—La factura de los churros es de una churrería de Villatrámite. Dicen que la administra alguien de este Ministerio. Qué casualidad, ¿no?',
            ]), 'Becario');
          } },
        { id: 'reloj', x: 90, y: 22, emoji: '🕚', s: 5, label: 'Reloj (23:00)',
          look(g) { g.say('Las 23:00 del 31 de diciembre. Faltan 60 minutos para devolver millones a Bruselas. El reloj, por solidaridad, ha decidido no adelantarse.'); } },
        { id: 'cava', x: 64, y: 80, emoji: '🍾', s: 5, label: 'Botella de cava',
          look(g) { g.say('Cava para celebrar la justificación. Etiqueta: «Factura R-12, catering». Ni lo mires: no es elegible.'); } },
        { id: 'telefono', x: 63, y: 52, emoji: '☎️', s: 4, label: 'Teléfono',
          look(g) { g.say('—Aquí Bruselas. ¿Cómo van esos hitos? ...¿Diga? ¿Diga? —Cuelgas. Ya te llamarán en el siguiente hito.', 'Teléfono'); } },
      ],
      hints: [
        'Enchufa tu portátil en el puesto libre y adjunta a la plataforma tu cuadro de créditos fiscalizado. Después reúne todas las reglas: la Guía, el tablón (Adenda 1), la Adenda 2 (tirada en la papelera) y el padrón. Primero decide si cada factura es elegible; luego, su componente.',
        'Ojo: fechas límite (Adenda 1), efectivo > 1.000 €, gasóleo, catering (también el de churros), número de factura repetido, y municipios de menos de 5.000 habitantes (Villarriba sí, Villabajo no).',
        'No elegibles: R-04 (gasóleo), R-05 (catering), R-08 (número repetido), R-10 (efectivo 38.000 €) y R-11 (2033).',
        'Solución: R-01 Verde, R-02 Digital, R-03 Cohesión, R-04 No elegible, R-05 No elegible, R-06 Digital, R-07 Cohesión, R-08 No elegible, R-09 Verde, R-10 No elegible, R-11 No elegible.',
      ],
    },

    // ------------------------------------------------------ 5
    {
      title: 'Bruselas',
      place: 'Bruselas — Sala de reuniones del Consejo',
      stars: 3,
      intro: '1 de enero de 2033. Llegas a Bruselas para «armonizar criterios», con el informe del auditor bajo el brazo. La reunión dura catorce horas y nadie armoniza nada. Al terminar, te das cuenta de que te has quedado encerrado/a en la sala: la puerta tiene un código, y el código solo lo conoce la Representación Permanente.<br><br>La Representación ha dejado algo para ti en la cabina de interpretación… a cambio del informe, claro. Y ese algo, cómo no, está cifrado.<br><br><b>Objetivo:</b> consigue la nota de la Representación, descífrala y abre la puerta de la sala.',
      outro: 'La puerta se abre con un zumbido multilingüe. En el pasillo, además del último croissant, la Representación te regala una grapadora homologada según el Reglamento 2032/97: «Para que en España se enteren de cómo se grapa». De vuelta a casa, te espera otro encargo: presidir en el Senado la votación de la Ley de Simplificación de Reclamaciones. Con sus enmiendas. Todas. Y la grapadora, sospechas, va a hacer falta.',
      scene: { wall: '#c9ced8', floor: '#3d4a6b', floorH: 36, pattern: 'carpet' },
      carry: ['informe'],
      decor: [
        { kind: 'flag-eu', l: 36, t: 32, w: 7, h: 9 },
        { kind: 'flag-eu', l: 57, t: 32, w: 7, h: 9 },
        { kind: 'column', l: 16, t: 4, w: 3, h: 58 },
        { kind: 'column', l: 72, t: 4, w: 3, h: 58 },
        { kind: 'counter', l: 24, t: 62, w: 52, h: 8 },
        { emoji: '🪑', x: 34, y: 78, s: 4, o: 0.8 }, { emoji: '🪑', x: 58, y: 78, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'puerta', x: 7, y: 42, emoji: '🚪', s: 11, label: 'Puerta de la sala (código de 4 cifras)',
          look(g) {
            g.input({
              title: '🚪 Puerta de la sala', text: 'Cerradura electrónica. «Introduzca el código (4 cifras).»', numeric: true, maxLen: 4,
              check: (v) => v === '2007',
              failText: (v) => (v === '0207' ? 'Código rechazado. ¿Seguro que has usado el Reglamento correcto?' : rand(['Código rechazado. En 24 idiomas.', 'Accès refusé. Zugang verweigert. Acceso denegado. Ya lo has entendido.'])),
              ok: () => { g.say('Bip. La puerta se abre. En el pasillo, un ujier te ofrece un croissant: es el último. Te lo has ganado. Y, con una reverencia, una grapadora homologada UE: «De parte de la Representación, por lo del informe».'); g.give('grapadoraUE'); g.win(); },
            });
          } },
        { id: 'cabina', x: 86, y: 28, emoji: '🎧', s: 6, label: 'Cabina de interpretación (ES)',
          look(g) {
            if (!g.flag('nota')) return g.say('—¿Es usted el/la de los fondos? La Representación ha dejado una nota para usted. Pero me han dicho que solo se la dé a cambio del informe del auditor. Órdenes. En veinticuatro idiomas.', 'Intérprete');
            g.say('—Llevo seis horas traduciendo «llegaremos a un acuerdo en la próxima cumbre». Ya me sale en sueños. En húngaro.', 'Intérprete');
          },
          use: {
            informe(g) {
              g.take('informe'); g.set('nota');
              g.say('La intérprete coge el informe sin dejar de traducir y te pasa una nota doblada: —Esto es para usted, de la Representación. Dicen que con este informe salvan la cumbre. Yo no he visto nada. En veinticuatro idiomas.', 'Intérprete');
              g.give('nota');
            },
          } },
        { id: 'regA', x: 32, y: 58, emoji: '📘', s: 5, label: 'Reglamento (UE) 2032/118', look: (g) => regDoc(g, 'A') },
        { id: 'regB', x: 66, y: 58, emoji: '📙', s: 5, label: 'Reglamento (UE) 2032/97', look: (g) => regDoc(g, 'B') },
        { id: 'manual', x: 11, y: 80, emoji: '📒', s: 5, label: 'Manual del becario',
          look(g) {
            g.doc('📒 Manual del becario de la Representación', `<p><b>Capítulo 7. Notas cifradas.</b></p>
              <p>Las notas internas se cifran con el sistema «considerando-palabra»: cada pareja <b>(c, p)</b> remite a la <b>palabra número p</b> del <b>considerando número c</b> del <b>último Reglamento publicado</b> en el Diario Oficial.</p>
              <p>El número entre paréntesis del considerando no cuenta como palabra. Los signos de puntuación, tampoco. Las tildes, como siempre en Bruselas, son opcionales.</p>
              <p><b>Capítulo 8.</b> Cómo poner cara de entender el francés.</p>
              <p><b>Capítulo 9.</b> Dónde están los croissants (y por qué ya no quedan).</p>`);
          } },
        { id: 'calendario', x: 28, y: 22, emoji: '📅', s: 5, label: 'Calendario de sesiones',
          look(g) { g.doc('📅 Calendario de sesiones', `${calHTML(2032, 5)}${calHTML(2032, 6)}<p class="small">Las sesiones se convocan con la antelación suficiente para que nadie pueda prepararlas.</p>`); } },
        { id: 'pantalla', x: 50, y: 14, sign: 'ORDEN DEL DÍA', sub: '📺', w: 16, label: 'Pantalla: orden del día',
          look(g) { g.doc('📺 Orden del día', '<ol><li>Aprobación del orden del día.</li><li>Debate sobre la conveniencia de debatir.</li><li>Foto de familia.</li><li>Cena de trabajo (sin trabajo).</li><li>Conclusiones (redactadas el día anterior).</li></ol>'); } },
        { id: 'glosario', x: 92, y: 80, emoji: '📖', s: 5, label: 'Glosario de eurojerga',
          look(g) {
            g.doc('📖 Glosario de eurojerga (uso interno)', `<ul><li><b>Subsidiariedad:</b> no es cosa nuestra.</li><li><b>Trílogo:</b> tres instituciones discutiendo quién paga la cena.</li>
              <li><b>Comitología:</b> el arte de crear un comité para decidir qué comité decide.</li><li><b>Acervo:</b> todo lo que ya no se puede cambiar.</li>
              <li><b>Hoja de ruta:</b> documento que no lleva a ninguna parte.</li><li><b>Avance significativo:</b> nada.</li><li><b>Paso histórico:</b> casi nada.</li></ul>`);
          } },
        { id: 'delegado', x: 46, y: 82, emoji: '🧔', s: 6, label: 'Delegado de un Estado frugal',
          look(g) { g.say('—Mi país propone recortar el presupuesto de los croissants. Y el de las servilletas. Y el de esta conversación.', 'Delegado frugal'); } },
        { id: 'croissants', x: 72, y: 82, emoji: '🥐', s: 5, label: 'Bandeja de croissants',
          look(g) { g.say('Una bandeja vacía con migas. Un cartel: «Croissants de cortesía». La cortesía se acabó a las 9:03.'); } },
      ],
      hints: [
        'La intérprete te cambia el informe del auditor por una nota cifrada. El manual del becario explica el método: pares (considerando, palabra) del último Reglamento PUBLICADO.',
        'Hay dos Reglamentos. Fíjate en la fecha de publicación en el Diario Oficial, no en el número: el 2032/97 se publicó después (30.6.2032) que el 2032/118 (12.6.2032).',
        'La nota dice: «LA CLAVE ES EL DÍA Y EL MES DE ENTRADA EN VIGOR». El Reglamento entra en vigor el vigésimo día siguiente a su publicación.',
        'Publicado el 30 de junio + 20 días = 20 de julio. Código de la puerta: 2007.',
      ],
    },

    // ------------------------------------------------------ 6
    {
      title: 'El Senado',
      place: 'Senado — Comisión General de Asuntos Pendientes',
      stars: 4,
      intro: 'Primavera de 2033. La «Ley de Simplificación de Reclamaciones» llega al Senado. Tiene un solo artículo y ocho enmiendas. Los cuatro grupos de la Comisión llevan meses negociando; hoy, por fin, se vota.<br><br>Tú presides la Mesa, con la grapadora homologada de Bruselas en el bolsillo: desde el Reglamento 2032/97, la Cámara no admite textos grapados de cualquier manera. El Letrado Mayor solo dará por bueno el texto que resulte exactamente de las votaciones, tramitadas en el orden reglamentario.<br><br><b>Objetivo:</b> averigua qué enmiendas se aprueban, cuáles se rechazan y cuáles decaen, y entrega al Letrado el texto definitivo, grapado como manda Europa.',
      outro: 'La Ley se aprueba, se publica y te quedas un ejemplar grapado a 45°. Al día siguiente, el Grupo Rotonda Federal, que votó a favor, la recurre ante el Tribunal Constitucional «por coherencia». Te toca defenderla con la Ley en la mano. Y hay plazos.',
      scene: { wall: '#6b2737', floor: '#4a2d22', floorH: 46, pattern: 'carpet' },
      carry: ['grapadoraUE'],
      decor: [
        { kind: 'arc' },
        { kind: 'counter', l: 38, t: 48, w: 24, h: 7 },
        { emoji: '🎥', x: 95, y: 40, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'mesa', x: 50, y: 42, emoji: '🔔', s: 6, label: 'Mesa de la Comisión (votación)',
          look(g) {
            if (g.flag('lawOk')) return g.say('La votación ya está hecha y el texto, conforme. Ahora falta grapar el texto y entregárselo al Letrado Mayor.');
            senadoModal(g);
          } },
        { id: 'reglamento', x: 18, y: 20, sign: 'REGLAMENTO', sub: '📕', w: 13, label: 'Reglamento de la Cámara',
          look(g) {
            g.doc('📕 Reglamento de la Cámara (extracto)', `<ol><li>Las enmiendas se votan <b>por tipos</b>: primero las de <b>supresión</b>, después las de <b>modificación</b> y por último las de <b>adición</b>. Dentro de cada tipo, por orden de <b>número</b>.</li>
              <li>Una enmienda se aprueba si obtiene <b>más votos a favor que en contra</b>. Las abstenciones no cuentan. En caso de empate, se rechaza.</li>
              <li>Cada enmienda aprobada se incorpora al texto en el momento de su votación.</li>
              <li>Si, al llegar su turno, el texto al que se refiere una enmienda ya no existe, la enmienda <b>decae</b> y no se vota.</li>
              <li>La Comisión tiene <b>21 miembros</b>; asisten todos (hay catering).</li></ol>`);
          } },
        { id: 'proyecto', x: 82, y: 20, sign: 'PROYECTO DE LEY', sub: '📄', w: 15, label: 'Proyecto de ley y enmiendas',
          look(g) {
            g.doc('📄 Proyecto de Ley de Simplificación de Reclamaciones', `<p class="s5-law">${LAW0}</p><p><b>Enmiendas presentadas:</b></p>
              <table class="s5-t">${ENM.map((e) => `<tr><td><b>E${e.n}</b></td><td>${e.g}</td><td>${e.t}</td><td>${e.d}</td></tr>`).join('')}</table>`);
          } },
        { id: 'letrado', x: 50, y: 64, emoji: '🤓', s: 6, label: 'Letrado Mayor',
          look(g) {
            g.doc('🤓 Informe de los Letrados sobre el efecto de las enmiendas', `<p>A efectos de las posiciones de los grupos, los Letrados informan:</p>
              <table class="tbl"><tr><td>E1 (treinta → noventa)</td><td>Alarga el plazo</td></tr><tr><td>E2 (suprime «y por triplicado»)</td><td>Neutra</td></tr>
              <tr><td>E3 (naturales → hábiles)</td><td>Alarga el plazo</td></tr><tr><td>E4 (añade «o en la de al lado»)</td><td>Neutra</td></tr>
              <tr><td>E5 (noventa → sesenta)</td><td>Acorta el plazo</td></tr><tr><td>E6 (suprime «por escrito y»)</td><td>Neutra</td></tr>
              <tr><td>E7 (añade «debidamente motivadas»)</td><td>Neutra</td></tr><tr><td>E8 (treinta → quince)</td><td>Acorta el plazo</td></tr></table>
              <p class="small">Los Letrados no opinan. Informan. Que es opinar con membrete.</p>
              <p class="small"><b>Nota de la Secretaría:</b> desde la entrada en vigor del Reglamento (UE) 2032/97, los textos se remiten al Pleno con grapa única a 45°. Los clips, al museo.</p>`);
          },
          use: {
            textoLey(g) { g.say('—¿Hojas sueltas? Ni hablar. El Reglamento europeo exige grapa única a 45°. Grápelo con una grapadora homologada y vuelva.', 'Letrado Mayor'); },
            grapadoraUE(g) { g.say('—Una grapadora homologada, qué maravilla. Pero grapar el aire no cuenta: grape el texto aprobado.', 'Letrado Mayor'); },
            ley(g) {
              g.take('ley');
              g.say('El Letrado mide el ángulo de la grapa con un transportador: 45° exactos. —Conforme. Se remite al Pleno. —El Pleno lo aprueba sin leerlo, como manda la tradición, y al día siguiente sale en el BOE. Los ciudadanos tendrán ahora QUINCE días. Debidamente motivados. En la ventanilla de al lado.', 'Letrado Mayor');
              g.say('—Tenga un ejemplar para usted. Grapado, por supuesto. Algo me dice que lo va a necesitar.', 'Letrado Mayor');
              g.give('ley');
              g.win();
            },
          } },
        { id: 'gac', x: 14, y: 72, emoji: '⏳', s: 6, tag: 'GAC · 9', label: 'Portavoz del GAC — Grupo Aplazamiento Constructivo (9)',
          look(g) { g.say('—Votamos a favor de nuestras enmiendas y en contra de todas las del GRF, por principio. En las demás, nos abstenemos: es lo que mejor se nos da.', '⏳ Portavoz del GAC (9 senadores)'); } },
        { id: 'grf', x: 30, y: 60, emoji: '🔄', s: 6, tag: 'GRF · 7', label: 'Portavoz del GRF — Grupo Rotonda Federal (7)',
          look(g) { g.say('—A favor de las nuestras. En contra de cualquier enmienda que alargue un plazo: los plazos largos son para los débiles. En lo demás, abstención.', '🔄 Portavoz del GRF (7 senadores)'); } },
        { id: 'gpa', x: 70, y: 60, emoji: '🌉', s: 6, tag: 'GPA · 4', label: 'Portavoz del GPA — Grupo Puente y Acueducto (4)',
          look(g) { g.say('—A favor de las nuestras. En todas las demás votamos lo mismo que el GRF, que para eso compartimos asesor.', '🌉 Portavoz del GPA (4 senadores)'); } },
        { id: 'gmi', x: 86, y: 72, emoji: '🤷', s: 6, tag: 'GMI · 1', label: 'Senador del GMI — Grupo Mixto Indeciso (1)',
          look(g) { g.say('—Yo voto a favor de todo lo que se vote. Así nadie se enfada conmigo. Bueno, sí, pero menos.', '🤷 Senador del GMI (1)'); } },
        { id: 'reloj', x: 50, y: 13, emoji: '🕰️', s: 5, label: 'Reloj de la Cámara',
          look(g) { g.say('Son las 19:58. A las 20:00 se levanta la sesión pase lo que pase. Lleva así desde el siglo XIX: el reloj marca siempre las 19:58.'); } },
        { id: 'dormido', x: 94, y: 88, emoji: '😴', s: 5, label: 'Senador de otra comisión',
          look(g) { g.say('Un senador de otra comisión, dormido. Se equivocó de sala en 2023 y nadie se ha atrevido a despertarlo.'); } },
        { id: 'tapiz', x: 4, y: 40, emoji: '🖼️', s: 5, label: 'Tapiz histórico',
          look(g) { g.say('Un tapiz con una escena épica: unos senadores del siglo XIX votando una enmienda a una enmienda de una enmienda. Aún no han terminado.'); } },
      ],
      combos: {
        'grapadoraUE+textoLey'(g) {
          g.take('textoLey'); g.give('ley');
          g.say('Clac. Grapa única, esquina superior izquierda, 45° exactos. La grapadora de Bruselas suena a mercado interior. El texto ya es un documento como Dios (y la Comisión Europea) manda.');
        },
      },
      hints: [
        'Lee el Reglamento (orden de votación y cuándo decae una enmienda), el informe del Letrado (qué alarga o acorta un plazo) y escucha a los cuatro portavoces. Cuando el texto sea conforme, grápalo con la grapadora de Bruselas y entrégaselo al Letrado.',
        'Orden: E2, E6 (supresión) → E1, E3, E5, E8 (modificación) → E4, E7 (adición). Calcula los votos de cada una con 9 + 7 + 4 + 1 senadores.',
        'E2 se aprueba (12-9) y hace decaer E6. E1 se rechaza (10-11) y E3 también (5-7). Por tanto E5 decae. E8 se aprueba (12-9). E4 (10-0) y E7 (1-0) se aprueban.',
        'Texto final: «Los ciudadanos podrán presentar reclamaciones debidamente motivadas en el plazo de quince días naturales, por escrito, en la ventanilla correspondiente o en la de al lado.» Remítelo, combina el texto con la grapadora homologada y entrega la Ley grapada al Letrado Mayor.',
      ],
    },

    // ------------------------------------------------------ 7
    {
      title: 'El Tribunal Constitucional',
      place: 'Tribunal Constitucional — Registro General',
      stars: 4,
      intro: 'Verano de 2033. La Ley de Simplificación ha sido recurrida ante el Tribunal Constitucional. Debes presentar las alegaciones del Gobierno <b>en plazo</b>, con la Ley impugnada adjunta (tu ejemplar grapado, por fin, sirve para algo).<br><br>El Registro no acepta ningún escrito sin la fecha exacta de vencimiento del plazo. Y la doctrina del Tribunal sobre cómo se cuentan los plazos es... abundante. Y contradictoria.<br><br><b>Objetivo:</b> adjunta la Ley, averigua el último día del plazo e indícaselo al funcionario del Registro.',
      outro: 'Alegaciones presentadas en plazo; te llevas la copia sellada. El Tribunal admite el recurso a trámite... y lo deja pendiente: el Consejo Superior de la Toga, que tiene que renovar a parte de sus miembros, lleva casi novecientos días bloqueado. Te encargan desbloquearlo. Tú. Personalmente. (Te llevará tres años.)',
      scene: { wall: '#e8e2d0', floor: '#5b4636', floorH: 34, pattern: 'wood' },
      carry: ['ley'],
      decor: [
        { kind: 'column', l: 3, t: 4, w: 3, h: 60 },
        { kind: 'column', l: 94, t: 4, w: 3, h: 60 },
        { kind: 'counter', l: 58, t: 54, w: 28, h: 9 },
        { kind: 'shelf', l: 14, t: 46, w: 26, h: 2 },
        { kind: 'flag', l: 41, t: 4, w: 4, h: 7 },
      ],
      hotspots: [
        { id: 'registro', x: 72, y: 46, emoji: '🧑‍💼', s: 6, label: 'Funcionario del Registro',
          look(g) {
            if (!g.flag('adj')) return g.say('—¿Alegaciones? Primero adjunte la ley impugnada. Un ejemplar oficial, completo y bien grapado. Sin ley, ¿qué defiende usted? ¿El aire?', 'Funcionario del Registro');
            g.say('—Para registrar sus alegaciones necesito la fecha de vencimiento del plazo. Si me da una fecha equivocada, el sistema rechaza el escrito. Y el sistema no perdona.', 'Funcionario del Registro');
            g.input({
              title: '🗓️ Registro General — Vencimiento', text: 'Último día del plazo para formular alegaciones (formato <b>DDMM</b>).', numeric: true, maxLen: 4,
              check: (v) => v === '0809',
              failText: () => rand(['—Fecha errónea. O se ha pasado, o se ha quedado corto. El sistema no dice cuál: sería prejuzgar.', '—Rechazado. Revise el cómputo: qué días son hábiles según la doctrina vigente, desde cuándo se cuenta y qué cédula es la suya.']),
              ok: () => { g.say('—Jueves 8 de septiembre... Correcto. Registrado en plazo. Es usted la primera persona que lo calcula bien sin llamar a un catedrático. Tenga su copia sellada.', 'Funcionario del Registro'); g.give('acuseTC'); g.win(); },
            });
          },
          use: {
            ley(g) {
              g.take('ley'); g.set('adj');
              g.say('—Ley de Simplificación de Reclamaciones... grapa única a 45°. Qué gusto da ver las cosas bien hechas. Adjuntada. Ahora dígame cuándo vence el plazo (hábleme otra vez).', 'Funcionario del Registro');
            },
          } },
        { id: 'buzon', x: 90, y: 66, emoji: '📬', s: 6, label: 'Casillero de notificaciones',
          look(g) {
            g.doc('📬 Cédulas de notificación', `<div class="paper-note"><b>Cédula 1.</b> Recurso de inconstitucionalidad nº <b>1174-2033</b> (Ley de Rotondas). Notificada el <b>viernes 8 de julio de 2033</b>.</div><br>
              <div class="paper-note"><b>Cédula 2.</b> Recurso de inconstitucionalidad nº <b>1147-2033</b>. Notificada el <b>viernes 15 de julio de 2033</b>.</div>`);
          } },
        { id: 'expediente', x: 48, y: 58, emoji: '📁', s: 6, label: 'Expediente: providencia',
          look(g) {
            g.doc('📁 Providencia del Pleno', `<p><b>Recurso de inconstitucionalidad nº 1147-2033</b>, promovido por el Grupo Rotonda Federal contra la Ley de Simplificación de Reclamaciones.</p>
              <p>El Pleno acuerda admitir a trámite el recurso y dar traslado al Gobierno para que, en el plazo de <b>QUINCE días</b>, pueda personarse y formular alegaciones.</p>
              <p class="small">Notifíquese. (Ya se ha notificado; ver casillero.)</p>`);
          } },
        { id: 'lo', x: 18, y: 40, emoji: '📕', s: 5, label: 'Ley Orgánica del Tribunal',
          look(g) {
            g.doc('📕 Ley Orgánica del Tribunal (extracto)', `<p><b>Art. 80.</b> Los plazos señalados por días se computan en <b>días hábiles</b>, conforme a la doctrina de este Tribunal.</p>
              <p>Los <b>domingos</b> y los <b>festivos nacionales</b> son siempre inhábiles.</p>
              <p>Si el último día del plazo fuera inhábil, se entenderá prorrogado al primer día hábil siguiente.</p>`);
          } },
        { id: 'jurisp', x: 32, y: 40, emoji: '📚', s: 6, label: 'Estantería de jurisprudencia',
          look(g) {
            g.doc('📚 Doctrina sobre cómputo de plazos (selección)', `<table class="s5-t">
              <tr><td>STC 9/2017 (<b>Pleno</b>)</td><td>El plazo se computa a partir del <b>día siguiente</b> al de la notificación.</td></tr>
              <tr><td>STC 3/2018 (Sala Primera)</td><td>Agosto es hábil.</td></tr>
              <tr><td>STC 12/2019 (<b>Pleno</b>)</td><td>Los sábados son hábiles.</td></tr>
              <tr><td>STC 33/2020 (<b>Pleno</b>)</td><td>Los festivos locales del municipio sede del Tribunal son inhábiles.</td></tr>
              <tr><td>STC 21/2022 (<b>Pleno</b>)</td><td>Agosto es inhábil para todos los plazos, salvo en el recurso de amparo electoral.</td></tr>
              <tr><td>STC 48/2023 (<b>Pleno</b>)</td><td>Los sábados son inhábiles. Se revisa la doctrina anterior.</td></tr>
              <tr><td>STC 64/2024 (Sala Segunda)</td><td>Los festivos locales no afectan a los plazos.</td></tr>
              <tr><td>STC 81/2024 (Sala Primera)</td><td>El plazo se computa desde el mismo día de la notificación.</td></tr>
              <tr><td>STC 60/2029 (Sala Segunda)</td><td>Agosto es hábil, que hay mucho trabajo.</td></tr>
              <tr><td>STC 70/2032 (Sala Primera)</td><td>Los sábados son hábiles.</td></tr></table>`);
          } },
        { id: 'acuerdo', x: 50, y: 20, sign: 'ACUERDO DEL PLENO', sub: '⚖️', w: 16, label: 'Acuerdo del Pleno sobre doctrina',
          look(g) {
            g.doc('⚖️ Acuerdo del Pleno sobre doctrina contradictoria', `<ol><li>En caso de contradicción, la doctrina del <b>Pleno</b> prevalece sobre la de cualquier Sala, <b>sea cual sea su fecha</b>.</li>
              <li>Entre resoluciones del mismo órgano, prevalece la <b>más reciente</b>.</li></ol>
              <p class="small">Este acuerdo prevalece sobre sí mismo, por si acaso.</p>`);
          } },
        { id: 'calendario', x: 84, y: 22, emoji: '📅', s: 6, label: 'Calendario del Tribunal',
          look(g) { g.doc('📅 Calendario 2033 — Sede del Tribunal', TC_CAL()); } },
        { id: 'reloj', x: 16, y: 16, emoji: '⌛', s: 4, label: 'Reloj de arena',
          look(g) { g.say('Un reloj de arena con una placa: «Para el cómputo de plazos». La arena está atascada. Muy apropiado.'); } },
        { id: 'toga', x: 10, y: 60, emoji: '🥼', s: 6, label: 'Toga colgada',
          look(g) { g.say('Una toga con puñetas. En el bolsillo, una nota: «Recordar: el Pleno manda. Las Salas, opinan».'); } },
        { id: 'abogado', x: 28, y: 80, emoji: '🙍', s: 6, label: 'Abogado desolado',
          look(g) { g.say('—Yo conté los sábados como hábiles porque lo decía una sentencia de 2032. Del año pasado, ¿eh? Muy reciente. Pero era de Sala. Me lo han inadmitido.', 'Abogado desolado'); } },
        { id: 'banco', x: 60, y: 84, emoji: '🪑', s: 5, label: 'Banco de espera',
          look(g) { g.say('Un banco de madera noble, gastado por generaciones de abogados esperando una providencia.'); } },
      ],
      hints: [
        'Primero entrega al funcionario del Registro la Ley que traes. Tu recurso es el 1147-2033 (la providencia lo dice): busca su cédula. El plazo es de 15 días hábiles. Para saber qué días son hábiles, aplica el Acuerdo del Pleno a la jurisprudencia.',
        'Prevalece el Pleno; entre Plenos, el más reciente. Así: se cuenta desde el día siguiente; sábados inhábiles (STC 48/2023); agosto inhábil; festivos locales inhábiles.',
        'Desde el sábado 16 de julio: 18, 19, 20, 21 (el 22 es festivo local), 25, 26, 27, 28, 29 de julio = 9 días. Agosto no cuenta. Septiembre: 1, 2, 5, 6, 7, 8.',
        'Último día: jueves 8 de septiembre de 2033. Código: 0809.',
      ],
    },

    // ------------------------------------------------------ 8
    {
      title: 'El órgano bloqueado',
      place: 'Cámara — Sala de negociación (a puerta cerrada)',
      stars: 5,
      intro: 'Septiembre de 2036. Tres años de reuniones después, el Consejo Superior de la Toga lleva <b>2.000 días</b> caducado. Para renovarlo hace falta una lista de cuatro vocales aprobada por <b>tres quintos</b> de la Cámara: 210 de 350 escaños.<br><br>Seis grupos, ocho candidatos, un sinfín de vetos cruzados. La urna está precintada: la Presidencia solo convoca la votación si alguien demuestra que el bloqueo paraliza algo importante. Tú traes la copia sellada de tus alegaciones del recurso 1147-2033, que sigue esperando.<br><br><b>Objetivo:</b> consigue que se abra la urna y propón una lista de cuatro vocales que cumpla la Ley Orgánica y obtenga al menos 210 votos.',
      outro: 'Consejo renovado. El país entero asiste, atónito, a un acuerdo. Como premio (o castigo), te nombran Ministro/a de Asuntos Pendientes: el BOE lo publica a la mañana siguiente y llevas el nombramiento encima, por si acaso. Tu primer Consejo de Ministros es ese mismo día. El orden del día, por supuesto, está cifrado.',
      scene: { wall: '#3b3f4a', floor: '#5a4c3c', floorH: 38, pattern: 'wood' },
      carry: ['acuseTC'],
      decor: [
        { kind: 'counter', l: 22, t: 56, w: 56, h: 9 },
        { kind: 'flag', l: 46, t: 30, w: 4, h: 7 },
        { kind: 'board', l: 4, t: 10, w: 12, h: 18 },
        { emoji: '☕', x: 32, y: 58, s: 3, o: 0.9 }, { emoji: '☕', x: 66, y: 58, s: 3, o: 0.9 },
      ],
      hotspots: [
        ...GROUPS.map((p) => ({
          id: 'g_' + p.id, x: p.x, y: p.y, emoji: p.emoji, s: 6, tag: `${p.id} · ${p.seats}`, label: `${p.id} · ${p.name} (${p.seats} escaños)`,
          look(g) { g.say(p.say, `${p.emoji} Portavoz del ${p.id} — ${p.name} (${p.seats})`); },
        })),
        { id: 'candidatos', x: 30, y: 18, sign: 'CANDIDATOS', sub: '🗂️', w: 14, label: 'Relación de candidatos',
          look(g) {
            g.doc('🗂️ Candidatos a vocal', `<table class="s5-t"><tr><th>Candidato/a</th><th>Perfil</th><th>Experiencia</th><th>Propuesto por</th></tr>
              ${CANDS.map((c) => `<tr><td>${c.n}</td><td>${c.prof}</td><td>${c.y} años</td><td>${c.p}</td></tr>`).join('')}</table>
              <p class="small">Todos los candidatos son de reconocida competencia. Algunos incluso lo reconocen ellos mismos.</p>`);
          } },
        { id: 'lo', x: 70, y: 18, sign: 'LEY ORGÁNICA', sub: '⚖️', w: 14, label: 'Ley Orgánica del Consejo',
          look(g) {
            g.doc('⚖️ Ley Orgánica del Consejo Superior de la Toga (extracto)', `<ol><li>La Cámara elegirá <b>cuatro vocales</b> por mayoría de <b>tres quintos</b> (210 de 350 escaños).</li>
              <li>La lista será <b>paritaria</b>: dos mujeres y dos hombres.</li>
              <li>Al menos <b>dos</b> de los vocales serán jueces o juezas de carrera.</li></ol>
              <p class="small">Disposición adicional: si no hay acuerdo, los vocales salientes continuarán en funciones hasta el fin de los tiempos.</p>`);
          } },
        { id: 'escanos', x: 50, y: 14, sign: 'ESCAÑOS', sub: '🔢', w: 12, label: 'Reparto de escaños',
          look(g) { g.doc('🔢 Reparto de escaños', `<table class="tbl">${GROUPS.map((p) => `<tr><td>${p.emoji} <b>${p.id}</b> — ${p.name}</td><td>${p.seats}</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>350</b></td></tr></table><p class="small">Cada grupo vota en bloque: o todos sí, o todos no.</p>`); } },
        { id: 'urna', x: 50, y: 46, emoji: '🗳️', s: 6, label: (g) => (g.flag('habil') ? 'Urna de votación' : 'Urna de votación (precintada)'),
          look(g) {
            if (!g.flag('habil')) return g.say('La urna está precintada. Una nota de la Presidencia: «Solo se convocará la votación cuando se acredite que el bloqueo paraliza algún asunto de Estado. Con papeles. Sellados». En 2.000 días nadie ha traído ninguno.');
            renovModal(g);
          },
          use: {
            acuseTC(g) {
              g.take('acuseTC'); g.set('habil');
              g.say('Dejas sobre la urna la copia sellada: alegaciones del recurso 1147-2033, presentadas en plazo… hace tres años. «Recurso paralizado: falta renovar el Consejo». La Presidenta de la Cámara la lee, se pone colorada y rompe el precinto: —Se abre la votación. Y que no salga de aquí que lo ha tenido que traer usted.', 'Presidencia de la Cámara');
            },
          } },
        { id: 'contador', x: 10, y: 19, emoji: '📆', s: 4, label: 'Contador de días',
          look(g) { g.say('«Días con el Consejo caducado: 2.000». Alguien ha pegado debajo un pósit: «¡Felicidades!».'); } },
      ],
      hints: [
        'Usa la copia sellada de tus alegaciones en la urna para que la Presidencia la desprecinte. Después, habla con los seis portavoces y lee la Ley Orgánica. Haz cuentas: ¿qué combinaciones de grupos llegan a 210? El BDB y el URC nunca votan lo mismo.',
        'Sin el ABL no hay manera de llegar a 210, así que no puede ir ningún candidato del BDB. Con el ABL necesitas a la CMC y al PCP, y además al URC o al MIX.',
        'CMC exige a Celia y veta a Diego → el ABL necesita a Amparo. PCP exige dos juristas sin juntar a Celia y Gloria → Fermín. Paridad y dos jueces → el cuarto es Hugo.',
        'Lista: Amparo Recurso, Celia Sumario, Fermín Auto y Hugo Instancia. Votan sí ABL, CMC, PCP y URC (97 años de experiencia): 220 votos.',
      ],
    },

    // ------------------------------------------------------ 9
    {
      title: 'El Consejo de Ministros',
      place: 'Palacio de Gobierno — Sala del Consejo',
      stars: 5,
      intro: 'Miércoles 1 de octubre de 2036. Tu primer Consejo de Ministros, con el nombramiento del BOE todavía caliente en la mano. Cuatro ministros, un Presidente y un orden del día <b>cifrado</b> «por razones de seguridad», con una máquina de cifra de 1898 que solo maneja quien se acredita ante el Secretario del Consejo.<br><br>La clave del día depende de dónde se sienta cada cual. Y nadie recuerda quién se sienta dónde, ni quién lleva qué cartera.<br><br><b>Objetivo:</b> acredítate, deduce quién se sienta dónde, descifra el orden del día, abre la cartera roja y entrega al Presidente lo que contiene.',
      outro: 'El Consejo aprueba el Real Decreto 1147/2036, y su disposición adicional te nombra Presidente/a de la Comisión para la Simplificación Total. En la rueda de prensa, alguien pregunta por qué ha hecho falta descifrarlo. «Transparencia», responde el portavoz. Mañana te esperan en Presidencia, Real Decreto en mano. Entre tú y el despacho: el laberinto del Estado. (Toda la tarde tienes la sensación de que hoy vencía algo. No recuerdas qué.)',
      scene: { wall: '#efe7d6', floor: '#7a5a3c', floorH: 36, pattern: 'wood' },
      carry: ['nombramiento'],
      decor: [
        { kind: 'counter', l: 24, t: 60, w: 52, h: 9 },
        { kind: 'flag', l: 6, t: 6, w: 5, h: 8 },
        { kind: 'flag-eu', l: 92, t: 8, w: 5, h: 7 },
        { kind: 'window', l: 40, t: 24, w: 20, h: 14 },
        { emoji: '🪑', x: 32, y: 72, s: 4, o: 0.8 }, { emoji: '🪑', x: 44, y: 72, s: 4, o: 0.8 },
        { emoji: '🪑', x: 56, y: 72, s: 4, o: 0.8 }, { emoji: '🪑', x: 68, y: 72, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'presidente', x: 50, y: 50, emoji: '🤵', s: 7, label: 'Presidente del Gobierno',
          look(g) {
            g.say('—Empezamos cuando alguien descifre el orden del día. El Real Decreto está en la cartera roja; la combinación, en el orden del día. Así lo dispuso un ministro en 1898 y nadie se ha atrevido a cambiarlo.', 'Presidente');
          },
          use: {
            decreto9(g) {
              g.take('decreto9');
              g.say('—¿Alguna objeción? ...¿Nadie? Queda aprobado. Ha sido el Consejo más rápido desde 1898. Pueden irse. Usted no: tengo un encargo para usted.', 'Presidente');
              g.say('—Le he añadido una disposición adicional: queda usted nombrado/a Presidente/a de la Comisión para la Simplificación Total. Con este Real Decreto podrá abrir la Caja de los Cuatro Sellos. No lo pierda: es el único ejemplar firmado.', 'Presidente');
              g.give('rdAprobado');
              g.win();
            },
          } },
        { id: 'gobierno', x: 50, y: 13, sign: 'COMPOSICIÓN DEL GOBIERNO', sub: '🏛️', w: 22, label: 'Composición del Gobierno',
          look(g) {
            g.doc('🏛️ Composición del Gobierno', `<p>Ministros asistentes (además de ti, que no tienes asiento asignado: estás de pie, como corresponde a los nuevos):</p>
              <ul><li><b>Dña.</b> Nuria Dietas</li><li><b>Dña.</b> Pilar Escalafón</li><li><b>D.</b> Tomás Quórum</li><li><b>D.</b> Luis Trienio</li></ul>
              <p>Carteras: <b>C</b>ultura, <b>A</b>suntos Pendientes, <b>F</b>omento y <b>E</b>conomía. (Nadie recuerda quién lleva cuál: ha habido tres remodelaciones este mes.)</p>`);
          } },
        { id: 'protocolo', x: 80, y: 20, sign: 'PROTOCOLO', sub: '🪑', w: 13, label: 'Plano de protocolo (medio quemado)',
          look(g) {
            g.doc('🪑 Plano de protocolo', `<p>Los cuatro asientos se numeran del <b>1 al 4</b> en el sentido de las agujas del reloj, empezando a la derecha del Presidente. El Presidente queda entre el 4 y el 1, así que solo los asientos 1 y 4 están «junto al Presidente» (los extremos).</p>
              <p>Por antigüedad de la cartera, el asiento de <b>Cultura</b> tiene un número menor que el de <b>Asuntos Pendientes</b>.</p>
              <p class="small"><i>El resto del plano se quemó con una vela aromática en una reunión de crisis.</i></p>`);
          } },
        { id: 'secretario', x: 88, y: 50, emoji: '🧑‍💼', s: 6, label: 'Secretario del Consejo',
          look(g) {
            if (!g.flag('acred')) return g.say('—¿Y usted quién es? Aquí no se queda nadie sin nombramiento publicado en el BOE. Enséñemelo y le explico cómo funciona la máquina de cifra.', 'Secretario del Consejo');
            g.say('—La máquina de cifra se configura con la clave del día: las iniciales de las cuatro carteras, en el orden de los asientos, del 1 al 4. Yo no me acuerdo de quién se sienta dónde. Nadie se acuerda.', 'Secretario del Consejo');
            g.say('—Lo que sí sé es que Don Tomás Quórum no duerme nunca en los Consejos. Dice que alguien tiene que enterarse de algo.', 'Secretario del Consejo');
          },
          use: {
            nombramiento(g) {
              if (g.flag('acred')) return g.say('—Ya le he acreditado. No me lo enseñe más, que se me corre la tinta.', 'Secretario del Consejo');
              g.set('acred');
              g.say('—«Ministro/a de Asuntos Pendientes», BOE de esta mañana... Conforme. Bienvenido/a al Consejo. Le desbloqueo la máquina de cifra. Y escuche, que esto lo digo una sola vez (bueno, siempre que me pregunte).', 'Secretario del Consejo');
              g.say('—La máquina se configura con la clave del día: las iniciales de las cuatro carteras, en el orden de los asientos, del 1 al 4. Yo no me acuerdo de quién se sienta dónde. Nadie se acuerda. Lo que sí sé es que Don Tomás Quórum no duerme nunca en los Consejos.', 'Secretario del Consejo');
            },
          } },
        { id: 'maquina', x: 12, y: 54, emoji: '📠', s: 6, label: 'Máquina de cifra (1898)',
          look(g) {
            if (!g.flag('acred')) return g.say('La máquina de cifra tiene un candado de latón con una placa: «Solo para miembros del Gobierno acreditados ante el Secretario del Consejo». Lleva así desde 1898.');
            vigModal(g);
          } },
        { id: 'orden', x: 26, y: 22, sign: 'ORDEN DEL DÍA', sub: '🔒', w: 14, label: 'Orden del día (cifrado)',
          look(g) { g.doc('🔒 Orden del día', `<p class="small">Cifrado por razones de seguridad nacional (y de costumbre).</p><p class="cipher">${CIPHER9}</p>`); } },
        { id: 'manual', x: 10, y: 80, emoji: '📓', s: 5, label: 'Manual de cifra',
          look(g) {
            g.doc('📓 Manual de cifra del Consejo (edición de 1898)', `<p>Cada letra del texto cifrado se <b>retrasa</b> en el alfabeto (A-Z, sin Ñ, dando la vuelta de la A a la Z) tantas posiciones como vale la letra correspondiente de la clave: <b>A = 0, B = 1, C = 2…</b></p>
              <p>La clave se repite tantas veces como haga falta. Los espacios no consumen letras de la clave.</p>
              <p>Ejemplo: con la clave <b>BCD</b>, el texto cifrado «BDF» se descifra como «ABC».</p>
              <p class="small">La máquina de cifra lo hace sola si se le da la clave correcta. Si se le da una incorrecta, también lo hace, pero sale una tontería.</p>`);
          } },
        { id: 'acta', x: 40, y: 84, emoji: '📄', s: 5, label: 'Acta del Consejo anterior',
          look(g) {
            g.doc('📄 Acta del Consejo anterior (extracto)', `<p>…La ministra de Asuntos Pendientes solicitó aplazar el punto 3 al próximo Consejo, como viene siendo habitual.</p>
              <p>El titular de Fomento consultó el móvil durante toda la sesión y, preguntado al respecto, respondió que estaba «fomentando».</p>
              <p>Se levanta la sesión sin que conste que nadie se haya enterado de nada.</p>`);
          } },
        { id: 'ujier', x: 24, y: 80, emoji: '🧓', s: 6, label: 'Ujier veterano',
          look(g) {
            g.say('—Cuarenta años sirviendo cafés aquí. Le cuento: la de Economía no deja de tomar notas, y se sienta siempre en un extremo, pegadita al Presidente.', 'Ujier veterano');
            g.say('—Y Doña Nuria Dietas nunca se sienta en un extremo: dice que junto al Presidente le da corriente.', 'Ujier veterano');
          } },
        { id: 'prensa', x: 92, y: 82, emoji: '📸', s: 5, label: 'Fotógrafo de prensa',
          look(g) {
            g.say('—Tengo una foto buenísima del último Consejo: el ministro Trienio sentado justo en el asiento siguiente al de quien dormía la siesta. Siguiente en número, digo.', 'Fotógrafo');
            g.say('—Y el del crucigrama estaba en un extremo, junto al Presidente: lo pillé con el «nueve horizontal: trámite eterno».', 'Fotógrafo');
          } },
        { id: 'cartera', x: 66, y: 82, emoji: '💼', s: 6, label: 'Cartera roja (4 cifras)',
          look(g) {
            if (g.flag('cart')) return g.say('La cartera roja, vacía. Huele a cuero y a secreto oficial.');
            g.input({
              title: '💼 Cartera roja', text: 'Cerradura de 4 cifras.', numeric: true, maxLen: 4,
              check: (v) => v === '2413',
              failText: () => 'La cartera no se abre. Un ministro carraspea, impaciente.',
              ok: () => { g.set('cart'); g.say('Clac. Dentro de la cartera roja: el Real Decreto de Simplificación, listo para su aprobación.'); g.give('decreto9'); },
            });
          } },
      ],
      hints: [
        'Enseña tu nombramiento al Secretario del Consejo: te acreditará y desbloqueará la máquina. Luego reúne las pistas de la parrilla lógica: plano de protocolo, ujier, fotógrafo, acta, secretario y la composición del Gobierno (fíjate en Dña./D. y en «la ministra», «el titular»).',
        'Economía es una mujer en un extremo; como Dietas no está en un extremo, Economía es Escalafón. Asuntos Pendientes es la otra mujer: Dietas.',
        'Asientos: 1 Quórum (Cultura, crucigrama), 2 Dietas (Asuntos Pendientes, siesta), 3 Trienio (Fomento, móvil), 4 Escalafón (Economía, notas). Clave: CAFE.',
        'Con la clave CAFE: «La cartera roja se abre con el número de asiento de cada ministro por orden alfabético de apellido» → Dietas 2, Escalafón 4, Quórum 1, Trienio 3 = 2413. Da el decreto al Presidente.',
      ],
    },

    // ------------------------------------------------------ 10
    {
      title: 'El laberinto del Estado',
      place: 'Palacio de Gobierno — Antesalas de Presidencia',
      stars: 5,
      intro: 'Jueves 2 de octubre de 2036. Cinco años después de aprobar la oposición, llegas a lo más alto: el despacho donde se firma el <b>Decreto de Simplificación Total</b>, que suprimirá todos los trámites del Estado. Traes el Real Decreto 1147/2036 que te nombra y, en la cartera, tu DNI de siempre.<br><br>El decreto está en la <b>Caja de los Cuatro Sellos</b>, que solo se abre para quien acredite su nombramiento. Además necesitas los sellos de Registro, Hacienda, Europa y Senado, y una combinación que depende de todos ellos. Cada sello está custodiado a la manera de su casa.<br><br><b>Objetivo:</b> acredítate ante la Caja, consigue los cuatro sellos, ábrela, firma el decreto en la mesa presidencial y deja que el Secretario de Estado valide tu firma.',
      outro: 'Firmas el Decreto de Simplificación Total. El Secretario de Estado mira tu DNI. Lo vuelve a mirar. Mira el calendario.',
      scene: { wall: '#d7cfbf', floor: '#6e6257', floorH: 34, pattern: 'tiles' },
      carry: ['rdAprobado', 'dni'],
      decor: [
        { kind: 'column', l: 3, t: 4, w: 3, h: 62 },
        { kind: 'column', l: 94, t: 4, w: 3, h: 62 },
        { kind: 'flag-eu', l: 45, t: 4, w: 10, h: 12 },
        { kind: 'rug', l: 30, t: 72, w: 40, h: 18, color: '#7c2a2a' },
        { kind: 'counter', l: 28, t: 54, w: 44, h: 6 },
      ],
      hotspots: [
        { id: 'plano', x: 22, y: 20, sign: 'PLANO DE VENTANILLAS', sub: '🧭', w: 16, label: 'Plano: laberinto de remisiones (Sello de Registro)', look: mazeModal },
        { id: 'indice', x: 78, y: 20, sign: 'ÍNDICE DEL EXPEDIENTE', sub: '📑', w: 16, label: 'Índice del expediente',
          look(g) {
            g.doc('📑 Índice del expediente de Simplificación Total', `<p>La combinación de la Caja de los Cuatro Sellos se forma con la <b>cifra de cada sello</b>, en el orden en que el expediente los necesita:</p>
              <ol><li>Primero, <b>Europa</b> (sin fondos no hay nada).</li><li>Después, <b>Hacienda</b> (la tasa).</li><li>Luego, el <b>Senado</b> (la ley).</li><li>Y por último, el <b>Registro</b> (sí: el Registro de Entrada va al final. Es tradición).</li></ol>`);
          } },
        { id: 'bandera', x: 50, y: 28, sign: 'BANDERA DE LA UE', sub: '★ ★ ★', w: 13, label: 'Bandera de la Unión Europea',
          look(g) { g.say('La bandera de la Unión Europea: doce estrellas doradas en círculo sobre fondo azul. Siempre doce, entren o salgan los Estados que sean. Es lo único estable de Bruselas.'); } },
        { id: 'teletipo', x: 10, y: 54, emoji: '📠', s: 6, label: 'Teletipo (telegrama cifrado)', look: teletipoModal },
        { id: 'vHacienda', x: 36, y: 42, sign: 'HACIENDA', sub: '💶', w: 11, label: 'Ventanilla de Hacienda (Sello de Hacienda)',
          look(g) {
            if (g.has('selloHacienda')) return g.say('—Ya tiene su sello. No vuelva hasta la próxima campaña de la renta.', 'Hacienda');
            g.input({
              title: '💶 Ventanilla de Hacienda', text: '—Para el Sello de Hacienda, dígame cuánto cuesta <b>un timbre</b>, en euros. Lo sabrá si ha pagado las tasas, como todo el mundo.', numeric: true, maxLen: 2,
              check: (v) => +v === 5,
              failText: () => '—No. Revise los recibos. Hacienda no se equivoca nunca; usted, sí.',
              ok: () => { g.say('—Cinco euros, exacto. Tome su Sello de Hacienda. Y el recibo del sello, que cuesta otros cinco. Es broma. O no.', 'Hacienda'); g.give('selloHacienda'); },
            });
          } },
        { id: 'vEuropa', x: 64, y: 42, sign: 'EUROPA', sub: '🌐', w: 11, label: 'Ventanilla de Europa (Sello de Europa)',
          look(g) {
            if (g.has('selloEuropa')) return g.say('—Sello entregado. Se ruega no volver sin una hoja de ruta.', 'Europa');
            g.input({
              title: '🌐 Ventanilla de Europa', text: '—Para el Sello de Europa, dígame la cifra que corresponde a este sello. Las instrucciones las enviamos por telegrama cifrado, naturalmente.', numeric: true, maxLen: 2,
              check: (v) => +v === 3,
              failText: (v) => (+v === 12 ? '—Doce estrellas, sí. ¿Y qué decía el telegrama que había que hacer con ellas?' : '—Esa cifra no consta en el acervo comunitario.'),
              ok: () => { g.say('—Doce entre cuatro, tres. Aritmética comunitaria impecable. Tome el Sello de Europa.', 'Europa'); g.give('selloEuropa'); },
            });
          } },
        { id: 'recibos', x: 26, y: 84, emoji: '🧾', s: 5, label: 'Recibos de tasas',
          look(g) {
            g.doc('🧾 Recibos de tasas (pagados, faltaría más)', `<div class="paper-note">Recibo 1: 1 póliza + 1 timbre + 1 estampilla = <b>10 €</b></div><br>
              <div class="paper-note">Recibo 2: 2 pólizas + 1 estampilla = <b>7 €</b></div><br>
              <div class="paper-note">Recibo 3: 1 timbre + 2 estampillas = <b>11 €</b></div>
              <p class="small">Precios unitarios no desglosados, por simplificación administrativa.</p>`);
          } },
        { id: 'ujieres', x: 50, y: 64, emoji: '💂💂💂💂', s: 4, label: 'Los cuatro ujieres del Senado',
          look(g) {
            g.doc('💂 Los cuatro ujieres del Senado', `<p>Custodian las cuatro puertas que llevan al Sello del Senado. Solo una puerta es la buena. Por tradición, <b>exactamente uno</b> de los cuatro ujieres dice la verdad; los otros tres mienten.</p>
              <ul><li><b>Ujier 1:</b> «La puerta buena no es la 1».</li><li><b>Ujier 2:</b> «La puerta buena es la 3».</li>
              <li><b>Ujier 3:</b> «El ujier 2 miente».</li><li><b>Ujier 4:</b> «La puerta buena es la 2 o la 3».</li></ul>`);
          } },
        { id: 'puertas', x: 86, y: 50, emoji: '🚪', s: 10, label: 'Las cuatro puertas del Senado',
          look(g) {
            if (g.has('selloSenado')) return g.say('Ya tienes el Sello del Senado. Las otras tres puertas siguen dando a pasillos que vuelven aquí.');
            const wrong = (n) => (gg, msg) => { msg(`Abres la puerta ${n}: da a un pasillo que da a otro pasillo que vuelve aquí. Has perdido veinte minutos y un poco de fe.`, true); return false; };
            g.choice({
              title: '🚪 Las cuatro puertas', text: 'Detrás de una de ellas está el Sello del Senado. ¿Cuál abres?',
              options: [
                { label: 'Puerta 1', onPick(gg) { gg.say('La puerta 1 se abre a una salita con terciopelo rojo. Sobre un cojín, el Sello del Senado, con su cifra: 1. El ujier 3 te guiña un ojo: era el único honrado.'); gg.give('selloSenado'); } },
                { label: 'Puerta 2', onPick: wrong(2) },
                { label: 'Puerta 3', onPick: wrong(3) },
                { label: 'Puerta 4', onPick: wrong(4) },
              ],
            });
          } },
        { id: 'caja', x: 72, y: 80, emoji: '🧰', s: 6, label: 'Caja de los Cuatro Sellos',
          look(g) {
            if (g.flag('cajaOpen')) return g.say('La Caja está abierta y vacía. Solo queda el eco de cuatro siglos de sellos.');
            if (!g.flag('acredCaja')) return g.say('La Caja de los Cuatro Sellos tiene cuatro ranuras, un teclado apagado y, encima, una quinta ranura con una placa: «Introduzca el Real Decreto de nombramiento. Sin acreditación no se atiende, ni siquiera aquí».');
            const n = SELLOS.filter((s) => g.has(s)).length;
            if (n < 4) return g.say(`La Caja de los Cuatro Sellos tiene cuatro ranuras y un teclado. Sin los cuatro sellos colocados, el teclado ni se enciende. Tienes ${n} de 4.`);
            g.input({
              title: '🧰 Caja de los Cuatro Sellos', text: 'Colocas los cuatro sellos en sus ranuras. El teclado se ilumina: «COMBINACIÓN (4 cifras)».', numeric: true, maxLen: 4,
              check: (v) => v === '3517',
              failText: () => 'La Caja emite un sonido grave, como de expediente devuelto. Revisa el orden del índice.',
              ok: () => { g.set('cajaOpen'); g.say('La Caja se abre con un suspiro de cuatro siglos. Dentro, sobre terciopelo: el Decreto de Simplificación Total.'); g.give('decreto10'); },
            });
          },
          use: {
            rdAprobado(g) {
              if (g.flag('acredCaja')) return g.say('La Caja ya te ha reconocido. Ahora quiere sellos, no papeles.');
              g.take('rdAprobado'); g.set('acredCaja');
              g.say('Introduces el Real Decreto 1147/2036 por la quinta ranura. Un engranaje lo lee, lo sella y se lo traga. Una lucecita verde: «PRESIDENTE/A DE LA COMISIÓN PARA LA SIMPLIFICACIÓN TOTAL — ACREDITADO/A. Coloque los cuatro sellos».');
            },
          } },
        { id: 'mesaPres', x: 50, y: 84, emoji: '🖋️', s: 5, label: 'Mesa presidencial',
          look(g) {
            if (g.flag('firmado')) return g.say('El Decreto, firmado, con la tinta aún brillante. Solo falta que el Secretario de Estado valide tu firma.');
            g.say('La mesa presidencial. Una pluma estilográfica con tinta, por primera vez en la historia. Aquí se firma el Decreto, cuando lo tengas.');
          },
          use: {
            decreto10(g) {
              g.take('decreto10'); g.set('firmado');
              g.say('Mojas la pluma. Firmas. «Quedan suprimidos todos los trámites, salvo este». Un silencio solemne recorre los pasillos del Estado...');
              g.say('—Un momento —carraspea el Secretario de Estado—. Para que su firma sea válida, necesito verificar su identidad. Una formalidad. ¿Me permite su DNI?', 'Secretario de Estado');
            },
          } },
        { id: 'secretario', x: 12, y: 82, emoji: '🧑‍💼', s: 6, label: 'Secretario de Estado',
          look(g) {
            if (g.flag('firmado')) return g.say('—Su DNI, por favor. Selecciónelo y démelo. Es pura rutina: no ha fallado nunca.', 'Secretario de Estado');
            g.say('—Yo solo valido firmas. Cuando firme el Decreto, le pediré una cosita. Una cosita de nada.', 'Secretario de Estado');
          },
          use: {
            dni(g) {
              if (!g.flag('firmado')) return g.say('—Todavía no ha firmado nada. Guárdeselo, que se lo voy a pedir enseguida.', 'Secretario de Estado');
              g.say('El Secretario de Estado coge tu DNI. 07345189-R. Lo mira. Lo vuelve a mirar. Mira el calendario de la pared: jueves, 2 de octubre de 2036. Carraspea...', 'Secretario de Estado');
              g.win();
            },
            rdAprobado(g) { g.say('—Eso acredita su cargo, no su identidad. Para su identidad, el DNI. Como todo el mundo.', 'Secretario de Estado'); },
          } },
        { id: 'reloj', x: 94, y: 84, emoji: '⏳', s: 4, label: 'Reloj de arena',
          look(g) { g.say('Un reloj de arena con una placa: «Plazo para simplificar el Estado». La arena lleva cayendo desde 1978.'); } },
      ],
      hints: [
        'Introduce en la Caja el Real Decreto que traes para acreditarte. Luego, cuatro sellos, cuatro mecánicas: el laberinto del plano (Registro), los recibos (Hacienda), el telegrama del teletipo (Europa, que necesita la cifra del Registro) y los ujieres (Senado). El índice da el orden final.',
        'Laberinto: la ruta más corta deletrea «EL SIETE». Recibos: póliza 2 €, timbre 5 €, estampilla 3 €. Telegrama: retrocede 7. Ujieres: solo el ujier 3 dice la verdad.',
        'Laberinto: E(1,1) → L(2,1) → S(2,3) → I(1,3) → E(3,3) → T(3,5) → Presidencia (columna, fila). Telegrama: «estrellas de la bandera entre cuatro» = 12 / 4 = 3. Puerta buena: la 1.',
        'Sellos: Registro 7, Hacienda 5, Europa 3, Senado 1. Orden del índice (Europa, Hacienda, Senado, Registro): 3517. Abre la Caja, usa el decreto en la mesa presidencial y, por último, da tu DNI al Secretario de Estado.',
      ],
    },
  ];

  // =========================================================
  //  REGISTRO DE LA TEMPORADA
  // =========================================================
  window.registerSeason({
    id: 5,
    title: 'Las altas esferas',
    subtitle: 'Si no puedes con el sistema, únete a él. (Error.)',
    badge: 'Alto funcionario',
    emoji: '🏛️',
    intro: 'Una moción de censura fallida, elecciones anticipadas y, en el buzón de la C/ del Olvido 14, otra carta: te ha vuelto a tocar mesa. Harto/a de la política y de las ventanillas, decides cruzar al otro lado del mostrador: opositas, te haces funcionario/a y, entre 2031 y 2036, escalas hasta la cima del Estado con tu DNI de siempre en la cartera. Dentro, la burocracia es todavía peor. Temporada para expertos: lee la letra pequeña, desconfía de las erratas y ten a mano papel y lápiz (del nº 2).',
    items: ITEMS,
    levels: LEVELS,
    ending: {
      head: 'REINO DE LA BUROCRACIA<br><small>Presidencia del Gobierno · Boletín Oficial</small>',
      title: '¡Has llegado a lo más alto del Estado!',
      html: `<p>Firmas el <b>Decreto de Simplificación Total</b>. Quedan abolidas las colas, las ventanillas, los impresos por triplicado y las fotocopias compulsadas. Durante tres segundos, el país entero respira.</p>
        <p>Entonces el Secretario de Estado, que sostiene tu DNI para validar la firma, carraspea y te lo enseña:</p>
        <div class="s5-end-card"><div><small>DNI Nº</small><b>07345189-R</b></div><div><small>VÁLIDO HASTA</small><b class="s5-red">01 10 2036</b></div><div><small>HOY ES</small><b>02 10 2036</b></div></div>
        <p class="s5-end-q">—Vaya. Caducó ayer. No se preocupe: puede renovarlo sin problema. Solo necesita <b>cita previa</b>.</p>
        <p>En toda España no queda ni una desde 2019. La próxima disponible: <b>14 de marzo de 2039, en Ceuta</b>.</p>
        <p class="small">Fin de la Temporada 5 (y, de momento, del juego). Gracias por su paciencia, que no por su comprensión.</p>`,
      stamp: 'VUELVA USTED MAÑANA',
    },
    css: `
      .s5-q { border-bottom: 1px solid var(--line); padding: 6px 0 8px; }
      .s5-q p { margin: 0 0 6px; }
      .s5-qo { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; }
      .s5-qo span { font-size: 14px; }
      .s5-ans { padding: 6px 8px; }
      .s5-cal { display: inline-block; vertical-align: top; margin: 0 10px 10px 0; font-family: var(--ui); }
      .s5-cal-t { font-weight: 700; text-transform: capitalize; margin-bottom: 4px; }
      .s5-cal-g { display: grid; grid-template-columns: repeat(7, 28px); gap: 2px; text-align: center; font-size: 13px; }
      .s5-cal-g b { color: var(--ink-soft); font-size: 11px; }
      .s5-cal-g span { padding: 3px 0; border-radius: 4px; background: #fff; }
      .s5-cal-g span:empty { background: none; }
      .s5-cal-g span.we { background: #e6dfcf; color: #8a8076; }
      .s5-cal-g span.hol { background: #f6c9c9; color: #8c1016; font-weight: 700; }
      .s5-cal-n { font-size: 12px; margin-top: 4px; max-width: 220px; }
      .s5-scroll { overflow-x: auto; }
      .s5-bud { border-collapse: collapse; width: 100%; font-family: var(--ui); font-size: 14px; }
      .s5-bud th, .s5-bud td { border: 1px solid var(--line); padding: 5px 6px; text-align: right; }
      .s5-bud th:first-child, .s5-bud td:first-child { text-align: left; }
      .s5-bud .s5-tot td { font-weight: 700; background: #efe6cf; }
      .s5-stain { background: radial-gradient(circle at 40% 40%, #b48a5a55, #7a4e2a33 70%, transparent 72%); }
      .s5-stain input { width: 72px; text-align: right; font: inherit; padding: 3px 4px; border: 1px dashed #7a4e2a; border-radius: 4px; background: #fffaf0; }
      .s5-fac, .s5-t { border-collapse: collapse; width: 100%; font-family: var(--ui); font-size: 13px; }
      .s5-fac th, .s5-fac td, .s5-t th, .s5-t td { border-bottom: 1px solid var(--line); padding: 4px 5px; text-align: left; vertical-align: top; }
      .s5-fac select { font: inherit; max-width: 130px; }
      .s5-eu { font-family: var(--ui); font-size: 14px; }
      .s5-eu-h { background: #1f3f9a; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px; }
      .s5-law { font-family: var(--type); background: #fff; border: 2px solid var(--ink); border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
      .s5-enm { display: flex; flex-direction: column; gap: 6px; }
      .s5-enm-r { display: flex; justify-content: space-between; align-items: center; gap: 8px; background: #fff; border-radius: 8px; padding: 6px 8px; font-size: 13px; }
      .s5-enm-r.done { opacity: .75; }
      .s5-enm-b { display: flex; gap: 4px; flex-shrink: 0; }
      .s5-enm-b .btn { padding: 6px 10px; font-size: 13px; }
      .s5-st { font-weight: 700; flex-shrink: 0; }
      .s5-st-ok { color: var(--green); } .s5-st-no { color: var(--red); } .s5-st-dec { color: var(--ink-soft); }
      .s5-cands { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin: 10px 0; }
      .s5-mz-g { display: grid; grid-template-columns: repeat(5, 54px); gap: 4px; justify-content: center; margin: 10px auto; }
      .s5-mz { width: 54px; height: 54px; border: 2px solid var(--ink); border-radius: 8px; background: #fff; cursor: pointer; position: relative; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
      .s5-mz b { font-size: 20px; } .s5-mz i { font-style: normal; font-size: 16px; color: var(--red); }
      .s5-mz small { position: absolute; top: 2px; left: 4px; font-size: 10px; color: var(--ink-soft); }
      .s5-mz.vis { background: #fff3c4; } .s5-mz.cur { box-shadow: 0 0 0 3px var(--green); } .s5-mz.goal { background: #e3f4e8; }
      .s5-mz-w { text-align: center; font-family: var(--type); font-size: 18px; letter-spacing: .1em; }
      .s5-end-q { font-style: italic; }
      .s5-end-card { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; background: #dfe8f1; border-radius: 10px; padding: 10px; margin: 10px 0; font-family: var(--ui); }
      .s5-end-card div { display: flex; flex-direction: column; }
      .s5-end-card small { font-size: 10px; color: var(--ink-soft); }
      .s5-red { color: var(--red); }
    `,
  });
})();
