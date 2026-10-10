# 📂 Vuelva usted mañana — Room escape

Un *room escape* satírico por las entrañas de la burocracia y la política española.
Tu DNI caduca mañana. Solo tienes que renovarlo. ¿Qué podría salir mal?

**▶ Jugar:** https://bori147.github.io/roomescapespain/

Gratis, sin anuncios y sin registro. Funciona en el navegador del ordenador o del móvil.
Páginas legales en `legal/` (aviso legal, privacidad, cookies y descargo); analítica opcional con consentimiento: [docs/ANALITICA.md](docs/ANALITICA.md).
Cómo está publicado y cómo crecer sin costes: [docs/PUBLICAR.md](docs/PUBLICAR.md).

> Sátira. Todos los personajes, partidos y organismos son ficticios.
> Cualquier parecido con la realidad es pura coincidencia (o no).

## Temporadas

El juego se divide en **temporadas de 10 trámites**. Cada temporada es más difícil que la anterior
y se desbloquea al superar la previa.

| # | Temporada | De qué va | Nivel |
|---|-----------|-----------|-------|
| 1 | 🪪 El DNI | Cita previa, fotocopias, padrón, sede electrónica, la renta, una investidura… | Iniciación |
| 2 | 💼 Hazte autónomo | Modelo 036, cuota de autónomos, notaría, licencia de apertura, Verifactu, el 303, la inspección | Emprendedor |
| 3 | 🏠 Mi casa es un expediente | Alquiler, hipoteca, Registro de la Propiedad, impuestos, Catastro, junta de vecinos, la ITE | Propietario |
| 4 | 🗳️ Campaña electoral | Mesa electoral, voto por correo, mitin, encuestas, debate, escrutinio D'Hondt, pactos, moción de censura | Político |
| 5 | 🏛️ Las altas esferas | Oposiciones, presupuestos prorrogados, fondos europeos, Bruselas, Senado, Constitucional, Consejo de Ministros | Alto funcionario |

### Una sola historia

Las cinco temporadas cuentan la vida del mismo protagonista, de 2026 a 2036 (ver `docs/CANON.md`):
el DNI que consigues en la temporada 1 te identifica en Hacienda en la 2; la churrería de la 2 paga
la nómina con la que alquilas y compras piso en la 3; a ese piso llega la carta de mesa electoral de la 4;
y harto/a de elecciones, en la 5 te haces funcionario/a… hasta que te piden el DNI.

Dentro de cada temporada, los documentos que consigues en un trámite **viajan contigo** al siguiente
(se muestran en la intro de cada nivel como «🎒 Traes contigo») y hay que usarlos.

## Cómo se juega

- **Toca** objetos, carteles y personajes para examinarlos o hablar con ellos. Las respuestas salen en la **ventanilla**, debajo de la sala.
- Lo que recoges va a tu **bandeja** (abajo). Toca un objeto y luego algo de la sala para **usarlo**, o toca otro objeto para **combinarlos**.
- El **🎯 objetivo** del trámite está siempre a la vista. En el móvil, la sala se **desliza** a los lados; la **🔍 Lupa** señala todo lo que se puede tocar.
- Si te atascas, saca número en la **💡 Ventanilla de Pistas** (la última pista de cada trámite es la solución, y te avisa antes).

## Guardar partida

- La partida se **guarda automáticamente** en el navegador con cada acción (una partida por temporada). Al volver, pulsa **Continuar**.
- Desde el menú puedes volver a **cualquier trámite ya desbloqueado** de cualquier temporada.
- El **código de expediente** (p. ej. `EXP-0A1B2-C`) sirve para seguir en otro dispositivo: está en el botón **Código** (en el móvil, dentro de **📂 Expediente**) y en cada resolución. Se carga desde *«Tengo un código»* en el menú. Los códigos antiguos de 4 cifras siguen funcionando (temporada 1).
- El juego se juega en la web y **no se instala**: no hay aplicación ni hace falta.

## Botón de apoyo (Ko-fi)

