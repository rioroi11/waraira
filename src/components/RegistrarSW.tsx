"use client";

import { useEffect } from "react";

/** Registra el service worker para que la app funcione offline (PWA). */
export function RegistrarSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sin SW la app sigue funcionando con IndexedDB; solo no cachea assets */
      });
    }
  }, []);
  return null;
}
