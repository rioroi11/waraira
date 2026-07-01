# Tarea 1: Números de emergencia + contactos locales (PRIORIDAD)

> Entrega de Edma para Rafa, según `waraira.org/docs/collaboration/edma-tareas-lanzamiento-ES.md`
> (commit `7327c08`). Investigación hecha el 30 de junio de 2026.
>
> **Alcance, cerrado a propósito:** números nacionales + los 6 estados de mayor prioridad para el
> lanzamiento (La Guaira ~90% de la afectación, Distrito Capital/Caracas metropolitana, Miranda,
> Aragua, Carabobo y Yaracuy, epicentro). **Decisión de Edma (1-jul-2026): no se van a anexar los
> otros 18 estados del país ni se va a corroborar cada número por llamada**: el disclaimer de la
> nueva página pública de contactos (ver la nota de producto abajo) cubre ese riesgo. Ver "Decisión
> de cierre" al final.

---

## 📋 Nota para Rafa: propuesta de producto, página pública de contactos de emergencia

Esta es una propuesta de Edma (spec/producto, no código) para que el equipo de integración la
evalúe y construya como corresponda.

**El pie de enlace:** hoy, en `dev.waraira.org` (inicio + `/es/como-funciona`), el texto dice que
Waraira **complementa** a las autoridades/entidades oficiales (911, Protección Civil, etc.) y **no
las reemplaza** (R11). Propuesta: convertir una de esas palabras clave ("autoridades oficiales" o
"entidades oficiales", donde aparezca ese texto) en un **enlace** que lleve a una página nueva
dedicada a los contactos de emergencia.

**La página nueva (ej. `/es/contactos-emergencia` o similar):**

1. **Contenido:** todos los números de este documento (`tarea1-emergencias-lanzamiento.md`),
   nacionales más los 6 estados ya cubiertos y los que se sumen en la Fase 2, organizados para
   consulta pública.
2. **Al cargar la página, debe aparecer un disclaimer/pop-up** (modal, no un simple texto al pie)
   que diga, en sustancia: *"Estos son contactos y números de teléfono extraídos de la web y de
   páginas oficiales. Se suministran solo para apoyar con información"*, con el mismo lenguaje de
   fuente que ya usa la columna "Fuente" de las tablas de este documento. El objetivo es dejar claro
   que Waraira no es la autoridad ni garantiza que cada número esté vigente en todo momento.
3. **Simplificación por zona cubierta:** una vista inicial simple que muestre qué zonas del país ya
   tienen números cargados (hoy: nacional más La Guaira, Distrito Capital, Miranda, Aragua, Carabobo
   y Yaracuy) frente a las que todavía no (el resto, pendiente de la Fase 2), para que quede claro
   de entrada qué cobertura real tiene la página, sin prometer más de lo que hay.
4. **Interfaz interactiva de búsqueda:** al seleccionar una zona, debe aparecer un **filtro por
   categoría** (rescate/Protección Civil, bomberos, policía, salud/Cruz Roja, protección-niñez,
   refugios, atención ciudadana/alcaldía, etc., las mismas categorías que ya usa este documento) y
   por **ubicación** (estado → municipio/parroquia) para que la persona llegue rápido al número que
   necesita, sin tener que leer una tabla larga completa.

**Por qué importa marcarlo así:** varios números de este documento tienen más de una cifra
circulando para el mismo organismo (ver "Recomendado para seguir haciendo" más abajo), y otros
vienen de fuentes de distinto nivel de confianza (oficial, aportado directamente, o de una
conversación con IA). El disclaimer + el enlace desde "autoridades oficiales" dejan clara la
naturaleza real del dato (recopilado, no una fuente autoritativa en sí misma) sin que eso reste
utilidad práctica a la página.

---

## ✅ Hallazgo prioritario: RESUELTO por llamada (30-jun-2026)

Había dos números de Protección Civil nacional en circulación:

