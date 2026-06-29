"use client";

// Datos de ejemplo para VER el feed funcionando (botón "cargar ejemplos"). Marcados con
// `esEjemplo` para poder quitarlos. Usan ubicaciones REALES tomadas de la geografía.

import { crear, borrar, obtenerTodos } from "./db";
import { ESTADOS } from "./geografia";
import { type Reporte, type Base } from "./model";

const H = 3_600_000;

function ubic(estadoSlug: string, iMun = 0, iParr = 0) {
  const e = ESTADOS.find((x) => x.slug === estadoSlug) ?? ESTADOS[0];
  const m = e.municipios[iMun] ?? e.municipios[0];
  const p = m.parroquias[iParr] ?? m.parroquias[0];
  return { entidad: e.slug, municipio: m.slug, parroquia: p.slug };
}

function tel(): string {
  return "+58424" + Math.floor(1_000_000 + Math.random() * 8_999_999);
}
function ced(): string {
  return "V-" + Math.floor(10_000_000 + Math.random() * 89_999_999);
}

export async function sembrarEjemplos(): Promise<void> {
  const now = Date.now();
  const mk = (over: Partial<Reporte>): Omit<Reporte, keyof Base> =>
    ({
      autorNombre: "Vecino de ejemplo",
      autorTelefono: tel(),
      autorCedula: ced(),
      telefonoVerificado: true,
      ultimaConfirmacion: now,
      vigencia: { tipo: "indefinido" },
      punto: "Plaza",
      esEjemplo: true,
      ...over,
    }) as Omit<Reporte, keyof Base>;

  const items: Omit<Reporte, keyof Base>[] = [
    mk({ tipo: "necesidad", categoria: "agua", descripcion: "Agua potable para 40 personas", cantidad: "40 botellones", estado: "abierta", ...ubic("la-guaira", 0, 0), punto: "Refugio Caraballeda" }),
    mk({ tipo: "oferta", categoria: "carpas", descripcion: "Carpas familiares disponibles", cantidad: "15 carpas", estado: "disponible", vigencia: { tipo: "fecha", hasta: now + 3 * 24 * H }, ...ubic("distrito-capital"), punto: "Galpón Catia" }),
    mk({ tipo: "necesidad", categoria: "comida", descripcion: "Almuerzos calientes", cantidad: "100 platos", estado: "parcial", ultimaConfirmacion: now - 7 * H, ...ubic("miranda"), punto: "Cancha Guarenas" }),
    mk({ tipo: "oferta", categoria: "medicinas", descripcion: "Lote de medicinas básicas", estado: "entregado", confirmadoPor: "receptor", ...ubic("aragua"), punto: "Ambulatorio Maracay" }),
    mk({ tipo: "necesidad", categoria: "colchonetas", descripcion: "Colchonetas para dormir", cantidad: "30", estado: "abastecida", vigencia: { tipo: "fecha", hasta: now + 2 * 24 * H }, confirmadoPor: "dador", ...ubic("carabobo"), punto: "Escuela Valencia" }),
    mk({ tipo: "necesidad", categoria: "agua", descripcion: "Agua (se vuelve a necesitar pronto)", cantidad: "50 botellones", estado: "abastecida", vigencia: { tipo: "fecha", hasta: now - 26 * H }, ultimaConfirmacion: now - 30 * H, ...ubic("la-guaira", 0, 1), punto: "Refugio Macuto" }),
    mk({ tipo: "oferta", categoria: "ropa", descripcion: "Ropa surtida (varios)", detalleRopa: { edad: "varios", talla: "varios", genero: "varios" }, estado: "disponible", telefonoVerificado: false, ...ubic("la-guaira"), punto: "Iglesia Maiquetía" }),
  ];

  for (const it of items) {
    await crear<Reporte>("reportes", it, { accion: "insumo.ejemplo", descripcion: `Ejemplo: ${it.descripcion}` });
  }
}

export async function borrarEjemplos(): Promise<void> {
  const todos = await obtenerTodos<Reporte>("reportes");
  for (const r of todos) if (r.esEjemplo) await borrar("reportes", r.id);
}
