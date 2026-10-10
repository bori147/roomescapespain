# Analítica de producto

El juego envía eventos de uso a **PostHog** (servidores en la UE) **solo si el jugador acepta la analítica** en el aviso
de cookies. Si la rechaza, no se carga nada. Los eventos llevan un identificador aleatorio: es un dato seudónimo
(nunca el nombre del jugador), así que no lo describas como «anónimo» en textos legales ni en el aviso.

**Panel:** https://eu.posthog.com/project/290656/dashboard/989505 (proyecto «Vuelva usted mañana», región UE,
IP descartada, hora de Madrid, sin grabación de sesiones ni captura automática).

**Para probar sin contaminar las estadísticas**, abre el juego con `?prueba=1` al final de la URL
(https://bori147.github.io/roomescapespain/?prueba=1): esas visitas se excluyen del panel.

## Puesta en marcha (ya hecha)

1. Crea una cuenta gratuita en https://eu.posthog.com (elige la **región UE**).
2. Crea un proyecto «Vuelva usted mañana».
3. Copia la **Project API key** (empieza por `phc_`; es pública, se puede poner en la web) y pégala en
   `js/config.js` → `analytics.key`. En cuanto se publique, aparecerá el aviso de cookies.
4. En *Project settings*, activa **Discard client IP data** (no guardar la IP) y fija la retención de
   datos en 12 meses o menos (lo que dice la política de privacidad).

El plan gratuito incluye 1 millón de eventos al mes; una partida completa de una temporada genera unos 30-60.

## Eventos

Todos llevan `season` (1-5), `level` (1-10) y `level_id` (`T2-N7`) cuando aplica.

| Evento | Cuándo | Propiedades extra |
|---|---|---|
| `$pageview` | Al abrir la web | (automático: navegador, dispositivo, país, web de origen) |
| `app_open` | Al cargar el juego | `has_save`, `seasons_done` |
| `season_open` | Al entrar en una temporada | — |
| `level_start` | Al empezar o continuar un trámite | `title`, `resumed` |
| `level_complete` | Al completar un trámite | `title`, `seconds`, `hints` |
| `season_complete` | Al terminar una temporada | `seconds`, `hints` (totales) |
| `wrong_answer` | Código o respuesta incorrecta en un teclado/campo | `puzzle` (nombre del candado) |
| `hint_request` | Al pedir una pista | `hint` (1, 2, 3…), `is_solution` |
| `back_to_menu` | Al salir en mitad de un trámite (señal de abandono): «Salir al menú principal» o «Trámites de la temporada» de «Expediente en pausa» | `seconds_in_level`, `to` (`menu` o `season`) |
| `save_code_shown` / `code_loaded` | Guardar con código / cargar un código | — |
| `donate_click` | Clic en cualquier botón de Ko-fi («Invítame a un café») | `where` (pantalla), `slot` (botón; ver tablas siguientes) |
| `share_click` | Al pulsar «📤 Compartir resultado» al final de una temporada | — |
| `reveal_used` | Al pulsar 🔍 **Lupa** en la sala (señala todo lo que se puede tocar) | — |
| `hint_nudge` | Cuando, tras 120 s sin avanzar, el juego sugiere la Ventanilla de Pistas (💡 da dos pulsos y la ventanilla lo dice). No abre nada solo | — |
| `level_restart` | Al confirmar «Reiniciar este trámite» en «Expediente en pausa» | — |
| `log_open` | Al abrir el «Registro de entrada» (historial de mensajes de la ventanilla) | — |
| `pause_open` | Al abrir «Expediente en pausa» (botón 📂, Esc o el botón «atrás» del móvil en el juego) | — |

### `donate_click.where`: en qué pantalla

Igual que antes del rediseño: el nombre de la pantalla (`menu`, `season`, `intro`, `play`, `win`, `end`),
o `season_end` si el clic es en la «Tasa voluntaria · Modelo 0-CAFÉ» del final de temporada.
Los periodos antes y después del rediseño se comparan sin agrupar nada.

### `donate_click.slot`: qué botón (nuevo con el rediseño)

| Valor | Botón |
|---|---|
| `float` | Botón flotante: menú (en todas partes) y pantallas de papel en escritorio |
| `tray` | Chip ☕ al final de la bandeja (juego, móvil en vertical) |
| `topbar` | ☕ de la barra superior en el juego (HUD en horizontal, botón «Café» en escritorio) |
| `talon-intro` | Talón inferior de la intro del trámite (móvil) |
| `talon-win` | Talón inferior de la resolución del trámite (móvil) |
| `talon-end` | Talón inferior del final de temporada (móvil) |
| `tasa` | «Tasa voluntaria · Modelo 0-CAFÉ», la papeleta del final de temporada (`where` = `season_end`) |

## Panel recomendado (Dashboard en PostHog)

| Pregunta de producto | Gráfico en PostHog |
|---|---|
| ¿Cuánta gente juega? | *Trends* · `app_open` · usuarios únicos por día/semana |
| ¿Hasta dónde llegan? | *Funnel* · `level_complete` con `level_id` = T1-N1 → T1-N2 → … → T1-N10 (uno por temporada) |
| ¿Dónde se atascan? | *Trends* · `wrong_answer` y `hint_request`, desglose por `level_id` |
| ¿Dónde abandonan? | *Trends* · `back_to_menu`, desglose por `level_id` |
| ¿Cuánto dura cada trámite? | *Trends* · `level_complete`, media de `seconds`, desglose por `level_id` |
| ¿Vuelven otro día? | *Retention* · `app_open` → `app_open` |
| ¿De dónde vienen? | *Web analytics* (integrado en PostHog) |
| ¿Funciona el café? | *Trends* · `donate_click` y desglose por `where` (pantalla) o `slot` (botón) |
| ¿Se comparte? | *Trends* · `share_click` por `season`; *Funnel* `season_complete` → `share_click` |
| ¿Ayuda la Lupa o el empujón? | *Trends* · `reveal_used` y `hint_nudge` por `level_id`; compáralos con `hint_request` |
| ¿Se atascan hasta reiniciar? | *Trends* · `level_restart` por `level_id` |
| ¿Se usa la pausa y el registro? | *Trends* · `pause_open` y `log_open` (usuarios únicos) |

Los 14 primeros gráficos ya están creados en PostHog con estos mismos nombres; los de `share_click`, `reveal_used`,
`hint_nudge`, `level_restart`, `pause_open` y `log_open` hay que añadirlos cuando se publique el rediseño.
