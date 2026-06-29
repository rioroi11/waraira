"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useColeccion, crear, actualizar } from "@/lib/db";
import {
  type Menor,
  type Reclamo,
  PUNTOS_COINCIDENCIA,
  MIN_PUNTOS_COINCIDENCIA,
  ESTADOS_RECLAMO,
  faltantesReclamo,
} from "@/lib/model";
import { menoresActivos } from "@/lib/agregados";
import { Campo, Area, Selector, TituloSeccion, Pill } from "@/components/ui";

function tonoReclamo(e: string): "verde" | "ambar" | "rojo" | "azul" {
  if (e === "aprobado_por_autoridad") return "verde";
  if (e === "rechazado") return "rojo";
  if (e === "en_verificacion") return "ambar";
  return "azul";
}

export default function Reunificacion() {
  const { datos: menores } = useColeccion<Menor>("menores");
  const { datos: reclamos } = useColeccion<Reclamo>("reclamos");
  const [menorFoco, setMenorFoco] = useState("");

  // Form de nuevo reclamo
  const [menorId, setMenorId] = useState("");
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [documento, setDocumento] = useState("");
  const [relacion, setRelacion] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("menor");
    if (id) {
      setMenorFoco(id);
      setMenorId(id);
    }
  }, []);

  const candidatos = menoresActivos(menores);
  const menorDe = (id: string) => menores.find((m) => m.id === id);

  // Alerta anti-suplantación: mismo reclamante en otro niño.
  const reclamanteRepetido = nombre.trim().length > 2 &&
    reclamos.some((r) => r.reclamanteNombre.trim().toLowerCase() === nombre.trim().toLowerCase() && r.menorId !== menorId);

  async function crearReclamo() {
    if (!menorId || !nombre || !relacion) return;
    const m = menorDe(menorId);
    await crear<Reclamo>("reclamos", {
      menorId,
      reclamanteNombre: nombre,
      reclamanteContacto: contacto || undefined,
      reclamanteDocumento: documento || undefined,
      relacionAlegada: relacion,
      puntosCoincidencia: [],
      entrevistaNino: false,
      estado: "recibido",
    }, { accion: "reclamo.creado", descripcion: `Reclamo de ${nombre} (${relacion}) sobre ${m?.codigo}` });
    if (m && m.estadoIDTR === "identificado") {
      await actualizar<Menor>("menores", m.id, { estadoIDTR: "en_verificacion" });
    }
    setNombre(""); setContacto(""); setDocumento(""); setRelacion("");
  }

  const reclamosOrdenados = [...reclamos].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Reunificación familiar</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Ningún niño se entrega solo con la app. Toda reunificación exige verificación + autorización
        de la autoridad. Waraira deriva al Consejo de Protección / Tribunal.
      </p>

      {/* Nuevo reclamo */}
      <TituloSeccion>Iniciar reclamo de un familiar</TituloSeccion>
      <div className="tarjeta space-y-3 p-4">
        <Selector label="¿Sobre qué niño? *" value={menorId} onChange={(e) => setMenorId(e.target.value)}>
          <option value="">Selecciona…</option>
          {candidatos.map((m) => (
            <option key={m.id} value={m.id}>{m.codigo} · {m.alias || "sin nombre"}</option>
          ))}
        </Selector>
        <Campo label="Nombre de quien reclama *" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        {reclamanteRepetido && (
          <div className="rounded-lg border border-[var(--rojo)] bg-[var(--rojo-bg)] p-2.5 text-xs font-semibold text-[var(--rojo)]">
            ⚠ Alerta anti-trata: esta persona ya reclama a otro niño. Escala y verifica con extremo cuidado.
          </div>
        )}
        <Campo label="Relación alegada *" placeholder="madre, tío, abuela…" value={relacion} onChange={(e) => setRelacion(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Contacto" value={contacto} onChange={(e) => setContacto(e.target.value)} />
          <Campo label="Documento" value={documento} onChange={(e) => setDocumento(e.target.value)} />
        </div>
        <button className="btn btn-primario w-full" disabled={!menorId || !nombre || !relacion} onClick={crearReclamo}>
          Registrar reclamo (queda en verificación)
        </button>
      </div>

      {/* Reclamos en curso */}
      <TituloSeccion>Reclamos {menorFoco && menorDe(menorFoco) ? `· ${menorDe(menorFoco)!.codigo}` : "en curso"}</TituloSeccion>
      <div className="space-y-3">
        {reclamosOrdenados.length === 0 && <div className="tarjeta p-4 text-sm text-[var(--gris)]">Sin reclamos todavía.</div>}
        {reclamosOrdenados
          .filter((r) => (menorFoco ? r.menorId === menorFoco : true))
          .map((r) => (
            <TarjetaReclamo key={r.id} reclamo={r} menor={menorDe(r.menorId)} />
          ))}
      </div>
      {menorFoco && (
        <button className="btn btn-secundario mt-3 w-full" onClick={() => setMenorFoco("")}>Ver todos los reclamos</button>
      )}
    </div>
  );
}

