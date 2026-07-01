# Waraira, guía de ejecución: empujón de lanzamiento (Tareas 1, 2 y 3)

> **Para Rafa y su equipo de integración.** Esta guía explica el **porqué** de cada paso y de cada
> alianza propuesta, no solo el qué, para que quien incorpore el trabajo de Edma entienda la
> lógica detrás de cada decisión antes de incorporarla. Cubre las tres tareas del brief
> `waraira.org/docs/collaboration/edma-tareas-lanzamiento-ES.md` (commit `7327c08`), organizadas en
> **bloques delegables** (uno por aliado / por categoría) para que se puedan repartir entre varias
> personas sin perder el hilo de por qué cada bloque existe.
>
> **Regla dura que atraviesa toda la guía** (viene del propio brief): no se inventa ningún dato. Si
> un bloque no se puede confirmar, se entrega marcado **"sin confirmar"**, nunca se rellena con un
> dato que parezca razonable. Un dato marcado como incierto vale más que uno inventado que parezca
> seguro.

---

## 0. Cómo leer esta guía

| Tarea | Qué cubre | Estado en esta guía |
|---|---|---|
| **Tarea 1**: números de emergencia + contactos locales | §2 | **Cerrada** con nacional + 6 estados prioritarios (La Guaira, Distrito Capital, Miranda, Aragua, Carabobo, Yaracuy). El hallazgo urgente (los dos números de Protección Civil nacional) **ya se resolvió por llamada** el 30-jun-2026: ambos están activos, se publican los dos. Ver `docs/handoff/tarea1-emergencias-lanzamiento.md`. **Decisión de Edma (1-jul-2026): no se anexan los 18 estados restantes ni se corrobora cada número por llamada**, el disclaimer de la página pública de contactos propuesta (nota de producto en ese documento) cubre ese riesgo. |
| **Tarea 2**: copy público + categorías | §3 | **Ejecutada y entregada** (1-jul-2026). Ver `docs/handoff/tarea2-copy-categorias.md`: copy de las 4 páginas públicas, categorías de reporte/insumos (incluye lectura del código real) y fricciones de los 3 flujos principales. |
| **Tarea 3**: difusión + alianzas | §4 | **Ya investigada y entregada.** Ver `docs/handoff/tarea3-difusion-aliados.md`. |

Para Tareas 1 y 2 esta guía da el **método** (la pregunta exacta que hay que hacerse en cada paso
y por qué), no los datos en sí, porque esos datos todavía no se recolectaron en esta sesión. Para
la Tarea 3, además del método, ya están los resultados reales.

---

## 1. El árbol de decisión raíz: por qué estas tres tareas, y en qué orden

| Pregunta raíz | Si la respuesta es SÍ | Si la respuesta es NO |
|---|---|---|
| ¿Un dato equivocado en esta tarea puede poner en riesgo la vida de alguien directamente (alguien marca un número muerto en una emergencia real)? | Es la **Tarea 1**. Va primero, sin importar qué tan avanzadas estén las otras dos. | Pasa a la siguiente pregunta. |
| ¿Un dato equivocado o un tono ajeno hace que alguien desconfíe del producto y no lo use, aunque no ponga en riesgo vidas directamente? | Es la **Tarea 2**. Va en paralelo a la 1, pero no la bloquea ni la bloquea. | Pasa a la siguiente pregunta. |
| ¿El trabajo depende de la confianza de un tercero externo (una organización aliada) más que de un dato propio de la plataforma? | Es la **Tarea 3**. Su *investigación* puede correr en paralelo a 1 y 2 sin depender de ellas. | (no aplica) |

**El único enlace real entre tareas:** el *contacto real* con un aliado (Tarea 3, fase de envío,
todavía no ejecutada) debería esperar a que al menos el **Bloque A de la Tarea 1** (números
nacionales) esté confirmado. No tendría sentido pedirle a Cruz Roja o Cecodap que confíen en
Waraira si el dato más sensible de la plataforma (el número al que alguien llama en una emergencia)
todavía no está verificado. La *investigación* de aliados (identificar quiénes son, confirmar que
son reales) no tiene esa dependencia y ya se hizo.

```
Tarea 1 (números) ──┐
                     ├─→ [bloqueante] → Tarea 3, fase de CONTACTO real con aliados
Tarea 2 (copy) ──────┘        (no bloqueante entre sí)

Tarea 3, fase de INVESTIGACIÓN (ya hecha) ── corre en paralelo, sin depender de 1 ni 2
```

