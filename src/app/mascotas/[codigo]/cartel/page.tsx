"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useColeccion } from "@/lib/db";
import { type Mascota, TIPOS_AVISO } from "@/lib/model";
import { etiquetaEspecie } from "@/lib/mascotas";
import { ubicacionTexto } from "@/lib/geografia";
import { leerPerfil } from "@/lib/perfil";
import { FotoMascota } from "@/components/FotoMascota";

export default function CartelMascota() {
  const params = useParams<{ codigo: string }>();
  const codigo = decodeURIComponent(params.codigo);
  const { datos: mascotas, cargando } = useColeccion<Mascota>("mascotas");
  const m = mascotas.find((x) => x.codigo === codigo);
  const perfil = leerPerfil();

  if (cargando) return <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">Cargando…</div>;
  if (!m)
    return (
      <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">
        No se encontró el código {codigo}. <Link href="/mascotas" className="font-bold text-[var(--verde)]">Volver</Link>
      </div>
    );

  const zona = [ubicacionTexto(m), m.punto].filter(Boolean).join(" · ") || "Zona no indicada";
  const contactoNombre = m.custodioActualNombre || perfil?.nombre || "—";
  const contactoTelefono = perfil?.telefono || "—";

  async function compartir() {
    if (!m) return;
    const texto = `SE BUSCA / ${m.nombre} (${etiquetaEspecie(m.especie)}) · ${zona}. Contacto: ${contactoNombre} ${contactoTelefono}. Código ${m.codigo}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Mascota ${m.codigo}`, text: texto, url: m.fotoUrl });
      } else {
        await navigator.clipboard.writeText(texto + (m.fotoUrl ? ` ${m.fotoUrl}` : ""));
        alert("Texto del cartel copiado al portapapeles.");
      }
    } catch {
      /* el usuario canceló el diálogo de compartir */
    }
  }

  return (
    <div>
      {/* Controles (no se imprimen) */}
      <div className="no-imprimir mb-4 flex items-center justify-between">
        <Link href={`/mascotas/${m.codigo}`} className="text-sm font-semibold text-[var(--verde)] no-underline">← Ficha</Link>
        <div className="flex gap-2">
          <button className="btn btn-secundario" onClick={compartir}>📤 Compartir</button>
          <button className="btn btn-primario" onClick={() => window.print()}>🖨 Imprimir</button>
        </div>
      </div>

      {!m.fotoUrl && (
        <div className="no-imprimir mb-4 rounded-xl border border-[var(--ambar)] bg-[var(--ambar-bg)] p-3 text-sm text-[var(--ambar)]">
          Esta mascota no tiene <b>foto pública (URL)</b>. Al compartir el cartel por link, la imagen no se verá.
          Agrega una URL pública en la ficha para que el cartel sea compartible.
        </div>
      )}

      {/* Cartel */}
      <div className="mx-auto max-w-md rounded-2xl border-2 border-[var(--verde)] bg-white p-6 text-center" style={{ breakInside: "avoid" }}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--verde)]">Waraira · Mascotas</div>
        <div className="mt-1 text-3xl font-black tracking-tight text-[var(--rojo)]">{TIPOS_AVISO[0].etiqueta.toUpperCase()}</div>

        <div className="mt-4 flex justify-center">
          <FotoMascota fotoUrl={m.fotoUrl} fotoBlob={m.fotoBlob} nombre={m.nombre} className="h-56 w-56" rounded="rounded-2xl" />
        </div>

        <div className="mt-4 text-2xl font-black text-[var(--tinta)]">{m.nombre}</div>
        <div className="text-sm font-semibold text-[var(--gris)]">
          {etiquetaEspecie(m.especie)}{m.raza ? ` · ${m.raza}` : ""}{m.color ? ` · ${m.color}` : ""}
        </div>

        {m.senas && <div className="mt-2 text-sm text-[var(--tinta)]"><b>Señas:</b> {m.senas}</div>}
        {m.estadoSalud && <div className="mt-1 text-sm text-[var(--tinta)]"><b>Salud:</b> {m.estadoSalud}</div>}

        <div className="mt-3 rounded-lg bg-[var(--verde-claro)] px-3 py-2 text-sm font-semibold text-[var(--verde-osc)]">
          📍 {zona}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="rounded-lg border border-[var(--linea)] bg-white p-2">
            <QRCodeSVG value={m.codigo} size={110} level="M" marginSize={0} />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--gris)]">Contacto</div>
            <div className="text-base font-black text-[var(--tinta)]">{contactoNombre}</div>
            <div className="text-base font-bold text-[var(--verde-osc)]">{contactoTelefono}</div>
            <div className="mt-1 font-mono text-xs text-[var(--gris)]">{m.codigo}</div>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-[var(--gris)]">El QR lleva solo el código · escanéalo para ubicar la ficha</div>
      </div>
    </div>
  );
}
