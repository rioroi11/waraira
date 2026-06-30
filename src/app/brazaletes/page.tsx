"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
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
            <li>Material impermeable y <b>no transferible</b>, con <b>broche de un solo uso</b> (PVC/vinilo para días de trajín; tyvek para usos cortos).</li>
            <li>La manilla lleva <b>solo el código + su QR</b>. El QR codifica únicamente el código — <b>nunca</b> datos del niño.</li>
            <li><b>Doble pieza desprendible:</b> misma numeración en dos mitades — una en la muñeca del niño, la otra se archiva y queda vinculada al registrador.</li>
            <li>Un código = un niño. <b>Deduplica antes de colocar</b>: revisa foto + señas para no registrar dos veces.</li>
            <li>Si la manilla se pierde o manipulan, el respaldo real es la <b>foto + señas</b> del expediente.</li>
            <li>Respeta el código exacto (sin caracteres ambiguos: no hay 0, O, 1, I, L).</li>
          </ul>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/brazaletes/registro" className="btn btn-primario no-underline">📋 Registrar entrega</Link>
          <button className="btn btn-secundario" onClick={() => window.print()}>🖨 Imprimir hoja</button>
        </div>
        <p className="mt-2 text-xs text-[var(--gris)]">
          <b>Registrar entrega</b>: anota a qué centro/persona se entregó cada brazalete (con cédula, foto
          y ubicación) <i>antes</i> de colocarlo. Al censar a un niño se escanea o apunta ese código.
        </p>

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
              <div className="my-1 rounded-md bg-white p-1.5">
                <QRCodeSVG value={m.codigo} size={84} level="M" marginSize={0} />
              </div>
              <div className="text-[11px] text-[var(--gris)]">{ubicacionTexto(m)}</div>
              <div className="mt-1 text-[9px] text-[var(--gris)]">Solo el código · no es identidad pública</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
