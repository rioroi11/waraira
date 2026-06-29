"use client";

// Waraira — Perfil local (este teléfono / esta persona). Singleton en localStorage.
// Identifica al usuario como vecino localizable de una zona para recibir y dar avales.

import { useEffect, useState } from "react";
import { generarId, type Perfil } from "./model";

const CLAVE = "waraira-perfil";

const oyentes = new Set<() => void>();
function notificar() {
  oyentes.forEach((fn) => fn());
}

export function leerPerfil(): Perfil | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Perfil) : null;
  } catch {
    return null;
  }
}

export function guardarPerfil(datos: Omit<Perfil, "id" | "createdAt"> & Partial<Pick<Perfil, "id" | "createdAt">>): Perfil {
  const previo = leerPerfil();
  const perfil: Perfil = {
    ...datos,
    id: previo?.id ?? datos.id ?? generarId(),
    createdAt: previo?.createdAt ?? datos.createdAt ?? Date.now(),
  };
  localStorage.setItem(CLAVE, JSON.stringify(perfil));
  notificar();
  return perfil;
}

/** Lee el perfil y se re-renderiza cuando cambia. */
export function usePerfil(): { perfil: Perfil | null; listo: boolean } {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    const cargar = () => {
      setPerfil(leerPerfil());
      setListo(true);
    };
    cargar();
    oyentes.add(cargar);
    return () => {
      oyentes.delete(cargar);
    };
  }, []);
  return { perfil, listo };
}

/** Intenta obtener la ubicación GPS del dispositivo (con permiso del usuario). */
export function capturarGPS(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}
