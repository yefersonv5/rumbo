-- Rumbo · seguimiento de programas EC
-- Pegar completo en Supabase > SQL Editor > Run (una sola vez).
-- Las plantillas (rutas, módulos e ítems) las carga la app en el primer inicio de sesión.

create table if not exists rutas (
  id uuid primary key default gen_random_uuid(),
  clave text unique not null,
  nombre text not null,
  descripcion text,
  fases jsonb not null default '[]',
  orden int default 0,
  activa boolean default true,
  created_at timestamptz default now()
);

create table if not exists modulos (
  id uuid primary key default gen_random_uuid(),
  clave text unique not null,
  nombre text not null,
  descripcion text,
  orden int default 0,
  activa boolean default true,
  created_at timestamptz default now()
);

create table if not exists plantilla_items (
  id uuid primary key default gen_random_uuid(),
  ruta_id uuid references rutas(id) on delete cascade,
  modulo_id uuid references modulos(id) on delete cascade,
  fase text not null,
  orden int default 0,
  titulo text not null,
  responsable text default 'Yo',
  dias_ref text check (dias_ref in ('inicio','fin')),
  dias_rel int,
  esencial boolean default true,
  created_at timestamptz default now()
);

create table if not exists entidades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text,
  convenio_hasta date,
  notas text,
  created_at timestamptz default now()
);

create table if not exists contactos (
  id uuid primary key default gen_random_uuid(),
  entidad_id uuid references entidades(id) on delete cascade,
  nombre text not null,
  cargo text,
  correo text,
  telefono text,
  rol text,
  created_at timestamptz default now()
);

create table if not exists programas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  nombre_corto text,
  entidad_id uuid references entidades(id) on delete set null,
  ruta_id uuid references rutas(id),
  modulos jsonb default '[]',
  tipo text,
  facultad text,
  director text,
  modalidad text,
  horas numeric,
  participantes int,
  valor_total numeric,
  valor_persona numeric,
  margen numeric,
  fecha_inicio date,
  fecha_fin date,
  estado text default 'activo' check (estado in ('activo','pausa','perdido','cerrado')),
  prioridad text default 'media',
  motivo_perdida text,
  notas text,
  actualizado timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null references programas(id) on delete cascade,
  fase text not null,
  orden int default 0,
  titulo text not null,
  estado text default 'pendiente' check (estado in ('pendiente','en_curso','esperando','hecho','no_aplica')),
  responsable text,
  esperando_a text,
  fecha_limite date,
  fecha_seguimiento date,
  fecha_hecho date,
  enlace text,
  nota text,
  esencial boolean default true,
  dias_ref text,
  dias_rel int,
  created_at timestamptz default now()
);

create table if not exists bitacora (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null references programas(id) on delete cascade,
  fecha date default current_date,
  tipo text,
  resumen text not null,
  proxima_accion text,
  created_at timestamptz default now()
);

create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null references programas(id) on delete cascade,
  tipo text,
  nombre text,
  version text,
  enlace text,
  fecha date default current_date,
  created_at timestamptz default now()
);

create table if not exists facturacion (
  id uuid primary key default gen_random_uuid(),
  programa_id uuid not null references programas(id) on delete cascade,
  concepto text not null,
  valor numeric,
  fecha_factura date,
  estado_pago text default 'pendiente' check (estado_pago in ('pendiente','facturado','pagado')),
  fecha_pago date,
  created_at timestamptz default now()
);

create index if not exists items_programa_idx on items(programa_id);
create index if not exists bitacora_programa_idx on bitacora(programa_id);
create index if not exists documentos_programa_idx on documentos(programa_id);
create index if not exists facturacion_programa_idx on facturacion(programa_id);
create index if not exists contactos_entidad_idx on contactos(entidad_id);

