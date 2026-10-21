'use strict';
(function () {
  // ───────────── Constantes ─────────────
  const CFG = window.RUMBO_CONFIG || {};
  const TABLES = ['rutas', 'modulos', 'plantilla_items', 'entidades', 'contactos', 'programas', 'items', 'bitacora', 'documentos', 'facturacion', 'sesiones_cierre', 'semanas'];
  const ESTADOS_ITEM = { pendiente: 'Pendiente', en_curso: 'En curso', esperando: 'Esperando', hecho: 'Hecho', no_aplica: 'No aplica' };
  const ESTADOS_PROG = { activo: 'Activo', pausa: 'En pausa', cerrado: 'Cerrado', perdido: 'Perdido' };
  // Responsables por cargo (nunca nombres propios)
  const ACTORES = ['Yo', 'Asistente administrativa', 'Auxiliar administrativa', 'Director del programa', 'Gestor de facultad', 'Gestor de comunicaciones', 'Presupuestos', 'Finanzas', 'DIDE', 'Gerente administrativo', 'Secretaría de la división', 'Cliente', 'Proveedor', 'Docente', 'Financiera', 'Facultad', 'Jurídica', 'Dirección EC'];
  const TIPOS = ['Curso', 'Diplomado', 'Seminario', 'Taller', 'Congreso', 'Jornada', 'Simposio', 'Foro', 'Microcredencial', 'Rotación', 'Certificación', 'Aval'];
  // Listas del Cuadro Maestro (hoja Listas de tu archivo)
  const FACULTADES = ['ENFERMERIA', 'MEDICINA', 'ODONTOLOGÍA', 'PSICOLOGÍA', 'SIMULACIÓN', 'ADMINISTRACIÓN', 'BIBLIOTECA', 'CENTRO DE LENGUAS', 'CIENCIAS', 'CREACIÓN Y COMUNICACIÓN', 'DERECHO', 'DIDE',
    'DIVERSIDAD, EQUIDAD E INCLUSIÓN', 'EDUCACIÓN', 'HUB Iex', 'HUMANIDADES', 'INGENIERÍA', 'VICE INVESTIGACIONES', 'OTRO'];
  const PROGRAMAS_CM = ['Enfermería', 'Medicina', 'Odontología', 'Psicología', 'Optometría', 'Instrumentación Quirúrgica', 'Química Farmacéutica', 'Simulación', 'Bioingeniería', 'Biología',
    'Administración de Empresas', 'Administración de Negocios Sostenibles', 'Administración de Producción y Logística Internacional', 'Arquitectura', 'Arte Dramático', 'Artes Plásticas',
    'Ciencia Política y Gobierno', 'Contaduría Pública', 'Derecho', 'Diseño de Comunicación', 'Diseño Industrial', 'Economía', 'Estadística', 'Filosofía', 'Finanzas', 'Formación Musical',
    'Ingeniería Ambiental', 'Ingeniería de Sistemas', 'Ingeniería Electrónica', 'Ingeniería Industrial', 'Intérprete Profesional de la Lengua de Señas Colombiana',
    'Licenciatura en Bilingüismo con Énfasis en la Enseñanza del Inglés', 'Licenciatura en Educación Infantil', 'Marketing y Transformación Digital', 'Matemáticas', 'Negocios Internacionales',
    'Especialización en Docencia de la Educación Superior', 'Especialización en Dermatología', 'Doctorado en Salud Pública', 'Otro'];
  const SEGMENTOS = ['EDUCACIÓN CONTINUA', 'BOSQUE SENIOR', 'BOSQUE KIDS & JUNIOR'];
  const LINEAS_CM = ['SECTOR SALUD & FARMA', 'BOSQUE SENIOR', 'BOSQUE KIDS & JUNIOR', 'EVENTOS Y CONGRESOS', 'SECTOR ABIERTO', 'SECTOR EMPRESAS Y CONVENIOS', 'SECTOR PÚBLICO'];
  const TIPOS_X = [['CURSOS', 'Cursos'], ['DIPLOMADOS', 'Diplomados'], ['EVENTOS', 'Eventos']];
  const MODALIDADES = ['Virtual', 'Presencial', 'Semipresencial', 'Híbrido (virtual + presencial)'];
  const TIPOS_BIT = ['Nota', 'Correo', 'Reunión', 'Llamada', 'Decisión'];
  const TIPOS_DOC = ['Propuesta', 'Presupuesto', 'Carta / OC', 'Acta', 'Aval', 'Cronograma', 'Informe', 'Factura', 'Otro'];
  const TIPOS_ENT = ['Farmacéutica', 'Dispositivos médicos', 'IPS / Clínica', 'Sociedad científica', 'Caja de compensación', 'Universidad', 'Entidad pública', 'Otra'];
  const ROLES = ['Decisor', 'Operativo', 'Facturación', 'Académico'];
  const MONEY = ['valor_total', 'valor_persona', 'valor', 'ingresos', 'facturado'];
  const NUMS = ['horas', 'participantes', 'margen', 'porcentaje_aval'];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const LS_KEY = 'rumbo-datos-v1';
  const PUSH_PUB = 'BER3W2HDUB16BCx6dLPIRmEdxPjj8elhZyUornIHZG-ghd63drn0yYYC3LTQXqr9_jIZ5FVCteC3GstvoonQXDk';
  // Cuadro Maestro (hoja BD): valores fijos de la línea y listas cerradas
  const ESTADOS_CM = ['Proyección', 'Negociación', 'Iniciado', 'Ejecutado', 'Aplazado', 'Cancelado'];
  const CM_A_ESTADO = { 'Proyección': 'activo', 'Negociación': 'activo', 'Iniciado': 'activo', 'Ejecutado': 'cerrado', 'Aplazado': 'activo', 'Cancelado': 'perdido' };
  const TIPOS_CM = [['1', 'Curso'], ['2', 'Taller'], ['3', 'Diplomado'], ['4', 'Seminario / congreso'], ['5', 'Otro']];
  const TIPO_CM_LARGO = { 1: 'Cursos y cursos especializados (certificaciones)', 2: 'Talleres', 3: 'Diplomados', 4: 'Seminarios, congresos o simposios', 5: 'Otro' };
  const PLATAFORMAS = ['Zoom', 'Meet', 'Presencial', 'Asincrónico - Ateneo', 'Aval - plataforma externa'];
  const MESES_CM = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const BUILD = '20261021065934';

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
  const norm = v => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
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
      : { ...ids, fase: it.f, titulo: it.t, responsable: it.r, dias_ref: it.ref, dias_rel: it.d, esencial: it.e, orden, condicion: it.c, repetir: it.rep, avisar: it.av, clave: it.k, hito: it.h || null };
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

  // ── Hitos: los momentos que marcan avance real del proyecto (vienen de la plantilla o los marcas tú) ──
  const hitosDe = p => itemsOrdenados(p).filter(i => i.hito && i.estado !== 'no_aplica');
  function estadoHito(i, sig) {
    if (i.estado === 'hecho') return 'ok';
    if (i.fecha_limite && i.fecha_limite < today()) return 'late';
    return sig ? 'next' : 'fut';
  }
  const proxHito = p => hitosDe(p).find(abierto) || null;
  function resumenHitos(p) { const h = hitosDe(p); return { n: h.length, d: h.filter(i => i.estado === 'hecho').length, sig: h.find(abierto) || null, tarde: h.filter(i => estadoHito(i) === 'late').length }; }
  const DIAMANTE = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 .8L11.2 6 6 11.2.8 6z"/></svg>';

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
  const facturadoCM = p => S.data.facturacion.filter(f => f.programa_id === p.id && f.estado_pago !== 'pendiente').reduce((a, f) => a + (Number(f.valor) || 0), 0) || Number(p.facturado) || 0;
  const trimestreCM = p => p.fecha_inicio ? 'T' + (Math.floor((parse(p.fecha_inicio).getMonth()) / 3) + 1) : '';
  // Campos que el Cuadro Maestro necesita y que solo tú puedes poner (en orden de cuándo suelen conocerse)
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
  const esPresencial = p => !p.modalidad || ['Presencial', 'Semipresencial', 'Híbrido (virtual + presencial)', 'Híbrida'].includes(p.modalidad);
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
          condicion: t.condicion || null, clave: t.clave || null, hito: t.hito || null,
        });
      });
    });
    return out;
  }
  // Marca como hito los pasos de programas creados antes de que existieran los hitos (por título de la plantilla).
  // Un hito que desmarcas queda con texto vacío y no se vuelve a marcar.
  async function backfillHitos() {
    const tpl = new Map();
    S.data.plantilla_items.filter(t => t.hito).forEach(t => tpl.set(norm(t.titulo), t.hito));
    if (!tpl.size) return 0;
    let n = 0;
    for (const i of S.data.items.filter(x => x.programa_id && (x.hito === null || x.hito === undefined))) {
      const h = tpl.get(norm(i.titulo));
      if (h) { await db.update('items', i.id, { hito: h }); n++; }
    }
    return n;
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
    star: I('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
    starOn: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
    list: I('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),
    board: I('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>'),
    gantt: I('<path d="M4 4v16h16"/><path d="M7 8h7M10 12h8M8 16h5" stroke-width="3"/>'),
    spark: I('<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/>'),
    review: I('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4l3 2"/>'),
    check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };

  // ───────────── Navegación ─────────────
  const VISTAS = ['inicio', 'hoy', 'programas', 'calendario', 'mas', 'plantillas', 'revision', 'completar'];
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
  const ORDEN_VISTA = { inicio: 0, hoy: 1, calendario: 2, programas: 3, mas: 4, plantillas: 5, programa: 6, revision: 7, completar: 8 };
  window.addEventListener('hashchange', () => {
    const antes = S.view.name;
    routeFromHash();
    if (S.view.name === 'completar' && antes !== 'completar') { S.compSaltados = []; S.compTotal = porCompletar().length; } closeModal(); render(); window.scrollTo(0, 0);
    // Animación corta al cambiar de pantalla: entra desde la derecha al avanzar y desde la izquierda al volver.
    // Solo al entrar a un detalle (ficha del programa, plantillas) o al volver de él, como en Caudal.
    // Entre pestañas de la barra inferior no hay animación: la pantalla cambia quieta.
    const DETALLE = ['programa', 'plantillas', 'revision', 'completar'];
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
    else if (v === 'revision') body = viewRevision();
    else if (v === 'mas') body = viewMas();
    else if (v === 'plantillas') body = viewPlantillas();
    else if (v === 'completar') body = viewCompletar();
    else body = viewInicio();
    const sec = v === 'programa' ? 'programas' : v === 'plantillas' ? 'mas' : v === 'revision' ? 'hoy' : v === 'completar' ? 'inicio' : v;
    const nb = (k, l, ic) => `<button class="${sec === k ? 'on' : ''}" data-act="nav" data-to="${k}" aria-label="${l}">${ic}<span>${l}</span></button>`;
    app.innerHTML = `
      ${S.mode === 'local' ? '<div class="banner">Modo local: los datos viven solo en este navegador.</div>' : ''}
      <aside class="side">
        <div class="brand"><span class="brand-mark">${ICON.flag}</span>Rumbo</div>
        <button class="btn primary side-new" data-act="nuevo">${ICON.plus}<span>Nuevo programa</span></button>
        <nav class="side-nav">${nb('inicio', 'Inicio', ICON.home)}${nb('hoy', 'Mi día', ICON.sun)}${nb('calendario', 'Calendario', ICON.cal)}${nb('programas', 'Programas', ICON.prog)}${nb('mas', 'Más', ICON.more)}</nav>
        <button class="side-cap" data-act="acciones">${ICON.plus}<span>Agregar o registrar</span></button>
      </aside>
      <main>${body}</main>
      <nav class="bottom-nav">
        ${nb('inicio', 'Inicio', ICON.home)}${nb('hoy', 'Mi día', ICON.sun)}${nb('calendario', 'Calendario', ICON.cal)}${nb('programas', 'Programas', ICON.prog)}${nb('mas', 'Más', ICON.more)}
      </nav>
      ${v === 'completar' ? '' : `<button class="fab" data-act="acciones" aria-label="Agregar">${ICON.plus}</button>`}`;
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
    if (i.hito && showProg) sub.unshift(`<b class="hito-t">Hito: ${esc(i.hito)}</b>`);
    if (i.nota) sub.push('con nota');
    const cls = i.estado === 'hecho' ? 'done' : i.estado === 'no_aplica' ? 'na-row' : '';
    const chk = i.estado === 'hecho' ? 'on' : i.estado === 'no_aplica' ? 'na' : '';
    return `<div class="li ${cls}" data-act="edit-item" data-id="${i.id}">
      <button class="check ${chk}" data-act="toggle" data-id="${i.id}" aria-label="Marcar como hecho">${i.estado === 'hecho' ? ICON.check : i.estado === 'no_aplica' ? '–' : ''}</button>
      <div class="grow"><div class="title">${i.hito ? `<span class="hito-ic ${estadoHito(i)}" title="Hito: ${esc(i.hito)}">${DIAMANTE}</span>` : ''}${i.prioridad && abierto(i) ? `<span class="star-on">${ICON.starOn}</span>` : ''}${esc(i.titulo)}</div>${sub.length ? `<div class="sub">${sub.join(' · ')}</div>` : ''}</div>
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
    let hitN = 0, hitD = 0;
    const proxHitos = activos.map(p => { const r = resumenHitos(p); hitN += r.n; hitD += r.d; return [p, r.sig]; }).filter(x => x[1])
      .sort((a, b) => (a[1].fecha_limite || '9999').localeCompare(b[1].fecha_limite || '9999'));
    const filaHito = ([p, h]) => { const e = estadoHito(h, true); return `<div class="li" data-act="open" data-id="${p.id}"><span class="hito-ic big ${e}">${DIAMANTE}</span>
      <div class="grow"><div class="title ellipsis">${esc(h.hito)}</div><div class="sub ellipsis">${esc(nombreProg(p))} · ${esc(h.responsable || 'Yo')}</div></div>
      ${h.fecha_limite ? `<span class="pill ${e === 'late' ? 'red' : diffDays(h.fecha_limite, t) <= 7 ? 'amber' : ''}">${relDate(h.fecha_limite)}</span>` : '<span class="pill">Sin fecha</span>'}</div>`; };
    const cartera = activos.reduce((s, p) => s + ingresosCM(p), 0);
    const incompletos = porCompletar();
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
            <p class="hero-sub">${alDia === activos.length ? 'Todo al día.' : `${plural(alDia, 'programa', 'programas')} al día, ${activos.length - alDia} con algo por atender.`}${hitN ? ` Hitos: ${hitD} de ${hitN}.` : ''}</p></div>
        </div>
        <div class="kpis">
          ${kpi(ICON.folder, 'violet', activos.length, 'Programas activos', 'nav-programas')}
          ${kpi(ICON.alert, vencido.length ? 'red' : 'green', vencido.length, 'Pasos vencidos')}
          ${kpi(ICON.wait, seguir.length ? 'amber' : 'green', seguir.length, 'Por hacer seguimiento')}
          ${kpi(ICON.clock, 'blue', semana.length, 'Vencen en 7 días', 'nav-calendario')}
        </div>
        ${cartera ? `<div class="card money-card"><span class="kpi-ic violet">${ICON.money}</span><div class="grow"><span class="muted small">Ingresos en cartera</span><b>${money(cartera)}</b></div>
          ${margen !== null ? `<div class="mg"><span class="muted small">Margen promedio</span><b>${margen} %</b></div>` : ''}</div>` : ''}
        <div class="card money-card cm-dash" data-act="${incompletos.length ? 'nav' : 'export-cm'}" data-to="completar" role="button">
          <span class="kpi-ic ${incompletos.length ? 'amber' : 'green'}">${ICON.tpl}</span>
          <div class="grow"><span class="muted small">Cuadro Maestro</span><b style="font-size:16px">${incompletos.length ? `${plural(incompletos.length, 'programa')} con datos por completar` : 'Todo listo para exportar'}</b></div>
          <span class="muted">${ICON.next}</span></div>
        <div class="quick">
          ${qa(ICON.plus, 'Nuevo programa', 'nuevo')}${qa(ICON.note, 'Registrar', 'captura')}${qa(ICON.sun, 'Mi día', 'nav', ' data-to="hoy"')}${qa(ICON.download, 'Exportar', 'export-cm')}
        </div>
      </div>
      <div class="dash-cols">
        <div>
          ${seccion('Requiere tu atención', atencion.slice(0, 6).map(i => itemRow(i)).join(''), atencion.length, 'Nada vencido ni seguimientos pendientes. Vas al día.',
            atencion.length > 6 ? '<button class="link" data-act="nav" data-to="calendario">Ver todo</button>' : '')}
          ${proxHitos.length ? seccion('Próximos hitos', proxHitos.slice(0, 6).map(filaHito).join(''), proxHitos.length, '', '<span class="tiny muted">Uno por programa</span>') : ''}
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
      .sort((a, b) => (abierto(b) - abierto(a)) || (a.hora || '99').localeCompare(b.hora || '99') || (!!b.prioridad - !!a.prioridad) || (a.created_at || '').localeCompare(b.created_at || ''));
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
    if (S.hoyModo === 'delegado') return viewDelegado();
    const sem = semanaDe(lunesDe(t)), objetivos = (sem?.objetivos || []).filter(o => o.t);
    const objCard = objetivos.length ? `<div class="card pad objetivos"><div class="row between"><h3>Objetivos de la semana</h3><button class="link" data-act="nav" data-to="revision">Revisar</button></div>
      ${objetivos.map((o, k) => `<label class="obj ${o.hecho ? 'done' : ''}"><input type="checkbox" data-change="obj" data-k="${k}" ${o.hecho ? 'checked' : ''}><span>${esc(o.t)}</span></label>`).join('')}</div>` : '';
    const revisarCard = !sem?.revisada_at && [4, 5, 6, 0].includes(new Date().getDay()) ? `<div class="card today-card" data-act="nav" data-to="revision" role="button" style="margin-top:12px">
      <span class="kpi-ic violet">${ICON.review}</span><div class="grow"><b>Revisión semanal</b><span class="small muted">15 minutos para cerrar la semana y preparar la siguiente</span></div><span class="muted">${ICON.next}</span></div>` : '';
    return `<div class="page-head"><div><p class="fecha cap">${esc(parse(d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }))}</p><h1 class="cap">${esc(titulo)}</h1></div>${avatarBtn()}</div>
      ${modoHoy()}
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
          ${objCard}${revisarCard}
          ${sugeridos.length ? seccion('Sugeridos para hoy', sugeridos.map(i => itemRow(i, true, sumar(i))).join(''), undefined, '', '<span class="tiny muted">Siguiente paso de cada programa</span>') : ''}
          ${avisosCard(true)}
        </div>
      </div>`;
  }

  const modoHoy = () => `<div class="view-switch">
    <button class="${S.hoyModo !== 'delegado' ? 'on' : ''}" data-act="hoy-modo" data-v="dia">${ICON.sun}<span>Mi día</span></button>
    <button class="${S.hoyModo === 'delegado' ? 'on' : ''}" data-act="hoy-modo" data-v="delegado">${ICON.wait}<span>Delegado</span></button>
    <button data-act="nav" data-to="revision">${ICON.review}<span>Revisión</span></button></div>`;
  // Delegado: lo que depende de otros, agrupado por cargo (para tus reuniones con la asistente, el director o Presupuestos)
  function viewDelegado() {
    const t = today();
    const its = itemsVisibles().filter(i => abierto(i) && ((i.responsable && i.responsable !== 'Yo') || i.estado === 'esperando'));
    const quien = i => i.estado === 'esperando' ? (i.esperando_a || 'Sin definir') : i.responsable;
    const fecha = i => i.estado === 'esperando' ? i.fecha_seguimiento : (i.plan_fecha || i.fecha_limite);
    const g = {};
    its.forEach(i => { (g[quien(i)] = g[quien(i)] || []).push(i); });
    const grupos = Object.entries(g).map(([k, v]) => [k, v.sort((a, b) => (fecha(a) || '9').localeCompare(fecha(b) || '9'))])
      .sort((a, b) => ((fecha(a[1][0]) || '9').localeCompare(fecha(b[1][0]) || '9')));
    const urg = v => v.filter(i => fecha(i) && fecha(i) <= addDays(t, 7)).length;
    return `<div class="page-head"><div><p class="fecha">Lo que depende de otros</p><h1>Delegado</h1></div>${avatarBtn()}</div>
      ${modoHoy()}

      <div class="dash-cols"><div>${grupos.map(([k, v]) => seccion(esc(k), v.slice(0, 12).map(i => itemRow(i)).join(''), v.length, '',
        urg(v) ? `<span class="tiny" style="color:var(--amber)">${plural(urg(v), 'vence', 'vencen')} en 7 días</span>` : '')).join('') ||
        '<div class="card empty section">Nada delegado ni en espera. Todo lo pendiente depende de ti.</div>'}</div><div></div></div>`;
  }

  // ───────────── Revisión semanal (GTD y Sunsama) ─────────────
  const lunesDe = d => { const x = parse(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return isoOf(x); };
  const semanaDe = l => S.data.semanas.find(x => x.lunes === l);
  function viewRevision() {
    const t = today(), lun = lunesDe(t), prox = addDays(lun, 7), sem = semanaDe(lun);
    // Objetivos: de jueves a domingo se planea la semana siguiente; antes, la actual
    const planLunes = [4, 5, 6, 0].includes(new Date().getDay()) ? prox : lun, planSem = semanaDe(planLunes);
    const its = itemsVisibles();
    const hechos = S.data.items.filter(i => i.estado === 'hecho' && i.fecha_hecho >= lun && i.fecha_hecho <= t);
    const porProg = {};
    hechos.forEach(i => { const k = i.programa_id ? nombreProg(byId('programas', i.programa_id)) : 'Tareas personales'; porProg[k] = (porProg[k] || 0) + 1; });
    const fecha = i => i.estado === 'esperando' ? i.fecha_seguimiento : (i.plan_fecha || i.fecha_limite);
    const arrastra = its.filter(i => abierto(i) && fecha(i) && fecha(i) < prox).sort((a, b) => fecha(a).localeCompare(fecha(b)));
    const activos = S.data.programas.filter(p => p.estado === 'activo').sort((a, b) => SEM_ORDEN[semaforo(a)] - SEM_ORDEN[semaforo(b)]);
    const fin14 = addDays(t, 14), viene = [];
    activos.forEach(p => {
      if (p.fecha_inicio > t && p.fecha_inicio <= fin14) viene.push([p.fecha_inicio, `Inicia ${nombreProg(p)}`, p.id]);
      if (p.fecha_fin > t && p.fecha_fin <= fin14) viene.push([p.fecha_fin, `Termina ${nombreProg(p)}`, p.id]);
      itemsDe(p.id).filter(i => abierto(i) && i.fecha_limite > t && i.fecha_limite <= fin14 && (i.hito || i.clave === 'decision_apertura' || (i.dias_ref === 'sesion' && i.dias_rel === 0) || i.dias_ref === 'v20'))
        .forEach(i => viene.push([i.fecha_limite, `${i.hito ? 'Hito: ' + i.hito : i.titulo.split('(')[0].trim()} · ${nombreProg(p)}`, p.id]));
    });
    S.data.sesiones_cierre.filter(x => x.fecha > t && x.fecha <= fin14).forEach(x => viene.push([x.fecha, 'Sesión de cierre financiero con Presupuestos', null]));
    viene.sort((a, b) => a[0].localeCompare(b[0]));
    const mover = i => `<div class="acts"><button class="mini on" data-act="mover" data-id="${i.id}" data-d="${t}">Hoy</button><button class="mini" data-act="mover" data-id="${i.id}" data-d="${prox}">Lunes</button></div>`;
    const objs = [0, 1, 2].map(k => (planSem?.objetivos || [])[k]?.t || '');
    const paso = (n, titulo, cuerpo, sub = '') => `<section class="section"><div class="section-head"><h3><span class="stepn">${n}</span>${titulo}</h3>${sub}</div>${cuerpo}</section>`;
    return `<div class="page-head"><button class="btn ghost back" data-act="nav" data-to="hoy">${ICON.back}<span>Mi día</span></button>${sem?.revisada_at ? `<span class="pill green">Revisada ${fmtDate(sem.revisada_at.slice(0, 10))}</span>` : ''}</div>
      <h1>Revisión semanal</h1><p class="muted small" style="margin:4px 0 0">Semana del ${fmtDate(lun)}. Cierra lo pendiente, actualiza el estado de tus programas y fija tres objetivos.</p>
      <div class="dash-cols"><div>
        ${paso(1, 'Lo que lograste', `<div class="card pad"><b style="font-size:22px">${plural(hechos.length, 'paso cerrado', 'pasos cerrados')}</b>
          ${Object.keys(porProg).length ? `<div class="legend" style="margin-top:10px">${Object.entries(porProg).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<div><i style="background:var(--accent)"></i><span class="grow">${esc(k)}</span><b>${n}</b></div>`).join('')}</div>` : '<p class="small muted">Esta semana todavía no hay pasos cerrados.</p>'}</div>`)}
        ${paso(2, 'Lo que se arrastra', `<div class="card list">${arrastra.slice(0, 8).map(i => itemRow(i, true, mover(i))).join('') || '<div class="empty">Nada pendiente de esta semana. Bien.</div>'}
          ${arrastra.length > 8 ? `<div class="empty">Y ${plural(arrastra.length - 8, 'pendiente más', 'pendientes más')}.</div>` : ''}</div>
          ${arrastra.length ? `<button class="btn" style="width:100%;margin-top:8px" data-act="todo-lunes" data-d="${prox}">${ICON.later}<span>Pasar los ${arrastra.length} al lunes ${fmtDate(prox)}</span></button>` : ''}`,
          arrastra.length ? `<span class="tiny muted">${arrastra.length} con fecha antes del lunes</span>` : '')}
        ${paso(3, 'Estado de cada programa', `<div class="card list">${activos.map(p => `<div class="li salud-row" style="cursor:default">
            <span class="dot ${semaforo(p)}"></span><div class="grow"><div class="title ellipsis" data-act="open" data-id="${p.id}" style="cursor:pointer">${esc(nombreProg(p))}</div>
            <div class="sub">${esc(faseActual(p))} · ${avance(p).pct}%</div>
            <input class="input sm-in" data-change="salud-nota" data-id="${p.id}" value="${esc(p.salud_nota || '')}" placeholder="Nota corta: qué lo frena o qué sigue"></div>
            <select class="input" style="width:auto" data-change="salud" data-id="${p.id}">${opts(Object.entries(SALUD).map(([k, v]) => [k, v[0]]), p.salud || '', 'Sin estado')}</select></div>`).join('') || '<div class="empty">Sin programas activos.</div>'}</div>`)}
      </div><div>
        ${paso(4, 'Lo que viene en dos semanas', `<div class="card list">${viene.map(([f, txt, id]) => `<div class="li" ${id ? `data-act="open" data-id="${id}"` : 'style="cursor:default"'}><span class="pill accent">${relDate(f)}</span><div class="grow"><div class="title">${esc(txt)}</div></div></div>`).join('') || '<div class="empty">Sin hitos en las próximas dos semanas.</div>'}</div>`)}
        ${paso(5, `Objetivos de la semana del ${fmtDate(planLunes)}`, `<form class="card pad" data-form="objetivos" data-lunes="${planLunes}">
          ${objs.map((o, k) => `<div class="field"><input class="input" name="o${k}" value="${esc(o)}" placeholder="${['Ej.: Cerrar la propuesta de Solventum', 'Ej.: Solicitar certificados del diplomado APS', 'Ej.: Cierre financiero de Baxter'][k]}"></div>`).join('')}
          <button class="btn primary" style="width:100%">Guardar y terminar la revisión</button></form>`)}
      </div></div>`;
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
      const marcas = [...new Set(e.map(x => x.k === 'inicio' || x.k === 'fin' || x.k === 'sesion' ? 'prog' : x.i?.hito ? 'hito' : venc ? 'venc' : x.k))].slice(0, 3);
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
          <div class="cal-key"><span><em class="mk paso"></em>Paso</span><span><em class="mk seg"></em>Seguimiento</span><span><em class="mk venc"></em>Vencido</span><span><em class="mk hito"></em>Hito</span><span><em class="mk prog"></em>Inicio, fin o cierre</span></div>
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
  // Estado declarado (como los "status updates" de Asana): lo pones tú en la revisión semanal o en la ficha
  const SALUD = { en_curso: ['En curso', 'green'], en_riesgo: ['En riesgo', 'amber'], bloqueado: ['Bloqueado', 'red'] };
  const saludPill = p => p.salud && SALUD[p.salud] ? `<span class="pill ${SALUD[p.salud][1]}" title="${esc(p.salud_nota || '')}">${SALUD[p.salud][0]}</span>` : '';
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
            ${p.estado === 'activo' ? (saludPill(p) || (SEM_TXT[sem] ? `<span class="pill ${SEM_PILL[sem]}">${SEM_TXT[sem]}</span>` : '')) : ''}
          </div></div>
      </div>
      <div class="pc-foot">
        <div><span>Fase</span><b>${esc(fa)}</b></div>
        <div><span>Inicio</span><b>${p.fecha_inicio ? fmtDate(p.fecha_inicio) : '—'}</b></div>
        <div><span>Ingresos</span><b>${ingresosCM(p) ? moneyCorto(ingresosCM(p)) : '—'}</b></div>
      </div>
      ${nx ? `<div class="pc-next"><span class="muted">Siguiente:</span> <span class="ellipsis grow">${esc(nx.titulo)}</span>${fx ? `<span class="pill ${fx < t ? 'red' : fx <= addDays(t, 3) ? 'amber' : ''}">${relDate(fx)}</span>` : ''}</div>` : ''}
      ${hitoLinea(p)}
    </div>`;
  }
  function hitoLinea(p) {
    const r = resumenHitos(p);
    if (!r.n) return '';
    const h = r.sig, e = h ? estadoHito(h, true) : 'ok';
    return `<div class="pc-hito"><span class="hito-ic ${e}">${DIAMANTE}</span><span class="ellipsis grow">${h ? `<span class="muted">Hito:</span> ${esc(h.hito)}` : 'Todos los hitos cumplidos'}</span>
      <span class="tiny muted">${r.d}/${r.n}</span>${h && h.fecha_limite ? `<span class="pill ${e === 'late' ? 'red' : ''}">${relDate(h.fecha_limite)}</span>` : ''}</div>`;
  }
  function cardHitos(p) {
    const hs = hitosDe(p);
    if (!hs.length) return '';
    const r = resumenHitos(p), sig = r.sig;
    const nodo = i => {
      const e = estadoHito(i, i === sig), f = i.estado === 'hecho' ? (i.fecha_hecho || i.fecha_limite) : i.fecha_limite;
      return `<button class="hn ${e}" data-act="edit-item" data-id="${i.id}"><i>${e === 'ok' ? ICON.check : DIAMANTE}</i><b>${esc(i.hito)}</b><span>${f ? (e === 'ok' ? fmtDate(f) : relDate(f)) : 'Sin fecha'}</span></button>`;
    };
    return `<div class="card pad hitos section">
      <div class="row between"><div><h2>Hitos</h2><p class="small muted" style="margin:2px 0 0">${r.d} de ${r.n} cumplidos${sig ? ` · Próximo: <b>${esc(sig.hito)}</b>` : ''}</p></div>
        ${r.tarde ? `<span class="pill red">${plural(r.tarde, 'atrasado', 'atrasados')}</span>` : sig ? '' : '<span class="pill green">Completo</span>'}</div>
      <div class="htrack">${hs.map(nodo).join('')}</div></div>`;
  }
  function listaProgramas() {
    const ps = programasFiltrados();
    if (!ps.length) return '<div class="card empty">No hay programas con estos filtros.</div>';
    const total = ps.reduce((s, p) => s + ingresosCM(p), 0);
    return `<p class="small muted">${plural(ps.length, 'programa')}${total ? ` · ${money(total)}` : ''}</p><div class="grid">${ps.map(programCard).join('')}</div>`;
  }
  // Vistas del portafolio (como Monday, Asana o Jira): lista, tablero por fase y cronograma
  const ORDEN_FASES = ['Oportunidad', 'Solicitud', 'Diseño', 'Revisión', 'Negociación', 'Formalización', 'Aprobación', 'Montaje', 'Promoción', 'Captación', 'Apertura', 'Lanzamiento',
    'Alistamiento', 'Operación', 'Ejecución', 'Certificación', 'Cierre', 'Cierre financiero', 'Liquidación', 'Vigencia', 'Completo'];
  function tableroProgramas() {
    const ps = programasFiltrados();
    if (!ps.length) return '<div class="card empty">No hay programas con estos filtros.</div>';
    const col = {};
    ps.forEach(p => { const f = faseActual(p); (col[f] = col[f] || []).push(p); });
    const fases = Object.keys(col).sort((a, b) => (ORDEN_FASES.indexOf(a) + 1 || 99) - (ORDEN_FASES.indexOf(b) + 1 || 99));
    const mini = p => {
      const nx = proximo(p), t = today(), fx = nx ? (nx.estado === 'esperando' ? nx.fecha_seguimiento : nx.fecha_limite) : null, av = avance(p), sem = semaforo(p);
      return `<div class="card bcard" data-act="open" data-id="${p.id}">
        <div class="row" style="gap:8px"><span class="dot ${sem}"></span><b class="grow ellipsis">${esc(nombreProg(p))}</b><span class="tiny muted">${av.pct}%</span></div>
        <div class="tiny muted ellipsis">${esc(empresaTxt(p))}</div>
        <div class="bar" style="margin:6px 0"><i style="width:${av.pct}%"></i></div>
        ${nx ? `<div class="tiny ellipsis">${esc(nx.titulo)}</div>` : ''}
        ${proxHito(p) ? `<div class="tiny ellipsis hito-mini"><span class="hito-ic ${estadoHito(proxHito(p), true)}">${DIAMANTE}</span>${esc(proxHito(p).hito)}</div>` : ''}
        <div class="row wrap" style="gap:4px;margin-top:6px">${saludPill(p)}${fx ? `<span class="pill ${fx < t ? 'red' : fx <= addDays(t, 3) ? 'amber' : ''}">${relDate(fx)}</span>` : ''}${p.fecha_inicio ? `<span class="pill">Inicio ${fmtDate(p.fecha_inicio)}</span>` : ''}</div>
      </div>`;
    };
    return `<div class="board">${fases.map(f => `<div class="bcol"><div class="bcol-h"><b>${esc(f)}</b><span class="count">${col[f].length}</span></div>${col[f].map(mini).join('')}</div>`).join('')}</div>
      <p class="tiny muted" style="margin-top:8px">Cada columna es la fase actual: la del primer paso esencial sin terminar.</p>`;
  }
  function cronograma() {
    const t = today();
    const ps = programasFiltrados().filter(p => p.fecha_inicio).sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio));
    const sin = programasFiltrados().filter(p => !p.fecha_inicio);
    if (!ps.length) return `<div class="card empty">Ningún programa con estos filtros tiene fecha de inicio todavía.</div>`;
    const finDe = p => { const c = itemsDe(p.id).filter(i => i.dias_ref === 'v20' && i.fecha_limite).map(i => i.fecha_limite).sort().pop(); return c || p.fecha_fin || p.fecha_inicio; };
    let lo = [t, ...ps.map(p => p.fecha_inicio)].sort()[0], hi = [addDays(t, 30), ...ps.map(finDe)].sort().pop();
    lo = addDays(lo, -7); if (diffDays(hi, lo) > 400) hi = addDays(lo, 400);
    const span = diffDays(hi, lo), X = d => Math.max(0, Math.min(100, diffDays(d, lo) / span * 100));
    const meses = [];
    { const x = parse(lo); x.setDate(1); x.setMonth(x.getMonth() + 1); while (isoOf(x) <= hi) { meses.push(isoOf(x)); x.setMonth(x.getMonth() + 1); } }
    const fila = p => {
      const ini = p.fecha_inicio, fin = p.fecha_fin || p.fecha_inicio, cierre = finDe(p), r = rutaDe(p);
      const dec = itemsDe(p.id).find(i => i.clave === 'decision_apertura');
      const ses = itemsDe(p.id).find(i => i.dias_ref === 'sesion' && i.dias_rel === 0), hs = hitosDe(p);
      const w = Math.max(1.2, X(fin) - X(ini));
      return `<div class="gt-row" data-act="open" data-id="${p.id}">
        <div class="gt-name"><span class="dot ${semaforo(p)}"></span><span class="ellipsis">${esc(nombreProg(p))}</span></div>
        <div class="gt-track"><i class="gt-today" style="left:${X(t)}%"></i>
          ${cierre > fin ? `<i class="gt-tail" style="left:${X(fin)}%;width:${X(cierre) - X(fin)}%"></i>` : ''}
          <i class="gt-bar" style="left:${X(ini)}%;width:${w}%;--rc:${COL_RUTA[r?.clave] || 'var(--accent)'}" title="${esc(fmtDate(ini))} a ${esc(fmtDate(fin))}"></i>
          ${hs.length ? hs.map(i => { const f = i.estado === 'hecho' ? (i.fecha_hecho || i.fecha_limite) : i.fecha_limite; return f ? `<em class="gt-mk h ${estadoHito(i)}" style="left:${X(f)}%" title="${esc(i.hito)} · ${esc(fmtDate(f))}"></em>` : ''; }).join('') : `
          ${dec && dec.fecha_limite ? `<em class="gt-mk dec ${abierto(dec) ? '' : 'ok'}" style="left:${X(dec.fecha_limite)}%" title="Decisión de apertura ${esc(fmtDate(dec.fecha_limite))}"></em>` : ''}
          ${ses && ses.fecha_limite ? `<em class="gt-mk ses" style="left:${X(ses.fecha_limite)}%" title="Cierre financiero ${esc(fmtDate(ses.fecha_limite))}"></em>` : ''}`}
        </div></div>`;
    };
    return `<div class="card pad gantt">
      <div class="gt-head"><div class="gt-name tiny muted">${parse(lo).getFullYear() === parse(hi).getFullYear() ? parse(lo).getFullYear() : parse(lo).getFullYear() + ' a ' + parse(hi).getFullYear()}</div><div class="gt-track">${meses.map((m, k) => (k % Math.ceil(meses.length / 7) === 0) ? `<span style="left:${X(m)}%">${MESES[parse(m).getMonth()]}</span>` : '').join('')}</div></div>
      <div class="gt-body">${ps.map(fila).join('')}</div>
      <div class="cal-key" style="margin-top:12px"><span><i class="kb"></i>Ejecución</span><span><i class="kb tail"></i>Cierre y liquidación</span><span><em class="gt-mk h ok" style="position:static"></em>Hito cumplido</span><span><em class="gt-mk h fut" style="position:static"></em>Hito pendiente</span><span><em class="gt-mk h late" style="position:static"></em>Hito atrasado</span><span><i class="kb today"></i>Hoy</span></div>
    </div>${sin.length ? `<p class="tiny muted" style="margin-top:8px">Sin fecha de inicio: ${sin.map(p => esc(nombreProg(p))).join(', ')}.</p>` : ''}`;
  }
  function viewProgramas() {
    let pv = 'lista'; try { pv = localStorage.getItem('rumbo.pv') || 'lista'; } catch (e) { /* sin almacenamiento */ }
    const vb = (k, l, ic) => `<button class="${pv === k ? 'on' : ''}" data-act="pv" data-v="${k}">${ic}<span>${l}</span></button>`;
    const n = e => S.data.programas.filter(p => e === 'todos' || p.estado === e).length;
    const chip = (v, l) => `<button class="chip ${S.f.estado === v ? 'on' : ''}" data-act="f-estado" data-v="${v}">${l}<span>${n(v)}</span></button>`;
    return `
      <div class="page-head"><h1>Programas</h1><div class="row"><button class="icon-btn" data-act="export-cm" aria-label="Exportar Cuadro Maestro" title="Exportar Cuadro Maestro">${ICON.download}</button><button class="btn primary" data-act="nuevo">${ICON.plus}<span>Nuevo</span></button>${avatarBtn()}</div></div>
      <div class="filters">
        <input class="input search" type="search" placeholder="Buscar programa, entidad, facultad…" value="${esc(S.f.q)}" data-input="buscar">
        <select class="input" data-change="f-ruta">${opts(S.data.rutas.map(r => [r.id, r.nombre]), S.f.ruta, 'Todas las rutas')}</select>
      </div>
      <div class="chips">${chip('activo', 'En curso')}${chip('cerrado', 'Ejecutados')}${chip('pausa', 'Aplazados')}${chip('perdido', 'Cancelados')}${chip('todos', 'Todos')}</div>
      <div class="view-switch">${vb('lista', 'Lista', ICON.list)}${vb('tablero', 'Tablero', ICON.board)}${vb('cronograma', 'Cronograma', ICON.gantt)}</div>
      <div id="prog-list" class="section">${pv === 'tablero' ? tableroProgramas() : pv === 'cronograma' ? cronograma() : listaProgramas()}</div>`;
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
      <div class="card list section"><div class="pad" style="padding-bottom:4px"><h2>Cuadro Maestro</h2><p class="small muted" style="margin:4px 0 0">${CMF.tiene ? `Formato guardado${CMF.fecha ? ' el ' + fmtDate(CMF.fecha) : ''}: el archivo sale igual al tuyo.` : 'Importa tu archivo una vez: cargo tus programas y lo uso como formato para exportar.'}</p></div>
        <label class="li menu-li"><span class="kpi-ic violet">${ICON.upload}</span><div class="grow"><div class="title">Importar Cuadro Maestro</div><div class="sub">Tu Excel con la hoja BD: crea o actualiza tus programas</div></div><input type="file" accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-change="import-cm" hidden></label>
        ${row(ICON.download, 'Exportar Cuadro Maestro', 'export-cm', '', CMF.tiene ? 'Tu mismo archivo, con la hoja BD al día' : 'Con las columnas de la hoja BD')}
        ${row(ICON.check, 'Completar datos', 'nav', ' data-to="completar"', `${plural(porCompletar().length, 'programa')} con datos o preguntas pendientes`)}
        ${row(ICON.gantt, 'Reporte de seguimiento', 'export-xlsx', '', 'Excel con seguimiento, hitos y pendientes por programa')}
      </div>
      <div class="card list section">
        ${row(ICON.tpl, 'Plantillas', 'nav', ' data-to="plantillas"', 'Rutas y módulos con los que nace cada programa')}
        ${row(ICON.download, 'Descargar respaldo', 'export-json', '', 'Copia completa en JSON')}
        <label class="li menu-li"><span class="kpi-ic violet">${ICON.upload}</span><div class="grow"><div class="title">Importar respaldo</div><div class="sub">Desde un archivo JSON</div></div><input type="file" accept="application/json,.json" data-change="import" hidden></label>
      </div>
      ${cardSesiones()}
      ${avisosCard(false)}
      ${cardIA()}
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
  function formSalud(p) {
    modal(`<form data-form="saludf" data-id="${p.id}">${sheetHead('Estado del programa')}
      <p class="small muted" style="margin-top:-6px">${esc(p.nombre)}. Queda en la bitácora como actualización de estado.</p>
      ${fld('Cómo va', seg('salud', Object.entries(SALUD).map(([k, v]) => [k, v[0]]), p.salud || 'en_curso'))}
      ${fld('Nota', `<textarea class="input" name="salud_nota" rows="2" placeholder="Ej.: Falta el extracto del acta; el director lo envía el viernes">${esc(p.salud_nota || '')}</textarea>`)}
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>`);
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
      ${falt.length ? `<div class="miss" data-act="edit-cm" data-id="${p.id}" role="button">${falt.map(x => `<span>${esc(ETQ_CM[x] || x)}</span>`).join('')}</div>` : ''}
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
            ${p.estado === 'activo' ? `<div class="row wrap" style="margin-top:8px;gap:6px">${SEM_TXT[sem] ? `<span class="pill ${SEM_PILL[sem]}">${SEM_TXT[sem]}</span>` : ''}${saludPill(p)}
              <button class="mini" data-act="salud" data-id="${p.id}">${p.salud ? 'Actualizar estado' : 'Dar estado'}</button></div>
              <button class="btn primary sm avance-btn" data-act="avance" data-id="${p.id}">${ICON.check}<span>Registrar avance</span></button>
              ${p.salud_nota ? `<p class="small muted" style="margin:6px 0 0">${esc(p.salud_nota)} <span class="tiny">· ${fmtDate(p.salud_fecha)}</span></p>` : ''}` : ''}</div>
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
      ${cardHitos(p)}
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
    const puedeVolver = () => isOpen() || ['programa', 'plantillas', 'revision', 'completar'].includes(S.view.name);
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
        setTimeout(() => { S.navBack = true; if (history.length > 1) history.back(); else go(S.view.name === 'plantillas' ? 'mas' : S.view.name === 'revision' ? 'hoy' : S.view.name === 'completar' ? 'inicio' : 'programas'); }, 180);
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
        <details class="more pegar"><summary>${ICON.note}<span>Llenar desde un correo o texto</span></summary>
          <textarea class="input" name="_texto" rows="4" placeholder="Pega aquí el correo del cliente, la solicitud o tus notas de la reunión"></textarea>
          <div class="row" style="gap:8px;margin-top:8px"><button type="button" class="btn sm" data-act="prog-texto">Llenar campos</button>${IA.on ? `<button type="button" class="btn sm ia-btn" data-act="prog-ia">${ICON.spark}<span>Llenar con IA</span></button>` : ''}</div>
          <p class="small extra-cap" hidden></p>
          ${['horas', 'participantes', 'valor', 'facultad', 'director'].map(k => `<input type="hidden" name="x_${k}">`).join('')}
        </details>
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
      <div class="two">${fld('Facultad', `<select class="input" name="facultad">${opts(FACULTADES.includes(p.facultad) || !p.facultad ? FACULTADES : [...FACULTADES, p.facultad], p.facultad, 'Elegir…')}</select>`)}
        ${fld('Modalidad', `<select class="input" name="modalidad">${opts(MODALIDADES, p.modalidad, 'Elegir…')}</select>`)}</div>
      <div class="two">${fld('Intensidad horaria', inp('horas', p.horas, 'type="number" min="0" step="any" inputmode="decimal"'))}
        ${fld('Plataforma', `<select class="input" name="plataforma">${opts(PLATAFORMAS.includes(p.plataforma) || !p.plataforma ? PLATAFORMAS : [...PLATAFORMAS, p.plataforma], p.plataforma, 'Elegir…')}</select>`)}</div>
      <div class="two">${fld('Nombre del director', inp('director', p.director))}${fld('Cédula del director <span class="muted">(opcional)</span>', inp('director_cedula', p.director_cedula, 'inputmode="numeric"'))}</div>
      ${fld('Programa', inp('programa_academico', p.programa_academico, 'list="dl-progcm" autocomplete="off" placeholder="Ej.: Enfermería"'))}
      <datalist id="dl-progcm">${PROGRAMAS_CM.map(x => `<option value="${esc(x)}">`).join('')}</datalist>
      ${fld('Tipo en el Cuadro Maestro', seg('tipo_cm', TIPOS_X, tipoCM(p)))}
      <h4 class="fsec">Comercial</h4>
      <div class="two">${fld('Matriculados', inp('participantes', p.participantes, 'type="number" min="0" inputmode="numeric"'))}
        ${fld(valorLbl, inp(esAbierta(p) ? 'valor_persona' : 'valor_total', esAbierta(p) ? p.valor_persona : p.valor_total, 'inputmode="numeric"'))}</div>
      ${esAval(p) ? fld('% del aval para la universidad', inp('porcentaje_aval', p.porcentaje_aval ?? 15, 'type="number" min="0" max="100" step="any"')) : ''}
      <p class="small calc">Ingresos para el Cuadro Maestro: <b data-ingresos>${money(ingresosCM(p)) || '$ 0'}</b>
        <span class="muted tiny">${esAval(p) ? '(valor × % del aval)' : esAbierta(p) ? '(valor por persona × matriculados)' : '(valor del programa)'}</span></p>
      <div class="two">${fld('Orden interna', inp('orden_interna', p.orden_interna))}${fld('Margen de contribución (%)', inp('margen', p.margen, 'type="number" step="any"'))}</div>
      <div class="two">${fld('Segmento', `<select class="input" name="segmento">${opts(SEGMENTOS, p.segmento || 'EDUCACIÓN CONTINUA')}</select>`)}
        ${fld('Línea de negocio', `<select class="input" name="linea_cm">${opts(LINEAS_CM, p.linea_cm || 'SECTOR SALUD & FARMA')}</select>`)}</div>
      <div class="two">${fld('Ingresos 2026 <span class="muted">(si difieren del cálculo)</span>', inp('ingresos', p.ingresos, 'inputmode="numeric" placeholder="Vacío: se calcula"'))}
        ${fld('Facturado 2026', inp('facturado', p.facturado, 'inputmode="numeric"'))}</div>
      ${fld('Acuerdo del Consejo de Investigación <span class="muted">(opcional)</span>', inp('acuerdo_consejo', p.acuerdo_consejo))}
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
      <label class="small row" style="margin-bottom:12px"><input type="checkbox" name="prioridad" ${i.prioridad ? 'checked' : ''}> Prioritaria: va primero en tu agenda</label>
      ${p ? `<label class="small row" style="margin-bottom:8px"><input type="checkbox" name="es_hito" ${i.hito ? 'checked' : ''}> Es un hito del proyecto</label>
        ${fld('Nombre del hito', inp('hito', i.hito || '', `placeholder="Ej.: Orden interna"`))}` : ''}
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

  // ───────────── Registro rápido: entender lo que escribes (sin costo, en el dispositivo) ─────────────
  // Reconoce programa, fecha, hora, tipo (tarea, esperando, avance, nota), de quién se espera y qué paso se cumplió.
  const STOP = new Set(('curso cursos diplomado programa programas seminario taller congreso simposio jornada foro microcredencial certificacion rotacion aval ' +
    'para sobre con del los las una uno que por como mas pero este esta esto ese esa hay ser sus nos les fue era son hoy ayer manana tarde noche ' +
    'gestion atencion integral actualizacion salud internacional avanzado avanzada manejo nacional cuidado cuidados clinica clinico basico ' +
    'enviar envie envio pedir solicitar recibir recibi revisar llamar hablar hable confirmar listo hecho ya quedo quedamos falta pendiente semana dias dia ' +
    'lunes martes miercoles jueves viernes sabado domingo nota esperando espero').split(' '));
  const palabras = t => norm(t).replace(/[^a-z0-9ñ ]/g, ' ').split(' ').filter(w => w.length >= 4 && !STOP.has(w));
  const MES_N = { ene: 0, enero: 0, feb: 1, febrero: 1, mar: 2, marzo: 2, abr: 3, abril: 3, may: 4, mayo: 4, jun: 5, junio: 5, jul: 6, julio: 6,
    ago: 7, agosto: 7, sep: 8, sept: 8, septiembre: 8, set: 8, oct: 9, octubre: 9, nov: 10, noviembre: 10, dic: 11, diciembre: 11 };
  const DIA_N = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };
  const CARGOS_TXT = [
    [/\bpresupuestos\b|\ba presupuesto\b/, 'Presupuestos'], [/\bfinanzas\b/, 'Finanzas'], [/\bdide\b/, 'DIDE'],
    [/\b(director|directora|docente encargad[oa])\b/, 'Director del programa'], [/\basistente\b/, 'Asistente administrativa'],
    [/\bauxiliar\b/, 'Auxiliar administrativa'], [/\bcomunicaciones\b/, 'Gestor de comunicaciones'], [/\bgestora? de (la )?facultad\b/, 'Gestor de facultad'],
    [/\bsecretaria\b/, 'Secretaría de la división'], [/\bgerente administrativ[oa]\b/, 'Gerente administrativo'], [/\bjuridica\b/, 'Jurídica'],
    [/\bfinanciera\b/, 'Financiera'], [/\bproveedor\b/, 'Proveedor'], [/\bdecan[oa]\b/, 'Facultad'], [/\bcliente\b/, 'Cliente'],
  ];
  function leerFecha(tx) {
    // tx ya normalizado (sin tildes, minúsculas). Devuelve { f, m } con la fecha ISO y el fragmento reconocido.
    const t = today(), hoyD = parse(t);
    let m;
    if ((m = tx.match(/\bpasado manana\b/))) return { f: addDays(t, 2), m: m[0] };
    if ((m = tx.match(/\b(para |el |de )?manana\b/)) && !/\b(en|por|de) la manana\b/.test(tx)) return { f: addDays(t, 1), m: m[0] };
    if ((m = tx.match(/\b(para )?hoy\b/))) return { f: t, m: m[0] };
    if ((m = tx.match(/\ben (\d{1,2}|un|una|dos|tres|cuatro|cinco) (dias?|semanas?)\b/))) {
      const n = { un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5 }[m[1]] || Number(m[1]);
      return { f: addDays(t, /semana/.test(m[2]) ? n * 7 : n), m: m[0] };
    }
    if ((m = tx.match(/\b(la )?(proxima|siguiente) semana\b/))) { const x = parse(t); x.setDate(x.getDate() + ((8 - x.getDay()) % 7 || 7)); return { f: isoOf(x), m: m[0] }; }
    if ((m = tx.match(/\b(el |este |para el |proximo |el proximo )?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)( proximo)?\b/))) {
      const target = DIA_N[m[2]], x = parse(t); let k = (target - x.getDay() + 7) % 7;
      if (k === 0 || /proximo/.test(m[0])) k = k === 0 ? 7 : k;
      x.setDate(x.getDate() + k); return { f: isoOf(x), m: m[0] };
    }
    if ((m = tx.match(/\b(el )?(\d{1,2}) (de )?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|sept|setiembre|octubre|noviembre|diciembre|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b( (de )?(\d{4}))?/))) {
      const mes = MES_N[m[4] === 'setiembre' ? 'sep' : m[4]], dia = Number(m[2]);
      let y = m[7] ? Number(m[7]) : hoyD.getFullYear();
      let d = new Date(y, mes, dia); if (!m[7] && isoOf(d) < addDays(t, -30)) d = new Date(y + 1, mes, dia);
      return { f: isoOf(d), m: m[0] };
    }
    if ((m = tx.match(/\b(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?\b/))) {
      let y = m[4] ? Number(m[4].length === 2 ? '20' + m[4] : m[4]) : hoyD.getFullYear();
      let d = new Date(y, Number(m[2]) - 1, Number(m[1])); if (!m[4] && isoOf(d) < addDays(t, -30)) d = new Date(y + 1, Number(m[2]) - 1, Number(m[1]));
      if (!isNaN(d)) return { f: isoOf(d), m: m[0] };
    }
    if ((m = tx.match(/\bel (\d{1,2})\b(?! de)/))) {
      const dia = Number(m[1]); if (dia >= 1 && dia <= 31) {
        let d = new Date(hoyD.getFullYear(), hoyD.getMonth(), dia); if (isoOf(d) < t) d = new Date(hoyD.getFullYear(), hoyD.getMonth() + 1, dia);
        return { f: isoOf(d), m: m[0] };
      }
    }
    return null;
  }
  function leerHora(tx) {
    let m;
    if ((m = tx.match(/\b(a las |a la )?(\d{1,2})(:(\d{2}))? ?(a\.? ?m\.?|p\.? ?m\.?)(?=\s|$|[.,;])/))) {
      let h = Number(m[2]) % 12; if (/p/.test(m[5])) h += 12;
      return { h: `${pad(h)}:${m[4] || '00'}`, m: m[0] };
    }
    if ((m = tx.match(/\b(a las )?([01]?\d|2[0-3]):([0-5]\d)\b/))) return { h: `${pad(Number(m[2]))}:${m[3]}`, m: m[0] };
    if ((m = tx.match(/\ba las (\d{1,2})( y media)?\b/))) {
      let h = Number(m[1]); if (h >= 1 && h <= 6) h += 12; if (h > 23) return null;
      return { h: `${pad(h)}:${m[2] ? '30' : '00'}`, m: m[0] };
    }
    return null;
  }
  // Programa al que se refiere el texto: por palabras distintivas del nombre, el nombre corto y la entidad
  function adivinarPrograma(tx) {
    const w = new Set(palabras(tx)), txn = ' ' + norm(tx) + ' ';
    let mejor = null, max = 0, empate = false;
    for (const p of S.data.programas.filter(x => x.estado === 'activo')) {
      let sc = 0;
      const corto = norm(p.nombre_corto || '');
      if (corto && corto.length >= 4 && txn.includes(' ' + corto)) sc += 3;
      palabras(p.nombre).forEach(k => { if (w.has(k)) sc += k.length >= 7 ? 1.5 : 1; });
      const ent = entidadDe(p)?.nombre;
      if (ent) palabras(ent).forEach(k => { if (w.has(k)) sc += 2.5; });
      // Siglas del nombre o de la entidad (APS, MSD, ACHO, HOMI…)
      [p.nombre, ent || ''].join(' ').match(/\b[A-ZÁÉÍÓÚÑ]{3,}\b/g)?.forEach(sg => { if (new RegExp(`\\b${norm(sg)}\\b`).test(norm(tx))) sc += 2; });
      if (sc > max) { max = sc; mejor = p; empate = false; } else if (sc === max && sc > 0) empate = true;
    }
    return max >= 1.5 && !empate ? mejor : null;
  }
  // Paso abierto que el texto da por cumplido (para "Avance")
  function adivinarPaso(p, tx) {
    if (!p) return null;
    const w = new Set(palabras(tx)), txn = norm(tx);
    let mejor = null, max = 0;
    for (const i of itemsOrdenados(p).filter(x => abierto(x))) {
      let sc = 0;
      palabras(i.titulo).forEach(k => { if (w.has(k)) sc += 1; });
      if (i.hito && txn.includes(norm(i.hito))) sc += 3;
      if (i.fase === faseActual(p)) sc += 0.3;
      if (sc > max) { max = sc; mejor = i; }
    }
    return max >= 1.3 ? mejor : null;
  }
  function entender(texto) {
    const crudo = String(texto || ''), tx = norm(crudo);
    const r = { tipo: 'tarea', programa: null, fecha: null, hora: null, esperando_a: null, paso: null, titulo: crudo.trim() };
    if (!tx) return r;
    if (/^nota\b|^(acordamos|quedamos en que|me dijeron|me informan|informaron)\b/.test(tx)) r.tipo = 'nota';
    else if (/^(listo|hecho|ya)\b|\b(ya (llego|envie|enviaron|quedo|salio|tenemos|recibi|esta)|se (recibio|envio|aprobo)|recibi|aprobaron|aprobado|firmad[oa]|llego)\b/.test(tx)) r.tipo = 'avance';
    else if (/\b(esperando|espero|queda(ron)? de|quedo de|qued[oó] en|me (envia|manda|enviara|confirma|debe)|enviara|mandara|confirmara|pendiente de que)\b/.test(tx)) r.tipo = 'esperando';
    r.programa = adivinarPrograma(crudo);
    const f = leerFecha(tx), h = leerHora(tx);
    if (f) r.fecha = f.f; if (h) r.hora = h.h;
    for (const [re, cargo] of CARGOS_TXT) if (re.test(tx)) { r.esperando_a = cargo; break; }
    if (r.tipo === 'esperando' && !r.esperando_a && r.programa && entidadDe(r.programa)) r.esperando_a = 'Cliente';
    if (r.tipo === 'avance') r.paso = adivinarPaso(r.programa, crudo);
    // Título limpio: sin la fecha, la hora ni la palabra "nota"
    let t = crudo;
    const quitar = [f?.m, h?.m].filter(Boolean);
    quitar.forEach(q => { const re = new RegExp(q.split('').map(c => c.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('').replace(/[aeioun]/g, c => ({ a: '[aá]', e: '[eé]', i: '[ií]', o: '[oó]', u: '[uúü]', n: '[nñ]' }[c])).replace(/ /g, '\\s+'), 'i'); t = t.replace(re, ' '); });
    t = t.replace(/^\s*nota\s*[:,-]?\s*/i, '').replace(/^\s*(esperando|espero)( (a|que|de))?\s+/i, '').replace(/^\s*(listo|hecho)\s*[:,-]?\s*/i, '').replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/^[\s,.;:-]+|[\s,;:-]+$/g, '').trim();
    r.titulo = t ? t.charAt(0).toUpperCase() + t.slice(1) : crudo.trim();
    return r;
  }
  const CAP_TIPOS = [['tarea', 'Tarea'], ['esperando', 'Esperando a'], ['avance', 'Avance'], ['nota', 'Nota']];

  function opcionesPaso(p, sel) {
    if (!p) return '<option value="">Elige primero el programa</option>';
    const fs = fasesDe(p), fa = faseActual(p), ia = fs.indexOf(fa);
    const its = itemsOrdenados(p).filter(abierto).sort((a, b) => (Math.abs(fs.indexOf(a.fase) - ia) - Math.abs(fs.indexOf(b.fase) - ia)));
    return `<option value="">Ninguno: solo dejar la nota</option>` + its.slice(0, 40).map(i => `<option value="${i.id}" ${i.id === sel ? 'selected' : ''}>${i.hito ? '◆ ' : ''}${esc(i.titulo.length > 70 ? i.titulo.slice(0, 68) + '…' : i.titulo)}</option>`).join('');
  }
  function formCaptura(pre = {}) {
    const activos = S.data.programas.filter(p => p.estado === 'activo').sort((a, b) => nombreProg(a).localeCompare(nombreProg(b)));
    const actual = pre.programa_id || (S.view.name === 'programa' ? S.view.id : '');
    const dia = S.view.name === 'hoy' && S.dia ? S.dia : today();
    const tipo = pre.tipo || 'tarea', rec = !!pre.recordatorio, fijo = !!pre.tipo && !pre.texto;
    const titulos = { tarea: 'Tarea', esperando: 'Seguimiento', avance: 'Avance', nota: 'Nota' };
    const horaSig = (() => { const d = new Date(); d.setMinutes(0); d.setHours(d.getHours() + 1); return `${pad(d.getHours())}:00`; })();
    modal(`<form data-form="captura">
      ${sheetHead(rec ? 'Recordatorio' : pre.texto ? 'Registro rápido' : titulos[tipo] || 'Registro rápido')}
      <p class="small muted" style="margin-top:-6px">${fijo ? 'Escríbelo como lo dirías: Rumbo reconoce el programa, la fecha y la hora.' : 'Escríbelo como lo dirías. Rumbo reconoce el programa, la fecha, la hora y de quién esperas algo. También puedes dictar con el micrófono del teclado.'}</p>
      ${fld(rec ? 'Qué te recuerdo' : { esperando: 'Qué esperas y de quién', avance: 'Qué se cumplió', nota: 'Nota' }[fijo ? tipo : ''] || 'Qué pasó o qué hay que hacer', `<textarea class="input" name="texto" rows="3" required autofocus data-input="captura" placeholder="Ej.: Ya llegó el acta del consejo de Solventum. O: Llamar al cliente de Baxter el jueves 3 pm"></textarea>`)}
      <div class="entendi" id="entendi" hidden></div>
      ${IA.on ? `<button type="button" class="btn sm ia-btn" data-act="ia-captura">${ICON.spark}<span>Ordenar con IA</span></button>` : ''}
      <div${fijo ? ' hidden' : ''}>${fld('Tipo', seg('tipo', CAP_TIPOS, tipo))}</div>
      ${fld('Programa', `<select class="input" name="programa_id" data-change="cap-prog">${opts(activos.map(p => [p.id, nombreProg(p)]), actual, 'Ninguno, tarea personal')}</select>`)}
      <div class="two">${fld(rec ? 'Día' : 'Para el', inp('plan_fecha', dia, 'type="date"'), 'tarea')}${fld(rec ? 'Hora' : 'Hora <span class="muted">(opcional)</span>', inp('hora', rec ? horaSig : '', `type="time"${rec ? ' required' : ''}`), 'tarea')}</div>
      <div class="two">${fld('Esperando a', `<select class="input" name="esperando_a">${opts(ACTORES.filter(a => a !== 'Yo'), 'Cliente')}</select>`, 'esperando')}
        ${fld('Hacer seguimiento el', inp('fecha_seguimiento', addDays(today(), 3), 'type="date"'), 'esperando')}</div>
      ${fld('Paso que se cumplió', `<select class="input" name="hecho_id">${opcionesPaso(byId('programas', actual))}</select>`, 'avance')}
      <label class="small row" data-show="tarea esperando" style="margin-bottom:12px"><input type="checkbox" name="avisar" checked> Avisarme (a la hora elegida o a las 8:00 a. m.)</label>
      <p class="tiny muted" data-show="nota avance">Queda en la bitácora del programa.</p>
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div>
    </form>`);
    const f = $('#modal-root form'); f._tocado = new Set(pre.tipo && !pre.texto ? ['tipo'] : []); if (rec) f._tocado.add('hora'); applyShow(f, tipo);
    if (pre.texto) { f.texto.value = pre.texto; aplicarEntendido(f); }
  }
  // Botón principal: un solo lugar para todo lo que se registra
  function menuAcciones() {
    const p = S.view.name === 'programa' ? byId('programas', S.view.id) : null;
    const op = (act, icon, l, sub, extra = '') => `<button class="acc" data-act="${act}"${extra}><span class="acc-ic">${icon}</span><b>${l}</b><small>${sub}</small></button>`;
    modal(`<div class="acciones">
      ${sheetHead('Agregar')}
      ${p ? `<p class="small muted acc-ctx">${ICON.folder}<span class="ellipsis">En ${esc(nombreProg(p))}</span></p>` : ''}
      <form class="acc-libre" data-form="acc-libre"><input class="input" name="texto" autocomplete="off" placeholder="Escribe o dicta lo que pasó o lo que hay que hacer"><button class="btn primary" aria-label="Continuar">${ICON.next}</button></form>
      <div class="acc-grid">
        ${op('acc', ICON.check, 'Tarea', 'Algo por hacer', ' data-t="tarea"')}
        ${op('acc', ICON.bell, 'Recordatorio', 'Con día y hora', ' data-t="recordatorio"')}
        ${op('acc', ICON.wait, 'Seguimiento', 'Espero algo de alguien', ' data-t="esperando"')}
        ${op('acc', ICON.flag, 'Avance', 'Algo se cumplió', ` data-t="avance"`)}
        ${op('acc', ICON.note, 'Nota', 'Para la bitácora', ' data-t="nota"')}
        ${op('acc', ICON.prog, 'Programa', 'Nuevo, o desde un correo', ' data-t="programa"')}
      </div>
    </div>`);
  }
  // Llena los campos con lo que entendió del texto, sin pisar lo que cambiaste a mano
  function aplicarEntendido(f) {
    const r = entender(f.texto.value), T = f._tocado || new Set();
    const set = (n, v) => { if (!T.has(n) && f[n] && v !== null && v !== undefined) f[n].value = v; };
    if (!T.has('tipo')) {
      f.tipo.value = r.tipo;
      f.querySelectorAll('[data-name="tipo"]').forEach(b => b.classList.toggle('on', b.dataset.v === r.tipo));
      applyShow(f, r.tipo);
    }
    if (r.programa && !T.has('programa_id') && f.programa_id.value !== r.programa.id) { f.programa_id.value = r.programa.id; f.hecho_id.innerHTML = opcionesPaso(r.programa); }
    if (r.tipo === 'esperando') { set('fecha_seguimiento', r.fecha); set('esperando_a', r.esperando_a); }
    else { set('plan_fecha', r.fecha); set('hora', r.hora); }
    if (r.paso && !T.has('hecho_id') && byId('programas', f.programa_id.value)?.id === r.paso.programa_id) f.hecho_id.value = r.paso.id;
    const chips = [];
    const p = byId('programas', f.programa_id.value);
    if (r.programa) chips.push(`${ICON.folder}<span>${esc(nombreProg(r.programa))}</span>`);
    if (r.fecha) chips.push(`${ICON.cal}<span class="cap">${esc(relDate(r.fecha))}</span>`);
    if (r.hora) chips.push(`${ICON.clock}<span>${esc(fmtHora(r.hora))}</span>`);
    if (r.tipo === 'esperando' && r.esperando_a) chips.push(`${ICON.wait}<span>${esc(r.esperando_a)}</span>`);
    if (r.tipo === 'avance' && r.paso && p && r.paso.programa_id === p.id) chips.push(`${ICON.check}<span class="ellipsis">${esc(r.paso.hito || r.paso.titulo)}</span>`);
    const e = $('#entendi');
    if (e) { e.hidden = !f.texto.value.trim(); e.innerHTML = `<span class="tiny muted">Entendí:</span> <b>${esc(CAP_TIPOS.find(x => x[0] === (T.has('tipo') ? f.tipo.value : r.tipo))?.[1] || '')}</b>${chips.map(c => `<em>${c}</em>`).join('')}`; }
  }

  // Registrar avance de un programa en una sola hoja: lo que pasó, lo que se cumplió y lo que sigue
  function formAvance(p) {
    const fs = fasesDe(p), fa = faseActual(p), ia = fs.indexOf(fa);
    const abiertos = itemsOrdenados(p).filter(i => abierto(i));
    const cerca = abiertos.filter(i => { const k = fs.indexOf(i.fase); return k >= ia && k <= ia + 1; });
    const lista = (cerca.length ? cerca : abiertos).slice(0, 10);
    const hoy = today();
    modal(`<form data-form="avance" data-id="${p.id}">
      ${sheetHead('Registrar avance')}
      <p class="small muted" style="margin-top:-6px">${esc(p.nombre)} · fase ${esc(fa)}</p>
      ${fld('Qué pasó <span class="muted">(opcional)</span>', `<textarea class="input" name="resumen" rows="2" autofocus placeholder="Ej.: El director confirmó 12 docentes; el cliente pidió factura en noviembre"></textarea>`)}
      <h4 class="fsec">Marca lo que ya se cumplió</h4>
      <div class="choice avance-list">${lista.map(i => `<label><input type="checkbox" name="hechos" value="${i.id}"><div><b>${i.hito ? `<span class="hito-ic ${estadoHito(i, i === proxHito(p))}">${DIAMANTE}</span>` : ''}${esc(i.titulo)}</b>
        <div class="tiny muted">${esc(i.fase)}${i.responsable && i.responsable !== 'Yo' ? ' · ' + esc(i.responsable) : ''}${i.fecha_limite ? ' · ' + esc(relDate(i.fecha_limite)) : ''}</div></div></label>`).join('') || '<p class="small muted">No hay pasos abiertos.</p>'}</div>
      <h4 class="fsec">Lo que sigue</h4>
      ${fld('Próxima acción <span class="muted">(opcional)</span>', inp('proxima', '', 'placeholder="Ej.: Enviar el cuadro de honorarios a Presupuestos"'))}
      <div class="two">${fld('Para el', inp('fecha', addDays(hoy, 1), 'type="date"'))}${fld('Cómo va', `<select class="input" name="salud">${opts([['', 'Sin cambio'], ...Object.entries(SALUD).map(([k, v]) => [k, v[0]])], '')}</select>`)}</div>
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar avance</button></div>
    </form>`);
  }

  // ── Programa nuevo a partir de un correo o texto pegado ──
  function extraerPrograma(texto) {
    const raw = String(texto || ''), tx = norm(raw), out = {};
    const tipoRe = /\b(curso|diplomado|seminario|taller|congreso|simposio|jornada|microcredencial|certificaci[oó]n|rotaci[oó]n|bootcamp|webinar|ciclo)\b[^\n.;:]{3,90}/i;
    const m = raw.match(tipoRe);
    if (m) out.nombre = m[0].replace(/\s+/g, ' ').replace(/[,\s]+(para|dirigido|que|con una|de \d).*$/i, '').trim().replace(/^./, c => c.toUpperCase());
    const ent = S.data.entidades.find(e => palabras(e.nombre).some(k => palabras(raw).includes(k)));
    if (ent) out.empresa = ent.nombre;
    if (/\baval\b/.test(tx)) out.ruta = 'aval'; else if (/oferta abierta|inscripciones abiertas|micrositio/.test(tx)) out.ruta = 'abierta';
    if (/diplomado/.test(tx)) out.tipo_programa = '3'; else if (/taller/.test(tx)) out.tipo_programa = '2';
    else if (/seminario|congreso|simposio/.test(tx)) out.tipo_programa = '4'; else if (/curso|certificacion|microcredencial/.test(tx)) out.tipo_programa = '1';
    if (/hibrid/.test(tx)) out.modalidad = 'Híbrido (virtual + presencial)'; else if (/presencial/.test(tx)) out.modalidad = 'Presencial';
    else if (/semipresencial/.test(tx)) out.modalidad = 'Semipresencial'; else if (/virtual|sincronic|zoom|teams|meet|en linea|online/.test(tx)) out.modalidad = 'Virtual';
    if (/nueva cohorte|segunda cohorte|nueva edicion|nueva version|otra cohorte/.test(tx)) out.es_nuevo = '0';
    let x;
    if ((x = tx.match(/(\d{1,4})\s*(horas|h\b)/))) out.horas = Number(x[1]);
    if ((x = tx.match(/(\d{1,4})\s*(participantes|personas|asistentes|inscritos|cupos|profesionales|enfermer[oa]s|medicos)/))) out.participantes = Number(x[1]);
    if ((x = raw.match(/\$\s?([\d.,]{5,})/))) out.valor = Number(x[1].replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
    else if ((x = tx.match(/(\d+(?:[.,]\d+)?)\s*(millones|mill)/))) out.valor = Math.round(Number(x[1].replace(',', '.')) * 1e6);
    // Fechas: las dos primeras que aparezcan
    const fechas = [];
    let resto = tx;
    for (let k = 0; k < 4 && fechas.length < 2; k++) { const f = leerFecha(resto); if (!f) break; if (!/^(hoy|manana)/.test(f.m.trim())) fechas.push(f.f); resto = resto.replace(f.m, ' '); }
    fechas.sort(); if (fechas[0]) out.fecha_inicio = fechas[0]; if (fechas[1]) out.fecha_fin = fechas[1];
    for (const f of FACULTADES) if (tx.includes(norm(f)) && f !== 'OTRO') { out.facultad = f; break; }
    return out;
  }
  function llenarPrograma(f, d) {
    const setSeg = (name, v) => { if (!v || !f[name]) return; f[name].value = v; f.querySelectorAll(`[data-name="${name}"]`).forEach(b => b.classList.toggle('on', b.dataset.v === v)); };
    if (d.nombre && !f.nombre.value.trim()) f.nombre.value = d.nombre;
    if (d.empresa && f.empresa && !f.empresa.value.trim()) f.empresa.value = d.empresa;
    if (d.ruta) { const b = f.querySelector(`[data-act="seg-ruta"][data-clave="${d.ruta}"]`); if (b) b.click(); }
    setSeg('tipo_programa', d.tipo_programa); setSeg('es_nuevo', d.es_nuevo);
    const md = modDesde(d.modalidad); if (md && f.modalidad) f.modalidad.value = md;
    if (d.fecha_inicio && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha_inicio)) f.fecha_inicio.value = d.fecha_inicio;
    if (d.fecha_fin && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha_fin)) f.fecha_fin.value = d.fecha_fin;
    const extra = { horas: d.horas, participantes: d.participantes, valor: d.valor ?? d.valor_total ?? d.valor_persona, facultad: d.facultad, director: d.director };
    Object.entries(extra).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '' && f['x_' + k]) f['x_' + k].value = v; });
    const res = [extra.horas && `${extra.horas} h`, extra.participantes && `${extra.participantes} participantes`, extra.valor && money(extra.valor), extra.facultad, extra.director].filter(Boolean);
    const e = f.querySelector('.extra-cap');
    if (e) { e.hidden = !res.length; e.innerHTML = res.length ? `También tomé para el Cuadro Maestro: <b>${res.map(esc).join(' · ')}</b>` : ''; }
  }

  // ───────────── Asistente IA (opcional y con tope de costo) ─────────────
  const IA = { on: false, info: null };
  async function iaEstado() {
    if (S.mode !== 'remote' || !S.user) return;
    try { const { data, error } = await sb.rpc('estado_ia'); if (!error && data) { IA.info = data; IA.on = !!data.configurada; } } catch (e) { /* sin conexión */ }
  }
  function iaContexto(pid) {
    const ps = S.data.programas.filter(p => p.estado === 'activo' && (!pid || p.id === pid));
    return {
      hoy: today(), dia_semana: new Date().toLocaleDateString('es-CO', { weekday: 'long' }), cargos: ACTORES,
      programas: ps.map(p => {
        const fs = fasesDe(p), ia = fs.indexOf(faseActual(p));
        const pasos = itemsOrdenados(p).filter(i => abierto(i) && (pid || fs.indexOf(i.fase) <= ia + 1)).slice(0, pid ? 40 : 14);
        return { id: p.id, nombre: nombreProg(p), nombre_completo: p.nombre, empresa: empresaTxt(p), fase: faseActual(p), pasos_abiertos: pasos.map(i => ({ id: i.id, titulo: i.titulo, hito: i.hito || undefined })) };
      }),
    };
  }
  async function iaLlamar(texto, pid) {
    const { data: { session } } = await sb.auth.getSession();
    const r = await fetch(`${CFG.supabaseUrl}/functions/v1/asistente`, {
      method: 'POST', headers: { Authorization: 'Bearer ' + session.access_token, apikey: CFG.supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, contexto: iaContexto(pid) }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      const msg = { sin_llave: 'Falta la llave del asistente (Más > Asistente IA).', limite: 'Llegaste al tope de usos de este mes. Puedes subirlo en Más > Asistente IA.',
        llave_invalida: 'La llave del asistente no es válida.', sin_saldo: 'La cuenta de la API no tiene saldo.' }[j.error] || 'El asistente no respondió. Intenta de nuevo.';
      throw new Error(msg);
    }
    if (IA.info) { IA.info.usos_mes = j.usos; }
    return j.propuesta;
  }
  const TIPO_IA = { tarea: ['Tarea', ''], esperando: ['Esperando', 'amber'], nota: ['Nota', 'blue'], hecho: ['Hecho', 'green'] };
  function formIA(prop, texto) {
    S.iaProp = prop;
    const acc = prop.acciones || [], pn = prop.programa_nuevo;
    const prog = id => byId('programas', id);
    const fila = (a, k) => {
      const p = prog(a.programa_id || prop.programa_id), paso = a.item_id ? byId('items', a.item_id) : null;
      const meta = [p ? nombreProg(p) : (pn ? 'Programa nuevo' : 'Sin programa'), a.fecha && relDate(a.fecha), a.hora && fmtHora(a.hora), a.esperando_a].filter(Boolean);
      return `<label class="ia-row"><input type="checkbox" name="a${k}" checked><div class="grow"><div class="row" style="gap:6px"><span class="pill ${TIPO_IA[a.tipo]?.[1] || ''}">${TIPO_IA[a.tipo]?.[0] || a.tipo}</span>
        <b class="grow">${esc(a.tipo === 'hecho' && paso ? paso.titulo : a.titulo)}</b></div><div class="tiny muted">${meta.map(esc).join(' · ')}</div></div></label>`;
    };
    modal(`<form data-form="ia-aplicar">
      ${sheetHead('Lo que entendí')}
      <p class="small" style="margin-top:-6px">${esc(prop.resumen || '')}</p>
      ${pn ? `<label class="ia-row nuevo"><input type="checkbox" name="pn" checked><div class="grow"><div class="row" style="gap:6px"><span class="pill accent">Programa nuevo</span><b class="grow">${esc(pn.nombre)}</b></div>
        <div class="tiny muted">${[pn.empresa, { cerrado: 'Cerrado B2B', aval: 'Aval académico', abierta: 'Oferta abierta' }[pn.ruta], pn.modalidad, pn.fecha_inicio && 'Inicio ' + fmtDate(pn.fecha_inicio), pn.horas && pn.horas + ' h', pn.participantes && pn.participantes + ' participantes'].filter(Boolean).map(esc).join(' · ')}</div></div></label>` : ''}
      <div class="ia-list">${acc.map(fila).join('') || (pn ? '' : '<p class="small muted">No encontré nada para registrar.</p>')}</div>
      <input type="hidden" name="texto" value="${esc(texto)}">
      <p class="tiny muted">Revisa y desmarca lo que no quieras. Nada se guarda hasta que confirmes.</p>
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar lo marcado</button></div>
    </form>`);
  }
  function cardIA() {
    if (S.mode !== 'remote') return '';
    const i = IA.info;
    const costo = i ? (i.tokens_in * 0.10 + i.tokens_out * 0.50) / 1e6 : 0;
    const cuerpo = IA.on
      ? `<p class="small muted">Activo con Claude Haiku 5.5. Este mes: <b>${i.usos_mes} de ${i.limite} usos</b> · costo aproximado <b>US$ ${costo.toFixed(costo < 0.1 ? 3 : 2)}</b>. Al llegar al tope deja de responder hasta el mes siguiente.</p>
        <form class="row" data-form="ia-config" style="gap:8px"><input class="input" type="number" name="limite" min="10" step="10" value="${i.limite}" style="width:110px" aria-label="Tope de usos por mes"><button class="btn sm">Cambiar tope</button><button type="button" class="btn sm danger" data-act="ia-quitar">Quitar llave</button></form>`
      : `<p class="small muted">Opcional. Convierte correos pegados o notas largas en tareas, seguimientos, avances y programas nuevos. Usa Claude Haiku 5.5, el modelo más económico: cada uso cuesta menos de US$ 0,001, y tú pones un tope de usos al mes. El registro rápido normal funciona sin esto y no cuesta nada.</p>
        <form data-form="ia-config"><div class="field"><label>Llave de la API de Anthropic</label><input class="input" type="password" name="llave" autocomplete="off" required placeholder="sk-ant-…"></div>
        <div class="row" style="gap:8px"><div class="field" style="margin:0"><label>Tope de usos al mes</label><input class="input" type="number" name="limite" min="10" step="10" value="300" style="width:120px"></div>
        <button class="btn primary sm" style="align-self:flex-end">Guardar</button></div>
        <p class="tiny muted" style="margin:8px 0 0">La llave se guarda en el servidor y la app no puede volver a leerla.</p></form>`;
    return `<div class="card pad section"><div class="row"><span class="kpi-ic ${IA.on ? 'green' : 'violet'}">${ICON.spark}</span><h2 class="grow">Asistente IA</h2></div>${cuerpo}</div>`;
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
        <button class="btn" style="width:100%" data-act="export-xlsx">Exportar Cuadro Maestro (Excel)</button>
        <button class="btn" style="width:100%" data-act="export-csv">Exportar hoja BD (CSV)</button>
        <button class="btn" style="width:100%" data-act="export-json">Descargar respaldo completo (JSON)</button>
        <label class="btn" style="width:100%;display:block;text-align:center">Importar respaldo (JSON)<input type="file" accept="application/json,.json" data-change="import" hidden></label>
        ${S.mode === 'remote' ? `<p class="small muted">Sesión: ${esc(S.user?.email || '')}</p><button class="btn danger" style="width:100%" data-act="logout">Cerrar sesión</button>`
          : '<p class="small muted">Modo local. Para sincronizar entre el celular y el PC, completa config.js con los datos de Supabase.</p>'}
        <p class="tiny muted" style="text-align:center">Versión ${esc(BUILD)}</p>
      </div>`);
  }

  // ───────────── Exportar / importar ─────────────
  const CM_HEAD = ['Gestor', 'Línea de negocio', 'Tipo', 'Mes', 'Día', 'Mes2', 'Día3', 'Orden Interna', 'Acuerdo consejo investigación', 'Nombre del programa', 'Empresa\n(N/A Para Abierto)', 'Estado',
    'Matriculados', 'Intensidad Horaria', 'Valor programa \n(Valor de contrato)', 'Ingresos 2026', 'Facturado 2026', 'Facultad UEB', 'Programa', 'Nombre del director', 'Cédula', 'Modalidad',
    'Plataforma (Zomm / Meet)', 'Tipo Programa', 'Id_Tipo Curso', 'Segmento', 'Trimestre', 'Semestre'];
  const cmFila = p => { const v = cmValores(p); return CM_COLS.map(([k]) => v[k] ?? ''); };
  function exportCSV() {
    const cell = v => { const x = String(v ?? ''); return /[;"\n\r]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    download(`cuadro-maestro-${today()}.csv`, '\ufeff' + [CM_HEAD, ...programasCM().map(cmFila)].map(r => r.map(cell).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
    toast('CSV con las columnas de la hoja BD');
  }

  // ───────────── Cuadro Maestro: importar tu archivo y exportarlo idéntico ─────────────
  // Columnas de la hoja BD, reconocidas por su encabezado (el orden y el texto exacto salen del archivo).
  const CM_COLS = [
    ['gestor', /^gestor/], ['linea', /^linea de negocio/], ['tipo', /^tipo$/], ['mes_i', /^mes$/], ['dia_i', /^dia$/], ['mes_f', /^mes ?2$/], ['dia_f', /^dia ?3$/],
    ['orden', /^orden interna/], ['acuerdo', /^acuerdo/], ['nombre', /^nombre del programa/], ['empresa', /^empresa/], ['estado', /^estado/],
    ['matric', /^matriculados/], ['horas', /^intensidad/], ['valor', /^valor programa/], ['ingresos', /^ingresos/], ['facturado', /^facturado/],
    ['facultad', /^facultad/], ['programa', /^programa$/], ['director', /^nombre del director/], ['cedula', /^cedula/], ['modalidad', /^modalidad/],
    ['plataforma', /^plataforma/], ['tipo_prog', /^tipo programa/], ['id_tipo', /^id.?tipo/], ['segmento', /^segmento/], ['trimestre', /^trimestre/], ['semestre', /^semestre/],
  ];
  const cmClave = h => { const n = norm(String(h ?? '').replace(/_x000a_/gi, ' ').replace(/\n/g, ' ')).replace(/\(.*$/, '').trim(); return (CM_COLS.find(([, re]) => re.test(n)) || [])[0] || null; };
  const ESTADO_CM_FILE = { 'Proyección': 'PROYECCIÓN / EN NEGOCIACIÓN', 'Negociación': 'PROYECCIÓN / EN NEGOCIACIÓN', 'Iniciado': 'INICIADO / EJECUTADO', 'Ejecutado': 'INICIADO / EJECUTADO', 'Aplazado': 'APLAZADO / CANCELADO', 'Cancelado': 'APLAZADO / CANCELADO' };
  const MOD_FILE = { 'Virtual': 'VIRTUAL ', 'Virtual sincrónica': 'VIRTUAL ', 'Virtual asincrónica': 'VIRTUAL ', 'Presencial': 'PRESENCIAL', 'Semipresencial': 'SEMIPRESENCIAL', 'Híbrido (virtual + presencial)': 'HÍBRIDO (VIRTUAL + PRESENCIAL)', 'Híbrida': 'HÍBRIDO (VIRTUAL + PRESENCIAL)' };
  const modDesde = v => { const n = norm(v); if (!n) return null; if (n.startsWith('hibrid')) return 'Híbrido (virtual + presencial)'; if (n.startsWith('semi')) return 'Semipresencial'; if (n.startsWith('presencial')) return 'Presencial'; if (n.includes('virtual') || n.includes('sincron')) return 'Virtual'; return null; };
  const PLAT_FILE = { 'Zoom': 'ZOOM', 'Meet': 'MEET', 'Presencial': 'PRESENCIAL', 'Asincrónico - Ateneo': 'ASINCRONICO - ATENEO', 'Aval - plataforma externa': 'AVAL - PLATAFORMA EXTERNA' };
  const platDesde = v => { const n = norm(v); if (!n) return null; const k = Object.keys(PLAT_FILE).find(x => norm(PLAT_FILE[x]) === n || norm(x) === n); return k || String(v).trim(); };
  const FAC_VIEJAS = { 'Enfermería': 'ENFERMERIA', 'Medicina': 'MEDICINA', 'Odontología': 'ODONTOLOGÍA', 'Psicología': 'PSICOLOGÍA', 'Ingeniería': 'INGENIERÍA', 'Educación': 'EDUCACIÓN', 'Ciencias Económicas y Administrativas': 'ADMINISTRACIÓN', 'Otra': 'OTRO' };
  const facultadCM = p => FAC_VIEJAS[p.facultad] || p.facultad || '';
  const TIPO_X = { 1: 'CURSOS', 2: 'CURSOS', 3: 'DIPLOMADOS', 4: 'EVENTOS', 5: 'CURSOS' };
  const tipoCM = p => p.tipo_cm || TIPO_X[p.tipo_programa] || 'CURSOS';
  const num = v => { if (v === null || v === undefined || v === '') return null; const n = typeof v === 'number' ? v : Number(String(v).replace(/[$\s.]/g, '').replace(',', '.')); return isNaN(n) ? null : n; };
  // Valores de una fila del Cuadro Maestro para un programa, con el vocabulario exacto del archivo
  function cmValores(p) {
    const raw = p.cm_raw || {}, ab = esAbierta(p), imp = !!p.cm_raw;
    const mes = d => d ? MESES_CM[parse(d).getMonth()] : null, dia = d => d ? parse(d).getDate() : null;
    const mismaFecha = raw._fi === (p.fecha_inicio || null) && raw._ff === (p.fecha_fin || null);
    const tri = p.fecha_inicio ? 'T' + (Math.floor(parse(p.fecha_inicio).getMonth() / 3) + 1) : null, sem = p.fecha_inicio ? (parse(p.fecha_inicio).getMonth() < 6 ? 1 : 2) : null;
    const tipoRaw = ['ABIERTO', 'CERRADO', 'EVENTOS'].includes(raw.tipo) && ((raw.tipo === 'ABIERTO') === ab) ? raw.tipo : null;
    const ingresos = p.ingresos !== null && p.ingresos !== undefined && p.ingresos !== '' ? Number(p.ingresos) : imp ? null : (['Iniciado', 'Ejecutado'].includes(p.estado_cm) ? ingresosCM(p) || null : null);
    const fact = p.facturado !== null && p.facturado !== undefined && p.facturado !== '' ? Number(p.facturado) : (facturadoCM(p) || (imp ? null : null));
    const igual = (rv, v) => typeof rv === 'string' && v !== null && v !== undefined && rv.trim() === String(v).trim() ? rv : v;
    const ordenN = p.orden_interna && /^\d+$/.test(String(p.orden_interna).trim()) ? Number(p.orden_interna) : (p.orden_interna || null);
    const estadoF = ESTADO_CM_FILE[p.estado_cm || 'Proyección'];
    return {
      gestor: raw.gestor || 'YEFERSON VARGAS', linea: p.linea_cm || raw.linea || 'SECTOR SALUD & FARMA', tipo: tipoRaw || (ab ? 'ABIERTO' : 'CERRADO'),
      mes_i: imp && mismaFecha ? raw.mes_i ?? null : mes(p.fecha_inicio), dia_i: imp && mismaFecha ? raw.dia_i ?? null : dia(p.fecha_inicio),
      mes_f: imp && mismaFecha ? raw.mes_f ?? null : mes(p.fecha_fin), dia_f: imp && mismaFecha ? raw.dia_f ?? null : dia(p.fecha_fin),
      orden: raw.orden !== undefined && raw.orden !== null && String(raw.orden).trim() === String(p.orden_interna ?? '').trim() ? raw.orden : ordenN,
      acuerdo: igual(raw.acuerdo, p.acuerdo_consejo || null), nombre: igual(raw.nombre, p.nombre), empresa: ab ? (raw.empresa || 'N/A') : igual(raw.empresa, entidadDe(p)?.nombre || raw.empresa || null),
      estado: raw.estado && ESTADO_CM_FILE[p.estado_cm] && norm(raw.estado) === norm(estadoF) ? raw.estado : estadoF,
      matric: num(p.participantes), horas: num(p.horas), valor: num(ab ? p.valor_persona : p.valor_total), ingresos, facturado: fact,
      facultad: igual(raw.facultad, facultadCM(p) || null), programa: igual(raw.programa, p.programa_academico || null), director: igual(raw.director, p.director || null), cedula: igual(raw.cedula, p.director_cedula || null),
      modalidad: raw.modalidad && modDesde(raw.modalidad) === p.modalidad ? raw.modalidad : (MOD_FILE[p.modalidad] || p.modalidad || null),
      plataforma: raw.plataforma && platDesde(raw.plataforma) === p.plataforma ? raw.plataforma : (PLAT_FILE[p.plataforma] || (p.plataforma ? String(p.plataforma).toUpperCase() : null)),
      tipo_prog: tipoCM(p), id_tipo: num(p.tipo_programa) ?? 1, segmento: p.segmento || raw.segmento || 'EDUCACIÓN CONTINUA',
      trimestre: mismaFecha && raw.trimestre ? raw.trimestre : (tri || raw.trimestre || null), semestre: mismaFecha && raw.semestre ? raw.semestre : (sem ?? raw.semestre ?? null),
    };
  }
  // Orden de las filas: el del archivo importado, y los programas nuevos al final por fecha de inicio
  const programasCM = () => [...S.data.programas].sort((a, b) => ((a.cm_raw?._row ?? 1e6) - (b.cm_raw?._row ?? 1e6)) || (a.fecha_inicio || '9999').localeCompare(b.fecha_inicio || '9999') || (a.created_at || '').localeCompare(b.created_at || ''));

  // ── Leer el archivo ──
  function leerCuadro(X, buf) {
    const wb = X.read(buf, { type: 'array', cellDates: false });
    const nombre = wb.SheetNames.find(n => /^bd\b/i.test(n.trim())) || wb.SheetNames[0];
    const ws = wb.Sheets[nombre];
    const filas = X.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: true });
    const hi = filas.findIndex(r => r.some(c => cmClave(c) === 'nombre'));
    if (hi < 0) throw new Error('No encontré la fila de encabezados (con "Nombre del programa") en la hoja ' + nombre);
    const cols = filas[hi].map(cmClave);
    const year = Number((nombre.match(/20\d\d/) || [])[0]) || new Date().getFullYear();
    const out = [];
    for (let k = hi + 1; k < filas.length; k++) {
      const r = {}; filas[k].forEach((v, j) => { if (cols[j]) r[cols[j]] = typeof v === 'string' ? (v.trim() === '' ? null : v) : v; });
      if (!r.nombre || norm(r.gestor) === 'total') { if (norm(r.gestor) === 'total') break; continue; }
      r._row = k + 1; out.push(r);
    }
    return { hoja: nombre, year, filas: out, encabezados: filas[hi] };
  }
  const MES_IDX = Object.fromEntries(MESES_CM.map((m, i) => [norm(m), i]));
  function fechaCM(year, mes, dia) {
    const m = MES_IDX[norm(mes)]; if (m === undefined) return null;
    const d = Number(dia) || 1; return isoOf(new Date(year, m, Math.min(28 + 3, d)));
  }
  // Fila del archivo → datos de Rumbo
  function filaAPrograma(r, year) {
    const t = today();
    let fi = fechaCM(year, r.mes_i, r.dia_i), ff = fechaCM(year, r.mes_f, r.dia_f);
    if (fi && ff && ff < fi) ff = fechaCM(year + 1, r.mes_f, r.dia_f);
    const plat = norm(r.plataforma), ruta = /aval|ateneo/.test(plat) ? 'aval' : norm(r.tipo) === 'abierto' ? 'abierta' : 'cerrado';
    const e = norm(r.estado);
    let estado_cm = 'Proyección', estado = 'activo', pend = null;
    if (e.startsWith('iniciado')) { if (ff && ff < t) { estado_cm = 'Ejecutado'; estado = 'cerrado'; if (diffDays(t, ff) <= 60) pend = 'cierre'; } else estado_cm = 'Iniciado'; }
    else if (e.startsWith('aplazado')) { estado_cm = 'Aplazado'; estado = 'pausa'; pend = 'aplazado'; }
    const ab = ruta === 'abierta', idt = num(r.id_tipo);
    const campos = {
      nombre: String(r.nombre).trim(), fecha_inicio: fi, fecha_fin: ff, orden_interna: r.orden !== null && r.orden !== undefined ? String(r.orden).trim() : null,
      acuerdo_consejo: r.acuerdo ? String(r.acuerdo) : null, participantes: num(r.matric), horas: num(r.horas),
      valor_total: ab ? null : num(r.valor), valor_persona: ab ? num(r.valor) : null, ingresos: num(r.ingresos), facturado: num(r.facturado),
      facultad: r.facultad ? String(r.facultad).trim() : null, programa_academico: r.programa ? String(r.programa).trim() : null,
      director: r.director ? String(r.director).trim() : null, director_cedula: r.cedula ? String(r.cedula) : null,
      modalidad: modDesde(r.modalidad), plataforma: platDesde(r.plataforma), tipo_programa: idt ? String(idt) : '1', tipo_cm: r.tipo_prog ? String(r.tipo_prog).trim() : null,
      segmento: r.segmento ? String(r.segmento) : null, linea_cm: r.linea ? String(r.linea) : null, estado_cm, estado,
    };
    const cm_raw = { ...r, _fi: fi, _ff: ff };
    return { ruta, campos, cm_raw, pend, empresa: !ab && r.empresa && norm(r.empresa) !== 'n/a' ? String(r.empresa).trim() : null };
  }
  const claveProg = (nombre, fi, empresa, orden) => orden ? 'oi:' + String(orden).trim() : `n:${norm(nombre)}|${(fi || '').slice(0, 7)}|${norm(empresa)}`;

  // ── Formato guardado (tu archivo), para exportar idéntico ──
  const CMF = { tiene: false, nombre: '', fecha: '' };
  const LS_CMF = 'rumbo-cm-formato';
  async function guardarFormato(file, buf) {
    if (S.mode === 'remote') {
      const { error } = await sb.storage.from('cuadro-maestro').upload('formato.xlsx', new Blob([buf]), { upsert: true, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (error) throw new Error('No pude guardar el formato: ' + error.message);
    } else {
      try { let b = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 32768) b += String.fromCharCode(...u.subarray(i, i + 32768)); localStorage.setItem(LS_CMF, btoa(b)); } catch (e) { /* sin espacio */ }
    }
    Object.assign(CMF, { tiene: true, nombre: file.name, fecha: today() });
    try { localStorage.setItem(LS_CMF + '-meta', JSON.stringify(CMF)); } catch (e) { /* sin almacenamiento */ }
  }
  async function estadoFormato() {
    try { Object.assign(CMF, JSON.parse(localStorage.getItem(LS_CMF + '-meta') || '{}')); } catch (e) { /* nada */ }
    if (S.mode === 'remote' && S.user) {
      try { const { data } = await sb.storage.from('cuadro-maestro').list('', { search: 'formato.xlsx' }); const f = (data || []).find(x => x.name === 'formato.xlsx'); CMF.tiene = !!f; if (f) CMF.fecha = (f.updated_at || f.created_at || '').slice(0, 10); } catch (e) { /* sin conexión */ }
    } else { try { CMF.tiene = !!localStorage.getItem(LS_CMF); } catch (e) { CMF.tiene = false; } }
  }
  async function leerFormato() {
    if (S.mode === 'remote') { const { data, error } = await sb.storage.from('cuadro-maestro').download('formato.xlsx'); if (error || !data) return null; return await data.arrayBuffer(); }
    try { const b = atob(localStorage.getItem(LS_CMF) || ''); if (!b) return null; const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; } catch (e) { return null; }
  }

  // ── Importar ──
  async function prepararImportacion(file) {
    toast('Leyendo el Cuadro Maestro…');
    const X = await cargarXLSX(), buf = await file.arrayBuffer();
    const L = leerCuadro(X, buf);
    const existentes = new Map();
    S.data.programas.forEach(p => {
      existentes.set(claveProg(p.nombre, p.fecha_inicio, entidadDe(p)?.nombre, null), p);
      if (p.orden_interna) existentes.set(claveProg(null, null, null, p.orden_interna), p);
      if (p.cm_raw?._k) existentes.set(p.cm_raw._k, p);
    });
    const vistos = {};
    const items = L.filas.map(r => {
      const x = filaAPrograma(r, L.year);
      let k = claveProg(x.campos.nombre, x.campos.fecha_inicio, x.empresa, null);
      vistos[k] = (vistos[k] || 0) + 1; if (vistos[k] > 1) k += '#' + vistos[k];
      x.cm_raw._k = k;
      x.match = (x.campos.orden_interna && existentes.get(claveProg(null, null, null, x.campos.orden_interna))) || existentes.get(k) || null;
      return x;
    });
    S.imp = { file, buf, L, items };
    formImportar();
  }
  function formImportar() {
    const { L, items, file } = S.imp;
    const nuevos = items.filter(x => !x.match), act = items.filter(x => x.match);
    const c = e => items.filter(x => !x.match && x.campos.estado_cm === e).length;
    const fila = (n, l, sub) => n ? `<div class="imp-row"><b>${n}</b><span>${l}${sub ? `<small>${sub}</small>` : ''}</span></div>` : '';
    modal(`<form data-form="importar">
      ${sheetHead('Importar Cuadro Maestro')}
      <p class="small muted" style="margin-top:-6px">${esc(file.name)} · hoja ${esc(L.hoja)} · ${plural(items.length, 'programa')}</p>
      <div class="card pad imp-res">
        ${fila(c('Iniciado'), 'en curso', 'Con su checklist; lo anterior a hoy queda como hecho')}
        ${fila(c('Proyección'), 'en proyección o negociación', 'Con su checklist completo')}
        ${fila(c('Aplazado'), 'aplazados o cancelados', 'Te pregunto cuál es cuál')}
        ${fila(c('Ejecutado'), 'ya ejecutados', 'Quedan como registro; te pregunto por el cierre de los recientes')}
        ${fila(act.length, 'ya están en Rumbo', 'Solo se actualizan sus datos del Cuadro Maestro')}
      </div>
      <label class="small row" style="margin:12px 0 8px"><input type="checkbox" name="formato" checked> Usar este archivo como formato para exportar (sale igual: hojas, tabla, listas y totales)</label>
      <label class="small row" style="margin-bottom:12px"><input type="checkbox" name="marcar" checked> En los programas en curso, marcar como hechos los pasos con fecha anterior a hoy</label>
      <p class="tiny muted">La ruta sale del archivo: ABIERTO es oferta abierta, CERRADO es B2B y las plataformas de aval o Ateneo son aval académico.</p>
      <div class="sheet-actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Importar ${plural(items.length, 'programa')}</button></div>
    </form>`);
  }
  async function ejecutarImportacion(opc) {
    const { items, file, buf } = S.imp, t = today();
    const rutas = Object.fromEntries(S.data.rutas.map(r => [r.clave, r]));
    const entCache = {};
    const entidadId = async nombre => {
      if (!nombre) return null; const k = norm(nombre);
      if (entCache[k]) return entCache[k];
      const e = entidadPorNombre(nombre) || await db.insert('entidades', { nombre });
      return (entCache[k] = e.id);
    };
    let nNuevos = 0, nAct = 0, nHechos = 0;
    const pasos = [];
    for (const x of items) {
      const entidad_id = await entidadId(x.empresa);
      if (x.match) {
        const p = x.match, patch = {};
        Object.entries(x.campos).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '' && !['estado', 'estado_cm'].includes(k)) patch[k] = v; });
        if (entidad_id && rutas[x.ruta]?.clave !== 'abierta') patch.entidad_id = entidad_id;
        patch.estado_cm = x.campos.estado_cm; patch.estado = p.estado === 'activo' && x.campos.estado === 'cerrado' && itemsDe(p.id).some(abierto) ? 'activo' : x.campos.estado;
        patch.cm_raw = x.cm_raw; patch.actualizado = nowIso();
        await db.update('programas', p.id, patch); nAct++;
        continue;
      }
      const ruta = rutas[x.ruta] || rutas.cerrado;
      const p = await db.insert('programas', { ...x.campos, ruta_id: ruta.id, entidad_id: x.ruta === 'abierta' ? null : entidad_id, modulos: [], es_nuevo: true, prioridad: 'media',
        cm_raw: x.cm_raw, cm_pendiente: x.pend, actualizado: nowIso() });
      nNuevos++;
      if (x.campos.estado === 'cerrado') continue; // ejecutado: queda como registro
      const its = generarItems(p, [], true);
      if (x.campos.estado_cm === 'Iniciado' && opc.marcar) {
        const fs = fasesDe(p), ej = Math.max(fs.indexOf('Ejecución'), fs.indexOf('Operación'));
        its.forEach(i => {
          const antes = ej > 0 && fs.indexOf(i.fase) < ej, vencido = i.fecha_limite && i.fecha_limite < t;
          if (i.estado === 'pendiente' && (antes || vencido)) { i.estado = 'hecho'; i.fecha_hecho = i.fecha_limite && i.fecha_limite < t ? i.fecha_limite : t; i.recordar_at = null; i.nota = 'Marcado al importar el Cuadro Maestro'; nHechos++; }
        });
      }
      its.forEach(i => { if (i.estado === 'pendiente' && i.fecha_limite && i.fecha_limite < t && x.campos.estado_cm !== 'Iniciado') i.recordar_at = null; });
      pasos.push(...its);
    }
    if (pasos.length) await db.insert('items', pasos);
    if (opc.formato) await guardarFormato(file, buf);
    S.imp = null;
    return { nNuevos, nAct, nHechos };
  }

  // ── Acompañamiento: completar lo que falta, programa por programa ──
  // Lo que el Cuadro Maestro necesita de cada programa (las columnas que en tu archivo siempre van llenas)
  function faltantesCM(p) {
    const f = [], ab = esAbierta(p), corre = ['Iniciado', 'Ejecutado'].includes(p.estado_cm);
    if (!ab && !p.entidad_id) f.push('empresa');
    if (!p.fecha_inicio) f.push('fecha_inicio');
    if (!p.fecha_fin) f.push('fecha_fin');
    if (!p.tipo_programa) f.push('tipo_programa');
    if (!p.facultad) f.push('facultad');
    if (!p.programa_academico) f.push('programa_academico');
    if (!p.modalidad) f.push('modalidad');
    if (!p.plataforma) f.push('plataforma');
    if (!p.horas) f.push('horas');
    if (ab ? !p.valor_persona : !p.valor_total) f.push('valor');
    if (corre && (p.participantes === null || p.participantes === undefined || p.participantes === '')) f.push('participantes');
    if (!p.director) f.push('director');
    if (corre && !p.orden_interna) f.push('orden_interna');
    return f;
  }
  const ETQ_CM = { empresa: 'Empresa', fecha_inicio: 'Fecha de inicio', fecha_fin: 'Fecha de fin', tipo_programa: 'Tipo de programa', facultad: 'Facultad', programa_academico: 'Programa',
    modalidad: 'Modalidad', plataforma: 'Plataforma', horas: 'Intensidad horaria', valor: 'Valor', participantes: 'Matriculados', director: 'Director', orden_interna: 'Orden interna' };
  const TOTAL_CM = p => 11 + (['Iniciado', 'Ejecutado'].includes(p.estado_cm) ? 2 : 0) - (esAbierta(p) ? 1 : 0);
  const porCompletar = () => S.data.programas.filter(p => p.cm_pendiente || ((p.estado === 'activo' || p.estado === 'pausa') && faltantesCM(p).length))
    .sort((a, b) => (!!b.cm_pendiente - !!a.cm_pendiente) || ((a.estado_cm === 'Iniciado' ? 0 : 1) - (b.estado_cm === 'Iniciado' ? 0 : 1)) || (a.fecha_inicio || '9999').localeCompare(b.fecha_inicio || '9999'));
  function viewCompletar() {
    const cola = porCompletar(), total = S.compTotal || cola.length;
    const head = `<div class="page-head"><button class="btn ghost back" data-act="nav" data-to="inicio">${ICON.back}<span>Salir</span></button></div>`;
    const p = cola.find(x => !(S.compSaltados || []).includes(x.id));
    if (!p) return head + `<div class="card pad empty-ok"><span class="kpi-ic green">${ICON.check}</span><h1>Cuadro Maestro al día</h1>
      <p class="muted">${cola.length ? `Saltaste ${plural(cola.length, 'programa')}; puedes retomarlos cuando quieras.` : 'Todos tus programas tienen los datos que pide el Cuadro Maestro.'}</p>
      <div class="row" style="gap:8px;justify-content:center">${cola.length ? '<button class="btn" data-act="comp-reset">Retomar saltados</button>' : ''}<button class="btn primary" data-act="export-cm">${ICON.download}<span>Exportar Cuadro Maestro</span></button></div></div>`;
    const hechos = Math.max(0, total - cola.length), pct = total ? Math.round(hechos * 100 / total) : 0;
    const falt = faltantesCM(p), ab = esAbierta(p);
    const pregunta = p.cm_pendiente === 'aplazado' ? `<div class="comp-q"><b>En el archivo dice "aplazado o cancelado". ¿Cuál es?</b>
        ${seg('q_estado', [['Aplazado', 'Aplazado'], ['Cancelado', 'Cancelado']], 'Aplazado')}
        <div class="two" data-show="Aplazado">${fld('Nuevo inicio <span class="muted">(si ya lo sabes)</span>', inp('q_inicio', '', 'type="date"'))}${fld('Nuevo fin', inp('q_fin', '', 'type="date"'))}</div></div>`
      : p.cm_pendiente === 'cierre' ? `<div class="comp-q"><b>Terminó el ${fmtDate(p.fecha_fin)}. ¿Ya hiciste el cierre financiero?</b>
        ${seg('q_cierre', [['si', 'Sí, ya cerró'], ['no', 'No, falta']], 'no')}<p class="tiny muted" style="margin:6px 0 0">Si falta, Rumbo te arma los pasos del cierre y la liquidación.</p></div>` : '';
    const campo = k => {
      if (k === 'empresa') return fld('Empresa', inp('empresa', '', 'list="dl-ent" autocomplete="off"'));
      if (k === 'fecha_inicio') return fld('Fecha de inicio', inp('fecha_inicio', '', 'type="date"'));
      if (k === 'fecha_fin') return fld('Fecha de fin', inp('fecha_fin', '', 'type="date"'));
      if (k === 'tipo_programa') return fld('Tipo de programa', seg('tipo_programa', TIPOS_CM, '1'));
      if (k === 'facultad') return fld('Facultad', `<select class="input" name="facultad">${opts(FACULTADES, '', 'Elegir…')}</select>`);
      if (k === 'programa_academico') return fld('Programa', inp('programa_academico', '', 'list="dl-progcm" autocomplete="off" placeholder="Ej.: Enfermería"'));
      if (k === 'modalidad') return fld('Modalidad', seg('modalidad', MODALIDADES.map(m => [m, m.replace(' (virtual + presencial)', '')]), ''));
      if (k === 'plataforma') return fld('Plataforma', seg('plataforma', PLATAFORMAS.map(m => [m, m]), ''));
      if (k === 'horas') return fld('Intensidad horaria', inp('horas', '', 'type="number" min="0" step="any" inputmode="decimal"'));
      if (k === 'valor') return fld(ab ? 'Valor por persona (COP)' : 'Valor del programa (COP)', inp('valor', '', 'inputmode="numeric"'));
      if (k === 'participantes') return fld('Matriculados', inp('participantes', '', 'type="number" min="0" inputmode="numeric"'));
      if (k === 'director') return fld('Nombre del director', inp('director', '', 'autocomplete="off"'));
      if (k === 'orden_interna') return fld('Orden interna', inp('orden_interna', '', 'inputmode="numeric"'));
      return '';
    };
    const ents = [...S.data.entidades].sort((a, b) => a.nombre.localeCompare(b.nombre));
    return `${head}
      <div class="comp-top"><div class="row between"><b>Completar Cuadro Maestro</b><span class="small muted">${hechos + 1} de ${total}</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>
      <form class="card pad comp" data-form="completar" data-id="${p.id}">
        <div class="row" style="gap:6px;flex-wrap:wrap"><span class="pill route" style="--rc:${COL_RUTA[rutaDe(p)?.clave] || 'var(--ink-3)'}">${esc(rutaDe(p)?.nombre || '')}</span><span class="pill">${esc(p.estado_cm || 'Proyección')}</span></div>
        <h2 class="comp-name">${esc(p.nombre)}</h2>
        <p class="small muted" style="margin:0 0 14px">${esc(empresaTxt(p))}${p.fecha_inicio ? ' · ' + fmtDate(p.fecha_inicio) + (p.fecha_fin ? ' a ' + fmtDate(p.fecha_fin) : '') : ''}</p>
        ${pregunta}
        ${falt.length ? `<p class="small" style="margin:0 0 10px">Falta${falt.length === 1 ? '' : 'n'} <b>${falt.length}</b> dato${falt.length === 1 ? '' : 's'}. Llena lo que tengas; lo demás puede esperar.</p>${falt.map(campo).join('')}` : ''}
        <datalist id="dl-ent">${ents.map(e => `<option value="${esc(e.nombre)}">`).join('')}</datalist>
        <datalist id="dl-progcm">${PROGRAMAS_CM.map(x => `<option value="${esc(x)}">`).join('')}</datalist>
        <div class="sheet-actions"><button type="button" class="btn" data-act="comp-saltar" data-id="${p.id}">Saltar</button><button class="btn primary">Guardar y seguir</button></div>
      </form>`;
  }

  // ── Exportar idéntico: se reescribe solo la tabla de la hoja BD dentro de tu propio archivo ──
  async function cargarJSZip() {
    if (window.JSZip) return window.JSZip;
    await new Promise((ok, ko) => {
      const sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      sc.onload = ok; sc.onerror = () => ko(new Error('No se pudo cargar el generador del archivo. Revisa la conexión.'));
      document.head.appendChild(sc);
    });
    return window.JSZip;
  }
  const xesc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const colNum = L => L.split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
  const colLet = n => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
  const conRow = (xml, n) => xml.replace(/(<row\b[^>]*\sr=")\d+(")/, `$1${n}$2`).replace(/(<c\b[^>]*\sr="[A-Z]+)\d+(")/g, `$1${n}$2`);
  async function exportCM() {
    const tpl = await leerFormato();
    if (!tpl) { toast('Primero importa tu Cuadro Maestro en Más; así el archivo sale con tu formato'); return exportXLSX(); }
    toast('Armando tu Cuadro Maestro…');
    const JSZip = await cargarJSZip(), zip = await JSZip.loadAsync(tpl);
    const wbXml = await zip.file('xl/workbook.xml').async('string');
    const rels = await zip.file('xl/_rels/workbook.xml.rels').async('string');
    const hojas = [...wbXml.matchAll(/<sheet\b[^>]*>/g)].map(m => ({ tag: m[0], name: attr(m[0], 'name').replace(/&amp;/g, '&'), rid: attr(m[0], 'r:id') }));
    const idx = Math.max(0, hojas.findIndex(h => /^bd\b/i.test(h.name.trim())));
    const hoja = hojas[idx];
    const target = attr((rels.match(new RegExp(`<Relationship\\b[^>]*Id="${hoja.rid}"[^>]*>`)) || [''])[0], 'Target');
    const sheetPath = 'xl/' + target.replace(/^\/?xl\//, '');
    let sx = await zip.file(sheetPath).async('string');
    const srelsPath = sheetPath.replace(/worksheets\//, 'worksheets/_rels/') + '.rels';
    const srels = zip.file(srelsPath) ? await zip.file(srelsPath).async('string') : '';
    const tRel = (srels.match(/<Relationship\b[^>]*relationships\/table"[^>]*>/) || srels.match(/<Relationship\b[^>]*Target="[^"]*tables\/[^"]*"[^>]*>/) || [''])[0];
    const tablePath = tRel ? 'xl/' + attr(tRel, 'Target').replace(/^\.\.\//, '') : null;
    let tx = tablePath ? await zip.file(tablePath).async('string') : null;
    // Encabezado, columnas y totales según la tabla
    const ref = tx ? attr(tx.match(/<table\b[^>]*>/)[0], 'ref') : null;
    const [, c1, r1, c2, r2] = (ref || 'A2:AB98').match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    const conTot = tx ? Number(attr(tx.match(/<table\b[^>]*>/)[0], 'totalsRowCount') || 0) : 0;
    const hdr = Number(r1), oldTot = conTot ? Number(r2) : Number(r2) + 1, first = hdr + 1, nCols = colNum(c2) - colNum(c1) + 1, base = colNum(c1);
    const nombres = tx ? [...tx.matchAll(/<tableColumn\b[^>]*\sname="([^"]*)"/g)].map(m => m[1].replace(/_x000a_/gi, '\n').replace(/&amp;/g, '&')) : [];
    const claves = nombres.map(cmClave);
    // Filas del archivo original
    const sd0 = sx.indexOf('<sheetData'), sd1 = sx.indexOf('</sheetData>');
    const sdOpen = sx.slice(sd0, sx.indexOf('>', sd0) + 1);
    const filas = [...sx.slice(sx.indexOf('>', sd0) + 1, sd1).matchAll(/<row\b[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g)].map(m => ({ xml: m[0], r: Number(attr(m[0].match(/<row\b[^>]*>/)[0], 'r')) }));
    const fila = n => filas.find(f => f.r === n);
    const estilo = {};
    const modelo = fila(first) || fila(first + 1);
    if (modelo) for (const m of modelo.xml.matchAll(/<c\b[^>]*\sr="([A-Z]+)\d+"[^>]*>/g)) estilo[m[1]] = attr(m[0], 's');
    const rowAttrs = f => (f.xml.match(/<row\b([^>]*?)\/?>/)[1]).replace(/\sr="\d+"/, '');
    const ps = programasCM();
    const newTot = first + ps.length, delta = newTot - oldTot;
    const celda = (L, n, v, est) => {
      const st = (est && est[L]) || estilo[L], s = st ? ` s="${st}"` : '';
      if (v === null || v === undefined || v === '') return `<c r="${L}${n}"${s}/>`;
      if (typeof v === 'number' && isFinite(v)) return `<c r="${L}${n}"${s}><v>${v}</v></c>`;
      return `<c r="${L}${n}"${s} t="inlineStr"><is><t xml:space="preserve">${xesc(v)}</t></is></c>`;
    };
    const valores = ps.map(cmValores);
    const datos = ps.map((p, k) => {
      const n = first + k, orig = p.cm_raw?._row ? fila(p.cm_raw._row) : null;
      const at = (orig ? rowAttrs(orig) : modelo ? rowAttrs(modelo) : ` spans="1:${nCols}"`);
      const est = {}; if (orig) for (const m of orig.xml.matchAll(/<c\b[^>]*\sr="([A-Z]+)\d+"[^>]*>/g)) est[m[1]] = attr(m[0], 's');
      const cells = claves.map((key, j) => celda(colLet(base + j), n, key ? valores[k][key] : null, est)).join('');
      return `<row r="${n}"${at}>${cells}</row>`;
    }).join('');
    // Totales: mismas fórmulas, con el valor ya calculado
    let tot = fila(oldTot) ? conRow(fila(oldTot).xml, newTot) : '';
    if (tot) tot = tot.replace(/<c\b([^>]*?)>(<f>([\s\S]*?)<\/f>)(<v>[^<]*<\/v>)?<\/c>/g, (all, a, f, fx) => {
      const m = fx.replace(/&#10;|\n/g, '\n').match(/SUBTOTAL\((\d+),\s*[^\[]*\[([^\]]+)\]/);
      if (!m) return `<c${a}>${f}</c>`;
      const j = nombres.findIndex(x => norm(x) === norm(m[2].replace(/&amp;/g, '&'))), key = claves[j];
      const vals = valores.map(v => v[key]).filter(v => v !== null && v !== undefined && v !== '');
      const val = m[1] === '103' || m[1] === '3' ? vals.length : vals.reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
      return `<c${a}>${f}<v>${val}</v></c>`;
    });
    const antes = filas.filter(f => f.r < first).map(f => f.xml).join('');
    const despues = filas.filter(f => f.r > oldTot).map(f => conRow(f.xml, f.r + delta)).join('');
    sx = sx.slice(0, sd0) + sdOpen + antes + datos + tot + despues + sx.slice(sd1);
    // Rangos que dependen del tamaño de la tabla
    const lastData = newTot - 1, ajusta = tokens => [...new Set(tokens.split(/\s+/).filter(Boolean).map(tk => {
      const m = tk.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/); if (!m) return tk;
      const a = Number(m[2]), b = Number(m[4] || m[2]);
      if (a >= first && a < oldTot) return `${m[1]}${first}:${m[3] || m[1]}${lastData}`;
      if (a > oldTot) return `${m[1]}${a + delta}${m[3] ? `:${m[3]}${b >= 1048000 ? b : b + delta}` : ''}`;
      return tk;
    }))].join(' ');
    sx = sx.replace(/<xm:sqref>([^<]*)<\/xm:sqref>/g, (a, t) => `<xm:sqref>${ajusta(t)}</xm:sqref>`)
      .replace(/(<conditionalFormatting\b[^>]*\ssqref=")([^"]*)(")/g, (a, x, t, z) => x + ajusta(t) + z)
      .replace(/(<dataValidation\b[^>]*\ssqref=")([^"]*)(")/g, (a, x, t, z) => x + ajusta(t) + z);
    const maxR = Math.max(newTot, ...filas.map(f => f.r > oldTot ? f.r + delta : f.r));
    sx = sx.replace(/<dimension ref="([A-Z]+)\d+:([A-Z]+)\d+"\/>/, (a, x, y) => `<dimension ref="${x}1:${y}${maxR}"/>`);
    zip.file(sheetPath, sx);
    if (tx) {
      tx = tx.replace(/(<table\b[^>]*\sref=")[^"]*(")/, `$1${c1}${hdr}:${c2}${conTot ? newTot : lastData}$2`).replace(/(<autoFilter\b[^>]*\sref=")[^"]*(")/, `$1${c1}${hdr}:${c2}${lastData}$2`);
      zip.file(tablePath, tx);
    }
    // Libro: filtro de la hoja, recálculo al abrir y sin la cadena de cálculo vieja
    let wb2 = wbXml.replace(new RegExp(`(<definedName\\b[^>]*localSheetId="${idx}"[^>]*>[^<]*?\\$[A-Z]+\\$)\\d+(:\\$[A-Z]+\\$)\\d+`), `$1${hdr}$2${lastData}`);
    wb2 = /<calcPr\b[^>]*fullCalcOnLoad/.test(wb2) ? wb2 : wb2.replace(/<calcPr\b/, '<calcPr fullCalcOnLoad="1"');
    zip.file('xl/workbook.xml', wb2);
    if (zip.file('xl/calcChain.xml')) {
      zip.remove('xl/calcChain.xml');
      zip.file('xl/_rels/workbook.xml.rels', rels.replace(/<Relationship\b[^>]*calcChain[^>]*\/>/, ''));
      const ct = await zip.file('[Content_Types].xml').async('string');
      zip.file('[Content_Types].xml', ct.replace(/<Override\b[^>]*calcChain[^>]*\/>/, ''));
    }
    const out = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
    const d = new Date(), nombre = `Cuadro_maestro_SF_${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}.xlsx`;
    download(nombre, out, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    toast(`Cuadro Maestro listo: ${plural(ps.length, 'programa')}`);
  }

  // Reporte de seguimiento en Excel: hoja BD (mismas columnas, para pegar), seguimiento por programa, hitos y pendientes
  async function cargarXLSX() {
    if (window.XLSX) return window.XLSX;
    await new Promise((ok, ko) => {
      const sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      sc.onload = ok; sc.onerror = () => ko(new Error('No se pudo cargar el generador de Excel. Revisa la conexión.'));
      document.head.appendChild(sc);
    });
    return window.XLSX;
  }
  async function exportXLSX() {
    toast('Preparando el Excel…');
    const X = await cargarXLSX();
    const ps = [...S.data.programas].sort((a, b) => (a.fecha_inicio || '9999').localeCompare(b.fecha_inicio || '9999'));
    const num = v => (v === null || v === undefined || v === '') ? '' : Number(v);
    const mes = d => d ? MESES_CM[parse(d).getMonth()] : '', dia = d => d ? parse(d).getDate() : '';
    const fx = d => d ? parse(d) : '';
    const bd = [CM_HEAD, ...programasCM().map(cmFila)];
    const seg = [['Programa', 'Empresa', 'Ruta', 'Estado CM', 'Fase actual', 'Avance %', 'Hitos cumplidos', 'Próximo hito', 'Fecha próximo hito', 'Semáforo', 'Estado declarado', 'Nota de estado', 'Inicio', 'Fin', 'Ingresos', 'Datos CM por completar'],
      ...ps.map(p => { const r = resumenHitos(p); return [p.nombre, empresaTxt(p), rutaDe(p)?.nombre || '', p.estado_cm || 'Proyección', faseActual(p), avance(p).pct, r.n ? `${r.d}/${r.n}` : '',
        r.sig?.hito || '', fx(r.sig?.fecha_limite), SEM_TXT[semaforo(p)] || ESTADOS_PROG[p.estado] || '', SALUD[p.salud]?.[0] || '', p.salud_nota || '', fx(p.fecha_inicio), fx(p.fecha_fin), ingresosCM(p) || '', faltantesCM(p).map(x => ETQ_CM[x] || x).join(', ')]; })];
    const hit = [['Programa', 'Hito', 'Responsable', 'Fecha meta', 'Estado', 'Cumplido el'],
      ...ps.flatMap(p => hitosDe(p).map(i => [p.nombre, i.hito, i.responsable || 'Yo', fx(i.fecha_limite), { ok: 'Cumplido', late: 'Atrasado', fut: 'Pendiente' }[estadoHito(i)], fx(i.fecha_hecho)]))];
    const pen = [['Programa', 'Fase', 'Paso', 'Responsable', 'Estado', 'Fecha límite', 'Planeado para', 'Seguimiento', 'Hito'],
      ...ps.filter(p => p.estado === 'activo').flatMap(p => itemsOrdenados(p).filter(abierto).map(i => [p.nombre, i.fase || '', i.titulo, i.estado === 'esperando' ? (i.esperando_a || '') : (i.responsable || 'Yo'),
        ESTADOS_ITEM[i.estado], fx(i.fecha_limite), fx(i.plan_fecha), fx(i.fecha_seguimiento), i.hito || ''])),
      ...S.data.items.filter(i => !i.programa_id && abierto(i)).map(i => ['(Tarea personal)', '', i.titulo, i.responsable || 'Yo', ESTADOS_ITEM[i.estado], fx(i.fecha_limite), fx(i.plan_fecha), fx(i.fecha_seguimiento), ''])];
    const wb = X.utils.book_new();
    const hoja = (rows, nombre, anchos) => {
      const ws = X.utils.aoa_to_sheet(rows, { cellDates: true, dateNF: 'dd/mm/yyyy' });
      ws['!cols'] = anchos.map(w => ({ wch: w }));
      if (rows.length > 1) ws['!autofilter'] = { ref: X.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length - 1, c: rows[0].length - 1 } }) };
      Object.keys(ws).forEach(k => { const c = ws[k]; if (c && c.t === 'n' && k[0] !== '!' && rows[0][X.utils.decode_cell(k).c] && /valor|ingresos|facturado/i.test(rows[0][X.utils.decode_cell(k).c])) c.z = '"$"#,##0'; });
      X.utils.book_append_sheet(wb, ws, nombre);
    };
    hoja(bd, 'BD', [18, 22, 10, 11, 6, 11, 6, 12, 14, 46, 28, 26, 11, 10, 15, 15, 15, 16, 20, 26, 12, 20, 22, 12, 8, 20, 9, 9]);
    hoja(seg, 'Seguimiento', [46, 26, 16, 12, 16, 9, 10, 26, 12, 10, 14, 40, 11, 11, 15, 40]);
    hoja(hit, 'Hitos', [46, 28, 24, 12, 11, 12]);
    hoja(pen, 'Pendientes', [40, 16, 60, 24, 11, 12, 12, 12, 22]);
    const buf = X.write(wb, { type: 'array', bookType: 'xlsx' });
    download(`reporte-seguimiento-${today()}.xlsx`, buf, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    toast('Excel listo: BD, Seguimiento, Hitos y Pendientes');
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
    async 'todo-lunes'(el) {
      const t = today(), prox = el.dataset.d, fecha = i => i.estado === 'esperando' ? i.fecha_seguimiento : (i.plan_fecha || i.fecha_limite);
      const its = itemsVisibles().filter(i => abierto(i) && fecha(i) && fecha(i) < prox);
      if (!confirm(`¿Pasar ${plural(its.length, 'pendiente')} al lunes ${fmtDate(prox)}? Se planean para ese día; la fecha límite original no cambia.`)) return;
      for (const i of its) await db.update('items', i.id, i.estado === 'esperando' ? { fecha_seguimiento: prox } : { plan_fecha: prox });
      render(); toast(`${plural(its.length, 'pendiente')} para el lunes`);
    },
    pv(el) { try { localStorage.setItem('rumbo.pv', el.dataset.v); } catch (e) { /* sin almacenamiento */ } render(); },
    'hoy-modo'(el) { S.hoyModo = el.dataset.v; render(); },
    salud: el => formSalud(byId('programas', el.dataset.id)),
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
    avance: el => formAvance(byId('programas', el.dataset.id)),
    acciones: () => menuAcciones(),
    acc(el) {
      const t = el.dataset.t, p = S.view.name === 'programa' ? byId('programas', S.view.id) : null;
      closeModal();
      setTimeout(() => {
        if (t === 'programa') return formPrograma();
        if (t === 'avance' && p) return formAvance(p);
        formCaptura({ tipo: t === 'recordatorio' ? 'tarea' : t, recordatorio: t === 'recordatorio' });
      }, 200);
    },
    'prog-texto'(el) {
      const f = el.closest('form'), d = extraerPrograma(f._texto.value);
      if (!Object.keys(d).length) { toast('No encontré datos en el texto'); return; }
      llenarPrograma(f, d); toast('Revisa los campos y crea el programa');
    },
    async 'prog-ia'(el) {
      const f = el.closest('form'), t = f._texto.value.trim(); if (!t) { toast('Pega primero el texto'); return; }
      el.disabled = true; el.querySelector('span').textContent = 'Leyendo…';
      try { const prop = await iaLlamar(t); llenarPrograma(f, { ...extraerPrograma(t), ...(prop?.programa_nuevo || {}), valor: prop?.programa_nuevo?.valor_total || prop?.programa_nuevo?.valor_persona }); toast('Revisa los campos y crea el programa'); }
      catch (e) { toast(e.message); }
      el.disabled = false; el.querySelector('span').textContent = 'Llenar con IA';
    },
    async 'ia-captura'(el) {
      const f = el.closest('form'), t = f.texto.value.trim(); if (!t) { toast('Escribe o pega primero el texto'); return; }
      el.disabled = true; el.querySelector('span').textContent = 'Ordenando…';
      try { const prop = await iaLlamar(t, f.programa_id.value || null); if (!prop) throw new Error('El asistente no devolvió nada'); formIA(prop, t); }
      catch (e) { toast(e.message); el.disabled = false; el.querySelector('span').textContent = 'Ordenar con IA'; }
    },
    async 'ia-quitar'() {
      if (!confirm('¿Quitar la llave del asistente? El registro rápido sigue funcionando sin IA.')) return;
      const { error } = await sb.rpc('quitar_llave_ia'); if (error) throw error; await iaEstado(); render(); toast('Asistente desactivado');
    },
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
      if (form._tocado) form._tocado.add(el.dataset.name);
      if (['estado', 'tipo', 'q_estado'].includes(el.dataset.name)) applyShow(form, el.dataset.v);
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
    'export-xlsx': exportXLSX,
    'export-cm': exportCM,
    'comp-saltar'(el) { S.compSaltados = [...(S.compSaltados || []), el.dataset.id]; render(); window.scrollTo(0, 0); },
    'comp-reset'() { S.compSaltados = []; S.compTotal = porCompletar().length; render(); },
    'export-json': () => download(`rumbo-respaldo-${today()}.json`, JSON.stringify(S.data, null, 1), 'application/json'),
    async logout() { await sb.auth.signOut(); S.user = null; S.data = Object.fromEntries(TABLES.map(t => [t, []])); closeModal(); render(); },
  };

  async function entrar(user) {
    S.user = user; S.ready = false; render();
    await loadRemote(); await seedIfEmpty(); await backfillHitos(); S.ready = true; render(); iaEstado().then(render);
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

  // Valores viejos de Rumbo al vocabulario del Cuadro Maestro (una sola vez)
  async function normalizarCM() {
    const MOD = { 'Virtual sincrónica': 'Virtual', 'Virtual asincrónica': 'Virtual', 'Híbrida': 'Híbrido (virtual + presencial)' };
    for (const p of S.data.programas) {
      const patch = {};
      if (MOD[p.modalidad]) patch.modalidad = MOD[p.modalidad];
      if (FAC_VIEJAS[p.facultad]) patch.facultad = FAC_VIEJAS[p.facultad];
      if (Object.keys(patch).length) await db.update('programas', p.id, patch);
    }
  }
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

  // Crea el programa con su checklist. Recibe los campos del formulario corto (y los extra que se tomaron de un texto).
  async function crearPrograma(d) {
    const row = clean({ nombre: d.nombre, tipo_programa: d.tipo_programa, fecha_inicio: d.fecha_inicio, fecha_fin: d.fecha_fin, modalidad: d.modalidad,
      horas: d.x_horas, participantes: d.x_participantes, facultad: d.x_facultad, director: d.x_director });
    if (d.x_valor) row[d.abierta ? 'valor_persona' : 'valor_total'] = Number(d.x_valor);
    Object.assign(row, { ruta_id: d.ruta_id, entidad_id: d.entidad_id || null, modulos: d.modulos || [], es_nuevo: d.es_nuevo !== '0', estado: 'activo', estado_cm: 'Proyección', prioridad: 'media', actualizado: nowIso() });
    const p = await db.insert('programas', row);
    await db.insert('items', generarItems(p, row.modulos, true));
    await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Nota', resumen: 'Programa creado en Rumbo.', proxima_accion: null });
    if (d._texto && d._texto.trim()) await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Correo', resumen: 'Solicitud recibida:\n' + d._texto.trim().slice(0, 4000), proxima_accion: null });
    return p;
  }

  // ───────────── Formularios ─────────────
  const FORMS = {
    async importar(d, f) {
      f.querySelector('button.primary').textContent = 'Importando…';
      const r = await ejecutarImportacion({ formato: d.formato === 'on', marcar: d.marcar === 'on' });
      closeModal(); S.compSaltados = []; S.compTotal = porCompletar().length;
      await estadoFormato();
      modal(`${sheetHead('Cuadro Maestro importado')}
        <div class="card pad imp-res">
          <div class="imp-row"><b>${r.nNuevos}</b><span>programas nuevos en Rumbo</span></div>
          ${r.nAct ? `<div class="imp-row"><b>${r.nAct}</b><span>programas actualizados</span></div>` : ''}
          ${r.nHechos ? `<div class="imp-row"><b>${r.nHechos}</b><span>pasos marcados como hechos<small>Los anteriores a hoy en los programas en curso</small></span></div>` : ''}
        </div>
        <p class="small" style="margin:14px 0">${S.compTotal ? `Hay <b>${plural(S.compTotal, 'programa')}</b> con datos o preguntas pendientes. Te los muestro uno por uno, solo con lo que falta.` : 'Todos los programas quedaron con los datos completos.'}</p>
        <div class="sheet-actions"><button type="button" class="btn" data-act="close">Más tarde</button>${S.compTotal ? '<button class="btn primary" data-act="nav" data-to="completar">Completar ahora</button>' : ''}</div>`);
      render();
    },
    async completar(d, f) {
      const p = byId('programas', f.dataset.id), patch = {};
      ['fecha_inicio', 'fecha_fin', 'tipo_programa', 'facultad', 'programa_academico', 'modalidad', 'plataforma', 'director', 'orden_interna'].forEach(k => { if (d[k] && String(d[k]).trim()) patch[k] = String(d[k]).trim(); });
      ['horas', 'participantes'].forEach(k => { if (d[k] !== undefined && d[k] !== '') patch[k] = Number(d[k]); });
      if (d.valor) patch[esAbierta(p) ? 'valor_persona' : 'valor_total'] = num(d.valor);
      if (d.empresa && d.empresa.trim()) patch.entidad_id = (entidadPorNombre(d.empresa) || await db.insert('entidades', { nombre: d.empresa.trim() })).id;
      if (patch.tipo_programa && !p.tipo_cm) patch.tipo_cm = TIPO_X[patch.tipo_programa];
      if (p.cm_pendiente === 'aplazado') {
        patch.cm_pendiente = null;
        if (d.q_estado === 'Cancelado') Object.assign(patch, { estado_cm: 'Cancelado', estado: 'perdido' });
        else { Object.assign(patch, { estado_cm: 'Aplazado', estado: 'activo' }); if (d.q_inicio) { patch.fecha_inicio = d.q_inicio; if (d.q_fin) patch.fecha_fin = d.q_fin; } }
      }
      let nuevos = 0;
      if (p.cm_pendiente === 'cierre') {
        patch.cm_pendiente = null;
        if (d.q_cierre === 'no') {
          patch.estado = 'activo';
          const its = generarItems({ ...p, ...patch }, [], true).filter(i => ['Cierre financiero', 'Liquidación'].includes(i.fase));
          await db.insert('items', its); nuevos = its.length;
        }
      }
      patch.actualizado = nowIso();
      const fechas = (patch.fecha_inicio && patch.fecha_inicio !== p.fecha_inicio) || (patch.fecha_fin && patch.fecha_fin !== p.fecha_fin);
      await db.update('programas', p.id, patch);
      if (fechas) await recalcular(byId('programas', p.id));
      await aplicarCondiciones(byId('programas', p.id));
      if (d.q_estado === 'Cancelado') await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Decisión', resumen: 'Cancelado (según el Cuadro Maestro).', proxima_accion: null });
      const sigue = faltantesCM(byId('programas', p.id)).length;
      if (sigue && !(S.compSaltados || []).includes(p.id)) S.compSaltados = [...(S.compSaltados || []), p.id];
      render(); window.scrollTo(0, 0);
      toast(nuevos ? `Guardado. Agregué ${plural(nuevos, 'paso')} de cierre y liquidación` : sigue ? `Guardado. Quedan ${plural(sigue, 'dato')} para después` : 'Guardado');
    },
    async 'acc-libre'(d) { const t = (d.texto || '').trim(); closeModal(); setTimeout(() => t ? formCaptura({ texto: t }) : formCaptura(), 200); },
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
        const p = await crearPrograma({ ...d, entidad_id, modulos: mods, abierta });
        closeModal(); go('programa', p.id); toast('Programa creado');
        return;
      }
      const p = byId('programas', id);
      const row = clean({
        nombre: d.nombre, nombre_corto: d.nombre_corto, estado_cm: d.estado_cm, tipo_programa: d.tipo_programa, fecha_inicio: d.fecha_inicio, fecha_fin: d.fecha_fin,
        facultad: d.facultad, modalidad: d.modalidad, horas: d.horas, plataforma: d.plataforma, director: d.director, programa_academico: d.programa_academico,
        participantes: d.participantes, valor_total: d.valor_total, valor_persona: d.valor_persona, porcentaje_aval: d.porcentaje_aval,
        orden_interna: d.orden_interna, margen: d.margen, segmento: d.segmento, ingresos: d.ingresos, notas: d.notas,
        director_cedula: d.director_cedula, tipo_cm: d.tipo_cm, linea_cm: d.linea_cm, facturado: d.facturado, acuerdo_consejo: d.acuerdo_consejo,
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
      patch.prioridad = d.prioridad === 'on';
      if (byId('programas', i.programa_id)) patch.hito = d.es_hito === 'on' ? ((d.hito || '').trim() || i.hito || d.titulo.trim()) : (i.hito ? '' : (i.hito ?? null));
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
      const texto = d.texto.trim(), r = entender(texto), titulo = r.titulo || texto;
      if (d.tipo === 'nota' || d.tipo === 'avance') {
        if (!p) { toast('Elige el programa'); return; }
        const paso = d.tipo === 'avance' && d.hecho_id ? byId('items', d.hecho_id) : null;
        if (paso) await db.update('items', paso.id, { estado: 'hecho', fecha_hecho: today() });
        await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: d.tipo === 'avance' ? 'Decisión' : 'Nota', resumen: paso ? `${paso.hito ? 'Hito cumplido: ' + paso.hito + '. ' : 'Hecho: ' + paso.titulo + '. '}${texto}` : texto, proxima_accion: null });
        await touch(p.id); closeModal(); render();
        toast(paso ? (paso.hito ? `Hito cumplido: ${paso.hito}` : 'Paso marcado como hecho') : 'Nota en ' + nombreProg(p)); return;
      }
      const esp = d.tipo === 'esperando';
      let fase = null;
      if (p) { const fa = faseActual(p), fs = fasesDe(p); fase = fs.includes(fa) ? fa : (fs[fs.length - 1] || 'General'); }
      const plan = esp ? null : (d.plan_fecha || null), hora = esp ? null : (d.hora || null);
      const recordar = d.avisar ? (esp ? aRecordar(d.fecha_seguimiento, '08:00') : aRecordar(plan, hora || '08:00')) : null;
      await db.insert('items', { programa_id: p ? p.id : null, fase, orden: 900, titulo, estado: esp ? 'esperando' : 'pendiente', responsable: esp ? d.esperando_a : 'Yo',
        esperando_a: esp ? d.esperando_a : null, fecha_seguimiento: esp ? d.fecha_seguimiento : null, fecha_limite: null, plan_fecha: plan, hora,
        recordar_at: recordar && new Date(recordar) > new Date() ? recordar : null, recordado_at: null,
        fecha_hecho: null, enlace: null, nota: titulo !== texto ? texto : null, esencial: false, dias_ref: null, dias_rel: null });
      if (p) await touch(p.id);
      closeModal(); render(); toast(p ? 'Guardado en ' + nombreProg(p) : 'Tarea guardada');
    },
    async avance(d, f) {
      const p = byId('programas', f.dataset.id), hechos = new FormData(f).getAll('hechos');
      const nombres = [];
      for (const id of hechos) { const i = byId('items', id); if (i) { await db.update('items', id, { estado: 'hecho', fecha_hecho: today() }); nombres.push(i.hito ? 'Hito: ' + i.hito : i.titulo); } }
      const partes = [d.resumen && d.resumen.trim(), nombres.length && 'Cumplido: ' + nombres.join('; ') + '.'].filter(Boolean);
      if (d.salud) await db.update('programas', p.id, { salud: d.salud, salud_fecha: today() });
      if (partes.length || d.proxima) await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Nota', resumen: partes.join(' ') || 'Avance registrado.', proxima_accion: d.proxima ? d.proxima.trim() : null });
      if (d.proxima && d.proxima.trim()) {
        const fa = faseActual(byId('programas', p.id)), fs = fasesDe(p), rec = aRecordar(d.fecha || today(), '08:00');
        await db.insert('items', { programa_id: p.id, fase: fs.includes(fa) ? fa : fs[0], orden: 900, titulo: d.proxima.trim(), estado: 'pendiente', responsable: 'Yo', esperando_a: null,
          fecha_seguimiento: null, fecha_limite: null, plan_fecha: d.fecha || today(), hora: null, recordar_at: new Date(rec) > new Date() ? rec : null, recordado_at: null,
          fecha_hecho: null, enlace: null, nota: null, esencial: false, dias_ref: null, dias_rel: null });
      }
      await touch(p.id); closeModal(); render();
      toast(nombres.length ? `Avance registrado: ${plural(nombres.length, 'paso cumplido', 'pasos cumplidos')}` : 'Avance registrado');
    },
    async 'ia-aplicar'(d, f) {
      const prop = S.iaProp || {}; let n = 0, pNuevo = null;
      if (prop.programa_nuevo && d.pn === 'on') {
        const pn = prop.programa_nuevo, ruta = S.data.rutas.find(r => r.clave === pn.ruta) || S.data.rutas.find(r => r.clave === 'cerrado');
        let entidad_id = null;
        if (ruta.clave !== 'abierta' && pn.empresa) entidad_id = (entidadPorNombre(pn.empresa) || await db.insert('entidades', clean({ nombre: pn.empresa.trim() }))).id;
        pNuevo = await crearPrograma({ nombre: pn.nombre, ruta_id: ruta.id, entidad_id, abierta: ruta.clave === 'abierta', tipo_programa: pn.tipo_programa || '1', modalidad: pn.modalidad,
          fecha_inicio: pn.fecha_inicio, fecha_fin: pn.fecha_fin, x_horas: pn.horas, x_participantes: pn.participantes, x_valor: pn.valor_total || pn.valor_persona, x_facultad: pn.facultad, x_director: pn.director, _texto: d.texto });
        n++;
      }
      for (const [k, a] of (prop.acciones || []).entries()) {
        if (d['a' + k] !== 'on') continue;
        const p = byId('programas', a.programa_id || prop.programa_id) || pNuevo;
        if (a.tipo === 'hecho') { const i = byId('items', a.item_id); if (i) { await db.update('items', i.id, { estado: 'hecho', fecha_hecho: today() }); n++; } continue; }
        if (a.tipo === 'nota') { if (p) { await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Nota', resumen: a.titulo, proxima_accion: null }); n++; } continue; }
        const esp = a.tipo === 'esperando', fecha = /^\d{4}-\d{2}-\d{2}$/.test(a.fecha || '') ? a.fecha : null, hora = /^\d{2}:\d{2}$/.test(a.hora || '') ? a.hora : null;
        const seg = esp ? (fecha || addDays(today(), 3)) : null, rec = esp ? aRecordar(seg, '08:00') : fecha ? aRecordar(fecha, hora || '08:00') : null;
        let fase = null; if (p) { const fa = faseActual(p), fs = fasesDe(p); fase = fs.includes(fa) ? fa : (fs[0] || 'General'); }
        const quien = esp && ACTORES.includes(a.esperando_a) ? a.esperando_a : esp ? 'Cliente' : 'Yo';
        await db.insert('items', { programa_id: p ? p.id : null, fase, orden: 900, titulo: a.titulo, estado: esp ? 'esperando' : 'pendiente', responsable: quien,
          esperando_a: esp ? quien : null, fecha_seguimiento: seg, fecha_limite: null, plan_fecha: esp ? null : fecha, hora: esp ? null : hora,
          recordar_at: rec && new Date(rec) > new Date() ? rec : null, recordado_at: null, fecha_hecho: null, enlace: null, nota: null, esencial: false, dias_ref: null, dias_rel: null });
        n++;
      }
      [pNuevo, ...new Set((prop.acciones || []).map(a => a.programa_id || prop.programa_id))].forEach(x => { const id = x?.id || x; if (id && byId('programas', id)) touch(id); });
      closeModal(); if (pNuevo) go('programa', pNuevo.id); else render();
      toast(n ? `${plural(n, 'registro guardado', 'registros guardados')}` : 'No se guardó nada');
    },
    async 'ia-config'(d) {
      const { error } = await sb.rpc('guardar_llave_ia', { llave: d.llave || null, limite: Number(d.limite) || 300 });
      if (error) throw error;
      await iaEstado(); render(); toast(d.llave ? 'Asistente IA activado' : 'Tope actualizado');
    },
    async 'tarea-rapida'(d, f) {
      if (!d.titulo || !d.titulo.trim()) return;
      const r = entender(d.titulo), p = r.programa;
      const dia = r.fecha || f.dataset.d, hora = d.hora || r.hora || null, recordar = hora ? aRecordar(dia, hora) : null;
      let fase = null; if (p) { const fa = faseActual(p), fs = fasesDe(p); fase = fs.includes(fa) ? fa : (fs[0] || 'General'); }
      await db.insert('items', { programa_id: p ? p.id : null, fase, orden: p ? 900 : 0, titulo: r.titulo || d.titulo.trim(), estado: 'pendiente', responsable: 'Yo', esperando_a: null,
        fecha_seguimiento: null, fecha_limite: null, plan_fecha: dia, hora, recordar_at: recordar && new Date(recordar) > new Date() ? recordar : null, recordado_at: null,
        fecha_hecho: null, enlace: null, nota: null, esencial: false, dias_ref: null, dias_rel: null });
      if (p) await touch(p.id);
      render(); if (p || r.fecha) toast([p && 'Vinculada a ' + nombreProg(p), r.fecha && r.fecha !== f.dataset.d && 'para ' + relDate(r.fecha).toLowerCase()].filter(Boolean).join(', '));
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
    async objetivos(d, f) {
      const l = f.dataset.lunes, objetivos = [d.o0, d.o1, d.o2].map(x => (x || '').trim()).filter(Boolean).map(t => ({ t, hecho: false }));
      const prev = semanaDe(l);
      if (prev) { const viejos = prev.objetivos || []; objetivos.forEach(o => { const v = viejos.find(x => x.t === o.t); if (v) o.hecho = v.hecho; }); await db.update('semanas', prev.id, { objetivos }); }
      else await db.insert('semanas', { lunes: l, objetivos, nota: null, revisada_at: null });
      const actual = lunesDe(today()), s = semanaDe(actual);
      if (s) await db.update('semanas', s.id, { revisada_at: nowIso() }); else await db.insert('semanas', { lunes: actual, objetivos: [], nota: null, revisada_at: nowIso() });
      go('hoy'); toast('Revisión guardada');
    },
    async saludf(d, f) {
      const p = byId('programas', f.dataset.id);
      await db.update('programas', p.id, clean({ salud: d.salud, salud_nota: d.salud_nota, salud_fecha: today() }));
      await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Decisión', resumen: `Estado: ${SALUD[d.salud]?.[0] || 'sin estado'}.${d.salud_nota ? ' ' + d.salud_nota.trim() : ''}`, proxima_accion: null });
      closeModal(); render();
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
    'cap-prog'(el) { const f = el.form; f.hecho_id.innerHTML = opcionesPaso(byId('programas', el.value)); aplicarEntendido(f); },
    'hide-done'(el) { S.hideDone = el.checked; render(); },
    async 'prog-estado'(el) {
      const p = byId('programas', el.dataset.id), cm = el.value, antes = p.estado_cm || 'Proyección';
      await db.update('programas', p.id, { estado_cm: cm, estado: CM_A_ESTADO[cm] || 'activo', actualizado: nowIso() });
      await db.insert('bitacora', { programa_id: p.id, fecha: today(), tipo: 'Decisión', resumen: `Estado en el Cuadro Maestro: ${antes} → ${cm}.`, proxima_accion: null });
      render();
      if (cm === 'Cancelado' && !p.motivo_perdida) formPerdido(p);
    },
    async salud(el) {
      await db.update('programas', el.dataset.id, { salud: el.value || null, salud_fecha: today() }); render();
    },
    async 'salud-nota'(el) {
      await db.update('programas', el.dataset.id, { salud_nota: el.value.trim() || null, salud_fecha: today() });
    },
    async obj(el) {
      const s = semanaDe(lunesDe(today())); if (!s) return;
      const objetivos = (s.objetivos || []).map(o => ({ ...o }));
      const vis = objetivos.filter(o => o.t), o = vis[Number(el.dataset.k)]; if (o) o.hecho = el.checked;
      await db.update('semanas', s.id, { objetivos }); render();
    },
    async import(el) { if (el.files[0]) await importJSON(el.files[0]); },
    async 'import-cm'(el) { const f = el.files[0]; el.value = ''; if (f) await prepararImportacion(f); },
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
    const fc = e.target.form;
    if (fc && fc._tocado && e.target.name && e.target.name !== 'texto') fc._tocado.add(e.target.name);
    const el = e.target.closest('[data-change]');
    if (el && CHANGE[el.dataset.change]) safe(CHANGE[el.dataset.change])(el, e);
  });
  document.addEventListener('input', e => {
    if (e.target.dataset.input === 'captura') { aplicarEntendido(e.target.form); return; }
    if (e.target.dataset.input === 'buscar') { S.f.q = e.target.value; const l = $('#prog-list'); if (l) l.innerHTML = listaProgramas(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); return; }
    // Atajos en el PC (como Linear): N nuevo programa, C captura, / buscar, R revisión, 1 a 4 pestañas
    if (e.metaKey || e.ctrlKey || e.altKey || isOpen() || !S.ready || (S.mode === 'remote' && !S.user)) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable) return;
    const k = e.key.toLowerCase(), tabs = { 1: 'inicio', 2: 'hoy', 3: 'calendario', 4: 'programas' };
    if (k === 'n') { e.preventDefault(); formPrograma(); }
    else if (k === 'c') { e.preventDefault(); formCaptura(); }
    else if (k === 'a' || k === '+') { e.preventDefault(); menuAcciones(); }
    else if (k === 'r') { e.preventDefault(); go('revision'); }
    else if (k === '/') { e.preventDefault(); go('programas'); setTimeout(() => { const q = $('[data-input="buscar"]'); if (q) q.focus(); }, 50); }
    else if (tabs[k]) { e.preventDefault(); go(tabs[k]); }
  });

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
        if (S.user) { await loadRemote(); await seedIfEmpty(); await backfillHitos(); }
      } else {
        S.mode = 'local';
        S.data = Local.load();
        await seedIfEmpty(); await backfillHitos();
      }
      S.ready = true;
      iniciarProgramasDelDia().then(() => render()).catch(fail);
      normalizarCM().catch(fail);
      estadoFormato().then(() => { if (S.view.name === 'mas') render(); });
      avState().then(() => { if (AV.on) render(); });
      iaEstado().then(() => { if (IA.on && S.view.name === 'mas') render(); });
    } catch (err) {
      console.error(err);
      S.error = err.message || String(err);
    }
    render();
  }
  // Solo para pruebas locales
  if (location.hostname === 'localhost') window.__rumbo = { formIA, entender, extraerPrograma };
  start();
})();
