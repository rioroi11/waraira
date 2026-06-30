"use client";

// Datos de ejemplo para VER el feed funcionando (botón "cargar ejemplos"). Marcados con
// `esEjemplo` para poder quitarlos. Usan ubicaciones REALES tomadas de la geografía.

import { crear, borrar, obtenerTodos } from "./db";
import { ESTADOS } from "./geografia";
import {
  type Reporte,
  type Base,
  type Mascota,
  type EventoCustodiaMascota,
  type AvisoMascota,
  type PersonaActo,
} from "./model";
import { codigoMascotaUnico } from "./mascotas";

const H = 3_600_000;

function ubic(estadoSlug: string, iMun = 0, iParr = 0) {
  const e = ESTADOS.find((x) => x.slug === estadoSlug) ?? ESTADOS[0];
  const m = e.municipios[iMun] ?? e.municipios[0];
  const p = m.parroquias[iParr] ?? m.parroquias[0];
  return { entidad: e.slug, municipio: m.slug, parroquia: p.slug };
}

function tel(): string {
  return "+58424" + Math.floor(1_000_000 + Math.random() * 8_999_999);
}
function ced(): string {
  return "V-" + Math.floor(10_000_000 + Math.random() * 89_999_999);
}

export async function sembrarEjemplos(): Promise<void> {
  const now = Date.now();
  const mk = (over: Partial<Reporte>): Omit<Reporte, keyof Base> =>
    ({
      autorNombre: "Vecino de ejemplo",
      autorTelefono: tel(),
      autorCedula: ced(),
      telefonoVerificado: true,
      ultimaConfirmacion: now,
      vigencia: { tipo: "indefinido" },
      punto: "Plaza",
      esEjemplo: true,
      ...over,
    }) as Omit<Reporte, keyof Base>;

  const items: Omit<Reporte, keyof Base>[] = [
    mk({ tipo: "necesidad", categoria: "agua", descripcion: "Agua potable para 40 personas", cantidad: "40 botellones", estado: "abierta", ...ubic("la-guaira", 0, 0), punto: "Refugio Caraballeda" }),
    mk({ tipo: "oferta", categoria: "carpas", descripcion: "Carpas familiares disponibles", cantidad: "15 carpas", estado: "disponible", vigencia: { tipo: "fecha", hasta: now + 3 * 24 * H }, ...ubic("distrito-capital"), punto: "Galpón Catia" }),
    mk({ tipo: "necesidad", categoria: "comida", descripcion: "Almuerzos calientes", cantidad: "100 platos", estado: "parcial", ultimaConfirmacion: now - 7 * H, ...ubic("miranda"), punto: "Cancha Guarenas" }),
    mk({ tipo: "oferta", categoria: "medicinas", descripcion: "Lote de medicinas básicas", estado: "entregado", confirmadoPor: "receptor", ...ubic("aragua"), punto: "Ambulatorio Maracay" }),
    mk({ tipo: "necesidad", categoria: "colchonetas", descripcion: "Colchonetas para dormir", cantidad: "30", estado: "abastecida", vigencia: { tipo: "fecha", hasta: now + 2 * 24 * H }, confirmadoPor: "dador", ...ubic("carabobo"), punto: "Escuela Valencia" }),
    mk({ tipo: "necesidad", categoria: "agua", descripcion: "Agua (se vuelve a necesitar pronto)", cantidad: "50 botellones", estado: "abastecida", vigencia: { tipo: "fecha", hasta: now - 26 * H }, ultimaConfirmacion: now - 30 * H, ...ubic("la-guaira", 0, 1), punto: "Refugio Macuto" }),
    mk({ tipo: "oferta", categoria: "ropa", descripcion: "Ropa surtida (varios)", detalleRopa: { edad: "varios", talla: "varios", genero: "varios" }, estado: "disponible", telefonoVerificado: false, ...ubic("la-guaira"), punto: "Iglesia Maiquetía" }),
  ];

  for (const it of items) {
    await crear<Reporte>("reportes", it, { accion: "insumo.ejemplo", descripcion: `Ejemplo: ${it.descripcion}` });
  }

  await sembrarEjemplosMascotas(now);
}

