# Waraira — Documento canónico del proyecto

> Fuente única de verdad sobre **qué es Waraira, qué hace, qué se construyó y qué falta**.
> Léelo al inicio de cualquier sesión nueva (junto con la memoria del proyecto).
> Última actualización: 28 de junio de 2026.

## 1. Qué es

**Waraira** es una plataforma civil de coordinación, **offline-first** (funciona sin señal,
en el teléfono), para responder a la **emergencia nacional de Venezuela del 24 de junio de
2026** (terremotos gemelos M7,2 + M7,5 del 24–25 jun). La afectación es de **varias zonas del
centro y norte centro-occidental**; **La Guaira concentra ~90%**, pero el alcance es **país,
no solo La Guaira**.

Foco principal: **niños separados y no acompañados (UASC)**. También: cordones de cuido,
voluntariado, reunificación familiar e insumos. Postura: **"Unir, no dividir."**
(Nota: se eliminó el lema "a la orden del Estado" a pedido de la dueña — el encuadre es
**invitación entre pares**, no sumisión.)

## 2. El problema que resuelve (situación real)

- Hay **niños acordonados en plazas y gimnasios** sin un sistema que los ordene.
- **Están robando niños; hay abuso sexual; personas farsantes se hacen pasar por padres** y
  los reclaman; **niños desaparecen**, se los llevan.
- **No hay censo**: no se sabe cuántos son, dónde están, ni quién los cuida.
- **Desinformación por estados de WhatsApp**: la ayuda (carpas, insumos) circula sin
  verificar — no se sabe si la oferta es real, si ya se entregó, de qué estado es, ni cómo
  contactar a quien la tiene. (Ver caso de las 70 carpas en el briefing de contenido.)

Waraira pone **orden, traza y seguridad**, y **unifica** oferta/necesidad real y verificada.

## 3. Qué hace (módulos construidos)

- **Censo de niños (IDTR)** — registro con foto **confidencial**, señas, ropa, lugar/hora;
  genera un **código de brazalete** (`WRA-XXXX`). Ciclo IDTR: Identificación → Documentación →
  Búsqueda → Verificación → Derivación → Reunificación → Seguimiento.
- **Brazalete** — la manilla lleva **solo el código** (nunca nombre/foto). Un código = un niño.
  Hoja imprimible en `/brazaletes`.
- **Cordones de cuido (Espacios Seguros / CFS)** — checklist de perímetro, capacidad ≤125,
  ratios por edad, **mínimo 2 adultos**, check-in/out de turnos.
- **Voluntariado + validación comunitaria** — registro con cédula/teléfono/zona/GPS; vetting,
  Código de Conducta, capacitación. **Los vecinos de su zona lo avalan** ("¿lo conoces? ¿es de
  aquí?") con alarma/notificación; ≥2 avales → validado. Anti-suplantación (un vecino no avala
  dos veces).
- **Reunificación familiar** — **imposible cerrar con un clic**: exige ≥2 puntos de
  coincidencia + entrevista al niño + autorización de la autoridad + firmas. Alerta anti-trata
  si un reclamante aparece en varios niños.
- **Insumos** — balance "dónde falta vs. dónde hay", por necesidad, **sin dinero**.
- **Tablero por zona + cobertura** — conteos agregados (nunca PII), déficit de voluntarios
  (cálculo conmensurable por ratios).
- **Documentación in-app**: resumen ejecutivo (`/resumen.html`), 8 flujos diagramados
  (`/modulos/flujos/`), plan de voluntariado (`/modulos/voluntariado.html`), plan maestro
  (`/waraira-plan.html`).

## 4. Principios / reglas invariantes

R1 muerte solo por autoridad · R2 agrupar no bloquear · R3 confirma el receptor · R4 cerrar
libera · R5 procedencia visible · R7 protección de menores (identidad **jamás pública**,
LOPNNA art. 65) · R8 neutralidad (sin política) · R9 cero dinero · R10 auditabilidad (todo
genera evento) · R11 complemento de 911. **Privacidad por diseño**; **Waraira deriva** al
Consejo de Protección / Tribunal, **no dicta custodia**.

## 5. Arquitectura

- **Next.js 16 (App Router) + React 19 + Tailwind v4**. PWA instalable.
- **Local-first**: IndexedDB es la fuente de verdad en campo (`src/lib/db.ts`). Cada registro
  con `syncStatus`.
- **Convergencia (opcional)**: Convex (`convex/*.ts`) — `src/lib/sync.ts` empuja lo pendiente
  por `upsert` idempotente cuando hay red + `NEXT_PUBLIC_CONVEX_URL`. **Aún NO encendido.**
