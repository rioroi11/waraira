// Waraira — Lógica de dominio del módulo de Insumos / ayudas civiles.
//
// Mata el rumor (caso "70 carpas"): toda oferta/necesidad va identificada (R5), ubicada,
// con estado en vivo y con una red de reconfirmación. Aquí viven las reglas puras
// (sin React, sin IndexedDB) para poder razonarlas y probarlas aparte de la UI.

import {
  type Reporte,
  type TipoReporte,
  type EstadoReporte,
  type Vigencia,
  MS_RECONFIRMAR,
  esCubiertoPorCompleto,
} from "./model";
import { mismaZona } from "./geografia";

// ───────────────────────────── Vigencia (caducidad por fecha) ─────────────────────────────

/** ¿La vigencia por fecha de un reporte ya pasó respecto a `ahora`? */
export function vigenciaVencida(r: Reporte, ahora: number): boolean {
  return r.vigencia?.tipo === "fecha" && r.vigencia.hasta <= ahora;
}

/**
 * Estado EFECTIVO según la vigencia (sin mutar el registro; se deriva al leer, así funciona
 * offline sin tareas en segundo plano):
 *  - Necesidad ABASTECIDA cuya fecha venció → REABRE sola ("abierta"): mañana vuelve a faltar.
 *  - El resto conserva su estado almacenado.
 */
export function estadoEfectivo(r: Reporte, ahora: number): EstadoReporte {
  if (r.tipo === "necesidad" && r.estado === "abastecida" && vigenciaVencida(r, ahora)) {
    return "abierta";
  }
  return r.estado;
}

/**
 * ¿El reporte sigue VIVO en el tablero activo?
 *  - Una necesidad "cerrada" sale (R4: cerrar libera).
 *  - Una oferta cuya vigencia por fecha venció sale del tablero (queda en el historial/feed).
 *  - Una oferta "entregada" sale del tablero activo (ya cumplió).
 */
export function enTableroActivo(r: Reporte, ahora: number): boolean {
  if (r.tipo === "necesidad") return r.estado !== "cerrada";
  // oferta
  if (r.estado === "entregado") return false;
  if (vigenciaVencida(r, ahora)) return false;
  return true;
}

// ───────────────────────────── Reconfirmación anti-rumor (6 h) ─────────────────────────────

/** Horas transcurridas desde la última confirmación. */
export function horasSinConfirmar(r: Reporte, ahora: number): number {
  return Math.max(0, (ahora - (r.ultimaConfirmacion ?? r.updatedAt)) / 3_600_000);
}

/**
 * ¿Toca pedir reconfirmación? (pasaron ≥6 h y el reporte sigue requiriendo atención —
 * no aplica a lo cerrado/entregado ni a lo cubierto por completo).
 */
export function necesitaReconfirmar(r: Reporte, ahora: number): boolean {
  // Se evalúa contra el estado EFECTIVO: una necesidad abastecida que reabrió por vigencia
  // vencida vuelve a "abierta" y SÍ debe pedir reconfirmación (es justo la info que envejece).
  if (!enTableroActivo(r, ahora)) return false; // cerrada / entregada / oferta fuera de vigencia
  if (esCubiertoPorCompleto(estadoEfectivo(r, ahora))) return false; // cubierto por completo vigente
  return ahora - (r.ultimaConfirmacion ?? r.updatedAt) >= MS_RECONFIRMAR;
}

// Mensaje que se le muestra al dueño cuando se le pide reconfirmar.
export const MENSAJE_RECONFIRMAR =
  "Te pedimos reconfirmar para volver a avisar a todos los usuarios — así nadie actúa sobre información vieja.";

// Una necesidad REACTIVADA (ya fue abastecida y reabrió por vigencia vencida) que pasa este
// tiempo sin reconfirmar se mueve a la pestaña "sin verificar".
export const HORAS_REACTIVADA_LIMITE = 24;