// ───────────────────────────── Ejemplos del módulo Mascotas ─────────────────────────────

function persona(rol: PersonaActo["rol"], nombre: string): PersonaActo {
  return { rol, nombre, cedula: ced(), telefono: tel(), presente: true, tieneApp: false, declaraAqui: false, confirma: true };
}

async function sembrarEjemplosMascotas(now: number): Promise<void> {
  // Fotos públicas estables (placedog.net) para que se vean tarjetas y carteles.
  const dog = (id: number) => `https://placedog.net/500/400?id=${id}`;

  const existentes = await obtenerTodos<Mascota>("mascotas");

  // Cada entrada: la ficha + sus eventos de custodia (append-only) + estado.
  const fichas: {
    m: Omit<Mascota, keyof Base | "codigo">;
    eventos: (codigo: string, mascotaId: string) => Omit<EventoCustodiaMascota, keyof Base>[];
  }[] = [
    {
      m: {
        especie: "perro", nombre: "Firulais", sexo: "macho", edadAprox: "3 años", raza: "Mestizo", tamano: "mediano",
        color: "Marrón con pecho blanco", senas: "Oreja izquierda rasgada", estadoSalud: "Sano, desnutrición leve",
        esterilizado: true, temperamento: "Dócil y sociable", fotoUrl: dog(12),
        ...ubic("la-guaira", 0, 0), punto: "Refugio Caraballeda",
        custodioActualNombre: "María Pérez", estado: "resguardada", esEjemplo: true,
      },
      eventos: (codigo, mascotaId) => [
        { mascotaId, codigo, tipo: "registro_inicial", registradorNombre: "Ana Gómez", testigoNombre: "Luis Rojas", firmaEntrega: true, firmaTestigo: true, firmaRecibe: false, personas: [persona("registrador", "Ana Gómez"), persona("testigo", "Luis Rojas")], lugar: "Refugio Caraballeda", nota: "Rescatado tras la crecida." },
        { mascotaId, codigo, tipo: "traspaso", registradorNombre: "Ana Gómez", testigoNombre: "Luis Rojas", recibeNombre: "María Pérez", recibeDocumento: ced(), firmaEntrega: true, firmaTestigo: true, firmaRecibe: true, personas: [persona("registrador", "Ana Gómez"), persona("testigo", "Luis Rojas"), persona("recibe", "María Pérez")], nota: "Pasa a hogar temporal de María." },
      ],
    },
    {
      m: {
        especie: "gato", nombre: "Michi", sexo: "hembra", edadAprox: "1 año", raza: "Criolla", tamano: "pequeno",
        color: "Atigrada gris", senas: "Cola corta", estadoSalud: "Sana", esterilizado: false, temperamento: "Tímida",
        fotoUrl: dog(20), ...ubic("distrito-capital"), punto: "Albergue Catia",
        refugio: { tipo: "institucional", nombre: "Albergue Patitas Catia", ubicacion: "Av. Sucre, Catia", responsableNombre: "Fundación Patitas", responsableTelefono: tel() },
        custodioActualNombre: "Fundación Patitas", estado: "en_refugio", esEjemplo: true,
      },
      eventos: (codigo, mascotaId) => [
        { mascotaId, codigo, tipo: "registro_inicial", registradorNombre: "Pedro Díaz", testigoNombre: "Sara Mora", firmaEntrega: true, firmaTestigo: true, firmaRecibe: false, personas: [persona("registrador", "Pedro Díaz"), persona("testigo", "Sara Mora")], lugar: "Catia" },
        { mascotaId, codigo, tipo: "ingreso_refugio", registradorNombre: "Pedro Díaz", testigoNombre: "Sara Mora", firmaEntrega: true, firmaTestigo: true, firmaRecibe: false, refugioNombre: "Albergue Patitas Catia", personas: [persona("registrador", "Pedro Díaz"), persona("testigo", "Sara Mora")] },
      ],
    },
    {
      m: {
        especie: "perro", nombre: "Rocky", sexo: "macho", edadAprox: "5 años", raza: "Pastor mestizo", tamano: "grande",
        color: "Negro y fuego", senas: "Cojera pata trasera derecha", estadoSalud: "Fractura en tratamiento",
        esterilizado: true, temperamento: "Protector", fotoUrl: dog(7), ...ubic("miranda"), punto: "Clínica Vet Guarenas",
        custodioActualNombre: "Refugio Guarenas", estado: "en_tratamiento", esEjemplo: true,
      },
      eventos: (codigo, mascotaId) => [
        { mascotaId, codigo, tipo: "registro_inicial", registradorNombre: "Carmen Silva", testigoNombre: "José Niño", firmaEntrega: true, firmaTestigo: true, firmaRecibe: false, personas: [persona("registrador", "Carmen Silva"), persona("testigo", "José Niño")], lugar: "Guarenas" },
        { mascotaId, codigo, tipo: "atencion_veterinaria", registradorNombre: "Carmen Silva", testigoNombre: "José Niño", firmaEntrega: true, firmaTestigo: true, firmaRecibe: false, veterinario: "Dra. Salazar — Clínica Vet Guarenas", personas: [persona("registrador", "Carmen Silva"), persona("testigo", "José Niño")], nota: "Requiere operación de pata." },
      ],
    },
    {
      m: {
        especie: "perro", nombre: "Luna", sexo: "hembra", edadAprox: "2 años", raza: "Criolla", tamano: "mediano",
        color: "Beige claro", senas: "Collar rojo", estadoSalud: "Desconocido", esterilizado: false,
        temperamento: "Asustadiza", fotoUrl: dog(33), ...ubic("carabobo"), punto: "Urb. La Granja",
        custodioActualNombre: "Familia Méndez", estado: "perdida", esEjemplo: true,
      },
      eventos: (codigo, mascotaId) => [
        { mascotaId, codigo, tipo: "registro_inicial", registradorNombre: "Familia Méndez", testigoNombre: "Vecina Rosa", firmaEntrega: true, firmaTestigo: true, firmaRecibe: false, personas: [persona("registrador", "Familia Méndez"), persona("testigo", "Vecina Rosa")], lugar: "La Granja", nota: "Se perdió durante la evacuación." },
      ],
    },
  ];

  const creadas: { codigo: string; id: string; nombre: string; especie: Mascota["especie"]; u: { entidad: string; municipio: string; parroquia: string }; punto?: string }[] = [];

  for (const f of fichas) {
    const codigo = codigoMascotaUnico([...existentes, ...creadas.map((c) => ({ codigo: c.codigo }) as Mascota)]);
    const mascota = await crear<Mascota>("mascotas", { ...f.m, codigo } as Omit<Mascota, keyof Base>, {
      accion: "mascota.ejemplo",
      descripcion: `Ejemplo: ${f.m.nombre}`,
    });
    creadas.push({ codigo, id: mascota.id, nombre: f.m.nombre, especie: f.m.especie, u: { entidad: f.m.entidad ?? "", municipio: f.m.municipio ?? "", parroquia: f.m.parroquia }, punto: f.m.punto });
    for (const ev of f.eventos(codigo, mascota.id)) {
      await crear<EventoCustodiaMascota>("custodiaMascota", ev, {
        accion: `custodiaMascota.${ev.tipo}`,
        descripcion: `Ejemplo custodia ${codigo}: ${ev.tipo}`,
      });
    }
  }

  // Cartelera: avisos enlazados a las fichas.
  const luna = creadas.find((c) => c.nombre === "Luna");
  const firulais = creadas.find((c) => c.nombre === "Firulais");
  const avisos: Omit<AvisoMascota, keyof Base>[] = [
    luna && {
      mascotaId: luna.id, codigo: luna.codigo, tipo: "se_busca", titulo: "Se busca: Luna (perra beige, collar rojo)",
      descripcion: "Se perdió durante la evacuación en La Granja. Es asustadiza. Recompensa simbólica.",
      fotoUrl: dog(33), ...luna.u, zona: luna.punto, contactoNombre: "Familia Méndez", contactoTelefono: tel(), estado: "activo", esEjemplo: true,
    },
    firulais && {
      mascotaId: firulais.id, codigo: firulais.codigo, tipo: "reunificada", titulo: "Reunificado: Firulais volvió con su familia",
      descripcion: "Tras pasar por hogar temporal, fue reconocido y devuelto a su responsable.",
      fotoUrl: dog(12), ...firulais.u, zona: firulais.punto, contactoNombre: "María Pérez", contactoTelefono: tel(), estado: "resuelto", esEjemplo: true,
    },
    {
      tipo: "encontrada", titulo: "Encontrada: gata negra cerca del refugio Catia",
      descripcion: "Apareció sana, sin identificación. En resguardo a la espera de su responsable.",
      fotoUrl: dog(50), ...ubic("distrito-capital"), zona: "Catia", contactoNombre: "Fundación Patitas", contactoTelefono: tel(), estado: "activo", esEjemplo: true,
    },
  ].filter(Boolean) as Omit<AvisoMascota, keyof Base>[];

  for (const a of avisos) {
    await crear<AvisoMascota>("avisosMascota", a, { accion: "aviso.ejemplo", descripcion: `Ejemplo aviso: ${a.titulo}` });
  }

  // Necesidades veterinarias (algunas atadas a fichas) + proveedores como ofertas.
  const rocky = creadas.find((c) => c.nombre === "Rocky");
  const mkVet = (over: Partial<Reporte>): Omit<Reporte, keyof Base> =>
    ({
      autorNombre: "Voluntario de ejemplo", autorTelefono: tel(), autorCedula: ced(), telefonoVerificado: true,
      ultimaConfirmacion: now, vigencia: { tipo: "indefinido" }, punto: "Refugio", esEjemplo: true, ...over,
    }) as Omit<Reporte, keyof Base>;

  const vet: Omit<Reporte, keyof Base>[] = [
    rocky && mkVet({ tipo: "necesidad", categoria: "operacion", descripcion: "Operación de pata trasera para Rocky", cantidad: "1 cirugía", estado: "abierta", mascotaId: rocky.id, ...rocky.u, punto: rocky.punto }),
    mkVet({ tipo: "necesidad", categoria: "medicinas_vet", descripcion: "Antiparasitarios y antibióticos veterinarios", estado: "parcial", ...ubic("la-guaira") }),
    mkVet({ tipo: "oferta", categoria: "atencion_vet", descripcion: "Consultas veterinarias gratuitas sáb./dom.", estado: "disponible", autorNombre: "Clínica Vet Solidaria", ...ubic("distrito-capital"), punto: "Chacao" }),
    mkVet({ tipo: "oferta", categoria: "hospedaje", descripcion: "Cupos de hospedaje temporal para 10 perros", cantidad: "10 cupos", estado: "disponible", autorNombre: "Refugio Patitas", ...ubic("miranda"), punto: "Guarenas" }),
    mkVet({ tipo: "oferta", categoria: "alimento_mascota", descripcion: "Donación de alimento para perros y gatos", cantidad: "200 kg", estado: "disponible", autorNombre: "Tienda El Can", telefonoVerificado: false, ...ubic("carabobo") }),
  ].filter(Boolean) as Omit<Reporte, keyof Base>[];

  for (const r of vet) {
    await crear<Reporte>("reportes", r, { accion: "insumo.ejemplo", descripcion: `Ejemplo vet: ${r.descripcion}` });
  }
}

export async function borrarEjemplos(): Promise<void> {
  const reportes = await obtenerTodos<Reporte>("reportes");
  for (const r of reportes) if (r.esEjemplo) await borrar("reportes", r.id);

  const mascotas = await obtenerTodos<Mascota>("mascotas");
  const idsEjemplo = new Set(mascotas.filter((m) => m.esEjemplo).map((m) => m.id));
  for (const m of mascotas) if (m.esEjemplo) await borrar("mascotas", m.id);

  const custodia = await obtenerTodos<EventoCustodiaMascota>("custodiaMascota");
  for (const e of custodia) if (idsEjemplo.has(e.mascotaId)) await borrar("custodiaMascota", e.id);

  const avisos = await obtenerTodos<AvisoMascota>("avisosMascota");
  for (const a of avisos) if (a.esEjemplo) await borrar("avisosMascota", a.id);
}