---

## 2. Tarea 1: Números de emergencia + contactos locales

### 2.1 Por qué importa (cita del brief)

> "Es el único lugar de toda la plataforma donde un dato equivocado pone en riesgo a alguien de
> verdad (una persona en emergencia marca un número muerto)."

### 2.2 Árbol de decisión: ¿con qué nivel de confianza se puede usar un dato?

| Pregunta | Si SÍ | Si NO |
|---|---|---|
| ¿El número/contacto aparece en una fuente oficial gubernamental (ven911.gob.ve, Protección Civil, etc.)? | Marcarlo **"confirmado, fuente oficial"** + fecha de verificación. Usable directo. | Pasar a la siguiente pregunta. |
| ¿Se pudo confirmar llamando o por el canal oficial de la propia organización (Cruz Roja zonal, un Consejo de Protección puntual)? | Marcarlo **"confirmado directamente"** (el nivel de confianza más alto posible sin ser fuente oficial). | Pasar a la siguiente pregunta. |
| ¿Aparece reportado de forma consistente en al menos dos medios de prensa independientes? | Marcarlo **"reportado por prensa, sin confirmar directamente"**. Usable con esa etiqueta visible. | **No incluir.** Marcar "sin confirmar" o dejarlo fuera de la entrega. |

Esta es exactamente la lógica que ya se aplicó, de forma análoga, a un dato de la Tarea 3: los
teléfonos de Cecodap (`0424-2842359`, `0414-2696823`, `0414-2691229`) y su correo
(`cecodap.sap@gmail.com`) están en cobertura de prensa pero no se confirmaron llamando, así que en
`tarea3-difusion-aliados.md` quedaron marcados como "reportados por prensa, sin confirmar
directamente". Esa etiqueta de confianza debe viajar con el dato hasta que alguien lo confirme.

### 2.3 Bloques delegables

**Bloque A: Números nacionales** (911, 171, Protección Civil 0800-558.84.27)
- Verificar vigencia en fuente oficial (ven911.gob.ve, sitio de Protección Civil).
- Marcar fecha de verificación.
- Confirmar o corregir lo que hoy dice `dev.waraira.org/es/como-funciona`.
- *Por qué es su propio bloque:* son 3 números, alto impacto, y la verificación es rápida y
  acotada. No tiene sentido mezclarlo con el trabajo, más lento, de reunir contactos locales.

**Bloque B: Contactos por categoría** (uno por tipo, se puede repartir entre varias personas)
- B1: Bomberos y rescate por zona.
- B2: Cruz Roja por filial (ya hay un punto de partida: `@cruzrojave` a nivel nacional, confirmado
  en la Tarea 3; falta lo zonal).
- B3: Consejos de Protección del Niño por municipio (ya hay un punto de partida: los puntos de
  atención post-sismo en Caracas listados en `tarea3-difusion-aliados.md` §2.5; falta confirmar
  contacto puntual por Consejo).
- B4: Refugios activos por zona.
- *Por qué se divide por categoría y no por zona geográfica:* cada categoría tiene una fuente de
  verificación distinta (Cruz Roja se confirma vía su estructura nacional; un Consejo de Protección
  se confirma vía IDENNA o el propio Consejo municipal), así que agrupar por categoría deja cada
  bloque con un método de verificación consistente de principio a fin.

**Bloque C: Consolidación**
- Unificar Bloques A y B en una sola tabla (nombre, tipo, zona, teléfono, cómo se confirmó, fecha).
- Entregar a Rafa para incorporar al directorio + página de emergencia.
- *Por qué va al final:* depende de que A y B ya tengan contenido; consolidar antes sería
  prematuro.

### 2.4 Estado actual

**Bloque A (números nacionales): hecho, incluyendo el hallazgo urgente ya resuelto por llamada**
(ver `docs/handoff/tarea1-emergencias-lanzamiento.md`). **Bloque B: hecho para 6 de 24 estados**
(La Guaira, Distrito Capital, Miranda, Aragua, Carabobo, Yaracuy), con la fuente de cada contacto y
una sección aparte ("Recomendado para seguir haciendo: corroboración por llamada") con la lista
explícita de conflictos que faltan por confirmar en esos 6 estados. **Decisión de cierre
(1-jul-2026): no se hace la Fase 2 (18 estados restantes) ni la corroboración por llamada de esos
conflictos**: cubierto por el disclaimer de la página pública de contactos propuesta. Bloque C
(consolidación) queda sin hacer porque ya no aplica: no hay más estados que consolidar.

