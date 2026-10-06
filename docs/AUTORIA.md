# Guía para crear temporadas

Cada temporada es un fichero `js/seasons/sN.js` que llama a `window.registerSeason({...})`,
más una solución automática en `tests/solutions/sN.js` que el banco de pruebas usa para
comprobar que **todos los niveles se pueden resolver**.

```bash
npm install          # solo la primera vez (instala jsdom)
node tests/run.js 3  # prueba la temporada 3
node tests/run.js    # prueba todas
```

La referencia completa es `js/seasons/s1.js` (Temporada 1) y su solución `tests/solutions/s1.js`.

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
  intro: 'HTML. Situación + <b>Objetivo:</b> qué hay que conseguir.',
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

### Coordenadas
La escena es 16:9. `x` e `y` son el **centro** del elemento en % (0-100). La pared ocupa
de arriba hasta `100 - floorH` %; el suelo, el resto. Tamaños en `cqw` (1 cqw = 1 % del ancho).
Un emoji con `s: 8` mide ≈ 8 % del ancho y ≈ 14 % del alto. Deja aire entre elementos:
el banco de pruebas avisa si dos hotspots se solapan.

### Decorado (`decor`)
- Emoji: `{ emoji: '🪑', x: 30, y: 80, s: 4, o: 0.9 }`
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
// Cartel (rectángulo de papel con texto):
{ id: 'aviso', x: 30, y: 25, sign: 'AVISO', sub: '📢', w: 11, label: 'Cartel', look(g) { g.doc('Título', '<p>…</p>'); } }
```

## 3. API `g` (disponible en look/use/combos/init)

| Función | Qué hace |
|---|---|
| `g.flag(k)` / `g.set(k, v=true)` | Leer/guardar estado del nivel (se guarda solo; usa valores JSON) |
| `g.has(id)` / `g.give(id)` / `g.take(id)` | Inventario |
| `g.say(texto, quien?)` | Muestra un mensaje (se encolan). `quien` por defecto = label del hotspot |
| `g.doc(titulo, html)` | Documento para leer (modal estilo papel) |
| `g.input({...})` | Teclado numérico o campo de texto (ver abajo) |
| `g.choice({...})` | Elección múltiple / diálogos (ver abajo) |
| `g.modal({...})` | Modal personalizado (ver abajo) |
| `g.closeModal()` | Cierra el modal abierto |
| `g.win()` | **Completa el nivel** (llámalo una vez, tras el último `say`) |
| `g.sfx(tipo)` | `click`, `pick`, `ok`, `bad`, `stamp`, `win` |

### `g.input`
```js
g.input({
  title: '🔐 Caja fuerte', text: 'Combinación de 4 cifras.',
  numeric: true, maxLen: 4,              // numeric:false → campo de texto (placeholder opcional)
  check: (v) => v === '0915',            // v es string
  failText: (v) => 'Mensaje si falla',
  ok: (v) => { g.give('modelo'); g.say('Se abre.'); },
});
```

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

### `g.modal` (puzles a medida)
```js
g.modal({
  title: 'Título', cls: 'wide',           // cls opcional: 'wide' | 'doc'
  html: '<div id="p"></div>',
  buttons: [{ label: 'Cancelar' }, { label: 'Firmar', cls: 'primary', onClick(close, body) { return false; /* no cierra */ } }],
  onMount(body, close) { /* pinta y conecta eventos dentro de body */ },
});
```
Clases CSS disponibles dentro de modales: `.doc-body`, `.tbl`, `.msg.good/.bad`, `.opt-grid` + `.opt(.on)`,
`.tile-grid` + `.tile(.on/.fixed)`, `.lcd`, `.paper-note`, `.row-btns`, `.btn(.primary)`, `label.field`,
`.small`, `.tiny`, `.big-num`. Usa **ids únicos** con prefijo de temporada (`#s2-...`).
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
    h.btn('Firmar');                   // botón de un modal por su texto
    h.clickSel('#s2-x'); h.setValue('#s2-sel', 3); // elementos de un modal propio
    h.close();                         // cierra el modal
  },
  // ... una función por nivel
];
```
Si una acción no es posible (objeto que no tienes, hotspot oculto, código rechazado),
la prueba falla con un mensaje claro. Al final de cada función el nivel debe estar completado (`g.win()`).

## 5. Normas de diseño

- **Sátira, no ataque**: humor sobre burocracia, instituciones y vicios políticos genéricos.
  Nada de personas reales, partidos reales ni insultos a colectivos. Partidos y cargos, inventados.
- **Juego limpio**: todas las pistas necesarias están en la sala (o en el inventario). No hace falta
  saber nada de fuera salvo leer y hacer cuentas sencillas.
- Si un puzle lógico debe tener **solución única**, compruébalo por fuerza bruta antes.
- Cada temporada es **más difícil** que la anterior, y dentro de cada temporada la dificultad sube del nivel 1 al 10.
- Textos en español de España, con tildes y signos de apertura (¿¡).

## 6. Móvil (la mayoría de jugadores)

- En el móvil en vertical la sala se muestra **hasta 2 veces más ancha que la pantalla** y se desliza a los lados
  (con flechas ‹ ›). En horizontal, la sala va a la izquierda y el inventario y el texto a la derecha.
- Usa hotspots de tamaño `s: 5` o más. Los toques que caen hasta 24 px fuera de un objeto cuentan como toque en él,
  pero dos objetos muy pegados se confunden: deja aire entre ellos.
- Los carteles (`sign`) se leen bien con títulos cortos (una o dos palabras).
- En modales propios, nada de anchos fijos mayores de ~300 px: usa `%`, `flex-wrap` o `grid` con `minmax`.
- Para comprobarlo, abre el juego en el navegador con la vista de móvil (360 × 740) y juega los niveles nuevos.
