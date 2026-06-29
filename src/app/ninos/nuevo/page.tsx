"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crear } from "@/lib/db";
import {
  type Menor,
  type EstatusMenor,
  type Sexo,
  generarCodigo,
  ESTATUS_MENOR,
} from "@/lib/model";
import { SelectorUbicacion } from "@/components/SelectorUbicacion";
import { Campo, Area, Selector, TituloSeccion } from "@/components/ui";

export default function NuevoNino() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [previo, setPrevio] = useState<string | null>(null);

  // Campos del formulario
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

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFoto(f);
    setPrevio(f ? URL.createObjectURL(f) : null);
  }

  const valido = parroquia && lugarHallazgo;

  async function guardar() {
    if (!valido || guardando) return;
    setGuardando(true);
    const codigo = generarCodigo();
    const datos: Omit<Menor, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
      codigo,
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
      verificacionCompleta: false,
    };
    await crear<Menor>("menores", datos, {
      accion: "menor.censado",
      descripcion: `Menor ${codigo} censado en ${lugarHallazgo}`,
    });
    router.push(`/ninos/${codigo}?nuevo=1`);
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Censar niño</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Prioridad a los que <b>no pueden dar su nombre</b> (bebés, en shock): foto, señas, ropa,
        lugar y hora. Todo es confidencial. Al guardar se genera un <b>código de brazalete</b>.
      </p>

      <TituloSeccion>1 · Lo esencial (no perder al niño)</TituloSeccion>
      <div className="space-y-3">
        {/* Foto */}
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
          onChange={(v) => {
            setEntidad(v.entidad);
            setMunicipio(v.municipio);
            setParroquia(v.parroquia);
          }}
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

      <div className="sticky bottom-20 z-10 mt-6 flex gap-2 rounded-xl border border-[var(--linea)] bg-[var(--blanco)] p-2 shadow">
        <button className="btn btn-secundario flex-1" onClick={() => history.back()}>Cancelar</button>
        <button className="btn btn-primario flex-1" disabled={!valido || guardando} onClick={guardar}>
          {guardando ? "Guardando…" : "Guardar y generar código"}
        </button>
      </div>
      {!valido && <p className="mt-2 text-xs text-[var(--ambar)]">La parroquia y el lugar del hallazgo son obligatorios.</p>}
    </div>
  );
}
