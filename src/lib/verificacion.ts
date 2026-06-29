"use client";

// Waraira — Verificación de teléfono por código (SMS + WhatsApp).
//
// Al publicar una oferta/necesidad se envía UN MISMO código por DOS vías (SMS y WhatsApp) al
// número registrado, solo para asegurar que llegue. Verifica que el número EXISTE y RESPONDE
// (mata el caso "el número no aparece en WhatsApp"). La reconfirmación de 6 h NO pide código.
//
// Offline-first: si no hay señal NO se envía; el reporte se publica marcado "teléfono sin
// verificar" (feed separado) y se verifica luego, al volver la señal.
//
// Listo para conectar: si NEXT_PUBLIC_VERIF_ENDPOINT está configurado, el envío/verificación
// reales corren en ese backend (proveedor SMS = Twilio, WhatsApp = WhatsApp Cloud API). Si no,
// corre en MODO PRUEBA: genera el código localmente y lo muestra en pantalla para poder probar.

const CLAVE = "waraira-verif";
const VENCE_MS = 10 * 60 * 1000; // el código expira a los 10 min
const LARGO = 6;
const MAX_INTENTOS = 5;

interface Pendiente {
  codigo: string;
  creadoEn: number;
  intentos: number;
}

export function modoPrueba(): boolean {
  return !process.env.NEXT_PUBLIC_VERIF_ENDPOINT;
}

export function haySenal(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

/** Normaliza un teléfono conservando el "+" del exterior. Devuelve "" si es inválido. */
export function normalizarTelefono(t: string): string {
  const limpio = (t ?? "").replace(/[^\d+]/g, "");
  const soloDigitos = limpio.replace(/\D/g, "");
  if (soloDigitos.length < 7) return "";
  return limpio.startsWith("+") ? "+" + soloDigitos : soloDigitos;
}

function leer(): Record<string, Pendiente> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || "{}");
  } catch {
    return {};
  }
}
function escribir(m: Record<string, Pendiente>) {
  if (typeof window !== "undefined") localStorage.setItem(CLAVE, JSON.stringify(m));
}

function generar(): string {
  let s = "";
  for (let i = 0; i < LARGO; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export interface ResultadoEnvio {
  ok: boolean;
  modoPrueba: boolean;
  /** Solo en modo prueba: el código a mostrar en pantalla. */
  codigoPrueba?: string;
  error?: string;
}

/** Envía el código por SMS + WhatsApp al número. Requiere señal. */
export async function enviarCodigo(telefonoCrudo: string): Promise<ResultadoEnvio> {
  const telefono = normalizarTelefono(telefonoCrudo);
  if (!telefono) return { ok: false, modoPrueba: modoPrueba(), error: "Número inválido" };
  if (!haySenal())
    return { ok: false, modoPrueba: modoPrueba(), error: "Sin señal: se publica como «teléfono sin verificar»" };

  const endpoint = process.env.NEXT_PUBLIC_VERIF_ENDPOINT;
  if (endpoint) {
    // Backend real: genera y envía el mismo código por SMS y WhatsApp; nosotros no lo guardamos.
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "enviar", telefono }),
      });
      if (!res.ok) return { ok: false, modoPrueba: false, error: "No se pudo enviar el código" };
      return { ok: true, modoPrueba: false };
    } catch {
      return { ok: false, modoPrueba: false, error: "No se pudo enviar el código" };
    }
  }

  // Modo prueba: generamos y guardamos el código localmente; se muestra en pantalla.
  const codigo = generar();
  const m = leer();
  m[telefono] = { codigo, creadoEn: Date.now(), intentos: 0 };
  escribir(m);
  return { ok: true, modoPrueba: true, codigoPrueba: codigo };
}

export interface ResultadoVerificacion {
  ok: boolean;
  error?: string;
}

/** Verifica el código que escribió la persona. */
export async function verificarCodigo(
  telefonoCrudo: string,
  intento: string,
): Promise<ResultadoVerificacion> {
  const telefono = normalizarTelefono(telefonoCrudo);
  const limpio = (intento ?? "").replace(/\D/g, "");

  const endpoint = process.env.NEXT_PUBLIC_VERIF_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "verificar", telefono, codigo: limpio }),
      });
      const data = await res.json().catch(() => ({}));
      return res.ok && data?.ok ? { ok: true } : { ok: false, error: "Código incorrecto" };
    } catch {
      return { ok: false, error: "No se pudo verificar (sin señal)" };
    }
  }

  // Modo prueba
  const m = leer();
  const p = m[telefono];
  if (!p) return { ok: false, error: "Pide un código primero" };
  if (Date.now() - p.creadoEn > VENCE_MS) {
    delete m[telefono];
    escribir(m);
    return { ok: false, error: "El código venció, pide uno nuevo" };
  }
  if (p.intentos >= MAX_INTENTOS) {
    delete m[telefono];
    escribir(m);
    return { ok: false, error: "Demasiados intentos, pide un código nuevo" };
  }
  if (p.codigo !== limpio) {
    p.intentos++;
    escribir(m);
    return { ok: false, error: "Código incorrecto" };
  }
  delete m[telefono];
  escribir(m);
  return { ok: true };
}
