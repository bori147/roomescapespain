# Guía para crear temporadas

Cada temporada es un fichero `js/seasons/sN.js` que llama a `window.registerSeason({...})`,
más una solución automática en `tests/solutions/sN.js` que el banco de pruebas usa para
comprobar que **todos los niveles se pueden resolver**.

```bash
npm install                    # solo la primera vez (instala jsdom y playwright-core)
node tests/run.js 3            # prueba la temporada 3
node tests/run.js              # prueba todas (debe acabar en «TODO CORRECTO»)
node tests/shots.js shots movil-360 movil-corto   # capturas + sondas de maquetación en móvil
```

La referencia completa es `js/seasons/s1.js` (Temporada 1) y su solución `tests/solutions/s1.js`.
La sección 7 resume **todo lo que vigilan las pruebas**: si una regla de esta guía se puede comprobar
automáticamente, está ahí.

---

## 1. Estructura de una temporada

```js
(function () {
  'use strict';
  const { rand, pad, norm, caesar, esc } = window.GameUtils;

  const ITEMS = {
    llave: { emoji: '🗝️', name: 'Llave oxidada', desc: 'Texto (admite HTML) al seleccionar el objeto.' },
  };

  const LEVELS = [ /* 10 niveles */ ];

  window.registerSeason({
    id: 2,                         // = número del fichero
    title: 'Hazte autónomo',       // nombre corto
    subtitle: 'Frase de una línea para la tarjeta del menú',
    badge: 'Emprendedor',          // etiqueta de dificultad de la temporada
    emoji: '💼',
    intro: 'HTML: presentación de la temporada (2-4 frases).',
    items: ITEMS,
    levels: LEVELS,
    ending: {
      head: 'ORGANISMO<br><small>Subtítulo</small>',  // opcional
      title: '¡Título del final!',
      html: '<p>Texto final en HTML.</p>',
      stamp: 'TEXTO DEL SELLO',
    },
    css: '/* opcional: estilos propios, con prefijo .s2- */',
  });
})();
```

Los **ids de objetos** solo tienen que ser únicos dentro de la temporada. El inventario se vacía al empezar cada nivel,
salvo los objetos indicados en `carry`, que el jugador trae de trámites anteriores (se muestran en la intro del nivel
y en la resolución del nivel anterior).

### CSS propia de la temporada
- El motor la inyecta dentro de **`@layer seasons{…}`**: gana a los estilos generales del juego, pero pierde ante
  `@layer overrides`, donde el núcleo corrige lo que haga falta sin tocar tu fichero. No uses `!important`
  (invierte el orden de las capas y rompe esas correcciones).
- Prefija todas las clases e ids con la temporada (`.s2-…`, `#s2-…`).
- Usa las fichas de color del juego en vez de colores sueltos: `var(--ink)`, `var(--ink-2)`, `var(--ink-3)` (el texto
  más claro permitido), `var(--paper)`, `var(--surface)`, `var(--sunken)`, `var(--red)`, `var(--green)`, `var(--marker)`,
  `var(--accent)`, `var(--ui)` (Inter), `var(--read)` (serif de lectura), `var(--mono)` (monoespaciada).
  Los alias antiguos (`--ink-soft`, `--paper2`, `--type`, `--yellow`, `--radius`…) siguen funcionando.
- Nada de texto por debajo de 12 px en los modales (ver §6) ni de anchos fijos.

### Continuidad (obligatoria desde la temporada 2)
Lee `docs/CANON.md`. El banco de pruebas exige que, en las temporadas 2 y siguientes:
- **todos** los niveles tengan `carry` con al menos un objeto;
- en los niveles 2-10, los objetos de `carry` se hayan conseguido (`g.give`) en algún nivel anterior de la misma temporada;
- en cada nivel se **use** al menos uno de los objetos traídos (`h.use`, `h.combo` en la solución, o `g.take` en el código).

## 2. Nivel

