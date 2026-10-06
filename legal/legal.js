/* Rellena los datos del titular en las páginas legales a partir de js/config.js */
(function () {
  'use strict';
  const L = (window.GAME_CONFIG || {}).legal || {};
  const A = (window.GAME_CONFIG || {}).analytics || {};
  const fill = (k, v) => document.querySelectorAll(`[data-legal="${k}"]`).forEach((e) => { e.textContent = v; });
  fill('titular', L.titular || '');
  fill('nif', L.nif || '');
  fill('domicilio', L.domicilio || '');
  fill('web', L.web || location.origin);
  fill('actualizado', L.actualizado || '');
  document.querySelectorAll('[data-legal="email"]').forEach((e) => {
    if (L.email) { e.innerHTML = `<a href="mailto:${L.email}">${L.email}</a>`; } else { e.textContent = '(pendiente)'; }
  });
  // Etiquetas de columna en cada celda (las tablas se muestran como fichas en el móvil)
  document.querySelectorAll('table').forEach((t) => {
    const heads = [...t.querySelectorAll('th')].map((th) => th.textContent.trim());
    t.querySelectorAll('tr').forEach((tr) => [...tr.children].forEach((td, i) => { if (td.tagName === 'TD' && heads[i]) td.dataset.label = heads[i]; }));
  });
  // Secciones que solo aplican si la analítica está configurada
  document.querySelectorAll('[data-if-analytics]').forEach((e) => { e.hidden = !A.key; });
  document.querySelectorAll('[data-if-no-analytics]').forEach((e) => { e.hidden = !!A.key; });
})();