---

## 3. Tarea 2: Copy público + categorías

### 3.1 Por qué importa (cita del brief)

> "Tú tienes el oído de campo y de español venezolano natural. El copy lo redactamos con cuidado,
> pero tú puedes detectar lo que suena ajeno, frío, o lo que no calza con cómo la gente realmente
> pide y ofrece ayuda."

### 3.2 Árbol de decisión: ¿qué se cambia y qué se deja?

| Pregunta | Si SÍ | Si NO |
|---|---|---|
| ¿La frase cumple los guardrails de voz (sin guion largo, sin ego/comparaciones, deja claro que complementa y no reemplaza)? | Pasa al siguiente filtro. | Reescribir esto primero; es un bloqueo de marca, no de tono. |
| ¿Suena a algo que diría una persona real en un grupo de WhatsApp venezolano, no a un comunicado institucional? | Dejarla como está; puede servir de ejemplo de "qué sí suena bien". | Anotar: original → propuesta + el porqué concreto (no basta con "suena raro"). |
| ¿La categoría (de reporte o de insumos) cubre una necesidad real y frecuente en un desastre en Venezuela? | Confirmar que está presente y bien nombrada. | Proponer agregarla, con un ejemplo de campo que justifique por qué falta. |
| ¿La categoría es redundante, confunde, o nadie la usaría en la práctica? | Proponer fusionarla o quitarla. | Dejarla como está. |

Esta es la misma lógica frase-por-frase que ya se usó en `tarea3-difusion-aliados.md` §1 para
mejorar el kit de difusión (ej.: "míralo y compártelo" → "échale un ojo y pásalo", con el porqué
explicado ahí). Aplicar el mismo método a las páginas públicas y categorías es repetir un patrón
que ya funcionó, no inventar uno nuevo.

### 3.3 Bloques delegables

**Bloque A: Páginas públicas** (inicio, `/es/como-funciona`, `/es/privacidad`, `/es/terminos`)
- Leer cada página completa en `dev.waraira.org`.
- Anotar frase por frase: original → propuesta + por qué.
- Marcar explícitamente lo que ya está bien (evita que se reescriba algo que no hacía falta tocar).

**Bloque B: Categorías de reporte** (`/es/reportar`)
- Listar las categorías actuales.
- Marcar las que faltan o sobran, cada una con un caso de campo real que la justifique.

**Bloque C: Categorías de insumos** (`/es/necesidades`)
- Mismo método que B, pero para insumos (incluye ropa por edad/talla).

**Bloque D: Flujos bajo estrés** (reportar, pedir/ofrecer insumos, buscar personas)
- Recorrer cada flujo como lo haría alguien con red intermitente y bajo estrés.
- Anotar fricciones puntuales, no impresiones generales.

*Por qué A-D están separados:* cada uno requiere un tipo de atención distinto (A es redacción, B y
C son taxonomía de dominio, D es UX bajo estrés), así que conviene poder asignarlos por separado
según quién esté mejor calificado para cada tipo de revisión.

### 3.4 Estado actual

**Ejecutada (1-jul-2026).** Ver `docs/handoff/tarea2-copy-categorias.md`. Hallazgos principales:
la definición de Waraira es inconsistente entre Privacidad ("capa civil") y Términos ("herramienta");
Términos tiene una frase de boilerplate SaaS en inglés calcado ("el servicio se ofrece tal como
está") pegada a "esfuerzo humanitario de buena fe"; falta una categoría de reporte para "persona
atrapada" (rescate urgente); "Refugio" significa dos cosas distintas (tipo de reporte vs. categoría
de insumo); "Combustible" no cubre gas doméstico ni energía; y no hay categoría de insumos para
mascotas. Varios puntos de los flujos (confirmación de envío, verificación OTP, campos
condicionales) quedaron marcados como "no probado en vivo": requieren sesión de navegador real.

---

## 4. Tarea 3: Difusión + alianzas (ya investigada)

### 4.1 Por qué importa (cita del brief)

> "Waraira complementa el ecosistema existente (Hazlo Hoy ya agrega varias plataformas); tú
> conoces ese ecosistema y el lenguaje correcto para acercarse sin competir."

### 4.2 El árbol de decisión: por qué cada alianza (el corazón de esta sección)

Esta es la lógica real que se aplicó a cada organización candidata durante la investigación. Sirve
para que el equipo de Rafa pueda auditar el criterio, y para aplicarlo a futuros candidatos que
aparezcan después del lanzamiento.

