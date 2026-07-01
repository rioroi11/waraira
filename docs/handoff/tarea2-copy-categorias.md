# Tarea 2: Copy público + categorías

> Entrega de Edma para Rafa, según `waraira.org/docs/collaboration/edma-tareas-lanzamiento-ES.md`
> (commit `7327c08`). Investigación hecha el 1 de julio de 2026, sobre `dev.waraira.org` en vivo y
> el código fuente real (`waraira.org/src`, `waraira.org/convex`) para las categorías, que se
> hidratan por cliente y no se pueden leer solo con el HTML estático.

---

## 🚨 Hallazgo cruzado más importante: "Refugio" significa dos cosas distintas

Dos bloques de investigación independientes (categorías de reporte y categorías de insumo)
llegaron al mismo problema por caminos separados, lo que confirma que es real y no un espejismo:

- **"Refugio" como tipo de reporte** marca un sitio físico/albergue.
- **"Refugio" como categoría de insumo** (dentro de Necesidad/Recurso disponible) se refiere a
  materiales de resguardo (carpas, colchonetas, plástico).

Ambos aparecen con el mismo badge de texto. Bajo estrés, alguien que necesita una carpa puede
terminar reportando tipo "Refugio" (como si estuviera señalando un albergue) en vez de "Necesidad →
Refugio". **Propuesta:** renombrar la categoría de insumo a algo como "Materiales de refugio" o
"Carpas y colchones", y considerar renombrar el tipo de reporte a "Albergue" (así lo llama
Protección Civil y la prensa venezolana, "refugio" suena más a resguardarse un rato de la lluvia).

---

## Bloque A: copy de páginas públicas (inicio, cómo-funciona, privacidad, términos)

### Resumen ejecutivo del bloque