/**
 * ¿Es una necesidad reactivada (abastecida una vez → reabrió por fecha) que lleva ≥24 h sin
 * reconfirmar desde que reabrió? Estas bajan a "sin verificar" (decisión de la dueña).
 */
export function reactivadaSinConfirmar(r: Reporte, ahora: number): boolean {
  if (r.tipo !== "necesidad") return false;
  if (r.estado !== "abastecida") return false; // fue abastecida en una primera oportunidad
  if (r.vigencia?.tipo !== "fecha") return false;
  const reabrioEn = r.vigencia.hasta;
  if (ahora < reabrioEn) return false; // aún no reabre
  if ((r.ultimaConfirmacion ?? 0) >= reabrioEn) return false; // ya se reconfirmó tras reabrir
  return ahora - reabrioEn >= HORAS_REACTIVADA_LIMITE * 3_600_000;
}

// ───────────────────────────── Feed de actualizaciones (estados) ─────────────────────────────

/**
 * Feed estilo "estados / historias": las actualizaciones ordenadas de las MÁS ANTIGUAS a las
 * MÁS NUEVAS (lo viejo no queda enterrado; reconfirmar/publicar pone hora nueva y baja al final).
 * Se separa por verificación de teléfono: el campo `telefonoVerificado` decide la pestaña.
 */
export function feedOrdenado(reportes: Reporte[], ahora: number): Reporte[] {
  return reportes
    .filter((r) => enTableroActivo(r, ahora))
    .slice()
    .sort((a, b) => (a.updatedAt ?? a.createdAt) - (b.updatedAt ?? b.createdAt));
}

export function separarPorVerificacion(
  reportes: Reporte[],
  ahora: number,
): {
  verificados: Reporte[];
  sinVerificar: Reporte[];
} {
  const verificados: Reporte[] = [];
  const sinVerificar: Reporte[] = [];
  for (const r of reportes) {
    // "Sin verificar" = teléfono sin verificar, O necesidad reactivada sin reconfirmar en 24 h.
    const va = !r.telefonoVerificado || reactivadaSinConfirmar(r, ahora);
    (va ? sinVerificar : verificados).push(r);
  }
  return { verificados, sinVerificar };
}

// ───────────────────────────── Balance por tipo ─────────────────────────────

export function balance(reportes: Reporte[], ahora: number): {
  necesidades: number;
  ofertas: number;
  cubiertos: number;
} {
  let necesidades = 0;
  let ofertas = 0;
  let cubiertos = 0;
  for (const r of reportes) {
    const ef = estadoEfectivo(r, ahora);
    // "Cubierto por completo" cuenta en ambos ciclos (necesidad abastecida y oferta entregada),
    // aunque la oferta entregada ya no esté en el tablero activo.
    if (esCubiertoPorCompleto(ef)) {
      cubiertos++;
      continue;
    }
    if (!enTableroActivo(r, ahora)) continue;
    if (r.tipo === "necesidad") necesidades++;
    else ofertas++;
  }
  return { necesidades, ofertas, cubiertos };
}

// ───────────────────────────── Texto: normalización y similitud ─────────────────────────────

const STOPWORDS = new Set([
  "de", "la", "el", "en", "y", "los", "las", "un", "una", "para", "con", "del", "al",
  "hay", "tengo", "necesito", "se", "que", "por",
]);

export function normalizar(s: string): string {
  return (s ?? "")
    .toLowerCase()
    .replace(/ñ/g, "\u0001") // protege la ñ antes de quitar acentos (NFD la descompondría a "n")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos combinantes
    .replace(/\u0001/g, "ñ")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(
    normalizar(s)
      .split(" ")
      .filter((t) => t.length > 2 && !STOPWORDS.has(t)),
  );
}

