# Revisión legal previa a la publicación (octubre 2026)

> Esto es una revisión técnica del contenido del juego hecha por una IA, **no asesoramiento jurídico**. Sirve para
> reducir riesgos y saber qué decidir; si el juego se vuelve muy conocido o alguien reclama, consulta a un abogado.

## Conclusión

Publicar el juego es **legítimo y de riesgo bajo**: es una sátira de la burocracia (no de personas), con personajes,
partidos, empresas y cifras inventados, amparada en la libertad de expresión y de creación artística (art. 20 CE).
La sátira política es doctrina consolidada del TEDH: en
[Stern Taulats y Roura Capellera c. España (2018)](https://hudoc.echr.coe.int/eng?i=001-181719) el Tribunal
condenó a España por sancionar penalmente una crítica simbólica a la Corona. Conviene, eso sí, no abusar de esa
protección, y por eso se ajustaron los puntos siguientes.

## Qué se ha revisado y qué se ha cambiado

| Riesgo | Resultado | Acción |
|---|---|---|
| Personas reales (honor, intimidad: LO 1/1982; injurias y calumnias) | No aparece ninguna persona real por su nombre. | — |
| **Alusión a un caso real**: «Caja B», el tesorero, «no me consta», «los sobres… era julio» (T1-N8) apuntaba de forma inequívoca a una causa judicial real. | Riesgo evitable. | Cambiado a «Caja Ñ», «facturas del catering de Navidad». No cambia ningún puzle. |
| **DNI real**: el DNI del protagonista (`07345189-R`) tenía letra válida, o sea, podía pertenecer a alguien. | Riesgo de datos personales de un tercero. | Sustituido en todo el juego por `12345181-X`, con letra **deliberadamente incorrecta** (no es el DNI de nadie) y las mismas cifras 4.ª–7.ª para que el puzle del NRP siga igual. Los tres DNI del censo de la T4 que también tenían letra válida llevan ahora letra incorrecta. |
| Partidos políticos reales | Los partidos son inventados (ALA, FAROL, NIDAC, CAÑA, UVA, TIC, ZIGZAG, ASPA, Rotonda Federal…). | **Pendiente tuyo:** comprobar en el Registro de Partidos Políticos (infoelectoral.interior.gob.es) que ninguno existe. No lo he podido verificar. Si alguno existe, cambiarle el nombre. |
| Símbolos del Estado (art. 543 CP, ultrajes a España y sus símbolos, con publicidad: multa de 7 a 12 meses; el TC lo aplicó a unos gritos contra la bandera en [STC 190/2022](https://img.lpderecho.pe/wp-content/uploads/2023/02/STC-190-2022-Espana-LPDerecho.pdf)) | La bandera de España y la de la UE salen solo como decorado, sin ningún texto que las ridiculice. El texto de la fórmula de juramento al Rey y a la Constitución se cita tal cual y sin burla. | Mantener esa regla: **nunca** poner chistes sobre la bandera, el himno, la Corona o el escudo. Documentado también en el descargo. |
| Instituciones (art. 504 CP, injurias graves al Gobierno, Cortes, TC, tribunales…) | Se satiriza la complejidad administrativa, no se imputan delitos reales a ningún organismo. | Ampliado el descargo de responsabilidad (apartado 3: hechos, personas y símbolos). |
| Uso de logos y marcas | No se usa ningún logo oficial ni de marcas. Se nombran programas reales (Cl@ve, Kit Digital, Autofirma, Correos) de forma nominativa. | Ya constaba en el descargo. |
| Dominios y teléfonos inventados | `porrasdeltramite.es` y `forodeafectados.es` **no estaban registrados** (comprobado el 14/10/2026). | Podrías registrar `porrasdeltramite.es` para que nadie lo use contra ti. Opcional. |
| Licencia de las imágenes (Fluent Emoji, MIT) | Exige conservar el aviso de copyright y el texto de la licencia. Solo se citaba el nombre. | `img/emoji/LICENCIA.txt` incluye ya el texto completo y el aviso legal lo cita (el texto anterior, «emojis con las fuentes del sistema», ya no era cierto). |
| Aviso de ficción visible | Solo estaba en el descargo. | Añadido en el pie de la página de inicio: «Obra de ficción satírica: todo es inventado». |

## Lo que tienes que hacer tú (no puedo hacerlo yo)

1. **Correo de contacto real.** El aviso legal y la política de privacidad lo necesitan (arts. 10 LSSI y 13 RGPD: dato de contacto del
   responsable, para que la gente pueda ejercer sus derechos). El descargo promete revisar reclamaciones «con rapidez»: hace falta un buzón.
   No hace falta esperar al dominio: sirve un correo tuyo exclusivo para esto (por ejemplo, uno nuevo y gratuito). Dímelo y lo pongo.
   Mientras tanto no publiques un correo inventado.
2. **Donaciones y Hacienda.** La LSSI solo obliga a quien ejerce una actividad económica en la web; las aportaciones de Ko-fi se
   pueden considerar ingresos de tu actividad como autónomo. Coméntalo con tu gestor (IRPF/IVA).
3. **Marca.** Comprueba en [OEPM](https://www.oepm.es) que nadie tenga registrada «Vuelva usted mañana» para videojuegos o
   entretenimiento. El título es una frase de Larra (dominio público), pero eso no impide que exista una marca registrada.
4. **Partidos.** El paso del Registro de Partidos de la tabla.
5. **Si te llega una queja o un requerimiento:** no lo ignores; retira o cambia el texto concreto el mismo día (todo está en `js/seasons/`)
   y consulta a un abogado. Un cambio rápido casi siempre cierra el asunto.

## Reglas para futuros textos

- Nada de nombres de personas reales, vivas o fallecidas. Nada de alusiones inequívocas a casos judiciales reales (comprueba que
  los detalles distintivos —nombre del caso, frase famosa, objeto emblemático— no encajan con una causa concreta).
- Nada de burlas a símbolos (bandera, himno, escudo, Corona), a colectivos (por origen, religión, sexo, discapacidad…) ni a víctimas.
- Cifras, DNI, NIF, IBAN, teléfonos y dominios de ficción: **inventados y comprobados** (DNI con letra incorrecta a propósito; NIF/CIF de
  ejemplo; dominios sin registrar).
- La crítica va al *trámite*, no a la persona: el funcionario del juego es un personaje, no un colectivo ridiculizado.
- Humor sobre elecciones: sin referencias a encuestas, resultados o candidatos reales (la LOREG limita la publicación de sondeos en los
  cinco días previos a unas elecciones).
