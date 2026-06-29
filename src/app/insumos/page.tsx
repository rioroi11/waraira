"use client";

import { useMemo, useState } from "react";
import { useColeccion, crear, actualizar } from "@/lib/db";
import {
  type Reporte,
  type TipoReporte,
  type CategoriaInsumo,
  type Vigencia,
  type ConfirmadoPor,
  type DetalleRopa,
  type Aporte,
  type Perfil,
  CATEGORIAS_INSUMO,
  OPCIONES_EDAD,
  OPCIONES_TALLA,
  OPCIONES_GENERO,
  ESTADO_INICIAL,
  esCubiertoPorCompleto,
} from "@/lib/model";
import {
  estadoEfectivo,
  necesitaReconfirmar,
  horasSinConfirmar,
  feedOrdenado,
  separarPorVerificacion,
  balance,
  buscarSimilares,
  sugerirContrapartes,
  etiquetaVigencia,
  horaCorta,
  enlaceMapa,
  MENSAJE_RECONFIRMAR,
} from "@/lib/insumos";
import { ESTADOS, ubicacionTexto } from "@/lib/geografia";
import { SelectorUbicacion } from "@/components/SelectorUbicacion";
import { leerPerfil, capturarGPS } from "@/lib/perfil";
import {
  enviarCodigo,
  verificarCodigo,
  normalizarTelefono,
  haySenal,
  modoPrueba,
} from "@/lib/verificacion";
import { Campo, Area, Selector, Pill, TituloSeccion, Vacio, Modal } from "@/components/ui";
import { CampoTelefono, CampoCedula } from "@/components/CamposIdentidad";
import { sembrarEjemplos, borrarEjemplos } from "@/lib/ejemplos";

const ahoraMs = () => Date.now();

function categoriaEtiqueta(c: CategoriaInsumo) {
  return CATEGORIAS_INSUMO.find((x) => x.valor === c)?.etiqueta ?? c;
}

/** ¿El reporte es de este dispositivo? (coincide el perfil por teléfono/cédula, o es de ejemplo) */
function esMio(r: Reporte, perfil: Perfil | null): boolean {
  if (r.esEjemplo) return true;
  if (!perfil) return false;
  const t = normalizarTelefono(perfil.telefono || "");
  if (t && normalizarTelefono(r.autorTelefono) === t) return true;
  return Boolean(perfil.cedula) && r.autorCedula === perfil.cedula;
}

function detalleRopaTexto(d?: DetalleRopa): string {
  if (!d) return "";
  return [d.genero, d.edad ? `edad ${d.edad}` : "", d.talla ? `talla ${d.talla}` : ""]
    .filter(Boolean)
    .join(" · ");
}

// ───────────────────────────── Página ─────────────────────────────