| Pregunta | Si SÍ | Si NO |
|---|---|---|
| ¿La organización ya hace, en su propio terreno, algo equivalente a un módulo de Waraira (personas, insumos, mascotas, niñez)? | Es candidata directa: pasa a la siguiente pregunta. | Queda fuera de esta ronda (no es del ecosistema directo). |
| ¿Es una **plataforma par** (un agregador comunitario, no una institución) que ya practica "complementar, no competir" enlazando a otras iniciativas? | **Prioridad alta**: sinergia natural, casi no hay fricción de adopción. | Pasa a la siguiente pregunta. |
| ¿Es una **ONG institucional establecida**, con alcance y confianza pública ya construida? | **Prioridad alta**: su respaldo da credibilidad inmediata a lo que enlacen. | Pasa a la siguiente pregunta. |
| ¿Es un **organismo del Estado** (gubernamental, estatutario)? | Revisar la bandera de neutralidad (R8) antes de avanzar: acercamiento institucional cuidado, **prioridad media**, nunca un mensaje de campaña. | Pasa a la siguiente pregunta. |
| ¿Se autodefine con **branding político explícito** (p. ej. "colectivo revolucionario", alineamiento partidista visible en su propia bio)? | **No acercarse sin decisión conjunta** con Rafa. Se anota como caso a discutir, no se descarta unilateralmente. | Pasa a la siguiente pregunta. |
| ¿Se pudo **confirmar el handle/contacto real** (descartando falsos positivos de nombre parecido)? | Sigue en la lista, con el contacto confirmado. | Se marca **"sin confirmar"**; no se usa el handle encontrado, aunque exista, hasta confirmarlo. |

### 4.3 Resultado de aplicar el árbol (resumen; detalle completo en `tarea3-difusion-aliados.md`)

| Organización | Camino en el árbol | Prioridad |
|---|---|---|
| Venezuela Reporta | Plataforma par, ya enlaza a otras iniciativas | **Alta** |
| Hazlo Hoy / Venezuela Ayuda | Plataforma par, agregador (mencionado en el propio brief de Rafa) | **Alta** |
| Cruz Roja Venezolana (`@cruzrojave`) | ONG institucional establecida | **Alta** |
| Cecodap (`@cecodap`) | ONG institucional establecida, foco niñez | **Alta** |
| Consejos de Protección / IDENNA | Organismo del Estado → bandera de neutralidad revisada | **Media**, acercamiento institucional cuidado |
| HuellasCan | Encaja con módulo Mascotas, contacto sin confirmar | **Media** |
| Patitas a Salvo Venezuela | Encaja con módulo Mascotas, **handle encontrado era falso positivo** (org. de Buenos Aires) → contacto real sin confirmar | **Media** |
| Misión Nevado | Branding político explícito en su propia bio ("colectivo revolucionario") | **No contactar sin decisión conjunta** |

### 4.4 Bloques delegables (uno por aliado, como pidió Edma)

Cada bloque sigue la misma forma de tres pasos. Para los de prioridad alta y media ya está hecho el
primer paso (investigar/confirmar); falta el segundo paso fino (afinar el mensaje específico antes
de enviar) y el tercero (que Rafa lo apruebe).

**Bloque: Venezuela Reporta**
1. ✅ Investigar y confirmar: es real, activo, agrega otras plataformas (hecho).
2. Redactar mensaje final de acercamiento (ya hay una variante lista en `tarea3-difusion-aliados.md` §2.1).
3. ⬜ Marcar listo para revisión de Rafa.

**Bloque: Hazlo Hoy / Venezuela Ayuda**
1. ✅ Investigar y confirmar: es real, activo (hecho).
2. ⬜ Identificar canal de contacto (el sitio no tiene "quiénes somos" ni redes propias confirmadas; falta resolver esto antes de poder enviar nada).
3. ⬜ Marcar listo para revisión de Rafa.

**Bloque: Cruz Roja Venezolana**
1. ✅ Investigar y confirmar cuenta oficial `@cruzrojave` (hecho).
2. Redactar mensaje de acercamiento (variante institucional ya lista en `tarea3-difusion-aliados.md` §2.3).
3. ⬜ Marcar listo para revisión de Rafa.

**Bloque: Cecodap**
1. ✅ Investigar y confirmar cuenta oficial `@cecodap` + canal "Sismo-Info" activo (hecho).
2. Redactar mensaje de acercamiento, aclarando que el módulo de niñez de Waraira está apagado (ya redactado en `tarea3-difusion-aliados.md` §2.4).
3. ⬜ Marcar listo para revisión de Rafa.

