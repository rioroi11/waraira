# Módulo de Protección de Menores (Brazaletes, Identificación y Cadena de Custodia) — spec

> **Consolida** el brief de diseño Stage 0 sobre identificación, trazabilidad y protección de
> menores separados/no acompañados (UASC) tras los terremotos del 24–25 de junio de 2026.
> (Antes vivía suelto como `waraira.org/waraira-modulo-menores-plan1.md`; se movió aquí para
> reducir archivos y mantener el orden del repo raíz.)
> **Estado:** Stage 0 — diseño/construcción. **No operar en campo** hasta ratificación legal (§9).
> Lee primero `docs/WARAIRA.md` (plataforma) y la memoria del proyecto.
> Última actualización: 29 de junio de 2026.

---

## 0. Orientación para Claude Code (repo raíz, local-first)

Este módulo **se construye en el repo raíz** (`/Users/edma/Workspace/insumos`, desplegado en
`insumos-three.vercel.app`), **integrado al registro de niños existente** (`/ninos`), reusando lo ya
construido. (Fase 2, a evaluar luego: portar a `waraira.org` con Convex+BetterAuth/RBAC/`enc_*`.)

Reglas load-bearing que toca (ver `src/lib/model.ts` REGLAS):
- **R7** — identidad/imagen del menor **jamás pública** (LOPNNA art. 65). La foto (`fotoBlob`) nunca
  se sincroniza; el público solo ve agregados.
- **R3** — confirma el receptor (cadena de custodia): cada traspaso lo firma quien recibe.
- **R10** — auditabilidad: toda acción genera un evento append-only (`eventos`).
- **R9** — cero dinero: los brazaletes se consiguen como aporte en especie.
- **R11 / "deriva, no decide"** — Waraira notifica al Consejo de Protección; no dicta custodia.

**Dónde aterriza cada pieza en este repo:**
| Artefacto | Ubicación |
|---|---|
| Carátula (§10 convención de entrega) | `public/resumen-menores.html` |
| Modelo de datos (§6): cadena de custodia | `src/lib/model.ts` (`EventoCustodia`, gates) |
| Persistencia offline | `src/lib/db.ts` (colección `custodia`) + `src/lib/sync.ts` |
| Convergencia (apagada) | `convex/schema.ts` (tabla `custodia`) + `convex/custodia.ts` |
| UI integrada | `src/app/ninos/nuevo`, `src/app/ninos/[codigo]`, `src/app/brazaletes` |

---

## 1. Contexto y necesidad

En catástrofes, los niños separados de su familia son el grupo más vulnerable a la trata, la
explotación y la apropiación irregular. Precedente venezolano: tras el deslave de Vargas (1999),
por falta de registros y censos en plena emergencia, muchas familias nunca se reencontraron con sus
hijos. Tras los sismos de junio de 2026 hay menores en plazas, gimnasios y centros de acopio, muchos
con padres y familiares fallecidos, cuidados de hecho por voluntarios.

**Estándar internacional aplicable** (referencia, no marco vinculante en VE):
- Categoría técnica: **NNA no acompañados y separados (UASC)**. Nunca se declara "huérfano" en la
  emergencia: los padres reaparecen con frecuencia.
- Proceso: **IFTR** — Identificación, Búsqueda de Familia y Reunificación.
- Marcos: Principios Rectores Interinstitucionales sobre NNA No Acompañados y Separados (2004; CICR,
  UNICEF, ACNUR, Save the Children, IRC, World Vision); base **Primero** (UNICEF); **RFL** de la Cruz
  Roja; ADN como último recurso (p. ej. DNA-Prokids).

## 2. Línea roja legal (INVARIANTE)

Marco: **LOPNNA**.
1. La autoridad competente es el **Consejo de Protección de NNA** (municipal). Colocación familiar y
   adopción son exclusivas de los **Tribunales de Protección**.
2. **Ningún niño se entrega a terceros sin autorización judicial previa.**
3. **Sustraer/retener a un niño del poder de quien lo tiene por ley es delito** (Art. 272 LOPNNA).
4. **Notificar a la autoridad es obligatorio** (Art. 91).

**Posición de Waraira:** capa de **cuidado-documentado, trazabilidad y coordinación**. NO es autoridad
de custodia. El voluntario es **cuidador de hecho y responsable del registro del menor en el centro**
— no custodio legal; no decide el destino; no entrega a terceros. La **transparencia y auditabilidad
de la plataforma son la salvaguarda** contra el abuso que el módulo busca prevenir.

