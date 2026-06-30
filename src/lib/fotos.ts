"use client";

// Waraira — Subida de fotos a un host PÚBLICO (para que el cartel "se busca" sea compartible).
//
// ───────────────────────────────────────────────────────────────────────────────────────────
// PENDIENTE DE INTEGRACIÓN (Rafa): el host definitivo será **Cloudflare** (R2 / Images).
//
// Este archivo es el ÚNICO punto de integración. Las páginas (alta de mascota, etc.) ya llaman
// a `subirFotoPublica(blob)` en el momento correcto. Para activar la subida, basta con rellenar
// el cuerpo de esta función y hacer que `subidaConfigurada()` devuelva true — NO hay que tocar la UI.
//
// Contrato:
//   - Entrada: un `Blob` (la foto capturada localmente).
//   - Salida: la URL pública PERMANENTE (CDN) de la foto, o `null` si no hay host configurado.
//   - Si devuelve `null`, la app sigue funcionando: usa la foto LOCAL (offline-first) y deja que
//     el usuario pegue una URL a mano. El cartel solo será compartible por link cuando haya URL.
//
// Sugerencia de integración con Cloudflare:
//   a) Cloudflare R2 + Worker que firma un PUT (subida directa desde el navegador), y el Worker
//      devuelve la URL pública del objeto (bucket con dominio público o vía Worker proxy).
//   b) Cloudflare Images: pedir un "direct creator upload URL" a tu backend, subir el blob ahí,
//      y usar la `variants[0]` (URL de entrega) como `fotoUrl`.
//   Recomendado leer la config de un env var, p.ej. `NEXT_PUBLIC_FOTO_UPLOAD_ENDPOINT`, para no
//   acoplar el código a un proveedor.
// ───────────────────────────────────────────────────────────────────────────────────────────

/** Endpoint de subida (lo define Rafa al integrar Cloudflare). Vacío = subida desactivada. */
const ENDPOINT = process.env.NEXT_PUBLIC_FOTO_UPLOAD_ENDPOINT ?? "";

/** ¿Hay un host de fotos configurado? (si no, se usa la foto local + URL manual). */
export function subidaConfigurada(): boolean {
  return Boolean(ENDPOINT);
}

/**
 * Sube `blob` al host público y devuelve su URL permanente, o `null` si no hay host configurado
 * o si la subida falla (no bloquea: el llamador cae al respaldo local). Best-effort.
 */
export async function subirFotoPublica(blob: Blob, opts?: { nombre?: string }): Promise<string | null> {
  void opts;
  if (!subidaConfigurada()) return null; // sin host: la app usa la foto local; URL manual disponible
  try {
    // TODO(Rafa): reemplazar por la subida real a Cloudflare (R2 / Images) y devolver la URL CDN.
    // Plantilla genérica (multipart) — ajústala al contrato de tu Worker/endpoint:
    const fd = new FormData();
    fd.append("file", blob);
    if (opts?.nombre) fd.append("nombre", opts.nombre);
    const res = await fetch(ENDPOINT, { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url ?? null;
  } catch {
    return null;
  }
}
