# Handoffs técnicos para Rafa (integraciones)

Documentos de puesta al día para el colega de integraciones. **Privados**: viven aquí (no en
`public/`) para que **no se sirvan en internet** desde Vercel. Se comparten por el repo (privado).

- **`estado-tecnico-general.html`** — visión general de la plataforma y los módulos (umbrella).
- **`estado-tecnico-menores.html`** — deep-dive Menores/Brazaletes: inventario proveedor→lote→destino,
  código provisional, cadena de custodia, constancia, suplencia, modelo de datos.
- **`estado-tecnico-mascotas.html`** — deep-dive Mascotas (foco: integrar el host de fotos).

Para verlos: ábrelos en el navegador (`open docs/handoff/estado-tecnico-general.html`) o léelos en el
repo. Pendientes de integración que recogen: encender Convex, Web Push/VAPID, senders SMS/WhatsApp,
host de fotos (Cloudflare R2/Images), verificación de cédula, y la migración IndexedDB v4→v5 (`onblocked`).