El sitio cumple bien lo no negociable: cero comparaciones ególatras, "complementamos, no
reemplazamos" repetido y correcto en las 4 páginas, dignidad real ante niñez y fallecimientos, cero
guiones largos. El problema no es de guardrails sino de **registro**: jerga de producto/tech
repetida ("baja barrera" ×3, "oferta" ×2, "por diseño", "capa civil") y despersonalización ("el
servicio" en vez de "Waraira/nosotros", 6+ veces). El hallazgo más fuerte: en Términos, **"El
servicio se ofrece tal como está"** es un calco literal del boilerplate SaaS en inglés ("the service
is provided as is"), pegado justo al lado de "esfuerzo humanitario hecho de buena fe": el choque de
tono más grande de todo el sitio. También hay una **inconsistencia real entre páginas legales**:
Privacidad define Waraira como "una capa civil de coordinación" y Términos como "una herramienta
civil y gratuita": dos definiciones distintas del mismo producto en el mismo sitio. Recomiendo
unificar en **"herramienta"** (la de Términos), es más concreta y fácil de repetir de boca en boca.

### Inicio (`/es`)

| Original | Propuesta | Por qué |
|---|---|---|
| "Coordinación de ayuda en Venezuela" | Sin cambios | Corto, claro, sin ego |
| "Para que la ayuda y quien la necesita se encuentren a tiempo..." | Sin cambios | Suena a cómo alguien explicaría el proyecto, no a comunicado |
| "Reportar es sencillo y de baja barrera..." | "Reportar es fácil, no hace falta nada complicado. Cada paso queda registrado con cuidado, para que la gente confíe." | "de baja barrera" es jerga de producto (calco de "low barrier to entry"), aparece 3 veces en el sitio |
| "Necesidades sin una oferta cercana." | "Necesidades que todavía no tienen ayuda cerca." | "oferta" es lenguaje de mercado, frío para ayuda humanitaria |
| "Una persona, una necesidad, un recurso, un riesgo." | "Cuenta qué pasó, quién necesita algo y qué hace falta." | 4 sustantivos en paralelo suena a eslogan, no explica qué hace el botón |
| "Pedimos solo un teléfono, para que cada reporte sea atribuible sin trámites." | "Pedimos solo tu teléfono, para saber que hay una persona real detrás de cada reporte, sin papeleo." | "atribuible" es registro legal/auditoría |
| "Avisos verificados del equipo." | Sin cambios | "del equipo" humaniza, cumple guardrail |
| "Cada paso se registra con nombre y hora. La confianza nace de la corroboración, no de muros." | Sin cambios | La frase más fuerte de la página |
| "Acompañamos, no reemplazamos" / "Complementamos a los servicios de emergencia..." | Sin cambios | Cumple el guardrail obligatorio exactamente |
| "Estamos construyéndola · Pronto." | Sin cambios | Humildad correcta |

### Cómo funciona (`/es/como-funciona`)

| Original | Propuesta | Por qué |
|---|---|---|
| "...durante la respuesta a los terremotos de junio de 2026 en Venezuela." (pegado al final del párrafo) | Separar en oración propia: "Nació para la respuesta a los terremotos de junio de 2026 en Venezuela." | Se lee como coletilla de comunicado de prensa |
| "Trabaja sobre las plataformas de ayuda que ya existen y junto a ellas... el servicio suma la coordinación" | "Waraira no reemplaza lo que ya existe: trabaja junto a plataformas como Hazlo Hoy... Lo que sumamos es la coordinación..." | "el servicio" en 3ª persona; además la frase es redundante |
| "Si hay vidas en peligro... Los complementamos, no los reemplazamos." | Sin cambios | Ejemplo perfecto del guardrail |
| "Protección Civil: 0800-558.84.27" | No tocar (fuera de esta tarea) | Tarea 1 ya marcó este número como posiblemente desactualizado; no corregir aquí |
| "Estas son líneas oficiales y pueden cambiar. Si tienes dudas, marca 911." | Sin cambios | Admite incertidumbre, da salida simple |
| "Reportar toma un momento y no necesitas crear una cuenta larga." | "Reportar toma un momento; no tienes que llenar mil datos ni crear una cuenta complicada." | "cuenta larga" es calco de "lengthy account" |
| Pasos 1-3 ("Abre Reportar", "Marca el lugar", "Confirma tu teléfono") | Sin cambios | El mejor tramo de copy del sitio: verbos directos, explica el porqué |
| "Cada reporte tiene un estado y un desenlace..." | "Cada reporte muestra en qué va y, cuando se resuelve, qué pasó." | "desenlace" es palabra literaria/narrativa; puede referirse a un fallecimiento, mejor sobrio |
| "No tomamos partido político. El servicio es para todas las personas." | "No tomamos partido político. Esto es para todo el mundo, sin importar de qué lado estés." | "el servicio" en 3ª persona |
| "Las personas voluntarias y las organizaciones pueden hacer más una vez verificadas." | "Los voluntarios y las organizaciones pueden hacer más una vez que los verificamos." | Pasivo institucional |

### Privacidad (`/es/privacidad`)

| Original | Propuesta | Por qué |
|---|---|---|
| "No recogemos datos por recogerlos." | Sin cambios | Frase perfecta: coloquial, responde a la desconfianza de entrada |
| "Waraira es una capa civil de coordinación..." | "Waraira es una herramienta civil de coordinación..." | "capa" es metáfora de arquitectura de software; inconsistente con Términos ("herramienta") |
| "...así que el teléfono basta para mantener el reporte con barrera baja." | "...así que con el teléfono es suficiente, sin pedirte más papeles." | Mismo problema de "barrera baja" |
| "No consultamos ni cruzamos ninguna base de datos del Estado: nunca accedemos a CNE ni a SAIME." | Sin cambios | La mejor frase de la página: nombra el miedo exacto de la gente |
| "...es decir el lugar del que trata (un punto en el mapa...)" | "Dónde pasa lo que reportas: un punto en el mapa, y el estado, municipio o parroquia." | "es decir... del que trata" es aclaración de traductor |
| "...la necesidad o la oferta de ayuda..." | "...qué necesitas o qué puedes ofrecer..." | "oferta" otra vez como sustantivo de mercado |
| "Los reportes son públicos por diseño..." | "Los reportes son públicos a propósito..." | "por diseño" es calco de "by design" |
| "Nunca vendemos ni alquilamos tus datos." | Sin cambios | Promesa concreta, tono correcto |
| "...registro permanente e inalterable... Esa visibilidad es la salvaguarda..." | "...registro permanente que nadie puede borrar ni cambiar... Que todo se pueda ver es lo que protege..." | "inalterable"/"salvaguarda" son de documento legal |
| "El acceso está limitado por rol y con mínima divulgación..." | "Solo puede verlos quien tiene autorización; si no la tienes, ni te enteras de que existe." | "por rol"/"mínima divulgación" son jerga de seguridad informática |
| "Para que el servicio siga disponible... Los datos sensibles se guardan cifrados." (frase duplicada del párrafo anterior) | "Para que Waraira siga funcionando durante apagones o bloqueos, guardamos los datos en servidores fuera de Venezuela." | "el servicio" + oración repetida palabra por palabra (descuido de edición) |
| "Reducimos al mínimo los datos... cuando corresponde..." | "Guardamos lo mínimo posible, y cuando hace falta, ocultamos los datos personales..." | "cuando corresponde" es relleno burocrático |
| "Puedes dejar de usar el servicio cuando quieras." | "Puedes dejar de usar Waraira cuando quieras." | Consistencia: nombrar a Waraira, no "el servicio" |

### Términos (`/es/terminos`)

| Original | Propuesta | Por qué |
|---|---|---|
| "Waraira es una herramienta civil y gratuita para coordinar la ayuda." | Sin cambios (usar esta como definición oficial en todo el sitio) | Más clara que "capa" de Privacidad |
| "Complementa a los servicios de emergencia... no los reemplaza." | Sin cambios | Cumple el guardrail con total claridad |
| "No confirmamos fallecimientos. Solo las autoridades..." | Sin cambios | Tono sobrio y digno exacto |
| "No nos hacemos responsables por decisiones tomadas a partir de información de la comunidad." | "No respondemos por lo que decidas hacer con información que puso la comunidad." | El texto promete "lenguaje sencillo" y esta cláusula pasiva lo rompe |
| "No hagas extracción masiva ni abuses del servicio." | "No hagas extracción masiva de datos (por ejemplo, con programas automáticos) ni abuses de Waraira." | "extracción masiva" sin explicación es incomprensible para la mayoría |
| "Ponemos orden, trazabilidad y un resguardo sobre la capa civil..." | "Ponemos orden y dejamos todo trazado, y resguardamos lo que podemos desde este lado civil. Los casos se los pasamos a las autoridades..." | La frase más institucional del sitio |
| "También puedes reportar por medio de un allegado, con su consentimiento." | "También puedes reportar por medio de alguien de confianza, si esa persona está de acuerdo." | "allegado"/"consentimiento" son registro formal/legal |
| **"El servicio se ofrece tal como está, como un esfuerzo humanitario hecho de buena fe, sin garantías."** | "Waraira es un esfuerzo humanitario hecho de buena fe. Lo ofrecemos como está, sin poder garantizar que todo funcione siempre perfecto." | **El choque de tono más fuerte del sitio**: boilerplate SaaS en inglés pegado a "esfuerzo humanitario" |
| "Nuestra responsabilidad se limita a lo que permita la ley." | Sin cambios | Cláusula legal necesaria; en esta sección el registro formal es esperable |

---

## Bloque B: categorías de reporte (`/es/reportar`)

**Fuente real:** `waraira.org/src/lib/reports.ts`, `report-form.tsx`, `convex/schema.ts` (el HTML
estático no trae el formulario, se hidrata por cliente).

**Tipos encontrados** (agrupados): Personas → *Persona desaparecida*, *Persona encontrada*.
Suministros → *Necesidad*, *Recurso disponible*. Situación → *Peligro*, *Refugio*, *Atención médica*.

- *Persona desaparecida / encontrada*: bien, nombres naturales.
- *Necesidad / Recurso disponible*: funcionan para el matching interno, pero suenan a lenguaje de
  logística humanitaria más que a habla real ("piden ayuda" / "tengo para dar" sería más natural,
  sugerencia no bloqueante).
- *Peligro*: bien nombrado, pero es un balde único sin subcategoría: ver hueco crítico abajo.
- *Refugio*: ver el hallazgo cruzado al inicio de este documento.
- *Atención médica*: se solapa en la práctica con "Necesidad → Medicinas" (ver redundancia abajo).

**Redundancia real, no cosmética:** "Atención médica" vs. "Necesidad → Medicinas" son dos caminos
para el mismo problema con implicaciones de triage distintas (una convulsión que necesita
medicamento YA podría reportarse por cualquiera de los dos, y el sistema los trata operativamente
distinto). Propuesta: subtexto bajo "Atención médica" aclarando "para emergencias que requieren
atención inmediata (herido, convulsión, parto)", diferenciándolo de un pedido de insumo.

**Categoría crítica que falta: "Persona atrapada" / rescate urgente.** Hoy no existe. Alguien
atrapado vivo bajo escombros cae mal en "Persona desaparecida" (implica paradero desconocido,
búsqueda de horas/días) o en "Peligro" (riesgo genérico sin víctima identificada). Operativamente
son cosas muy distintas: "atrapado, se escuchan golpes" exige despacho inmediato de rescate, no
búsqueda ni matching de insumos. Debería ser su propio tipo o al menos una bandera de prioridad
máxima dentro de "Peligro".

**Subcategorías que faltan dentro de "Peligro"** (no necesariamente tipos nuevos):
- *Vías bloqueadas / acceso cortado*: crítico en La Guaira (terreno empinado, derrumbes), sin forma
  de que logística filtre específicamente "rutas cerradas" para planificar entrada de camiones.
- *Corte de servicios por zona* (luz/agua/gas): distinto de "necesito agua para beber ya": es un
  reporte de infraestructura de zona, útil para autoridades/voluntariado.

*(Nota: alertas sísmicas ya viven correctamente en el módulo de Alertas oficial, no como tipo de
reporte de usuario: bien diseñado así. Saqueos/inseguridad se dejan fuera de la recomendación firme
por la bandera de neutralidad R8; si se agrega, necesita copy muy cuidadoso.)*

---

## Bloque C: categorías de insumos (`/es/necesidades`)

**Fuente real:** `waraira.org/src/lib/reports.ts` (`SUPPLY_CATEGORIES`).

**Categorías encontradas:** Agua, Comida, Medicinas, Refugio, Ropa, Higiene, Combustible,
Herramientas, Otro. Para "Ropa" hay 3 subcampos de **texto libre**: Edad, Talla, Género.

- *Agua, Comida, Herramientas*: bien nombradas, sin cambios.
- *Otro*: nombre correcto como catch-all, pero **decisión de producto de Edma (1-jul-2026):** al
  elegir "Otro" debe desplegarse un campo de texto obligatorio (un renglón que aparece justo debajo
  del selector, no un campo opcional escondido) para que la persona escriba de qué se trata
  exactamente. Hoy ese detalle puede quedar implícito en el campo general de "Detalles" del
  formulario, pero eso es opcional y no está atado a la elección de "Otro": la idea es que
  seleccionar "Otro" *fuerce* la aclaración en el momento, para que ese cajón no se llene de
  reportes sin forma de saber qué piden o qué ofrecen de verdad.
- *Medicinas*: nombre correcto, pero sin subcampos (a diferencia de Ropa) no distingue tratamiento
  crónico (insulina, requiere frío) de agudo/primeros auxilios. Propuesta: mismo patrón de subcampo
  libre que ya existe para Ropa.
- *Refugio*: ver hallazgo cruzado al inicio del documento.
- *Ropa*: nombre bien puesto, pero Edad/Talla/Género en **texto libre** garantiza inconsistencia
  total bajo volumen alto de reportes (justo cuando más se necesita emparejar rápido). Propuesta:
  convertir Edad en select de rangos (bebé 0-12m, 1-3, 4-6, 7-12, adolescente, adulto, adulto mayor)
  y Talla en select condicional a ese rango.
- *Higiene*: correcto pero tan genérico que la gente olvida que ahí caben pañales y toallas
  sanitarias (lo que más se agota primero, y con más pena para pedir en voz alta). Propuesta:
  placeholder explícito mencionando pañales/toallas sanitarias.
- *Combustible*: el nombre suena solo a gasolina/diesel, pero **gas doméstico (bombona)** y
  **energía** (plantas, baterías, power banks) son de las necesidades más urgentes post-sismo y no
  calzan mentalmente ahí: la gente termina reportándolos como "Otro" y se pierde la trazabilidad.
  Propuesta: renombrar/expandir a **"Gas y energía"**.

**Categoría completa que falta: insumos para mascotas.** No existe ningún gancho en
`SUPPLY_CATEGORIES` para mascotas, aunque el proyecto ya tiene un módulo Mascotas aparte
(`docs/MODULO-MASCOTAS.md`) pensado para reusar este mismo motor. Hoy, tal como está el código real,
el buscador de "Dónde falta" no cubre mascotas en absoluto: se reportaría como "Otro" y se pierde.

**Decisión de producto de Edma (1-jul-2026):** los insumos de mascotas no deben quedar como una
categoría suelta dentro del feed general, sino tener **su propia sección/feed**, igual que el resto
de insumos en `/es/necesidades` hoy: con las mismas tres pestañas de estado, **"Verificados / Sin
verificar / Cubiertos"**. Es decir, replicar la misma estructura de vista (filtro por estado del
reporte) que ya existe para insumos generales, aplicada a las categorías veterinarias del módulo
Mascotas (medicinas_vet, alimento_mascota, etc., ya listadas en `docs/MODULO-MASCOTAS.md`), no
inventar un patrón de UI nuevo para esto.

