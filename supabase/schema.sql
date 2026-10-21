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