```js
{
  title: 'Título',
  place: 'Lugar donde ocurre',
  stars: 3,                         // 1..5 (dificultad dentro de la temporada)
  intro: 'HTML. Situación…<br><br><b>Objetivo:</b> qué hay que conseguir.',
  goal: 'Renueva el DNI antes de que cierre la ventanilla.',  // opcional (ver abajo)
  outro: 'Texto de la resolución al completar el nivel (enlaza con el siguiente).',
  scene: { wall: '#dcd6c4', floor: '#8f8f86', floorH: 32, pattern: 'tiles' }, // pattern: tiles | wood | carpet | plain
  carry: ['certificado'],           // objetos que el jugador TRAE de trámites anteriores (empieza con ellos)
  init(g) { g.set('x', 0); },       // opcional: estado inicial
  decor: [ ... ],                   // decorado no interactivo
  hotspots: [ ... ],                // elementos con los que se interactúa
  combos: { 'a+b'(g) { ... } },     // combinaciones de objetos (claves en ORDEN ALFABÉTICO)
  hints: ['pista 1', 'pista 2', 'solución completa'],  // mínimo 3; la última = solución
}
```

### El objetivo
El objetivo se ve **siempre**: en la intro (recuadro «OBJETIVO»), en el chip 🎯 del juego, en el menú
(«Continuar») y en la ventanilla cuando no hay mensajes. El motor lo saca así:
1. `goal`, si el nivel lo define;
2. si no, el texto que sigue a **`<b>Objetivo:</b>`** en `intro` (todo lo anterior queda como narración).

Por eso la `intro` **debe terminar** con `<b>Objetivo:</b> …` (una frase en tú, con verbo de acción),
o definir `goal`. Ejemplo: `<b>Objetivo:</b> consigue el sello del Registro y preséntalo en la ventanilla 3.`

### Coordenadas
La escena es 16:9. `x` e `y` son el **centro** del elemento en % (0-100). La pared ocupa
de arriba hasta `100 - floorH` %; el suelo, el resto. Tamaños en `cqw` (1 cqw = 1 % del ancho).
Un emoji con `s: 8` mide ≈ 8 % del ancho y ≈ 14 % del alto. Deja aire entre elementos:
el banco de pruebas avisa si dos hotspots se solapan. Los objetos que tocan el suelo reciben
una sombra de contacto automática (no hace falta hacer nada).

### Decorado (`decor`)
- Emoji: `{ emoji: '🪑', x: 30, y: 80, s: 4, o: 0.9 }` (el decorado se ve algo desaturado para que lo tocable destaque)
- Bloques (en %, esquina superior izquierda): `{ kind: 'counter', l: 20, t: 55, w: 30, h: 9 }`
  Tipos: `counter` (mostrador), `window`, `flag` (España), `flag-eu`, `shelf`, `board` (corcho),
  `screen` (pantalla oscura), `rug` (alfombra, `color`), `column`, `box` (`color`), `arc` (hemiciclo, sin coordenadas).

### Hotspots
```js
{ id: 'cajon', x: 40, y: 75, emoji: '🗃️', s: 7, label: 'Cajón',     // label: texto o (g) => texto
  tag: 'PPA',                                // opcional: etiqueta visible bajo el emoji
  show: (g) => !g.flag('abierto'),           // opcional: solo aparece si devuelve true
  look(g) { ... },                           // clic sin objeto seleccionado
  use: { llave(g) { ... }, '*'(g, item) { ... } },  // clic con un objeto seleccionado
}
// Cartel (placa de señalización con texto):
{ id: 'aviso', x: 30, y: 25, sign: 'AVISO', sub: '📢', w: 11, label: 'Cartel', look(g) { g.doc('Título', '<p>…</p>'); } }
```
- **`s: 5` como mínimo** en los hotspots (el banco avisa por debajo). En el móvil la sala mide unos 680 px de ancho:
  `s: 5` son ≈ 34 px, lo justo para un dedo.
- **Carteles:** título corto (una o dos palabras, se pinta en mayúsculas) y `sub` de **3 palabras o menos**, o un solo
  emoji. Si el `sub` es solo un emoji, la ventanilla lo usa como «cara» del cartel cuando habla.
- El nombre accesible de un hotspot es «texto visible — label» (p. ej. «HACIENDA SOMOS TODOS — Cartel institucional»):
  el `label` debe describir el objeto, no repetir el cartel.

## 3. API `g` (disponible en look/use/combos/init)

