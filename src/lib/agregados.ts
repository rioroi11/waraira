// Waraira — Agregaciones para tableros (conteos, ratios, cobertura).
// Todo lo que se muestra en vistas públicas son AGREGADOS, nunca PII de un menor.

import {
  type Menor,
  type Cordon,
  type Turno,
  type Voluntario,
  type ConteoPorEdad,
  voluntariosNecesarios,
  voluntarioApto,
} from "./model";
import { ESTADOS } from "./geografia";

/** Clasifica a un menor por franja de edad usando la edad estimada (promedio del rango). */
export function franjaEdad(m: Menor): keyof ConteoPorEdad {
  const min = m.edadEstimadaMin ?? m.edadEstimadaMax ?? 6;
  const max = m.edadEstimadaMax ?? m.edadEstimadaMin ?? 6;
  const edad = (min + max) / 2;
  if (edad < 2) return "bebes";
  if (edad < 5) return "pequenos";
  return "mayores";
}

export function conteoPorEdad(menores: Menor[]): ConteoPorEdad {
  const c: ConteoPorEdad = { bebes: 0, pequenos: 0, mayores: 0 };
  for (const m of menores) c[franjaEdad(m)]++;
  return c;
}

/** Solo menores que aún requieren cuido activo (no reunificados). */
export function menoresActivos(menores: Menor[]): Menor[] {
  return menores.filter((m) => m.estadoIDTR !== "reunificado");
}

export interface ResumenEntidad {
  slug: string;
  nombre: string;
  ninos: number;
  cordonesActivos: number;
  voluntariosEnTurno: number;
  voluntariosNecesarios: number;
  deficit: number; // necesarios - en turno (positivo = faltan)
  sinReclamoEnVerificacion: number;
}

export function resumenPorEntidad(
  menores: Menor[],
  cordones: Cordon[],
  turnos: Turno[],
): ResumenEntidad[] {
  const activos = menoresActivos(menores);
  return ESTADOS.map((e) => {
    // Fallback a `parroquia` para datos viejos donde el estado se guardaba ahí.
    const ninosE = activos.filter((m) => (m.entidad ?? m.parroquia) === e.slug);
    const cordonesE = cordones.filter(
      (c) => (c.entidad ?? c.parroquia) === e.slug && c.estado === "activo",
    );
    const cordonIds = new Set(cordonesE.map((c) => c.id));
    const enTurno = turnos.filter((t) => t.activo && cordonIds.has(t.cordonId)).length;
    const necesarios = voluntariosNecesarios(conteoPorEdad(ninosE));
    return {
      slug: e.slug,
      nombre: e.nombre,
      ninos: ninosE.length,
      cordonesActivos: cordonesE.length,
      voluntariosEnTurno: enTurno,
      voluntariosNecesarios: necesarios,
      deficit: Math.max(0, necesarios - enTurno),
      sinReclamoEnVerificacion: ninosE.filter((m) => m.estadoIDTR === "en_verificacion").length,
    };
  });
}

export interface TotalesGlobales {
  ninosActivos: number;
  noAcompanados: number;
  derivados: number;
  reunificados: number;
  cordonesActivos: number;
  voluntariosAptos: number;
  voluntariosEnTurno: number;
  deficitTotal: number;
}

export function totalesGlobales(
  menores: Menor[],
  cordones: Cordon[],
  turnos: Turno[],
  voluntarios: Voluntario[],
): TotalesGlobales {
  const activos = menoresActivos(menores);
  const resumen = resumenPorEntidad(menores, cordones, turnos);
  return {
    ninosActivos: activos.length,
    noAcompanados: activos.filter((m) => m.estatus === "no_acompanado").length,
    derivados: menores.filter((m) => m.estadoIDTR === "derivado_autoridad").length,
    reunificados: menores.filter((m) => m.estadoIDTR === "reunificado").length,
    cordonesActivos: cordones.filter((c) => c.estado === "activo").length,
    voluntariosAptos: voluntarios.filter(voluntarioApto).length,
    voluntariosEnTurno: turnos.filter((t) => t.activo).length,
    deficitTotal: resumen.reduce((s, r) => s + r.deficit, 0),
  };
}
