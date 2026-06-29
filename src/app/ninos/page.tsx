"use client";

import Link from "next/link";
import { useState } from "react";
import { useColeccion } from "@/lib/db";
import { type Menor, ESTATUS_MENOR, ESTADOS_IDTR } from "@/lib/model";
import { ESTADOS, ubicacionTexto } from "@/lib/geografia";
import { Pill } from "@/components/ui";

const etiquetaEstatus = (v: string) => ESTATUS_MENOR.find((e) => e.valor === v)?.etiqueta ?? v;
const etiquetaIDTR = (v: string) => ESTADOS_IDTR.find((e) => e.valor === v)?.etiqueta ?? v;

function tonoIDTR(estado: string): "verde" | "ambar" | "rojo" | "azul" | "gris" {
  if (estado === "reunificado") return "verde";
  if (estado === "derivado_autoridad") return "azul";
  if (estado === "en_verificacion") return "ambar";
  if (estado === "identificado") return "rojo";
  return "gris";
}

export default function ListaNinos() {
  const { datos: menores, cargando } = useColeccion<Menor>("menores");
  const [entidad, setEntidad] = useState("");
  const [q, setQ] = useState("");

  const filtrados = menores
    .filter((m) => (entidad ? m.entidad === entidad : true))
    .filter((m) => {
      if (!q) return true;
      const t = q.toLowerCase();
      return (
        m.codigo.toLowerCase().includes(t) ||
        (m.alias ?? "").toLowerCase().includes(t) ||
        (m.lugarHallazgo ?? "").toLowerCase().includes(t)
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Niños</h1>
        <Link href="/ninos/nuevo" className="btn btn-primario">＋ Censar</Link>
      </div>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Capa restringida. Se muestra el código del brazalete y el apodo, no la identidad.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input className="campo" placeholder="Buscar por código, apodo o lugar…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="campo" value={entidad} onChange={(e) => setEntidad(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.slug} value={e.slug}>{e.nombre}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {cargando ? (
          <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">Cargando…</div>
        ) : filtrados.length === 0 ? (
          <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">
            No hay niños registrados con ese filtro.
          </div>
        ) : (
          filtrados.map((m) => (
            <Link
              key={m.id}
              href={`/ninos/${m.codigo}`}
              className="tarjeta flex items-center gap-3 p-3 no-underline transition hover:border-[var(--verde)]"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--verde-claro)] text-xs font-black text-[var(--verde-osc)]">
                {m.codigo.replace("WRA-", "")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--tinta)]">{m.alias || "Sin nombre aún"}</span>
                  <Pill tono="gris">{etiquetaEstatus(m.estatus)}</Pill>
                </div>
                <div className="truncate text-xs text-[var(--gris)]">
                  {ubicacionTexto(m)}
                  {m.edadEstimadaMin != null && ` · ${m.edadEstimadaMin}–${m.edadEstimadaMax ?? m.edadEstimadaMin} años`}
                  {m.lugarHallazgo && ` · ${m.lugarHallazgo}`}
                </div>
              </div>
              <Pill tono={tonoIDTR(m.estadoIDTR)}>{etiquetaIDTR(m.estadoIDTR)}</Pill>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
