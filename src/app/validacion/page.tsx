"use client";

import Link from "next/link";
import { useState } from "react";
import { useColeccion, crear, actualizar } from "@/lib/db";
import {
  type Voluntario,
  type Aval,
  type Figura,
  type DecisionAval,
  FIGURAS,
  AVALES_REQUERIDOS,
  ROLES_VOLUNTARIO,
  contarAvales,
} from "@/lib/model";
import { ubicacionTexto, mismaZona } from "@/lib/geografia";
import { usePerfil, guardarPerfil, capturarGPS } from "@/lib/perfil";
import { pedirPermisoNotificaciones } from "@/lib/notificaciones";
import { Campo, Selector, TituloSeccion, Pill, Area } from "@/components/ui";
import { SelectorUbicacion } from "@/components/SelectorUbicacion";

export default function Validacion() {
  const { perfil, listo } = usePerfil();
  const { datos: voluntarios } = useColeccion<Voluntario>("voluntarios");
  const { datos: avales } = useColeccion<Aval>("avales");

  if (!listo) return <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">Cargando…</div>;
  if (!perfil) return <RegistroVecino />;

  // Voluntarios pendientes en mi zona (no me incluyo a mí mismo).
  const pendientes = voluntarios.filter(
    (v) =>
      v.estadoValidacion !== "validado" &&
      (!perfil.telefono || v.telefono !== perfil.telefono) &&
      mismaZona(perfil, v),
  );

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Validación comunitaria</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Tú, como vecino de la zona, ayudas a decidir quién puede cuidar niños. Avala solo a quien
        <b> conoces</b> y <b>es de la localidad</b>. Hacen falta {AVALES_REQUERIDOS} avales.
      </p>

      <PerfilResumen />

      <TituloSeccion>Pendientes en tu zona ({pendientes.length})</TituloSeccion>
      {pendientes.length === 0 ? (
        <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">
          No hay voluntarios por validar en {ubicacionTexto(perfil)}
          {perfil.sector ? ` · ${perfil.sector}` : ""} ahora mismo.
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes.map((v) => (
            <TarjetaPendiente key={v.id} v={v} avales={avales} perfilTel={perfil.telefono} />
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-[var(--gris)]">
        La alarma a los teléfonos de los vecinos viaja cuando hay servidor en línea (Convex). Sin
        señal, el registro queda en cola y avisa al reconectar.
      </p>
    </div>
  );
}

function PerfilResumen() {
  const { perfil } = usePerfil();
  const [editar, setEditar] = useState(false);
  if (!perfil) return null;
  if (editar) return <RegistroVecino alCerrar={() => setEditar(false)} />;
  return (
    <div className="tarjeta mt-3 flex items-center justify-between p-3">
      <div className="text-sm">
        <div className="font-bold text-[var(--tinta)]">{perfil.nombre}</div>
        <div className="text-xs text-[var(--gris)]">
          {FIGURAS.find((f) => f.valor === perfil.figura)?.etiqueta} · {ubicacionTexto(perfil)}
          {perfil.sector ? ` · ${perfil.sector}` : ""}{perfil.lat != null ? " · 📍" : ""}
        </div>
      </div>
      <button className="btn btn-secundario !py-2 !text-xs" onClick={() => setEditar(true)}>Editar</button>
    </div>
  );
}

function TarjetaPendiente({ v, avales, perfilTel }: { v: Voluntario; avales: Aval[]; perfilTel: string }) {
  const [nota, setNota] = useState("");
  const av = contarAvales(v.id, avales);
  const yaAvale = avales.some((a) => a.voluntarioId === v.id && a.avalTelefono === perfilTel);

  async function avalar(decision: DecisionAval) {
    if (yaAvale) return;
    const perfil = (await import("@/lib/perfil")).leerPerfil();
    if (!perfil) return;
    await crear<Aval>("avales", {
      voluntarioId: v.id,
      avalNombre: perfil.nombre,
      avalTelefono: perfil.telefono,
      avalCedula: perfil.cedula,
      avalFigura: perfil.figura,
      entidad: perfil.entidad,
      municipio: perfil.municipio,
      parroquia: perfil.parroquia,
      sector: perfil.sector,
      lat: perfil.lat,
      lng: perfil.lng,
      decision,
      nota: nota || undefined,
    }, {
      accion: `aval.${decision}`,
      descripcion: `${perfil.nombre} ${decision === "aprobado" ? "avaló" : "rechazó"} a ${v.nombre}`,
    });
    const aprobados = av.aprobados + (decision === "aprobado" ? 1 : 0);
    if (aprobados >= AVALES_REQUERIDOS) {
      await actualizar<Voluntario>("voluntarios", v.id, {
        estadoValidacion: "validado",
        vetting: { ...v.vetting, validacionComunitaria: true },
      }, { accion: "voluntario.validado", descripcion: `${v.nombre} validado por la comunidad` });
    } else if (decision === "rechazado") {
      await actualizar<Voluntario>("voluntarios", v.id, { estadoValidacion: "rechazado" });
    }
    setNota("");
  }

  return (
    <div className="tarjeta p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-[var(--tinta)]">{v.nombre}</div>
          <div className="text-xs text-[var(--gris)]">
            {ubicacionTexto(v)}{v.sector ? ` · ${v.sector}` : ""}
            {v.telefono ? ` · ☎ ${v.telefono}` : ""}{v.cedula ? ` · C.I. ${v.cedula}` : ""}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {v.roles.map((r) => <Pill key={r} tono="gris">{ROLES_VOLUNTARIO.find((x) => x.valor === r)?.etiqueta}</Pill>)}
          </div>
        </div>
        <Pill tono={av.aprobados >= AVALES_REQUERIDOS ? "verde" : "ambar"}>Avales {av.aprobados}/{AVALES_REQUERIDOS}</Pill>
      </div>

      {yaAvale ? (
        <div className="mt-3 rounded-lg bg-[var(--verde-claro)] p-2.5 text-xs font-semibold text-[var(--verde-osc)]">
          Ya diste tu respuesta sobre esta persona. Gracias.
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <Area placeholder="Nota (opcional): de qué lo conoces…" value={nota} onChange={(e) => setNota(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn btn-peligro flex-1" onClick={() => avalar("rechazado")}>No lo conozco</button>
            <button className="btn btn-primario flex-1" onClick={() => avalar("aprobado")}>Sí, lo conozco y es de aquí</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistroVecino({ alCerrar }: { alCerrar?: () => void }) {
  const { perfil } = usePerfil();
  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [telefono, setTelefono] = useState(perfil?.telefono ?? "");
  const [cedula, setCedula] = useState(perfil?.cedula ?? "");
  const [figura, setFigura] = useState<Figura>(perfil?.figura ?? "ciudadano");
  const [ubicacion, setUbicacion] = useState({
    entidad: perfil?.entidad ?? "",
    municipio: perfil?.municipio ?? "",
    parroquia: perfil?.parroquia ?? "",
  });
  const [sector, setSector] = useState(perfil?.sector ?? "");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(
    perfil?.lat != null && perfil?.lng != null ? { lat: perfil.lat, lng: perfil.lng } : null,
  );
  const [gpsEstado, setGpsEstado] = useState<"" | "buscando" | "ok" | "no">("");

  async function tomarGPS() {
    setGpsEstado("buscando");
    const p = await capturarGPS();
    if (p) { setGps(p); setGpsEstado("ok"); } else { setGpsEstado("no"); }
  }

  async function guardar() {
    if (!nombre || !telefono || !ubicacion.parroquia) return;
    guardarPerfil({
      nombre,
      telefono,
      cedula: cedula || undefined,
      figura,
      entidad: ubicacion.entidad || undefined,
      municipio: ubicacion.municipio || undefined,
      parroquia: ubicacion.parroquia,
      sector: sector || undefined,
      lat: gps?.lat,
      lng: gps?.lng,
    });
    pedirPermisoNotificaciones();
    alCerrar?.();
  }

  return (
    <div>
      {!alCerrar && (
        <>
          <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Regístrate como vecino</h1>
          <p className="mt-1 text-sm text-[var(--gris)]">
            Para avalar a quien cuidará niños, primero identifícate como persona localizable de tu zona.
            Tus datos solo se usan para trazar tu aval (no son públicos).
          </p>
        </>
      )}
      <div className="tarjeta mt-3 space-y-3 p-4">
        <Campo label="Nombre y apellido *" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Teléfono *" type="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <Campo label="Cédula" inputMode="numeric" value={cedula} onChange={(e) => setCedula(e.target.value)} />
        </div>
        <Selector label="¿Bajo qué figura?" value={figura} onChange={(e) => setFigura(e.target.value as Figura)}>
          {FIGURAS.map((f) => <option key={f.valor} value={f.valor}>{f.etiqueta}</option>)}
        </Selector>
        <SelectorUbicacion valor={ubicacion} onChange={setUbicacion} requerido />
        <Campo label="Sector / barrio" placeholder="p.ej. Los Corales" value={sector} onChange={(e) => setSector(e.target.value)} />
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-secundario" onClick={tomarGPS}>📍 Marcar mi ubicación</button>
          <span className="text-xs text-[var(--gris)]">
            {gpsEstado === "buscando" && "Buscando GPS…"}
            {(gpsEstado === "ok" || (gps && gpsEstado === "")) && "Ubicación tomada ✓"}
            {gpsEstado === "no" && "Sin GPS (se usará la zona/sector)"}
          </span>
        </div>
        <div className="flex gap-2">
          {alCerrar && <button className="btn btn-secundario flex-1" onClick={alCerrar}>Cancelar</button>}
          <button className="btn btn-primario flex-1" disabled={!nombre || !telefono || !ubicacion.parroquia} onClick={guardar}>
            Guardar perfil
          </button>
        </div>
      </div>
      {!alCerrar && (
        <Link href="/" className="mt-3 block text-center text-sm font-semibold text-[var(--verde)]">← Volver al inicio</Link>
      )}
    </div>
  );
}
