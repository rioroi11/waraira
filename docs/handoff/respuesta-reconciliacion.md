# Respuesta de Edma a la reconciliación (§B de `edma-reconciliation.md`)

> Responde a las 10 decisiones de dueño (§B) que Rafa dejó en
> `waraira.org/docs/architecture/edma-reconciliation.md` (audit de 4 agentes, 1-jul-2026). B1, B5 y
> B6 ya los había decidido Rafa mismo (persona atrapada, umbral de corroboración a 2, subcategorías
> de Peligro). Esta respuesta cubre las 7 restantes: B2, B3, B4, B7, B8, B9, B10.

---

## B2: aval de cuidador, antecedentes Y/O aval comunitario

**Decisión: cambiar a OR** (`screening && codeOfConduct && training && (background || avalesCount>=2)`),
tal como recomendaba la reconciliación.

**Contexto para Rafa, para que quede claro por qué:** exigir antecedentes penales Y aval al mismo
tiempo depende de que el Estado dé acceso a esa data, y eso no es rápido ni garantizado. Estamos en
**contingencia**: no se puede dejar a un cuidador de niños sin acreditar mientras se espera un
trámite estatal que puede tardar semanas o nunca llegar. El aval comunitario (2+ personas distintas
dando fe) tiene que poder sustituir al antecedente cuando el Estado no lo entrega a tiempo, no
sumarse como requisito adicional.

---

## B3: sectores curados + sugeribles, renombrar "punto" a "sector"

**Aprobado tal cual**, sin cambios a la propuesta de Rafa: una lista curada de sectores/barrios por
parroquia que alimenta el selector, con la opción de que el usuario escriba uno que no esté en la
lista (queda como "sugerido" hasta que un curador de staff lo promueva a curado). El texto libre
siempre queda disponible como respaldo, para no bloquear un reporte solo porque el sector no está
todavía en el dataset. Renombrar el campo "punto" a "sector" en toda la plataforma.

---

## B4: tipo de reporte "Refugio" → "Albergue"

**Decisión: renombrar a "Albergue"**, con un alcance específico y explícito:

- **"Albergue"** = únicamente sitios de alojamiento (donde la gente se queda/duerme varios días).
- **"Atención médica"** sigue siendo su propio tipo de reporte, separado, para espacios acondicionados
  de atención médica (un puesto de salud improvisado, por ejemplo).

Los dos **no se mezclan**. Recomendación de implementación: agregar una aclaración breve en el copy
o la ayuda contextual del selector de tipo de reporte, para que a la persona que está reportando le
quede claro cuál de los dos aplica a lo que está viendo (un albergue no es un puesto médico, y
viceversa).

---

## B7: granularidad de insumos de refugio

**Decisión: usar la granularidad original**, separar "Materiales de refugio" en categorías distintas
(carpas, colchonetas, cobijas), en vez de un solo bulto genérico. Está probada en campo: alguien que
tiene una carpa no es lo mismo que alguien que tiene una cobija, y esa diferencia importa para quien
coordina la entrega.

**Además, decisión general que aplica más allá de este caso:** el patrón "especifica qué y cuánto"
que ya se construyó para la categoría "Otro" debe generalizarse a **cualquier categoría genérica**,
no quedarse solo en "Otro". Cuando algo no sea específico, debe desplegar un renglón que pida
especificar de qué se trata y cuánto.

---

## B8: asignación formal en despacho

**Decisión: diferir para después del lanzamiento**, confirmado. La cola de despacho sigue ordenando
y mostrando prioridades; quién atiende cada caso se sigue coordinando por fuera del sistema (radio,
WhatsApp, de palabra), como ya se hace hoy en cualquier emergencia real. Se prioriza lanzar rápido
sobre construir esa pieza antes.

---

## B9: capacidad hospitalaria

**Decisión: 4 datos, resumidos y puntuales, ni matriz completa por especialidad ni un solo estado
genérico:**

1. **Estado general** (Recibe / Saturado / Desvía / Recuperando): ya existe, se mantiene.
2. **Cuidados Intensivos (UCI):** disponible / sin disponibilidad.
3. **Quirófano / Cirugías:** disponible / sin disponibilidad.
4. **Urgencias** (la puerta de entrada real en un sismo): disponible / saturada / en desvío.

**Investigación que respalda esto:** los sistemas reales de manejo de víctimas masivas (HAvBED en
EE.UU., guías de ASPR TRACIE y la OMS) no usan una matriz completa por especialidad en el momento
agudo de la contingencia, porque nadie tiene tiempo de mantenerla actualizada mientras entran
heridos. Rastrean pocas categorías críticas y consistentes: estado general de Urgencias, UCI, y
Cirugía. Coincide con el diseño original de Edma (los estados Recibe/Saturado/Desvía/Recuperado).
Fuentes: [ASPR TRACIE: Hospital Surge Capacity](https://asprtracie.hhs.gov/technical-resources/58/hospital-surge-capacity-and-immediate-bed-availability/0),
[OMS: Mass Casualty Management](https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/mass-casualty-management).

---

## B10: traslados, vínculo familiar en evacuaciones

**Decisión: solo el vínculo familiar en evacuaciones para el lanzamiento** (el lado de "Solicitado",
pedir traslado antes de tener transportista, queda fuera por ahora, no es tan urgente).

**Qué es exactamente:** cuando se evacúa a una familia, el sistema deja registrado que esas personas
viajan juntas (padre, madre, hijos, etc.). Si se dispersan en el caos de una evacuación, queda
constancia de que se suponía que estaban juntos, en vez de aparecer como personas sueltas sin ninguna
conexión entre sí.

**Requisito de UI, no negociable:** cuando se construya, tiene que llevar una explicación clara
(popup o similar) de qué es y para qué sirve, en lenguaje venezolano sencillo. El término "vínculo
familiar en evacuaciones" no es intuitivo a la primera y no debe presentarse sin contexto, siguiendo
la misma regla de transparencia que ya aplica al resto de la plataforma (nunca pedir un dato sin
decir para qué).

---

## Resumen para Rafa

| # | Decisión | Estado |
|---|---|---|
| B1 | Persona atrapada, prioridad máxima | Ya decidido por Rafa |
| B2 | Antecedentes O aval (no Y) | **Decidido: OR**, ver contexto de contingencia arriba |
| B3 | Sectores curados + sugeribles, punto→sector | **Aprobado tal cual** |
| B4 | Refugio → Albergue | **Decidido: renombrar**, alcance solo alojamiento, no se mezcla con Atención médica |
| B5 | Umbral de corroboración a 2 | Ya decidido por Rafa |
| B6 | Subcategorías de Peligro | Ya decidido por Rafa |
| B7 | Granularidad de insumos de refugio | **Decidido: usar la original** (carpas/colchonetas/cobijas) + generalizar el patrón "especifica" |
| B8 | Asignación formal en despacho | **Decidido: diferir** |
| B9 | Capacidad hospitalaria | **Decidido: 4 datos** (general + UCI + Cirugía + Urgencias), investigado y con fuentes |
| B10 | Traslados, vínculo familiar | **Decidido: solo el vínculo familiar**, con requisito de explicación clara en UI |
