# Handoffs técnicos para Rafa (integraciones)

Documentos de puesta al día para el colega de integraciones. **Privados**: viven aquí (no en
`public/`) para que **no se sirvan en internet** desde Vercel. Se comparten por el repo (privado).

- **`estado-tecnico-general.html`**: visión general de la plataforma y los módulos (umbrella).
- **`estado-tecnico-menores.html`**: deep-dive Menores/Brazaletes: inventario proveedor→lote→destino,
  código provisional, cadena de custodia, constancia, suplencia, modelo de datos.
- **`estado-tecnico-mascotas.html`**: deep-dive Mascotas (foco: integrar el host de fotos).

Para verlos: ábrelos en el navegador (`open docs/handoff/estado-tecnico-general.html`) o léelos en el
repo. Pendientes de integración que recogen: encender Convex, Web Push/VAPID, senders SMS/WhatsApp,
host de fotos (Cloudflare R2/Images), verificación de cédula, y la migración IndexedDB v4→v5 (`onblocked`).

## Empujón de lanzamiento (Tareas 1/2/3 de `edma-tareas-lanzamiento-ES.md`, commit `7327c08`)

- **`guia-ejecucion-tareas-lanzamiento.md`**: **empieza por aquí.** Índice/estado de las 3 tareas,
  el porqué de cada bloque, qué está listo y qué falta, y el orden de ejecución sugerido.
- **`tarea1-emergencias-lanzamiento.md`**: números de emergencia + contactos locales. **Cerrada**
  con nacional + 6 estados prioritarios (La Guaira, Distrito Capital, Miranda, Aragua, Carabobo,
  Yaracuy); el hallazgo urgente (dos números de Protección Civil nacional) ya se resolvió por
  llamada. Incluye una propuesta de producto (página pública de contactos con disclaimer + filtro
  por zona/categoría). Por decisión de Edma, los 18 estados restantes no se van a anexar y los
  conflictos menores no se van a corroborar por llamada: el disclaimer de esa página cubre el riesgo.
- **`tarea2-copy-categorias.md`**: copy de las 4 páginas públicas + categorías de reporte/insumos +
  fricciones de los 3 flujos principales, con el mismo formato frase-por-frase. Investigación
  completa (incluye lectura del código fuente real para las categorías).
- **`tarea3-difusion-aliados.md`**: kit de difusión mejorado + 8 organizaciones aliadas investigadas
  y priorizadas, con mensaje final listo por organización (§3). Investigación completa; falta
  aprobación de Rafa antes de contactar a nadie (no se contactó a ninguna organización todavía).