| Función | Qué hace |
|---|---|
| `g.flag(k)` / `g.set(k, v=true)` | Leer/guardar estado del nivel (se guarda solo; usa valores JSON) |
| `g.has(id)` / `g.give(id)` / `g.take(id)` | Inventario. `g.give` hace volar el objeto a la bandeja y muestra el justificante «Añadido a tu bandeja» |
| `g.say(texto, quien?)` | Muestra un mensaje en la ventanilla (se encolan). `quien` por defecto = label del hotspot. Ver «pieles» en §5 |
| `g.doc(titulo, html)` | Documento para leer (oficio en papel, botón «Entendido») |
| `g.input({...})` | Teclado numérico («casillas del Modelo 790») o campo de texto (ver abajo) |
| `g.choice({...})` | Elección múltiple / diálogos (ver abajo) |
| `g.modal({...})` | Modal personalizado (ver abajo) |
| `g.closeModal()` | Cierra el modal abierto |
| `g.win()` | **Completa el nivel** (llámalo una vez, tras el último `say`): cae el sello «TRÁMITE COMPLETADO» en la sala |
| `g.sfx(tipo)` | Sonido (ver tabla). **La vibración es automática**: cada sonido lleva su patrón en los móviles que vibran |

**Sonidos** (`g.sfx`): los de siempre siguen igual y hay algunos nuevos.

| Tipo | Úsalo para | Vibra |
|---|---|---|
| `click` | Pulsar algo sin consecuencia (pasar una hoja, mover una ficha) | no |
| `pick` | Coger o seleccionar algo (el motor ya lo pone en `g.give`) | sí, corto |
| `ok` | Acierto, algo se abre | sí |
| `bad` | Error, respuesta incorrecta | sí, doble |
| `stamp` | Un sello (aprobado, denegado, registrado) | sí, golpe |
| `win` | Reservado al motor (fin de nivel) | sí |
| `type` | Teclear (teclado de casillas, máquina de escribir) | no |
| `paper` | Abrir o pasar un documento (el motor ya lo pone al abrir oficios) | no |
| `bell` | Timbre de ventanilla («¡siguiente!»), turnos | no |
| `buzz` | Zumbido de máquina que rechaza un código | sí, doble |
| `season` | Reservado al motor (fin de temporada) | sí, largo |

No llames a `navigator.vibrate` ni pongas sonidos en bucle: el jugador puede silenciar el sonido y la vibración
por separado desde «Expediente en pausa», y el motor respeta las dos cosas.

### `g.input`
```js
g.input({
  title: '🔐 Caja fuerte', text: 'Combinación de 4 cifras.',
  numeric: true, maxLen: 4,              // numeric:false → campo de texto (placeholder opcional)
  check: (v) => v === '0915',            // v es string
  failText: (v) => 'Mensaje si falla',   // se muestra con el sello «DENEGADO»
  ok: (v) => { g.give('modelo'); g.say('Se abre.'); },
});
```
Con `numeric: true` se pinta una casilla por cifra (`maxLen` casillas, máximo razonable 9). Un intento fallido
se queda visible un momento en rojo y el teclado se vacía; en los campos de texto el intento se conserva seleccionado.

### `g.choice`
```js
g.choice({
  title: '🎤 Debate', text: 'El moderador te pregunta…',
  options: [
    { label: 'Respuesta A', onPick(g, msg) { msg('Abucheos.', true); return false; } }, // false = no cierra
    { label: 'Respuesta B', onPick(g) { g.set('debate', 1); g.say('Aplausos.'); } },
  ],
});
```
Las opciones se pintan como filas de lista de 56 px con una flecha ›: escribe frases completas, sin numeración
manual salvo que la numeración sea parte del chiste.

### `g.modal` (puzles a medida)
```js
g.modal({
  title: '🖥️ Sede electrónica — Paso 2 de 3',  // lo que va tras « — » sale como antetítulo pequeño
  cls: 'wide',                                // cls opcional: 'wide' | 'doc'
  html: '<div id="s2-p"></div>',
  buttons: [{ label: 'Cancelar', cls: 'ghost' }, { label: 'Firmar el acta', cls: 'primary', onClick(close, body) { return false; /* no cierra */ } }],
  onMount(body, close) { /* pinta y conecta eventos dentro de body */ },
});
```
- **Título:** emoji + nombre corto. Si lleva « — », lo de antes es el título y lo de después el antetítulo.
- **Botones:** como mucho **un** `primary` (el motor lo coloca el último, a la derecha / abajo). El resto,
  normales (secundarios) o `ghost`. Usa `cost` para lo que cuesta o destruye algo («Ver la solución…», «Reiniciar»).
  Sin `buttons`, el pie por defecto es «Volver a la sala» (`g.doc`: «Entendido»).
