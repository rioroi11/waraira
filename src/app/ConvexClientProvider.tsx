"use client";

// Provider de Convex para la capa de convergencia. Es OPCIONAL: si no hay
// NEXT_PUBLIC_CONVEX_URL (caso normal en campo / antes de `npx convex dev`), simplemente
// deja pasar a los hijos y la app sigue funcionando 100% offline con IndexedDB.

import { ReactNode, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => (url ? new ConvexReactClient(url) : null), [url]);

  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