**Pañales y fórmula infantil:** dispersos hoy entre "Higiene" y "Comida" sin subcampo, mismo
problema que Medicinas: propuesta: aplicar el patrón de subcampos de Ropa (edad/talla) también
cuando la categoría es Higiene y el ítem es pañal.

---

## Bloque D: flujos bajo estrés (reportar, insumos, buscar personas)

**Limitación metodológica:** esto se evaluó leyendo el HTML/estructura visible de cada página; no
se pudo hacer clic, llenar formularios en cascada, ni ver qué pasa tras enviar. Lo marcado abajo
como "no probado en vivo" necesita que alguien lo confirme con una sesión de navegador real.

### Reportar (`/es/reportar`)

- **Cascada Estado→Municipio→Parroquia obligatoria y encadenada**, cada dropdown bloqueado hasta
  elegir el anterior. Con red móvil inestable, si la conexión se corta entre el segundo y tercer
  dropdown, la persona queda con el formulario a medias sin poder terminar un campo obligatorio.
- **Redundancia con "Usar mi ubicación" (GPS):** si el GPS ya resuelve la ubicación exacta, obligar
  también a la cascada administrativa es trabajo extra sin aportar nada al usuario en ese momento.
- El campo "Contacto" menciona que "se verifica si es tu propio número": sugiere un paso de
  verificación (¿OTP?) no visible en el HTML estático; **no probado en vivo**, punto de falla
  potencial bajo red inestable si existe.
