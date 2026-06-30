# Módulo Mascotas — Waraira

Mascotas en emergencias **ubicadas** (foto, datos, descripción) con un **historial de movimiento** que es una **cadena de custodia append-only** (mismo rigor que el módulo de niños), una **cartelera** de avisos "se busca / encontrada / reunificada" con **cartel imprimible/compartible**, y una **pestaña de necesidades** veterinarias + proveedores que reutiliza el motor de Insumos. **Sin brazaletes.**

> Entrega (convención WARAIRA.md §10): este módulo = **carátula** (`public/resumen-mascotas.html`) + **módulo** (`/mascotas`) + **ambos links, siempre**.

## 0 · Dónde aterriza cada pieza

| Pieza | Archivo |
|---|---|
| Tipos / enums / gates | `src/lib/model.ts` (sección «Mascota») |
| Lógica pura + puente a Insumos | `src/lib/mascotas.ts` |
| Colecciones locales (IndexedDB v5) | `src/lib/db.ts` |
| Endpoints de convergencia | `src/lib/sync.ts` |
| Esquema + funciones Convex | `convex/schema.ts`, `convex/mascotas.ts`, `convex/custodiaMascota.ts`, `convex/avisosMascota.ts`, `convex/reportes.ts` |
| Lista + 3 pestañas | `src/app/mascotas/page.tsx` |
| Alta | `src/app/mascotas/nuevo/page.tsx` |
| Ficha + custodia + necesidades | `src/app/mascotas/[codigo]/page.tsx` |
| Cartel imprimible/compartible | `src/app/mascotas/[codigo]/cartel/page.tsx` |
| Chapas / collar QR (opcional) | `src/app/mascotas/chapas/page.tsx` |
| Foto (URL pública o Blob local) | `src/components/FotoMascota.tsx` |
| Navegación | `src/components/Shell.tsx` |
| Carátula | `public/resumen-mascotas.html` |

## 1 · Decisiones de la dueña

1. **Custodia ESTRICTA append-only** (como niños): eventos inmutables, regla de dos personas (registrador + testigo distintos), confirma el receptor (R3), encadenada por el código; actualiza el custodio actual.
2. **Refugio = campos en la ficha** (no tabla aparte): tipo (residencial / público acondicionado / institucional / hogar temporal) + nombre + ubicación + responsable.
3. **Necesidades = AMBOS**: atadas a la ficha (`mascotaId`) **y** en el tablero general reutilizando el motor de Insumos, con categorías veterinarias. Proveedores = **ofertas** en ese mismo motor.
4. **Feed = cartelera** "se busca / encontrada / reunificada" (avisos manuales) + **cartel imprimible/compartible** accesible por un botón pequeño y claro.
5. **Identificador**: código automático `MAS-XXXX` (encadena la custodia) + **chapa/collar QR opcional** (codifica solo el código). Identificación humana = **nombre + foto**.
6. **Fotos**: `fotoUrl` (URL pública de host gratuito, host-agnóstico) que **sí** viaja y permite compartir el cartel + `fotoBlob` (captura local) que **nunca** viaja.

## 2 · Modelo de datos

- **`Mascota`** — código `MAS-XXXX`, especie, nombre, sexo, edadAprox, raza, tamaño, color, señas, estadoSalud, esterilizado, microchip, temperamento, notas, `fotoUrl`/`tieneFoto`/`fotoBlob`, geografía (entidad/municipio/parroquia/punto + lat/lng), `custodioActualId/Nombre`, `refugio` (sub-objeto), `estado`. Mutable.
- **`EventoCustodiaMascota`** — append-only; clon de `EventoCustodia` sin campos de brazalete, con `refugioNombre`/`veterinario`. Tipos: registro_inicial, traspaso, salida_con_responsable, ingreso_refugio, salida_refugio, atencion_veterinaria, reunificacion. Reutiliza `PersonaActo`/`faltaPersona`. Gate: `faltaParaTraspasoMascota`.
- **`AvisoMascota`** — cartelera: tipo (se_busca/encontrada/reunificada), título, descripción, `fotoUrl`, zona/geografía, contacto (R5), estado activo/resuelto. Gate: `faltaParaAviso`.
- **`Reporte`** (extendido) — `categoria` admite 6 literales veterinarios (medicinas_vet, atencion_vet, operacion, alimento_mascota, hospedaje, traslado_mascota) + `mascotaId?`.
- Máquina de estados: `TRANSICIONES_MASCOTA` (resguardada / en_refugio / en_tratamiento / perdida / reunificada / fallecida).

## 3 · Reglas / invariantes

- **Dos personas + R3**: registrador y testigo distintos, confirma el receptor en traspaso/salida/reunificación.
- **Append-only (R10)**: la custodia nunca se reescribe (`convex/custodiaMascota.ts` retorna sin modificar si existe el `clientId`).
- **R5 procedencia**: avisos y reportes llevan contacto identificado.
- **R7 binarios**: `fotoBlob` (y fotos de respaldo de la custodia) jamás se sincronizan; `sinBinarios` los elimina y materializa `tieneFoto`. `fotoUrl` (string público) sí viaja.
- **R9 cero dinero**.

## 4 · Flujos

1. **Alta**: foto + datos + ubicación → `MAS-XXXX` único → crea la mascota y el `registro_inicial` de custodia (dos personas).
2. **Movimiento**: modal en la ficha asienta traspaso / salida / ingreso/salida de refugio / atención veterinaria / reunificación; actualiza el custodio actual y, según el tipo, el estado.
3. **Aviso**: se publica un aviso en la cartelera (opcionalmente enlazado a una mascota).
4. **Cartel**: botón "🪧 Cartel" → página imprimible/compartible con foto + datos + zona + contacto + QR (solo el código).
5. **Necesidad**: se reporta una necesidad/oferta veterinaria; aparece en la ficha (si está enlazada) y en el tablero del módulo y en `/insumos` general.

## 5 · Convergencia Convex

- Tablas `mascotas` (replace por clientId — mutable), `custodiaMascota` (insert-only — inmutable), `avisosMascota` (replace). `reportes` extendido con categorías vet + `mascotaId`.
- Endpoints en `src/lib/sync.ts`: `mascotas:upsert`, `custodiaMascota:upsert`, `avisosMascota:upsert`.
- Convex está apagado por defecto (sin `NEXT_PUBLIC_CONVEX_URL`); la app es local-first y funciona sin él.

## 6 · Roadmap

- GPS opcional en alta y aviso (reutilizar `capturarGPS`).
- Matching visible necesidad ↔ oferta en la ficha (ya disponible `sugerirContrapartes`).
- Datos de ejemplo ("sembrar") para demo.
- Push real entre teléfonos (depende de Convex + Web Push, roadmap general).
