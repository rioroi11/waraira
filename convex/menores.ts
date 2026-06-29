import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de menores. El cliente (IndexedDB) empuja el registro completo; aqui se
// hace upsert idempotente por `clientId`. La foto NO viaja (queda local por privacidad).
// La identidad del menor jamas se expone publicamente (LOPNNA art. 65): estas funciones
// son para roles autorizados de la red de proteccion.

export const upsert = mutation({
  // Documento local completo (sin el Blob de la foto). Se valida contra el esquema al escribir.
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const { fotoBlob, ...resto } = doc; // descartar binario si llegara
    void fotoBlob;
    const limpio = { ...resto, tieneFoto: Boolean(doc.tieneFoto ?? doc.fotoBlob) };
    const existente = await ctx.db
      .query("menores")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...limpio });
      return existente._id;
    }
    return await ctx.db.insert("menores", limpio);
  },
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("menores").order("desc").collect(),
});