- Un único selector "Tipo" con 7 opciones mezcla casos muy distintos (reportar persona desaparecida
  vs. ofrecer un recurso vs. alertar un peligro); bajo estrés, escanear 7 opciones agrega fricción
  cognitiva innecesaria frente a accesos directos por intención.
- Campo "Vigencia" (fecha de expiración) obliga a una decisión temporal que no es prioritaria en el
  instante de reportar una emergencia.
- **No hay confirmación de envío visible en el HTML estático**: no se pudo probar en vivo si existe
  tras el submit; es la fricción potencialmente más peligrosa (la persona no sabe si su reporte
  salió, puede reenviarlo duplicado o asumir que se envió cuando no fue así). **Recomendado probar
  en navegador real con la red deliberadamente degradada.**
- No hay evidencia de guardado de borrador local ni de reintento automático de envío.

### Insumos (`/es/necesidades`)

- No es un formulario dedicado de "pido/ofrezco": es un listado con filtros (Verificados/Sin
  verificar/Cubiertos) y un botón "Reportar" que lleva al mismo formulario genérico de 7 tipos. Para
  alguien que solo quiere decir "necesito agua ya", pasar por Tipo→Categoría→Cantidad→Título→
  Ubicación→Vigencia son demasiados pasos.
- **No se pudo confirmar en vivo** si el botón "Reportar" desde esta página pre-llena el Tipo
  (Necesidad/Recurso) o si hay que elegirlo de nuevo: depende de estado de cliente no visible en
  una carga estática.