export default function Insumos() {
  const { datos: reportes } = useColeccion<Reporte>("reportes");
  const [publicar, setPublicar] = useState(false);
  const [pestana, setPestana] = useState<"verificados" | "sin_verificar" | "cubiertos">("verificados");
  const [filtroEstado, setFiltroEstado] = useState("");

  // `ahora` se computa dentro de cada useMemo (no como dependencia) para no anular la memoización.
  const bal = useMemo(() => balance(reportes, ahoraMs()), [reportes]);

  const feed = useMemo(() => {
    const base = feedOrdenado(reportes, ahoraMs()).filter((r) =>
      filtroEstado ? r.entidad === filtroEstado : true,
    );
    return separarPorVerificacion(base, ahoraMs());
  }, [reportes, filtroEstado]);

  const cubiertos = useMemo(() => {
    const a = ahoraMs();
    return reportes
      .filter((r) => esCubiertoPorCompleto(estadoEfectivo(r, a)))
      .filter((r) => (filtroEstado ? r.entidad === filtroEstado : true))
      .sort((x, y) => (y.updatedAt ?? y.createdAt) - (x.updatedAt ?? x.createdAt));
  }, [reportes, filtroEstado]);

  const lista =
    pestana === "cubiertos" ? cubiertos : pestana === "verificados" ? feed.verificados : feed.sinVerificar;

  // Pop-up de reconfirmación: anuncios MÍOS (o de ejemplo) que llevan +6 h sin reconfirmar.
  const perfil = leerPerfil();
  const porReconfirmar = useMemo(
    () => reportes.filter((r) => necesitaReconfirmar(r, ahoraMs()) && esMio(r, perfil)),
    [reportes, perfil],
  );
  const [reconfDescartado, setReconfDescartado] = useState(false);
  const hayEjemplos = reportes.some((r) => r.esEjemplo);

  async function reconfirmarTodos() {
    for (const r of porReconfirmar) {
      await actualizar<Reporte>(
        "reportes",
        r.id,
        { ultimaConfirmacion: ahoraMs() },
        { accion: "insumo.reconfirmado", descripcion: `Reconfirmado: ${r.descripcion}` },
      );
    }
    setReconfDescartado(true);
  }

  return (
    <div>
      {/* Pop-up de reconfirmación al entrar */}
      {!reconfDescartado && porReconfirmar.length > 0 && (
        <Modal
          titulo="🔔 Reconfirma tus anuncios"
          onCerrar={() => setReconfDescartado(true)}
          acciones={
            <>
              <button className="btn btn-primario flex-1" onClick={reconfirmarTodos}>
                Reconfirmar {porReconfirmar.length}
              </button>
              <button className="btn btn-secundario flex-1" onClick={() => setReconfDescartado(true)}>
                Ahora no
              </button>
            </>
          }
        >
          Tienes <b>{porReconfirmar.length}</b> anuncio(s) con <b>+6 h sin reconfirmar</b>. Reconfírmalos
          para que sigan en el <b>feed principal</b> y todos los vean. Si no lo haces, una necesidad
          reactivada pasará en <b>24 h</b> a la pestaña <b>«Sin verificar»</b> y saldrá del feed
          principal. Al reconfirmar se actualizan y suben a lo más reciente.
        </Modal>
      )}

      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Insumos</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Cada quien sube lo que <b>tiene</b> y lo que <b>falta</b>, verificado y ubicado. Sin
        dinero (R9). Se acaba el rumor.
      </p>

      {/* Balance */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black text-[var(--rojo)]">{bal.necesidades}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">faltan</div>
        </div>
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black text-[var(--verde)]">{bal.ofertas}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">hay</div>
        </div>
        <div className="tarjeta p-3 text-center">
          <div className="text-2xl font-black text-[var(--verde-osc)]">{bal.cubiertos}</div>
          <div className="text-[11px] font-semibold text-[var(--gris)]">cubierto</div>
        </div>
      </div>

      {!publicar && (
        <button className="btn btn-primario mt-4 w-full" onClick={() => setPublicar(true)}>
          ＋ Reportar una necesidad o un ofrecimiento
        </button>
      )}

      {publicar && (
        <FormularioPublicar
          reportes={reportes}
          onCerrar={() => setPublicar(false)}
          onListo={() => setPublicar(false)}
        />
      )}

      {/* Feed estilo estados (anuncios en vivo) */}
      <TituloSeccion>Feed de anuncios</TituloSeccion>
      <div className="-mt-2 mb-3 flex items-center justify-between">
        <span className="text-xs text-[var(--gris)]">Lo que se sube y se actualiza, de lo más viejo a lo más nuevo.</span>
        {hayEjemplos ? (
          <button className="text-xs font-bold text-[var(--gris)] underline" onClick={() => borrarEjemplos()}>
            Quitar ejemplos
          </button>
        ) : (
          <button className="text-xs font-bold text-[var(--verde)] underline" onClick={() => sembrarEjemplos()}>
            Cargar ejemplos
          </button>
        )}
      </div>
      <div className="mb-3 flex gap-2">
        <button
          className="btn flex-1 !px-2 !py-2 !text-xs"
          style={{
            background: pestana === "verificados" ? "var(--verde)" : "#eef2f0",
            color: pestana === "verificados" ? "#fff" : "var(--gris)",
          }}
          onClick={() => setPestana("verificados")}
        >
          ✓ Verificados ({feed.verificados.length})
        </button>
        <button
          className="btn flex-1 !px-2 !py-2 !text-xs"
          style={{
            background: pestana === "sin_verificar" ? "var(--ambar)" : "#eef2f0",
            color: pestana === "sin_verificar" ? "#fff" : "var(--gris)",
          }}
          onClick={() => setPestana("sin_verificar")}
        >
          ⏳ Sin verificar ({feed.sinVerificar.length})
        </button>
        <button
          className="btn flex-1 !px-2 !py-2 !text-xs"
          style={{
            background: pestana === "cubiertos" ? "var(--verde-osc)" : "#eef2f0",
            color: pestana === "cubiertos" ? "#fff" : "var(--gris)",
          }}
          onClick={() => setPestana("cubiertos")}
        >
          ✔ Cubiertos ({cubiertos.length})
        </button>
      </div>

      <select
        className="campo mb-3"
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value)}
      >
        <option value="">Todos los estados</option>
        {ESTADOS.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.nombre}
          </option>
        ))}
      </select>

      {pestana === "sin_verificar" && lista.length > 0 && (
        <div className="mb-3 rounded-xl bg-[var(--ambar-bg)] p-3 text-xs font-semibold text-[var(--ambar)]">
          Aquí caen dos cosas: reportes con <b>teléfono sin verificar</b> (publicados sin señal;
          se verifican con el código al volver el internet), y <b>necesidades reactivadas</b> que
          ya fueron abastecidas y llevan <b>+24 h sin reconfirmar</b>. Reconfirmar las regresa a «Verificados».
        </div>
      )}

      <div className="space-y-2">
        {lista.length === 0 && <Vacio>Sin actualizaciones {filtroEstado ? "en este estado" : "todavía"}.</Vacio>}
        {lista.map((r) => (
          <TarjetaReporte key={r.id} r={r} reportes={reportes} />
        ))}
      </div>

      <div className="mt-5 text-sm">
        <a
          href="/resumen-insumos.html"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-[var(--verde)]"
        >
          📄 Cómo funciona Insumos (carátula)
        </a>
      </div>
    </div>
  );
}

// ───────────────────────────── Tarjeta de reporte ─────────────────────────────

