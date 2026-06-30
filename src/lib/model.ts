// Waraira — Modelo de dominio del módulo de Niños (UASC) + Insumos.
//
// Principios codificados:
//  - "Barrera baja, traza alta": reportar/censar es fácil; todo queda en `eventos`.
//  - Ciclo IDTR (Identificación, Documentación, Tracing, Verificación, Reunificación,
//    Seguimiento) como máquina de estado del menor. `reunificado` es INALCANZABLE
//    sin verificación + autorización de autoridad (anti-trata).
//  - Privacidad estricta: identidad/imagen/ubicación del menor jamás públicas
//    (LOPNNA art. 65). El público solo ve agregados.
//  - Waraira DERIVA al Consejo de Protección / Tribunal; no dicta custodia.
//
// Fuentes: ICRC Inter-agency Guiding Principles on UASC (2004); CPMS 2019 (Normas
// 13/15/17); UNHCR Best Interests Procedure (2021/2024); IFRC CFS Operational Guidance;
// LOPNNA (arts. 65, 91, 126, 127, 128, 160, 177, 272); Constitución (arts. 28, 54, 60).

// ───────────────────────────── Identificadores ─────────────────────────────

// Sin caracteres ambiguos (0/O, 1/I/L) para lectura humana sobre una manilla.
const ALFABETO_CODIGO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Genera un código de brazalete tipo `WRA-7K3Q`. */
export function generarCodigo(): string {
  let s = "";
  for (let i = 0; i < 4; i++) {
    s += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return `WRA-${s}`;
}

/** Código PROVISIONAL `PRV-7K3Q`: se asigna a un niño que aún NO tiene brazalete físico.
 *  Cuando luego se le coloca el brazalete impreso, el código se actualiza al del brazalete y el
 *  provisional queda como historial (`Menor.codigoProvisional`). */
export function generarCodigoProvisional(): string {
  let s = "";
  for (let i = 0; i < 4; i++) {
    s += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return `PRV-${s}`;
}

/** Código interno de mascota tipo `MAS-7K3Q` (mismo alfabeto legible, sin brazalete físico). */
export function generarCodigoMascota(): string {
  let s = "";
  for (let i = 0; i < 4; i++) {
    s += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return `MAS-${s}`;
}

/** ID interno de registro (no se muestra; el visible es el código de brazalete). */
export function generarId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ───────────────────────────── Tipos base ─────────────────────────────

export type SyncStatus = "pendiente" | "sincronizado";

/** Campos comunes a todo registro local. */
export interface Base {
  id: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

// ───────────────────────────── Menor (UASC) ─────────────────────────────

/** Estatus del niño (CRC/ICRC). Mutable: un "no acompañado" puede pasar a "separado". */
export type EstatusMenor = "separado" | "no_acompanado" | "huerfano" | "desconocido";

export const ESTATUS_MENOR: { valor: EstatusMenor; etiqueta: string; ayuda: string }[] = [
  { valor: "no_acompanado", etiqueta: "No acompañado", ayuda: "Solo, sin ningún adulto responsable." },
  { valor: "separado", etiqueta: "Separado", ayuda: "Con un adulto que no es su cuidador habitual." },
  { valor: "huerfano", etiqueta: "Huérfano (confirmado)", ayuda: "Ambos padres fallecidos, confirmado." },
  { valor: "desconocido", etiqueta: "Por determinar", ayuda: "Aún no se sabe; se completa luego." },
];

/** Estado del ciclo IDTR. El orden importa: define qué transiciones son válidas. */
export type EstadoIDTR =
  | "identificado"
  | "documentado"
  | "en_busqueda"
  | "en_verificacion"
  | "derivado_autoridad"
  | "reunificado"
  | "seguimiento";

export const ESTADOS_IDTR: { valor: EstadoIDTR; etiqueta: string; ayuda: string }[] = [
  { valor: "identificado", etiqueta: "Identificado", ayuda: "Se sabe que está separado y dónde está." },
  { valor: "documentado", etiqueta: "Documentado", ayuda: "Expediente con foto, señas, ropa y datos." },
  { valor: "en_busqueda", etiqueta: "En búsqueda", ayuda: "Buscando a su familia (tracing)." },
  { valor: "en_verificacion", etiqueta: "En verificación", ayuda: "Validando un reclamo de familiar." },
  { valor: "derivado_autoridad", etiqueta: "Derivado a autoridad", ayuda: "Caso en manos del Consejo/Tribunal." },
  { valor: "reunificado", etiqueta: "Reunificado", ayuda: "Entregado a su familia (lo decide la autoridad)." },
  { valor: "seguimiento", etiqueta: "En seguimiento", ayuda: "Visitas posteriores para confirmar bienestar." },
];

/** Transiciones permitidas. `reunificado` solo es accesible desde derivación + gate. */
export const TRANSICIONES_IDTR: Record<EstadoIDTR, EstadoIDTR[]> = {
  identificado: ["documentado", "en_busqueda", "derivado_autoridad"],
  documentado: ["en_busqueda", "derivado_autoridad"],
  en_busqueda: ["en_verificacion", "derivado_autoridad"],
  en_verificacion: ["en_busqueda", "derivado_autoridad"],
  derivado_autoridad: ["reunificado", "en_busqueda"],
  reunificado: ["seguimiento"],
  seguimiento: [],
};

export type Sexo = "f" | "m" | "desconocido";

export interface Menor extends Base {
  codigo: string; // código del brazalete físico; o provisional (PRV-) si aún no tiene brazalete
  // Historial: si el niño se registró con un provisional y luego se le colocó el brazalete físico,
  // aquí queda el código que tuvo en principio (el `codigo` pasa a ser el del brazalete escaneado).
  codigoProvisional?: string;
  brazaleteProvisional?: boolean; // true mientras solo tiene código provisional (sin brazalete físico)
  estatus: EstatusMenor;
  estadoIDTR: EstadoIDTR;

  // P1 — sin esto se pierde al niño (prioridad ICRC)
  fotoBlob?: Blob; // CONFIDENCIAL — jamás pública
  edadEstimadaMin?: number;
  edadEstimadaMax?: number;
  sexo: Sexo;
  senasFisicas?: string; // cicatrices, marcas, dentición, discapacidad
  ropaYObjetos?: string; // descritos; conservar físicamente los objetos
  lugarHallazgo: string;
  entidad?: string;
  municipio?: string;
  parroquia: string;
  punto?: string;
  cordonId?: string;
  encontradoHora: number; // fecha/hora del hallazgo
  encontradoPor?: string; // quién lo encontró/entregó (contacto)
  lat?: number;
  lng?: number;

  // P2 — identidad / vínculo
  alias?: string; // apodo o nombre provisional
  nombre?: string; // nombre completo (capa restringida)
  nombrePadre?: string;
  nombreMadre?: string;
  hermanos?: string;
  comunidadOrigen?: string;
  conQuienEstaba?: string; // circunstancias de la separación
  idioma?: string;

  // P3 — seguridad inmediata
  estadoSalud?: string;
  necesidadesMedicas?: string;
  senalesRiesgo?: string;
  cuidoActual?: string; // con quién duerme hoy
  custodioActualId?: string; // voluntario que lo resguarda de hecho

  // P4 — gobernanza / legal
  notificadoConsejo?: number; // sello de tiempo de notificación al Consejo (art. 91)
  notificadoConsejoNota?: string;
  // Acuse de la notificación a la autoridad (puente obligatorio): quién recibió el paquete
  // (Consejo / Ministerio Público / Cruz Roja RFL), por qué vía y su referencia/acta.
  acuseAutoridad?: AcuseAutoridad;
  testigosComunidad?: string; // futuros testigos de verificación
  verificacionCompleta: boolean; // gate de reunificación
  // Detalles privados que SOLO la familia sabría (prueba anti-suplantación). Nunca público.
  detallesPrivados?: string;
}

/** Acuse de recibo de la autoridad sobre la notificación del caso (LOPNNA art. 91). */
export interface AcuseAutoridad {
  receptor: string; // Consejo de Protección de X / Fiscalía N° / Cruz Roja RFL
  via: string; // presencial, oficio, WhatsApp, correo, llamada…
  fecha: number; // cuándo se obtuvo el acuse
  referencia?: string; // N° de oficio/acta/expediente que devolvió la autoridad
}

/** No puede pasar a `reunificado` sin esto. Devuelve [puede, motivos faltantes]. */
export function puedeReunificar(m: Menor, reclamoAprobado: boolean): [boolean, string[]] {
  const faltan: string[] = [];
  if (!m.verificacionCompleta) faltan.push("Verificación de parentesco incompleta");
  if (m.estadoIDTR !== "derivado_autoridad") faltan.push("El caso debe estar derivado a la autoridad");
  if (!reclamoAprobado) faltan.push("Falta la autorización de la autoridad sobre el reclamo");
  return [faltan.length === 0, faltan];
}

// ───────────────────────────── Cadena de custodia del menor (Registro 1) ─────────────────────────────
//
// El expediente (`Menor`) dice QUIÉN es el niño; la cadena de custodia dice QUIÉN respondió por él,
// CUÁNDO y DÓNDE, paso a paso. Es un registro APPEND-ONLY: cada evento se crea y nunca se reescribe
// (igual que `eventos`). Encadena siempre contra el mismo `codigo` del brazalete.
//
// Invariantes que codifica:
//   - Regla de dos personas: ningún acto de custodia sin registrador + testigo distintos.
//   - R3 "confirma el receptor": un traspaso/salida exige la firma de quien RECIBE.
//   - Transparencia como salvaguarda: la traza inmutable es lo que previene el abuso.

export type TipoCustodia =
  | "registro_inicial" // marcado: primer evento, vincula el UID del brazalete al registrador
  | "traspaso" // cambio de cuidador de hecho (entre voluntarios / entre nodos)
  | "salida_con_adulto" // un adulto se lleva al niño antes del ruteo: registrar IGUAL + notificar
  | "resguardo" // ingreso a un nodo seguro / punto de captación
  | "reemision_brazalete"; // brazalete perdido/roto: UID nuevo vinculado al viejo (sin reescribir)

/**
 * Persona involucrada en un acto de custodia (registrador, testigo, custodio que sigue, o quien
 * recibe). Lleva identidad dura (cédula) y, cuando está presente pero no tiene la app en su propio
 * teléfono, declara por el teléfono del registrador y se le pide FOTO como respaldo del acto.
 */
// Roles de la cadena de custodia (sin saltarse cabos: cada eslabón se nombra y queda atado).
export type RolPersona =
  | "registrador" // quien COLOCA el brazalete al niño (centro o grupo móvil)
  | "responsable_brazalete" // quien recibió ese brazalete al entregarse al centro/grupo
  | "testigo"
  | "custodio" // custodio temporal del niño
  | "recibe"; // quien recibe en traspaso/salida

/** Si la persona no está presente, quién la suplanta (declara y firma en su lugar). */
export interface SuplenteActo {
  nombre: string;
  cedula?: string;
  telefono?: string;
  fotoBlob?: Blob; // CONFIDENCIAL — respaldo de quien suplanta
}

export interface PersonaActo {
  rol: RolPersona;
  nombre: string;
  cedula?: string;
  telefono?: string;
  fotoBlob?: Blob; // CONFIDENCIAL — respaldo del acto; jamás público ni sincronizado
  presente: boolean; // ¿está físicamente presente en el acto?
  tieneApp: boolean; // ¿recibirá la notificación en su propia app/teléfono?
  declaraAqui: boolean; // sin celular propio: declara por este mismo teléfono
  confirma: boolean; // firma/confirmación del acto
  suplente?: SuplenteActo; // si NO está presente, quién declara/firma en su lugar
}

/**
 * Reglas de respaldo de una persona del acto:
 *  - presente y SIN app → declara aquí: su foto es el respaldo (se exige).
 *  - NO presente → debe decirse quién la suplanta (nombre + foto del suplente).
 */
export function faltaPersona(p: PersonaActo): string[] {
  const faltan: string[] = [];
  if (!p.nombre?.trim()) faltan.push("Nombre");
  if (!p.cedula?.trim()) faltan.push("Cédula");
  if (!p.confirma) faltan.push("Confirmación");
  if (p.presente) {
    if (!p.tieneApp && !p.fotoBlob) faltan.push("Foto (presente y sin app: declara aquí)");
  } else {
    if (!p.suplente?.nombre?.trim()) faltan.push("Quién suplanta (no está presente)");
    if (!p.suplente?.cedula?.trim()) faltan.push("Cédula de quien suplanta");
    if (!p.suplente?.fotoBlob) faltan.push("Foto de quien suplanta");
  }
  return faltan;
}

export const TIPOS_CUSTODIA: { valor: TipoCustodia; etiqueta: string; ayuda: string; requiereRecibe: boolean }[] = [
  { valor: "registro_inicial", etiqueta: "Registro inicial (marcado)", ayuda: "Se coloca el brazalete y el registrador asume el cuido de hecho.", requiereRecibe: false },
  { valor: "resguardo", etiqueta: "Resguardo en nodo seguro", ayuda: "El niño ingresa a un cordón / punto de captación oficial.", requiereRecibe: false },
  { valor: "traspaso", etiqueta: "Traspaso de custodia de hecho", ayuda: "Otro voluntario/nodo asume el cuido. Lo confirma quien recibe (R3).", requiereRecibe: true },
  { valor: "salida_con_adulto", etiqueta: "Salida con un adulto", ayuda: "Un adulto se lo lleva antes del ruteo. Registrar igual: cédula y destino. Notificar a la autoridad.", requiereRecibe: true },
  { valor: "reemision_brazalete", etiqueta: "Reemisión de brazalete", ayuda: "Brazalete perdido/roto: se emite un UID nuevo vinculado al anterior.", requiereRecibe: false },
];

/**
 * Evento de custodia (append-only). Una vez creado NO se actualiza. La UI no debe exponer edición.
 * La firma se modela como booleano (confirmación en pantalla), igual que en `Reclamo`.
 */
export interface EventoCustodia extends Base {
  menorId: string; // id interno del Menor
  codigo: string; // UID del brazalete — se encadena siempre contra el mismo
  tipo: TipoCustodia;

  // Regla de dos personas
  registradorId?: string; // voluntario que ejecuta (si está en el sistema)
  registradorNombre: string;
  testigoNombre: string; // segundo adulto que co-firma

  // R3 — confirma el receptor (para traspaso / salida_con_adulto)
  recibeNombre?: string;
  recibeContacto?: string;
  recibeDocumento?: string; // cédula del adulto (clave en salida_con_adulto)

  // Confirmaciones (firmas en pantalla)
  firmaEntrega: boolean;
  firmaTestigo: boolean;
  firmaRecibe: boolean;

  // Personas del acto (registrador/testigo/custodio/recibe) con identidad + presencia + foto.
  // Los campos planos de arriba se mantienen como display; `personas` es el detalle completo.
  personas?: PersonaActo[];
  braceleteCodigo?: string; // brazalete vinculado en este acto (= codigo, si lo hay)
  notificados?: string[]; // nombres a quienes se generó notificación

  // Snapshot del destino del brazalete + coincidencia de ubicación (auditoría de la cadena).
  braceleteDestinoTipo?: TipoDestino;
  braceleteDestinoNombre?: string;
  ubicacionCoincide?: boolean; // ¿el censo coincide con donde se entregó el brazalete?
  colocadoPorGrupoMovil?: boolean; // el brazalete lo coloca un grupo móvil (no un centro fijo)
  brazaleteYaPuesto?: boolean; // el niño ya portaba el brazalete (no se colocó en este acto)

  // Contexto
  nodoId?: string; // Cordon de resguardo / punto de captación
  lugar?: string;
  entidad?: string;
  municipio?: string;
  parroquia?: string;
  punto?: string;
  lat?: number;
  lng?: number;
  nota?: string;
  codigoAnterior?: string; // solo en reemision_brazalete
}

/**
 * Gate de la cadena de custodia: qué falta para poder asentar un evento.
 * Patrón espejo de `faltantesReclamo`. Devuelve la lista de faltantes ([] = listo).
 */
export function faltaParaTraspaso(e: Partial<EventoCustodia>): string[] {
  const faltan: string[] = [];
  if (!e.registradorNombre?.trim()) faltan.push("Nombre de quien registra");
  if (!e.testigoNombre?.trim()) faltan.push("Nombre del testigo (regla de dos personas)");
  if (
    e.registradorNombre &&
    e.testigoNombre &&
    e.registradorNombre.trim().toLowerCase() === e.testigoNombre.trim().toLowerCase()
  )
    faltan.push("El registrador y el testigo deben ser personas distintas");
  if (!e.firmaEntrega) faltan.push("Firma de quien entrega/registra");
  if (!e.firmaTestigo) faltan.push("Firma del testigo");

  const requiereRecibe = TIPOS_CUSTODIA.find((t) => t.valor === e.tipo)?.requiereRecibe;
  if (requiereRecibe) {
    if (!e.recibeNombre?.trim()) faltan.push("Nombre de quien recibe");
    if (!e.firmaRecibe) faltan.push("Firma de quien recibe (R3)");
    if (e.tipo === "salida_con_adulto" && !e.recibeDocumento?.trim())
      faltan.push("Cédula del adulto que se lleva al niño");
  }
  if (e.tipo === "reemision_brazalete" && !e.codigoAnterior?.trim())
    faltan.push("Código del brazalete anterior");

  // Si se capturaron personas estructuradas, validar la regla de foto (presente sin app).
  for (const p of e.personas ?? []) {
    for (const f of faltaPersona(p)) faltan.push(`${etiquetaRol(p.rol)}: ${f}`);
  }
  return faltan;
}

export const ROLES_PERSONA: { valor: RolPersona; etiqueta: string }[] = [
  { valor: "registrador", etiqueta: "Quien coloca el brazalete" },
  { valor: "responsable_brazalete", etiqueta: "Responsable del brazalete (centro/grupo)" },
  { valor: "testigo", etiqueta: "Testigo" },
  { valor: "custodio", etiqueta: "Custodio temporal del niño" },
  { valor: "recibe", etiqueta: "Quien recibe" },
];

export const etiquetaRol = (r: RolPersona) => ROLES_PERSONA.find((x) => x.valor === r)?.etiqueta ?? r;

// ───────────────────────────── Brazalete (inventario: proveedor → lote → destino) ─────────────
//
// Los brazaletes vienen IMPRESOS con su código de un proveedor. Se registran en lotes (subiendo el
// archivo del proveedor, pegando lista, o por rango) → quedan `en_stock`. Un lote se FRACCIONA y se
// ASIGNA a un destino (centro oficial / hospital / espacio acondicionado / grupo móvil) con su lista
// de responsables → `entregado`. Al colocarse en un niño → `colocado`. Nunca se genera un código
// nuevo al censar: siempre se enlaza uno ya entregado.

export type TipoDestino = "centro_oficial" | "hospital" | "espacio_acondicionado" | "grupo_movil";

export const TIPOS_DESTINO: { valor: TipoDestino; etiqueta: string }[] = [
  { valor: "centro_oficial", etiqueta: "Centro oficial" },
  { valor: "hospital", etiqueta: "Hospital" },
  { valor: "espacio_acondicionado", etiqueta: "Espacio acondicionado (contingencia)" },
  { valor: "grupo_movil", etiqueta: "Grupo móvil" },
];

export const etiquetaDestino = (t?: TipoDestino) => TIPOS_DESTINO.find((x) => x.valor === t)?.etiqueta ?? "Sin asignar";

export type EstadoBrazalete = "en_stock" | "entregado" | "colocado" | "anulado";

export const ESTADOS_BRAZALETE: { valor: EstadoBrazalete; etiqueta: string }[] = [
  { valor: "en_stock", etiqueta: "En stock (sin asignar)" },
  { valor: "entregado", etiqueta: "Entregado a destino" },
  { valor: "colocado", etiqueta: "Colocado en un niño" },
  { valor: "anulado", etiqueta: "Anulado" },
];

/** Responsable que recibió el brazalete en su destino (centro/grupo móvil). Identidad dura. */
export interface ResponsableBrazalete {
  nombre: string;
  cedula?: string;
  telefono?: string;
  fotoBlob?: Blob; // CONFIDENCIAL — jamás público ni sincronizado
  esGrupoMovil?: boolean; // este responsable opera con un grupo móvil
}

export interface Brazalete extends Base {
  codigo: string; // tal cual viene impreso del proveedor (string arbitrario)
  estado: EstadoBrazalete;
  proveedor?: string;
  lote?: string; // etiqueta del lote del proveedor

  // Destino (centro/grupo) — se llena al asignar (fraccionar el lote).
  destinoTipo?: TipoDestino;
  destinoNombre?: string; // nombre del centro / hospital / grupo móvil
  responsables?: ResponsableBrazalete[];
  entidad?: string;
  municipio?: string;
  parroquia?: string;
  punto?: string;
  lat?: number;
  lng?: number;
  fechaEntrega?: number; // cuándo se asignó al destino

  menorId?: string; // se llena al colocarlo en un niño
  notas?: string;
}

/** Busca un brazalete por código (normaliza mayúsculas/espacios). */
export function brazaletePorCodigo(codigo: string, lista: Brazalete[]): Brazalete | undefined {
  const c = codigo.trim().toUpperCase();
  return lista.find((b) => b.codigo.trim().toUpperCase() === c);
}

// ───────────────────────────── Notificación + constancia ─────────────────────────────
//
// Dos usos: (a) avisar a testigos/custodios con app que quedaron en la cadena; (b) pedir CONSTANCIA
// a los responsables de un brazalete cuando se usa en un niño censado en OTRA ubicación. El push real
// entre teléfonos requiere Convex + Web Push/VAPID (roadmap): aquí va el registro local + el aviso del
// navegador. Nunca bloquea el registro del niño; solo deja asentada la cadena completa.

export type RespuestaConstancia = "testigo_presente" | "conocimiento_distancia" | "desconoce";

export const RESPUESTAS_CONSTANCIA: { valor: RespuestaConstancia; etiqueta: string }[] = [
  { valor: "testigo_presente", etiqueta: "Soy testigo presente" },
  { valor: "conocimiento_distancia", etiqueta: "Tengo conocimiento a distancia" },
  { valor: "desconoce", etiqueta: "Lo desconozco" },
];

export interface Notificacion extends Base {
  paraNombre: string;
  paraCedula?: string;
  paraTelefono?: string;
  tipo: string; // "custodia.testigo", "custodia.constancia", …
  titulo: string;
  cuerpo: string;
  refMenorId?: string;
  refCodigo?: string;
  leida: boolean;
  // Constancia (cuando el brazalete se usó en otra ubicación): se pide al responsable confirmar.
  requiereConstancia?: boolean;
  respuesta?: RespuestaConstancia;
  respondidaEn?: number;
}

// ───────────────────────────── Cordón (Espacio Seguro / CFS) ─────────────────────────────

export type EstadoCordon = "activo" | "cerrado";

/** Checklist de perímetro seguro (IFRC CFS Operational Guidance). */
export interface PerimetroCFS {
  libreDePeligros: boolean;
  lejosDeTrafico: boolean;
  lejosDeMilitares: boolean;
  delimitado: boolean;
  banosSeparados: boolean;
  botiquin: boolean;
  controlDeAcceso: boolean;
}

export const CRITERIOS_PERIMETRO: { clave: keyof PerimetroCFS; etiqueta: string }[] = [
  { clave: "libreDePeligros", etiqueta: "Libre de peligros (escombros, hoyos, estructuras inestables)" },
  { clave: "lejosDeTrafico", etiqueta: "A distancia segura del tráfico" },
  { clave: "lejosDeMilitares", etiqueta: "Lejos de cuarteles / instalaciones militares" },
  { clave: "delimitado", etiqueta: "Perímetro delimitado (cercado o señalizado)" },
  { clave: "banosSeparados", etiqueta: "Baños/letrinas separados para niñas y niños, con agua" },
  { clave: "botiquin", etiqueta: "Botiquín de primeros auxilios + extintor" },
  { clave: "controlDeAcceso", etiqueta: "Control de acceso y check-in/out por niño" },
];

export const CAPACIDAD_MAX_CORDON = 125; // niños por espacio estático por turno (guía CFS)

export interface Cordon extends Base {
  nombre: string;
  entidad?: string;
  municipio?: string;
  parroquia: string;
  punto: string;
  lat?: number;
  lng?: number;
  coordinador?: string; // contacto
  capacidad: number; // ≤ CAPACIDAD_MAX_CORDON
  estado: EstadoCordon;
  perimetro: PerimetroCFS;
  notas?: string;
}

// ───────────────────────────── Ratios CFS (cálculo conmensurable) ─────────────────────────────

/** Ratios cuidador:niño por franja de edad (Save the Children / práctica CPMS Norma 15). */
export interface ConteoPorEdad {
  bebes: number; // 0–2 años   → 1 adulto : 4 niños
  pequenos: number; // 2–4 años → 2 adultos : 15 niños (≈ 1:7.5)
  mayores: number; // 5+ años   → 1 adulto : 18 niños
}

export const RATIOS = { bebes: 4, pequenos: 7.5, mayores: 18 } as const;
export const MINIMO_FACILITADORES = 2; // regla de dos adultos; nunca menos de 2

/**
 * Voluntarios necesarios por turno para un grupo de niños, respetando ratios por edad
 * y el mínimo de 2 adultos (regla de dos adultos). Conmensurable: alimenta el déficit.
 */
export function voluntariosNecesarios(c: ConteoPorEdad): number {
  const porRatio =
    Math.ceil(c.bebes / RATIOS.bebes) +
    Math.ceil(c.pequenos / RATIOS.pequenos) +
    Math.ceil(c.mayores / RATIOS.mayores);
  const total = c.bebes + c.pequenos + c.mayores;
  if (total === 0) return 0;
  return Math.max(MINIMO_FACILITADORES, porRatio);
}

// ───────────────────────────── Voluntario ─────────────────────────────

export type RolVoluntario =
  | "facilitador"
  | "coordinador"
  | "verificador"
  | "censista"
  | "registrador"
  | "logistica";

export const ROLES_VOLUNTARIO: { valor: RolVoluntario; etiqueta: string; ayuda: string }[] = [
  { valor: "facilitador", etiqueta: "Facilitador de cordón", ayuda: "Cuida y acompaña niños en el espacio seguro." },
  { valor: "coordinador", etiqueta: "Coordinador de zona", ayuda: "Organiza el cordón, turnos y aprueba registros." },
  { valor: "verificador", etiqueta: "Verificador", ayuda: "Conduce la verificación de reclamos de familiares." },
  { valor: "censista", etiqueta: "Censista", ayuda: "Registra niños (censo IDTR)." },
  // Quien puede marcar/registrar y traspasar la custodia de hecho de un menor. Exige vetting.
  { valor: "registrador", etiqueta: "Registrador de menores", ayuda: "Marca y traspasa la custodia de hecho de un menor (regla de dos personas)." },
  { valor: "logistica", etiqueta: "Logística / insumos", ayuda: "Balance de necesidades y aportes." },
];

/** Pipeline de integración: cada paso es un gate. No hay turno sin vetting + código firmado. */
export interface Vetting {
  screening: boolean; // entrevista realizada
  antecedentes: boolean; // verificación de antecedentes (si el Estado provee)
  validacionComunitaria: boolean; // alternativa: la comunidad avala
  referencias: boolean; // referencias de empleadores/comunidad
}

export const PASOS_VETTING: { clave: keyof Vetting; etiqueta: string }[] = [
  { clave: "screening", etiqueta: "Entrevista de selección realizada" },
  { clave: "antecedentes", etiqueta: "Antecedentes verificados (o no disponible por el Estado)" },
  { clave: "validacionComunitaria", etiqueta: "Validación comunitaria (la comunidad lo avala)" },
  { clave: "referencias", etiqueta: "Referencias confirmadas" },
];

export type EstadoValidacion = "pendiente" | "validado" | "rechazado";

export interface Voluntario extends Base {
  nombre: string;
  contacto?: string;
  telefono?: string;
  cedula?: string;
  roles: RolVoluntario[];
  entidad?: string;
  municipio?: string;
  parroquia?: string;
  sector?: string; // zona donde vive (barrio/sector dentro de la parroquia)
  zonaDe?: string; // de qué zona es (origen), si difiere
  lat?: number;
  lng?: number;
  habilidades?: string;
  vetting: Vetting;
  codigoConductaFirmado: boolean;
  capacitacionMinima: boolean; // protección infantil + PAP + cómo derivar
  verificado: boolean; // derivado de los gates de arriba
  // Validación comunitaria: los vecinos avalan a quien va a cuidar niños.
  estadoValidacion: EstadoValidacion;
}

/** Un voluntario solo puede tomar turno si pasó los gates mínimos de protección. */
export function voluntarioApto(v: Voluntario): boolean {
  const vettingOk =
    v.vetting.screening && (v.vetting.antecedentes || v.vetting.validacionComunitaria);
  return vettingOk && v.codigoConductaFirmado && v.capacitacionMinima;
}

// ───────────── Avales (validación comunitaria) ─────────────
// Un vecino REGISTRADO (perfil con nombre + teléfono, cédula si es posible) avala a un
// voluntario de su misma zona. Reunir los avales requeridos lo marca validado por la
// comunidad. Cada aval queda trazado a una persona real (anti-suplantación / anti-trata).

export const AVALES_REQUERIDOS = 2; // vecinos que deben avalar para aprobar a un voluntario

export type DecisionAval = "aprobado" | "rechazado";

export interface Aval extends Base {
  voluntarioId: string;
  avalNombre: string;
  avalTelefono: string;
  avalCedula?: string;
  avalFigura?: string; // ciudadano / voluntario / coordinador
  entidad?: string;
  municipio?: string;
  parroquia?: string;
  sector?: string;
  lat?: number;
  lng?: number;
  decision: DecisionAval;
  nota?: string;
}

/** Avales aprobados / rechazados de un voluntario. */
export function contarAvales(
  voluntarioId: string,
  avales: Aval[],
): { aprobados: number; rechazados: number } {
  const propios = avales.filter((a) => a.voluntarioId === voluntarioId);
  return {
    aprobados: propios.filter((a) => a.decision === "aprobado").length,
    rechazados: propios.filter((a) => a.decision === "rechazado").length,
  };
}

// ───────────── Perfil local (este teléfono / esta persona) ─────────────
// No es una colección: es un singleton por dispositivo (localStorage). Identifica al
// usuario como vecino localizable de una zona, para recibir y dar avales.

export type Figura = "ciudadano" | "voluntario" | "coordinador" | "autoridad";

export const FIGURAS: { valor: Figura; etiqueta: string }[] = [
  { valor: "ciudadano", etiqueta: "Vecino / ciudadano" },
  { valor: "voluntario", etiqueta: "Voluntario" },
  { valor: "coordinador", etiqueta: "Coordinador de zona" },
  { valor: "autoridad", etiqueta: "Autoridad / Consejo" },
];

export interface Perfil {
  id: string;
  nombre: string;
  telefono: string;
  cedula?: string;
  figura: Figura;
  entidad?: string;
  municipio?: string;
  parroquia: string;
  sector?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
}

export interface Turno extends Base {
  cordonId: string;
  voluntarioId: string;
  inicio: number;
  fin?: number;
  rol: RolVoluntario;
  activo: boolean; // check-in sin check-out
}

// ───────────────────────────── Reclamo / Reunificación ─────────────────────────────

export type EstadoReclamo =
  | "recibido"
  | "en_verificacion"
  | "aprobado_por_autoridad"
  | "rechazado";

export const ESTADOS_RECLAMO: { valor: EstadoReclamo; etiqueta: string }[] = [
  { valor: "recibido", etiqueta: "Recibido" },
  { valor: "en_verificacion", etiqueta: "En verificación" },
  { valor: "aprobado_por_autoridad", etiqueta: "Aprobado por la autoridad" },
  { valor: "rechazado", etiqueta: "Rechazado" },
];

/** Puntos de coincidencia para verificar el vínculo (se exigen ≥2). */
export const PUNTOS_COINCIDENCIA: { clave: string; etiqueta: string }[] = [
  { clave: "foto_familiar", etiqueta: "Foto del niño con la familia" },
  { clave: "parecido", etiqueta: "Parecido físico" },
  { clave: "documentos", etiqueta: "Documentos (cédula, partida, fotos en teléfono)" },
  { clave: "testigos", etiqueta: "Testigos de la comunidad confirman el vínculo" },
  { clave: "detalles_privados", etiqueta: "Acertó detalles privados del expediente" },
];

export const MIN_PUNTOS_COINCIDENCIA = 2;

export interface Reclamo extends Base {
  menorId: string;
  reclamanteNombre: string;
  reclamanteContacto?: string;
  reclamanteDocumento?: string;
  relacionAlegada: string; // madre, tío, abuela...
  puntosCoincidencia: string[]; // claves de PUNTOS_COINCIDENCIA
  pruebaDetallesPrivados?: string; // qué acertó
  entrevistaNino: boolean; // ¿se entrevistó al niño y reconoce/quiere ir?
  ninoReconoce?: boolean;
  testigos?: string;
  estado: EstadoReclamo;
  autorizadoPor?: string; // autoridad que aprobó
  firmaEntrega?: string;
  firmaRecibe?: string;
  firmaTestigo?: string;
  notas?: string;
}

/** Gate anti-1-clic: qué falta para poder aprobar/cerrar una reunificación. */
export function faltantesReclamo(r: Reclamo): string[] {
  const faltan: string[] = [];
  if (r.puntosCoincidencia.length < MIN_PUNTOS_COINCIDENCIA)
    faltan.push(`Al menos ${MIN_PUNTOS_COINCIDENCIA} puntos de coincidencia`);
  if (!r.entrevistaNino) faltan.push("Entrevista al niño");
  if (r.ninoReconoce === false) faltan.push("El niño NO reconoce al reclamante (revisar)");
  if (!r.autorizadoPor) faltan.push("Autorización de la autoridad");
  if (!r.firmaEntrega || !r.firmaRecibe || !r.firmaTestigo)
    faltan.push("Firmas de quien entrega, quien recibe y testigo");
  return faltan;
}

// ───────────────────────────── Insumo (reporte) ─────────────────────────────
//
// Anti-rumor: cada quien sube lo que TIENE (oferta) o lo que le FALTA (necesidad),
// identificado (R5), ubicado y con estado en vivo. Los dos ciclos son SEPARADOS
// porque modelan realidades distintas:
//   - Necesidad:  abierta → parcial → abastecida (cubierta hasta fecha|indefinido) → cerrada.
//                 Una necesidad con vigencia por fecha REABRE sola al vencer (el agua y la
//                 comida se acaban: mañana vuelven a faltar).
//   - Oferta:     disponible (hasta fecha|indefinido) → reservado → entregado.
//                 Una oferta con vigencia por fecha sale del tablero al vencer.
// "abastecida" (necesidad) y "entregado" (oferta) = CUBIERTO POR COMPLETO: un único color
// distintivo compartido (verde oscuro institucional) en ambos ciclos.

export type TipoReporte = "necesidad" | "oferta";

export type CategoriaInsumo =
  | "comida"
  | "agua"
  | "medicinas"
  | "carpas"
  | "colchonetas"
  | "kits_higiene"
  | "cobijas"
  | "ropa"
  | "traslados"
  | "insumos"
  | "otro"
  // Categorías veterinarias (módulo Mascotas): comparten el mismo motor de reportes.
  | "medicinas_vet"
  | "atencion_vet"
  | "operacion"
  | "alimento_mascota"
  | "hospedaje"
  | "traslado_mascota";

export const CATEGORIAS_INSUMO: {
  valor: CategoriaInsumo;
  etiqueta: string;
  /** Si pide los detalles de talla/edad/género (ropa). */
  detalle?: boolean;
}[] = [
  { valor: "comida", etiqueta: "Comida" },
  { valor: "agua", etiqueta: "Agua" },
  { valor: "medicinas", etiqueta: "Medicinas" },
  { valor: "carpas", etiqueta: "Carpas" },
  { valor: "colchonetas", etiqueta: "Colchonetas" },
  { valor: "kits_higiene", etiqueta: "Kits de higiene" },
  { valor: "cobijas", etiqueta: "Cobijas" },
  { valor: "ropa", etiqueta: "Ropa", detalle: true },
  { valor: "traslados", etiqueta: "Traslados" },
  { valor: "insumos", etiqueta: "Insumos (general)" },
  { valor: "otro", etiqueta: "Otro" },
  // Veterinarias (Mascotas).
  { valor: "medicinas_vet", etiqueta: "Medicinas veterinarias" },
  { valor: "atencion_vet", etiqueta: "Atención veterinaria" },
  { valor: "operacion", etiqueta: "Operación / cirugía" },
  { valor: "alimento_mascota", etiqueta: "Alimento para mascotas" },
  { valor: "hospedaje", etiqueta: "Hospedaje / refugio" },
  { valor: "traslado_mascota", etiqueta: "Traslado de mascota" },
];

// Estados SEPARADOS por tipo.
export type EstadoNecesidad = "abierta" | "parcial" | "abastecida" | "cerrada";
export type EstadoOferta = "disponible" | "reservado" | "entregado";
export type EstadoReporte = EstadoNecesidad | EstadoOferta;

export const ESTADOS_NECESIDAD: { valor: EstadoNecesidad; etiqueta: string }[] = [
  { valor: "abierta", etiqueta: "Abierta" },
  { valor: "parcial", etiqueta: "Parcial" },
  { valor: "abastecida", etiqueta: "Abastecida" },
  { valor: "cerrada", etiqueta: "Cerrada" },
];
export const ESTADOS_OFERTA: { valor: EstadoOferta; etiqueta: string }[] = [
  { valor: "disponible", etiqueta: "Disponible" },
  { valor: "reservado", etiqueta: "Reservado" },
  { valor: "entregado", etiqueta: "Entregado" },
];

/** "Cubierto por completo": abastecida (necesidad) o entregado (oferta). Color compartido. */
export function esCubiertoPorCompleto(estado: EstadoReporte): boolean {
  return estado === "abastecida" || estado === "entregado";
}

export const ESTADO_INICIAL: Record<TipoReporte, EstadoReporte> = {
  necesidad: "abierta",
  oferta: "disponible",
};

// Vigencia: hasta una fecha (ms) o indefinida.
export type Vigencia = { tipo: "fecha"; hasta: number } | { tipo: "indefinido" };

// Confirmación de entrega/abastecimiento (R3): por quién se confirmó.
export type ConfirmadoPor = "receptor" | "dador";

// Detalle de ropa (todo opcional; cada campo admite "varios" para lotes surtidos).
export interface DetalleRopa {
  edad?: string;
  talla?: string;
  genero?: string;
}
export const OPCIONES_EDAD = ["0-2", "3-5", "6-9", "10-13", "14-17", "adulto", "varios"];
export const OPCIONES_TALLA = ["XS", "S", "M", "L", "XL", "varios"];
export const OPCIONES_GENERO = ["niña", "niño", "mujer", "hombre", "unisex", "varios"];

// Reconfirmación anti-rumor: cada 6 h se pide reconfirmar disponibilidad/necesidad.
export const HORAS_RECONFIRMAR = 6;
export const MS_RECONFIRMAR = HORAS_RECONFIRMAR * 60 * 60 * 1000;

/**
 * Aporte: cuando un reporte se ENLAZA por deduplicación (misma oferta/necesidad subida por
 * otra persona), en vez de duplicar, el segundo aportante suma su contacto y la info que
 * faltara. Una sola entrada viva, con varios contactos. (R5 + spec §3.7)
 */
export interface Aporte {
  nombre: string;
  telefono: string;
  telefonoVerificado: boolean;
  cedula: string;
  cedulaDeTercero?: boolean;
  telefonoDeTercero?: boolean;
  nota?: string;
  createdAt: number;
}

export interface Reporte extends Base {
  tipo: TipoReporte;
  categoria: CategoriaInsumo;
  // Ubicación real (Venezuela): estado → municipio → parroquia → punto. NO es "zona afectada":
  // es DÓNDE está lo que se ofrece o se necesita (el acopio ocurre en todo el país).
  entidad: string;
  municipio: string;
  parroquia: string;
  punto: string;
  sector?: string;
  referenciaUbicacion?: string; // referencia escrita cuando no se pudo dar GPS
  descripcion: string;
  cantidad?: string;
  detalleRopa?: DetalleRopa;
  personasPresentes?: number;
  estado: EstadoReporte;
  vigencia: Vigencia;

  // Procedencia dura (R5): autor identificado, nunca reposteo anónimo.
  autorNombre: string;
  autorTelefono: string;
  autorCedula: string;
  cedulaDeTercero?: boolean; // la cédula es de quien entrega/registra en su nombre
  telefonoDeTercero?: boolean; // el teléfono es de otra persona (contacto a través de ella)
  telefonoVerificado: boolean; // pasó el código por SMS + WhatsApp
  lat?: number;
  lng?: number;

  // Reconfirmación anti-rumor (cada 6 h). Reconfirmar = vuelve a publicar en el feed.
  ultimaConfirmacion: number;

  // Entrega/abastecimiento confirmado (R3): por el receptor o por el dador.
  confirmadoPor?: ConfirmadoPor;

  // Deduplicación → entrada viva enriquecida con varios aportantes.
  aportes?: Aporte[];

  // Si la necesidad/oferta está atada a una ficha de mascota (módulo Mascotas).
  mascotaId?: string;

  // Marca los registros de demostración (botón "cargar ejemplos"), para poder quitarlos.
  esEjemplo?: boolean;
}

// ───────────────────────────── Evento (bitácora append-only) ─────────────────────────────

export interface Evento {
  id: string;
  accion: string; // "menor.censado", "reclamo.aprobado", ...
  descripcion: string;
  refTabla?: string;
  refId?: string;
  createdAt: number;
}

// ───────────────────────────── Reglas operativas (invariantes) ─────────────────────────────

export const REGLAS: { id: string; texto: string }[] = [
  { id: "R1", texto: "Muerte solo la confirma la autoridad" },
  { id: "R2", texto: "Agrupar, no bloquear" },
  { id: "R3", texto: "Confirma el receptor (cadena de custodia)" },
  { id: "R4", texto: "Cerrar libera" },
  { id: "R5", texto: "Procedencia visible" },
  { id: "R6", texto: "Cumplimiento parcial" },
  { id: "R7", texto: "Protección de menores: identidad jamás pública" },
  { id: "R8", texto: "Neutralidad" },
  { id: "R9", texto: "Cero dinero" },
  { id: "R10", texto: "Auditabilidad: toda acción genera un evento" },
  { id: "R11", texto: "Complemento de 911 / autoridades" },
];

// ───────────────────────────── Mascota ─────────────────────────────
//
// Mascotas en emergencias: ubicadas con foto + datos + descripción, con un HISTORIAL de
// movimiento que es una cadena de custodia APPEND-ONLY (igual rigor que el módulo de niños:
// regla de dos personas, confirma el receptor, eventos inmutables), encadenada por un código
// interno `MAS-XXXX` (sin brazalete físico; chapa/collar QR opcional). A diferencia del menor,
// la mascota SÍ es mutable: cambia de estado, de custodio actual y de refugio.
//
// Privacidad: las fotos confidenciales (fotoBlob) viven solo en el teléfono (R7). Para poder
// COMPARTIR el cartel "se busca", se admite además `fotoUrl` (host público gratuito) que sí viaja.

export type EspecieMascota = "perro" | "gato" | "ave" | "otro";

export const ESPECIES_MASCOTA: { valor: EspecieMascota; etiqueta: string }[] = [
  { valor: "perro", etiqueta: "Perro" },
  { valor: "gato", etiqueta: "Gato" },
  { valor: "ave", etiqueta: "Ave" },
  { valor: "otro", etiqueta: "Otro" },
];

export type SexoMascota = "macho" | "hembra" | "desconocido";

export const SEXOS_MASCOTA: { valor: SexoMascota; etiqueta: string }[] = [
  { valor: "macho", etiqueta: "Macho" },
  { valor: "hembra", etiqueta: "Hembra" },
  { valor: "desconocido", etiqueta: "Por determinar" },
];

export type TamanoMascota = "pequeno" | "mediano" | "grande";

export const TAMANOS_MASCOTA: { valor: TamanoMascota; etiqueta: string }[] = [
  { valor: "pequeno", etiqueta: "Pequeño" },
  { valor: "mediano", etiqueta: "Mediano" },
  { valor: "grande", etiqueta: "Grande" },
];

/** Dónde está resguardada la mascota (campo de la ficha, no un catálogo aparte). */
export type TipoRefugio = "residencial" | "publico_acondicionado" | "institucional" | "hogar_temporal";

export const TIPOS_REFUGIO: { valor: TipoRefugio; etiqueta: string; ayuda: string }[] = [
  { valor: "residencial", etiqueta: "Residencial", ayuda: "Casa de una familia/persona que la acoge." },
  { valor: "publico_acondicionado", etiqueta: "Público acondicionado", ayuda: "Espacio público habilitado de contingencia." },
  { valor: "institucional", etiqueta: "Institucional", ayuda: "Refugio/albergue formal de una organización." },
  { valor: "hogar_temporal", etiqueta: "Hogar temporal", ayuda: "Acogida transitoria mientras se reubica o reunifica." },
];

export const etiquetaRefugio = (t?: TipoRefugio) => TIPOS_REFUGIO.find((x) => x.valor === t)?.etiqueta ?? "Sin refugio";

/** Máquina de estados de la mascota (espejo de ESTADOS/TRANSICIONES_IDTR). */
export type EstadoMascota = "resguardada" | "en_refugio" | "en_tratamiento" | "perdida" | "reunificada" | "fallecida";

export const ESTADOS_MASCOTA: { valor: EstadoMascota; etiqueta: string; ayuda: string }[] = [
  { valor: "resguardada", etiqueta: "Resguardada", ayuda: "Bajo custodia de un responsable identificado." },
  { valor: "en_refugio", etiqueta: "En refugio", ayuda: "En un refugio (residencial/público/institucional)." },
  { valor: "en_tratamiento", etiqueta: "En tratamiento", ayuda: "Bajo atención veterinaria u operación." },
  { valor: "perdida", etiqueta: "Perdida", ayuda: "Extraviada: se publica aviso de búsqueda." },
  { valor: "reunificada", etiqueta: "Reunificada", ayuda: "Devuelta a su responsable habitual." },
  { valor: "fallecida", etiqueta: "Fallecida", ayuda: "Registro de cierre." },
];

export const TRANSICIONES_MASCOTA: Record<EstadoMascota, EstadoMascota[]> = {
  resguardada: ["en_refugio", "en_tratamiento", "perdida", "reunificada", "fallecida"],
  en_refugio: ["resguardada", "en_tratamiento", "reunificada", "fallecida"],
  en_tratamiento: ["resguardada", "en_refugio", "reunificada", "fallecida"],
  perdida: ["resguardada", "reunificada"],
  reunificada: [],
  fallecida: [],
};

export const etiquetaEstadoMascota = (e: EstadoMascota) => ESTADOS_MASCOTA.find((x) => x.valor === e)?.etiqueta ?? e;

/** Refugio donde está la mascota (sub-objeto en la propia ficha). */
export interface RefugioMascota {
  tipo: TipoRefugio;
  nombre: string; // nombre del lugar
  ubicacion?: string; // dirección / referencia escrita
  responsableNombre?: string;
  responsableTelefono?: string;
}

export interface Mascota extends Base {
  codigo: string; // MAS-XXXX (identificador interno automático; encadena la custodia)
  especie: EspecieMascota;
  nombre: string; // identificación humana en pantalla (nombre + foto)
  sexo: SexoMascota;
  edadAprox?: string; // "cachorro", "2 años", libre
  raza?: string;
  tamano?: TamanoMascota;
  color?: string; // color / capa
  senas?: string; // marcas, cicatrices, collar
  estadoSalud?: string;
  esterilizado?: boolean;
  microchip?: string;
  temperamento?: string; // notas de comportamiento
  notas?: string;

  // Foto host-agnóstica.
  fotoUrl?: string; // URL pública externa (Imgur/postimages/FB/IG) — SÍ viaja (compartible en cartel)
  tieneFoto?: boolean; // materializado por sync.ts si hay fotoBlob
  fotoBlob?: Blob; // respaldo local — CONFIDENCIAL, jamás sincronizado

  // Geografía (idéntico patrón a Menor).
  entidad?: string;
  municipio?: string;
  parroquia: string;
  punto?: string;
  lat?: number;
  lng?: number;

  // Custodia: se actualiza con cada evento de la cadena.
  custodioActualId?: string;
  custodioActualNombre?: string; // display rápido en la ficha

  // Refugio (sub-objeto en la propia ficha).
  refugio?: RefugioMascota;

  estado: EstadoMascota;
  esEjemplo?: boolean;
}

// ── Cadena de custodia de la mascota (append-only, regla de dos personas) ──
// Reutiliza PersonaActo / SuplenteActo / faltaPersona / RolPersona / etiquetaRol (genéricos).

export type TipoCustodiaMascota =
  | "registro_inicial" // primer evento: vincula el código MAS-XXXX al registrador
  | "traspaso" // cambio de custodio de hecho. Lo confirma quien recibe (R3).
  | "salida_con_responsable" // un responsable se la lleva: registrar igual + cédula
  | "ingreso_refugio" // ingresa a un refugio (residencial/público/institucional)
  | "salida_refugio" // sale del refugio
  | "atencion_veterinaria" // pasa por atención veterinaria / operación
  | "reunificacion"; // devuelta a su responsable habitual

export const TIPOS_CUSTODIA_MASCOTA: { valor: TipoCustodiaMascota; etiqueta: string; ayuda: string; requiereRecibe: boolean }[] = [
  { valor: "registro_inicial", etiqueta: "Registro inicial", ayuda: "Se da de alta la mascota y el registrador asume el cuido de hecho.", requiereRecibe: false },
  { valor: "traspaso", etiqueta: "Traspaso de custodia", ayuda: "Otra persona/nodo asume el cuido. Lo confirma quien recibe (R3).", requiereRecibe: true },
  { valor: "salida_con_responsable", etiqueta: "Salida con responsable", ayuda: "Un responsable se la lleva. Registrar igual: cédula y destino.", requiereRecibe: true },
  { valor: "ingreso_refugio", etiqueta: "Ingreso a refugio", ayuda: "Ingresa a un refugio acondicionado.", requiereRecibe: false },
  { valor: "salida_refugio", etiqueta: "Salida de refugio", ayuda: "Sale del refugio.", requiereRecibe: false },
  { valor: "atencion_veterinaria", etiqueta: "Atención veterinaria", ayuda: "Consulta, tratamiento u operación.", requiereRecibe: false },
  { valor: "reunificacion", etiqueta: "Reunificación", ayuda: "Devuelta a su responsable habitual. Lo confirma quien recibe (R3).", requiereRecibe: true },
];

export const etiquetaCustodiaMascota = (t: TipoCustodiaMascota) =>
  TIPOS_CUSTODIA_MASCOTA.find((x) => x.valor === t)?.etiqueta ?? t;

/**
 * Evento de custodia de mascota (append-only). Una vez creado NO se actualiza.
 * Encadena siempre contra el mismo `codigo` MAS-XXXX. Clon de `EventoCustodia` sin brazalete.
 */
export interface EventoCustodiaMascota extends Base {
  mascotaId: string;
  codigo: string; // MAS-XXXX — se encadena siempre contra el mismo
  tipo: TipoCustodiaMascota;

  // Regla de dos personas
  registradorId?: string;
  registradorNombre: string;
  testigoNombre: string; // segundo adulto que co-firma

  // R3 — confirma el receptor (para traspaso / salida_con_responsable / reunificacion)
  recibeNombre?: string;
  recibeContacto?: string;
  recibeDocumento?: string;

  // Confirmaciones (firmas en pantalla)
  firmaEntrega: boolean;
  firmaTestigo: boolean;
  firmaRecibe: boolean;

  // Personas del acto (detalle completo con presencia + foto confidencial).
  personas?: PersonaActo[];
  notificados?: string[];

  // Contexto refugio / veterinario
  refugioNombre?: string;
  veterinario?: string; // para atencion_veterinaria

  // Ubicación del acto
  lugar?: string;
  entidad?: string;
  municipio?: string;
  parroquia?: string;
  punto?: string;
  lat?: number;
  lng?: number;
  nota?: string;
}

/**
 * Gate de la cadena de custodia de mascota: qué falta para asentar un evento.
 * Clon de `faltaParaTraspaso`: registrador + testigo distintos, firmas, R3 cuando aplica.
 */
export function faltaParaTraspasoMascota(e: Partial<EventoCustodiaMascota>): string[] {
  const faltan: string[] = [];
  if (!e.registradorNombre?.trim()) faltan.push("Nombre de quien registra");
  if (!e.testigoNombre?.trim()) faltan.push("Nombre del testigo (regla de dos personas)");
  if (
    e.registradorNombre &&
    e.testigoNombre &&
    e.registradorNombre.trim().toLowerCase() === e.testigoNombre.trim().toLowerCase()
  )
    faltan.push("El registrador y el testigo deben ser personas distintas");
  if (!e.firmaEntrega) faltan.push("Firma de quien entrega/registra");
  if (!e.firmaTestigo) faltan.push("Firma del testigo");

  const requiereRecibe = TIPOS_CUSTODIA_MASCOTA.find((t) => t.valor === e.tipo)?.requiereRecibe;
  if (requiereRecibe) {
    if (!e.recibeNombre?.trim()) faltan.push("Nombre de quien recibe");
    if (!e.firmaRecibe) faltan.push("Firma de quien recibe (R3)");
    if (e.tipo === "salida_con_responsable" && !e.recibeDocumento?.trim())
      faltan.push("Cédula del responsable que se la lleva");
  }

  // Si se capturaron personas estructuradas, validar la regla de foto (presente sin app).
  for (const p of e.personas ?? []) {
    for (const f of faltaPersona(p)) faltan.push(`${etiquetaRol(p.rol)}: ${f}`);
  }
  return faltan;
}

// ── Cartelera de avisos (se busca / encontrada / reunificada) ──

export type TipoAviso = "se_busca" | "encontrada" | "reunificada";

export const TIPOS_AVISO: { valor: TipoAviso; etiqueta: string; tono: "rojo" | "ambar" | "verde" }[] = [
  { valor: "se_busca", etiqueta: "Se busca", tono: "rojo" },
  { valor: "encontrada", etiqueta: "Encontrada", tono: "ambar" },
  { valor: "reunificada", etiqueta: "Reunificada", tono: "verde" },
];

export const etiquetaAviso = (t: TipoAviso) => TIPOS_AVISO.find((x) => x.valor === t)?.etiqueta ?? t;
export const tonoAviso = (t: TipoAviso) => TIPOS_AVISO.find((x) => x.valor === t)?.tono ?? "ambar";

export interface AvisoMascota extends Base {
  mascotaId?: string; // enlaza con la ficha si existe (para el QR del cartel)
  codigo?: string; // MAS-XXXX si está enlazado
  tipo: TipoAviso;
  titulo: string;
  descripcion: string;
  fotoUrl?: string; // foto pública (compartible en cartel)
  tieneFoto?: boolean;
  fotoBlob?: Blob; // respaldo local — jamás sincronizado
  zona?: string; // texto de zona
  entidad?: string;
  municipio?: string;
  parroquia?: string;
  punto?: string;
  lat?: number;
  lng?: number;
  contactoNombre: string; // procedencia visible (R5)
  contactoTelefono: string;
  estado: "activo" | "resuelto";
  esEjemplo?: boolean;
}

/** Gate del aviso: procedencia visible (R5) + contenido mínimo. */
export function faltaParaAviso(a: Partial<AvisoMascota>): string[] {
  const faltan: string[] = [];
  if (!a.titulo?.trim()) faltan.push("Título del aviso");
  if (!a.descripcion?.trim()) faltan.push("Descripción");
  if (!a.contactoNombre?.trim()) faltan.push("Nombre de contacto (procedencia visible, R5)");
  if (!a.contactoTelefono?.trim()) faltan.push("Teléfono de contacto");
  return faltan;
}
