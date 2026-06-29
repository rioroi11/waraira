"use client";

// Waraira — Convergencia (sincronización con Convex).
//
// La app es LOCAL-FIRST: funciona 100% sin esto. Cuando hay (a) red y (b) un despliegue
// Convex en NEXT_PUBLIC_CONVEX_URL (tras `npx convex dev`), empuja los registros
// `pendiente` por colección a las mutaciones `upsert` (idempotentes por clientId).
//
// Usamos `makeFunctionReference` (referencia por nombre) para NO importar
// `convex/_generated`, que solo existe tras inicializar Convex. Así la app compila y
// corre en campo sin Convex, y la sincronización se activa sola cuando esté disponible.

import { useEffect, useRef, useState } from "react";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { obtenerTodos, pendientes, marcarSincronizados, type Coleccion } from "./db";
import type { Base } from "./model";
import { useOnline } from "./useOnline";

// Colección local → mutación de convergencia en Convex.
const ENDPOINTS: Record<Coleccion, string> = {
  menores: "menores:upsert",
  cordones: "cordones:upsert",
  turnos: "cordones:upsertTurno",
  voluntarios: "voluntarios:upsert",
  reclamos: "reunificacion:upsert",
  avales: "voluntarios:upsertAval",
  reportes: "convergencia:upsertReporte",
  eventos: "convergencia:upsertEvento",
};

export function convexConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

/** Cuenta cuántos registros faltan por sincronizar (para mostrar en la UI). */
export async function contarPendientes(): Promise<number> {
  let total = 0;
  for (const c of Object.keys(ENDPOINTS) as Coleccion[]) {
    const todos = await obtenerTodos<Base>(c);
    total += todos.filter((r) => r.syncStatus === "pendiente").length;
  }
  return total;
}

/** Empuja todo lo pendiente. Best-effort: cualquier fallo deja el registro pendiente. */
export async function sincronizarTodo(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || typeof navigator === "undefined" || !navigator.onLine) return;
  const client = new ConvexHttpClient(url);
  for (const c of Object.keys(ENDPOINTS) as Coleccion[]) {
    const docs = await pendientes<Base>(c);
    if (docs.length === 0) continue;
    const ref = makeFunctionReference<"mutation">(ENDPOINTS[c]);
    const ok: string[] = [];
    for (const d of docs) {
      try {
        const doc: Record<string, unknown> = { ...(d as unknown as Record<string, unknown>), clientId: d.id };
        delete doc.fotoBlob; // el binario de la foto no viaja (privacidad/local)
        await client.mutation(ref, { doc });
        ok.push(d.id);
      } catch {
        /* se reintenta en el próximo ciclo */
      }
    }
    if (ok.length) await marcarSincronizados(c, ok);
  }
}

export interface EstadoSync {
  online: boolean;
  configurado: boolean;
  pendientes: number;
}

/** Estado de convergencia + auto-sincronización cuando hay red y servidor. */
export function useEstadoSync(): EstadoSync {
  const online = useOnline();
  const [pendientesN, setPendientesN] = useState(0);
  const sincronizando = useRef(false);

  useEffect(() => {
    let vivo = true;
    const tick = async () => {
      if (convexConfigurado() && online && !sincronizando.current) {
        sincronizando.current = true;
        try {
          await sincronizarTodo();
        } finally {
          sincronizando.current = false;
        }
      }
      const n = await contarPendientes().catch(() => 0);
      if (vivo) setPendientesN(n);
    };
    tick();
    const t = setInterval(tick, 5000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [online]);

  return { online, configurado: convexConfigurado(), pendientes: pendientesN };
}