**Bloque: Consejos de Protección / IDENNA**
1. ✅ Investigar el contexto general (puntos de atención post-sismo, rol de IDENNA) (hecho).
2. ⬜ Confirmar contacto puntual por Consejo municipal (depende de Tarea 1, Bloque B3: son el mismo tipo de dato).
3. ⬜ Validar con Rafa el tono institucional antes de cualquier mensaje (por la bandera de neutralidad).

**Bloque: HuellasCan**
1. ✅ Investigar (hecho, vía cobertura de prensa).
2. ⬜ Confirmar cuenta/canal de contacto propio (no se encontró Instagram confirmado).
3. ⬜ Redactar mensaje (pendiente de tener un canal confirmado).

**Bloque: Patitas a Salvo Venezuela**
1. ✅ Investigar (hecho); **importante:** descartado el handle `@patitasasalvo_` por ser una organización distinta (Buenos Aires).
2. ⬜ Confirmar el handle/contacto real de la iniciativa venezolana (`migenteve.com` / `patitasasalvovenezuela.org`).
3. ⬜ Redactar mensaje una vez confirmado.

**Bloque: Misión Nevado**
1. ✅ Investigado (hecho): mayor alcance del rubro mascotas (274k), pero bio se autodefine como "colectivo revolucionario y ecosocialista".
2. ⬜ Decisión conjunta con Rafa: ¿se descarta del todo o se aborda con un mensaje estrictamente institucional? No avanzar sin esa conversación.
3. (No aplica: redactar mensaje hasta que se resuelva el paso 2.)

### 4.5 Estado actual

