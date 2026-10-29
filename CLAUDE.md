# Vuelva usted mañana: notas para Claude

Room escape satírico sobre la burocracia española: 5 temporadas × 10 trámites, una sola historia (2026-2036). Web 100 % estática (HTML, CSS y JS puros, sin compilación). Qué es y cómo se juega: `README.md`. Este repo es **público**: no escribas aquí secretos ni datos personales.

## Cómo trabajar con el propietario
- No es desarrollador. Háblale en español llano, sin jerga, y no le pidas que ejecute comandos: hazlo tú y explícale el resultado.
- Todo el texto del juego está en español.

## Dónde vive
- Repo público `bori147/roomescapespain`, rama `main`.
- En línea: https://bori147.github.io/roomescapespain/ (GitHub Pages, rama `main`, raíz). **Cada push a `main` publica** en 1-2 minutos, así que todo se comprueba antes del push.
- Plan de alojamiento y dominio propio: `docs/PUBLICAR.md`. La URL pública tiene un monitor de disponibilidad externo del propietario: si la URL cambia (por ejemplo, con dominio propio), avísale para que se actualice.

## Comandos
```bash
npm install                     # jsdom, playwright-core y los emoji Fluent 3D (solo para herramientas)
npm test                        # = node tests/run.js: juega los 50 niveles en jsdom; debe decir «TODO CORRECTO»
node tests/run.js 3             # solo la temporada 3
node tests/shots.js shots       # capturas de 32 escenas en todos los tamaños + sondas de maquetación (necesita Edge o Chrome instalado)
npx serve .                     # jugar en local
```
- Antes de cada publicación: lista de `docs/PUBLICAR.md` (pruebas, capturas, **subir todos los `?v=` a la vez**; ahora van por `?v=9`, también en `legal/` y `404.html`). `npm test` falla si se mezclan números.
- Realismo de las salas (`docs/AUTORIA.md` §7, sala piloto = temporada 2 nivel 1): `node tests/realism.js S-N` (escala frente a `tests/scale-catalog*.js`), `node tests/room.js S-N --debug --movil` (PNG de la sala), `node tests/scale-model.js <floorH> <cm> <base%>` (calculadora de tamaño).
- Emoji: las salas usan imágenes Fluent 3D. Tras añadir emoji nuevos, `node tools/emoji-build.js` (copia a `img/emoji/` y regenera `js/emoji-data.js`).
- Trabajo en paralelo por sala: worktrees anidados en `.wt/sS-NN` (excluidos en `.git/info/exclude`, que es local: vuelve a añadir `.wt/` en un clon nuevo).

## Decisiones del propietario (no cambiarlas sin preguntar)
- El juego **no se instala**: nada de manifest, service worker, iconos de app, `apple-touch-icon`, avisos de «Añadir a pantalla de inicio» ni Wake Lock. `npm test` lo vigila.
- El botón de Ko-fi («¡Invítame a un café!») está siempre visible fuera de los modales (`js/config.js` › `donation`).
- Unos 80 % de los jugadores usan el móvil: el diseño móvil manda (`docs/AUTORIA.md` §6).
- Analítica: PostHog UE solo después de aceptar en el aviso de cookies; `?prueba=1` excluye las visitas de prueba. Detalles en `docs/ANALITICA.md`.
- Correo de contacto legal: **pendiente** (`js/config.js` › `legal.email` vacío) hasta que el propietario dé uno. No publiques un correo inventado ni provisional.
- Reglas para textos nuevos (personas reales, símbolos, DNI de ficción con letra incorrecta...): `docs/LEGAL.md`.

## Reglas de trabajo
- En trabajos de interfaz o maquetación, la lógica de los puzles y el contenido quedan **congelados**; los arreglos van en `@layer overrides` o en `js/ui-puzzles.js`, cada uno con su guarda en `tests/run.js` (ver `docs/AUTORIA.md` §7, «Arreglos sobre contenido congelado»).
- Historia común y continuidad entre temporadas: `docs/CANON.md`.
- Temporada nueva: `docs/AUTORIA.md`, `js/seasons/sN.js` + `tests/solutions/sN.js` y su `<script>` en `index.html`.
- Antes del push, las dos pruebas (`npm test` y `node tests/shots.js shots`) tienen que salir bien.

## Estado (octubre de 2026)
- `llms.txt` (raíz, en línea desde el 29/10/2026): resumen del juego para asistentes de IA, escrito a mano. Actualízalo si cambian las temporadas, la forma de jugar o la URL.
- Publicado y completo: 5 temporadas. Rediseño «Ventanilla Única» y repaso de realismo (50 salas a escala real) publicados, versión `?v=9`.
- Pendiente del propietario (`docs/LEGAL.md`): correo de contacto, comprobar nombres de partidos y la marca en la OEPM, consultar los donativos con su gestor.
- Opcional (`docs/PUBLICAR.md`): dominio propio; Cloudflare Pages si el tráfico se acerca al límite de GitHub Pages.
