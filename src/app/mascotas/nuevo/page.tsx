"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { crear, useColeccion } from "@/lib/db";
import {
  type Mascota,
  type EventoCustodiaMascota,
  type PersonaActo,
  type EspecieMascota,
  type SexoMascota,
  type TamanoMascota,
  type TipoRefugio,
  ESPECIES_MASCOTA,
  SEXOS_MASCOTA,
  TAMANOS_MASCOTA,
  TIPOS_REFUGIO,
  faltaPersona,
} from "@/lib/model";
import { codigoMascotaUnico } from "@/lib/mascotas";
import { subirFotoPublica } from "@/lib/fotos";
import { SelectorUbicacion } from "@/components/SelectorUbicacion";
import { CampoPersona, personaVacia } from "@/components/CampoPersona";
import { Campo, Area, Selector, TituloSeccion } from "@/components/ui";

export default function NuevaMascota() {
  const router = useRouter();
  const { datos: mascotas } = useColeccion<Mascota>("mascotas");
  const [guardando, setGuardando] = useState(false);

  // Identificación
  const [foto, setFoto] = useState<File | null>(null);
  const [previo, setPrevio] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState<EspecieMascota>("perro");
  const [sexo, setSexo] = useState<SexoMascota>("desconocido");
  const [edadAprox, setEdadAprox] = useState("");
  const [raza, setRaza] = useState("");
  const [tamano, setTamano] = useState<TamanoMascota | "">("");
  const [color, setColor] = useState("");
  const [senas, setSenas] = useState("");

  // Salud y temperamento
  const [estadoSalud, setEstadoSalud] = useState("");
  const [esterilizado, setEsterilizado] = useState(false);
  const [microchip, setMicrochip] = useState("");
  const [temperamento, setTemperamento] = useState("");
  const [notas, setNotas] = useState("");

  // Ubicación
  const [ubic, setUbic] = useState({ entidad: "", municipio: "", parroquia: "" });
  const [punto, setPunto] = useState("");

  // Refugio (opcional)
  const [tieneRefugio, setTieneRefugio] = useState(false);
  const [refTipo, setRefTipo] = useState<TipoRefugio>("residencial");
  const [refNombre, setRefNombre] = useState("");
  const [refUbicacion, setRefUbicacion] = useState("");
  const [refRespNombre, setRefRespNombre] = useState("");
  const [refRespTel, setRefRespTel] = useState("");

  // Cadena de custodia
  const [registrador, setRegistrador] = useState<PersonaActo>(personaVacia("registrador"));
  const [testigo, setTestigo] = useState<PersonaActo>(personaVacia("testigo"));
  const [custodioEsRegistra, setCustodioEsRegistra] = useState(true);
  const [custodio, setCustodio] = useState<PersonaActo>(personaVacia("custodio"));

  useEffect(() => {
    if (!foto) {
      setPrevio(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setPrevio(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const dosPersonas =
    registrador.nombre.trim() &&
    testigo.nombre.trim() &&
    registrador.nombre.trim().toLowerCase() !== testigo.nombre.trim().toLowerCase();
  const personasOk =
    faltaPersona(registrador).length === 0 &&
    faltaPersona(testigo).length === 0 &&
    (custodioEsRegistra || faltaPersona(custodio).length === 0);
  const valido = Boolean(nombre.trim() && ubic.parroquia && dosPersonas && personasOk);

  async function guardar() {
    if (!valido || guardando) return;
    setGuardando(true);
    try {
      const codigo = codigoMascotaUnico(mascotas);
      const custodioNombre = custodioEsRegistra ? registrador.nombre.trim() : custodio.nombre.trim();

      // Foto pública para el cartel compartible: si el usuario no pegó URL y hay foto local,
      // se intenta subir al host (cuando Rafa integre Cloudflare). Si no hay host, queda en local.
      let urlPublica = fotoUrl.trim() || undefined;
      if (!urlPublica && foto) {
        urlPublica = (await subirFotoPublica(foto, { nombre: nombre.trim() })) ?? undefined;
      }

      const datos: Omit<Mascota, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
        codigo,
        especie,
        nombre: nombre.trim(),
        sexo,
        edadAprox: edadAprox || undefined,
        raza: raza || undefined,
        tamano: tamano || undefined,
        color: color || undefined,
        senas: senas || undefined,
        estadoSalud: estadoSalud || undefined,
        esterilizado,
        microchip: microchip || undefined,
        temperamento: temperamento || undefined,
        notas: notas || undefined,
        fotoUrl: urlPublica,
        fotoBlob: foto ?? undefined,
        entidad: ubic.entidad || undefined,
        municipio: ubic.municipio || undefined,
        parroquia: ubic.parroquia,
        punto: punto || undefined,
        custodioActualNombre: custodioNombre,
        refugio: tieneRefugio
          ? {
              tipo: refTipo,
              nombre: refNombre.trim(),
              ubicacion: refUbicacion.trim() || undefined,
              responsableNombre: refRespNombre.trim() || undefined,
              responsableTelefono: refRespTel.trim() || undefined,
            }
          : undefined,
        estado: tieneRefugio ? "en_refugio" : "resguardada",
      };
      const mascota = await crear<Mascota>("mascotas", datos, {
        accion: "mascota.registrada",
        descripcion: `Mascota ${codigo} (${nombre.trim()}) registrada`,
      });

      const custodioFinal: PersonaActo = custodioEsRegistra ? { ...registrador, rol: "custodio" } : custodio;
      const personas: PersonaActo[] = [registrador, testigo, custodioFinal];

      const evento: Omit<EventoCustodiaMascota, "id" | "createdAt" | "updatedAt" | "syncStatus"> = {
        mascotaId: mascota.id,
        codigo,
        tipo: "registro_inicial",
        registradorNombre: registrador.nombre.trim(),
        testigoNombre: testigo.nombre.trim(),
        firmaEntrega: registrador.confirma,
        firmaTestigo: testigo.confirma,
        firmaRecibe: false,
        personas,
        refugioNombre: tieneRefugio ? refNombre.trim() : undefined,
        lugar: punto || undefined,
        entidad: ubic.entidad || undefined,
        municipio: ubic.municipio || undefined,
        parroquia: ubic.parroquia,
        punto: punto || undefined,
      };
      await crear<EventoCustodiaMascota>("custodiaMascota", evento, {
        accion: "custodiaMascota.registro_inicial",
        descripcion: `Custodia inicial de ${codigo}: registra ${registrador.nombre.trim()} (testigo ${testigo.nombre.trim()})`,
      });

      router.push(`/mascotas/${codigo}?nuevo=1`);
    } catch (e) {
      console.error(e);
      setGuardando(false);
      alert("No se pudo guardar el registro. Intenta de nuevo.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-[var(--tinta)]">Registrar mascota</h1>
      <p className="mt-1 text-sm text-[var(--gris)]">
        Foto, datos y ubicación. Recibe un código <b>MAS-XXXX</b> y abre su <b>cadena de custodia</b>
        (regla de dos personas). La foto local es confidencial; la <b>URL pública</b> permite compartir el cartel.
      </p>

      <TituloSeccion>1 · Identificación</TituloSeccion>
      <div className="space-y-3">
        <div className="tarjeta p-3">
          <div className="mb-2 text-sm font-semibold">Foto</div>
          {previo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previo} alt="vista previa" className="mb-2 h-40 w-full rounded-lg object-cover" />
          )}
          <input type="file" accept="image/*" capture="environment" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} className="text-sm" />
          <div className="mt-3">
            <Campo
              label="Foto pública (URL — Imgur, postimages, etc.)"
              placeholder="https://… (para compartir en el cartel)"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--gris)]">
              Para que el cartel “se busca” se vea al compartirlo por link, pega una URL de un host
              estable (Imgur/postimages). Los enlaces de Facebook/Instagram suelen caducar.
            </p>
          </div>
        </div>

        <Campo label="Nombre *" placeholder="p.ej. Firulais" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Selector label="Especie" value={especie} onChange={(e) => setEspecie(e.target.value as EspecieMascota)}>
            {ESPECIES_MASCOTA.map((s) => (
              <option key={s.valor} value={s.valor}>{s.etiqueta}</option>
            ))}
          </Selector>
          <Selector label="Sexo" value={sexo} onChange={(e) => setSexo(e.target.value as SexoMascota)}>
            {SEXOS_MASCOTA.map((s) => (
              <option key={s.valor} value={s.valor}>{s.etiqueta}</option>
            ))}
          </Selector>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Edad aprox." placeholder="cachorro, 2 años…" value={edadAprox} onChange={(e) => setEdadAprox(e.target.value)} />
          <Selector label="Tamaño" value={tamano} onChange={(e) => setTamano(e.target.value as TamanoMascota | "")}>
            <option value="">—</option>
            {TAMANOS_MASCOTA.map((s) => (
              <option key={s.valor} value={s.valor}>{s.etiqueta}</option>
            ))}
          </Selector>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Raza" value={raza} onChange={(e) => setRaza(e.target.value)} />
          <Campo label="Color / capa" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <Area label="Señas particulares" placeholder="Marcas, cicatrices, collar, manchas…" value={senas} onChange={(e) => setSenas(e.target.value)} />
      </div>

      <TituloSeccion>2 · Salud y temperamento</TituloSeccion>
      <div className="space-y-3">
        <Area label="Estado de salud" value={estadoSalud} onChange={(e) => setEstadoSalud(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <label className="tarjeta flex items-center gap-2 p-3 text-sm font-semibold">
            <input type="checkbox" checked={esterilizado} onChange={(e) => setEsterilizado(e.target.checked)} />
            Esterilizado/a
          </label>
          <Campo label="Microchip (nº)" value={microchip} onChange={(e) => setMicrochip(e.target.value)} />
        </div>
        <Campo label="Temperamento" placeholder="dócil, asustadizo, sociable…" value={temperamento} onChange={(e) => setTemperamento(e.target.value)} />
        <Area label="Notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </div>

      <TituloSeccion>3 · Ubicación</TituloSeccion>
      <div className="space-y-3">
        <SelectorUbicacion valor={ubic} onChange={setUbic} requerido />
        <Campo label="Punto / lugar" placeholder="p.ej. Plaza Bolívar" value={punto} onChange={(e) => setPunto(e.target.value)} />
      </div>

      <TituloSeccion>4 · Refugio (opcional)</TituloSeccion>
      <div className="tarjeta p-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={tieneRefugio} onChange={(e) => setTieneRefugio(e.target.checked)} />
          La mascota está en un refugio
        </label>
        {tieneRefugio && (
          <div className="mt-3 space-y-3">
            <Selector label="Tipo de refugio" value={refTipo} onChange={(e) => setRefTipo(e.target.value as TipoRefugio)}>
              {TIPOS_REFUGIO.map((t) => (
                <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
              ))}
            </Selector>
            <p className="text-xs text-[var(--gris)]">{TIPOS_REFUGIO.find((t) => t.valor === refTipo)?.ayuda}</p>
            <Campo label="Nombre del lugar" value={refNombre} onChange={(e) => setRefNombre(e.target.value)} />
            <Campo label="Ubicación / dirección" value={refUbicacion} onChange={(e) => setRefUbicacion(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Campo label="Responsable" value={refRespNombre} onChange={(e) => setRefRespNombre(e.target.value)} />
              <Campo label="Teléfono" value={refRespTel} onChange={(e) => setRefRespTel(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <TituloSeccion>5 · Cadena de custodia (regla de dos personas)</TituloSeccion>
      <p className="mb-2 text-xs text-[var(--gris)]">
        Quien registra y un testigo quedan asentados. Si alguien no tiene la app, declara por este
        teléfono y se le pide foto; si no está presente, se indica quién lo suplanta.
      </p>
      <div className="space-y-3">
        <CampoPersona titulo="Quien registra / asume el cuido" valor={registrador} onChange={setRegistrador} />
        <CampoPersona titulo="Testigo (segundo adulto)" valor={testigo} onChange={setTestigo} />
        <div className="tarjeta p-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={custodioEsRegistra} onChange={(e) => setCustodioEsRegistra(e.target.checked)} />
            El custodio actual es quien registra
          </label>
          {!custodioEsRegistra && (
            <div className="mt-3">
              <CampoPersona titulo="Custodio actual de la mascota" valor={custodio} onChange={setCustodio} />
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-20 z-10 mt-6 flex gap-2 rounded-xl border border-[var(--linea)] bg-[var(--blanco)] p-2 shadow">
        <button className="btn btn-secundario flex-1" onClick={() => history.back()}>Cancelar</button>
        <button className="btn btn-primario flex-1" disabled={!valido || guardando} onClick={guardar}>
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {!valido && (
        <p className="mt-2 text-xs text-[var(--ambar)]">
          Falta: nombre, parroquia y quien registra + testigo (distintos, confirmados; foto si presente
          sin app, o suplente si no está){!custodioEsRegistra ? " · datos del custodio" : ""}.
        </p>
      )}
    </div>
  );
}
