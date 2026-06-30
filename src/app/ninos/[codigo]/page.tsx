"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useColeccion, actualizar, crear } from "@/lib/db";
import {
  type Menor,
  type Reclamo,
  type Cordon,
  type EventoCustodia,
  type TipoCustodia,
  type PersonaActo,
  type Notificacion,
  type EstadoIDTR,
  ESTATUS_MENOR,
  ESTADOS_IDTR,
  TRANSICIONES_IDTR,
  TIPOS_CUSTODIA,
  faltaParaTraspaso,
  puedeReunificar,
} from "@/lib/model";
import { ubicacionTexto } from "@/lib/geografia";
import { mostrarNotificacion } from "@/lib/notificaciones";
import { CampoPersona, personaVacia } from "@/components/CampoPersona";
import { Pill, TituloSeccion, Area, Modal, Campo, Selector } from "@/components/ui";

const etiquetaEstatus = (v: string) => ESTATUS_MENOR.find((e) => e.valor === v)?.etiqueta ?? v;
const etiquetaIDTR = (v: string) => ESTADOS_IDTR.find((e) => e.valor === v)?.etiqueta ?? v;
const etiquetaTipo = (v: string) => TIPOS_CUSTODIA.find((t) => t.valor === v)?.etiqueta ?? v;

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
  const { datos: custodiaTodos } = useColeccion<EventoCustodia>("custodia");
  const m = menores.find((x) => x.codigo === codigo);

  const [esNuevo, setEsNuevo] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [detalles, setDetalles] = useState("");
  const [cuido, setCuido] = useState("");
  const [notaConsejo, setNotaConsejo] = useState("");
  // Acuse de la autoridad
  const [acuseReceptor, setAcuseReceptor] = useState("");
  const [acuseVia, setAcuseVia] = useState("");
  const [acuseRef, setAcuseRef] = useState("");
  // Modal de nuevo evento de custodia
  const [custOpen, setCustOpen] = useState(false);

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

  // Cadena de custodia del menor, en orden cronológico (append-only).
  const cadena = useMemo(
    () => custodiaTodos.filter((e) => e.menorId === m?.id).sort((a, b) => a.createdAt - b.createdAt),
    [custodiaTodos, m?.id],
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
    await actualizar<Menor>(
      "menores",
      m.id,
      { detallesPrivados: detalles, cuidoActual: cuido },
      { accion: "menor.detalles", descripcion: `Menor ${m.codigo}: actualizados detalles de verificación / cuido actual` },
    );
  }

  async function asignarCordon(cordonId: string) {
    if (!m) return;
    const c = cordones.find((x) => x.id === cordonId);
    await actualizar<Menor>("menores", m.id, { cordonId: cordonId || undefined }, {
      accion: "menor.cordon",
      descripcion: `Menor ${m.codigo} ${cordonId ? `asignado a ${c?.nombre}` : "sin cordón"}`,
    });
  }

  async function registrarAcuse() {
    if (!m || !acuseReceptor.trim() || !acuseVia.trim()) return;
    await actualizar<Menor>(
      "menores",
      m.id,
      {
        acuseAutoridad: {
          receptor: acuseReceptor.trim(),
          via: acuseVia.trim(),
          fecha: Date.now(),
          referencia: acuseRef.trim() || undefined,
        },
      },
      { accion: "menor.acuse_autoridad", descripcion: `Acuse de ${acuseReceptor.trim()} para ${m.codigo}` },
    );
    setAcuseReceptor("");
    setAcuseVia("");
    setAcuseRef("");
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

          {/* Acuse de la autoridad (puente obligatorio) */}
          <div className="mt-3 border-t border-[var(--linea)] pt-3">
            {m.acuseAutoridad ? (
              <div>
                <Pill tono="verde">Acuse recibido</Pill>
                <div className="mt-2 text-sm">
                  <b>{m.acuseAutoridad.receptor}</b> · {m.acuseAutoridad.via}
                  {m.acuseAutoridad.referencia ? ` · ${m.acuseAutoridad.referencia}` : ""}
                </div>
                <div className="text-xs text-[var(--gris)]">{new Date(m.acuseAutoridad.fecha).toLocaleString("es-VE")}</div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-semibold">Registrar acuse de la autoridad</div>
                <p className="mt-1 text-xs text-[var(--gris)]">
                  Cuando el Consejo / Ministerio Público / Cruz Roja RFL acuse recibo del caso, anótalo:
                  la decisión pasa a la autoridad y Waraira queda como apoyo.
                </p>
                <Campo label="Quién acusó (receptor)" placeholder="Consejo de Protección de…" value={acuseReceptor} onChange={(e) => setAcuseReceptor(e.target.value)} />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Campo label="Vía" placeholder="oficio, presencial…" value={acuseVia} onChange={(e) => setAcuseVia(e.target.value)} />
                  <Campo label="Referencia (opcional)" placeholder="N° de oficio/acta" value={acuseRef} onChange={(e) => setAcuseRef(e.target.value)} />
                </div>
                <button className="btn btn-primario mt-2 w-full" disabled={!acuseReceptor.trim() || !acuseVia.trim()} onClick={registrarAcuse}>Registrar acuse</button>
              </div>
            )}
          </div>
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

      {/* Cadena de custodia (append-only) */}
      <TituloSeccion>Cadena de custodia</TituloSeccion>
      <div className="tarjeta p-4">
        <p className="text-xs text-[var(--gris)]">
          Quién respondió por el niño, paso a paso. <b>Registro inmutable</b>: cada eslabón se asienta con
          testigo y no se puede borrar (regla de dos personas · R3 · R10).
        </p>
        {cadena.length === 0 ? (
          <div className="mt-3 text-sm text-[var(--gris)]">Aún no hay eventos de custodia.</div>
        ) : (
          <ol className="mt-3 space-y-3">
            {cadena.map((e) => (
              <li key={e.id} className="relative border-l-2 border-[var(--verde)] pl-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tono="azul">{etiquetaTipo(e.tipo)}</Pill>
                  <span className="text-xs text-[var(--gris)]">{new Date(e.createdAt).toLocaleString("es-VE")}</span>
                </div>
                <div className="mt-1 text-sm">
                  <b>{e.registradorNombre}</b>
                  {e.recibeNombre ? <> → entrega a <b>{e.recibeNombre}</b>{e.recibeDocumento ? ` (${e.recibeDocumento})` : ""}</> : null}
                </div>
                <div className="text-xs text-[var(--gris)]">
                  Testigo: {e.testigoNombre}
                  {e.lugar ? ` · ${e.lugar}` : ""}
                  {e.codigoAnterior ? ` · reemplaza ${e.codigoAnterior}` : ""}
                </div>
                {e.nota && <div className="mt-0.5 text-xs text-[var(--tinta)]">{e.nota}</div>}
              </li>
            ))}
          </ol>
        )}
        <button className="btn btn-secundario mt-3 w-full" onClick={() => setCustOpen(true)}>
          + Registrar traspaso / salida / resguardo
        </button>
      </div>

      {custOpen && (
        <NuevoEventoCustodia
          menorId={m.id}
          codigo={m.codigo}
          cordones={cordones.filter((c) => c.estado === "activo")}
          onCerrar={() => setCustOpen(false)}
        />
      )}

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

/** Modal para asentar un nuevo eslabón de la cadena de custodia (con gate de dos personas + R3).
 *  Captura a cada persona con CampoPersona (cédula, presencia, foto-si-aplica) y notifica a las
 *  que tienen app — igual que el censado, para que los eslabones posteriores no pierdan respaldo. */
function NuevoEventoCustodia({
  menorId,
  codigo,
  cordones,
  onCerrar,
}: {
  menorId: string;
  codigo: string;
  cordones: Cordon[];
  onCerrar: () => void;
}) {
  const [tipo, setTipo] = useState<TipoCustodia>("traspaso");
  const [registrador, setRegistrador] = useState<PersonaActo>(personaVacia("registrador"));
  const [testigo, setTestigo] = useState<PersonaActo>(personaVacia("testigo"));
  const [recibe, setRecibe] = useState<PersonaActo>(personaVacia("recibe"));
  const [nodoId, setNodoId] = useState("");
  const [codigoAnterior, setCodigoAnterior] = useState("");
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  const requiereRecibe = TIPOS_CUSTODIA.find((t) => t.valor === tipo)?.requiereRecibe ?? false;
  const personas: PersonaActo[] = requiereRecibe ? [registrador, testigo, recibe] : [registrador, testigo];

  const borrador: Partial<EventoCustodia> = {
    tipo,
    registradorNombre: registrador.nombre,
    testigoNombre: testigo.nombre,
    recibeNombre: recibe.nombre,
    recibeDocumento: recibe.cedula,
    firmaEntrega: registrador.confirma,
    firmaTestigo: testigo.confirma,
    firmaRecibe: recibe.confirma,
    codigoAnterior,
    personas,
  };
  const faltan = faltaParaTraspaso(borrador);

  async function asentar() {
    if (faltan.length > 0 || guardando) return;
    setGuardando(true);
    try {
      const c = cordones.find((x) => x.id === nodoId);
      // A notificar: con app, sin el registrador (opera este teléfono) y sin duplicados.
      const vistos = new Set<string>();
      const aNotificar = personas.filter((p) => {
        if (!p.tieneApp || !p.nombre.trim() || p.rol === "registrador") return false;
        const k = `${p.nombre.trim().toLowerCase()}|${(p.cedula ?? "").trim()}`;
        if (vistos.has(k)) return false;
        vistos.add(k);
        return true;
      });
      const evento: Omit<EventoCustodia, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
        menorId,
        codigo,
        tipo,
        registradorNombre: registrador.nombre.trim(),
        testigoNombre: testigo.nombre.trim(),
        recibeNombre: requiereRecibe ? recibe.nombre.trim() : undefined,
        recibeContacto: requiereRecibe && recibe.telefono?.trim() ? recibe.telefono.trim() : undefined,
        recibeDocumento: requiereRecibe && recibe.cedula?.trim() ? recibe.cedula.trim() : undefined,
        firmaEntrega: registrador.confirma,
        firmaTestigo: testigo.confirma,
        firmaRecibe: requiereRecibe ? recibe.confirma : false,
        personas,
        braceleteCodigo: codigo,
        notificados: aNotificar.map((p) => p.nombre.trim()),
        nodoId: nodoId || undefined,
        lugar: c?.nombre,
        nota: nota.trim() || undefined,
        codigoAnterior: tipo === "reemision_brazalete" ? codigoAnterior.trim() : undefined,
      };
      await crear<EventoCustodia>("custodia", evento, {
        accion: `custodia.${tipo}`,
        descripcion: `Custodia ${codigo}: ${etiquetaTipo(tipo)} por ${registrador.nombre.trim()}`,
      });
      for (const p of aNotificar) {
        const noti: Omit<Notificacion, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
          paraNombre: p.nombre.trim(),
          paraCedula: p.cedula,
          paraTelefono: p.telefono,
          tipo: `custodia.${p.rol}`,
          titulo: "Waraira · cadena de custodia",
          cuerpo: `Quedaste como ${p.rol} en un acto de custodia (${etiquetaTipo(tipo)}) del niño ${codigo}.`,
          refMenorId: menorId,
          refCodigo: codigo,
          leida: false,
        };
        await crear<Notificacion>("notificaciones", noti, {
          accion: "notificacion.custodia",
          descripcion: `Notificación a ${p.nombre.trim()} (${p.rol}) por ${codigo}`,
        });
      }
      mostrarNotificacion("Waraira · cadena de custodia", {
        body: `${etiquetaTipo(tipo)} de ${codigo}. Se notificó a ${aNotificar.length} persona(s).`,
        icon: "/icon.svg",
        tag: "waraira-custodia",
      });
      onCerrar();
    } catch (e) {
      console.error(e);
      setGuardando(false);
      alert("No se pudo asentar el evento. Intenta de nuevo.");
    }
  }

  const tituloRecibe = tipo === "salida_con_adulto" ? "Adulto que se lleva al niño" : "Quien recibe la custodia";

  return (
    <Modal
      titulo="Nuevo eslabón de custodia"
      onCerrar={onCerrar}
      acciones={
        <>
          <button className="btn btn-secundario flex-1" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primario flex-1" disabled={faltan.length > 0 || guardando} onClick={asentar}>
            {guardando ? "Guardando…" : "Asentar"}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-left">
        <Selector label="Tipo de evento" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCustodia)}>
          {TIPOS_CUSTODIA.filter((t) => t.valor !== "registro_inicial").map((t) => (
            <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
          ))}
        </Selector>
        <p className="text-xs text-[var(--gris)]">{TIPOS_CUSTODIA.find((t) => t.valor === tipo)?.ayuda}</p>

        <CampoPersona titulo="Registrador (quién entrega/responde)" valor={registrador} onChange={setRegistrador} />
        <CampoPersona titulo="Testigo (segundo adulto)" valor={testigo} onChange={setTestigo} />
        {requiereRecibe && (
          <CampoPersona
            titulo={tituloRecibe}
            ayuda={tipo === "salida_con_adulto" ? "Momento de mayor riesgo: cédula y, si está presente sin app, foto." : undefined}
            valor={recibe}
            onChange={setRecibe}
          />
        )}

        {tipo === "resguardo" && (
          <Selector label="Nodo seguro (cordón)" value={nodoId} onChange={(e) => setNodoId(e.target.value)}>
            <option value="">Sin especificar</option>
            {cordones.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </Selector>
        )}

        {tipo === "reemision_brazalete" && (
          <Campo label="Código del brazalete anterior" placeholder="WRA-…" value={codigoAnterior} onChange={(e) => setCodigoAnterior(e.target.value)} />
        )}

        <Campo label="Nota (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} />

        {faltan.length > 0 && (
          <p className="text-xs text-[var(--ambar)]">Falta: {faltan.join("; ")}.</p>
        )}
      </div>
    </Modal>
  );
}
