import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de notificaciones a personas del acto (testigo/custodio con app). Upsert idempotente
// por `clientId`. El envío push real entre teléfonos requiere Web Push/VAPID + Convex en línea
// (roadmap); aquí se preserva el registro para la bandeja compartida.

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("notificaciones")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...doc });
      return existente._id;
    }
    return await ctx.db.insert("notificaciones", doc);
  },
});

export const porMenor = query({
  args: { refMenorId: v.string() },
  handler: async (ctx, { refMenorId }) =>
    ctx.db
      .query("notificaciones")
      .withIndex("by_refMenorId", (q) => q.eq("refMenorId", refMenorId))
      .collect(),
});
