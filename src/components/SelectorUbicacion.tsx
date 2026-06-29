"use client";

// Selector de ubicación en cascada: Estado → Municipio → Parroquia (división real de Venezuela).
// Reutilizable en todos los módulos (insumos, niños, cordones, voluntarios, perfil).
// Al cambiar un nivel superior, limpia los inferiores para mantener la coherencia.

import { Selector } from "./ui";
import { ESTADOS, municipiosDe, parroquiasDe } from "@/lib/geografia";

export interface ValorUbicacion {
  entidad: string;
  municipio: string;
  parroquia: string;
}

export function SelectorUbicacion({
  valor,
  onChange,
  requerido = false,
}: {
  valor: ValorUbicacion;
  onChange: (v: ValorUbicacion) => void;
  requerido?: boolean;
}) {
  const { entidad, municipio, parroquia } = valor;
  const muns = municipiosDe(entidad);
  const parrs = parroquiasDe(entidad, municipio);
  const marca = requerido ? " *" : "";

  return (
    <div className="grid grid-cols-1 gap-2">
      <Selector
        label={`Estado${marca}`}
        value={entidad}
        onChange={(e) => onChange({ entidad: e.target.value, municipio: "", parroquia: "" })}
      >
        <option value="">—</option>
        {ESTADOS.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.nombre}
          </option>
        ))}
      </Selector>

      <Selector
        label={`Municipio${marca}`}
        value={municipio}
        disabled={!entidad}
        onChange={(e) => onChange({ entidad, municipio: e.target.value, parroquia: "" })}
      >
        <option value="">{entidad ? "—" : "Elige el estado primero"}</option>
        {muns.map((m) => (
          <option key={m.slug} value={m.slug}>
            {m.nombre}
          </option>
        ))}
      </Selector>

      <Selector
        label={`Parroquia${marca}`}
        value={parroquia}
        disabled={!municipio}
        onChange={(e) => onChange({ entidad, municipio, parroquia: e.target.value })}
      >
        <option value="">{municipio ? "—" : "Elige el municipio primero"}</option>
        {parrs.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.nombre}
          </option>
        ))}
      </Selector>
    </div>
  );
}
