"use client";

import Link from "next/link";
import { useState } from "react";
import { useColeccion } from "@/lib/db";
import { type Cordon, type Menor, type Turno, voluntariosNecesarios } from "@/lib/model";
import { ESTADOS, ubicacionTexto } from "@/lib/geografia";
import { conteoPorEdad, menoresActivos } from "@/lib/agregados";
import { Pill } from "@/components/ui";

export default function ListaCordones() {
  const { datos: cordones } = useColeccion<Cordon>("cordones");
  const { datos: menores } = useColeccion<Menor>("menores");
  const { datos: turnos } = useColeccion<Turno>("turnos");
  const activos = menoresActivos(menores);
  const [filtroEntidad, setFiltroEntidad] = useState("");

  const visibles = filtroEntidad
    ? cordones.filter((c) => c.entidad === filtroEntidad)
    : cordones;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Cordones de cuido</h1>
        <Link href="/cordones/nuevo" className="btn btn-primario">＋ Nuevo</Link>
      </div>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Espacios seguros (CFS). Mínimo 2 facilitadores siempre; máx. 125 niños por turno.
      </p>

      <div className="mt-4">
        <select
          value={filtroEntidad}
          onChange={(e) => setFiltroEntidad(e.target.value)}
          className="campo w-full"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((es) => (
            <option key={es.slug} value={es.slug}>{es.nombre}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {visibles.length === 0 ? (
          <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">
            No hay cordones. <Link href="/cordones/nuevo" className="font-bold text-[var(--verde)]">Crea el primero</Link>.
          </div>
        ) : (
          visibles
            .sort((a, b) => Number(b.estado === "activo") - Number(a.estado === "activo"))
            .map((c) => {
              const ninos = activos.filter((m) => m.cordonId === c.id);
              const enTurno = turnos.filter((t) => t.activo && t.cordonId === c.id).length;
              const necesarios = voluntariosNecesarios(conteoPorEdad(ninos));
              const deficit = Math.max(0, necesarios - enTurno);
              return (
                <Link key={c.id} href={`/cordones/${c.id}`} className="tarjeta block p-3 no-underline transition hover:border-[var(--verde)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[var(--tinta)]">{c.nombre}</span>
                    <Pill tono={c.estado === "activo" ? "verde" : "gris"}>{c.estado}</Pill>
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--gris)]">{ubicacionTexto(c)} · {c.punto}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill tono="azul">{ninos.length} niños</Pill>
                    <Pill tono={deficit > 0 ? "rojo" : "verde"}>{enTurno}/{necesarios} voluntarios</Pill>
                    {deficit > 0 && <Pill tono="rojo">faltan {deficit}</Pill>}
                  </div>
                </Link>
              );
            })
        )}
      </div>
    </div>
  );
}