- Los tres filtros de vista son útiles para quien *busca*, pero no deberían anteponerse al camino de
  quien *quiere reportar* una necesidad.

### Buscar personas (`/es/personas`)

- Se llega bien desde el home ("Buscar a alguien →", claro y directo).
- Búsqueda simple por nombre (mínimo 2 letras), sin campos de edad/ubicación/descripción física para
  acotar resultados (importante con apodos, nombres mal escritos, coincidencias comunes).
- **Puente faltante:** si la búsqueda no encuentra a nadie, la página no ofrece (al menos en el HTML
  estático) un CTA directo a reportar a esa persona como desaparecida: hay que volver a la nav,
  tocar "Reportar" genérico, y elegir entre 7 tipos el correcto. Salto de contexto innecesario en un
  momento de angustia.
- **No se pudo verificar en vivo** qué campos exactos pide el formulario cuando el Tipo es "Persona
  desaparecida" (¿foto, edad, descripción física, señas particulares?): depende de campos
  condicionales no visibles en carga estática.

### Antes de confiar en este bloque, probar en vivo:

- Comportamiento de los dropdowns encadenados bajo red degradada.
- Si existe verificación de contacto (OTP) y cómo falla con red inestable.
- Mensaje de confirmación tras "Publicar reporte" en los tres flujos.
- Si "Reportar" desde Insumos/Personas pre-selecciona el Tipo correcto.
- Si existen campos condicionales (foto, edad, descripción) para Persona desaparecida/encontrada.
- Guardado de borrador local y reintento automático de envío.

