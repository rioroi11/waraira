import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de la cadena de custodia del menor (Registro 1).
//
// APPEND-ONLY: un evento de custodia se inserta una sola vez por `clientId` y NUNCA se
// reescribe (igual que la bitácora `eventos`). La inmutabilidad es la salvaguarda: el
// historial de quién respondió por el niño no se puede alterar. Sin PII del menor: encadena
// por `codigo`; la identidad vive en `menores` (capa restringida).

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("custodia")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) return existente._id; // inmutable: no se modifica
    return await ctx.db.insert("custodia", doc);
  },
});

export const porMenor = query({
  args: { menorId: v.string() },
  handler: async (ctx, { menorId }) =>
    ctx.db
      .query("custodia")
      .withIndex("by_menorId", (q) => q.eq("menorId", menorId))
      .collect(),
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("custodia").order("desc").collect(),
});
