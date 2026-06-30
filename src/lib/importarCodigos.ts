// Importador tolerante de códigos de brazalete: lee CSV, TXT, Excel (.xlsx), PDF o texto pegado
// ("punto y letra") y extrae los códigos. Las librerías pesadas (xlsx, pdfjs) se cargan en diferido
// solo cuando hacen falta, para no inflar el bundle ni tocar el navegador en SSR.

// Por defecto: tokens alfanuméricos (con guiones) de 4+ caracteres que contengan al menos un dígito.
// Así se filtran palabras comunes (nombre, codigo, lote…) sin exigir un formato fijo de proveedor.
const PATRON_DEFECTO = /[A-Za-z0-9][A-Za-z0-9-]{3,}/g;

// Tokens que el patrón por defecto NO debe tomar como código: fechas, teléfonos, puro número.
function pareceRuido(tok: string): boolean {
  return (
    /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/.test(tok) || // fecha 12/05/2026
    /^\d{4}-?\d{2}-?\d{2}$/.test(tok) || // fecha 2026-06-30
    /^\+?\d[\d-]{6,}$/.test(tok) || // teléfono
    !/[A-Za-z]/.test(tok) // sin ninguna letra (cantidad, n° de lote suelto…)
  );
}

/** Extrae códigos de un texto: deduplicados y en orden de aparición. `patron` opcional lo afina. */
export function extraerCodigos(texto: string, patron?: string): string[] {
  let re: RegExp;
  let usaDefecto = !patron?.trim();
  try {
    re = usaDefecto ? new RegExp(PATRON_DEFECTO) : new RegExp(patron!.trim(), "gi");
  } catch {
    re = new RegExp(PATRON_DEFECTO);
    usaDefecto = true; // regex inválido → caemos al patrón por defecto Y sus filtros
  }
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const m of texto.matchAll(re)) {
    const tok = m[0].trim().toUpperCase();
    if (!tok) continue;
    // Con el patrón por defecto: exige un dígito Y descarta fechas/teléfonos/números sueltos.
    if (usaDefecto && (!/[0-9]/.test(tok) || pareceRuido(tok))) continue;
    if (vistos.has(tok)) continue;
    vistos.add(tok);
    out.push(tok);
  }
  return out;
}

/** Genera un rango de códigos PREFIJO+número (p.ej. WRA-001 … WRA-150). [] si no es un rango válido. */
export function codigosDeRango(desde: string, hasta: string): string[] {
  const a = desde.trim().toUpperCase();
  const b = hasta.trim().toUpperCase();
  const ma = a.match(/^(.*?)(\d+)$/);
  const mb = b.match(/^(.*?)(\d+)$/);
  if (!ma || !mb || ma[1] !== mb[1]) return [];
  const prefijo = ma[1];
  const ancho = Math.max(ma[2].length, mb[2].length); // relleno uniforme aunque «hasta» tenga más dígitos
  const ini = parseInt(ma[2], 10);
  const fin = parseInt(mb[2], 10);
  if (fin < ini || fin - ini > 100000) return [];
  const out: string[] = [];
  for (let n = ini; n <= fin; n++) out.push(`${prefijo}${String(n).padStart(ancho, "0")}`);
  return out;
}

/** Lee un archivo y devuelve su texto plano. XLSX → CSV; PDF → texto de las páginas. */
const LIMITE_BYTES = 25 * 1024 * 1024; // 25 MB: corta OOM/congelamiento antes de leer el archivo

export async function textoDeArchivo(file: File): Promise<string> {
  if (file.size > LIMITE_BYTES) {
    throw new Error(`El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB; el máximo es 25 MB. ¿Seguro que es la lista de códigos?`);
  }
  const nombre = file.name.toLowerCase();

  if (nombre.endsWith(".xlsx") || nombre.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    return wb.SheetNames.map((n) => XLSX.utils.sheet_to_csv(wb.Sheets[n])).join("\n");
  }

  if (nombre.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    } catch {
      /* algunos entornos resuelven el worker por su cuenta */
    }
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
    let texto = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      texto += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
    }
    return texto;
  }

  // CSV, TXT o cualquier texto plano.
  return file.text();
}

/** Conveniencia: del archivo a la lista de códigos en un paso. */
export async function codigosDeArchivo(file: File, patron?: string): Promise<string[]> {
  const texto = await textoDeArchivo(file);
  return extraerCodigos(texto, patron);
}