function TarjetaReporte({ r, reportes }: { r: Reporte; reportes: Reporte[] }) {
  const ahora = ahoraMs();
  const efectivo = estadoEfectivo(r, ahora);
  const cubierto = esCubiertoPorCompleto(efectivo);
  const esNecesidad = r.tipo === "necesidad";
  const [panel, setPanel] = useState<null | "entregar" | "reconfirmar" | "contacto" | "contrapartes">(null);

  const tocaReconfirmar = necesitaReconfirmar(r, ahora);
  const contrapartes = useMemo(() => sugerirContrapartes(r, reportes, ahoraMs()), [r, reportes]);
  const mapa = enlaceMapa(r.lat, r.lng);
  const aportes = r.aportes ?? [];

  async function cambiarEstado(estado: Reporte["estado"], extra: Partial<Reporte> = {}) {
    await actualizar<Reporte>(
      "reportes",
      r.id,
      { estado, ultimaConfirmacion: ahoraMs(), ...extra },
      { accion: `insumo.${estado}`, descripcion: `${r.descripcion} → ${estado}` },
    );
    setPanel(null);
  }

  async function reconfirmar() {
    await actualizar<Reporte>(
      "reportes",
      r.id,
      { ultimaConfirmacion: ahoraMs() },
      { accion: "insumo.reconfirmado", descripcion: `Reconfirmado: ${r.descripcion}` },
    );
    setPanel(null);
  }

  return (
    <div className="tarjeta p-3">
      <div className="flex items-center justify-between gap-2">
        <Pill tono={esNecesidad ? "rojo" : "verde"}>
          {esNecesidad ? "Falta" : "Hay"} · {categoriaEtiqueta(r.categoria)}
        </Pill>
        <Pill tono={cubierto ? "completo" : esNecesidad ? "rojo" : "verde"}>{efectivo}</Pill>
      </div>

      <div className="mt-1.5 text-sm font-semibold text-[var(--tinta)]">
        {r.descripcion}
        {r.cantidad ? ` · ${r.cantidad}` : ""}
      </div>
      {r.detalleRopa && detalleRopaTexto(r.detalleRopa) && (
        <div className="text-xs text-[var(--gris)]">{detalleRopaTexto(r.detalleRopa)}</div>
      )}

      {/* Lugar + hora en una esquina */}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--gris)]">
        <span>📍 {ubicacionTexto(r)} · {r.punto}</span>
        <span>· 🕒 {horaCorta(r.updatedAt ?? r.createdAt, ahora)}</span>
        {mapa && (
          <a href={mapa} target="_blank" rel="noreferrer" className="font-bold text-[var(--verde)]">
            ver mapa
          </a>
        )}
        <span>· {etiquetaVigencia(r.vigencia)}</span>
      </div>

      {/* Procedencia (R5) */}
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[var(--gris)]">
        <span>👤 {r.autorNombre}</span>
        <span>· 📞 {r.autorTelefono}{r.telefonoDeTercero ? " (contacto)" : ""}</span>
        {r.telefonoVerificado ? (
          <Pill tono="verde">✓ verificado</Pill>
        ) : (
          <Pill tono="ambar">teléfono sin verificar</Pill>
        )}
        {aportes.length > 0 && <Pill tono="azul">+{aportes.length} aporte{aportes.length > 1 ? "s" : ""}</Pill>}
      </div>

      {/* Procedencia de los aportes enlazados (dedup): visibles para poder contactar (R5) */}
      {aportes.length > 0 && (
        <div className="mt-1 space-y-0.5 rounded-lg bg-[var(--verde-claro)] p-1.5 text-xs">
          <div className="font-bold text-[var(--verde-osc)]">También aportan ({aportes.length})</div>
          {aportes.map((a, i) => (
            <div key={i} className="text-[var(--gris)]">
              👤 {a.nombre} · 📞 {a.telefono}
              {a.telefonoDeTercero ? " (contacto)" : ""} {a.telefonoVerificado ? "✓" : "⏳"}
            </div>
          ))}
        </div>
      )}

      {r.confirmadoPor && cubierto && (
        <div className="mt-1 text-xs font-semibold text-[var(--verde-osc)]">
          Confirmado por el {r.confirmadoPor === "receptor" ? "receptor" : "dador"}
        </div>
      )}

      {/* Aviso de reconfirmación (anti-rumor 6 h) */}
      {tocaReconfirmar && panel !== "reconfirmar" && (
        <div className="mt-2 rounded-lg bg-[var(--ambar-bg)] p-2 text-xs font-semibold text-[var(--ambar)]">
          ⏳ Sin confirmar hace {Math.floor(horasSinConfirmar(r, ahora))} h.{" "}
          <button className="underline" onClick={() => setPanel("reconfirmar")}>
            Reconfirmar
          </button>
        </div>
      )}

      {/* Panel: reconfirmar */}
      {panel === "reconfirmar" && (
        <div className="mt-2 rounded-lg border border-[var(--linea)] p-2 text-xs">
          <p className="text-[var(--gris)]">{MENSAJE_RECONFIRMAR}</p>
          <label className="mt-2 flex items-center gap-2 font-semibold text-[var(--tinta)]">
            <span>¿Sigue siendo este tu número de contacto?</span>
            <b>{r.autorTelefono}</b>
          </label>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primario flex-1 !py-2 !text-xs" onClick={reconfirmar}>
              Sí, reconfirmar
            </button>
            <button
              className="btn btn-secundario flex-1 !py-2 !text-xs"
              onClick={() => setPanel("contacto")}
            >
              No, cambiar número
            </button>
          </div>
        </div>
      )}

      {/* Panel: cambiar contacto */}
      {panel === "contacto" && <PanelEditarContacto r={r} onListo={() => setPanel(null)} />}

      {/* Panel: entregar / abastecer (R3 + vigencia) */}
      {panel === "entregar" && (
        <PanelCubrir r={r} onListo={() => setPanel(null)} cambiarEstado={cambiarEstado} />
      )}

      {/* Acciones */}
      {panel === null && (
        <div className="mt-2 flex flex-wrap gap-2">
          {/* Acciones según el estado EFECTIVO (una necesidad reabierta por vigencia vuelve a accionar) */}
          {esNecesidad && efectivo === "abierta" && (
            <button className="btn btn-secundario !py-2 !text-xs" onClick={() => cambiarEstado("parcial")}>
              Marcar parcial
            </button>
          )}
          {esNecesidad && (efectivo === "abierta" || efectivo === "parcial") && (
            <button className="btn btn-secundario !py-2 !text-xs" onClick={() => setPanel("entregar")}>
              Abastecer…
            </button>
          )}
          {esNecesidad && efectivo !== "cerrada" && (
            <button className="btn btn-secundario !py-2 !text-xs" onClick={() => cambiarEstado("cerrada")}>
              Cerrar
            </button>
          )}

          {!esNecesidad && efectivo === "disponible" && (
            <button className="btn btn-secundario !py-2 !text-xs" onClick={() => cambiarEstado("reservado")}>
              Reservar
            </button>
          )}
          {!esNecesidad && efectivo === "reservado" && (
            <button className="btn btn-secundario !py-2 !text-xs" onClick={() => cambiarEstado("disponible")}>
              Liberar
            </button>
          )}
          {!esNecesidad && efectivo !== "entregado" && (
            <button className="btn btn-secundario !py-2 !text-xs" onClick={() => setPanel("entregar")}>
              Entregar…
            </button>
          )}

          <button className="btn btn-secundario !py-2 !text-xs" onClick={() => setPanel("contacto")}>
            Cambiar contacto
          </button>

          {contrapartes.length > 0 && (
            <button
              className="btn btn-secundario !py-2 !text-xs"
              onClick={() => setPanel("contrapartes")}
            >
              {contrapartes.length} {esNecesidad ? "ofrecimiento" : "necesidad"}
              {contrapartes.length > 1 ? "es" : ""} cerca
            </button>
          )}
        </div>
      )}

      {/* Panel: contrapartes (matching) */}
      {panel === "contrapartes" && (
        <div className="mt-2 rounded-lg border border-[var(--linea)] p-2">
          <div className="mb-1 text-xs font-bold text-[var(--tinta)]">
            {esNecesidad ? "Quién puede cubrir esto" : "A quién le sirve esto"} (cerca)
          </div>
          {contrapartes.map((c) => (
            <div key={c.id} className="border-t border-[var(--linea)] py-1.5 text-xs">
              <div className="font-semibold text-[var(--tinta)]">{c.descripcion}{c.cantidad ? ` · ${c.cantidad}` : ""}</div>
              <div className="text-[var(--gris)]">
                {ubicacionTexto(c)} · {c.punto} · 📞 {c.autorTelefono}
              </div>
            </div>
          ))}
          <button className="btn btn-secundario mt-2 w-full !py-2 !text-xs" onClick={() => setPanel(null)}>
            Cerrar
          </button>
          <p className="mt-1 text-[10px] text-[var(--gris)]">
            Solo sugerencia: coordina tú. Waraira no asigna ni cobra (R9).
          </p>
        </div>
      )}
    </div>
  );
}

