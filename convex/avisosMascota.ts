import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de la cartelera de avisos de mascotas (se busca / encontrada / reunificada).
// Upsert idempotente por `clientId` (el aviso es mutable: pasa de activo a resuelto). La foto
// confidencial (fotoBlob) NO viaja; `fotoUrl` (host publico) si, para compartir el cartel.

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const { fotoBlob, ...resto } = doc;
    void fotoBlob;
    const limpio = { ...resto, tieneFoto: Boolean(doc.tieneFoto ?? doc.fotoBlob) };
    const existente = await ctx.db
      .query("avisosMascota")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...limpio });
      return existente._id;
    }
    return await ctx.db.insert("avisosMascota", limpio);
  },
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("avisosMascota").order("desc").collect(),
});