- **Nómbralos por el resultado** («Firmar el acta», «Enviar a Bruselas», «Presentar recurso»), nunca «OK» o «Aceptar».
  Ojo: el motor no puede usar esas palabras en sus propios botones (ver §7, «agujas»).
- Si el cuerpo tiene campos (`input`, `select`, `textarea`), el modal no se cierra tocando fuera ni deslizando
  hacia abajo: así no se pierde lo escrito. Si el jugador lo cierra con ✕, los campos se guardan como borrador.

**Clases disponibles dentro de los modales**

| Clase | Para qué |
|---|---|
| `.doc-body` | Texto largo de documento (serif de lectura, negrita real) |
| `.tbl` | Tabla. **Si la primera fila es toda de `<th>` y tiene 4 o más columnas**, en el móvil se convierte sola en fichas (una tarjeta por fila, cada dato con su encabezado). Pon siempre esa fila de encabezados en las tablas anchas |
| `.msg.good` / `.msg.bad` | Veredicto: se pinta con el sello «CONFORME» o «DENEGADO» y se anuncia al lector de pantalla. Déjalo vacío hasta que haya veredicto |
| `.btn`, `.btn.primary`, `.btn.ghost`, `.btn.cost` | Botones dentro del cuerpo (mismas reglas que el pie) |
| `.row-btns` | Fila de botones; si contiene un `.btn.primary`, se queda pegada abajo al desplazar |
| `.pin-top` | Panel de estado que debe verse siempre (marcador, ley vigente…): se queda fijo arriba al desplazar |
| `.opt-grid` + `.opt(.on)` | Opciones marcables (casilla ☐/☒) |
| `.tile-grid` + `.tile(.on/.fixed)` | Tablero de fichas |
| `.lcd` | Pantalla verde de máquina (solo para aparatos del mundo: relojes, cajeros, teletipos) |
| `.paper-note` | Nota en papel |
| `label.field` | Etiqueta de campo (13 px, seminegrita) |
| `.small` | Texto secundario |
| `.tiny` | Letra pequeña legal (12 px). Si el modal tiene `.tiny`, aparece un botón «🔍 Lupa» que la amplía |
| `.big-num` | Cifra destacada |

El núcleo (`js/ui-puzzles.js`) añade `aria-pressed` a `.opt`, `.tile`, `.party`, `.strip` y `.cal-d` según tengan `.on`/`.pick`/`.cur`,
así que basta con poner y quitar esas clases. Usa **ids únicos** con prefijo de temporada (`#s2-...`).
No uses `Math.random()` en nada que afecte a la solución.

## 4. Solución automática (`tests/solutions/sN.js`)

```js
module.exports = [
  async (h) => {             // nivel 1
    h.click('cajon');                  // clic en hotspot
    h.use('llave', 'puerta');          // usar objeto en hotspot
    h.combo('a', 'b');                 // combinar objetos
    h.click('caja'); await h.keypad('472');   // teclado numérico
    h.click('puerta'); await h.text('silencio'); // campo de texto
    h.choose('Respuesta B');           // opción de g.choice
    h.btn('Firmar');                   // botón de la temporada en el modal, por su texto
    h.clickSel('#s2-x'); h.setValue('#s2-sel', 3); // elementos de un modal propio
    h.close();                         // cierra el modal
  },
  // ... una función por nivel
];
```
Si una acción no es posible (objeto que no tienes, hotspot oculto, código rechazado),
la prueba falla con un mensaje claro. Al final de cada función el nivel debe estar completado (`g.win()`).

- `h.btn(texto)` pulsa el **primer** botón del modal cuyo texto contiene `texto`, **sin contar los botones del
  sistema** (`[data-sys]`: ✕, pie por defecto, Lupa, chips). Usa un texto que solo esté en tu botón.
- `h.setValue('#s5-f1', 'V')` sigue funcionando aunque el núcleo haya cambiado el `<select>` por fichas o chips
  (el `<select>` original sigue siendo la fuente de verdad).

## 5. Normas de diseño

