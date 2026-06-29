import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de insumos (reportes) y de la bitacora (eventos append-only).
// El modelo local usa `parroquia`; el esquema usa `zona` (se mapea aqui).

export const upsertReporte = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const { parroquia, ...resto } = doc;
    const limpio = { ...resto, zona: doc.zona ?? parroquia ?? "" };
    const existente = await ctx.db
      .query("reportes")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...limpio });
      return existente._id;
    }
    return await ctx.db.insert("reportes", limpio);
  },
});

// Eventos: append-only. Solo se insertan una vez por `clientId` (nunca se reescriben).
export const upsertEvento = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("eventos")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) return existente._id; // inmutable: no se modifica
    return await ctx.db.insert("eventos", doc);
  },
});

export const bitacora = query({
  args: {},
  handler: async (ctx) => ctx.db.query("eventos").withIndex("by_createdAt").order("desc").take(500),
});
