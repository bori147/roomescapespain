# Publicación: gratis hoy, sin caídas mañana

El juego es una web **100 % estática** (HTML, CSS, JS, fuentes e imágenes; menos de 1 MB).
No tiene servidor, base de datos ni cuentas de usuario: el progreso se guarda en el navegador
de cada jugador. Por eso **no hay nada que pueda «caerse por no pagar»**: cualquier
alojamiento de webs estáticas lo sirve gratis.

## Fase 1 · Ahora (0 €)

- **URL:** https://bori147.github.io/roomescapespain/
- **Alojamiento:** GitHub Pages (gratis para repos públicos), con HTTPS y CDN.
- **Límite orientativo:** unos 100 GB de tráfico al mes. Cada visita descarga ≈ 350 KB comprimidos,
  así que caben del orden de **250.000-300.000 visitas al mes** (las visitas repetidas usan la caché del navegador).
- **Publicar cambios:** `git push` a `main`; GitHub lo publica solo en 1-2 minutos.

## Antes de cada publicación (lista de comprobación)

Publicar es hacer `git push` a `main`, así que **todo se comprueba antes del push**:

1. **Pruebas automáticas.** `npm test` debe terminar en «TODO CORRECTO» (juega los 50 trámites y vigila capas CSS,
   contraste, marca, versionado y los arreglos sobre contenido congelado; ver `docs/AUTORIA.md` §7).
2. **Capturas y sondas.** `node tests/shots.js shots` hace 32 escenas en 12 tamaños de pantalla y debe salir sin errores
   (código 0). Mira al menos las carpetas `movil-320`, `movil-corto`, `horizontal` y `escritorio`. Si has tocado
   la CSS de la sala, repasa también una pasada de las 50 salas (lienzo claro: algunas paredes claras se confunden con
   el fondo).
3. **Sube el `?v=`** de **todas** las hojas y scripts de `index.html`, todos al mismo número (p. ej. de `?v=7` a `?v=8`):
   - CSS: `tokens`, `style`, `ui-components`, `ui-scene`, `ui-play`, `ui-screens`, `ui-modals`, `ui-puzzles`, `ui-fx`, `consent`;
   - JS: `config`, `consent`, `analytics`, `core`, `seasons/s1` … `seasons/s5`, `ui-puzzles`, `ui-fx`, `engine`;
   - y lo mismo en las páginas de `legal/` y en `404.html` si enlazan hojas o scripts con `?v=`.

   Es la única forma de que los jugadores reciban la versión nueva al momento: el juego **no tiene service worker**.
   `npm test` falla si `index.html` mezcla números o enlaza CSS/JS sin `?v=`.
4. **Sin instalación.** El juego se juega en una URL y **no es instalable** (decisión del propietario): nada de
   `manifest.webmanifest`, iconos PNG de aplicación, `apple-touch-icon`, service worker ni avisos de «Añadir a pantalla
   de inicio», y tampoco Wake Lock (no se mantiene la pantalla encendida). Solo hay favicon (`img/sello.svg`) y
   `theme-color` (#F4F1EA). `npm test` falla si aparece cualquiera de esas cosas.
5. **Pasada manual en dispositivos reales** (lo que jsdom y las capturas no pueden probar). Una vez por versión con
   cambios de interfaz:

| Dispositivo / modo | Qué comprobar |
|---|---|
| iPhone con Safari 17 y 18 | Hojas (`<dialog>`) que se abren y cierran; teclado sobre un campo (la hoja sube con `--kb` y no tapa el botón); gesto de «atrás» deslizando desde el borde (cierra la hoja / abre la pausa, no sale del juego) |
| Android con Chrome | Botón «atrás» del sistema (cierra hojas, abre la pausa en el juego); vibración en aciertos, errores y sellos (y que se apaga desde la pausa); en el juego no se recarga la página al tirar hacia abajo |
| Firefox de escritorio | Estilos en capas (`@layer`) y `:has()`: que todo se vea igual que en Chrome |
| Windows con contraste alto (colores forzados) | Botones, foco y objetos seleccionados visibles; la sala sigue con sus colores |
| Zoom al 200 % en 1280 × 720 | Nada cortado ni superpuesto; la partida se puede jugar entera |
| VoiceOver (iOS) y TalkBack (Android) | Un trámite completo: se anuncian los mensajes, los objetos de la bandeja, las hojas y los veredictos |
| Android de gama baja (o Chrome con CPU ×4 más lenta) | Se mueve con fluidez al deslizar la sala y al recoger objetos |

## Fase 2 · Dominio propio (≈ 10-15 € al año, lo único que se paga)

Un dominio propio (p. ej. `vuelvaustedmanana.es` o `.com`) da una URL fácil de recordar y,
sobre todo, **permite cambiar de alojamiento sin que cambie la URL**. Es el único gasto recomendable.

1. Compra el dominio en cualquier registrador (Dinahosting, Arsys, Namecheap, Cloudflare Registrar…).
2. En la configuración DNS del dominio crea:
   - 4 registros **A** para el dominio raíz: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 registro **CNAME** para `www` → `bori147.github.io`
3. En GitHub: *Settings → Pages → Custom domain*, escribe el dominio y activa **Enforce HTTPS**
   (el certificado es gratuito y automático).
4. Cambia la URL antigua por la nueva en `index.html` (etiquetas `canonical`, `og:url`, `og:image`,
   `twitter:image`), `robots.txt`, `sitemap.xml` y el README.

La URL antigua de github.io redirige sola al dominio nuevo.

## Fase 3 · Si el juego se hace viral (sigue siendo 0 €)

Si algún mes el tráfico se acerca al límite de GitHub Pages, se mueve el alojamiento a
**Cloudflare Pages**, que es gratis y **sin límite de ancho de banda** para webs estáticas:

1. Crea una cuenta gratuita en Cloudflare → *Workers & Pages → Create → Pages → Connect to Git*.
2. Elige el repo `roomescapespain`. *Framework preset:* None. *Build command:* (vacío). *Output directory:* `/`.
3. En *Custom domains* añade tu dominio; Cloudflare te indica los registros DNS que debes cambiar.
4. Cada `git push` se publica automáticamente, igual que ahora.

Con dominio propio, este cambio es invisible para los jugadores. No hace falta tocar el código.

## ¿Y si llegan donativos?

No hace falta pagar nada para que el juego siga funcionando. Los donativos de Ko-fi pueden
dedicarse a renovar el dominio cada año y, si algún día se quisiera añadir algo con servidor
(un ranking, partidas en la nube…), Cloudflare Workers ofrece un plan gratuito y uno de pago
desde 5 $/mes que solo haría falta activar en ese momento.

## Opcional: saber cuánta gente juega (sin cookies)

Para ver visitas sin tener que mostrar un aviso de cookies, usa una analítica sin cookies:
- **Cloudflare Web Analytics** (gratis; sencillo si ya usas Cloudflare), o
- **GoatCounter** (gratis para proyectos no comerciales).

Ambos se activan pegando una línea `<script>` en `index.html` y conviene mencionarlo en el
texto de la política de privacidad (`legal/privacidad.html`).

## Aviso legal

Si recibes donativos de forma habitual, en España puede ser recomendable añadir un breve
**aviso legal** con los datos del titular de la web (LSSI). Consúltalo con un profesional si tienes dudas.
