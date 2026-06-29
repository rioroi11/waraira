"use client";

// Campos reutilizables de identidad venezolana: teléfono (con bandera + código de país,
// Venezuela por defecto) y cédula/RIF (con selector de tipo: V/E/J/G/P).
// Ambos emiten un string combinado por `onChange` y lo parsean al recibir `value`.

import { useState } from "react";
import { PAISES } from "@/lib/paises";

// ───────────────────────────── Teléfono ─────────────────────────────

function detectarCodigo(valor: string): { codigo: string; local: string } {
  const v = (valor ?? "").trim();
  if (v.startsWith("+")) {
    // Empareja el código más largo que calce (ej. +593 antes que +5).
    const ordenados = [...PAISES].sort((a, b) => b.codigo.length - a.codigo.length);
    for (const p of ordenados) {
      if (v.startsWith(p.codigo)) return { codigo: p.codigo, local: v.slice(p.codigo.length) };
    }
  }
  return { codigo: "+58", local: v.replace(/^\+/, "") };
}

export function CampoTelefono({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inicial = detectarCodigo(value);
  const [codigo, setCodigo] = useState(inicial.codigo);
  const [local, setLocal] = useState(inicial.local);

  function emitir(c: string, l: string) {
    const limpio = l.replace(/\D/g, "").replace(/^0+/, ""); // sin el 0 inicial de Venezuela
    onChange(limpio ? `${c}${limpio}` : "");
  }

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--tinta)]">{label}</span>}
      <div className="flex gap-2">
        <select
          className="campo"
          style={{ width: "auto", flex: "0 0 auto" }}
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value);
            emitir(e.target.value, local);
          }}
        >
          {PAISES.map((p) => (
            <option key={p.iso} value={p.codigo}>
              {p.bandera} {p.codigo}
            </option>
          ))}
        </select>
        <input
          className="campo"
          inputMode="tel"
          placeholder="424 0000000"
          value={local}
          onChange={(e) => {
            setLocal(e.target.value);
            emitir(codigo, e.target.value);
          }}
        />
      </div>
    </label>
  );
}

// ───────────────────────────── Cédula / RIF ─────────────────────────────

export const TIPOS_CEDULA = [
  { valor: "V", etiqueta: "V — Venezolano" },
  { valor: "E", etiqueta: "E — Extranjero" },
  { valor: "J", etiqueta: "J — Jurídico (RIF)" },
  { valor: "G", etiqueta: "G — Gubernamental" },
  { valor: "P", etiqueta: "P — Pasaporte" },
];

function detectarCedula(valor: string): { tipo: string; numero: string } {
  const m = (valor ?? "").trim().match(/^([VEJGP])[-\s]?(.*)$/i);
  if (m) return { tipo: m[1].toUpperCase(), numero: m[2] };
  return { tipo: "V", numero: valor ?? "" };
}

export function CampoCedula({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inicial = detectarCedula(value);
  const [tipo, setTipo] = useState(inicial.tipo);
  const [numero, setNumero] = useState(inicial.numero);

  function emitir(t: string, n: string) {
    const limpio = n.replace(/\D/g, "");
    onChange(limpio ? `${t}-${limpio}` : "");
  }

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--tinta)]">{label}</span>}
      <div className="flex gap-2">
        <select
          className="campo"
          style={{ width: "auto", flex: "0 0 auto" }}
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            emitir(e.target.value, numero);
          }}
        >
          {TIPOS_CEDULA.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.valor}
            </option>
          ))}
        </select>
        <input
          className="campo"
          inputMode="numeric"
          placeholder="12.345.678"
          value={numero}
          onChange={(e) => {
            setNumero(e.target.value);
            emitir(tipo, e.target.value);
          }}
        />
      </div>
    </label>
  );
}
