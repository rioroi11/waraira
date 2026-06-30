"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { crear, actualizar, obtener, useColeccion } from "@/lib/db";
import {
  type Menor,
  type EventoCustodia,
  type PersonaActo,
  type Brazalete,
  type Notificacion,
  type EstatusMenor,
  type Sexo,
  brazaletePorCodigo,
  faltaPersona,
  etiquetaDestino,
  generarCodigoProvisional,
  ESTATUS_MENOR,
} from "@/lib/model";
import { ubicacionTexto, mismaZona } from "@/lib/geografia";
import { mostrarNotificacion } from "@/lib/notificaciones";
import { SelectorUbicacion } from "@/components/SelectorUbicacion";
import { EscanearQR } from "@/components/EscanearQR";
import { CampoPersona, personaVacia } from "@/components/CampoPersona";
import { Campo, Area, Selector, TituloSeccion, Pill } from "@/components/ui";

const claveP = (p: { nombre: string; cedula?: string }) => `${p.nombre.trim().toLowerCase()}|${(p.cedula ?? "").trim()}`;

export default function NuevoNino() {
  const router = useRouter();
  const { datos: brazaletes } = useColeccion<Brazalete>("brazaletes");
  const { datos: menores } = useColeccion<Menor>("menores");
  const [guardando, setGuardando] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [previo, setPrevio] = useState<string | null>(null);

  // Datos del niño
  const [entidad, setEntidad] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [parroquia, setParroquia] = useState("");
  const [punto, setPunto] = useState("");
  const [lugarHallazgo, setLugarHallazgo] = useState("");
  const [encontradoPor, setEncontradoPor] = useState("");
  const [sexo, setSexo] = useState<Sexo>("desconocido");
  const [edadMin, setEdadMin] = useState("");
  const [edadMax, setEdadMax] = useState("");
  const [estatus, setEstatus] = useState<EstatusMenor>("no_acompanado");
  const [senas, setSenas] = useState("");
  const [ropa, setRopa] = useState("");
  const [alias, setAlias] = useState("");
  const [idioma, setIdioma] = useState("");
  const [conQuien, setConQuien] = useState("");
  const [salud, setSalud] = useState("");
  const [riesgo, setRiesgo] = useState("");

  // Brazalete (del inventario). `sinBrazalete` = aún no hay manilla → código provisional.
  const [sinBrazalete, setSinBrazalete] = useState(false);
  const [yaPuesto, setYaPuesto] = useState(false);
  const [codigoBraz, setCodigoBraz] = useState("");
  const [declaraBraz, setDeclaraBraz] = useState(false);

  // Personas de la cadena
  const [registrador, setRegistrador] = useState<PersonaActo>(personaVacia("registrador"));
  const [testigo, setTestigo] = useState<PersonaActo>(personaVacia("testigo"));
  const [custodioEsColoca, setCustodioEsColoca] = useState(true);
  const [custodio, setCustodio] = useState<PersonaActo>(personaVacia("custodio"));

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    setFoto(e.target.files?.[0] ?? null);
  }
  useEffect(() => {
    if (!foto) {
      setPrevio(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setPrevio(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const brazalete = codigoBraz.trim() ? brazaletePorCodigo(codigoBraz, brazaletes) : undefined;
  const esGrupoMovil = brazalete?.destinoTipo === "grupo_movil";
  // Si el brazalete no tiene ubicación registrada, NO se puede afirmar que "no coincide".
  const brazSinUbicacion = !!brazalete && !brazalete.entidad && !brazalete.municipio && !brazalete.parroquia;
  const ubicacionCoincide =
    !brazalete || esGrupoMovil || brazSinUbicacion
      ? true
      : mismaZona({ entidad, municipio, parroquia }, { entidad: brazalete.entidad, municipio: brazalete.municipio, parroquia: brazalete.parroquia });
  const brazaleteUsable = brazalete?.estado === "entregado";

  /** Código provisional único (no choca con menores existentes ni con brazaletes del inventario). */
  function codigoProvisionalUnico(): string {
    const usados = new Set<string>([
      ...menores.map((m) => m.codigo),
      ...menores.map((m) => m.codigoProvisional ?? ""),
      ...brazaletes.map((b) => b.codigo),
    ]);
    let c = generarCodigoProvisional();
    for (let i = 0; i < 50 && usados.has(c); i++) c = generarCodigoProvisional();
    return c;
  }

  // Validación
  const dosPersonas =
    registrador.nombre.trim() &&
    testigo.nombre.trim() &&
    registrador.nombre.trim().toLowerCase() !== testigo.nombre.trim().toLowerCase();
  const personasOk =
    faltaPersona(registrador).length === 0 &&
    faltaPersona(testigo).length === 0 &&
    (custodioEsColoca || faltaPersona(custodio).length === 0);
  // Sin brazalete → solo se genera código provisional. Con brazalete → debe estar entregado y declarado.
  const brazaleteOk = sinBrazalete || (Boolean(brazalete) && brazaleteUsable && declaraBraz);
  const valido = parroquia && lugarHallazgo && dosPersonas && personasOk && brazaleteOk;

  async function guardar() {
    if (!valido || guardando) return;
    setGuardando(true);
    try {
      await guardarInterno();
    } catch (e) {
      console.error(e);
      setGuardando(false);
      alert("No se pudo guardar el registro. Revisa el dispositivo e intenta de nuevo.");
    }
  }

  async function guardarInterno() {
    let codigo: string;
    if (sinBrazalete) {
      // Aún no hay manilla: se genera un código PROVISIONAL. Al colocarse el brazalete físico
      // (en la ficha del niño), el código se actualiza al impreso y este queda como historial.
      codigo = codigoProvisionalUnico();
    } else {
      if (!brazalete) return;
      // Guardia anti-carrera: re-lee el brazalete justo antes de tomarlo. Si otro registro lo colocó
      // (o cambió de estado) entre tanto, aborta sin crear al menor (evita doble-enlace del código).
      const fresco = await obtener<Brazalete>("brazaletes", brazalete.id);
      if (!fresco || fresco.estado !== "entregado") {
        setGuardando(false);
        alert("Ese brazalete ya no está disponible (otro registro lo tomó). Escanea otro.");
        return;
      }
      codigo = brazalete.codigo;
    }

    const datos: Omit<Menor, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
      codigo,
      brazaleteProvisional: sinBrazalete || undefined,
      estatus,
      estadoIDTR: senas || ropa || foto ? "documentado" : "identificado",
      fotoBlob: foto ?? undefined,
      edadEstimadaMin: edadMin ? Number(edadMin) : undefined,
      edadEstimadaMax: edadMax ? Number(edadMax) : edadMin ? Number(edadMin) : undefined,
      sexo,
      senasFisicas: senas || undefined,
      ropaYObjetos: ropa || undefined,
      lugarHallazgo,
      entidad: entidad || undefined,
      municipio: municipio || undefined,
      parroquia,
      punto: punto || undefined,
      encontradoHora: Date.now(),
      encontradoPor: encontradoPor || undefined,
      alias: alias || undefined,
      idioma: idioma || undefined,
      conQuienEstaba: conQuien || undefined,
      estadoSalud: salud || undefined,
      senalesRiesgo: riesgo || undefined,
      cuidoActual: custodioEsColoca ? registrador.nombre.trim() : custodio.nombre.trim(),
      verificacionCompleta: false,
    };
    const menor = await crear<Menor>("menores", datos, {
      accion: "menor.censado",
      descripcion: `Menor ${codigo} censado en ${lugarHallazgo}`,
    });

    // Cadena completa: responsables del brazalete (del inventario) + personas in-situ.
    const responsablesPersonas: PersonaActo[] = (brazalete?.responsables ?? []).map((r) => ({
      rol: "responsable_brazalete" as const,
      nombre: r.nombre,
      cedula: r.cedula,
      telefono: r.telefono,
      presente: false,
      tieneApp: true,
      declaraAqui: false,
      confirma: false,
    }));
    const custodioFinal: PersonaActo = custodioEsColoca ? { ...registrador, rol: "custodio" } : custodio;
    const inSitu: PersonaActo[] = [registrador, testigo, custodioFinal];
    const personas: PersonaActo[] = [...responsablesPersonas, ...inSitu];

    // A notificar in-situ: con app y sin duplicados por IDENTIDAD. Se siembra el set con el
    // registrador (opera este teléfono) para que no se autonotifique aunque también sea custodio.
    const vistos = new Set<string>([claveP(registrador)]);
    const aNotificar = inSitu.filter((p) => {
      if (!p.tieneApp || !p.nombre.trim()) return false;
      const k = claveP(p);
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });

    const evento: Omit<EventoCustodia, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
      menorId: menor.id,
      codigo,
      tipo: "registro_inicial",
      registradorNombre: registrador.nombre.trim(),
      testigoNombre: testigo.nombre.trim(),
      firmaEntrega: registrador.confirma,
      firmaTestigo: testigo.confirma,
      firmaRecibe: false,
      personas,
      braceleteCodigo: sinBrazalete ? undefined : codigo,
      braceleteDestinoTipo: brazalete?.destinoTipo,
      braceleteDestinoNombre: brazalete?.destinoNombre,
      ubicacionCoincide: sinBrazalete ? undefined : ubicacionCoincide,
      colocadoPorGrupoMovil: sinBrazalete ? undefined : esGrupoMovil,
      brazaleteYaPuesto: sinBrazalete ? undefined : yaPuesto,
      notificados: [...aNotificar.map((p) => p.nombre.trim()), ...responsablesPersonas.map((p) => p.nombre.trim())],
      lugar: lugarHallazgo,
      entidad: entidad || undefined,
      municipio: municipio || undefined,
      parroquia,
      punto: punto || undefined,
    };
    await crear<EventoCustodia>("custodia", evento, {
      accion: "custodia.registro_inicial",
      descripcion: sinBrazalete
        ? `Registro inicial de ${codigo} (código provisional, sin brazalete) por ${registrador.nombre.trim()}`
        : `Custodia inicial de ${codigo}: coloca ${registrador.nombre.trim()} (testigo ${testigo.nombre.trim()})`,
    });

    // El brazalete pasa a colocado y queda atado a este niño (solo si hay brazalete físico).
    if (!sinBrazalete && brazalete) {
      await actualizar<Brazalete>(
        "brazaletes",
        brazalete.id,
        { estado: "colocado", menorId: menor.id },
        { accion: "brazalete.colocado", descripcion: `Brazalete ${codigo} colocado en un niño` },
      );
    }

    // Notificaciones in-situ (testigo/custodio con app).
    for (const p of aNotificar) {
      await crearNoti({
        paraNombre: p.nombre.trim(),
        paraCedula: p.cedula,
        paraTelefono: p.telefono,
        tipo: `custodia.${p.rol}`,
        titulo: "Waraira · cadena de custodia",
        cuerpo: `Quedaste como ${p.rol} del niño marcado con el brazalete ${codigo}.`,
        refMenorId: menor.id,
        refCodigo: codigo,
        leida: false,
      });
    }
    // Constancia a los responsables del brazalete: si NO coincide la ubicación, se les pide confirmar.
    for (const r of brazalete?.responsables ?? []) {
      await crearNoti({
        paraNombre: r.nombre,
        paraCedula: r.cedula,
        paraTelefono: r.telefono,
        tipo: "custodia.constancia",
        titulo: ubicacionCoincide ? "Waraira · brazalete colocado" : "Waraira · constancia requerida",
        cuerpo: ubicacionCoincide
          ? `El brazalete ${codigo} que recibiste se colocó a un niño en ${ubicacionTexto({ entidad, municipio, parroquia }) || lugarHallazgo}.`
          : `El brazalete ${codigo} que recibiste se está usando en un niño censado en OTRA ubicación (${ubicacionTexto({ entidad, municipio, parroquia }) || lugarHallazgo}). Da constancia: ¿eres testigo presente, con conocimiento a distancia, o lo desconoces?`,
        refMenorId: menor.id,
        refCodigo: codigo,
        leida: false,
        requiereConstancia: !ubicacionCoincide,
      });
    }
    mostrarNotificacion("Waraira · cadena de custodia", {
      body: `Niño marcado con ${codigo}. Cadena con ${personas.length} persona(s)${ubicacionCoincide ? "" : " · constancia pendiente"}.`,
      icon: "/icon.svg",
      tag: "waraira-custodia",
    });

    router.push(`/ninos/${codigo}?nuevo=1`);
  }

  async function crearNoti(n: Omit<Notificacion, "id" | "createdAt" | "updatedAt" | "syncStatus">) {
    await crear<Notificacion>("notificaciones", n, {
      accion: "notificacion.custodia",
      descripcion: `Notificación a ${n.paraNombre} por ${n.refCodigo ?? ""}`,
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Censar niño</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Prioridad a los que <b>no pueden dar su nombre</b>: foto, señas, ropa, lugar y hora. Todo es
        confidencial. El niño se enlaza con un <b>brazalete ya registrado en el inventario</b>.
      </p>

      <TituloSeccion>1 · Lo esencial (no perder al niño)</TituloSeccion>
      <div className="space-y-3">
        <div className="tarjeta p-3">
          <div className="mb-2 text-sm font-semibold">Foto (confidencial — nunca pública)</div>
          {previo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previo} alt="vista previa" className="mb-2 h-40 w-full rounded-lg object-cover" />
          )}
          <input type="file" accept="image/*" capture="environment" onChange={onFoto} className="text-sm" />
        </div>

        <SelectorUbicacion
          valor={{ entidad, municipio, parroquia }}
          onChange={(v) => { setEntidad(v.entidad); setMunicipio(v.municipio); setParroquia(v.parroquia); }}
          requerido
        />
        <Campo label="Punto / plaza" placeholder="p.ej. Plaza Bolívar" value={punto} onChange={(e) => setPunto(e.target.value)} />
        <Campo label="Lugar exacto del hallazgo *" placeholder="Dónde se encontró al niño" value={lugarHallazgo} onChange={(e) => setLugarHallazgo(e.target.value)} />
        <Campo label="Quién lo encontró/entregó (contacto)" value={encontradoPor} onChange={(e) => setEncontradoPor(e.target.value)} />

        <div className="grid grid-cols-3 gap-2">
          <Selector label="Sexo" value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)}>
            <option value="desconocido">—</option>
            <option value="f">Niña</option>
            <option value="m">Niño</option>
          </Selector>
          <Campo label="Edad mín." type="number" inputMode="numeric" value={edadMin} onChange={(e) => setEdadMin(e.target.value)} />
          <Campo label="Edad máx." type="number" inputMode="numeric" value={edadMax} onChange={(e) => setEdadMax(e.target.value)} />
        </div>

        <Area label="Señas físicas distintivas" placeholder="Cicatrices, marcas, lunares, dentición, discapacidad…" value={senas} onChange={(e) => setSenas(e.target.value)} />
        <Area label="Ropa y objetos (consérvalos físicamente)" placeholder="Describe la ropa y todo objeto hallado con el niño" value={ropa} onChange={(e) => setRopa(e.target.value)} />
      </div>

      <TituloSeccion>2 · Identidad y vínculo</TituloSeccion>
      <div className="space-y-3">
        <Campo label="Apodo / cómo le llaman (o nombre provisional)" value={alias} onChange={(e) => setAlias(e.target.value)} />
        <Selector label="Estatus" value={estatus} onChange={(e) => setEstatus(e.target.value as EstatusMenor)}>
          {ESTATUS_MENOR.map((s) => (
            <option key={s.valor} value={s.valor}>{s.etiqueta}</option>
          ))}
        </Selector>
        <Campo label="Idioma / dialecto que habla" value={idioma} onChange={(e) => setIdioma(e.target.value)} />
        <Area label="¿Con quién estaba? / circunstancias de la separación" value={conQuien} onChange={(e) => setConQuien(e.target.value)} />
      </div>

      <TituloSeccion>3 · Seguridad inmediata</TituloSeccion>
      <div className="space-y-3">
        <Area label="Estado de salud y necesidades médicas" value={salud} onChange={(e) => setSalud(e.target.value)} />
        <Area label="Señales de riesgo / angustia" value={riesgo} onChange={(e) => setRiesgo(e.target.value)} />
      </div>

      <TituloSeccion>4 · Brazalete</TituloSeccion>
      <div className="tarjeta p-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={sinBrazalete} onChange={(e) => { setSinBrazalete(e.target.checked); setDeclaraBraz(false); }} />
          El niño aún NO tiene brazalete — generar código provisional
        </label>

        {sinBrazalete ? (
          <div className="mt-3 rounded-lg border border-[var(--azul)] bg-[var(--azul-bg)] p-3 text-sm text-[var(--azul)]">
            Se generará un <b>código provisional (PRV-…)</b> para no perder al niño ahora. Cuando se le
            coloque el brazalete físico, ábrelo en su ficha y usa <b>«Asignar brazalete físico»</b>: al
            escanear el código impreso, el del niño se <b>actualiza</b> y el provisional queda en el historial.
          </div>
        ) : (
        <>
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={yaPuesto} onChange={(e) => setYaPuesto(e.target.checked)} />
          El niño ya tenía el brazalete puesto (no lo coloco yo ahora)
        </label>
        <div className="mt-3">
          <div className="mb-1.5 text-sm font-semibold">Escanea el QR o apunta el código del brazalete</div>
          <EscanearQR value={codigoBraz} onChange={(v) => { setCodigoBraz(v); setDeclaraBraz(false); }} />
        </div>

        {codigoBraz.trim() && !brazalete && (
          <div className="mt-3 rounded-lg border border-[var(--ambar)] bg-[var(--ambar-bg)] p-3 text-sm text-[var(--ambar)]">
            Ese código no está en el inventario.{" "}
            <Link href="/brazaletes/registro" className="font-bold underline">Regístralo y entrégalo</Link> primero.
          </div>
        )}
        {brazalete && brazalete.estado === "en_stock" && (
          <div className="mt-3 rounded-lg border border-[var(--ambar)] bg-[var(--ambar-bg)] p-3 text-sm text-[var(--ambar)]">
            Ese brazalete está en stock pero <b>no fue entregado a ningún destino</b>. Asígnalo primero en el inventario.
          </div>
        )}
        {brazalete && brazalete.estado === "colocado" && (
          <div className="mt-3 rounded-lg border border-[var(--rojo)] bg-[var(--rojo-bg)] p-3 text-sm text-[var(--rojo)]">
            Ese brazalete ya está <b>colocado en otro niño</b>. No se puede reutilizar.
          </div>
        )}
        {brazalete && brazaleteUsable && (
          <div className="mt-3 rounded-lg border border-[var(--verde)] bg-[var(--verde-claro)] p-3">
            <div className="text-sm text-[var(--verde-osc)]">
              Brazalete <b className="font-mono">{brazalete.codigo}</b> · {etiquetaDestino(brazalete.destinoTipo)}:{" "}
              <b>{brazalete.destinoNombre}</b>
              {ubicacionTexto(brazalete) ? ` (${ubicacionTexto(brazalete)})` : ""}.
            </div>
            {(brazalete.responsables ?? []).length > 0 && (
              <div className="mt-1 text-xs text-[var(--verde-osc)]">
                Responsables: {(brazalete.responsables ?? []).map((r) => r.nombre).join(", ")} — se les notificará.
              </div>
            )}
            {esGrupoMovil && <div className="mt-1"><Pill tono="azul">Lo coloca un grupo móvil</Pill></div>}
            {!ubicacionCoincide && (
              <div className="mt-2 rounded-md bg-[var(--ambar-bg)] p-2 text-xs text-[var(--ambar)]">
                ⚠ La ubicación del censo <b>no coincide</b> con donde se entregó este brazalete. Se registra igual y se
                pide <b>constancia</b> a sus responsables (no bloquea).
              </div>
            )}
            <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--verde-osc)]">
              <input type="checkbox" checked={declaraBraz} onChange={(e) => setDeclaraBraz(e.target.checked)} />
              {yaPuesto
                ? "Declaro que este niño ya portaba este brazalete y lo confirmo."
                : "Declaro que yo coloco este brazalete a este niño, aquí y ahora."}
            </label>
          </div>
        )}
        </>
        )}
      </div>

      <TituloSeccion>5 · Cadena de custodia (regla de dos personas)</TituloSeccion>
      <p className="mb-2 text-xs text-[var(--gris)]">
        Quien coloca el brazalete y un testigo quedan registrados. Si alguien no tiene la app, declara
        por este teléfono y se le pide foto; si no está presente, se indica quién lo suplanta.
      </p>
      <div className="space-y-3">
        <CampoPersona titulo={sinBrazalete ? "Quien registra al niño" : esGrupoMovil ? "Quien coloca (voluntario del grupo móvil)" : "Quien coloca el brazalete"} valor={registrador} onChange={setRegistrador} />
        <CampoPersona titulo="Testigo (segundo adulto)" valor={testigo} onChange={setTestigo} />

        <div className="tarjeta p-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={custodioEsColoca} onChange={(e) => setCustodioEsColoca(e.target.checked)} />
            El custodio temporal del niño es {sinBrazalete ? "quien lo registra" : "quien coloca el brazalete"}
          </label>
          {!custodioEsColoca && (
            <div className="mt-3">
              <CampoPersona titulo="Custodio temporal del niño" valor={custodio} onChange={setCustodio} />
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-20 z-10 mt-6 flex gap-2 rounded-xl border border-[var(--linea)] bg-[var(--blanco)] p-2 shadow">
        <button className="btn btn-secundario flex-1" onClick={() => history.back()}>Cancelar</button>
        <button className="btn btn-primario flex-1" disabled={!valido || guardando} onClick={guardar}>
          {guardando ? "Guardando…" : "Guardar y enlazar"}
        </button>
      </div>
      {!valido && (
        <p className="mt-2 text-xs text-[var(--ambar)]">
          Falta: parroquia y lugar del hallazgo · un <b>brazalete entregado</b> declarado · quien coloca + testigo
          (distintos, confirmados; foto si presente sin app, o suplente si no está){!custodioEsColoca ? " · datos del custodio" : ""}.
        </p>
      )}
    </div>
  );
}
