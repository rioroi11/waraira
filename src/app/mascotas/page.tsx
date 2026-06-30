"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useColeccion, crear } from "@/lib/db";
import {
  type Mascota,
  type AvisoMascota,
  type Reporte,
  type TipoAviso,
  type TipoReporte,
  type CategoriaInsumo,
  TIPOS_AVISO,
  CATEGORIAS_INSUMO,
  ESTADO_INICIAL,
  etiquetaEstadoMascota,
  tonoAviso,
  faltaParaAviso,
} from "@/lib/model";
import {
  CATEGORIAS_VET,
  reportesDeMascotas,
  feedAvisosOrdenado,
  etiquetaEspecie,
} from "@/lib/mascotas";
import { feedOrdenado, separarPorVerificacion, balance, horaCorta } from "@/lib/insumos";
import { ESTADOS, ubicacionTexto } from "@/lib/geografia";
import { leerPerfil } from "@/lib/perfil";
import { sembrarEjemplos, borrarEjemplos } from "@/lib/ejemplos";
import { SelectorUbicacion } from "@/components/SelectorUbicacion";
import { CampoTelefono } from "@/components/CamposIdentidad";
import { FotoMascota } from "@/components/FotoMascota";
import { Campo, Area, Selector, Pill, TituloSeccion, Vacio, Modal } from "@/components/ui";

const ahoraMs = () => Date.now();
const categoriaEtiqueta = (c: CategoriaInsumo) => CATEGORIAS_INSUMO.find((x) => x.valor === c)?.etiqueta ?? c;

type Pestana = "mascotas" | "cartelera" | "necesidades";

