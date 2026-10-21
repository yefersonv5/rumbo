'use strict';
(function () {
  // ───────────── Constantes ─────────────
  const CFG = window.RUMBO_CONFIG || {};
  const TABLES = ['rutas', 'modulos', 'plantilla_items', 'entidades', 'contactos', 'programas', 'items', 'bitacora', 'documentos', 'facturacion'];
  const ESTADOS_ITEM = { pendiente: 'Pendiente', en_curso: 'En curso', esperando: 'Esperando', hecho: 'Hecho', no_aplica: 'No aplica' };
  const ESTADOS_PROG = { activo: 'Activo', pausa: 'En pausa', cerrado: 'Cerrado', perdido: 'Perdido' };
  const ACTORES = ['Yo', 'Cliente', 'Facultad', 'Financiera', 'Docente', 'Proveedor', 'Mercadeo', 'Jurídica', 'Dirección EC'];
  const TIPOS = ['Curso', 'Diplomado', 'Seminario', 'Taller', 'Congreso', 'Jornada', 'Simposio', 'Foro', 'Microcredencial', 'Rotación', 'Certificación', 'Aval'];
  const FACULTADES = ['Enfermería', 'Medicina', 'Odontología', 'Psicología', 'Ciencias Económicas y Administrativas', 'Ingeniería', 'Educación', 'Otra'];
  const MODALIDADES = ['Virtual sincrónica', 'Virtual asincrónica', 'Presencial', 'Híbrida'];
  const TIPOS_BIT = ['Nota', 'Correo', 'Reunión', 'Llamada', 'Decisión'];
  const TIPOS_DOC = ['Propuesta', 'Presupuesto', 'Carta / OC', 'Acta', 'Aval', 'Cronograma', 'Informe', 'Factura', 'Otro'];
  const TIPOS_ENT = ['Farmacéutica', 'Dispositivos médicos', 'IPS / Clínica', 'Sociedad científica', 'Caja de compensación', 'Universidad', 'Entidad pública', 'Otra'];
  const ROLES = ['Decisor', 'Operativo', 'Facturación', 'Académico'];
  const MONEY = ['valor_total', 'valor_persona', 'valor'];
  const NUMS = ['horas', 'participantes', 'margen'];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const LS_KEY = 'rumbo-datos-v1';

  const S = {
    data: Object.fromEntries(TABLES.map(t => [t, []])),
    mode: 'local', user: null, ready: false, error: null,
    view: { name: 'hoy' },
    f: { q: '', estado: 'activo', ruta: '' },
    hideDone: false, collapsed: {},
  };
  let sb = null;

  // ───────────── Utilidades ─────────────
  const $ = (s, r = document) => r.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
  const pad = n => String(n).padStart(2, '0');
  const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => isoOf(new Date());
  const parse = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return isoOf(d); };
  const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 864e5);
  const nowIso = () => new Date().toISOString();
  const fmtDate = s => {
    if (!s) return '';
    const d = parse(s);
    const y = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '';
    return `${d.getDate()} ${MESES[d.getMonth()]}${y}`;
  };
  const relDate = s => {
    const n = diffDays(s, today());
    if (n === 0) return 'Hoy';
    if (n === 1) return 'Mañana';
    if (n === -1) return 'Ayer';
    if (n < 0 && n > -8) return `Hace ${-n} d`;
    if (n > 0 && n < 8) return `En ${n} d`;
    return fmtDate(s);
  };
  const money = n => (n === null || n === undefined || n === '') ? '' : '$ ' + Math.round(Number(n)).toLocaleString('es-CO');
  const byDate = k => (a, b) => (a[k] || '9999').localeCompare(b[k] || '9999');
  const opts = (list, sel, empty) => (empty !== undefined ? `<option value="">${esc(empty)}</option>` : '') +
    list.map(v => { const [val, lab] = Array.isArray(v) ? v : [v, v]; return `<option value="${esc(val)}" ${String(sel ?? '') === String(val) ? 'selected' : ''}>${esc(lab)}</option>`; }).join('');

  function clean(o) {
    const r = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined) continue;
      let x = typeof v === 'string' ? v.trim() : v;
      if (x === '') x = null;
      if (x !== null && MONEY.includes(k)) { x = Number(String(x).replace(/[^\d-]/g, '')); if (isNaN(x)) x = null; }
      if (x !== null && NUMS.includes(k)) { x = Number(String(x).replace(',', '.')); if (isNaN(x)) x = null; }
      r[k] = x;
    }
    return r;
  }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 2400);
    t.onclick = () => { clearTimeout(toast.timer); t.hidden = true; };
  }
  function fail(err) { console.error(err); toast('Error: ' + (err?.message || err)); }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ───────────── Datos ─────────────
  let memStore = null;
  const Local = {
    load() {
      let d = memStore;
      try { const raw = localStorage.getItem(LS_KEY); if (raw) d = JSON.parse(raw); } catch (e) { /* sin almacenamiento */ }
      return Object.fromEntries(TABLES.map(t => [t, (d && d[t]) || []]));
    },
    save(data) { memStore = data; try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) { /* sin almacenamiento */ } },
  };
  const persist = () => { if (S.mode === 'local') Local.save(S.data); };

  const db = {
    async insert(t, rows) {
      const many = Array.isArray(rows);
      const arr = (many ? rows : [rows]).map(r => ({ id: uid(), created_at: nowIso(), ...r }));
      if (!arr.length) return many ? [] : null;
      if (S.mode === 'remote') {
        for (let i = 0; i < arr.length; i += 400) {
          const { error } = await sb.from(t).insert(arr.slice(i, i + 400));
          if (error) throw error;
        }
      }
      S.data[t].push(...arr); persist();
      return many ? arr : arr[0];
    },
    async update(t, id, patch) {
      if (S.mode === 'remote') { const { error } = await sb.from(t).update(patch).eq('id', id); if (error) throw error; }
      const row = S.data[t].find(r => r.id === id); if (row) Object.assign(row, patch);
      persist(); return row;
    },
    async remove(t, id) {
      if (S.mode === 'remote') { const { error } = await sb.from(t).delete().eq('id', id); if (error) throw error; }
      S.data[t] = S.data[t].filter(r => r.id !== id);
      if (t === 'programas') ['items', 'bitacora', 'documentos', 'facturacion'].forEach(c => { S.data[c] = S.data[c].filter(r => r.programa_id !== id); });
      if (t === 'entidades') {
        S.data.contactos = S.data.contactos.filter(r => r.entidad_id !== id);
        S.data.programas.forEach(p => { if (p.entidad_id === id) p.entidad_id = null; });
      }
      persist();
    },
  };

  async function loadRemote() {
    const res = await Promise.all(TABLES.map(async t => {
      let all = [], from = 0;
      for (;;) {
        const { data, error } = await sb.from(t).select('*').range(from, from + 999);
        if (error) throw error;
        all = all.concat(data);
        if (data.length < 1000) break;
        from += 1000;
      }
      return [t, all];
    }));
    S.data = Object.fromEntries(res);
  }

  async function seedIfEmpty() {
    if (S.data.rutas.length || !window.PLANTILLAS) return;
    const P = window.PLANTILLAS, items = [];
    const row = ([fase, titulo, responsable, dias_ref, dias_rel, esencial], orden, ids) =>
      ({ ...ids, fase, titulo, responsable, dias_ref, dias_rel, esencial, orden });
    const rutas = P.rutas.map(r => ({ id: uid(), clave: r.clave, nombre: r.nombre, descripcion: r.descripcion, fases: r.fases, orden: r.orden, activa: true }));
    P.rutas.forEach((r, i) => r.items.forEach((it, j) => items.push(row(it, j, { ruta_id: rutas[i].id, modulo_id: null }))));
    const mods = P.modulos.map(m => ({ id: uid(), clave: m.clave, nombre: m.nombre, descripcion: m.descripcion, orden: m.orden, activa: true }));
    P.modulos.forEach((m, i) => m.items.forEach((it, j) => items.push(row(it, j, { ruta_id: null, modulo_id: mods[i].id }))));
    await db.insert('rutas', rutas);
    await db.insert('modulos', mods);
    await db.insert('plantilla_items', items);
  }

  // ───────────── Dominio ─────────────
  const byId = (t, id) => S.data[t].find(r => r.id === id);
  const rutaDe = p => byId('rutas', p.ruta_id);
  const itemsDe = pid => S.data.items.filter(i => i.programa_id === pid);
  const abierto = i => i.estado !== 'hecho' && i.estado !== 'no_aplica';
  const nombreProg = p => p ? (p.nombre_corto || p.nombre) : '';
  const entidadDe = p => p && p.entidad_id ? byId('entidades', p.entidad_id) : null;

  function fasesDe(p) {
    const base = (rutaDe(p)?.fases) || [];
    const extra = [...new Set(itemsDe(p.id).map(i => i.fase))].filter(f => !base.includes(f));
    return base.concat(extra);
  }
  function itemsOrdenados(p) {
    const fs = fasesDe(p);
    return itemsDe(p.id).sort((a, b) => (fs.indexOf(a.fase) - fs.indexOf(b.fase)) || ((a.orden || 0) - (b.orden || 0)) || (a.created_at || '').localeCompare(b.created_at || ''));
  }
  function faseActual(p) {
    const fs = fasesDe(p), its = itemsDe(p.id);
    for (const f of fs) if (its.some(i => i.fase === f && i.esencial && abierto(i))) return f;
    return fs.length ? 'Completo' : '—';
  }
  function avance(p) {
    const es = itemsDe(p.id).filter(i => i.esencial && i.estado !== 'no_aplica');
    const d = es.filter(i => i.estado === 'hecho').length;
    return { d, n: es.length, pct: es.length ? Math.round(d * 100 / es.length) : 0 };
  }
  function semaforo(p) {
    if (p.estado !== 'activo') return 'gris';
    const t = today(), its = itemsDe(p.id).filter(abierto);
    if (its.some(i => i.esencial && i.fecha_limite && i.fecha_limite < t)) return 'rojo';
    if (p.fecha_inicio) {
      const dd = diffDays(p.fecha_inicio, t), fs = fasesDe(p), ej = fs.indexOf('Ejecución');
      if (dd >= 0 && dd <= 15 && ej > 0 && its.some(i => i.esencial && fs.indexOf(i.fase) < ej)) return 'rojo';
    }
    const t3 = addDays(t, 3);
    if (its.some(i => i.fecha_limite && i.fecha_limite <= t3) ||
        its.some(i => i.estado === 'esperando' && (!i.fecha_seguimiento || i.fecha_seguimiento <= t))) return 'amarillo';
    return 'verde';
  }
  const SEM_ORDEN = { rojo: 0, amarillo: 1, verde: 2, gris: 3 };

  function calcFecha(p, ref, rel) {
    if (!ref || rel === null || rel === undefined) return null;
    const base = ref === 'inicio' ? p.fecha_inicio : (p.fecha_fin || p.fecha_inicio);
    return base ? addDays(base, Number(rel)) : null;
  }
  function faseDestino(fases, f) {
    if (fases.includes(f)) return f;
    const alt = { 'Negociación': ['Diseño', 'Revisión', 'Solicitud'], 'Diseño': ['Revisión', 'Solicitud'], 'Alistamiento': ['Operación', 'Aprobación'], 'Ejecución': ['Operación'], 'Cierre': ['Vigencia', 'Operación'] }[f] || [];
    return alt.find(a => fases.includes(a)) || fases[Math.max(0, fases.length - 2)] || f;
  }
  function generarItems(p, moduloIds, incluirRuta) {
    const r = rutaDe(p), fases = r ? r.fases : [];
    const tpl = S.data.plantilla_items.filter(t => (incluirRuta && t.ruta_id === p.ruta_id) || (t.modulo_id && moduloIds.includes(t.modulo_id)));
    return tpl.map(t => ({
      programa_id: p.id, fase: faseDestino(fases, t.fase), orden: (t.modulo_id ? 500 : 0) + (t.orden || 0),
      titulo: t.titulo, estado: 'pendiente', responsable: t.responsable || 'Yo', esperando_a: null,
      fecha_limite: calcFecha(p, t.dias_ref, t.dias_rel), fecha_seguimiento: null, fecha_hecho: null,
      enlace: null, nota: null, esencial: !!t.esencial, dias_ref: t.dias_ref || null, dias_rel: t.dias_rel ?? null,
    }));
  }
  async function touch(pid) { if (pid) await db.update('programas', pid, { actualizado: nowIso() }); }

  // ───────────── Iconos ─────────────
  const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICON = {
    hoy: I('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'),
    prog: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h4"/>'),
    tpl: I('<path d="M5 4h14v4H5zM5 11h14M5 15h9M5 19h6"/>'),
    more: I('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    edit: I('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    trash: I('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>'),
    link: I('<path d="M10 14a4 4 0 006 0l3-3a4 4 0 00-6-6l-1 1M14 10a4 4 0 00-6 0l-3 3a4 4 0 006 6l1-1"/>'),
    check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };

  // ───────────── Navegación ─────────────
  function routeFromHash() {
    const [n, id, tab] = location.hash.replace(/^#\/?/, '').split('/');
    if (n === 'programa' && id) S.view = { name: 'programa', id, tab: tab || 'checklist' };
    else if (['programas', 'plantillas', 'hoy'].includes(n)) S.view = { name: n };
    else S.view = { name: 'hoy' };
  }
  function go(name, id) {
    const h = name === 'programa' ? `#/programa/${id}` : `#/${name}`;
    if (location.hash !== h) location.hash = h;
    else { routeFromHash(); render(); }
  }
  const ORDEN_VISTA = { hoy: 0, programas: 1, plantillas: 2, programa: 3 };
  window.addEventListener('hashchange', () => {
    const antes = S.view.name;
    routeFromHash(); closeModal(); render(); window.scrollTo(0, 0);
    // Animación corta al cambiar de pantalla: entra desde la derecha al avanzar y desde la izquierda al volver.
    const m = $('#app main');
    if (m && antes !== S.view.name) {
      const atras = S.navBack || ORDEN_VISTA[S.view.name] < ORDEN_VISTA[antes];
      m.classList.add(atras ? 'navback' : 'navfwd');
    }
    S.navBack = false;
  });

  // ───────────── Render principal ─────────────
  function render() {
    const app = $('#app');
    if (S.error) { app.innerHTML = `<div class="login card"><h2>No se pudo iniciar</h2><p class="muted small">${esc(S.error)}</p><button class="btn" onclick="location.reload()">Reintentar</button></div>`; return; }
    if (!S.ready) { app.innerHTML = '<div class="login card"><p class="muted">Cargando…</p></div>'; return; }
    if (S.mode === 'remote' && !S.user) { app.innerHTML = viewLogin(); return; }
    let body;
    if (S.view.name === 'programas') body = viewProgramas();
    else if (S.view.name === 'programa') body = viewPrograma();
    else if (S.view.name === 'plantillas') body = viewPlantillas();
    else body = viewHoy();
    const sec = S.view.name === 'programa' ? 'programas' : S.view.name;
    const nb = (k, l) => `<button class="${sec === k ? 'on' : ''}" data-act="nav" data-to="${k}">${l}</button>`;
    const bn = (k, l, ic) => `<button class="${sec === k ? 'on' : ''}" data-act="nav" data-to="${k}">${ic}<span>${l}</span></button>`;
    app.innerHTML = `
      ${S.mode === 'local' ? '<div class="banner">Modo local: los datos viven solo en este navegador. Conecta Supabase en config.js para sincronizar.</div>' : ''}
      <header class="topbar">
        <div class="brand"><span class="brand-dot"></span>Rumbo</div>
        <nav class="desk-nav">${nb('hoy', 'Hoy')}${nb('programas', 'Programas')}${nb('plantillas', 'Plantillas')}</nav>
        <div class="spacer"></div>
        <button class="icon-btn" data-act="menu" aria-label="Más opciones">${ICON.more}</button>
      </header>
      <main>${body}</main>
      <button class="fab" data-act="captura" aria-label="Captura rápida">+</button>
      <nav class="bottom-nav">${bn('hoy', 'Hoy', ICON.hoy)}${bn('programas', 'Programas', ICON.prog)}${bn('plantillas', 'Plantillas', ICON.tpl)}</nav>`;
  }

  function viewLogin() {
    return `<form class="login card" data-form="login">
      <div class="brand" style="margin-bottom:16px"><span class="brand-dot"></span>Rumbo</div>
      <p class="muted small" style="margin-top:0">Seguimiento de programas de Educación Continuada.</p>
      <div class="field"><label>Correo</label><input class="input" name="email" type="email" autocomplete="username" required></div>
      <div class="field"><label>Contraseña</label><input class="input" name="password" type="password" autocomplete="current-password" required></div>
      <p id="login-msg" class="small" style="color:var(--red)"></p>
      <button class="btn primary" style="width:100%">Entrar</button>
      <button type="button" class="btn ghost" style="width:100%;margin-top:8px" data-act="signup">Primera vez: crear mi cuenta</button>
    </form>`;
  }

  // ───────────── Hoy ─────────────
  function itemRow(i, showProg = true) {
    const p = byId('programas', i.programa_id), t = today();
    const fecha = i.estado === 'esperando' ? i.fecha_seguimiento : i.fecha_limite;
    let pill = '';
    if (abierto(i) && fecha) {
      const cls = fecha < t ? 'red' : fecha <= addDays(t, 3) ? 'amber' : '';
      pill = `<span class="pill ${cls}">${i.estado === 'esperando' ? 'Seguir · ' : ''}${relDate(fecha)}</span>`;
    } else if (abierto(i) && i.estado === 'esperando') pill = '<span class="pill amber">Sin fecha</span>';
    else if (i.estado === 'hecho' && i.fecha_hecho) pill = `<span class="tiny muted">${fmtDate(i.fecha_hecho)}</span>`;
    const sub = [];
    if (showProg && p) sub.push(esc(nombreProg(p)));
    if (showProg) sub.push(esc(i.fase));
    if (i.estado === 'esperando') sub.push('Esperando a ' + esc(i.esperando_a || '…'));
    else if (i.responsable && i.responsable !== 'Yo') sub.push(esc(i.responsable));
    if (i.estado === 'en_curso') sub.push('En curso');
    if (!i.esencial) sub.push('opcional');
    if (i.nota) sub.push('con nota');
    const cls = i.estado === 'hecho' ? 'done' : i.estado === 'no_aplica' ? 'na-row' : '';
    const chk = i.estado === 'hecho' ? 'on' : i.estado === 'no_aplica' ? 'na' : '';
    return `<div class="li ${cls}" data-act="edit-item" data-id="${i.id}">
      <button class="check ${chk}" data-act="toggle" data-id="${i.id}" aria-label="Marcar como hecho">${i.estado === 'hecho' ? ICON.check : i.estado === 'no_aplica' ? '–' : ''}</button>
      <div class="grow"><div class="title">${esc(i.titulo)}</div>${sub.length ? `<div class="sub">${sub.join(' · ')}</div>` : ''}</div>
      ${i.enlace ? `<a class="icon-btn" href="${esc(i.enlace)}" target="_blank" rel="noopener" data-act="noop" aria-label="Abrir enlace">${ICON.link}</a>` : ''}
      ${pill}
    </div>`;
  }
  function seccion(titulo, html, n, vacio) {
    return `<section class="section"><div class="section-head"><h3>${titulo}${n !== undefined ? ` · ${n}` : ''}</h3></div>
      <div class="card list">${html || `<div class="empty">${vacio}</div>`}</div></section>`;
  }
  function viewHoy() {
    const t = today(), t7 = addDays(t, 7), t30 = addDays(t, 30), t14 = addDays(t, -14);
    const activos = S.data.programas.filter(p => p.estado === 'activo');
    const fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!S.data.programas.length) {
      return `<h1 style="text-transform:capitalize">${esc(fecha)}</h1>
        <div class="card pad section stack">
          <h2>Empieza con tu primer programa</h2>
          <p class="muted">Cada programa nace de una ruta (Cerrado B2B, Aval académico u Oferta abierta) y los módulos que necesite. La app arma el checklist y calcula las fechas desde el inicio del programa.</p>
          <button class="btn primary" data-act="nuevo">Crear programa</button>
        </div>`;
    }
    const ids = new Set(activos.map(p => p.id));
    const its = S.data.items.filter(i => ids.has(i.programa_id) && abierto(i));
    const seguir = its.filter(i => i.estado === 'esperando' && (!i.fecha_seguimiento || i.fecha_seguimiento <= t)).sort(byDate('fecha_seguimiento'));
    const seg = new Set(seguir.map(i => i.id));
    const vencido = its.filter(i => !seg.has(i.id) && i.fecha_limite && i.fecha_limite < t).sort(byDate('fecha_limite'));
    const clave = i => i.estado === 'esperando' ? i.fecha_seguimiento : i.fecha_limite;
    const semana = its.filter(i => { const f = clave(i); return !seg.has(i.id) && f && f >= t && f <= t7; })
      .sort((a, b) => clave(a).localeCompare(clave(b)));
    const quietos = activos.filter(p => (p.actualizado || p.created_at || '').slice(0, 10) < t14);
    const inicios = activos.filter(p => p.fecha_inicio && p.fecha_inicio >= t && p.fecha_inicio <= t30).sort(byDate('fecha_inicio'));
    const progRow = (p, extra) => `<div class="li" data-act="open" data-id="${p.id}"><span class="dot ${semaforo(p)}"></span>
      <div class="grow"><div class="title ellipsis">${esc(p.nombre)}</div><div class="sub">${esc(entidadDe(p)?.nombre || 'Sin entidad')} · ${esc(faseActual(p))}</div></div>${extra}</div>`;
    return `
      <h1 style="text-transform:capitalize">${esc(fecha)}</h1>
      <div class="stats section">
        <div class="card stat ${vencido.length ? 'red' : ''}"><b>${vencido.length}</b><span>Vencidos</span></div>
        <div class="card stat ${seguir.length ? 'amber' : ''}"><b>${seguir.length}</b><span>Por seguir</span></div>
        <div class="card stat"><b>${semana.length}</b><span>Próximos 7 días</span></div>
        <div class="card stat"><b>${activos.length}</b><span>Programas activos</span></div>
      </div>
      ${seccion('Vencido', vencido.map(i => itemRow(i)).join(''), vencido.length, 'Nada vencido.')}
      ${seccion('Seguimientos para hoy', seguir.map(i => itemRow(i)).join(''), seguir.length, 'No hay respuestas pendientes por perseguir hoy.')}
      ${seccion('Próximos 7 días', semana.map(i => itemRow(i)).join(''), semana.length, 'Semana despejada.')}
      ${inicios.length ? seccion('Inicios en los próximos 30 días', inicios.map(p => progRow(p, `<span class="pill accent">${relDate(p.fecha_inicio)}</span>`)).join(''), inicios.length) : ''}
      ${quietos.length ? seccion('Sin movimiento en 14 días', quietos.map(p => progRow(p, `<span class="pill">${fmtDate((p.actualizado || p.created_at).slice(0, 10))}</span>`)).join(''), quietos.length) : ''}`;
  }

  // ───────────── Programas ─────────────
  function programasFiltrados() {
    const q = S.f.q.toLowerCase();
    return S.data.programas
      .filter(p => S.f.estado === 'todos' || p.estado === S.f.estado)
      .filter(p => !S.f.ruta || p.ruta_id === S.f.ruta)
      .filter(p => !q || [p.nombre, p.nombre_corto, entidadDe(p)?.nombre, p.facultad, p.tipo].some(v => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => (SEM_ORDEN[semaforo(a)] - SEM_ORDEN[semaforo(b)]) || (a.fecha_inicio || '9999').localeCompare(b.fecha_inicio || '9999'));
  }
  function programCard(p) {
    const av = avance(p), sem = semaforo(p), fa = faseActual(p);
    return `<div class="card pcard" data-act="open" data-id="${p.id}">
      <div class="row"><span class="dot ${sem}"></span><div class="name grow ellipsis">${esc(p.nombre)}</div></div>
      <div class="small muted ellipsis">${esc(entidadDe(p)?.nombre || 'Sin entidad')} · ${esc(rutaDe(p)?.nombre || '')}</div>
      <div class="row wrap"><span class="pill accent">${esc(fa)}</span>${p.estado !== 'activo' ? `<span class="pill">${ESTADOS_PROG[p.estado]}</span>` : ''}
        ${p.fecha_inicio ? `<span class="pill">Inicio ${fmtDate(p.fecha_inicio)}</span>` : ''}</div>
      <div class="row"><div class="bar grow"><i style="width:${av.pct}%"></i></div><span class="tiny muted">${av.d}/${av.n}</span></div>
      ${p.valor_total ? `<div class="small"><b>${money(p.valor_total)}</b>${p.participantes ? ` <span class="muted">· ${p.participantes} part.</span>` : ''}</div>` : ''}
    </div>`;
  }
  function listaProgramas() {
    const ps = programasFiltrados();
    if (!ps.length) return '<div class="card empty">No hay programas con estos filtros.</div>';
    const total = ps.reduce((s, p) => s + (Number(p.valor_total) || 0), 0);
    return `<p class="small muted">${ps.length} programa${ps.length === 1 ? '' : 's'}${total ? ` · ${money(total)}` : ''}</p><div class="grid">${ps.map(programCard).join('')}</div>`;
  }
  function viewProgramas() {
    const chip = (v, l) => `<button class="chip ${S.f.estado === v ? 'on' : ''}" data-act="f-estado" data-v="${v}">${l}</button>`;
    return `
      <div class="row between"><h1>Programas</h1><button class="btn primary" data-act="nuevo">Nuevo programa</button></div>
      <div class="filters">
        <input class="input" type="search" placeholder="Buscar programa, entidad, facultad…" value="${esc(S.f.q)}" data-input="buscar">
        <select class="input" data-change="f-ruta">${opts(S.data.rutas.map(r => [r.id, r.nombre]), S.f.ruta, 'Todas las rutas')}</select>
      </div>
      <div class="chips">${chip('activo', 'Activos')}${chip('pausa', 'En pausa')}${chip('cerrado', 'Cerrados')}${chip('perdido', 'Perdidos')}${chip('todos', 'Todos')}</div>
      <div id="prog-list" class="section">${listaProgramas()}</div>`;
  }

  // ───────────── Ficha de programa ─────────────
  function viewPrograma() {
    const p = byId('programas', S.view.id);
    if (!p) return '<div class="card empty">Este programa no existe. <a href="#/programas">Ver programas</a></div>';
    const fs = fasesDe(p), fa = faseActual(p), ia = fs.indexOf(fa), ent = entidadDe(p);
    const fact = (l, v) => v || v === 0 ? `<div class="fact"><span>${l}</span><b>${esc(v)}</b></div>` : '';
    const tab = S.view.tab;
    const nAbiertos = itemsDe(p.id).filter(abierto).length;
    const tb = (k, l) => `<button class="${tab === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${l}</button>`;
    let content;
    if (tab === 'bitacora') content = tabBitacora(p);
    else if (tab === 'documentos') content = tabDocumentos(p);
    else if (tab === 'contactos') content = tabContactos(p);
    else if (tab === 'dinero') content = tabDinero(p);
    else content = tabChecklist(p);
    const mods = (p.modulos || []).map(id => byId('modulos', id)?.nombre).filter(Boolean);
    return `
      <button class="btn ghost back" data-act="nav" data-to="programas">← Programas</button>
      <div class="card phead">
        <div class="row" style="align-items:flex-start">
          <span class="dot ${semaforo(p)}" style="margin-top:7px"></span>
          <div class="grow"><h1>${esc(p.nombre)}</h1>
            <div class="muted small" style="margin-top:4px">${esc(ent?.nombre || 'Sin entidad')} · ${esc(rutaDe(p)?.nombre || '')}${mods.length ? ' + ' + esc(mods.join(', ')) : ''}</div></div>
          <select class="input" style="width:auto" data-change="prog-estado" data-id="${p.id}">${opts(Object.entries(ESTADOS_PROG), p.estado)}</select>
          <button class="icon-btn" data-act="edit-prog" data-id="${p.id}" aria-label="Editar programa">${ICON.edit}</button>
        </div>
        ${p.estado === 'perdido' && p.motivo_perdida ? `<p class="small" style="color:var(--red)">Motivo: ${esc(p.motivo_perdida)}</p>` : ''}
        <div class="stepper">${fs.map((f, i) => `<div class="step ${f === fa ? 'now' : (ia === -1 || i < ia) ? 'done' : ''}"><i></i>${esc(f)}</div>`).join('')}</div>
        <div class="facts">
          ${fact('Tipo', p.tipo)}${fact('Facultad', p.facultad)}${fact('Director', p.director)}${fact('Modalidad', p.modalidad)}
          ${fact('Horas', p.horas)}${fact('Participantes', p.participantes)}${fact('Valor total', money(p.valor_total))}
          ${fact('Valor por persona', money(p.valor_persona))}${fact('Margen', p.margen !== null && p.margen !== undefined ? p.margen + ' %' : '')}
          ${fact('Inicio', fmtDate(p.fecha_inicio))}${fact('Fin', fmtDate(p.fecha_fin))}
        </div>
        ${p.notas ? `<p class="small muted" style="white-space:pre-wrap;margin-bottom:0">${esc(p.notas)}</p>` : ''}
      </div>
      <div class="tabs">${tb('checklist', `Checklist · ${nAbiertos}`)}${tb('bitacora', 'Bitácora')}${tb('documentos', 'Documentos')}${tb('contactos', 'Contactos')}${tb('dinero', 'Facturación')}</div>
      ${content}`;
  }

  function tabChecklist(p) {
    const fs = fasesDe(p), fa = faseActual(p), list = itemsOrdenados(p);
    const head = `<div class="row between" style="margin-bottom:10px">
      <label class="small muted row"><input type="checkbox" data-change="hide-done" ${S.hideDone ? 'checked' : ''}> Ocultar hechos</label>
      <button class="btn sm" data-act="recalc" data-id="${p.id}">Recalcular fechas</button></div>`;
    return head + fs.map(f => {
      const its = list.filter(i => i.fase === f);
      const listos = its.filter(i => !abierto(i)).length;
      const key = p.id + '|' + f;
      const fold = S.collapsed[key] ?? (its.length > 0 && listos === its.length && f !== fa);
      const shown = S.hideDone ? its.filter(abierto) : its;
      return `<div class="card phase">
        <div class="phase-head" data-act="fold" data-key="${esc(key)}">
          <h2 class="grow">${esc(f)}</h2>
          ${f === fa ? '<span class="pill accent">Fase actual</span>' : ''}
          <span class="pill ${its.length && listos === its.length ? 'green' : ''}">${listos}/${its.length}</span>
          <span class="muted">${fold ? '▸' : '▾'}</span>
        </div>
        ${fold ? '' : `<div class="list">${shown.map(i => itemRow(i, false)).join('') || (its.length ? '' : '<div class="empty">Sin pasos.</div>')}</div>
        <form class="add-line" data-form="add-item" data-pid="${p.id}" data-fase="${esc(f)}">
          <input name="titulo" placeholder="Agregar paso en ${esc(f)}…" autocomplete="off"><button class="btn sm ghost">Agregar</button>
        </form>`}
      </div>`;
    }).join('');
  }

  function tabBitacora(p) {
    const logs = S.data.bitacora.filter(b => b.programa_id === p.id).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.created_at || '').localeCompare(a.created_at || ''));
    return `<form class="card pad" data-form="bitacora" data-pid="${p.id}">
        <div class="two"><div class="field"><label>Tipo</label><select class="input" name="tipo">${opts(TIPOS_BIT, 'Nota')}</select></div>
        <div class="field"><label>Fecha</label><input class="input" type="date" name="fecha" value="${today()}"></div></div>
        <div class="field"><label>Qué pasó</label><textarea class="input" name="resumen" rows="3" required placeholder="Ej.: El cliente pidió bajar a 25 participantes"></textarea></div>
        <div class="field"><label>Próxima acción (opcional)</label><input class="input" name="proxima_accion" placeholder="Ej.: Enviar presupuesto ajustado el viernes"></div>
        <div class="row" style="justify-content:flex-end"><button class="btn primary">Registrar</button></div>
      </form>
      <div class="card section">${logs.map(b => `<div class="log">
        <div class="row between"><div class="row"><span class="pill">${esc(b.tipo || 'Nota')}</span><span class="small muted">${fmtDate(b.fecha)}</span></div>
          <button class="icon-btn" data-act="del" data-t="bitacora" data-id="${b.id}" aria-label="Eliminar">${ICON.trash}</button></div>
        <div style="white-space:pre-wrap;margin-top:6px">${esc(b.resumen)}</div>
        ${b.proxima_accion ? `<div class="small" style="margin-top:4px"><b>Siguiente:</b> ${esc(b.proxima_accion)}</div>` : ''}
      </div>`).join('') || '<div class="empty">Sin registros todavía.</div>'}</div>`;
  }

  function tabDocumentos(p) {
    const docs = S.data.documentos.filter(d => d.programa_id === p.id).sort(byDate('fecha')).reverse();
    return `<div class="row" style="justify-content:flex-end;margin-bottom:10px"><button class="btn primary" data-act="add-doc" data-pid="${p.id}">Agregar enlace</button></div>
      <div class="card list">${docs.map(d => `<div class="li" data-act="noop">
        <span class="pill blue">${esc(d.tipo || 'Doc')}</span>
        <div class="grow"><div class="title ellipsis">${esc(d.nombre || d.tipo)}</div><div class="sub">${d.version ? 'v' + esc(d.version) + ' · ' : ''}${fmtDate(d.fecha)}</div></div>
        ${d.enlace ? `<a class="btn sm" href="${esc(d.enlace)}" target="_blank" rel="noopener">Abrir</a>` : ''}
        <button class="icon-btn" data-act="del" data-t="documentos" data-id="${d.id}" aria-label="Eliminar">${ICON.trash}</button>
      </div>`).join('') || '<div class="empty">Guarda aquí los enlaces de OneDrive o SharePoint: propuesta, presupuesto, carta, actas.</div>'}</div>`;
  }

  function tabContactos(p) {
    const ent = entidadDe(p);
    if (!ent) return `<div class="card pad stack"><p class="muted" style="margin:0">Este programa no tiene entidad asignada.</p><button class="btn" data-act="edit-prog" data-id="${p.id}">Asignar entidad</button></div>`;
    const cs = S.data.contactos.filter(c => c.entidad_id === ent.id);
    const vence = ent.convenio_hasta ? diffDays(ent.convenio_hasta, today()) : null;
    return `<div class="card pad">
        <div class="row between"><div><h2>${esc(ent.nombre)}</h2><div class="small muted">${esc(ent.tipo || 'Tipo sin definir')}${ent.convenio_hasta ? ` · Convenio hasta ${fmtDate(ent.convenio_hasta)}` : ''}</div></div>
        <button class="icon-btn" data-act="edit-ent" data-id="${ent.id}" aria-label="Editar entidad">${ICON.edit}</button></div>
        ${vence !== null && vence < 90 ? `<p class="small" style="color:var(--${vence < 0 ? 'red' : 'amber'});margin-bottom:0">${vence < 0 ? 'El convenio está vencido.' : `El convenio vence en ${vence} días.`}</p>` : ''}
        ${ent.notas ? `<p class="small muted" style="white-space:pre-wrap">${esc(ent.notas)}</p>` : ''}
      </div>
      <div class="row between section"><h3>Contactos · ${cs.length}</h3><button class="btn sm" data-act="add-contacto" data-eid="${ent.id}">Agregar contacto</button></div>
      <div class="card list" style="margin-top:8px">${cs.map(c => `<div class="li" data-act="edit-contacto" data-id="${c.id}">
        <div class="grow"><div class="title">${esc(c.nombre)}</div><div class="sub">${[c.cargo, c.rol].filter(Boolean).map(esc).join(' · ')}</div>
        <div class="sub">${c.correo ? `<a href="mailto:${esc(c.correo)}" data-act="noop">${esc(c.correo)}</a>` : ''}${c.correo && c.telefono ? ' · ' : ''}${c.telefono ? `<a href="tel:${esc(c.telefono)}" data-act="noop">${esc(c.telefono)}</a>` : ''}</div></div>
      </div>`).join('') || '<div class="empty">Sin contactos.</div>'}</div>`;
  }

  function tabDinero(p) {
    const fs = S.data.facturacion.filter(f => f.programa_id === p.id).sort(byDate('fecha_factura'));
    const sum = k => fs.filter(f => k === 'all' || f.estado_pago === k || (k === 'facturado' && f.estado_pago === 'pagado')).reduce((s, f) => s + (Number(f.valor) || 0), 0);
    const cls = { pendiente: '', facturado: 'amber', pagado: 'green' };
    return `<div class="stats" style="grid-template-columns:repeat(3,1fr)">
        <div class="card stat"><b style="font-size:17px">${money(p.valor_total) || '—'}</b><span>Valor del programa</span></div>
        <div class="card stat"><b style="font-size:17px">${money(sum('facturado')) || '$ 0'}</b><span>Facturado</span></div>
        <div class="card stat"><b style="font-size:17px">${money(sum('pagado')) || '$ 0'}</b><span>Pagado</span></div>
      </div>
      <div class="row between section"><h3>Cuentas de cobro y facturas</h3><button class="btn sm" data-act="add-factura" data-pid="${p.id}">Agregar</button></div>
      <div class="card" style="margin-top:8px;overflow-x:auto">${fs.length ? `<table class="simple"><thead><tr><th>Concepto</th><th class="num">Valor</th><th>Estado</th><th>Factura</th><th>Pago</th></tr></thead><tbody>
        ${fs.map(f => `<tr data-act="edit-factura" data-id="${f.id}" style="cursor:pointer"><td>${esc(f.concepto)}</td><td class="num">${money(f.valor)}</td>
        <td><span class="pill ${cls[f.estado_pago] || ''}">${esc(f.estado_pago)}</span></td><td>${fmtDate(f.fecha_factura)}</td><td>${fmtDate(f.fecha_pago)}</td></tr>`).join('')}
      </tbody></table>` : '<div class="empty">Sin registros de facturación.</div>'}</div>`;
  }

  // ───────────── Plantillas ─────────────
  function cuando(t) {
    if (!t.dias_ref || t.dias_rel === null || t.dias_rel === undefined) return '';
    const n = Number(t.dias_rel), ref = t.dias_ref === 'inicio' ? 'inicio' : 'fin';
    if (n === 0) return `día del ${ref}`;
    return `${Math.abs(n)} d ${n < 0 ? 'antes' : 'después'} del ${ref}`;
  }
  function tplLista(items, fases) {
    const grupos = fases || [...new Set(items.map(i => i.fase))];
    return grupos.map(f => {
      const its = items.filter(i => i.fase === f).sort((a, b) => a.orden - b.orden);
      if (!its.length) return '';
      return `<div class="phase-head" style="cursor:default"><h2 class="grow">${esc(f)}</h2><span class="pill">${its.length}</span></div>
        <div class="list">${its.map(t => `<div class="li" style="cursor:default"><div class="grow"><div class="title">${esc(t.titulo)}</div>
        <div class="sub">${[t.responsable, cuando(t), t.esencial ? 'esencial' : 'opcional'].filter(Boolean).map(esc).join(' · ')}</div></div></div>`).join('')}</div>`;
    }).join('');
  }
  function viewPlantillas() {
    const rutas = [...S.data.rutas].sort((a, b) => a.orden - b.orden);
    const mods = [...S.data.modulos].sort((a, b) => a.orden - b.orden);
    return `<h1>Plantillas</h1>
      <p class="muted small">Así nace el checklist de cada programa. Cambiar una plantilla no altera los programas ya creados. La edición desde la app llega en la siguiente versión; mientras tanto, ajusta cada programa directamente.</p>
      <h3 class="section">Rutas base</h3>
      ${rutas.map(r => `<div class="card phase" style="margin-top:10px"><div class="pad"><h2>${esc(r.nombre)}</h2><div class="small muted">${esc(r.descripcion || '')}</div></div>
        ${tplLista(S.data.plantilla_items.filter(t => t.ruta_id === r.id), r.fases)}</div>`).join('')}
      <h3 class="section">Módulos</h3>
      ${mods.map(m => `<div class="card phase" style="margin-top:10px"><div class="pad"><h2>${esc(m.nombre)}</h2><div class="small muted">${esc(m.descripcion || '')}</div></div>
        ${tplLista(S.data.plantilla_items.filter(t => t.modulo_id === m.id))}</div>`).join('')}`;
  }

  // ───────────── Modales ─────────────
  // Ventanas que suben desde abajo (como en Caudal): el fondo queda quieto y se cierran arrastrando hacia abajo.
  let lockY = 0, closeTimer = null;
  const isOpen = () => !!$('#modal-root .backdrop:not(.closing)');
  function lockBody() {
    if (document.body.classList.contains('lock')) return;
    lockY = window.scrollY; document.body.style.top = -lockY + 'px'; document.body.classList.add('lock');
  }
  function unlockBody() {
    if (!document.body.classList.contains('lock')) return;
    document.body.classList.remove('lock'); document.body.style.top = ''; window.scrollTo(0, lockY);
  }
  function modal(html) {
    clearTimeout(closeTimer);
    const root = $('#modal-root'), reuse = isOpen();
    root.innerHTML = `<div class="backdrop${reuse ? ' on' : ''}" data-act="backdrop"><div class="sheet" role="dialog" aria-modal="true"><div class="grab" aria-hidden="true"></div>${html}</div></div>`;
    lockBody();
    if (!reuse) requestAnimationFrame(() => requestAnimationFrame(() => { const b = $('#modal-root .backdrop'); if (b) b.classList.add('on'); }));
    const f = $('#modal-root [autofocus]');
    if (f && !matchMedia('(pointer:coarse)').matches) f.focus();
  }
  function closeModal() {
    const b = $('#modal-root .backdrop');
    if (!b) { unlockBody(); return; }
    if (document.activeElement && b.contains(document.activeElement)) document.activeElement.blur();
    b.classList.remove('on'); b.classList.add('closing');
    unlockBody();
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { if (b.isConnected) b.remove(); }, 260);
  }

  // Arrastrar la ventana hacia abajo para cerrarla (celular). Si el contenido está desplazado, primero sube y luego baja la ventana.
  (() => {
    let y0 = null, x0 = 0, dy = 0, drag = false, track = [];
    const mobile = () => window.innerWidth < 640;
    const sheet = () => $('#modal-root .backdrop.on .sheet');
    document.addEventListener('touchstart', e => {
      const s = sheet(); y0 = null;
      if (!s || !mobile() || e.touches.length > 1 || !s.contains(e.target)) return;
      if (e.target.closest('input,textarea,select,.seg') && !e.target.closest('.grab,.sheet-head')) return;
      y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = 0; drag = false; track = [[Date.now(), y0]];
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (y0 === null) return;
      const s = sheet(); if (!s) { y0 = null; return; }
      const y = e.touches[0].clientY, x = e.touches[0].clientX;
      if (!drag) {
        if (Math.abs(x - x0) > 14 && Math.abs(x - x0) > Math.abs(y - y0)) { y0 = null; return; }
        if (s.scrollTop > 0 && !e.target.closest('.grab,.sheet-head')) { y0 = y; return; }
        if (y - y0 > 6) { drag = true; s.style.transition = 'none'; } else return;
      }
      e.preventDefault();
      dy = Math.max(0, y - y0); s.style.transform = `translateY(${dy}px)`;
      track.push([Date.now(), y]); if (track.length > 6) track.shift();
      const b = s.parentElement; b.style.backgroundColor = `rgba(10,15,12,${(0.45 * Math.max(0, 1 - dy / 400)).toFixed(3)})`;
    }, { passive: false });
    const end = () => {
      if (y0 === null) return; y0 = null;
      if (!drag) return; drag = false;
      const s = sheet(); if (!s) return;
      const a = track[0], z = track[track.length - 1], v = z && a && z[0] > a[0] ? (z[1] - a[1]) / (z[0] - a[0]) : 0;
      s.style.transition = ''; s.parentElement.style.backgroundColor = '';
      if (dy > 80 || (v > 0.4 && dy > 24)) { s.style.transform = 'translateY(100%)'; closeModal(); }
      else s.style.transform = '';
    };
    document.addEventListener('touchend', end, { passive: true });
    document.addEventListener('touchcancel', end, { passive: true });
    // Con una ventana abierta, tocar y arrastrar sobre la sombra no mueve la página de fondo.
    document.addEventListener('touchmove', e => {
      const b = $('#modal-root .backdrop.on');
      if (b && !e.target.closest('.sheet')) e.preventDefault();
    }, { passive: false });
  })();

  // Volver deslizando desde el borde izquierdo (en la app instalada en el iPhone, que no trae ese gesto).
  (() => {
    const standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (!standalone) return;
    let x0 = null, y0 = 0, dx = 0, on = false, t0 = 0;
    const main = () => $('#app main');
    const puedeVolver = () => isOpen() || S.view.name === 'programa';
    document.addEventListener('touchstart', e => {
      x0 = null;
      if (window.innerWidth >= 860 || e.touches.length > 1 || !puedeVolver()) return;
      const t = e.touches[0]; if (t.clientX > 30) return;
      x0 = t.clientX; y0 = t.clientY; dx = 0; on = false; t0 = Date.now();
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (x0 === null) return;
      const t = e.touches[0]; dx = t.clientX - x0; const dy = t.clientY - y0;
      if (!on) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > dx) { x0 = null; return; }
        if (dx > 10) { on = true; if (!isOpen() && main()) main().style.transition = 'none'; } else return;
      }
      e.preventDefault();
      if (!isOpen() && main()) main().style.transform = `translateX(${Math.max(0, dx)}px)`;
    }, { passive: false });
    const end = () => {
      if (x0 === null) return; x0 = null;
      if (!on) return; on = false;
      const m = main(), v = dx / Math.max(1, Date.now() - t0), ok = dx > window.innerWidth * 0.3 || (v > 0.45 && dx > 40);
      if (isOpen()) { if (ok) closeModal(); return; }
      if (!m) return;
      if (ok) {
        m.style.transition = 'transform .18s ease-out'; m.style.transform = 'translateX(100%)';
        setTimeout(() => { S.navBack = true; if (history.length > 1) history.back(); else go('programas'); }, 180);
      } else {
        m.style.transition = 'transform .2s ease-out'; m.style.transform = '';
        setTimeout(() => { m.style.transition = ''; }, 220);
      }
    };
    document.addEventListener('touchend', end, { passive: true });
    document.addEventListener('touchcancel', end, { passive: true });
  })();

  // Sin zoom accidental: pellizco y doble toque (igual que en Caudal).
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
  const sheetHead = t => `<div class="sheet-head"><h2>${esc(t)}</h2><button type="button" class="icon-btn" data-act="close" aria-label="Cerrar">${ICON.close}</button></div>`;
  const fld = (label, inner, show) => `<div class="field"${show ? ` data-show="${show}"` : ''}><label>${label}</label>${inner}</div>`;
  const inp = (name, val, attrs = '') => `<input class="input" name="${name}" value="${esc(val ?? '')}" ${attrs}>`;
  const seg = (name, list, val) => `<input type="hidden" name="${name}" value="${esc(val)}"><div class="seg">${list.map(([v, l]) =>
    `<button type="button" class="${v === val ? 'on' : ''}" data-act="seg" data-name="${name}" data-v="${v}">${l}</button>`).join('')}</div>`;
  function applyShow(form, val) {
    form.querySelectorAll('[data-show]').forEach(el => { el.hidden = !el.dataset.show.split(' ').includes(val); });
  }

  function formPrograma(p) {
    const nuevo = !p; p = p || {};
    const rutas = [...S.data.rutas].sort((a, b) => a.orden - b.orden);
    const mods = [...S.data.modulos].sort((a, b) => a.orden - b.orden);
    const ents = [...S.data.entidades].sort((a, b) => a.nombre.localeCompare(b.nombre));
    modal(`<form data-form="programa" data-id="${p.id || ''}">
      ${sheetHead(nuevo ? 'Nuevo programa' : 'Editar programa')}
      ${fld('Nombre del programa', inp('nombre', p.nombre, 'required autofocus placeholder="Ej.: Curso Accesos Vasculares Seguros"'))}
      <div class="two">${fld('Nombre corto', inp('nombre_corto', p.nombre_corto, 'placeholder="Ej.: Solventum AV"'))}
        ${fld('Tipo', `<select class="input" name="tipo">${opts(TIPOS, p.tipo, 'Elegir…')}</select>`)}</div>
      ${fld('Entidad', `<select class="input" name="entidad_id">${opts(ents.map(e => [e.id, e.nombre]), p.entidad_id, 'Sin entidad / nueva abajo')}</select>
        <div class="two" style="margin-top:6px">${inp('nueva_entidad', '', 'placeholder="Entidad nueva"')}<select class="input" name="tipo_entidad">${opts(TIPOS_ENT, '', 'Tipo de entidad')}</select></div>`)}
      ${nuevo ? fld('Ruta base', `<div class="choice">${rutas.map((r, i) => `<label><input type="radio" name="ruta_id" value="${r.id}" ${i === 0 ? 'checked' : ''}><div><b>${esc(r.nombre)}</b><div class="small muted">${esc(r.descripcion || '')}</div></div></label>`).join('')}</div>`)
        : `<p class="small muted">Ruta: <b>${esc(rutaDe(p)?.nombre || '')}</b> (no se puede cambiar).</p>`}
      ${fld('Módulos', `<div class="choice">${mods.map(m => `<label><input type="checkbox" name="modulos" value="${m.id}" ${(p.modulos || []).includes(m.id) ? 'checked' : ''}><div><b>${esc(m.nombre)}</b><div class="small muted">${esc(m.descripcion || '')}</div></div></label>`).join('')}</div>`)}
      <div class="two">${fld('Facultad', `<select class="input" name="facultad">${opts(FACULTADES, p.facultad, 'Elegir…')}</select>`)}
        ${fld('Modalidad', `<select class="input" name="modalidad">${opts(MODALIDADES, p.modalidad, 'Elegir…')}</select>`)}</div>
      <div class="two">${fld('Fecha de inicio', inp('fecha_inicio', p.fecha_inicio, 'type="date"'))}${fld('Fecha de fin', inp('fecha_fin', p.fecha_fin, 'type="date"'))}</div>
      <div class="two">${fld('Participantes', inp('participantes', p.participantes, 'type="number" min="0" inputmode="numeric"'))}${fld('Valor total (COP)', inp('valor_total', p.valor_total, 'inputmode="numeric" placeholder="18000000"'))}</div>
      ${nuevo ? '<p class="tiny muted">Con la fecha de inicio la app calcula las fechas límite de los pasos. Si aún no la tienes, agrégala después y usa “Recalcular fechas”.</p>' : `
      <div class="two">${fld('Director académico', inp('director', p.director))}${fld('Horas', inp('horas', p.horas, 'type="number" min="0" step="any"'))}</div>
      <div class="two">${fld('Valor por persona', inp('valor_persona', p.valor_persona, 'inputmode="numeric"'))}${fld('Margen de contribución (%)', inp('margen', p.margen, 'type="number" step="any"'))}</div>
      ${fld('Prioridad', `<select class="input" name="prioridad">${opts([['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja']], p.prioridad || 'media')}</select>`)}
      ${fld('Notas', `<textarea class="input" name="notas" rows="3">${esc(p.notas || '')}</textarea>`)}`}
      <div class="sheet-actions">
        ${nuevo ? '' : `<button type="button" class="btn danger left" data-act="del-prog" data-id="${p.id}">Eliminar</button>`}
        <button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">${nuevo ? 'Crear programa' : 'Guardar'}</button>
      </div></form>`);
  }

  function formItem(i) {
    const p = byId('programas', i.programa_id);
    modal(`<form data-form="item" data-id="${i.id}">
      ${sheetHead('Paso')}
      ${p ? `<p class="small muted" style="margin-top:-6px"><a href="#/programa/${p.id}">${esc(p.nombre)}</a></p>` : ''}
      ${fld('Título', inp('titulo', i.titulo, 'required'))}
      ${fld('Estado', seg('estado', Object.entries(ESTADOS_ITEM), i.estado))}
      <div class="two">${fld('Fase', `<select class="input" name="fase">${opts(p ? fasesDe(p) : [i.fase], i.fase)}</select>`)}
        ${fld('Responsable', `<select class="input" name="responsable">${opts(ACTORES.includes(i.responsable) || !i.responsable ? ACTORES : [...ACTORES, i.responsable], i.responsable || 'Yo')}</select>`)}</div>
      <div class="two">${fld('Esperando a', `<select class="input" name="esperando_a">${opts(ACTORES.filter(a => a !== 'Yo'), i.esperando_a || 'Cliente')}</select>`, 'esperando')}
        ${fld('Fecha de seguimiento', inp('fecha_seguimiento', i.fecha_seguimiento || addDays(today(), 3), 'type="date"'), 'esperando')}</div>
      ${fld('Fecha límite', inp('fecha_limite', i.fecha_limite, 'type="date"'))}
      ${fld('Enlace de evidencia (OneDrive, correo, SharePoint)', inp('enlace', i.enlace, 'type="url" placeholder="https://"'))}
      ${fld('Nota', `<textarea class="input" name="nota" rows="3">${esc(i.nota || '')}</textarea>`)}
      <label class="small row"><input type="checkbox" name="esencial" ${i.esencial ? 'checked' : ''}> Esencial (define la fase actual y el semáforo)</label>
      <div class="sheet-actions"><button type="button" class="btn danger left" data-act="del-item" data-id="${i.id}">Eliminar</button>
        <button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div>
    </form>`);
    applyShow($('#modal-root form'), i.estado);
  }

  function formCaptura() {
    const activos = S.data.programas.filter(p => p.estado === 'activo').sort((a, b) => nombreProg(a).localeCompare(nombreProg(b)));
    if (!activos.length) return formPrograma();
    const actual = S.view.name === 'programa' ? S.view.id : '';
    modal(`<form data-form="captura">
      ${sheetHead('Captura rápida')}
      ${fld('Programa', `<select class="input" name="programa_id" required>${opts(activos.map(p => [p.id, nombreProg(p)]), actual, actual ? undefined : 'Elegir…')}</select>`)}
      ${fld('Qué es', seg('tipo', [['nota', 'Nota'], ['tarea', 'Tarea'], ['esperando', 'Esperando a']], 'tarea'))}
      ${fld('Texto', `<textarea class="input" name="texto" rows="3" required autofocus placeholder="Ej.: Pedir certificación bancaria a facturación"></textarea>`)}
      ${fld('Fecha límite', inp('fecha_limite', '', 'type="date"'), 'tarea')}
      <div class="two">${fld('Esperando a', `<select class="input" name="esperando_a">${opts(ACTORES.filter(a => a !== 'Yo'), 'Cliente')}</select>`, 'esperando')}
        ${fld('Hacer seguimiento el', inp('fecha_seguimiento', addDays(today(), 3), 'type="date"'), 'esperando')}</div>
      <p class="tiny muted" data-show="tarea esperando">Se agrega a la fase actual del programa como paso opcional.</p>
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div>
    </form>`);
    applyShow($('#modal-root form'), 'tarea');
  }

  function formDoc(pid) {
    modal(`<form data-form="doc" data-pid="${pid}">${sheetHead('Documento')}
      <div class="two">${fld('Tipo', `<select class="input" name="tipo">${opts(TIPOS_DOC, 'Propuesta')}</select>`)}${fld('Versión', inp('version', '', 'placeholder="2"'))}</div>
      ${fld('Nombre', inp('nombre', '', 'autofocus placeholder="Ej.: Propuesta Solventum v2"'))}
      ${fld('Enlace', inp('enlace', '', 'type="url" required placeholder="https://"'))}
      ${fld('Fecha', inp('fecha', today(), 'type="date"'))}
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>`);
  }
  function formContacto(c, eid) {
    c = c || {};
    modal(`<form data-form="contacto" data-id="${c.id || ''}" data-eid="${c.entidad_id || eid}">${sheetHead('Contacto')}
      ${fld('Nombre', inp('nombre', c.nombre, 'required autofocus'))}
      <div class="two">${fld('Cargo', inp('cargo', c.cargo))}${fld('Rol', `<select class="input" name="rol">${opts(ROLES, c.rol, 'Elegir…')}</select>`)}</div>
      <div class="two">${fld('Correo', inp('correo', c.correo, 'type="email"'))}${fld('Teléfono', inp('telefono', c.telefono, 'type="tel"'))}</div>
      <div class="sheet-actions">${c.id ? `<button type="button" class="btn danger left" data-act="del" data-t="contactos" data-id="${c.id}">Eliminar</button>` : ''}
        <button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>`);
  }
  function formEntidad(e) {
    modal(`<form data-form="entidad" data-id="${e.id}">${sheetHead('Entidad')}
      ${fld('Nombre', inp('nombre', e.nombre, 'required'))}
      <div class="two">${fld('Tipo', `<select class="input" name="tipo">${opts(TIPOS_ENT, e.tipo, 'Elegir…')}</select>`)}${fld('Convenio vigente hasta', inp('convenio_hasta', e.convenio_hasta, 'type="date"'))}</div>
      ${fld('Notas', `<textarea class="input" name="notas" rows="3">${esc(e.notas || '')}</textarea>`)}
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>`);
  }
  function formFactura(f, pid) {
    f = f || { estado_pago: 'pendiente' };
    modal(`<form data-form="factura" data-id="${f.id || ''}" data-pid="${f.programa_id || pid}">${sheetHead('Facturación')}
      ${fld('Concepto', inp('concepto', f.concepto, 'required autofocus placeholder="Ej.: Factura 1 de 2, 50%"'))}
      <div class="two">${fld('Valor (COP)', inp('valor', f.valor, 'inputmode="numeric"'))}${fld('Estado', `<select class="input" name="estado_pago">${opts([['pendiente', 'Pendiente'], ['facturado', 'Facturado'], ['pagado', 'Pagado']], f.estado_pago)}</select>`)}</div>
      <div class="two">${fld('Fecha de factura', inp('fecha_factura', f.fecha_factura, 'type="date"'))}${fld('Fecha de pago', inp('fecha_pago', f.fecha_pago, 'type="date"'))}</div>
      <div class="sheet-actions">${f.id ? `<button type="button" class="btn danger left" data-act="del" data-t="facturacion" data-id="${f.id}">Eliminar</button>` : ''}
        <button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>`);
  }
  function formPerdido(p) {
    modal(`<form data-form="perdido" data-id="${p.id}">${sheetHead('Programa perdido')}
      ${fld('¿Por qué no se cerró?', `<textarea class="input" name="motivo_perdida" rows="3" required autofocus placeholder="Ej.: Precio por encima del presupuesto del cliente">${esc(p.motivo_perdida || '')}</textarea>`)}
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>`);
  }
  function menuMas() {
    modal(`${sheetHead('Más opciones')}
      <div class="stack">
        <button class="btn" style="width:100%" data-act="export-csv">Exportar programas (CSV para el Cuadro Maestro)</button>
        <button class="btn" style="width:100%" data-act="export-json">Descargar respaldo completo (JSON)</button>
        <label class="btn" style="width:100%;display:block;text-align:center">Importar respaldo (JSON)<input type="file" accept="application/json,.json" data-change="import" hidden></label>
        ${S.mode === 'remote' ? `<p class="small muted">Sesión: ${esc(S.user?.email || '')}</p><button class="btn danger" style="width:100%" data-act="logout">Cerrar sesión</button>`
          : '<p class="small muted">Modo local. Para sincronizar entre el celular y el PC, completa config.js con los datos de Supabase.</p>'}
      </div>`);
  }

  // ───────────── Exportar / importar ─────────────
  function exportCSV() {
    const cols = ['Programa', 'Nombre corto', 'Entidad', 'Ruta', 'Tipo', 'Facultad', 'Director', 'Modalidad', 'Horas', 'Participantes', 'Valor total', 'Valor por persona', 'Margen %', 'Fecha inicio', 'Fecha fin', 'Estado', 'Fase actual', 'Avance %'];
    const rows = S.data.programas.map(p => [p.nombre, p.nombre_corto, entidadDe(p)?.nombre, rutaDe(p)?.nombre, p.tipo, p.facultad, p.director, p.modalidad, p.horas, p.participantes,
      p.valor_total, p.valor_persona, p.margen, p.fecha_inicio, p.fecha_fin, ESTADOS_PROG[p.estado], faseActual(p), avance(p).pct]);
    const cell = v => { const s = String(v ?? ''); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    download(`rumbo-programas-${today()}.csv`, '﻿' + [cols, ...rows].map(r => r.map(cell).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
  }
  async function importJSON(file) {
    const data = JSON.parse(await file.text());
    const map = {};
    let n = 0;
    for (const t of TABLES) {
      const incoming = data[t] || [];
      const have = new Set(S.data[t].map(r => r.id));
      const rows = [];
      for (const r0 of incoming) {
        const r = { ...r0 };
        if (t === 'rutas' || t === 'modulos') {
          const ex = S.data[t].find(x => x.clave === r.clave);
          if (ex) { map[r.id] = ex.id; continue; }
        }
        if (t === 'plantilla_items' && ((r.ruta_id && map[r.ruta_id]) || (r.modulo_id && map[r.modulo_id]))) continue;
        if (r.ruta_id && map[r.ruta_id]) r.ruta_id = map[r.ruta_id];
        if (t === 'programas' && Array.isArray(r.modulos)) r.modulos = r.modulos.map(m => map[m] || m);
        if (!have.has(r.id)) rows.push(r);
      }
      if (rows.length) { await db.insert(t, rows); n += rows.length; }
    }
    closeModal(); render(); toast(`Respaldo importado: ${n} registros`);
  }

  // ───────────── Acciones ─────────────
  const ACT = {
    noop() {},
    nav: el => go(el.dataset.to),
    open: el => go('programa', el.dataset.id),
    tab(el) { S.view.tab = el.dataset.tab; history.replaceState(null, '', `#/programa/${S.view.id}/${S.view.tab}`); render(); },
    menu: menuMas,
    captura: formCaptura,
    nuevo: () => formPrograma(),
    close: closeModal,
    backdrop(el, e) { if (e.target === el) closeModal(); },
    'f-estado'(el) { S.f.estado = el.dataset.v; render(); },
    fold(el) {
      const k = el.dataset.key, p = byId('programas', S.view.id);
      const its = itemsDe(p.id).filter(i => i.fase === k.split('|')[1]);
      const def = its.length > 0 && its.every(i => !abierto(i)) && k.split('|')[1] !== faseActual(p);
      S.collapsed[k] = !(S.collapsed[k] ?? def); render();
    },
    seg(el) {
      const form = el.closest('form');
      form.querySelector(`input[name="${el.dataset.name}"]`).value = el.dataset.v;
      el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
      applyShow(form, el.dataset.v);
    },
    'edit-item': el => { const i = byId('items', el.dataset.id); if (i) formItem(i); },
    'edit-prog': el => formPrograma(byId('programas', el.dataset.id)),
    'edit-ent': el => formEntidad(byId('entidades', el.dataset.id)),
    'edit-contacto': el => formContacto(byId('contactos', el.dataset.id)),
    'edit-factura': el => formFactura(byId('facturacion', el.dataset.id)),
    'add-doc': el => formDoc(el.dataset.pid),
    'add-contacto': el => formContacto(null, el.dataset.eid),
    'add-factura': el => formFactura(null, el.dataset.pid),
    async toggle(el) {
      const i = byId('items', el.dataset.id);
      const patch = abierto(i) ? { estado: 'hecho', fecha_hecho: today() } : { estado: 'pendiente', fecha_hecho: null };
      await db.update('items', i.id, patch); await touch(i.programa_id);
      render(); toast(patch.estado === 'hecho' ? 'Hecho' : 'Reabierto');
    },
    async 'del-item'(el) {
      const i = byId('items', el.dataset.id);
      if (!confirm('¿Eliminar este paso? Si solo no aplica, márcalo como "No aplica".')) return;
      await db.remove('items', i.id); await touch(i.programa_id); closeModal(); render();
    },
    async del(el) {
      if (!confirm('¿Eliminar este registro?')) return;
      await db.remove(el.dataset.t, el.dataset.id); closeModal(); render();
    },
    async 'del-prog'(el) {
      if (!confirm('¿Eliminar el programa con todos sus pasos, bitácora y documentos? Esto no se puede deshacer. Si se perdió, mejor márcalo como "Perdido".')) return;
      await db.remove('programas', el.dataset.id); closeModal(); go('programas');
    },
    async recalc(el) {
      const p = byId('programas', el.dataset.id);
      if (!p.fecha_inicio) { toast('Primero define la fecha de inicio'); return formPrograma(p); }
      const n = await recalcular(p);
      render(); toast(n ? `${n} fechas actualizadas` : 'No había fechas por recalcular');
    },
    'export-csv': exportCSV,
    'export-json': () => download(`rumbo-respaldo-${today()}.json`, JSON.stringify(S.data, null, 1), 'application/json'),
    async logout() { await sb.auth.signOut(); S.user = null; S.data = Object.fromEntries(TABLES.map(t => [t, []])); closeModal(); render(); },
  };

  async function entrar(user) {
    S.user = user; S.ready = false; render();
    await loadRemote(); await seedIfEmpty(); S.ready = true; render();
  }
  ACT.signup = async el => {
    const f = el.closest('form'), msg = $('#login-msg');
    const email = f.email.value.trim(), password = f.password.value;
    if (!email || password.length < 8) { msg.textContent = 'Escribe tu correo y una contraseña de al menos 8 caracteres.'; return; }
    msg.textContent = 'Creando tu cuenta…';
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) { msg.textContent = /registro cerrado|database error/i.test(error.message) ? 'El registro está cerrado para este correo.' : /already|registered/i.test(error.message) ? 'Ya tienes cuenta: usa Entrar.' : error.message; return; }
    if (data.session) return entrar(data.user);
    const r = await sb.auth.signInWithPassword({ email, password });
    if (r.error) { msg.textContent = 'Cuenta creada. Ahora usa Entrar.'; return; }
    await entrar(r.data.user);
  };

  async function recalcular(p) {
    let n = 0;
    for (const i of itemsDe(p.id).filter(i => abierto(i) && i.dias_ref)) {
      const f = calcFecha(p, i.dias_ref, i.dias_rel);
      if (f && f !== i.fecha_limite) { await db.update('items', i.id, { fecha_limite: f }); n++; }
    }
    return n;
  }

  // ───────────── Formularios ─────────────
  const FORMS = {
    async login(d) {
      const msg = $('#login-msg'); msg.textContent = '';
      const { data, error } = await sb.auth.signInWithPassword({ email: d.email.trim(), password: d.password });
      if (error) { msg.textContent = /invalid/i.test(error.message) ? 'Correo o contraseña incorrectos. Si es tu primera vez, usa "crear mi cuenta".' : 'No se pudo entrar: ' + error.message; return; }
      await entrar(data.user);
    },
    async programa(d, f) {
      const id = f.dataset.id, mods = new FormData(f).getAll('modulos');
      let entidad_id = d.entidad_id || null;
      if (d.nueva_entidad && d.nueva_entidad.trim()) {
        const e = await db.insert('entidades', clean({ nombre: d.nueva_entidad, tipo: d.tipo_entidad }));
        entidad_id = e.id;
      }
      const row = clean({
        nombre: d.nombre, nombre_corto: d.nombre_corto, tipo: d.tipo, facultad: d.facultad, modalidad: d.modalidad,
        fecha_inicio: d.fecha_inicio, fecha_fin: d.fecha_fin, participantes: d.participantes, valor_total: d.valor_total,
        director: d.director, horas: d.horas, valor_persona: d.valor_persona, margen: d.margen, prioridad: d.prioridad, notas: d.notas,
      });
      row.entidad_id = entidad_id; row.modulos = mods; row.actualizado = nowIso();
      if (row.valor_total && row.participantes && !row.valor_persona) row.valor_persona = Math.round(row.valor_total / row.participantes);
      if (!id) {
        if (!d.ruta_id) { toast('Elige una ruta'); return; }
        Object.assign(row, { ruta_id: d.ruta_id, estado: 'activo', prioridad: row.prioridad || 'media' });
        const p = await db.insert('programas', row);
        await db.insert('items', generarItems(p, mods, true));
        await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Nota', resumen: 'Programa creado en Rumbo.', proxima_accion: null });
        closeModal(); go('programa', p.id); toast('Programa creado');
      } else {
        const p = byId('programas', id);
        const antes = { ini: p.fecha_inicio, fin: p.fecha_fin, mods: p.modulos || [] };
        await db.update('programas', id, row);
        const nuevos = mods.filter(m => !antes.mods.includes(m));
        if (nuevos.length) await db.insert('items', generarItems(p, nuevos, false));
        let n = 0;
        if ((antes.ini !== p.fecha_inicio || antes.fin !== p.fecha_fin) && itemsDe(id).some(i => abierto(i) && i.dias_ref) &&
            confirm('Cambiaron las fechas del programa. ¿Recalcular las fechas límite de los pasos pendientes?')) n = await recalcular(p);
        closeModal(); render();
        toast(nuevos.length ? `Guardado. Se agregaron los pasos de ${nuevos.length} módulo(s)` : n ? `Guardado. ${n} fechas recalculadas` : 'Guardado');
      }
    },
    async item(d, f) {
      const i = byId('items', f.dataset.id);
      const patch = clean({ titulo: d.titulo, estado: d.estado, fase: d.fase, responsable: d.responsable, fecha_limite: d.fecha_limite, enlace: d.enlace, nota: d.nota });
      patch.esencial = d.esencial === 'on';
      if (d.estado === 'esperando') Object.assign(patch, clean({ esperando_a: d.esperando_a, fecha_seguimiento: d.fecha_seguimiento }));
      else Object.assign(patch, { esperando_a: null, fecha_seguimiento: null });
      if (d.estado === 'hecho' && i.estado !== 'hecho') patch.fecha_hecho = today();
      if (d.estado !== 'hecho') patch.fecha_hecho = null;
      await db.update('items', i.id, patch); await touch(i.programa_id); closeModal(); render();
    },
    async 'add-item'(d, f) {
      if (!d.titulo || !d.titulo.trim()) return;
      const pid = f.dataset.pid, fase = f.dataset.fase;
      const orden = Math.max(0, ...itemsDe(pid).filter(i => i.fase === fase).map(i => i.orden || 0)) + 1;
      await db.insert('items', { programa_id: pid, fase, orden, titulo: d.titulo.trim(), estado: 'pendiente', responsable: 'Yo', esencial: true,
        esperando_a: null, fecha_limite: null, fecha_seguimiento: null, fecha_hecho: null, enlace: null, nota: null, dias_ref: null, dias_rel: null });
      await touch(pid); render();
      const again = document.querySelector(`form[data-form="add-item"][data-fase="${CSS.escape(fase)}"] input`);
      if (again) again.focus();
    },
    async captura(d) {
      const p = byId('programas', d.programa_id);
      if (!p) { toast('Elige un programa'); return; }
      if (d.tipo === 'nota') {
        await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Nota', resumen: d.texto.trim(), proxima_accion: null });
      } else {
        const fa = faseActual(p), fs = fasesDe(p);
        const fase = fs.includes(fa) ? fa : (fs[fs.length - 1] || 'General');
        const esp = d.tipo === 'esperando';
        await db.insert('items', clean({ programa_id: p.id, fase, orden: 900, titulo: d.texto, estado: esp ? 'esperando' : 'pendiente', responsable: 'Yo',
          esperando_a: esp ? d.esperando_a : null, fecha_seguimiento: esp ? d.fecha_seguimiento : null, fecha_limite: esp ? null : d.fecha_limite,
          fecha_hecho: null, enlace: null, nota: null, esencial: false, dias_ref: null, dias_rel: null }));
      }
      await touch(p.id); closeModal(); render(); toast('Guardado en ' + nombreProg(p));
    },
    async bitacora(d, f) {
      const pid = f.dataset.pid;
      await db.insert('bitacora', clean({ programa_id: pid, fecha: d.fecha || today(), tipo: d.tipo, resumen: d.resumen, proxima_accion: d.proxima_accion }));
      await touch(pid); render(); toast('Registrado');
    },
    async doc(d, f) {
      await db.insert('documentos', clean({ programa_id: f.dataset.pid, tipo: d.tipo, nombre: d.nombre, version: d.version, enlace: d.enlace, fecha: d.fecha }));
      await touch(f.dataset.pid); closeModal(); render();
    },
    async contacto(d, f) {
      const row = clean({ nombre: d.nombre, cargo: d.cargo, rol: d.rol, correo: d.correo, telefono: d.telefono });
      if (f.dataset.id) await db.update('contactos', f.dataset.id, row);
      else await db.insert('contactos', { ...row, entidad_id: f.dataset.eid });
      closeModal(); render();
    },
    async entidad(d, f) {
      await db.update('entidades', f.dataset.id, clean({ nombre: d.nombre, tipo: d.tipo, convenio_hasta: d.convenio_hasta, notas: d.notas }));
      closeModal(); render();
    },
    async factura(d, f) {
      const row = clean({ concepto: d.concepto, valor: d.valor, estado_pago: d.estado_pago, fecha_factura: d.fecha_factura, fecha_pago: d.fecha_pago });
      if (f.dataset.id) await db.update('facturacion', f.dataset.id, row);
      else await db.insert('facturacion', { ...row, programa_id: f.dataset.pid });
      await touch(f.dataset.pid); closeModal(); render();
    },
    async perdido(d, f) {
      await db.update('programas', f.dataset.id, { estado: 'perdido', motivo_perdida: d.motivo_perdida.trim(), actualizado: nowIso() });
      closeModal(); render();
    },
  };

  const CHANGE = {
    'f-ruta'(el) { S.f.ruta = el.value; render(); },
    'hide-done'(el) { S.hideDone = el.checked; render(); },
    async 'prog-estado'(el) {
      const p = byId('programas', el.dataset.id);
      if (el.value === 'perdido') { el.value = p.estado; return formPerdido(p); }
      await db.update('programas', p.id, { estado: el.value, actualizado: nowIso() }); render();
    },
    async import(el) { if (el.files[0]) await importJSON(el.files[0]); },
  };

  // ───────────── Eventos ─────────────
  const safe = fn => async (...a) => { try { await fn(...a); } catch (err) { fail(err); } };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACT[el.dataset.act];
    if (!fn) return;
    if (el.tagName === 'BUTTON' || el.dataset.act !== 'noop') e.stopPropagation();
    safe(fn)(el, e);
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    const btn = f.querySelector('button.primary, button:not([type])');
    if (btn) btn.disabled = true;
    safe(FORMS[f.dataset.form])(Object.fromEntries(new FormData(f)), f).finally(() => { if (btn && btn.isConnected) btn.disabled = false; });
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-change]');
    if (el && CHANGE[el.dataset.change]) safe(CHANGE[el.dataset.change])(el, e);
  });
  document.addEventListener('input', e => {
    if (e.target.dataset.input === 'buscar') { S.f.q = e.target.value; const l = $('#prog-list'); if (l) l.innerHTML = listaProgramas(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ───────────── Arranque ─────────────
  async function start() {
    routeFromHash(); render();
    try {
      if (CFG.supabaseUrl && CFG.supabaseKey) {
        if (!window.supabase) throw new Error('No cargó la librería de Supabase. Revisa la conexión a internet.');
        S.mode = 'remote';
        sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'sb-jrgmesjmhtfvmwocaojl-auth-token' },
        });
        let { data: { session } } = await sb.auth.getSession();
        if (!session) {
          // Hay un token guardado pero no se pudo restaurar (p. ej. la app estuvo cerrada mucho tiempo): reintenta con el token de renovación.
          let guardado = null;
          try { guardado = localStorage.getItem('sb-jrgmesjmhtfvmwocaojl-auth-token'); } catch (e) { /* sin almacenamiento */ }
          if (guardado) { const r = await sb.auth.refreshSession(); session = r.data?.session || null; }
        }
        S.user = session?.user || null;
        sb.auth.onAuthStateChange((evento, s) => {
          if (evento === 'SIGNED_OUT') { S.user = null; render(); }
          else if (s?.user) S.user = s.user;
        });
        // Al volver a la app (celular en segundo plano), renueva la sesión si hace falta.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') { sb.auth.startAutoRefresh(); sb.auth.getSession(); }
          else sb.auth.stopAutoRefresh();
        });
        if (S.user) { await loadRemote(); await seedIfEmpty(); }
      } else {
        S.mode = 'local';
        S.data = Local.load();
        await seedIfEmpty();
      }
      S.ready = true;
    } catch (err) {
      console.error(err);
      S.error = err.message || String(err);
    }
    render();
  }
  start();
})();
