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
  codigo: string; // brazalete, p.ej. WRA-7K3Q
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
  testigosComunidad?: string; // futuros testigos de verificación
  verificacionCompleta: boolean; // gate de reunificación
  // Detalles privados que SOLO la familia sabría (prueba anti-suplantación). Nunca público.
  detallesPrivados?: string;
}

/** No puede pasar a `reunificado` sin esto. Devuelve [puede, motivos faltantes]. */
export function puedeReunificar(m: Menor, reclamoAprobado: boolean): [boolean, string[]] {
  const faltan: string[] = [];
  if (!m.verificacionCompleta) faltan.push("Verificación de parentesco incompleta");
  if (m.estadoIDTR !== "derivado_autoridad") faltan.push("El caso debe estar derivado a la autoridad");
  if (!reclamoAprobado) faltan.push("Falta la autorización de la autoridad sobre el reclamo");
  return [faltan.length === 0, faltan];
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
  | "logistica";

export const ROLES_VOLUNTARIO: { valor: RolVoluntario; etiqueta: string; ayuda: string }[] = [
  { valor: "facilitador", etiqueta: "Facilitador de cordón", ayuda: "Cuida y acompaña niños en el espacio seguro." },
  { valor: "coordinador", etiqueta: "Coordinador de zona", ayuda: "Organiza el cordón, turnos y aprueba registros." },
  { valor: "verificador", etiqueta: "Verificador", ayuda: "Conduce la verificación de reclamos de familiares." },
  { valor: "censista", etiqueta: "Censista", ayuda: "Registra niños (censo IDTR)." },
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
  | "otro";

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
