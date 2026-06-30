"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useColeccion, actualizar, crear } from "@/lib/db";
import {
  type Mascota,
  type EventoCustodiaMascota,
  type TipoCustodiaMascota,
  type PersonaActo,
  type EstadoMascota,
  type Reporte,
  ESTADOS_MASCOTA,
  TRANSICIONES_MASCOTA,
  TIPOS_CUSTODIA_MASCOTA,
  etiquetaEstadoMascota,
  etiquetaCustodiaMascota,
  etiquetaRefugio,
  faltaParaTraspasoMascota,
} from "@/lib/model";
import { etiquetaEspecie } from "@/lib/mascotas";
import { ubicacionTexto } from "@/lib/geografia";
import { CampoPersona, personaVacia } from "@/components/CampoPersona";
import { FotoMascota } from "@/components/FotoMascota";
import { Pill, TituloSeccion, Area, Modal, Campo, Selector } from "@/components/ui";

function Dato({ label, valor }: { label: string; valor?: string | number | null }) {
  if (valor == null || valor === "") return null;
  return (
    <div className="border-t border-[var(--linea)] py-2">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--gris)]">{label}</div>
      <div className="text-sm text-[var(--tinta)]">{valor}</div>
    </div>
  );
}

function tonoEstado(e: EstadoMascota): "verde" | "ambar" | "rojo" | "azul" | "gris" {
  if (e === "reunificada") return "verde";
  if (e === "perdida") return "rojo";
  if (e === "en_tratamiento") return "ambar";
  if (e === "en_refugio") return "azul";
  return "gris";
}

