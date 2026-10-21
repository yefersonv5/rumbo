// Rumbo · función "avisos": envía las notificaciones push.
// La llama una tarea programada (pg_cron) cada 5 minutos. Hace tres cosas:
//   1. Recordatorios: los pasos o tareas con "Recordarme" cuya hora ya llegó.
//   2. Resumen de la mañana (7:00 a. m. Bogotá): lo que tienes para hoy, seguimientos y vencidos.
//   3. Repaso de la tarde (5:00 p. m. Bogotá): lo que te queda pendiente de hoy.
//   4. Revisión semanal (viernes 4:00 p. m.): si aún no la has hecho esa semana.
// Desde la app se puede pedir un aviso de prueba (con la sesión del dueño).
// Las llaves VAPID viven en la tabla app_secrets, que solo lee esta función.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const DUENO = "jeferv566@gmail.com";
const adminKey = (): string => {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try { const o = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); return o.default ?? Object.values(o)[0] as string; } catch { return ""; }
};
// Hora de Colombia (UTC-5, sin horario de verano)
const bogota = (d = new Date()) => new Date(d.getTime() - 5 * 3600_000);
const hoyBog = () => bogota().toISOString().slice(0, 10);
const plural = (n: number, s: string, p?: string) => `${n} ${n === 1 ? s : (p ?? s + "s")}`;

type Item = { id: string; programa_id: string | null; titulo: string; estado: string; fecha_limite: string | null; fecha_seguimiento: string | null;
  plan_fecha: string | null; hora: string | null; recordar_at: string | null; recordado_at: string | null; esperando_a: string | null };

