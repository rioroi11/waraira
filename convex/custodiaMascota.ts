import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de la cadena de custodia de la mascota.
//
// APPEND-ONLY: un evento se inserta una sola vez por `clientId` y NUNCA se reescribe (igual que
// la custodia del menor y la bitacora `eventos`). La inmutabilidad es la salvaguarda: el historial
// de quien respondio por la mascota no se puede alterar. Encadena por `codigo` MAS-XXXX.

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("custodiaMascota")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) return existente._id; // inmutable: no se modifica
    return await ctx.db.insert("custodiaMascota", doc);
  },
});

export const porMascota = query({
  args: { mascotaId: v.string() },
  handler: async (ctx, { mascotaId }) =>
    ctx.db
      .query("custodiaMascota")
      .withIndex("by_mascotaId", (q) => q.eq("mascotaId", mascotaId))
      .collect(),
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("custodiaMascota").order("desc").collect(),
});