// ───────────── Panel: cubrir (abastecer necesidad / entregar oferta) ─────────────

function PanelCubrir({
  r,
  onListo,
  cambiarEstado,
}: {
  r: Reporte;
  onListo: () => void;
  cambiarEstado: (estado: Reporte["estado"], extra?: Partial<Reporte>) => Promise<void>;
}) {
  const esNecesidad = r.tipo === "necesidad";
  const [quien, setQuien] = useState<ConfirmadoPor>("receptor");
  const [vigTipo, setVigTipo] = useState<"indefinido" | "fecha">("indefinido");
  const [fecha, setFecha] = useState("");

  async function confirmar() {
    const extra: Partial<Reporte> = { confirmadoPor: quien };
    if (esNecesidad) {
      const vigencia: Vigencia =
        vigTipo === "fecha" && fecha
          ? { tipo: "fecha", hasta: new Date(fecha + "T23:59:59").getTime() }
          : { tipo: "indefinido" };
      await cambiarEstado("abastecida", { ...extra, vigencia });
    } else {
      await cambiarEstado("entregado", extra);
    }
    onListo();
  }

  return (
    <div className="mt-2 rounded-lg border border-[var(--linea)] p-2 text-xs">
      <div className="font-bold text-[var(--tinta)]">
        {esNecesidad ? "Abastecer esta necesidad" : "Confirmar entrega"}
      </div>
      <p className="mt-1 text-[var(--gris)]">¿Quién confirma? (R3)</p>
      <div className="mt-1 flex gap-2">
        {(["receptor", "dador"] as ConfirmadoPor[]).map((q) => (
          <button
            key={q}
            className="btn flex-1 !py-2 !text-xs"
            style={{
              background: quien === q ? "var(--verde)" : "#eef2f0",
              color: quien === q ? "#fff" : "var(--gris)",
            }}
            onClick={() => setQuien(q)}
          >
            {q === "receptor" ? "Quien recibe" : "Quien entrega"}
          </button>
        ))}
      </div>

      {esNecesidad && (
        <div className="mt-2">
          <p className="text-[var(--gris)]">Abastecida ¿hasta cuándo?</p>
          <div className="mt-1 flex gap-2">
            <button
              className="btn flex-1 !py-2 !text-xs"
              style={{
                background: vigTipo === "indefinido" ? "var(--verde)" : "#eef2f0",
                color: vigTipo === "indefinido" ? "#fff" : "var(--gris)",
              }}
              onClick={() => setVigTipo("indefinido")}
            >
              Indefinido
            </button>
            <button
              className="btn flex-1 !py-2 !text-xs"
              style={{
                background: vigTipo === "fecha" ? "var(--verde)" : "#eef2f0",
                color: vigTipo === "fecha" ? "#fff" : "var(--gris)",
              }}
              onClick={() => setVigTipo("fecha")}
            >
              Hasta una fecha
            </button>
          </div>
          {vigTipo === "fecha" && (
            <input
              type="date"
              className="campo mt-2"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          )}
          {vigTipo === "fecha" && (
            <p className="mt-1 text-[10px] text-[var(--gris)]">
              Al pasar esa fecha, la necesidad reabre sola (seguramente vuelve a faltar).
            </p>
          )}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <button
          className="btn btn-primario flex-1 !py-2 !text-xs"
          disabled={esNecesidad && vigTipo === "fecha" && !fecha}
          onClick={confirmar}
        >
          {esNecesidad ? "Marcar abastecida" : "Marcar entregada"}
        </button>
        <button className="btn btn-secundario flex-1 !py-2 !text-xs" onClick={onListo}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ───────────── Panel: editar contacto (re-verifica el nuevo número) ─────────────

function PanelEditarContacto({ r, onListo }: { r: Reporte; onListo: () => void }) {
  const [tel, setTel] = useState(r.autorTelefono);
  const [paso, setPaso] = useState<"editar" | "codigo">("editar");
  const [codigo, setCodigo] = useState("");
  const [codigoPrueba, setCodigoPrueba] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function guardar() {
    const limpio = normalizarTelefono(tel);
    if (!limpio) {
      setError("Número inválido");
      return;
    }
    setError("");
    if (limpio === normalizarTelefono(r.autorTelefono)) {
      onListo();
      return;
    }
    // Cambió el número → re-verificar.
    if (!haySenal()) {
      // Sin señal: guarda el número nuevo como NO verificado (va al feed sin verificar).
      await actualizar<Reporte>(
        "reportes",
        r.id,
        { autorTelefono: limpio, telefonoVerificado: false, ultimaConfirmacion: ahoraMs() },
        { accion: "insumo.contacto", descripcion: `Nuevo contacto (sin verificar): ${limpio}` },
      );
      onListo();
      return;
    }
    setCargando(true);
    const env = await enviarCodigo(limpio);
    setCargando(false);
    if (!env.ok) {
      setError(env.error ?? "No se pudo enviar el código");
      return;
    }
    setCodigoPrueba(env.codigoPrueba ?? null);
    setPaso("codigo");
  }

  async function confirmar() {
    setCargando(true);
    const v = await verificarCodigo(tel, codigo);
    setCargando(false);
    if (!v.ok) {
      setError(v.error ?? "Código incorrecto");
      return;
    }
    await actualizar<Reporte>(
      "reportes",
      r.id,
      { autorTelefono: normalizarTelefono(tel), telefonoVerificado: true, ultimaConfirmacion: ahoraMs() },
      { accion: "insumo.contacto", descripcion: `Contacto verificado: ${tel}` },
    );
    onListo();
  }

  return (
    <div className="mt-2 rounded-lg border border-[var(--linea)] p-2 text-xs">
      {paso === "editar" ? (
        <>
          <div className="font-bold text-[var(--tinta)]">Cambiar número de contacto</div>
          <div className="mt-2">
            <CampoTelefono value={tel} onChange={setTel} />
          </div>
          {error && <p className="mt-1 text-[var(--rojo)]">{error}</p>}
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primario flex-1 !py-2 !text-xs" disabled={cargando} onClick={guardar}>
              Guardar
            </button>
            <button className="btn btn-secundario flex-1 !py-2 !text-xs" onClick={onListo}>
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="font-bold text-[var(--tinta)]">Escribe el código (SMS + WhatsApp)</div>
          {codigoPrueba && (
            <p className="mt-1 rounded bg-[var(--ambar-bg)] p-1.5 text-[var(--ambar)]">
              Modo prueba: tu código es <b>{codigoPrueba}</b>
            </p>
          )}
          <input
            className="campo mt-2 tracking-[0.4em]"
            inputMode="numeric"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="••••••"
          />
          {error && <p className="mt-1 text-[var(--rojo)]">{error}</p>}
          <button className="btn btn-primario mt-2 w-full !py-2 !text-xs" disabled={cargando} onClick={confirmar}>
            Verificar y guardar
          </button>
        </>
      )}
    </div>
  );
}

// ───────────────────────────── Formulario de publicación ─────────────────────────────

type Paso = "form" | "dedup" | "codigo" | "avisoSinVerificar";

function FormularioPublicar({
  reportes,
  onCerrar,
  onListo,
}: {
  reportes: Reporte[];
  onCerrar: () => void;
  onListo: () => void;
}) {
  const perfil = leerPerfil();
  const [tipo, setTipo] = useState<TipoReporte>("necesidad");
  const [categoria, setCategoria] = useState<CategoriaInsumo>("comida");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [edad, setEdad] = useState("");
  const [talla, setTalla] = useState("");
  const [genero, setGenero] = useState("");
  const [ubic, setUbic] = useState({
    entidad: perfil?.entidad ?? "",
    municipio: perfil?.municipio ?? "",
    parroquia: perfil?.parroquia ?? "",
  });
  const [punto, setPunto] = useState("");
  const [sector, setSector] = useState(perfil?.sector ?? "");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(
    perfil?.lat != null && perfil?.lng != null ? { lat: perfil.lat, lng: perfil.lng } : null,
  );
  const [gpsOmitido, setGpsOmitido] = useState(false);
  const [referencia, setReferencia] = useState("");

  const [vigTipo, setVigTipo] = useState<"indefinido" | "fecha">("indefinido");
  const [fecha, setFecha] = useState("");

  const [autorNombre, setAutorNombre] = useState(perfil?.nombre ?? "");
  const [autorTelefono, setAutorTelefono] = useState(perfil?.telefono ?? "");
  const [telTercero, setTelTercero] = useState(false);
  const [autorCedula, setAutorCedula] = useState(perfil?.cedula ?? "");
  const [cedTercero, setCedTercero] = useState(false);

  const [paso, setPaso] = useState<Paso>("form");
  const [similares, setSimilares] = useState<Reporte[]>([]);
  const [codigo, setCodigo] = useState("");
  const [codigoPrueba, setCodigoPrueba] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const pideDetalle = CATEGORIAS_INSUMO.find((c) => c.valor === categoria)?.detalle && categoria === "ropa";

  const ubicacionOk = ubic.entidad && ubic.municipio && ubic.parroquia && punto.trim();
  // GPS preferido; si no se puede, basta marcar "sin GPS" (la referencia escrita es opcional).
  const gpsOk = gps || gpsOmitido;
  // La vigencia "hasta cuándo" solo aplica a OFRECIMIENTOS; una necesidad queda activa hasta
  // cubrirse/cerrarse (la recurrencia la maneja "Abastecida hasta [fecha]", que reabre sola).
  const vigenciaOk = tipo !== "oferta" || vigTipo === "indefinido" || Boolean(fecha);
  const completo =
    descripcion.trim() &&
    ubicacionOk &&
    autorNombre.trim() &&
    normalizarTelefono(autorTelefono) &&
    autorCedula.trim() &&
    gpsOk &&
    vigenciaOk;

  async function tomarGPS() {
    setGpsOmitido(false); // reintentar siempre saca de "omitida"
    setError("");
    const p = await capturarGPS();
    if (p) {
      setGps(p);
    } else {
      setError("No se pudo tomar el GPS. Activa la ubicación del teléfono e inténtalo de nuevo, o marca «No puedo dar GPS».");
    }
  }

  function detalleRopa(): DetalleRopa | undefined {
    if (!pideDetalle) return undefined;
    if (!edad && !talla && !genero) return undefined;
    return { edad: edad || undefined, talla: talla || undefined, genero: genero || undefined };
  }

  function vigencia(): Vigencia {
    return vigTipo === "fecha" && fecha
      ? { tipo: "fecha", hasta: new Date(fecha + "T23:59:59").getTime() }
      : { tipo: "indefinido" };
  }

  // Paso 1: validar + deduplicar.
  function continuar() {
    if (!completo) {
      setError("Completa los campos obligatorios (*) y la ubicación.");
      return;
    }
    setError("");
    const sim = buscarSimilares(
      {
        tipo,
        categoria,
        descripcion,
        entidad: ubic.entidad,
        municipio: ubic.municipio,
        parroquia: ubic.parroquia,
        lat: gps?.lat,
        lng: gps?.lng,
      },
      reportes,
      ahoraMs(),
    );
    if (sim.length > 0) {
      setSimilares(sim);
      setPaso("dedup");
    } else {
      irAVerificar();
    }
  }

  // Paso 2b: enlazar a una entrada existente (dedup) en vez de duplicar.
  async function enlazar(objetivo: Reporte) {
    const aporte: Aporte = {
      nombre: autorNombre.trim(),
      telefono: normalizarTelefono(autorTelefono),
      telefonoVerificado: false, // se verifica aparte si hace falta; el contacto queda sumado
      cedula: autorCedula.trim(),
      cedulaDeTercero: cedTercero || undefined,
      telefonoDeTercero: telTercero || undefined,
      nota: [cantidad ? `cantidad: ${cantidad}` : "", descripcion].filter(Boolean).join(" · "),
      createdAt: ahoraMs(),
    };
    await actualizar<Reporte>(
      "reportes",
      objetivo.id,
      {
        aportes: [...(objetivo.aportes ?? []), aporte],
        ultimaConfirmacion: ahoraMs(),
      },
      { accion: "insumo.enlazado", descripcion: `Aporte enlazado a: ${objetivo.descripcion}` },
    );
    onListo();
  }

  // Paso 2: verificación de teléfono (o publicar sin verificar si no hay señal).
  async function irAVerificar() {
    const tel = normalizarTelefono(autorTelefono);
    if (!haySenal()) {
      await publicar(false);
      return;
    }
    setCargando(true);
    const env = await enviarCodigo(tel);
    setCargando(false);
    if (!env.ok) {
      // Sin poder enviar → publica sin verificar.
      await publicar(false);
      return;
    }
    setCodigoPrueba(env.codigoPrueba ?? null);
    setPaso("codigo");
  }

  async function confirmarCodigo() {
    setCargando(true);
    const v = await verificarCodigo(autorTelefono, codigo);
    setCargando(false);
    if (!v.ok) {
      setError(v.error ?? "Código incorrecto");
      return;
    }
    await publicar(true);
  }

  async function publicar(verificado: boolean) {
    const ahora = ahoraMs();
    await crear<Reporte>(
      "reportes",
      {
        tipo,
        categoria,
        descripcion: descripcion.trim(),
        cantidad: cantidad.trim() || undefined,
        detalleRopa: detalleRopa(),
        entidad: ubic.entidad,
        municipio: ubic.municipio,
        parroquia: ubic.parroquia,
        punto: punto.trim(),
        sector: sector.trim() || undefined,
        referenciaUbicacion: gpsOmitido ? referencia.trim() || undefined : undefined,
        estado: ESTADO_INICIAL[tipo],
        vigencia: vigencia(),
        autorNombre: autorNombre.trim(),
        autorTelefono: normalizarTelefono(autorTelefono),
        autorCedula: autorCedula.trim(),
        cedulaDeTercero: cedTercero || undefined,
        telefonoDeTercero: telTercero || undefined,
        telefonoVerificado: verificado,
        lat: gps?.lat,
        lng: gps?.lng,
        ultimaConfirmacion: ahora,
      },
      {
        accion: `insumo.${tipo}`,
        descripcion: `${tipo === "necesidad" ? "Necesidad" : "Ofrecimiento"}: ${descripcion} en ${punto}`,
      },
    );
    // Verificado → al feed principal. Sin verificar → avisamos con un pop-up.
    if (verificado) onListo();
    else setPaso("avisoSinVerificar");
  }

  // ───────── Render por paso ─────────

  if (paso === "avisoSinVerificar") {
    return (
      <Modal
        titulo="✅ Tu anuncio fue recibido"
        onCerrar={onListo}
        acciones={
          <button className="btn btn-primario w-full" onClick={onListo}>
            Entendido
          </button>
        }
      >
        Como tu teléfono aún <b>no está verificado</b>, tu anuncio estará en la pestaña{" "}
        <b>«Sin verificar»</b> y todavía <b>no en el feed principal</b>. Cuando tengas señal, verifica
        tu número con el código que te enviamos por SMS y WhatsApp y pasará a <b>«Verificados»</b>,
        donde lo verán todos.
      </Modal>
    );
  }

  if (paso === "dedup") {
    return (
      <div className="tarjeta mt-4 space-y-3 p-4">
        <div className="text-sm font-bold text-[var(--tinta)]">¿Es lo mismo que algo ya publicado?</div>
        <p className="text-xs text-[var(--gris)]">
          Encontramos {similares.length} parecido{similares.length > 1 ? "s" : ""} cerca. Si es la
          misma, enlazamos tu aporte (sumas tu contacto y lo que falte) en vez de duplicar.
        </p>
        {similares.map((s) => (
          <div key={s.id} className="rounded-lg border border-[var(--linea)] p-2 text-xs">
            <div className="font-semibold text-[var(--tinta)]">{s.descripcion}{s.cantidad ? ` · ${s.cantidad}` : ""}</div>
            <div className="text-[var(--gris)]">
              {ubicacionTexto(s)} · {s.punto} · 📞 {s.autorTelefono}
            </div>
            <button className="btn btn-secundario mt-2 w-full !py-2 !text-xs" onClick={() => enlazar(s)}>
              Es la misma — enlazar mi aporte
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <button className="btn btn-primario flex-1 !py-2 !text-xs" onClick={irAVerificar}>
            No, es distinta — continuar
          </button>
          <button className="btn btn-secundario flex-1 !py-2 !text-xs" onClick={() => setPaso("form")}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (paso === "codigo") {
    return (
      <div className="tarjeta mt-4 space-y-3 p-4">
        <div className="text-sm font-bold text-[var(--tinta)]">Verifica tu teléfono</div>
        <p className="text-xs text-[var(--gris)]">
          Enviamos el mismo código por <b>SMS</b> y <b>WhatsApp</b> a{" "}
          <b>{normalizarTelefono(autorTelefono)}</b>. Escríbelo para confirmar que el número responde.
        </p>
        {codigoPrueba && (
          <p className="rounded bg-[var(--ambar-bg)] p-2 text-xs text-[var(--ambar)]">
            Modo prueba (sin proveedor conectado): tu código es <b>{codigoPrueba}</b>.
          </p>
        )}
        <input
          className="campo tracking-[0.4em]"
          inputMode="numeric"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="••••••"
        />
        {error && <p className="text-xs text-[var(--rojo)]">{error}</p>}
        <div className="flex gap-2">
          <button className="btn btn-primario flex-1 !py-2.5 !text-sm" disabled={cargando} onClick={confirmarCodigo}>
            Verificar y publicar
          </button>
          <button className="btn btn-secundario !py-2.5 !text-sm" onClick={() => publicar(false)}>
            Publicar sin verificar
          </button>
        </div>
      </div>
    );
  }

  // paso "form"
  return (
    <div className="tarjeta mt-4 space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-[var(--tinta)]">Nuevo reporte</div>
        <button className="text-xs font-bold text-[var(--gris)]" onClick={onCerrar}>
          ✕ cerrar
        </button>
      </div>

      <div className="flex gap-2">
        <button
          className="btn flex-1"
          style={{
            background: tipo === "necesidad" ? "var(--rojo)" : "#eef2f0",
            color: tipo === "necesidad" ? "#fff" : "var(--gris)",
          }}
          onClick={() => setTipo("necesidad")}
        >
          Falta (necesidad)
        </button>
        <button
          className="btn flex-1"
          style={{
            background: tipo === "oferta" ? "var(--verde)" : "#eef2f0",
            color: tipo === "oferta" ? "#fff" : "var(--gris)",
          }}
          onClick={() => setTipo("oferta")}
        >
          Hay (ofrecimiento)
        </button>
      </div>

      <Selector label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaInsumo)}>
        {CATEGORIAS_INSUMO.map((c) => (
          <option key={c.valor} value={c.valor}>
            {c.etiqueta}
          </option>
        ))}
      </Selector>

      {/* Ubicación real: Estado → Municipio → Parroquia (dónde está, no "zona afectada") */}
      <SelectorUbicacion valor={ubic} onChange={setUbic} requerido />

      {pideDetalle && (
        <div className="grid grid-cols-3 gap-2">
          <Selector label="Edad" value={edad} onChange={(e) => setEdad(e.target.value)}>
            <option value="">—</option>
            {OPCIONES_EDAD.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Selector>
          <Selector label="Talla" value={talla} onChange={(e) => setTalla(e.target.value)}>
            <option value="">—</option>
            {OPCIONES_TALLA.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Selector>
          <Selector label="Género" value={genero} onChange={(e) => setGenero(e.target.value)}>
            <option value="">—</option>
            {OPCIONES_GENERO.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Selector>
        </div>
      )}

      <Campo label="Punto / plaza * (dónde exactamente)" value={punto} onChange={(e) => setPunto(e.target.value)} />
      <Campo label="Sector (barrio)" value={sector} onChange={(e) => setSector(e.target.value)} />
      <Area label="Descripción *" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      <Campo label="Cantidad" placeholder="50 platos, 3 cajas…" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />

      {/* Ubicación GPS (obligatoria) */}
      <div className="rounded-lg border border-[var(--linea)] p-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[var(--tinta)]">Ubicación exacta (GPS) *</span>
          {gps ? (
            <Pill tono="verde">✓ tomada</Pill>
          ) : gpsOmitido ? (
            <Pill tono="ambar">omitida</Pill>
          ) : (
            <Pill tono="gris">falta</Pill>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <button className="btn btn-secundario flex-1 !py-2 !text-xs" onClick={tomarGPS}>
            📍 {gps ? "Actualizar ubicación" : "Usar mi ubicación"}
          </button>
          {!gps && (
            <button
              className="btn !py-2 !text-xs"
              style={{
                background: gpsOmitido ? "var(--ambar)" : "#eef2f0",
                color: gpsOmitido ? "#fff" : "var(--gris)",
              }}
              onClick={() => {
                setGpsOmitido((v) => !v);
                setError("");
              }}
            >
              {gpsOmitido ? "✓ Sin GPS" : "No puedo dar GPS"}
            </button>
          )}
        </div>
        {gpsOmitido && !gps && (
          <div className="mt-2">
            <Area
              label="Referencia de la ubicación (opcional, recomendada)"
              placeholder="Frente a la iglesia, calle 5 con av. principal, punto de referencia cercano…"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Vigencia: solo para OFRECIMIENTOS ("hasta cuándo está disponible"). Una necesidad queda
          activa hasta cubrirse/cerrarse; su recurrencia la maneja "Abastecida hasta [fecha]". */}
      {tipo === "oferta" && (
        <div className="rounded-lg border border-[var(--linea)] p-2">
          <span className="text-xs font-semibold text-[var(--tinta)]">¿Hasta cuándo está disponible?</span>
          <div className="mt-1 flex gap-2">
            <button
              className="btn flex-1 !py-2 !text-xs"
              style={{
                background: vigTipo === "indefinido" ? "var(--verde)" : "#eef2f0",
                color: vigTipo === "indefinido" ? "#fff" : "var(--gris)",
              }}
              onClick={() => setVigTipo("indefinido")}
            >
              Indefinido
            </button>
            <button
              className="btn flex-1 !py-2 !text-xs"
              style={{
                background: vigTipo === "fecha" ? "var(--verde)" : "#eef2f0",
                color: vigTipo === "fecha" ? "#fff" : "var(--gris)",
              }}
              onClick={() => setVigTipo("fecha")}
            >
              Hasta una fecha
            </button>
          </div>
          {vigTipo === "fecha" && (
            <input type="date" className="campo mt-2" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          )}
        </div>
      )}

      {/* Identificación dura (R5) */}
      <div className="rounded-lg border border-[var(--linea)] p-2 space-y-2">
        <div className="text-xs font-bold text-[var(--tinta)]">Quién reporta (queda trazado)</div>
        <Campo label="Nombre *" value={autorNombre} onChange={(e) => setAutorNombre(e.target.value)} />

        <CampoTelefono
          label={telTercero ? "Teléfono de otra persona *" : "Teléfono *"}
          value={autorTelefono}
          onChange={setAutorTelefono}
        />
        <label className="flex items-center gap-2 text-xs text-[var(--gris)]">
          <input type="checkbox" checked={telTercero} onChange={(e) => setTelTercero(e.target.checked)} />
          No tengo teléfono — dejo el de otra persona y me contactan a través de ella.
        </label>

        <CampoCedula
          label={cedTercero ? "Cédula del responsable que entrega *" : "Cédula *"}
          value={autorCedula}
          onChange={setAutorCedula}
        />
        <label className="flex items-center gap-2 text-xs text-[var(--gris)]">
          <input type="checkbox" checked={cedTercero} onChange={(e) => setCedTercero(e.target.checked)} />
          La persona no tiene cédula — uso la de quien entrega/registra.
        </label>
      </div>

      {error && <p className="text-xs text-[var(--rojo)]">{error}</p>}

      <button className="btn btn-primario w-full" disabled={!completo || cargando} onClick={continuar}>
        Continuar
      </button>
      <p className="text-[10px] text-[var(--gris)]">
        Al publicar enviaremos un código por SMS y WhatsApp para verificar tu número.
        {!haySenal() && " Sin señal: se publica como «teléfono sin verificar» y lo verificas luego."}
        {modoPrueba() && " (Proveedor no conectado: modo prueba.)"}
      </p>
    </div>
  );
}