Deno.serve(async (req) => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, adminKey());
  const { data: sec } = await admin.from("app_secrets").select("name,value");
  const S = Object.fromEntries((sec ?? []).map((r: { name: string; value: string }) => [r.name, r.value]));
  if (!S.vapid_public || !S.vapid_private) return new Response("sin llaves", { status: 500 });
  webpush.setVapidDetails("mailto:" + DUENO, S.vapid_public, S.vapid_private);

  const { data: subs } = await admin.from("push_subs").select("endpoint,keys");
  const enviar = async (title: string, body: string, tag: string, url = "./#/hoy") => {
    let n = 0;
    for (const s of subs ?? []) {
      try { await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify({ title, body, tag, url }), { TTL: 3600 }); n++; }
      catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await admin.from("push_subs").delete().eq("endpoint", s.endpoint);
        else console.log("error push", code, String((e as Error).message ?? e).slice(0, 200));
      }
    }
    return n;
  };

  // Aviso de prueba pedido desde la app: solo con la sesión del dueño.
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* sin cuerpo */ }
  if (body.prueba) {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(token);
    if (u?.user?.email !== DUENO) return new Response("no autorizado", { status: 401 });
    const n = await enviar("Rumbo", "Así te van a llegar los recordatorios.", "prueba");
    return Response.json({ prueba: true, enviados: n });
  }
  if (!(subs ?? []).length) return Response.json({ sin_suscripciones: true });

  const now = new Date(), hoy = hoyBog(), horaBog = bogota().getUTCHours() * 60 + bogota().getUTCMinutes();
  const res: Record<string, number> = { recordatorios: 0, manana: 0, tarde: 0, semanal: 0 };

  const { data: progs } = await admin.from("programas").select("id,nombre,nombre_corto,estado");
  const P = new Map((progs ?? []).map((p: { id: string; nombre: string; nombre_corto: string | null; estado: string }) => [p.id, p]));
  const nombre = (id: string | null) => { const p = id ? P.get(id) : null; return p ? (p.nombre_corto || p.nombre) : ""; };

  // 1. Recordatorios vencidos (hasta 12 horas de atraso; más viejos ya no sirven)
  const { data: due } = await admin.from("items").select("*").is("recordado_at", null).not("recordar_at", "is", null).lte("recordar_at", now.toISOString()).limit(100);
  for (const i of (due ?? []) as Item[]) {
    const viejo = new Date(i.recordar_at!).getTime() < now.getTime() - 12 * 3600_000;
    const abierto = i.estado !== "hecho" && i.estado !== "no_aplica";
    if (!viejo && abierto) {
      const prog = nombre(i.programa_id);
      res.recordatorios += await enviar(i.estado === "esperando" ? "Seguimiento" : "Recordatorio", prog ? `${i.titulo} · ${prog}` : i.titulo, "rec-" + i.id,
        i.programa_id ? `./#/programa/${i.programa_id}` : "./#/hoy");
    }
    await admin.from("items").update({ recordado_at: now.toISOString() }).eq("id", i.id);
  }

  // Pendientes del día (programas activos y tareas sueltas)
  const pendientesHoy = async () => {
    const { data } = await admin.from("items").select("*").not("estado", "in", "(hecho,no_aplica)");
    const its = ((data ?? []) as Item[]).filter(i => !i.programa_id || P.get(i.programa_id)?.estado === "activo");
    const seguir = its.filter(i => i.estado === "esperando" && (!i.fecha_seguimiento || i.fecha_seguimiento <= hoy));
    const vencidos = its.filter(i => i.estado !== "esperando" && ((i.fecha_limite && i.fecha_limite < hoy && !(i.plan_fecha && i.plan_fecha >= hoy)) || (i.plan_fecha && i.plan_fecha < hoy)));
    const paraHoy = its.filter(i => i.estado !== "esperando" && (i.plan_fecha === hoy || i.fecha_limite === hoy))
      .sort((a, b) => (a.hora ?? "99").localeCompare(b.hora ?? "99"));
    return { seguir, vencidos, paraHoy };
  };
  const yaEnviado = async (clave: string) => {
    const { data } = await admin.from("avisos_log").select("clave").eq("clave", clave).maybeSingle();
    return !!data;
  };

  // 2. Resumen de la mañana: 7:00 a. m.
  if (horaBog >= 7 * 60 && horaBog < 11 * 60 && !(await yaEnviado("manana-" + hoy))) {
    await admin.from("avisos_log").insert({ clave: "manana-" + hoy });
    const { seguir, vencidos, paraHoy } = await pendientesHoy();
    const partes = [];
    if (paraHoy.length) partes.push(plural(paraHoy.length, "pendiente") + " para hoy");
    if (seguir.length) partes.push(plural(seguir.length, "seguimiento"));
    if (vencidos.length) partes.push(plural(vencidos.length, "vencido"));
    if (partes.length) {
      const primero = paraHoy[0] ?? vencidos[0] ?? seguir[0];
      const hora = primero?.hora ? primero.hora.slice(0, 5) + " " : "";
      res.manana = await enviar("Tu día en Rumbo", partes.join(", ") + "." + (primero ? ` Empieza por: ${hora}${primero.titulo}.` : ""), "manana");
    }
  }

  // 3. Repaso de la tarde: 5:00 p. m.
  if (horaBog >= 17 * 60 && horaBog < 20 * 60 && !(await yaEnviado("tarde-" + hoy))) {
    await admin.from("avisos_log").insert({ clave: "tarde-" + hoy });
    const { paraHoy, seguir } = await pendientesHoy();
    const quedan = paraHoy.length + seguir.length;
    if (quedan) res.tarde = await enviar("Antes de cerrar el día", `Te ${quedan === 1 ? "queda" : "quedan"} ${plural(quedan, "pendiente")} de hoy. Márcalos o pásalos a mañana.`, "tarde");
  }

  // 4. Revisión semanal: viernes a las 4:00 p. m., si la semana aún no está revisada
  const dow = bogota().getUTCDay();
  if (dow === 5 && horaBog >= 16 * 60 && horaBog < 20 * 60 && !(await yaEnviado("semanal-" + hoy))) {
    await admin.from("avisos_log").insert({ clave: "semanal-" + hoy });
    const lunes = new Date(bogota().getTime() - ((dow + 6) % 7) * 86400_000).toISOString().slice(0, 10);
    const { data: sem } = await admin.from("semanas").select("revisada_at").eq("lunes", lunes).maybeSingle();
    if (!sem?.revisada_at) res.semanal = await enviar("Revisión semanal", "15 minutos: cierra lo pendiente, actualiza el estado de tus programas y fija tres objetivos para la próxima semana.", "semanal", "./#/revision");
  }

  return Response.json(res);
});
