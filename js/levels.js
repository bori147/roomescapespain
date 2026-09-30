/* ==========================================================
   VUELVA USTED MAÑANA — Definición de objetos y niveles
   Sátira. Todos los personajes, partidos y organismos son ficticios.
   ========================================================== */
(function () {
  'use strict';

  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/\s+/g, ' ').trim();

  // ---------- Nivel 9: mensaje cifrado (César +3) ----------
  const PLAIN = 'LA PUERTA SE ABRE CON LA PALABRA SILENCIO';
  const caesar = (txt, k) => txt.replace(/[A-Z]/g, (c) =>
    String.fromCharCode(((c.charCodeAt(0) - 65 + k + 26 * 10) % 26) + 65));
  const CIPHER = caesar(PLAIN, 3);

  // =========================================================
  //  OBJETOS
  // =========================================================
  window.ITEMS = {
    // Nivel 1
    justificante: { emoji: '🎫', name: 'Justificante de cita', desc: 'Justificante de cita previa: hoy, 8:02, mesa 3. Lo sostienes como si fuera un décimo premiado.' },
    // Nivel 2
    dni: { emoji: '🪪', name: 'DNI caducado', desc: 'Tu DNI. Caducado desde ayer. En la foto sales con flequillo y esperanza.' },
    euro: { emoji: '🪙', name: 'Moneda de 1 €', desc: 'Una moneda de 1 €. Probablemente de una partida presupuestaria sin ejecutar.' },
    cafe: { emoji: '☕', name: 'Cortado', desc: 'Un cortado de máquina. Huele a café y a plástico a partes iguales. A cierto tipo de funcionario le resulta irresistible.' },
    monedas: { emoji: '🪙', name: '3 monedas de 10 cts', desc: 'Tres monedas de 10 céntimos. El cambio de la cafetera.' },
    fotocopias: { emoji: '📄', name: '3 fotocopias del DNI', desc: 'Tres fotocopias de tu DNI. Una sale algo torcida. Se nota que la foto te odia.' },
    // Nivel 3
    llavecita: { emoji: '🗝️', name: 'Llavecita', desc: 'Una llave pequeña, de cajón de escritorio. Estaba entre sugerencias que nadie leyó jamás.' },
    sello: { emoji: '🔏', name: 'Sello de Registro', desc: 'Sello de «REGISTRO DE ENTRADA». Con él en la mano sientes un poder inmenso. Combínalo con algún papel.' },
    modeloP0: { emoji: '📝', name: 'Modelo P-0 (sin sellar)', desc: 'Modelo P-0: «Solicitud de alta en el padrón para quien no está en el padrón». Le falta el sello de Registro de Entrada.' },
    modeloSellado: { emoji: '📑', name: 'Modelo P-0 sellado', desc: 'Modelo P-0 con su sello de Registro de Entrada. Oficialmente, ya existes un poco más.' },
    // Nivel 4
    ticket: { emoji: '🎟️', name: 'Número A-347', desc: 'Tu turno: A-347. En pantalla van por el A-012. Haz cuentas.' },
    numeroSS: { emoji: '💳', name: 'Número de afiliación', desc: 'Tu número de afiliación a la Seguridad Social. Once cifras de pura felicidad.' },
    // Nivel 5
    usb: { emoji: '💾', name: 'Pendrive del certificado', desc: 'Pendrive con la etiqueta «CERTIFICADO FNMT — NO PERDER». Casi lo pierdes.' },
    acuse: { emoji: '🧾', name: 'Acuse de recibo', desc: 'Acuse de recibo del trámite electrónico. Registro nº 2026/000000001. Plazo de respuesta: 6 meses. Si no contestan: silencio negativo.' },
    // Nivel 6
    nomina: { emoji: '📃', name: 'Certificado de retenciones', desc: '<b>Certificado de retenciones</b> (empresa)<br>Rendimientos del trabajo, bruto anual: <b>24.000 €</b><br>Retenciones de IRPF ya practicadas: <b>3.000 €</b>' },
    donativo: { emoji: '🤝', name: 'Recibo de donativo', desc: '<b>Recibo de donativo</b> a la Asociación de Víctimas de la Burocracia: <b>1.000 €</b>.' },
    pensiones: { emoji: '✉️', name: 'Carta del plan de pensiones', desc: '<b>Plan de pensiones</b> — Aportación del año: <b>500 €</b>. Rentabilidad: mejor no preguntes.' },
    gafas: { emoji: '👓', name: 'Factura de gafas', desc: '<b>Factura de óptica</b>: gafas progresivas, <b>300 €</b>. Imprescindibles para leer la letra pequeña del BOE.' },
    renta2025: { emoji: '📂', name: 'Renta del año pasado', desc: '<b>Declaración IRPF 2025</b> (copia arrugada)<br>Casilla 505 · Base liquidable general: <b>21.340</b><br>Resultado: 3 € a devolver (todavía esperando).' },
    // Nivel 8
    informe: { emoji: '📋', name: 'Informe reconstruido', desc: 'Informe confidencial reconstruido: <i>«Clave de la caja fuerte: cuántas veces dice "no me consta" cada testigo, en este orden: tesorero, exministro y cuñado (una cifra por testigo).»</i>' },
    pendriveB: { emoji: '💽', name: 'Pendrive de la Caja B', desc: 'Pendrive con la etiqueta «CONTABILIDAD B — NO ABRIR — BORRAR — NO, MEJOR NO».' },
    // Nivel 9
    disco: { emoji: '🎡', name: 'Disco de cifrado', desc: 'Un disco de cifrado antiguo: dos anillos con el alfabeto que giran. Seguro que sirve para descifrar algo (combínalo con lo que quieras descifrar).' },
    sobre: { emoji: '✉️', name: 'Sobre cifrado', desc: `Sobre lacrado: «PARA EL CIUDADANO — CIFRADO POR SU SEGURIDAD». Dentro, una línea:<br><code class="cipher">${CIPHER}</code>` },
    // Nivel 10
    boli: { emoji: '🖊️', name: 'Bolígrafo', desc: 'El bolígrafo del ujier. Tiene tinta. En este edificio eso es casi un milagro.' },
    solicitud: { emoji: '📄', name: 'Solicitud genérica S-1', desc: 'Solicitud genérica, modelo S-1: «Solicito lo que proceda, en los términos que procedan, cuando proceda».' },
    declaracion: { emoji: '📝', name: 'Declaración responsable', desc: 'Declaración responsable en blanco. Hay que rellenarla y firmarla (¿con qué?).' },
    declaracionFirmada: { emoji: '✍️', name: 'Declaración firmada', desc: 'Tu declaración responsable, rellenada y firmada. Responsable, lo que se dice responsable, eres tú.' },
    modelo790: { emoji: '🧾', name: 'Modelo 790 (tasa)', desc: '<b>Modelo 790 — Tasa por tramitación de la salida del edificio.</b><br>Código de la tasa: <b>012</b> · Importe: <b>0,00 €</b><br><i>Para abonarla, facilite en Caja el NRC: el código de la tasa escrito al revés, seguido del número de la ventanilla de Caja.</i>' },
    justificante790: { emoji: '✅', name: 'Justificante de la tasa', desc: 'Justificante de pago de la tasa 790: 0,00 €. Pagado. Qué alivio.' },
    solicitudSellada: { emoji: '📑', name: 'Solicitud sellada', desc: 'Solicitud S-1 sellada, con la declaración responsable y la tasa grapadas. Lista para Registro.' },
    resolucion: { emoji: '📜', name: 'Resolución favorable', desc: '<b>RESOLUCIÓN FAVORABLE.</b> Notificada el <b>jueves 8 de octubre de 2026</b>.<br>Podrá abandonar el edificio <b>el día exacto</b> en que se cumplan <b>10 días hábiles</b>. El plazo se computa desde el día siguiente a la notificación. Sábados, domingos y festivos (nacionales y locales) no son hábiles. Ni un día antes, ni un día después.' },
  };

  // =========================================================
  //  MODALES ESPECÍFICOS
  // =========================================================

  // ---- Nivel 1: reloj ----
  function clockModal(g) {
    g.modal({
      title: '🕰️ Reloj de pared',
      html: `<div class="clock"><div class="clock-face" id="clockFace"></div>
        <div class="clock-ctl">
          <button class="btn" data-d="h-1">− 1 h</button><button class="btn" data-d="h1">+ 1 h</button>
          <button class="btn" data-d="m-5">− 5 min</button><button class="btn" data-d="m5">+ 5 min</button>
        </div>
        <p class="small">Las agujas se mueven con sospechosa facilidad. El reloj no aparece en ningún protocolo, así que nadie lo vigila.</p></div>`,
      onMount(el) {
        const face = el.querySelector('#clockFace');
        const upd = () => { face.textContent = `${pad(g.flag('h'))}:${pad(g.flag('m'))}`; };
        el.querySelectorAll('[data-d]').forEach((b) => {
          b.onclick = () => {
            const d = b.dataset.d; const n = +d.slice(1);
            if (d[0] === 'h') g.set('h', (g.flag('h') + n + 24) % 24);
            else g.set('m', (g.flag('m') + n + 60) % 60);
            g.sfx('click'); upd();
          };
        });
        upd();
      },
    });
  }

  // ---- Nivel 4: ventanillas ----
  const L4_SOL = ['firma', 'caja', 'info', 'sellos', 'registro'];
  const L4_NAMES = { firma: 'Firma', caja: 'Caja', info: 'Información', sellos: 'Sellos', registro: 'Registro' };
  const L4_OK = {
    firma: '—Firme aquí, aquí y aquí. ¿Que qué firma? Eso ya lo verá en Caja.',
    caja: '—Son 0,00 €. Pero hay que pagarlos. ¿Efectivo o tarjeta? ...Ya está.',
    info: '—Le informo de que ha llegado usted a Información. Siga, siga.',
    sellos: '¡PAM! ¡PAM! ¡PAM! Tres sellos, uno de cada color. El funcionario suda de satisfacción.',
    registro: '—Registrado. Aquí tiene su número de afiliación. No lo pierda, que el siguiente es en 2031.',
  };
  function ventanilla(g, key) {
    const who = `Ventanilla de ${L4_NAMES[key]}`;
    if (g.has('numeroSS')) return g.say('—Ya tiene su número. Váyase antes de que nos arrepintamos.', who);
    if (!g.has('ticket')) return g.say('—¿Tiene número? Sin número, usted no existe.', who);
    if (g.flag('turno') !== 347) return g.say(`—No es su turno. Estamos atendiendo al A-${pad(g.flag('turno'), 3)}.`, who);
    const seq = g.flag('seq') || [];
    if (L4_SOL[seq.length] === key) {
      seq.push(key); g.set('seq', seq);
      g.say(L4_OK[key], who);
      if (seq.length === L4_SOL.length) g.give('numeroSS');
      else g.sfx('stamp');
    } else {
      g.set('seq', []);
      g.sfx('bad');
      g.say('—Esto no es aquí. Tiene que pasar antes por otra ventanilla. Vuelva a empezar el procedimiento desde el principio, por favor.', who);
    }
  }

  // ---- Nivel 5: sede electrónica ----
  const BROWSERS = ['Google Chrome 131', 'Mozilla Firefox 133', 'Safari 18', 'Microsoft Edge (modo Internet Explorer)'];
  const JAVAS = ['Java 8', 'Java 17', 'Java 21'];
  const AUTOFIRMAS = ['Autofirma 1.7', 'Autofirma 1.8.3', 'Autofirma 1.9'];
  function sedeModal(g) {
    g.modal({
      title: '🏛️ Sede Electrónica',
      cls: 'sede',
      html: '<div id="sede"></div>',
      onMount(el) {
        const box = el.querySelector('#sede');
        const opt = (arr, cur) => arr.map((o, i) => `<option value="${i}" ${cur === i ? 'selected' : ''}>${o}</option>`).join('');
        const render = () => {
          let html = '<div class="sede-banner">Sede Electrónica de la Administración<br><small>«Su trámite, a un clic» (y 47 pasos)</small></div>';
          html += `<ol class="sede-steps"><li class="${g.flag('cfgOK') ? 'done' : 'cur'}">Entorno</li><li class="${g.flag('certOK') ? 'done' : g.flag('cfgOK') ? 'cur' : ''}">Certificado</li><li class="${g.flag('pinOK') ? 'done' : g.flag('certOK') ? 'cur' : ''}">Cl@ve PIN</li></ol>`;
          if (!g.flag('cfgOK')) {
            const c = g.flag('cfg') || [0, 2, 1];
            html += `<p>Paso 1: configure su entorno. <small>(Consulte los requisitos técnicos.)</small></p>
              <label>Navegador <select id="sB">${opt(BROWSERS, c[0])}</select></label>
              <label>Máquina virtual <select id="sJ">${opt(JAVAS, c[1])}</select></label>
              <label>Cliente de firma <select id="sA">${opt(AUTOFIRMAS, c[2])}</select></label>
              <button class="btn primary" id="sGo">Comprobar requisitos</button>`;
          } else if (!g.flag('certOK')) {
            if (!g.flag('usbIn')) {
              html += '<p>Paso 2: seleccione su certificado electrónico.</p><div class="sede-err">No se ha detectado ningún certificado. Inserte el dispositivo que lo contiene (¿dónde lo guardaste?).</div>';
            } else {
              html += `<p>Paso 2: certificado <b>FNMT — CIUDADANO/A</b> detectado.</p>
                <label>Contraseña del certificado <input type="password" id="sPw" autocomplete="off"></label>
                <button class="btn primary" id="sPwGo">Acceder</button>`;
            }
          } else if (!g.flag('pinOK')) {
            html += `<p>Paso 3: identificación reforzada mediante <b>Cl@ve PIN</b>.</p>
              <button class="btn" id="sReq">${g.flag('pinReq') ? 'Reenviar PIN por SMS' : 'Solicitar PIN por SMS'}</button>
              <label>PIN recibido <input type="text" inputmode="numeric" id="sPin" autocomplete="off"></label>
              <button class="btn primary" id="sPinGo">Validar</button>`;
          } else {
            html += '<div class="sede-ok">✔ Trámite presentado correctamente.<br><small>Recibirá respuesta en un plazo máximo de 6 meses. Si no la recibe, entienda que es que no.</small></div>';
          }
          html += '<div class="sede-msg" id="sMsg"></div>';
          box.innerHTML = html;
          const msg = (t, bad) => { const m = box.querySelector('#sMsg'); m.innerHTML = t; m.className = 'sede-msg ' + (bad ? 'bad' : 'good'); };
          const go = box.querySelector('#sGo');
          if (go) {
            go.onclick = () => {
              const c = ['#sB', '#sJ', '#sA'].map((s) => +box.querySelector(s).value);
              g.set('cfg', c);
              if (c[0] === 3 && c[1] === 0 && c[2] === 2) { g.set('cfgOK'); g.sfx('ok'); render(); }
              else {
                g.sfx('bad');
                msg(`${rand(['Se ha producido un error inesperado. Inténtelo más tarde.', 'Error desconocido. Contacte con el administrador del sistema (no sabemos quién es).', 'El componente de firma no responde. O no quiere.', 'Su entorno no cumple los requisitos. No podemos decirle cuáles.'])} <small>(Código ERR-${Math.floor(1000 + Math.random() * 8999)})</small>`, true);
              }
            };
          }
          const pw = box.querySelector('#sPwGo');
          if (pw) {
            const inp = box.querySelector('#sPw');
            const f = () => {
              if (norm(inp.value).replace(/\s/g, '') === 'TOBI2015') { g.set('certOK'); g.sfx('ok'); render(); }
              else { g.sfx('bad'); msg('Contraseña incorrecta. Le quedan ∞ intentos (esto es lo único ilimitado de la Sede).', true); inp.value = ''; }
            };
            pw.onclick = f; inp.onkeydown = (e) => { if (e.key === 'Enter') f(); };
            inp.focus();
          }
          const rq = box.querySelector('#sReq');
          if (rq) {
            rq.onclick = () => { g.set('pinReq'); g.sfx('pick'); render(); msg('📱 PIN enviado a su móvil. Tiene 10 minutos. Corra.'); };
            const inp = box.querySelector('#sPin');
            const f = () => {
              if (!g.flag('pinReq')) { g.sfx('bad'); msg('Primero tiene que solicitar el PIN. Como todo en la vida.', true); return; }
              if (inp.value.replace(/\D/g, '') === '842') {
                g.set('pinOK'); g.give('acuse'); g.sfx('ok'); render();
                g.say('La impresora escupe un acuse de recibo. Por fin. Ya puedes salir de casa.', 'Sede Electrónica');
              } else { g.sfx('bad'); msg('PIN incorrecto o caducado. Los PIN caducan. Como los DNI.', true); inp.value = ''; }
            };
            box.querySelector('#sPinGo').onclick = f; inp.onkeydown = (e) => { if (e.key === 'Enter') f(); };
          }
        };
        render();
      },
    });
  }

  // ---- Nivel 6: Renta Web ----
  function rentaModal(g) {
    if (!g.flag('refOK')) {
      return g.input({
        title: '🖥️ Renta Web — Identificación',
        text: 'Para acceder a su borrador, introduzca su número de referencia: <b>la casilla 505 de su declaración del año anterior</b> (5 cifras, sin puntos).',
        numeric: true, maxLen: 5,
        check: (v) => v === '21340',
        failText: () => 'Referencia incorrecta. ¿Seguro que es la casilla 505 del año pasado?',
        ok: () => { g.set('refOK'); rentaModal(g); },
      });
    }
    g.modal({
      title: '🖥️ Renta Web — Borrador',
      html: `<div class="doc-body"><p><b>BORRADOR DE DECLARACIÓN IRPF 2026</b></p>
        <p>Hacienda ya ha calculado su declaración por usted. Qué detalle.</p>
        <p class="big-num">Resultado: 1.200 € <span class="good">a devolver</span></p>
        <p class="small">Nota: el borrador no incluye donativos, planes de pensiones ni ningún dato que usted conozca mejor que nosotros. Revíselo. O no, y ya le escribiremos.</p></div>`,
      buttons: [
        { label: 'Confirmar borrador', onClick() {
          g.sfx('bad');
          g.say('Envías el borrador... A los tres segundos llega una notificación: «Requerimiento. Propuesta de liquidación provisional. Sanción: 600 €». Mejor revisa tú los números.', 'Agencia Tributaria');
        } },
        { label: 'Modificar declaración', cls: 'primary', onClick() {
          setTimeout(() => g.input({
            title: '🧮 Resultado de la declaración',
            text: 'Calcule usted mismo el resultado <b>a ingresar</b> (en euros, sin decimales). Tenga a mano sus documentos y las reglas del cartel.',
            numeric: true, maxLen: 5,
            check: (v) => +v === 750,
            failText: (v) => +v === 1200 ? 'Eso es lo que dice el borrador... y el borrador está mal.' : rand(['Hacienda ha revisado sus números y no le salen. ¿Qué es deducible y qué no?', 'Cálculo incorrecto. Recuerde: tramos progresivos, y luego reste lo que ya le retuvieron.', 'Incorrecto. Su asesor fiscal (su cuñado) tampoco lo sabe.']),
            ok: () => {
              g.say('«Declaración presentada. Resultado: 750 € a ingresar.» Te duele, pero es correcta. Hacienda somos todos. Unos más que otros.', 'Agencia Tributaria');
              g.win();
            },
          }), 0);
        } },
      ],
    });
  }

  // ---- Nivel 7: coalición ----
  const PARTIES = [
    { id: 'PPA', name: 'Partido Por Aplazar', seats: 120, color: '#2e5fa3', emoji: '🎩',
      demand: '—Somos la lista más votada. Con el PRR, jamás: ni en el gobierno ni en el ascensor.' },
    { id: 'PRR', name: 'Partido del Refrito Reformista', seats: 110, color: '#c0392b', emoji: '🔁',
      demand: '—¿Pactar con el PPA? Ni a tomar un café. Bueno, un café sí, pero pagando a medias.' },
    { id: 'VYV', name: 'Ya Veremos', seats: 40, color: '#8e44ad', emoji: '🔮',
      demand: '—Entraremos solo en un gobierno sin el PPA. Y que no pase de 200 escaños: no queremos rodillos.' },
    { id: 'TRM', name: 'Tractor y Mar', seats: 25, color: '#27ae60', emoji: '🚜',
      demand: '—Solo entramos si también entra el PSA. El campo y el aparcamiento van de la mano (sobre todo en fiestas).' },
    { id: 'PIN', name: 'Partido Indeciso Nacional', seats: 11, color: '#7f8c8d', emoji: '🤷',
      demand: '—Entraremos... o no. Bueno: solo si el gobierno lo forman al menos cinco partidos. Así la culpa se reparte.' },
    { id: 'PSA', name: 'Partido de los Sin Aparcamiento', seats: 19, color: '#e67e22', emoji: '🚗',
      demand: '—Con la CPM, nunca: se van de puente y dejan el coche en doble fila. Y queremos que en el gobierno haya algún partido más pequeño que nosotros, para sentirnos grandes.' },
    { id: 'CPM', name: 'Coalición Puente de Mayo', seats: 24, color: '#16a085', emoji: '🏖️',
      demand: '—Con Ya Veremos, nunca. Por lo demás nos da igual: estaremos de vacaciones.' },
    { id: 'UNO', name: 'Uno Solo', seats: 1, color: '#d4ac0d', emoji: '☝️',
      demand: '—Mi escaño solo se ofrece si es decisivo: si sin mí no hay mayoría. A cambio, un AVE para mi pueblo (240 habitantes).' },
  ];
  const SEATS = Object.fromEntries(PARTIES.map((p) => [p.id, p.seats]));
  const RULES = [
    { p: 'PPA', bad: (s) => s.has('PRR'), msg: 'El PPA abandona el hemiciclo: «¿Con el PRR? ¡Jamás! (hasta las próximas elecciones)».' },
    { p: 'PRR', bad: (s) => s.has('PPA'), msg: 'El PRR se levanta indignado: «¿Con el PPA? Antes muertos. O en la oposición, que es parecido».' },
    { p: 'VYV', bad: (s) => s.has('PPA'), msg: 'Ya Veremos vota que no: «Con el PPA no, ya lo dijimos. Bueno, lo dijimos... ya veremos. No.»' },
    { p: 'VYV', bad: (s, t) => t > 200, msg: 'Ya Veremos se niega: «Más de 200 escaños es un rodillo. No participaremos en esa apisonadora».' },
    { p: 'TRM', bad: (s) => !s.has('PSA'), msg: 'Tractor y Mar se abstiene: «Sin el PSA no entramos. ¿Dónde vamos a aparcar el tractor?».' },
    { p: 'PIN', bad: (s) => s.size < 5, msg: 'El Partido Indeciso se echa atrás: «Con menos de cinco partidos, la culpa tocaría a demasiado».' },
    { p: 'PSA', bad: (s) => s.has('CPM'), msg: 'El PSA vota en contra: «¿Con la CPM? ¡Si nos tienen el coche bloqueado desde el puente!».' },
    { p: 'PSA', bad: (s) => ![...s].some((id) => SEATS[id] < SEATS.PSA), msg: 'El PSA se queja: «Aquí todos son más grandes que nosotros. Así no nos sentimos importantes».' },
    { p: 'CPM', bad: (s) => s.has('VYV'), msg: 'La CPM no se presenta a votar: «¿Con Ya Veremos? Ya veremos... que no». (Además, estaban en la playa.)' },
    { p: 'UNO', bad: (s, t) => t - 1 >= 176, msg: 'Uno Solo se ofende: «Si mi voto no es decisivo, ¿para qué me quieren? Me abstengo. Y sin AVE».' },
  ];
  function coalitionModal(g) {
    g.modal({
      title: '🎤 Votación de investidura',
      cls: 'wide',
      html: '<div id="coal"></div>',
      onMount(el) {
        const box = el.querySelector('#coal');
        const sel = new Set(g.flag('coal') || []);
        const render = (msg, bad) => {
          const t = [...sel].reduce((a, id) => a + SEATS[id], 0);
          box.innerHTML = `<p class="small">Elige qué partidos apoyan la investidura. Mayoría absoluta: <b>176</b> de 350. Cada partido tiene sus condiciones: consulta a sus portavoces.</p>
            <div class="party-grid">${PARTIES.map((p) => `<button class="party ${sel.has(p.id) ? 'on' : ''}" data-id="${p.id}" style="--pc:${p.color}">
              <span class="p-emoji">${p.emoji}</span><span class="p-name"><b>${p.id}</b> ${p.name}</span><span class="p-seats">${p.seats}</span></button>`).join('')}</div>
            <div class="seatbar"><div class="seatfill ${t >= 176 ? 'maj' : ''}" style="width:${(t / 350) * 100}%"></div><div class="seatmark" style="left:${(176 / 350) * 100}%"><span>176</span></div></div>
            <p class="seat-total">Apoyos: <b>${t}</b> escaños · ${sel.size} partido${sel.size === 1 ? '' : 's'}</p>
            <div class="coal-msg ${bad ? 'bad' : ''}">${msg || ''}</div>
            <div class="modal-inline-actions"><button class="btn primary" id="vote">🗳️ Someter a votación</button></div>`;
          box.querySelectorAll('.party').forEach((b) => {
            b.onclick = () => { const id = b.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); g.set('coal', [...sel]); g.sfx('click'); render(); };
          });
          box.querySelector('#vote').onclick = () => {
            if (!sel.size) { g.sfx('bad'); return render('No has seleccionado a nadie. Ni tú te votas.', true); }
            for (const r of RULES) {
              if (sel.has(r.p) && r.bad(sel, t)) { g.sfx('bad'); return render('❌ ' + r.msg, true); }
            }
            if (t < 176) { g.sfx('bad'); return render(`❌ Votación fallida: ${t} síes. Se necesitan 176. Los periodistas ya hablan de repetir elecciones.`, true); }
            g.closeModal();
            g.say(`¡Investidura aprobada con ${t} votos! Aplausos, abrazos y un diputado que llora porque le van a hacer un AVE. Hay gobierno... de momento.`, 'Presidencia del Congreso');
            g.win();
          };
        };
        render();
      },
    });
  }

  // ---- Nivel 8: trituradora ----
  const STRIP_W = 6;
  const DOC_LINES = [
    'INFORME CONFIDENCIAL - CAJA B',
    'Clave de la caja fuerte: cuántas',
    'veces dice «no me consta» cada',
    'testigo, en este orden: tesorero,',
    'exministro y cuñado (una cifra',
    'por testigo). Destruir tras leer.',
  ].map((l) => l.padEnd(36, ' '));
  function shredModal(g) {
    g.modal({
      title: '🗑️ Trituradora atascada',
      cls: 'wide',
      html: '<p class="small">La trituradora se atascó a mitad de un documento. Las tiras están desordenadas. Toca dos tiras para intercambiarlas hasta reconstruirlo.</p><div class="strips" id="strips"></div><div class="coal-msg" id="shMsg"></div>',
      onMount(el) {
        let order = g.flag('strips') || [3, 0, 5, 1, 4, 2];
        let pick = null;
        const box = el.querySelector('#strips');
        const render = () => {
          const solved = order.every((v, i) => v === i);
          box.innerHTML = order.map((s, i) => `<button class="strip ${pick === i ? 'pick' : ''} ${solved ? 'solved' : ''}" data-i="${i}"><pre>${DOC_LINES.map((l) => l.slice(s * STRIP_W, s * STRIP_W + STRIP_W).replace(/ /g, ' ')).join('\n')}</pre></button>`).join('');
          box.querySelectorAll('.strip').forEach((b) => {
            b.onclick = () => {
              if (order.every((v, i) => v === i)) return;
              const i = +b.dataset.i;
              if (pick === null) { pick = i; g.sfx('click'); }
              else { [order[pick], order[i]] = [order[i], order[pick]]; pick = null; g.set('strips', order); g.sfx('click'); }
              render();
              if (order.every((v, i2) => v === i2)) {
                g.set('docOK'); g.give('informe'); g.sfx('ok');
                el.querySelector('#shMsg').innerHTML = '✔ ¡Documento reconstruido! Lo guardas antes de que alguien lo triture otra vez.';
              }
            };
          });
        };
        render();
      },
    });
  }

  // ---- Nivel 9: disco de cifrado ----
  function cipherModal(g) {
    g.modal({
      title: '🎡 Disco de cifrado',
      html: `<p class="small">Colocas el mensaje del sobre en el disco. Gira el anillo interior para desplazar las letras.</p>
        <div class="cipher-box"><div class="cipher-in">${CIPHER}</div>
        <div class="cipher-ctl"><button class="btn" id="cL">◀</button><span id="cK"></span><button class="btn" id="cR">▶</button></div>
        <div class="cipher-out" id="cOut"></div></div>`,
      onMount(el) {
        let k = g.flag('shift') || 0;
        const upd = () => {
          el.querySelector('#cK').textContent = `Desplazamiento: ${k}`;
          el.querySelector('#cOut').textContent = caesar(CIPHER, -k);
          g.set('shift', k);
        };
        el.querySelector('#cL').onclick = () => { k = (k + 25) % 26; g.sfx('click'); upd(); };
        el.querySelector('#cR').onclick = () => { k = (k + 1) % 26; g.sfx('click'); upd(); };
        upd();
      },
    });
  }

  // ---- Nivel 10: declaración responsable ----
  const DECL = [
    'Declaro que soy la persona que firma esta declaración.',
    'Declaro que he leído la letra pequeña de este formulario.',
    'Declaro que esta declaración es falsa.',
    'Declaro que conozco el horario de atención al público de todos los organismos públicos.',
    'Declaro que me hago responsable de todo lo aquí declarado.',
  ];
  function declModal(g) {
    g.modal({
      title: '📝 Declaración responsable',
      html: `<div class="doc-body decl">
        <p><b>DECLARACIÓN RESPONSABLE</b> (art. 69 de la Ley de Procedimiento)</p>
        ${DECL.map((d, i) => `<label class="chk"><input type="checkbox" value="${i + 1}"> <b>${i + 1}.</b> ${d}</label>`).join('')}
        <p class="tiny">Letra pequeña: solo se admitirán declaraciones que contengan ÚNICAMENTE afirmaciones verdaderas y TODAS las afirmaciones verdaderas. Consta en esta Administración que ningún ser humano conoce los horarios de atención al público de todos los organismos, incluidos los propios organismos. Una afirmación que se contradice a sí misma no se considera verdadera.</p>
        <div class="coal-msg bad" id="dMsg"></div></div>`,
      buttons: [
        { label: 'Cancelar' },
        { label: '✍️ Firmar', cls: 'primary', onClick(close, el) {
          const v = [...el.querySelectorAll('input:checked')].map((x) => +x.value).sort().join(',');
          if (v === '1,2,5') {
            g.take('declaracion'); g.give('declaracionFirmada');
            g.say('Firmas con decisión. Es la primera vez en tu vida que declaras algo responsablemente y te sienta bien.');
            return true;
          }
          g.sfx('bad');
          el.querySelector('#dMsg').textContent = 'Declaración rechazada: contiene afirmaciones falsas o contradictorias, o le falta alguna verdadera. Lea la letra pequeña.';
          return false;
        } },
      ],
    });
  }

  // ---- Nivel 10: calendario ----
  const HOLIDAYS = { 12: 'Fiesta Nacional', 22: 'San Expediente (festivo local)' };
  function calendarModal(g) {
    g.modal({
      title: '📅 Calendario — Octubre 2026',
      html: '<div id="cal"></div><p class="small">Toca un día para pasar la hoja del calendario. Aquí el tiempo avanza cuando lo dice el calendario, no el reloj.</p>',
      onMount(el) {
        const box = el.querySelector('#cal');
        const render = () => {
          const cur = g.flag('day');
          let html = '<div class="cal-grid">' + ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<div class="cal-h">${d}</div>`).join('');
          // 1 de octubre de 2026 es jueves -> 3 huecos
          html += '<div></div><div></div><div></div>';
          for (let d = 1; d <= 31; d++) {
            const wd = (3 + d - 1) % 7; // 0 = lunes
            const cls = ['cal-d'];
            if (wd >= 5) cls.push('we');
            if (HOLIDAYS[d]) cls.push('hol');
            if (d === 8) cls.push('notif');
            if (d === cur) cls.push('cur');
            html += `<button class="${cls.join(' ')}" data-d="${d}" title="${HOLIDAYS[d] || (d === 8 ? 'Notificación' : '')}">${d}${HOLIDAYS[d] ? '<i>festivo</i>' : ''}</button>`;
          }
          html += '</div><div class="cal-legend"><span class="lg hol"></span> Festivo: 12 (Fiesta Nacional), 22 (San Expediente, local) · <span class="lg notif"></span> 8: notificación</div>';
          html += `<p class="cal-cur">Hoja actual del calendario: <b>${cur} de octubre</b></p>`;
          box.innerHTML = html;
          box.querySelectorAll('.cal-d').forEach((b) => { b.onclick = () => { g.set('day', +b.dataset.d); g.sfx('click'); render(); }; });
        };
        render();
      },
    });
  }

  // ---- Nivel 2: ventanilla / funcionaria ----
  const L2_USE = {
    cafe(g) {
      if (g.flag('back')) return g.say('—Gracias, pero ya he desayunado. Dos veces.', 'Funcionaria');
      g.take('cafe'); g.set('back');
      g.say('Un aroma a cortado recorre el pasillo... ¡La funcionaria vuelve de desayunar! —Ay, qué detalle. ¿Qué quería?', 'Funcionaria');
    },
    fotocopias(g) {
      if (!g.flag('back')) return g.say('No hay nadie en la ventanilla. Solo el cartel de «Desayunando».');
      g.take('fotocopias');
      g.say('—Tres fotocopias. Perfecto: una para el expediente, otra para el archivo y otra para tirarla. Pase usted.', 'Funcionaria');
      g.win();
    },
    dni(g) {
      if (!g.flag('back')) return g.say('No hay nadie en la ventanilla.');
      g.say('—El original no. Fotocopias. Tres. Y no me mire así.', 'Funcionaria');
    },
  };

  // =========================================================
  //  NIVELES
  // =========================================================
  window.LEVELS = [
    // ------------------------------------------------------ 1
    {
      title: 'Cita previa',
      place: 'Oficina de Expedición del DNI',
      stars: 1,
      intro: 'Tu DNI caduca mañana. Solo tienes que renovarlo. Fácil.<br><br>Pero para renovarlo necesitas <b>cita previa</b>, y en toda España no queda ni una desde 2019.<br><br><b>Objetivo:</b> consigue una cita y convence al agente de la puerta para que te deje pasar.',
      outro: 'Se le concede el acceso a la oficina. Ha logrado usted lo que millones de españoles intentan cada madrugada. Por desgracia, dentro le esperan más papeles.',
      scene: { wall: '#ddd6c1', floor: '#8e8e86', floorH: 34, pattern: 'tiles' },
      init(g) { g.set('h', 14); g.set('m', 35); },
      decor: [
        { kind: 'window', l: 3, t: 9, w: 13, h: 30 },
        { kind: 'flag', l: 58, t: 7, w: 6, h: 9 },
        { kind: 'counter', l: 21, t: 56, w: 20, h: 9 },
        { emoji: '🧯', x: 97, y: 50, s: 3, o: 0.9 },
      ],
      hotspots: [
        { id: 'cartel', x: 29, y: 25, sign: 'AVISO', sub: '📢', w: 11, label: 'Cartel de avisos',
          look(g) {
            g.doc('📢 AVISO IMPORTANTE', `<p>Estimado/a ciudadano/a:</p>
              <p>Las nuevas citas para la expedición y renovación del DNI se liberan <b>cada día a las 8:00 en punto</b>, según la hora oficial del reloj de esta sala.</p>
              <p>Las citas se agotan a las 8:00 y un segundo.</p>
              <p>Gracias por su paciencia (que no por su comprensión).</p>
              <p class="small">— La Dirección</p>`);
          } },
        { id: 'reloj', x: 46, y: 17, emoji: '🕰️', s: 6, label: (g) => `Reloj de pared (${pad(g.flag('h'))}:${pad(g.flag('m'))})`,
          look: clockModal },
        { id: 'pc', x: 31, y: 51, emoji: '🖥️', s: 8, label: 'Terminal de autocita',
          look(g) {
            if (g.flag('gotCita')) return g.say('Ya tienes tu cita. No tientes a la suerte: el sistema podría darse cuenta.');
            if (g.flag('h') === 8 && g.flag('m') === 0) {
              g.set('gotCita');
              g.say('Buscando citas... ⏳ ¡¡CITA DISPONIBLE!! Hoy, 8:02, mesa 3. El terminal imprime el justificante antes de que alguien de Albacete te la quite.', 'Terminal de autocita');
              g.give('justificante');
              return;
            }
            g.say(rand([
              'Buscando citas disponibles... ⏳⏳⏳ No hay citas disponibles en ninguna oficina del territorio nacional. Inténtelo más tarde.',
              'Error 503: servicio saturado. Hay 2.345.112 personas delante de usted. Su tiempo estimado de espera es: sí.',
              'Próxima cita disponible: 14 de marzo de 2029, en Ceuta. ¿Desea reservarla? (Botón deshabilitado.)',
              `Son las ${pad(g.flag('h'))}:${pad(g.flag('m'))}. Las citas de hoy ya se agotaron. Las de mañana aún no han salido.`,
            ]), 'Terminal de autocita');
          } },
        { id: 'agente', x: 69, y: 58, emoji: '👮', s: 9, label: 'Agente de la puerta',
          look(g) {
            g.say(rand([
              '—Sin cita previa no se puede pasar. Con cita tampoco, pero sin cita menos.',
              '—¿Cita? ¿Tiene cita? Pues entonces no tenemos nada de qué hablar.',
              '—Yo aquí solo vigilo. Lo de las citas es cosa del terminal, que tiene más poder que un ministro.',
            ]), 'Agente');
          },
          use: {
            justificante(g) {
              g.take('justificante');
              g.say('—¿Una cita de verdad? Llevo once años en esta puerta y es la primera que veo. Pase, pase... antes de que caduque.', 'Agente');
              g.win();
            },
          } },
        { id: 'puerta', x: 86, y: 46, emoji: '🚪', s: 15, label: 'Puerta de la oficina',
          look(g) { g.say('Cerrada. El agente la vigila como si dentro guardaran las joyas de la Corona.'); },
          use: { justificante(g) { g.say('Mejor enséñaselo al agente, que para eso le pagan.'); } } },
        { id: 'cola', x: 11, y: 75, emoji: '🧍🧍‍♀️🧍‍♂️', s: 5, label: 'Cola de ciudadanos',
          look(g) {
            g.say(rand([
              '—Yo vine a por la cita en 2019. Ya ni me acuerdo de para qué era.',
              '—Dicen que un primo de un vecino consiguió cita a la primera. Leyendas urbanas.',
              '—Yo me pongo el despertador a las 7:59 cada día. Llevo tres meses. Mi mujer ya duerme en el sofá.',
            ]), 'Alguien de la cola');
          } },
        { id: 'silla', x: 47, y: 80, emoji: '💺', s: 5, label: 'Silla de espera',
          look(g) { g.say('Una silla atornillada al suelo. Por si alguien intentaba llevársela para esperar en casa.'); } },
        { id: 'planta', x: 94, y: 80, emoji: '🪴', s: 5, label: 'Planta',
          look(g) { g.say('Una planta de plástico. Es lo único de esta oficina que no ha pedido la baja.'); } },
      ],
      hints: [
        'Lee el cartel de avisos: dice cuándo se liberan las citas.',
        'El reloj de la pared parece fácil de manipular... y el terminal usa esa hora.',
        'Pon el reloj a las 8:00, usa el terminal y enseña el justificante al agente.',
      ],
    },

    // ------------------------------------------------------ 2
    {
      title: 'Vuelva usted mañana',
      place: 'Registro General — Ventanilla 1',
      stars: 1,
      intro: 'Ya estás dentro. Te piden <b>tres fotocopias de tu DNI</b>.<br><br>Hay una fotocopiadora, pero solo acepta monedas de 10 céntimos. Y la funcionaria de la ventanilla está desayunando. Desde hace un rato largo.<br><br><b>Objetivo:</b> entrega las tres fotocopias en la ventanilla.',
      outro: 'Documentación recibida: una fotocopia para el expediente, otra para el archivo y otra para tirarla. Siguiente paso: acreditar su domicilio. Le derivamos al Ayuntamiento.',
      scene: { wall: '#c9d6cf', floor: '#7b6a58', floorH: 32, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 38, t: 50, w: 26, h: 12 },
        { kind: 'window', l: 70, t: 8, w: 12, h: 26 },
        { emoji: '🗄️', x: 64, y: 60, s: 5, o: 0.9 },
      ],
      hotspots: [
        { id: 'abrigo', x: 7, y: 40, emoji: '🧥', s: 8, label: 'Tu abrigo, en el perchero',
          look(g) {
            if (!g.flag('coat')) { g.set('coat'); g.say('En el bolsillo interior encuentras tu DNI caducado. Y un tique de aparcamiento de 2016.'); g.give('dni'); }
            else g.say('Solo quedan pelusas y el tique de 2016. Algún día lo pagarás.');
          } },
        { id: 'requisitos', x: 22, y: 24, sign: 'REQUISITOS', sub: '📋', w: 12, label: 'Cartel de requisitos',
          look(g) {
            g.doc('📋 DOCUMENTACIÓN NECESARIA', `<ul>
              <li>DNI original (caducado vale: total, ya lo tenemos).</li>
              <li><b>TRES (3) fotocopias</b> del DNI.</li>
              <li>Fotocopia de la fotocopia (opcional, pero se valorará).</li></ul>
              <p>La fotocopiadora de esta sala solo acepta <b>monedas de 10 céntimos</b>.</p>
              <p>Esta Administración <b>no dispone de cambio</b>. Pruebe en la máquina de café.</p>`);
          } },
        { id: 'ventanilla', x: 51, y: 30, sign: (g) => (g.flag('back') ? 'VENTANILLA 1' : 'DESAYUNANDO'), sub: (g) => (g.flag('back') ? '🪟' : '☕ Vuelvo en 5 min'), w: 14,
          label: 'Ventanilla 1',
          look(g) {
            if (!g.flag('back')) g.say('Un cartel: «DESAYUNANDO. VUELVO EN 5 MINUTOS». El celo está amarillento. Huele a 1998. Quizá algo la haga volver...');
            else g.say('—Tres fotocopias del DNI. No, el original no me vale: podría ser falso.', 'Funcionaria');
          },
          use: L2_USE },
        { id: 'funcionaria', x: 51, y: 50, emoji: '👩‍💼', s: 8, label: 'Funcionaria', show: (g) => g.flag('back'),
          look(g) { g.say('—Tres fotocopias del DNI. No, el original no me vale: podría ser falso.', 'Funcionaria'); },
          use: L2_USE },
        { id: 'maceta', x: 93, y: 72, emoji: '🪴', s: 6, label: 'Maceta',
          look(g) {
            if (!g.flag('euroFound')) { g.set('euroFound'); g.say('Entre la tierra de la maceta brilla algo... ¡Una moneda de 1 €!'); g.give('euro'); }
            else g.say('Tierra. Y más tierra. Y una colilla de 2011.');
          } },
        { id: 'cafetera', x: 80, y: 52, emoji: '☕', s: 8, label: 'Máquina de café',
          look(g) { g.say('Cortado: 0,70 €. Solo acepta monedas de 1 €. Devuelve el cambio en monedas de 10 céntimos, como castigo.'); },
          use: {
            euro(g) { g.take('euro'); g.say('Clonc. Sale un cortado humeante y 0,30 € de cambio en monedas de 10 céntimos.'); g.give('cafe'); g.give('monedas'); },
            monedas(g) { g.say('La máquina no acepta monedas pequeñas. Solo las devuelve.'); },
          } },
        { id: 'fotocopiadora', x: 25, y: 64, emoji: '🖨️', s: 9, label: 'Fotocopiadora',
          look(g) { g.say('Fotocopiadora. 0,10 € por copia. Solo monedas de 10 céntimos. Tiene más atascos que la M-30 en hora punta.'); },
          use: {
            dni(g) {
              if (!g.has('monedas')) return g.say('Pones el DNI, pero te faltan monedas de 10 céntimos. Tres copias = 0,30 €.');
              g.take('monedas'); g.say('Introduces las monedas... ¡Tres fotocopias! Una sale torcida, pero la Administración no se fija en esas cosas. (Sí se fija.)'); g.give('fotocopias');
            },
            monedas(g) {
              if (!g.has('dni')) return g.say('Metes las monedas... ¿y qué fotocopias? ¿El aire? Las recuperas.');
              g.take('monedas'); g.say('Colocas el DNI e introduces las monedas... ¡Tres fotocopias! Una sale torcida. Da igual.'); g.give('fotocopias');
            },
            euro(g) { g.say('Solo monedas de 10 céntimos. Un euro entero es demasiado dinero para esta máquina.'); },
          } },
        { id: 'papelera', x: 40, y: 82, emoji: '🗑️', s: 5, label: 'Papelera',
          look(g) { g.say('Formularios del modelo 2023. Ya no valen: ahora es el modelo 2023-bis. Que es igual, pero con otro número.'); } },
        { id: 'cola2', x: 66, y: 80, emoji: '🧓', s: 6, label: 'Señora esperando',
          look(g) { g.say('—Yo vengo cada día. La funcionaria vuelve cuando huele a café. Es como un gato, pero con trienios.', 'Señora'); } },
      ],
      hints: [
        'Registra bien la sala: el abrigo y la maceta esconden cosas.',
        'La fotocopiadora solo acepta monedas de 10 cts. ¿Quién da cambio? Y a la funcionaria... ¿qué la haría volver?',
        'Usa la moneda de 1 € en la cafetera. Da el café a la ventanilla, fotocopia el DNI con las monedas y entrega las fotocopias.',
      ],
    },

    // ------------------------------------------------------ 3
    {
      title: 'El padrón',
      place: 'Ayuntamiento — Negociado de Empadronamiento',
      stars: 2,
      intro: 'Para renovar el DNI necesitas un <b>certificado de empadronamiento</b> actualizado.<br><br>Y para empadronarte, te dicen, necesitas... un certificado de empadronamiento.<br><br><b>Objetivo:</b> rompe el bucle y consigue que el funcionario te empadrone.',
      outro: 'Queda usted empadronado/a. Por un momento, el bucle se ha roto. Pero el sistema detecta que le falta su número de afiliación a la Seguridad Social. No pregunte por qué lo necesita el padrón.',
      scene: { wall: '#e3d3b3', floor: '#6b4f3a', floorH: 33, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 44, t: 55, w: 30, h: 10 },
        { kind: 'flag', l: 30, t: 6, w: 5, h: 8 },
        { emoji: '🧍‍♀️', x: 8, y: 76, s: 6, o: 0.9 },
      ],
      hotspots: [
        { id: 'funcionario', x: 56, y: 48, emoji: '👨‍💼', s: 9, label: 'Funcionario de empadronamiento',
          look(g) {
            g.say('—Para empadronarle necesito su certificado de empadronamiento.', 'Funcionario');
            g.say('—¿Y cómo consigo el certificado? —Empadronándose. ¿Algo más?', 'Funcionario');
            g.say('—...Bueno. Existe el Modelo P-0 de alta inicial. Si me lo trae sellado en Registro de Entrada, podemos hablar. Está en el archivo. La clave... no me la sé, la apunta mi compañero en algún sitio.', 'Funcionario');
          },
          use: {
            modeloSellado(g) { g.take('modeloSellado'); g.say('—Un P-0 sellado... Esto es... impecable. Nunca había visto uno. Queda usted empadronado. ¿Me firma un autógrafo?', 'Funcionario'); g.win(); },
            modeloP0(g) { g.say('—Sin el sello de Registro de Entrada no vale. Esto no es un bar.', 'Funcionario'); },
            sello(g) { g.say('—No me selle a mí, por favor. Selle el modelo.', 'Funcionario'); },
          } },
        { id: 'horario', x: 87, y: 24, sign: 'HORARIO', sub: '🕘', w: 11, label: 'Cartel de horario',
          look(g) {
            g.doc('🕘 HORARIO DE ATENCIÓN AL PÚBLICO', `<p><b>Lunes a viernes: de 9:00 a 9:15.</b></p>
              <p>Miércoles: cerrado por reunión de coordinación.</p>
              <p>Agosto: cerrado. Septiembre: ya veremos.</p>
              <p class="small">Horario de reclamaciones: de 9:15 a 9:15.</p>`);
          } },
        { id: 'monitor', x: 70, y: 49, emoji: '💻', s: 6, label: 'Monitor del compañero',
          look(g) { g.say('Un pósit pegado en la pantalla: «CLAVE DEL ARCHIVO = HORA DE CIERRE AL PÚBLICO (4 cifras). ¡¡NO APUNTAR EN NINGÚN SITIO!!»'); } },
        { id: 'archivo', x: 18, y: 55, emoji: '🗄️', s: 11, label: 'Archivo (cerradura de 4 cifras)',
          look(g) {
            if (g.flag('archOpen')) return g.say('El archivo está abierto. Hay 3.000 carpetas iguales. Ya tienes lo que necesitabas.');
            g.input({
              title: '🗄️ Archivo municipal', text: 'Cerradura de combinación de 4 cifras.', numeric: true, maxLen: 4,
              check: (v) => v === '0915',
              failText: () => 'El archivo no se abre. Te juzga en silencio.',
              ok: () => { g.set('archOpen'); g.say('El archivo se abre con un chirrido. Tras apartar expedientes de 1987, encuentras un Modelo P-0 en blanco.'); g.give('modeloP0'); },
            });
          } },
        { id: 'buzon', x: 91, y: 62, emoji: '📮', s: 7, label: 'Buzón de sugerencias',
          look(g) {
            if (!g.flag('key')) { g.set('key'); g.say('El buzón está lleno a reventar: nadie lo abre desde 2008. Entre sugerencias como «Más ventanillas» y «Menos ventanillas» aparece una llavecita.'); g.give('llavecita'); }
            else g.say('Miles de sugerencias. Todas sin leer. Algunas amenazan con volverse sugerencias de otra cosa.');
          } },
        { id: 'cajon', x: 42, y: 74, emoji: '🗃️', s: 7, label: 'Cajón del escritorio',
          look(g) {
            if (g.flag('drawer')) return g.say('Solo queda un bocadillo fosilizado. No lo toques: podría ser patrimonio municipal.');
            g.say('El cajón está cerrado con llave.');
          },
          use: {
            llavecita(g) { g.take('llavecita'); g.set('drawer'); g.say('Clic. Dentro: tres bolígrafos sin tinta, un bocadillo fosilizado y un SELLO de Registro de Entrada.'); g.give('sello'); },
          } },
        { id: 'alcalde', x: 50, y: 18, emoji: '🖼️', s: 7, label: 'Retrato del alcalde',
          look(g) { g.say('El alcalde, cortando la cinta de una rotonda. Es la tercera rotonda de esta semana. La rotonda no lleva a ningún sitio, pero está preciosa.'); } },
      ],
      combos: {
        'modeloP0+sello'(g) { g.take('modeloP0'); g.give('modeloSellado'); g.sfx('stamp'); g.say('¡PUM! Estampas el sello de Registro de Entrada. Por un segundo te sientes funcionario. Es una sensación extraña, como de trienio.'); },
      },
      hints: [
        'El funcionario habla de un Modelo P-0 guardado en el archivo. La clave está apuntada en algún sitio...',
        'El pósit del monitor y el cartel de horario te dan la clave. El sello estará en un cajón cerrado... ¿y la llave? Nadie abre nunca el buzón de sugerencias.',
        'Clave del archivo: 0915. La llavecita está en el buzón; abre el cajón. Combina el sello con el modelo y dáselo al funcionario.',
      ],
    },

    // ------------------------------------------------------ 4
    {
      title: 'La ventanilla equivocada',
      place: 'Tesorería de la Seguridad Social',
      stars: 2,
      intro: 'Necesitas tu <b>número de afiliación</b>. Para ello hay que pasar por cinco ventanillas... en el orden correcto. Si te equivocas, vuelta a empezar.<br><br>Ah, y la pantalla de turnos lleva atascada desde las 8:00.<br><br><b>Objetivo:</b> consigue el número de afiliación y sal por la puerta.',
      outro: 'Número de afiliación concedido. El funcionario del registro llora de emoción: nadie había acertado el orden a la primera desde la Transición. Siguiente paso: completar el trámite por internet. Desde casa. Qué fácil, ¿no?',
      scene: { wall: '#cfd9e3', floor: '#9aa3a8', floorH: 32, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 14, t: 55, w: 76, h: 8 },
        { emoji: '🪑', x: 30, y: 82, s: 4, o: 0.8 }, { emoji: '🪑', x: 36, y: 82, s: 4, o: 0.8 }, { emoji: '🪑', x: 42, y: 82, s: 4, o: 0.8 },
      ],
      hotspots: [
        { id: 'pantalla', x: 52, y: 11, emoji: '📺', s: 6, label: (g) => `Pantalla de turnos: A-${pad(g.flag('turno'), 3)}`,
          look(g) { g.say(`TURNO: A-${pad(g.flag('turno'), 3)}. ${g.flag('turno') === 12 ? 'Lleva así desde las 8:00. El encargado de los turnos está en un curso de «Gestión eficiente de turnos».' : '¡Ha cambiado!'}`); } },
        { id: 'dispensador', x: 6, y: 56, emoji: '🎟️', s: 7, label: 'Dispensador de turnos',
          look(g) {
            if (g.flag('ticketTaken')) return g.say('Ya tienes número. Coger otro sería ilegal. O peor: de mala educación.');
            g.set('ticketTaken'); g.say('Te toca el A-347. En pantalla van por el A-012. Haces cuentas y te entra frío.'); g.give('ticket');
          } },
        { id: 'v_registro', x: 22, y: 38, sign: 'REGISTRO', sub: '🧑‍💼', w: 11, label: 'Ventanilla de Registro', look: (g) => ventanilla(g, 'registro') },
        { id: 'v_info', x: 37, y: 38, sign: 'INFORMACIÓN', sub: '👩‍💼', w: 12, label: 'Ventanilla de Información', look: (g) => ventanilla(g, 'info') },
        { id: 'v_caja', x: 52, y: 38, sign: 'CAJA', sub: '🧔', w: 11, label: 'Ventanilla de Caja', look: (g) => ventanilla(g, 'caja') },
        { id: 'v_firma', x: 67, y: 38, sign: 'FIRMA', sub: '👩‍🦳', w: 11, label: 'Ventanilla de Firma', look: (g) => ventanilla(g, 'firma') },
        { id: 'v_sellos', x: 82, y: 38, sign: 'SELLOS', sub: '👨‍🦲', w: 11, label: 'Ventanilla de Sellos', look: (g) => ventanilla(g, 'sellos') },
        { id: 'folleto', x: 12, y: 80, emoji: '📑', s: 5, label: 'Folleto informativo',
          look(g) {
            g.doc('📑 Cómo obtener su número de afiliación', `<p>Estimado/a usuario/a: el procedimiento consta de <b>cinco ventanillas</b>, que deberá visitar en el orden reglamentario. Para no facilitar las cosas, lo describimos así:</p>
              <ol>
                <li>Información no es ni la primera ni la última ventanilla.</li>
                <li>Sellos va <b>justo después</b> de Información.</li>
                <li>Caja va antes que Registro: primero se paga, luego se registra.</li>
                <li>Registro <b>nunca</b> va justo después de Caja (el cajero y el registrador no se hablan).</li>
                <li>Firma va antes que Caja: se firma antes de saber cuánto cuesta.</li>
              </ol>
              <p class="small">Si se equivoca, deberá reiniciar el procedimiento desde la primera ventanilla. Gracias por su colaboración.</p>`);
          } },
        { id: 'mando', x: 87, y: 78, emoji: '🎛️', s: 5, label: 'Mando olvidado en una mesa',
          look(g) {
            g.input({
              title: '🎛️ Mando de la pantalla de turnos', text: 'Un mando olvidado sobre la mesa del encargado de turnos. ¿Qué número quieres llamar?',
              numeric: true, maxLen: 3, check: (v) => +v >= 0,
              ok: (v) => {
                g.set('turno', +v);
                if (+v === 347) g.say('¡DING! «Turno A-347, diríjase a ventanillas». Eres tú. Qué casualidad. Nadie protesta: todos dormían.');
                else g.say(`¡DING! «Turno A-${pad(+v, 3)}». Nadie acude. Normal.`);
              },
            });
          } },
        { id: 'puerta', x: 95, y: 64, emoji: '🚪', s: 11, label: 'Salida',
          look(g) { g.say('—Sin número de afiliación no sale nadie. Ni entra. Bueno, entrar sí.', 'Vigilante'); },
          use: { numeroSS(g) { g.say('El vigilante mira tu número, lo compara con una lista, asiente y abre la puerta. Libertad (provisional).', 'Vigilante'); g.win(); } } },
      ],
      init(g) { g.set('turno', 12); g.set('seq', []); },
      hints: [
        'Primero coge número en el dispensador. Luego, la pantalla tiene que llegar a tu turno.',
        'Alguien se dejó el mando de la pantalla en una mesa. Después, el folleto describe el orden de las ventanillas.',
        'Pon el turno 347. Orden: Firma → Caja → Información → Sellos → Registro. Enseña el número en la salida.',
      ],
    },

    // ------------------------------------------------------ 5
    {
      title: 'Sede electrónica',
      place: 'Tu salón, un domingo por la tarde',
      stars: 3,
      intro: 'El siguiente trámite es <b>100% online</b>. Desde casa, sin colas. ¿Qué podría salir mal?<br><br>Navegadores «compatibles», versiones de Java, Autofirma, certificados digitales, Cl@ve PIN...<br><br><b>Objetivo:</b> completa el trámite en la Sede Electrónica y sal de casa con el acuse de recibo.',
      outro: 'Trámite electrónico presentado. Ha tardado solo cuatro horas y media, lo que constituye un récord nacional. Lamentablemente, al cruzar sus datos, la Agencia Tributaria ha detectado una irregularidad en su declaración de la renta.',
      scene: { wall: '#e8dcc8', floor: '#a0764f', floorH: 30, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 36, t: 60, w: 30, h: 7 },
        { kind: 'window', l: 44, t: 8, w: 12, h: 26 },
        { kind: 'shelf', l: 5, t: 34, w: 16, h: 2 },
        { emoji: '🛋️', x: 12, y: 84, s: 9, o: 0.95 },
      ],
      hotspots: [
        { id: 'ordenador', x: 51, y: 53, emoji: '💻', s: 8, label: 'Ordenador',
          look: sedeModal,
          use: { usb(g) { g.take('usb'); g.set('usbIn'); g.say('Insertas el pendrive. Windows lo detecta tras tres minutos y dos actualizaciones obligatorias.'); } } },
        { id: 'cajon', x: 38, y: 78, emoji: '🗄️', s: 6, label: 'Cajón del escritorio',
          look(g) {
            if (!g.flag('usbFound')) { g.set('usbFound'); g.say('Entre cables que no sabes de qué son, aparece un pendrive: «CERTIFICADO FNMT — NO PERDER».'); g.give('usb'); }
            else g.say('Cables. Cargadores de móviles que ya no existen. Un mando de una tele que tiraste en 2014.');
          } },
        { id: 'manual', x: 9, y: 28, emoji: '📘', s: 5, label: 'Manual oficial (estantería)',
          look(g) {
            g.doc('📘 Manual de la Sede Electrónica (v. 14.2)', `<p><b>Requisitos técnicos:</b></p>
              <ul><li>Navegador: cualquier navegador moderno, excepto los que no.</li>
              <li>Cliente de firma: <b>Autofirma 1.9 o superior</b> (obligatorio).</li>
              <li>Máquina virtual Java: la versión adecuada.</li>
              <li>Paciencia: ilimitada.</li></ul>
              <p class="small">Para más información, consulte el Manual de Requisitos del Manual (v. 3.0, no disponible).</p>`);
          } },
        { id: 'libros', x: 16, y: 28, emoji: '📚', s: 5, label: 'Libros',
          look(g) { g.say('«Cómo sobrevivir a la Administración Electrónica», «Java para nostálgicos» y «El arte de reiniciar».'); } },
        { id: 'perroFoto', x: 30, y: 22, emoji: '🖼️', s: 6, label: 'Foto enmarcada',
          look(g) { g.say('Una foto de tu perro de cachorro. Detrás pone: «Tobi, el día que llegó a casa. Verano de 2015».'); } },
        { id: 'postit', x: 68, y: 26, emoji: '🗒️', s: 5, label: 'Pósit en el corcho',
          look(g) {
            g.doc('🗒️ Pósit de tu cuñado («que sabe de informática»)', `<p>¡OJO!</p>
              <p>La Autofirma 1.9 <b>SOLO</b> funciona con <b>Java 8</b>. ¡Nada de Java 17 ni 21, que se rompe todo!</p>
              <p>La 1.8.3 con Java 21 tampoco va.</p>
              <p>Hazme caso, que yo de esto sé. Ya me invitarás a una caña.</p>`);
          } },
        { id: 'foro', x: 78, y: 62, emoji: '🖨️', s: 6, label: 'Impresora (con un papel)',
          look(g) {
            g.doc('📄 forodeafectados.es — «¿¿ALGUIEN HA CONSEGUIDO FIRMAR??»', `<p><b>Mari_Loli_62:</b> Con Chrome, imposible. Con Firefox, tampoco. Safari, ni lo intentes.</p>
              <p><b>Paco_Autónomo:</b> Yo al final lo logré con <b>Edge en modo Internet Explorer</b>. En 2026. Lloré.</p>
              <p><b>Anónimo:</b> Confirmo lo de Edge en modo IE. Con lo demás, error inesperado.</p>
              <p><b>Emigrado_a_Portugal:</b> Yo desistí. Aquí se vive muy bien.</p>`);
          } },
        { id: 'movil', x: 61, y: 77, emoji: '📱', s: 5, label: 'Móvil',
          look(g) {
            if (g.flag('pinReq')) g.say('SMS de «Cl@ve»: «Su Cl@ve PIN es <b>842</b>. Válido 10 minutos. No lo comparta con nadie». Justo debajo, otro SMS: «Correos: su paquete está retenido, pague 1,99 € aquí». (Eso es una estafa. No lo toques.)', 'Móvil');
            else g.say('Sin mensajes nuevos. Bueno, catorce de «Posible spam».', 'Móvil');
          } },
        { id: 'cuaderno', x: 86, y: 79, emoji: '📓', s: 5, label: 'Cuaderno de contraseñas',
          look(g) {
            g.doc('📓 Cuaderno de contraseñas (muy seguro)', `<ul><li>Banco: la de siempre.</li><li>Netflix: la del primo.</li><li>Wifi: debajo del router.</li>
              <li><b>Certificado digital:</b> nombre del perro + año en que llegó a casa (todo junto).</li></ul>`);
          } },
        { id: 'perro', x: 24, y: 83, emoji: '🐕', s: 6, label: 'Tobi',
          look(g) { g.say('Tobi te mira. Él tampoco entiende la Sede Electrónica. Pero al menos no lo intenta.'); } },
        { id: 'gato', x: 72, y: 44, emoji: '🐈', s: 5, label: 'Gato sobre el router',
          look(g) { g.say('El gato duerme encima del router porque está calentito. Por eso internet va lento. No lo muevas: no te lo perdonaría.'); } },
        { id: 'puerta', x: 94, y: 46, emoji: '🚪', s: 14, label: 'Puerta de casa',
          look(g) { g.say('No sales de casa hasta terminar el trámite online. Así lo manda la transformación digital.'); },
          use: { acuse(g) { g.say('Con el acuse de recibo en la mano, sales de casa sintiéndote un hacker del Estado.'); g.win(); } } },
      ],
      hints: [
        'Tres cosas de la sala te dicen qué navegador, Java y Autofirma usar: el manual, el pósit y el papel de la impresora.',
        'El manual exige Autofirma 1.9; el pósit del cuñado dice con qué Java funciona; el foro, qué navegador. El certificado estará en algún cajón.',
        'Edge (modo IE) + Java 8 + Autofirma 1.9. Mete el pendrive en el ordenador. Contraseña: Tobi2015. Pide el PIN y míralo en el móvil (842).',
      ],
    },

    // ------------------------------------------------------ 6
    {
      title: 'La renta',
      place: 'Agencia Tributaria — Sala de autoservicio',
      stars: 3,
      intro: 'Hacienda te ha preparado un <b>borrador</b> de la renta. Muy amable. Demasiado amable.<br><br>Reúne tus documentos, averigua qué es deducible y calcula el resultado correcto antes de que llegue una paralela.<br><br><b>Objetivo:</b> presenta una declaración correcta en el terminal.',
      outro: 'Declaración presentada correctamente. Sin embargo, para corregir su expediente anterior hace falta aprobar una ley. Y para aprobar una ley hace falta un gobierno. Llevamos 287 días en funciones.',
      scene: { wall: '#d9e0d0', floor: '#8a8f7f', floorH: 32, pattern: 'carpet' },
      decor: [
        { kind: 'counter', l: 40, t: 58, w: 22, h: 8 },
        { kind: 'counter', l: 62, t: 64, w: 16, h: 6 },
        { emoji: '🪑', x: 51, y: 80, s: 5, o: 0.85 },
      ],
      hotspots: [
        { id: 'tramos', x: 22, y: 24, sign: 'REGLAS IRPF', sub: '📊', w: 13, label: 'Cartel: reglas del IRPF',
          look(g) {
            g.doc('📊 IRPF — Reglas simplificadas (solo para este juego)', `<p><b>1. Base</b> = ingresos brutos − deducciones.</p>
              <p><b>2. Solo son deducibles:</b> donativos y aportaciones a planes de pensiones. Nada más. Ni gafas, ni abogados, ni disgustos.</p>
              <p><b>3. Cuota</b> (tramos progresivos):</p>
              <table class="tbl"><tr><td>De 0 a 10.000 €</td><td>10 %</td></tr><tr><td>De 10.000 a 20.000 €</td><td>20 %</td></tr><tr><td>Más de 20.000 €</td><td>30 %</td></tr></table>
              <p class="small">Cada tramo se aplica solo a la parte de la base que cae dentro de él.</p>
              <p><b>4. Resultado</b> = cuota − retenciones ya practicadas.</p>`);
          } },
        { id: 'lema', x: 70, y: 17, sign: 'HACIENDA SOMOS TODOS', sub: '(unos más que otros)', w: 18, label: 'Cartel institucional',
          look(g) { g.say('«Hacienda somos todos». Alguien ha añadido a boli: «unos más que otros».'); } },
        { id: 'terminal', x: 51, y: 52, emoji: '🖥️', s: 8, label: 'Terminal Renta Web', look: rentaModal },
        { id: 'carpeta', x: 12, y: 70, emoji: '📁', s: 7, label: 'Tu carpeta',
          look(g) {
            if (!g.flag('nom')) { g.set('nom'); g.say('Dentro de tu carpeta está el certificado de retenciones de tu empresa.'); g.give('nomina'); }
            else g.say('La carpeta está vacía. Como tu cuenta después de la renta.');
          } },
        { id: 'abrigo', x: 88, y: 36, emoji: '🧥', s: 7, label: 'Tu abrigo',
          look(g) {
            if (!g.flag('don')) { g.set('don'); g.say('En el bolsillo hay un recibo doblado: un donativo que hiciste en un arrebato de solidaridad.'); g.give('donativo'); }
            else g.say('Solo quedan caramelos de menta pegados al forro.');
          } },
        { id: 'buzon', x: 93, y: 64, emoji: '📬', s: 6, label: 'Tu correspondencia',
          look(g) {
            if (!g.flag('pen')) { g.set('pen'); g.say('Entre la publicidad, una carta de tu plan de pensiones.'); g.give('pensiones'); }
            else g.say('Publicidad de un gimnasio y una oferta de fibra. Nada deducible.');
          } },
        { id: 'gafas', x: 70, y: 60, emoji: '👓', s: 5, label: 'Factura sobre la mesa',
          look(g) {
            if (!g.flag('gaf')) { g.set('gaf'); g.say('Una factura de óptica. ¿Será deducible?'); g.give('gafas'); }
            else g.say('Aquí estaban las gafas. Ahora las llevas puestas, para leer mejor lo que vas a pagar.');
          } },
        { id: 'papelera', x: 32, y: 82, emoji: '🗑️', s: 5, label: 'Papelera',
          look(g) {
            if (!g.flag('old')) { g.set('old'); g.say('Alguien tiró aquí su declaración del año pasado... ¡un momento, es la tuya! (La tiraste tú, de rabia.)'); g.give('renta2025'); }
            else g.say('Pañuelos usados. Hay mucha gente llorando en esta sala.');
          } },
        { id: 'contribuyente', x: 80, y: 80, emoji: '😩', s: 6, label: 'Otro contribuyente',
          look(g) { g.say('—Yo confirmé el borrador sin mirar. Hace cuatro años. Todavía me llegan cartas.', 'Contribuyente'); } },
      ],
      hints: [
        'El terminal pide la casilla 505 del año pasado: busca por la sala. Y reúne todos tus documentos.',
        'Solo son deducibles el donativo y el plan de pensiones. Las gafas, no. Aplica los tramos por partes y resta las retenciones.',
        'Referencia: 21340. Base: 24.000 − 1.000 − 500 = 22.500 → cuota 1.000 + 2.000 + 750 = 3.750 → menos 3.000 de retenciones = 750.',
      ],
    },

    // ------------------------------------------------------ 7
    {
      title: 'La investidura',
      place: 'Congreso — Hemiciclo',
      stars: 4,
      intro: 'Para aprobar la ley que arregla tu expediente hace falta un <b>gobierno</b>. Y el Congreso lleva 287 días sin conseguirlo.<br><br>El ujier ha cerrado las puertas: nadie sale hasta que haya investidura. Ni tú, que solo venías a entregar un papel.<br><br><b>Objetivo:</b> forma una mayoría de al menos 176 escaños que cumpla las condiciones de todos sus socios.',
      outro: 'Hay gobierno. Se aprueba su ley por urgencia en solo 14 meses. Pero la oposición exige una comisión de investigación sobre por qué su trámite ha costado tanto. Y le citan a usted como testigo.',
      scene: { wall: '#7a2e2e', floor: '#5a3b2a', floorH: 50, pattern: 'carpet' },
      decor: [
        { kind: 'arc' },
        { emoji: '📸', x: 6, y: 20, s: 4, o: 0.85 }, { emoji: '🎥', x: 94, y: 20, s: 4, o: 0.85 },
      ],
      hotspots: [
        ...PARTIES.map((p, i) => {
          const pos = { PPA: [12, 72], VYV: [22, 55], TRM: [35, 47], PIN: [50, 44], PSA: [65, 47], CPM: [78, 55], PRR: [88, 72], UNO: [50, 62] }[p.id];
          return {
            id: 'p_' + p.id, x: pos[0], y: pos[1], emoji: p.emoji, s: 6, tag: p.id, label: `${p.id} · ${p.name} (${p.seats} escaños)`,
            look(g) { g.say(p.demand, `${p.emoji} Portavoz del ${p.id} — ${p.name} (${p.seats})`); },
          };
        }),
        { id: 'marcador', x: 50, y: 15, sign: 'MARCADOR', sub: 'Mayoría: 176', w: 14, label: 'Marcador de votaciones',
          look(g) { g.say('Mayoría absoluta: 176 de 350 escaños. Días sin gobierno: 287. Récord de cafés servidos en la cafetería: batido cada semana.'); } },
        { id: 'tribuna', x: 50, y: 85, emoji: '🎤', s: 7, label: 'Tribuna de oradores', look: coalitionModal },
        { id: 'ujier', x: 94, y: 88, emoji: '🤵', s: 6, label: 'Ujier',
          look(g) { g.say('—Nadie sale de aquí hasta que haya gobierno. Tengo órdenes. Y bocadillos para tres semanas.', 'Ujier'); } },
        { id: 'escanos', x: 5, y: 88, emoji: '📋', s: 5, label: 'Reparto de escaños',
          look(g) {
            g.doc('📋 Reparto de escaños', `<table class="tbl">${PARTIES.map((p) => `<tr><td>${p.emoji} <b>${p.id}</b> — ${p.name}</td><td>${p.seats}</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>350</b></td></tr></table><p class="small">Habla con cada bancada para conocer sus condiciones.</p>`);
          } },
      ],
      hints: [
        'Habla con cada portavoz y apunta sus condiciones. El PPA y el PRR no pueden estar juntos.',
        'El diputado de Uno Solo solo apoya si su voto es decisivo: busca una mayoría de exactamente 176 con él. El PSA necesita a alguien más pequeño.',
        'PPA (120) + TRM (25) + PIN (11) + PSA (19) + UNO (1) = 176.',
      ],
    },

    // ------------------------------------------------------ 8
    {
      title: 'No me consta',
      place: 'Sala de Comisiones de Investigación',
      stars: 4,
      intro: 'La comisión investiga el retraso de tu trámite. La presidenta exige encontrar la contabilidad de la misteriosa <b>Caja B</b>, y ha cerrado la sala con todos dentro.<br><br>Los testigos no recuerdan nada. Absolutamente nada.<br><br><b>Objetivo:</b> abre la caja fuerte y entrega su contenido a la presidenta.',
      outro: 'La comisión recibe el pendrive... que resulta estar formateado 35 veces. Se cierran los trabajos sin conclusiones, como es tradición. Queda un último paso: que el decreto que le afecta se publique en el BOE. Esta noche. A las 23:59.',
      scene: { wall: '#3f4b5b', floor: '#6e5a48', floorH: 36, pattern: 'wood' },
      decor: [
        { kind: 'counter', l: 30, t: 44, w: 40, h: 8 },
        { emoji: '🎙️', x: 40, y: 43, s: 3, o: 0.9 }, { emoji: '🎙️', x: 60, y: 43, s: 3, o: 0.9 },
        { kind: 'counter', l: 12, t: 74, w: 52, h: 6 },
      ],
      hotspots: [
        { id: 'cartel', x: 50, y: 12, sign: 'COMISIÓN DE INVESTIGACIÓN', sub: 'sobre el retraso de su trámite', w: 30, label: 'Cartel de la comisión',
          look(g) { g.say('Comisión de investigación nº 47 de esta legislatura. Las 46 anteriores concluyeron que «no consta».'); } },
        { id: 'presidenta', x: 50, y: 34, emoji: '👩‍⚖️', s: 8, label: 'Presidenta de la comisión',
          look(g) {
            g.say('—Esta comisión no se levantará hasta que aparezca la contabilidad de la Caja B. Nadie sale. Ni yo, y eso que tengo pádel.', 'Presidenta');
            if (!g.flag('docOK')) g.say('—Por cierto, alguien intentó triturar un documento antes de la sesión. La máquina se atascó. Qué mala suerte... para él.', 'Presidenta');
          },
          use: {
            pendriveB(g) { g.take('pendriveB'); g.say('—¡La contabilidad de la Caja B! Se levanta la sesión... Un momento, ¿está formateado? Bueno, da igual: ya ha salido en los periódicos. Pueden irse.', 'Presidenta'); g.win(); },
            informe(g) { g.say('—Muy interesante, pero quiero el CONTENIDO de la caja, no instrucciones para abrirla.', 'Presidenta'); },
          } },
        { id: 'tesorero', x: 22, y: 64, emoji: '🧔', s: 7, label: 'Testigo: el tesorero',
          look(g) {
            g.doc('🧔 Declaración del tesorero', `<p>—Señorías, lo digo claramente: no me consta. ¿La Caja B? No me consta. Yo me limitaba a llevar la contabilidad, y la contabilidad, francamente, no me consta. ¿Los sobres? Eran para felicitar la Navidad. ¿Que era julio? Pues no me consta.</p>`);
          } },
        { id: 'exministro', x: 38, y: 66, emoji: '👴', s: 7, label: 'Testigo: el exministro',
          look(g) {
            g.doc('👴 Declaración del exministro', `<p>—Quiero empezar diciendo que no me consta. Y termino diciendo que no me consta. Entre medias: no me consta, no me consta y, si me apuran, no me consta. ¿Que si conozco al tesorero? No me consta. ¿Que salgo con él en esta foto, en un yate? Eso es un montaje. Y además, no me consta.</p>`);
          } },
        { id: 'cunado', x: 54, y: 66, emoji: '🙋‍♂️', s: 7, label: 'Testigo: el cuñado del tesorero',
          look(g) {
            g.doc('🙋‍♂️ Declaración del cuñado', `<p>—Yo pasaba por aquí. ¿El tesorero? Es mi cuñado, sí, pero de su trabajo no me consta nada. ¿Que tengo un chalé en Marbella a mi nombre? Eso es de un amigo. ¿Qué amigo? No me consta. Oiga, ¿y usted de qué equipo es?</p>`);
          } },
        { id: 'trituradora', x: 76, y: 72, emoji: '🗑️', s: 8, label: 'Trituradora de papel (atascada)',
          look(g) {
            if (g.flag('docOK')) return g.say(ITEMS.informe.desc, '📋 Informe reconstruido');
            shredModal(g);
          } },
        { id: 'caja', x: 91, y: 55, emoji: '🔐', s: 9, label: 'Caja fuerte «B» (3 cifras)',
          look(g) {
            if (g.flag('safeOpen')) return g.say('La caja está vacía. Solo huele a billetes de 500 que ya no existen.');
            g.input({
              title: '🔐 Caja fuerte «B»', text: 'Combinación de 3 cifras.', numeric: true, maxLen: 3,
              check: (v) => v === '472',
              failText: () => rand(['La caja no se abre. «No le consta» esa combinación.', 'Incorrecto. ¿Has contado bien? Cada «no me consta» cuenta.']),
              ok: () => { g.set('safeOpen'); g.say('¡Clac! Dentro hay un solo objeto: un pendrive con la contabilidad B.'); g.give('pendriveB'); },
            });
          } },
        { id: 'periodista', x: 8, y: 44, emoji: '🧑‍💻', s: 6, label: 'Periodista',
          look(g) { g.say('—Llevo tres semanas contando los «no me consta» del exministro. Para la crónica, ¿sabes? Es un buen titular.', 'Periodista'); } },
      ],
      hints: [
        'La trituradora está atascada con un documento importante: reconstrúyelo intercambiando tiras.',
        'El informe dice que la clave es el número de veces que cada testigo dice «no me consta». Lee sus declaraciones y cuenta con cuidado.',
        'Tesorero: 4. Exministro: 7. Cuñado: 2. Clave: 472. Entrega el pendrive a la presidenta.',
      ],
    },

    // ------------------------------------------------------ 9
    {
      title: 'El BOE de las 23:59',
      place: 'Imprenta del Boletín Oficial del Estado',
      stars: 5,
      intro: 'Es 31 de diciembre, 23:59. El decreto que desbloquea tu DNI se está imprimiendo ahora mismo... y te has quedado encerrado/a en la imprenta.<br><br>Alguien ha dejado un mensaje cifrado para el ciudadano. Para leerlo, habrá que leer también el BOE. Entero. Bueno, o casi.<br><br><b>Objetivo:</b> descubre la palabra que abre la puerta.',
      outro: 'La puerta se abre justo a las 00:00, cuando el decreto entra en vigor. Feliz año nuevo. Su DNI ya está listo para recoger en el Ministerio de Asuntos Pendientes, en la famosa Ventanilla Única.',
      scene: { wall: '#4a4540', floor: '#3a3632', floorH: 34, pattern: 'tiles' },
      decor: [
        { kind: 'counter', l: 48, t: 66, w: 20, h: 7 },
        { emoji: '📦', x: 6, y: 72, s: 5, o: 0.9 }, { emoji: '📦', x: 10, y: 80, s: 5, o: 0.9 },
      ],
      hotspots: [
        { id: 'lema', x: 48, y: 16, sign: 'LEMA DE LA CASA', sub: '«Lo importante siempre va al principio»', w: 26, label: 'Lema de la imprenta',
          look(g) { g.say('«En el BOE, lo importante siempre va al principio». — Tradición de la casa, desde la Gazeta de 1661.'); } },
        { id: 'reloj', x: 82, y: 15, emoji: '🕛', s: 6, label: 'Reloj: 23:59',
          look(g) { g.say('23:59. El reloj lleva marcando 23:59 toda la noche. En el BOE, todo se publica a las 23:59.'); } },
        { id: 'rotativa', x: 22, y: 56, emoji: '🖨️', s: 14, label: 'Rotativa',
          look(g) {
            if (!g.flag('disc')) { g.set('disc'); g.say('Entre los rodillos, atascado, hay un disco de cifrado antiguo. Probablemente de la época de Felipe IV.'); g.give('disco'); }
            else g.say('La rotativa imprime a toda velocidad: decretos, órdenes, correcciones de errores de las correcciones de errores...');
          } },
        { id: 'linotipista', x: 40, y: 62, emoji: '👷', s: 7, label: 'Linotipista',
          look(g) { g.say('—Aquí se imprime lo que el gobierno aprueba a última hora. Este decreto trae nueve artículos. No leas solo el texto: fíjate en cómo empiezan. Como dice el lema...', 'Linotipista'); } },
        { id: 'boe', x: 58, y: 62, emoji: '📰', s: 7, label: 'BOE recién impreso',
          look(g) {
            g.doc('📰 BOLETÍN OFICIAL DEL ESTADO', `<div class="boe">
              <div class="boe-head">BOLETÍN OFICIAL DEL ESTADO<br><small>Núm. 314 · Jueves 31 de diciembre de 2026 · Sec. I</small></div>
              <p class="boe-title">Real Decreto-ley 99/2026, de 31 de diciembre, de medidas urgentes para la simplificación administrativa.</p>
              <p><i>La simplificación administrativa es un objetivo irrenunciable de este Gobierno, que lo ha renunciado en 43 ocasiones anteriores. En su virtud, dispongo:</i></p>
              <p><b>Artículo 1.</b> Cualquier ciudadano podrá solicitar cita previa, siempre que no la necesite.</p>
              <p><b>Artículo 2.</b> En ningún caso se admitirán documentos originales sin su fotocopia compulsada.</p>
              <p><b>Artículo 3.</b> Se crea la Comisión para el Estudio de la Creación de Comisiones.</p>
              <p><b>Artículo 4.</b> A efectos de este decreto, «urgente» significa «en un plazo no inferior a seis meses».</p>
              <p><b>Artículo 5.</b> Reglamentariamente se determinará el reglamento que desarrolle este reglamento.</p>
              <p><b>Artículo 6.</b> Todo trámite telemático requerirá presencia física para verificar que es telemático.</p>
              <p><b>Artículo 7.</b> Registro: todo escrito se presentará por triplicado, y el triplicado, por duplicado.</p>
              <p><b>Artículo 8.</b> El silencio administrativo será positivo, salvo cuando sea negativo, que será siempre.</p>
              <p><b>Artículo 9.</b> Se derogan todas las disposiciones anteriores, salvo las que sigan vigentes.</p>
              <p><b>Disposición final única.</b> El presente real decreto-ley entrará en vigor a las 00:00. Es decir, dentro de un minuto.</p></div>`);
          },
          use: { disco(g) { g.say('El BOE no está cifrado. Solo lo parece.'); } } },
        { id: 'sobre', x: 74, y: 82, emoji: '✉️', s: 5, label: 'Sobre en el suelo', show: (g) => !g.flag('env'),
          look(g) { g.set('env'); g.say('Un sobre lacrado: «PARA EL CIUDADANO — CIFRADO POR SU SEGURIDAD». Te lo guardas.'); g.give('sobre'); } },
        { id: 'cafe', x: 88, y: 78, emoji: '☕', s: 5, label: 'Café abandonado',
          look(g) { g.say('Un café frío con una nota: «Recordatorio: el decreto trae un regalito para el ciudadano. Lo he cifrado a la antigua, como hacía Julio».'); } },
        { id: 'puerta', x: 93, y: 46, emoji: '🚪', s: 13, label: 'Puerta con cerradura de letras',
          look(g) {
            g.input({
              title: '🔠 Cerradura de letras', text: '«INTRODUZCA LA PALABRA»', numeric: false, maxLen: 30, placeholder: 'Escribe la palabra',
              check: (v) => norm(v).includes('SILENCIO'),
              failText: (v) => (norm(v).replace(/\s/g, '').startsWith('CESAR') ? 'Casi: eso te dice CÓMO descifrar el mensaje, no la palabra.' : 'La cerradura no reacciona. Como la Administración.'),
              ok: () => { g.say('Escribes la palabra... y la puerta se abre en silencio. Muy apropiado. Suenan las campanadas: ¡00:00!'); g.win(); },
            });
          } },
      ],
      combos: {
        'disco+sobre'(g) { cipherModal(g); },
      },
      hints: [
        'Lee el lema de la pared y luego el BOE. Lo importante está «al principio» de cada artículo.',
        'Las primeras letras de los nueve artículos forman un mensaje. En la rotativa hay un disco de cifrado: combínalo con el sobre.',
        'Las iniciales dicen «CÉSAR TRES». Combina disco + sobre y pon desplazamiento 3. La palabra es SILENCIO.',
      ],
    },

    // ------------------------------------------------------ 10
    {
      title: 'La ventanilla única',
      place: 'Ministerio de Asuntos Pendientes',
      stars: 5,
      intro: 'Último trámite: recoger tu DNI en la famosa <b>Ventanilla Única</b>. Hay cuatro.<br><br>Registro no te da número de expediente sin la solicitud sellada. Sellos no te sella nada sin número de expediente. Y la puerta de salida solo se abre con resolución favorable... en el día exacto.<br><br><b>Objetivo:</b> consigue la resolución y sal del Ministerio el día correcto.',
      outro: '¡Sale usted del Ministerio con su DNI nuevo en la mano!',
      scene: { wall: '#d8cfc0', floor: '#7c6d5d', floorH: 30, pattern: 'tiles' },
      init(g) { g.set('day', 8); },
      decor: [
        { kind: 'counter', l: 5, t: 55, w: 68, h: 8 },
        { kind: 'flag', l: 44, t: 6, w: 5, h: 8 },
        { emoji: '🪴', x: 77, y: 80, s: 5, o: 0.9 },
      ],
      hotspots: [
        { id: 'organigrama', x: 22, y: 14, sign: 'ORGANIGRAMA', sub: '🔄', w: 13, label: 'Organigrama del Ministerio',
          look(g) {
            g.doc('🔄 Organigrama del procedimiento', `<ul>
              <li><b>Registro (1):</b> emite la Resolución a quien presente la Solicitud sellada.</li>
              <li><b>Sellos (2):</b> sella la Solicitud a quien acredite su Número de Expediente.</li>
              <li><b>Registro (1):</b> asigna Número de Expediente a quien presente la Solicitud sellada.</li>
              <li><b>Información (3):</b> para dudas, excepciones y lamentos.</li>
              <li><b>Caja (4):</b> para el pago de tasas.</li></ul>
              <p class="small">Este organigrama ha sido premiado por su coherencia interna.</p>`);
          } },
        { id: 'retrato', x: 60, y: 14, emoji: '🖼️', s: 6, label: 'Retrato del Ministro',
          look(g) { g.say('El Ministro de Asuntos Pendientes. Lleva en el cargo desde que se creó el ministerio. Tiene pendiente jubilarse.'); } },
        { id: 'v1', x: 13, y: 40, sign: '1 · REGISTRO', sub: '🧑‍💼', w: 13, label: 'Ventanilla 1: Registro',
          look(g) {
            if (g.has('resolucion')) return g.say('—Ya tiene su resolución. Fíjese bien en el plazo.', 'Registro');
            g.say('—Sin solicitud sellada no puedo darle número de expediente. Y sin expediente, no hay resolución. Siguiente.', 'Registro');
          },
          use: {
            solicitudSellada(g) {
              g.take('solicitudSellada'); g.give('resolucion');
              g.say('—Solicitud sellada... sin número de expediente... pero con declaración responsable y tasa pagada. Pues... ¡resolución favorable! Aquí tiene. Lea bien el plazo, que luego vienen los disgustos.', 'Registro');
            },
            solicitud(g) { g.say('—Sin sellar no la acepto. ¿Usted se ha leído el organigrama?', 'Registro'); },
          } },
        { id: 'v2', x: 30, y: 40, sign: '2 · SELLOS', sub: '👨‍🦲', w: 13, label: 'Ventanilla 2: Sellos',
          look(g) { g.say('—Sin número de expediente no puedo sellar nada. Y el número se lo da Registro cuando le lleve la solicitud sellada. Así es la vida.', 'Sellos'); },
          use: {
            solicitud: (g) => sellos(g), declaracionFirmada: (g) => sellos(g), justificante790: (g) => sellos(g),
            declaracion(g) { g.say('—Sin rellenar ni firmar no vale. Aquí se firma todo, hasta los recibos de haber firmado.', 'Sellos'); },
            modelo790(g) { g.say('—Esa tasa no está pagada. Pase por Caja.', 'Sellos'); },
          } },
        { id: 'v3', x: 47, y: 40, sign: '3 · INFORMACIÓN', sub: '👩‍💼', w: 14, label: 'Ventanilla 3: Información',
          look(g) {
            g.say('—Le informo: si no tiene número de expediente, puede sustituirlo por una DECLARACIÓN RESPONSABLE, bien rellenada y firmada.', 'Información');
            g.say('—Eso sí: acompañada del justificante de la tasa 790, pagada en Caja. Todo ello, junto a la solicitud genérica, se presenta en Sellos. Los impresos están en la mesa. ¿Algo más? No, ¿verdad? Siguiente.', 'Información');
          } },
        { id: 'v4', x: 64, y: 40, sign: '4 · CAJA', sub: '🧔', w: 13, label: 'Ventanilla 4: Caja',
          look(g) { g.say('—Caja. Aquí se pagan las tasas. Si no trae nada que pagar, no me haga perder el tiempo, que tengo mucho que no hacer.', 'Caja'); },
          use: {
            modelo790(g) {
              g.input({
                title: '💶 Caja — Pago de tasa 790', text: '—Importe: 0,00 €. Pero sin el NRC no puedo cobrarle. Dígame el NRC.', numeric: true, maxLen: 4,
                check: (v) => v === '2104',
                failText: () => '—Ese NRC no es válido. Lea las instrucciones del impreso, que para eso las escribimos.',
                ok: () => { g.take('modelo790'); g.give('justificante790'); g.say('—0,00 €. Pagado. Aquí tiene el justificante. No lo pierda o tendrá que volver a pagar 0,00 €.', 'Caja'); },
              });
            },
          } },
        { id: 'calendario', x: 82, y: 20, emoji: '📅', s: 7, label: (g) => `Calendario (${g.flag('day')} de octubre)`, look: calendarModal },
        { id: 'mesa', x: 28, y: 76, emoji: '🗂️', s: 7, label: 'Mesa de impresos',
          look(g) {
            if (!g.flag('forms')) {
              g.set('forms');
              g.say('Coges un ejemplar de cada impreso: Solicitud genérica S-1, Declaración responsable y Modelo 790. Hay 4.000 impresos más, pero esos parecen los importantes.');
              g.give('solicitud'); g.give('declaracion'); g.give('modelo790');
            } else g.say('Impresos de todos los colores. El bolígrafo encadenado a la mesa no tiene tinta, como manda la tradición.');
          } },
        { id: 'ujier', x: 56, y: 78, emoji: '😴', s: 7, label: 'Ujier dormido',
          look(g) {
            if (!g.flag('pen')) { g.set('pen'); g.say('Zzz... El ujier ronca plácidamente. Del bolsillo de su chaqueta asoma un bolígrafo. Con tinta. Lo tomas prestado.'); g.give('boli'); }
            else g.say('Zzz... Sueña que le suben el complemento de destino.');
          } },
        { id: 'puerta', x: 93, y: 55, emoji: '🚪', s: 13, label: 'Puerta de salida',
          look(g) {
            if (!g.has('resolucion')) return g.say('Un cartel: «SALIDA SOLO CON RESOLUCIÓN FAVORABLE. Y EN PLAZO».');
            g.say('Muestra la resolución en la puerta: selecciónala y úsala aquí.');
          },
          use: {
            resolucion(g) {
              if (g.flag('day') === 26) {
                g.say('La puerta lee la resolución, mira el calendario: lunes 26 de octubre, décimo día hábil. Exacto. ¡CLIC! La puerta se abre. Al otro lado, el sol. Y una mesa con tu DNI nuevo.');
                g.win();
              } else {
                g.sfx('bad');
                g.say(`La puerta mira el calendario (${g.flag('day')} de octubre) y emite un pitido: «FECHA NO COINCIDENTE CON EL VENCIMIENTO DEL PLAZO. SALIDA DENEGADA».`);
              }
            },
          } },
      ],
      combos: {
        'boli+declaracion'(g) { declModal(g); },
      },
      hints: [
        'Pregunta en Información: hay una alternativa al número de expediente. Los impresos están en la mesa, y un bolígrafo con tinta... en algún bolsillo.',
        'Combina el boli con la declaración y marca solo lo verdadero (lee la letra pequeña). El NRC se calcula con las instrucciones del modelo 790. Luego, todo a Sellos.',
        'Declaración: casillas 1, 2 y 5. NRC: 2104. Tras la resolución, cuenta 10 días hábiles desde el 9 de octubre saltando fines de semana y festivos (12 y 22): el 26 de octubre.',
      ],
    },
  ];

  function sellos(g) {
    const need = { solicitud: 'la solicitud genérica', declaracionFirmada: 'la declaración responsable firmada', justificante790: 'el justificante de la tasa 790' };
    const missing = Object.keys(need).filter((k) => !g.has(k));
    if (missing.length) {
      return g.say(`—A ver... Sin número de expediente solo puedo sellar si me trae la solicitud, la declaración responsable firmada y la tasa pagada. Me falta ${missing.map((k) => need[k]).join(' y ')}.`, 'Sellos');
    }
    Object.keys(need).forEach((k) => g.take(k));
    g.give('solicitudSellada'); g.sfx('stamp');
    g.say('—Declaración responsable... tasa pagada... solicitud... ¡PAM! Sellada. Ahora a Registro. Y no me mire así, que yo solo sello.', 'Sellos');
  }

  // Utilidades expuestas para pruebas
  window.__LEVEL_UTILS = { caesar, CIPHER, PLAIN, norm };
})();
