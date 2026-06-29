"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useColeccion, useRegistro, crear, actualizar } from "@/lib/db";
import {
  type Cordon,
  type Menor,
  type Turno,
  type Voluntario,
  type RolVoluntario,
  CRITERIOS_PERIMETRO,
  ROLES_VOLUNTARIO,
  voluntariosNecesarios,
  voluntarioApto,
  MINIMO_FACILITADORES,
} from "@/lib/model";
import { ubicacionTexto } from "@/lib/geografia";
import { conteoPorEdad, menoresActivos } from "@/lib/agregados";
import { Pill, TituloSeccion } from "@/components/ui";

export default function FichaCordon() {
  const { id } = useParams<{ id: string }>();
  const { dato: c, cargando } = useRegistro<Cordon>("cordones", id);
  const { datos: menores } = useColeccion<Menor>("menores");
  const { datos: turnos } = useColeccion<Turno>("turnos");
  const { datos: voluntarios } = useColeccion<Voluntario>("voluntarios");
  const [volSel, setVolSel] = useState("");
  const [rolSel, setRolSel] = useState<RolVoluntario>("facilitador");

  if (cargando) return <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">Cargando…</div>;
  if (!c) return <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">Cordón no encontrado. <Link href="/cordones" className="font-bold text-[var(--verde)]">Volver</Link></div>;

  const ninos = menoresActivos(menores).filter((m) => m.cordonId === c.id);
  const turnosActivos = turnos.filter((t) => t.activo && t.cordonId === c.id);
  const necesarios = voluntariosNecesarios(conteoPorEdad(ninos));
  const deficit = Math.max(0, necesarios - turnosActivos.length);
  const aptos = voluntarios.filter(voluntarioApto);
  const enTurnoIds = new Set(turnosActivos.map((t) => t.voluntarioId));
  const disponibles = aptos.filter((v) => !enTurnoIds.has(v.id));

  async function iniciarTurno() {
    if (!volSel || !c) return;
    const v = voluntarios.find((x) => x.id === volSel);
    await crear<Turno>("turnos", { cordonId: c.id, voluntarioId: volSel, inicio: Date.now(), rol: rolSel, activo: true }, {
      accion: "turno.inicio",
      descripcion: `${v?.nombre ?? "Voluntario"} entró de turno en ${c.nombre}`,
    });
    setVolSel("");
  }

  async function cerrarTurno(t: Turno) {
    const v = voluntarios.find((x) => x.id === t.voluntarioId);
    await actualizar<Turno>("turnos", t.id, { activo: false, fin: Date.now() }, {
      accion: "turno.fin",
      descripcion: `${v?.nombre ?? "Voluntario"} salió de turno`,
    });
  }

  async function alternarEstado() {
    if (!c) return;
    await actualizar<Cordon>("cordones", c.id, { estado: c.estado === "activo" ? "cerrado" : "activo" }, {
      accion: "cordon.estado",
      descripcion: `Cordón ${c.nombre} ${c.estado === "activo" ? "cerrado" : "reabierto"}`,
    });
  }

  const cumplePerimetro = CRITERIOS_PERIMETRO.filter((x) => c.perimetro[x.clave]).length;

  return (
    <div>
      <Link href="/cordones" className="text-sm font-semibold text-[var(--verde)] no-underline">← Cordones</Link>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">{c.nombre}</h1>
          <div className="text-sm text-[var(--gris)]">{ubicacionTexto(c)} · {c.punto}</div>
          {c.coordinador && <div className="text-xs text-[var(--gris)]">Coord.: {c.coordinador}</div>}
        </div>
        <Pill tono={c.estado === "activo" ? "verde" : "gris"}>{c.estado}</Pill>
      </div>

      {/* Ratio / cobertura */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black text-[var(--azul)]">{ninos.length}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">niños / cap. {c.capacidad}</div>
        </div>
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black" style={{ color: deficit > 0 ? "var(--rojo)" : "var(--verde-osc)" }}>{turnosActivos.length}/{necesarios}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">en turno</div>
        </div>
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black" style={{ color: cumplePerimetro === CRITERIOS_PERIMETRO.length ? "var(--verde-osc)" : "var(--ambar)" }}>{cumplePerimetro}/{CRITERIOS_PERIMETRO.length}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">perímetro</div>
        </div>
      </div>

      {turnosActivos.length < MINIMO_FACILITADORES && ninos.length > 0 && (
        <div className="mt-3 rounded-xl border border-[var(--rojo)] bg-[var(--rojo-bg)] p-3 text-sm font-semibold text-[var(--rojo)]">
          ⚠ Regla de dos adultos: se requieren al menos {MINIMO_FACILITADORES} facilitadores en turno con niños presentes.
        </div>
      )}

      {/* Turnos */}
      <TituloSeccion>Voluntarios en turno</TituloSeccion>
      <div className="space-y-2">
        {turnosActivos.length === 0 && <div className="tarjeta p-4 text-sm text-[var(--gris)]">Nadie en turno ahora.</div>}
        {turnosActivos.map((t) => {
          const v = voluntarios.find((x) => x.id === t.voluntarioId);
          return (
            <div key={t.id} className="tarjeta flex items-center justify-between p-3">
              <div>
                <div className="font-semibold">{v?.nombre ?? "—"}</div>
                <div className="text-xs text-[var(--gris)]">{ROLES_VOLUNTARIO.find((r) => r.valor === t.rol)?.etiqueta} · desde {new Date(t.inicio).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <button className="btn btn-secundario" onClick={() => cerrarTurno(t)}>Salir</button>
            </div>
          );
        })}
      </div>

      {/* Iniciar turno */}
      <div className="tarjeta mt-3 p-3">
        <div className="mb-2 text-sm font-semibold">Iniciar turno (solo voluntarios aptos)</div>
        {disponibles.length === 0 ? (
          <p className="text-xs text-[var(--gris)]">No hay voluntarios aptos disponibles. <Link href="/voluntarios" className="font-bold text-[var(--verde)]">Gestionar voluntarios →</Link></p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <select className="campo flex-1" value={volSel} onChange={(e) => setVolSel(e.target.value)}>
              <option value="">Elegir voluntario…</option>
              {disponibles.map((v) => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
            <select className="campo" value={rolSel} onChange={(e) => setRolSel(e.target.value as RolVoluntario)}>
              {ROLES_VOLUNTARIO.map((r) => (
                <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
              ))}
            </select>
            <button className="btn btn-primario" disabled={!volSel} onClick={iniciarTurno}>Entrar</button>
          </div>
        )}
      </div>

      {/* Niños en el cordón */}
      <TituloSeccion>Niños en este cordón ({ninos.length})</TituloSeccion>
      <div className="space-y-2">
        {ninos.length === 0 && <div className="tarjeta p-4 text-sm text-[var(--gris)]">Ninguno asignado. Asigna desde la ficha del niño.</div>}
        {ninos.map((m) => (
          <Link key={m.id} href={`/ninos/${m.codigo}`} className="tarjeta flex items-center justify-between p-3 no-underline">
            <span className="font-mono text-sm font-bold text-[var(--tinta)]">{m.codigo}</span>
            <span className="text-sm">{m.alias || "Sin nombre"}</span>
          </Link>
        ))}
      </div>

      <TituloSeccion>Perímetro</TituloSeccion>
      <div className="tarjeta divide-y divide-[var(--linea)]">
        {CRITERIOS_PERIMETRO.map((x) => (
          <div key={x.clave} className="flex items-center gap-2 p-2.5 text-sm">
            <span>{c.perimetro[x.clave] ? "✅" : "⬜"}</span>
            <span className={c.perimetro[x.clave] ? "" : "text-[var(--gris)]"}>{x.etiqueta}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-secundario mt-4 w-full" onClick={alternarEstado}>
        {c.estado === "activo" ? "Cerrar cordón" : "Reabrir cordón"}
      </button>
    </div>
  );
}