## 3. El brazalete — material, código, aprovisionamiento

- **Material:** vinilo / PVC, impermeable, resistente al desgarre, con **broche de un solo uso** (no
  transferible; se inutiliza al quitarlo). Tyvek para usos cortos; PVC/vinilo para días de trajín.
- **Impresión:** **solo UID + QR**. Cero PII visible. (En el repo: el QR codifica solo el `codigo`.)
- **Doble pieza / desprendible:** mitad gemela con el mismo serial — una en la muñeca del niño, otra
  archivada y **vinculada al voluntario registrador**. En el sistema, el evento `registro_inicial`
  vincula `codigo` ↔ registrador (gemelo digital de la pieza física).
- **Numeración:** única, no repetible; emisión por punto. (`generarCodigo()` → `WRA-XXXX`, alfabeto
  sin caracteres ambiguos.)
- **Proveedores VE (aporte en especie):** Prontomédica (Caracas, Boleíta Norte) y Brazaletes de
  Venezuela (Barquisimeto); Mercado Libre VE para cantidades chicas. Confirmar: numeración única,
  broche de un solo uso, doble pieza, formato apto para QR.

## 4. Organización — roles

| Rol | Quién | Responsabilidad | Límite |
|---|---|---|---|
| Voluntario registrador | Civil verificado; o Bomberos / Protección Civil / Consejos / Cruz Roja / ONG / hospital | Coloca brazalete, captura registro, cuida de hecho | No custodia legal; no decide destino |
| Testigo | Segundo adulto registrado | Co-firma el evento (regla de dos personas) | — |
| Coordinador / verificador | Waraira | Valida, deduplica, dispara notificación | — |
| Enlace con autoridad | Waraira | Notifica y sigue ante Consejo / MP / Cruz Roja | — |
| Punto de captación | Hospital, centro médico, refugio formal, punto móvil | Marcado y resguardo | Nunca domicilio privado |

**Vetting obligatorio** para todo voluntario que toque menores (reusa `Vetting`/`voluntarioApto`).
**Regla de dos personas** en cada marcado/traspaso: nadie maneja un menor en solitario.

## 5. Flujo operativo

**A — Preparación (Stage 0):** vetting de voluntarios; dispositivos offline-first; lotes de brazaletes
con rangos UID por punto; mapeo de nodos seguros y Consejos de Protección.

**B — Captación y marcado:** niño localizado → registrador + testigo → colocar brazalete (UID/QR) →
capturar registro mínimo (foto, rasgos, edad estimada, lugar/fecha/hora, hallador, salud, datos de
familia, geo) → desprendible al registro → asignar UID al registrador → firma de ambos.
⇒ **Registro 1 (custodia)** = primer `EventoCustodia` tipo `registro_inicial`.

**C — Resguardo y sync:** resguardo en nodo oficial/seguro (nunca domicilio privado) → sync a central
cuando hay red; sin red, offline-first.

**D — Notificación a la autoridad (PUENTE OBLIGATORIO):** paquete a Consejo de Protección + Ministerio
Público + Cruz Roja RFL; se registra el **acuse**. La decisión pasa a la autoridad; Waraira pasa a apoyo.

**E — Búsqueda y reunificación (IFTR):** búsqueda vía Cruz Roja RFL + cotejo por foto; verificación del
reclamante (cédula, foto con documento, vínculo, cotejo del desprendible); **la autoridad autoriza,
Waraira documenta** (reusa el módulo de Reunificación: `Reclamo` + `faltantesReclamo`).
⇒ **Registro 2 (caso) + resolución final.**

**F — Cierre del loop:** avisar el desenlace a quien reportó.

### 5.bis Inventario de brazaletes + alta con declaración (implementado)

El brazalete se **registra antes** de colocarse: en `/brazaletes/registro` se anota el código (escaneado
por QR o apuntado), **a quién se entregó** (nombre + cédula + teléfono + foto, confidencial) y **dónde**
(centro + ubicación). Queda como `disponible` (entidad `Brazalete`, estado disponible/asignado/anulado).

