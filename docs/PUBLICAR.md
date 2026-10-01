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
texto de «Privacidad» del juego (`js/engine.js`, función `privacyModal`).

## Aviso legal

Si recibes donativos de forma habitual, en España puede ser recomendable añadir un breve
**aviso legal** con los datos del titular de la web (LSSI). Consúltalo con un profesional si tienes dudas.
