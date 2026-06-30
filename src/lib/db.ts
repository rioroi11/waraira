"use client";

// Waraira — Store local-first sobre IndexedDB.
//
// El TELÉFONO es la fuente de verdad en campo: todo funciona sin señal. Cuando hay
// red, `sync.ts` empuja lo pendiente a Convex (convergencia). Cada mutación:
//   1) marca el registro como `pendiente` de sincronizar,
//   2) escribe un evento append-only (R10 auditabilidad),
//   3) notifica a los componentes suscritos para re-render en vivo.

import { useEffect, useState } from "react";
import { generarId, type Base, type Evento } from "./model";

const DB_NOMBRE = "waraira";
// v3: añade `custodia`. v4: añade `brazaletes` (inventario) y `notificaciones`.
// v5: añade módulo Mascotas (`mascotas`, `custodiaMascota`, `avisosMascota`).
const DB_VERSION = 5;

export type Coleccion =
  | "menores"
  | "custodia"
  | "brazaletes"
  | "notificaciones"
  | "cordones"
  | "voluntarios"
  | "turnos"
  | "reclamos"
  | "avales"
  | "reportes"
  | "mascotas"
  | "custodiaMascota"
  | "avisosMascota"
  | "eventos";

const COLECCIONES: Coleccion[] = [
  "menores",
  "custodia",
  "brazaletes",
  "notificaciones",
  "cordones",
  "voluntarios",
  "turnos",
  "reclamos",
  "avales",
  "reportes",
  "mascotas",
  "custodiaMascota",
  "avisosMascota",
  "eventos",
];

// ───────────────────────────── Apertura de la base ─────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB no disponible (entorno servidor)"));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOMBRE, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const c of COLECCIONES) {
        if (!db.objectStoreNames.contains(c)) {
          db.createObjectStore(c, { keyPath: "id" });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(db: IDBDatabase, store: Coleccion, modo: IDBTransactionMode) {
  return db.transaction(store, modo).objectStore(store);
}

function pedir<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ───────────────────────────── Suscripción reactiva ─────────────────────────────

const oyentes = new Map<Coleccion, Set<() => void>>();

function suscribir(store: Coleccion, fn: () => void): () => void {
  if (!oyentes.has(store)) oyentes.set(store, new Set());
  oyentes.get(store)!.add(fn);
  return () => oyentes.get(store)?.delete(fn);
}

function notificar(store: Coleccion) {
  oyentes.get(store)?.forEach((fn) => fn());
}

// ───────────────────────────── Lectura ─────────────────────────────

export async function obtenerTodos<T>(store: Coleccion): Promise<T[]> {
  const db = await abrir();
  const items = await pedir<T[]>(tx(db, store, "readonly").getAll() as IDBRequest<T[]>);
  return items;
}

export async function obtener<T>(store: Coleccion, id: string): Promise<T | undefined> {
  const db = await abrir();
  return pedir<T | undefined>(tx(db, store, "readonly").get(id) as IDBRequest<T | undefined>);
}

// ───────────────────────────── Bitácora append-only ─────────────────────────────

async function registrarEvento(accion: string, descripcion: string, refTabla?: Coleccion, refId?: string) {
  const db = await abrir();
  const evento: Evento = {
    id: generarId(),
    accion,
    descripcion,
    refTabla,
    refId,
    createdAt: Date.now(),
  };
  await pedir(tx(db, "eventos", "readwrite").put(evento));
  notificar("eventos");
}

// ───────────────────────────── Escritura ─────────────────────────────

/** Crea un registro: asigna id/timestamps, lo marca pendiente y escribe un evento. */
export async function crear<T extends Base>(
  store: Coleccion,
  datos: Omit<T, keyof Base>,
  evento?: { accion: string; descripcion: string },
): Promise<T> {
  const db = await abrir();
  const ahora = Date.now();
  const registro = {
    ...(datos as object),
    id: generarId(),
    createdAt: ahora,
    updatedAt: ahora,
    syncStatus: "pendiente",
  } as T;
  await pedir(tx(db, store, "readwrite").put(registro));
  notificar(store);
  if (evento) await registrarEvento(evento.accion, evento.descripcion, store, registro.id);
  return registro;
}

/** Actualiza parcialmente un registro existente. */
export async function actualizar<T extends Base>(
  store: Coleccion,
  id: string,
  cambios: Partial<T>,
  evento?: { accion: string; descripcion: string },
): Promise<T | undefined> {
  const db = await abrir();
  const actual = await obtener<T>(store, id);
  if (!actual) return undefined;
  const registro = { ...actual, ...cambios, updatedAt: Date.now(), syncStatus: "pendiente" as const };
  await pedir(tx(db, store, "readwrite").put(registro));
  notificar(store);
  if (evento) await registrarEvento(evento.accion, evento.descripcion, store, id);
  return registro;
}

/** Marca un conjunto de registros como sincronizados (lo usa sync.ts). */
export async function marcarSincronizados(store: Coleccion, ids: string[]): Promise<void> {
  const db = await abrir();
  const s = tx(db, store, "readwrite");
  for (const id of ids) {
    const actual = await pedir<Base | undefined>(s.get(id) as IDBRequest<Base | undefined>);
    if (actual) await pedir(s.put({ ...actual, syncStatus: "sincronizado" }));
  }
  notificar(store);
}

export async function pendientes<T extends Base>(store: Coleccion): Promise<T[]> {
  const todos = await obtenerTodos<T>(store);
  return todos.filter((r) => r.syncStatus === "pendiente");
}

/** Borra un registro por id (lo usan, p.ej., los datos de ejemplo). */
export async function borrar(store: Coleccion, id: string): Promise<void> {
  const db = await abrir();
  await pedir(tx(db, store, "readwrite").delete(id));
  notificar(store);
}

// ───────────────────────────── Hooks de React ─────────────────────────────

/** Lee una colección completa y se re-renderiza cuando cambia. */
export function useColeccion<T>(store: Coleccion): { datos: T[]; cargando: boolean } {
  const [datos, setDatos] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    let vivo = true;
    const cargar = () =>
      obtenerTodos<T>(store)
        .then((d) => {
          if (vivo) {
            setDatos(d);
            setCargando(false);
          }
        })
        .catch(() => vivo && setCargando(false));
    cargar();
    const off = suscribir(store, cargar);
    return () => {
      vivo = false;
      off();
    };
  }, [store]);
  return { datos, cargando };
}

/** Lee un registro por id y se re-renderiza cuando su colección cambia. */
export function useRegistro<T>(store: Coleccion, id: string | undefined): { dato: T | undefined; cargando: boolean } {
  const [dato, setDato] = useState<T | undefined>(undefined);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    if (!id) {
      setCargando(false);
      return;
    }
    let vivo = true;
    const cargar = () =>
      obtener<T>(store, id)
        .then((d) => {
          if (vivo) {
            setDato(d);
            setCargando(false);
          }
        })
        .catch(() => vivo && setCargando(false));
    cargar();
    const off = suscribir(store, cargar);
    return () => {
      vivo = false;
      off();
    };
  }, [store, id]);
  return { dato, cargando };
}