Al **censar al niño** (`/ninos/nuevo`, sección 4–5): casilla **"¿tiene brazalete?"** → se escanea/apunta
el código → el sistema lo busca en el inventario y muestra la **declaración** (*"entregado a X (cédula) en
tal ubicación; ¿declaras que con él marcas a este niño?"*). Al confirmar, **quien recibió el brazalete
queda como testigo**. Las **personas del acto** (registrador, testigo, custodio que sigue) se capturan con
`PersonaActo`: nombre + **cédula** + casillas **¿presente?/¿tiene app?**; si está **presente y sin app**,
declara por este teléfono y se le pide **foto**. A las personas con app se les genera una **Notificación**
(local + aviso del navegador; el push real entre teléfonos depende de encender Convex + Web Push, roadmap).
Al guardar: se crea el `Menor` (código = brazalete o autogenerado), el `EventoCustodia` `registro_inicial`
con las personas, se marca el brazalete `asignado`, y se emiten las notificaciones.

## 6. Modelo de datos (en este repo)

- **`EventoCustodia`** (`src/lib/model.ts`) — Registro 1: cadena **append-only** de quién/dónde/cuándo
  y quién entrega/recibe/atestigua. Nunca se reescribe. Tipos: `registro_inicial`, `traspaso`,
  `salida_con_adulto`, `resguardo`, `reemision_brazalete`. Encadena siempre contra el mismo `codigo`.
- **`Menor`** (existente) — Registro 2: expediente del menor y familia (capa restringida), estado IDTR
  y resolución. La foto es confidencial y nunca sincroniza.
- Reusados: `Cordon`/`PerimetroCFS` (nodos seguros), `Vetting`/`Aval` (vetting + regla de dos),
  `Reclamo`/`faltantesReclamo` (verificación de reclamante), `notificadoConsejo`/`acuseAutoridad`
  (notificación), `eventos` (bitácora append-only R10).

**Reglas de datos:** el brazalete porta solo el código/QR; el expediente guarda la PII (restringida,
nunca pública). Fotos nunca viajan ni se publican. Cada paso de custodia emite su `Evento`.

## 7. Salvaguardas y casos borde

Niño marcado dos veces (dedupe por foto+geo+ventana; fusión conservando eventos) · brazalete
perdido/roto (`reemision_brazalete`: UID nuevo vinculado al viejo con `codigoAnterior`, sin reescribir
historial) · adulto que se lleva al niño antes del ruteo (`salida_con_adulto`: registrar igual — foto
del adulto con cédula, teléfono, destino; notificar) · voluntario malicioso (regla de dos personas +
vetting + log inmutable) · sin conectividad (offline-first) · bebé/no verbal (foto + rasgos; ADN como
último recurso vía autoridad) · reclamante sin autorización (no entregar; rutear a autoridad).

## 8. La transparencia como salvaguarda

Todo acto queda en plataforma con **testigo y registro inmutable**: regla de dos personas, cadena de
custodia append-only, log de auditoría y voluntarios verificados. La auditabilidad radical es lo que
impide que el sistema se use para lo contrario de su fin.

## 9. Pendientes (Stage 0) y próximos pasos

**Bloqueante antes de operar en campo:**
1. **Asesoría legal LOPNNA** que revise y ratifique el flujo — primer bloqueante, no opcional. Hasta
   entonces, esto es construcción/diseño, no luz verde para operar.

**Operativo:** mapear Consejos de Protección municipales + contacto Cruz Roja (RFL) + Cecodap; definir
el vetting y la credencial para registrar menores; aprovisionar brazaletes (§3) con las especificaciones.

**Construcción (este repo):**
- Carátula `public/resumen-menores.html`.
- Cadena de custodia del menor (`EventoCustodia` + UI en `/ninos`).
- Brazalete con QR + doble pieza (`/brazaletes`).
- Opcional — rol "registrador" con vetting + acuse de notificación a la autoridad.
- Piloto en un único punto de captación antes de escalar.

## 10. Referencias

- **Marco legal VE:** LOPNNA — Consejos de Protección (Art. 129, 160), Tribunales (colocación/adopción),
  Art. 272 (sustracción), Art. 91 (notificación), Art. 65 (imagen/identidad nunca pública). IDENNA
  (ente rector). Defensa Pública y Ministerio Público.
- **Estándar internacional:** Principios Rectores Interinstitucionales sobre NNA No Acompañados y
  Separados; UNICEF (Primero); CICR / Cruz Roja (RFL); ACNUR; Save the Children; CPMS 2019; UNHCR BIP.
- **Actores VE de protección infantil:** Consejos de Protección municipales, IDENNA, Cruz Roja
  Venezolana, Cecodap.