- **Sátira, no ataque**: humor sobre burocracia, instituciones y vicios políticos genéricos.
  Nada de personas reales, partidos reales ni insultos a colectivos. Partidos y cargos, inventados.
- **Juego limpio**: todas las pistas necesarias están en la sala (o en el inventario). No hace falta
  saber nada de fuera salvo leer y hacer cuentas sencillas.
- Si un puzle lógico debe tener **solución única**, compruébalo por fuerza bruta antes.
- Cada temporada es **más difícil** que la anterior, y dentro de cada temporada la dificultad sube del nivel 1 al 10.
- Textos en español de España, con tildes y signos de apertura (¿¡).

### Voz
- **La interfaz y el narrador tratan de tú**: «Coges el impreso», «Toca la ventanilla», «Te falta la firma».
- **Los funcionarios y los sistemas del mundo tratan de usted**, y hablan con raya o entre comillas:
  `—Vuelva usted mañana. Y traiga el original.` · `«PASO 1 DE 1: adjunte el certificado».`
- **Los botones se nombran por lo que pasa** al pulsarlos: «Presentar el recurso», «Firmar el 036», «Volver a la sala».
  Nada de «OK», «Aceptar» o «Continuar» si se puede decir qué ocurre.

### Pieles de la ventanilla (cómo se pinta `g.say`)
El motor elige el aspecto del mensaje a partir del texto, sin campos nuevos:

| Si el texto… | Piel | Se ve como |
|---|---|---|
| empieza por **«—»** | **habla** | bocadillo con la cara (emoji) y el nombre de quien habla |
| no empieza por «—» | **narración** | papel, en tú, con la cara del objeto mirado |
| es la descripción de un objeto | objeto | fondo hundido y la etiqueta «Seleccionado» |
| lo pone el motor | sistema | borde amarillo |

Así que: **las frases de personajes, siempre con raya inicial**; la narración, **sin raya**.
Si mezclas, empieza por la narración y deja la cita dentro: `Te mira por encima de las gafas: —Siguiente.`
(se pintará como narración). Un `quien` corto y claro («Funcionaria del Registro») sale como nombre del hablante.

### Emoji
Los objetos clave (inventario, hotspots y emoji de temporada) deben usar emoji de **Emoji 12.0 o anterior**:
los más nuevos se ven como □ en Windows 10 y en Android antiguos. El banco avisa de estos:

| Evita | Usa |
|---|---|
| 🪪 carné | 💳 o 📇 |
| 🪙 moneda | 💰 o 💶 |
| 🪧 pancarta | 📋 o un cartel (`sign`) |
| 🪟 ventana / 🪞 espejo | un decorado `window` / 🖼️ |
| 🪴 planta | 🌿 o 🌱 |
| 🪛 destornillador | 🔧 |
| 🛗 ascensor / 🛖 cabaña | 🚪 / 🏚️ |
| 🧑‍💼 🧑‍💻 🧑‍⚖️ 🧑‍🍳 (personas neutras con ZWJ) | 👨‍💼 👩‍💼 👨‍💻 👩‍⚖️ 👨‍🍳 (versiones con género, Emoji 4.0) |
| 🤵‍♀️ | 🤵 |

Las temporadas publicadas tienen alguno: no se cambian (el contenido está congelado), pero no los copies.

## 6. Móvil (la mayoría de jugadores)

**Cómo se ve el juego en un móvil en vertical** (de arriba abajo, todo en una pantalla, sin desplazar la página):
1. **Barra superior**: temporada y trámite («T3 · 6/10»), el chip 🎯 con el objetivo (se despliega al tocarlo),
   💡 Pista y 📂 Expediente (pausa: código, ayuda, sonido, vibración, reiniciar, salir).
2. **La sala**, hasta 2 veces más ancha que la pantalla, que se desliza con el dedo.
3. **Barra de la sala** (40 px): ‹ plano › y 🔍 Lupa. El plano dice qué parte de la sala estás viendo; las flechas
   avisan con un número si hay cosas nuevas fuera de la vista. Con un objeto en la mano, la barra muestra
   «Usando: 🪪 DNI nuevo ✕» en lugar del plano (nunca encima de la sala).
4. **La ventanilla** (los mensajes), justo debajo de la sala.
5. **La bandeja** (el inventario), abajo del todo, al alcance del pulgar, con el ☕ al final.

