// Waraira — Geografía nacional (Venezuela). Jerarquía REAL: Estado → Municipio → Parroquia → Punto.
// La data viene de `geografia-ve.ts` (división político-territorial oficial). Toda la respuesta
// (refugios, acopio de insumos, censo) ocurre en TODO el país, no solo en lo más afectado.

import { ESTADOS_VE, type EstadoVE, type MunicipioVE, type ParroquiaVE } from "./geografia-ve";

export type { EstadoVE, MunicipioVE, ParroquiaVE };

export const ESTADOS = ESTADOS_VE;

/**
 * Una ubicación administrativa (todos los niveles son slugs). `entidad` = estado federal
 * (se nombra "entidad" para no chocar con el campo `estado` = estatus de varios registros;
 * en la interfaz se rotula "Estado").
 */
export interface Ubicacion {
  entidad?: string;
  municipio?: string;
  parroquia?: string;
  sector?: string;
  lat?: number;
  lng?: number;
}

// ───────────────────────────── Búsquedas en la jerarquía ─────────────────────────────

export function estadoPorSlug(slug?: string): EstadoVE | undefined {
  return slug ? ESTADOS.find((e) => e.slug === slug) : undefined;
}

export function municipiosDe(estadoSlug?: string): MunicipioVE[] {
  return estadoPorSlug(estadoSlug)?.municipios ?? [];
}

export function municipioPorSlug(estadoSlug?: string, munSlug?: string): MunicipioVE | undefined {
  return munSlug ? municipiosDe(estadoSlug).find((m) => m.slug === munSlug) : undefined;
}

export function parroquiasDe(estadoSlug?: string, munSlug?: string): ParroquiaVE[] {
  return municipioPorSlug(estadoSlug, munSlug)?.parroquias ?? [];
}

// ───────────────────────────── Nombres legibles ─────────────────────────────

export function nombreEstado(slug?: string): string {
  return estadoPorSlug(slug)?.nombre ?? slug ?? "";
}

export function nombreMunicipio(estadoSlug?: string, munSlug?: string): string {
  return municipioPorSlug(estadoSlug, munSlug)?.nombre ?? munSlug ?? "";
}

export function nombreParroquia(estadoSlug?: string, munSlug?: string, parrSlug?: string): string {
  const p = parroquiasDe(estadoSlug, munSlug).find((x) => x.slug === parrSlug);
  return p?.nombre ?? parrSlug ?? "";
}

/** Texto compacto de ubicación para mostrar en tarjetas: "Estado · Municipio · Parroquia". */
export function ubicacionTexto(u: Ubicacion): string {
  const partes = [
    nombreEstado(u.entidad),
    u.municipio ? nombreMunicipio(u.entidad, u.municipio) : "",
    u.parroquia ? nombreParroquia(u.entidad, u.municipio, u.parroquia) : "",
  ].filter(Boolean);
  return partes.join(" · ");
}

// ───────────────────────────── Distancia y "misma zona" ─────────────────────────────

/** Radio (m) dentro del cual se considera "misma localización" por GPS. */
export const RADIO_ZONA_M = 1500;

/** Distancia en metros entre dos coordenadas (haversine). */
export function distanciaMetros(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * ¿Están dos ubicaciones en la "misma zona"? Base: mismo estado. Afina con municipio y
 * parroquia cuando ambos los declaran, o con GPS (dentro de RADIO_ZONA_M) si ambos tienen
 * coordenadas. GPS cercano basta aunque difieran los textos.
 */
export function mismaZona(a: Ubicacion, b: Ubicacion): boolean {
  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
    if (distanciaMetros(a.lat, a.lng, b.lat, b.lng) <= RADIO_ZONA_M) return true;
  }
  if (!a.entidad || !b.entidad || a.entidad !== b.entidad) return false;
  // Misma entidad: si ambos declaran municipio, debe coincidir; igual con parroquia.
  if (a.municipio && b.municipio && a.municipio !== b.municipio) return false;
  if (a.parroquia && b.parroquia && a.parroquia !== b.parroquia) return false;
  return true;
}
