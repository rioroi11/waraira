"use client";

import { useColeccion } from "@/lib/db";
import { type Menor } from "@/lib/model";
import { ubicacionTexto } from "@/lib/geografia";
import { menoresActivos } from "@/lib/agregados";
import { TituloSeccion } from "@/components/ui";

export default function Brazaletes() {
  const { datos: menores } = useColeccion<Menor>("menores");
  const activos = menoresActivos(menores).sort((a, b) =>
    ubicacionTexto(a).localeCompare(ubicacionTexto(b)),
  );

  return (
    <div>
      <div className="no-imprimir">
        <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Brazaletes</h1>
        <p className="mt-1 text-sm text-[var(--gris)]">
          La manilla lleva <b>solo el código</b> — nunca el nombre, foto, edad ni nada que un
          suplantador pueda usar. El código es el puente al expediente confidencial.
        </p>

        <div className="tarjeta mt-3 p-4 text-sm">
          <b>Cómo producirlos:</b>
          <ul className="ml-4 mt-1 list-disc space-y-1 text-[var(--gris)]">
            <li>Material resistente al agua y <b>no transferible</b> (pulsera tyvek, cinta sellada).</li>
            <li>Un código = un niño. <b>Deduplica antes de colocar</b>: revisa foto + señas para no registrar dos veces.</li>
            <li>Si la manilla se pierde o manipulan, el respaldo real es la <b>foto + señas</b> del expediente.</li>
            <li>Respeta el código exacto (sin caracteres ambiguos: no hay 0, O, 1, I, L).</li>
          </ul>
        </div>

        <div className="mt-3 flex gap-2">
          <button className="btn btn-primario" onClick={() => window.print()}>🖨 Imprimir hoja</button>
        </div>

        <TituloSeccion>{activos.length} brazaletes a imprimir</TituloSeccion>
      </div>

      {activos.length === 0 ? (
        <div className="tarjeta p-6 text-center text-sm text-[var(--gris)] no-imprimir">
          No hay niños registrados todavía.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {activos.map((m) => (
            <div
              key={m.id}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--verde)] bg-white p-4 text-center"
              style={{ breakInside: "avoid" }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--verde)]">WARAIRA</div>
              <div className="my-1 font-mono text-2xl font-black tracking-widest text-[var(--tinta)]">{m.codigo}</div>
              <div className="text-[11px] text-[var(--gris)]">{ubicacionTexto(m)}</div>
              <div className="mt-1 text-[9px] text-[var(--gris)]">No es identidad pública</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
