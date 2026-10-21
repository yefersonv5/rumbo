// Rumbo · función "asistente": convierte un texto libre (nota, correo pegado, dictado) en registros para la app.
// Usa Claude Haiku 5.5 (el modelo más económico). Solo responde al dueño, y tiene un tope de usos por mes.
// La llave de la API vive en app_secrets (la guarda el dueño desde la app; nadie puede leerla de vuelta).
// La función no escribe nada en los programas: devuelve una propuesta que el dueño revisa y confirma en la app.
import { createClient } from "npm:@supabase/supabase-js@2";

const DUENO = "jeferv566@gmail.com";
const MODELO = "claude-haiku-5-5";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const adminKey = (): string => {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try { const o = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); return o.default ?? Object.values(o)[0] as string; } catch { return ""; }
};

const HERRAMIENTA = {
  name: "registrar",
  description: "Entrega lo que hay que registrar en la app de seguimiento de programas a partir del texto.",
  input_schema: {
    type: "object",
    properties: {
      resumen: { type: "string", description: "Una frase corta con lo que entendiste." },
      programa_id: { type: ["string", "null"], description: "id del programa existente al que se refiere el texto, o null." },
      programa_nuevo: {
        type: ["object", "null"],
        description: "Solo si el texto describe un programa que NO está en la lista (una solicitud nueva).",
        properties: {
          nombre: { type: "string" }, empresa: { type: ["string", "null"] },
          ruta: { type: "string", enum: ["cerrado", "aval", "abierta"] },
          tipo_programa: { type: "string", enum: ["1", "2", "3", "4", "5"], description: "1 curso, 2 taller, 3 diplomado, 4 seminario/congreso, 5 otro" },
          modalidad: { type: "string", enum: ["Virtual sincrónica", "Virtual asincrónica", "Presencial", "Híbrida"] },
          fecha_inicio: { type: ["string", "null"] }, fecha_fin: { type: ["string", "null"] },
          horas: { type: ["number", "null"] }, participantes: { type: ["number", "null"] },
          valor_total: { type: ["number", "null"] }, valor_persona: { type: ["number", "null"] },
          facultad: { type: ["string", "null"] }, director: { type: ["string", "null"] },
        },
        required: ["nombre", "ruta"],
      },
      acciones: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tipo: { type: "string", enum: ["tarea", "esperando", "nota", "hecho"], description: "tarea: algo que debo hacer; esperando: algo que debe entregarme otro; nota: un hecho o decisión para la bitácora; hecho: un paso existente que ya se cumplió." },
            titulo: { type: "string", description: "Redactado corto, en infinitivo para tareas (Enviar…, Pedir…)." },
            programa_id: { type: ["string", "null"] },
            item_id: { type: ["string", "null"], description: "Para 'hecho': id del paso abierto que se cumplió." },
            fecha: { type: ["string", "null"], description: "YYYY-MM-DD. Para tarea: cuándo hacerla; para esperando: cuándo hacer seguimiento." },
            hora: { type: ["string", "null"], description: "HH:MM en 24 h, solo si el texto la dice." },
            esperando_a: { type: ["string", "null"], description: "Cargo del que se espera, de la lista de cargos." },
          },
          required: ["tipo", "titulo"],
        },
      },
    },
    required: ["resumen", "acciones"],
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, adminKey());
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const { data: u } = await admin.auth.getUser(token);
  if (u?.user?.email !== DUENO) return json({ error: "no autorizado" }, 401);

  const { data: sec } = await admin.from("app_secrets").select("name,value").in("name", ["anthropic_key", "ia_limite_mes"]);
  const S = Object.fromEntries((sec ?? []).map((r: { name: string; value: string }) => [r.name, r.value]));
  if (!S.anthropic_key) return json({ error: "sin_llave" }, 400);
  const limite = Number(S.ia_limite_mes || 300);
  const ahora = new Date(Date.now() - 5 * 3600_000);
  const desde = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1, 5)).toISOString();
  const { count } = await admin.from("ai_uso").select("id", { count: "exact", head: true }).gte("created_at", desde);
  if ((count ?? 0) >= limite) return json({ error: "limite", limite }, 429);

  let b: { texto?: string; contexto?: unknown } = {};
  try { b = await req.json(); } catch { /* vacío */ }
  const texto = String(b.texto ?? "").slice(0, 12000).trim();
  if (!texto) return json({ error: "sin_texto" }, 400);

  const sistema = `Eres el asistente de registro de Rumbo, la app personal de un gestor comercial de Educación Continuada (línea Salud y Farma) de la Universidad El Bosque, Colombia.
Convierte el texto (notas sueltas, dictado o un correo pegado) en registros concretos. Reglas:
- Usa SOLO ids de programas y pasos que aparezcan en el contexto. Si no reconoces el programa, deja programa_id en null.
- Responsables siempre por cargo (de la lista "cargos"), nunca nombres propios.
- Fechas relativas ("mañana", "el viernes", "en dos semanas") se calculan desde "hoy" del contexto. No inventes fechas que el texto no sugiere.
- Si el texto confirma que algo ya se cumplió y corresponde a un paso abierto, usa tipo "hecho" con su item_id.
- Si alguien quedó de enviar algo, es "esperando" con el cargo y una fecha de seguimiento razonable (2 a 3 días hábiles si no se dice).
- Lo informativo (acuerdos, cifras, decisiones) va como "nota".
- Si es una solicitud de un programa nuevo, llena programa_nuevo con lo que diga el texto y deja lo demás en null.
- Sé breve: pocas acciones, bien redactadas, en español de Colombia.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": S.anthropic_key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODELO, max_tokens: 1500, system: sistema,
      tools: [HERRAMIENTA], tool_choice: { type: "tool", name: "registrar" },
      messages: [{ role: "user", content: `Contexto:\n${JSON.stringify(b.contexto ?? {})}\n\nTexto:\n${texto}` }],
    }),
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.log("anthropic", r.status, JSON.stringify(out).slice(0, 300));
    return json({ error: r.status === 401 ? "llave_invalida" : r.status === 400 && /credit/i.test(JSON.stringify(out)) ? "sin_saldo" : "api", status: r.status }, 502);
  }
  await admin.from("ai_uso").insert({ modo: "registro", tokens_in: out.usage?.input_tokens ?? 0, tokens_out: out.usage?.output_tokens ?? 0 });
  const tool = (out.content ?? []).find((c: { type: string }) => c.type === "tool_use");
  return json({ ok: true, propuesta: tool?.input ?? null, usos: (count ?? 0) + 1, limite });
});