export default function Mascotas() {
  const { datos: mascotas, cargando } = useColeccion<Mascota>("mascotas");
  const { datos: avisos } = useColeccion<AvisoMascota>("avisosMascota");
  const { datos: reportes } = useColeccion<Reporte>("reportes");
  const [pestana, setPestana] = useState<Pestana>("mascotas");
  const [entidad, setEntidad] = useState("");
  const [q, setQ] = useState("");
  const [pubAviso, setPubAviso] = useState(false);
  const [pubNecesidad, setPubNecesidad] = useState(false);
  const [sembrando, setSembrando] = useState(false);
  const hayEjemplos = mascotas.some((m) => m.esEjemplo) || avisos.some((a) => a.esEjemplo);

  async function alternarEjemplos() {
    if (sembrando) return;
    setSembrando(true);
    try {
      if (hayEjemplos) await borrarEjemplos();
      else await sembrarEjemplos();
    } finally {
      setSembrando(false);
    }
  }

  const mascotasFiltradas = useMemo(
    () =>
      mascotas
        .filter((m) => (entidad ? m.entidad === entidad : true))
        .filter((m) => {
          if (!q) return true;
          const t = q.toLowerCase();
          return (
            m.nombre.toLowerCase().includes(t) ||
            m.codigo.toLowerCase().includes(t) ||
            (m.raza ?? "").toLowerCase().includes(t) ||
            (m.senas ?? "").toLowerCase().includes(t)
          );
        })
        .sort((a, b) => b.createdAt - a.createdAt),
    [mascotas, entidad, q],
  );

  const cartelera = useMemo(() => feedAvisosOrdenado(avisos), [avisos]);

  const repsVet = useMemo(() => reportesDeMascotas(reportes), [reportes]);
  const bal = useMemo(() => balance(repsVet, ahoraMs()), [repsVet]);
  const feedVet = useMemo(() => separarPorVerificacion(feedOrdenado(repsVet, ahoraMs()), ahoraMs()), [repsVet]);
  const [subPestana, setSubPestana] = useState<"verificados" | "sin_verificar">("verificados");
  const listaNec = subPestana === "verificados" ? feedVet.verificados : feedVet.sinVerificar;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Mascotas</h1>
        <Link href="/mascotas/nuevo" className="btn btn-primario">＋ Registrar</Link>
      </div>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Mascotas ubicadas con foto y datos, con <b>cadena de custodia</b> de quién las traslada y custodia.
        Cartelera de búsqueda y tablero de necesidades veterinarias.
      </p>
      <div className="mt-2">
        <button className="text-xs font-semibold text-[var(--gris)] underline" onClick={alternarEjemplos} disabled={sembrando}>
          {sembrando ? "Procesando…" : hayEjemplos ? "Quitar datos de ejemplo" : "Cargar datos de ejemplo (demo)"}
        </button>
      </div>

      {/* Pestañas */}
      <div className="mt-4 flex gap-1 rounded-xl border border-[var(--linea)] bg-[var(--blanco)] p-1">
        {([
          ["mascotas", `Mascotas (${mascotas.length})`],
          ["cartelera", `Cartelera (${cartelera.length})`],
          ["necesidades", "Necesidades"],
        ] as [Pestana, string][]).map(([k, label]) => (
          <button
            key={k}
            className="flex-1 rounded-lg px-2 py-1.5 text-sm font-bold"
            style={{
              background: pestana === k ? "var(--verde)" : "transparent",
              color: pestana === k ? "#fff" : "var(--gris)",
            }}
            onClick={() => setPestana(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ───────── Pestaña Mascotas ───────── */}
      {pestana === "mascotas" && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input className="campo" placeholder="Buscar por nombre, código, raza o señas…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="campo" value={entidad} onChange={(e) => setEntidad(e.target.value)}>
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e.slug} value={e.slug}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-2">
            {cargando ? (
              <Vacio>Cargando…</Vacio>
            ) : mascotasFiltradas.length === 0 ? (
              <Vacio>No hay mascotas registradas con ese filtro.</Vacio>
            ) : (
              mascotasFiltradas.map((m) => (
                <Link
                  key={m.id}
                  href={`/mascotas/${m.codigo}`}
                  className="tarjeta flex items-center gap-3 p-3 no-underline transition hover:border-[var(--verde)]"
                >
                  <FotoMascota fotoUrl={m.fotoUrl} fotoBlob={m.fotoBlob} nombre={m.nombre} className="h-14 w-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--tinta)]">{m.nombre || "Sin nombre"}</span>
                      <Pill tono="gris">{etiquetaEspecie(m.especie)}</Pill>
                    </div>
                    <div className="truncate text-xs text-[var(--gris)]">
                      <span className="font-mono">{m.codigo}</span>
                      {ubicacionTexto(m) ? ` · ${ubicacionTexto(m)}` : ""}
                      {m.custodioActualNombre ? ` · custodia: ${m.custodioActualNombre}` : ""}
                    </div>
                  </div>
                  <Pill tono={tonoEstado(m.estado)}>{etiquetaEstadoMascota(m.estado)}</Pill>
                </Link>
              ))
            )}
          </div>
        </>
      )}

      {/* ───────── Pestaña Cartelera ───────── */}
      {pestana === "cartelera" && (
        <>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-[var(--gris)]">Avisos: se busca, encontrada, reunificada.</p>
            <button className="btn btn-secundario" onClick={() => setPubAviso(true)}>＋ Publicar aviso</button>
          </div>
          <div className="mt-3 space-y-2">
            {cartelera.length === 0 ? (
              <Vacio>No hay avisos publicados.</Vacio>
            ) : (
              cartelera.map((a) => (
                <div key={a.id} className="tarjeta flex gap-3 p-3">
                  <FotoMascota fotoUrl={a.fotoUrl} fotoBlob={a.fotoBlob} nombre={a.titulo} className="h-16 w-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Pill tono={tonoAviso(a.tipo)}>{TIPOS_AVISO.find((t) => t.valor === a.tipo)?.etiqueta}</Pill>
                      <span className="font-bold text-[var(--tinta)]">{a.titulo}</span>
                    </div>
                    <div className="mt-0.5 text-sm text-[var(--tinta)]">{a.descripcion}</div>
                    <div className="mt-0.5 text-xs text-[var(--gris)]">
                      {[a.zona, ubicacionTexto(a)].filter(Boolean).join(" · ")} · {a.contactoNombre} · {a.contactoTelefono}
                      {" · "}{horaCorta(a.updatedAt ?? a.createdAt, ahoraMs())}
                    </div>
                    {a.codigo && (
                      <div className="mt-1 flex gap-2">
                        <Link href={`/mascotas/${a.codigo}`} className="text-xs font-bold text-[var(--verde)]">Ver ficha</Link>
                        <Link href={`/mascotas/${a.codigo}/cartel`} className="text-xs font-bold text-[var(--verde)]">🪧 Cartel</Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ───────── Pestaña Necesidades ───────── */}
      {pestana === "necesidades" && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="tarjeta p-3"><div className="text-2xl font-black text-[var(--rojo)]">{bal.necesidades}</div><div className="text-xs text-[var(--gris)]">Necesidades</div></div>
            <div className="tarjeta p-3"><div className="text-2xl font-black text-[var(--azul)]">{bal.ofertas}</div><div className="text-xs text-[var(--gris)]">Ofertas</div></div>
            <div className="tarjeta p-3"><div className="text-2xl font-black text-[var(--verde-osc)]">{bal.cubiertos}</div><div className="text-xs text-[var(--gris)]">Cubiertos</div></div>
          </div>
          <p className="mt-2 text-xs text-[var(--gris)]">
            Medicinas, atención veterinaria, operaciones, alimento, hospedaje y traslados — y proveedores
            que ofrecen salud, hospedaje, refugio o custodia. Mismo motor que Insumos.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1 rounded-lg border border-[var(--linea)] p-0.5">
              {([["verificados", "Verificados"], ["sin_verificar", "Sin verificar"]] as const).map(([k, label]) => (
                <button
                  key={k}
                  className="rounded-md px-3 py-1 text-xs font-bold"
                  style={{ background: subPestana === k ? "var(--verde-claro)" : "transparent", color: subPestana === k ? "var(--verde-osc)" : "var(--gris)" }}
                  onClick={() => setSubPestana(k)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="btn btn-secundario" onClick={() => setPubNecesidad(true)}>＋ Reportar</button>
          </div>
          <div className="mt-3 space-y-2">
            {listaNec.length === 0 ? (
              <Vacio>No hay reportes veterinarios en esta pestaña.</Vacio>
            ) : (
              listaNec.map((r) => (
                <div key={r.id} className="tarjeta p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Pill tono={r.tipo === "necesidad" ? "rojo" : "azul"}>{r.tipo === "necesidad" ? "Necesita" : "Ofrece"}</Pill>
                    <Pill tono="gris">{categoriaEtiqueta(r.categoria)}</Pill>
                    {r.mascotaId && <Pill tono="verde">Ficha enlazada</Pill>}
                  </div>
                  <div className="mt-1 text-sm text-[var(--tinta)]">{r.descripcion}</div>
                  <div className="mt-0.5 text-xs text-[var(--gris)]">
                    {[ubicacionTexto(r), r.punto].filter(Boolean).join(" · ")} · {r.autorNombre} · {r.autorTelefono}
                    {" · "}{horaCorta(r.updatedAt ?? r.createdAt, ahoraMs())}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Link a la carátula (convención §10) */}
      <div className="mt-6 text-center">
        <a href="/resumen-mascotas.html" target="_blank" rel="noopener" className="text-sm font-semibold text-[var(--verde)]">
          📄 Cómo funciona el módulo de Mascotas
        </a>
      </div>

      {pubAviso && <PublicarAviso mascotas={mascotas} onCerrar={() => setPubAviso(false)} />}
      {pubNecesidad && <ReportarNecesidad mascotas={mascotas} onCerrar={() => setPubNecesidad(false)} />}
    </div>
  );
}

function tonoEstado(e: Mascota["estado"]): "verde" | "ambar" | "rojo" | "azul" | "gris" {
  if (e === "reunificada") return "verde";
  if (e === "perdida") return "rojo";
  if (e === "en_tratamiento") return "ambar";
  if (e === "en_refugio") return "azul";
  if (e === "fallecida") return "gris";
  return "gris";
}

// ───────────────────────────── Modal: publicar aviso ─────────────────────────────

function PublicarAviso({ mascotas, onCerrar }: { mascotas: Mascota[]; onCerrar: () => void }) {
  const perfil = leerPerfil();
  const [tipo, setTipo] = useState<TipoAviso>("se_busca");
  const [mascotaId, setMascotaId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [ubic, setUbic] = useState({ entidad: "", municipio: "", parroquia: "" });
  const [zona, setZona] = useState("");
  const [contactoNombre, setContactoNombre] = useState(perfil?.nombre ?? "");
  const [contactoTelefono, setContactoTelefono] = useState(perfil?.telefono ?? "");
  const [guardando, setGuardando] = useState(false);

  const sel = mascotas.find((m) => m.id === mascotaId);
  const borrador: Partial<AvisoMascota> = { titulo, descripcion, contactoNombre, contactoTelefono };
  const faltan = faltaParaAviso(borrador);

  async function asentar() {
    if (faltan.length > 0 || guardando) return;
    setGuardando(true);
    try {
      const datos: Omit<AvisoMascota, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
        mascotaId: mascotaId || undefined,
        codigo: sel?.codigo,
        tipo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fotoUrl: fotoUrl.trim() || sel?.fotoUrl || undefined,
        entidad: ubic.entidad || sel?.entidad || undefined,
        municipio: ubic.municipio || sel?.municipio || undefined,
        parroquia: ubic.parroquia || sel?.parroquia || undefined,
        zona: zona.trim() || undefined,
        contactoNombre: contactoNombre.trim(),
        contactoTelefono: contactoTelefono.trim(),
        estado: "activo",
      };
      await crear<AvisoMascota>("avisosMascota", datos, {
        accion: "aviso.publicado",
        descripcion: `Aviso "${titulo.trim()}" (${tipo})`,
      });
      onCerrar();
    } catch (e) {
      console.error(e);
      setGuardando(false);
      alert("No se pudo publicar el aviso.");
    }
  }

  return (
    <Modal
      titulo="Publicar aviso"
      onCerrar={onCerrar}
      acciones={
        <>
          <button className="btn btn-secundario flex-1" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primario flex-1" disabled={faltan.length > 0 || guardando} onClick={asentar}>
            {guardando ? "Publicando…" : "Publicar"}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-left">
        <Selector label="Tipo de aviso" value={tipo} onChange={(e) => setTipo(e.target.value as TipoAviso)}>
          {TIPOS_AVISO.map((t) => (
            <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
          ))}
        </Selector>
        <Selector label="Enlazar a una mascota (opcional)" value={mascotaId} onChange={(e) => setMascotaId(e.target.value)}>
          <option value="">Sin enlazar</option>
          {mascotas.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre} · {m.codigo}</option>
          ))}
        </Selector>
        <Campo label="Título *" placeholder="p.ej. Se busca perro mestizo marrón" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <Area label="Descripción *" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <Campo label="Foto (URL pública — Imgur, etc.)" placeholder="https://…" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} />
        <SelectorUbicacion valor={ubic} onChange={setUbic} />
        <Campo label="Zona / referencia" placeholder="p.ej. cerca de la plaza" value={zona} onChange={(e) => setZona(e.target.value)} />
        <Campo label="Contacto (nombre) *" value={contactoNombre} onChange={(e) => setContactoNombre(e.target.value)} />
        <CampoTelefono label="Teléfono de contacto *" value={contactoTelefono} onChange={setContactoTelefono} />
        {faltan.length > 0 && <p className="text-xs text-[var(--ambar)]">Falta: {faltan.join("; ")}.</p>}
      </div>
    </Modal>
  );
}

// ───────────────────────────── Modal: reportar necesidad/oferta veterinaria ─────────────────────────────

function ReportarNecesidad({ mascotas, onCerrar }: { mascotas: Mascota[]; onCerrar: () => void }) {
  const perfil = leerPerfil();
  const [tipo, setTipo] = useState<TipoReporte>("necesidad");
  const [categoria, setCategoria] = useState<CategoriaInsumo>("medicinas_vet");
  const [mascotaId, setMascotaId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubic, setUbic] = useState({ entidad: "", municipio: "", parroquia: "" });
  const [punto, setPunto] = useState("");
  const [autorNombre, setAutorNombre] = useState(perfil?.nombre ?? "");
  const [autorTelefono, setAutorTelefono] = useState(perfil?.telefono ?? "");
  const [guardando, setGuardando] = useState(false);

  const sel = mascotas.find((m) => m.id === mascotaId);
  const valido = descripcion.trim() && autorNombre.trim() && autorTelefono.trim() && (ubic.parroquia || sel?.parroquia);

  async function asentar() {
    if (!valido || guardando) return;
    setGuardando(true);
    try {
      const datos: Omit<Reporte, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
        tipo,
        categoria,
        entidad: ubic.entidad || sel?.entidad || "",
        municipio: ubic.municipio || sel?.municipio || "",
        parroquia: ubic.parroquia || sel?.parroquia || "",
        punto: punto.trim() || sel?.punto || "",
        descripcion: descripcion.trim(),
        estado: ESTADO_INICIAL[tipo],
        vigencia: { tipo: "indefinido" },
        autorNombre: autorNombre.trim(),
        autorTelefono: autorTelefono.trim(),
        autorCedula: perfil?.cedula ?? "",
        telefonoVerificado: false,
        ultimaConfirmacion: Date.now(),
        mascotaId: mascotaId || undefined,
      };
      await crear<Reporte>("reportes", datos, {
        accion: "reporte.creado",
        descripcion: `${tipo} de ${categoria} (mascotas)`,
      });
      onCerrar();
    } catch (e) {
      console.error(e);
      setGuardando(false);
      alert("No se pudo guardar el reporte.");
    }
  }

  return (
    <Modal
      titulo="Reportar necesidad / oferta veterinaria"
      onCerrar={onCerrar}
      acciones={
        <>
          <button className="btn btn-secundario flex-1" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primario flex-1" disabled={!valido || guardando} onClick={asentar}>
            {guardando ? "Guardando…" : "Reportar"}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-left">
        <Selector label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoReporte)}>
          <option value="necesidad">Necesidad (falta)</option>
          <option value="oferta">Oferta (proveedor / hay)</option>
        </Selector>
        <Selector label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaInsumo)}>
          {CATEGORIAS_VET.map((c) => (
            <option key={c} value={c}>{categoriaEtiqueta(c)}</option>
          ))}
        </Selector>
        <Selector label="Enlazar a una mascota (opcional)" value={mascotaId} onChange={(e) => setMascotaId(e.target.value)}>
          <option value="">Sin enlazar (general)</option>
          {mascotas.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre} · {m.codigo}</option>
          ))}
        </Selector>
        <Area label="Descripción *" placeholder="Qué se necesita / qué se ofrece" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <SelectorUbicacion valor={ubic} onChange={setUbic} requerido={!sel} />
        <Campo label="Punto / lugar" value={punto} onChange={(e) => setPunto(e.target.value)} />
        <Campo label="Tu nombre *" value={autorNombre} onChange={(e) => setAutorNombre(e.target.value)} />
        <CampoTelefono label="Tu teléfono *" value={autorTelefono} onChange={setAutorTelefono} />
        {!valido && <p className="text-xs text-[var(--ambar)]">Falta: descripción, ubicación y tus datos de contacto.</p>}
      </div>
    </Modal>
  );
}
