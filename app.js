'use strict';
(function () {
  // ───────────── Constantes ─────────────
  const CFG = window.RUMBO_CONFIG || {};
  const TABLES = ['rutas', 'modulos', 'plantilla_items', 'entidades', 'contactos', 'programas', 'items', 'bitacora', 'documentos', 'facturacion', 'sesiones_cierre'];
  const ESTADOS_ITEM = { pendiente: 'Pendiente', en_curso: 'En curso', esperando: 'Esperando', hecho: 'Hecho', no_aplica: 'No aplica' };
  const ESTADOS_PROG = { activo: 'Activo', pausa: 'En pausa', cerrado: 'Cerrado', perdido: 'Perdido' };
  // Responsables por cargo (nunca nombres propios)
  const ACTORES = ['Yo', 'Asistente administrativa', 'Auxiliar administrativa', 'Director del programa', 'Gestor de facultad', 'Gestor de comunicaciones', 'Presupuestos', 'Finanzas', 'DIDE', 'Gerente administrativo', 'Secretaría de la división', 'Cliente', 'Proveedor', 'Docente', 'Financiera', 'Facultad', 'Jurídica', 'Dirección EC'];
  const TIPOS = ['Curso', 'Diplomado', 'Seminario', 'Taller', 'Congreso', 'Jornada', 'Simposio', 'Foro', 'Microcredencial', 'Rotación', 'Certificación', 'Aval'];
  const FACULTADES = ['Enfermería', 'Medicina', 'Odontología', 'Psicología', 'Ciencias Económicas y Administrativas', 'Ingeniería', 'Educación', 'Otra'];
  const MODALIDADES = ['Virtual sincrónica', 'Virtual asincrónica', 'Presencial', 'Híbrida'];
  const TIPOS_BIT = ['Nota', 'Correo', 'Reunión', 'Llamada', 'Decisión'];
  const TIPOS_DOC = ['Propuesta', 'Presupuesto', 'Carta / OC', 'Acta', 'Aval', 'Cronograma', 'Informe', 'Factura', 'Otro'];
  const TIPOS_ENT = ['Farmacéutica', 'Dispositivos médicos', 'IPS / Clínica', 'Sociedad científica', 'Caja de compensación', 'Universidad', 'Entidad pública', 'Otra'];
  const ROLES = ['Decisor', 'Operativo', 'Facturación', 'Académico'];
  const MONEY = ['valor_total', 'valor_persona', 'valor', 'ingresos'];
  const NUMS = ['horas', 'participantes', 'margen', 'porcentaje_aval'];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const LS_KEY = 'rumbo-datos-v1';
  const PUSH_PUB = 'BER3W2HDUB16BCx6dLPIRmEdxPjj8elhZyUornIHZG-ghd63drn0yYYC3LTQXqr9_jIZ5FVCteC3GstvoonQXDk';
  // Cuadro Maestro (hoja BD): valores fijos de la línea y listas cerradas
  const GESTOR = 'Yeferson Vargas González', LINEA = 'Salud y Farma';
  const ESTADOS_CM = ['Proyección', 'Negociación', 'Iniciado', 'Ejecutado', 'Aplazado', 'Cancelado'];
  const CM_A_ESTADO = { 'Proyección': 'activo', 'Negociación': 'activo', 'Iniciado': 'activo', 'Ejecutado': 'cerrado', 'Aplazado': 'activo', 'Cancelado': 'perdido' };
  const TIPOS_CM = [['1', 'Curso'], ['2', 'Taller'], ['3', 'Diplomado'], ['4', 'Seminario / congreso'], ['5', 'Otro']];
  const TIPO_CM_LARGO = { 1: 'Cursos y cursos especializados (certificaciones)', 2: 'Talleres', 3: 'Diplomados', 4: 'Seminarios, congresos o simposios', 5: 'Otro' };
  const PLATAFORMAS = ['Moodle El Bosque', 'Plataforma del cliente', 'Zoom', 'Teams', 'Presencial', 'Otra'];
  const MESES_CM = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const BUILD = '20261021001424';

  const S = {
    data: Object.fromEntries(TABLES.map(t => [t, []])),
    mode: 'local', user: null, ready: false, error: null,
    view: { name: 'inicio' },
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
  // Hora: 'HH:MM' para mostrar en 12 h; recordatorios en hora de Colombia
  const fmtHora = h => { if (!h) return ''; const [H, M] = h.slice(0, 5).split(':').map(Number); return `${((H + 11) % 12) + 1}:${pad(M)} ${H < 12 ? 'a. m.' : 'p. m.'}`; };
  const aRecordar = (fecha, hora) => fecha && hora ? `${fecha}T${hora.slice(0, 5)}:00-05:00` : null;
  const localDT = ts => { if (!ts) return ''; const d = new Date(ts); return `${isoOf(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const fmtRecordar = ts => { if (!ts) return ''; const d = new Date(ts), f = isoOf(d); return `${relDate(f)}, ${fmtHora(pad(d.getHours()) + ':' + pad(d.getMinutes()))}`; };
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

  // Carga las plantillas la primera vez y las reemplaza cuando sube la versión (los programas creados no cambian).
  async function seedIfEmpty() {
    const P = window.PLANTILLAS;
    if (!P) return;
    const ver = P.version || 1;
    if (S.data.rutas.length && Math.min(...S.data.rutas.map(r => r.version || 1)) >= ver) return;
    const items = [];
    const row = (it, orden, ids) => Array.isArray(it)
      ? { ...ids, fase: it[0], titulo: it[1], responsable: it[2], dias_ref: it[3], dias_rel: it[4], esencial: it[5], orden }
      : { ...ids, fase: it.f, titulo: it.t, responsable: it.r, dias_ref: it.ref, dias_rel: it.d, esencial: it.e, orden, condicion: it.c, repetir: it.rep, avisar: it.av, clave: it.k };
    const rutas = P.rutas.map(r => {
      const ex = S.data.rutas.find(x => x.clave === r.clave);
      return { id: ex ? ex.id : uid(), clave: r.clave, nombre: r.nombre, descripcion: r.descripcion, fases: r.fases, orden: r.orden, activa: true, version: ver, _ex: !!ex };
    });
    const mods = P.modulos.map(m => {
      const ex = S.data.modulos.find(x => x.clave === m.clave);
      return { id: ex ? ex.id : uid(), clave: m.clave, nombre: m.nombre, descripcion: m.descripcion, orden: m.orden, activa: true, _ex: !!ex };
    });
    P.rutas.forEach((r, i) => r.items.forEach((it, j) => items.push(row(it, j, { ruta_id: rutas[i].id, modulo_id: null }))));
    P.modulos.forEach((m, i) => m.items.forEach((it, j) => items.push(row(it, j, { ruta_id: null, modulo_id: mods[i].id }))));
    // Reemplazar los pasos de plantilla
    if (S.data.plantilla_items.length) {
      if (S.mode === 'remote') { const { error } = await sb.from('plantilla_items').delete().not('id', 'is', null); if (error) throw error; }
      S.data.plantilla_items = []; persist();
    }
    for (const r of rutas) {
      const { _ex, ...v } = r;
      if (_ex) await db.update('rutas', r.id, { nombre: v.nombre, descripcion: v.descripcion, fases: v.fases, orden: v.orden, version: v.version });
      else await db.insert('rutas', v);
    }
    for (const m of mods) {
      const { _ex, ...v } = m;
      if (_ex) await db.update('modulos', m.id, { nombre: v.nombre, descripcion: v.descripcion, orden: v.orden });
      else await db.insert('modulos', v);
    }
    await db.insert('plantilla_items', items);
  }

  // ───────────── Dominio ─────────────
  const byId = (t, id) => S.data[t].find(r => r.id === id);
  const rutaDe = p => byId('rutas', p.ruta_id);
  const itemsDe = pid => S.data.items.filter(i => i.programa_id === pid);
  const abierto = i => i.estado !== 'hecho' && i.estado !== 'no_aplica';
  const nombreProg = p => p ? (p.nombre_corto || p.nombre) : '';
  const entidadDe = p => p && p.entidad_id ? byId('entidades', p.entidad_id) : null;
  const empresaTxt = p => rutaDe(p)?.clave === 'abierta' ? 'Oferta abierta' : (entidadDe(p)?.nombre || 'Sin entidad');

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

  // ── Cuadro Maestro: lo que se calcula solo ──
  const claveRuta = p => rutaDe(p)?.clave || 'cerrado';
  const esAbierta = p => claveRuta(p) === 'abierta';
  const esAval = p => claveRuta(p) === 'aval';
  const tipoLabel = p => (TIPOS_CM.find(t => t[0] === String(p.tipo_programa)) || [])[1] || '';
  function ingresosCM(p) {
    if (p.ingresos !== null && p.ingresos !== undefined && p.ingresos !== '') return Number(p.ingresos);
    if (esAval(p)) return p.valor_total ? Math.round(Number(p.valor_total) * (Number(p.porcentaje_aval ?? 15) || 15) / 100) : 0;
    if (esAbierta(p)) return (Number(p.valor_persona) || 0) * (Number(p.participantes) || 0);
    return Number(p.valor_total) || 0;
  }
  const facturadoCM = p => S.data.facturacion.filter(f => f.programa_id === p.id && f.estado_pago !== 'pendiente').reduce((a, f) => a + (Number(f.valor) || 0), 0);
  const trimestreCM = p => p.fecha_inicio ? 'T' + (Math.floor((parse(p.fecha_inicio).getMonth()) / 3) + 1) : '';
  // Campos que el Cuadro Maestro necesita y que solo tú puedes poner (en orden de cuándo suelen conocerse)
  function faltantesCM(p) {
    const f = [];
    if (!esAbierta(p) && !p.entidad_id) f.push('Empresa');
    if (!p.tipo_programa) f.push('Tipo de programa');
    if (!p.facultad) f.push('Facultad');
    if (!p.modalidad) f.push('Modalidad');
    if (!p.horas) f.push('Intensidad horaria');
    if (esAbierta(p) ? !p.valor_persona : !p.valor_total) f.push(esAbierta(p) ? 'Valor por persona' : 'Valor del programa');
    if (!esAbierta(p) && !p.participantes) f.push('Matriculados');
    if (!p.fecha_inicio) f.push('Fecha de inicio');
    if (!p.fecha_fin) f.push('Fecha de fin');
    if (!p.director) f.push('Director');
    if (!p.plataforma) f.push('Plataforma');
    if (['Iniciado', 'Ejecutado'].includes(p.estado_cm) && !p.orden_interna) f.push('Orden interna');
    return f;
  }
  const TOTAL_CM = p => 11 + (['Iniciado', 'Ejecutado'].includes(p.estado_cm) ? 1 : 0) - (esAbierta(p) ? 2 : 0);
  function entidadPorNombre(nombre) {
    const n = (nombre || '').trim().toLowerCase();
    return n ? S.data.entidades.find(e => e.nombre.trim().toLowerCase() === n) : null;
  }

  // Fecha de un paso según su referencia:
  //   inicio / fin: días antes (negativo) o después del inicio o del fin del programa
  //   mitad: punto medio entre inicio y fin
  //   v20: ventana del 20 al 30 del mes, contada desde 16 días después del fin (después del cierre financiero)
  function ventana20(desde) {
    const x = parse(desde), d = x.getDate();
    if (d < 20) x.setDate(20); else if (d > 30) { x.setDate(1); x.setMonth(x.getMonth() + 1); x.setDate(20); }
    return isoOf(x);
  }
  // Sesión de cierre financiero: la primera registrada que caiga al menos 10 días después del fin
  // (tiempo para el informe de ingresos y la conciliación). Si no hay sesiones registradas, 15 días después del fin.
  function sesionCierre(p) {
    const fin = p.fecha_fin || p.fecha_inicio;
    if (!fin) return null;
    const min = addDays(fin, 10);
    const s = S.data.sesiones_cierre.map(x => x.fecha).filter(f => f >= min).sort()[0];
    return s || addDays(fin, 15);
  }
  function calcFecha(p, ref, rel) {
    if (!ref || rel === null || rel === undefined) return null;
    const ini = p.fecha_inicio, fin = p.fecha_fin || p.fecha_inicio, n = Number(rel);
    if (ref === 'inicio') return ini ? addDays(ini, n) : null;
    if (ref === 'mitad') return ini && fin ? addDays(ini, Math.round(diffDays(fin, ini) / 2) + n) : null;
    if (ref === 'sesion') { const x = sesionCierre(p); return x ? addDays(x, n) : null; }
    if (ref === 'v20') { const x = sesionCierre(p); return x ? addDays(ventana20(addDays(x, 1)), n) : null; }
    if (!fin) return null;
    let f = addDays(fin, n);
    // Programas cortos: lo que va "un mes antes del fin" no puede caer antes del inicio; se corre a una semana antes del fin.
    if (n < 0 && ini && f < ini) { const s = addDays(fin, -7); f = s >= ini ? s : ini; }
    return f;
  }
  // Condiciones de un paso según el programa
  const esVirtual = p => !p.modalidad || p.modalidad !== 'Presencial';
  const esPresencial = p => !p.modalidad || p.modalidad === 'Presencial' || p.modalidad === 'Híbrida';
  function aplica(p, c) {
    if (!c) return true;
    if (c === 'nuevo') return p.es_nuevo !== false;
    if (c === 'cohorte') return p.es_nuevo === false;
    if (c === 'virtual') return esVirtual(p);
    if (c === 'presencial') return esPresencial(p);
    return true;
  }
  // Marca como "No aplica" los pasos que no corresponden y reactiva los que vuelven a aplicar
  async function aplicarCondiciones(p) {
    let n = 0;
    for (const i of itemsDe(p.id).filter(i => i.condicion)) {
      const ok = aplica(p, i.condicion);
      if (!ok && i.estado === 'pendiente') { await db.update('items', i.id, { estado: 'no_aplica' }); n++; }
      else if (ok && i.estado === 'no_aplica') { await db.update('items', i.id, { estado: 'pendiente' }); n++; }
    }
    return n;
  }
  function faseDestino(fases, f) {
    if (fases.includes(f)) return f;
    const alt = { 'Negociación': ['Diseño', 'Revisión', 'Solicitud'], 'Diseño': ['Revisión', 'Solicitud'], 'Alistamiento': ['Operación', 'Aprobación'], 'Ejecución': ['Operación'], 'Cierre': ['Vigencia', 'Operación'] }[f] || [];
    return alt.find(a => fases.includes(a)) || fases[Math.max(0, fases.length - 2)] || f;
  }
  function generarItems(p, moduloIds, incluirRuta) {
    const r = rutaDe(p), fases = r ? r.fases : [], ahora = new Date();
    const tpl = S.data.plantilla_items.filter(t => (incluirRuta && t.ruta_id === p.ruta_id) || (t.modulo_id && moduloIds.includes(t.modulo_id)));
    const out = [];
    tpl.forEach(t => {
      // Repeticiones: el mismo paso cada N días hasta una fecha (solo si el programa ya tiene fechas)
      const rels = [t.dias_rel];
      if (t.repetir && t.dias_ref) {
        const fin = calcFecha(p, t.repetir.hastaRef || t.dias_ref, t.repetir.hasta ?? 0);
        for (let k = 1; k < 30; k++) {
          const rel = t.dias_rel + k * t.repetir.cada, f = calcFecha(p, t.dias_ref, rel);
          if (!f || !fin || f > fin) break;
          rels.push(rel);
        }
      }
      rels.forEach((rel, k) => {
        const fecha = calcFecha(p, t.dias_ref, rel);
        const rec = t.avisar && fecha ? aRecordar(fecha, '08:00') : null;
        out.push({
          programa_id: p.id, fase: faseDestino(fases, t.fase), orden: (t.modulo_id ? 500 : 0) + (t.orden || 0) + k * 0.01,
          titulo: t.titulo, estado: aplica(p, t.condicion) ? 'pendiente' : 'no_aplica', responsable: t.responsable || 'Yo', esperando_a: null,
          fecha_limite: fecha, fecha_seguimiento: null, fecha_hecho: null, plan_fecha: null, hora: null,
          recordar_at: rec && new Date(rec) > ahora ? rec : null, recordado_at: null,
          enlace: null, nota: null, esencial: !!t.esencial, dias_ref: t.dias_ref || null, dias_rel: rel ?? null,
          condicion: t.condicion || null, clave: t.clave || null,
        });
      });
    });
    return out;
  }
  async function touch(pid) { if (pid) await db.update('programas', pid, { actualizado: nowIso() }); }

  // ───────────── Iconos ─────────────
  const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    home: I('<path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z"/>'),
    prog: I('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/>'),
    cal: I('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
    more: I('<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    tpl: I('<path d="M5 4h14v4H5zM5 12h14M5 16h9M5 20h6"/>'),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    edit: I('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    trash: I('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>'),
    link: I('<path d="M10 14a4 4 0 006 0l3-3a4 4 0 00-6-6l-1 1M14 10a4 4 0 00-6 0l-3 3a4 4 0 006 6l1-1"/>'),
    back: I('<path d="M15 5l-7 7 7 7"/>'),
    next: I('<path d="M9 5l7 7-7 7"/>'),
    alert: I('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.2v.3"/>'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    wait: I('<path d="M7 4h10M7 20h10M8 4c0 4 8 5 8 8s-8 4-8 8M16 4c0 4-8 5-8 8"/>'),
    folder: I('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'),
    money: I('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>'),
    note: I('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>'),
    download: I('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    upload: I('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'),
    out: I('<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>'),
    flag: I('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
    bell: I('<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 004 0"/>'),
    later: I('<path d="M5 12h12M13 7l5 5-5 5"/>'),
    check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };

  // ───────────── Navegación ─────────────
  const VISTAS = ['inicio', 'hoy', 'programas', 'calendario', 'mas', 'plantillas'];
  function routeFromHash() {
    const [n0, id, tab] = location.hash.replace(/^#\/?/, '').split('/');
    const n = n0;
    if (n === 'programa' && id) S.view = { name: 'programa', id, tab: tab || 'checklist' };
    else if (VISTAS.includes(n)) S.view = { name: n };
    else S.view = { name: 'inicio' };
  }
  function go(name, id) {
    const h = name === 'programa' ? `#/programa/${id}` : `#/${name}`;
    if (location.hash !== h) location.hash = h;
    else { routeFromHash(); render(); }
  }
  const ORDEN_VISTA = { inicio: 0, hoy: 1, calendario: 2, programas: 3, mas: 4, plantillas: 5, programa: 6 };
  window.addEventListener('hashchange', () => {
    const antes = S.view.name;
    routeFromHash(); closeModal(); render(); window.scrollTo(0, 0);
    // Animación corta al cambiar de pantalla: entra desde la derecha al avanzar y desde la izquierda al volver.
    // Solo al entrar a un detalle (ficha del programa, plantillas) o al volver de él, como en Caudal.
    // Entre pestañas de la barra inferior no hay animación: la pantalla cambia quieta.
    const DETALLE = ['programa', 'plantillas'];
    const m = $('#app main');
    if (m && antes !== S.view.name && (DETALLE.includes(S.view.name) || DETALLE.includes(antes))) {
      m.classList.add(DETALLE.includes(S.view.name) ? 'navfwd' : 'navback');
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
    const v = S.view.name;
    if (v === 'programas') body = viewProgramas();
    else if (v === 'programa') body = viewPrograma();
    else if (v === 'calendario') body = viewCalendario();
    else if (v === 'hoy') body = viewHoy();
    else if (v === 'mas') body = viewMas();
    else if (v === 'plantillas') body = viewPlantillas();
    else body = viewInicio();
    const sec = v === 'programa' ? 'programas' : v === 'plantillas' ? 'mas' : v;
    const nb = (k, l, ic) => `<button class="${sec === k ? 'on' : ''}" data-act="nav" data-to="${k}" aria-label="${l}">${ic}<span>${l}</span></button>`;
    app.innerHTML = `
      ${S.mode === 'local' ? '<div class="banner">Modo local: los datos viven solo en este navegador.</div>' : ''}
      <aside class="side">
        <div class="brand"><span class="brand-mark">${ICON.flag}</span>Rumbo</div>
        <button class="btn primary side-new" data-act="nuevo">${ICON.plus}<span>Nuevo programa</span></button>
        <nav class="side-nav">${nb('inicio', 'Inicio', ICON.home)}${nb('hoy', 'Mi día', ICON.sun)}${nb('calendario', 'Calendario', ICON.cal)}${nb('programas', 'Programas', ICON.prog)}${nb('mas', 'Más', ICON.more)}</nav>
        <button class="side-cap" data-act="captura">${ICON.note}<span>Captura rápida</span></button>
      </aside>
      <main>${body}</main>
      <nav class="bottom-nav">
        ${nb('inicio', 'Inicio', ICON.home)}${nb('hoy', 'Mi día', ICON.sun)}
        <button class="nav-plus" data-act="captura" aria-label="Captura rápida">${ICON.plus}</button>
        ${nb('calendario', 'Calendario', ICON.cal)}${nb('programas', 'Programas', ICON.prog)}
      </nav>`;
  }

  function viewLogin() {
    return `<form class="login card" data-form="login">
      <div class="brand" style="margin-bottom:16px"><span class="brand-mark">${ICON.flag}</span>Rumbo</div>
      <p class="muted small" style="margin-top:0">Seguimiento de programas de Educación Continuada.</p>
      <div class="field"><label>Correo</label><input class="input" name="email" type="email" autocomplete="username" required></div>
      <div class="field"><label>Contraseña</label><input class="input" name="password" type="password" autocomplete="current-password" required></div>
      <p id="login-msg" class="small" style="color:var(--red)"></p>
      <button class="btn primary" style="width:100%">Entrar</button>
      <button type="button" class="btn ghost" style="width:100%;margin-top:8px" data-act="signup">Primera vez: crear mi cuenta</button>
    </form>`;
  }

  // ───────────── Piezas visuales ─────────────
  // Anillo de avance: un solo valor, el número va en el centro.
  function ring(pct, size = 64, stroke = 7, label) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return `<div class="ring" style="width:${size}px;height:${size}px" role="img" aria-label="${pct}% de avance">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>
      <b>${label ?? pct + '%'}</b></div>`;
  }
  function kpi(icon, tone, valor, etiqueta, act) {
    return `<div class="card kpi"${act ? ` data-act="${act}" role="button"` : ''}><span class="kpi-ic ${tone}">${icon}</span><div><b>${valor}</b><span>${etiqueta}</span></div></div>`;
  }
  const avatarBtn = () => `<button class="avatar sm" data-act="nav" data-to="mas" aria-label="Más opciones">${esc(nombreUsuario().slice(0, 1))}</button>`;
  const saludo = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; };
  const nombreUsuario = () => 'Yeferson';
  const plural = (n, s, p) => `${n} ${n === 1 ? s : (p || s + 's')}`;
  function moneyCorto(n) {
    n = Number(n) || 0;
    if (n >= 1e9) return '$ ' + (n / 1e9).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' mil M';
    if (n >= 1e6) return '$ ' + (n / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' M';
    return money(n);
  }

  // Línea: pasos completados por semana (una serie; el título la nombra, sin leyenda).
  function chartSemanas(activosIds) {
    const N = 8, lunes = d => { const x = parse(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return isoOf(x); };
    const fin = lunes(today()), semanas = [];
    for (let k = N - 1; k >= 0; k--) semanas.push(addDays(fin, -7 * k));
    const cuenta = semanas.map(s => S.data.items.filter(i => i.estado === 'hecho' && i.fecha_hecho && i.fecha_hecho >= s && i.fecha_hecho < addDays(s, 7)).length);
    const total = cuenta.reduce((a, b) => a + b, 0);
    const W = 320, H = 150, L = 26, R = 10, T = 14, B = 26, max = Math.max(4, ...cuenta), step = Math.ceil(max / 4);
    const top = step * 4, X = i => L + i * (W - L - R) / (N - 1), Y = v => T + (H - T - B) * (1 - v / top);
    const pts = cuenta.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    const area = `M${X(0)},${Y(0)} L${pts.split(' ').join(' L')} L${X(N - 1)},${Y(0)} Z`;
    const grid = [0, 1, 2, 3, 4].map(k => `<line x1="${L}" x2="${W - R}" y1="${Y(k * step)}" y2="${Y(k * step)}" stroke="var(--grid)"/>
      <text x="${L - 6}" y="${Y(k * step) + 3.5}" text-anchor="end">${k * step}</text>`).join('');
    const labels = semanas.map((s, i) => (i % 2 === 1 || i === N - 1) ? `<text x="${X(i)}" y="${H - 8}" text-anchor="middle">${fmtDate(s).replace(/ \d{4}$/, '')}</text>` : '').join('');
    const hits = semanas.map((s, i) => `<rect class="hit" x="${X(i) - (W - L - R) / (N - 1) / 2}" y="${T}" width="${(W - L - R) / (N - 1)}" height="${H - T - B}" fill="transparent"
      data-tip="Semana del ${fmtDate(s)}|${plural(cuenta[i], 'paso completado', 'pasos completados')}" data-x="${X(i)}" data-y="${Y(cuenta[i])}"/>`).join('');
    return `<div class="card pad chart-card">
      <div class="row between"><h2>Pasos completados</h2><span class="pill">Últimas 8 semanas</span></div>
      <p class="small muted" style="margin:4px 0 6px">${plural(total, 'paso cerrado', 'pasos cerrados')}; esta semana ${cuenta[N - 1]}.</p>
      <div class="chart" data-chart="semanas">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pasos completados por semana">
          ${grid}${labels}
          <path d="${area}" fill="var(--accent)" fill-opacity=".10"/>
          <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          ${cuenta.map((v, i) => i === N - 1 ? `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>` : '').join('')}
          <g class="xh" style="display:none"><line y1="${T}" y2="${H - B}" stroke="var(--ink-3)" stroke-dasharray="3 3"/><circle r="4.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/></g>
          ${hits}
        </svg>
      </div></div>`;
  }

  // Barras horizontales: programas activos por fase actual (una serie, valor al final de cada barra).
  function chartFases(activos) {
    const orden = ['Oportunidad', 'Solicitud', 'Diseño', 'Revisión', 'Negociación', 'Lanzamiento', 'Captación', 'Aprobación', 'Alistamiento', 'Operación', 'Ejecución', 'Cierre', 'Vigencia', 'Completo'];
    const c = {};
    activos.forEach(p => { const f = faseActual(p); c[f] = (c[f] || 0) + 1; });
    const filas = Object.entries(c).sort((a, b) => (orden.indexOf(a[0]) - orden.indexOf(b[0])));
    if (!filas.length) return '';
    const max = Math.max(...filas.map(f => f[1]));
    return `<div class="card pad">
      <h2>Programas por fase</h2><p class="small muted" style="margin:4px 0 12px">Dónde está hoy cada programa activo.</p>
      <div class="hbars">${filas.map(([f, n]) => `<div class="hbar" title="${esc(f)}: ${n}"><span class="hb-l">${esc(f)}</span>
        <span class="hb-t"><i style="width:${Math.max(4, n / max * 100)}%"></i></span><b>${n}</b></div>`).join('')}</div></div>`;
  }

  // Dona: reparto del portafolio activo por ruta (3 categorías fijas, colores en orden, valor visible en la leyenda).
  const COL_RUTA = { cerrado: 'var(--c1)', aval: 'var(--c2)', abierta: 'var(--c3)' };
  function chartRutas(activos) {
    const rutas = [...S.data.rutas].sort((a, b) => a.orden - b.orden);
    const filas = rutas.map(r => ({ r, n: activos.filter(p => p.ruta_id === r.id).length, v: activos.filter(p => p.ruta_id === r.id).reduce((s, p) => s + ingresosCM(p), 0) })).filter(f => f.n);
    const tot = filas.reduce((s, f) => s + f.n, 0);
    if (!tot) return '';
    const R = 42, C = 2 * Math.PI * R, gap = filas.length > 1 ? 2.5 : 0;
    let acc = 0;
    const arcs = filas.map(f => {
      const len = C * f.n / tot, d = `${Math.max(0, len - gap).toFixed(2)} ${(C - Math.max(0, len - gap)).toFixed(2)}`;
      const s = `<circle cx="55" cy="55" r="${R}" fill="none" stroke="${COL_RUTA[f.r.clave] || 'var(--ink-3)'}" stroke-width="14" stroke-dasharray="${d}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 55 55)"><title>${esc(f.r.nombre)}: ${f.n}</title></circle>`;
      acc += len; return s;
    }).join('');
    return `<div class="card pad">
      <h2>Portafolio por ruta</h2><p class="small muted" style="margin:4px 0 12px">Programas activos y sus ingresos.</p>
      <div class="donut-row">
        <svg viewBox="0 0 110 110" width="110" height="110" role="img" aria-label="Programas activos por ruta">${arcs}
          <text x="55" y="53" text-anchor="middle" class="dn-n">${tot}</text><text x="55" y="68" text-anchor="middle" class="dn-l">activos</text></svg>
        <div class="legend">${filas.map(f => `<div><i style="background:${COL_RUTA[f.r.clave] || 'var(--ink-3)'}"></i><span class="grow">${esc(f.r.nombre)}</span>
          <b>${f.n}</b><span class="muted tiny">${f.v ? moneyCorto(f.v) : ''}</span></div>`).join('')}</div>
      </div></div>`;
  }

  // ───────────── Inicio (tablero) ─────────────
  function itemRow(i, showProg = true, acciones = '') {
    const p = byId('programas', i.programa_id), t = today();
    const fecha = i.estado === 'esperando' ? i.fecha_seguimiento : (i.plan_fecha && (!i.fecha_limite || i.plan_fecha <= i.fecha_limite) ? i.plan_fecha : i.fecha_limite);
    let pill = '';
    if (abierto(i) && fecha) {
      const venc = (i.fecha_limite && i.fecha_limite < t) || (i.plan_fecha && i.plan_fecha < t);
      const cls = venc || fecha < t ? 'red' : fecha <= addDays(t, 3) ? 'amber' : '';
      pill = `<span class="pill ${cls}">${i.estado === 'esperando' ? 'Seguir · ' : ''}${relDate(fecha)}</span>`;
    } else if (abierto(i) && i.estado === 'esperando') pill = '<span class="pill amber">Sin fecha</span>';
    else if (i.estado === 'hecho' && i.fecha_hecho) pill = `<span class="tiny muted">${fmtDate(i.fecha_hecho)}</span>`;
    const sub = [];
    if (showProg) sub.push(p ? esc(nombreProg(p)) : '<span class="tag-t">Tarea</span>');
    if (showProg && p && i.fase) sub.push(esc(i.fase));
    if (i.hora && abierto(i)) sub.push(fmtHora(i.hora));
    if (i.estado === 'esperando') sub.push('Esperando a ' + esc(i.esperando_a || '…'));
    else if (i.responsable && i.responsable !== 'Yo') sub.push(esc(i.responsable));
    if (i.estado === 'en_curso') sub.push('En curso');
    if (p && !i.esencial) sub.push('opcional');
    if (i.recordar_at && !i.recordado_at && abierto(i)) sub.push(`<span class="rec">${ICON.bell}${fmtRecordar(i.recordar_at)}</span>`);
    if (i.nota) sub.push('con nota');
    const cls = i.estado === 'hecho' ? 'done' : i.estado === 'no_aplica' ? 'na-row' : '';
    const chk = i.estado === 'hecho' ? 'on' : i.estado === 'no_aplica' ? 'na' : '';
    return `<div class="li ${cls}" data-act="edit-item" data-id="${i.id}">
      <button class="check ${chk}" data-act="toggle" data-id="${i.id}" aria-label="Marcar como hecho">${i.estado === 'hecho' ? ICON.check : i.estado === 'no_aplica' ? '–' : ''}</button>
      <div class="grow"><div class="title">${esc(i.titulo)}</div>${sub.length ? `<div class="sub">${sub.join(' · ')}</div>` : ''}</div>
      ${i.enlace ? `<a class="icon-btn" href="${esc(i.enlace)}" target="_blank" rel="noopener" data-act="noop" aria-label="Abrir enlace">${ICON.link}</a>` : ''}
      ${acciones || pill}
    </div>`;
  }
  function seccion(titulo, html, n, vacio, extra = '') {
    return `<section class="section"><div class="section-head"><h3>${titulo}${n !== undefined ? ` <span class="count">${n}</span>` : ''}</h3>${extra}</div>
      <div class="card list">${html || `<div class="empty">${vacio}</div>`}</div></section>`;
  }
  function pendientes() {
    const t = today(), t7 = addDays(t, 7);
    const activos = S.data.programas.filter(p => p.estado === 'activo');
    const ids = new Set(activos.map(p => p.id));
    const its = S.data.items.filter(i => ids.has(i.programa_id) && abierto(i));
    const seguir = its.filter(i => i.estado === 'esperando' && (!i.fecha_seguimiento || i.fecha_seguimiento <= t)).sort(byDate('fecha_seguimiento'));
    const seg = new Set(seguir.map(i => i.id));
    const vencido = its.filter(i => !seg.has(i.id) && i.fecha_limite && i.fecha_limite < t).sort(byDate('fecha_limite'));
    const clave = i => i.estado === 'esperando' ? i.fecha_seguimiento : i.fecha_limite;
    const semana = its.filter(i => { const f = clave(i); return !seg.has(i.id) && f && f >= t && f <= t7; }).sort((a, b) => clave(a).localeCompare(clave(b)));
    return { activos, its, seguir, vencido, semana };
  }
  function proximo(p) {
    const its = itemsDe(p.id).filter(i => abierto(i) && (i.fecha_limite || i.fecha_seguimiento));
    const f = i => i.estado === 'esperando' ? i.fecha_seguimiento : i.fecha_limite;
    return its.sort((a, b) => (f(a) || '9').localeCompare(f(b) || '9'))[0] || null;
  }
  function progAvanceRow(p) {
    const av = avance(p), nx = proximo(p), t = today();
    const fx = nx ? (nx.estado === 'esperando' ? nx.fecha_seguimiento : nx.fecha_limite) : null;
    return `<div class="li" data-act="open" data-id="${p.id}">
      ${ring(av.pct, 44, 5)}
      <div class="grow"><div class="title ellipsis">${esc(nombreProg(p))}</div>
        <div class="sub ellipsis">${esc(faseActual(p))}${nx ? ' · ' + esc(nx.titulo) : ''}</div></div>
      ${fx ? `<span class="pill ${fx < t ? 'red' : fx <= addDays(t, 3) ? 'amber' : ''}">${relDate(fx)}</span>` : `<span class="dot ${semaforo(p)}"></span>`}
    </div>`;
  }
  function tarjetaHoy() {
    const t = today(), its = itemsVisibles();
    const agenda = its.filter(i => abierto(i) && delDia(i, t));
    const seg = its.filter(i => i.estado === 'esperando' && (!i.fecha_seguimiento || i.fecha_seguimiento <= t));
    const sig = [...agenda].sort((a, b) => (a.hora || '99').localeCompare(b.hora || '99'))[0];
    return `<div class="card today-card" data-act="nav" data-to="hoy" role="button">
      <span class="kpi-ic amber">${ICON.sun}</span>
      <div class="grow"><b>Mi día: ${agenda.length || seg.length ? `${plural(agenda.length, 'pendiente')}${seg.length ? ` y ${plural(seg.length, 'seguimiento')}` : ''}` : 'nada planeado'}</b>
        <span class="small muted ellipsis">${sig ? `Siguiente: ${sig.hora ? fmtHora(sig.hora) + ' · ' : ''}${esc(sig.titulo)}` : 'Toca para organizar tu día'}</span></div>
      <span class="muted">${ICON.next}</span></div>`;
  }
  function viewInicio() {
    const t = today(), t30 = addDays(t, 30), t14 = addDays(t, -14);
    const fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    const head = `<header class="hello"><div><p class="fecha cap">${esc(fecha)}</p><h1>${saludo()}, ${esc(nombreUsuario())}</h1></div>
      <button class="avatar" data-act="nav" data-to="mas" aria-label="Más opciones">${esc(nombreUsuario().slice(0, 1))}</button></header>`;
    if (!S.data.programas.length) {
      return head + `<div class="card hero section">
          <div><h2>Empieza con tu primer programa</h2>
          <p>Cada programa nace de una ruta (Cerrado B2B, Aval académico u Oferta abierta) y los módulos que necesite. Rumbo arma el checklist y calcula las fechas desde el inicio.</p>
          <button class="btn light" data-act="nuevo">Crear programa</button></div>
        </div>`;
    }
    const { activos, its, seguir, vencido, semana } = pendientes();
    // Avance del portafolio: pasos esenciales hechos sobre el total de los programas activos.
    let hechos = 0, total = 0;
    activos.forEach(p => { const a = avance(p); hechos += a.d; total += a.n; });
    const pct = total ? Math.round(hechos * 100 / total) : 0;
    const alDia = activos.filter(p => semaforo(p) === 'verde').length;
    const cartera = activos.reduce((s, p) => s + ingresosCM(p), 0);
    const incompletos = activos.filter(p => faltantesCM(p).length);
    const margenes = activos.filter(p => p.margen !== null && p.margen !== undefined && p.margen !== '');
    const margen = margenes.length ? Math.round(margenes.reduce((s, p) => s + Number(p.margen), 0) / margenes.length) : null;
    const inicios = activos.filter(p => p.fecha_inicio && p.fecha_inicio >= t && p.fecha_inicio <= t30).sort(byDate('fecha_inicio'));
    const quietos = activos.filter(p => (p.actualizado || p.created_at || '').slice(0, 10) < t14);
    const atencion = [...vencido, ...seguir];
    const porAvance = [...activos].sort((a, b) => (SEM_ORDEN[semaforo(a)] - SEM_ORDEN[semaforo(b)]) || (avance(a).pct - avance(b).pct)).slice(0, 6);
    const progRow = (p, extra) => `<div class="li" data-act="open" data-id="${p.id}"><span class="dot ${semaforo(p)}"></span>
      <div class="grow"><div class="title ellipsis">${esc(nombreProg(p))}</div><div class="sub">${esc(empresaTxt(p))} · ${esc(faseActual(p))}</div></div>${extra}</div>`;
    const qa = (icon, l, act, extra = '') => `<button class="qa" data-act="${act}"${extra}><span>${icon}</span>${l}</button>`;
    return `${head}
      ${tarjetaHoy()}
      <div class="dash">
        <div class="card hero" data-act="nav" data-to="programas" role="button">
          ${ring(pct, 92, 9)}
          <div class="grow"><h2>Avance del portafolio</h2>
            <p>${hechos} de ${total} pasos esenciales completos en ${plural(activos.length, 'programa activo', 'programas activos')}.</p>
            <p class="hero-sub">${alDia === activos.length ? 'Todo al día.' : `${plural(alDia, 'programa', 'programas')} al día, ${activos.length - alDia} con algo por atender.`}</p></div>
        </div>
        <div class="kpis">
          ${kpi(ICON.folder, 'violet', activos.length, 'Programas activos', 'nav-programas')}
          ${kpi(ICON.alert, vencido.length ? 'red' : 'green', vencido.length, 'Pasos vencidos')}
          ${kpi(ICON.wait, seguir.length ? 'amber' : 'green', seguir.length, 'Por hacer seguimiento')}
          ${kpi(ICON.clock, 'blue', semana.length, 'Vencen en 7 días', 'nav-calendario')}
        </div>
        ${cartera ? `<div class="card money-card"><span class="kpi-ic violet">${ICON.money}</span><div class="grow"><span class="muted small">Ingresos en cartera</span><b>${money(cartera)}</b></div>
          ${margen !== null ? `<div class="mg"><span class="muted small">Margen promedio</span><b>${margen} %</b></div>` : ''}</div>` : ''}
        <div class="card money-card cm-dash" data-act="${incompletos.length ? 'open' : 'export-csv'}" data-id="${incompletos[0]?.id || ''}" role="button">
          <span class="kpi-ic ${incompletos.length ? 'amber' : 'green'}">${ICON.tpl}</span>
          <div class="grow"><span class="muted small">Cuadro Maestro</span><b style="font-size:16px">${incompletos.length ? `${plural(incompletos.length, 'programa')} con datos por completar` : 'Todo listo para exportar'}</b></div>
          <span class="muted">${ICON.next}</span></div>
        <div class="quick">
          ${qa(ICON.plus, 'Nuevo programa', 'nuevo')}${qa(ICON.note, 'Captura', 'captura')}${qa(ICON.sun, 'Mi día', 'nav', ' data-to="hoy"')}${qa(ICON.download, 'Exportar', 'export-csv')}
        </div>
      </div>
      <div class="dash-cols">
        <div>
          ${seccion('Requiere tu atención', atencion.slice(0, 6).map(i => itemRow(i)).join(''), atencion.length, 'Nada vencido ni seguimientos pendientes. Vas al día.',
            atencion.length > 6 ? '<button class="link" data-act="nav" data-to="calendario">Ver todo</button>' : '')}
          ${seccion('Próximos 7 días', semana.slice(0, 6).map(i => itemRow(i)).join(''), semana.length, 'Semana despejada.',
            semana.length > 6 ? '<button class="link" data-act="nav" data-to="calendario">Ver calendario</button>' : '')}
          ${seccion('Avance por programa', porAvance.map(progAvanceRow).join(''), undefined, 'Sin programas activos.',
            '<button class="link" data-act="nav" data-to="programas">Ver todos</button>')}
        </div>
        <div>
          <section class="section">${chartSemanas()}</section>
          <section class="section">${chartFases(activos)}</section>
          <section class="section">${chartRutas(activos)}</section>
          ${inicios.length ? seccion('Inicios en 30 días', inicios.map(p => progRow(p, `<span class="pill accent">${relDate(p.fecha_inicio)}</span>`)).join(''), inicios.length) : ''}
          ${quietos.length ? seccion('Sin movimiento en 14 días', quietos.map(p => progRow(p, `<span class="pill">${fmtDate((p.actualizado || p.created_at).slice(0, 10))}</span>`)).join(''), quietos.length) : ''}
        </div>
      </div>`;
  }

  // ───────────── Mi día ─────────────
  // Lo del día: lo planeado para ese día, lo que vence ese día y los seguimientos que tocan.
  function itemsVisibles() {
    const activos = new Set(S.data.programas.filter(p => p.estado === 'activo').map(p => p.id));
    return S.data.items.filter(i => !i.programa_id || activos.has(i.programa_id));
  }
  const delDia = (i, d) => i.estado !== 'esperando' && (i.plan_fecha === d || (!i.plan_fecha && i.fecha_limite === d));
  function viewHoy() {
    const t = today();
    if (!S.dia) S.dia = t;
    const d = S.dia, esHoy = d === t;
    const its = itemsVisibles();
    const agenda = its.filter(i => delDia(i, d) && i.estado !== 'no_aplica')
      .sort((a, b) => (abierto(b) - abierto(a)) || (a.hora || '99').localeCompare(b.hora || '99') || (a.created_at || '').localeCompare(b.created_at || ''));
    const seguir = its.filter(i => i.estado === 'esperando' && (esHoy ? (!i.fecha_seguimiento || i.fecha_seguimiento <= d) : i.fecha_seguimiento === d));
    const atrasado = esHoy ? its.filter(i => abierto(i) && i.estado !== 'esperando' &&
      ((i.plan_fecha && i.plan_fecha < t) || (!i.plan_fecha && i.fecha_limite && i.fecha_limite < t))).sort(byDate('fecha_limite')) : [];
    const hechasHoy = its.filter(i => i.estado === 'hecho' && i.fecha_hecho === d && !delDia(i, d)).length;
    const total = agenda.length + seguir.length, hechos = agenda.filter(i => i.estado === 'hecho').length + hechasHoy;
    const pct = (total + hechasHoy) ? Math.round(hechos * 100 / (total + hechasHoy)) : 0;
    const quedan = agenda.filter(abierto).length + seguir.length;
    // Sugeridos: el siguiente paso esencial de cada programa activo que todavía no está en tu agenda
    const enAgenda = new Set([...agenda, ...atrasado, ...seguir].map(i => i.id));
    const sugeridos = esHoy ? S.data.programas.filter(p => p.estado === 'activo').map(p => itemsOrdenados(p).find(i => abierto(i) && i.esencial && i.estado !== 'esperando'))
      .filter(i => i && !enAgenda.has(i.id) && !(i.plan_fecha && i.plan_fecha > t)).slice(0, 5) : [];
    // Semana para moverte entre días
    const lunes = (() => { const x = parse(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return isoOf(x); })();
    const semana = Array.from({ length: 7 }, (_, k) => addDays(lunes, k));
    const dias = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const strip = semana.map((x, k) => {
      const n = its.filter(i => abierto(i) && delDia(i, x)).length + its.filter(i => i.estado === 'esperando' && i.fecha_seguimiento === x).length;
      return `<button class="wd ${x === d ? 'sel' : ''} ${x === t ? 'today' : ''}" data-act="dia" data-d="${x}"><span>${dias[k]}</span><b>${parse(x).getDate()}</b><i>${n ? '<em></em>' : ''}</i></button>`;
    }).join('');
    const mover = (i, label = 'Mañana') => `<div class="acts"><button class="mini" data-act="mover" data-id="${i.id}" data-d="${addDays(d, 1)}" aria-label="Pasar a mañana">${ICON.later}<span>${label}</span></button></div>`;
    const traer = i => `<div class="acts"><button class="mini on" data-act="mover" data-id="${i.id}" data-d="${t}">Hoy</button><button class="mini" data-act="mover" data-id="${i.id}" data-d="${addDays(t, 1)}">Mañana</button></div>`;
    const sumar = i => `<div class="acts"><button class="mini on" data-act="mover" data-id="${i.id}" data-d="${t}">${ICON.plus}<span>Hoy</span></button></div>`;
    const titulo = esHoy ? 'Hoy' : relDate(d) === 'Mañana' ? 'Mañana' : parse(d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    // Agenda agrupada por momento del día
    const grupo = (l, f) => { const g = agenda.filter(f); return g.length ? `<div class="slot">${l}</div>${g.map(i => itemRow(i, true, abierto(i) ? `${i.hora ? `<span class="hr">${fmtHora(i.hora)}</span>` : ''}${mover(i)}` : '')).join('')}` : ''; };
    const h = i => i.hora || '';
    const agendaHtml = agenda.length ? grupo('Mañana · antes de 12', i => abierto(i) && h(i) && h(i) < '12') + grupo('Tarde', i => abierto(i) && h(i) >= '12') +
      grupo('Sin hora', i => abierto(i) && !h(i)) + grupo('Hecho', i => !abierto(i)) : '';
    return `<div class="page-head"><div><p class="fecha cap">${esc(parse(d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }))}</p><h1 class="cap">${esc(titulo)}</h1></div>${avatarBtn()}</div>
      <div class="week">${strip}</div>
      <div class="dash-cols">
        <div>
          <div class="card day-card">
            ${ring(pct, 64, 7)}
            <div class="grow"><b>${quedan ? `Te ${quedan === 1 ? 'queda' : 'quedan'} ${plural(quedan, 'pendiente')}` : total ? 'Día completo' : 'Nada planeado'}</b>
              <span class="small muted">${hechos ? plural(hechos, 'hecho', 'hechos') + (esHoy ? ' hoy' : '') + ' · ' : ''}${plural(seguir.length, 'seguimiento')}${atrasado.length ? ` · ${atrasado.length} atrasado${atrasado.length === 1 ? '' : 's'}` : ''}</span></div>
          </div>
          <form class="card quick-add" data-form="tarea-rapida" data-d="${d}">
            <input name="titulo" placeholder="Agregar tarea para ${esHoy ? 'hoy' : esc(relDate(d).toLowerCase())}…" autocomplete="off" required>
            <input name="hora" type="time" aria-label="Hora">
            <button class="btn primary sm" aria-label="Agregar">${ICON.plus}</button>
          </form>
          ${atrasado.length ? seccion('Atrasado', atrasado.map(i => itemRow(i, true, traer(i))).join(''), atrasado.length) : ''}
          ${seccion('Agenda', agendaHtml, agenda.length || undefined, esHoy ? 'Nada planeado todavía. Agrega tareas arriba o toma los sugeridos.' : 'Nada planeado para este día.')}
          ${seguir.length ? seccion('Seguimientos', seguir.map(i => itemRow(i, true, mover(i, 'Luego'))).join(''), seguir.length) : ''}
        </div>
        <div>
          ${sugeridos.length ? seccion('Sugeridos para hoy', sugeridos.map(i => itemRow(i, true, sumar(i))).join(''), undefined, '', '<span class="tiny muted">Siguiente paso de cada programa</span>') : ''}
          ${avisosCard(true)}
        </div>
      </div>`;
  }

  // ───────────── Avisos (notificaciones push) ─────────────
  const AV = { on: false, busy: false, msg: '' };
  const pushCapable = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const instalada = () => navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  const b64u = x => { const p = '='.repeat((4 - x.length % 4) % 4), b = atob((x + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); };
  async function avState() {
    if (!pushCapable() || Notification.permission !== 'granted') { AV.on = false; return; }
    try { const reg = await navigator.serviceWorker.ready; AV.on = !!(await reg.pushManager.getSubscription()); } catch (e) { AV.on = false; }
  }
  function avisosCard(compacta) {
    if (AV.on && compacta) return '';
    const ios = /iPhone|iPad/.test(navigator.userAgent);
    let cuerpo;
    if (S.mode !== 'remote') cuerpo = '<p class="small muted">Los avisos necesitan la conexión con Supabase.</p>';
    else if (ios && !instalada()) cuerpo = '<p class="small muted">En el iPhone los avisos funcionan desde el ícono de la pantalla de inicio. Abre Rumbo desde ahí y actívalos.</p>';
    else if (!pushCapable()) cuerpo = '<p class="small muted">Este navegador no permite avisos.</p>';
    else if (AV.on) cuerpo = `<p class="small muted">Activos en este dispositivo: resumen a las 7:00 a. m., repaso a las 5:00 p. m. y cada recordatorio a su hora.</p>
      <div class="row"><button class="btn sm" data-act="av-test">Enviar prueba</button><button class="btn sm danger" data-act="av-off">Desactivar</button></div>`;
    else cuerpo = `<p class="small muted">Recibe un resumen a las 7:00 a. m., un repaso a las 5:00 p. m. y cada recordatorio a la hora que elijas, aunque la app esté cerrada.</p>
      <button class="btn primary sm" data-act="av-on" ${AV.busy ? 'disabled' : ''}>${ICON.bell}<span>${AV.busy ? 'Activando…' : 'Activar avisos'}</span></button>`;
    return `<div class="card pad section avisos"><div class="row"><span class="kpi-ic ${AV.on ? 'green' : 'violet'}">${ICON.bell}</span><h2 class="grow">Recordatorios</h2></div>${cuerpo}
      ${AV.msg ? `<p class="small" style="color:var(--red);margin-bottom:0">${esc(AV.msg)}</p>` : ''}</div>`;
  }
  async function avEnable() {
    AV.busy = true; AV.msg = ''; render();
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error('Sin permiso. Actívalo en Ajustes del iPhone > Notificaciones > Rumbo.');
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(PUSH_PUB) });
      const j = sub.toJSON();
      const { error } = await sb.from('push_subs').upsert({ endpoint: j.endpoint, keys: j.keys });
      if (error) throw new Error('No pude guardar el permiso: ' + error.message);
      AV.on = true; toast('Avisos activados');
    } catch (e) { AV.msg = e.message || 'No se pudieron activar los avisos.'; }
    AV.busy = false; render();
  }
  async function avDisable() {
    try {
      const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
      if (sub) { await sb.from('push_subs').delete().eq('endpoint', sub.endpoint); await sub.unsubscribe(); }
    } catch (e) { /* ya estaba desactivado */ }
    AV.on = false; render(); toast('Avisos desactivados');
  }
  async function avTest() {
    try { const { data, error } = await sb.functions.invoke('avisos', { body: { prueba: true } }); if (error) throw error;
      toast(data?.enviados ? 'Enviada: debe llegar en segundos' : 'No hay dispositivos con avisos activos'); }
    catch (e) { toast('No se pudo enviar la prueba'); }
  }

  // ───────────── Calendario ─────────────
  // Eventos de un día: pasos con fecha límite, seguimientos, inicios y cierres de programas activos.
  function eventosPorDia() {
    const ev = {}, add = (d, e) => { if (!d) return; (ev[d] = ev[d] || []).push(e); };
    itemsVisibles().forEach(i => {
      if (i.estado === 'esperando') add(i.fecha_seguimiento, { k: 'seg', i });
      else if (abierto(i)) add(i.plan_fecha || i.fecha_limite, { k: 'paso', i });
      else if (i.estado === 'hecho') add(i.fecha_hecho, { k: 'hecho', i });
    });
    S.data.sesiones_cierre.forEach(x => add(x.fecha, { k: 'sesion', x }));
    S.data.programas.forEach(p => {
      if (p.estado !== 'activo') return;
      add(p.fecha_inicio, { k: 'inicio', p });
      if (p.fecha_fin && p.fecha_fin !== p.fecha_inicio) add(p.fecha_fin, { k: 'fin', p });
    });
    return ev;
  }
  function viewCalendario() {
    const t = today();
    if (!S.cal) S.cal = { mes: t.slice(0, 7), dia: t };
    const [y, m] = S.cal.mes.split('-').map(Number);
    const first = new Date(y, m - 1, 1), offset = (first.getDay() + 6) % 7, dias = new Date(y, m, 0).getDate();
    const ev = eventosPorDia();
    const titulo = first.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    let celdas = '';
    for (let k = 0; k < offset; k++) celdas += '<span class="cd empty"></span>';
    for (let d = 1; d <= dias; d++) {
      const iso = `${y}-${pad(m)}-${pad(d)}`, e = (ev[iso] || []).filter(x => x.k !== 'hecho');
      const venc = e.some(x => (x.k === 'paso' || x.k === 'seg') && iso < t);
      const marcas = [...new Set(e.map(x => x.k === 'inicio' || x.k === 'fin' || x.k === 'sesion' ? 'prog' : venc ? 'venc' : x.k))].slice(0, 3);
      celdas += `<button class="cd ${iso === t ? 'today' : ''} ${iso === S.cal.dia ? 'sel' : ''}" data-act="cal-dia" data-d="${iso}" aria-label="${d}${e.length ? ', ' + plural(e.length, 'evento') : ''}">
        <span>${d}</span><i>${marcas.map(c => `<em class="mk ${c}"></em>`).join('')}</i></button>`;
    }
    const lista = (ev[S.cal.dia] || []).sort((a, b) => ['sesion', 'inicio', 'fin', 'paso', 'seg', 'hecho'].indexOf(a.k) - ['sesion', 'inicio', 'fin', 'paso', 'seg', 'hecho'].indexOf(b.k));
    const dSel = parse(S.cal.dia).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    const filaProg = (p, txt) => `<div class="li" data-act="open" data-id="${p.id}"><span class="cal-bar prog"></span>
      <div class="grow"><div class="title ellipsis">${txt}: ${esc(nombreProg(p))}</div><div class="sub">${esc(empresaTxt(p))} · ${esc(faseActual(p))}</div></div></div>`;
    const filaSesion = () => `<div class="li" data-act="nav" data-to="mas"><span class="cal-bar prog"></span><div class="grow"><div class="title">Sesión de cierre financiero</div><div class="sub">Con Presupuestos</div></div></div>`;
    const cuerpo = lista.map(x => x.k === 'sesion' ? filaSesion() : x.k === 'inicio' ? filaProg(x.p, 'Inicia') : x.k === 'fin' ? filaProg(x.p, 'Termina') : itemRow(x.i)).join('');
    // Resumen del mes
    const delMes = Object.entries(ev).filter(([d]) => d.startsWith(S.cal.mes)).flatMap(([, e]) => e);
    const nPasos = delMes.filter(x => x.k === 'paso').length, nSeg = delMes.filter(x => x.k === 'seg').length, nIni = delMes.filter(x => x.k === 'inicio').length, nHechos = delMes.filter(x => x.k === 'hecho').length;
    return `<div class="page-head"><h1>Calendario</h1><div class="row"><button class="btn sm" data-act="cal-hoy">Hoy</button>${avatarBtn()}</div></div>
      <div class="cal-layout">
        <div class="card pad cal">
          <div class="cal-top"><button class="icon-btn" data-act="cal-mes" data-n="-1" aria-label="Mes anterior">${ICON.back}</button>
            <b class="cap">${esc(titulo)}</b><button class="icon-btn" data-act="cal-mes" data-n="1" aria-label="Mes siguiente">${ICON.next}</button></div>
          <div class="cal-grid wk">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => `<span>${d}</span>`).join('')}</div>
          <div class="cal-grid">${celdas}</div>
          <div class="cal-key"><span><em class="mk paso"></em>Paso</span><span><em class="mk seg"></em>Seguimiento</span><span><em class="mk venc"></em>Vencido</span><span><em class="mk prog"></em>Inicio, fin o cierre</span></div>
        </div>
        <div>
          <div class="kpis kpis-3">
            ${kpi(ICON.clock, 'blue', nPasos, 'Pasos este mes')}${kpi(ICON.wait, 'amber', nSeg, 'Seguimientos')}${kpi(ICON.flag, 'violet', nIni, 'Inicios')}
          </div>
          ${seccion(`<span class="cap">${esc(dSel)}</span>`, cuerpo, lista.length || undefined, 'Nada programado este día.')}
          ${nHechos ? `<p class="small muted" style="margin-top:10px">Este mes completaste ${plural(nHechos, 'paso', 'pasos')}.</p>` : ''}
        </div>
      </div>`;
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
  const SEM_TXT = { rojo: 'Atrasado', amarillo: 'Atento', verde: 'Al día', gris: '' };
  const SEM_PILL = { rojo: 'red', amarillo: 'amber', verde: 'green', gris: '' };
  function programCard(p) {
    const av = avance(p), sem = semaforo(p), fa = faseActual(p), nx = proximo(p), t = today();
    const fx = nx ? (nx.estado === 'esperando' ? nx.fecha_seguimiento : nx.fecha_limite) : null;
    const r = rutaDe(p);
    return `<div class="card pcard" data-act="open" data-id="${p.id}">
      <div class="row" style="align-items:flex-start;gap:12px">
        ${ring(av.pct, 52, 6)}
        <div class="grow" style="min-width:0"><div class="name ellipsis">${esc(p.nombre)}</div>
          <div class="small muted ellipsis">${esc(empresaTxt(p))}</div>
          <div class="row wrap" style="margin-top:6px;gap:6px">
            <span class="pill route" style="--rc:${COL_RUTA[r?.clave] || 'var(--ink-3)'}">${esc(r?.nombre || '')}</span>
            <span class="pill">${esc(p.estado_cm || 'Proyección')}</span>
            ${p.estado === 'activo' && SEM_TXT[sem] ? `<span class="pill ${SEM_PILL[sem]}">${SEM_TXT[sem]}</span>` : ''}
          </div></div>
      </div>
      <div class="pc-foot">
        <div><span>Fase</span><b>${esc(fa)}</b></div>
        <div><span>Inicio</span><b>${p.fecha_inicio ? fmtDate(p.fecha_inicio) : '—'}</b></div>
        <div><span>Ingresos</span><b>${ingresosCM(p) ? moneyCorto(ingresosCM(p)) : '—'}</b></div>
      </div>
      ${nx ? `<div class="pc-next"><span class="muted">Siguiente:</span> <span class="ellipsis grow">${esc(nx.titulo)}</span>${fx ? `<span class="pill ${fx < t ? 'red' : fx <= addDays(t, 3) ? 'amber' : ''}">${relDate(fx)}</span>` : ''}</div>` : ''}
    </div>`;
  }
  function listaProgramas() {
    const ps = programasFiltrados();
    if (!ps.length) return '<div class="card empty">No hay programas con estos filtros.</div>';
    const total = ps.reduce((s, p) => s + ingresosCM(p), 0);
    return `<p class="small muted">${plural(ps.length, 'programa')}${total ? ` · ${money(total)}` : ''}</p><div class="grid">${ps.map(programCard).join('')}</div>`;
  }
  function viewProgramas() {
    const n = e => S.data.programas.filter(p => e === 'todos' || p.estado === e).length;
    const chip = (v, l) => `<button class="chip ${S.f.estado === v ? 'on' : ''}" data-act="f-estado" data-v="${v}">${l}<span>${n(v)}</span></button>`;
    return `
      <div class="page-head"><h1>Programas</h1><div class="row"><button class="btn primary" data-act="nuevo">${ICON.plus}<span>Nuevo</span></button>${avatarBtn()}</div></div>
      <div class="filters">
        <input class="input search" type="search" placeholder="Buscar programa, entidad, facultad…" value="${esc(S.f.q)}" data-input="buscar">
        <select class="input" data-change="f-ruta">${opts(S.data.rutas.map(r => [r.id, r.nombre]), S.f.ruta, 'Todas las rutas')}</select>
      </div>
      <div class="chips">${chip('activo', 'En curso')}${chip('cerrado', 'Ejecutados')}${chip('pausa', 'Aplazados')}${chip('perdido', 'Cancelados')}${chip('todos', 'Todos')}</div>
      <div id="prog-list" class="section">${listaProgramas()}</div>`;
  }

  // Sesiones de cierre financiero con Presupuestos (cada 15 días)
  function cardSesiones() {
    const t = today(), ses = [...S.data.sesiones_cierre].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const prox = ses.filter(x => x.fecha >= t), pasadas = ses.filter(x => x.fecha < t).slice(-2);
    const fila = x => {
      const progs = S.data.programas.filter(p => p.estado === 'activo' && itemsDe(p.id).some(i => i.dias_ref === 'sesion' && i.dias_rel === 0 && i.fecha_limite === x.fecha && abierto(i)));
      return `<div class="li" style="cursor:default"><span class="kpi-ic ${x.fecha < t ? '' : 'blue'}" style="width:34px;height:34px">${ICON.cal}</span>
        <div class="grow"><div class="title">${esc(fmtDate(x.fecha))} <span class="muted small">· ${relDate(x.fecha)}</span></div>
        <div class="sub">${progs.length ? 'Cierras: ' + progs.map(p => esc(nombreProg(p))).join(', ') : 'Sin programas para cerrar'} · cuadro el ${fmtDate(addDays(x.fecha, -8))}</div></div>
        <button class="icon-btn" data-act="ses-del" data-id="${x.id}" aria-label="Eliminar sesión">${ICON.trash}</button></div>`;
    };
    return `<div class="card section">
      <div class="pad" style="padding-bottom:8px"><h2>Sesiones de cierre financiero</h2>
        <p class="small muted" style="margin:4px 0 10px">Registra las fechas que informa la secretaría de la división. Cada programa se cierra en la primera sesión al menos 10 días después de terminar; el cuadro va 8 días antes.</p>
        <form class="row" data-form="sesion"><input class="input" type="date" name="fecha" required style="flex:1"><button class="btn primary sm">${ICON.plus}<span>Agregar</span></button></form></div>
      <div class="list">${[...pasadas, ...prox].map(fila).join('') || '<div class="empty">Sin sesiones registradas. Mientras tanto, Rumbo calcula el cierre 15 días después del fin.</div>'}</div>
    </div>`;
  }

  // ───────────── Más ─────────────
  function viewMas() {
    const row = (icon, l, act, extra = '', sub = '') => `<button class="li menu-li" data-act="${act}"${extra}><span class="kpi-ic violet">${icon}</span><div class="grow"><div class="title">${l}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div><span class="muted">${ICON.next}</span></button>`;
    const ps = S.data.programas;
    return `<div class="page-head"><h1>Más</h1></div>
      <div class="card profile">
        <span class="avatar lg">${esc(nombreUsuario().slice(0, 1))}</span>
        <div class="grow"><b>${esc(nombreUsuario())}</b><span class="small muted">${esc(S.user?.email || 'Modo local')}</span></div>
      </div>
      <div class="kpis kpis-3 section">
        ${kpi(ICON.folder, 'violet', ps.length, 'Programas')}${kpi(ICON.flag, 'green', ps.filter(p => p.estado === 'cerrado').length, 'Cerrados')}${kpi(ICON.note, 'blue', S.data.entidades.length, 'Entidades')}
      </div>
      <div class="card list section">
        ${row(ICON.tpl, 'Plantillas', 'nav', ' data-to="plantillas"', 'Rutas y módulos con los que nace cada programa')}
        ${row(ICON.download, 'Exportar al Cuadro Maestro', 'export-csv', '', 'CSV con las columnas de la hoja BD, listo para pegar')}
        ${row(ICON.download, 'Descargar respaldo', 'export-json', '', 'Copia completa en JSON')}
        <label class="li menu-li"><span class="kpi-ic violet">${ICON.upload}</span><div class="grow"><div class="title">Importar respaldo</div><div class="sub">Desde un archivo JSON</div></div><input type="file" accept="application/json,.json" data-change="import" hidden></label>
      </div>
      ${cardSesiones()}
      ${avisosCard(false)}
      ${S.mode === 'remote' ? `<button class="btn danger section" style="width:100%" data-act="logout">${ICON.out}<span>Cerrar sesión</span></button>` : ''}
      <p class="tiny muted" style="text-align:center;margin-top:16px">Versión ${esc(BUILD)}</p>`;
  }

  // Decisión de apertura: dos semanas antes del inicio, abrir, aplazar o cancelar
  function cardDecision(p) {
    const i = itemsDe(p.id).find(x => x.clave === 'decision_apertura' && abierto(x));
    if (!i || p.estado !== 'activo') return '';
    const t = today(), f = i.fecha_limite, dias = f ? diffDays(f, t) : null;
    if (dias !== null && dias > 21) return ''; // aparece en las tres semanas previas; antes vive en el checklist
    const cuando = f ? (dias > 0 ? `Toca el ${fmtDate(f)} (en ${plural(dias, 'día')})` : dias === 0 ? 'Toca hoy' : `Estaba para el ${fmtDate(f)}`) : 'Define la fecha de inicio para calcularla';
    return `<div class="card pad decision ${f && dias <= 0 ? 'due' : ''} section">
      <div class="row"><span class="kpi-ic ${f && dias <= 0 ? 'amber' : 'violet'}">${ICON.flag}</span><div class="grow"><h2>Decisión de apertura</h2><p class="small muted" style="margin:2px 0 0">${cuando}. Revisa los inscritos con la asistente.</p></div></div>
      <div class="dec-btns">
        <button class="btn primary" data-act="dec-abre" data-id="${p.id}">Abre</button>
        <button class="btn" data-act="dec-aplaza" data-id="${p.id}">Aplazar</button>
        <button class="btn danger" data-act="dec-cancela" data-id="${p.id}">Cancelar</button>
      </div></div>`;
  }
  function formAplazar(p) {
    modal(`<form data-form="aplazar" data-id="${p.id}">${sheetHead('Aplazar el programa')}
      <p class="small muted" style="margin-top:-6px">Con la fecha nueva, Rumbo recalcula todos los pasos pendientes y sus avisos.</p>
      <div class="two">${fld('Nuevo inicio', inp('fecha_inicio', '', 'type="date" required'))}${fld('Nuevo fin', inp('fecha_fin', '', 'type="date"'))}</div>
      ${fld('Motivo <span class="muted">(opcional)</span>', `<textarea class="input" name="motivo" rows="2" placeholder="Ej.: 6 inscritos de 12 necesarios"></textarea>`)}
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Aplazar</button></div></form>`);
  }

  // Tarjeta con los datos del Cuadro Maestro: qué está y qué falta
  function cardCM(p) {
    const falt = faltantesCM(p), tot = TOTAL_CM(p), ok = Math.max(0, tot - falt.length), pct = Math.round(ok * 100 / tot);
    const fact = (l, v) => `<div class="fact"><span>${l}</span><b>${v || v === 0 ? esc(v) : '<em class="muted">Falta</em>'}</b></div>`;
    const fechas = p.fecha_inicio ? `${fmtDate(p.fecha_inicio)}${p.fecha_fin ? ' a ' + fmtDate(p.fecha_fin) : ''}` : '';
    return `<div class="card pad cm section">
      <div class="row between"><div><h2>Cuadro Maestro</h2><p class="small muted" style="margin:2px 0 0">${falt.length ? `${ok} de ${tot} datos listos` : 'Datos completos'}</p></div>
        <button class="btn sm" data-act="edit-cm" data-id="${p.id}">${ICON.edit}<span>${falt.length ? 'Completar' : 'Editar'}</span></button></div>
      <div class="bar" style="margin:10px 0 4px"><i style="width:${pct}%"></i></div>
      ${falt.length ? `<div class="miss" data-act="edit-cm" data-id="${p.id}" role="button">${falt.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
      <div class="facts">
        ${fact('Tipo', esAbierta(p) ? 'ABIERTO' : 'CERRADO')}${fact('Tipo de programa', tipoLabel(p))}${fact('Empresa', esAbierta(p) ? 'Oferta abierta' : entidadDe(p)?.nombre)}
        ${fact('Fechas', fechas)}${fact('Trimestre', trimestreCM(p))}${fact('Facultad', p.facultad)}${fact('Modalidad', p.modalidad)}${fact('Plataforma', p.plataforma)}
        ${fact('Intensidad horaria', p.horas ? p.horas + ' h' : '')}${fact('Director', p.director)}${fact('Matriculados', p.participantes)}
        ${fact(esAbierta(p) ? 'Valor por persona' : 'Valor programa', money(esAbierta(p) ? p.valor_persona : p.valor_total))}
        ${fact('Ingresos', money(ingresosCM(p)))}${fact('Facturado', money(facturadoCM(p)) || '$ 0')}${fact('Orden interna', p.orden_interna)}
        ${p.margen !== null && p.margen !== undefined && p.margen !== '' ? fact('Margen', p.margen + ' %') : ''}
      </div></div>`;
  }

  // ───────────── Ficha de programa ─────────────
  function viewPrograma() {
    const p = byId('programas', S.view.id);
    if (!p) return '<div class="card empty">Este programa no existe. <a href="#/programas">Ver programas</a></div>';
    const fs = fasesDe(p), fa = faseActual(p), ia = fs.indexOf(fa), ent = entidadDe(p), av = avance(p), t = today();
    const fact = (l, v) => v || v === 0 ? `<div class="fact"><span>${l}</span><b>${esc(v)}</b></div>` : '';
    const tab = S.view.tab;
    const abiertos = itemsDe(p.id).filter(abierto);
    const venc = abiertos.filter(i => i.fecha_limite && i.fecha_limite < t && i.estado !== 'esperando').length;
    const segs = abiertos.filter(i => i.estado === 'esperando').length;
    const dIni = p.fecha_inicio ? diffDays(p.fecha_inicio, t) : null;
    const tb = (k, l) => `<button class="${tab === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${l}</button>`;
    let content;
    if (tab === 'bitacora') content = tabBitacora(p);
    else if (tab === 'documentos') content = tabDocumentos(p);
    else if (tab === 'contactos') content = tabContactos(p);
    else if (tab === 'dinero') content = tabDinero(p);
    else content = tabChecklist(p);
    const mods = (p.modulos || []).map(id => byId('modulos', id)?.nombre).filter(Boolean);
    const sem = semaforo(p);
    return `
      <div class="page-head"><button class="btn ghost back" data-act="nav" data-to="programas">${ICON.back}<span>Programas</span></button>
        <div class="row"><select class="input" style="width:auto" data-change="prog-estado" data-id="${p.id}" aria-label="Estado en el Cuadro Maestro">${opts(ESTADOS_CM, p.estado_cm || 'Proyección')}</select>
        <button class="icon-btn" data-act="edit-prog" data-id="${p.id}" aria-label="Editar programa">${ICON.edit}</button></div></div>
      <div class="card phead">
        <div class="row" style="align-items:center;gap:14px">
          ${ring(av.pct, 76, 8)}
          <div class="grow" style="min-width:0"><h1>${esc(p.nombre)}</h1>
            <div class="muted small" style="margin-top:4px">${esc(empresaTxt(p))} · ${esc(rutaDe(p)?.nombre || '')}${mods.length ? ' + ' + esc(mods.join(', ')) : ''}</div>
            ${SEM_TXT[sem] && p.estado === 'activo' ? `<span class="pill ${SEM_PILL[sem]}" style="margin-top:8px">${SEM_TXT[sem]}</span>` : ''}</div>
        </div>
        ${p.estado === 'perdido' && p.motivo_perdida ? `<p class="small" style="color:var(--red)">Motivo: ${esc(p.motivo_perdida)}</p>` : ''}
        <div class="mini-kpis">
          <div><b>${av.d}/${av.n}</b><span>Esenciales</span></div>
          <div class="${venc ? 'red' : ''}"><b>${venc}</b><span>Vencidos</span></div>
          <div class="${segs ? 'amber' : ''}"><b>${segs}</b><span>Esperando</span></div>
          <div><b>${dIni === null ? '—' : dIni > 0 ? dIni : dIni === 0 ? 'Hoy' : 'En curso'}</b><span>${dIni !== null && dIni > 0 ? 'Días al inicio' : 'Inicio'}</span></div>
        </div>
        <div class="stepper">${fs.map((f, i) => `<div class="step ${f === fa ? 'now' : (ia === -1 || i < ia) ? 'done' : ''}"><i></i>${esc(f)}</div>`).join('')}</div>
        ${p.notas ? `<p class="small muted" style="white-space:pre-wrap;margin:12px 0 0">${esc(p.notas)}</p>` : ''}
      </div>
      ${cardDecision(p)}
      ${cardCM(p)}
      <div class="tabs">${tb('checklist', `Checklist <span>${abiertos.length}</span>`)}${tb('bitacora', 'Bitácora')}${tb('documentos', 'Documentos')}${tb('contactos', 'Contactos')}${tb('dinero', 'Facturación')}</div>
      ${content}`;
  }

  function tabChecklist(p) {
    const fs = fasesDe(p), fa = faseActual(p), list = itemsOrdenados(p);
    const head = `<div class="row between" style="margin-bottom:10px">
      <label class="small muted row"><input type="checkbox" data-change="hide-done" ${S.hideDone ? 'checked' : ''}> Ocultar hechos</label>
      <div class="row"><button class="btn sm ghost" data-act="regen" data-id="${p.id}">Rehacer con plantilla</button><button class="btn sm" data-act="recalc" data-id="${p.id}">Recalcular fechas</button></div></div>`;
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
    return `<div class="page-head"><button class="btn ghost back" data-act="nav" data-to="mas">${ICON.back}<span>Más</span></button></div><h1>Plantillas</h1>
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
    const puedeVolver = () => isOpen() || S.view.name === 'programa' || S.view.name === 'plantillas';
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
        setTimeout(() => { S.navBack = true; if (history.length > 1) history.back(); else go(S.view.name === 'plantillas' ? 'mas' : 'programas'); }, 180);
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
  const seg = (name, list, val) => `<input type="hidden" name="${name}" value="${esc(val)}"><div class="seg${list.length > 3 ? ' pills-seg' : ''}">${list.map(([v, l]) =>
    `<button type="button" class="${v === val ? 'on' : ''}" data-act="seg" data-name="${name}" data-v="${v}">${l}</button>`).join('')}</div>`;
  function applyShow(form, val) {
    form.querySelectorAll('[data-show]').forEach(el => { el.hidden = !el.dataset.show.split(' ').includes(val); });
  }

  function formPrograma(p) {
    const nuevo = !p; p = p || {};
    const rutas = [...S.data.rutas].sort((a, b) => a.orden - b.orden);
    const mods = [...S.data.modulos].sort((a, b) => a.orden - b.orden);
    const ents = [...S.data.entidades].sort((a, b) => a.nombre.localeCompare(b.nombre));
    const rClave = nuevo ? 'cerrado' : claveRuta(p);
    const dl = `<datalist id="dl-ent">${ents.map(e => `<option value="${esc(e.nombre)}">`).join('')}</datalist>`;
    const empresa = fld('Empresa', inp('empresa', entidadDe(p)?.nombre || '', 'list="dl-ent" autocomplete="off" placeholder="Ej.: Solventum"'), 'cerrado aval');
    const tipo = fld('Tipo de programa', seg('tipo_programa', TIPOS_CM, String(p.tipo_programa || '1')));
    const modulos = `<details class="more"${nuevo ? '' : ' open'}><summary>Módulos <span class="muted small">(opcional)</span></summary>
      <div class="choice" style="margin-top:8px">${mods.map(m => `<label><input type="checkbox" name="modulos" value="${m.id}" ${(p.modulos || []).includes(m.id) ? 'checked' : ''}><div><b>${esc(m.nombre)}</b><div class="small muted">${esc(m.descripcion || '')}</div></div></label>`).join('')}</div></details>`;
    if (nuevo) {
      modal(`<form data-form="programa" data-id="">
        ${sheetHead('Nuevo programa')}
        ${fld('Nombre del programa', inp('nombre', '', 'required autofocus placeholder="Ej.: Curso Accesos Vasculares Seguros"'))}
        ${fld('Ruta', `<input type="hidden" name="ruta_id" value="${rutas.find(r => r.clave === 'cerrado')?.id || rutas[0]?.id || ''}">
          <div class="seg" data-seg-ruta>${rutas.map(r => `<button type="button" class="${r.clave === 'cerrado' ? 'on' : ''}" data-act="seg-ruta" data-id="${r.id}" data-clave="${r.clave}">${esc(r.nombre)}</button>`).join('')}</div>`)}
        ${empresa}${dl}
        ${tipo}
        <div class="two">${fld('¿Es nuevo?', seg('es_nuevo', [['1', 'Nuevo'], ['0', 'Nueva cohorte']], '1'))}
          ${fld('Modalidad', `<select class="input" name="modalidad">${opts(MODALIDADES, '', 'Por definir')}</select>`)}</div>
        <div class="two">${fld('Inicio <span class="muted">(opcional)</span>', inp('fecha_inicio', '', 'type="date"'))}${fld('Fin <span class="muted">(opcional)</span>', inp('fecha_fin', '', 'type="date"'))}</div>
        ${modulos}
        <p class="tiny muted">Con las fechas, Rumbo calcula los pasos y te avisa en los momentos clave. Si es nuevo, incluye el Consejo de Investigación y Extensión y el montaje en Sala desde cero; si es nueva cohorte, solo el nuevo grupo. Lo demás del Cuadro Maestro lo completas cuando lo tengas.</p>
        <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Crear programa</button></div>
      </form>`);
      applyShow($('#modal-root form'), rClave);
      return;
    }
    const valorLbl = esAbierta(p) ? 'Valor por persona (COP)' : esAval(p) ? 'Valor total del programa del aliado (COP)' : 'Valor del programa (COP)';
    modal(`<form data-form="programa" data-id="${p.id}">
      ${sheetHead('Datos del Cuadro Maestro')}
      <p class="small muted" style="margin-top:-6px">Ruta: <b>${esc(rutaDe(p)?.nombre || '')}</b> · Tipo <b>${esAbierta(p) ? 'ABIERTO' : 'CERRADO'}</b> · Gestor y línea se ponen solos.</p>
      <h4 class="fsec">General</h4>
      ${fld('Nombre del programa', inp('nombre', p.nombre, 'required'))}
      <div class="two">${fld('Nombre corto', inp('nombre_corto', p.nombre_corto, 'placeholder="Para listas"'))}
        ${fld('Estado', `<select class="input" name="estado_cm">${opts(ESTADOS_CM, p.estado_cm || 'Proyección')}</select>`)}</div>
      ${empresa}${dl}
      ${tipo}
      ${fld('¿Es nuevo?', seg('es_nuevo', [['1', 'Programa nuevo'], ['0', 'Nueva cohorte']], p.es_nuevo === false ? '0' : '1'))}
      <h4 class="fsec">Fechas</h4>
      <div class="two">${fld('Inicio', inp('fecha_inicio', p.fecha_inicio, 'type="date"'))}${fld('Fin', inp('fecha_fin', p.fecha_fin, 'type="date"'))}</div>
      <h4 class="fsec">Académico</h4>
      <div class="two">${fld('Facultad', `<select class="input" name="facultad">${opts(FACULTADES, p.facultad, 'Elegir…')}</select>`)}
        ${fld('Modalidad', `<select class="input" name="modalidad">${opts(MODALIDADES, p.modalidad, 'Elegir…')}</select>`)}</div>
      <div class="two">${fld('Intensidad horaria', inp('horas', p.horas, 'type="number" min="0" step="any" inputmode="decimal"'))}
        ${fld('Plataforma', `<select class="input" name="plataforma">${opts(PLATAFORMAS.includes(p.plataforma) || !p.plataforma ? PLATAFORMAS : [...PLATAFORMAS, p.plataforma], p.plataforma, 'Elegir…')}</select>`)}</div>
      ${fld('Nombre del director', inp('director', p.director))}
      ${fld('Programa académico <span class="muted">(opcional)</span>', inp('programa_academico', p.programa_academico, 'placeholder="Ej.: Especialización en Enfermería Oncológica"'))}
      <h4 class="fsec">Comercial</h4>
      <div class="two">${fld('Matriculados', inp('participantes', p.participantes, 'type="number" min="0" inputmode="numeric"'))}
        ${fld(valorLbl, inp(esAbierta(p) ? 'valor_persona' : 'valor_total', esAbierta(p) ? p.valor_persona : p.valor_total, 'inputmode="numeric"'))}</div>
      ${esAval(p) ? fld('% del aval para la universidad', inp('porcentaje_aval', p.porcentaje_aval ?? 15, 'type="number" min="0" max="100" step="any"')) : ''}
      <p class="small calc">Ingresos para el Cuadro Maestro: <b data-ingresos>${money(ingresosCM(p)) || '$ 0'}</b>
        <span class="muted tiny">${esAval(p) ? '(valor × % del aval)' : esAbierta(p) ? '(valor por persona × matriculados)' : '(valor del programa)'}</span></p>
      <div class="two">${fld('Orden interna', inp('orden_interna', p.orden_interna))}${fld('Margen de contribución (%)', inp('margen', p.margen, 'type="number" step="any"'))}</div>
      ${fld('Segmento <span class="muted">(opcional)</span>', inp('segmento', p.segmento))}
      ${fld('Ingresos, solo si difieren del cálculo <span class="muted">(opcional)</span>', inp('ingresos', p.ingresos, 'inputmode="numeric" placeholder="Déjalo vacío para usar el cálculo"'))}
      <h4 class="fsec">Seguimiento</h4>
      ${modulos}
      ${fld('Notas', `<textarea class="input" name="notas" rows="3">${esc(p.notas || '')}</textarea>`)}
      <div class="sheet-actions">
        <button type="button" class="btn danger left" data-act="del-prog" data-id="${p.id}">Eliminar</button>
        <button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button>
      </div></form>`);
    applyShow($('#modal-root form'), rClave);
  }

  function formItem(i) {
    const p = byId('programas', i.programa_id);
    const activos = S.data.programas.filter(x => x.estado === 'activo' || x.id === i.programa_id).sort((a, b) => nombreProg(a).localeCompare(nombreProg(b)));
    modal(`<form data-form="item" data-id="${i.id}">
      ${sheetHead(p ? 'Paso' : 'Tarea')}
      ${p ? `<p class="small muted" style="margin-top:-6px"><a href="#/programa/${p.id}">${esc(p.nombre)}</a></p>` : ''}
      ${fld('Título', inp('titulo', i.titulo, 'required'))}
      ${fld('Estado', seg('estado', Object.entries(ESTADOS_ITEM), i.estado))}
      <h4 class="fsec">Mi día</h4>
      <div class="two">${fld('Hacerlo el', inp('plan_fecha', i.plan_fecha, 'type="date"'))}${fld('Hora', inp('hora', i.hora ? i.hora.slice(0, 5) : '', 'type="time"'))}</div>
      <div class="chips" style="margin:-4px 0 12px">
        <button type="button" class="chip" data-act="plan-rapido" data-d="${today()}">Hoy</button>
        <button type="button" class="chip" data-act="plan-rapido" data-d="${addDays(today(), 1)}">Mañana</button>
        <button type="button" class="chip" data-act="plan-rapido" data-d="${(() => { const x = parse(today()); x.setDate(x.getDate() + ((8 - x.getDay()) % 7 || 7)); return isoOf(x); })()}">Próximo lunes</button>
        <button type="button" class="chip" data-act="plan-rapido" data-d="">Sin fecha</button>
      </div>
      ${fld('Recordarme', `<input class="input" name="recordar" type="datetime-local" value="${esc(i.recordado_at ? '' : localDT(i.recordar_at))}">`)}
      <div class="chips" style="margin:-4px 0 12px">
        <button type="button" class="chip" data-act="rec-rapido" data-v="hora">A la hora planeada</button>
        <button type="button" class="chip" data-act="rec-rapido" data-v="1h">En 1 hora</button>
        <button type="button" class="chip" data-act="rec-rapido" data-v="manana">Mañana 8:00 a. m.</button>
        <button type="button" class="chip" data-act="rec-rapido" data-v="">Sin aviso</button>
      </div>
      <h4 class="fsec">Detalle</h4>
      ${p ? `<div class="two">${fld('Fase', `<select class="input" name="fase">${opts(fasesDe(p), i.fase)}</select>`)}
        ${fld('Responsable', `<select class="input" name="responsable">${opts(ACTORES.includes(i.responsable) || !i.responsable ? ACTORES : [...ACTORES, i.responsable], i.responsable || 'Yo')}</select>`)}</div>`
        : fld('Programa <span class="muted">(opcional)</span>', `<select class="input" name="programa_id">${opts(activos.map(x => [x.id, nombreProg(x)]), '', 'Ninguno, es una tarea personal')}</select>`)}
      <div class="two">${fld('Esperando a', `<select class="input" name="esperando_a">${opts(ACTORES.filter(a => a !== 'Yo'), i.esperando_a || 'Cliente')}</select>`, 'esperando')}
        ${fld('Fecha de seguimiento', inp('fecha_seguimiento', i.fecha_seguimiento || addDays(today(), 3), 'type="date"'), 'esperando')}</div>
      ${fld('Fecha límite', inp('fecha_limite', i.fecha_limite, 'type="date"'))}
      ${fld('Enlace de evidencia (OneDrive, correo, SharePoint)', inp('enlace', i.enlace, 'type="url" placeholder="https://"'))}
      ${fld('Nota', `<textarea class="input" name="nota" rows="3">${esc(i.nota || '')}</textarea>`)}
      ${p ? `<label class="small row"><input type="checkbox" name="esencial" ${i.esencial ? 'checked' : ''}> Esencial (define la fase actual y el semáforo)</label>` : ''}
      <div class="sheet-actions"><button type="button" class="btn danger left" data-act="del-item" data-id="${i.id}">Eliminar</button>
        <button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div>
    </form>`);
    applyShow($('#modal-root form'), i.estado);
  }

  function formCaptura() {
    const activos = S.data.programas.filter(p => p.estado === 'activo').sort((a, b) => nombreProg(a).localeCompare(nombreProg(b)));
    const actual = S.view.name === 'programa' ? S.view.id : '';
    const dia = S.view.name === 'hoy' && S.dia ? S.dia : today();
    modal(`<form data-form="captura">
      ${sheetHead('Captura rápida')}
      ${fld('Qué es', seg('tipo', [['tarea', 'Tarea'], ['esperando', 'Esperando a'], ['nota', 'Nota']], 'tarea'))}
      ${fld('Texto', `<textarea class="input" name="texto" rows="2" required autofocus placeholder="Ej.: Llamar a Diana por la orden de compra"></textarea>`)}
      ${fld('Programa', `<select class="input" name="programa_id">${opts(activos.map(p => [p.id, nombreProg(p)]), actual, 'Ninguno, tarea personal')}</select>`)}
      <div class="two">${fld('Para el', inp('plan_fecha', dia, 'type="date"'), 'tarea')}${fld('Hora <span class="muted">(opcional)</span>', inp('hora', '', 'type="time"'), 'tarea')}</div>
      <div class="two">${fld('Esperando a', `<select class="input" name="esperando_a">${opts(ACTORES.filter(a => a !== 'Yo'), 'Cliente')}</select>`, 'esperando')}
        ${fld('Hacer seguimiento el', inp('fecha_seguimiento', addDays(today(), 3), 'type="date"'), 'esperando')}</div>
      <label class="small row" data-show="tarea esperando" style="margin-bottom:12px"><input type="checkbox" name="avisar" checked> Avisarme (a la hora elegida o a las 8:00 a. m.)</label>
      <p class="tiny muted" data-show="nota">La nota queda en la bitácora del programa elegido.</p>
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
    modal(`<form data-form="perdido" data-id="${p.id}">${sheetHead('Programa cancelado')}
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
        <p class="tiny muted" style="text-align:center">Versión ${esc(BUILD)}</p>
      </div>`);
  }

  // ───────────── Exportar / importar ─────────────
  function exportCSV() {
    // Mismas columnas de la hoja BD del Cuadro Maestro, en ese orden, para pegar directo.
    const cols = ['Gestor', 'Línea de negocio', 'Tipo', 'Mes', 'Día', 'Mes', 'Día', 'Orden interna', 'Nombre del programa', 'Empresa', 'Estado',
      'Matriculados', 'Intensidad horaria', 'Valor programa', 'Ingresos', 'Facturado', 'Facultad UEB', 'Programa', 'Nombre del director', 'Modalidad',
      'Plataforma', 'Tipo programa', 'Segmento', 'Trimestre'];
    const mes = d => d ? MESES_CM[parse(d).getMonth()] : '', dia = d => d ? parse(d).getDate() : '';
    const rows = S.data.programas.map(p => [GESTOR, LINEA, esAbierta(p) ? 'ABIERTO' : 'CERRADO', mes(p.fecha_inicio), dia(p.fecha_inicio), mes(p.fecha_fin), dia(p.fecha_fin),
      p.orden_interna, p.nombre, esAbierta(p) ? 'OFERTA ABIERTA' : (entidadDe(p)?.nombre || ''), p.estado_cm || 'Proyección',
      p.participantes, p.horas, esAbierta(p) ? p.valor_persona : p.valor_total, ingresosCM(p) || '', facturadoCM(p) || '', p.facultad, p.programa_academico,
      p.director, p.modalidad, p.plataforma, p.tipo_programa, p.segmento, trimestreCM(p)]);
    const cell = v => { const x = String(v ?? ''); return /[;"\n\r]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    download(`cuadro-maestro-${today()}.csv`, '\ufeff' + [cols, ...rows].map(r => r.map(cell).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
    toast('CSV con las columnas del Cuadro Maestro');
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
    'nav-programas': () => go('programas'),
    dia(el) { S.dia = el.dataset.d; render(); },
    async mover(el) {
      const i = byId('items', el.dataset.id), d = el.dataset.d;
      const patch = { plan_fecha: d };
      if (i.estado === 'esperando') { patch.fecha_seguimiento = d; delete patch.plan_fecha; }
      if (i.recordar_at && !i.recordado_at && i.hora) patch.recordar_at = aRecordar(d, i.hora);
      await db.update('items', i.id, patch); render(); toast(d === today() ? 'Para hoy' : 'Movido a ' + relDate(d).toLowerCase());
    },
    'plan-rapido'(el) { const f = el.closest('form'); f.plan_fecha.value = el.dataset.d; },
    'rec-rapido'(el) {
      const f = el.closest('form'), v = el.dataset.v, out = f.recordar;
      if (!v) { out.value = ''; return; }
      if (v === '1h') { const x = new Date(Date.now() + 3600e3); out.value = `${isoOf(x)}T${pad(x.getHours())}:${pad(x.getMinutes())}`; return; }
      if (v === 'manana') { out.value = `${addDays(today(), 1)}T08:00`; return; }
      if (!f.plan_fecha.value) { toast('Primero elige el día'); return; }
      out.value = `${f.plan_fecha.value}T${f.hora.value || '08:00'}`;
    },
    async 'dec-abre'(el) {
      const p = byId('programas', el.dataset.id), i = itemsDe(p.id).find(x => x.clave === 'decision_apertura' && abierto(x));
      if (i) await db.update('items', i.id, { estado: 'hecho', fecha_hecho: today() });
      await db.update('programas', p.id, { estado_cm: p.estado_cm === 'Aplazado' ? 'Proyección' : p.estado_cm, estado: 'activo', actualizado: nowIso() });
      await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Decisión', resumen: 'Se confirma la apertura del programa. Pasará a Iniciado en el Cuadro Maestro el día del inicio.', proxima_accion: 'Enviar listado al director y bienvenida a los participantes.' });
      render(); toast('Apertura confirmada');
    },
    'dec-aplaza': el => formAplazar(byId('programas', el.dataset.id)),
    async 'dec-cancela'(el) {
      const p = byId('programas', el.dataset.id);
      if (!confirm('¿Cancelar este programa? Quedará como Cancelado en el Cuadro Maestro hasta definir una nueva cohorte. Rumbo te deja hoy las tareas de notificación.')) return;
      const n = nombreProg(p), base = { programa_id: null, fase: null, orden: 0, estado: 'pendiente', esperando_a: null, fecha_seguimiento: null, fecha_limite: null,
        plan_fecha: today(), hora: null, recordar_at: null, recordado_at: null, fecha_hecho: null, enlace: null, nota: null, esencial: false, dias_ref: null, dias_rel: null };
      await db.insert('items', [
        { ...base, titulo: `Pedir a la asistente la notificación de no apertura a los participantes · ${n}`, responsable: 'Asistente administrativa' },
        { ...base, titulo: `Notificar la no apertura al gestor de facultad, al director y al decano · ${n}`, responsable: 'Yo' },
      ]);
      const i = itemsDe(p.id).find(x => x.clave === 'decision_apertura' && abierto(x));
      if (i) await db.update('items', i.id, { estado: 'hecho', fecha_hecho: today() });
      await db.update('programas', p.id, { estado_cm: 'Cancelado', estado: 'perdido', actualizado: nowIso() });
      await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Decisión', resumen: 'Programa cancelado por inscripciones insuficientes. Queda pendiente definir una nueva cohorte.', proxima_accion: 'Notificar la no apertura.' });
      render(); formPerdido(byId('programas', p.id));
    },
    async regen(el) {
      const p = byId('programas', el.dataset.id);
      if (!confirm('¿Rehacer el checklist con la plantilla vigente? Se conservan los pasos hechos, en curso o en espera, y los que agregaste tú; el resto se reemplaza.')) return;
      const its = itemsDe(p.id);
      const conservar = i => i.estado !== 'pendiente' && i.estado !== 'no_aplica' || (i.orden || 0) >= 900 || i.nota || i.enlace;
      for (const i of its.filter(i => !conservar(i))) await db.remove('items', i.id);
      const ya = new Set(itemsDe(p.id).map(i => i.titulo.trim().toLowerCase()));
      const nuevos = generarItems(p, p.modulos || [], true).filter(i => !ya.has(i.titulo.trim().toLowerCase()));
      await db.insert('items', nuevos); await touch(p.id); render(); toast(`Checklist actualizado: ${plural(nuevos.length, 'paso')}`);
    },
    async 'ses-del'(el) {
      if (!confirm('¿Eliminar esta sesión de cierre?')) return;
      await db.remove('sesiones_cierre', el.dataset.id);
      const n = await recalcularCierres(); render(); if (n) toast(`${plural(n, 'paso movido', 'pasos movidos')}`);
    },
    'av-on': () => avEnable(),
    'av-off': () => avDisable(),
    'av-test': () => avTest(),
    'nav-calendario': () => go('calendario'),
    'cal-dia'(el) { S.cal.dia = el.dataset.d; render(); },
    'cal-mes'(el) {
      const [y, m] = S.cal.mes.split('-').map(Number), d = new Date(y, m - 1 + Number(el.dataset.n), 1);
      S.cal.mes = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      S.cal.dia = S.cal.mes === today().slice(0, 7) ? today() : S.cal.mes + '-01'; render();
    },
    'cal-hoy'() { S.cal = { mes: today().slice(0, 7), dia: today() }; render(); },
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
      if (['estado', 'tipo'].includes(el.dataset.name)) applyShow(form, el.dataset.v);
    },
    'seg-ruta'(el) {
      const form = el.closest('form');
      form.querySelector('input[name="ruta_id"]').value = el.dataset.id;
      el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
      applyShow(form, el.dataset.clave);
    },
    'edit-cm': el => formPrograma(byId('programas', el.dataset.id)),
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

  // El día del inicio, el programa pasa a Iniciado en el Cuadro Maestro (si la apertura ya se confirmó o no requiere decisión).
  async function iniciarProgramasDelDia() {
    const t = today();
    for (const p of S.data.programas.filter(x => x.estado === 'activo' && x.fecha_inicio && x.fecha_inicio <= t && ['Proyección', 'Negociación'].includes(x.estado_cm || 'Proyección'))) {
      const dec = itemsDe(p.id).find(i => i.clave === 'decision_apertura');
      if (dec && abierto(dec)) continue;
      await db.update('programas', p.id, { estado_cm: 'Iniciado', actualizado: nowIso() });
      await db.insert('bitacora', { programa_id: p.id, fecha: t, tipo: 'Decisión', resumen: `Inició el ${fmtDate(p.fecha_inicio)}. Estado en el Cuadro Maestro: Iniciado.`, proxima_accion: null });
    }
  }
  // Cuando cambian las sesiones de cierre, se mueven los pasos de cierre y liquidación de los programas activos
  async function recalcularCierres() {
    let n = 0;
    for (const p of S.data.programas.filter(x => x.estado === 'activo')) {
      for (const i of itemsDe(p.id).filter(i => abierto(i) && (i.dias_ref === 'sesion' || i.dias_ref === 'v20'))) {
        const f = calcFecha(p, i.dias_ref, i.dias_rel);
        if (f && f !== i.fecha_limite) {
          const patch = { fecha_limite: f };
          if (i.recordar_at && !i.recordado_at && !i.hora) { const r = aRecordar(f, '08:00'); patch.recordar_at = new Date(r) > new Date() ? r : null; }
          await db.update('items', i.id, patch); n++;
        }
      }
    }
    return n;
  }
  async function recalcular(p) {
    let n = 0;
    for (const i of itemsDe(p.id).filter(i => abierto(i) && i.dias_ref)) {
      const f = calcFecha(p, i.dias_ref, i.dias_rel);
      if (f && f !== i.fecha_limite) {
        const patch = { fecha_limite: f };
        if (i.recordar_at && !i.recordado_at && !i.hora) { const r = aRecordar(f, '08:00'); patch.recordar_at = new Date(r) > new Date() ? r : null; }
        await db.update('items', i.id, patch); n++;
      }
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
      const ruta = byId('rutas', id ? byId('programas', id).ruta_id : d.ruta_id);
      const abierta = ruta?.clave === 'abierta';
      // Empresa: se busca por nombre; si no existe se crea. En oferta abierta no aplica.
      let entidad_id = null;
      if (!abierta && d.empresa && d.empresa.trim()) {
        entidad_id = (entidadPorNombre(d.empresa) || await db.insert('entidades', clean({ nombre: d.empresa.trim() }))).id;
      }
      if (!id) {
        if (!d.ruta_id) { toast('Elige una ruta'); return; }
        if (!abierta && !entidad_id) { toast('Escribe la empresa'); f.empresa?.focus(); return; }
        const row = clean({ nombre: d.nombre, tipo_programa: d.tipo_programa, fecha_inicio: d.fecha_inicio, fecha_fin: d.fecha_fin, modalidad: d.modalidad });
        Object.assign(row, { ruta_id: d.ruta_id, entidad_id, modulos: mods, es_nuevo: d.es_nuevo !== '0', estado: 'activo', estado_cm: 'Proyección', prioridad: 'media', actualizado: nowIso() });
        const p = await db.insert('programas', row);
        await db.insert('items', generarItems(p, mods, true));
        await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Nota', resumen: 'Programa creado en Rumbo.', proxima_accion: null });
        closeModal(); go('programa', p.id); toast('Programa creado');
        return;
      }
      const p = byId('programas', id);
      const row = clean({
        nombre: d.nombre, nombre_corto: d.nombre_corto, estado_cm: d.estado_cm, tipo_programa: d.tipo_programa, fecha_inicio: d.fecha_inicio, fecha_fin: d.fecha_fin,
        facultad: d.facultad, modalidad: d.modalidad, horas: d.horas, plataforma: d.plataforma, director: d.director, programa_academico: d.programa_academico,
        participantes: d.participantes, valor_total: d.valor_total, valor_persona: d.valor_persona, porcentaje_aval: d.porcentaje_aval,
        orden_interna: d.orden_interna, margen: d.margen, segmento: d.segmento, ingresos: d.ingresos, notas: d.notas,
      });
      if (!abierta) row.entidad_id = entidad_id;
      row.modulos = mods; row.actualizado = nowIso(); row.es_nuevo = d.es_nuevo !== '0';
      if (row.estado_cm) row.estado = CM_A_ESTADO[row.estado_cm] || 'activo';
      if (!abierta && row.valor_total && row.participantes) row.valor_persona = Math.round(row.valor_total / row.participantes);
      if (abierta && row.valor_persona && row.participantes) row.valor_total = row.valor_persona * row.participantes;
      const antes = { ini: p.fecha_inicio, fin: p.fecha_fin, mods: p.modulos || [], cm: p.estado_cm };
      await db.update('programas', id, row);
      const nuevos = mods.filter(m => !antes.mods.includes(m));
      if (nuevos.length) await db.insert('items', generarItems(p, nuevos, false));
      await aplicarCondiciones(p);
      if (antes.cm !== p.estado_cm) await db.insert('bitacora', { programa_id: id, fecha: today(), tipo: 'Decisión', resumen: `Estado en el Cuadro Maestro: ${antes.cm || 'Proyección'} → ${p.estado_cm}.`, proxima_accion: null });
      let n = 0;
      if ((antes.ini !== p.fecha_inicio || antes.fin !== p.fecha_fin) && itemsDe(id).some(i => abierto(i) && i.dias_ref) &&
          confirm('Cambiaron las fechas del programa. ¿Recalcular las fechas límite de los pasos pendientes?')) n = await recalcular(p);
      closeModal(); render();
      if (p.estado_cm === 'Cancelado' && antes.cm !== 'Cancelado' && !p.motivo_perdida) return formPerdido(p);
      toast(nuevos.length ? `Guardado. Se agregaron los pasos de ${nuevos.length} módulo(s)` : n ? `Guardado. ${n} fechas recalculadas` : 'Guardado');
    },
    async item(d, f) {
      const i = byId('items', f.dataset.id);
      const patch = clean({ titulo: d.titulo, estado: d.estado, fase: d.fase, responsable: d.responsable, fecha_limite: d.fecha_limite, enlace: d.enlace, nota: d.nota,
        plan_fecha: d.plan_fecha, hora: d.hora });
      if ('esencial' in d || byId('programas', i.programa_id)) patch.esencial = d.esencial === 'on';
      if (!i.programa_id && d.programa_id) {
        const p = byId('programas', d.programa_id);
        patch.programa_id = p.id; const fa = faseActual(p), fs = fasesDe(p); patch.fase = fs.includes(fa) ? fa : fs[0]; patch.orden = 900;
      }
      if (d.estado === 'esperando') Object.assign(patch, clean({ esperando_a: d.esperando_a, fecha_seguimiento: d.fecha_seguimiento }));
      else Object.assign(patch, { esperando_a: null, fecha_seguimiento: null });
      if (d.estado === 'hecho' && i.estado !== 'hecho') patch.fecha_hecho = today();
      if (d.estado !== 'hecho') patch.fecha_hecho = null;
      const rec = d.recordar ? new Date(d.recordar).toISOString() : null;
      if (rec !== (i.recordado_at ? null : i.recordar_at)) { patch.recordar_at = rec; patch.recordado_at = null; }
      await db.update('items', i.id, patch); await touch(i.programa_id || patch.programa_id); closeModal(); render();
      if (rec && !AV.on && S.mode === 'remote') toast('Guardado. Activa los avisos en Más para recibir el recordatorio');
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
      const texto = d.texto.trim();
      if (d.tipo === 'nota') {
        if (!p) { toast('Elige el programa de la nota'); return; }
        await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Nota', resumen: texto, proxima_accion: null });
        await touch(p.id); closeModal(); render(); toast('Nota en ' + nombreProg(p)); return;
      }
      const esp = d.tipo === 'esperando';
      let fase = null;
      if (p) { const fa = faseActual(p), fs = fasesDe(p); fase = fs.includes(fa) ? fa : (fs[fs.length - 1] || 'General'); }
      const plan = esp ? null : (d.plan_fecha || null), hora = esp ? null : (d.hora || null);
      const recordar = d.avisar ? (esp ? aRecordar(d.fecha_seguimiento, '08:00') : aRecordar(plan, hora || '08:00')) : null;
      await db.insert('items', { programa_id: p ? p.id : null, fase, orden: 900, titulo: texto, estado: esp ? 'esperando' : 'pendiente', responsable: 'Yo',
        esperando_a: esp ? d.esperando_a : null, fecha_seguimiento: esp ? d.fecha_seguimiento : null, fecha_limite: null, plan_fecha: plan, hora,
        recordar_at: recordar && new Date(recordar) > new Date() ? recordar : null, recordado_at: null,
        fecha_hecho: null, enlace: null, nota: null, esencial: false, dias_ref: null, dias_rel: null });
      if (p) await touch(p.id);
      closeModal(); render(); toast(p ? 'Guardado en ' + nombreProg(p) : 'Tarea guardada');
    },
    async 'tarea-rapida'(d, f) {
      if (!d.titulo || !d.titulo.trim()) return;
      const dia = f.dataset.d, hora = d.hora || null, recordar = hora ? aRecordar(dia, hora) : null;
      await db.insert('items', { programa_id: null, fase: null, orden: 0, titulo: d.titulo.trim(), estado: 'pendiente', responsable: 'Yo', esperando_a: null,
        fecha_seguimiento: null, fecha_limite: null, plan_fecha: dia, hora, recordar_at: recordar && new Date(recordar) > new Date() ? recordar : null, recordado_at: null,
        fecha_hecho: null, enlace: null, nota: null, esencial: false, dias_ref: null, dias_rel: null });
      render();
      const again = document.querySelector('form[data-form="tarea-rapida"] input[name="titulo"]'); if (again) again.focus();
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
    async sesion(d) {
      if (!d.fecha) return;
      if (S.data.sesiones_cierre.some(x => x.fecha === d.fecha)) { toast('Esa sesión ya está'); return; }
      await db.insert('sesiones_cierre', { fecha: d.fecha, nota: null });
      const n = await recalcularCierres(); render(); toast(n ? `Sesión agregada. ${plural(n, 'paso movido', 'pasos movidos')}` : 'Sesión agregada');
    },
    async aplazar(d, f) {
      const p = byId('programas', f.dataset.id), antes = p.fecha_inicio;
      await db.update('programas', p.id, clean({ fecha_inicio: d.fecha_inicio, fecha_fin: d.fecha_fin || p.fecha_fin, estado_cm: 'Aplazado', estado: 'activo', actualizado: nowIso() }));
      const n = await recalcular(byId('programas', p.id));
      await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Decisión', resumen: `Programa aplazado: inicio ${antes ? fmtDate(antes) + ' → ' : ''}${fmtDate(d.fecha_inicio)}.${d.motivo ? ' ' + d.motivo.trim() : ''}`, proxima_accion: 'Notificar el aplazamiento a los inscritos.' });
      closeModal(); render(); toast(`Aplazado. ${plural(n, 'fecha recalculada', 'fechas recalculadas')}`);
    },
    async perdido(d, f) {
      await db.update('programas', f.dataset.id, { estado: 'perdido', estado_cm: 'Cancelado', motivo_perdida: d.motivo_perdida.trim(), actualizado: nowIso() });
      closeModal(); render();
    },
  };

  const CHANGE = {
    'f-ruta'(el) { S.f.ruta = el.value; render(); },
    'hide-done'(el) { S.hideDone = el.checked; render(); },
    async 'prog-estado'(el) {
      const p = byId('programas', el.dataset.id), cm = el.value, antes = p.estado_cm || 'Proyección';
      await db.update('programas', p.id, { estado_cm: cm, estado: CM_A_ESTADO[cm] || 'activo', actualizado: nowIso() });
      await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Decisión', resumen: `Estado en el Cuadro Maestro: ${antes} → ${cm}.`, proxima_accion: null });
      render();
      if (cm === 'Cancelado' && !p.motivo_perdida) formPerdido(p);
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

  // Tooltip del gráfico de semanas: línea vertical + punto + texto al pasar el dedo o el mouse.
  (() => {
    let tip = null;
    const hide = () => { if (tip) tip.hidden = true; document.querySelectorAll('.chart .xh').forEach(g => { g.style.display = 'none'; }); };
    const show = e => {
      const r = e.target.closest && e.target.closest('.chart rect.hit');
      if (!r) { if (e.type === 'pointerdown') hide(); return; }
      const svg = r.ownerSVGElement, g = svg.querySelector('.xh'), x = +r.dataset.x, y = +r.dataset.y;
      g.style.display = ''; g.querySelector('line').setAttribute('x1', x); g.querySelector('line').setAttribute('x2', x);
      g.querySelector('circle').setAttribute('cx', x); g.querySelector('circle').setAttribute('cy', y);
      if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); }
      const [t1, t2] = r.dataset.tip.split('|'); tip.innerHTML = `<b>${esc(t1)}</b><span>${esc(t2)}</span>`; tip.hidden = false;
      const rc = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, px = rc.left + x / vb.width * rc.width, py = rc.top + y / vb.height * rc.height;
      const w = tip.offsetWidth; tip.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, px - w / 2)) + 'px'; tip.style.top = Math.max(8, py - tip.offsetHeight - 14) + 'px';
    };
    document.addEventListener('pointermove', show);
    document.addEventListener('pointerdown', show);
    document.addEventListener('pointerout', e => { if (e.pointerType === 'mouse' && e.target.closest && e.target.closest('.chart')) hide(); });
    window.addEventListener('scroll', hide, { passive: true });
  })();

  // ───────────── Actualización (como Caudal) ─────────────
  // Al abrir la app o volver a ella, compara la versión publicada con la que está corriendo; si cambió, recarga una vez.
  async function checkVersion() {
    try {
      const v = (await (await fetch('version.json?t=' + Date.now(), { cache: 'no-store' })).json()).v;
      if (v && v !== BUILD) {
        let last = 0; try { last = +sessionStorage.getItem('rumbo.reloaded') || 0; } catch (e) { /* sin almacenamiento */ }
        if (Date.now() - last > 60000 && !isOpen()) {
          try { sessionStorage.setItem('rumbo.reloaded', String(Date.now())); } catch (e) { /* sin almacenamiento */ }
          location.reload();
        }
      }
    } catch (e) { /* sin conexión: sigue con la versión actual */ }
  }
  checkVersion();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkVersion(); });

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
      iniciarProgramasDelDia().then(() => render()).catch(fail);
      avState().then(() => { if (AV.on) render(); });
    } catch (err) {
      console.error(err);
      S.error = err.message || String(err);
    }
    render();
  }
  start();
})();