**Investigación completa.** Documento de entrega: `docs/handoff/tarea3-difusion-aliados.md`. Lo que
queda abierto está marcado con ⬜ arriba: son los pasos 2 y 3 de cada bloque (afinar/enviar
mensaje), que el propio brief pide no ejecutar todavía ("no contactes todavía; propón la lista... lo
revisamos juntos antes de enviar").

---

## 5. Orden de ejecución sugerido entre bloques

```
YA HECHO
└─ Tarea 3 / investigación de los 8 aliados ──────────────────────── (sin dependencias)

SIGUIENTE (puede correr en paralelo, asignado a distintas personas)
├─ Tarea 1 / Bloque A: números nacionales ─────────────┐
├─ Tarea 1 / Bloque B: contactos por categoría          │  ambos alimentan
└─ Tarea 2 / Bloques A-D: copy y categorías             │  el directorio y
                                                           │  la confianza pública
DESPUÉS DE Tarea 1 / Bloque A
└─ Tarea 3 / paso 2-3 de cada bloque de aliado ◄──────────┘ (afinar mensaje + enviar,
    requiere que el número de emergencia ya esté verificado
    antes de pedirle a un aliado que confíe en el directorio)

EN CUALQUIER MOMENTO, SIN BLOQUEAR NADA
└─ Tarea 1 / Bloque C: consolidación final (solo depende de que A y B tengan contenido)
```

---

## 6. Cómo delegar cada bloque

Para que cualquier bloque de arriba se pueda asignar a otra persona sin que pierda el contexto:

1. **Cada bloque es autocontenido.** Trae su propia pregunta del árbol de decisión (el "por qué"),
   así que quien lo reciba no necesita leer toda la guía, solo su sección.
2. **Formato de entrega por bloque:** una tabla o lista con, como mínimo, la fuente de cada dato y
   su nivel de confianza ("confirmado, fuente oficial" / "confirmado directamente" / "reportado por
   prensa, sin confirmar" / "sin confirmar"). Sin esa etiqueta, el bloque no está completo.
3. **Aviso de cierre:** cuando un bloque está listo, se avisa a Rafa señalando el bloque exacto
   (no "ya terminé la Tarea 1" sino "Bloque B2: Cruz Roja por filial, listo").
4. **Ningún bloque de la Tarea 3 pasa a "contacto real" sin que Edma y Rafa lo revisen juntos.** Eso
   ya está marcado en el brief ("lo revisamos juntos antes de enviar") y se repite aquí porque es el
   paso de mayor riesgo (es comunicación pública a nombre de Waraira).

---

## 7. Checklist final (alineado al "Cómo entregar y cómo seguimos" del brief)

- [x] Tarea 3: investigación y kit mejorado entregados (`tarea3-difusion-aliados.md`).
- [x] Tarea 1: Bloque A (números nacionales), incluyendo el hallazgo urgente de Protección Civil, **resuelto por llamada** (`tarea1-emergencias-lanzamiento.md`).
- [x] Tarea 1: Bloque B, para 6 de 24 estados (La Guaira, Distrito Capital, Miranda, Aragua, Carabobo, Yaracuy).
- [x] Tarea 1: cerrada por decisión de Edma (1-jul-2026), sin Fase 2 ni corroboración por llamada, cubierto por el disclaimer de la página pública de contactos.
- [x] Tarea 3: mensajes finales listos por organización (`tarea3-difusion-aliados.md` §3).
- [x] Tarea 2: Bloques A-D (copy y categorías) entregados (`tarea2-copy-categorias.md`).
- [ ] Tarea 3: revisar juntos (Edma + Rafa) antes de enviar cualquier mensaje (mensajes finales ya redactados, ver §3 de `tarea3-difusion-aliados.md`).
- [ ] Tarea 2: probar en vivo con navegador real los puntos marcados "no probado" (confirmación de envío, verificación de contacto, campos condicionales).
- [ ] Aviso a Rafa de cada bloque cerrado, por separado (no en un solo lote al final).

---

## 8. Otras ideas de producto de Edma (fuera del alcance original de las 3 tareas)

### Ampliar quién puede avalar a un voluntario o persona registrada (1-jul-2026, refinado)

**Contexto específico: este aval es el de cuidado de niños Y el de mascotas** (la
acreditación/vetting para quien va a estar en contacto con menores o a cargo de una mascota, no un
aval genérico de voluntariado). Hoy se apoya en vecinos por dirección (proximidad geográfica).

**Propuesta de Edma (refinada):** agregar campos opcionales al perfil, además de la dirección, para
**escuela, universidad y lugar de trabajo**. **El aval es humano, no automático:** el mecanismo es
que el sistema notifica a otros usuarios ya registrados que coincidan en alguno de esos mismos datos
(mismo domicilio/zona, misma universidad, misma escuela, mismo trabajo) para que sean ellos quienes,
como personas, confirmen o den fe de la persona a avalar. Es una ampliación del mismo patrón que ya
existe por vecindad (notificar por coincidencia de domicilio), aplicado también a universidad,
escuela y trabajo, para tener más candidatos reales que puedan dar fe (útil para alguien con pocos
vecinos cercanos que lo conozcan, pero sí compañeros de estudio/trabajo que sí puedan). Todos los
campos quedan opcionales, no reemplazan el aval por vecindad, lo complementan.

**Decisión de Edma sobre transparencia:** el sistema debe explicarle a la persona, en el momento de
pedirle estos datos, **por qué se los pide**: que es específicamente para el aval de cuidado de
niños o de mascotas, no un dato genérico de perfil. No pedir escuela/universidad/trabajo sin decir
para qué sirve.

Pendiente de que el equipo de Rafa evalúe cómo encaja con el módulo de acreditación/vetting ya
construido (`convex/vetting.ts`, `convex/lib/minorsGate.ts`; recordar que el módulo de Menores está
apagado con kill-switch hasta revisión legal LOPNNA). Para Mascotas, revisar contra
`docs/MODULO-MASCOTAS.md` (custodia trazada, sin brazaletes).

### Verificación uniforme: solo por código de mensaje (SMS/WhatsApp), salvo el aval de Niños/Mascotas (1-jul-2026, corregido)

**Decisión de Edma, corregida:** hay dos mecanismos distintos, no uno solo:

- **El aval de cuidado de niños y de mascotas** (nota de arriba) es **humano, por notificación** a
  usuarios que coinciden en domicilio/universidad/escuela/trabajo: no es un código, es una persona
  real confirmando a otra.
- **En todos los demás módulos** (Insumos, y cualquier otra verificación de identidad/acción que no
  sea ese aval específico: confirmar que alguien es quien dice ser, confirmar una entrega, un
  traslado, etc.) la verificación debe hacerse **únicamente por código enviado por mensaje
  (SMS/WhatsApp)**, no por otros métodos (subir documento, foto, verificación manual). Es
  consistente con el modelo de identidad que ya usa la plataforma (T1: teléfono + OTP); la idea es
  no introducir métodos de verificación distintos módulo por módulo, sino mantener uno solo, simple
  y ya construido, en todo lo que no sea el aval humano de niños/mascotas.
