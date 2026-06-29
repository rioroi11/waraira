"use client";

import Link from "next/link";
import { useState } from "react";
import { useColeccion, crear, actualizar } from "@/lib/db";
import {
  type Voluntario,
  type Vetting,
  type RolVoluntario,
  type Menor,
  type Cordon,
  type Turno,
  type Aval,
  ROLES_VOLUNTARIO,
  PASOS_VETTING,
  AVALES_REQUERIDOS,
  voluntarioApto,
  contarAvales,
} from "@/lib/model";
import { ubicacionTexto } from "@/lib/geografia";
import { SelectorUbicacion, type ValorUbicacion } from "@/components/SelectorUbicacion";
import { totalesGlobales } from "@/lib/agregados";
import { capturarGPS } from "@/lib/perfil";
import { Campo, TituloSeccion, Pill } from "@/components/ui";

const VETTING_VACIO: Vetting = { screening: false, antecedentes: false, validacionComunitaria: false, referencias: false };

export default function Voluntarios() {
  const { datos: voluntarios } = useColeccion<Voluntario>("voluntarios");
  const { datos: avales } = useColeccion<Aval>("avales");
  const { datos: menores } = useColeccion<Menor>("menores");
  const { datos: cordones } = useColeccion<Cordon>("cordones");
  const { datos: turnos } = useColeccion<Turno>("turnos");

  const [abrirAlta, setAbrirAlta] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cedula, setCedula] = useState("");
  const [ubicacion, setUbicacion] = useState<ValorUbicacion>({ entidad: "", municipio: "", parroquia: "" });
  const [sector, setSector] = useState("");
  const [roles, setRoles] = useState<RolVoluntario[]>(["facilitador"]);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsEstado, setGpsEstado] = useState<"" | "buscando" | "ok" | "no">("");

  const t = totalesGlobales(menores, cordones, turnos, voluntarios);

  async function tomarGPS() {
    setGpsEstado("buscando");
    const p = await capturarGPS();
    if (p) { setGps(p); setGpsEstado("ok"); } else { setGpsEstado("no"); }
  }

  async function agregar() {
    if (!nombre || !telefono || !ubicacion.entidad) return;
    await crear<Voluntario>("voluntarios", {
      nombre,
      telefono,
      cedula: cedula || undefined,
      entidad: ubicacion.entidad || undefined,
      municipio: ubicacion.municipio || undefined,
      parroquia: ubicacion.parroquia || undefined,
      sector: sector || undefined,
      lat: gps?.lat,
      lng: gps?.lng,
      roles,
      vetting: { ...VETTING_VACIO },
      codigoConductaFirmado: false,
      capacitacionMinima: false,
      verificado: false,
      estadoValidacion: "pendiente",
    }, { accion: "voluntario.alta", descripcion: `Voluntario ${nombre} registrado (pendiente de validación comunitaria)` });
    setNombre(""); setTelefono(""); setCedula(""); setUbicacion({ entidad: "", municipio: "", parroquia: "" }); setSector(""); setRoles(["facilitador"]);
    setGps(null); setGpsEstado(""); setAbrirAlta(false);
  }

  async function toggle(v: Voluntario, campo: keyof Vetting | "codigoConductaFirmado" | "capacitacionMinima", valor: boolean) {
    const next: Partial<Voluntario> =
      campo === "codigoConductaFirmado" || campo === "capacitacionMinima"
        ? { [campo]: valor }
        : { vetting: { ...v.vetting, [campo]: valor } };
    const fusion = { ...v, ...next } as Voluntario;
    await actualizar<Voluntario>("voluntarios", v.id, { ...next, verificado: voluntarioApto(fusion) });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Voluntariado</h1>
        <button className="btn btn-primario" onClick={() => setAbrirAlta((x) => !x)}>＋ Voluntario</button>
      </div>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Nadie cuida niños sin pasar el filtro: selección + antecedentes (o aval comunitario) + Código de Conducta + capacitación.{" "}
        <a href="/modulos/voluntariado.html" className="font-bold text-[var(--verde)]" target="_blank" rel="noreferrer">Ver plan de integración →</a>
      </p>

      {/* Déficit conmensurable */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black text-[var(--verde-osc)]">{t.voluntariosAptos}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">aptos</div>
        </div>
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black text-[var(--azul)]">{t.voluntariosEnTurno}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">en turno</div>
        </div>
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black" style={{ color: t.deficitTotal > 0 ? "var(--rojo)" : "var(--verde-osc)" }}>{t.deficitTotal}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">faltantes</div>
        </div>
      </div>

      {abrirAlta && (
        <div className="tarjeta mt-4 space-y-3 p-4">
          <p className="text-xs text-[var(--gris)]">
            Al registrarse, el voluntario queda <b>pendiente</b> hasta que {AVALES_REQUERIDOS} vecinos de
            su zona lo avalen (lo conocen y es de la localidad). La cédula y el teléfono lo hacen localizable.
          </p>
          <Campo label="Nombre y apellido *" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Teléfono *" type="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            <Campo label="Cédula" inputMode="numeric" value={cedula} onChange={(e) => setCedula(e.target.value)} />
          </div>
          <SelectorUbicacion valor={ubicacion} onChange={setUbicacion} requerido />
          <Campo label="Sector / barrio" placeholder="p.ej. Tanaguarena, calle 3" value={sector} onChange={(e) => setSector(e.target.value)} />
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-secundario" onClick={tomarGPS}>📍 Marcar mi ubicación</button>
            <span className="text-xs text-[var(--gris)]">
              {gpsEstado === "buscando" && "Buscando GPS…"}
              {gpsEstado === "ok" && "Ubicación tomada ✓"}
              {gpsEstado === "no" && "Sin GPS (se usará la zona/sector)"}
            </span>
          </div>
          <div>
            <div className="mb-1.5 text-sm font-semibold">Roles</div>
            <div className="flex flex-wrap gap-2">
              {ROLES_VOLUNTARIO.map((r) => {
                const sel = roles.includes(r.valor);
                return (
                  <button
                    key={r.valor}
                    type="button"
                    onClick={() => setRoles((rs) => (sel ? rs.filter((x) => x !== r.valor) : [...rs, r.valor]))}
                    className="pill"
                    style={{ background: sel ? "var(--verde)" : "#eef2f0", color: sel ? "#fff" : "var(--gris)" }}
                  >
                    {r.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>
          <button className="btn btn-primario w-full" disabled={!nombre || !telefono || !ubicacion.entidad} onClick={agregar}>Registrar voluntario</button>
        </div>
      )}

      <Link href="/validacion" className="btn btn-secundario mt-4 flex w-full">🔔 Validación comunitaria de voluntarios</Link>

      <TituloSeccion>Voluntarios ({voluntarios.length})</TituloSeccion>
      <div className="space-y-2">
        {voluntarios.length === 0 && <div className="tarjeta p-4 text-sm text-[var(--gris)]">Aún no hay voluntarios.</div>}
        {voluntarios.map((v) => {
          const apto = voluntarioApto(v);
          const av = contarAvales(v.id, avales);
          const comunidadOk = av.aprobados >= AVALES_REQUERIDOS;
          return (
            <div key={v.id} className="tarjeta p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--tinta)]">{v.nombre}</span>
                  {v.entidad && <span className="ml-2 text-xs text-[var(--gris)]">{ubicacionTexto(v)}{v.sector ? ` · ${v.sector}` : ""}</span>}
                </div>
                <Pill tono={apto ? "verde" : "ambar"}>{apto ? "Apto" : "En proceso"}</Pill>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {v.roles.map((r) => <Pill key={r} tono="gris">{ROLES_VOLUNTARIO.find((x) => x.valor === r)?.etiqueta}</Pill>)}
                <Pill tono={comunidadOk ? "verde" : av.rechazados > 0 ? "rojo" : "ambar"}>
                  Avales {av.aprobados}/{AVALES_REQUERIDOS}{av.rechazados > 0 ? ` · ${av.rechazados}✕` : ""}
                </Pill>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {PASOS_VETTING.map((p) => (
                  <label key={p.clave} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" className="h-4 w-4 accent-[var(--verde)]" checked={v.vetting[p.clave]} onChange={(e) => toggle(v, p.clave, e.target.checked)} />
                    {p.etiqueta}
                  </label>
                ))}
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--verde)]" checked={v.codigoConductaFirmado} onChange={(e) => toggle(v, "codigoConductaFirmado", e.target.checked)} />
                  Código de Conducta firmado
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--verde)]" checked={v.capacitacionMinima} onChange={(e) => toggle(v, "capacitacionMinima", e.target.checked)} />
                  Capacitación mínima
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
