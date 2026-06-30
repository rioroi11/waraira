// Waraira — Lógica de dominio del módulo de Mascotas.
//
// Mismo principio que niños/insumos: barrera baja, traza alta. La cadena de custodia y los
// tipos viven en `model.ts`; aquí van las reglas puras del módulo (sin React, sin IndexedDB)
// y el puente al MOTOR de insumos (el tablero de necesidades veterinarias es `reportes`).

import {
  type Reporte,
  type Mascota,
  type AvisoMascota,
  type CategoriaInsumo,
  ESPECIES_MASCOTA,
  generarCodigoMascota,
} from "./model";
import { ubicacionTexto } from "./geografia";

// Reuso directo del motor de insumos para el tablero de necesidades veterinarias.
export {
  feedOrdenado,
  separarPorVerificacion,
  balance,
  buscarSimilares,
  sugerirContrapartes,
  estadoEfectivo,
  enTableroActivo,
  horaCorta,
  enlaceMapa,
  etiquetaVigencia,
} from "./insumos";

export { generarCodigoMascota };

/** Categorías veterinarias: el subconjunto que pertenece al módulo Mascotas. */
export const CATEGORIAS_VET: CategoriaInsumo[] = [
  "medicinas_vet",
  "atencion_vet",
  "operacion",
  "alimento_mascota",
  "hospedaje",
  "traslado_mascota",
];

export function esCategoriaVet(c: CategoriaInsumo): boolean {
  return CATEGORIAS_VET.includes(c);
}

/** Reportes que pertenecen al módulo Mascotas: atados a una ficha O de categoría veterinaria. */
export function reportesDeMascotas(reportes: Reporte[]): Reporte[] {
  return reportes.filter((r) => r.mascotaId || esCategoriaVet(r.categoria));
}

/** Necesidades/ofertas atadas a una ficha concreta. */
export function reportesDeFicha(mascotaId: string, reportes: Reporte[]): Reporte[] {
  return reportes.filter((r) => r.mascotaId === mascotaId);
}

/** Feed de avisos (cartelera): más reciente primero; por defecto solo los activos. */
export function feedAvisosOrdenado(avisos: AvisoMascota[], soloActivos = true): AvisoMascota[] {
  return avisos
    .filter((a) => !soloActivos || a.estado === "activo")
    .slice()
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));
}

/** Genera un código MAS-XXXX que no choque con los ya existentes. */
export function codigoMascotaUnico(existentes: Mascota[]): string {
  const usados = new Set(existentes.map((m) => m.codigo));
  let c = generarCodigoMascota();
  while (usados.has(c)) c = generarCodigoMascota();
  return c;
}

export const etiquetaEspecie = (e: Mascota["especie"]) =>
  ESPECIES_MASCOTA.find((x) => x.valor === e)?.etiqueta ?? e;

// ── Cartel imprimible / compartible ──

export interface DatosCartel {
  codigo: string;
  nombre: string;
  especie: string;
  foto?: string; // fotoUrl pública (lo único compartible a terceros por link)
  zona: string;
  senas?: string;
  estadoSalud?: string;
  contactoNombre: string;
  contactoTelefono: string;
  urlFicha: string; // lo que codifica el QR
}

export function datosCartel(
  m: Mascota,
  baseUrl: string,
  contacto: { nombre: string; telefono: string },
): DatosCartel {
  return {
    codigo: m.codigo,
    nombre: m.nombre,
    especie: etiquetaEspecie(m.especie),
    foto: m.fotoUrl,
    zona: [ubicacionTexto(m), m.punto].filter(Boolean).join(" · ") || "Sin ubicación",
    senas: m.senas,
    estadoSalud: m.estadoSalud,
    contactoNombre: contacto.nombre,
    contactoTelefono: contacto.telefono,
    urlFicha: `${baseUrl}/mascotas/${m.codigo}`,
  };
}
