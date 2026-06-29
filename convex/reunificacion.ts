import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de reclamos de reunificacion. Upsert por `clientId`.
// El gate anti-suplantacion (>=2 coincidencias, entrevista, autorizacion, firmas) se
// aplica en el cliente; aqui se preserva el estado resultante para auditoria compartida.

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("reclamos")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...doc });
      return existente._id;
    }
    return await ctx.db.insert("reclamos", doc);
  },
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("reclamos").order("desc").collect(),
});

export const porMenor = query({
  args: { menorId: v.string() },
  handler: async (ctx, { menorId }) =>
    ctx.db
      .query("reclamos")
      .withIndex("by_menor", (q) => q.eq("menorId", menorId))
      .collect(),
});
