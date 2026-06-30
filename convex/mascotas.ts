import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de mascotas. El cliente (IndexedDB) empuja el registro completo; aqui se hace
// upsert idempotente por `clientId`. A diferencia del menor, la mascota es MUTABLE (cambia de
// estado, custodio y refugio): por eso se hace replace cuando ya existe. La foto confidencial
// (fotoBlob) NO viaja (queda local, R7); `fotoUrl` (host publico) si, y `tieneFoto` la indica.

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const { fotoBlob, ...resto } = doc; // descartar binario si llegara
    void fotoBlob;
    const limpio = { ...resto, tieneFoto: Boolean(doc.tieneFoto ?? doc.fotoBlob) };
    const existente = await ctx.db
      .query("mascotas")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...limpio });
      return existente._id;
    }
    return await ctx.db.insert("mascotas", limpio);
  },
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("mascotas").order("desc").collect(),
});

export const porCodigo = query({
  args: { codigo: v.string() },
  handler: async (ctx, { codigo }) =>
    ctx.db
      .query("mascotas")
      .withIndex("by_codigo", (q) => q.eq("codigo", codigo))
      .unique(),
});
