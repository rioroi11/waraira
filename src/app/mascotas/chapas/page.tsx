"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useColeccion } from "@/lib/db";
import { type Mascota } from "@/lib/model";
import { ubicacionTexto } from "@/lib/geografia";
import { etiquetaEspecie } from "@/lib/mascotas";
import { TituloSeccion } from "@/components/ui";

export default function ChapasMascota() {
  const { datos: mascotas } = useColeccion<Mascota>("mascotas");
  const activas = mascotas
    .filter((m) => m.estado !== "reunificada" && m.estado !== "fallecida")
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div>
      <div className="no-imprimir">
        <Link href="/mascotas" className="text-sm font-semibold text-[var(--verde)] no-underline">← Mascotas</Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--tinta)]">Chapas / collar QR (opcional)</h1>
        <p className="mt-1 text-sm text-[var(--gris)]">
          Etiquetas QR opcionales para colgar al collar. El QR codifica <b>solo el código</b> MAS-XXXX
          (nunca datos sensibles): al escanearlo se ubica la ficha y su cadena de custodia.
        </p>
        <div className="mt-3">
          <button className="btn btn-secundario" onClick={() => window.print()}>🖨 Imprimir hoja</button>
        </div>
        <TituloSeccion>{activas.length} chapas a imprimir</TituloSeccion>
      </div>

      {activas.length === 0 ? (
        <div className="tarjeta p-6 text-center text-sm text-[var(--gris)] no-imprimir">
          No hay mascotas activas todavía.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {activas.map((m) => (
            <div
              key={m.id}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--verde)] bg-white p-4 text-center"
              style={{ breakInside: "avoid" }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--verde)]">WARAIRA 🐾</div>
              <div className="my-1 text-sm font-black text-[var(--tinta)]">{m.nombre}</div>
              <div className="font-mono text-lg font-black tracking-widest text-[var(--tinta)]">{m.codigo}</div>
              <div className="my-1 rounded-md bg-white p-1.5">
                <QRCodeSVG value={m.codigo} size={84} level="M" marginSize={0} />
              </div>
              <div className="text-[11px] text-[var(--gris)]">{etiquetaEspecie(m.especie)}{ubicacionTexto(m) ? ` · ${ubicacionTexto(m)}` : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
