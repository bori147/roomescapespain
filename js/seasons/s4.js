/* ==========================================================
   VUELVA USTED MAÑANA — Temporada 4: «Campaña electoral»
   Sátira. Todos los partidos, candidatos, cargos y territorios
   que aparecen son ficticios. Los vicios, no tanto.
   ========================================================== */
(function () {
  'use strict';
  const { pad, norm } = window.GameUtils;

  // =========================================================
  //  PARTIDOS (ficticios)
  // =========================================================
  const PARTIDOS = {
    ALA: { sigla: 'ALA', name: 'Alianza por el Lema Adecuado', emoji: '🪁', color: '#2e86c1', lider: 'Remedios Titular' },
    FAROL: { sigla: 'FAROL', name: 'Frente Amplio de Rotondas y Obras Locales', emoji: '🏮', color: '#d35400', lider: 'Anselmo Rotonda' },
    NIDAC: { sigla: 'NIDAC', name: 'Ni Izquierda Ni Derecha, Al Contrario', emoji: '🧭', color: '#7f8c8d', lider: 'Paz Equidistante' },
    CANA: { sigla: 'CAÑA', name: 'Candidatura de Amigos del Aperitivo', emoji: '🍺', color: '#b7950b', lider: 'Paco Terraza' },
    UVA: { sigla: 'UVA', name: 'Unión de Vecinos Agraviados', emoji: '🍇', color: '#7d3c98', lider: 'Maripaz Queja' },
    TIC: { sigla: 'TIC', name: 'Transformación Integral en la Cloud', emoji: '📱', color: '#16a085', lider: 'Borja Disruptivo' },
    ZIG: { sigla: 'ZIGZAG', name: 'Zigzag, Partido Pendular', emoji: '🔄', color: '#c0392b', lider: 'Rosa de los Vientos' },
    ASPA: { sigla: 'ASPA', name: 'Agrupación Solitaria Pro Autovía', emoji: '🛣️', color: '#566573', lider: 'Ramiro Asfalto' },
  };
  const P = PARTIDOS;
  const sig = (id) => P[id].sigla;

  // =========================================================
  //  CIFRADO DE PALABRA CLAVE (nivel 10)
  // =========================================================
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const kwAlphabet = (key) => {
    const k = norm(key).replace(/[^A-Z]/g, '');
    let out = '';
    for (const c of k + ABC) if (!out.includes(c)) out += c;
    return out;
  };
  const kwEnc = (txt, key) => { const a = kwAlphabet(key); return txt.replace(/[A-Z]/g, (c) => a[ABC.indexOf(c)]); };
  const kwDec = (txt, key) => { const a = kwAlphabet(key); return txt.replace(/[A-Z]/g, (c) => ABC[a.indexOf(c)]); };
  const L10_PLAIN = 'QUERIDA PRESIDENTA: EN LA MOCION ME ABSTENDRE YO SOLA. EL RESTO DE MI GRUPO VOTARA LO QUE HA ANUNCIADO. MI PRECIO: LA CONSEJERIA DE TERRAZAS.';
  const L10_CIPHER = kwEnc(L10_PLAIN, 'MUDANZA');

  // =========================================================
  //  OBJETOS
  // =========================================================
  const ITEMS = {
    // ---- Nivel 1
    notificacion: { emoji: '✉️', name: 'Notificación de mesa', desc: '<b>JUNTA ELECTORAL DE ZONA DE VILLATRÁMITE</b><br>Notificado el <b>lunes 4 de mayo de 2026</b>.<br>Ha sido designado/a <b>VOCAL 1.º</b> de mesa para las elecciones a las Cortes de Ventanilla Alta del <b>domingo 24 de mayo de 2026</b>.<br>Distrito <b>03</b> · Sección <b>☕☕☕</b> · Mesa <b>☕</b> <i>(una mancha de café tapa justo eso)</i>.' },
    dni: { emoji: '🪪', name: 'Tu DNI', desc: 'Tu DNI, recién renovado (aún huele a ventanilla).<br><b>PACIENTE SUFRIDO/A, CIUDADANO/A</b><br>Domicilio: <b>C/ del Trámite, 67</b>, Villatrámite.' },
    invitacion: { emoji: '💌', name: 'Invitación de boda', desc: '«<b>Vanesa y Jonathan</b> se casan el <b>domingo 24 de mayo</b>. ¡Te esperamos!». Tú no eres ni Vanesa ni Jonathan. Eres el/la de la mesa 14, al lado de la tía que pregunta cuándo te casas tú.' },
    certMedico: { emoji: '🩺', name: 'Certificado médico', desc: 'Certificado médico oficial: esguince de tobillo. «Reposo hasta el <b>viernes 22 de mayo</b> inclusive. A partir del sábado, vida normal (dentro de lo que cabe)».' },
    billete: { emoji: '✈️', name: 'Billete de avión', desc: 'Billete Villatrámite–Tenerife a tu nombre. Ida: sábado 23 de mayo. Vuelta: martes 26. <b>Fecha de emisión: 6 de mayo de 2026.</b>' },
    crucero: { emoji: '🛳️', name: 'Reserva de crucero', desc: 'Crucero por el Mediterráneo del 22 al 26 de mayo. Reservado el 2 de abril. Titular: <b>Rubén Cuñado Ruiz</b>. Tu cuñado te la ha prestado «para que la enseñes, que cuela».' },
    congreso: { emoji: '🎫', name: 'Inscripción a un congreso', desc: 'Inscripción al <b>I Congreso Nacional de Gestión de Colas</b> (Villaespera), sábado 23 y <b>domingo 24 de mayo</b>.<br>A nombre de: <b>Paciente Sufrido/a, Ciudadano/a</b>.<br>Inscripción pagada el <b>28 de abril de 2026</b>. Ponencia estrella: «Coger número: ¿arte o ciencia?».' },
    whatsapp: { emoji: '💬', name: 'Mensaje del jefe', desc: 'Captura de un mensaje de tu jefe: «El domingo 24 te necesito en la tienda, que hacemos inventario. No me falles 👍».' },
    // ---- Nivel 2
    resguardo: { emoji: '🧻', name: 'Resguardo (lavado)', desc: 'Resguardo de tu solicitud de voto por correo. Pasó por la lavadora a 60 grados. Solo se lee: «Nº de solicitud: <b>5 ▒ 8 ▒ ▒</b>». El resto es una pelotita de celulosa.' },
    turno: { emoji: '🎟️', name: 'Número de turno', desc: (g) => `Tu número: <b>${({ A: 'A-999 (Paquetería)', B: 'B-112 (Giros y pagos)', C: 'C-047 (Voto por correo)', D: 'D-301 (Recogidas)' })[g.flag('serv')] || '???'}</b>.` },
    papeletas: { emoji: '🗂️', name: 'Fajo de papeletas', desc: 'Una papeleta de cada candidatura. Ocho partidos, ocho tipografías, la misma promesa.' },
    sobreVotacion: { emoji: '🟫', name: 'Sobre de votación (vacío)', desc: 'Sobre de votación, color sepia. Vacío. El adhesivo es de la anterior legislatura y ya no pega.' },
    sobreVotoAbierto: { emoji: '📨', name: 'Sobre de votación (abierto)', desc: (g) => `Sobre de votación con tu papeleta dentro (${g.flag('voto') || '¿?'}). Está sin cerrar: el adhesivo no pega.` },
    sobreVoto: { emoji: '🟤', name: 'Sobre de votación cerrado', desc: 'Sobre de votación cerrado con pegamento. Lo que hay dentro es secreto. Hasta para ti, que ya ni te acuerdas.' },
    sobreMesa: { emoji: '✉️', name: 'Sobre dirigido a la Mesa', desc: (g) => `Sobre blanco dirigido a la <b>Mesa 03-013-C</b>. Dentro: ${[g.flag('inVoto') ? 'el sobre de votación ✔' : '', g.flag('inCert') ? 'el certificado censal ✔' : ''].filter(Boolean).join(' y ') || 'nada todavía'}. Sin cerrar.` },
    certificado: { emoji: '📃', name: 'Certificado censal', desc: 'Certificado de inscripción en el censo electoral. Acredita que existes. Por escrito.' },
    sobreListo: { emoji: '📩', name: 'Sobre de la Mesa, cerrado', desc: 'Sobre dirigido a la Mesa, cerrado y listo: dentro van el sobre de votación y el certificado. Solo falta entregarlo en la ventanilla.' },
    // ---- Nivel 4
    manopla: { emoji: '🧤', name: 'Manopla de horno', desc: 'Una manopla de horno con el logo de «Cocina &amp; Sondeos»: un termómetro con un margen de error de ±lo que haga falta.' },
    // ---- Nivel 5
    pinganillo: { emoji: '🎧', name: 'Pinganillo', desc: 'Por el pinganillo suena la voz del asesor: «Dos cosas que NO están en el manual. Una: si te REPREGUNTAN, repite tu respuesta anterior palabra por palabra, como un disco rayado. Dos: en el minuto de oro, di el lema del partido, exacto, y nada más. El lema es lo único que puede llevar "sí" y "no"».' },
    // ---- Nivel 7
    actaCopia: { emoji: '📝', name: 'Copia de tu acta', desc: '<b>Acta de escrutinio — Mesa 03-013-C</b><br>ALA 2 · FAROL 1 · NIDAC 2 · CAÑA 1 · UVA 2 · TIC 1<br>Votos en blanco: 1 · Votos nulos: 6 · Votantes: 16<br><small>Firmada por triplicado (el vocal, dormido).</small>' },
    // ---- Nivel 8
    notifRecurso: { emoji: '📨', name: 'Notificación del recurso', desc: '<b>NOTIFICACIÓN — Junta Electoral Provincial</b><br>Notificado: <b>jueves 4 de junio de 2026</b>, a las 13:00.<br>Asunto: traslado de recurso contra la proclamación de electos (circunscripción de Villatrámite).<br>Texto íntegro en la Sede, con el Código Seguro de Verificación:<br><b>CSV: KOZALH-7281</b><br><small>(CSV impreso «en espejo» por su seguridad.)</small>' },
    // ---- Nivel 10
    servilleta: { emoji: '🧻', name: 'Servilleta escrita', desc: `Servilleta de la cafetería, escrita a boli: «Clave: mi apellido. Método: el de la chuleta.»<br><code class="cipher">${L10_CIPHER}</code>` },
  };

  // =========================================================
  //  NIVEL 1: excusas y mesa
  // =========================================================
  const L1_REJECT = {
    invitacion: '—¿Invitado/a a una boda? La causa solo vale para los CONTRAYENTES. Los invitados, por mucha barra libre que haya, vienen a la mesa. Siguiente.',
    certMedico: '—Aquí dice reposo hasta el viernes 22. El domingo 24 usted estará estupendamente. Para presidir una mesa sobra con un tobillo.',
    billete: '—Billete emitido el 6 de mayo. Le notificamos el 4. Ustedes se creen que somos tontos, y a veces lo somos, pero hoy no.',
    crucero: '—Este crucero está a nombre de un tal Rubén Cuñado Ruiz. ¿Es usted Rubén? ¿No? Pues que se excuse Rubén, si le toca.',
    whatsapp: '—Motivos laborales no son excusa: para eso existe el permiso retribuido. Dígale a su jefe que haga el inventario él.',
    notificacion: '—Ya sé que le ha tocado. ¿Viene a excusarse o a celebrarlo?',
    dni: '—Muy bonito su DNI. Pero eso acredita que existe, no que no pueda venir.',
  };
  function l1Mesa(g) {
    g.input({
      title: '🪪 Credencial de mesa', text: '—Dígame su mesa en formato <b>distrito-sección-mesa</b> (por ejemplo, 05-021-B).',
      numeric: false, maxLen: 14, placeholder: 'DD-SSS-M',
      check: (v) => ['03013C', '3013C'].includes(norm(v).replace(/[^A-Z0-9]/g, '')),
      failText: (v) => {
        const c = norm(v).replace(/[^A-Z0-9]/g, '');
        if (/^0?3013[A-Z]$/.test(c)) return '—La sección es correcta, pero esa mesa no es la de su apellido.';
        if (/^0?3\d{3}C$/.test(c)) return '—Mesa C... ¿en esa sección? Su calle y su número dicen otra cosa.';
        return '—Esa mesa no le corresponde. Mire su domicilio y el callejero, que para eso lo colgamos.';
      },
      ok: () => {
        g.say('—03-013-C. Correcto. Aquí tiene su credencial de PRESIDENTE/A. Preséntese el domingo 24 a las 8:00. Traiga bocadillo: el escrutinio es largo y la paciencia, corta.', 'Funcionario de la Junta');
        g.win();
      },
    });
  }

  // =========================================================
  //  NIVEL 2: dispensador y papeletas
  // =========================================================
  const L2_SERV = { A: 'Paquetería', B: 'Giros y pagos', C: 'Voto por correo', D: 'Recogidas' };
  const L2_NEXT = { A: 'B', B: 'C', C: 'D', D: 'A' };
  function l2Dispensador(g) {
    g.choice({
      title: '🎟️ Dispensador de turnos', text: 'Cuatro botones grandes, muy gastados. ¿Cuál pulsas?',
      options: ['A', 'B', 'C', 'D'].map((k) => ({
        label: `${k} · ${L2_SERV[k]}`,
        onPick(g2) {
          const serv = L2_NEXT[k];
          g2.set('serv', serv); g2.take('turno'); g2.give('turno');
          g2.say(`El dispensador zumba y escupe un tique: <b>${({ A: 'A-999', B: 'B-112', C: 'C-047', D: 'D-301' })[serv]}</b> (${L2_SERV[serv]}).`, 'Dispensador');
        },
      })),
    });
  }
  function l2Papeleta(g) {
    const parties = Object.keys(P);
    g.choice({
      title: '🗳️ ¿Qué papeleta metes?', text: 'El voto es secreto: elige la que quieras (o ninguna, si prefieres votar en blanco: entonces deja el sobre vacío y ciérralo tal cual).',
      options: [
        ...parties.map((id) => ({
          label: `${P[id].emoji} ${P[id].sigla} — ${P[id].name}`,
          onPick(g2) {
            g2.take('sobreVotacion'); g2.give('sobreVotoAbierto'); g2.set('voto', P[id].sigla);
            g2.say(`Metes la papeleta de ${P[id].sigla} en el sobre de votación. Tu voto es secreto: lo sabéis tú, el sobre y, probablemente, tu cuñado.`);
          },
        })),
        { label: '🤹 Dos papeletas distintas, por si acaso', onPick(g2, msg) { msg('Dos papeletas de partidos distintos = voto NULO. Además, «por si acaso» no es una ideología. Elige una.', true); return false; } },
      ],
    });
  }

  // =========================================================
  //  NIVEL 3: teleprompter
  // =========================================================
  const L3_BLOCKS = [
    { name: 'Saludo', opts: ['¡Gracias a los 3.000 vecinos que habéis venido esta noche!', '¡Hola, gente! Gracias por venir, aunque sea por el bocadillo.', '¡Buenas noches, Villatrámite! ¡Este polideportivo huele a futuro!'] },
    { name: 'Diagnóstico', opts: ['La gente está harta de promesas que nunca se cumplen.', 'El alcalde Pérez ha subido la basura un 4 %.', 'Durante años, otros han dejado esta tierra sin una sola rotonda.'] },
    { name: 'Promesa', opts: ['Bajaremos los impuestos y subiremos el gasto. A la vez. Sin despeinarnos.', 'Prometemos 12 rotondas nuevas antes de Navidad.', 'Vamos a construir un futuro lleno de rotondas para la gente.'] },
    { name: 'Ataque', opts: ['Ellos solo saben hacer promesas. Nosotros las hacemos mejores.', 'Otros miran al pasado; nosotros miramos al futuro.', 'Remedios Titular no ha inaugurado ni un bordillo.'] },
    { name: 'Cierre', opts: ['¡Viva Villatrámite y viva el bocadillo!', '¡Por el futuro, por la gente, por las rotondas!', '¡Votadnos el día 24, que el 25 ya no hace falta!'] },
  ];
  const L3_SOL = [1, 2, 0, 1, 1];
  function l3Teleprompter(g) {
    const cur = g.flag('tp') || [-1, -1, -1, -1, -1];
    g.modal({
      title: '📺 Teleprompter', cls: 'wide',
      html: `<p class="small">Elige una frase para cada bloque del discurso. Al cargarlo, la jefa de campaña lo revisará con el argumentario vigente en la mano.</p>
        <div class="s4-tp">${L3_BLOCKS.map((b, i) => `<label class="field">${i + 1}. ${b.name}<select id="s4-tp-${i}"><option value="-1">— elige una frase —</option>${b.opts.map((o, j) => `<option value="${j}" ${cur[i] === j ? 'selected' : ''}>«${o}»</option>`).join('')}</select></label>`).join('')}</div>
        <div class="msg" id="s4-tp-msg"></div>
        <div class="row-btns"><button class="btn primary" id="s4-tp-go">📜 Cargar en el teleprompter</button></div>`,
      onMount(el) {
        const msg = (t, bad) => { const m = el.querySelector('#s4-tp-msg'); m.innerHTML = t; m.className = 'msg ' + (bad ? 'bad' : 'good'); };
        el.querySelector('#s4-tp-go').onclick = () => {
          const v = L3_BLOCKS.map((b, i) => +el.querySelector(`#s4-tp-${i}`).value);
          g.set('tp', v);
          if (v.some((x) => x < 0)) { g.sfx('bad'); return msg('Faltan bloques por rellenar. Un discurso sin cierre es un pleno municipal.', true); }
          if (v.every((x, i) => x === L3_SOL[i])) {
            g.closeModal(); g.sfx('ok');
            g.say('La jefa de campaña repasa el discurso regla por regla... y asiente. —Cero cifras, cero nombres, dos futuros, un bocadillo. Perfecto. Vacío por dentro, brillante por fuera. ¡Candidato, a escena!', 'Jefa de campaña');
            g.say('Anselmo Rotonda sale al escenario y lee el teleprompter con pasión. «¡Por el futuro, por la gente, por las rotondas!». El polideportivo se viene abajo. Nadie sabe qué ha prometido, que es exactamente la idea.', 'Mitin de FAROL');
            g.win();
            return;
          }
          g.sfx('bad');
          msg('❌ La jefa de campaña tacha el discurso con rotulador rojo: «Esto incumple el argumentario vigente. Léetelo entero. ENTERO. Incluidas las correcciones».', true);
        };
      },
    });
  }

  // =========================================================
  //  NIVEL 5: debate
  // =========================================================
  const L5_Q = [
    { q: 'Candidata, empecemos: ¿subirá usted los impuestos el año que viene?', ok: 1,
      opts: ['No, en absoluto. Ni un céntimo más.', 'Cuando llegamos, otros habían dejado las cuentas temblando. Esa es la herencia recibida.', 'El año que viene haremos una política fiscal de consenso y equilibrio.', 'Hace 20 años otros los subieron y nadie dijo nada.', 'Pregúntele a Remedios Titular, que fue quien los subió.'] },
    { q: 'En la última legislatura su partido votó 14 veces a favor y 14 en contra de la misma ley. ¿Cómo lo explica?', ok: 3,
      opts: ['Eso fue culpa de la herencia que dejaron otros en 1987.', 'Claro, y en el futuro lo volveríamos a hacer 20 veces.', 'En el futuro votaremos 3 veces, pero muy bien votadas.', 'En el futuro votaremos 30 veces a favor, que es más del doble.'] },
    { q: 'Hablemos de corrupción. ¿Qué opina usted del caso «Rotondas Opacas»?', ok: 2,
      opts: ['Ese caso es cosa de otros; nosotros estamos limpios como una patena.', 'No me consta.', 'Fíjese qué tiempo más bueno está haciendo para la época.', 'Fíjese qué tiempo: 30 grados en mayo.'] },
    { q: 'Perdone, pero no me ha contestado. ¿Responde usted o no a lo de las Rotondas Opacas?', ok: 0,
      opts: ['Fíjese qué tiempo más bueno está haciendo para la época.', 'Ya le he contestado: hace un tiempo estupendo.', 'Fíjese qué tiempo tan bueno está haciendo para la época.', 'Fíjese qué tiempo más bueno está haciendo para la época, ¿no?'] },
    { q: '¿Qué hará usted en sus primeros 100 días de gobierno?', ok: 3,
      opts: ['En los primeros 100 días: consenso, consenso y consenso.', 'Sí: en 1.000 días arreglaremos la herencia recibida.', 'Cuando llegamos, otros habían dejado 200 baches y 3 rotondas a medias: esa es la herencia recibida.', 'Cuando llegamos, otros habían dejado 300 baches. Esa es la herencia recibida.', 'Cuando llegamos, Anselmo Rotonda había dejado 500 baches.'] },
    { q: 'Termina el debate. Tiene usted su minuto de oro: pida el voto a los espectadores.', ok: 2,
      opts: ['Ni sí ni no, sino lo contrario de todo.', 'Vótennos: otros son todavía peores.', 'Ni sí, ni no, sino todo lo contrario.', 'Ni sí, ni no, sino todo lo contrario. Y el 24, vótennos.'] },
  ];
  const L5_FAIL = [
    'El realizador corta a publicidad: «¡Eso no está en el manual!». En la tele autonómica nadie notará que repetimos el debate desde la primera pregunta.',
    'El asesor se lleva las manos a la cabeza en el control. —¡Has respondido algo! ¡O casi! Repetimos desde el principio, que esto lo ve poca gente.',
    'Se oye un pitido en el pinganillo: «Respuesta fuera de argumentario». El debate vuelve a empezar. Los otros candidatos ni se dan cuenta: tampoco estaban escuchando.',
  ];
  function l5Debate(g, i) {
    const Q = L5_Q[i];
    g.choice({
      title: `🎙️ Pregunta ${i + 1} de ${L5_Q.length}`,
      text: `<b>Matilde Repregunta (moderadora):</b> «${Q.q}»`,
      cancelLabel: 'Abandonar el plató',
      options: Q.opts.map((o, j) => ({
        label: `«${o}»`,
        onPick(g2) {
          if (j !== Q.ok) {
            g2.set('deb', 0); g2.sfx('bad');
            g2.say(L5_FAIL[i % L5_FAIL.length], 'Realizador');
            return true;
          }
          g2.sfx('ok');
          if (i + 1 < L5_Q.length) { g2.set('deb', i + 1); l5Debate(g2, i + 1); return false; }
          g2.say('—Ni sí, ni no, sino todo lo contrario. —Silencio en el plató. La moderadora abre la boca, la cierra, y da paso a publicidad. Has esquivado seis preguntas sin rozar ninguna.', 'Debate a seis');
          g2.win();
          return true;
        },
      })),
    });
  }

  // =========================================================
  //  NIVEL 6: votantes y acta
  // =========================================================
  const L6_VOTERS = [
    { n: 'Remigia Ortega Ruiz', d: 'DNI 12.345.678-Z, caducado en 2019. Foto de 2009: mismo moño, idéntico, inconfundible.', q: '—Hijo/a, yo voto desde antes de que existieras.', ok: true },
    { n: 'Bartolomé Alcántara Gómez', d: 'DNI 30.551.902-H, en vigor.', q: '—Yo siempre he votado en este colegio. En esta silla. Con este boli.', ok: false },
    { n: 'Sergio Vidal Pons', d: 'Fotocopia del DNI, plastificada con mucho cariño.', q: '—El original lo tengo en casa, enmarcado. Es que salgo muy bien.', ok: false },
    { n: 'Pilar Sanz Quintana', d: 'DNI 44.556.677-L, en vigor.', q: '—Pedí el voto por correo, pero al final me fío más de venir en persona.', ok: false },
    { n: 'Ulises Romero Tey', d: 'Pasaporte en vigor + certificado censal específico expedido ayer por la Oficina del Censo Electoral.', q: '—Me empadroné hace poco y no salgo en su lista. Por eso traigo este papel con tantos sellos.', ok: true },
    { n: 'Tomás Pardo Sáez', d: 'DNI 33.112.009-B, en vigor.', q: '—Vengo a votar otra vez: esta mañana voté sin gafas y no sé a quién.', ok: false },
    { n: 'Ramón Ortiz Vela', d: 'Carné de conducir n.º 71.234.560-T, en vigor. Fecha de nacimiento: 2001.', q: '—Soy Ramón Ortiz Vela, como mi abuelo, que en paz descanse. Bueno, como el de su lista.', ok: false },
  ];
  function l6Cola(g) {
    if (g.flag('cerrada')) return g.say('Ya no queda nadie en la cola. Solo un señor que pregunta si aquí es lo del DNI. No.');
    const dec = g.flag('dec') || L6_VOTERS.map(() => null);
    g.modal({
      title: '🧍 Últimos votantes (19:40)', cls: 'wide',
      html: `<p class="small">Decide, uno a uno, si cada persona puede votar en esta mesa. Cuando termines, cierra la votación. La interventora de UVA lo está apuntando todo.</p>
        <div class="s4-voters" id="s4-voters"></div>
        <div class="msg" id="s4-v-msg"></div>
        <div class="row-btns"><button class="btn primary" id="s4-cerrar">🕗 Cerrar la votación (20:00)</button></div>`,
      onMount(el) {
        const box = el.querySelector('#s4-voters');
        const render = () => {
          box.innerHTML = L6_VOTERS.map((v, i) => `<div class="s4-voter"><div><b>${i + 1}. ${v.n}</b><br><span class="small">${v.d}</span><br><i class="small">${v.q}</i></div>
            <div class="s4-vbtns"><button class="btn ${dec[i] === 'A' ? 'on' : ''}" data-v="${i}" data-d="A">✔ Admitir</button><button class="btn ${dec[i] === 'R' ? 'on' : ''}" data-v="${i}" data-d="R">✖ Rechazar</button></div></div>`).join('');
          box.querySelectorAll('[data-v]').forEach((b) => {
            b.onclick = () => { dec[+b.dataset.v] = b.dataset.d; g.set('dec', dec.slice()); g.sfx('click'); render(); };
          });
        };
        render();
        el.querySelector('#s4-cerrar').onclick = () => {
          const m = el.querySelector('#s4-v-msg');
          if (dec.some((d) => !d)) { g.sfx('bad'); m.className = 'msg bad'; m.textContent = 'Aún hay gente en la cola sin decidir. No se puede cerrar con votantes dentro: lo dice la ley y la interventora.'; return; }
          if (dec.every((d, i) => (d === 'A') === L6_VOTERS[i].ok)) {
            g.set('cerrada'); g.closeModal(); g.sfx('stamp');
            g.say('Ocho en punto: «¡Se cierra la votación!». La interventora de UVA busca algo de lo que protestar... y no lo encuentra. Por primera vez en su carrera, se queja de que no tiene quejas.', 'Mesa 03-013-C');
            g.say('Introduces en la urna los votos por correo llegados (dos: el tuyo sigue traspapelado en Correos). Ya puedes abrir la urna y rellenar el acta.', 'Mesa 03-013-C');
            return;
          }
          g.sfx('bad'); m.className = 'msg bad';
          m.textContent = '❌ La interventora de UVA presenta una protesta formal por escrito: «Alguna de sus decisiones no se ajusta al manual». No dice cuál. Disfruta haciéndolo.';
        };
      },
    });
  }
  const L6_FIELDS = [['ALA', 'ALA'], ['FAROL', 'FAROL'], ['NIDAC', 'NIDAC'], ['CANA', 'CAÑA'], ['UVA', 'UVA'], ['TIC', 'TIC'], ['BLANCO', 'Votos en blanco'], ['NULO', 'Votos nulos'], ['VOTANTES', 'Total de votantes']];
  const L6_SOL = { ALA: 2, FAROL: 1, NIDAC: 2, CANA: 1, UVA: 2, TIC: 1, BLANCO: 1, NULO: 6, VOTANTES: 16 };
  function l6Acta(g) {
    const cur = g.flag('acta') || {};
    g.modal({
      title: '📝 Acta de escrutinio — Mesa 03-013-C', cls: 'wide',
      html: `<p class="small">Rellena el acta con el resultado del escrutinio. Se firma por triplicado y no admite tachones (ni café).</p>
        <div class="s4-acta">${L6_FIELDS.map(([k, n]) => `<label class="field">${n}<select id="s4-acta-${k}">${Array.from({ length: 21 }, (_, i) => `<option value="${i}" ${cur[k] === i ? 'selected' : ''}>${i}</option>`).join('')}</select></label>`).join('')}</div>
        <div class="msg" id="s4-acta-msg"></div>
        <div class="row-btns"><button class="btn primary" id="s4-acta-go">✍️ Firmar el acta</button></div>`,
      onMount(el) {
        el.querySelector('#s4-acta-go').onclick = () => {
          const v = {}; L6_FIELDS.forEach(([k]) => { v[k] = +el.querySelector(`#s4-acta-${k}`).value; });
          g.set('acta', v);
          const m = el.querySelector('#s4-acta-msg');
          if (Object.keys(L6_SOL).every((k) => v[k] === L6_SOL[k])) {
            g.closeModal(); g.sfx('stamp');
            g.say('El acta cuadra al voto. La firmas tú, la firma la interventora (protestando) y la firma el vocal... dormido, pero con muy buena letra.', 'Mesa 03-013-C');
            g.win();
            return;
          }
          g.sfx('bad'); m.className = 'msg bad';
          const parties = ['ALA', 'FAROL', 'NIDAC', 'CANA', 'UVA', 'TIC'].reduce((a, k) => a + v[k], 0);
          m.textContent = parties + v.BLANCO + v.NULO !== v.VOTANTES
            ? '❌ Las cuentas no cuadran: votos a candidaturas + blancos + nulos debe ser igual al total de votantes.'
            : '❌ La interventora repasa los sobres uno a uno y niega con la cabeza. Algún voto está mal clasificado. Relee el manual.';
        };
      },
    });
  }

  // =========================================================
  //  NIVEL 7: D'Hondt
  // =========================================================
  const L7_ORDER = ['ALA', 'FAROL', 'NIDAC', 'CANA', 'UVA', 'TIC'];
  const L7_SOL = [5, 5, 2, 3, 2, 0];
  function l7Calc(g) {
    g.modal({
      title: '🧮 Calculadora de la Junta',
      html: `<p class="small">Calculadora oficial. Solo divide: para multiplicar hay que presentar otra solicitud.</p>
        <div class="row-btns"><input type="number" id="s4-calc-a" class="s4-num" placeholder="votos"> <b>÷</b> <input type="number" id="s4-calc-b" class="s4-num" placeholder="divisor"> <button class="btn primary" id="s4-calc-go">=</button></div>
        <div class="lcd" id="s4-calc-out">0</div>`,
      onMount(el) {
        el.querySelector('#s4-calc-go').onclick = () => {
          const a = +el.querySelector('#s4-calc-a').value; const b = +el.querySelector('#s4-calc-b').value;
          g.sfx('click');
          el.querySelector('#s4-calc-out').textContent = b ? (a / b).toLocaleString('es-ES', { maximumFractionDigits: 2 }) : 'ERROR: ÷0 (como el presupuesto)';
        };
      },
    });
  }
  function l7Proclamacion(g) {
    const cur = g.flag('procl') || [0, 0, 0, 0, 0, 0];
    g.modal({
      title: '✍️ Acta de proclamación — Villatrámite (17 escaños)', cls: 'wide',
      html: `<p class="small">Indica cuántos escaños corresponden a cada candidatura. Una vez firmada, se proclaman los electos y los periodistas se van a dormir.</p>
        <div class="s4-acta">${L7_ORDER.map((k, i) => `<label class="field">${P[k].emoji} ${sig(k)}<select id="s4-pr-${k}">${Array.from({ length: 18 }, (_, n) => `<option value="${n}" ${cur[i] === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`).join('')}</div>
        <div class="msg" id="s4-pr-msg"></div>
        <div class="row-btns"><button class="btn primary" id="s4-pr-go">✍️ Firmar y proclamar</button></div>`,
      onMount(el) {
        el.querySelector('#s4-pr-go').onclick = () => {
          const v = L7_ORDER.map((k) => +el.querySelector(`#s4-pr-${k}`).value);
          g.set('procl', v);
          const m = el.querySelector('#s4-pr-msg'); m.className = 'msg bad';
          const sum = v.reduce((a, b) => a + b, 0);
          if (sum !== 17) { g.sfx('bad'); m.textContent = `❌ Los escaños suman ${sum}. Las Cortes tienen los asientos contados (y atornillados): 17.`; return; }
          if (v.join() === L7_SOL.join()) {
            g.closeModal(); g.sfx('stamp');
            g.say('El magistrado se despierta, comprueba los cocientes con el dedo, firma y se vuelve a dormir. Los periodistas salen corriendo: «¡NIDAC arrebata a FAROL el último escaño por medio cociente!».', 'Junta Electoral Provincial');
            g.win();
            return;
          }
          g.sfx('bad');
          if (v.join() === '5,6,1,3,2,0') m.textContent = '❌ El magistrado abre un ojo: «Esto sería así... si no faltara ninguna mesa por sumar». Y lo cierra.';
          else if (v[5] > 0) m.textContent = '❌ «¿TIC con escaño?», murmura el magistrado entre sueños. «Repase la barrera electoral... y qué votos cuentan para calcularla».';
          else m.textContent = '❌ Los cocientes no cuadran con ese reparto. Repasa el método de la pizarra.';
        };
      },
    });
  }

  // =========================================================
  //  NIVEL 8: Sede y escrito de alegaciones
  // =========================================================
  const L8_ORG = ['Junta Electoral de Zona', 'Junta Electoral Provincial', 'Junta Electoral Central', 'Tribunal Superior de Justicia', 'Mesa 03-013-C', 'Ventanilla 3 de Correos'];
  const L8_TIPO = ['Reclamación (art. 101)', 'Recurso (art. 108)', 'Alegaciones (art. 110)', 'Queja genérica (art. 7)'];
  const L8_RECURSO = `<p><b>RECURSO CONTENCIOSO-ELECTORAL</b></p>
    <p><b>Recurrente:</b> FAROL (Frente Amplio de Rotondas y Obras Locales).</p>
    <p><b>Presentado ante:</b> la <b>Junta Electoral Provincial</b>, el lunes 1 de junio de 2026 (art. 108).</p>
    <p><b>Objeto:</b> el acta de la <b>Mesa 03-013-C</b>, que es la <b>única mesa impugnada</b>.</p>
    <p><b>Motivo:</b> el voto n.º 7 de dicha mesa (papeleta de NIDAC con una mancha de café) debería declararse nulo. Anulado ese voto, NIDAC y FAROL empatarían a 950 en el último cociente y, por tener más votos, el escaño sería de FAROL. «Una mancha de café es un dibujo», sostiene el recurrente, «un dibujo abstracto».</p>
    <p><b>Traslado:</b> se da traslado al presidente/a de la mesa para que, si lo desea, formule <b>alegaciones</b> conforme a la Ley Electoral de Ventanilla Alta.</p>`;
  function l8Form(g) {
    const cur = g.flag('form') || [-1, -1, -1];
    const sel = (id, arr, c) => `<select id="${id}"><option value="-1">— elige —</option>${arr.map((o, i) => `<option value="${i}" ${c === i ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
    const days = []; for (let d = 4; d <= 30; d++) days.push(d);
    g.modal({
      title: '📄 Registro — Escrito del presidente/a de mesa',
      html: `<p class="small">Rellene el impreso. El Registro no corrige: devuelve. Y no dice por qué (eso sería otro trámite).</p>
        <label class="field">Órgano al que se dirige${sel('s4-f-org', L8_ORG, cur[0])}</label>
        <label class="field">Tipo de escrito y fundamento${sel('s4-f-tipo', L8_TIPO, cur[1])}</label>
        <label class="field">Fecha límite de presentación (junio de 2026)<select id="s4-f-dia"><option value="-1">— elige —</option>${days.map((d) => `<option value="${d}" ${cur[2] === d ? 'selected' : ''}>${d} de junio</option>`).join('')}</select></label>
        <div class="msg" id="s4-f-msg"></div>
        <div class="row-btns"><button class="btn primary" id="s4-f-go">📥 Presentar en Registro</button></div>`,
      onMount(el) {
        el.querySelector('#s4-f-go').onclick = () => {
          const v = ['#s4-f-org', '#s4-f-tipo', '#s4-f-dia'].map((s) => +el.querySelector(s).value);
          g.set('form', v);
          const m = el.querySelector('#s4-f-msg'); m.className = 'msg bad';
          if (v.some((x) => x < 0)) { g.sfx('bad'); m.textContent = 'Hay casillas sin rellenar. Un impreso incompleto es un impreso inexistente.'; return; }
          if (v[0] === 1 && v[1] === 2 && v[2] === 10) {
            g.closeModal(); g.sfx('stamp');
            g.say('¡PAM! Sello de entrada. —Alegaciones ante la Junta Provincial, artículo 110, fecha límite el miércoles 10 de junio. Todo correcto. Es usted la primera persona que calcula bien este plazo desde que se aprobó la ley. ¿Seguro que no es funcionario/a?', 'Registro');
            g.win();
            return;
          }
          g.sfx('bad');
          m.textContent = '❌ Escrito devuelto: «No se ajusta a lo dispuesto en la normativa vigente». La funcionaria no aclara qué parte. Es su forma de querer.';
        };
      },
    });
  }
  function l8Calendar(g) {
    const HOL = { 5: 'Santa Paciencia, patrona de Villatrámite (festivo local)', 9: 'Día de Ventanilla Alta (festivo autonómico)' };
    let html = '<div class="cal-grid">' + ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<div class="cal-h">${d}</div>`).join('');
    for (let d = 1; d <= 30; d++) {
      const wd = (d - 1) % 7; // 1 de junio de 2026 es lunes
      const cls = ['cal-d']; if (wd >= 5) cls.push('we'); if (HOL[d]) cls.push('hol'); if (d === 4) cls.push('notif');
      html += `<div class="${cls.join(' ')}" title="${HOL[d] || ''}">${d}${HOL[d] ? '<i>festivo</i>' : ''}</div>`;
    }
    html += '</div><div class="cal-legend"><span class="lg hol"></span> 5: Santa Paciencia (festivo local) · 9: Día de Ventanilla Alta (festivo autonómico) · <span class="lg notif"></span> 4: notificación del recurso</div>';
    g.modal({ title: '📅 Calendario — Junio 2026', html: html + '<p class="small">Calendario laboral oficial de Villatrámite. Alguien ha escrito en una esquina: «junio, el mes de los plazos que se acaban».</p>' });
  }

  // =========================================================
  //  NIVEL 9: investidura
  // =========================================================
  const L9_IDS = ['ALA', 'FAROL', 'CANA', 'NIDAC', 'UVA', 'TIC', 'ZIG', 'ASPA'];
  const L9_SEATS = { ALA: 22, FAROL: 19, CANA: 11, NIDAC: 9, UVA: 8, TIC: 6, ZIG: 5, ASPA: 1 };
  const SI = 'Sí'; const NO = 'No'; const AB = 'Abstención';
  const small = (id) => L9_SEATS[id] < 10;
  const L9_VOTE = {
    ALA: (G, C) => (C === 'ALA' ? SI : small(C) ? AB : NO),
    FAROL: (G, C) => (G.has('ALA') ? NO : C === 'FAROL' ? SI : small(C) ? AB : NO),
    CANA: (G, C) => (G.has('CANA') && !G.has('TIC') && C !== 'ALA' && C !== 'FAROL' ? SI : NO),
    NIDAC: (G, C) => (G.has('TIC') ? NO : C === 'NIDAC' ? SI : AB),
    UVA: (G) => (G.has('TIC') ? NO : G.has('UVA') ? (G.has('ASPA') ? SI : NO) : AB),
    TIC: (G) => (G.has('TIC') ? SI : NO),
    ZIG: (G) => (G.has('ZIG') ? SI : NO), // hace lo contrario de lo que anuncia
    ASPA: (G) => (G.has('ASPA') ? (G.size === 4 ? SI : NO) : AB),
  };
  const L9_SAYS = {
    ALA: '—Votaremos Sí a una candidata de ALA. A un candidato de otro partido grande (10 escaños o más), No. Y si el candidato es de un partido pequeño, de menos de 10, nos abstendremos: total, durará poco.',
    FAROL: '—Si ALA está en el gobierno, No a todo. Si no está: Sí a un candidato nuestro, No al de otro partido grande, y abstención si el candidato es de un partido de menos de 10 escaños. Que se estrellen solos.',
    CANA: '—Solo votamos Sí a un gobierno en el que estemos nosotros, que no presidan ni ALA ni FAROL (nunca nos invitan a las cañas) y en el que no esté TIC (nos quitaron la terraza para aparcar patinetes). En cualquier otro caso: No.',
    NIDAC: '—Ni sí ni no: nos abstendremos. Salvo que la candidata sea yo: entonces, Sí. Y si TIC entra en el gobierno, No: hablan en inglés y no les entendemos.',
    UVA: '—Si TIC entra en el gobierno, No. Si no entra y nos dejan fuera, nos abstenemos (protestando). Y si nos meten dentro, solo votamos Sí si también entra ASPA: la autovía pasa por nuestro barrio. Si no, No.',
    TIC: '—Si estamos dentro del gobierno, Sí. Si nos dejan fuera, No. El que no disrumpe, es disrumpido.',
    ZIG: '—Lo anunciamos solemnemente: si nos meten en el gobierno, votaremos No. Si nos dejan fuera, votaremos Sí. Palabra de ZIGZAG.',
    ASPA: '—Si me dejan fuera, me abstengo. Si me meten, Sí... pero solo si el gobierno tiene exactamente cuatro partidos, como los cuatro carriles de mi autovía. Si no, No.',
  };
  function l9Tribuna(g) {
    const sel = new Set(g.flag('gob') || []);
    g.modal({
      title: '🗳️ Segunda votación de investidura', cls: 'wide',
      html: '<div id="s4-inv"></div>',
      onMount(el) {
        const box = el.querySelector('#s4-inv');
        const render = (res) => {
          const cand = [...sel].sort((a, b) => L9_SEATS[b] - L9_SEATS[a])[0];
          const t = [...sel].reduce((a, id) => a + L9_SEATS[id], 0);
          box.innerHTML = `<p class="small">Elige qué partidos forman el gobierno. El candidato/a lo propone automáticamente el partido más grande del gobierno (art. 12). En segunda votación basta con <b>más síes que noes</b>.</p>
            <div class="party-grid">${L9_IDS.map((id) => `<button class="party ${sel.has(id) ? 'on' : ''}" data-id="${id}" style="--pc:${P[id].color}"><span class="p-emoji">${P[id].emoji}</span><span class="p-name"><b>${P[id].sigla}</b> ${P[id].name}</span><span class="p-seats">${L9_SEATS[id]}</span></button>`).join('')}</div>
            <p class="seat-total">Gobierno: <b>${sel.size}</b> partido${sel.size === 1 ? '' : 's'} · ${t} escaños · Candidato/a: <b>${cand ? `${P[cand].lider} (${P[cand].sigla})` : '—'}</b></p>
            ${res ? `<table class="tbl s4-res">${L9_IDS.map((id) => `<tr><td>${P[id].emoji} ${P[id].sigla} (${L9_SEATS[id]})</td><td class="s4-v-${res.v[id] === SI ? 'si' : res.v[id] === NO ? 'no' : 'ab'}">${res.v[id]}</td></tr>`).join('')}<tr><td><b>Total</b></td><td>Sí ${res.si} · No ${res.no} · Abst. ${res.ab}</td></tr></table>` : ''}
            <div class="coal-msg ${res && !res.ok ? 'bad' : ''}">${res ? res.msg : ''}</div>
            <div class="modal-inline-actions"><button class="btn primary" id="s4-vote">🗳️ Someter a votación</button></div>`;
          box.querySelectorAll('.party').forEach((b) => {
            b.onclick = () => { const id = b.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); g.set('gob', [...sel]); g.sfx('click'); render(); };
          });
          box.querySelector('#s4-vote').onclick = () => {
            if (!sel.size) { g.sfx('bad'); return render({ v: Object.fromEntries(L9_IDS.map((id) => [id, '—'])), si: 0, no: 0, ab: 0, ok: false, msg: 'Sin gobierno no hay votación. Bueno, sí la hay, pero es muy triste.' }); }
            const v = {}; let si = 0; let no = 0; let ab = 0;
            for (const id of L9_IDS) { v[id] = L9_VOTE[id](sel, cand); if (v[id] === SI) si += L9_SEATS[id]; else if (v[id] === NO) no += L9_SEATS[id]; else ab += L9_SEATS[id]; }
            const traidor = [...sel].find((id) => v[id] !== SI);
            if (traidor) { g.sfx('bad'); return render({ v, si, no, ab, ok: false, msg: `❌ Investidura fallida: ${P[traidor].sigla}, que estaba en el gobierno, vota «${v[traidor]}». Un partido que no vota a su propio gobierno no es un socio: es un tertuliano.` }); }
            if (si <= no) { g.sfx('bad'); return render({ v, si, no, ab, ok: false, msg: `❌ Investidura fallida: ${si} síes frente a ${no} noes. Se necesitan más síes que noes.` }); }
            g.closeModal(); g.sfx('ok');
            g.say(`¡Investidura aprobada! Sí: ${si}. No: ${no}. Abstenciones: ${ab}. ${P[cand].lider} será presidenta con un gobierno de ${si} escaños de 81. ALA y FAROL aplauden con desgana: «Durará poco». ZIGZAG vota Sí y emite un comunicado diciendo que ha votado No.`, 'Presidencia de las Cortes');
            g.win();
          };
        };
        render();
      },
    });
  }

  // =========================================================
  //  NIVEL 10: tránsfuga, cifrado y marcador
  // =========================================================
  const L10_SUS = [
    { id: 'veleta', name: 'Ginés Veleta', party: 'ZIG', seat: 61, x: 18, y: 60, emoji: '🧑‍🦱', says: '—Lo único que sé seguro es que el tránsfuga no es ni de ALA ni de NIDAC. Y eso que yo cambio de opinión cada cuarto de hora.' },
    { id: 'bisagra', name: 'Leonor Bisagra', party: 'NIDAC', seat: 44, x: 34, y: 49, emoji: '👩‍🦳', says: '—Begoña Mudanza miente. Se le nota en el flequillo.' },
    { id: 'chaqueta', name: 'Fermín Chaqueta', party: 'ALA', seat: 7, x: 50, y: 45, emoji: '🧔', says: '—Ginés Veleta dice la verdad. Por raro que suene.' },
    { id: 'mudanza', name: 'Begoña Mudanza', party: 'CANA', seat: 33, x: 66, y: 49, emoji: '👩', says: '—El tránsfuga se sienta en un escaño par. Búsquenlo por ahí, por los pares.' },
    { id: 'pendulo', name: 'Casimiro Péndulo', party: 'TIC', seat: 52, x: 82, y: 60, emoji: '👨‍💼', says: '—De Leonor Bisagra y Fermín Chaqueta, exactamente uno miente. No diré cuál: sería poco disruptivo.' },
  ];
  function l10Maquina(g) {
    g.modal({
      title: '⌨️ Descifradora del Grupo Mixto', cls: 'wide',
      html: `<p class="small">Máquina de escribir modificada (la usaba el Grupo Mixto para pasarse los chistes). Escribe la palabra clave y descifra el texto de la servilleta.</p>
        <div class="code-box"><code class="s4-ct">${L10_CIPHER}</code></div>
        <div class="row-btns"><input type="text" id="s4-key" class="s4-txt" placeholder="Palabra clave" autocomplete="off" spellcheck="false"> <button class="btn primary" id="s4-dec">🔓 Descifrar</button></div>
        <div class="s4-out" id="s4-out">…</div>`,
      onMount(el) {
        el.querySelector('#s4-dec').onclick = () => {
          const k = el.querySelector('#s4-key').value;
          const out = el.querySelector('#s4-out');
          if (!norm(k).replace(/[^A-Z]/g, '')) { out.textContent = 'Sin clave, la máquina solo escribe «ASDFG». Como algunos diputados.'; return; }
          g.sfx('click');
          out.textContent = kwDec(L10_CIPHER, k);
          if (norm(k).replace(/[^A-Z]/g, '') === 'MUDANZA') { g.set('descifrado'); g.sfx('ok'); }
        };
      },
    });
  }

  // =========================================================
  //  NIVELES
  // =========================================================
  const LEVELS = [
    // ------------------------------------------------------ 1
    {
      title: 'Te ha tocado mesa',
      place: 'Junta Electoral de Zona de Villatrámite',
      stars: 2,
      intro: 'Una carta certificada de las que dan miedo: «Ha sido usted designado/a para formar parte de la mesa electoral...». El domingo 24 de mayo, desde las 8:00 hasta que se acabe el escrutinio (o tú).<br><br>Hoy es el último día para alegar una excusa, y has venido con una carpeta llena de ellas. Lástima que casi ninguna valga.<br><br><b>Objetivo:</b> presenta la única excusa válida y sal de la Junta con la credencial que te corresponda.',
      outro: 'Credencial expedida: Presidente/a de la Mesa 03-013-C. Al llegar a casa caes en la cuenta: como pensabas irte al congreso, hace semanas pediste el voto por correo. Y quien lo pide ya no puede votar en persona, ni siquiera en la mesa que preside. El último día para depositarlo es el jueves 21. En Correos.',
      scene: { wall: '#d9d2bd', floor: '#8b8478', floorH: 34, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 64, t: 55, w: 33, h: 10 },
        { kind: 'flag', l: 92, t: 8, w: 5, h: 8 },
        { kind: 'flag-eu', l: 84, t: 8, w: 5, h: 8 },
        { emoji: '🪑', x: 24, y: 80, s: 5, o: 0.8 }, { emoji: '🪑', x: 34, y: 80, s: 5, o: 0.8 },
        { emoji: '🗄️', x: 70, y: 46, s: 5, o: 0.85 },
      ],
      hotspots: [
        { id: 'tablon', x: 12, y: 22, sign: 'INSTRUCCIÓN 1/2026', sub: '⚖️', w: 14, label: 'Tablón: causas de excusa',
          look(g) {
            g.doc('⚖️ Instrucción 1/2026 de la Junta Electoral de Zona', `<p><b>Sobre las excusas de los miembros de mesa</b> (versión para el público, con dibujos no incluidos).</p>
              <p><b>1. Plazo.</b> Las excusas se presentan dentro de los <b>7 días naturales</b> siguientes a la notificación. Se presenta <b>un</b> documento acreditativo por persona.</p>
              <p><b>2. Causas admisibles</b> (deben afectar al <b>día de la votación</b>):</p>
              <ol type="a">
                <li>Enfermedad o incapacidad que impida acudir ese día, acreditada con certificado médico oficial.</li>
                <li>Viaje, curso o compromiso ineludible <b>contratado antes de la fecha de notificación</b>, con justificante <b>a nombre del propio interesado</b>.</li>
                <li>Ser <b>contrayente</b> de un matrimonio celebrado ese día. Los invitados no cuentan, por mucha barra libre que haya.</li>
              </ol>
              <p><b>3. No son causas:</b> motivos laborales (para eso está el permiso retribuido), compromisos deportivos, «tener cosas», horóscopos ni cuñados.</p>
              <p class="small">La Junta agradece su colaboración. Y la exige.</p>`);
          } },
        { id: 'callejero', x: 31, y: 22, sign: 'CALLEJERO ELECTORAL', sub: '🗺️', w: 14, label: 'Callejero electoral del distrito 03',
          look(g) {
            g.doc('🗺️ Callejero electoral — Distrito 03', `<table class="tbl">
              <tr><td><b>Calle o tramo</b></td><td><b>Sección · Mesas</b></td></tr>
              <tr><td>C/ del Trámite, impares del 1 al 49</td><td>012 · A (A–L), B (M–Z)</td></tr>
              <tr><td>C/ del Trámite, impares del 51 al 99</td><td>013 · A (A–F), B (G–Ñ), C (O–Z)</td></tr>
              <tr><td>C/ del Trámite, números pares</td><td>014 · U (mesa única)</td></tr>
              <tr><td>Plaza de la Ventanilla</td><td>015 · A (A–L), B (M–Z)</td></tr>
              <tr><td>Avda. del Silencio Administrativo</td><td>016 · U (mesa única)</td></tr></table>
              <p>Dentro de cada sección, la mesa se asigna por la <b>inicial del primer apellido</b>.</p>
              <p class="small">Formato oficial: DD-SSS-M (distrito, sección, mesa). Ejemplo: 05-021-B.</p>`);
          } },
        { id: 'cartel', x: 50, y: 16, sign: 'SI TE TOCA, TE TOCA', sub: '🗳️', w: 14, label: 'Cartel institucional',
          look(g) { g.say('«Formar parte de una mesa electoral es un deber cívico». Debajo, a boli: «y una lotería que nadie quiere ganar».'); } },
        { id: 'calendario', x: 64, y: 18, emoji: '📅', s: 5, label: 'Calendario: lunes 11 de mayo',
          look(g) { g.say('Lunes 11 de mayo de 2026. Alguien ha rodeado la fecha en rojo y ha escrito: «Último día de excusas para los notificados el día 4. Hoy viene todo el barrio».'); } },
        { id: 'reloj', x: 76, y: 16, emoji: '🕰️', s: 4, label: 'Reloj de pared',
          look(g) { g.say('13:45. La Junta cierra a las 14:00. El funcionario ya ha empezado a ordenar los bolígrafos, que es su forma de despedirse.'); } },
        { id: 'funcionario', x: 82, y: 46, emoji: '🧑‍💼', s: 8, label: 'Funcionario de la Junta',
          look(g) {
            if (!g.flag('excusa')) return g.say('—Negociado de excusas. ¿Le ha tocado mesa? Enhorabuena. ¿Viene a excusarse? Como todos. Entrégueme UN documento que acredite una causa de la Instrucción 1/2026. Uno. Esto no es un bufé libre.', 'Funcionario de la Junta');
            l1Mesa(g);
          },
          use: {
            congreso(g) {
              if (g.flag('excusa')) return g.say('—Ya le admití la excusa. Ahora dígame su mesa.', 'Funcionario de la Junta');
              g.take('congreso'); g.set('excusa'); g.sfx('stamp');
              g.say('—A su nombre, pagado el 28 de abril, antes de la notificación, y coincide con el domingo 24. Pues... ¡EXCUSA ADMITIDA! Queda usted relevado/a como vocal primero.', 'Funcionario de la Junta');
              g.say('—Ah, un momento, que me sale un aviso. El presidente titular de su mesa se ha excusado esta mañana. Y su suplente. Y el suplente del suplente. Todos con el mismo congreso, fíjese. Así que el cargo de PRESIDENTE/A recae en... usted. Para presidentes no cabe excusa: ese plazo era de cinco minutos y acaba de terminar.', 'Funcionario de la Junta');
              g.say('—Le preparo la credencial. Dígame su mesa (hábleme cuando la tenga). ¿Cómo que no la sabe? Viene en la notificación. Ah, el café. Pues búsquela.', 'Funcionario de la Junta');
            },
            ...Object.fromEntries(Object.entries(L1_REJECT).map(([k, t]) => [k, (g) => { if (!['notificacion', 'dni'].includes(k)) g.sfx('bad'); g.say(t, 'Funcionario de la Junta'); }])),
          } },
        { id: 'abrigo', x: 6, y: 47, emoji: '🧥', s: 7, label: 'Tu abrigo, en el perchero',
          look(g) {
            if (g.flag('abrigo')) return g.say('Un clínex usado y un caramelo de 2019. Ninguno es excusa.');
            g.set('abrigo'); g.give('notificacion'); g.give('dni');
            g.say('En los bolsillos: la notificación (con su mancha de café, cortesía del desayuno) y tu DNI.');
          } },
        { id: 'carpeta', x: 24, y: 70, emoji: '📂', s: 5, label: 'Tu carpeta de excusas',
          look(g) {
            if (g.flag('carpeta')) return g.say('La carpeta está vacía. Ahora solo contiene esperanza.');
            g.set('carpeta'); g.give('invitacion'); g.give('certMedico'); g.give('billete');
            g.say('Abres la carpeta de las excusas: una invitación de boda, un certificado médico y un billete de avión. Algo tiene que valer.');
          } },
        { id: 'movil', x: 35, y: 72, emoji: '📱', s: 4, label: 'Tu móvil',
          look(g) {
            if (g.flag('movil')) return g.say('Notificaciones: 14 grupos de WhatsApp comentando que a alguien le ha tocado mesa. Ese alguien eres tú.');
            g.set('movil'); g.give('congreso'); g.give('whatsapp');
            g.say('Rebuscas en el correo y en los mensajes. Capturas dos cosas: la inscripción a un congreso al que ibas a ir y un mensaje de tu jefe.');
          } },
        { id: 'cunado', x: 50, y: 72, emoji: '🧔', s: 8, label: 'Tu cuñado (te ha acompañado)',
          look(g) {
            if (g.flag('cunado')) return g.say('—Si no cuela lo del crucero, di que tienes alergia a las urnas. A mí me funcionó en 2019. Bueno, no me funcionó.', 'Tu cuñado');
            g.set('cunado'); g.give('crucero');
            g.say('—Toma, la reserva de mi crucero. Enséñasela, que esta gente no mira los nombres. Lo sé de buena tinta.', 'Tu cuñado');
          } },
        { id: 'periodico', x: 15, y: 84, emoji: '📰', s: 4, label: 'Periódico en el banco',
          look(g) { g.say('Horóscopo de la semana. Libra: «Evite las urnas el día 24». Lástima que la Instrucción diga que los horóscopos no son causa. La Junta ya lo había pensado.'); } },
        { id: 'cola', x: 86, y: 82, emoji: '🧍‍♀️🧍🧍‍♂️', s: 5, label: 'Gente esperando su turno',
          look(g) {
            g.say('—Yo he traído un certificado de que soy alérgico al metacrilato de las urnas. —¿Y le han creído? —Me han puesto de suplente.', 'Alguien de la cola');
          } },
      ],
      hints: [
        'Recoge todos los papeles (abrigo, carpeta, móvil y lo que te ofrezca tu cuñado) y lee la Instrucción 1/2026 del tablón. Compara cada fecha con la de la notificación (4 de mayo) y la de las elecciones (24 de mayo).',
        'Solo vale un documento a tu nombre, contratado ANTES del 4 de mayo y que coincida con el día 24. Después, para la mesa: tu calle y número están en el DNI; el callejero da la sección, y la inicial de tu primer apellido, la letra.',
        'Entrega la inscripción del congreso al funcionario. Luego háblale: C/ del Trámite, 67 (impar entre 51 y 99) → sección 013; apellido Paciente (P, entre O y Z) → mesa C. Escribe 03-013-C.',
      ],
    },

    // ------------------------------------------------------ 2
    {
      title: 'Voto por correo',
      place: 'Oficina de Correos de Villatrámite',
      stars: 2,
      intro: 'Jueves 21 de mayo, 13:40. Último día para depositar el voto por correo. La oficina cierra a las 14:00, el dispensador de turnos está «en modernización» y tu resguardo ha pasado por la lavadora.<br><br><b>Objetivo:</b> recoge tu documentación electoral, prepara el voto siguiendo las instrucciones al pie de la letra y entrégalo en la ventanilla.',
      outro: 'Voto depositado, certificado y urgente. A la salida te aborda una mujer con chaleco y tres móviles: es la directora de «Argumentarios Universales, S.L.», la consultora que escribe los discursos de TODOS los partidos («sale más barato»). —Le he visto deducir un capicúa en la cola. Nos falta un redactor. Esta noche hay mitin.',
      scene: { wall: '#f2e2a0', floor: '#8e8a80', floorH: 32, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 40, t: 54, w: 46, h: 11 },
        { kind: 'box', l: 0, t: 6, w: 100, h: 3, color: '#1f3f7a' },
        { emoji: '📦', x: 76, y: 82, s: 5, o: 0.9 }, { emoji: '📦', x: 70, y: 86, s: 4, o: 0.85 },
        { emoji: '🪑', x: 38, y: 82, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'aviso', x: 10, y: 24, sign: 'AVISO', sub: '🔀', w: 11, label: 'Cartel de aviso',
          look(g) {
            g.doc('🔀 AVISO A LOS USUARIOS', `<p>Por obras de modernización, los botones del dispensador de turnos están <b>cruzados</b>:</p>
              <p>cada botón da el turno del servicio que figura en el botón situado a su <b>DERECHA</b>. El último botón da el turno del primero.</p>
              <p class="small">Disculpen las molestias. Llevamos así desde 2019. La modernización avanza a buen ritmo.</p>`);
          } },
        { id: 'dispensador', x: 10, y: 55, emoji: '🎟️', s: 6, label: 'Dispensador de turnos', look: l2Dispensador },
        { id: 'pantalla', x: 28, y: 14, emoji: '📺', s: 5, label: 'Pantalla de turnos',
          look(g) { g.say('Pantalla: «A-998 · B-111 · C-046 · D-300». Todas las colas van por el número anterior al siguiente tique. Es lo único que funciona en esta oficina.'); } },
        { id: 'capicua', x: 28, y: 35, sign: '¿SABÍA QUE...?', sub: '🔢', w: 12, label: 'Cartel «¿Sabía que...?»',
          look(g) {
            g.doc('🔢 ¿SABÍA QUE...?', `<p>Para evitar falsificaciones, todos los números de solicitud de voto por correo son <b>capicúas</b> (se leen igual al derecho que al revés) y la <b>suma de sus cifras es 26</b>.</p>
              <p class="small">Lo diseñó un comité de expertos. Tardaron dos años. El comité sigue reuniéndose, por si acaso.</p>`);
          } },
        { id: 'instrucciones', x: 47, y: 24, sign: 'CÓMO VOTAR POR CORREO', sub: '✉️', w: 15, label: 'Instrucciones oficiales',
          look(g) {
            g.doc('✉️ Instrucciones para el voto por correo', `<ol>
              <li>Introduzca la papeleta de su elección (<b>UNA</b>) en el <b>sobre de votación</b>, de color sepia. Si desea votar en blanco, no introduzca ninguna.</li>
              <li><b>Cierre</b> el sobre de votación.</li>
              <li>Introduzca el sobre de votación, ya cerrado, en el <b>sobre dirigido a la Mesa</b>, junto con el <b>certificado de inscripción en el censo</b>. El certificado <b>nunca</b> va dentro del sobre de votación: rompería el secreto del voto.</li>
              <li>Cierre el sobre dirigido a la Mesa y entréguelo en ventanilla, que lo enviará certificado y urgente. Gratis. (A nosotros también nos sorprende.)</li></ol>
              <p class="small">Nota: el adhesivo de los sobres es de la anterior legislatura y ya no pega. Utilice la barra de pegamento del mostrador.</p>`);
          } },
        { id: 'reloj', x: 63, y: 13, emoji: '🕐', s: 4, label: 'Reloj: 13:52',
          look(g) { g.say('13:52. Cierran a las 14:00. A las 13:55 empiezan a «cuadrar caja», que es como se dice «no le atiendo» en idioma postal.'); } },
        { id: 'ventanilla', x: 72, y: 38, sign: 'VENTANILLA 3', sub: '👩‍💼', w: 13, label: 'Ventanilla 3 — Voto por correo',
          look(g) {
            if (g.flag('atendido')) return g.say('—Ya tiene su documentación. Siga el folleto al pie de la letra, cierre bien los sobres y tráigame el sobre dirigido a la Mesa. Me quedan siete minutos de paciencia.', 'Funcionaria de Correos');
            g.say('—Ventanilla 3, voto por correo. Por turno, por favor. ¿Tiene número?', 'Funcionaria de Correos');
          },
          use: {
            turno(g) {
              if (g.flag('atendido')) return g.say('—Ya le atendí. El número ya no le sirve: guárdelo de recuerdo.', 'Funcionaria de Correos');
              const s = g.flag('serv');
              if (s !== 'C') { g.take('turno'); g.sfx('bad'); return g.say(`—Este número es de ${L2_SERV[s]}. Aquí solo voto por correo. Vuelva a coger número. Y lea los carteles, que los ponemos para algo.`, 'Funcionaria de Correos'); }
              if (!g.has('dni')) return g.say('—¿Y el DNI? Sin DNI no le doy ni la hora.', 'Funcionaria de Correos');
              g.input({
                title: '📮 Recogida de documentación', text: '—Dígame el número de solicitud (5 cifras). Viene en su resguardo.',
                numeric: true, maxLen: 5,
                check: (v) => v === '54845',
                failText: (v) => (v.length < 5 ? '—Son cinco cifras. Ni una más ni una menos.' : (v[0] !== '5' || v[2] !== '8') ? '—Eso no coincide ni con lo poco que se lee del resguardo.' : '—No me consta esa solicitud. Y fíjese que eso lo digo poco.'),
                ok: () => {
                  g.take('turno'); g.set('atendido');
                  ['papeletas', 'sobreVotacion', 'sobreMesa', 'certificado'].forEach((k) => g.give(k));
                  g.say('—Solicitud 54845, capicúa y suma 26. Correcta. Aquí tiene: papeletas, sobre de votación, sobre dirigido a la Mesa y certificado censal. Prepárelo según el folleto y tráigamelo. Rapidito.', 'Funcionaria de Correos');
                },
              });
            },
            sobreListo(g) {
              g.take('sobreListo'); g.sfx('stamp');
              g.say('—Sobre de la Mesa, cerrado, con su sobre de votación y su certificado. Certificado y urgente... ¡PAM! Son las 13:59. Le ha sobrado un minuto. Eso aquí es casi un récord.', 'Funcionaria de Correos');
              g.win();
            },
            sobreMesa(g) { g.say('—Sin cerrar no lo acepto: se le saldría el voto por el camino. Y luego vienen las reclamaciones.', 'Funcionaria de Correos'); },
            sobreVoto(g) { g.say('—¿El sobre de votación solo? No. Va dentro del sobre dirigido a la Mesa, con el certificado. Lea el folleto.', 'Funcionaria de Correos'); },
            sobreVotoAbierto(g) { g.say('—Eso está abierto y suelto. ¿Usted ha leído el folleto o lo ha usado de abanico?', 'Funcionaria de Correos'); },
            resguardo(g) { g.say('—Esto es una pelota de papel. Primero coja número. Y luego dígame la solicitud de memoria, si puede.', 'Funcionaria de Correos'); },
          } },
        { id: 'pegamento', x: 56, y: 58, emoji: '🧴', s: 4, label: 'Barra de pegamento (encadenada al mostrador)',
          look(g) { g.say('Una barra de pegamento atada al mostrador con una cadena de 30 centímetros. Material sensible: la última se la llevaron en 2017.'); },
          use: {
            sobreVotoAbierto(g) { g.take('sobreVotoAbierto'); g.give('sobreVoto'); g.sfx('stamp'); g.say('Pegas bien la solapa del sobre de votación. Cerrado. Secreto. Irreversible. Como un buen voto.'); },
            sobreVotacion(g) { g.take('sobreVotacion'); g.give('sobreVoto'); g.set('voto', 'en blanco'); g.sfx('stamp'); g.say('Cierras el sobre de votación vacío: voto en blanco. Respetable. Y el más barato de imprimir.'); },
            sobreMesa(g) {
              if (!g.flag('inVoto') || !g.flag('inCert')) return g.say(`Antes de cerrarlo, ¿no falta algo dentro? Ahora mismo lleva: ${[g.flag('inVoto') ? 'el sobre de votación' : '', g.flag('inCert') ? 'el certificado' : ''].filter(Boolean).join(' y ') || 'aire'}.`);
              g.take('sobreMesa'); g.give('sobreListo'); g.sfx('stamp');
              g.say('Cierras el sobre dirigido a la Mesa. Ahora sí: listo para la ventanilla.');
            },
            papeletas(g) { g.say('Las papeletas no se pegan. Ni a la pared, ni entre sí, ni a nada.'); },
            '*'(g) { g.say('El pegamento es para cerrar sobres electorales. Lo pone en la cadena.'); },
          } },
        { id: 'bolso', x: 24, y: 80, emoji: '👜', s: 5, label: 'Tu bolso',
          look(g) {
            if (g.flag('bolso')) return g.say('Tíquets, un cargador y una piruleta de Correos de 2011. Nada útil.');
            g.set('bolso'); g.give('dni'); g.give('resguardo');
            g.say('En el bolso: tu DNI y el resguardo de la solicitud del voto por correo... que pasó por la lavadora.');
          } },
        { id: 'cola', x: 8, y: 82, emoji: '🧓🧑‍🦱', s: 5, label: 'Cola',
          look(g) { g.say('—Yo vine a recoger un paquete en marzo. Me dieron número de Giros. Desde entonces solo hago giros.', 'Señor de la cola'); } },
        { id: 'buzon', x: 93, y: 60, emoji: '📮', s: 7, label: 'Buzón amarillo',
          look(g) { g.say('Un buzón amarillo con un cartel: «NO introduzca aquí su voto por correo. Sí, ya sabemos que es un buzón de correos».'); } },
        { id: 'paquete', x: 86, y: 82, emoji: '📦', s: 5, label: 'Paquete retenido',
          look(g) { g.say('«Paquete retenido en aduana: pague 1,99 €». Es de 2023. Nadie lo ha reclamado. Probablemente sea una estafa en sí mismo.'); } },
      ],
      combos: {
        'papeletas+sobreVotacion'(g) { l2Papeleta(g); },
        'papeletas+sobreVotoAbierto'(g) { g.say('Ya hay una papeleta dentro. Una. Si metes otra distinta, voto nulo; si es igual, solo cuenta una. No te compliques.'); },
        'certificado+sobreVotacion'(g) { g.sfx('bad'); g.say('¡Quieto! El certificado NUNCA va dentro del sobre de votación: rompería el secreto del voto. Lo dice el folleto en negrita.'); },
        'certificado+sobreVotoAbierto'(g) { g.sfx('bad'); g.say('¡Quieto! El certificado NUNCA va dentro del sobre de votación: rompería el secreto del voto.'); },
        'certificado+sobreMesa'(g) { g.take('certificado'); g.set('inCert'); g.say('Metes el certificado censal en el sobre dirigido a la Mesa.'); },
        'sobreMesa+sobreVoto'(g) { g.take('sobreVoto'); g.set('inVoto'); g.say('Metes el sobre de votación, ya cerrado, dentro del sobre dirigido a la Mesa. Matrioska electoral.'); },
        'sobreMesa+sobreVotoAbierto'(g) { g.say('Primero cierra el sobre de votación. Lo dice el folleto: punto 2.'); },
        'sobreMesa+sobreVotacion'(g) { g.say('¿Vacío y sin cerrar? Si quieres votar en blanco, primero cierra el sobre de votación (vacío). Si no, mete antes una papeleta.'); },
        'papeletas+sobreMesa'(g) { g.say('Las papeletas sueltas no van en el sobre de la Mesa: van dentro del sobre de votación.'); },
        'dni+resguardo'(g) { g.say('Juntos no hacen un número de solicitud. Pero el resguardo y el cartel «¿Sabía que...?» quizá sí.'); },
      },
      hints: [
        'Primero coge número: el cartel de aviso explica qué botón da realmente el turno de voto por correo. En tu bolso tienes el DNI y el resguardo.',
        'El número de solicitud es capicúa y sus cifras suman 26: 5 ? 8 ? ? → 5 a 8 a 5. Después sigue el folleto: papeleta en el sobre de votación, ciérralo con el pegamento del mostrador, mételo con el certificado en el sobre dirigido a la Mesa y cierra este también.',
        'Pulsa el botón B (da el turno C). Usa el turno en la ventanilla: solicitud 54845. Combina papeletas + sobre de votación (cualquier opción menos «dos papeletas»), usa el sobre en el pegamento, combínalo con el sobre de la Mesa, añade el certificado, usa el sobre de la Mesa en el pegamento y entrégalo en la ventanilla 3.',
      ],
    },

    // ------------------------------------------------------ 3
    {
      title: 'El mitin',
      place: 'Polideportivo municipal — mitin de FAROL',
      stars: 3,
      intro: 'Polideportivo de Villatrámite, 21:55. Mitin de cierre de FAROL. Banderitas, confeti y un candidato, Anselmo Rotonda, que sale en cinco minutos... con el teleprompter en blanco.<br><br>Argumentarios Universales te ha encargado el discurso. Hay que montarlo con frases de catálogo, y el argumentario del partido es muy estricto (y está desordenado).<br><br><b>Objetivo:</b> carga en el teleprompter un discurso (una frase por bloque) que cumpla TODAS las normas del argumentario vigente.',
      outro: 'Anselmo Rotonda lee el discurso sin entenderlo, el público aplaude sin escucharlo y la tele lo emite sin cortarlo. Un éxito. Mañana, «Otros miran al pasado; nosotros miramos al futuro» lo dirán otros cuatro candidatos: es lo que tiene compartir consultora. Tu siguiente encargo: recoger una encuesta recién salida del horno.',
      scene: { wall: '#3d4a5c', floor: '#b07d4f', floorH: 36, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 30, t: 56, w: 40, h: 8 },
        { kind: 'box', l: 32, t: 22, w: 3, h: 34, color: '#d35400' }, { kind: 'box', l: 65, t: 22, w: 3, h: 34, color: '#d35400' },
        { kind: 'counter', l: 80, t: 57, w: 17, h: 6 },
        { kind: 'rug', l: 36, t: 74, w: 28, h: 18, color: '#7a4a2a' },
      ],
      hotspots: [
        { id: 'pancarta', x: 50, y: 12, sign: 'FAROL', sub: '¡Rotondas para todos!', w: 24, label: 'Pancarta de FAROL',
          look(g) { g.say('«FAROL — ¡Rotondas para todos!». La pancarta es reversible: por detrás pone «ALA — ¡Un lema para cada ocasión!». La imprenta es la misma. La consultora, también.'); } },
        { id: 'marcador', x: 86, y: 14, sign: 'LOCAL 0 · VISITANTE 0', sub: 'Aplausómetro', w: 16, label: 'Marcador del polideportivo',
          look(g) { g.say('El marcador hace de aplausómetro. Récord: 112 decibelios, el día que un candidato dijo «futuro» tres veces seguidas y regaló bocadillos.'); } },
        { id: 'espejo', x: 9, y: 26, emoji: '🪞', s: 5, label: 'Espejo del camerino (con un pósit)',
          look(g) {
            g.doc('🪞 Pósit pegado en el espejo', `<div class="paper-note"><p><b>CORRECCIÓN DE ÚLTIMA HORA</b></p>
              <p>Lo de que «futuro» suene <b>tres</b> veces era para el mitin de ayer. Hoy, <b>DOS</b>. Ni una más ni una menos.</p>
              <p>Todo lo demás del argumentario, igual.</p><p>— La Dirección</p></div>`);
          } },
        { id: 'jefa', x: 22, y: 49, emoji: '👩‍💼', s: 7, label: 'Jefa de campaña',
          look(g) {
            g.say('—¡Por fin! El teleprompter está vacío y el candidato sale en cinco minutos. Elige una frase por bloque y que cumpla TODO el argumentario. La primera página está en la carpeta del atril. La segunda... la tenía en la mano hace un rato. Y la Dirección siempre deja correcciones en el espejo.', 'Jefa de campaña');
          } },
        { id: 'teleprompter', x: 39, y: 48, emoji: '🖥️', s: 6, label: 'Teleprompter', look: l3Teleprompter },
        { id: 'carpeta', x: 50, y: 50, emoji: '📁', s: 5, label: 'Carpeta del atril',
          look(g) {
            g.doc('📁 Argumentario oficial de FAROL — Página 1', `<p><b>NORMAS PARA DISCURSOS</b> (de obligado cumplimiento)</p>
              <ol><li><b>Cero cifras.</b> Una cifra se puede comprobar; un adjetivo, no.</li>
              <li><b>Al rival no se le nombra nunca</b>, ni por su nombre ni por su cargo. Se le llama «otros» o «ellos».</li>
              <li>La palabra «<b>futuro</b>» debe sonar exactamente <b>TRES</b> veces en el discurso. Ni una más (empalaga) ni una menos (parece que no tenemos).</li></ol>
              <p class="small">Continúa en la página 2.</p>`);
          } },
        { id: 'candidato', x: 62, y: 46, emoji: '👨‍🦲', s: 8, label: 'Anselmo Rotonda, candidato de FAROL',
          look(g) { g.say('—Yo leo lo que me pongan. Si pone rotondas, rotondas. Si pone «futuro», futuro. Si pone «pausa dramática», lo leo también: me pasó en Villaespera, y aún me aplauden por ello.', 'Anselmo Rotonda'); } },
        { id: 'papelera', x: 9, y: 64, emoji: '🗑️', s: 5, label: 'Papelera',
          look(g) {
            g.doc('🗑️ Una hoja arrugada: Argumentario — Página 2', `<p><i>(Alguien la ha usado para envolver un bocadillo. Se lee perfectamente.)</i></p>
              <ol start="4"><li>Prohibidas las palabras «<b>promesa</b>», «<b>promesas</b>» y «<b>prometemos</b>». Dan mal fario.</li>
              <li>La palabra «<b>gente</b>» tiene que salir <b>al menos una vez</b>. La gente quiere oír «gente».</li>
              <li>El <b>bocadillo</b>, como mucho, <b>una vez</b>. El catering lo comparten todos los partidos y no vamos a hacerles publicidad.</li></ol>`);
          } },
        { id: 'catering', x: 88, y: 50, emoji: '🥪', s: 5, label: 'Mesa del catering',
          look(g) { g.say('Bocadillos de calamares con una banderita de FAROL. Mañana, los mismos bocadillos llevarán la de ALA. El catering es lo único en lo que todos los partidos están de acuerdo.'); } },
        { id: 'publico', x: 50, y: 84, emoji: '🙌🙌🙌', s: 5, label: 'Público',
          look(g) { g.say('—Yo vengo a todos los mitines. A los de todos los partidos. Por el bocadillo y por el ambiente. A quién voto ya lo decidiré en el bocadillo número veinte.', 'Señor del público'); } },
        { id: 'canon', x: 80, y: 80, emoji: '🎉', s: 5, label: 'Cañón de confeti',
          look(g) { g.say('Un cañón de confeti cargado con papelitos naranjas. Si alguien lo dispara antes de tiempo, el candidato se queda sin final. Ha pasado. Dos veces.'); } },
        { id: 'banderitas', x: 22, y: 82, emoji: '🚩', s: 5, label: 'Caja de banderitas',
          look(g) { g.say('Banderitas de FAROL. En el fondo de la caja quedan algunas de ALA, de UVA y de TIC. Mismo proveedor, mismo palo, distinto color.'); } },
      ],
      hints: [
        'El argumentario está repartido: la página 1 en la carpeta del atril, la página 2 arrugada en la papelera... y la Dirección ha dejado una corrección de última hora en el espejo del camerino.',
        'Normas vigentes: sin cifras, sin nombrar rivales (ni por cargo), sin «promesa/prometemos», «gente» al menos una vez, «bocadillo» como mucho una vez y «futuro» exactamente DOS veces (no tres: lo corrige el pósit).',
        'Saludo: «¡Hola, gente!...». Diagnóstico: «Durante años, otros...». Promesa: «Bajaremos los impuestos...». Ataque: «Otros miran al pasado...». Cierre: «¡Por el futuro, por la gente, por las rotondas!».',
      ],
    },

    // ------------------------------------------------------ 4
    {
      title: 'La encuesta',
      place: 'Instituto demoscópico «Cocina & Sondeos»',
      stars: 3,
      intro: 'Te envían a recoger el «Barómetro de mayo» al instituto <b>Cocina &amp; Sondeos</b>. El nombre no es una metáfora: las encuestas se hacen, literalmente, en una cocina. La nota de prensa ya ha salido: «TIC, primera fuerza».<br><br>El becario jura que hay dos cifras cocinadas y ha bloqueado la puerta trasera hasta que alguien lo demuestre.<br><br><b>Objetivo:</b> encuentra las dos cifras manipuladas de la nota y calcula sus valores reales.',
      outro: 'El becario abre la puerta trasera: —Gracias. Lo publicaré en el tablón de la facultad, que es donde no lo lee nadie. La nota cocinada abre igualmente todos los informativos. Mientras, otra urgencia: Paz Equidistante, candidata de NIDAC, se ha quedado encerrada en un ascensor inaugurado sin terminar. El debate es en una hora y la consultora necesita un doble. Adivina quién.',
      scene: { wall: '#e9e4d8', floor: '#9c9a92', floorH: 34, pattern: 'tiles' },
      init(g) { g.set('datos', false); },
      decor: [
        { kind: 'counter', l: 30, t: 56, w: 40, h: 10 },
        { kind: 'shelf', l: 44, t: 30, w: 16, h: 2 },
        { kind: 'window', l: 76, t: 8, w: 11, h: 24 },
        { emoji: '🍳', x: 66, y: 53, s: 3, o: 0.9 },
      ],
      hotspots: [
        { id: 'puerta', x: 5, y: 48, emoji: '🚪', s: 10, label: 'Puerta trasera (teclado de 4 cifras)',
          look(g) {
            g.input({
              title: '🚪 Puerta trasera', text: 'El becario ha puesto un teclado: «Los valores REALES de las dos cifras cocinadas, en el orden en que aparecen en la nota de prensa. Dos cifras cada uno».',
              numeric: true, maxLen: 4,
              check: (v) => v === '1816',
              failText: (v) => (v === '2314' ? 'Esas son las cifras cocinadas. El becario quiere las reales.' : v === '1618' ? 'Los valores parecen buenos... pero el orden es el de la nota de prensa.' : 'La puerta no se abre. El becario, desde dentro: «Pondera por la población, no por las entrevistas».'),
              ok: () => { g.say('—¡Eso es! TIC no tiene un 23: tiene un 18. Y UVA no tiene un 14: tiene un 16. Les han «ponderado» por las entrevistas, que es como ponderar con la mano en la balanza. ¡Abro!', 'Becario'); g.win(); },
            });
          } },
        { id: 'nota', x: 18, y: 22, sign: 'BARÓMETRO DE MAYO', sub: '📊', w: 14, label: 'Nota de prensa (ya publicada)',
          look(g) {
            g.doc('📊 Nota de prensa — Barómetro de mayo', `<p><b>«TIC, PRIMERA FUERZA»</b></p>
              <table class="tbl"><tr><td><b>Estimación de voto</b></td><td><b>%</b></td></tr>
              <tr><td>📱 TIC</td><td>23</td></tr><tr><td>🪁 ALA</td><td>22</td></tr><tr><td>🏮 FAROL</td><td>19</td></tr>
              <tr><td>🍺 CAÑA</td><td>14</td></tr><tr><td>🍇 UVA</td><td>14</td></tr><tr><td>🧭 NIDAC</td><td>6</td></tr><tr><td>Otros / NS-NC</td><td>5</td></tr></table>
              <p class="small">Encuesta realizada por Cocina &amp; Sondeos para un cliente que prefiere no ser nombrado (TIC). Margen de error: ± lo que haga falta. Que la suma no dé 100 es un efecto de la cocción.</p>`);
          } },
        { id: 'tele', x: 36, y: 17, emoji: '📺', s: 6, label: 'Televisión',
          look(g) { g.say('—«...y según el último barómetro, TIC sería primera fuerza. Hemos preguntado a TIC y están de acuerdo con la encuesta». Corte a publicidad.', 'Informativo'); } },
        { id: 'recetario', x: 49, y: 25, emoji: '📕', s: 4, label: 'Recetario de la casa',
          look(g) {
            g.doc('📕 Recetario de Cocina &amp; Sondeos', `<p><b>Receta n.º 1: la ponderación</b> (la de verdad)</p>
              <p>Cada grupo de edad pesa lo que pesa en la <b>POBLACIÓN</b>, no lo que pesa en la muestra. Para cada partido, multiplica su porcentaje en cada grupo por el peso de ese grupo en la población, y suma.</p>
              <p><i>Ejemplo — Partido del Ejemplo: 10 % (18–34), 20 % (35–54), 30 % (55–74), 40 % (75+). Con pesos de población 20 %, 30 %, 30 % y 20 %: 10×0,20 + 20×0,30 + 30×0,30 + 40×0,20 = 2 + 6 + 9 + 8 = <b>25 %</b>.</i></p>
              <p><b>Receta n.º 2: la cocina</b> (la de la casa)</p>
              <p>Ingredientes: un cliente, dos cifras y mucha cara. Se sube al cliente y se baja a quien le haga sombra. Las demás cifras, ni tocarlas: así nadie sospecha.</p>`);
          } },
        { id: 'especiero', x: 56, y: 25, emoji: '🧂', s: 4, label: 'Especiero',
          look(g) { g.say('Tarros etiquetados: «Margen de error», «Voto oculto», «Indecisos al gusto», «Tendencia» y uno vacío: «Rigor». Se acabó en 2008.'); } },
        { id: 'telefono', x: 68, y: 22, emoji: '☎️', s: 4, label: 'Teléfono',
          look(g) { g.say('Suena. —¿Cocina &amp; Sondeos? Soy de TIC. ¿Para cuándo la siguiente? Queremos salir primeros otra vez, pero esta vez con más margen.', 'Teléfono'); } },
        { id: 'chef', x: 22, y: 56, emoji: '👨‍🍳', s: 8, label: 'Director demoscópico (chef)',
          look(g) { g.say('—Una encuesta es como un cocido: lo importante no son los garbanzos, es lo que le echas. Y yo le echo lo que me pide el cliente. Eso se llama «estimación».', 'Director demoscópico'); } },
        { id: 'horno', x: 40, y: 75, emoji: '🔥', s: 6, label: 'Horno (encendido)',
          look(g) {
            if (g.flag('datos')) return g.say('El horno sigue encendido. Ahora mismo se está gratinando la próxima encuesta.');
            g.say('¡Quema! Dentro, en una bandeja, se están dorando los datos crudos de la encuesta. Sin algo para protegerte las manos, ni lo intentes.');
          },
          use: {
            manopla(g) {
              if (g.flag('datos')) return g.say('Ya sacaste los datos. Lo que queda dentro es la encuesta de junio, y aún está cruda.');
              g.set('datos'); g.sfx('pick');
              g.say('Con la manopla sacas la bandeja y extiendes los datos crudos sobre la encimera. Huelen a tostado, pero se leen bien.');
            },
          } },
        { id: 'encimera', x: 47, y: 54, emoji: '📋', s: 5, label: 'Datos crudos (sobre la encimera)', show: (g) => g.flag('datos'),
          look(g) {
            g.doc('📋 Datos crudos — intención de voto por grupo de edad (%)', `<table class="tbl">
              <tr><td><b>Partido</b></td><td><b>18–34</b></td><td><b>35–54</b></td><td><b>55–74</b></td><td><b>75+</b></td></tr>
              <tr><td>📱 TIC</td><td>40</td><td>15</td><td>15</td><td>5</td></tr>
              <tr><td>🪁 ALA</td><td>15</td><td>25</td><td>25</td><td>20</td></tr>
              <tr><td>🏮 FAROL</td><td>10</td><td>20</td><td>20</td><td>25</td></tr>
              <tr><td>🍺 CAÑA</td><td>15</td><td>15</td><td>15</td><td>10</td></tr>
              <tr><td>🍇 UVA</td><td>5</td><td>10</td><td>20</td><td>30</td></tr>
              <tr><td>🧭 NIDAC</td><td>10</td><td>10</td><td>0</td><td>5</td></tr>
              <tr><td>Otros / NS-NC</td><td>5</td><td>5</td><td>5</td><td>5</td></tr></table>
              <p class="small">Cada columna suma 100. Grasa añadida: 0 %. Sal: al gusto del cliente.</p>`);
          } },
        { id: 'olla', x: 60, y: 52, emoji: '🍲', s: 5, label: 'Olla a fuego lento',
          look(g) { g.say('«Estimación de voto, a fuego lento». Dentro flotan unos indecisos. El chef dice que se reparten solos al hervir.'); } },
        { id: 'cajon', x: 62, y: 76, emoji: '🗃️', s: 5, label: 'Cajón de la cocina',
          look(g) {
            if (g.flag('mano')) return g.say('Cubiertos, un abrelatas y una calculadora con la tecla «=» gastada de tanto usarla al revés.');
            g.set('mano'); g.give('manopla');
            g.say('Entre cucharones y encuestas de 2019 encuentras una manopla de horno.');
          } },
        { id: 'nevera', x: 88, y: 50, emoji: '🧊', s: 9, label: 'Nevera (con imanes)',
          look(g) {
            g.doc('🧊 Ficha técnica (sujeta con un imán de «I ❤ Muestreo»)', `<p><b>Universo:</b> residentes en Ventanilla Alta, mayores de 18 años. <b>Muestra:</b> 1.000 entrevistas.</p>
              <table class="tbl"><tr><td><b>Grupo de edad</b></td><td><b>Peso en la población</b></td><td><b>Entrevistas</b></td></tr>
              <tr><td>18–34</td><td>20 %</td><td>400</td></tr><tr><td>35–54</td><td>30 %</td><td>200</td></tr>
              <tr><td>55–74</td><td>30 %</td><td>200</td></tr><tr><td>75 o más</td><td>20 %</td><td>200</td></tr></table>
              <p class="small">Los jóvenes están sobrerrepresentados porque contestan por Instagram. Para corregirlo existe la ponderación (ver recetario).</p>`);
          } },
        { id: 'becario', x: 76, y: 60, emoji: '🧑‍🎓', s: 7, label: 'Becario',
          look(g) {
            g.say('—Lo he visto con mis propios ojos: han cocinado DOS cifras de la nota de prensa. Las demás están bien ponderadas.', 'Becario');
            g.say('—He bloqueado la puerta trasera con un código: los valores reales de esas dos cifras, en el orden en que salen en la nota. Los datos crudos están en el horno, que es donde se cocinan las cosas aquí.', 'Becario');
          } },
      ],
      hints: [
        'Necesitas tres cosas: la nota de prensa (pared), la ficha técnica (en la nevera) y los datos crudos (en el horno: busca antes algo para no quemarte). El recetario explica cómo ponderar.',
        'Pondera cada partido por el peso de cada grupo en la POBLACIÓN (20 %, 30 %, 30 %, 20 %), no por las entrevistas. Compara con la nota: solo dos cifras no coinciden.',
        'TIC real: 40×0,2 + 15×0,3 + 15×0,3 + 5×0,2 = 18 (la nota dice 23). UVA real: 5×0,2 + 10×0,3 + 20×0,3 + 30×0,2 = 16 (la nota dice 14). TIC sale antes en la nota: código 1816.',
      ],
    },

    // ------------------------------------------------------ 5
    {
      title: 'El debate',
      place: 'Plató de la Televisión Autonómica',
      stars: 3,
      intro: 'Paz Equidistante (NIDAC) sigue encerrada en el ascensor, así que te ponen su chaqueta, su peinado y su pinganillo. Nadie notará el cambio: en los debates nadie mira a nadie.<br><br>El asesor ha sido claro: aquí no se viene a responder. Se viene a <i>no</i> responder... con estilo y según el manual.<br><br><b>Objetivo:</b> supera las seis preguntas del debate sin contestar a ninguna y cumpliendo TODAS las normas del asesor.',
      outro: 'Fin del debate. Ninguno de los seis candidatos ha respondido a nada, y los sondeos de la noche dan ganadores a los seis. Paz Equidistante sale del ascensor, ve la repetición y suspira: «Ni yo lo habría esquivado mejor». Llega el domingo 24 de mayo. A las 8:00 te espera tu mesa.',
      scene: { wall: '#1f2a44', floor: '#2b2b35', floorH: 30, pattern: 'plain' },
      decor: [
        { kind: 'screen', l: 30, t: 22, w: 40, h: 4 },
        { kind: 'rug', l: 20, t: 72, w: 60, h: 22, color: '#3a4f7a' },
        { emoji: '💡', x: 20, y: 6, s: 3, o: 0.9 }, { emoji: '💡', x: 80, y: 6, s: 3, o: 0.9 },
      ],
      hotspots: [
        { id: 'cartel', x: 50, y: 12, sign: 'NIDAC', sub: '«Ni sí, ni no, sino todo lo contrario»', w: 26, label: 'Cartel de NIDAC (tras tu atril)',
          look(g) { g.say('El lema oficial de NIDAC, tal cual: «Ni sí, ni no, sino todo lo contrario». Lo escribió un comité de doce personas. Seis querían «sí» y seis «no».'); } },
        { id: 'moderadora', x: 50, y: 38, emoji: '👩‍💼', s: 7, label: 'Matilde Repregunta, moderadora',
          look(g) { g.say('—Bienvenida, candidata. Cuando esté lista, colóquese en su atril. Le advierto que yo repregunto. Es mi apellido y mi vocación.', 'Matilde Repregunta'); } },
        { id: 'r_ala', x: 12, y: 58, emoji: '👩‍🦰', s: 6, tag: 'ALA', label: 'Remedios Titular (ALA)',
          look(g) { g.say('—Yo tengo un lema adecuado para cada pregunta. Y para cada respuesta, otro. Para esta conversación, por ejemplo: «Hablando se entiende la gente (que nos vota)».', 'Remedios Titular'); } },
        { id: 'r_farol', x: 24, y: 58, emoji: '👨‍🦲', s: 6, tag: 'FAROL', label: 'Anselmo Rotonda (FAROL)',
          look(g) { g.say('—Esta noche pienso inaugurar una rotonda en el plató. Ya tengo la tijera y la cinta. Me falta la rotonda, pero eso es un detalle técnico.', 'Anselmo Rotonda'); } },
        { id: 'r_cana', x: 36, y: 58, emoji: '🧔', s: 6, tag: 'CAÑA', label: 'Paco Terraza (CAÑA)',
          look(g) { g.say('—Si el debate dura más de hora y media, propondré un descanso para el vermú. Es nuestra única propuesta, pero es firme.', 'Paco Terraza'); } },
        { id: 'atril', x: 50, y: 62, emoji: '🎤', s: 6, tag: 'NIDAC', label: 'Tu atril',
          look(g) {
            if (!g.has('pinganillo')) return g.say('—¡Alto! ¿Sin pinganillo? ¡Si no le oye el asesor, a ver qué dice usted! Pase antes por maquillaje.', 'Regidor');
            g.say('Te colocas en el atril. Se enciende el piloto rojo. Tres, dos, uno...', 'Plató');
            l5Debate(g, 0);
          } },
        { id: 'r_uva', x: 64, y: 58, emoji: '👵', s: 6, tag: 'UVA', label: 'Maripaz Queja (UVA)',
          look(g) { g.say('—Me quejo de la iluminación, del atril, del orden de intervención y de que no me hayan dejado quejarme antes.', 'Maripaz Queja'); } },
        { id: 'r_tic', x: 76, y: 58, emoji: '🧑‍💻', s: 6, tag: 'TIC', label: 'Borja Disruptivo (TIC)',
          look(g) { g.say('—Voy a disrumpir el debate con una presentación de 84 diapositivas. Sin contenido, pero con transiciones.', 'Borja Disruptivo'); } },
        { id: 'r_zig', x: 88, y: 58, emoji: '🪧', s: 5, tag: 'ZIGZAG', label: 'Atril vacío de ZIGZAG',
          look(g) { g.say('Atril de ZIGZAG. Confirmaron que venían, luego que no, luego que sí. Al final mandaron un comunicado diciendo que habían ganado el debate.'); } },
        { id: 'manual', x: 7, y: 26, emoji: '📘', s: 5, label: 'Manual del asesor (camerino)',
          look(g) {
            g.doc('📘 Manual del Buen Esquivador — Asesoría de NIDAC', `<ol>
              <li>Jamás digas «<b>sí</b>» ni «<b>no</b>». Tampoco «claro», «por supuesto» ni «en absoluto», que son síes y noes disfrazados.</li>
              <li>Si la pregunta trae una <b>cifra</b>, responde con cifras <b>mayores</b>: todas las cifras que digas deben superar a la de la pregunta. Si la pregunta no trae cifras, tú tampoco.</li>
              <li>Si te preguntan por el <b>futuro</b>, habla del <b>pasado</b> (la herencia recibida). Si te preguntan por el <b>pasado</b>, habla del <b>futuro</b>.</li>
              <li>Nunca pronuncies el nombre de otro candidato. Para eso existe la palabra «<b>otros</b>».</li></ol>
              <p class="small">Hay más normas, pero son secretas. Hasta para el manual.</p>`);
          } },
        { id: 'espejo', x: 93, y: 26, emoji: '🪞', s: 5, label: 'Espejo de maquillaje (con un pósit)',
          look(g) { g.doc('🪞 Pósit en el espejo', '<div class="paper-note"><p>Si te preguntan por <b>CORRUPCIÓN</b>: habla del <b>tiempo</b>. Del meteorológico. Solo del tiempo.</p><p>— El asesor</p></div>'); } },
        { id: 'maquillaje', x: 8, y: 84, emoji: '💄', s: 4, label: 'Mesa de maquillaje',
          look(g) {
            if (g.flag('ping')) return g.say('Polvos, laca y un pintalabios «rojo moción de censura». Aquí ya no queda nada para ti.');
            g.set('ping'); g.give('pinganillo');
            g.say('La maquilladora te empolva la nariz y te coloca el pinganillo de Paz Equidistante. —Escúchalo bien, que el asesor ya está hablando.', 'Maquilladora');
          } },
        { id: 'camara', x: 30, y: 84, emoji: '🎥', s: 6, label: 'Cámara 2',
          look(g) { g.say('Cámara 2. El cámara te susurra: —Si dudas, mira a la cámara con cara de estadista. Funciona hasta cuando no dices nada. Sobre todo cuando no dices nada.', 'Cámara'); } },
        { id: 'regidor', x: 92, y: 84, emoji: '🎧', s: 6, label: 'Regidor',
          look(g) { g.say('—Una respuesta fuera del manual y corto a publicidad. Y repetimos desde la primera pregunta: en la tele autonómica no se nota. Hemos repetido debates enteros y la audiencia ha subido.', 'Regidor'); } },
      ],
      hints: [
        'Las normas están repartidas: el manual del camerino (4 normas), un pósit en el espejo, el pinganillo (recógelo en maquillaje y escúchalo) y el lema del cartel. Cada respuesta tiene que cumplirlas TODAS.',
        'Fíjate en si la pregunta habla del pasado o del futuro, si trae cifras (y cuál) o si va de corrupción. En la repregunta, repite tu respuesta anterior EXACTA (ojo a «más» y «tan»). En el minuto de oro, solo el lema exacto.',
        '1) «Cuando llegamos, otros habían dejado las cuentas temblando...». 2) «En el futuro votaremos 30 veces a favor...». 3) «Fíjese qué tiempo más bueno está haciendo para la época.» 4) La misma, idéntica. 5) «Cuando llegamos, otros habían dejado 300 baches...». 6) «Ni sí, ni no, sino todo lo contrario.»',
      ],
    },

    // ------------------------------------------------------ 6
    {
      title: 'Jornada electoral',
      place: 'Colegio «Silencio Positivo» — Mesa 03-013-C',
      stars: 4,
      intro: 'Domingo 24 de mayo, 19:40. Llevas doce horas presidiendo la mesa. El vocal duerme, la interventora de UVA protesta por todo y el apoderado de FAROL ha traído bocadillos para tres días.<br><br>Quedan los últimos votantes en la cola. Luego habrá que abrir la urna y contar.<br><br><b>Objetivo:</b> decide quién puede votar, cierra la votación, haz el escrutinio y firma un acta sin errores.',
      outro: 'Acta firmada por triplicado. Llevas la copia a la Junta Electoral Provincial... donde el ordenador que reparte los escaños se ha colgado. Y adivina qué mesa falta por sumar.',
      scene: { wall: '#cfe0c9', floor: '#a29a86', floorH: 34, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 30, t: 54, w: 40, h: 9 },
        { kind: 'window', l: 72, t: 8, w: 11, h: 24 },
        { kind: 'flag', l: 88, t: 8, w: 5, h: 8 },
        { emoji: '🪑', x: 40, y: 70, s: 4, o: 0.8 }, { emoji: '🪑', x: 60, y: 70, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'censo', x: 12, y: 22, sign: 'LISTA DEL CENSO', sub: 'Mesa C · apellidos O–Z', w: 14, label: 'Lista del censo de la mesa',
          look(g) {
            const rows = [['Olmedo Rius, Fausto', '10.203.040-A', 1958], ['Ordóñez Bel, Rosario', '11.908.112-C', 1962], ['Ortega Ruiz, Remigia', '12.345.678-Z', 1941], ['Ortiz Vela, Ramón', '22.876.543-K', 1932],
              ['Paciente Sufrido/a, Ciudadano/a', '05.050.505-P', 1990], ['Palomo Ruiz, Andrés', '14.765.001-D', 1971], ['Pardo Sáez, Tomás', '33.112.009-B', 1977], ['Prieto Gual, Inés', '16.220.318-F', 1988],
              ['Quesada Luna, Amparo', '17.441.090-G', 1966], ['Quiroga Mas, Elías', '18.003.774-J', 1993], ['Rubio Prats, Nerea', '19.512.650-N', 1999], ['Ruano Pi, Celia', '20.884.216-R', 1955],
              ['Sanz Quintana, Pilar', '44.556.677-L', 1980], ['Segura Bas, Óscar', '23.190.007-S', 1983], ['Soler Vidal, Marina', '24.667.531-T', 1974], ['Toledano Mir, Eloy', '25.032.884-V', 1985],
              ['Urrutia Gil, Jon', '26.410.973-W', 1968], ['Vega Ríos, Lucía', '27.775.140-X', 2002], ['Vidal Pons, Sergio', '55.443.322-M', 1990], ['Zapata Gil, Lorenzo', '28.119.006-Y', 1949]];
            g.doc('📋 Censo — Distrito 03 · Sección 013 · Mesa C (O–Z)', `<table class="tbl"><tr><td><b>Elector/a</b></td><td><b>DNI · nacimiento</b></td></tr>${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]} · ${r[2]}</td></tr>`).join('')}</table><p class="small">20 electores. Los apellidos de la A a la Ñ votan en las mesas A y B, en el aula de al lado.</p>`);
          } },
        { id: 'correoLista', x: 29, y: 22, sign: 'VOTO POR CORREO', sub: '📮', w: 13, label: 'Lista de voto por correo',
          look(g) {
            g.doc('📮 Electores de esta mesa que solicitaron voto por correo', `<table class="tbl">
              <tr><td>Paciente Sufrido/a, Ciudadano/a</td><td>No ha llegado (Correos lo ha traspapelado)</td></tr>
              <tr><td>Sanz Quintana, Pilar</td><td>Llegado ✔</td></tr>
              <tr><td>Zapata Gil, Lorenzo</td><td>Llegado ✔</td></tr></table>
              <p class="small">Los votos por correo llegados se introducen en la urna al cerrar la votación.</p>`);
          } },
        { id: 'mural', x: 47, y: 18, sign: 'MURAL DE 3.º B', sub: '🖍️', w: 13, label: 'Mural infantil',
          look(g) { g.say('Un mural de 3.º B: «Cuando sea mayor quiero ser interventora». Al lado, otro: «Yo quiero ser abstención». El colegio tiene futuro.'); } },
        { id: 'reloj', x: 63, y: 16, emoji: '🕗', s: 5, label: 'Reloj: 19:40',
          look(g) { g.say('19:40. A las 20:00 se cierra la votación. A las 20:01 el apoderado de FAROL ya está preguntando por los resultados.'); } },
        { id: 'manual', x: 38, y: 49, emoji: '📘', s: 5, label: 'Manual del presidente de mesa',
          look(g) {
            g.doc('📘 Manual del presidente/a de mesa (extracto)', `<p><b>A) ¿Quién puede votar?</b></p><ol>
              <li>Hay que identificarse con <b>DNI, pasaporte o carné de conducir ORIGINALES</b>, con fotografía. Fotocopias, nunca. Un documento <b>caducado sí vale</b> si la foto permite reconocer al votante.</li>
              <li>El votante debe figurar en la <b>lista del censo de esta mesa</b> (y ser la persona de la lista: compruebe los datos), o presentar un <b>certificado censal específico</b>.</li>
              <li>Quien haya solicitado el <b>voto por correo</b> no puede votar en persona, aunque se arrepienta.</li>
              <li>Nadie vota dos veces. Consulte la lista numerada de votantes.</li></ol>
              <p><b>B) Escrutinio</b></p><ul>
              <li>Sobre <b>vacío</b>: voto en <b>BLANCO</b>.</li>
              <li>Varias papeletas <b>iguales</b> en un sobre: <b>un</b> voto válido.</li>
              <li>Papeletas de candidaturas <b>distintas</b> en un sobre: <b>NULO</b>.</li>
              <li>Papeleta con tachaduras, nombres tachados o añadidos, frases o dibujos: <b>NULO</b>. Las arrugas o manchas <b>involuntarias</b> no anulan.</li>
              <li>Papeleta <b>sin sobre</b> o de <b>otra elección</b>: <b>NULO</b>.</li>
              <li>Sobre que contenga, además de la papeleta, <b>cualquier objeto</b> (billetes, chicles, estampitas): <b>NULO</b>.</li></ul>`);
          } },
        { id: 'urna', x: 50, y: 47, emoji: '🗳️', s: 6, label: 'Urna',
          look(g) {
            if (!g.flag('cerrada')) return g.say('—¡La urna no se abre hasta que se cierre la votación! —grita la interventora de UVA—. ¡Protesto! —¿Por qué? —Por si acaso.');
            g.doc('🗳️ Escrutinio: los 16 sobres de la urna', `<ol>
              <li>Papeleta de ALA.</li>
              <li>Papeleta de FAROL.</li>
              <li>Sobre vacío.</li>
              <li>Dos papeletas de UVA, idénticas.</li>
              <li>Una papeleta de TIC y otra de CAÑA.</li>
              <li>Papeleta de ALA con «¡Todos iguales!» escrito a boli.</li>
              <li>Papeleta de NIDAC, arrugada y con una mancha de café (el vocal la cogió con el cortado en la mano).</li>
              <li>Papeleta de FAROL suelta, sin sobre.</li>
              <li>Papeleta de CAÑA de las elecciones municipales de 2023.</li>
              <li>Papeleta de CAÑA y un billete de 5 €.</li>
              <li>Papeleta de TIC.</li>
              <li>Papeleta de ALA.</li>
              <li>Papeleta de FAROL con el nombre del candidato tachado.</li>
              <li>Papeleta de UVA.</li>
              <li>(Voto por correo) Papeleta de NIDAC.</li>
              <li>(Voto por correo) Papeleta de CAÑA. Huele a calamares.</li></ol>`);
          } },
        { id: 'numerada', x: 62, y: 49, emoji: '📋', s: 5, label: 'Lista numerada de votantes',
          look(g) {
            const l = [['Olmedo Rius, Fausto', '9:03'], ['Ruano Pi, Celia', '9:10'], ['Quesada Luna, Amparo', '9:31'], ['Palomo Ruiz, Andrés', '9:45'], ['Soler Vidal, Marina', '10:02'], ['Prieto Gual, Inés', '10:20'],
              ['Pardo Sáez, Tomás', '10:42'], ['Segura Bas, Óscar', '11:15'], ['Urrutia Gil, Jon', '12:30'], ['Ordóñez Bel, Rosario', '13:05'], ['Toledano Mir, Eloy', '17:48'], ['Vega Ríos, Lucía', '19:22']];
            g.doc('📋 Lista numerada de votantes', `<table class="tbl">${l.map((r, i) => `<tr><td>${i + 1}. ${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table><p class="small">Han votado 12 electores hasta las 19:40.</p>`);
          } },
        { id: 'acta', x: 72, y: 66, emoji: '📝', s: 5, label: 'Acta de escrutinio', show: (g) => g.flag('cerrada'), look: l6Acta },
        { id: 'interventora', x: 20, y: 62, emoji: '👩‍🦳', s: 6, tag: 'UVA', label: 'Interventora de UVA',
          look(g) { g.say('—Protesto. —¿Por qué? —Todavía no lo sé, pero lo apunto ya y luego lo relleno. Así se gana tiempo.', 'Interventora de UVA'); } },
        { id: 'apoderado', x: 8, y: 80, emoji: '🧑‍🍳', s: 6, tag: 'FAROL', label: 'Apoderado de FAROL',
          look(g) { g.say('—¿Un bocadillo? Tengo de tortilla, de calamares y de tortilla de calamares. Si el escrutinio sale bien, hay postre.', 'Apoderado de FAROL'); } },
        { id: 'vocal', x: 50, y: 82, emoji: '😴', s: 6, label: 'Vocal primero (dormido)',
          look(g) { g.say('Zzz... —murmura algo en sueños—: «...arrugada sí vale... dos iguales cuentan una...». Duerme, pero se ha estudiado el manual.'); } },
        { id: 'cola', x: 86, y: 80, emoji: '🧍‍♂️🧓🧑‍🦱', s: 6, label: 'Cola de votantes', look: l6Cola },
        { id: 'cabina', x: 90, y: 50, emoji: '🚪', s: 8, label: 'Cabina de votación',
          look(g) { g.say('Una cabina con cortinilla. Dentro, papeletas de todos los partidos y un señor que lleva veinte minutos decidiéndose entre dos que proponen exactamente lo mismo.'); } },
      ],
      hints: [
        'Para la cola, compara a cada votante con la lista del censo (mesa C: apellidos O–Z; comprueba también DNI y año de nacimiento), la lista de voto por correo y la lista numerada. El manual dice qué documentos valen.',
        'Solo pueden votar dos: la señora del DNI caducado (caducado sí vale) y el del certificado censal específico. Después abre la urna y aplica las reglas del manual: arrugas y manchas involuntarias no anulan; dos papeletas iguales cuentan como una.',
        'Admite a Remigia Ortega y a Ulises Romero; rechaza a los otros cinco. Acta: ALA 2, FAROL 1, NIDAC 2, CAÑA 1, UVA 2, TIC 1, blancos 1, nulos 6, votantes 16.',
      ],
    },

    // ------------------------------------------------------ 7
    {
      title: 'El escrutinio',
      place: 'Junta Electoral Provincial — sala de escrutinio',
      stars: 4,
      intro: 'Domingo, 23:47. La pantalla dice «Escrutado: 99,99 %». El 0,01 % que falta es tu mesa. El informático que calcula los escaños se fue a las 23:00 («mi contrato es hasta las once») y el ordenador muestra una pantalla azul.<br><br>Los periodistas exigen resultados. El magistrado duerme. Te dan una calculadora que solo divide.<br><br><b>Objetivo:</b> reparte los 17 escaños de la circunscripción de Villatrámite y firma el acta de proclamación.',
      outro: 'Escaños proclamados: ALA 5, FAROL 5, CAÑA 3, NIDAC 2 y UVA 2. El último lo ha decidido tu mesa: NIDAC se lo quita a FAROL por medio voto de cociente. En FAROL ya están redactando un recurso contra tu acta. Y contra ti, si les dejan.',
      scene: { wall: '#c8ccd2', floor: '#6f6a64', floorH: 32, pattern: 'carpet' },
      decor: [
        { kind: 'counter', l: 26, t: 56, w: 46, h: 8 },
        { kind: 'board', l: 63, t: 14, w: 20, h: 22 },
        { kind: 'screen', l: 38, t: 6, w: 24, h: 12 },
        { emoji: '🗄️', x: 96, y: 60, s: 5, o: 0.85 },
      ],
      hotspots: [
        { id: 'pantalla', x: 50, y: 12, sign: 'ESCRUTADO: 99,99 %', sub: '📺', w: 20, label: 'Pantalla de resultados',
          look(g) { g.say('«Escrutado: 99,99 %. Falta: Mesa 03-013-C». Llevan así una hora. Los tertulianos ya han analizado tres veces lo que podría pasar con ese 0,01 %.'); } },
        { id: 'totales', x: 16, y: 22, sign: 'HOJA DE TOTALES', sub: '🍕 (con mancha)', w: 14, label: 'Hoja de totales provisionales',
          look(g) {
            g.doc('📄 Totales provisionales — circunscripción de Villatrámite', `<p><b>A falta de la Mesa 03-013-C</b></p>
              <table class="tbl"><tr><td>🪁 ALA</td><td>5.682</td></tr><tr><td>🏮 FAROL</td><td>5.699</td></tr><tr><td>🧭 NIDAC</td><td>1.899</td></tr>
              <tr><td>🍺 CAÑA</td><td>3.2🍕🍕</td></tr><tr><td>🍇 UVA</td><td>2.606</td></tr><tr><td>📱 TIC</td><td>1.032</td></tr>
              <tr><td><b>Total votos a candidaturas</b></td><td><b>20.182</b></td></tr>
              <tr><td>Votos en blanco</td><td>707</td></tr><tr><td>Votos nulos</td><td>389</td></tr></table>
              <p class="small">Escaños a repartir: <b>17</b>. Mancha de pizza cortesía del turno de noche.</p>`);
          } },
        { id: 'ley', x: 32, y: 28, emoji: '📕', s: 4, label: 'Ley Electoral de Ventanilla Alta',
          look(g) {
            g.doc('📕 Ley Electoral de Ventanilla Alta (extracto)', `<p><b>Artículo 44.</b> 1. En cada circunscripción no se tienen en cuenta las candidaturas que no obtengan, al menos, el <b>5 % de los votos válidos</b> emitidos en ella.</p>
              <p>2. Son votos válidos los emitidos a candidaturas <b>más los votos en blanco</b>. Los votos nulos no son válidos (de ahí el nombre).</p>
              <p>3. Los escaños se atribuyen por el método D'Hondt.</p>
              <p><b>Artículo 45.</b> La circunscripción de Villatrámite elige <b>17</b> diputados y diputadas.</p>`);
          } },
        { id: 'pizarra', x: 73, y: 25, sign: "MÉTODO D'HONDT", sub: '🧮', w: 15, label: "Pizarra: el método D'Hondt",
          look(g) {
            g.doc("🧮 El método D'Hondt, explicado para concejales", `<ol>
              <li>Descarta las candidaturas que no superan la barrera (ver la Ley).</li>
              <li>Divide los votos de cada candidatura restante entre 1, 2, 3, 4... (hasta el número de escaños).</li>
              <li>Ordena todos esos cocientes de mayor a menor. Los escaños van, uno a uno, a los cocientes más altos.</li>
              <li>Si dos cocientes empatan, el escaño es para la candidatura con más votos totales.</li></ol>
              <p><i>Ejemplo: 5 escaños; A = 600 votos, B = 400, C = 210.<br>
              A: 600, 300, 200, 150 · B: 400, 200, 133 · C: 210, 105.<br>
              Cocientes mayores: 600 (A), 400 (B), 300 (A), 210 (C) y empate a 200 entre A y B → A, que tiene más votos.<br>
              Resultado: A 3, B 1, C 1.</i></p>`);
          } },
        { id: 'calculadora', x: 38, y: 51, emoji: '🧮', s: 5, label: 'Calculadora (solo divide)', look: l7Calc },
        { id: 'ordenador', x: 51, y: 50, emoji: '🖥️', s: 6, label: 'Ordenador del informático',
          look(g) { g.say('Pantalla azul: «ERROR 0x0DHONDT: el escaño 17 ha generado una excepción no controlada. Llame al informático (de 9:00 a 23:00)».'); } },
        { id: 'proclamacion', x: 63, y: 51, emoji: '✍️', s: 5, label: 'Acta de proclamación', look: l7Proclamacion },
        { id: 'chaqueta', x: 6, y: 47, emoji: '🧥', s: 7, label: 'Tu chaqueta',
          look(g) {
            if (g.flag('copia')) return g.say('En el otro bolsillo, la credencial de presidente/a de mesa. Ya es un recuerdo de guerra.');
            g.set('copia'); g.give('actaCopia');
            g.say('En el bolsillo interior: la copia del acta de tu mesa, la 03-013-C. Arrugada, pero sin café.');
          } },
        { id: 'magistrado', x: 89, y: 50, emoji: '👨‍⚖️', s: 7, label: 'Presidente de la Junta (dormido)',
          look(g) { g.say('—Zzz... cocientes... de mayor a menor... ¿quién ha dejado entrar a los nulos?... Zzz.', 'Magistrado'); } },
        { id: 'periodistas', x: 20, y: 80, emoji: '🎤📸', s: 5, label: 'Periodistas',
          look(g) { g.say('—¿Ya? ¿Ya? ¿Quién se lleva el último escaño? Llevamos dos horas en directo diciendo «todo está muy abierto».', 'Periodistas'); } },
        { id: 'pizzas', x: 52, y: 82, emoji: '🍕', s: 5, label: 'Cajas de pizza',
          look(g) { g.say('Pizzas del turno de noche. Una de ellas ha manchado justo la cifra de CAÑA. Una pena: el total de votos a candidaturas sí se lee.'); } },
        { id: 'candidatos', x: 82, y: 82, emoji: '🤵🤵‍♀️', s: 6, label: 'Candidatos esperando',
          look(g) { g.say('—Hemos ganado —dice el de FAROL. —No, hemos ganado nosotros —dice la de NIDAC. —Todos hemos ganado —dice el de TIC, que no saca escaño.', 'Candidatos'); } },
      ],
      hints: [
        'Suma tu acta (en el bolsillo de tu chaqueta) a la hoja de totales. El total de CAÑA está manchado, pero se deduce del total de votos a candidaturas.',
        "Barrera: 5 % de los votos válidos = votos a candidaturas + blancos (los nulos no cuentan). TIC se queda fuera por poco. Después, D'Hondt: divide cada total entre 1, 2, 3... y quédate con los 17 cocientes mayores.",
        'Totales con tu mesa: ALA 5.684, FAROL 5.700, NIDAC 1.901, CAÑA 3.265, UVA 2.608, TIC 1.033 (barrera: 5 % de 20.899 = 1.045; TIC fuera). El escaño 17 es de NIDAC (1.901 ÷ 2 = 950,5) frente a FAROL (5.700 ÷ 6 = 950). Reparto: ALA 5, FAROL 5, NIDAC 2, CAÑA 3, UVA 2, TIC 0.',
      ],
    },

    // ------------------------------------------------------ 8
    {
      title: 'La Junta Electoral',
      place: 'Junta Electoral Provincial — Registro',
      stars: 4,
      intro: 'Jueves 4 de junio. Te notifican un <b>recurso</b> de FAROL contra el acta de tu mesa: quieren anular un voto para recuperar «su» escaño. Como presidente/a de la mesa, puedes presentar un escrito.<br><br>Para eso hay que saber ante quién, de qué tipo y, sobre todo, hasta cuándo. Los plazos electorales son como los yogures: caducan, y no avisan.<br><br><b>Objetivo:</b> lee el recurso y presenta en Registro el escrito correcto, ante el órgano correcto y con la fecha límite exacta.',
      outro: 'Escrito registrado. Dos semanas después, la Junta desestima el recurso: «Una mancha de café involuntaria no anula un voto, salvo que el café sea de un partido». El escaño se queda en NIDAC. Resultados definitivos en las Cortes de Ventanilla Alta: nadie tiene mayoría. Ni de lejos. Empiezan los pactos.',
      scene: { wall: '#d6cdb8', floor: '#6d5a48', floorH: 32, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 56, t: 52, w: 22, h: 10 },
        { kind: 'shelf', l: 3, t: 34, w: 18, h: 2 },
        { kind: 'flag', l: 44, t: 6, w: 4, h: 7 },
        { emoji: '🪑', x: 36, y: 78, s: 5, o: 0.85 },
      ],
      hotspots: [
        { id: 'ley', x: 7, y: 28, emoji: '📕', s: 5, label: 'Ley Electoral de Ventanilla Alta (LEVA)',
          look(g) {
            g.doc('📕 Ley Electoral de Ventanilla Alta (extracto)', `<p><b>Art. 7. Cómputo de plazos.</b> Los plazos de esta Ley se cuentan en días <b>naturales</b>, salvo los del Título VI (artículos 100 a 120), que se cuentan en días <b>hábiles</b>. Son inhábiles los sábados, los domingos y los festivos nacionales, autonómicos y locales. Los plazos empiezan a contar el <b>día siguiente</b> al de la notificación.</p>
              <p><b>Art. 101. Reclamaciones.</b> Contra el escrutinio de una mesa cabe reclamación ante la Junta Electoral de Zona en el plazo de 1 día.</p>
              <p><b>Art. 108. Recurso.</b> Contra la proclamación de electos cabe recurso contencioso-electoral, que se interpone ante la Junta Electoral Provincial en el plazo de 3 días.</p>
              <p><b>Art. 110. Alegaciones.</b> Las partes afectadas por un recurso del art. 108 —incluido el presidente/a de la mesa cuya acta se impugne— podrán presentar alegaciones <b>ante la misma Junta que recibió el recurso</b>, en el plazo de <b>5 días</b> desde la notificación.</p>
              <p><b>Art. 110 bis.</b> Cuando el recurso afecte a <b>una sola mesa</b>, los plazos del artículo anterior se reducen a la mitad, redondeando hacia arriba.</p>`);
          } },
        { id: 'bova', x: 16, y: 28, emoji: '📰', s: 5, label: 'Boletín Oficial de Ventanilla Alta (BOVA)',
          look(g) {
            g.doc('📰 BOVA — Boletín Oficial de Ventanilla Alta', `<p><b>Orden 12/2026</b>, por la que se regula el uso de la palabra «sinergia» en documentos oficiales (máximo tres por página).</p>
              <p><b>Resolución</b> por la que se declara festivo local en Villatrámite el viernes 5 de junio, festividad de Santa Paciencia, patrona de la ciudad.</p>
              <p><b>Corrección de errores</b> de la Ley Electoral de Ventanilla Alta. Advertido error en el artículo 110 bis, donde dice «redondeando hacia arriba» debe decir «<b>redondeando hacia abajo</b>».</p>
              <p><b>Anuncio:</b> se encuentra en tramitación la corrección de la corrección de errores. Hasta su publicación, no surte efecto alguno.</p>`);
          } },
        { id: 'calendario', x: 30, y: 20, emoji: '📅', s: 6, label: 'Calendario laboral', look: l8Calendar },
        { id: 'guia', x: 46, y: 22, sign: 'GUÍA DEL CSV', sub: '🪞', w: 13, label: 'Guía: cómo leer el CSV',
          look(g) {
            g.doc('🪞 ¿Cómo se lee el Código Seguro de Verificación?', `<p>Por su seguridad, el CSV se imprime «<b>en espejo</b>»:</p>
              <ul><li>Cada letra se sustituye por la que ocupa su misma posición contando desde el <b>final</b> del abecedario (A↔Z, B↔Y, C↔X...; sin Ñ).</li>
              <li>Cada cifra <b>n</b> se sustituye por <b>9 − n</b> (0↔9, 1↔8...).</li></ul>
              <p>Para acceder a la Sede, introduzca el CSV <b>ya enderezado</b>.</p>
              <p class="small">Ejemplo: «ZYX-123» se endereza como «ABC-876».</p>`);
          } },
        { id: 'reloj', x: 58, y: 12, emoji: '🕐', s: 4, label: 'Reloj',
          look(g) { g.say('13:20. El Registro cierra a las 14:00, pero el plazo no se acaba hoy. Eso sí: hay que saber cuándo se acaba.'); } },
        { id: 'registro', x: 67, y: 38, sign: 'REGISTRO', sub: '🧑‍💼', w: 12, label: 'Registro de entrada', look: l8Form },
        { id: 'justicia', x: 91, y: 22, emoji: '⚖️', s: 6, label: 'Balanza de la Justicia',
          look(g) { g.say('Una balanza dorada. Uno de los platillos está calzado con un BOVA doblado. Nadie se atreve a quitarlo.'); } },
        { id: 'sede', x: 87, y: 50, emoji: '🖥️', s: 6, label: 'Terminal de la Sede',
          look(g) {
            if (g.flag('leido')) return g.doc('📄 Recurso (texto íntegro)', L8_RECURSO);
            g.input({
              title: '🖥️ Sede de la Junta', text: 'Introduzca el Código Seguro de Verificación (CSV) para consultar el documento.',
              numeric: false, maxLen: 16, placeholder: 'CSV enderezado',
              check: (v) => norm(v).replace(/[^A-Z0-9]/g, '') === 'PLAZOS2718',
              failText: (v) => (norm(v).replace(/[^A-Z0-9]/g, '') === 'KOZALH7281' ? 'Ese es el CSV tal cual, en espejo. Hay que enderezarlo antes.' : 'CSV no válido. Si lo ha escrito en espejo, enderécelo. Si lo ha enderezado, enderécelo mejor.'),
              ok: () => { g.set('leido'); setTimeout(() => g.doc('📄 Recurso (texto íntegro)', L8_RECURSO), 0); },
            });
          } },
        { id: 'carpeta', x: 40, y: 70, emoji: '📂', s: 5, label: 'Tu carpeta',
          look(g) {
            if (g.flag('notif')) return g.say('Solo queda la credencial de mesa, ya algo arrugada. La guardas como quien guarda una medalla.');
            g.set('notif'); g.give('notifRecurso');
            g.say('En tu carpeta, la notificación del recurso que te llegó a mediodía. Con un CSV muy raro.');
          } },
        { id: 'apoderado', x: 20, y: 62, emoji: '🧑‍💼', s: 7, tag: 'FAROL', label: 'Abogado de FAROL',
          look(g) { g.say('—Su mesa nos ha quitado un escaño por una papeleta con café. Una mancha es un dibujo. Un dibujo abstracto, pero un dibujo. Y un dibujo anula. Lo dice el manual... más o menos.', 'Abogado de FAROL'); } },
        { id: 'fotocopiadora', x: 58, y: 77, emoji: '🖨️', s: 7, label: 'Fotocopiadora',
          look(g) { g.say('«Fuera de servicio desde el día 5». Alguien ha añadido: «Santa Paciencia, ruega por nosotros».'); } },
        { id: 'letrados', x: 82, y: 80, emoji: '👩‍⚖️👨‍⚖️', s: 5, label: 'Letrados esperando',
          look(g) { g.say('—Los plazos son fáciles —dice uno—: hábiles o naturales, desde el día siguiente, y mirando el boletín por si hay correcciones. —¿Y si hay correcciones de las correcciones? —Entonces nos jubilamos.', 'Letrados'); } },
      ],
      hints: [
        'Endereza el CSV de la notificación con la guía (A↔Z, cifras 9 − n) y léelo en la Sede: el recurso dice ante quién se presentó y cuántas mesas afecta. Lee también la ley, el boletín (BOVA) y el calendario.',
        'Te toca presentar ALEGACIONES (art. 110), ante la misma Junta que recibió el recurso (la Provincial). Plazo: 5 días, a la mitad por afectar a una sola mesa, y el BOVA corrige el redondeo hacia ABAJO → 2 días. Son días hábiles (Título VI) desde el día siguiente a la notificación.',
        'CSV: PLAZOS-2718. Escrito: Junta Electoral Provincial · Alegaciones (art. 110) · 10 de junio (día 5 festivo local, 6 y 7 fin de semana, 8 = día 1, 9 festivo autonómico, 10 = día 2).',
      ],
    },

    // ------------------------------------------------------ 9
    {
      title: 'Los pactos',
      place: 'Cortes de Ventanilla Alta — hemiciclo',
      stars: 5,
      intro: 'Cortes de Ventanilla Alta: 81 escaños, ocho grupos y ninguna mayoría. La primera votación de investidura ya ha fracasado; en la segunda basta con <b>más síes que noes</b>. La consultora te ha nombrado «facilitador/a de consensos» (no se cobra, pero se sale en la foto).<br><br><b>Objetivo:</b> propón un gobierno que salga investido: todos sus partidos deben votar Sí y debe haber más síes que noes.',
      outro: 'Investidura aprobada: 23 síes, 17 noes y 41 abstenciones. Paz Equidistante preside un gobierno con menos de un tercio de la cámara... porque los dos grandes se abstuvieron «para que se estrellen solos». Seis meses después, la oposición registra una moción de censura. Y en la cafetería se habla de un tránsfuga.',
      scene: { wall: '#6d2b2b', floor: '#4f3526', floorH: 50, pattern: 'carpet' },
      decor: [
        { kind: 'arc' },
        { emoji: '📸', x: 6, y: 34, s: 4, o: 0.85 }, { emoji: '🎥', x: 94, y: 34, s: 4, o: 0.85 },
      ],
      hotspots: [
        ...L9_IDS.map((id) => {
          const pos = { ALA: [12, 72], CANA: [22, 55], NIDAC: [35, 47], UVA: [50, 44], TIC: [65, 47], ZIG: [78, 55], FAROL: [88, 72], ASPA: [50, 62] }[id];
          return {
            id: 'p_' + id, x: pos[0], y: pos[1], emoji: P[id].emoji, s: 6, tag: P[id].sigla,
            label: `${P[id].sigla} · ${P[id].name} (${L9_SEATS[id]} escaños)`,
            look(g) { g.say(L9_SAYS[id], `${P[id].emoji} ${P[id].lider} — ${P[id].sigla} (${L9_SEATS[id]})`); },
          };
        }),
        { id: 'reglamento', x: 18, y: 14, sign: 'REGLAMENTO', sub: 'Arts. 12 a 14', w: 14, label: 'Reglamento de las Cortes',
          look(g) {
            g.doc('📜 Reglamento de las Cortes de Ventanilla Alta', `<p><b>Art. 12.</b> El candidato o candidata a la presidencia lo propone el partido con <b>más escaños</b> de entre los que forman el gobierno propuesto.</p>
              <p><b>Art. 13.</b> En segunda votación basta la mayoría simple: <b>más síes que noes</b>. Las abstenciones no cuentan (ni en la votación ni en la vida).</p>
              <p><b>Art. 14.</b> Todos los partidos que formen el gobierno deben votar <b>Sí</b>. Un partido que no vota a su propio gobierno no es un socio: es un tertuliano.</p>`);
          } },
        { id: 'marcador', x: 50, y: 14, sign: 'CORTES DE VENTANILLA ALTA', sub: '81 escaños · 2.ª votación', w: 22, label: 'Marcador del hemiciclo',
          look(g) { g.say('81 escaños. Primera votación: fracasada (nadie llegó a 41). Segunda votación: basta con más síes que noes. Cafés servidos hoy en la cafetería: 1.204.'); } },
        { id: 'escanos', x: 5, y: 88, emoji: '📋', s: 5, label: 'Reparto de escaños',
          look(g) {
            g.doc('📋 Reparto de escaños', `<table class="tbl">${L9_IDS.map((id) => `<tr><td>${P[id].emoji} <b>${P[id].sigla}</b> — ${P[id].name} (${P[id].lider})</td><td>${L9_SEATS[id]}</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>81</b></td></tr></table>`);
          } },
        { id: 'tribuna', x: 50, y: 85, emoji: '🎤', s: 7, label: 'Tribuna de oradores', look: l9Tribuna },
        { id: 'periodista', x: 94, y: 88, emoji: '🧑‍💻', s: 5, label: 'Periodista parlamentaria',
          look(g) {
            g.say('—Un consejo gratis: ZIGZAG hace siempre exactamente lo contrario de lo que anuncia. Siempre. Si dicen Sí, votan No; si dicen No, votan Sí. Es lo único coherente que tienen.', 'Periodista parlamentaria');
            g.say('—Los demás, para mi desgracia, hacen lo que dicen. Así no hay quien escriba una crónica.', 'Periodista parlamentaria');
          } },
      ],
      hints: [
        'Habla con los ocho portavoces y lee el Reglamento: el candidato lo pone el partido más grande del gobierno, y en segunda votación las abstenciones ayudan. Pregunta a la periodista por ZIGZAG.',
        'ZIGZAG hace lo contrario de lo que anuncia: votará Sí si está DENTRO del gobierno. ALA y FAROL se abstienen si el candidato es de un partido pequeño (menos de 10 escaños). Con TIC dentro, UVA y NIDAC votan No. UVA solo entra si entra ASPA.',
        'Gobierno: NIDAC + UVA + ZIGZAG + ASPA (candidata de NIDAC). Sí: 9 + 8 + 5 + 1 = 23. No: CAÑA 11 + TIC 6 = 17. Abstención: ALA y FAROL (41).',
      ],
    },

    // ------------------------------------------------------ 10
    {
      title: 'Moción de censura',
      place: 'Cortes de Ventanilla Alta — pleno de la moción',
      stars: 5,
      intro: 'Seis meses después. FAROL presenta una moción de censura contra la presidenta Paz Equidistante. Para prosperar necesita mayoría absoluta: <b>41 síes</b>. En los pasillos solo se habla de un <b>tránsfuga</b>... y nadie sabe quién es.<br><br>Te han nombrado letrado/a provisional de las Cortes (por tu experiencia en actas). Aquí el resultado se carga en el marcador antes de votar: «así se ahorra tiempo».<br><br><b>Objetivo:</b> desenmascara al tránsfuga, descifra su mensaje y carga en el marcador los síes, noes y abstenciones exactos.',
      outro: 'Sí: 40. No: 17. Abstenciones: 24. La moción decae por un solo voto. La presidenta, agotada de tanta estabilidad, disuelve las Cortes esa misma tarde y convoca elecciones anticipadas. Al llegar a casa, en el buzón, te espera una carta certificada. De las que dan miedo.',
      scene: { wall: '#5a2430', floor: '#43302a', floorH: 50, pattern: 'carpet' },
      decor: [
        { kind: 'arc' },
        { kind: 'counter', l: 60, t: 88, w: 22, h: 6 },
        { emoji: '📸', x: 4, y: 36, s: 4, o: 0.85 },
      ],
      hotspots: [
        ...L10_SUS.map((s) => ({
          id: s.id, x: s.x, y: s.y, emoji: s.emoji, s: 6, tag: `${sig(s.party)} · ${s.seat}`,
          label: `${s.name} (${sig(s.party)}) · escaño ${s.seat}`,
          look(g) { g.say(s.says, `${s.name} — ${sig(s.party)}, escaño ${s.seat}`); },
        })),
        { id: 'portavoces', x: 15, y: 14, sign: 'JUNTA DE PORTAVOCES', sub: '📋', w: 16, label: 'Posiciones anunciadas ante la moción',
          look(g) {
            const rows = [['FAROL', 19, 'Sí', '«Es nuestra moción. Faltaría más.»'], ['CANA', 11, 'Sí', '«A cambio de terrazas.»'], ['TIC', 6, 'Sí', '«Por la disrupción.»'],
              ['ALA', 22, 'Abstención', '«Ni con FAROL ni con este gobierno.»'], ['NIDAC', 9, 'No', '«Es nuestro gobierno.»'], ['UVA', 8, 'No', '«Nos quejamos, pero de la moción.»'],
              ['ZIG', 5, 'No', '«Jamás traicionaremos a este gobierno.»'], ['ASPA', 1, 'Abstención', '«Mientras no haya autovía...»']];
            g.doc('📋 Junta de Portavoces — posiciones anunciadas', `<table class="tbl">${rows.map((r) => `<tr><td>${P[r[0]].emoji} <b>${sig(r[0])}</b> (${r[1]}) <span class="small">${r[3]}</span></td><td>${r[2]}</td></tr>`).join('')}</table>
              <p class="small">Mayoría necesaria para aprobar la moción: <b>41</b> (absoluta). Total: 81 escaños, todos presentes.</p>`);
          } },
        { id: 'marcador', x: 50, y: 14, sign: 'MARCADOR', sub: 'Moción de censura', w: 16, label: 'Marcador de votación',
          look(g) {
            g.input({
              title: '🗳️ Marcador de la moción', text: 'Carga el resultado: <b>síes, noes y abstenciones</b>, dos cifras cada uno (seis en total).',
              numeric: true, maxLen: 6,
              check: (v) => v === '401724',
              failText: (v) => {
                if (v.length < 6) return 'Seis cifras: síes (2), noes (2) y abstenciones (2).';
                const n = [+v.slice(0, 2), +v.slice(2, 4), +v.slice(4, 6)];
                if (n[0] + n[1] + n[2] !== 81) return `Eso suma ${n[0] + n[1] + n[2]} diputados. Hay 81, y hoy no falta nadie (hay barra libre en la cafetería).`;
                if (v === '411723') return 'Eso es lo que saldría si todos votaran lo que su grupo anuncia... y hoy alguien no lo hará.';
                if (v === '352224' || v === '361723' || v === '362223') return '¿De verdad crees que ZIGZAG va a votar lo que anuncia?';
                return 'La presidenta de las Cortes mira el marcador, luego a ti, y niega con la cabeza. No cuadra.';
              },
              ok: () => {
                g.say('Se vota. El marcador ya lo sabía: Sí 40, No 17, Abstenciones 24. A la moción le falta UN voto. Begoña Mudanza se abstiene mirando al techo; ZIGZAG vota Sí y anuncia por megafonía que ha votado No.', 'Presidencia de las Cortes');
                g.win();
              },
            });
          } },
        { id: 'chuleta', x: 85, y: 14, sign: 'CHULETA DEL GRUPO MIXTO', sub: '🔐', w: 16, label: 'Chuleta de cifrado (cafetería)',
          look(g) {
            g.doc('🔐 Cifrado de palabra clave (para pasarse notas en el pleno)', `<ol>
              <li>Escribe la palabra clave sin repetir letras.</li>
              <li>Detrás, el resto del abecedario (sin Ñ) en orden, saltando las letras que ya han salido. Ese es el <b>alfabeto cifrado</b>.</li>
              <li>Para cifrar: la A se escribe con la 1.ª letra del alfabeto cifrado, la B con la 2.ª, y así sucesivamente.</li>
              <li>Para descifrar, al revés: busca la letra en el alfabeto cifrado y mira qué letra ocupa esa posición en el abecedario normal.</li></ol>
              <p><i>Ejemplo, clave CAFE → alfabeto cifrado CAFEBDGHIJ... Así, «CAFE» se escribe «FCDB».</i></p>
              <p class="small">La descifradora de la sala lo hace sola: solo hay que darle la clave.</p>`);
          } },
        { id: 'periodista', x: 7, y: 86, emoji: '🧑‍💻', s: 5, label: 'Periodista parlamentaria',
          look(g) {
            g.say('—Tengo una fuente fiable: de esos cinco diputados que cuchichean en sus escaños, exactamente DOS mienten, y el tránsfuga es uno de ellos.', 'Periodista parlamentaria');
            g.say('—Y lo de siempre: ZIGZAG hace lo contrario de lo que anuncia. ASPA, en cambio, hace exactamente lo que dice: es un solo diputado, no le da para más.', 'Periodista parlamentaria');
          } },
        { id: 'maquina', x: 30, y: 84, emoji: '⌨️', s: 5, label: 'Descifradora del Grupo Mixto',
          look(g) {
            if (!g.has('servilleta')) return g.say('Una máquina de escribir modificada para descifrar notas. Sin nada que descifrar, solo hace «clac».');
            l10Maquina(g);
          },
          use: { servilleta: (g) => l10Maquina(g) } },
        { id: 'cafe', x: 71, y: 84, emoji: '☕', s: 5, label: 'Barra de la cafetería',
          look(g) { g.say('Café de la cafetería de las Cortes: 0,80 €. Subvencionado. Es lo único que se aprueba por unanimidad.'); } },
        { id: 'ujier', x: 93, y: 86, emoji: '🤵', s: 6, label: 'Ujier (guardarropa)',
          look(g) {
            if (g.has('servilleta')) return g.say('—Ya tiene lo que buscaba. Yo no he visto nada. Yo nunca veo nada: por eso llevo 30 años en el puesto.', 'Ujier');
            g.choice({
              title: '🤵 Ujier del guardarropa', text: '—Si me dice quién es el tránsfuga, le dejo mirar en los bolsillos de su abrigo. Pero si se equivoca, el abrigo equivocado presentará una querella. ¿Quién es?',
              options: L10_SUS.map((s) => ({
                label: `${s.emoji} ${s.name} (${sig(s.party)}, escaño ${s.seat})`,
                onPick(g2) {
                  if (s.id !== 'mudanza') { g2.sfx('bad'); g2.say(`—¿${s.name}? Su abrigo huele a lealtad (y a naftalina). Yo que usted lo pensaría mejor: dos de esos cinco mienten.`, 'Ujier'); return true; }
                  g2.give('servilleta'); g2.sfx('pick');
                  g2.say('—¿Begoña Mudanza? ... En el bolsillo de su abrigo hay una servilleta de la cafetería, escrita en clave. Tómela. Yo no he visto nada.', 'Ujier');
                  return true;
                },
              })),
            });
          } },
      ],
      hints: [
        'Escucha a los cinco diputados y a la periodista: exactamente dos mienten y el tránsfuga es uno de ellos. Prueba cada candidato y comprueba que salgan justo dos mentirosos. Al tránsfuga lo delata el ujier del guardarropa.',
        'El tránsfuga es Begoña Mudanza (mienten ella y Casimiro Péndulo). Su servilleta se descifra con su apellido como clave. Después, recalcula la votación: el tránsfuga cambia su voto y ZIGZAG hace lo contrario de lo que anuncia.',
        'Clave: MUDANZA. Mensaje: Mudanza (CAÑA) se abstiene sola. Sí: FAROL 19 + CAÑA 10 + TIC 6 + ZIGZAG 5 = 40. No: NIDAC 9 + UVA 8 = 17. Abstención: ALA 22 + ASPA 1 + Mudanza 1 = 24. Marcador: 401724.',
      ],
    },
  ];

  window.registerSeason({
    id: 4,
    title: 'Campaña electoral',
    subtitle: 'Te ha tocado mesa. Y lo que viene detrás.',
    badge: 'Político',
    emoji: '🗳️',
    intro: 'Una carta certificada te comunica que te ha tocado mesa electoral. Lo que empieza como un domingo perdido acaba en mitin, encuesta cocinada, debate sin respuestas, escrutinio, D\'Hondt, recursos, pactos imposibles y una moción de censura. Todos los partidos y candidatos son ficticios. Los vicios, no tanto.',
    items: ITEMS,
    levels: LEVELS,
    ending: {
      head: 'JUNTA ELECTORAL DE ZONA<br><small>Elecciones anticipadas a las Cortes de Ventanilla Alta</small>',
      title: '¡Has sobrevivido a la campaña electoral!',
      html: `<div class="s4-cred">
          <div class="s4-cred-h">🗳️ CREDENCIAL</div>
          <div><small>CARGO</small><b>PRESIDENTE/A DE MESA</b></div>
          <div><small>MESA</small><b>03-013-C</b></div>
          <div><small>CONVOCATORIA</small><b>Elecciones anticipadas (otra vez)</b></div>
        </div>
        <p>Una excusa, un voto por correo, un mitin, una encuesta cocinada, un debate sin respuestas, un escrutinio, D'Hondt, un recurso, un pacto imposible y una moción fallida por un voto.</p>
        <p>Y como premio: elecciones anticipadas. El sorteo de mesas es aleatorio, dicen. Pero en Villatrámite ya nadie se lo cree.</p>
        <p><b>Te ha vuelto a tocar mesa.</b> Tienes 7 días naturales para alegar excusa. Ya sabes cuál funciona.</p>`,
      stamp: 'TE HA VUELTO A TOCAR MESA',
    },
    css: `
      .s4-tp select, .s4-acta select { font: inherit; font-size: 14px; padding: 6px 8px; border: 2px solid var(--ink); border-radius: 8px; background: #fff; width: 100%; }
      .s4-acta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 12px; }
      @media (max-width: 520px) { .s4-acta { grid-template-columns: repeat(2, 1fr); } }
      .s4-voters { max-height: 52vh; overflow-y: auto; border: 1px solid var(--line); border-radius: 10px; background: #fff; }
      .s4-voter { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; padding: 8px 10px; border-bottom: 1px solid var(--line); font-size: 14px; }
      .s4-voter:last-child { border-bottom: 0; }
      .s4-vbtns { display: flex; flex-direction: column; gap: 6px; }
      .s4-vbtns .btn { padding: 6px 10px; font-size: 13px; }
      .s4-vbtns .btn.on[data-d="A"] { background: #e3f4e8; border-color: var(--green); box-shadow: 0 3px 0 var(--green); }
      .s4-vbtns .btn.on[data-d="R"] { background: #fde3e3; border-color: var(--red); box-shadow: 0 3px 0 var(--red); }
      .s4-num, .s4-txt { font: inherit; font-size: 16px; padding: 8px 10px; border: 2px solid var(--ink); border-radius: 10px; background: #fff; min-width: 0; width: 9em; }
      .s4-txt { width: 14em; }
      .s4-res td.s4-v-si { color: var(--green); }
      .s4-res td.s4-v-no { color: var(--red); }
      .s4-res td.s4-v-ab { color: var(--ink-soft); }
      .s4-ct { font-family: 'Courier New', monospace; font-size: 15px; letter-spacing: .06em; word-break: break-word; }
      .s4-out { font-family: 'Courier New', monospace; font-size: 15px; letter-spacing: .05em; background: #1d2a22; color: #8dffb0; padding: 10px 12px; border-radius: 10px; min-height: 44px; word-break: break-word; }
      .s4-cred { background: linear-gradient(135deg, #fff, #f1ead6); border: 2px solid var(--ink); border-radius: 12px; padding: 12px 16px; margin: 6px 0 14px; display: grid; gap: 6px; box-shadow: 0 4px 0 var(--ink); }
      .s4-cred-h { font-family: var(--type); color: var(--red); letter-spacing: .12em; font-size: 18px; }
      .s4-cred small { display: block; font-size: 10px; letter-spacing: .1em; color: var(--ink-soft); }
      .s4-cred b { font-family: var(--type); font-weight: 400; font-size: 17px; }
    `,
  });
})();
