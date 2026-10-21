// Plantillas de Rumbo. Versión 4 (hitos). Base: flujo real contado por Yeferson (transcripción del 21 oct 2026).
// La app las carga en la base la primera vez y las actualiza cuando sube la versión.
//
// Cada paso: { f: fase, t: título, r: responsable (cargo, nunca nombre propio),
//   ref: 'inicio' | 'fin' | 'mitad' | 'sesion' (primera sesión de cierre financiero registrada, al menos 10 días después del fin)
//        | 'v20' (ventana del 20 al 30 del mes, después de la sesión de cierre) | null, d: días desde la referencia,
//   e: esencial (define fase actual y semáforo), av: avisar ese día a las 8:00 a. m.,
//   c: condición ('nuevo' | 'cohorte' | 'virtual' | 'presencial'), rep: { cada, hastaRef, hasta } repetir cada N días, k: clave especial,
//   h: nombre del hito (los hitos marcan el avance real del proyecto) }

(function () {
  const P = (f, t, r, ref, d, o = {}) => ({ f, t, r, ref: ref ?? null, d: d ?? null, e: o.e ?? true, av: !!o.av, c: o.c ?? null, rep: o.rep ?? null, k: o.k ?? null, h: o.h ?? null });

  // ── Bloques que comparten las rutas con docentes propios ──
  const HONORARIOS = [
    P('Alistamiento', 'Recibir el cuadro de honorarios del director (docentes, horas y valores)', 'Director del programa', 'inicio', -21),
    P('Alistamiento', 'Enviar el cuadro de honorarios a Presupuestos', 'Yo', 'inicio', -14),
    P('Alistamiento', 'Pedir a la asistente el montaje de las solicitudes de honorarios en Oracle', 'Asistente administrativa', 'inicio', -14, { av: true }),
    P('Ejecución', 'Seguimiento a la orden de compra de honorarios (tarda de 2 semanas a 1 mes)', 'Asistente administrativa', 'inicio', 7, { av: true }),
    P('Ejecución', 'Revisar que los docentes vayan cobrando', 'Yo', 'inicio', 14, { av: true, e: false, rep: { cada: 14, hastaRef: 'fin', hasta: -1 } }),
  ];
  const CERTIFICACION = [
    P('Certificación', 'Pedir al director el listado de quienes se certifican', 'Director del programa', 'fin', -30, { e: false }),
    P('Certificación', 'Solicitar certificados y encuestas a la auxiliar administrativa (base de datos, firmante, nombre, fechas, intensidad horaria y facultades)', 'Auxiliar administrativa', 'fin', -30, { av: true }),
    P('Certificación', 'Enviar a la auxiliar el listado final actualizado', 'Yo', 'fin', 0),
    P('Certificación', 'Certificados y encuestas de satisfacción enviados a los participantes', 'Auxiliar administrativa', 'fin', 5, { h: 'Certificados enviados' }),
  ];
  const CIERRE = [
    P('Cierre financiero', 'Confirmar que todos los docentes cobraron', 'Yo', 'fin', 0, { av: true }),
    P('Cierre financiero', 'Informe detallado de ingresos (Sala o, si no cuadra, Finanzas)', 'Finanzas', 'fin', 3),
    P('Cierre financiero', 'Conciliar gastos con la asistente y registrar las órdenes de compra en el presupuesto', 'Asistente administrativa', 'fin', 5),
    P('Cierre financiero', 'Avisar a la secretaría de la división que este programa queda listo para cerrar', 'Secretaría de la división', 'sesion', -10, { e: false }),
    P('Cierre financiero', 'Enviar a Presupuestos el cuadro de cierre (programa, orden interna, fechas, abierto o cerrado, ingresos), 8 días antes de la sesión', 'Yo', 'sesion', -8, { av: true }),
    P('Cierre financiero', 'Cierre financiero en la sesión con Presupuestos', 'Presupuestos', 'sesion', 0, { av: true, h: 'Cierre financiero' }),
    P('Cierre financiero', 'Enviar el documento de cierre al gestor de facultad, al director y al decano, con copia a jefes y equipo EC', 'Yo', 'sesion', 1),
    P('Cierre financiero', 'Registro en el Cuadro Maestro', 'Yo', 'sesion', 1),
  ];
  const LIQUIDACION = [
    P('Liquidación', 'Solicitar a la asistente el montaje de dirección y coordinación, con el resumen del cierre (ventana del 20 al 30)', 'Yo', 'v20', 0, { av: true }),
    P('Liquidación', 'Seguimiento a la orden de compra de dirección y coordinación', 'Asistente administrativa', 'v20', 21, { av: true, h: 'Liquidación' }),
  ];

  window.PLANTILLAS = {
    version: 4,
    rutas: [
      {
        clave: 'abierta', nombre: 'Oferta abierta', orden: 3,
        descripcion: 'Programa B2C publicado en el micrositio para inscripción individual.',
        fases: ['Diseño', 'Formalización', 'Montaje', 'Promoción', 'Apertura', 'Alistamiento', 'Ejecución', 'Certificación', 'Cierre financiero', 'Liquidación'],
        items: [
          P('Diseño', 'Recibir la propuesta académica en el formato institucional de EC', 'Director del programa'),
          P('Diseño', 'Construir el presupuesto con el director (costos y valor del programa)', 'Yo'),
          P('Formalización', 'Presentación ante el Consejo de Facultad (la hace el director con el gestor de facultad)', 'Gestor de facultad', 'inicio', -60),
          P('Formalización', 'Recibir el extracto del acta del Consejo de Facultad', 'Gestor de facultad', 'inicio', -50, { h: 'Acta del Consejo de Facultad' }),
          P('Formalización', 'Presentar ante el Consejo de Investigación y Extensión', 'Yo', 'inicio', -45, { c: 'nuevo' }),
          P('Formalización', 'Solicitar la orden interna a Presupuestos', 'Presupuestos', 'inicio', -45, { av: true, h: 'Orden interna' }),
          P('Montaje', 'Montar el programa en Sala desde cero', 'Yo', 'inicio', -42, { c: 'nuevo' }),
          P('Montaje', 'Crear el nuevo grupo en Sala', 'Yo', 'inicio', -42, { c: 'cohorte' }),
          P('Montaje', 'Vincular la orden interna al programa en Sala', 'Yo', 'inicio', -40),
          P('Montaje', 'Homologación de ítem para habilitar el cobro de matrículas', 'Yo', 'inicio', -40),
          P('Montaje', 'Pedir las piezas gráficas al gestor de comunicaciones', 'Gestor de comunicaciones', 'inicio', -45),
          P('Montaje', 'Enviar la ficha para el micrositio (asistente a cargo, fechas, horarios y propuesta académica)', 'Gestor de comunicaciones', 'inicio', -40),
          P('Montaje', 'Programa publicado en el micrositio con inscripciones abiertas', 'Gestor de comunicaciones', 'inicio', -35, { av: true, h: 'Publicado en el micrositio' }),
          P('Promoción', 'Pauta en redes sociales habilitada', 'Gestor de comunicaciones', 'inicio', -35, { e: false }),
          P('Promoción', 'Revisar leads e inscritos con la asistente administrativa', 'Asistente administrativa', 'inicio', -28, { e: false, av: true, rep: { cada: 7, hastaRef: 'inicio', hasta: -15 } }),
          P('Apertura', 'Decisión de apertura: revisar inscritos y definir si abre, se aplaza o se cancela', 'Yo', 'inicio', -14, { av: true, k: 'decision_apertura', h: 'Decisión de apertura' }),
          P('Alistamiento', 'Solicitar el aula virtual a la DIDE', 'DIDE', 'inicio', -14, { c: 'virtual' }),
          P('Alistamiento', 'Solicitar los espacios (salones)', 'Yo', 'inicio', -21, { c: 'presencial' }),
          P('Alistamiento', 'Solicitar refrigerios, estación de café, alimentación o materiales', 'Asistente administrativa', 'inicio', -14, { c: 'presencial', e: false }),
          ...HONORARIOS.slice(0, 3),
          P('Alistamiento', 'Enviar el listado final de participantes al director', 'Yo', 'inicio', -7, { av: true }),
          P('Alistamiento', 'Solicitar a la DIDE la matrícula de los participantes', 'DIDE', 'inicio', -5, { c: 'virtual' }),
          P('Alistamiento', 'Bienvenida a los participantes, con credenciales de acceso al aula', 'Asistente administrativa', 'inicio', -3),
          P('Alistamiento', 'Notificar el inicio al director y al gestor de facultad, con copia al decano', 'Yo', 'inicio', -3),
          P('Ejecución', 'Inicio del programa', 'Yo', 'inicio', 0, { h: 'Inicio' }),
          P('Ejecución', 'Visitar una clase para revisar que todo fluya', 'Yo', 'inicio', 7, { e: false, av: true }),
          P('Ejecución', 'Visitar otra clase a mitad del programa', 'Yo', 'mitad', 0, { e: false, av: true }),
          ...HONORARIOS.slice(3),
          ...CERTIFICACION, ...CIERRE, ...LIQUIDACION,
        ],
      },
      {
        clave: 'cerrado', nombre: 'Cerrado B2B', orden: 1,
        descripcion: 'Programa a la medida para una entidad (farma, dispositivos, IPS, sociedad).',
        fases: ['Oportunidad', 'Diseño', 'Negociación', 'Formalización', 'Alistamiento', 'Ejecución', 'Certificación', 'Cierre financiero', 'Liquidación'],
        items: [
          P('Oportunidad', 'Registrar la solicitud y el contacto del cliente', 'Yo'),
          P('Oportunidad', 'Reunión de diagnóstico de la necesidad', 'Yo'),
          P('Oportunidad', 'Definir facultad y director del programa', 'Yo'),
          P('Diseño', 'Recibir la estructura académica y el syllabus del director', 'Director del programa'),
          P('Diseño', 'Construir el presupuesto con el director (costos y valor)', 'Yo'),
          P('Diseño', 'Propuesta comercial PPTX auditada', 'Yo'),
          P('Negociación', 'Enviar la propuesta al cliente', 'Yo', null, null, { h: 'Propuesta enviada' }),
          P('Negociación', 'Seguimiento a la respuesta del cliente', 'Cliente', null, null, { av: true }),
          P('Negociación', 'Ajustes de valor, participantes o sedes', 'Yo', null, null, { e: false }),
          P('Negociación', 'Aceptación: carta de compromiso u orden de compra', 'Cliente', null, null, { h: 'Aceptación del cliente' }),
          P('Formalización', 'Presentación ante el Consejo de Facultad (la hace el director con el gestor de facultad)', 'Gestor de facultad', 'inicio', -30),
          P('Formalización', 'Recibir el extracto del acta del Consejo de Facultad', 'Gestor de facultad', 'inicio', -25, { h: 'Acta del Consejo de Facultad' }),
          P('Formalización', 'Presentar ante el Consejo de Investigación y Extensión', 'Yo', 'inicio', -30, { c: 'nuevo' }),
          P('Formalización', 'Solicitar la orden interna a Presupuestos', 'Presupuestos', 'inicio', -25, { av: true, h: 'Orden interna' }),
          P('Alistamiento', 'Datos de facturación del cliente (RUT, certificación bancaria, encargado)', 'Cliente', 'inicio', -14),
          P('Alistamiento', 'Solicitar el aula virtual a la DIDE', 'DIDE', 'inicio', -14, { c: 'virtual' }),
          P('Alistamiento', 'Solicitar los espacios (salones)', 'Yo', 'inicio', -21, { c: 'presencial' }),
          P('Alistamiento', 'Solicitar refrigerios, estación de café, alimentación o materiales', 'Asistente administrativa', 'inicio', -14, { c: 'presencial', e: false }),
          ...HONORARIOS.slice(0, 3),
          P('Alistamiento', 'Recibir el listado de participantes del cliente', 'Cliente', 'inicio', -7, { av: true }),
          P('Alistamiento', 'Enviar el listado de participantes al director', 'Yo', 'inicio', -5),
          P('Alistamiento', 'Solicitar a la DIDE la matrícula de los participantes', 'DIDE', 'inicio', -5, { c: 'virtual' }),
          P('Alistamiento', 'Bienvenida a los participantes, con credenciales de acceso al aula', 'Asistente administrativa', 'inicio', -3),
          P('Alistamiento', 'Notificar el inicio al director y al gestor de facultad, con copia al decano', 'Yo', 'inicio', -3),
          P('Ejecución', 'Inicio del programa', 'Yo', 'inicio', 0, { h: 'Inicio' }),
          P('Ejecución', 'Visitar una clase para revisar que todo fluya', 'Yo', 'inicio', 7, { e: false, av: true }),
          P('Ejecución', 'Visitar otra clase a mitad del programa', 'Yo', 'mitad', 0, { e: false, av: true }),
          ...HONORARIOS.slice(3),
          ...CERTIFICACION,
          P('Cierre financiero', 'Factura al cliente emitida', 'Financiera', 'fin', 5),
          P('Cierre financiero', 'Pago del cliente recibido', 'Cliente', 'fin', 45, { av: true, h: 'Pago recibido' }),
          ...CIERRE, ...LIQUIDACION,
        ],
      },
      {
        clave: 'aval', nombre: 'Aval académico', orden: 2,
        descripcion: 'La universidad avala y certifica contenido de un tercero.',
        fases: ['Solicitud', 'Revisión', 'Aprobación', 'Operación', 'Vigencia'],
        items: [
          P('Solicitud', 'Registrar la entidad y el curso', 'Yo'),
          P('Solicitud', 'Verificar convenio o relación previa con la entidad', 'Yo'),
          P('Revisión', 'Formato de Aceptación de Condiciones para Aval', 'Cliente', null, null, { h: 'Condiciones aceptadas' }),
          P('Revisión', 'Revisión del contenido por la facultad', 'Gestor de facultad'),
          P('Revisión', 'Calcular el valor del aval (% sobre ingresos)', 'Yo'),
          P('Aprobación', 'Radicar ante el Consejo de Facultad', 'Yo'),
          P('Aprobación', 'Recibir el extracto del acta con el aval aprobado', 'Gestor de facultad', null, null, { av: true, h: 'Aval aprobado' }),
          P('Aprobación', 'Documento formal de aval firmado', 'Yo', null, null, { h: 'Aval firmado' }),
          P('Operación', 'Facturación del aval', 'Financiera', 'inicio', 0, { h: 'Aval facturado' }),
          P('Operación', 'Emisión o validación de certificados', 'Auxiliar administrativa', 'fin', 15),
          P('Vigencia', 'Alerta: el aval vence en 60 días', 'Yo', 'fin', -60, { e: false, av: true }),
          P('Vigencia', 'Renovar o cerrar el aval', 'Yo', 'fin', 0, { h: 'Renovación o cierre' }),
          P('Vigencia', 'Registro en el Cuadro Maestro', 'Yo', 'fin', 0),
        ],
      },
    ],
    modulos: [
      {
        clave: 'insignia', nombre: 'Insignia digital', orden: 1,
        descripcion: 'Si es programa nuevo pide metadata y diseño; si ya tuvo cohortes, solo el envío.',
        items: [
          P('Certificación', 'Solicitar al director la metadata de la insignia (formato)', 'Director del programa', 'inicio', 0, { c: 'nuevo', av: true }),
          P('Certificación', 'Pedir al gestor de comunicaciones el diseño de la insignia', 'Gestor de comunicaciones', 'inicio', 0, { c: 'nuevo' }),
          P('Certificación', 'Enviar al gerente administrativo el listado en el formato de insignias, con la fecha de envío (clausura)', 'Gerente administrativo', 'fin', -7, { av: true }),
        ],
      },
      {
        clave: 'internacional', nombre: 'Internacional / USD', orden: 2,
        descripcion: 'Precio en dólares, aliados o participantes del exterior.',
        items: [
          P('Diseño', 'Definir la tasa de referencia y el precio en USD', 'Yo'),
          P('Alistamiento', 'Requisitos migratorios o de idioma de los participantes', 'Yo', 'inicio', -30, { e: false }),
        ],
      },
      {
        clave: 'fuera_bogota', nombre: 'Práctica fuera de Bogotá', orden: 3,
        descripcion: 'Docentes viajan: tiquetes, hotel y viáticos.',
        items: [
          P('Alistamiento', 'Pedir a la asistente la solicitud de tiquetes en el sistema y hacer la compra', 'Yo', 'inicio', -20, { av: true }),
          P('Alistamiento', 'Reserva de hotel', 'Yo', 'inicio', -20),
          P('Alistamiento', 'Liquidación de viáticos', 'Yo', 'inicio', -15),
          P('Alistamiento', 'Transporte entre sedes', 'Yo', 'inicio', -10, { e: false }),
        ],
      },
      {
        clave: 'importacion', nombre: 'Importación de equipos', orden: 4,
        descripcion: 'Equipos biomédicos con importación temporal ante INVIMA.',
        items: [
          P('Alistamiento', 'Documentos del proveedor para INVIMA', 'Proveedor', 'inicio', -60),
          P('Alistamiento', 'Trámite de importación temporal ante INVIMA', 'Yo', 'inicio', -45, { av: true }),
          P('Cierre financiero', 'Devolución o reexportación de los equipos', 'Proveedor', 'fin', 15),
        ],
      },
      {
        clave: 'proveedor', nombre: 'Proveedor externo', orden: 5,
        descripcion: 'Clínica aliada, plataforma, interpretación u otro tercero.',
        items: [
          P('Diseño', 'Cotización oficial del proveedor', 'Proveedor'),
          P('Diseño', 'Comparativo de costos', 'Yo', null, null, { e: false }),
          P('Alistamiento', 'Pedir a la asistente la solicitud del servicio en Oracle', 'Asistente administrativa', 'inicio', -20),
        ],
      },
      {
        clave: 'contenido_virtual', nombre: 'Producción de contenido virtual', orden: 6,
        descripcion: 'Módulos producidos (RISE, videos) a partir de insumos de expertos.',
        items: [
          P('Alistamiento', 'Insumos del experto por módulo', 'Director del programa', 'inicio', -40),
          P('Alistamiento', 'Producción RISE y videos', 'DIDE', 'inicio', -20),
          P('Alistamiento', 'Revisión y entrega del contenido', 'Director del programa', 'inicio', -5),
        ],
      },
      {
        clave: 'evento', nombre: 'Evento / congreso', orden: 7,
        descripcion: 'Agenda, patrocinios, interpretación y logística de sede.',
        items: [
          P('Diseño', 'Agenda por especialidad', 'Director del programa'),
          P('Alistamiento', 'Interpretación simultánea', 'Proveedor', 'inicio', -30, { e: false }),
          P('Alistamiento', 'Patrocinios confirmados', 'Yo', 'inicio', -30, { e: false }),
          P('Alistamiento', 'Logística de sede', 'Yo', 'inicio', -15),
        ],
      },
    ],
  };
})();