---

## Resumen para Rafa

1. **Copy:** guardrails de marca cumplidos en las 4 páginas; el trabajo real es de registro
   (despersonalizar "el servicio" → "Waraira/nosotros", quitar jerga de producto repetida, y
   resolver la definición inconsistente de Waraira entre Privacidad ("capa") y Términos
   ("herramienta"): usar "herramienta" en todo el sitio). El hallazgo más urgente de copy es la
   frase de boilerplate SaaS en Términos ("el servicio se ofrece tal como está").
2. **Categorías:** un hallazgo cruzado confirmado por dos vías independientes ("Refugio" significa
   dos cosas distintas), un hueco crítico de seguridad ("persona atrapada" no tiene categoría propia
   y cae mal en desaparecida/peligro genérico), un rename necesario ("Combustible" → "Gas y
   energía"), y una pieza completa que falta (insumos para mascotas, el motor de necesidades no
   tiene gancho para el módulo Mascotas todavía). Dos decisiones de producto de Edma para incorporar
   directo, no solo hallazgos: (a) al elegir "Otro" debe desplegarse un campo de texto obligatorio
   para especificar de qué se trata, y (b) los insumos de mascotas necesitan su propia
   sección/feed con las mismas tres pestañas de estado que ya usa `/es/necesidades`
   ("Verificados / Sin verificar / Cubiertos"), no mezclarse sueltos en el feed general.
3. **Flujos:** la cascada de ubicación obligatoria + GPS redundante, y la falta de confirmación
   visible tras enviar un reporte, son las dos fricciones de mayor riesgo bajo red intermitente.
   Varios puntos quedaron marcados explícitamente como "no probado en vivo": antes de decidir
   cambios de UX, alguien debería probar los tres flujos en un navegador real con red degradada.
4. Nada de esto toca código: es spec/producto, para que el equipo de integración decida qué
   incorporar y cómo.
