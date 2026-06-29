import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de voluntarios. Upsert por `clientId`. El campo `verificado` deriva del
// vetting + Codigo de Conducta + capacitacion (se calcula en el cliente y se respeta aqui).

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("voluntarios")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...doc });
      return existente._id;
    }
    return await ctx.db.insert("voluntarios", doc);
  },
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("voluntarios").order("desc").collect(),
});

// Avales de validación comunitaria. Upsert por clientId.
export const upsertAval = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("avales")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...doc });
      return existente._id;
    }
    return await ctx.db.insert("avales", doc);
  },
});

export const listarAvales = query({
  args: {},
  handler: async (ctx) => ctx.db.query("avales").order("desc").collect(),
});
