-- Mi día y recordatorios (ya aplicado en el proyecto "rumbo").
-- Tareas sueltas: un ítem puede no pertenecer a un programa.
alter table items alter column programa_id drop not null;
alter table items alter column fase drop not null;
alter table items add column if not exists plan_fecha date;       -- día en que lo planeas hacer
alter table items add column if not exists hora time;             -- hora en tu agenda
alter table items add column if not exists recordar_at timestamptz; -- cuándo avisarte
alter table items add column if not exists recordado_at timestamptz;
-- Suscripciones push del dueño, registro de avisos diarios y llaves VAPID (los valores NO van en el repo).
create table if not exists push_subs (endpoint text primary key, keys jsonb not null, created_at timestamptz default now());
create table if not exists avisos_log (clave text primary key, enviado_at timestamptz default now());
create table if not exists app_secrets (name text primary key, value text not null);
-- La función "avisos" corre cada 5 minutos:
-- select cron.schedule('rumbo-avisos', '*/5 * * * *', $$select net.http_post(url := 'https://jrgmesjmhtfvmwocaojl.supabase.co/functions/v1/avisos', headers := '{"Content-Type":"application/json"}'::jsonb, body := '{}'::jsonb, timeout_milliseconds := 20000)$$);
