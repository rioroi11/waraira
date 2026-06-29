"use client";

// Primitivas de UI compartidas (mobile-first, alto contraste para campo).
import { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`tarjeta p-4 ${className}`}>{children}</div>;
}

export function Pill({
  children,
  tono = "verde",
}: {
  children: ReactNode;
  tono?: "verde" | "ambar" | "rojo" | "azul" | "gris" | "completo";
}) {
  const tonos: Record<string, { bg: string; fg: string }> = {
    verde: { bg: "var(--verde-claro)", fg: "var(--verde-osc)" },
    ambar: { bg: "var(--ambar-bg)", fg: "var(--ambar)" },
    rojo: { bg: "var(--rojo-bg)", fg: "var(--rojo)" },
    azul: { bg: "var(--azul-bg)", fg: "var(--azul)" },
    gris: { bg: "#eef2f0", fg: "var(--gris)" },
    // "completo" = cubierto por completo (abastecida/entregado): verde oscuro distintivo.
    completo: { bg: "var(--verde-osc)", fg: "#ffffff" },
  };
  const t = tonos[tono];
  return (
    <span className="pill" style={{ background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
}

export function Campo({ label, ...props }: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--tinta)]">{label}</span>}
      <input className="campo" {...props} />
    </label>
  );
}

export function Area({ label, ...props }: { label?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--tinta)]">{label}</span>}
      <textarea className="campo" rows={3} {...props} />
    </label>
  );
}

export function Selector({
  label,
  children,
  ...props
}: { label?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--tinta)]">{label}</span>}
      <select className="campo" {...props}>
        {children}
      </select>
    </label>
  );
}

export function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-6 mb-3 flex items-center gap-2 text-lg font-extrabold text-[var(--tinta)]">
      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--verde)]" />
      {children}
    </h2>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <div className="tarjeta p-6 text-center text-sm text-[var(--gris)]">{children}</div>
  );
}

/** Modal/pop-up sencillo (overlay + tarjeta). `acciones` son botones del pie. */
export function Modal({
  titulo,
  children,
  acciones,
  onCerrar,
}: {
  titulo?: ReactNode;
  children: ReactNode;
  acciones?: ReactNode;
  onCerrar?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div className="tarjeta w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        {titulo && <div className="text-base font-black text-[var(--tinta)]">{titulo}</div>}
        <div className="mt-2 text-sm text-[var(--gris)]">{children}</div>
        {acciones && <div className="mt-4 flex gap-2">{acciones}</div>}
      </div>
    </div>
  );
}
