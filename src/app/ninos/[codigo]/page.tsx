"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useColeccion, actualizar } from "@/lib/db";
import {
  type Menor,
  type Reclamo,
  type Cordon,
  type EstadoIDTR,
  ESTATUS_MENOR,
  ESTADOS_IDTR,
  TRANSICIONES_IDTR,
  puedeReunificar,
} from "@/lib/model";
import { ubicacionTexto } from "@/lib/geografia";
import { Pill, TituloSeccion, Area } from "@/components/ui";

const etiquetaEstatus = (v: string) => ESTATUS_MENOR.find((e) => e.valor === v)?.etiqueta ?? v;
const etiquetaIDTR = (v: string) => ESTADOS_IDTR.find((e) => e.valor === v)?.etiqueta ?? v;

function Dato({ label, valor }: { label: string; valor?: string | number | null }) {
  if (valor == null || valor === "") return null;
  return (
    <div className="border-t border-[var(--linea)] py-2">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--gris)]">{label}</div>
      <div className="text-sm text-[var(--tinta)]">{valor}</div>
    </div>
  );
}

export default function FichaNino() {
  const params = useParams<{ codigo: string }>();
  const codigo = decodeURIComponent(params.codigo);
  const { datos: menores, cargando } = useColeccion<Menor>("menores");
  const { datos: reclamos } = useColeccion<Reclamo>("reclamos");
  const { datos: cordones } = useColeccion<Cordon>("cordones");
  const m = menores.find((x) => x.codigo === codigo);

  const [esNuevo, setEsNuevo] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [detalles, setDetalles] = useState("");
  const [cuido, setCuido] = useState("");
  const [notaConsejo, setNotaConsejo] = useState("");

  useEffect(() => {
    setEsNuevo(new URLSearchParams(window.location.search).get("nuevo") === "1");
  }, []);

  useEffect(() => {
    if (m?.fotoBlob) {
      const url = URL.createObjectURL(m.fotoBlob);
      setFotoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFotoUrl(null);
  }, [m?.fotoBlob]);

  useEffect(() => {
    if (m) {
      setDetalles(m.detallesPrivados ?? "");
      setCuido(m.cuidoActual ?? "");
    }
  }, [m?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const reclamoAprobado = useMemo(
    () => reclamos.some((r) => r.menorId === m?.id && r.estado === "aprobado_por_autoridad"),
    [reclamos, m?.id],
  );

  if (cargando) return <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">Cargando…</div>;
  if (!m)
    return (
      <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">
        No se encontró el código {codigo}. <Link href="/ninos" className="font-bold text-[var(--verde)]">Volver</Link>
      </div>
    );

  const [puedeReun, faltanReun] = puedeReunificar(m, reclamoAprobado);
  const transiciones = TRANSICIONES_IDTR[m.estadoIDTR];

  async function cambiarEstado(nuevo: EstadoIDTR) {
    if (!m) return;
    if (nuevo === "reunificado" && !puedeReun) {
      alert("No se puede marcar reunificado:\n\n• " + faltanReun.join("\n• "));
      return;
    }
    await actualizar<Menor>("menores", m.id, { estadoIDTR: nuevo }, {
      accion: "menor.estado",
      descripcion: `Menor ${m.codigo}: ${etiquetaIDTR(m.estadoIDTR)} → ${etiquetaIDTR(nuevo)}`,
    });
  }

  async function notificarConsejo() {
    if (!m) return;
    await actualizar<Menor>(
      "menores",
      m.id,
      { notificadoConsejo: Date.now(), notificadoConsejoNota: notaConsejo || undefined, estadoIDTR: "derivado_autoridad" },
      { accion: "menor.notificado_consejo", descripcion: `Menor ${m.codigo} notificado al Consejo de Protección` },
    );
  }

  async function guardarDetalles() {
    if (!m) return;
    await actualizar<Menor>("menores", m.id, { detallesPrivados: detalles, cuidoActual: cuido });
  }

  async function asignarCordon(cordonId: string) {
    if (!m) return;
    const c = cordones.find((x) => x.id === cordonId);
    await actualizar<Menor>("menores", m.id, { cordonId: cordonId || undefined }, {
      accion: "menor.cordon",
      descripcion: `Menor ${m.codigo} ${cordonId ? `asignado a ${c?.nombre}` : "sin cordón"}`,
    });
  }

  return (
    <div>
      {esNuevo && (
        <div className="mb-4 rounded-xl border-2 border-[var(--verde)] bg-[var(--verde-claro)] p-4 text-center">
          <div className="text-sm font-bold text-[var(--verde-osc)]">Niño registrado ✓</div>
          <div className="mt-1 text-xs text-[var(--verde-osc)]">Escribe este código en su brazalete:</div>
          <div className="mt-1 font-mono text-3xl font-black tracking-widest text-[var(--verde-osc)]">{m.codigo}</div>
        </div>
      )}

      <Link href="/ninos" className="text-sm font-semibold text-[var(--verde)] no-underline">← Niños</Link>

      <div className="mt-2 flex items-start gap-3">
        {fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-xl bg-[var(--verde-claro)] font-mono text-sm font-black text-[var(--verde-osc)]">
            {m.codigo.replace("WRA-", "")}
          </div>
        )}
        <div className="flex-1">
          <div className="font-mono text-lg font-black text-[var(--tinta)]">{m.codigo}</div>
          <div className="text-base font-bold">{m.alias || "Sin nombre aún"}</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Pill tono="gris">{etiquetaEstatus(m.estatus)}</Pill>
            <Pill tono="azul">{etiquetaIDTR(m.estadoIDTR)}</Pill>
            <Pill tono="gris">{ubicacionTexto(m)}</Pill>
          </div>
        </div>
      </div>

      {/* Notificación al Consejo (art. 91) */}
      <TituloSeccion>Derivación legal</TituloSeccion>
      {m.notificadoConsejo ? (
        <div className="tarjeta p-4">
          <Pill tono="verde">Notificado al Consejo de Protección</Pill>
          <div className="mt-2 text-sm text-[var(--gris)]">{new Date(m.notificadoConsejo).toLocaleString("es-VE")}</div>
          {m.notificadoConsejoNota && <div className="mt-1 text-sm">{m.notificadoConsejoNota}</div>}
        </div>
      ) : (
        <div className="tarjeta p-4">
          <p className="text-sm text-[var(--tinta)]">
            <b>Obligatorio (LOPNNA art. 91):</b> notifica de inmediato al Consejo de Protección de NNA del municipio.
            Waraira no dicta custodia; deriva.
          </p>
          <input className="campo mt-2" placeholder="Nota: a quién/cómo se notificó (opcional)" value={notaConsejo} onChange={(e) => setNotaConsejo(e.target.value)} />
          <button className="btn btn-primario mt-2 w-full" onClick={notificarConsejo}>Registrar notificación al Consejo</button>
        </div>
      )}

      {/* Estados IDTR */}
      <TituloSeccion>Estado del caso (IDTR)</TituloSeccion>
      <div className="tarjeta p-4">
        <div className="text-sm text-[var(--gris)]">{ESTADOS_IDTR.find((e) => e.valor === m.estadoIDTR)?.ayuda}</div>
        {transiciones.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {transiciones.map((t) => (
              <button
                key={t}
                className={`btn ${t === "reunificado" && !puedeReun ? "btn-secundario" : "btn-secundario"}`}
                onClick={() => cambiarEstado(t)}
              >
                → {etiquetaIDTR(t)}
              </button>
            ))}
          </div>
        )}
        {m.estadoIDTR === "derivado_autoridad" && !puedeReun && (
          <p className="mt-2 text-xs text-[var(--ambar)]">
            Para reunificar falta: {faltanReun.join("; ")}.{" "}
            <Link href={`/reunificacion?menor=${m.id}`} className="font-bold text-[var(--verde)]">Gestionar reclamo →</Link>
          </p>
        )}
      </div>

      {/* Cordón de cuido */}
      <div className="tarjeta mt-3 p-4">
        <div className="mb-1.5 text-sm font-semibold">Cordón de cuido</div>
        <select className="campo" value={m.cordonId ?? ""} onChange={(e) => asignarCordon(e.target.value)}>
          <option value="">Sin asignar</option>
          {cordones.filter((c) => c.estado === "activo").map((c) => (
            <option key={c.id} value={c.id}>{c.nombre} · {ubicacionTexto(c)}</option>
          ))}
        </select>
      </div>

      {/* Reunificación */}
      <div className="mt-3">
        <Link href={`/reunificacion?menor=${m.id}`} className="btn btn-secundario w-full">🤝 Iniciar / ver reclamo de familiar</Link>
      </div>

      {/* Detalles privados (anti-suplantación) */}
      <TituloSeccion>Verificación — detalles privados</TituloSeccion>
      <div className="tarjeta p-4">
        <p className="text-xs text-[var(--gris)]">
          Datos que <b>solo la familia real sabría</b> y que <b>nunca</b> deben ser públicos. Se usan
          para interrogar al reclamante por separado y cotejar.
        </p>
        <Area className="mt-2" value={detalles} onChange={(e) => setDetalles(e.target.value)} placeholder="p.ej. nombre del perro, apodo del hermano, cómo es la casa…" />
        <Area className="mt-2" label="¿Con quién duerme hoy? (cuido actual)" value={cuido} onChange={(e) => setCuido(e.target.value)} />
        <button className="btn btn-primario mt-2 w-full" onClick={guardarDetalles}>Guardar</button>
      </div>

      {/* Expediente completo (restringido) */}
      <TituloSeccion>Expediente (restringido)</TituloSeccion>
      <div className="tarjeta px-4 py-1">
        <Dato label="Sexo" valor={m.sexo === "f" ? "Niña" : m.sexo === "m" ? "Niño" : "Por determinar"} />
        <Dato label="Edad estimada" valor={m.edadEstimadaMin != null ? `${m.edadEstimadaMin}–${m.edadEstimadaMax ?? m.edadEstimadaMin} años` : undefined} />
        <Dato label="Señas físicas" valor={m.senasFisicas} />
        <Dato label="Ropa y objetos" valor={m.ropaYObjetos} />
        <Dato label="Lugar del hallazgo" valor={m.lugarHallazgo} />
        <Dato label="Punto" valor={m.punto} />
        <Dato label="Encontrado" valor={new Date(m.encontradoHora).toLocaleString("es-VE")} />
        <Dato label="Quién lo encontró" valor={m.encontradoPor} />
        <Dato label="Idioma" valor={m.idioma} />
        <Dato label="Circunstancias de la separación" valor={m.conQuienEstaba} />
        <Dato label="Estado de salud" valor={m.estadoSalud} />
        <Dato label="Señales de riesgo" valor={m.senalesRiesgo} />
      </div>
    </div>
  );
}