/** Similitud Jaccard de tokens (0..1). */
export function similitudTexto(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

// ───────────────────────────── Deduplicación (enlace de info) ─────────────────────────────

const UMBRAL_SIMILITUD = 0.34;

interface BorradorDedup {
  tipo: TipoReporte;
  categoria: string;
  descripcion: string;
  entidad: string;
  municipio: string;
  parroquia: string;
  lat?: number;
  lng?: number;
}

/**
 * Candidatos a "es la misma": mismo tipo y categoría, en la misma zona (parroquia/sector o
 * GPS cercano) y con descripción parecida. Siempre activo en el flujo de publicar (§3.7):
 * si la persona confirma, su aporte se ENLAZA a la entrada existente en vez de duplicar.
 */
export function buscarSimilares(
  borrador: BorradorDedup,
  reportes: Reporte[],
  ahora: number,
): Reporte[] {
  return reportes
    .filter(
      (r) =>
        r.tipo === borrador.tipo &&
        r.categoria === borrador.categoria &&
        enTableroActivo(r, ahora) &&
        mismaZona(
          { entidad: r.entidad, municipio: r.municipio, parroquia: r.parroquia, lat: r.lat, lng: r.lng },
          {
            entidad: borrador.entidad,
            municipio: borrador.municipio,
            parroquia: borrador.parroquia,
            lat: borrador.lat,
            lng: borrador.lng,
          },
        ) &&
        similitudTexto(r.descripcion, borrador.descripcion) >= UMBRAL_SIMILITUD,
    )
    .sort(
      (a, b) =>
        similitudTexto(b.descripcion, borrador.descripcion) -
        similitudTexto(a.descripcion, borrador.descripcion),
    );
}

// ───────────────────────────── Matching necesidad ↔ oferta ─────────────────────────────

/**
 * Contrapartes sugeridas para un reporte: del TIPO OPUESTO, misma categoría, misma zona y
 * activas. Solo SUGERENCIA — la persona coordina; el sistema nunca asigna solo (R6 admite
 * cumplimiento parcial entre varias contrapartes).
 */
export function sugerirContrapartes(r: Reporte, reportes: Reporte[], ahora: number): Reporte[] {
  const opuesto: TipoReporte = r.tipo === "necesidad" ? "oferta" : "necesidad";
  return reportes.filter(
    (o) =>
      o.id !== r.id &&
      o.tipo === opuesto &&
      o.categoria === r.categoria &&
      enTableroActivo(o, ahora) &&
      !esCubiertoPorCompleto(estadoEfectivo(o, ahora)) &&
      mismaZona(
        { entidad: r.entidad, municipio: r.municipio, parroquia: r.parroquia, lat: r.lat, lng: r.lng },
        { entidad: o.entidad, municipio: o.municipio, parroquia: o.parroquia, lat: o.lat, lng: o.lng },
      ),
  );
}

// ───────────────────────────── Etiquetas de vigencia ─────────────────────────────

export function etiquetaVigencia(v: Vigencia | undefined): string {
  if (!v || v.tipo === "indefinido") return "Sin fecha tope";
  const f = new Date(v.hasta);
  return `Hasta ${f.toLocaleDateString("es-VE", { day: "2-digit", month: "short" })}`;
}

/** Hora corta y legible para el feed ("hoy 3:40 p. m." / "ayer" / fecha). */
export function horaCorta(ms: number, ahora: number): string {
  const d = new Date(ms);
  const hhmm = d.toLocaleTimeString("es-VE", { hour: "numeric", minute: "2-digit" });
  const unDia = 86_400_000;
  const hoy0 = new Date(ahora);
  hoy0.setHours(0, 0, 0, 0);
  if (ms >= hoy0.getTime()) return `hoy ${hhmm}`;
  if (ms >= hoy0.getTime() - unDia) return `ayer ${hhmm}`;
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "short" }) + ` ${hhmm}`;
}

/** Enlace a mapa para un punto con GPS (abre en la app de mapas del teléfono). */
export function enlaceMapa(lat?: number, lng?: number): string | null {
  if (lat == null || lng == null) return null;
  return `https://maps.google.com/?q=${lat},${lng}`;
}
