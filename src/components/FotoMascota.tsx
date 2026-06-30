"use client";

// Muestra la foto de una mascota/aviso: prioriza `fotoUrl` (host publico, compartible) y, si no
// hay, usa el Blob local (objectURL). Si no hay ninguna, muestra un marcador con la inicial.

import { useEffect, useState } from "react";

export function FotoMascota({
  fotoUrl,
  fotoBlob,
  nombre,
  className = "h-20 w-20",
  rounded = "rounded-xl",
}: {
  fotoUrl?: string;
  fotoBlob?: Blob;
  nombre?: string;
  className?: string;
  rounded?: string;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (fotoBlob) {
      const url = URL.createObjectURL(fotoBlob);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBlobUrl(null);
  }, [fotoBlob]);

  const src = fotoUrl || blobUrl;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={nombre ?? ""} className={`${className} ${rounded} object-cover`} />
    );
  }
  return (
    <div className={`${className} ${rounded} grid shrink-0 place-items-center bg-[var(--verde-claro)] text-2xl font-black text-[var(--verde-osc)]`}>
      {(nombre ?? "🐾").trim().charAt(0).toUpperCase() || "🐾"}
    </div>
  );
}
