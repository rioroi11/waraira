"use client";

import Link from "next/link";
import { useColeccion, actualizar } from "@/lib/db";
import { type Notificacion, type RespuestaConstancia, RESPUESTAS_CONSTANCIA } from "@/lib/model";
import { Pill, TituloSeccion } from "@/components/ui";

export default function Notificaciones() {
  const { datos } = useColeccion<Notificacion>("notificaciones");
  const orden = [...datos].sort((a, b) => b.createdAt - a.createdAt);
  const pendientesConstancia = orden.filter((n) => n.requiereConstancia && !n.respuesta);

  async function responder(n: Notificacion, respuesta: RespuestaConstancia) {
    await actualizar<Notificacion>(
      "notificaciones",
      n.id,
      { respuesta, respondidaEn: Date.now(), leida: true },
      { accion: "constancia.respondida", descripcion: `Constancia de ${n.paraNombre} sobre ${n.refCodigo}: ${respuesta}` },
    );
  }

  async function marcarLeida(n: Notificacion) {
    if (n.leida) return;
    await actualizar<Notificacion>("notificaciones", n.id, { leida: true });
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Avisos</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Avisos de la cadena de custodia. El envío entre teléfonos se activa al encender el servidor;
        por ahora se ven en el dispositivo donde se generaron.
      </p>

      {pendientesConstancia.length > 0 && (
        <TituloSeccion>Constancias por responder ({pendientesConstancia.length})</TituloSeccion>
      )}
      {pendientesConstancia.map((n) => (
        <div key={n.id} className="tarjeta mb-2 border-l-4 border-[var(--ambar)] p-4">
          <div className="text-sm font-bold text-[var(--tinta)]">{n.titulo}</div>
          <div className="mt-1 text-sm text-[var(--gris)]">{n.cuerpo}</div>
          <div className="mt-1 text-xs text-[var(--gris)]">Para: {n.paraNombre} · {new Date(n.createdAt).toLocaleString("es-VE")}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {RESPUESTAS_CONSTANCIA.map((r) => (
              <button key={r.valor} className="btn btn-secundario text-sm" onClick={() => responder(n, r.valor)}>
                {r.etiqueta}
              </button>
            ))}
          </div>
        </div>
      ))}

      <TituloSeccion>Todos los avisos</TituloSeccion>
      {orden.length === 0 ? (
        <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">No hay avisos.</div>
      ) : (
        <div className="space-y-2">
          {orden.map((n) => (
            <div
              key={n.id}
              className="tarjeta p-3"
              style={{ opacity: n.leida && !n.respuesta ? 0.7 : 1 }}
              onClick={() => marcarLeida(n)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-[var(--tinta)]">{n.titulo}</div>
                {n.respuesta ? (
                  <Pill tono="verde">{RESPUESTAS_CONSTANCIA.find((r) => r.valor === n.respuesta)?.etiqueta ?? n.respuesta}</Pill>
                ) : n.requiereConstancia ? (
                  <Pill tono="ambar">Constancia pendiente</Pill>
                ) : !n.leida ? (
                  <Pill tono="azul">Nuevo</Pill>
                ) : null}
              </div>
              <div className="mt-1 text-sm text-[var(--gris)]">{n.cuerpo}</div>
              <div className="mt-1 text-xs text-[var(--gris)]">
                Para: {n.paraNombre}
                {n.refCodigo ? ` · ${n.refCodigo}` : ""}
                {n.refMenorId ? <> · <Link href={`/ninos/${n.refCodigo}`} className="font-bold text-[var(--verde)]">ver niño</Link></> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