- **0800-558.84.27**: el que **hoy día** está publicado en `dev.waraira.org/es/como-funciona`.
- **0800-724.8451 (0800-PCIVIL1)**: el que aparece en el sitio oficial vigente de Protección Civil:
  [pcivil.gob.ve](https://www.pcivil.gob.ve/) · [pcivil.gob.ve/quienes-somos](https://www.pcivil.gob.ve/quienes-somos/).

**Confirmado por llamada telefónica directa (Edma, 30-jun-2026): ambos responden, activos en
paralelo.** Publicar los dos en la web y en el directorio: el `558.84.27` como línea histórica ya
conocida y el `724.8451` como la línea oficial vigente. Ninguno debe quitarse.

---

## Números nacionales

| Nombre | Tipo | Número | Fuente |
|---|---|---|---|
| VEN 9-1-1 | Emergencia única nacional | **911** | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Línea 171 | Emergencia general | 171 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil (nacional) | Rescate / Protección Civil | **0800-724.8451 (0800-PCIVIL1)** | Número de teléfono encontrado en búsqueda web y páginas oficiales: confirmado además por llamada directa el 30-jun-2026 |
| Protección Civil (nacional) | Rescate / Protección Civil | **0800-558.84.27** | Número de teléfono encontrado en búsqueda web y páginas oficiales: confirmado además por llamada directa el 30-jun-2026 |
| Bomberos: número nacional unificado | Bomberos | No existe uno unificado | Número de teléfono encontrado en búsqueda web y páginas oficiales: usar 911 + bomberos locales por estado |
| PNB (Policía Nacional Bolivariana) | Denuncia | 0800-POLINAC (0800-765.4622) | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| CICPC | Denuncia / personas desaparecidas | 0800-CICPC-24 (242-72-24) | Número de teléfono encontrado en búsqueda web y páginas oficiales |

---

## La Guaira (PRIORIDAD: ~90% de la afectación)

| Nombre | Tipo | Zona | Teléfono | Fuente |
|---|---|---|---|---|
| Protección Civil La Guaira | rescate | Estado (sede Urimare) | 0424-207-5335 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cruz Roja: Filial La Guaira | salud | Antiguo Aeropuerto Maiquetía, rampa 4 | +58 412-592-8735 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cuerpo de Bomberos de La Guaira | bomberos | Estado | 0212-332-2165 (otra variante: 0212-332-7620/331-0445) | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Polivargas | policía | Estado | (0212) 331-2409 / 0412-031-0761 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| PNB: La Guaira | policía | Estado | Centro de Coordinación Policial, parroquia Urimare | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía Municipio Vargas | atención ciudadana | Av. Soublette, Casa Guipuzcoana | (0212) 332-7323/7354/2351/6747 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| CJPNNA: línea activada por el sismo | protección-niñez | Área metropolitana / La Guaira | 0412-811-6878 / 0412-543-3655 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| IDENNA: línea activada por el sismo | protección-niñez | Nacional, aplicado a La Guaira | 0424-893-0561 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| 10 refugios temporales (Santa Eduvigis, PDVAL Guaicamacuto, Grumetes, Liceo Reverón, etc.) | refugio | Varias parroquias | Coordinación vía Protección Civil estadal | Número de teléfono encontrado en búsqueda web y páginas oficiales |

---

## Distrito Capital / Caracas metropolitana (incl. Chacao, Baruta, El Hatillo, Sucre-Petare)

| Nombre | Tipo | Zona | Teléfono | Fuente |
|---|---|---|---|---|
| Protección Civil Distrito Capital | rescate | Libertador | 0212-575.1829 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Municipio Libertador | rescate | Libertador | 0800-725.3661 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos Distrito Capital | bomberos | Libertador | 0212-542.2623 / 0212-542.0243 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| CIACA (ambulancias Caracas) | salud | Libertador | 0800-CIACA01 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil + Polichacao | rescate/policía | Chacao | 0424-120.6707 (PC) / 0424-191.2811 (Polichacao) | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| CMDNNA / CPNNA / Defensoría NNA Chacao | protección-niñez | Chacao | 0412-263.5774 / 0414-111.8308 / 0212-265.2777 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil / Polibaruta | rescate/policía | Baruta | 0212-941.6277 / 0212-943.2401 / 0412-336.2122 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Emergencias / Policía El Hatillo | policía/rescate | El Hatillo | 0212-311.7654 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil / Polisucre | rescate/policía | Sucre (Petare) | 0212-271.8190 / 0212-242.2111 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Polisucre | policía | Sucre (Petare) | +58 424-214.7953 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| URI (Unidad de Respuesta Inmediata): Policía Sucre | policía / respuesta inmediata | Sucre (Petare) | +58 424-271.1364 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía de Sucre (Miranda) | atención ciudadana | Sucre (Petare) | +58 212-241.3065 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cruz Roja: Seccional Caracas | salud | Distrito Capital (San Bernardino) | 0212-571.4380 | Número de teléfono encontrado en búsqueda web y páginas oficiales |

---

## Miranda (resto del estado, sin Chacao/Baruta/El Hatillo/Sucre)

| Nombre | Tipo | Zona | Teléfono | Fuente |
|---|---|---|---|---|
| Protección Civil Miranda (estadal) | rescate | Estado | (0212) 383-7849 / 383-6152 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos de Miranda (Los Teques) | bomberos | Guaicaipuro | (0212) 322-9038 / 322-9814 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Polimiranda | policía | Estado | (0212) 536-1900 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policía de Miranda | policía | Estado | +58 416-624-9980 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policía de Miranda (central) | policía | Estado | (0212) 364-3471 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| SOS Guaicaipuro + Línea Violeta | emergencia 24/7 / género | Guaicaipuro (Los Teques) | 0800-482-4220 / 0424-178-9609 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía Plaza (Guarenas) | atención ciudadana | Plaza | (0212) 2002-2012/2021 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Puesto de Comando Plaza (activado por el sismo) | emergencia | Guarenas | 0426-565-1393 / (0212) 361-1144 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía Zamora (Guatire) | atención ciudadana | Zamora | +58 212 381-0728 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía Páez (Río Chico) | atención ciudadana | Páez | (0255) 881-2345 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policía Municipal de Acevedo | policía | Acevedo (Caucagua) | (0234) 662-1274 / (0234) 662-1135 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Acevedo | rescate | Acevedo (Caucagua) | (0424) 154-8509 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos de Miranda: Estación Caucagua | bomberos | Acevedo (Caucagua) | (0234) 662-1544 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| PoliMiranda / Comando Cúpira | policía | Pedro Gual (Cúpira) | (0234) 332-1322 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Pedro Gual | rescate | Pedro Gual (Cúpira) | (0412) 015-8854 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| GNB Cúpira: Destacamento Vial | rescate/seguridad vial | Pedro Gual (Cúpira) | (0234) 332-1211 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policía Municipal de Buroz | policía | Buroz (Mamporal) | (0234) 808-1123 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Buroz | rescate | Buroz (Mamporal) | (0412) 238-1647 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cuadrante de Paz Principal (Mamporal) | policía comunitaria | Buroz (Mamporal) | (0416) 610-3814 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policía Municipal de Andrés Bello | policía | Andrés Bello (San José de Barlovento) | (0234) 583-1120 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Andrés Bello | rescate | Andrés Bello (San José de Barlovento) | (0414) 224-7495 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cuerpo de Bomberos: Estación San José | bomberos | Andrés Bello (San José de Barlovento) | (0234) 583-0044 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Polilander (Policía Municipal de Lander) | policía | Tomás Lander (Ocumare del Tuy) | (0239) 212-1425 / (0412) 203-9047 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos de Miranda: Estación Ocumare | bomberos | Tomás Lander (Ocumare del Tuy) | (0239) 212-0266 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Lander | rescate | Tomás Lander (Ocumare del Tuy) | (0412) 375-9276 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cristóbal Rojas, Independencia, Paz Castillo, Brión, Urdaneta (Cúa), Los Salias | alcaldías/PC/bomberos | Varios municipios | Ver detalle completo en transcript del agente | Número de teléfono encontrado en búsqueda web y páginas oficiales |

**Nota geográfica:** la capital del municipio Urdaneta es Cúa, no San Francisco de Yare (esa es del municipio Simón Bolívar, no cubierto en esta pasada).

---

## Aragua

| Nombre | Tipo | Zona | Teléfono | Fuente |
|---|---|---|---|---|
| Protección Civil Aragua (estadal) | rescate | Maracay (Barrio Libertad) | 0243-247.1778 / 246.7204 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía Girardot (Maracay) | atención ciudadana | Girardot | +58 243 237.9432 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía José Félix Ribas (La Victoria) | atención ciudadana | José Félix Ribas | +58 244 417.4115 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos Aragua (Maracay) | bomberos | Girardot | (0243) 235.1346 (otra variante: 235.2448) | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Poliaragua | policía | Estado | (0243) 235.8593 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cruz Roja Aragua | salud/refugios | Maracay | (0243) 246.7713 / 246.8726 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Mario Briceño Iragorry, Santiago Mariño (Turmero) | alcaldías | Varios municipios | Ver tabla del agente | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policía Municipal de Sucre (Cagua) | policía | Sucre (Cagua) | (0244) 396-4861 / (0244) 395-9411 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos de Aragua: Estación Cagua | bomberos | Sucre (Cagua) | (0244) 395-5133 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Sucre (Cagua) | rescate | Sucre (Cagua) | (0412) 439-5095 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policía del Estado Aragua: Comando San Casimiro | policía | San Casimiro | (0246) 515-3038 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil San Casimiro | rescate | San Casimiro | (0412) 895-4673 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| GNB: Comando Rural San Casimiro | rescate/seguridad | San Casimiro | (0246) 515-3122 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policía Municipal de Zamora (Villa de Cura) | policía | Zamora (Villa de Cura) | (0243) 386-3246 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos de Aragua: Estación Villa de Cura | bomberos | Zamora (Villa de Cura) | (0243) 386-1384 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Zamora (Aragua) | rescate | Zamora (Villa de Cura) | (0412) 465-9502 | Número de teléfono encontrado en búsqueda web y páginas oficiales |

**Nota:** `alcaldiadesucre.com` no corresponde al municipio Sucre de Cagua (Aragua): ese dominio es de la Alcaldía de Sucre del estado Zulia.

---

## Carabobo

| Nombre | Tipo | Zona | Teléfono | Fuente |
|---|---|---|---|---|
| Protección Civil Carabobo | rescate | Valencia | 0241-859-2171 (+ 859-3969 / 859-3804) | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos de Valencia | bomberos | Valencia | 0241-832-4615 (+ 3 líneas más) | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía Naguanagua: Seguridad Ciudadana | seguridad/atención | Naguanagua | 0412-201-3941 / 0412-222-8703 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cruz Roja: Filial Valencia | salud | Valencia (Urb. Prebo) | +58 (241) 821-4841 / 821-5330 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Policarabobo | policía | Valencia | 0241-859-5940 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos San Diego | bomberos | San Diego | 0241-871-6664 / 0424-441-4192 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos Los Guayos, Guacara, Puerto Cabello | bomberos | Varios municipios | Ver tabla del agente | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldías Libertador, Los Guayos, Guacara, Puerto Cabello | atención ciudadana | Varios municipios | Ver tabla del agente | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos Bejuma, Güigüe, Mariara, San Joaquín | bomberos | Resto de Carabobo | Ver tabla del agente | Número de teléfono encontrado en búsqueda web y páginas oficiales |

### Cuadrantes de Paz de Carabobo

| Cuadrante | Parroquia(s) | Teléfono(s) | Fuente |
|---|---|---|---|
| Autopista Regional del Centro | Guacara / Guayos / San Diego / Valencia | 0412-6667494 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| (sin nombre de cuadrante) | Morón | 0412-2063063 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Puerto Cabello | Goaicoaza | 0412-0375089 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Puerto Cabello | Juan José Flores | 0412-4893014 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Naguanagua | Naguanagua | 0416-6098059 / 0426-5156857 / 0412-8831467 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| San Diego | San Diego | 0416-6098703 / 0416-6098581 / 0416-6096704 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Miranda (municipio Carabobo) | Miranda | 0412-3528379 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Montalbán | Montalbán | 0412-8367314 / 0412-9031575 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bejuma | Bejuma | 0412-2464037 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Libertador | Tocuyito | 0412-7428588 / 0412-6096754 / 0412-3043639 / 0412-8831143 / 0412-0116303 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Carlos Arvelo | Tacarigua | 0412-5025671 / 0412-4501688 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Carlos Arvelo | Cagua | 0412-3319709 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Carlos Arvelo | Belén | 0412-5406426 / 0412-4507735 / 0412-5406421 / 0412-8025861 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Valencia | San José | 0412-1270304 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Valencia | Rafael Urdaneta | 0412-4697519 / 0412-6990201 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Valencia | Miguel Peña | 0412-1210240 / 0412-6940662 / 0412-2399739 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Los Guayos | Los Guayos | 0416-6098266 / 0416-6128630 / 0412-7601337 / 0412-4881401 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| San Joaquín | San Joaquín | 0412-8367871 / 0412-8461751 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Diego Ibarra | Mariara | 0412-7440557 / 0412-4380934 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Diego Ibarra | Aguas Calientes | 0412-1380557 | Número de teléfono encontrado en búsqueda web y páginas oficiales |

---

## Yaracuy (epicentro del sismo)

| Nombre | Tipo | Zona | Teléfono | Fuente |
|---|---|---|---|---|
| Protección Civil Venezuela (nacional, referencia) | PC nacional | Nacional | 0800-7248451 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Protección Civil Yaracuy (IADC) | PC estadal | San Felipe | 0254-8038742 (otra variante: 0254-231.66.55) | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Poliyaracuy | policía estadal | San Felipe | 0254-2312824 (emergencia corta: 174) | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Bomberos San Felipe (IABOY) | bomberos | San Felipe | 0254-2324663 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Cruz Roja: filiales San Felipe / Chivacoa | salud | San Felipe / Bruzual | +58 254 2320834 / +58 251 7144895 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía San Felipe | atención ciudadana | San Felipe | (0254) 234-3419 / 231-7656 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Alcaldía Independencia (Yaritagua) | atención ciudadana | Independencia | 0254-2320301 | Número de teléfono encontrado en búsqueda web y páginas oficiales |
| Líneas cortas estadales (SIEY) | varias | Estado | 171 (SIEY) / 172 (Bomberos) / 173 (PC) / 174 (Policía) / 911 (SIMA) / 0800-9272289 | Número de teléfono encontrado en búsqueda web y páginas oficiales |

---

## Decisión de cierre de esta tarea (1-jul-2026)

Varios números de este documento tienen más de una cifra circulando para el mismo organismo
(bomberos de La Guaira/Distrito Capital/Aragua/Yaracuy, Policía de Miranda, Protección Civil
Yaracuy, teléfono de los refugios de La Guaira). **Decisión de Edma: no se va a corroborar cada uno
por llamada, y tampoco se va a hacer la Fase 2 (los 18 estados restantes).** El riesgo que eso
mitigaría queda cubierto por el **disclaimer de la nueva página pública de contactos** (ver la nota
de producto arriba): al dejar explícito que son números recopilados de la web y páginas oficiales,
solo para apoyar con información y no como fuente autoritativa, no hace falta verificar cada uno
antes de publicar. Esta tarea queda **cerrada con el alcance actual**: nacional + 6 estados
prioritarios (La Guaira, Distrito Capital, Miranda, Aragua, Carabobo, Yaracuy). Los otros 18 estados
del país no se van a anexar por ahora.
