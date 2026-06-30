import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia del inventario de brazaletes. El cliente empuja el registro completo; aquí se hace
// upsert idempotente por `clientId`. Las fotos de los responsables NO viajan (las quita `sync.ts`
// con strip profundo de binarios; quedan locales por privacidad, R7).

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("brazaletes")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...doc });
      return existente._id;
    }
    return await ctx.db.insert("brazaletes", doc);
  },
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("brazaletes").order("desc").collect(),
});
