# 📂 Vuelva Usted Mañana — Room Escape

Un *room escape* satírico por las entrañas de la burocracia y la política española.
Tu DNI caduca mañana. Solo tienes que renovarlo. ¿Qué podría salir mal?

**▶ Jugar:** https://bori147.github.io/roomescapespain/

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

## Cómo se juega

- **Haz clic** en objetos y personajes para examinarlos o hablar con ellos.
- Lo que recoges va al **inventario**. Selecciona un objeto y haz clic en algo de la sala para **usarlo**, o en otro objeto para **combinarlos**.
- Si te atascas, pide una **💡 pista** (la última de cada nivel es la solución).

## Guardar partida

- La partida se **guarda automáticamente** en el navegador con cada acción (una partida por temporada). Al volver, pulsa **Continuar**.
- Desde el menú puedes volver a **cualquier trámite ya desbloqueado** de cualquier temporada.
- El botón **💾 Guardar** te da un **código de expediente** (p. ej. `EXP-0A1B2-C`) para continuar en otro dispositivo desde *«Tengo un código de expediente»*. Los códigos antiguos de 4 cifras siguen funcionando (temporada 1).

## Botón de apoyo (Stripe)

El juego muestra un botón **☕ Apoyar** que abre un enlace de pago de Stripe con importe libre.
Mientras no haya enlace configurado, el botón no aparece.

1. En el panel de Stripe ve a **Enlaces de pago → Crear enlace de pago**.
2. Crea un producto, por ejemplo «Apoyo a Vuelva usted mañana».
3. En el precio elige **«Los clientes eligen el importe»** (*Customers choose what to pay*), en **EUR**,
   con **importe mínimo 1 €**, importe sugerido 3 € y **sin máximo**.
4. (Opcional) En *Después del pago*, redirige a `https://bori147.github.io/roomescapespain/`.
5. Copia el enlace (`https://buy.stripe.com/...`) y pégalo en `js/config.js`:

```js
donation: {
  url: 'https://buy.stripe.com/tu-enlace',
  fixed: { 1: '', 3: '', 5: '', 10: '' },  // opcional: enlaces de importe fijo
},
```

Si además creas enlaces de importe fijo (1, 3, 5 y 10 €), aparecerán como botones rápidos junto al de importe libre.

## Desarrollo

HTML, CSS y JavaScript puros, sin proceso de compilación. Para jugar en local basta con servir la carpeta (`npx serve .`).

```
index.html            pantallas
css/style.css         estilos
js/config.js          configuración editable (enlace de Stripe)
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