El botón **☕ ¡Invítame a un café!** está siempre a mano fuera de los modales: flotante en el menú, al final de la
bandeja mientras juegas en el móvil, en la cabecera del HUD en horizontal, en la barra superior en escritorio, y en el talón inferior de
las pantallas de papel del móvil. Al terminar cada temporada aparece además la «Tasa voluntaria · Modelo 0-CAFÉ».
Enlaza a [ko-fi.com/R7H627ZTOM](https://ko-fi.com/R7H627ZTOM), donde se paga con tarjeta (Stripe) o PayPal.

Se configura en `js/config.js`:

```js
donation: {
  kofi: 'R7H627ZTOM',            // usuario de Ko-fi
  text: '¡Invítame a un café!',  // texto del botón
  color: '#72a4f2',              // color del disco del botón
  url: '',                       // opcional: otro enlace de pago que sustituye a Ko-fi
},
```

## Desarrollo

HTML, CSS y JavaScript puros, sin proceso de compilación. Para jugar en local basta con servir la carpeta (`npx serve .`).

```
index.html             pantallas y estructura (el «contrato» del DOM)
css/tokens.css         fichas de diseño: colores, tipos, espacios, radios, sombras, tiempos y el orden de capas
css/style.css          base: reset, tipografía, foco, accesibilidad, movimiento reducido
css/ui-components.css  piezas comunes: botones, chips, sellos, resguardo del código, Ko-fi
css/ui-scene.css       la sala (paredes, suelo, decorado, objetos, carteles)
css/ui-play.css        pantalla de juego: barra superior, objetivo, barra de la sala, ventanilla, bandeja
css/ui-screens.css     pantallas de papel: menú, temporada, intro, resolución, final, talón
css/ui-modals.css      hojas y modales: documentos, teclado, pistas, ayuda, pausa, registro, códigos
css/ui-puzzles.css     piezas de los puzles y arreglos de las temporadas (@layer overrides)
css/ui-fx.css          efectos: vuelo a la bandeja, sellos, final de temporada
css/consent.css        aviso y preferencias de cookies
js/config.js           configuración editable (Ko-fi, analítica, datos legales)
js/core.js             registro de temporadas y utilidades
js/seasons/sN.js       cada temporada (objetos, puzles y 10 niveles)
js/ui-puzzles.js       mejoras de los modales de puzle (tablas a fichas, selects a chips, borradores…)
js/ui-fx.js            efectos de presentación (escuchan los eventos vum:* del motor)
js/engine.js           motor: escenas, bandeja, ventanilla, modales, guardado, menús
tests/run.js           banco de pruebas: juega todas las temporadas y vigila las reglas del diseño
tests/shots.js         capturas de pantalla en 12 tamaños + sondas de maquetación
tests/solutions/sN.js  solución automática de cada temporada
docs/AUTORIA.md        guía para crear nuevas temporadas (y lista de lo que vigilan las pruebas)
```

Todo el CSS va en capas (`@layer reset, tokens, base, components, scene, play, screens, modals, puzzles, fx, seasons, overrides`):
la CSS de cada temporada se inyecta en `seasons` y el núcleo corrige lo necesario en `overrides`, sin tocar las temporadas.

### Pruebas

```bash
npm install
npm test                       # juega los 50 niveles en un navegador simulado (jsdom); debe decir «TODO CORRECTO»
node tests/run.js 3            # solo la temporada 3
node tests/shots.js shots      # capturas de todas las escenas en todos los tamaños (necesita Edge o Chrome)
node tests/shots.js shots movil-320 horizontal --escenas=05,23-32
```

### Publicar una versión nueva

Sigue la lista de [docs/PUBLICAR.md](docs/PUBLICAR.md#antes-de-cada-publicación-lista-de-comprobación): pruebas, capturas,
subir **todos** los `?v=` de `index.html` a la vez (p. ej. de `?v=7` a `?v=8`) y la pasada manual en móviles reales.

### Añadir una temporada

Lee `docs/AUTORIA.md`, crea `js/seasons/s6.js` y `tests/solutions/s6.js`, añade el `<script>` en `index.html` (antes de `js/ui-puzzles.js`) y ejecuta `node tests/run.js 6`.

## Licencia

MIT
