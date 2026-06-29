# Módulo de Insumos / Ayudas civiles — spec para sesión de desarrollo

> **Para la IA de la próxima sesión (desarrollo):** este documento te prepara para construir
> la versión robusta del **módulo de insumos / ayudas por parte de los civiles**. Lee primero
> `docs/WARAIRA.md` (plataforma) y la memoria del proyecto. Es **desarrollo**, no contenido.
> Última actualización: 28 de junio de 2026.

## 1. Problema a resolver

La ayuda civil hoy circula como **rumor no verificado** (estados de WhatsApp): nadie sabe si
la oferta es **real**, si **ya se entregó**, **de qué zona** es, ni cómo **contactar**.
Caso ilustrativo (no encuadrar como único): alguien publica "tengo 70 carpas" en un estado;
se repostea; el que reposteó no conoce a la persona; el número del supuesto dueño **no existe
en WhatsApp**; la info **sigue rodando** aunque las carpas ya no estén. Resultado: esfuerzo
perdido, confusión entre zonas, e imposibilidad de coordinar.

**Objetivo del módulo:** que **cada quien suba a Waraira lo que tiene y lo que no tiene**
(oferta/necesidad), **verificado, ubicado y con estado en vivo**, para **acabar con el rumor**
y unificar la ayuda civil. Aplica a carpas, comida, agua, medicinas, colchonetas, traslados, etc.

## 2. Qué ya existe (punto de partida — reutilizar)

- **UI**: `src/app/insumos/page.tsx` (alta necesidad/oferta, balance, filtro por zona, estados).
- **Modelo**: `Reporte` en `src/lib/model.ts` (tipo necesidad/oferta, categoría, punto, zona/
  `parroquia`, descripción, cantidad, estado abierto/parcial/cubierto/cerrado, contacto, GPS).
- **Store offline**: `src/lib/db.ts` (colección `reportes`), patrón local-first + eventos.
- **Convergencia**: `convex/convergencia.ts` (`upsertReporte`, mapea zona) + `convex/reportes.ts`.
- **Flujo diagramado**: `modulos/flujos/7-insumos.html`.
- Reglas vigentes: **R3** confirma el receptor, **R4** cerrar libera, **R5** procedencia visible,
  **R6** cumplimiento parcial, **R9 cero dinero**, **R8 neutralidad**, **R10 auditabilidad**.

## 2b. Entrega obligatoria (convención Waraira)

Aplica la **convención de entrega** (ver `docs/WARAIRA.md` §10): además del módulo,
construir su **carátula** `public/resumen-insumos.html` (resumen ejecutivo con **mapa
conceptual/diagrama** y las fallas que evita, estilo verde Waraira como `public/resumen.html`),
y al terminar **entregar SIEMPRE los dos links**:
- Carátula: `https://insumos-three.vercel.app/resumen-insumos.html`
- Módulo en la app: `https://insumos-three.vercel.app/insumos`

## 3. Qué se construyó — decisiones acordadas (28 jun 2026)

Estas son las decisiones cerradas con la dueña (Edma) e implementadas en el módulo. El objetivo
rector es **matar el rumor** (caso "70 carpas": info que rueda sin corroborar, sin saber si ya se
entregó, de qué zona, ni con contacto verificable).

**A) Ciclos SEPARADOS necesidad y oferta.**
- **Necesidad**: `abierta → parcial → abastecida → cerrada`. "Abastecida" muestra
  *"cubierta hasta [fecha | indefinido]"*. Si la vigencia es **por fecha y vence**, la necesidad
  abastecida **reabre sola** (`estadoEfectivo → "abierta"`).
- **Oferta**: `disponible (hasta [fecha | indefinido]) → reservado → entregado`. La oferta cuya
  vigencia por fecha vence **sale del tablero activo** y queda en historial.
- "abastecida" y "entregado" = **cubierto por completo**: color único compartido **verde oscuro**
  (`--verde-osc`) vía `Pill` tono `"completo"`. **Nunca** se usa la palabra "vencido".

**B) Identificación dura para publicar (R5)** — obligatoria al **pedir y al ofrecer**:
nombre, teléfono, ubicación (GPS + zona + punto) y cédula.
- Sin cédula → cédula del responsable que entrega (`cedulaDeTercero`).
- Sin teléfono → casilla "no tengo teléfono" → teléfono de otra persona (`telefonoDeTercero`).
- El teléfono admite números del exterior (`normalizarTelefono` conserva el `+`).

**C) Verificación de teléfono por doble vía.** **Un mismo código** se envía por **SMS y por
WhatsApp** para asegurar entrega.
- Sin señal: se publica con `telefonoVerificado = false` → va a un **feed separado**
  ("sin verificar").
- La reconfirmación de 6 h **no pide código**: muestra la casilla
  *"¿sigue siendo este tu número?"*.

**D) Reconfirmación anti-rumor cada 6 h** (`HORAS_RECONFIRMAR = 6`). Al reconfirmar, la entrada
**se re-publica** en el feed (nuevos `updatedAt` / `ultimaConfirmacion`). Si **no** reconfirma:
**no se marca nada**, sigue en el feed en orden cronológico. Mensaje `MENSAJE_RECONFIRMAR`.