-- Seguridad: solo usuarios con sesión iniciada leen y escriben.
-- Además, en Authentication > Sign In / Providers desactiva "Allow new users to sign up"
-- para que nadie más pueda crear una cuenta.
do $$
declare t text;
begin
  foreach t in array array['rutas','modulos','plantilla_items','entidades','contactos','programas','items','bitacora','documentos','facturacion']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists solo_autenticado on %I', t);
    execute format('create policy solo_autenticado on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Función mínima para la tarea anti-pausa (no expone datos).
create or replace function ping() returns text language sql security definer set search_path = public as $$ select 'ok'::text $$;
grant execute on function ping() to anon;

-- Solo el dueño: registro limitado a su correo y datos visibles solo para él.
create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;
create or replace function privado.solo_dueno_registro() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if lower(new.email) is distinct from 'jeferv566@gmail.com' then raise exception 'Registro cerrado'; end if;
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end $$;
create trigger solo_dueno_registro before insert on auth.users for each row execute function privado.solo_dueno_registro();
-- Más una política "as restrictive" por tabla:
-- using ((select auth.jwt()->>'email') = 'jeferv566@gmail.com')

-- Campos del Cuadro Maestro (hoja BD)
alter table programas add column if not exists estado_cm text default 'Proyección';
alter table programas add column if not exists tipo_programa text;
alter table programas add column if not exists orden_interna text;
alter table programas add column if not exists plataforma text;
alter table programas add column if not exists segmento text;
alter table programas add column if not exists programa_academico text;
alter table programas add column if not exists ingresos numeric;
alter table programas add column if not exists porcentaje_aval numeric;

-- Flujo real (versión 2 de plantillas)
alter table rutas add column if not exists version int default 1;
alter table plantilla_items add column if not exists condicion text;   -- nuevo | cohorte | virtual | presencial
alter table plantilla_items add column if not exists repetir jsonb;    -- { cada, hastaRef, hasta }
alter table plantilla_items add column if not exists avisar boolean default false;
alter table plantilla_items add column if not exists clave text;       -- p. ej. decision_apertura
alter table plantilla_items drop constraint if exists plantilla_items_dias_ref_check; -- admite mitad y v20
alter table items add column if not exists condicion text;
alter table items add column if not exists clave text;
alter table programas add column if not exists es_nuevo boolean default true;

-- Sesiones de cierre financiero con Presupuestos (las registra el dueño en Más)
create table if not exists sesiones_cierre (id uuid primary key default gen_random_uuid(), fecha date not null, nota text, created_at timestamptz default now());

-- Metodologías de gestión de proyectos: estado declarado del programa, prioridad y semanas (objetivos y revisión)
alter table programas add column if not exists salud text;        -- en_curso | en_riesgo | bloqueado
alter table programas add column if not exists salud_nota text;
alter table programas add column if not exists salud_fecha date;
alter table items add column if not exists prioridad boolean default false;
create table if not exists semanas (id uuid primary key default gen_random_uuid(), lunes date not null unique, objetivos jsonb default '[]', nota text, revisada_at timestamptz, created_at timestamptz default now());

-- Hitos: nombre del hito en la plantilla y en cada paso ('' = desmarcado a mano)
alter table plantilla_items add column if not exists hito text;
alter table items add column if not exists hito text;

-- Asistente IA (función "asistente", Claude Haiku 5.5): uso por mes para el tope de costo.
-- La llave se guarda con guardar_llave_ia(llave, limite) en app_secrets y la app no puede leerla.
-- estado_ia() devuelve si está configurada, el tope y el uso del mes; quitar_llave_ia() la desactiva.
create table if not exists ai_uso (id uuid primary key default gen_random_uuid(), created_at timestamptz default now(), modo text, tokens_in int default 0, tokens_out int default 0);

-- Cuadro Maestro: fila original importada (para exportar idéntico) y campos de la hoja BD
alter table programas add column if not exists cm_raw jsonb;
alter table programas add column if not exists director_cedula text;
alter table programas add column if not exists acuerdo_consejo text;
alter table programas add column if not exists facturado numeric;
alter table programas add column if not exists linea_cm text;
alter table programas add column if not exists tipo_cm text;
alter table programas add column if not exists cm_pendiente text;   -- aplazado | cierre: preguntas del acompañamiento
-- Tu archivo como formato de exportación: bucket privado "cuadro-maestro" (solo el dueño), archivo formato.xlsx
