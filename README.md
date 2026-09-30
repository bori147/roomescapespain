# 📂 Vuelva Usted Mañana — Room Escape

Un *room escape* satírico por las entrañas de la burocracia y la política española.
Tu DNI caduca mañana. Solo tienes que renovarlo. ¿Qué podría salir mal?

**▶ Jugar:** https://bori147.github.io/roomescapespain/

> Sátira. Todos los personajes, partidos y organismos son ficticios.
> Cualquier parecido con la realidad es pura coincidencia (o no).

## Los 10 trámites

| # | Trámite | Dónde | Dificultad |
|---|---------|-------|:---:|
| 1 | Cita previa | Oficina de Expedición del DNI | ★ |
| 2 | Vuelva usted mañana | Registro General | ★ |
| 3 | El padrón | Ayuntamiento | ★★ |
| 4 | La ventanilla equivocada | Seguridad Social | ★★ |
| 5 | Sede electrónica | Tu salón (Java, Autofirma, Cl@ve…) | ★★★ |
| 6 | La renta | Agencia Tributaria | ★★★ |
| 7 | La investidura | Congreso | ★★★★ |
| 8 | No me consta | Comisión de investigación | ★★★★ |
| 9 | El BOE de las 23:59 | Imprenta del BOE | ★★★★★ |
| 10 | La ventanilla única | Ministerio de Asuntos Pendientes | ★★★★★ |

## Cómo se juega

- **Haz clic** en objetos y personajes para examinarlos o hablar con ellos.
- Lo que recoges va al **inventario**. Selecciona un objeto y haz clic en algo de la sala para **usarlo**, o en otro objeto para **combinarlos**.
- Si te atascas, pide una **💡 pista** (la tercera de cada nivel es la solución).

## Guardar partida

- La partida se **guarda automáticamente** en el navegador con cada acción. Al volver, pulsa **Continuar**.
- Desde el menú puedes volver a **cualquier trámite ya desbloqueado**.
- El botón **💾 Guardar** te da un **código de expediente** (p. ej. `EXP-03T2-C`) para continuar en otro dispositivo desde *«Tengo un código de expediente»*.

## Tecnología

HTML, CSS y JavaScript puros, sin dependencias ni proceso de compilación. Para jugar en local basta con servir la carpeta:

```bash
npx serve .
```

(o abrir `index.html` directamente en el navegador).

Estructura:

```
index.html        pantallas y estructura
css/style.css     estilos
js/levels.js      objetos, puzles y los 10 niveles
js/engine.js      motor: escenas, inventario, diálogos, guardado
```

Para añadir o modificar niveles, edita `js/levels.js`: cada nivel define su escena, sus *hotspots* (con `look` y `use`), combinaciones de objetos y pistas.

## Licencia

MIT
