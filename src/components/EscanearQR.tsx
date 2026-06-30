"use client";

// Lector de QR del brazalete: abre la cámara (html5-qrcode, importado en diferido para no tocar
// el navegador en SSR) y, si no se puede o no se quiere, SIEMPRE deja apuntar el código a mano.

import { useEffect, useId, useRef, useState } from "react";

type Escaner = {
  start: (
    camara: unknown,
    config: unknown,
    onExito: (texto: string) => void,
    onError: () => void,
  ) => Promise<unknown>;
  stop: () => Promise<void>;
  clear: () => void;
};

export function EscanearQR({
  value,
  onChange,
  placeholder = "WRA-XXXX",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rawId = useId();
  const idCaja = "qr-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const escanerRef = useRef<Escaner | null>(null);

  useEffect(() => {
    if (!escaneando) return;
    let cancelado = false;
    // Promesa del start(): el cleanup encadena el stop a ella para no llamar stop() mientras
    // start() aún está pendiente (durante el prompt de permiso), lo que dejaría la cámara
    // encendida sin handle. html5-qrcode solo se importa aquí (no toca el navegador en SSR).
    let startP: Promise<unknown> = Promise.resolve();
    let inst: Escaner | null = null;
    (async () => {
      try {
        const mod = await import("html5-qrcode");
        if (cancelado) return;
        inst = new mod.Html5Qrcode(idCaja) as unknown as Escaner;
        escanerRef.current = inst;
        startP = inst.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 220 },
          (decoded: string) => {
            onChange(decoded.trim().toUpperCase());
            setEscaneando(false);
          },
          () => {
            /* error por cuadro: se ignora (sigue intentando) */
          },
        );
        await startP;
        // Si se canceló durante el arranque, apaga la cámara que acaba de encender.
        if (cancelado && inst) {
          await inst.stop().catch(() => {});
          inst.clear();
          escanerRef.current = null;
        }
      } catch {
        if (!cancelado) {
          setError("No se pudo abrir la cámara. Apunta el código a mano.");
          setEscaneando(false);
        }
      }
    })();
    return () => {
      cancelado = true;
      escanerRef.current = null;
      // Espera a que start() resuelva antes de detener, así nunca queda la cámara sin handle.
      Promise.resolve(startP)
        .then(() => inst?.stop())
        .then(() => inst?.clear())
        .catch(() => {});
    };
  }, [escaneando, idCaja, onChange]);

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="campo font-mono uppercase"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
        <button
          type="button"
          className="btn btn-secundario whitespace-nowrap"
          onClick={() => {
            setError(null);
            setEscaneando((v) => !v);
          }}
        >
          {escaneando ? "✕ Cerrar" : "📷 Escanear"}
        </button>
      </div>
      {escaneando && (
        <div className="mt-2 overflow-hidden rounded-xl border border-[var(--linea)]">
          <div id={idCaja} className="mx-auto w-full max-w-xs" />
          <div className="bg-[var(--verde-claro)] px-3 py-1.5 text-center text-xs text-[var(--verde-osc)]">
            Apunta la cámara al QR del brazalete.
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-[var(--ambar)]">{error}</p>}
    </div>
  );
}
