# Rumbo

Seguimiento personal de programas de Educación Continuada (Universidad El Bosque, Salud y Farma).
Cada programa nace de una **ruta base** (Cerrado B2B, Aval académico, Oferta abierta) más los **módulos** que necesite,
y la app arma su checklist con fechas calculadas desde el inicio o el fin del programa.

## Qué hace

- **Hoy**: vencidos, seguimientos de "esperando a" que tocan hoy, próximos 7 días, inicios en 30 días y programas sin movimiento en 14 días.
- **Programas**: tarjetas con semáforo, fase actual y avance; filtros por estado, ruta y búsqueda.
- **Ficha**: checklist por fases, bitácora, enlaces a documentos (OneDrive/SharePoint), contactos de la entidad y facturación.
- **Captura rápida (+)**: nota, tarea o "esperando a" en segundos desde el celular.
- **Exportar CSV** para pasar datos al Cuadro Maestro y **respaldo JSON** completo.

Semáforo: rojo = paso esencial vencido, o inicio en 15 días con fases previas a Ejecución abiertas; amarillo = algo vence en 3 días o hay un seguimiento pendiente; verde = al día.

## Archivos

| Archivo | Para qué |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | La app |
| `plantillas.js` | Rutas y módulos iniciales (se cargan a la base solo la primera vez) |
| `config.js` | URL y llave pública de Supabase |
| `supabase/schema.sql` | Tablas y seguridad; se ejecuta una vez |
| `.github/workflows/mantener-activo.yml` | Evita la pausa por inactividad del plan gratuito (lunes y jueves) |
| `manifest.json`, `sw.js`, `icon.png` | Instalación como app (PWA) |

## Puesta en marcha

Ya hecho: proyecto Supabase `rumbo` (São Paulo) con tablas y RLS, `config.js` conectado, repositorio y GitHub Pages.

Pendiente (solo Yeferson):
1. En Supabase > *Authentication > Users* > **Add user > Create new user**: tu correo y una contraseña, con *Auto Confirm User* marcado.
2. En *Authentication > Sign In / Providers* desactivar **Allow new users to sign up**.
3. Abrir https://yefersonv5.github.io/rumbo/ en el iPhone con Safari > Compartir > **Agregar a inicio**.

Sin `config.js` completo la app funciona en **modo local** (datos solo en ese navegador): sirve para probar.
Para pasar lo probado a Supabase: *Más > Descargar respaldo* en modo local y *Más > Importar respaldo* ya conectado.

## Datos

Guardar solo lo necesario para el seguimiento (entidad, contacto comercial, valores, enlaces).
No cargar bases de inscritos ni datos personales de participantes.

## Siguiente versión

Editor de plantillas, tablero por fases, calendario, resumen semanal por correo y asistente IA para actualizar desde correos o transcripciones.
