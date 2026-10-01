# 📂 Vuelva Usted Mañana — Room Escape

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

- **Haz clic** en objetos y personajes para examinarlos o hablar con ellos.
- Lo que recoges va al **inventario**. Selecciona un objeto y haz clic en algo de la sala para **usarlo**, o en otro objeto para **combinarlos**.
- Si te atascas, pide una **💡 pista** (la última de cada nivel es la solución).

## Guardar partida

- La partida se **guarda automáticamente** en el navegador con cada acción (una partida por temporada). Al volver, pulsa **Continuar**.
- Desde el menú puedes volver a **cualquier trámite ya desbloqueado** de cualquier temporada.
- El botón **💾 Guardar** te da un **código de expediente** (p. ej. `EXP-0A1B2-C`) para continuar en otro dispositivo desde *«Tengo un código de expediente»*. Los códigos antiguos de 4 cifras siguen funcionando (temporada 1).

## Botón de apoyo (Ko-fi)

Un botón flotante **☕ ¡Invítame a un café!** está siempre visible en la esquina inferior derecha
y enlaza a [ko-fi.com/R7H627ZTOM](https://ko-fi.com/R7H627ZTOM), donde se paga con tarjeta (Stripe) o PayPal.
Al terminar cada temporada aparece además un mensaje de agradecimiento con el mismo botón.

Se configura en `js/config.js`:

```js
donation: {
  kofi: 'R7H627ZTOM',            // usuario de Ko-fi
  text: '¡Invítame a un café!',  // texto del botón
  color: '#72a4f2',              // color del botón
  url: '',                       // opcional: otro enlace de pago que sustituye a Ko-fi
},
```

## Desarrollo

HTML, CSS y JavaScript puros, sin proceso de compilación. Para jugar en local basta con servir la carpeta (`npx serve .`).

```
index.html            pantallas
css/style.css         estilos
js/config.js          configuración editable (botón de Ko-fi)
js/core.js            registro de temporadas y utilidades
js/seasons/sN.js      cada temporada (objetos, puzles y 10 niveles)
js/engine.js          motor: escenas, inventario, diálogos, guardado, menús
tests/run.js          banco de pruebas: juega todas las temporadas automáticamente
tests/solutions/sN.js solución automática de cada temporada
docs/AUTORIA.md       guía para crear nuevas temporadas
```

### Pruebas

```bash
npm install
npm test            # juega los 50 niveles en un navegador simulado (jsdom)
node tests/run.js 3 # solo la temporada 3
```

### Añadir una temporada

Lee `docs/AUTORIA.md`, crea `js/seasons/s6.js` y `tests/solutions/s6.js`, añade el `<script>` en `index.html` y ejecuta `node tests/run.js 6`.

## Licencia

MIT
