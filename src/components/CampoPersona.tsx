"use client";

// Captura una persona del acto de custodia: identidad (nombre + cédula), presencia, si tiene la app
// en su teléfono, y los respaldos confidenciales (jamás públicos ni sincronizados):
//   - presente y SIN app → declara por este teléfono → su FOTO es el respaldo.
//   - NO presente → quién la SUPLANTA (nombre + cédula + foto del suplente).

import { useEffect, useState } from "react";
import type { PersonaActo } from "@/lib/model";
import { CampoCedula } from "./CamposIdentidad";

export function CampoPersona({
  titulo,
  ayuda,
  valor,
  onChange,
}: {
  titulo: string;
  ayuda?: string;
  valor: PersonaActo;
  onChange: (p: PersonaActo) => void;
}) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [supUrl, setSupUrl] = useState<string | null>(null);

  useEffect(() => {
    if (valor.fotoBlob) {
      const url = URL.createObjectURL(valor.fotoBlob);
      setFotoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFotoUrl(null);
  }, [valor.fotoBlob]);

  useEffect(() => {
    if (valor.suplente?.fotoBlob) {
      const url = URL.createObjectURL(valor.suplente.fotoBlob);
      setSupUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setSupUrl(null);
  }, [valor.suplente?.fotoBlob]);

  const pideFoto = valor.presente && !valor.tieneApp;

  // Centraliza cambios: descarta respaldos que dejan de aplicar (minimización de datos sensibles).
  function set(cambios: Partial<PersonaActo>) {
    const next = { ...valor, ...cambios };
    if (!(next.presente && !next.tieneApp)) {
      next.fotoBlob = undefined;
      next.declaraAqui = false;
    }
    if (next.presente) next.suplente = undefined; // presente → no hay suplente
    onChange(next);
  }
  function setSup(cambios: Partial<NonNullable<PersonaActo["suplente"]>>) {
    onChange({ ...valor, suplente: { nombre: "", ...valor.suplente, ...cambios } });
  }

  return (
    <div className="tarjeta p-3">
      <div className="text-sm font-bold text-[var(--tinta)]">{titulo}</div>
      {ayuda && <p className="mt-0.5 text-xs text-[var(--gris)]">{ayuda}</p>}

      <div className="mt-2 space-y-2">
        <input className="campo" placeholder="Nombre y apellido" value={valor.nombre} onChange={(e) => set({ nombre: e.target.value })} />
        <CampoCedula value={valor.cedula ?? ""} onChange={(c) => set({ cedula: c })} />

        <div className="flex flex-wrap gap-3 pt-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={valor.presente} onChange={(e) => set({ presente: e.target.checked })} />
            Está presente
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={valor.tieneApp} onChange={(e) => set({ tieneApp: e.target.checked })} />
            Tiene la app en su teléfono
          </label>
        </div>

        {pideFoto && (
          <div className="rounded-lg border border-dashed border-[var(--ambar)] p-2">
            <div className="text-xs font-semibold text-[var(--ambar)]">
              Sin app: declara por este teléfono → foto de respaldo (confidencial)
            </div>
            {fotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt="" className="mt-2 h-24 w-24 rounded-lg object-cover" />
            )}
            <input type="file" accept="image/*" capture="environment" className="mt-2 text-sm" onChange={(e) => set({ fotoBlob: e.target.files?.[0] ?? undefined, declaraAqui: true })} />
          </div>
        )}

        {!valor.presente && (
          <div className="rounded-lg border border-dashed border-[var(--azul)] p-2">
            <div className="text-xs font-semibold text-[var(--azul)]">No está presente: ¿quién declara/firma en su lugar?</div>
            <input className="campo mt-2" placeholder="Nombre de quien suplanta" value={valor.suplente?.nombre ?? ""} onChange={(e) => setSup({ nombre: e.target.value })} />
            <div className="mt-1.5">
              <CampoCedula value={valor.suplente?.cedula ?? ""} onChange={(c) => setSup({ cedula: c })} />
            </div>
            {supUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={supUrl} alt="" className="mt-2 h-24 w-24 rounded-lg object-cover" />
            )}
            <input type="file" accept="image/*" capture="environment" className="mt-2 text-sm" onChange={(e) => setSup({ fotoBlob: e.target.files?.[0] ?? undefined })} />
          </div>
        )}

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={valor.confirma} onChange={(e) => set({ confirma: e.target.checked })} />
          Confirma / declara
        </label>
      </div>
    </div>
  );
}

/** Persona vacía de un rol dado. */
export function personaVacia(rol: PersonaActo["rol"]): PersonaActo {
  return { rol, nombre: "", presente: true, tieneApp: false, declaraAqui: false, confirma: false };
}
