/* ==========================================================
   VUELVA USTED MAÑANA — Realzadores de las hojas de puzle
   Escucha «vum:modal» (lo emite js/engine.js) y mejora el contenido de
   cada hoja SIN tocar las temporadas (contenido congelado):
     1. Tablas → fichas (.tbl-stack + td[data-label])
     2. Teleprompter: frases como tarjetas de opción + vista previa
     3. CAFÉ: control segmentado de 4 opciones por factura
        (en 2 y 3 el <select> nativo sigue mandando: ids intactos)
     4. Estados ARIA (aria-pressed / aria-disabled / aria-current)
     5. Veredicto siempre a la vista (+ tira .modal-status)
     6. Borradores en memoria al cerrar sin presentar
     7. Atributos de teclado por defecto en los campos
     8. Botón «Lupa» para la letra pequeña
   Un MutationObserver por hoja abierta (agrupado en un rAF, desconectado
   mientras se muta). Todo es idempotente y funciona en jsdom (sin
   IntersectionObserver, sin maquetación).
   ========================================================== */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // ---------------- Utilidades ----------------
  const raf = (fn) => (typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame(fn) : setTimeout(fn, 16));
  const caf = (id) => { try { if (typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(id); clearTimeout(id); } catch (e) { /* nada */ } };
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const txt = (el) => (el && el.textContent ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const api = () => (window.VUM && typeof window.VUM === 'object' ? window.VUM : null);
  function rm() {
    try { const v = api(); if (v && typeof v.rm === 'function') return !!v.rm(); } catch (e) { /* nada */ }
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function sfx(kind) { try { const v = api(); if (v && typeof v.sfx === 'function') v.sfx(kind); } catch (e) { /* sin sonido */ } }
  function laidOut(el) {
    try { const r = el.getBoundingClientRect(); return !!r && r.width > 0 && r.height > 0; } catch (e) { return false; }
  }
  function fire(el, type) {
    let ev;
    try { ev = new Event(type, { bubbles: true }); } catch (e) { ev = document.createEvent('Event'); ev.initEvent(type, true, false); }
    el.dispatchEvent(ev);
  }
  function setAttr(el, name, value) { if (el.getAttribute(name) !== value) el.setAttribute(name, value); }
  function make(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------- Estado de la hoja abierta ----------------
  let cur = null;        // { card, body, title, kind, mo, io, rafId, dirty, seen, verdict, statusText, timers }
  let swapping = false;  // un «close» seguido de un «open» en el mismo turno = cambio de hoja (sin animación de entrada)
  const drafts = new Map(); // título → { id: valor } (solo en memoria; se borra al presentar y al cambiar de trámite)

  const VERDICT = '.msg, .coal-msg, .sede-msg, .sede-err, .sede-ok, .kp-msg, [id$="Msg"], [id$="msg"]';
  const PRESSABLE = '.party, .opt, .tile:not(.fixed), .strip, .s4-vbtns .btn, .s5-mz, .cal-d';
  const STACKABLE = 'table.s3-tbl, table.s5-fac, table.s5-t, table.tbl';
  const isVerdict = (el) => !!el && el.nodeType === 1 && el.matches(VERDICT) && !el.closest('.modal-status, .modal-head, .modal-foot');

  // ---------------- 7. Atributos de teclado por defecto ----------------
  const TEXTISH = 'input:not([type]), input[type="text"], input[type="number"], input[type="search"], input[type="tel"], input[type="password"]';
  // Guiones blandos en las casillas estrechas del plano S3-N6: sin diccionario de
  // separación (Chrome en Windows) «Contadores» se partía letra a letra.
  const SHY = { Contadores: 'Conta\u00ADdores', Ascensor: 'Ascen\u00ADsor', Caldera: 'Cal\u00ADdera', Trastero: 'Tras\u00ADtero', Pasillo: 'Pa\u00ADsillo' };
  function softHyphens(body) {
    $$('.s3-fach > br', body).forEach((br) => br.replaceWith(document.createTextNode(' ')));
    $$('.s3-cell', body).forEach((c) => {
      Array.prototype.forEach.call(c.childNodes, (n) => {
        if (n.nodeType !== 3) return;
        const k = n.nodeValue.trim();
        if (Object.prototype.hasOwnProperty.call(SHY, k)) n.nodeValue = n.nodeValue.replace(k, SHY[k]);
      });
    });
    // Primera columna (estrecha en móvil) del cuadro de créditos S5-N3
    $$('.s5-bud td:first-child', body).forEach((c) => {
      Array.prototype.forEach.call(c.childNodes, (n) => {
        if (n.nodeType === 3 && /\bAdministrativa\b/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace('Administrativa', 'Adminis­trativa');
      });
    });
  }
  function mountDefaults(body) {
    $$(TEXTISH, body).forEach((inp) => {
      const t = (inp.getAttribute('type') || 'text').toLowerCase();
      const key = `${inp.id || ''} ${inp.getAttribute('name') || ''}`;
      if (!inp.hasAttribute('inputmode') && (/0,00/.test(inp.getAttribute('placeholder') || '') || inp.hasAttribute('data-num'))) inp.setAttribute('inputmode', 'decimal');
      if (t !== 'password' && t !== 'number' && !inp.hasAttribute('autocapitalize') && /nif|cif|ref|csv|huella|num/i.test(key)) inp.setAttribute('autocapitalize', 'characters');
      if (!inp.hasAttribute('enterkeyhint')) inp.setAttribute('enterkeyhint', 'done');
      if (t !== 'number') {
        if (!inp.hasAttribute('autocorrect')) inp.setAttribute('autocorrect', 'off');
        if (!inp.hasAttribute('spellcheck')) inp.setAttribute('spellcheck', 'false');
      }
      if (!inp.hasAttribute('autocomplete')) inp.setAttribute('autocomplete', 'off');
    });
  }

  // ---------------- 8. Lupa para la letra pequeña ----------------
  function lupa(card, body) {
    if (!body.querySelector('.tiny') || card.querySelector('.modal-lupa')) return;
    const head = card.querySelector('.modal-head');
    if (!head) return;
    const b = make('button', 'modal-lupa', '<span aria-hidden="true">🔍</span> Lupa');
    b.type = 'button';
    b.setAttribute('data-sys', '');
    b.setAttribute('aria-pressed', 'false');
    b.title = 'Ampliar la letra pequeña';
    b.addEventListener('click', () => {
      const on = !card.classList.contains('lupa');
      card.classList.toggle('lupa', on);
      b.setAttribute('aria-pressed', String(on));
      sfx('click');
      if (on) {
        const t = body.querySelector('.tiny');
        if (t && laidOut(t) && typeof t.scrollIntoView === 'function') { try { t.scrollIntoView({ block: 'nearest', behavior: rm() ? 'auto' : 'smooth' }); } catch (e) { /* nada */ } }
      }
    });
    const x = head.querySelector('.modal-x');
    if (x) head.insertBefore(b, x); else head.append(b);
  }

  // ---------------- 1b. Campos dentro de tablas: nombre accesible «Fila · Columna» ----------------
  // (p. ej. el cuadro de créditos de T5-3: casillas sin <label>; la fila no lleva <th>)
  const cellTxt = (c) => (c ? Array.prototype.map.call(c.childNodes, (n) => n.textContent || '').join(' ').replace(/­/g, '').replace(/\s+/g, ' ').trim() : '');
  function hasName(inp) {
    if (inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby') || inp.getAttribute('title')) return true;
    try { if (inp.labels && inp.labels.length) return true; } catch (e) { /* nada */ }
    return !!inp.closest('label');
  }
  function cellNames(body) {
    $$('table', body).forEach((t) => {
      const rows = t.rows ? Array.prototype.slice.call(t.rows) : [];
      if (rows.length < 2) return;
      const head = rows[0].cells ? Array.prototype.slice.call(rows[0].cells) : [];
      if (!head.length || !head.every((c) => c.tagName === 'TH') || head.some((c) => (c.colSpan || 1) > 1)) return;
      rows.slice(1).forEach((tr) => {
        const first = tr.cells && tr.cells[0];
        if (!first) return;
        const rowName = cellTxt(first);
        const inputs = $$('input, select, textarea', tr).filter((i) => !hasName(i) && !(i.type === 'hidden'));
        if (!inputs.length) return;
        if (first.tagName === 'TD' && rowName && !first.querySelector('input, select, textarea')) first.setAttribute('role', 'rowheader');
        inputs.forEach((inp) => {
          const td = inp.closest('td, th');
          const colName = td && td.cellIndex >= 0 ? cellTxt(head[td.cellIndex]) : '';
          const name = [rowName, colName].filter(Boolean).join(' · ');
          if (name) inp.setAttribute('aria-label', name);
        });
      });
    });
  }

  // ---------------- 1. Tablas → fichas ----------------
  function fichas(body) {
    $$(STACKABLE, body).forEach((t) => {
      if (t.classList.contains('s5-bud') || t.classList.contains('tbl-stack')) return;
      const rows = t.rows ? Array.prototype.slice.call(t.rows) : $$('tr', t);
      if (rows.length < 2) return;
      const head = Array.prototype.slice.call(rows[0].cells || rows[0].children);
      if (head.length < 4 || !head.every((c) => c.tagName === 'TH')) return;
      // Etiquetas por columna (respetando colspan)
      const labels = [];
      head.forEach((c) => { const n = Math.max(1, c.colSpan || 1); for (let i = 0; i < n; i++) labels.push(txt(c)); });
      rows[0].classList.add('tbl-head');
      rows.slice(1).forEach((r) => {
        let col = 0;
        Array.prototype.slice.call(r.cells || r.children).forEach((c) => {
          if (c.tagName === 'TD' && !c.hasAttribute('data-label') && labels[col]) c.setAttribute('data-label', labels[col]);
          col += Math.max(1, c.colSpan || 1);
        });
      });
      t.classList.add('tbl-stack');
    });
  }

  // ---------------- 1b. Tabla ancha que se desliza (S5-N3) ----------------
  // El cuadro de créditos no cabe en un móvil: mientras quede algo a la derecha,
  // el borde derecho se funde (.more-r) y un aviso «desliza la tabla →» lo dice.
  const SLIDE = '.s5-scroll:has(> .s5-bud)';
  function slideCue(body) {
    let boxes = [];
    try { boxes = $$(SLIDE, body); } catch (e) { boxes = $$('.s5-bud', body).map((t) => t.parentElement).filter((p) => p && p.classList.contains('s5-scroll')); }
    boxes.forEach((box) => {
      if (box._slide) return;
      const cue = make('p', 'slide-cue', 'Hay más columnas: desliza la tabla <span aria-hidden="true">→</span>');
      cue.hidden = true;
      box.parentNode.insertBefore(cue, box);
      const sync = () => {
        if (!box.isConnected) return;
        const fits = box.scrollWidth - box.clientWidth <= 2;
        const more = !fits && box.scrollWidth - box.clientWidth - box.scrollLeft > 2;
        if (box.classList.contains('more-r') !== more) box.classList.toggle('more-r', more);
        if (cue.hidden !== fits) cue.hidden = fits;
        // Al llegar al final el aviso se apaga pero conserva su sitio (la tabla no salta mientras se desliza)
        if (cue.classList.contains('at-end') !== (!fits && !more)) cue.classList.toggle('at-end', !fits && !more);
      };
      box._slide = sync;
      box.addEventListener('scroll', sync, { passive: true });
      if (typeof window.ResizeObserver === 'function') {
        try { const ro = new window.ResizeObserver(() => { if (!box.isConnected) ro.disconnect(); else sync(); }); ro.observe(box); } catch (e) { /* nada */ }
      }
      sync();
    });
  }

  // ---------------- 2 y 3. Grupos de opción que manejan un <select> nativo ----------------
  const groups = new WeakMap(); // select → { root, items:[button], kind }
  function realOptions(sel) {
    return Array.prototype.slice.call(sel.options).filter((o) => o.value !== '' && o.value !== '-1' && !/^\s*[—–-]/.test(o.textContent));
  }
  function setSelect(sel, value) {
    if (sel.value === value) return;
    sel.value = value;
    fire(sel, 'input');
    fire(sel, 'change');
  }
  function syncGroup(sel) {
    const g = groups.get(sel);
    if (!g) return;
    let any = false;
    g.items.forEach((b) => {
      const on = b.getAttribute('data-v') === sel.value;
      if (on) any = true;
      setAttr(b, 'aria-checked', String(on));
    });
    // Tabulación itinerante: entra por la marcada o, si no hay, por la primera
    g.items.forEach((b, i) => setAttr(b, 'tabindex', (any ? b.getAttribute('aria-checked') === 'true' : i === 0) ? '0' : '-1'));
    if (g.kind === 'tp') preview(sel.closest('.modal-body'));
  }
  function radioKeys(e, items, sel) {
    const k = e.key;
    const i = items.indexOf(e.currentTarget);
    let j = -1;
    if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % items.length;
    else if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + items.length) % items.length;
    else if (k === 'Home') j = 0;
    else if (k === 'End') j = items.length - 1;
    if (j < 0) return;
    e.preventDefault();
    e.stopPropagation();
    const b = items[j];
    setSelect(sel, b.getAttribute('data-v'));
    syncGroup(sel);
    try { b.focus({ preventScroll: false }); } catch (x) { b.focus(); }
  }
  function hideNative(sel) {
    sel.classList.add('vum-native');
    sel.setAttribute('tabindex', '-1');
    sel.setAttribute('aria-hidden', 'true');
  }
  function buildGroup(sel, kind, rootCls, itemCls, label) {
    const opts = realOptions(sel);
    if (!opts.length) return null;
    const root = make('div', rootCls);
    root.setAttribute('role', 'radiogroup');
    if (label) root.setAttribute('aria-label', label);
    const items = opts.map((o) => {
      const b = make('button', itemCls);
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-sys', '');
      b.setAttribute('data-v', o.value);
      b.setAttribute('aria-checked', 'false');
      b.textContent = kind === 'tp' ? o.textContent.trim().replace(/^«\s*|\s*»$/g, '') : o.textContent.trim();
      b.addEventListener('click', () => { sfx('click'); setSelect(sel, o.value); syncGroup(sel); });
      root.append(b);
      return b;
    });
    items.forEach((b) => b.addEventListener('keydown', (e) => radioKeys(e, items, sel)));
    groups.set(sel, { root, items, kind });
    sel.addEventListener('change', () => syncGroup(sel));
    hideNative(sel);
    return root;
  }
  // Teleprompter (S4-N3): una tarjeta por frase y el discurso montado debajo
  function blockName(label, sel) {
    if (!label) return '';
    let s = '';
    label.childNodes.forEach((n) => { if (n !== sel && n.nodeType === 3) s += n.nodeValue; });
    return s.replace(/\s+/g, ' ').trim().replace(/^\d+\.\s*/, '');
  }
  function teleprompter(body) {
    $$('.s4-tp select', body).forEach((sel) => {
      if (groups.has(sel)) return;
      const label = sel.closest('label');
      const name = blockName(label, sel);
      const root = buildGroup(sel, 'tp', 'choice-cards', 'choice-card', name ? `Frase de ${name.replace(/^(\p{Lu})(?=\p{Ll})/u, (c) => c.toLowerCase())}` : 'Frase');
      if (!root) return;
      if (label) { label.classList.add('tp-label'); label.after(root); } else sel.after(root);
      syncGroup(sel);
    });
    const tp = body.querySelector('.s4-tp');
    if (tp && tp.querySelector('select.vum-native') && !body.querySelector('.tp-preview')) {
      const p = make('p', 'tp-preview');
      p.id = 'tpPreview';
      tp.after(p);
      preview(body);
    }
  }
  function preview(body) {
    if (!body) return;
    const p = body.querySelector('.tp-preview');
    if (!p) return;
    const parts = $$('.s4-tp select', body).map((sel) => {
      const o = sel.options[sel.selectedIndex];
      const ok = o && realOptions(sel).indexOf(o) >= 0;
      return ok ? esc(o.textContent.trim().replace(/^«\s*|\s*»$/g, '')) : '<span class="tp-gap">[…]</span>';
    });
    const html = `<b>Tu discurso</b>${parts.join(' ')}`;
    if (p.innerHTML !== html) p.innerHTML = html;
  }
  // CAFÉ (S5-N4): Verde · Digital · Cohesión · No elegible
  function cafe(body) {
    $$('.s5-fac select', body).forEach((sel) => {
      if (groups.has(sel)) return;
      const row = sel.closest('tr');
      const ref = row && row.cells && row.cells[0] ? txt(row.cells[0]) : '';
      const root = buildGroup(sel, 'seg', 'seg', 'seg-opt', ref ? `Componente de la factura ${ref}` : 'Componente');
      if (!root) return;
      sel.after(root);
      const t = sel.closest('table');
      if (t) t.classList.add('has-seg');
      syncGroup(sel);
    });
  }

  // ---------------- 4. Estados ARIA de las piezas ----------------
  const ON = /\b(on|pick|cur|sel)\b/;
  function syncStates(body) {
    $$(PRESSABLE, body).forEach((b) => {
      if (b.tagName !== 'BUTTON' && b.getAttribute('role') !== 'button') return;
      setAttr(b, 'aria-pressed', String(ON.test(b.className)));
    });
    $$('.tile.fixed', body).forEach((b) => { setAttr(b, 'aria-disabled', 'true'); if (b.hasAttribute('aria-pressed')) b.removeAttribute('aria-pressed'); });
    $$('.sede-steps li', body).forEach((li) => {
      if (li.classList.contains('cur')) setAttr(li, 'aria-current', 'step');
      else if (li.hasAttribute('aria-current')) li.removeAttribute('aria-current');
    });
  }

  // ---------------- 5. Veredicto siempre a la vista ----------------
  function tone(el) {
    if (el.matches('.bad, .vm-bad, .sede-err, .kp-msg')) return 'bad';
    if (el.matches('.good, .vm-good, .sede-ok')) return 'good';
    return '';
  }
  function statusEl() { return cur && cur.card.querySelector('.modal-status'); }
  function hideStrip() {
    const st = statusEl();
    if (st) st.classList.remove('is-visible', 'good', 'bad');
  }
  function reveal(el) {
    const text = txt(el);
    if (!text || !cur) return;
    const t = tone(el);
    // Lo devuelve a la vista dentro del cuerpo de la hoja
    if (laidOut(el) && typeof el.scrollIntoView === 'function') {
      try { el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: rm() ? 'auto' : 'smooth' }); } catch (e) { try { el.scrollIntoView(false); } catch (x) { /* nada */ } }
    }
    // Un repaso visual del veredicto (aunque el texto se repita)
    if (el.matches('.msg, .coal-msg, .sede-msg')) { el.classList.remove('puzzle-renew'); void el.offsetWidth; el.classList.add('puzzle-renew'); }
    // Copia en la línea de estado de la hoja (la leen los lectores; se ve si el veredicto queda fuera de vista)
    const st = statusEl();
    if (!st) return;
    const live = el.matches('[role="alert"], [role="status"], [aria-live]') && el.getAttribute('aria-live') !== 'off';
    st.setAttribute('aria-live', live ? 'off' : (t === 'bad' ? 'assertive' : 'polite'));
    st.classList.remove('good', 'bad');
    if (t) st.classList.add(t);
    st.textContent = '';
    cur.statusText = text;
    cur.verdict = el;
    const mine = cur;
    later(mine, () => {
      if (cur !== mine || mine.verdict !== el) return;
      pause(() => { st.textContent = text; });
    }, 50);
    // La tira visible solo se decide cuando el desplazamiento ha terminado (si no, la tira
    // aparece a mitad del scroll suave, encoge el cuerpo y el veredicto se queda a medias)
    let done = false;
    const settle = () => {
      if (done) return;
      done = true;
      try { mine.body.removeEventListener('scrollend', settle); } catch (e) { /* nada */ }
      raf(() => {
        if (cur !== mine || mine.verdict !== el) return;
        // Si algo se ha movido mientras tanto, un último ajuste (instantáneo) antes de decidir
        if (laidOut(el) && typeof el.scrollIntoView === 'function') {
          const r = el.getBoundingClientRect(); const b = mine.body.getBoundingClientRect();
          if (r.bottom > b.bottom + 1 || r.top < b.top - 1) { try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* nada */ } }
        }
        watchVerdict(el);
      });
    };
    if ('onscrollend' in window) mine.body.addEventListener('scrollend', settle);
    later(mine, settle, rm() ? 80 : 520);
  }
  function watchVerdict(el) {
    if (!cur) return;
    if (typeof window.IntersectionObserver !== 'function' || !laidOut(el)) return; // jsdom o sin maquetar: solo para lectores
    if (!cur.io) {
      const mine = cur;
      try {
        mine.io = new window.IntersectionObserver((entries) => {
          if (cur !== mine) return;
          entries.forEach((en) => {
            if (en.target !== mine.verdict) return;
            const st = statusEl(); if (!st) return;
            const full = en.isIntersecting && en.intersectionRatio >= 0.98;
            pause(() => st.classList.toggle('is-visible', !full && !!txt(en.target) && en.target.isConnected));
          });
        }, { root: mine.body, threshold: [0, 0.25, 0.5, 0.75, 0.98, 1] });
      } catch (e) { mine.io = null; return; }
    }
    try { cur.io.disconnect(); cur.io.observe(el); } catch (e) { /* nada */ }
  }
  function checkStatus() {
    // El motor también escribe en .modal-status (announce): si no es nuestro veredicto, la tira se esconde
    const st = statusEl();
    if (!st || !cur) return;
    const s = txt(st);
    if (s && s !== cur.statusText) { cur.verdict = null; cur.statusText = ''; if (cur.io) cur.io.disconnect(); hideStrip(); return; }
    const v = cur.verdict;
    if (v && (!v.isConnected || !txt(v))) { cur.verdict = null; if (cur.io) cur.io.disconnect(); hideStrip(); }
  }
  function verdicts(body, initial) {
    $$(VERDICT, body).forEach((el) => {
      if (!isVerdict(el)) return;
      const text = txt(el);
      const was = cur.seen.has(el) ? cur.seen.get(el) : null;
      cur.seen.set(el, text);
      if (initial || !text) return;
      if (was === null || was !== text || cur.dirty.has(el)) reveal(el);
    });
  }

  // ---------------- 6. Borradores ----------------
  const FIELD = 'input[id]:not([type="password"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select[id], textarea[id]';
  function snapshot(body) {
    const out = {};
    $$(FIELD, body).forEach((f) => {
      if (f.tagName === 'SELECT') { if (!atDefault(f)) out[f.id] = f.value; }
      else if (f.value !== '' && f.value !== f.defaultValue) out[f.id] = f.value;
    });
    return out;
  }
  function atDefault(f) {
    if (f.tagName === 'SELECT') {
      const opts = Array.prototype.slice.call(f.options);
      if (opts.some((o) => o.defaultSelected)) return false; // la temporada ya recuerda su valor
      return f.selectedIndex <= 0;
    }
    return f.value === '' && f.defaultValue === '';
  }
  function restore(card, body, title) {
    const d = drafts.get(title);
    if (!d) return;
    let n = 0;
    Object.keys(d).forEach((id) => {
      const f = body.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(id) : id.replace(/([^\w-])/g, '\\$1')));
      if (!f || !f.matches(FIELD) || !atDefault(f)) return;
      if (f.tagName === 'SELECT' && !Array.prototype.some.call(f.options, (o) => o.value === d[id])) return;
      f.value = d[id];
      fire(f, 'input');
      fire(f, 'change');
      n++;
    });
    if (!n) return;
    const box = card.querySelector('.modal-chips');
    if (!box) return;
    const c = make('span', 'chip draft', '<span aria-hidden="true">📝</span> Borrador conservado');
    box.append(c);
    later(cur, () => { if (c.isConnected) c.remove(); }, 3200);
  }

  // ---------------- Ciclo de vida de cada hoja ----------------
  function pause(fn) {
    const mo = cur && cur.mo;
    if (mo) { try { mo.takeRecords(); } catch (e) { /* nada */ } mo.disconnect(); }
    try { fn(); } finally {
      if (mo && cur && cur.mo === mo && cur.card.isConnected) observe(cur);
    }
  }
  function observe(st) {
    try { st.mo.observe(st.card, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'hidden'] }); } catch (e) { /* nada */ }
  }
  function enhance(initial) {
    if (!cur) return;
    const { card, body } = cur;
    if (!card.isConnected) return;
    pause(() => {
      try {
        mountDefaults(body);
        softHyphens(body);
        lupa(card, body);
        fichas(body);
        cellNames(body);
        slideCue(body);
        teleprompter(body);
        cafe(body);
        syncStates(body);
        if (initial && card.getAttribute('data-kind') !== 'system') restore(card, body, cur.title);
        verdicts(body, initial);
        checkStatus();
      } catch (e) {
        if (window.console && console.warn) console.warn('ui-puzzles:', e);
      }
      cur.dirty.clear();
    });
  }
  function schedule() {
    if (!cur || cur.rafId != null) return;
    const mine = cur;
    mine.rafId = raf(() => { mine.rafId = null; if (cur === mine) enhance(false); });
  }
  // Un bloque que se destapa debajo del pliegue (p. ej. la confirmación «Ver la solución…»
  // de las pistas): el motor lo enfoca sin desplazar, así que lo traemos a la vista.
  const UNHIDE = '.turno-confirm';
  function unhidden(el) {
    const mine = cur;
    raf(() => {
      if (cur !== mine || !el.isConnected || el.hidden || !laidOut(el) || typeof el.scrollIntoView !== 'function') return;
      try { el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: rm() ? 'auto' : 'smooth' }); } catch (e) { try { el.scrollIntoView(false); } catch (x) { /* nada */ } }
    });
  }
  function onMutations(recs) {
    if (!cur) return;
    recs.forEach((r) => {
      if (r.type === 'attributes' && r.attributeName === 'hidden') {
        if (r.target.nodeType === 1 && !r.target.hidden && r.target.matches(UNHIDE)) unhidden(r.target);
        return;
      }
      let n = r.target;
      if (n && n.nodeType !== 1) n = n.parentElement;
      const v = n && n.closest ? n.closest(VERDICT) : null;
      if (v && isVerdict(v)) cur.dirty.add(v);
      if (r.type === 'childList') {
        r.addedNodes.forEach((a) => {
          if (a.nodeType !== 1) return;
          if (isVerdict(a)) cur.dirty.add(a);
          $$(VERDICT, a).forEach((x) => { if (isVerdict(x)) cur.dirty.add(x); });
        });
      }
    });
    schedule();
  }
  function open(d) {
    if (cur) teardown();
    const card = d.card; const body = d.body || (card && card.querySelector('.modal-body'));
    if (!card || !body) return;
    if (swapping) card.classList.add('is-swap');
    cur = { card, body, title: String(d.title || ''), mo: null, io: null, rafId: null, dirty: new Set(), seen: new WeakMap(), verdict: null, statusText: '', timers: [] };
    if (typeof window.MutationObserver === 'function') cur.mo = new window.MutationObserver(onMutations);
    enhance(true);
    if (cur && cur.mo) observe(cur);
    schedule(); // por si restaurar un borrador hizo que la temporada repintara algo
    // Membrete del oficio: el punto separador se queda al final de la primera línea, nunca encabeza la segunda
    const mast = card.querySelector('.modal-masthead');
    if (mast && mast.childNodes.length === 1 && mast.firstChild.nodeType === 3) mast.firstChild.nodeValue = mast.firstChild.nodeValue.replace(/ · /g, '\u00a0· ');
    const st = card.querySelector('.modal-status');
    if (st && !st.hasAttribute('data-tap')) {
      st.setAttribute('data-tap', '');
      // Atajo solo de puntero (la tira es un <p role=status>, no un control): el teclado y los
      // lectores ya reciben el veredicto entero en la propia tira y en el cuerpo.
      st.addEventListener('click', () => {
        const v = cur && cur.verdict;
        if (v && v.isConnected && typeof v.scrollIntoView === 'function') { try { v.scrollIntoView({ block: 'nearest', behavior: rm() ? 'auto' : 'smooth' }); } catch (e) { /* nada */ } }
      });
    }
  }
  /** setTimeout que se borra solo de c.timers al dispararse (la lista no crece veredicto a veredicto) */
  function later(c, fn, ms) {
    const id = setTimeout(() => {
      const i = c.timers.indexOf(id);
      if (i >= 0) c.timers.splice(i, 1);
      fn();
    }, ms);
    c.timers.push(id);
  }
  function teardown() {
    if (!cur) return;
    if (cur.mo) cur.mo.disconnect();
    if (cur.io) { try { cur.io.disconnect(); } catch (e) { /* nada */ } }
    if (cur.rafId != null) caf(cur.rafId);
    cur.timers.forEach(clearTimeout);
    cur = null;
  }
  function close(d) {
    const card = d.card; const body = d.body || (card && card.querySelector('.modal-body'));
    const title = String(d.title || '');
    if (card && body && card.getAttribute('data-kind') !== 'system') {
      if (d.reason === 'commit') drafts.delete(title);
      else {
        const snap = snapshot(body);
        if (Object.keys(snap).length) drafts.set(title, snap); else drafts.delete(title);
      }
    }
    if (cur && (!card || cur.card === card)) teardown();
    swapping = true;
    Promise.resolve().then(() => { swapping = false; });
  }

  document.addEventListener('vum:modal', (e) => {
    const d = (e && e.detail) || {};
    try {
      if (d.phase === 'open') open(d);
      else if (d.phase === 'close') close(d);
    } catch (x) {
      if (window.console && console.warn) console.warn('ui-puzzles:', x);
    }
  });
  // Trámite nuevo: los borradores eran del anterior
  document.addEventListener('vum:level', () => drafts.clear());
  // Pista nueva con movimiento reducido: resalte fijo durante 1,2 s en vez del fundido
  document.addEventListener('vum:hint', () => {
    if (!rm()) return;
    const li = document.querySelector('#modal .hint-list li.is-new');
    if (!li) return;
    li.classList.add('hl-static');
    setTimeout(() => { li.classList.remove('hl-static'); }, 1200);
  });
}());
