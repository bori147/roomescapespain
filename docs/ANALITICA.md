# Analítica de producto

El juego envía eventos anónimos a **PostHog** (servidores en la UE) **solo si el jugador acepta
la analítica** en el aviso de cookies. Si la rechaza, no se carga nada.

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
| `back_to_menu` | Al salir al menú en mitad de un trámite (señal de abandono) | `seconds_in_level` |
| `save_code_shown` / `code_loaded` | Guardar con código / cargar un código | — |
| `donate_click` | Clic en «Invítame a un café» | `where` (pantalla) |

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
| ¿Funciona el café? | *Trends* · `donate_click` y desglose por `where` |

Este panel ya está creado en PostHog (14 gráficos) con estos mismos nombres.
