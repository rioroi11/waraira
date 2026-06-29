import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convergencia de cordones (Espacios Seguros) y sus turnos. Upsert por `clientId`.

export const upsert = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("cordones")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...doc });
      return existente._id;
    }
    return await ctx.db.insert("cordones", doc);
  },
});

export const listar = query({
  args: {},
  handler: async (ctx) => ctx.db.query("cordones").order("desc").collect(),
});

export const upsertTurno = mutation({
  args: { doc: v.any() },
  handler: async (ctx, { doc }) => {
    const existente = await ctx.db
      .query("turnos")
      .withIndex("by_clientId", (q) => q.eq("clientId", doc.clientId))
      .unique();
    if (existente) {
      await ctx.db.replace(existente._id, { ...existente, ...doc });
      return existente._id;
    }
    return await ctx.db.insert("turnos", doc);
  },
});

export const listarTurnos = query({
  args: {},
  handler: async (ctx) => ctx.db.query("turnos").order("desc").collect(),
});