Los documentos y puzles se abren como **hojas desde abajo** (bottom sheets) con el botón principal fijo abajo.
En horizontal, la sala va a la izquierda y la barra, el objetivo, la ventanilla y la bandeja a la derecha;
los modales son tarjetas a dos columnas (cuerpo a la izquierda, botones a la derecha). En escritorio, igual
que en horizontal pero más amplio.

**Reglas para autores**
- Hotspots con **`s: 5` o más**, separados entre sí. Los toques que caen hasta 24 px fuera de un objeto cuentan
  como toque en él, pero dos objetos muy pegados se confunden. Evita centros pegados a los lados (x < 4 o x > 96):
  ahí la sala se difumina con el borde mientras se desliza.
- **Carteles**: título de una o dos palabras; `sub` de **3 palabras o menos** (o un emoji).
  Su texto nunca baja de 11 px (título) y 10 px (subtítulo), así que un cartel largo se hace enorme: acórtalo.
- **Modales propios**: nada de anchos fijos mayores de ~300 px; usa `%`, `flex-wrap` o `grid` con `minmax(0,1fr)`.
  Tablas anchas: con fila de `<th>` (se vuelven fichas solas). Tableros: celdas de 44 px o más si caben.
  Nada de `max-height` + `overflow:auto` anidados: la hoja ya se desplaza.
- **Texto**: nunca por debajo de 12 px fuera de la sala (11 px solo en etiquetas en MAYÚSCULAS con espaciado,
  como «APELLIDOS» en un carné). Nada de `opacity` para atenuar texto: usa `var(--ink-3)`.
- **Botones y campos**: 44 × 44 px como mínimo (los enlaces dentro de un párrafo no cuentan).
- **Para comprobarlo**, abre el juego con la vista de móvil a **360 × 740** y a **375 × 553** (iPhone SE con las
  barras de Safari) y juega los niveles nuevos. Además, `node tests/shots.js shots movil-360 movil-corto horizontal`
  hace capturas de las escenas clave y pasa las sondas de §7.

## 7. Lo que vigila el banco de pruebas

### `node tests/run.js`
**Comprobaciones globales** (una vez):

| Comprobación | Falla si… | Ejemplo |
|---|---|---|
| CSS en capas | una hoja de `css/` o `legal/legal.css` tiene algo fuera de `@layer` (solo se permiten `@layer`, `@font-face`, `@property`, `@view-transition`, `@charset` y `@supports`/`@media` que envuelvan capas). `css/tokens.css` y `css/style.css` empiezan por el mismo `@layer reset, tokens, …, overrides;` | `.foo{color:red}` suelto en `ui-play.css` → «.foo fuera de @layer (línea 3)» |
| Contraste de fichas | algún par de la tabla de colores baja de AA (texto 4,5:1; bordes, estrellas, foco 3:1). Incluye el blanco sobre el acento de cada temporada | cambiar `--ink-3` a `#8E877D` → «ink-3 sobre canvas = 3.15:1» |
| Marca | `index.html`, `404.html`, `legal/*.html` o `README.md` escriben «Vuelva Usted Mañana» (es «Vuelva usted mañana») | |
| No instalable | hay manifest, `apple-touch-icon`, iconos PNG de app, service worker, Wake Lock o «Añadir a pantalla de inicio» | |
| Versionado | `index.html` mezcla números `?v=` o enlaza CSS/JS sin `?v=` | |

Mientras `css/tokens.css` no declare las capas, las comprobaciones del rediseño (capas, contraste, marca fuera
del README) se informan como omitidas o avisos.

**Por temporada:** datos bien formados, ids únicos, objetos existentes, combos en orden alfabético, `carry`,
códigos de expediente y que la solución completa los 10 niveles. Además, **avisos** (no fallan) de solapamientos,
hotspots con `s < 5` y emoji posteriores a Emoji 12.0.

**Agujas:** durante la partida automática se apuntan las etiquetas de todos los botones del sistema (`[data-sys]`).
Si alguna contiene un texto que busca una solución con `h.btn` («Presentar», «Firmar», «Registrar», «Enviar»,
«Someter», «Transferir», «Modificar», «Rellenar solicitud», «Que empiece la firma», «Publicar y hacer captura»,
«Emitir factura», «Devolver con correcciones», «Confirmar gastos», «Calcular y registrar», «Anotar en el libro» y
cualquier otro de `tests/solutions/`), falla: el jugador vería dos botones que parecen el mismo.

