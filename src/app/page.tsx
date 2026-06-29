"use client";

import Link from "next/link";
import { useColeccion } from "@/lib/db";
import { type Menor, type Cordon, type Turno, type Voluntario, type Reporte } from "@/lib/model";
import { resumenPorEntidad, totalesGlobales } from "@/lib/agregados";
import { Pill, TituloSeccion } from "@/components/ui";

function Metrica({ valor, etiqueta, tono = "verde" }: { valor: number | string; etiqueta: string; tono?: string }) {
  const colores: Record<string, string> = {
    verde: "var(--verde-osc)",
    ambar: "var(--ambar)",
    rojo: "var(--rojo)",
    azul: "var(--azul)",
  };
  return (
    <div className="tarjeta p-4">
      <div className="text-3xl font-black leading-none" style={{ color: colores[tono] }}>
        {valor}
      </div>
      <div className="mt-1 text-xs font-semibold text-[var(--gris)]">{etiqueta}</div>
    </div>
  );
}

export default function Inicio() {
  const { datos: menores } = useColeccion<Menor>("menores");
  const { datos: cordones } = useColeccion<Cordon>("cordones");
  const { datos: turnos } = useColeccion<Turno>("turnos");
  const { datos: voluntarios } = useColeccion<Voluntario>("voluntarios");
  const { datos: reportes } = useColeccion<Reporte>("reportes");

  const t = totalesGlobales(menores, cordones, turnos, voluntarios);
  const resumen = resumenPorEntidad(menores, cordones, turnos).filter(
    (r) => r.ninos > 0 || r.cordonesActivos > 0,
  );
  const insumosAbiertos = reportes.filter(
    (r) => r.tipo === "necesidad" && (r.estado === "abierta" || r.estado === "parcial"),
  ).length;

  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-[var(--verde-osc)]">Tablero · Venezuela</div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Coordinación en vivo</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Vista pública: solo conteos agregados. La identidad de cada niño está protegida.
      </p>

      {/* Métricas globales */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metrica valor={t.ninosActivos} etiqueta="Niños bajo cuido" />
        <Metrica valor={t.noAcompanados} etiqueta="No acompañados" tono="ambar" />
        <Metrica valor={t.cordonesActivos} etiqueta="Cordones activos" tono="azul" />
        <Metrica valor={t.deficitTotal} etiqueta="Voluntarios faltantes" tono={t.deficitTotal > 0 ? "rojo" : "verde"} />
      </div>

      {/* Acciones rápidas */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link href="/ninos/nuevo" className="btn btn-primario">＋ Censar niño</Link>
        <Link href="/reunificacion" className="btn btn-secundario">🤝 Reunificación</Link>
        <Link href="/cordones/nuevo" className="btn btn-secundario">🛡 Nuevo cordón</Link>
        <Link href="/voluntarios" className="btn btn-secundario">👥 Voluntarios</Link>
        <Link href="/insumos" className="btn btn-secundario">📦 Insumos {insumosAbiertos > 0 ? `(${insumosAbiertos})` : ""}</Link>
        <Link href="/brazaletes" className="btn btn-secundario">🏷 Brazaletes</Link>
      </div>

      {/* Cobertura por estado */}
      <TituloSeccion>Cobertura por estado</TituloSeccion>
      {resumen.length === 0 ? (
        <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">
          Aún no hay registros. Empieza por <Link href="/ninos/nuevo" className="font-bold text-[var(--verde)]">censar un niño</Link> o
          {" "}<Link href="/cordones/nuevo" className="font-bold text-[var(--verde)]">crear un cordón</Link>.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--linea)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--verde-claro)] text-left text-[11px] uppercase tracking-wide text-[var(--verde-osc)]">
              <tr>
                <th className="px-3 py-2 font-bold">Estado</th>
                <th className="px-3 py-2 text-center font-bold">Niños</th>
                <th className="px-3 py-2 text-center font-bold">Cordones</th>
                <th className="px-3 py-2 text-center font-bold">En turno</th>
                <th className="px-3 py-2 text-center font-bold">Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {resumen.map((r) => (
                <tr key={r.slug} className="border-t border-[var(--linea)] bg-[var(--blanco)]">
                  <td className="px-3 py-2.5 font-semibold text-[var(--tinta)]">{r.nombre}</td>
                  <td className="px-3 py-2.5 text-center">{r.ninos}</td>
                  <td className="px-3 py-2.5 text-center">{r.cordonesActivos}</td>
                  <td className="px-3 py-2.5 text-center">
                    {r.voluntariosEnTurno}/{r.voluntariosNecesarios}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {r.deficit > 0 ? (
                      <Pill tono="rojo">faltan {r.deficit}</Pill>
                    ) : r.ninos > 0 ? (
                      <Pill tono="verde">cubierto</Pill>
                    ) : (
                      <Pill tono="gris">—</Pill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-[var(--gris)]">
        Cálculo conmensurable: los voluntarios necesarios salen de los ratios CFS por edad
        (bebés 1:4, 2–4 años 2:15, mayores 1:18) con mínimo de 2 adultos por cordón.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <a href="/resumen.html" target="_blank" rel="noreferrer" className="font-bold text-[var(--verde)]">📄 Resumen ejecutivo</a>
        <span className="text-[var(--gris)]">·</span>
        <a href="/modulos/flujos/index.html" target="_blank" rel="noreferrer" className="font-bold text-[var(--verde)]">📘 Flujos diagramados</a>
        <span className="text-[var(--gris)]">·</span>
        <a href="/modulos/voluntariado.html" target="_blank" rel="noreferrer" className="font-bold text-[var(--verde)]">Plan de voluntariado</a>
      </div>
    </div>
  );
}
