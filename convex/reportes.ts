import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Reportes de insumos. Ciclos SEPARADOS (ver src/lib/model.ts):
//   necesidad: abierta → parcial → abastecida → cerrada
//   oferta:    disponible → reservado → entregado
// "abastecida" / "entregado" = cubierto por completo. "cerrada" sale del tablero.

const tipoArg = v.union(v.literal("necesidad"), v.literal("oferta"));
const categoriaArg = v.union(
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
);
const estadoArg = v.union(
  v.literal("abierta"),
  v.literal("parcial"),
  v.literal("abastecida"),
  v.literal("cerrada"),
  v.literal("disponible"),
  v.literal("reservado"),
  v.literal("entregado"),
);

// Lista todos los reportes activos (no cerrados), mas recientes primero.
export const listar = query({
  args: {},
  handler: async (ctx) => {
    const reportes = await ctx.db.query("reportes").order("desc").collect();
    return reportes.filter((r) => r.estado !== "cerrada");
  },
});

// Tablero de balanceo: agrupa por punto y resume necesidades vs ofertas.
export const tablero = query({
  args: {},
  handler: async (ctx) => {
    const reportes = (await ctx.db.query("reportes").order("desc").collect()).filter(
      (r) => r.estado !== "cerrada",
    );

    const mapa = new Map<
      string,
      {
        punto: string;
        zona: string;
        personasPresentes: number | null;
        necesidades: typeof reportes;
        ofertas: typeof reportes;
        ultimaActualizacion: number;
      }
    >();

    for (const r of reportes) {
      const clave = `${r.punto.trim().toLowerCase()}|${r.zona.trim().toLowerCase()}`;
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          punto: r.punto,
          zona: r.zona,
          personasPresentes: null,
          necesidades: [],
          ofertas: [],
          ultimaActualizacion: 0,
        });
      }
      const grupo = mapa.get(clave)!;
      if (r.tipo === "necesidad") grupo.necesidades.push(r);
      else grupo.ofertas.push(r);
      if (typeof r.personasPresentes === "number") {
        grupo.personasPresentes = Math.max(
          grupo.personasPresentes ?? 0,
          r.personasPresentes,
        );
      }
      grupo.ultimaActualizacion = Math.max(grupo.ultimaActualizacion, r.updatedAt);
    }

    // Estado del punto: rojo (falta), amarillo (parcial), verde (abastecido).
    const puntos = Array.from(mapa.values()).map((g) => {
      const abiertas = g.necesidades.filter(
        (n) => n.estado === "abierta" || n.estado === "parcial",
      ).length;
      const cubiertas = g.necesidades.filter((n) => n.estado === "abastecida").length;
      let nivel: "falta" | "parcial" | "cubierto";
      if (abiertas > 0 && g.ofertas.length === 0) nivel = "falta";
      else if (abiertas > 0) nivel = "parcial";
      else nivel = "cubierto";
      return { ...g, abiertas, cubiertas, nivel };
    });

    puntos.sort((a, b) => {
      const orden = { falta: 0, parcial: 1, cubierto: 2 };
      if (orden[a.nivel] !== orden[b.nivel]) return orden[a.nivel] - orden[b.nivel];
      return b.ultimaActualizacion - a.ultimaActualizacion;
    });

    return puntos;
  },
});

export const crear = mutation({
  args: {
    tipo: tipoArg,
    categoria: categoriaArg,
    punto: v.string(),
    zona: v.string(),
    sector: v.optional(v.string()),
    descripcion: v.string(),
    cantidad: v.optional(v.string()),
    detalleRopa: v.optional(
      v.object({
        edad: v.optional(v.string()),
        talla: v.optional(v.string()),
        genero: v.optional(v.string()),
      }),
    ),
    personasPresentes: v.optional(v.number()),
    vigencia: v.optional(
      v.object({
        tipo: v.union(v.literal("fecha"), v.literal("indefinido")),
        hasta: v.optional(v.number()),
      }),
    ),
    autorNombre: v.optional(v.string()),
    autorTelefono: v.optional(v.string()),
    autorCedula: v.optional(v.string()),
    cedulaDeTercero: v.optional(v.boolean()),
    telefonoDeTercero: v.optional(v.boolean()),
    telefonoVerificado: v.optional(v.boolean()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ahora = Date.now();
    // Estado inicial segun el ciclo del tipo.
    const estado = args.tipo === "necesidad" ? "abierta" : "disponible";
    const id = await ctx.db.insert("reportes", {
      ...args,
      estado,
      ultimaConfirmacion: ahora,
      createdAt: ahora,
      updatedAt: ahora,
    });
    await ctx.db.insert("eventos", {
      accion: "reporte.creado",
      descripcion: `${args.tipo === "necesidad" ? "Necesidad" : "Oferta"} de ${args.categoria} en ${args.punto} (${args.zona})`,
      refTabla: "reportes",
      refId: id,
      createdAt: ahora,
    });
    return id;
  },
});

export const actualizarEstado = mutation({
  args: {
    id: v.id("reportes"),
    estado: estadoArg,
    confirmadoPor: v.optional(v.union(v.literal("receptor"), v.literal("dador"))),
  },
  handler: async (ctx, { id, estado, confirmadoPor }) => {
    const reporte = await ctx.db.get(id);
    if (!reporte) throw new Error("Reporte no encontrado");
    const ahora = Date.now();
    await ctx.db.patch(id, {
      estado,
      ...(confirmadoPor ? { confirmadoPor } : {}),
      updatedAt: ahora,
    });
    await ctx.db.insert("eventos", {
      accion: `reporte.${estado}`,
      descripcion: `"${reporte.descripcion}" en ${reporte.punto} marcado como ${estado}`,
      refTabla: "reportes",
      refId: id,
      createdAt: ahora,
    });
  },
});
