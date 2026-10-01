/* ==========================================================
   VUELVA USTED MAÑANA — Analítica de producto (PostHog UE)
   Solo se carga tras el consentimiento expreso del usuario.
   Uso desde el juego: window.Track('evento', { propiedades })
   ========================================================== */
(function () {
  'use strict';

  const cfg = (window.GAME_CONFIG || {}).analytics || {};
  let loaded = false;
  // «Apertura del juego» de esta visita: si el jugador acepta la analítica después
  // de abrir el juego, se envía en el momento de aceptar (nunca antes).
  let appOpen = null;
  let appOpenSent = false;

  function load() {
    if (loaded || !cfg.key) return;
    loaded = true;
    /* eslint-disable */
    // Fragmento oficial de carga de PostHog
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    /* eslint-enable */
    window.posthog.init(cfg.key, {
      api_host: cfg.host || 'https://eu.i.posthog.com',
      persistence: 'localStorage',        // sin cookies: identificador aleatorio en almacenamiento local
      person_profiles: 'identified_only', // nunca identificamos a nadie: todo es anónimo
      autocapture: false,                 // solo los eventos del juego, nada de clics genéricos
      capture_pageview: false,            // la visita se registra a mano tras el consentimiento
      capture_pageleave: true,
      disable_session_recording: true,    // sin grabación de sesiones
      capture_dead_clicks: false,         // sin captura de clics
      capture_heatmaps: false,            // sin mapas de calor
      capture_performance: false,         // sin métricas de rendimiento web
      capture_exceptions: false,
      disable_surveys: true,
      respect_dnt: true,
    });
    window.posthog.register({ game: 'vuelva-usted-manana', game_version: '3.0' });
    window.posthog.capture('$pageview');
    if (appOpen && !appOpenSent) { appOpenSent = true; window.posthog.capture('app_open', appOpen); }
  }

  function unload() {
    if (window.posthog && window.posthog.opt_out_capturing) window.posthog.opt_out_capturing();
    try {
      Object.keys(localStorage).filter((k) => /^ph_|posthog/.test(k)).forEach((k) => localStorage.removeItem(k));
    } catch (e) { /* nada */ }
  }

  window.Track = function track(event, props) {
    if (event === 'app_open') {
      appOpen = props || {};
      if (appOpenSent) return;
      if (loaded) appOpenSent = true;
    }
    if (!loaded || !window.posthog || !(window.Consent && window.Consent.analytics())) return;
    try { window.posthog.capture(event, props || {}); } catch (e) { /* nunca romper el juego */ }
  };

  if (window.Consent) {
    if (window.Consent.analytics()) load();
    window.Consent.onChange((c) => {
      if (c.analytics) {
        if (!loaded) load();
        else if (window.posthog.opt_in_capturing) window.posthog.opt_in_capturing();
      } else if (loaded) unload();
    });
  }
})();
