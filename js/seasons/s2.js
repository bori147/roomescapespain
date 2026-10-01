/* ==========================================================
   VUELVA USTED MAÑANA — Temporada 2: «Hazte autónomo»
   Sátira. Todos los personajes, empresas y cargos son ficticios.
   Las reglas fiscales y laborales están simplificadas para el juego.
   ========================================================== */
(function () {
  'use strict';
  const { rand, norm } = window.GameUtils;

  // ---------- utilidades ----------
  /** Importe escrito por el jugador → céntimos (admite 1.680 / 23,10 / 23.10 / 20). */
  const cents = (s) => {
    const t = String(s).replace(/[\s€]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
    if (!/^-?\d+(\.\d{1,2})?$/.test(t)) return NaN;
    return Math.round(Number(t) * 100);
  };
  const alnum = (s) => norm(s).replace(/[^A-Z0-9]/g, '');
  const same = (set, arr) => set.size === arr.length && arr.every((x) => set.has(x));
  /** Conecta botones .opt[data-k] como interruptores guardados en un flag (array). */
  function toggles(el, flagKey, g) {
    const on = new Set(g.flag(flagKey) || []);
    el.querySelectorAll('.opt[data-k]').forEach((b) => {
      const k = b.dataset.k;
      b.classList.toggle('on', on.has(k));
      b.onclick = () => {
        if (on.has(k)) on.delete(k); else on.add(k);
        b.classList.toggle('on', on.has(k));
        g.set(flagKey, [...on]);
        g.sfx('click');
      };
    });
    return on;
  }
  const msgIn = (el, id) => (t, bad) => { const m = el.querySelector('#' + id); m.innerHTML = t; m.className = 'msg ' + (bad ? 'bad' : 'good'); };

  // =========================================================
  //  OBJETOS
  // =========================================================
  const ITEMS = {
    // Nivel 1
    plan: { emoji: '📊', name: 'Plan de empresa', desc: '<b>Plan de empresa — Churrería</b> (previsión de facturación)<br>· Churros y porras para llevar, en cucurucho: <b>25 %</b><br>· Chocolate con churros servido en mesa: <b>35 %</b><br>· Chocolate para llevar, en vaso: <b>15 %</b><br>· Cafés en barra: <b>20 %</b><br>· Patatas fritas de bolsa, para llevar: <b>5 %</b><br><i>Beneficio previsto: «mucho». Firmado: tu cuñado.</i>' },
    contrato: { emoji: '🏠', name: 'Contrato de alquiler', desc: '<b>Contrato de alquiler de local comercial</b><br>Dirección: <b>Calle del Trámite, 12, bajo</b><br>Renta: <b>900 €/mes</b>. Fianza: dos meses. Aval: tu alma.<br><i>Cláusula 14: «El arrendatario renuncia a quejarse del olor a fritanga del vecino, que es usted».</i>' },
    modelo036: { emoji: '📄', name: 'Modelo 036 (en blanco)', desc: 'Modelo 036, «Declaración censal de alta, modificación y baja». 23 páginas. Hay que rellenarlo en algún sitio con un bolígrafo que funcione.' },
    modelo037: { emoji: '📃', name: 'Modelo 037', desc: 'Modelo 037, «Declaración censal SIMPLIFICADA». Solo 4 páginas. Demasiado bonito para ser verdad.' },
    modelo036Relleno: { emoji: '📝', name: 'Modelo 036 relleno', desc: 'Tu modelo 036, relleno y firmado. Casilla, epígrafe y domicilio. Lo miras con el orgullo de quien ha entendido un impreso oficial.' },
    // Nivel 2
    prevision: { emoji: '📈', name: 'Previsión de ingresos', desc: '<b>Previsión de ingresos de la churrería</b><br>Ventas mensuales previstas: <b>2.900 €</b><br><i>(Calculado a ojo. Con optimismo. Mucho optimismo.)</i>' },
    cocheLetra: { emoji: '🚗', name: 'Letra del coche', desc: '<b>Préstamo del coche</b>: <b>300 €/mes</b>.<br>Es el coche de los domingos: lo usas para ir a la playa y al pueblo en agosto. En la churrería no ha entrado nunca (no cabe).' },
    presupuestoHarina: { emoji: '🌾', name: 'Presupuesto del proveedor', desc: '<b>Harinas y Aceites El Molinillo</b><br>Suministro mensual para la churrería (harina, aceite y azúcar): <b>650 €/mes</b>.' },
    luzEstimada: { emoji: '💡', name: 'Estimación de la luz', desc: '<b>Eléctrica del Plazo, S.A.</b><br>Estimación mensual de consumo del local (freidora industrial incluida): <b>300 €/mes</b>.<br><i>«Precio cerrado» (hasta que lo abramos).</i>' },
    vidaLaboral: { emoji: '📜', name: 'Informe de vida laboral', desc: '<b>INFORME DE VIDA LABORAL</b><br>· 2015–2024: Régimen General (varias empresas, todas cerradas).<br>· <b>RETA (autónomos): alta 01/04/2025 — baja 30/06/2025</b>. Actividad: venta ambulante de pulseras en la playa.<br>· Nueva alta solicitada: <b>noviembre de 2026</b>.' },
    // Nivel 3
    solicitudDen: { emoji: '📄', name: 'Solicitud de denominación', desc: 'Solicitud de certificación negativa de denominación social, en blanco. Se rellena en el pupitre.' },
    solicitudRellena: { emoji: '📝', name: 'Solicitud rellena', desc: (g) => `Solicitud de certificación negativa. Denominación solicitada: <b>«${L3_P1[g.flag('p1') || 0].toUpperCase()} ${L3_P2[g.flag('p2') || 0].toUpperCase()}, S.L.»</b>. Entrégala a la registradora y cruza los dedos.` },
    certDen: { emoji: '📜', name: 'Certificado de denominación', desc: '<b>CERTIFICACIÓN NEGATIVA DE DENOMINACIÓN</b><br>«<b>PORRAS DEL TRÁMITE, S.L.</b>»<br>No figura inscrita ni reservada ninguna denominación idéntica. Validez: tres meses para otorgar la escritura.' },
    // Nivel 4
    certBanco: { emoji: '🏦', name: 'Certificado bancario', desc: '<b>Caja de Ahorros del Plazo Fijo</b><br>Certificamos los siguientes ingresos en la cuenta de la sociedad en constitución «PORRAS DEL TRÁMITE, S.L.»:<br>· Tú: <b>1.650 €</b><br>· Doña Remedios (tu tía): <b>900 €</b><br>· Don Francisco «Paco» (tu cuñado): <b>450 €</b><br>Total desembolsado: <b>3.000 €</b>. Comisión por certificar: 30 €. Por mirar, 10 € más.' },
    // Nivel 5
    plano: { emoji: '🗺️', name: 'Plano del local', desc: '<b>Plano del local</b> — Calle del Trámite, 12<br>Rectángulo de <b>9 m × 6 m</b>.<br>Obrador y barra: <b>3 m × 3 m</b>. Aseo adaptado: <b>3 m × 1,5 m</b>. Todo lo demás: zona de público.<br>Cuadrícula de módulos de 1,5 × 1,5 m (6 columnas × 4 filas). La puerta da a la calle por la 4.ª columna.<br><i>Honorarios de la arquitecta: mejor no mirar.</i>' },
    planoFirmado: { emoji: '📐', name: 'Plano conforme', desc: 'Plano del local con la distribución conforme a la ordenanza: freidora, extintor, pasillo de evacuación y mesas. Firmado y sellado por ti, que no eres arquitecto, pero firmas como si lo fueras.' },
    justificanteTasa: { emoji: '🧾', name: 'Justificante de la tasa', desc: 'Justificante de pago de la tasa por licencia de actividad: 133 €. Incluye la tasa por tramitar la tasa. Pagado.' },
    // Nivel 6
    tarjetaRamona: { emoji: '💳', name: 'Tarjeta de doña Ramona', desc: '<b>RAMONA EVENTOS Y BAUTIZOS, S.L.</b><br>NIF: <b>B12345674</b><br><i>«Organizamos su bautizo, su boda y su divorcio. Precios de grupo.»</i>' },
    facturaRamona: { emoji: '🧾', name: 'Factura A-2027-0002', desc: 'Factura completa nº A-2027-0002 para Ramona Eventos y Bautizos, S.L. Base 20,00 € · IVA 3,10 € · Total 23,10 € · Huella 1257. Registrada en Verifactu para siempre jamás.' },
    // Nivel 7
    libroRecibidas: { emoji: '📗', name: 'Libro de facturas recibidas', desc: '<b>Libro registro de facturas recibidas — 1T 2027</b> (solo las deducibles)<br>· Harinas El Molinillo: IVA <b>32,00 €</b><br>· Aceites del Sur: IVA <b>50,00 €</b><br>· Hostelequip (freidora): IVA <b>210,00 €</b><br>· Eléctrica del Plazo (luz de marzo): IVA <b>63,00 €</b><br><i>El total lo sumas tú, que para eso eres autónomo.</i>' },
    nrc: { emoji: '🔢', name: 'NRC del banco', desc: 'Número de Referencia Completo (NRC) del pago de 128 € a la Agencia Tributaria. 22 caracteres que demuestran que has pagado. Guárdalo mejor que el DNI.' },
    // Nivel 8
    requerimientoITSS: { emoji: '📋', name: 'Requerimiento de la Inspección', desc: '<b>INSPECCIÓN DE TRABAJO — Requerimiento</b><br>Semana del lunes 10 al viernes 14 de mayo de 2027. Trabajadora: Lucía.<br>Criterios:<br>1. Si hay <b>fichaje válido</b>, manda el fichaje.<br>2. Si la fichadora falló: la <b>entrada</b> se acredita con la <b>cámara de la puerta</b> (primera vez que entra la trabajadora) y la <b>salida</b>, con el <b>último tique cobrado por ella</b> más el tiempo de limpieza que fije el <b>convenio</b>.<br>3. El registro en papel rellenado por la empresa no es prueba.<br>4. Indique el total de <b>horas extraordinarias</b> de la semana <b>en minutos</b> (jornada pactada: ver contrato).' },
    contratoLucia: { emoji: '📄', name: 'Contrato de Lucía', desc: '<b>Contrato de trabajo</b> — Lucía, oficial de primera de churrería (masa y fritura).<br>Jornada: <b>30 horas semanales</b>, de lunes a viernes, de 6:00 a 12:00.<br>Salario: el del convenio. Chocolate: el que sobre.' },
    registroPapel: { emoji: '🗒️', name: 'Registro horario en papel', desc: '<b>Registro horario</b> (rellenado por la empresa, o sea, tú)<br>Lunes a viernes: 6:00 – 12:00. Todo perfecto. Demasiado perfecto.<br>Firmado por Lucía: <i>«firmé sin leer, que tenía la masa al fuego»</i>.' },
    // Nivel 9
    facturaAgente: { emoji: '🧾', name: 'Factura del agente digitalizador', desc: '<b>DIGITALIZA-TE, S.L.</b> (agente digitalizador adherido)<br>Concepto: «Sitio web y presencia en internet — porrasdeltramite.es».<br>Base imponible: <b>2.000,00 €</b> · IVA (21 %): <b>420,00 €</b> · Total: <b>2.420,00 €</b><br>Forma de pago: según las bases del Kit Digital.' },
    efectivo: { emoji: '💶', name: 'Recaudación del día', desc: 'La recaudación de hoy: <b>150 €</b> en billetes que huelen a churro. Para que cuenten en el banco, habrá que ingresarlos.' },
    captura: { emoji: '🖼️', name: 'Captura de la web', desc: 'Captura de pantalla de porrasdeltramite.es con los logotipos obligatorios en el pie. La web tiene más logos que churros.' },
    justificantePago: { emoji: '🏦', name: 'Justificante de transferencia', desc: 'Justificante bancario: transferencia de 420,00 € a DIGITALIZA-TE, S.L. Concepto: «IVA Kit Digital. Por favor, que llegue».' },
    // Nivel 10
    requerimientoAEAT: { emoji: '📋', name: 'Requerimiento de Hacienda', desc: '<b>REQUERIMIENTO — Ejercicio 2027</b><br>① IVA efectivamente <b>ingresado</b> en el año.<br>② Gastos deducibles. Solo se admiten gastos afectos <b>exclusivamente</b> a la actividad y justificados con factura. <b>Nunca</b>: multas y sanciones, gastos personales o familiares (aunque asistan los socios), ni servicios que no se prestaron.<br>③ Amortización de la chocolatera en 2027.<br>④ Firma del acta.' },
    carpeta303: { emoji: '🗂️', name: 'Carpeta de los 303', desc: '<b>Modelos 303 de 2027</b> (resultado de cada trimestre, antes de compensar nada):<br>· 1T: <b>+128 €</b><br>· 2T: <b>+205 €</b><br>· 3T: <b>−90 €</b><br>· 4T: <b>+60 €</b>' },
    facturaChoco: { emoji: '🧾', name: 'Factura de la chocolatera', desc: '<b>Hostelequip</b> — Factura de 12/06/2027<br>Chocolatera industrial «ChocoMatic 3000».<br>Base imponible: <b>2.400 €</b> · IVA: 504 €.' },
    albaran: { emoji: '🔧', name: 'Albarán de instalación', desc: '<b>Albarán de instalación</b> de la ChocoMatic 3000.<br>Puesta en funcionamiento: <b>1 de octubre de 2027</b>.<br><i>Observaciones del técnico: «Vine la semana que viene tres veces seguidas».</i>' },
    certificadoAEAT: { emoji: '✅', name: 'Certificado de estar al corriente', desc: '<b>CERTIFICADO</b>: «PORRAS DEL TRÁMITE, S.L.» se encuentra al corriente de sus obligaciones tributarias. Válido 12 meses o hasta la próxima ocurrencia normativa, lo que llegue antes.' },
  };

  // =========================================================
  //  NIVEL 1 — Modelo 036
  // =========================================================
  const L1_CAUSAS = [['111', '111 · Alta en el Censo de Empresarios'], ['120', '120 · Modificación de datos'], ['150', '150 · Baja (no tenga prisa)'], ['999', '999 · Otros motivos (ni idea)']];
  const L1_EPIS = [['033.3', '033.3 · Belenes vivientes'], ['644.1', '644.1 · Pan y bollería (sin freír)'], ['644.6', '644.6 · Masas fritas y chocolate PARA LLEVAR'], ['673.2', '673.2 · Otros cafés y bares'], ['676', '676 · Chocolaterías (consumo en local)'], ['857.1', '857.1 · Profesionales de la espera en colas'], ['999', '999 · Otros servicios n.c.o.p.']];
  const L1_DOMS = [['casa', 'Calle de la Esperanza, 3, 2.º B (tu casa)'], ['local', 'Calle del Trámite, 12, bajo'], ['cunado', 'Avenida del Cuñado, 7 (casa de tu cuñado)'], ['apartado', 'Apartado de Correos 404']];
  const opts = (arr) => '<option value="">— Elija —</option>' + arr.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
  function l1Form(g) {
    g.modal({
      title: '📝 Modelo 036 — Declaración censal',
      html: `<div class="s2-form"><p class="small">Rellena las casillas importantes. Las otras 340 son opcionales (o eso dice el funcionario).</p>
        <label class="field">Causa de presentación <select id="s2-causa">${opts(L1_CAUSAS)}</select></label>
        <label class="field">Epígrafe del IAE (actividad principal) <select id="s2-epi">${opts(L1_EPIS)}</select></label>
        <label class="field">Domicilio donde se ejerce la actividad <select id="s2-dom">${opts(L1_DOMS)}</select></label>
        <div class="msg" id="s2-m1"></div></div>`,
      buttons: [{ label: 'Cancelar' }, {
        label: '✍️ Firmar el 036', cls: 'primary', onClick(close, el) {
          const v = ['#s2-causa', '#s2-epi', '#s2-dom'].map((s) => el.querySelector(s).value);
          if (v[0] === '111' && v[1] === '644.6' && v[2] === 'local') {
            g.take('modelo036'); g.give('modelo036Relleno'); g.sfx('stamp');
            g.say('Firmas el 036 con letra de notario. El bolígrafo encadenado se queda sin tinta justo al terminar: es una señal.', 'Mesa de impresos');
            return true;
          }
          g.sfx('bad');
          msgIn(el, 's2-m1')(rand([
            'Relees el impreso y algo no encaja con la guía, las normas o tus papeles. El funcionario no te dirá qué: eso sería asesoramiento.',
            'Hay algún error. Lo sabes porque el funcionario te mira desde lejos y niega con la cabeza.',
          ]), true);
          return false;
        },
      }],
    });
  }

  // =========================================================
  //  NIVEL 2 — Cuota de autónomos
  // =========================================================
  function l2Cuota(g) {
    g.input({
      title: '💶 Alta en el RETA — Cuota mensual',
      text: '—Dígame qué cuota mensual le corresponde, en euros. Sin decimales, que los decimales los ponemos nosotros.',
      numeric: true, maxLen: 3,
      check: (v) => v === '230',
      failText: (v) => ({
        80: '—¿Tarifa plana? Mire bien su vida laboral y el cartel: el requisito de los dos años no se cumple.',
        275: '—Casi. ¿Ha aplicado la deducción por gastos genéricos del cartel?',
        200: '—Ha restado algún gasto que no es del negocio. ¿Ese coche fríe churros?',
      })[+v] || '—Esa no es su cuota. Revise ingresos, gastos del negocio y tramos.',
      ok: () => {
        g.take('vidaLaboral');
        g.say('—230 € al mes. Correcto. Bienvenido/a al Régimen Especial de Trabajadores Autónomos. Pagará aunque no facture, aunque esté enfermo y aunque llueva. Firme aquí.', 'Funcionaria');
        g.win();
      },
    });
  }

  // =========================================================
  //  NIVEL 3 — Denominación social
  // =========================================================
  const L3_P1 = ['Churros', 'Porras', 'Buñuelos', 'Chocolates'];
  const L3_P2 = ['La Ventanilla', 'Del Trámite', 'El Sello', 'Real', 'De Hacienda'];
  const L3_REG = [
    ['BUÑUELOS EL SELLO, S.L.', 'Reservada el 02/09/2026'],
    ['BUÑUELOS VENTANILLA, S.COOP.', 'Inscrita (2017)'],
    ['CHOCOLATE Y VENTANILLA, S.L.', 'Inscrita (2022)'],
    ['CHOCOLATERÍA REAL, S.A.', 'Inscrita (1931)'],
    ['CHOCOLATES EL SEYO, S.L.', 'Inscrita (2019)'],
    ['CHURRERÍA LA TRAMITACIÓN, S.L.', 'Reservada el 30/10/2026'],
    ['CHURRO DEL TRAMITE, S.L.', 'Inscrita (2014)'],
    ['CHURROS SELLO, S.L.L.', 'Inscrita (2011)'],
    ['EL SELLO DE ORO JOYEROS, S.A.', 'Inscrita (1987)'],
    ['LAS PORRAS DEL SELLO, S.L.', 'Inscrita (2020)'],
    ['PORRA DE LA BENTANILLA, S.L.', 'Inscrita (1998)'],
    ['PORRAS DEL TRÁMITE, S.L.', 'Reservada el 12/04/2026'],
    ['PORRAS DEL TRANVÍA, S.L.', 'Inscrita (2001)'],
    ['TRÁMITE DE CHOCOLATES, S.A.', 'Inscrita (2015)'],
    ['VENTANILLA CHURROS, S.A.', 'Inscrita (2009)'],
    ['VUÑUELOS DEL TRÁMITE, S.L.', 'Inscrita (2003)'],
  ];
  function l3Form(g) {
    const sel = (id, arr) => `<select id="${id}">${arr.map((t, i) => `<option value="${i}">${t}</option>`).join('')}</select>`;
    g.modal({
      title: '✍️ Solicitud de certificación negativa',
      html: `<div class="s2-form"><p class="small">Compón la denominación de tu sociedad. La forma social ya viene impresa: Sociedad Limitada.</p>
        <label class="field">Primera palabra ${sel('s2-p1', L3_P1)}</label>
        <label class="field">Segunda parte ${sel('s2-p2', L3_P2)}</label>
        <p class="lcd" id="s2-prev"></p></div>`,
      onMount(el) {
        const upd = () => { el.querySelector('#s2-prev').textContent = `${L3_P1[+el.querySelector('#s2-p1').value]} ${L3_P2[+el.querySelector('#s2-p2').value]}, S.L.`.toUpperCase(); };
        el.querySelectorAll('select').forEach((s) => { s.onchange = upd; s.oninput = upd; });
        upd();
      },
      buttons: [{ label: 'Cancelar' }, {
        label: '📝 Rellenar solicitud', cls: 'primary', onClick(close, el) {
          g.set('p1', +el.querySelector('#s2-p1').value); g.set('p2', +el.querySelector('#s2-p2').value);
          g.take('solicitudDen'); g.give('solicitudRellena');
          g.say('Escribes el nombre con mayúsculas de molde, como si eso fuera a ayudar.', 'Pupitre');
          return true;
        },
      }],
    });
  }

  // =========================================================
  //  NIVEL 4 — Notaría
  // =========================================================
  const L4_CLAUSES = [
    ['1', '<b>COMPARECEN:</b> tú, doña Remedios (tu tía) y don Francisco «Paco» (tu cuñado), mayores de edad y con capacidad legal suficiente (según ellos).'],
    ['2', '<b>DENOMINACIÓN:</b> la sociedad se denominará «PORRAS DEL TRÁMITE, S.A.».'],
    ['3', '<b>OBJETO SOCIAL:</b> elaboración y venta de churros, porras, buñuelos y chocolate, con o sin consumo en el local.'],
    ['4', '<b>DOMICILIO SOCIAL:</b> Calle del Trámite, 21, bajo.'],
    ['5', '<b>CAPITAL SOCIAL:</b> 3.000 euros, dividido en 300 participaciones de 1 euro de valor nominal cada una, íntegramente desembolsadas.'],
    ['6', '<b>SUSCRIPCIÓN:</b> tú suscribes 165 participaciones (1.650 €); doña Remedios, 90 (900 €); don Francisco, 45 (450 €).'],
    ['7', '<b>ADMINISTRACIÓN:</b> administrador único: tú. Cargo gratuito, como casi todo lo que haces.'],
    ['8', '<b>EJERCICIO SOCIAL:</b> del 1 de enero al 31 de diciembre de cada año.'],
    ['9', '<b>DURACIÓN:</b> indefinida. Como los trámites.'],
  ];
  function l4Borrador(g) {
    g.modal({
      title: '📜 Borrador de la escritura de constitución',
      cls: 'wide',
      html: `<p class="small">La oficial te da el borrador. «Revíselo y marque las cláusulas que estén mal. Si firma con erratas, las erratas son suyas para siempre.»</p>
        <div class="s2-clauses">${L4_CLAUSES.map(([k, t]) => `<button class="opt s2-clause" data-k="${k}">${t}</button>`).join('')}</div>
        <div class="msg" id="s2-m4"></div>`,
      onMount(el) { toggles(el, 'marks', g); },
      buttons: [{ label: 'Cancelar' }, {
        label: '↩️ Devolver con correcciones', cls: 'primary', onClick(close, el) {
          const on = new Set(g.flag('marks') || []);
          if (!same(on, ['2', '4', '5'])) {
            g.sfx('bad');
            msgIn(el, 's2-m4')('La oficial repasa tus marcas: «Aquí sobra o falta alguna. Compárelo con sus documentos, cláusula por cláusula».', true);
            return false;
          }
          g.input({
            title: '🧮 Capital social',
            text: '—Muy bien visto. Para corregir la cláusula del capital: ¿cuál es el valor nominal correcto de cada participación, en euros?',
            numeric: true, maxLen: 4,
            check: (v) => v === '10',
            failText: () => '—Haga la cuenta con el capital total y el número de participaciones. Y compruébelo con lo que puso cada socio.',
            ok: () => {
              g.set('borradorOK');
              g.say('—Corregido: S.L., número 12 y participaciones de 10 €. Ahora sí. Pasen a la mesa de firmas cuando quieran. En el orden correcto, claro.', 'Oficial de la notaría');
            },
          });
          return false;
        },
      }],
    });
  }
  const L4_SIGNERS = { tia: '👵 Tía Remedios', tu: '🙂 Tú', cunado: '🙋‍♂️ Cuñado Paco', notario: '🧑‍⚖️ Notario' };
  function l4Firmas(g) {
    let seq = [];
    g.modal({
      title: '✒️ Mesa de firmas',
      html: `<p class="small">Pasa la pluma a cada firmante en el orden en que debe firmar. Si alguien se niega, la pluma vuelve al tintero y se empieza de nuevo.</p>
        <div class="row-btns">${Object.entries(L4_SIGNERS).map(([k, t]) => `<button class="btn" data-s="${k}">${t}</button>`).join('')}</div>
        <p class="s2-seq" id="s2-seq"></p><div class="msg" id="s2-m4b"></div>`,
      onMount(el) {
        const out = el.querySelector('#s2-seq');
        const msg = msgIn(el, 's2-m4b');
        const upd = () => { out.innerHTML = 'Han firmado: ' + (seq.length ? seq.map((k) => L4_SIGNERS[k]).join(' → ') : '<i>nadie</i>'); };
        el.querySelectorAll('[data-s]').forEach((b) => {
          b.onclick = () => {
            const k = b.dataset.s;
            if (seq.includes(k)) { msg('—Yo ya he firmado. Dos veces sería falsedad documental.', true); return; }
            seq.push(k); g.sfx('click'); upd();
            if (seq.length < 4) return;
            if (seq.join() === 'tia,tu,cunado,notario') {
              g.closeModal();
              g.sfx('stamp');
              g.say('El notario estampa su firma: «Ante mí». Acaba de nacer PORRAS DEL TRÁMITE, S.L., con 3.000 € de capital y tres socios que en Nochebuena no se hablan.', 'Notario');
              g.win();
              return;
            }
            seq = []; g.sfx('bad'); upd();
            msg(rand([
              'Alguien se levanta indignado y se niega a firmar. Hay que empezar otra vez. El notario mira el reloj (y la minuta sube).',
              '«¡Así no firmo!» La pluma vuelve al tintero. Escucha bien a cada uno.',
              'El orden no convence a todos. Se rompe el ambiente y casi la familia. Vuelta a empezar.',
            ]), true);
          };
        });
        upd();
      },
    });
  }

  // =========================================================
  //  NIVEL 5 — Plano del local
  // =========================================================
  const L5_FIXED = { 0: 'obr', 1: 'obr', 6: 'obr', 7: 'obr', 4: 'aseo', 5: 'aseo' };
  const L5_CYCLE = ['', 'mesa', 'freidora', 'extintor'];
  const L5_EMO = { '': '', mesa: '🪑', freidora: '🍳', extintor: '🧯', obr: '🧑‍🍳', aseo: '🚻' };
  const L5_DOOR = 3;
  const nb = (i) => { const r = Math.floor(i / 6); const c = i % 6; const o = []; if (r > 0) o.push(i - 6); if (r < 3) o.push(i + 6); if (c > 0) o.push(i - 1); if (c < 5) o.push(i + 1); return o; };
  function l5Check(t) {
    const idx = (k) => t.map((v, i) => (v === k ? i : -1)).filter((i) => i >= 0);
    const fr = idx('freidora'); const ex = idx('extintor'); const me = idx('mesa');
    if (fr.length !== 1 || fr[0] >= 6 || !nb(fr[0]).some((j) => L5_FIXED[j] === 'obr')) return 'Art. 3: la freidora (una sola) va pegada a la pared del fondo y contigua al obrador.';
    if (ex.length !== 1 || !nb(ex[0]).includes(fr[0])) return 'Art. 4: el extintor (uno solo) tiene que estar contiguo a la freidora.';
    for (let r = 0; r < 4; r++) if (t[r * 6 + L5_DOOR]) return 'Art. 5: la columna de la puerta debe quedar libre de punta a punta. Por ahí se huye.';
    for (const m of me) if (nb(m).some((j) => ['mesa', 'freidora', 'extintor'].includes(t[j]))) return 'Art. 6: hay alguna mesa contigua a otra mesa, a la freidora o al extintor.';
    if (me.length !== 5) return `Art. 2: el número de mesas (${me.length}) no corresponde al aforo del local.`;
    return null;
  }
  function l5Grid(g) {
    g.modal({
      title: '📐 Distribución del local',
      cls: 'wide',
      html: `<p class="small">Toca una casilla para cambiar lo que hay: vacío → 🪑 mesa → 🍳 freidora → 🧯 extintor → vacío. El obrador (🧑‍🍳) y el aseo (🚻) no se tocan.</p>
        <div class="s2-grid" id="s2-grid"></div><div class="msg" id="s2-m5"></div>`,
      onMount(el) {
        const t = g.flag('grid') || Array(24).fill('');
        const box = el.querySelector('#s2-grid');
        const render = () => {
          let h = '<div></div><div class="s2-wall">Pared del fondo</div>';
          for (let r = 0; r < 4; r++) {
            h += `<div class="s2-lbl">${r + 1}</div>`;
            for (let c = 0; c < 6; c++) {
              const i = r * 6 + c;
              const f = L5_FIXED[i];
              h += f ? `<div class="tile fixed" title="${f === 'obr' ? 'Obrador y barra' : 'Aseo'}">${L5_EMO[f]}</div>`
                : `<button class="tile ${t[i] ? 'on' : ''}" data-i="${i}" title="Fila ${r + 1}, columna ${c + 1}">${L5_EMO[t[i]]}</button>`;
            }
          }
          h += '<div></div>' + [0, 1, 2, 3, 4, 5].map((c) => `<div class="s2-lbl">${c === L5_DOOR ? '🚪' : c + 1}</div>`).join('');
          box.innerHTML = h;
          box.querySelectorAll('button.tile').forEach((b) => {
            b.onclick = () => {
              const i = +b.dataset.i;
              t[i] = L5_CYCLE[(L5_CYCLE.indexOf(t[i]) + 1) % L5_CYCLE.length];
              g.set('grid', t); g.sfx('click'); render();
            };
          });
        };
        render();
      },
      buttons: [{ label: 'Cancelar' }, {
        label: '✍️ Firmar el plano', cls: 'primary', onClick(close, el) {
          const err = l5Check(g.flag('grid') || Array(24).fill(''));
          if (err) { g.sfx('bad'); msgIn(el, 's2-m5')('❌ ' + err, true); return false; }
          g.take('plano'); g.give('planoFirmado'); g.sfx('stamp');
          g.say('El plano cumple la ordenanza artículo por artículo. Lo firmas con la solemnidad de quien acaba de diseñar una catedral con freidora.', 'Mesa de dibujo');
          return true;
        },
      }],
    });
  }
  function l5Tecnico(g) {
    if (!g.flag('plOK') || !g.flag('tasaOK')) {
      const falta = [!g.flag('plOK') && 'el plano firmado y conforme a la ordenanza', !g.flag('tasaOK') && 'el justificante de la tasa'].filter(Boolean);
      return g.say(`—Para la licencia necesito ${falta.join(' y ')}. Y luego, que me diga el aforo. Sin prisa: el plazo de resolución es de tres meses. Y el silencio, negativo.`, 'Técnico municipal');
    }
    g.input({
      title: '👥 Aforo máximo del local',
      text: '—Último dato para la licencia: el aforo máximo (número de personas).',
      numeric: true, maxLen: 3,
      check: (v) => v === '20',
      failText: (v) => (+v === 27 ? '—El aforo se calcula sobre la zona de PÚBLICO, no sobre todo el local.' : '—Ese aforo no sale de la ordenanza. Haga la cuenta con el plano.'),
      ok: () => {
        g.say('—Aforo 20, cinco mesas, extintor en su sitio. Le concedo... la licencia PROVISIONAL. La definitiva le llegará por correo. Algún día. Puede usted abrir.', 'Técnico municipal');
        g.win();
      },
    });
  }
  function l5Entrega(g, it) {
    g.take(it);
    g.set(it === 'planoFirmado' ? 'plOK' : 'tasaOK');
    g.say(it === 'planoFirmado' ? '—Plano conforme. Lo grapo al expediente. Con cinco grapas: una por mesa.' : '—Tasa pagada. Ya puede usted empezar a esperar.', 'Técnico municipal');
    if (g.flag('plOK') && g.flag('tasaOK')) l5Tecnico(g);
  }

  // =========================================================
  //  NIVEL 6 — Verifactu
  // =========================================================
  function l6Tpv(g) {
    const f = (id, lab, ph) => `<label class="field">${lab}<input type="text" id="${id}" autocomplete="off" placeholder="${ph}"></label>`;
    g.modal({
      title: '🖥️ TPV — Nueva factura completa',
      cls: 'wide',
      html: `<div class="s2-form s2-cols">
        ${f('s2-num', 'Número de factura', 'X-0000-0000')}${f('s2-nif', 'NIF del destinatario', 'B00000000')}
        ${f('s2-base', 'Base imponible total (€)', '0,00')}${f('s2-iva', 'Cuota de IVA total (€)', '0,00')}
        ${f('s2-total', 'Total factura (€)', '0,00')}${f('s2-huella', 'Huella Verifactu (4 cifras)', '0000')}
        </div><p class="tiny">Este software está certificado. Lo que emita, queda registrado. Para siempre. Piénselo dos veces.</p><div class="msg" id="s2-m6"></div>`,
      buttons: [{ label: 'Cancelar' }, {
        label: '🧾 Emitir factura', cls: 'primary', onClick(close, el) {
          const v = (id) => el.querySelector('#' + id).value;
          const msg = msgIn(el, 's2-m6');
          const num = alnum(v('s2-num'));
          let err = null;
          if (num !== 'A20270002') {
            if (num === 'A20270001') err = 'Esa numeración ya existe en Verifactu. Y Verifactu no olvida.';
            else if (num.startsWith('T')) err = 'La serie T es para tiques. Doña Ramona quiere factura completa.';
            else err = 'Número de factura incorrecto: revise la serie, el año y la numeración correlativa.';
          } else if (alnum(v('s2-nif')) !== 'B12345674') err = 'NIF del destinatario incorrecto o vacío. Una factura completa lo necesita.';
          else if (cents(v('s2-base')) !== 2000 || cents(v('s2-iva')) !== 310 || cents(v('s2-total')) !== 2310) err = 'Los importes no cuadran con la pizarra, los tipos de IVA y lo que ha pedido la clienta.';
          else if (v('s2-huella').trim() !== '1257') err = v('s2-huella').trim() === '5620' ? 'Esa huella encadena con la serie T. Cada serie, su cadena.' : 'Huella incorrecta. Verifactu detecta que la cadena se ha roto y avisa a alguien. No sabemos a quién.';
          if (err) { g.sfx('bad'); msg('❌ ' + err, true); return false; }
          g.give('facturaRamona'); g.sfx('ok');
          g.say('El TPV pita, imprime y envía la factura a Hacienda antes de que se seque la tinta. Factura A-2027-0002, huella 1257. Tu primera factura legal. Hacienda ya la ha visto. Tu madre, todavía no.', 'TPV');
          return true;
        },
      }],
    });
  }

  // =========================================================
  //  NIVEL 7 — Modelo 303
  // =========================================================
  const L7_FACTS = [
    ['harina', 'Harinas El Molinillo · factura completa a tu NIF · 15/02/2027 · harina · base 800 € · IVA 4 %: <b>32,00 €</b>'],
    ['aceite', 'Aceites del Sur · factura completa a tu NIF · 03/03/2027 · aceite de girasol · base 500 € · IVA 10 %: <b>50,00 €</b>'],
    ['freidora', 'Hostelequip · factura completa a tu NIF · 20/01/2027 · freidora industrial · base 1.000 € · IVA 21 %: <b>210,00 €</b>'],
    ['gasolina', 'Gasolinera La Rotonda · tique sin NIF · 08/02/2027 · gasolina · IVA 21 %: <b>8,40 €</b>'],
    ['reyes', 'Restaurante El Cuñado Feliz · factura completa · 06/01/2027 · comida familiar de Reyes · IVA 10 %: <b>12,00 €</b>'],
    ['luzMar', 'Eléctrica del Plazo · factura completa a tu NIF · 31/03/2027 · luz del local · base 300 € · IVA 21 %: <b>63,00 €</b>'],
    ['luzDic', 'Eléctrica del Plazo · factura completa a tu NIF · 28/12/2026 · luz del local · base 280 € · IVA 21 %: <b>58,80 €</b>'],
    ['movil', 'Tienda MóvilMax · factura completa a tu NIF · 14/02/2027 · móvil para tu hija · IVA 21 %: <b>105,00 €</b>'],
  ];
  function l7Caja(g) {
    g.modal({
      title: '📦 Caja de zapatos de facturas',
      cls: 'wide',
      html: `<p class="small">Marca las facturas cuyo IVA puedes deducir este trimestre y pásalas al libro registro. Las demás, de vuelta a la caja de zapatos (su hábitat natural).</p>
        <div class="s2-clauses">${L7_FACTS.map(([k, t]) => `<button class="opt s2-clause" data-k="${k}">${t}</button>`).join('')}</div><div class="msg" id="s2-m7"></div>`,
      onMount(el) { toggles(el, 'deduc', g); },
      buttons: [{ label: 'Cancelar' }, {
        label: '📗 Anotar en el libro', cls: 'primary', onClick(close, el) {
          if (!same(new Set(g.flag('deduc') || []), ['harina', 'aceite', 'freidora', 'luzMar'])) {
            g.sfx('bad'); msgIn(el, 's2-m7')('Repasas las instrucciones del 303 y el libro no se sostiene: alguna factura no cumple los requisitos, o te dejas alguna que sí.', true); return false;
          }
          g.give('libroRecibidas'); g.set('libroOK');
          g.say('Libro de facturas recibidas al día. Cuatro facturas deducibles. El resto vuelve a la caja, donde Hacienda no las verá. Ni tú.', 'Caja de zapatos');
          return true;
        },
      }],
    });
  }
  function l7Form(g) {
    const f = (id, lab) => `<label class="field">${lab}<input type="text" id="${id}" autocomplete="off" inputmode="decimal" placeholder="0,00"></label>`;
    g.modal({
      title: '💻 Modelo 303 — Autoliquidación del IVA · 1T 2027',
      html: `<div class="s2-form">${f('s2-c27', 'Casilla 27 · Total IVA devengado (repercutido)')}${f('s2-c45', 'Casilla 45 · Total IVA deducible (soportado)')}${f('s2-c71', 'Casilla 71 · Resultado de la autoliquidación')}
        <label class="field">Forma de pago <select id="s2-pago"><option value="">— Elija —</option><option value="dom">Domiciliación bancaria</option><option value="nrc">Ingreso con NRC (pago previo en el banco)</option><option value="apl">Solicitar aplazamiento</option><option value="rec">Reconocimiento de deuda</option></select></label></div>
        <div class="msg" id="s2-m7b"></div>`,
      buttons: [{ label: 'Cancelar' }, {
        label: '📤 Presentar declaración', cls: 'primary', onClick(close, el) {
          const c = (id) => cents(el.querySelector('#' + id).value);
          const pago = el.querySelector('#s2-pago').value;
          let err = null;
          if (c('s2-c27') !== 48300) err = c('s2-c27') === 49300 ? 'Casilla 27: en el libro hay una factura rectificativa, y las rectificativas restan.' : 'Casilla 27: no coincide con su libro de facturas emitidas.';
          else if (c('s2-c45') !== 35500) err = 'Casilla 45: no coincide con el IVA de las facturas que de verdad puede deducir.';
          else if (c('s2-c71') !== 12800) err = 'Casilla 71: el resultado es la casilla 27 menos la 45.';
          else if (pago === 'dom') err = 'La domiciliación solo se admite hasta el día 15 de abril. Mire el calendario.';
          else if (pago === 'apl') err = 'Aplazamiento: tendrá que justificar dificultades de tesorería transitorias, avalarlas y pagar intereses. Por 128 €. No.';
          else if (pago === 'rec') err = 'Reconocimiento de deuda: Hacienda se lo agradece y le reconoce, además, el recargo.';
          else if (pago !== 'nrc') err = 'Elija una forma de pago.';
          else if (!g.has('nrc')) err = 'Para pagar con NRC, primero tiene que hacer el pago desde su banco y obtener el NRC.';
          if (err) { g.sfx('bad'); msgIn(el, 's2-m7b')('❌ ' + err, true); return false; }
          g.take('nrc');
          g.say('«Declaración presentada. Resultado: 128 € a ingresar. NRC validado.» Tu primer trimestre. Solo te quedan 159 más hasta la jubilación.', 'Sede de la AEAT');
          g.win();
          return true;
        },
      }],
    });
  }

  // =========================================================
  //  NIVEL 9 — Kit Digital
  // =========================================================
  const L9_LOGOS = [
    ['ue', '🇪🇺 Emblema UE con el texto «Financiado por la Unión Europea – NextGenerationEU»'],
    ['bandera', '🇪🇺 Bandera de la UE (sola, sin texto, más limpia)'],
    ['prtr', '🔄 «Plan de Recuperación, Transformación y Resiliencia»'],
    ['gob', '🏛️ «Gobierno de España»'],
    ['kit', '💻 «Programa Kit Digital»'],
    ['cunado', '🙋‍♂️ «Financiado por mi cuñado»'],
    ['map', '🗄️ «Ministerio de Asuntos Pendientes»'],
    ['amor', '❤️ «Hecho con cariño y aceite de girasol»'],
  ];
  function l9Web(g) {
    g.modal({
      title: '🌐 Editor de porrasdeltramite.es — Pie de página',
      cls: 'wide',
      html: `<p class="small">Elige los logotipos del pie de página. Luego se publica la web y se hace la captura para la justificación.</p>
        <div class="opt-grid">${L9_LOGOS.map(([k, t]) => `<button class="opt" data-k="${k}">${t}</button>`).join('')}</div><div class="msg" id="s2-m9"></div>`,
      onMount(el) { toggles(el, 'logos', g); },
      buttons: [{ label: 'Cancelar' }, {
        label: '📸 Publicar y hacer captura', cls: 'primary', onClick(close, el) {
          if (!same(new Set(g.flag('logos') || []), ['ue', 'prtr', 'gob', 'kit'])) {
            g.sfx('bad'); msgIn(el, 's2-m9')('Comparas el pie de la web con el Manual de publicidad y no coincide. Una captura así te haría devolver la ayuda con intereses.', true); return false;
          }
          g.give('captura'); g.set('webOK');
          g.say('Web publicada con sus cuatro logos reglamentarios. Ocupan más que la carta de churros. Captura hecha.', 'Portátil');
          return true;
        },
      }],
    });
  }
  function l9Banca(g) {
    const saldo = g.flag('saldo');
    g.modal({
      title: '🏦 Banca online — Cuenta de PORRAS DEL TRÁMITE, S.L.',
      html: `<p class="lcd">Saldo disponible: ${saldo},00 €</p><p class="small">Últimos movimientos: cuota de autónomos (−230 €), alquiler (−900 €), un cliente que pagó con bizum y luego lo canceló.</p><div class="msg" id="s2-m9b"></div>`,
      buttons: [{ label: 'Cerrar' }, {
        label: '💸 Transferir al agente digitalizador', cls: 'primary', onClick(close, el) {
          if (g.has('justificantePago')) { msgIn(el, 's2-m9b')('Ya has pagado. Pagar dos veces solo se le ocurre a Hacienda... cobrar dos veces, quiero decir.', true); return false; }
          if (!g.has('facturaAgente')) { msgIn(el, 's2-m9b')('¿Transferir cuánto, y por qué? Todavía no tienes la factura del agente digitalizador.', true); return false; }
          g.input({
            title: '💸 Transferencia a DIGITALIZA-TE, S.L.',
            text: `Importe a transferir, en euros (sin decimales). Saldo: ${g.flag('saldo')} €.`,
            numeric: true, maxLen: 4,
            check: (v) => v === '420' && g.flag('saldo') >= 420,
            failText: (v) => {
              if (+v === 420) return `Saldo insuficiente: tienes ${g.flag('saldo')} €. ¿No había dinero en algún sitio de la churrería?`;
              if (+v === 2420 || +v === 2000) return 'Lee las bases: el bono del Kit Digital cubre la base imponible. Tú solo pagas una parte.';
              return 'Importe incorrecto según la factura y las bases.';
            },
            ok: () => {
              g.set('saldo', g.flag('saldo') - 420);
              g.give('justificantePago');
              g.say('Transferencia realizada: 420 €. Te quedan 42 €, que es justo lo que cuesta un chocolate con churros para dos. Sin propina.', 'Banca online');
            },
          });
          return false;
        },
      }],
    });
  }
  const L9_DOCS = [['captura', 'Captura de la web con los logotipos'], ['facturaAgente', 'Factura del agente digitalizador'], ['justificantePago', 'Justificante bancario del pago']];
  function l9Portal(g) {
    g.modal({
      title: '📤 Portal de justificación — Kit Digital',
      cls: 'wide',
      html: '<div id="s2-portal"></div><div class="msg" id="s2-m9c"></div>',
      buttons: [{ label: 'Cerrar' }],
      onMount(el) {
        const msg = msgIn(el, 's2-m9c');
        const render = () => {
          const box = el.querySelector('#s2-portal');
          box.innerHTML = L9_DOCS.map(([k, t]) => `<div class="s2-row"><span>${g.flag('up_' + k) ? '✅' : '⬜'} ${t}</span>${g.flag('up_' + k) ? '<span class="s2-okt">Adjuntado</span>' : `<button class="btn" id="s2-att-${k}">📎 Adjuntar</button>`}</div>`).join('')
            + `<div class="s2-row"><span>${g.flag('minimisOK') ? '✅' : '⬜'} Declaración de ayudas <i>de minimis</i></span>${g.flag('minimisOK') ? '<span class="s2-okt">Firmada</span>' : '<button class="btn" id="s2-minimis">✍️ Rellenar declaración</button>'}</div>
              <div class="row-btns"><button class="btn primary" id="s2-present">📨 Presentar justificación</button></div>`;
          L9_DOCS.forEach(([k]) => {
            const b = box.querySelector('#s2-att-' + k);
            if (b) b.onclick = () => {
              if (!g.has(k)) { g.sfx('bad'); msg(`No tienes ese documento: ${ITEMS[k].name.toLowerCase()}.`, true); return; }
              g.take(k); g.set('up_' + k); g.sfx('pick'); render(); msg('Documento adjuntado. El portal tarda 40 segundos en confirmarlo, como si lo estuviera leyendo.');
            };
          });
          const mb = box.querySelector('#s2-minimis');
          if (mb) mb.onclick = () => g.input({
            title: '✍️ Declaración de ayudas de minimis',
            text: 'Declaro que el importe total de ayudas recibidas en el periodo que indican las bases asciende a (euros):',
            numeric: true, maxLen: 5,
            check: (v) => v === '700',
            failText: (v) => ({ 1000: 'Un premio de una asociación privada no es una ayuda pública.', 1700: 'La subvención de 2023 queda fuera del periodo que indican las bases.', 714: 'El «favor» de tu cuñado no es una ayuda pública. Es una deuda moral.' })[+v] || 'Declaración incorrecta. Una declaración responsable falsa es... responsabilidad suya. Revise la carpeta de ayudas y las bases.',
            ok: () => { g.set('minimisOK'); l9Portal(g); },
          });
          box.querySelector('#s2-present').onclick = () => {
            const falta = L9_DOCS.filter(([k]) => !g.flag('up_' + k)).map(([, t]) => t.toLowerCase());
            if (!g.flag('minimisOK')) falta.push('la declaración de minimis');
            if (falta.length) { g.sfx('bad'); msg(`No se puede presentar. Falta: ${falta.join(', ')}.`, true); return; }
            g.closeModal();
            g.say('«Justificación presentada correctamente. La ayuda se abonará al agente digitalizador en un plazo estimado de entre 6 y 18 meses.» El agente digitalizador, por cierto, acaba de anunciar su cierre. Pero eso ya no es problema tuyo. Probablemente.', 'Portal de justificación');
            g.win();
          };
        };
        render();
      },
    });
  }

  // =========================================================
  //  NIVEL 10 — Inspección de Hacienda
  // =========================================================
  const L10_GASTOS = [
    ['cuotas', 'Cuotas de autónomos del año'],
    ['uniforme', 'Uniforme y gorro de churrero (solo se usan en el obrador)'],
    ['furgo', 'Renting de la furgoneta («uso exclusivo del negocio»)'],
    ['multa', 'Multa por aparcar la furgoneta en doble fila al descargar harina'],
    ['curso', 'Curso «Fritura avanzada y masa madre»'],
    ['asesoria', '«Asesoría estratégica en porras», facturada por tu cuñado'],
    ['nochebuena', 'Cena de Nochebuena con la familia (apuntada como «reunión de socios»)'],
    ['seguro', 'Seguro de responsabilidad civil del local'],
  ];
  function l10Gastos(g) {
    g.modal({
      title: '② Gastos deducibles del ejercicio 2027',
      cls: 'wide',
      html: `<p class="small">—Marque solo los gastos que defiende como deducibles. Los demás, retírelos ahora y nos ahorramos el disgusto. —dice el inspector, sin pestañear.</p>
        <div class="s2-clauses">${L10_GASTOS.map(([k, t]) => `<button class="opt s2-clause" data-k="${k}">${t}</button>`).join('')}</div><div class="msg" id="s2-m10"></div>`,
      onMount(el) { toggles(el, 'gastos', g); },
      buttons: [{ label: 'Cancelar' }, {
        label: '✔️ Confirmar gastos', cls: 'primary', onClick(close, el) {
          if (!same(new Set(g.flag('gastos') || []), ['cuotas', 'uniforme', 'curso', 'seguro'])) {
            g.sfx('bad'); msgIn(el, 's2-m10')('El inspector tacha, subraya y vuelve a tachar: «Esto no se sostiene. Revise el requerimiento... y las pruebas que hay en la sala».', true); return false;
          }
          g.set('c2'); g.sfx('stamp');
          g.say('—Cuotas, uniforme, curso y seguro. Admitidos. El resto, fuera. Veo que ha entendido lo de «exclusivamente». Su cuñado, no tanto.', 'Inspector de Hacienda');
          return true;
        },
      }],
    });
  }
  function l10Menu(g) {
    const d = (k) => (g.flag(k) ? ' ✅' : '');
    g.choice({
      title: '🕴️ Comprobaciones del inspector',
      text: '—Vamos por partes. ¿Qué comprobación quiere resolver?',
      options: [
        { label: '① IVA ingresado en 2027' + d('c1'), onPick(g2, msg) {
          if (g.flag('c1')) { msg('Comprobación ya superada.'); return false; }
          g.input({
            title: '① IVA ingresado en 2027', text: '—¿Cuánto IVA INGRESÓ usted en total durante 2027? En euros.', numeric: true, maxLen: 4,
            check: (v) => v === '333',
            failText: (v) => ({ 303: '—Eso es el número del modelo, no lo que ingresó. Aplique las normas de compensación.', 393: '—Los trimestres negativos no se ignoran: se compensan con el siguiente.', 423: '—Los trimestres negativos no se ignoran: se compensan con el siguiente.' })[+v] || '—No me cuadra. Revise la carpeta de los 303 y las normas del IVA.',
            ok: () => { g.set('c1'); g.say('—333 €: 128 del primero y 205 del segundo. El tercero se compensó en el cuarto, y el cuarto salió a devolver. Correcto. Qué pena.', 'Inspector de Hacienda'); },
          });
          return false;
        } },
        { label: '② Gastos deducibles' + d('c2'), onPick(g2, msg) {
          if (g.flag('c2')) { msg('Comprobación ya superada.'); return false; }
          l10Gastos(g); return false;
        } },
        { label: '③ Amortización de la chocolatera' + d('c3'), onPick(g2, msg) {
          if (g.flag('c3')) { msg('Comprobación ya superada.'); return false; }
          g.input({
            title: '③ Amortización de la chocolatera', text: '—¿Qué importe de amortización de la chocolatera corresponde a 2027? En euros.', numeric: true, maxLen: 4,
            check: (v) => v === '60',
            failText: (v) => ({ 120: '—Desde la compra no: desde la puesta en funcionamiento.', 140: '—Desde la compra no: desde la puesta en funcionamiento.', 240: '—Eso sería un año entero. Su chocolatera no ha trabajado un año entero. Como el técnico.', 72: '—La amortización va sobre la base, no sobre el total con IVA.' })[+v] || '—No me cuadra. Tabla, factura y albarán: los tres.',
            ok: () => { g.set('c3'); g.say('—60 €: tres meses de chocolatera. Correcto. Ha trabajado menos que el técnico que la instaló.', 'Inspector de Hacienda'); },
          });
          return false;
        } },
        { label: '④ Firmar el acta', onPick(g2, msg) {
          if (!(g.flag('c1') && g.flag('c2') && g.flag('c3'))) { msg('—Antes de firmar nada, resolvamos las tres comprobaciones.', true); return false; }
          l10Acta(g); return false;
        } },
      ],
    });
  }
  function l10Acta(g) {
    g.choice({
      title: '✍️ Acta de inspección',
      text: '—Solo queda regularizar la factura de su cuñado: <b>8.000 € de base</b>, con <b>IVA al 21 %</b>, que usted se dedujo. Esa cuota hay que devolverla entera, y además hay sanción (consulte el cartel). ¿Cómo firma el acta?',
      options: [
        { label: 'Firmar en DISCONFORMIDAD y recurrir', onPick(g2, msg) { msg('Recurso, reclamación económico-administrativa, contencioso... seis años y sin reducciones. Tu churrería no aguanta tanto. Ni tu cuñado.', true); return false; } },
        { label: 'Echarle la culpa a tu cuñado', onPick(g2, msg) { msg('—La factura la dedujo usted. Su cuñado solo la cobró. Muy bien cobrada, por cierto.', true); return false; } },
        { label: 'Firmar EN CONFORMIDAD y pagar en plazo', onPick() {
          g.input({
            title: '💶 Total a ingresar', text: '—Firma en conformidad y paga en plazo. Dígame el total a ingresar: cuota más sanción reducida, en euros.', numeric: true, maxLen: 5,
            check: (v) => v === '2121',
            failText: (v) => ({
              2520: '—Sin reducciones. ¿No va a firmar en conformidad y pagar en plazo?',
              2268: '—Le falta la reducción por pronto pago.',
              2310: '—Le falta la reducción por conformidad.',
              2058: '—Las reducciones no se suman: la del 25 % se aplica sobre lo que queda tras la del 30 %.',
              441: '—Eso es solo la sanción. La cuota también se paga. Entera.',
              1680: '—Eso es solo la cuota. ¿Y la sanción?',
            })[+v] || '—No me cuadra. Cuota, sanción y reducciones, en ese orden.',
            ok: () => {
              g.give('certificadoAEAT'); g.sfx('stamp');
              g.say('—2.121 €: 1.680 de cuota y 441 de sanción, con sus reducciones. Firme aquí. Y aquí. Y aquí. Tome: certificado de estar al corriente. Puede irse. De momento.', 'Inspector de Hacienda');
            },
          });
          return false;
        } },
      ],
    });
  }

  // =========================================================
  //  NIVELES
  // =========================================================
  const LEVELS = [
    // ------------------------------------------------------ 1
    {
      title: 'El epígrafe',
      place: 'Agencia Tributaria — Oficina de Censos',
      stars: 2,
      intro: 'Con tu DNI nuevo en el bolsillo, decides cumplir un sueño: abrir una <b>churrería</b>. Tu cuñado dice que es «un negocio redondo». Como las porras.<br><br>Primer paso: darte de alta en Hacienda con el <b>modelo 036</b> y elegir tu epígrafe del IAE entre unos cuantos miles.<br><br><b>Objetivo:</b> entrega al funcionario la declaración censal bien rellenada.',
      outro: 'Alta censal registrada. Ya existe usted para Hacienda, que es la forma más intensa de existir. Siguiente parada: la Seguridad Social, que también quiere conocerle. Sobre todo, a su cuenta corriente.',
      scene: { wall: '#d9e0d0', floor: '#8a8f7f', floorH: 32, pattern: 'tiles' },
      decor: [
        { kind: 'window', l: 3, t: 8, w: 12, h: 26 },
        { kind: 'shelf', l: 20, t: 34, w: 14, h: 2 },
        { kind: 'flag-eu', l: 88, t: 5, w: 6, h: 8 },
        { kind: 'counter', l: 56, t: 56, w: 28, h: 9 },
        { kind: 'counter', l: 26, t: 66, w: 16, h: 5 },
        { emoji: '📗', x: 22, y: 30, s: 3, o: 0.9 }, { emoji: '📘', x: 31, y: 30, s: 3, o: 0.9 },
        { emoji: '🪑', x: 24, y: 86, s: 4, o: 0.8 }, { emoji: '🪑', x: 30, y: 86, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'guia', x: 42, y: 20, sign: 'GUÍA DEL 036', sub: '📋', w: 12, label: 'Guía para rellenar el 036',
          look(g) {
            g.doc('📋 Cómo rellenar su declaración censal', `<ol>
              <li>Use <b>siempre el modelo 036</b>. El 037 («simplificado») se suprimió en 2025. Los ejemplares del expositor son decorativos, como el horario de verano.</li>
              <li><b>Causa de presentación:</b> casilla <b>111</b> si se da de alta por primera vez; la 120 si modifica datos; la 150 si se da de baja (no tenga prisa, ya llegará).</li>
              <li><b>Domicilio de la actividad:</b> el del local donde la ejercerá, según su contrato de alquiler. No lo confunda con su domicilio fiscal (su casa) ni con el de su cuñado, por mucho que él insista.</li>
              <li><b>Epígrafe del IAE:</b> consulte las Normas del IAE y el tomo de Tarifas.</li></ol>
              <p class="small">Rellene el impreso en la mesa habilitada. El bolígrafo está encadenado por su seguridad (la del bolígrafo).</p>`);
          } },
        { id: 'normas', x: 58, y: 20, sign: 'NORMAS DEL IAE', sub: '⚖️', w: 12, label: 'Normas del IAE',
          look(g) {
            g.doc('⚖️ Normas para elegir epígrafe', `<p>Usted se dará de alta en un <b>único epígrafe</b>: el de su <b>actividad principal</b>, que es la que genera <b>más facturación</b>.</p>
              <p>Para comparar, <b>sume primero todas las ventas que correspondan a un mismo epígrafe</b>. Un mismo epígrafe puede incluir productos muy distintos; y un mismo producto puede ir a epígrafes distintos según se sirva.</p>
              <p class="small">No vale elegir el epígrafe que más le guste, ni el que suene mejor en las cenas de empresa. Bueno, de empresa no: usted no tiene empresa todavía.</p>`);
          } },
        { id: 'pantalla', x: 80, y: 16, emoji: '📺', s: 5, label: 'Pantalla de turnos',
          look(g) { g.say('«TURNO: C-001». Es el tuyo. Llegaste el primero. Nadie te cree: ni tú.'); } },
        { id: 'tarifas', x: 27, y: 29, emoji: '📕', s: 5, label: 'Tarifas del IAE (tomo I de XIV)',
          look(g) {
            g.doc('📕 Tarifas del Impuesto sobre Actividades Económicas (extracto)', `<table class="tbl">
              <tr><td><b>033.3</b> Explotación de belenes vivientes (temporada navideña).</td><td>Sec. 1</td></tr>
              <tr><td><b>644.1</b> Comercio al por menor de pan, pastelería y bollería <b>sin freír</b>.</td><td>Sec. 1</td></tr>
              <tr><td><b>644.6</b> Comercio al por menor de <b>masas fritas</b> (churros, porras, buñuelos), <b>patatas fritas</b> y <b>preparados de chocolate</b>, siempre <b>PARA LLEVAR</b>.</td><td>Sec. 1</td></tr>
              <tr><td><b>673.2</b> Otros cafés y bares (consumo en el local).</td><td>Sec. 1</td></tr>
              <tr><td><b>676</b> Chocolaterías, heladerías y horchaterías (<b>consumo en el local</b>).</td><td>Sec. 1</td></tr>
              <tr><td><b>857.1</b> Profesionales de la espera en colas, por cuenta ajena.</td><td>Sec. 2</td></tr>
              <tr><td><b>999</b> Otros servicios no clasificados en otras partes (el epígrafe de quien no ha leído esta lista).</td><td>Sec. 1</td></tr></table>
              <p class="small">Tomos II a XIV: en el sótano. El sótano está inundado desde 2011.</p>`);
          } },
        { id: 'funcionario', x: 69, y: 48, emoji: '👨‍💼', s: 8, label: 'Funcionario de Censos',
          look(g) {
            g.say('—Alta de actividad. Muy bien. Tráigame el modelo 036 relleno: causa, epígrafe y domicilio de la actividad. Las instrucciones, en los carteles. Los impresos, en el expositor.', 'Funcionario');
            g.say('—Y no me pregunte qué epígrafe es el suyo. Si se lo digo yo y me equivoco, la culpa es mía. Si se equivoca usted, la culpa es suya. Prefiero lo segundo.', 'Funcionario');
          },
          use: {
            modelo036Relleno(g) {
              g.take('modelo036Relleno');
              g.say('—Casilla 111, epígrafe 644.6, local de la calle del Trámite... Impecable. Es usted el primer churrero que no se da de alta como «belén viviente». Queda dado de alta.', 'Funcionario');
              g.win();
            },
            modelo036(g) { g.say('—En blanco no, por favor. Se rellena en la mesa. Con el bolígrafo encadenado.', 'Funcionario'); },
            modelo037(g) { g.say('—¿Un 037? Se suprimió en 2025. Lo tenemos en el expositor por nostalgia. ¿Ha leído usted la guía?', 'Funcionario'); },
            plan(g) { g.say('—No me cuente su plan de empresa. Yo solo quiero el impreso. Su plan, cuénteselo al banco.', 'Funcionario'); },
            contrato(g) { g.say('—El contrato no lo necesito. Lo que necesito es lo que pone el contrato, escrito en el 036.', 'Funcionario'); },
          } },
        { id: 'expositor', x: 91, y: 52, emoji: '🗂️', s: 7, label: 'Expositor de impresos',
          look(g) {
            g.choice({
              title: '🗂️ Expositor de impresos', text: 'Hay dos montones. El del 036 es altísimo. El del 037 tiene polvo y una etiqueta que pone «¡NOVEDAD!».',
              options: [
                { label: 'Coger un modelo 036 («Declaración censal», 23 páginas)', onPick(g2, msg) {
                  if (g.has('modelo036') || g.has('modelo036Relleno')) { msg('Ya tienes uno. Coger dos sería acaparar.', true); return false; }
                  g.give('modelo036'); return true;
                } },
                { label: 'Coger un modelo 037 («Declaración censal simplificada», 4 páginas)', onPick(g2, msg) {
                  if (g.has('modelo037')) { msg('Ya tienes uno. Y no te va a servir de nada.', true); return false; }
                  g.give('modelo037'); return true;
                } },
              ],
            });
          } },
        { id: 'mesa', x: 34, y: 61, emoji: '📝', s: 6, label: 'Mesa para rellenar impresos',
          look(g) { g.say('Una mesa con un bolígrafo encadenado. Tiene tinta: un milagro administrativo. Aquí se rellenan los impresos (selecciona uno y úsalo aquí).'); },
          use: {
            modelo036: l1Form,
            modelo037(g) { g.say('Empiezas a rellenar el 037... y en la última página pone, en letra diminuta: «MODELO SUPRIMIDO». Cuatro páginas perdidas. Al menos eran pocas.'); },
            modelo036Relleno(g) { g.say('Ya está relleno y firmado. No lo toques más, que lo estropeas.'); },
          } },
        { id: 'mochila', x: 10, y: 82, emoji: '🎒', s: 6, label: 'Tu mochila',
          look(g) {
            if (!g.flag('mochila')) {
              g.set('mochila');
              g.say('En la mochila llevas tu plan de empresa (con gráficos de colores) y el contrato de alquiler del local. Y un bocadillo de 2025.');
              g.give('plan'); g.give('contrato');
            } else g.say('Solo queda el bocadillo. No te lo comas: es un fósil.');
          } },
        { id: 'cola', x: 52, y: 80, emoji: '🧍‍♂️🧍‍♀️', s: 5, label: 'Cola de futuros autónomos',
          look(g) {
            g.say(rand([
              '—Yo me di de alta como «belén viviente» por error. Ahora tengo que poner un belén cada diciembre o me inspeccionan.',
              '—Yo vendo calcetines por internet. El funcionario dice que soy «comercio al por menor de artículos de mercería ambulante virtual». No sé si reír o llorar.',
              '—Dicen que el 037 era más fácil. Por eso lo quitaron.',
            ]), 'Alguien de la cola');
          } },
        { id: 'folleto', x: 76, y: 84, emoji: '📰', s: 5, label: 'Folleto «Emprende en 24 horas»',
          look(g) { g.say('«¡EMPRENDE EN 24 HORAS!». Debajo, en letra pequeña: «hábiles, no consecutivas, y sin contar los trámites previos, posteriores ni intermedios».'); } },
        { id: 'planta', x: 95, y: 80, emoji: '🪴', s: 5, label: 'Planta',
          look(g) { g.say('Un ficus dado de alta en el epígrafe 999. Nadie sabe a qué se dedica, pero cotiza.'); } },
      ],
      hints: [
        'En tu mochila tienes el plan de empresa y el contrato del local. El expositor tiene dos impresos: lee la guía antes de elegir.',
        'El epígrafe es el de la actividad que más factura, pero sumando antes todo lo que cae en un mismo epígrafe (mira el tomo de Tarifas: el chocolate en mesa y el chocolate para llevar no van al mismo). El domicilio es el del local. Rellena el impreso en la mesa.',
        'Coge el 036 (el 037 ya no existe) y úsalo en la mesa: casilla 111, epígrafe 644.6 (25 % + 15 % + 5 % = 45 %, más que el 35 % del 676) y Calle del Trámite, 12. Entrega el 036 relleno al funcionario.',
      ],
    },

    // ------------------------------------------------------ 2
    {
      title: 'La cuota',
      place: 'Tesorería de la Seguridad Social — Sala de autónomos',
      stars: 2,
      intro: 'Hacienda ya te conoce. Ahora te toca darte de alta en el <b>RETA</b>, el régimen de autónomos, y pagar tu <b>cuota mensual</b>.<br><br>La cuota depende de lo que vas a ganar, que no sabes. Y existe una «tarifa plana» de 80 € para quien cumpla los requisitos, que no sabes si cumples.<br><br><b>Objetivo:</b> presenta tu vida laboral y di qué cuota te corresponde.',
      outro: 'Alta en el RETA confirmada. 230 € al mes, factures o no. Tu cuñado insiste en que una S.L. «queda más seria». Y para tener una S.L., lo primero es un nombre que no tenga nadie. Fácil, ¿no?',
      scene: { wall: '#cfd9e3', floor: '#9aa3a8', floorH: 32, pattern: 'tiles' },
      decor: [
        { kind: 'window', l: 3, t: 8, w: 12, h: 24 },
        { kind: 'counter', l: 62, t: 56, w: 26, h: 9 },
        { kind: 'counter', l: 33, t: 58, w: 14, h: 6 },
        { kind: 'flag', l: 54, t: 5, w: 5, h: 8 },
        { emoji: '🪑', x: 34, y: 86, s: 4, o: 0.8 }, { emoji: '🪑', x: 40, y: 86, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'tramos', x: 26, y: 20, sign: 'CUOTAS RETA', sub: '📊', w: 13, label: 'Cartel de cuotas',
          look(g) {
            g.doc('📊 Cuota de autónomos según rendimientos (simplificada)', `<p><b>1.</b> Rendimiento neto mensual = ingresos previstos − gastos <b>necesarios para la actividad</b>. Los gastos personales no cuentan: ni el gimnasio, ni el coche de los domingos, ni la terapia.</p>
              <p><b>2.</b> Rendimiento computable = rendimiento neto <b>− 7 %</b> (deducción por gastos genéricos).</p>
              <p><b>3.</b> Busque su tramo:</p>
              <table class="tbl"><tr><td>Hasta 700 €</td><td>200 €</td></tr><tr><td>De 700,01 a 1.000 €</td><td>230 €</td></tr><tr><td>De 1.000,01 a 1.300 €</td><td>275 €</td></tr><tr><td>De 1.300,01 a 1.700 €</td><td>310 €</td></tr><tr><td>Más de 1.700 €</td><td>390 €</td></tr></table>
              <p class="small">Si cumple los requisitos de la tarifa plana, olvide esta tabla durante 12 meses. Luego, recuérdela.</p>`);
          } },
        { id: 'tarifa', x: 44, y: 20, sign: 'TARIFA PLANA', sub: '8️⃣0️⃣', w: 13, label: 'Cartel de la tarifa plana',
          look(g) {
            g.doc('8️⃣0️⃣ Tarifa plana para nuevos autónomos', `<p>Cuota reducida de <b>80 € al mes</b> durante los primeros 12 meses.</p>
              <p><b>Requisito:</b> no haber estado de alta como autónomo en ningún momento de los <b>dos años</b> inmediatamente anteriores a la nueva alta.</p>
              <p class="small">Si estuvo de alta, aunque fuera un ratito vendiendo pulseras, no insista: el sistema lo sabe todo. Menos dónde está su cita.</p>`);
          } },
        { id: 'calendario', x: 88, y: 16, emoji: '📅', s: 5, label: 'Calendario',
          look(g) { g.say('Hoy es jueves, 12 de noviembre de 2026. Alguien ha rodeado el día 30 con rotulador rojo: «fin de plazo de algo». Nadie recuerda de qué.'); } },
        { id: 'funcionaria', x: 75, y: 48, emoji: '👩‍💼', s: 8, label: 'Funcionaria del RETA',
          look(g) {
            if (g.has('vidaLaboral')) return l2Cuota(g);
            g.say('—Para el alta en autónomos necesito su vida laboral y que me diga qué cuota le corresponde. La vida laboral se imprime en el terminal. La cuota, en los carteles. La paciencia, en su casa.', 'Funcionaria');
          },
          use: {
            vidaLaboral: l2Cuota,
            prevision(g) { g.say('—Sus previsiones me parecen muy bien. Optimistas, pero bien. Yo lo que quiero es su vida laboral y su cuota.', 'Funcionaria'); },
          } },
        { id: 'terminal', x: 40, y: 51, emoji: '🖥️', s: 7, label: 'Terminal Import@ss',
          look(g) {
            if (g.has('vidaLaboral')) return g.say('Ya imprimiste tu vida laboral. Es más corta de lo que parece y, aun así, no cabe en una hoja.');
            g.input({
              title: '🖥️ Import@ss — Informe de vida laboral',
              text: 'Introduzca su número de afiliación a la Seguridad Social (12 cifras, sin barras).',
              numeric: true, maxLen: 12,
              check: (v) => v === '280347121534',
              failText: () => 'Número de afiliación no encontrado. ¿Seguro que es usted quien dice ser? Míralo en tu tarjeta.',
              ok: () => { g.give('vidaLaboral'); g.say('La impresora escupe tu informe de vida laboral. Lo lees: hay algo de 2025 que habías olvidado. El sistema, no.', 'Terminal Import@ss'); },
            });
          } },
        { id: 'cartera', x: 8, y: 80, emoji: '👛', s: 5, label: 'Tu cartera',
          look(g) { g.say('En tu cartera: el DNI nuevo (qué recuerdos), 3,20 € y la tarjeta de la Seguridad Social: «Nº de afiliación: <b>28/03471215/34</b>». La conseguiste tras cinco ventanillas. Se nota.'); } },
        { id: 'mochila', x: 20, y: 82, emoji: '🎒', s: 6, label: 'Tu mochila',
          look(g) {
            if (!g.flag('moch')) {
              g.set('moch');
              g.say('Rebuscas en la mochila: la previsión de ingresos que te hizo tu cuñado, el contrato del local y el papel del préstamo del coche.');
              g.give('prevision'); g.give('contrato'); g.give('cocheLetra');
            } else g.say('Nada más. Bueno, un caramelo de menta con pelusa. No.');
          } },
        { id: 'repartidor', x: 54, y: 76, emoji: '👷', s: 7, label: 'Repartidor de harina',
          look(g) {
            if (!g.flag('harina')) {
              g.set('harina');
              g.say('—¡Hombre, el de la churrería! Ya que estamos en la misma cola, toma el presupuesto mensual de harina, aceite y azúcar. Yo vengo a darme de baja: con lo que cuesta la cuota, me sale más a cuenta ser harina.', 'Repartidor');
              g.give('presupuestoHarina');
            } else g.say('—Llevo aquí desde las ocho. Ya me he hecho amigo de la planta.', 'Repartidor');
          } },
        { id: 'movil', x: 86, y: 82, emoji: '📱', s: 5, label: 'Tu móvil',
          look(g) {
            if (!g.flag('luz')) {
              g.set('luz');
              g.say('Un correo de la eléctrica: «Estimación mensual de consumo para su local, freidora industrial incluida». Lo guardas. Y 14 notificaciones del grupo familiar sobre la churrería.', 'Móvil');
              g.give('luzEstimada');
            } else g.say('Tu cuñado ha escrito en el grupo: «Hazte una S.L., que queda más serio». Con un emoji de churro.', 'Móvil');
          } },
        { id: 'veterano', x: 66, y: 80, emoji: '🧓', s: 6, label: 'Autónomo veterano',
          look(g) {
            g.say(rand([
              '—Llevo 32 años de autónomo. Pago la cuota hasta estando de baja. Bueno, nunca he estado de baja: no me lo puedo permitir.',
              '—¿Tarifa plana? En mis tiempos la tarifa era de montaña. Todo cuesta arriba.',
              '—Un consejo: lo de «gastos» es solo lo del negocio. Yo intenté meter el coche del pueblo y aún me acuerdo.',
            ]), 'Autónomo veterano');
          } },
      ],
      hints: [
        'Necesitas tu vida laboral: el terminal pide tu número de afiliación (¿lo llevas en la cartera?). Reúne también ingresos y gastos: mochila, repartidor y móvil.',
        'Lee la vida laboral y el cartel de la tarifa plana: ¿han pasado dos años desde tu última baja como autónomo? Rendimiento = ingresos − gastos del negocio (el coche de la playa no cuenta), y luego réstale un 7 %.',
        'Terminal: 280347121534. Sin tarifa plana (baja en junio de 2025: menos de dos años). 2.900 − 900 − 650 − 300 = 1.050; −7 % = 976,50 → cuota 230. Dile 230 a la funcionaria con la vida laboral.',
      ],
    },

    // ------------------------------------------------------ 3
    {
      title: 'Nombre no disponible',
      place: 'Registro Mercantil Central — Sección de Denominaciones',
      stars: 3,
      intro: 'Tu cuñado te ha convencido: vas a constituir una <b>S.L.</b> Para eso necesitas un <b>certificado negativo de denominación</b>: que nadie en España tenga un nombre igual al tuyo... o «idéntico», que no es lo mismo, pero casi.<br><br>Llevas una lista de palabras. El Registro, una lista de prohibiciones.<br><br><b>Objetivo:</b> consigue el certificado y sal del Registro.',
      outro: 'Certificado concedido: «PORRAS DEL TRÁMITE, S.L.». Tienes tres meses para firmar la escritura ante notario. Tu tía y tu cuñado ya han dicho que quieren ser socios. Qué ilusión. Qué miedo.',
      scene: { wall: '#e3d3b3', floor: '#6b4f3a', floorH: 32, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 60, t: 54, w: 24, h: 9 },
        { kind: 'counter', l: 5, t: 61, w: 14, h: 6 },
        { kind: 'column', l: 47, t: 4, w: 4, h: 64 },
        { kind: 'rug', l: 26, t: 76, w: 40, h: 14, color: '#5a2e2e' },
        { emoji: '🗄️', x: 52, y: 60, s: 4, o: 0.85 },
      ],
      hotspots: [
        { id: 'normas', x: 16, y: 18, sign: 'ART. 408', sub: '⚖️ Identidad', w: 13, label: 'Normas sobre identidad de nombres',
          look(g) {
            g.doc('⚖️ Reglamento del Registro — Identidad de denominaciones (simplificado)', `<p>No se puede inscribir una denominación <b>idéntica</b> a otra ya inscrita o reservada. Hay identidad no solo cuando coinciden del todo, sino también cuando <b>solo</b> se diferencian en:</p>
              <ol><li>El <b>orden</b> de las palabras, el <b>género</b> o el <b>número</b> (singular / plural).</li>
              <li><b>Artículos, preposiciones, conjunciones</b>, tildes, guiones o signos de puntuación.</li>
              <li>La <b>forma social</b> (S.L., S.A., S.L.L., S.Coop…).</li>
              <li>Letras que <b>suenan igual</b>: b/v, ll/y, o una h muda.</li></ol>
              <p class="small">En cambio, palabras distintas que no suenan igual son distintas: un tranvía no es un trámite, aunque a veces vayan igual de lentos.</p>`);
          } },
        { id: 'prohibidas', x: 34, y: 18, sign: 'PROHIBIDO', sub: '🚫 Palabras', w: 13, label: 'Cartel de palabras prohibidas',
          look(g) {
            g.doc('🚫 Términos prohibidos', `<p>No pueden incluirse en una denominación términos que induzcan a confusión con organismos públicos:</p>
              <p class="big-num">REAL · NACIONAL · ESTADO · HACIENDA · MINISTERIO · OFICIAL · PÚBLICO</p>
              <p class="small">Ni «Real Churrería», ni «Churros de Hacienda». Sobre todo este último: da miedo.</p>`);
          } },
        { id: 'calendario', x: 62, y: 14, emoji: '📅', s: 5, label: 'Calendario',
          look(g) { g.say('Hoy es lunes, 16 de noviembre de 2026. El calendario es del Registro: tiene los festivos marcados en rojo y los puentes en rojo más oscuro.'); } },
        { id: 'registradora', x: 71, y: 46, emoji: '🧑‍💼', s: 8, label: 'Registradora',
          look(g) {
            if (g.has('certDen')) return g.say('—Ya tiene su certificado. Corra al notario, que caduca. Todo caduca. Menos las colas.', 'Registradora');
            g.say('—Para su S.L. necesito una solicitud con la denominación. Si existe otra igual o «idéntica», inscrita o con reserva en vigor, se la deniego. Y no le digo cuál: está en el Libro, que para eso lo tenemos.', 'Registradora');
          },
          use: {
            solicitudRellena(g) {
              const p1 = g.flag('p1'); const p2 = g.flag('p2');
              g.take('solicitudRellena');
              g.set('intentos', (g.flag('intentos') || 0) + 1);
              if (p2 >= 3) { g.sfx('bad'); return g.say('—¿«' + L3_P2[p2] + '»? Término prohibido. ¿No ha leído el cartel? Denegada. Coja otra solicitud de la bandeja.', 'Registradora'); }
              if (p1 === 1 && p2 === 1) {
                g.give('certDen'); g.sfx('stamp');
                return g.say('—«Porras del Trámite»... Había una reserva, pero es de abril: caducada hace un mes. Está libre. ¡PAM! Certificado negativo. Que lo disfrute.', 'Registradora');
              }
              g.sfx('bad');
              g.say(rand([
                '—Denegada: existe una denominación idéntica, inscrita o reservada. Coja otra solicitud. Y mire el Libro, hombre.',
                '—Lo siento. Idéntica a otra. No se lo puedo decir más claro sin decírselo. Otra solicitud, por favor.',
              ]), 'Registradora');
            },
            solicitudDen(g) { g.say('—En blanco no. Rellénela en el pupitre.', 'Registradora'); },
          } },
        { id: 'libro', x: 12, y: 55, emoji: '📖', s: 6, label: 'Libro de denominaciones',
          look(g) {
            g.doc('📖 Libro de denominaciones (tomo B–V, extracto)', `<p class="small">Las <b>reservas</b> tienen una vigencia de <b>seis meses</b> desde su fecha. Caducada la reserva, el nombre vuelve a estar disponible (si nadie lo ha inscrito).</p>
              <table class="tbl">${L3_REG.map(([n, s]) => `<tr><td>${n}</td><td>${s}</td></tr>`).join('')}</table>
              <p class="small">«Porra de la Bentanilla» se inscribió en 1998 con B. El notario no lo vio. El registrador tampoco. Ya es tarde.</p>`);
          } },
        { id: 'bandeja', x: 30, y: 58, emoji: '📥', s: 5, label: 'Bandeja de solicitudes',
          look(g) {
            if (g.has('certDen')) return g.say('Ya no necesitas más solicitudes. Aléjate de la bandeja despacio.');
            if (g.has('solicitudDen') || g.has('solicitudRellena')) return g.say('Ya tienes una solicitud. La bandeja te mira mal: aquí no se acapara.');
            g.give('solicitudDen');
            g.say(g.flag('intentos') ? `Coges otra solicitud. Es tu intento número ${g.flag('intentos') + 1}. La bandeja ya te conoce.` : 'Coges una solicitud de certificación negativa de denominación. Está en blanco y huele a esperanza.');
          } },
        { id: 'pupitre', x: 40, y: 69, emoji: '✍️', s: 6, label: 'Pupitre para rellenar',
          look(g) { g.say('Un pupitre con un bolígrafo atado con una cadena de barco. Aquí se rellenan las solicitudes (selecciona una y úsala aquí).'); },
          use: {
            solicitudDen: l3Form,
            solicitudRellena(g) { g.say('Ya está rellena. Si te has equivocado, la registradora te lo dirá. Sin decirte en qué.'); },
          } },
        { id: 'cunado', x: 60, y: 80, emoji: '🙋‍♂️', s: 7, label: 'Tu cuñado',
          look(g) {
            g.say(rand([
              '—Ponle «Real Churrería de España». Vende muchísimo. ¿Que está prohibido? Bah, eso lo dicen para que no lo pongas.',
              '—Yo propuse «Churros Hacienda». Así, cuando vengan a inspeccionar, se confunden.',
              '—Hazme caso: con «Porras» no te equivocas. Porras siempre hay. Y trámites, ni te cuento.',
            ]), 'Tu cuñado');
          } },
        { id: 'senor', x: 22, y: 82, emoji: '👨‍🦳', s: 6, label: 'Señor con una carpeta enorme',
          look(g) { g.say('—Llevo catorce denegaciones: «Bar Manolo», «Bar Manolo 2», «Manolo Bar», «Bar de Manolo», «Barra Manolo»... Mañana pruebo con «Bar Pepe». Por cambiar.', 'Señor'); } },
        { id: 'puerta', x: 92, y: 52, emoji: '🚪', s: 12, label: 'Salida',
          look(g) { g.say('El vigilante no deja salir a nadie sin papeles. «Sin certificado no se va usted de aquí. ¿Qué haría fuera, sin nombre?»'); },
          use: {
            certDen(g) { g.say('Enseñas el certificado. El vigilante lo lee dos veces, asiente y abre la puerta: «Porras del Trámite... Iré a probarlas». No irá.'); g.win(); },
          } },
      ],
      hints: [
        'Coge una solicitud de la bandeja y rellénala en el pupitre. Antes, lee las normas (art. 408), las palabras prohibidas y el Libro de denominaciones.',
        'Dos nombres son «idénticos» aunque cambien el orden, el número, los artículos, las preposiciones, las tildes, la forma social o letras que suenan igual (b/v, ll/y). Y fíjate en las reservas: caducan a los seis meses (hoy es 16 de noviembre de 2026).',
        'PORRAS + DEL TRÁMITE: su reserva es del 12 de abril de 2026 y ya ha caducado. Entrega la solicitud a la registradora y sal por la puerta con el certificado.',
      ],
    },

    // ------------------------------------------------------ 4
    {
      title: 'Ante mí',
      place: 'Notaría de don Fulgencio Fe Pública',
      stars: 3,
      intro: 'Es el gran día: la <b>escritura de constitución</b> de tu S.L. Socios: tú, tu tía Remedios y tu cuñado Paco. Capital: 3.000 €. Ambiente: tenso.<br><br>El borrador lo ha preparado la oficial de la notaría «a toda prisa». Y en la mesa de firmas nadie quiere firmar en cualquier orden.<br><br><b>Objetivo:</b> corrige el borrador y consigue que todos firmen.',
      outro: 'Escritura firmada. Tu S.L. ya existe... aunque para abrir la churrería necesitas algo más que existir: necesitas una licencia del Ayuntamiento. Y el Ayuntamiento tiene ordenanzas. Muchas.',
      scene: { wall: '#4f3b33', floor: '#5a3b2a', floorH: 30, pattern: 'wood' },
      decor: [
        { kind: 'shelf', l: 3, t: 36, w: 15, h: 2 },
        { kind: 'counter', l: 30, t: 52, w: 40, h: 9 },
        { kind: 'rug', l: 22, t: 74, w: 40, h: 16, color: '#6b2e2e' },
        { kind: 'flag', l: 88, t: 5, w: 5, h: 8 },
        { emoji: '🖋️', x: 60, y: 51, s: 3, o: 0.9 },
        { emoji: '🪑', x: 86, y: 76, s: 5, o: 0.85 },
      ],
      hotspots: [
        { id: 'protocolo', x: 10, y: 30, emoji: '📚', s: 6, label: 'Protocolo notarial',
          look(g) { g.say('Tomos encuadernados en piel con todas las escrituras desde 1862. Huelen a tinta, a polvo y a herencias mal repartidas.'); } },
        { id: 'reloj', x: 28, y: 16, emoji: '🕰️', s: 5, label: 'Reloj',
          look(g) { g.say('Son las 10:00. La firma era a las 9:30. En las notarías el tiempo transcurre distinto: se factura por minuto, pero se espera por horas.'); } },
        { id: 'retrato', x: 50, y: 16, emoji: '🖼️', s: 6, label: 'Retrato de familia',
          look(g) { g.say('Don Fulgencio con su padre, notario, y su abuelo, notario. Al fondo, un bebé con toga. Es su nieto. Ya tiene plaza.'); } },
        { id: 'cartel', x: 74, y: 18, sign: 'ORDEN DE FIRMA', sub: '✒️', w: 14, label: 'Cartel: orden de firma',
          look(g) {
            g.doc('✒️ Orden de firma', `<p>Los otorgantes firman primero, <b>en el orden que acuerden entre ellos</b>.</p>
              <p>El <b>notario firma siempre el último</b>: «Ante mí». Si firma antes, deja de ser «ante él» y pasa a ser «antes que usted», que no es lo mismo.</p>
              <p class="small">Si un otorgante se niega a firmar, no hay escritura. Si se niegan dos, hay comida familiar.</p>`);
          } },
        { id: 'notario', x: 50, y: 44, emoji: '🧑‍⚖️', s: 8, label: 'Don Fulgencio, notario',
          look(g) {
            if (!g.flag('borradorOK')) return g.say('—Yo no firmo nada con erratas. Revise el borrador con mi oficial. Y luego, a la mesa de firmas. Yo firmo el último, como manda la tradición. Y la minuta.', 'Notario');
            g.say('—Borrador correcto. Cuando los otorgantes estén de acuerdo en el orden, pasen a la mesa de firmas.', 'Notario');
          } },
        { id: 'oficial', x: 16, y: 58, emoji: '👩‍💼', s: 7, label: 'Oficial de la notaría',
          look(g) {
            if (g.flag('borradorOK')) return g.say('—El borrador ya está corregido. Ahora, a firmar. En orden.', 'Oficial');
            if (!g.flag('carp')) g.say('—Aquí tiene el borrador. Antes de revisarlo, tenga a mano sus documentos: certificado de denominación, certificado del banco y contrato del local.', 'Oficial');
            l4Borrador(g);
          } },
        { id: 'mesaFirmas', x: 86, y: 60, emoji: '✒️', s: 6, label: 'Mesa de firmas',
          look(g) {
            if (!g.flag('borradorOK')) return g.say('Sobre la mesa, la pluma estilográfica del notario. Nadie firma nada hasta que el borrador esté corregido.');
            l4Firmas(g);
          } },
        { id: 'tia', x: 30, y: 80, emoji: '👵', s: 7, label: 'Tía Remedios',
          look(g) {
            g.say(rand([
              '—Yo pongo mis 900 euros, pero firmo ANTES que tu cuñado. A ese no le fío ni el bolígrafo.',
              '—Hijo/a, yo firmo antes que el Paco, que luego dice que lo ha hecho todo él. Lo demás me da igual.',
            ]), 'Tía Remedios');
          } },
        { id: 'cunado', x: 48, y: 80, emoji: '🙋‍♂️', s: 7, label: 'Tu cuñado Paco',
          look(g) {
            g.say(rand([
              '—Yo firmo JUSTO después de ti, cuñao. Justo después: ni antes, ni con nadie en medio. Así salimos juntos en la foto.',
              '—Lo mío es firmar inmediatamente detrás de ti. Que se vea que somos un equipo. Aunque yo ponga 450 y tú 1.650.',
            ]), 'Tu cuñado Paco');
          } },
        { id: 'carpeta', x: 68, y: 84, emoji: '📁', s: 5, label: 'Tu carpeta',
          look(g) {
            if (!g.flag('carp')) {
              g.set('carp');
              g.say('Sacas tus documentos: el certificado de denominación, el certificado bancario del capital y el contrato de alquiler del local.');
              g.give('certDen'); g.give('certBanco'); g.give('contrato');
            } else g.say('La carpeta está vacía. Tu cuenta corriente, también: 1.650 € de capital, más la notaría, más el registro...');
          } },
      ],
      hints: [
        'Saca los documentos de tu carpeta y compáralos con el borrador que tiene la oficial. Hay tres cláusulas mal.',
        'Mira la forma social, el número de la calle y haz la cuenta del capital (300 participaciones × valor nominal = ¿3.000 €?). Para las firmas, escucha a la tía, al cuñado y lee el cartel.',
        'Errores: cláusulas 2 (S.A. → S.L.), 4 (21 → 12) y 5 (participaciones de 10 €, no de 1 €). Valor nominal: 10. Orden de firma: Tía Remedios, Tú, Cuñado Paco, Notario.',
      ],
    },

    // ------------------------------------------------------ 5
    {
      title: 'La licencia',
      place: 'Ayuntamiento — Gerencia de Urbanismo, Negociado de Actividades',
      stars: 3,
      intro: 'Tienes sociedad, tienes local y tienes freidora. Te falta la <b>licencia de actividad</b> del Ayuntamiento.<br><br>Para dártela quieren un <b>plano</b> que cumpla la ordenanza, el pago de la <b>tasa</b> y el <b>aforo</b> exacto del local. Todo calculado por ti, que eres churrero, no arquitecto.<br><br><b>Objetivo:</b> consigue la licencia del técnico municipal.',
      outro: 'Licencia provisional concedida. La definitiva «llegará por correo». Mientras tanto, ¡puedes abrir! Mañana es la inauguración. Tu primera clienta ya ha avisado de que quiere factura. Completa. Con todo.',
      scene: { wall: '#e0d6c4', floor: '#8e8e86', floorH: 32, pattern: 'tiles' },
      decor: [
        { kind: 'board', l: 3, t: 8, w: 12, h: 26 },
        { kind: 'counter', l: 58, t: 54, w: 26, h: 9 },
        { kind: 'counter', l: 28, t: 68, w: 16, h: 5 },
        { kind: 'flag', l: 78, t: 5, w: 5, h: 8 },
        { emoji: '🗄️', x: 82, y: 60, s: 4, o: 0.85 },
      ],
      hotspots: [
        { id: 'maqueta', x: 9, y: 22, emoji: '🏗️', s: 6, label: 'Maqueta en el corcho',
          look(g) { g.say('Foto de la maqueta del «Nuevo Polideportivo Municipal (2009)». Debajo, a boli: «obra parada por falta de licencia». Del propio Ayuntamiento.'); } },
        { id: 'ordenanza', x: 30, y: 18, sign: 'ORDENANZA DE ACTIVIDADES', sub: '📜', w: 18, label: 'Ordenanza de actividades',
          look(g) {
            g.doc('📜 Ordenanza municipal de actividades (extracto)', `<p><b>Art. 1. Aforo:</b> 1 persona por cada 2 m² de <b>zona de público</b> (superficie total menos obrador y aseo), redondeando hacia abajo.</p>
              <p><b>Art. 2. Mesas:</b> de 4 personas. Número de mesas = aforo ÷ 4, redondeando hacia abajo. Ni una más ni una menos.</p>
              <p><b>Art. 3. Freidora:</b> en una casilla pegada a la <b>pared del fondo</b> y <b>contigua al obrador</b> (por un lado, no en diagonal).</p>
              <p><b>Art. 4. Extintor:</b> contiguo a la freidora (por un lado).</p>
              <p><b>Art. 5. Evacuación:</b> todas las casillas de la <b>columna de la puerta</b>, desde la puerta hasta la pared del fondo, deben quedar libres.</p>
              <p><b>Art. 6. Mesas:</b> ninguna mesa puede ser contigua (por un lado) a otra mesa, a la freidora ni al extintor.</p>
              <p><b>Art. 7.</b> En el obrador y en el aseo no se pone nada. Ni la imaginación.</p>`);
          } },
        { id: 'fiscal', x: 52, y: 18, sign: 'ORDENANZA FISCAL', sub: '💶', w: 14, label: 'Ordenanza fiscal',
          look(g) {
            g.doc('💶 Ordenanza fiscal: tasa por licencia de actividad', `<p>Cuota: <b>2 € por cada m² de superficie TOTAL</b> del local.</p>
              <p>Más <b>25 €</b> de tasa por la tramitación de la tasa.</p>
              <p class="small">Se abona en la Caja municipal, en efectivo, sin decimales y con cara de agradecimiento.</p>`);
          } },
        { id: 'plazo', x: 70, y: 14, emoji: '🗓️', s: 5, label: 'Cartel de plazos',
          look(g) { g.say('«Plazo máximo de resolución: 3 meses. Transcurrido el plazo sin respuesta, se entenderá DESESTIMADA. Que tenga un buen día.»'); } },
        { id: 'caja', x: 90, y: 32, sign: 'CAJA', sub: '💶', w: 10, label: 'Caja municipal',
          look(g) {
            if (g.has('justificanteTasa') || g.flag('tasaOK')) return g.say('—Ya ha pagado. Si quiere pagar otra vez, no se lo voy a impedir.', 'Caja');
            g.input({
              title: '💶 Caja municipal — Tasa por licencia', text: '—¿Cuánto viene a pagar? Dígame el importe exacto de la tasa, en euros.',
              numeric: true, maxLen: 4,
              check: (v) => v === '133',
              failText: (v) => (+v === 108 ? '—Le falta la tasa por tramitar la tasa.' : +v === 106 || +v === 81 ? '—La tasa va por la superficie TOTAL del local.' : '—Ese importe no sale de la ordenanza fiscal. Y yo no doy cambio.'),
              ok: () => { g.give('justificanteTasa'); g.say('—133 €. Aquí tiene el justificante. No lo pierda o tendrá que pagar la tasa por duplicado del justificante.', 'Caja'); },
            });
          } },
        { id: 'tecnico', x: 70, y: 46, emoji: '👷', s: 8, label: 'Técnico municipal',
          look: l5Tecnico,
          use: {
            planoFirmado: (g) => l5Entrega(g, 'planoFirmado'),
            justificanteTasa: (g) => l5Entrega(g, 'justificanteTasa'),
            plano(g) { g.say('—Este plano no tiene la distribución. ¿Dónde va la freidora? ¿Y las mesas? Hágalo en la mesa de dibujo.', 'Técnico municipal'); },
          } },
        { id: 'arquitecta', x: 14, y: 60, emoji: '👷‍♀️', s: 7, label: 'Tu arquitecta',
          look(g) {
            if (!g.flag('plano')) {
              g.set('plano');
              g.say('—Aquí tiene el plano del local, con medidas. La distribución la hace usted, que yo cobro aparte por pensar. Le he facturado como si fuera una catedral: tiene bóveda. La campana extractora.', 'Arquitecta');
              g.give('plano');
            } else g.say('—Recuerde: el pasillo de la puerta, libre. Los técnicos se ponen muy tontos con eso. Y con razón.', 'Arquitecta');
          } },
        { id: 'mesaDibujo', x: 36, y: 63, emoji: '📐', s: 6, label: 'Mesa de dibujo',
          look(g) { g.say('Una mesa de dibujo con escuadra, cartabón y un compás que alguien ha usado para pinchar el corcho. Selecciona el plano y úsalo aquí.'); },
          use: {
            plano: l5Grid,
            planoFirmado(g) { g.say('El plano ya está firmado. Si lo tocas más, el técnico lo notará. Siempre lo notan.'); },
          } },
        { id: 'vecino', x: 54, y: 82, emoji: '😠', s: 6, label: 'Vecino del primero',
          look(g) { g.say('—Vengo a presentar alegaciones contra su churrería. Por el olor. ¿Que todavía no ha abierto? Ya, pero me lo imagino.', 'Vecino'); } },
        { id: 'planta', x: 94, y: 82, emoji: '🪴', s: 5, label: 'Planta',
          look(g) { g.say('Esta planta tiene licencia de actividad clasificada: hace la fotosíntesis. Tardaron dos años en concedérsela.'); } },
      ],
      hints: [
        'La arquitecta tiene tu plano con medidas. Lee la ordenanza de actividades (reglas del plano y aforo) y la ordenanza fiscal (tasa).',
        'Superficie total 9 × 6 = 54 m²; la de público es lo que queda tras quitar obrador y aseo. Aforo: 1 persona por cada 2 m², hacia abajo; mesas = aforo ÷ 4. En el plano: la freidora solo cabe en un sitio, y el extintor también. La tasa se paga en Caja.',
        'Tasa: 54 × 2 + 25 = 133. Aforo: (54 − 9 − 4,5) ÷ 2 = 20 → 5 mesas. Plano (fila, columna; fila 1 = fondo): freidora (1,3), extintor (2,3), mesas en (2,5), (3,2), (3,6), (4,1) y (4,3); la columna 4 libre. Entrega plano y justificante al técnico y dile el aforo: 20.',
      ],
    },

    // ------------------------------------------------------ 6
    {
      title: 'La primera factura',
      place: 'Churrería «Porras del Trámite» — Día de la inauguración',
      stars: 4,
      intro: '¡Inauguración! La churrería huele a aceite nuevo y a deudas. Tu primera clienta, doña Ramona, quiere <b>factura completa</b> a nombre de su empresa.<br><br>El TPV es «Verifactu»: cada factura se encadena con la anterior mediante una <b>huella</b>, se envía a Hacienda y no se puede borrar. Nunca. Ni llorando.<br><br><b>Objetivo:</b> emite una factura correcta y entrégasela a doña Ramona.',
      outro: 'Doña Ramona se marcha con su factura y su taza. Han pasado tres meses de churros, chocolate y tiques. Ahora llega el primer trimestre: el modelo 303 del IVA. El IVA que cobraste... no era tuyo.',
      scene: { wall: '#f1e3c6', floor: '#a0764f', floorH: 30, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 26, t: 58, w: 46, h: 9 },
        { kind: 'shelf', l: 64, t: 32, w: 16, h: 2 },
        { kind: 'window', l: 84, t: 8, w: 12, h: 24 },
        { emoji: '🍩', x: 60, y: 56, s: 3, o: 0.9 }, { emoji: '🥤', x: 40, y: 56, s: 3, o: 0.9 },
        { emoji: '🪑', x: 92, y: 88, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'pizarra', x: 18, y: 18, sign: 'PRECIOS (IVA incl.)', sub: '🖍️', w: 15, label: 'Pizarra de precios',
          look(g) {
            g.doc('🖍️ Pizarra de precios (IVA incluido)', `<table class="tbl">
              <tr><td>Chocolate con churros (en mesa)</td><td>5,50 €</td></tr>
              <tr><td>Docena de churros para llevar</td><td>4,40 €</td></tr>
              <tr><td>Porra suelta</td><td>1,10 €</td></tr>
              <tr><td>Café</td><td>1,65 €</td></tr>
              <tr><td>Taza de recuerdo «Porras del Trámite»</td><td>12,10 €</td></tr></table>
              <p class="small">Todos los precios llevan el IVA incluido, como manda la ley y el sentido común.</p>`);
          } },
        { id: 'normas', x: 42, y: 18, sign: 'NORMAS VERIFACTU', sub: '🔗', w: 15, label: 'Normas de facturación',
          look(g) {
            g.doc('🔗 Normas de facturación (Verifactu, versión de la casa)', `<ul>
              <li><b>Factura completa</b> (con NIF del cliente): <b>serie A</b>. Tique o factura simplificada: serie T.</li>
              <li>Número: <b>SERIE-AÑO-NÚMERO</b> de 4 cifras, <b>correlativo dentro de cada serie</b>, sin saltos. Ejemplo: X-2027-0007.</li>
              <li>Tipos de IVA: hostelería y alimentación, <b>10 %</b>; objetos y recuerdos, <b>21 %</b>.</li>
              <li>Los precios de la pizarra llevan el IVA incluido: <b>base = precio ÷ (1 + tipo)</b>.</li>
              <li><b>Huella</b> = huella de la última factura de la <b>MISMA serie</b> + total de la nueva factura <b>en céntimos</b>. Quédese con las <b>4 últimas cifras</b>.</li>
              <li>Una factura registrada en Verifactu <b>no se puede borrar</b>. Ni la de prueba.</li></ul>`);
          } },
        { id: 'tazas', x: 72, y: 27, emoji: '☕', s: 4, label: 'Estantería de tazas de recuerdo',
          look(g) { g.say('Tazas «Porras del Trámite», con un sello de registro de entrada dibujado. 12,10 € cada una. Tu cuñado ya se ha llevado tres «para promoción».'); } },
        { id: 'lucia', x: 20, y: 51, emoji: '👩‍🍳', s: 7, label: 'Lucía, la churrera',
          look(g) {
            g.say(rand([
              '—Yo frío, tú facturas. Así nos repartimos el sufrimiento.',
              '—Jefe, la masa está lista. Lo que no sé es si el TPV lo está.',
              '—Ayer hiciste una factura de prueba de un céntimo. Ya no se puede borrar. Está ahí, en Hacienda, para la eternidad.',
            ]), 'Lucía');
          } },
        { id: 'freidora', x: 32, y: 50, emoji: '🍳', s: 5, label: 'Freidora',
          look(g) { g.say('La freidora burbujea. Es lo único de este negocio que funciona sin certificado digital.'); } },
        { id: 'tpv', x: 50, y: 51, emoji: '🖥️', s: 6, label: 'TPV con Verifactu',
          look: l6Tpv },
        { id: 'ramona', x: 80, y: 62, emoji: '💁‍♀️', s: 8, label: 'Doña Ramona, primera clienta',
          look(g) {
            if (!g.flag('ramona')) {
              g.set('ramona');
              g.say('—Buenos días. Quiero <b>dos chocolates con churros, para tomar aquí</b>, y <b>una taza de recuerdo</b>. Y factura COMPLETA, a nombre de mi empresa, que yo lo desgravo todo. Tome mi tarjeta.', 'Doña Ramona');
              g.give('tarjetaRamona');
              return;
            }
            g.say('—Dos chocolates con churros en mesa y una taza. Factura completa, con mi NIF. Y date prisa, que se me enfría el chocolate y tengo un bautizo.', 'Doña Ramona');
          },
          use: {
            facturaRamona(g) {
              g.take('facturaRamona');
              g.say('—Factura A-2027-0002. NIF correcto, IVA desglosado, huella... Perfecta. Eres el primer comercio del barrio que me da una factura bien a la primera. Volveré. Con el bautizo entero.', 'Doña Ramona');
              g.win();
            },
            tarjetaRamona(g) { g.say('—Quédatela, que la necesitas para la factura. Yo tengo cuatrocientas.', 'Doña Ramona'); },
          } },
        { id: 'papelera', x: 10, y: 84, emoji: '🗑️', s: 5, label: 'Papelera',
          look(g) {
            g.doc('🗑️ Papeles en la papelera', `<div class="paper-note"><p><b>Tique T-2027-0005</b> — 1 café — 1,65 €<br>Huella: <b>3310</b></p></div><br>
              <div class="paper-note"><p><b>Factura A-2027-0001</b> — «PRUEBA PRUEBA, NO VALE» — 0,01 €<br>Huella: <b>8947</b><br><i>Registrada en Verifactu. No se puede anular. Ya lo has intentado.</i></p></div>
              <p class="small">Los tiques T-0001 a T-0004 se los ha llevado tu cuñado «para la contabilidad». No sabes qué contabilidad.</p>`);
          } },
        { id: 'cunado', x: 40, y: 82, emoji: '🙋‍♂️', s: 6, label: 'Tu cuñado',
          look(g) {
            g.say(rand([
              '—Te instalo el «TPV Cuñadísimo»: hace facturas sin IVA. ¿Que es ilegal? Hombre, ilegal, ilegal... es creativo.',
              '—¿Huella? Yo de huellas sé mucho: dejo las mías en todas las tazas.',
              '—Ponle la serie T, que es de «Todo». ¿Cómo que no? Bueno, tú verás.',
            ]), 'Tu cuñado');
          } },
        { id: 'cola', x: 62, y: 84, emoji: '🧍‍♂️🧍‍♀️', s: 4, label: 'Cola de clientes',
          look(g) {
            g.say(rand([
              '—¿Tarda mucho la factura? Es que yo solo quería una porra.',
              '—En mis tiempos, la factura era una servilleta con una cifra. Y había menos problemas. Y menos hospitales.',
            ]), 'Alguien de la cola');
          } },
      ],
      hints: [
        'Habla con doña Ramona: te dirá qué quiere y te dará su tarjeta. Lee la pizarra y las normas de Verifactu. En la papelera hay una factura y un tique de prueba.',
        'Factura completa = serie A; la última de esa serie es la A-2027-0001. Los precios llevan IVA: divide entre 1,10 o 1,21. La huella se encadena con la de la última factura de la MISMA serie (no con el tique).',
        'Nº A-2027-0002, NIF B12345674, base 20,00 (10 + 10), IVA 3,10 (1,00 + 2,10), total 23,10, huella 8947 + 2310 = 11257 → 1257. Entrega la factura a doña Ramona.',
      ],
    },

    // ------------------------------------------------------ 7
    {
      title: 'El 303',
      place: 'Trastienda de la churrería — Domingo por la noche',
      stars: 4,
      intro: 'Es domingo, 18 de abril de 2027. Toca presentar el <b>modelo 303</b>: el IVA del primer trimestre. Tu gestor está de vacaciones. Claro.<br><br>Hay que sumar el IVA que cobraste, restar el que pagaste (solo el que se puede) y pagar la diferencia... de la forma correcta y en plazo.<br><br><b>Objetivo:</b> presenta el 303 correctamente.',
      outro: '303 presentado. El lunes, por fin, duermes. El martes llama a la puerta una inspectora de Trabajo: «Venimos por una denuncia anónima sobre el horario de su churrera». La denuncia la firma «Vecina del 2.º».',
      scene: { wall: '#d6cbb5', floor: '#6b5a48', floorH: 32, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 36, t: 58, w: 30, h: 8 },
        { kind: 'shelf', l: 5, t: 62, w: 15, h: 2 },
        { kind: 'box', l: 84, t: 70, w: 10, h: 12, color: '#8b6b47' },
        { emoji: '🛢️', x: 92, y: 60, s: 5, o: 0.85 },
        { emoji: '🪑', x: 51, y: 80, s: 5, o: 0.85 },
      ],
      hotspots: [
        { id: 'instrucciones', x: 22, y: 18, sign: 'INSTRUCCIONES DEL 303', sub: '📘', w: 16, label: 'Instrucciones del modelo 303',
          look(g) {
            g.doc('📘 Modelo 303 — Instrucciones (simplificadas para este juego)', `<p><b>Casilla 27 · IVA devengado:</b> el IVA de todas las facturas y tiques <b>emitidos</b> en el trimestre, a cada tipo. Las facturas <b>rectificativas restan</b>.</p>
              <p><b>Casilla 45 · IVA deducible:</b> solo el IVA de facturas <b>recibidas</b> que cumplan TODO:</p>
              <ol><li>Factura completa <b>a nombre de su NIF</b> (los tiques no valen).</li><li>Gasto <b>afecto a la actividad</b> (nada personal ni familiar).</li><li>Fecha <b>dentro del trimestre</b> (1 de enero – 31 de marzo).</li></ol>
              <p><b>Casilla 71 · Resultado</b> = casilla 27 − casilla 45.</p>
              <p><b>Plazo:</b> del 1 al 20 de abril. <b>Domiciliación:</b> solo hasta el día 15. Después del 15: pague primero en su banco, que le dará un <b>NRC</b>, y presente la declaración con ese NRC.</p>`);
          } },
        { id: 'cuadro', x: 42, y: 18, emoji: '🖼️', s: 5, label: 'Cuadro',
          look(g) { g.say('Tu primer euro, enmarcado. Bueno, el marco. El euro te lo llevaste para pagar el IVA del primer día.'); } },
        { id: 'calendario', x: 58, y: 16, emoji: '📅', s: 5, label: 'Calendario',
          look(g) { g.say('Domingo, 18 de abril de 2027. Alguien (tú) ha escrito en el día 15: «domiciliar el 303». Y lo ha tachado. Y ha escrito «mañana». Y lo ha vuelto a tachar.'); } },
        { id: 'gestor', x: 86, y: 40, emoji: '☎️', s: 5, label: 'Teléfono del gestor',
          look(g) { g.say('Contestador: «Hola, soy tu gestor. Estoy de vacaciones hasta el 21 de abril. Si es por el 303... ánimo».'); } },
        { id: 'libroEmitidas', x: 12, y: 55, emoji: '📒', s: 6, label: 'Libro de facturas emitidas',
          look(g) {
            g.doc('📒 Libro registro de facturas emitidas — 1T 2027', `<table class="tbl">
              <tr><td>Tiques serie T, enero · base al 10 %</td><td>1.200,00 €</td></tr>
              <tr><td>Tiques serie T, febrero · base al 10 %</td><td>1.400,00 €</td></tr>
              <tr><td>Tiques serie T, marzo · base al 10 %</td><td>1.690,00 €</td></tr>
              <tr><td>Tiques serie T, marzo · tazas de recuerdo, base al 21 %</td><td>290,00 €</td></tr>
              <tr><td>Factura A-2027-0002 (doña Ramona) · base al 10 %</td><td>10,00 €</td></tr>
              <tr><td>Factura A-2027-0002 (doña Ramona) · base al 21 %</td><td>10,00 €</td></tr>
              <tr><td>Rectificativa R-2027-0001 (churros devueltos «por fríos») · base al 10 %</td><td>−100,00 €</td></tr></table>
              <p class="small">Los totales no están hechos. Para eso estás tú, un domingo por la noche.</p>`);
          } },
        { id: 'ordenador', x: 50, y: 51, emoji: '💻', s: 7, label: 'Ordenador (Sede de la AEAT)',
          look: l7Form },
        { id: 'movil', x: 62, y: 54, emoji: '📱', s: 4, label: 'Banca móvil',
          look(g) {
            if (g.has('nrc')) return g.say('Ya pagaste. El NRC está en tu inventario. El dinero, en Hacienda.', 'Banca móvil');
            g.input({
              title: '📱 Banca móvil — Pago de impuestos (modelo 303)',
              text: 'Importe a pagar a la Agencia Tributaria, en euros (sin decimales). El banco le dará un NRC.',
              numeric: true, maxLen: 5,
              check: (v) => v === '128',
              failText: (v) => (+v === 483 ? 'Eso es el IVA que cobraste. Falta restar el que pagaste y puedes deducir.' : 'Antes de pagar, asegúrate: si pagas de más, la devolución tarda; si pagas de menos, el recargo no.'),
              ok: () => { g.give('nrc'); g.say('Pago de 128 € realizado. El banco te da un NRC de 22 caracteres. Y un mensaje: «¿Le interesa un préstamo para pagar sus impuestos?».', 'Banca móvil'); },
            });
          } },
        { id: 'cajaZapatos', x: 28, y: 80, emoji: '📦', s: 7, label: 'Caja de zapatos de facturas',
          look(g) {
            if (g.flag('libroOK')) return g.say('La caja de zapatos guarda ahora solo lo que no se puede deducir. Es como un museo de errores.');
            l7Caja(g);
          } },
        { id: 'gato', x: 52, y: 85, emoji: '🐈', s: 5, label: 'Gato de la churrería',
          look(g) { g.say('El gato duerme sobre las facturas de 2026. No es deducible, pero desgrava el estrés.'); } },
        { id: 'lucia', x: 74, y: 80, emoji: '👩‍🍳', s: 7, label: 'Lucía',
          look(g) { g.say('—Jefe, me voy. Mañana entro a las seis. Bueno, a las cinco y media, que hay que hacer la masa. Pero tú pon las seis, como siempre.', 'Lucía'); } },
      ],
      hints: [
        'Necesitas tres números: IVA repercutido (libro de emitidas), IVA deducible (caja de zapatos) y el resultado. Lee las instrucciones del 303 y mira el calendario.',
        'La rectificativa resta. De la caja de zapatos solo valen facturas completas, del negocio y del trimestre (son 4). Hoy es 18: ya no se puede domiciliar; paga antes con el móvil para obtener el NRC.',
        'Repercutido: 4.200 × 10 % + 300 × 21 % = 483. Deducible: harina 32 + aceite 50 + freidora 210 + luz de marzo 63 = 355. Resultado: 128. Móvil: pagar 128 → NRC. Ordenador: 483, 355, 128 e «Ingreso con NRC».',
      ],
    },

    // ------------------------------------------------------ 8
    {
      title: 'El registro horario',
      place: 'Churrería «Porras del Trámite» — Inspección de Trabajo',
      stars: 4,
      intro: 'Una <b>inspectora de Trabajo</b> revisa el horario de Lucía, tu churrera, la semana del 10 al 14 de mayo. Tu registro en papel dice «6:00 a 12:00» todos los días. Demasiado bonito.<br><br>La fichadora, la cámara, la caja registradora y el convenio cuentan otra historia. Y no coincide.<br><br><b>Objetivo:</b> calcula las horas extraordinarias reales de Lucía y regulariza la situación.',
      outro: 'Acta de la Inspección: «La empresa regulariza de forma voluntaria». Lucía cobra sus horas extra y te invita a un chocolate. Tú, con tu cuenta en números rojos, descubres que existe un «Kit Digital» que te paga la web. Bueno: «paga».',
      scene: { wall: '#efe3cf', floor: '#9a7b58', floorH: 32, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 30, t: 58, w: 44, h: 9 },
        { kind: 'window', l: 72, t: 8, w: 12, h: 24 },
        { emoji: '🍳', x: 46, y: 55, s: 3, o: 0.9 },
        { emoji: '🪑', x: 44, y: 86, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'convenio', x: 20, y: 18, sign: 'CONVENIO DE CHURRERÍAS', sub: '📕', w: 17, label: 'Convenio colectivo',
          look(g) {
            g.doc('📕 Convenio colectivo de churrerías, buñolerías y afines', `<p><b>Art. 12. Limpieza:</b> tras el último cobro del día, la persona que cierra dedica <b>15 minutos</b> a limpiar la freidora. Ese tiempo es tiempo de trabajo.</p>
              <p><b>Art. 13. Tiempo efectivo:</b> desde la entrada hasta la salida. El bocadillo cuenta: en esta casa no se para.</p>
              <p><b>Art. 14.</b> El chocolate sobrante no computa como salario en especie. Por mucho que insista la empresa.</p>`);
          } },
        { id: 'horario', x: 44, y: 18, sign: 'HORARIO', sub: 'De 7:00 a 12:00', w: 11, label: 'Horario de apertura al público',
          look(g) { g.say('«Horario de apertura al público: de 7:00 a 12:00». Es el horario de los clientes. El de los churros empieza antes.'); } },
        { id: 'camara', x: 88, y: 12, emoji: '📹', s: 4, label: 'Cámara de la puerta',
          look(g) {
            g.doc('📹 Grabaciones de la cámara de la puerta (semana del 10 al 14 de mayo)', `<table class="tbl">
              <tr><td><b>Lunes 10</b>: 5:58 entra Lucía · 12:01 sale Lucía</td><td></td></tr>
              <tr><td><b>Martes 11</b>: 5:29 entra Lucía · 12:00 sale Lucía</td><td></td></tr>
              <tr><td><b>Miércoles 12</b>: 5:52 entra un gato (no es empleado) · <b>6:00 entra Lucía</b> · 6:20 entra el jefe (tú)</td><td></td></tr>
              <tr><td><b>Jueves 13</b>: <b>5:45 entra Lucía</b> · 6:10 entra el jefe (tú)</td><td></td></tr>
              <tr><td><b>Viernes 14</b>: 5:59 entra Lucía · 13:00 sale Lucía</td><td></td></tr></table>
              <p class="small">Miércoles y jueves, a partir de las 11:00, la lente estuvo tapada con un cucurucho de churros. Nadie sabe quién fue. (Fue el gato.)</p>`);
          } },
        { id: 'fichadora', x: 62, y: 30, emoji: '📟', s: 5, label: 'Fichadora de huella dactilar',
          look(g) {
            g.doc('📟 Registro de la fichadora — Lucía', `<table class="tbl">
              <tr><td>Lunes 10</td><td>6:00 – 12:00</td></tr>
              <tr><td>Martes 11</td><td>5:30 – 12:00</td></tr>
              <tr><td>Miércoles 12</td><td>ERROR: dedo enharinado</td></tr>
              <tr><td>Jueves 13</td><td>ERROR: dedo enharinado</td></tr>
              <tr><td>Viernes 14</td><td>6:00 – 13:00</td></tr></table>
              <p class="small">Fichadora homologada. Lo que no está homologado es la harina.</p>`);
          } },
        { id: 'archivador', x: 10, y: 56, emoji: '🗄️', s: 8, label: 'Archivador de personal',
          look(g) {
            if (!g.flag('arch')) {
              g.set('arch');
              g.say('En la carpeta «PERSONAL» (una sola persona) están el contrato de Lucía y tu registro horario en papel, rellenado con un boli de cuatro colores.');
              g.give('contratoLucia'); g.give('registroPapel');
            } else g.say('Solo quedan las nóminas. Te dan menos miedo que el registro horario. Un poco menos.');
          } },
        { id: 'caja', x: 36, y: 54, emoji: '🧾', s: 5, label: 'Caja registradora',
          look(g) {
            g.doc('🧾 Memoria de la caja: últimos tiques del día', `<p class="small">La caja solo conserva miércoles y jueves (los demás días se borraron al cambiar el rollo).</p>
              <table class="tbl">
              <tr><td><b>Miércoles 12</b> · 11:58 · cobra: Lucía</td><td>2 porras</td></tr>
              <tr><td><b>Miércoles 12</b> · 12:15 · cobra: <b>Lucía</b></td><td>1 docena</td></tr>
              <tr><td><b>Miércoles 12</b> · 12:50 · cobra: Jefe</td><td>1 café</td></tr>
              <tr><td><b>Jueves 13</b> · 11:45 · cobra: <b>Lucía</b></td><td>1 chocolate</td></tr>
              <tr><td><b>Jueves 13</b> · 12:30 · cobra: Jefe</td><td>3 cafés</td></tr>
              <tr><td><b>Jueves 13</b> · 13:30 · cobra: Jefe</td><td>1 taza de recuerdo</td></tr></table>`);
          } },
        { id: 'inspectora', x: 64, y: 50, emoji: '🕵️‍♀️', s: 8, label: 'Inspectora de Trabajo',
          look(g) {
            if (!g.flag('req')) {
              g.set('req');
              g.say('—Buenos días. Inspección de Trabajo. Su registro en papel es precioso, pero no me lo creo. Tenga el requerimiento: ahí le explico qué prueba vale cada día. Cuando lo tenga, me dice las horas extra de Lucía. En minutos.', 'Inspectora');
              g.give('requerimientoITSS');
              return;
            }
            g.input({
              title: '🕵️‍♀️ Inspección de Trabajo', text: '—Total de horas extraordinarias de Lucía esa semana, <b>en minutos</b>.',
              numeric: true, maxLen: 4,
              check: (v) => v === '135',
              failText: (v) => ({
                0: '—¿Cero? Según el registro en papel, sí. Pero ese registro lo rellenó usted.',
                1935: '—Le he pedido las EXTRA, no el total.',
                105: '—Casi. ¿Ha leído el convenio? La freidora no se limpia sola.',
              })[+v] || '—No me cuadra. Revise cada día con los criterios del requerimiento: qué prueba vale y cuál no.',
              ok: () => {
                g.choice({
                  title: '🕵️‍♀️ Regularización', text: '—135 minutos. Dos horas y cuarto de más. ¿Y qué piensa hacer al respecto?',
                  options: [
                    { label: 'Ofrecer a la inspectora un chocolate con churros', onPick(g2, msg) { msg('—Eso, en mi informe, tiene otro nombre. Y no es «desayuno».', true); return false; } },
                    { label: 'Alegar que Lucía hace horas extra «por amor al churro»', onPick(g2, msg) { msg('—El amor no se paga en horas extra. Bueno, sí: se paga. Usted.', true); return false; } },
                    { label: 'Decir que Lucía es becaria', onPick(g2, msg) { msg('—¿Una becaria de 52 años con treinta de experiencia friendo? Siguiente intento.', true); return false; } },
                    { label: 'Pagar a Lucía las horas extra y corregir el registro horario', onPick() {
                      g.say('—Regularización voluntaria. Así da gusto. Le levanto acta sin sanción. Y, ya que insiste... un churro sí me tomo. Pagando.', 'Inspectora');
                      g.win();
                    } },
                  ],
                });
              },
            });
          },
          use: {
            registroPapel(g) { g.say('—Ese registro lo ha rellenado usted. Con boli de cuatro colores. No vale como prueba. Mire los criterios del requerimiento.', 'Inspectora'); },
          } },
        { id: 'lucia', x: 26, y: 78, emoji: '👩‍🍳', s: 7, label: 'Lucía',
          look(g) {
            g.say(rand([
              '—Yo ficho, jefe. Pero con la harina la máquina no me reconoce. A las seis de la mañana no me reconoce ni mi madre.',
              '—El miércoles me quedé a cobrar a los del autobús. El jueves no: el jueves te quedaste tú, que querías «aprender caja».',
              '—Yo la masa la empiezo antes de las seis, que si no, no da tiempo. Eso lo sabe hasta el gato.',
            ]), 'Lucía');
          } },
        { id: 'vecina', x: 86, y: 76, emoji: '👵', s: 7, label: 'Vecina del 2.º',
          look(g) { g.say('—Yo lo vi todo: el jueves la persiana se subió a las siete. ¿Que si vi entrar a la chica? No, eso no. Pero la persiana, a las siete. Apúntelo, inspectora, apúntelo.', 'Vecina del 2.º'); } },
        { id: 'gato', x: 52, y: 86, emoji: '🐈', s: 4, label: 'Gato',
          look(g) { g.say('El gato te mira con la tranquilidad de quien entra a trabajar a las 5:52 y no ficha.'); } },
      ],
      hints: [
        'Habla con la inspectora: el requerimiento explica qué prueba vale cada día. El registro en papel no sirve. Reúne el contrato (archivador), la fichadora, la cámara, la caja y el convenio.',
        'Lunes, martes y viernes: manda la fichadora (aunque la cámara diga otra cosa). Miércoles y jueves: entrada por la cámara; salida, último tique cobrado POR LUCÍA + 15 minutos de limpieza (convenio). La vecina no es prueba.',
        'L 6:00–12:00 (360), M 5:30–12:00 (390), X 6:00–12:30 (390), J 5:45–12:00 (375), V 6:00–13:00 (420) = 1.935 min; menos 1.800 de jornada = 135. Después, elige pagar las horas y corregir el registro.',
      ],
    },

    // ------------------------------------------------------ 9
    {
      title: 'El Kit Digital',
      place: 'Churrería «Porras del Trámite» — Por la tarde, con la persiana bajada',
      stars: 5,
      intro: 'Te concedieron el <b>Kit Digital</b>: 2.000 € para la web de la churrería. Un agente digitalizador ya la ha hecho. Solo falta <b>justificar</b> la ayuda... hoy, que acaba el plazo.<br><br>Logotipos obligatorios, justificantes de pago, declaraciones responsables. Y una cuenta bancaria que no está para muchas alegrías: la ayuda llega <i>después</i> de haber pagado.<br><br><b>Objetivo:</b> presenta la justificación completa en el portal.',
      outro: 'Justificación presentada. Tu web luce cuatro logos institucionales y una foto de una porra. Han pasado meses. Es marzo de 2028 y un sobre certificado anuncia la última prueba: <b>inspección de Hacienda</b> del ejercicio 2027.',
      scene: { wall: '#dbe3e6', floor: '#a0764f', floorH: 30, pattern: 'wood' },
      decor: [
        { kind: 'window', l: 72, t: 8, w: 20, h: 30 },
        { kind: 'counter', l: 34, t: 58, w: 34, h: 8 },
        { kind: 'shelf', l: 4, t: 36, w: 14, h: 2 },
        { emoji: '📗', x: 14, y: 32, s: 3, o: 0.9 },
        { emoji: '🪑', x: 84, y: 86, s: 4, o: 0.8 },
      ],
      init(g) { g.set('saldo', 312); },
      hotspots: [
        { id: 'bases', x: 26, y: 16, sign: 'BASES DEL KIT DIGITAL', sub: '📜', w: 17, label: 'Bases de la convocatoria',
          look(g) {
            g.doc('📜 Bases del Kit Digital (resumen para supervivientes)', `<p>Para justificar la ayuda, presente en el portal:</p>
              <ol><li><b>Captura de la web</b> con los logotipos que exige el <b>Manual de publicidad</b>.</li>
              <li><b>Factura</b> del agente digitalizador.</li>
              <li><b>Justificante bancario</b> del pago que le corresponde a usted.</li>
              <li><b>Declaración de ayudas <i>de minimis</i></b>.</li></ol>
              <p><b>Pago:</b> el bono cubre la <b>base imponible</b> de la factura y se abona directamente al agente digitalizador. El beneficiario solo paga el <b>IVA</b>, por transferencia bancaria. En efectivo, no.</p>
              <p><b>De minimis:</b> declare el total de <b>ayudas públicas</b> recibidas en <b>2025, 2026 y 2027</b>. Los premios de entidades privadas no son ayudas públicas.</p>`);
          } },
        { id: 'calendario', x: 50, y: 14, emoji: '📅', s: 5, label: 'Calendario',
          look(g) { g.say('Hoy termina el plazo de justificación. A las 23:59, cómo no. El portal suele caerse a las 23:00, por tradición.'); } },
        { id: 'cajero', x: 82, y: 24, emoji: '🏧', s: 6, label: 'Cajero automático (acera de enfrente)',
          look(g) { g.say('El cajero de tu banco, en la acera de enfrente. Admite ingresos en efectivo. Para sacar dinero, cobra comisión; para meterlo, de momento no.'); },
          use: {
            efectivo(g) {
              g.take('efectivo'); g.set('saldo', g.flag('saldo') + 150);
              g.say(`Cruzas la calle con la recaudación y la ingresas en el cajero. Nuevo saldo: ${g.flag('saldo')} €. El cajero te da las gracias. Es lo único que te las da hoy.`, 'Cajero');
            },
          } },
        { id: 'manual', x: 9, y: 30, emoji: '📘', s: 5, label: 'Manual de publicidad (88 páginas)',
          look(g) {
            g.doc('📘 Manual de publicidad de las ayudas (extracto de la página 61)', `<p>El pie de la web del beneficiario mostrará <b>exactamente</b> estos logotipos, ni uno más ni uno menos:</p>
              <ul><li>El emblema de la Unión Europea <b>con el texto</b> «Financiado por la Unión Europea – NextGenerationEU». <b>Nunca la bandera sola</b>.</li>
              <li>El logotipo del «Plan de Recuperación, Transformación y Resiliencia».</li>
              <li>El logotipo del «Gobierno de España».</li>
              <li>El logotipo del programa: «Kit Digital».</li></ul>
              <p class="small">Cualquier otro logotipo (de su cuñado, de su abuela o de sus sentimientos) invalida la justificación.</p>`);
          } },
        { id: 'portatil', x: 48, y: 52, emoji: '💻', s: 7, label: 'Portátil',
          look(g) {
            g.choice({
              title: '💻 Portátil', text: 'El portátil arranca con tres actualizaciones pendientes y un antivirus caducado. ¿Qué abres?',
              options: [
                { label: '🌐 Editor de la web (porrasdeltramite.es)', onPick(g2, msg) { if (g.flag('webOK')) { msg('La web ya está publicada con sus logos. La captura, hecha.'); return false; } l9Web(g); return false; } },
                { label: '🏦 Banca online', onPick() { l9Banca(g); return false; } },
                { label: '📤 Portal de justificación', onPick() { l9Portal(g); return false; } },
              ],
            });
          } },
        { id: 'caja', x: 62, y: 52, emoji: '💰', s: 5, label: 'Caja registradora',
          look(g) {
            if (!g.flag('cash')) {
              g.set('cash');
              g.say('La recaudación de hoy: 150 € en billetes y monedas que huelen a churro. Te los llevas.');
              g.give('efectivo');
            } else g.say('Vacía. Como tus fines de semana.');
          } },
        { id: 'buzon', x: 92, y: 62, emoji: '📬', s: 6, label: 'Buzón',
          look(g) {
            if (!g.flag('mail')) {
              g.set('mail');
              g.say('Entre publicidad de academias de oposiciones, una carta de DIGITALIZA-TE, S.L.: la factura de tu web.');
              g.give('facturaAgente');
            } else g.say('Solo propaganda: «¡Digitalice su negocio! (Si ya lo ha hecho, digitalícelo otra vez)».');
          } },
        { id: 'ayudas', x: 14, y: 80, emoji: '🗃️', s: 6, label: 'Carpeta «Ayudas recibidas»',
          look(g) {
            g.doc('🗃️ Ayudas y premios que has recibido', `<table class="tbl">
              <tr><td>2023 · Subvención autonómica «Emprende Ya» (pública)</td><td>1.000 €</td></tr>
              <tr><td>2025 · Bono Comercio Local del Ayuntamiento (público)</td><td>200 €</td></tr>
              <tr><td>2026 · Ayuda municipal para toldos (pública)</td><td>500 €</td></tr>
              <tr><td>2026 · Premio «Mejor Porra del Barrio», Asociación de Churreros (privada)</td><td>300 €</td></tr>
              <tr><td>2027 · Descuento del 10 % en la ferretería de tu cuñado (un «favor»)</td><td>14 €</td></tr></table>
              <p class="small">El premio de la porra está enmarcado. La ayuda de los toldos, también: el toldo se lo llevó el viento.</p>`);
          } },
        { id: 'cunado', x: 40, y: 82, emoji: '🙋‍♂️', s: 6, label: 'Tu cuñado',
          look(g) {
            g.say(rand([
              '—¿Kit Digital? Yo te hacía la web gratis. En Comic Sans y con musiquita.',
              '—Pon mi logo en la web, «Financiado por tu cuñado». Que se sepa quién está detrás de este negocio.',
              '—¿Que no tienes saldo? Pues paga en efectivo, hombre. ¿Que las bases dicen que no? Las bases, las bases...',
            ]), 'Tu cuñado');
          } },
        { id: 'comercial', x: 66, y: 80, emoji: '🧑‍💻', s: 6, label: 'Comercial del agente digitalizador',
          look(g) { g.say('—La web está lista. Si no la justifica hoy, el bono no llega y nos debe usted los 2.000 €. Sin presión. ¿Un café? Lo pago yo... con su bono.', 'Comercial'); } },
      ],
      hints: [
        'Lee las bases: hacen falta cuatro cosas. Los logos de la web están en el manual; la factura, en el buzón; las ayudas, en la carpeta. Todo se gestiona desde el portátil.',
        'Tú solo pagas el IVA de la factura (21 % de 2.000 €), por transferencia. Con 312 € de saldo no llegas: ingresa la recaudación de la caja en el cajero. Ayudas: solo las públicas de 2025, 2026 y 2027.',
        'Web: UE con texto + Plan de Recuperación + Gobierno de España + Kit Digital. Caja → cajero (saldo 462). Banca: transferir 420. Portal: adjunta captura, factura y justificante; minimis: 200 + 500 = 700. Presenta.',
      ],
    },

    // ------------------------------------------------------ 10
    {
      title: 'La inspección',
      place: 'Delegación de la Agencia Tributaria — Planta −2',
      stars: 5,
      intro: 'Marzo de 2028. Hacienda inspecciona el ejercicio 2027 de <b>Porras del Trámite, S.L.</b> El inspector tiene cuatro comprobaciones, un café frío y ninguna prisa.<br><br>Tus papeles están en un archivador con candado que trajo tu gestor... que no recuerda la clave. Y tu cuñado ha venido «de apoyo». Mal asunto.<br><br><b>Objetivo:</b> supera las comprobaciones, firma el acta y sal con el certificado de estar al corriente.',
      outro: 'Sales de la Delegación con el certificado en la mano y 2.121 € menos en la cuenta. Fuera hace sol. La churrería sigue abierta. Lucía ha hecho porras. Tu cuñado ya tiene «una idea de negocio».',
      scene: { wall: '#bfc5c2', floor: '#6f706a', floorH: 32, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 38, t: 52, w: 32, h: 9 },
        { kind: 'board', l: 74, t: 8, w: 14, h: 22 },
        { kind: 'flag', l: 3, t: 5, w: 5, h: 8 },
        { kind: 'flag-eu', l: 92, t: 6, w: 5, h: 7 },
        { emoji: '☕', x: 62, y: 50, s: 3, o: 0.9 },
        { emoji: '🪑', x: 60, y: 84, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'fluorescente', x: 50, y: 6, emoji: '💡', s: 3, label: 'Fluorescente',
          look(g) { g.say('El fluorescente parpadea en morse. Dice: S-O-S. O eso, o «IVA». Se parecen.'); } },
        { id: 'compensacion', x: 16, y: 20, sign: 'NORMAS DEL IVA', sub: '⚖️', w: 14, label: 'Normas de compensación del IVA',
          look(g) {
            g.doc('⚖️ Compensación de cuotas del IVA (simplificado)', `<ul>
              <li>Si un trimestre sale <b>positivo</b>, se ingresa.</li>
              <li>Si un trimestre sale <b>negativo</b>, no se devuelve: se <b>compensa</b>, restándolo del resultado del trimestre <b>siguiente</b>.</li>
              <li>Si en el <b>cuarto trimestre</b>, después de compensar, el resultado sigue siendo negativo, se pide la <b>devolución</b>. Una devolución no es un ingreso: es una esperanza.</li></ul>`);
          } },
        { id: 'amortizacion', x: 36, y: 20, sign: 'TABLA DE AMORTIZACIÓN', sub: '📉', w: 16, label: 'Tabla de amortización',
          look(g) {
            g.doc('📉 Tabla de coeficientes de amortización (simplificada)', `<table class="tbl">
              <tr><td>Maquinaria de hostelería (freidoras, chocolateras, cafeteras)</td><td>10 % anual</td></tr>
              <tr><td>Mobiliario</td><td>10 % anual</td></tr>
              <tr><td>Equipos informáticos</td><td>25 % anual</td></tr>
              <tr><td>Vehículos</td><td>16 % anual</td></tr></table>
              <p>La amortización se calcula sobre la <b>base imponible</b> (sin IVA) y empieza el día de la <b>puesta en funcionamiento</b>, no el de la compra, por <b>meses completos</b>:</p>
              <p class="big-num">base × coeficiente × meses ÷ 12</p>`);
          } },
        { id: 'sanciones', x: 58, y: 20, sign: 'SANCIONES', sub: '⚠️', w: 12, label: 'Cartel de sanciones',
          look(g) {
            g.doc('⚠️ Régimen sancionador (simplificado)', `<p>Por deducir indebidamente un IVA: se devuelve la <b>cuota</b> entera y se impone una <b>sanción del 50 %</b> de esa cuota.</p>
              <p><b>Reducción por conformidad:</b> si firma el acta en conformidad, la sanción se reduce un <b>30 %</b>.</p>
              <p><b>Reducción por pronto pago:</b> si además paga en plazo y no recurre, se reduce otro <b>25 % de lo que quede</b>.</p>
              <p class="small">La cuota no tiene descuentos. Nunca. Ni en rebajas.</p>`);
          } },
        { id: 'corcho', x: 81, y: 19, emoji: '📌', s: 6, label: 'Corcho del inspector',
          look(g) {
            g.doc('📌 El corcho del inspector (tu expediente)', `<div class="paper-note"><p><b>Copia de tu modelo 036</b> — Causa: alta (111) · Epígrafe IAE: <b>644.6</b> · Domicilio: Calle del Trámite, 12.</p></div><br>
              <div class="paper-note"><p><b>Foto de tu furgoneta</b> «de uso exclusivo para el negocio»: con silla de bebé, una tabla de surf en el techo y una pegatina de «Benidorm 2027».</p></div><br>
              <div class="paper-note"><p>Recorte de periódico: «Detenido un churrero por freír sin licencia». No eres tú. Aún.</p></div>`);
          } },
        { id: 'inspector', x: 54, y: 44, emoji: '🕴️', s: 8, label: 'Inspector de Hacienda',
          look(g) {
            if (!g.flag('reqH')) {
              g.set('reqH');
              g.say('—Siéntese. Inspección del ejercicio 2027. Tome el requerimiento: cuatro comprobaciones. No tengo prisa. Tengo hasta la jubilación. Usted también, si quiere.', 'Inspector de Hacienda');
              g.give('requerimientoAEAT');
              return;
            }
            if (g.has('certificadoAEAT')) return g.say('—Ya tiene su certificado. Puede irse. No me haga cambiar de opinión.', 'Inspector de Hacienda');
            l10Menu(g);
          } },
        { id: 'archivador', x: 12, y: 58, emoji: '🗄️', s: 9, label: 'Archivador con candado',
          look(g) {
            if (g.flag('archOpen')) return g.say('El archivador está abierto y vacío. Lo importante ya lo tienes. Lo demás, mejor que siga cerrado.');
            g.input({
              title: '🔒 Archivador de tu gestor', text: 'Candado de 4 cifras. Pósit de tu gestor: «Clave: el epígrafe del IAE de tu alta, sin el punto. (Yo no me acuerdo. Estaba en tu 036.)»',
              numeric: true, maxLen: 4,
              check: (v) => v === '6446',
              failText: () => 'El candado no se abre. Tu gestor se encoge de hombros con mucha profesionalidad.',
              ok: () => {
                g.set('archOpen');
                g.say('¡Clic! Dentro: la carpeta con los cuatro modelos 303 de 2027, la factura de la chocolatera y el albarán de su instalación.');
                g.give('carpeta303'); g.give('facturaChoco'); g.give('albaran');
              },
            });
          } },
        { id: 'gestor', x: 24, y: 80, emoji: '🧑‍💼', s: 6, label: 'Tu gestor',
          look(g) {
            g.say(rand([
              '—Yo le recomendé deducirlo todo. Ahora le recomiendo no decir que se lo recomendé.',
              '—La clave del archivador... era algo de churros. O de chocolate. Estaba en su alta. Seguro que el inspector la tiene por ahí colgada.',
              '—Tranquilo. En la peor inspección que he llevado, el cliente solo perdió el negocio. Y la casa. Pero ganó experiencia.',
            ]), 'Tu gestor');
          } },
        { id: 'cunado', x: 44, y: 82, emoji: '🙋‍♂️', s: 6, label: 'Tu cuñado («de apoyo»)',
          look(g) {
            g.say('—¿La «asesoría estratégica en porras»? Te dije que pusieras más azúcar. En una boda. Eso son 8.000 euros más IVA, cuñao, que el conocimiento se paga.', 'Tu cuñado');
            g.say('—...Bueno, vale: no hice nada más. Pero lo dije con mucha seguridad. Y te hice la factura, que eso sí que es trabajo.', 'Tu cuñado');
          } },
        { id: 'ficus', x: 76, y: 84, emoji: '🪴', s: 5, label: 'Ficus',
          look(g) { g.say('Un ficus que lleva aquí desde la inspección de 1994. Es lo único que ha salido limpio de esta sala.'); } },
        { id: 'puerta', x: 93, y: 56, emoji: '🚪', s: 12, label: 'Salida',
          look(g) { g.say('Un cartel en la puerta: «Solo pueden salir los contribuyentes al corriente de sus obligaciones». Debajo, a boli: «o sea, nadie».'); },
          use: {
            certificadoAEAT(g) {
              g.say('Enseñas el certificado de estar al corriente. La puerta lo escanea, duda un segundo... y se abre. Al otro lado, la calle, el sol y el olor de tu churrería a tres manzanas.');
              g.win();
            },
          } },
      ],
      hints: [
        'Habla con el inspector: te dará un requerimiento con cuatro comprobaciones. Tus papeles están en el archivador: la clave tiene que ver con tu alta en Hacienda (mira el corcho).',
        'IVA: los trimestres negativos se compensan con el siguiente, y si el 4T sigue negativo se devuelve, no se ingresa. Gastos: la foto de la furgoneta y tu cuñado te dicen mucho. Amortización: desde la puesta en funcionamiento (albarán). Sanción: 50 %, −30 % por conformidad y −25 % de lo que queda por pronto pago.',
        'Archivador: 6446. IVA ingresado: 128 + 205 = 333 (el 4T: 60 − 90 = −30, a devolver). Gastos: cuotas de autónomo, uniforme, curso y seguro. Amortización: 2.400 × 10 % × 3/12 = 60. Acta en conformidad: cuota 1.680 + sanción 840 × 0,7 × 0,75 = 441 → 2121. Usa el certificado en la puerta.',
      ],
    },
  ];

  // =========================================================
  //  ESTILOS PROPIOS
  // =========================================================
  const CSS = `
    .s2-form select, .s2-form input { font: inherit; font-size: 15px; padding: 7px 9px; border: 2px solid rgba(0,0,0,.2); border-radius: 8px; background: #fff; width: 100%; box-sizing: border-box; }
    .s2-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
    @media (max-width: 560px) { .s2-cols { grid-template-columns: 1fr; } }
    .s2-clauses { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; }
    .s2-clause { width: 100%; }
    .s2-seq { font-family: var(--type); min-height: 1.5em; text-align: center; }
    .s2-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px dashed var(--line); font-size: 15px; }
    .s2-okt { color: var(--green); font-weight: 700; font-size: 13px; }
    .s2-grid { display: grid; grid-template-columns: 22px repeat(6, 48px); gap: 4px; justify-content: center; margin: 8px auto; }
    .s2-grid .tile { width: 48px; height: 48px; font-size: 22px; }
    .s2-lbl { display: grid; place-items: center; font-size: 12px; color: var(--ink-soft); font-family: var(--ui); min-height: 22px; }
    .s2-wall { grid-column: 2 / span 6; text-align: center; font-size: 11px; color: var(--ink-soft); font-family: var(--ui); border-bottom: 3px solid var(--ink); }
    .s2-shop { margin: 0 auto 14px; max-width: 360px; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,.25); background: #fff8e8; text-align: center; font-family: var(--type); }
    .s2-awning { height: 26px; background: repeating-linear-gradient(90deg, #c0392b 0 24px, #fff 24px 48px); }
    .s2-shop-name { font-size: 24px; padding: 12px 8px 2px; }
    .s2-shop-sub { font-size: 13px; color: var(--ink-soft); padding-bottom: 8px; }
    .s2-shop-sign { display: inline-block; margin: 0 0 12px; padding: 4px 14px; border: 2px solid #1f5a37; color: #1f5a37; border-radius: 6px; font-weight: 700; }
  `;

  window.registerSeason({
    id: 2,
    title: 'Hazte autónomo',
    subtitle: 'Abrir una churrería. Qué podría salir mal.',
    badge: 'Emprendedor',
    emoji: '💼',
    intro: 'Ya tienes DNI. Ahora quieres abrir una churrería. Hacienda, la Seguridad Social, el Registro, la notaría, el Ayuntamiento y dos inspecciones te separan de freír la primera porra en paz.',
    items: ITEMS,
    levels: LEVELS,
    ending: {
      head: 'REINO DE LA BUROCRACIA<br><small>Registro de Autónomos Supervivientes</small>',
      title: '¡Tu churrería sigue abierta!',
      html: `<div class="s2-shop"><div class="s2-awning"></div>
          <div class="s2-shop-name">PORRAS DEL TRÁMITE, S.L.</div>
          <div class="s2-shop-sub">Churros · Porras · Chocolate · Desde 2027</div>
          <div class="s2-shop-sign">ABIERTO <small>(salvo inspección)</small></div></div>
        <p>Diez trámites, una notaría, dos inspecciones y un cuñado después, tu churrería sigue en pie.</p>
        <p>Por cierto: ha llegado por correo la licencia de apertura <b>definitiva</b>. Fecha de efectos: el día de tu jubilación. Hasta entonces, sigues abriendo con la provisional.</p>
        <p><b>Tu gestor te informa:</b> el año que viene cambia toda la normativa. Te recomendamos pedir cita previa ya.</p>`,
      stamp: 'AL CORRIENTE DE PAGO',
    },
    css: CSS,
  });
})();