**E) Feed estilo estados/historias** dentro de la app: orden de **más antiguas a más nuevas**
(ascendente por `updatedAt`), con hora, GPS (enlace a mapa) y lugar (zona + punto) en una
esquina; necesidades y ofertas distinguidas. Dos pestañas: **verificados** / **teléfono sin
verificar**.

**F) Categorías**: comida, agua, medicinas, carpas, colchonetas, kits_higiene, cobijas, ropa,
traslados, insumos, otro. Solo **ropa** pide detalle (edad/talla/género), **opcional** en ambos
tipos, cada campo con opción **"varios"**. La **cobija no pide talla**.

**G) Matching necesidad ↔ oferta**: `sugerirContrapartes` (tipo opuesto, misma categoría, misma
zona). Es **solo sugerencia, nunca asigna**. **Cero dinero** (R9).

**H) Deduplicación SIEMPRE activa al publicar**: `buscarSimilares` (mismo tipo + categoría + zona
+ descripción parecida). Si "es la misma" → se **enlaza un Aporte** (suma contacto + info
faltante) a la entrada existente, **no se duplica**. **Editar contacto**: el dueño puede cambiar
el número; si cambia y hay señal, el nuevo número **se re-verifica**.

**I) Reglas aplicadas**: **R3** (confirma el receptor; entrega/abastecimiento registra
`confirmadoPor: "receptor" | "dador"`), **R4** (cerrar libera), **R5** (procedencia visible),
**R6** (parcial), **R9** (cero dinero, jamás cobros), **R10** (toda acción genera evento vía
`crear`/`actualizar` de `db.ts`). **Offline-first**: IndexedDB es la fuente de verdad; Convex es
convergencia opcional, hoy apagada.

### Mapa de archivos del módulo

- `src/lib/model.ts` — tipos `Reporte` (sección "Insumo (reporte)"): ciclos separados, vigencia,
  verificación, terceros, etc.
- `src/lib/insumos.ts` — lógica: `estadoEfectivo`, `vigenciaVencida`, `enTableroActivo`,
  `necesitaReconfirmar`, `horasSinConfirmar`, `feedOrdenado`, `separarPorVerificacion`, `balance`,
  `buscarSimilares` (dedup), `sugerirContrapartes` (matching), `etiquetaVigencia`, `horaCorta`,
  `enlaceMapa`, `similitudTexto`.
- `src/lib/verificacion.ts` — código por SMS + WhatsApp (modo prueba + sender vía
  `NEXT_PUBLIC_VERIF_ENDPOINT`).
- `src/app/insumos/page.tsx` — UI completa (feed, formulario, tarjeta, paneles).
- `src/components/ui.tsx` — `Pill` tono `"completo"` (verde oscuro) para cubierto por completo.
- `public/resumen-insumos.html` — carátula / resumen ejecutivo (ver §2b).

### Pendientes (marcados explícitamente)

- **Verificación real de teléfono**: hoy en **modo prueba**. Requiere conectar proveedor
  (**Twilio SMS** + **WhatsApp Cloud API**) vía `NEXT_PUBLIC_VERIF_ENDPOINT`.
- **Convergencia Convex**: hoy **apagada**; IndexedDB es la fuente de verdad. Conectar cuando se
  habilite el backend.
- **Verificación de cédula**: la identificación se captura, pero el cruce/validación de cédula
  (ver `WARAIRA.md` §8) queda pendiente.

## 4. Cómo retomar el contexto (pega esto al abrir la sesión nueva)

> "Vamos a desarrollar el módulo de insumos / ayudas civiles de Waraira. Lee primero
> `docs/MODULO-INSUMOS.md` (§3 tiene las decisiones A–I ya implementadas), `docs/WARAIRA.md` y la
> memoria del proyecto. Es desarrollo (no contenido). Aplica la convención de entrega
> (WARAIRA.md §10): **carátula + módulo + ambos links**. Punto de partida ya escrito:
> `src/lib/model.ts` (Reporte), `src/lib/insumos.ts` (lógica), `src/lib/verificacion.ts`
> (SMS+WhatsApp, modo prueba), `src/app/insumos/page.tsx` (UI), `src/components/ui.tsx`
> (Pill 'completo'). Pendientes: conectar proveedor real (Twilio + WhatsApp Cloud API) y Convex."

## 5. Recordatorios técnicos

- Next 16 + React 19 + Tailwind v4; **AGENTS.md** obliga a leer `node_modules/next/dist/docs/`
  antes de escribir código Next.
- La app NO importa `convex/_generated` (rompe el build); `convex` está excluido del tsconfig
  raíz; sync usa `makeFunctionReference`.
- **Verificación de teléfono en modo prueba**: la entrega real de código requiere proveedor
  (**Twilio SMS** + **WhatsApp Cloud API**) + **Convex** para persistir/convergir; se conecta vía
  `NEXT_PUBLIC_VERIF_ENDPOINT` (`src/lib/verificacion.ts`). Hoy ambos están apagados y la fuente de
  verdad es IndexedDB (`src/lib/db.ts`).
- Tras tocar HTML de `modulos/`, recopiar a `public/modulos/` para que la app los sirva.
- Verificar con `npm run build`; desplegar con `vercel --prod --yes` (org `enves`,
  URL estable `insumos-three.vercel.app`).
