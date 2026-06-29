"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crear } from "@/lib/db";
import {
  type Cordon,
  type PerimetroCFS,
  CRITERIOS_PERIMETRO,
  CAPACIDAD_MAX_CORDON,
} from "@/lib/model";
import { SelectorUbicacion, type ValorUbicacion } from "@/components/SelectorUbicacion";
import { Campo, TituloSeccion } from "@/components/ui";

const PERIMETRO_VACIO: PerimetroCFS = {
  libreDePeligros: false,
  lejosDeTrafico: false,
  lejosDeMilitares: false,
  delimitado: false,
  banosSeparados: false,
  botiquin: false,
  controlDeAcceso: false,
};

export default function NuevoCordon() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState<ValorUbicacion>({ entidad: "", municipio: "", parroquia: "" });
  const [punto, setPunto] = useState("");
  const [coordinador, setCoordinador] = useState("");
  const [capacidad, setCapacidad] = useState("50");
  const [perimetro, setPerimetro] = useState<PerimetroCFS>(PERIMETRO_VACIO);
  const [guardando, setGuardando] = useState(false);

  const valido = nombre && ubicacion.entidad && ubicacion.municipio && ubicacion.parroquia && punto;

  async function guardar() {
    if (!valido || guardando) return;
    setGuardando(true);
    const cap = Math.min(Number(capacidad) || 50, CAPACIDAD_MAX_CORDON);
    await crear<Cordon>(
      "cordones",
      {
        nombre,
        entidad: ubicacion.entidad,
        municipio: ubicacion.municipio,
        parroquia: ubicacion.parroquia,
        punto,
        coordinador: coordinador || undefined,
        capacidad: cap,
        estado: "activo",
        perimetro,
      },
      { accion: "cordon.creado", descripcion: `Cordón "${nombre}" creado en ${punto}` },
    );
    router.push("/cordones");
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Nuevo cordón</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">Un perímetro de cuido seguro en una plaza o punto.</p>

      <div className="mt-4 space-y-3">
        <Campo label="Nombre del cordón *" placeholder="p.ej. Cordón Plaza Bolívar" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <SelectorUbicacion valor={ubicacion} onChange={setUbicacion} requerido />
        <Campo label="Punto / plaza *" placeholder="p.ej. Plaza Bolívar" value={punto} onChange={(e) => setPunto(e.target.value)} />
        <Campo label="Coordinador (contacto)" value={coordinador} onChange={(e) => setCoordinador(e.target.value)} />
        <Campo label={`Capacidad de niños (máx. ${CAPACIDAD_MAX_CORDON})`} type="number" inputMode="numeric" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} />
      </div>

      <TituloSeccion>Checklist de perímetro seguro</TituloSeccion>
      <div className="tarjeta divide-y divide-[var(--linea)]">
        {CRITERIOS_PERIMETRO.map((c) => (
          <label key={c.clave} className="flex cursor-pointer items-center gap-3 p-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--verde)]"
              checked={perimetro[c.clave]}
              onChange={(e) => setPerimetro((p) => ({ ...p, [c.clave]: e.target.checked }))}
            />
            <span>{c.etiqueta}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <button className="btn btn-secundario flex-1" onClick={() => history.back()}>Cancelar</button>
        <button className="btn btn-primario flex-1" disabled={!valido || guardando} onClick={guardar}>
          {guardando ? "Guardando…" : "Crear cordón"}
        </button>
      </div>
    </div>
  );
}