- **Geografía nacional REAL** (`src/lib/geografia.ts` + `geografia-ve.ts`): **Estado → Municipio →
  Parroquia → Punto** (división político-territorial oficial: 24 estados, 335 municipios, 1.139
  parroquias; "Vargas" renombrado a "La Guaira"). El estado se nombra internamente **`entidad`**
  (para no chocar con el campo `estado` = estatus de varios registros); en la UI se rotula
  **"Estado"**. Componente reutilizable `<SelectorUbicacion>` (3 selectores en cascada) en todos
  los módulos. Ya NO se usa "zona afectada" (la ayuda/acopio ocurre en todo el país).
- **Perfil local** (`src/lib/perfil.ts`): identifica al usuario como vecino localizable.
- **Modelo de dominio**: `src/lib/model.ts` (tipos, máquinas de estado, ratios, reglas).

## 6. Estado del despliegue

- **En línea (Vercel, org `enves`)**: URL estable **https://insumos-three.vercel.app**
  (resumen ejecutivo: `https://insumos-three.vercel.app/resumen.html`).
- Desplegada **SIN Convex** → cada dispositivo ve sus propios datos (modo local). Sirve para
  mostrar la interfaz y los flujos.
- Repo: `/Users/edma/Workspace/insumos`. Build: `npm run build`. Dev: `npm run dev`.

## 7. Marco legal y estándares (respaldo)

- **Internacional**: ICRC Inter-agency Guiding Principles on UASC (2004); CPMS 2019 (Normas
  13/15/17); UNHCR Best Interests Procedure (2021/24); IFRC CFS Operational Guidance.
- **Venezuela**: LOPNNA arts. 65 (imagen/identidad nunca pública), 91 (deber de notificar al
  Consejo de Protección), 127 (abrigo), 128/177 (colocación = Tribunal), 272 (sustracción);
  LOCDOFT (trata); Constitución arts. 28, 54, 60.
- **Pendiente de verificación legal formal**: 3 cifras penales y el texto literal del art. 127
  (marcados "verificar en Gaceta Oficial"); validar con abogado venezolano de LOPNNA.

## 8. Pendientes / roadmap (requisitos que surgieron)

1. **Encender Convex** → censo compartido y **alarma de validación comunitaria entre
   teléfonos** en tiempo real. (Falta `npx convex dev` con login + setear
   `NEXT_PUBLIC_CONVEX_URL` + redeploy.)
2. **Push notifications (Web Push / VAPID)** para alarma con la app cerrada.
3. **Verificación de cédula real** (requiere acceso/enlace a base de datos oficial del Estado):
   que al registrarse una persona con su cédula, Waraira **corrobore que la cédula existe**.
4. **Deduplicación de fotos de niños**: al subir una foto, el sistema revisa si **ya existe en
   el sistema** (si alguien más la subió) → evita doble registro y ayuda a identificar.
5. **Umbral de avales**: hoy en 2 (`AVALES_REQUERIDOS` en `model.ts`); la dueña podría querer 1.
6. Enlace/intercambio de datos con **autoridades y otras plataformas** (interoperar, no duplicar).

## 10. Convención de entrega — OBLIGATORIA para cada módulo

Pedido fijo de la dueña: **todo módulo que se desarrolle debe seguir esta misma lógica** (la
que aplicamos con el módulo de niños):

1. **Carátula del módulo** — un HTML de resumen ejecutivo con **mapa conceptual / diagrama**,
   mismo estilo visual verde Waraira (como `public/resumen.html`). Debe explicar: qué es el
   módulo, qué hace, **las fallas reales que evita**, el flujo (diagrama), y un CTA. Se guarda
   en `public/` (sugerido `public/resumen-<modulo>.html`, p.ej. `public/resumen-insumos.html`)
   para que se sirva en línea.
2. **Desarrollar el módulo** — la funcionalidad real (offline-first + convergencia, reglas R*,
   privacidad, etc.), integrada a la app.
3. **Entregar SIEMPRE los DOS links** al terminar:
   - **Link de la carátula** (p.ej. `https://insumos-three.vercel.app/resumen-<modulo>.html`)
   - **Link del módulo en la app** (p.ej. `https://insumos-three.vercel.app/<ruta-del-modulo>`)
   Ambos sobre el despliegue en producción (`vercel --prod --yes`).

> Regla corta: **carátula + módulo + ambos links, siempre.**

## 9. Decisiones de la dueña (Edma)

- Alcance **nacional** (no solo La Guaira).
- **Offline-first** obligatorio; privacidad estricta del menor.
- Brazalete con **solo código**.
- Validación comunitaria por **aval de vecinos** (≥2) con identidad y teléfono.
- **Sin** lema "a la orden del Estado".
- **Separa sesiones**: esta sesión = desarrollo; otra sesión = creación de contenido.
