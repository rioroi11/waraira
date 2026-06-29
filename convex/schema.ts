import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Waraira — Esquema de coordinacion civil (capa de CONVERGENCIA).
//
// El cliente es local-first (IndexedDB). Estas tablas reciben los registros cuando hay
// red, identificados por `clientId` (el id local) para upsert idempotente.
// Principio: "Barrera baja, traza alta". Todo queda trazado en `eventos` (append-only).

export default defineSchema({
  // ───────────── Insumos: NECESIDAD (falta) u OFERTA (hay). Corazon del balanceo.
  // Ciclos SEPARADOS (ver src/lib/model.ts «Insumo (reporte)»):
  //   necesidad: abierta → parcial → abastecida → cerrada
  //   oferta:    disponible → reservado → entregado
  // convex/convergencia.ts mapea parroquia→zona y hace upsert con v.any(); por eso los
  // campos nuevos van como v.optional() (no rompen registros viejos del prototipo).
  reportes: defineTable({
    clientId: v.optional(v.string()),
    esEjemplo: v.optional(v.boolean()),
    tipo: v.union(v.literal("necesidad"), v.literal("oferta")),
    categoria: v.union(
      v.literal("comida"),
      v.literal("agua"),
      v.literal("medicinas"),
      v.literal("carpas"),
      v.literal("colchonetas"),
      v.literal("kits_higiene"),
      v.literal("cobijas"),
      v.literal("ropa"),
      v.literal("traslados"),
      v.literal("insumos"),
      v.literal("otro"),
    ),
    punto: v.string(),
    zona: v.string(), // parroquia (el cliente envia `parroquia`; convergencia la mapea aqui)
    entidad: v.optional(v.string()),
    municipio: v.optional(v.string()),
    sector: v.optional(v.string()),
    descripcion: v.string(),
    cantidad: v.optional(v.string()),
    // Solo ROPA pide detalle; todo opcional, cada campo admite "varios".
    detalleRopa: v.optional(
      v.object({
        edad: v.optional(v.string()),
        talla: v.optional(v.string()),
        genero: v.optional(v.string()),
      }),
    ),
    personasPresentes: v.optional(v.number()),
    // Union de AMBOS ciclos. "abastecida" y "entregado" = cubierto por completo.
    estado: v.union(
      v.literal("abierta"),
      v.literal("parcial"),
      v.literal("abastecida"),
      v.literal("cerrada"),
      v.literal("disponible"),
      v.literal("reservado"),
      v.literal("entregado"),
    ),
    // Vigencia: hasta una fecha (ms) o indefinida.
    vigencia: v.optional(
      v.object({
        tipo: v.union(v.literal("fecha"), v.literal("indefinido")),
        hasta: v.optional(v.number()),
      }),
    ),
    // Procedencia dura (R5): autor identificado.
    autorNombre: v.optional(v.string()),
    autorTelefono: v.optional(v.string()),
    autorCedula: v.optional(v.string()),
    cedulaDeTercero: v.optional(v.boolean()),
    telefonoDeTercero: v.optional(v.boolean()),
    telefonoVerificado: v.optional(v.boolean()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    // Reconfirmacion anti-rumor (cada 6 h).
    ultimaConfirmacion: v.optional(v.number()),
    // Entrega/abastecimiento confirmado (R3): por el receptor o por el dador.
    confirmadoPor: v.optional(v.union(v.literal("receptor"), v.literal("dador"))),
    // Deduplicacion → entrada viva enriquecida con varios aportantes.
    aportes: v.optional(
      v.array(
        v.object({
          nombre: v.string(),
          telefono: v.string(),
          telefonoVerificado: v.boolean(),
          cedula: v.string(),
          cedulaDeTercero: v.optional(v.boolean()),
          telefonoDeTercero: v.optional(v.boolean()),
          nota: v.optional(v.string()),
          createdAt: v.number(),
        }),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_estado", ["estado"])
    .index("by_zona", ["zona"])
    .index("by_tipo", ["tipo"]),

  // ───────────── Menor (UASC). Capa restringida; identidad jamas publica (LOPNNA 65).
  // La foto NO se sincroniza como binario aqui: queda local. `tieneFoto` solo lo indica.
  menores: defineTable({
    clientId: v.string(),
    codigo: v.string(),
    estatus: v.union(
      v.literal("separado"),
      v.literal("no_acompanado"),
      v.literal("huerfano"),
      v.literal("desconocido"),
    ),
    estadoIDTR: v.union(
      v.literal("identificado"),
      v.literal("documentado"),
      v.literal("en_busqueda"),
      v.literal("en_verificacion"),
      v.literal("derivado_autoridad"),
      v.literal("reunificado"),
      v.literal("seguimiento"),
    ),
    tieneFoto: v.optional(v.boolean()),
    edadEstimadaMin: v.optional(v.number()),
    edadEstimadaMax: v.optional(v.number()),
    sexo: v.union(v.literal("f"), v.literal("m"), v.literal("desconocido")),
    senasFisicas: v.optional(v.string()),
    ropaYObjetos: v.optional(v.string()),
    lugarHallazgo: v.string(),
    parroquia: v.string(),
    entidad: v.optional(v.string()),
    municipio: v.optional(v.string()),
    punto: v.optional(v.string()),
    cordonId: v.optional(v.string()),
    encontradoHora: v.number(),
    encontradoPor: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    alias: v.optional(v.string()),
    nombre: v.optional(v.string()),
    nombrePadre: v.optional(v.string()),
    nombreMadre: v.optional(v.string()),
    hermanos: v.optional(v.string()),
    comunidadOrigen: v.optional(v.string()),
    conQuienEstaba: v.optional(v.string()),
    idioma: v.optional(v.string()),
    estadoSalud: v.optional(v.string()),
    necesidadesMedicas: v.optional(v.string()),
    senalesRiesgo: v.optional(v.string()),
    cuidoActual: v.optional(v.string()),
    custodioActualId: v.optional(v.string()),
    notificadoConsejo: v.optional(v.number()),
    notificadoConsejoNota: v.optional(v.string()),
    testigosComunidad: v.optional(v.string()),
    verificacionCompleta: v.boolean(),
    detallesPrivados: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_codigo", ["codigo"])
    .index("by_parroquia", ["parroquia"])
    .index("by_estadoIDTR", ["estadoIDTR"]),

  // ───────────── Cordon (Espacio Seguro / CFS).
  cordones: defineTable({
    clientId: v.string(),
    nombre: v.string(),
    parroquia: v.string(),
    entidad: v.optional(v.string()),
    municipio: v.optional(v.string()),
    punto: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    coordinador: v.optional(v.string()),
    capacidad: v.number(),
    estado: v.union(v.literal("activo"), v.literal("cerrado")),
    perimetro: v.object({
      libreDePeligros: v.boolean(),
      lejosDeTrafico: v.boolean(),
      lejosDeMilitares: v.boolean(),
      delimitado: v.boolean(),
      banosSeparados: v.boolean(),
      botiquin: v.boolean(),
      controlDeAcceso: v.boolean(),
    }),
    notas: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_parroquia", ["parroquia"]),

  // ───────────── Voluntario (con vetting).
  voluntarios: defineTable({
    clientId: v.string(),
    nombre: v.string(),
    contacto: v.optional(v.string()),
    telefono: v.optional(v.string()),
    cedula: v.optional(v.string()),
    roles: v.array(v.string()),
    parroquia: v.optional(v.string()),
    entidad: v.optional(v.string()),
    municipio: v.optional(v.string()),
    sector: v.optional(v.string()),
    zonaDe: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    habilidades: v.optional(v.string()),
    vetting: v.object({
      screening: v.boolean(),
      antecedentes: v.boolean(),
      validacionComunitaria: v.boolean(),
      referencias: v.boolean(),
    }),
    codigoConductaFirmado: v.boolean(),
    capacitacionMinima: v.boolean(),
    verificado: v.boolean(),
    estadoValidacion: v.optional(
      v.union(v.literal("pendiente"), v.literal("validado"), v.literal("rechazado")),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_parroquia", ["parroquia"]),

  // ───────────── Avales (validacion comunitaria). Un vecino registrado avala a un voluntario.
  avales: defineTable({
    clientId: v.string(),
    voluntarioId: v.string(),
    avalNombre: v.string(),
    avalTelefono: v.string(),
    avalCedula: v.optional(v.string()),
    avalFigura: v.optional(v.string()),
    parroquia: v.optional(v.string()),
    entidad: v.optional(v.string()),
    municipio: v.optional(v.string()),
    sector: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    decision: v.union(v.literal("aprobado"), v.literal("rechazado")),
    nota: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_voluntario", ["voluntarioId"]),

  // ───────────── Turno (check-in/out de voluntario en un cordon).
  turnos: defineTable({
    clientId: v.string(),
    cordonId: v.string(),
    voluntarioId: v.string(),
    inicio: v.number(),
    fin: v.optional(v.number()),
    rol: v.string(),
    activo: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_cordon", ["cordonId"]),

  // ───────────── Reclamo (reunificacion). R3 + gate anti-suplantacion.
  reclamos: defineTable({
    clientId: v.string(),
    menorId: v.string(),
    reclamanteNombre: v.string(),
    reclamanteContacto: v.optional(v.string()),
    reclamanteDocumento: v.optional(v.string()),
    relacionAlegada: v.string(),
    puntosCoincidencia: v.array(v.string()),
    pruebaDetallesPrivados: v.optional(v.string()),
    entrevistaNino: v.boolean(),
    ninoReconoce: v.optional(v.boolean()),
    testigos: v.optional(v.string()),
    estado: v.union(
      v.literal("recibido"),
      v.literal("en_verificacion"),
      v.literal("aprobado_por_autoridad"),
      v.literal("rechazado"),
    ),
    autorizadoPor: v.optional(v.string()),
    firmaEntrega: v.optional(v.string()),
    firmaRecibe: v.optional(v.string()),
    firmaTestigo: v.optional(v.string()),
    notas: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_menor", ["menorId"]),

  // ───────────── Traslados (movimiento con cadena de custodia). R3.
  traslados: defineTable({
    reporteId: v.optional(v.id("reportes")),
    descripcion: v.string(),
    origen: v.optional(v.string()),
    destino: v.string(),
    estado: v.union(
      v.literal("solicitado"),
      v.literal("tomado"),
      v.literal("en_camino"),
      v.literal("entregado"),
    ),
    contacto: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_estado", ["estado"]),

  // ───────────── Registro append-only. R10: toda accion genera un evento inmutable.
  eventos: defineTable({
    clientId: v.optional(v.string()),
    accion: v.string(),
    descripcion: v.string(),
    refTabla: v.optional(v.string()),
    refId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]).index("by_clientId", ["clientId"]),
});