function TarjetaReclamo({ reclamo: r, menor }: { reclamo: Reclamo; menor?: Menor }) {
  const [abierto, setAbierto] = useState(false);
  const [autoridad, setAutoridad] = useState(r.autorizadoPor ?? "");
  const faltan = faltantesReclamo(r);

  async function alternarPunto(clave: string, on: boolean) {
    const set = new Set(r.puntosCoincidencia);
    if (on) set.add(clave); else set.delete(clave);
    await actualizar<Reclamo>("reclamos", r.id, { puntosCoincidencia: [...set] });
  }
  async function set<K extends keyof Reclamo>(campo: K, valor: Reclamo[K]) {
    await actualizar<Reclamo>("reclamos", r.id, { [campo]: valor } as Partial<Reclamo>);
  }
  async function aprobar() {
    const faltaAhora = faltantesReclamo({ ...r, autorizadoPor: autoridad || r.autorizadoPor });
    if (faltaAhora.length > 0) { alert("Falta:\n• " + faltaAhora.join("\n• ")); return; }
    await actualizar<Reclamo>("reclamos", r.id, { estado: "aprobado_por_autoridad", autorizadoPor: autoridad }, {
      accion: "reclamo.aprobado",
      descripcion: `Reclamo sobre ${menor?.codigo} APROBADO por ${autoridad}`,
    });
  }
  async function rechazar() {
    await actualizar<Reclamo>("reclamos", r.id, { estado: "rechazado" }, {
      accion: "reclamo.rechazado",
      descripcion: `Reclamo sobre ${menor?.codigo} rechazado`,
    });
  }

  return (
    <div className="tarjeta p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-[var(--tinta)]">{r.reclamanteNombre}</div>
          <div className="text-xs text-[var(--gris)]">
            {r.relacionAlegada} · {menor ? <Link href={`/ninos/${menor.codigo}`} className="font-mono font-bold text-[var(--verde)]">{menor.codigo}</Link> : "—"}
          </div>
        </div>
        <Pill tono={tonoReclamo(r.estado)}>{ESTADOS_RECLAMO.find((e) => e.valor === r.estado)?.etiqueta}</Pill>
      </div>

      {r.estado !== "aprobado_por_autoridad" && r.estado !== "rechazado" && (
        <>
          <button className="mt-2 text-sm font-semibold text-[var(--verde)]" onClick={() => setAbierto((x) => !x)}>
            {abierto ? "Ocultar verificación ▲" : `Verificar (${faltan.length} pendiente${faltan.length === 1 ? "" : "s"}) ▼`}
          </button>
          {abierto && (
            <div className="mt-2 space-y-3 border-t border-[var(--linea)] pt-3">
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--gris)]">Puntos de coincidencia (≥{MIN_PUNTOS_COINCIDENCIA})</div>
                <div className="space-y-1">
                  {PUNTOS_COINCIDENCIA.map((p) => (
                    <label key={p.clave} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4 accent-[var(--verde)]" checked={r.puntosCoincidencia.includes(p.clave)} onChange={(e) => alternarPunto(p.clave, e.target.checked)} />
                      {p.etiqueta}
                    </label>
                  ))}
                </div>
              </div>
              <Area label="¿Qué detalles privados acertó?" value={r.pruebaDetallesPrivados ?? ""} onChange={(e) => set("pruebaDetallesPrivados", e.target.value)} />
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" className="h-4 w-4 accent-[var(--verde)]" checked={r.entrevistaNino} onChange={(e) => set("entrevistaNino", e.target.checked)} />
                Se entrevistó al niño
              </label>
              {r.entrevistaNino && (
                <div className="flex gap-2">
                  <button className="btn btn-secundario flex-1" style={{ borderColor: r.ninoReconoce === true ? "var(--verde)" : undefined }} onClick={() => set("ninoReconoce", true)}>El niño reconoce ✓</button>
                  <button className="btn btn-secundario flex-1" style={{ borderColor: r.ninoReconoce === false ? "var(--rojo)" : undefined }} onClick={() => set("ninoReconoce", false)}>No reconoce ✕</button>
                </div>
              )}
              <Campo label="Firma — quien entrega" value={r.firmaEntrega ?? ""} onChange={(e) => set("firmaEntrega", e.target.value)} />
              <Campo label="Firma — quien recibe" value={r.firmaRecibe ?? ""} onChange={(e) => set("firmaRecibe", e.target.value)} />
              <Campo label="Firma — testigo" value={r.firmaTestigo ?? ""} onChange={(e) => set("firmaTestigo", e.target.value)} />
              <Campo label="Autoridad que autoriza" placeholder="Consejo de Protección / Tribunal" value={autoridad} onChange={(e) => setAutoridad(e.target.value)} />

              {faltan.length > 0 ? (
                <div className="rounded-lg bg-[var(--ambar-bg)] p-2.5 text-xs font-semibold text-[var(--ambar)]">
                  Falta para aprobar: {faltan.join("; ")}
                </div>
              ) : (
                <div className="rounded-lg bg-[var(--verde-claro)] p-2.5 text-xs font-semibold text-[var(--verde-osc)]">
                  Verificación completa. Puede aprobarse con autorización de la autoridad.
                </div>
              )}
              <div className="flex gap-2">
                <button className="btn btn-peligro flex-1" onClick={rechazar}>Rechazar</button>
                <button className="btn btn-primario flex-1" onClick={aprobar}>Aprobar (autoridad)</button>
              </div>
            </div>
          )}
        </>
      )}

      {r.estado === "aprobado_por_autoridad" && (
        <div className="mt-2 text-xs text-[var(--verde-osc)]">
          Aprobado por {r.autorizadoPor}. Ya puedes marcar al niño como <b>reunificado</b> en su ficha.
        </div>
      )}
    </div>
  );
}