### Arreglos sobre contenido congelado (y su guarda)
Las temporadas publicadas no se editan. Lo que había que corregir se corrige desde el núcleo, y cada arreglo
tiene una **guarda** en `tests/run.js` que falla si el marcado de la temporada cambia y el arreglo deja de aplicarse:

| Arreglo (en `@layer overrides` o en `js/ui-puzzles.js`) | Guarda |
|---|---|
| Calendario de T4-N8: `.cal-grid > .cal-h + .cal-d { grid-column-start: 6 }` (el 1 de junio de 2030 es sábado) | T4-N8 «calendario»: existe `.cal-h + .cal-d` y su texto es «1» |
| El mismo arreglo no debe tocar T1-N10 (que pone huecos explícitos) | T1-N10 «calendario»: **no** existe `.cal-h + .cal-d` |
| «festivo» del calendario como marca «F» en la esquina; fines de semana rayados | (cubierto por las guardas de calendario) |
| Plano del sótano de T3-N6: rejilla fluida de 5 columnas, celdas de 12 px que parten palabras, muro con contraste 5,94:1 | T3-N6 «plansot»: existe `.s3-plan` con `.s3-cell` |
| Tablas a fichas en el móvil: Pisos (T3-N1), Caja de facturas y CAFÉ-MRR (T5-N4) | reciben `table.tbl-stack` y `td[data-label]` |
| Clasificación de CAFÉ-MRR con chips en lugar de `<select>` | los `#s5-f1…#s5-f11` siguen existiendo y aceptan `h.setValue` |
| El cuadro de créditos de T5-N3 (`.s5-bud`) **no** se convierte en fichas (tiene columna fija) | T5-N3 «cuadro»: `.s5-bud` sin `.tbl-stack` |
| CSS de temporada dentro de `@layer seasons` (para que `overrides` gane) | el `<style data-season>` empieza por `@layer seasons{` (en jsdom, que no entiende `@layer`, basta con que `js/core.js` lo haga en los navegadores que sí) |
| Textos mínimos de temporada (`.s2-wall`, `.s5-cal-g b`, `.s5-mz small` ≥ 11 px en mayúsculas; carnés finales), monoespaciada para cifrados y tiras | sondas de tamaño de texto de `tests/shots.js` |

Las guardas que dependen de un fichero aún vacío (`js/ui-puzzles.js`) se marcan como omitidas (⏭) hasta que exista.

### `node tests/shots.js`
Hace capturas de 32 escenas en 12 vistas (de 320 × 568 a 1440 × 900, con móviles en horizontal y tableta) y, en
cada captura, pasa estas **sondas** (un fallo da salida 1; los avisos solo se listan):

| Sonda | Falla si… |
|---|---|
| Desbordamiento | la página se desplaza a los lados o algo queda cortado por el borde |
| Juego | la página de juego se desplaza, o la ventanilla o la bandeja no se ven enteras |
| Botón principal | en una pantalla de papel del teléfono, el `.btn.primary` no se ve sin desplazar o algo lo tapa |
| Ko-fi | sin modal abierto (y fuera del final de temporada), no hay ninguna entrada ☕ visible y pulsable |
| Tamaño de texto | hay texto visible de menos de 12 px fuera de la sala (11 px en mayúsculas espaciadas) o de menos de 10 px dentro |
| Hotspots | el centro de un hotspot visible lo tapa otra cosa (flechas, chips, avisos). Si lo tapa otro hotspot, solo avisa |
| Toast | el justificante «Añadido a tu bandeja» tapa la sala |
| Objetivos táctiles | en vistas táctiles, un botón, enlace o campo fuera de la sala mide menos de 44 × 44, contando la zona ampliada con `::before`/`::after` (en tableros solo avisa si mide ≥ 24) |
| Sello | el sello «APROBADO» o el del final pisa el título |

Opciones útiles: `--escenas=05,23-27` (solo esas), `--motion` (con animaciones), `--estricto` (que las sondas
fallen aunque el rediseño esté a medias). El detalle de cada captura queda en `<carpeta>/informe.json`.