export default function FichaMascota() {
  const params = useParams<{ codigo: string }>();
  const codigo = decodeURIComponent(params.codigo);
  const { datos: mascotas, cargando } = useColeccion<Mascota>("mascotas");
  const { datos: custodiaTodos } = useColeccion<EventoCustodiaMascota>("custodiaMascota");
  const { datos: reportes } = useColeccion<Reporte>("reportes");
  const m = mascotas.find((x) => x.codigo === codigo);

  const [esNuevo, setEsNuevo] = useState(false);
  const [custOpen, setCustOpen] = useState(false);

  useEffect(() => {
    setEsNuevo(new URLSearchParams(window.location.search).get("nuevo") === "1");
  }, []);

  const cadena = useMemo(
    () => custodiaTodos.filter((e) => e.mascotaId === m?.id).sort((a, b) => a.createdAt - b.createdAt),
    [custodiaTodos, m?.id],
  );
  const necesidades = useMemo(() => reportes.filter((r) => r.mascotaId === m?.id), [reportes, m?.id]);

  if (cargando) return <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">Cargando…</div>;
  if (!m)
    return (
      <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">
        No se encontró el código {codigo}. <Link href="/mascotas" className="font-bold text-[var(--verde)]">Volver</Link>
      </div>
    );

  const transiciones = TRANSICIONES_MASCOTA[m.estado];

  async function cambiarEstado(nuevo: EstadoMascota) {
    if (!m) return;
    await actualizar<Mascota>("mascotas", m.id, { estado: nuevo }, {
      accion: "mascota.estado",
      descripcion: `Mascota ${m.codigo}: ${etiquetaEstadoMascota(m.estado)} → ${etiquetaEstadoMascota(nuevo)}`,
    });
  }

  return (
    <div>
      {esNuevo && (
        <div className="mb-4 rounded-xl border-2 border-[var(--verde)] bg-[var(--verde-claro)] p-4 text-center">
          <div className="text-sm font-bold text-[var(--verde-osc)]">Mascota registrada ✓</div>
          <div className="mt-1 text-xs text-[var(--verde-osc)]">Código interno (chapa/collar QR opcional):</div>
          <div className="mt-1 font-mono text-3xl font-black tracking-widest text-[var(--verde-osc)]">{m.codigo}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link href="/mascotas" className="text-sm font-semibold text-[var(--verde)] no-underline">← Mascotas</Link>
        <Link href={`/mascotas/${m.codigo}/cartel`} className="btn btn-secundario" style={{ padding: "0.3rem 0.7rem", fontSize: "0.85rem" }}>
          🪧 Cartel
        </Link>
      </div>

      <div className="mt-2 flex items-start gap-3">
        <FotoMascota fotoUrl={m.fotoUrl} fotoBlob={m.fotoBlob} nombre={m.nombre} className="h-24 w-24 shrink-0" />
        <div className="flex-1">
          <div className="text-lg font-black text-[var(--tinta)]">{m.nombre || "Sin nombre"}</div>
          <div className="font-mono text-sm text-[var(--gris)]">{m.codigo}</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Pill tono="gris">{etiquetaEspecie(m.especie)}</Pill>
            <Pill tono={tonoEstado(m.estado)}>{etiquetaEstadoMascota(m.estado)}</Pill>
            {ubicacionTexto(m) && <Pill tono="gris">{ubicacionTexto(m)}</Pill>}
          </div>
          {m.custodioActualNombre && (
            <div className="mt-1 text-xs text-[var(--gris)]">Custodia actual: <b>{m.custodioActualNombre}</b></div>
          )}
        </div>
      </div>

      {/* Estado de la mascota */}
      <TituloSeccion>Estado</TituloSeccion>
      <div className="tarjeta p-4">
        <div className="text-sm text-[var(--gris)]">{ESTADOS_MASCOTA.find((e) => e.valor === m.estado)?.ayuda}</div>
        {transiciones.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {transiciones.map((t) => (
              <button key={t} className="btn btn-secundario" onClick={() => cambiarEstado(t)}>
                → {etiquetaEstadoMascota(t)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Refugio */}
      {m.refugio && (
        <>
          <TituloSeccion>Refugio</TituloSeccion>
          <div className="tarjeta p-4">
            <Pill tono="azul">{etiquetaRefugio(m.refugio.tipo)}</Pill>
            <div className="mt-2 text-sm font-bold text-[var(--tinta)]">{m.refugio.nombre}</div>
            {m.refugio.ubicacion && <div className="text-sm text-[var(--gris)]">{m.refugio.ubicacion}</div>}
            {(m.refugio.responsableNombre || m.refugio.responsableTelefono) && (
              <div className="mt-1 text-xs text-[var(--gris)]">
                Responsable: {m.refugio.responsableNombre} {m.refugio.responsableTelefono ? `· ${m.refugio.responsableTelefono}` : ""}
              </div>
            )}
          </div>
        </>
      )}

      {/* Cadena de custodia (append-only) */}
      <TituloSeccion>Cadena de custodia · historial de movimiento</TituloSeccion>
      <div className="tarjeta p-4">
        <p className="text-xs text-[var(--gris)]">
          Quién la trasladó, a quién se entregó y a dónde se movió, paso a paso. <b>Registro inmutable</b>:
          cada eslabón se asienta con testigo y no se puede borrar (regla de dos personas · R3 · R10).
        </p>
        {cadena.length === 0 ? (
          <div className="mt-3 text-sm text-[var(--gris)]">Aún no hay eventos de custodia.</div>
        ) : (
          <ol className="mt-3 space-y-3">
            {cadena.map((e) => (
              <li key={e.id} className="relative border-l-2 border-[var(--verde)] pl-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tono="azul">{etiquetaCustodiaMascota(e.tipo)}</Pill>
                  <span className="text-xs text-[var(--gris)]">{new Date(e.createdAt).toLocaleString("es-VE")}</span>
                </div>
                <div className="mt-1 text-sm">
                  <b>{e.registradorNombre}</b>
                  {e.recibeNombre ? <> → entrega a <b>{e.recibeNombre}</b>{e.recibeDocumento ? ` (${e.recibeDocumento})` : ""}</> : null}
                </div>
                <div className="text-xs text-[var(--gris)]">
                  Testigo: {e.testigoNombre}
                  {e.refugioNombre ? ` · refugio: ${e.refugioNombre}` : ""}
                  {e.veterinario ? ` · vet: ${e.veterinario}` : ""}
                  {e.lugar ? ` · ${e.lugar}` : ""}
                </div>
                {e.nota && <div className="mt-0.5 text-xs text-[var(--tinta)]">{e.nota}</div>}
              </li>
            ))}
          </ol>
        )}
        <button className="btn btn-secundario mt-3 w-full" onClick={() => setCustOpen(true)}>
          + Registrar traslado / entrega / refugio / atención
        </button>
      </div>

      {custOpen && (
        <NuevoEventoCustodiaMascota
          mascota={m}
          onCerrar={() => setCustOpen(false)}
        />
      )}

      {/* Necesidades de esta mascota */}
      <TituloSeccion>Necesidades de esta mascota</TituloSeccion>
      <div className="tarjeta p-4">
        {necesidades.length === 0 ? (
          <div className="text-sm text-[var(--gris)]">Sin necesidades reportadas.</div>
        ) : (
          <ul className="space-y-2">
            {necesidades.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-1.5 border-t border-[var(--linea)] pt-2 first:border-0 first:pt-0">
                <Pill tono={r.tipo === "necesidad" ? "rojo" : "azul"}>{r.tipo === "necesidad" ? "Necesita" : "Ofrece"}</Pill>
                <span className="text-sm">{r.descripcion}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/mascotas" className="mt-3 block text-xs font-bold text-[var(--verde)]">
          + Reportar necesidad en el tablero (pestaña Necesidades)
        </Link>
      </div>

      {/* Expediente */}
      <TituloSeccion>Ficha completa</TituloSeccion>
      <div className="tarjeta px-4 py-1">
        <Dato label="Sexo" valor={m.sexo === "macho" ? "Macho" : m.sexo === "hembra" ? "Hembra" : "Por determinar"} />
        <Dato label="Edad aproximada" valor={m.edadAprox} />
        <Dato label="Raza" valor={m.raza} />
        <Dato label="Tamaño" valor={m.tamano} />
        <Dato label="Color / capa" valor={m.color} />
        <Dato label="Señas particulares" valor={m.senas} />
        <Dato label="Estado de salud" valor={m.estadoSalud} />
        <Dato label="Esterilizado" valor={m.esterilizado ? "Sí" : undefined} />
        <Dato label="Microchip" valor={m.microchip} />
        <Dato label="Temperamento" valor={m.temperamento} />
        <Dato label="Punto / lugar" valor={m.punto} />
        <Dato label="Notas" valor={m.notas} />
      </div>
    </div>
  );
}

/** Modal para asentar un nuevo eslabón de la cadena de custodia de la mascota. */
function NuevoEventoCustodiaMascota({ mascota, onCerrar }: { mascota: Mascota; onCerrar: () => void }) {
  const [tipo, setTipo] = useState<TipoCustodiaMascota>("traspaso");
  const [registrador, setRegistrador] = useState<PersonaActo>(personaVacia("registrador"));
  const [testigo, setTestigo] = useState<PersonaActo>(personaVacia("testigo"));
  const [recibe, setRecibe] = useState<PersonaActo>(personaVacia("recibe"));
  const [refugioNombre, setRefugioNombre] = useState("");
  const [veterinario, setVeterinario] = useState("");
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  const requiereRecibe = TIPOS_CUSTODIA_MASCOTA.find((t) => t.valor === tipo)?.requiereRecibe ?? false;
  const personas: PersonaActo[] = requiereRecibe ? [registrador, testigo, recibe] : [registrador, testigo];

  const borrador: Partial<EventoCustodiaMascota> = {
    tipo,
    registradorNombre: registrador.nombre,
    testigoNombre: testigo.nombre,
    recibeNombre: recibe.nombre,
    recibeDocumento: recibe.cedula,
    firmaEntrega: registrador.confirma,
    firmaTestigo: testigo.confirma,
    firmaRecibe: recibe.confirma,
    personas,
  };
  const faltan = faltaParaTraspasoMascota(borrador);

  async function asentar() {
    if (faltan.length > 0 || guardando) return;
    setGuardando(true);
    try {
      const evento: Omit<EventoCustodiaMascota, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
        mascotaId: mascota.id,
        codigo: mascota.codigo,
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
        refugioNombre: (tipo === "ingreso_refugio" || tipo === "salida_refugio") && refugioNombre.trim() ? refugioNombre.trim() : undefined,
        veterinario: tipo === "atencion_veterinaria" && veterinario.trim() ? veterinario.trim() : undefined,
        nota: nota.trim() || undefined,
      };
      await crear<EventoCustodiaMascota>("custodiaMascota", evento, {
        accion: `custodiaMascota.${tipo}`,
        descripcion: `Custodia ${mascota.codigo}: ${etiquetaCustodiaMascota(tipo)} por ${registrador.nombre.trim()}`,
      });

      // Actualiza el custodio actual cuando la mascota cambia de manos.
      if (requiereRecibe && recibe.nombre.trim()) {
        const nuevoEstado: Partial<Mascota> = { custodioActualNombre: recibe.nombre.trim() };
        if (tipo === "reunificacion") nuevoEstado.estado = "reunificada";
        await actualizar<Mascota>("mascotas", mascota.id, nuevoEstado, {
          accion: "mascota.custodio",
          descripcion: `Mascota ${mascota.codigo}: custodia ahora en ${recibe.nombre.trim()}`,
        });
      } else if (tipo === "ingreso_refugio") {
        await actualizar<Mascota>("mascotas", mascota.id, { estado: "en_refugio" }, {
          accion: "mascota.estado",
          descripcion: `Mascota ${mascota.codigo}: ingresó a refugio`,
        });
      } else if (tipo === "atencion_veterinaria") {
        await actualizar<Mascota>("mascotas", mascota.id, { estado: "en_tratamiento" }, {
          accion: "mascota.estado",
          descripcion: `Mascota ${mascota.codigo}: en atención veterinaria`,
        });
      }
      onCerrar();
    } catch (e) {
      console.error(e);
      setGuardando(false);
      alert("No se pudo asentar el evento. Intenta de nuevo.");
    }
  }

  const tituloRecibe = tipo === "salida_con_responsable" ? "Responsable que se la lleva" : "Quien recibe la custodia";

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
        <Selector label="Tipo de evento" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCustodiaMascota)}>
          {TIPOS_CUSTODIA_MASCOTA.filter((t) => t.valor !== "registro_inicial").map((t) => (
            <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
          ))}
        </Selector>
        <p className="text-xs text-[var(--gris)]">{TIPOS_CUSTODIA_MASCOTA.find((t) => t.valor === tipo)?.ayuda}</p>

        <CampoPersona titulo="Registrador (quién entrega/responde)" valor={registrador} onChange={setRegistrador} />
        <CampoPersona titulo="Testigo (segundo adulto)" valor={testigo} onChange={setTestigo} />
        {requiereRecibe && (
          <CampoPersona
            titulo={tituloRecibe}
            ayuda={tipo === "salida_con_responsable" ? "Momento de mayor riesgo: cédula y, si está presente sin app, foto." : undefined}
            valor={recibe}
            onChange={setRecibe}
          />
        )}

        {(tipo === "ingreso_refugio" || tipo === "salida_refugio") && (
          <Campo label="Nombre del refugio" value={refugioNombre} onChange={(e) => setRefugioNombre(e.target.value)} />
        )}
        {tipo === "atencion_veterinaria" && (
          <Campo label="Veterinario / clínica" value={veterinario} onChange={(e) => setVeterinario(e.target.value)} />
        )}

        <Area label="Nota (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} />

        {faltan.length > 0 && <p className="text-xs text-[var(--ambar)]">Falta: {faltan.join("; ")}.</p>}
      </div>
    </Modal>
  );
}
