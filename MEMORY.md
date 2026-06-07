---
schemaVersion: 1
scope: workspace
updatedAt: "2026-05-27T05:09:45.236Z"
workspaceName: "Propio0"
---

# Project Memory

## Project Overview
- Workspace para entender y evolucionar **FinzBPP**, sistema de cobranza/ventas a crédito.
- Arquitectura separada: frontend Vue 3/Vite en `frontend-separado` y backend Express + MongoDB/Mongoose en `backend-separado`.
- Dominio: vendedores, administradores, superusuario, clientes, rutas de cobro, pagos, ingresos, egresos, ventas, cartera y reportes.

## Current State
- `DESIGN.md` existe y debe tratarse como la fuente autoritativa del sistema/dirección visual.
- No existen `AGENTS.md` ni `.codesign/settings.json`.
- El proyecto se ejecuta dentro de `backend-separado` y `frontend-separado`.
- Frontend principal: `frontend-separado/index.html` como entrada Vite; la app real se monta desde `src/main.js`.
- Backend principal: `backend-separado/index.js`.
- Para ver vistas `.vue` reales hay que correr Vite desde `frontend-separado` con `npm run dev`.
- `frontend-separado/src/router/index.js` referencia vistas en `../views`; en esta copia inspeccionada no apareció `src/views`, aunque el router importa esas vistas.
- Ajuste activo del Login: override focalizado en `frontend-separado/src/assets/global.css` para hacer más grande/visible el mensaje motivacional y acercarlo al logo.
- `frontend-separado/src/assets/login-tweaks.js` expone controles tweakables para tamaño, interlineado, peso y espacio del mensaje del Login.
- Modo offline/sesión: la app conserva/confía temporalmente en la sesión local cuando no hay conexión o falla la red, y solo debe expulsar ante respuesta real del backend.
- La cola offline de pagos existe con IndexedDB y fallback a `localStorage`; la sincronización conserva pendientes hasta poder validar contra backend.
- Carga de clientes/pagos del vendedor usa snapshot local cuando se pierde conexión, evitando vaciar datos o mostrar “no se pudieron cargar los datos” si ya había datos cargados.
- La comprobación de despliegue (`version.json`) no debe recargar la página mientras `navigator.onLine === false`.
- La vista de `Pagos` se carga directamente desde el router para que el botón “Pago” pueda abrir la pantalla aun offline; hay manejo de error para rutas diferidas no disponibles sin conexión.
- Ajuste reciente: `frontend-separado/src/main.js` intercepta fallos de `/api/rutas/actual/...` y devuelve ruta temporal abierta si hay sesión local, para evitar que la UI marque “ruta cerrada” por falta de red.
- `frontend-separado/src/utils/rutaUtils.js` fue reescrito para endurecer la confianza temporal de ruta offline y no traducir fallos de red en ruta cerrada.

## Artifacts
- `DESIGN.md`: baton visual actual; fuente autoritativa; documenta reglas offline no alarmantes, no expulsar sesión, no vaciar listas, mantener pantalla de pago disponible y confiar temporalmente en ruta local.
- `frontend-separado/index.html`: entrada Vite/Vue; no representa la app completa por sí solo.
- `frontend-separado/package.json`: scripts `dev`, `build`, `preview` y dependencias.
- `frontend-separado/src/main.js`: monta Vue, router, Pinia, i18n, CSS global, Leaflet; intercepta fetch, inyecta sesión, evita limpiar auth ante offline/error de red, maneja sync offline, check de despliegue y fallback temporal de ruta activa.
- `frontend-separado/src/assets/global.css`: estilos globales; contiene override activo del Login.
- `frontend-separado/src/assets/login-tweaks.js`: controles editables del ajuste visual del Login.
- `frontend-separado/src/router/index.js`: rutas del frontend; `Pagos` se carga directamente y hay manejo de fallo para imports diferidos offline.
- `frontend-separado/src/config/api.js`: URL fija del backend en producción.
- `frontend-separado/src/utils/offlineSession.js`: reglas de confianza temporal de sesión offline y helper para detectar errores de red/offline.
- `frontend-separado/src/utils/offlinePagoQueue.js`: cola de pagos offline en IndexedDB con fallback a `localStorage`.
- `frontend-separado/src/utils/syncOfflinePagos.js`: sincroniza pagos pendientes contra `POST /api/pagos`; no descarta cola por falta de conexión.
- `frontend-separado/src/utils/vendedorParallelFetch.js`: carga pagos/clientes del vendedor; cachea snapshot local y lo usa como fallback offline.
- `frontend-separado/src/utils/rutaUtils.js`: consulta estado/cierre de ruta; ahora no bloquea pagos offline ni devuelve ruta cerrada por fallos de red si existe sesión/ruta local confiable.
- `frontend-separado/docs/OFFLINE_PAGOS.md`: guía de comportamiento de pagos offline.
- `frontend-separado/src/utils/deployVersionCheck.js`: detecta nuevos despliegues; evita ping/recarga si no hay conexión.
- `frontend-separado/src/utils/clearAuth.js`: borra claves de autenticación y redirige al Login usando helpers compartidos.
- `frontend-separado/src/stores/useClienteStore.js`: cliente seleccionado persistido en `localStorage`.
- `backend-separado/lib/sessionAuth.js`: autenticación por sesión/token y lógica de sesión única.
- `backend-separado/models/*.js`: modelos Mongoose.
- `docs/ResumenAdminDashboard.html`: guía/documentación del panel administrador.
- `frontend-separado/backup-estilos/`: backup de estilos/frontend anterior.

## Design Direction
- Aplicación operativa móvil/PWA con soporte de modo oscuro, i18n y mapas.
- Stack visual: Vue 3, Tailwind/DaisyUI, CSS global, Leaflet/Google Maps.
- Para cambios visuales, leer y preservar `DESIGN.md` antes de editar estilos.
- Login debe mantener el nuevo logo; el mensaje motivacional debe tener jerarquía clara y cercanía visual con el logo.
- Estado offline debe ser visible, no alarmante, permitir operación de campo, conservar sesión, mantener datos previamente cargados, permitir abrir la pantalla de pago y registrar pagos en cola.
- La ruta activa en offline debe tratarse como “temporalmente confiable/abierta” si hay sesión local, no como cerrada por falta de red.

## User Feedback
- El usuario pidió entender el código/proyecto; se respondió en español con arquitectura, dominio, roles y flujo principal.
- El usuario corrigió que el proyecto se ejecuta dentro de `backend-separado` y `frontend-separado`.
- El usuario pidió varias veces mejorar el Login con nuevo logo: agrandar/visibilizar mensaje motivacional y reducir espacio con el logo.
- Hubo `/undo` previos que revirtieron overrides globales anteriores.
- El usuario reportó expulsión de sesión offline; pidió confianza temporal en sesión local.
- Luego reportó recarga y error “no se pudieron cargar los datos” al perder internet.
- Después reportó que el botón “Pago” no abría offline; se ajustó carga directa de la vista.
- Reportó que la ventana de pago abría offline pero al registrar pago aparecía “Error al consultar la ruta activa”.
- Último reporte: seguía fallando ruta offline y al volver aparecía ruta cerrada; se reforzó fallback de ruta activa en `main.js` y `rutaUtils.js`.

## Decisions
- Preservar título/diseño actual; no reconstruir ni cambiar título salvo petición explícita.
- Antes de editar fuentes existentes, inspeccionar workspace y ver el archivo fuente correspondiente.
- Tratar `DESIGN.md` como autoridad visual.
- No afirmar que el proyecto está incompleto sin revisar rutas/vistas.
- Para ver la app real, usar `cd frontend-separado && npm run dev`.
- Ajustes visuales del Login deben ser puntuales, reversibles y preferiblemente migrados al componente real.
- Para modo offline, no cerrar sesión cuando no hay internet o cuando `fetch` falla por red; solo cerrar sesión si el backend responde realmente que la sesión fue revocada/requerida.
- Los pagos offline deben permanecer en cola hasta sincronizarse o hasta recibir una respuesta válida que confirme duplicado/éxito/error real.
- En offline, no vaciar listas/datos ya cargados por errores de red; usar snapshot local cuando sea posible.
- No recargar por check de despliegue mientras no haya conexión.
- La pantalla/ruta de pago debe estar disponible antes de quedar offline; evitar lazy-load crítico para el flujo de cobro.
- Si la consulta de ruta activa falla por offline/error de red, se permite confiar temporalmente en sesión/ruta local para registrar el pago en cola.
- Las consultas a ruta activa no deben devolver “cerrada” por falta de red; deben usar ruta temporal abierta cuando exista sesión local confiable.

## Open Questions
- ¿Dónde están exactamente todas las vistas Vue importadas por `frontend-separado/src/router/index.js` en el workspace completo?
- ¿El tamaño/espaciado actual del mensaje motivacional del Login ya coincide con la intención visual del usuario?
- ¿Conviene migrar el ajuste activo desde `global.css` al componente real `LoginView.vue`?
- ¿Qué endpoints adicionales, además de pagos/clientes/ruta activa del vendedor, deben soportar operación offline?
- ¿Debe añadirse una barra/toast global visible para estado offline y pagos pendientes?
- ¿Debe cachearse también información de rutas, cartera, ventas u otros dashboards para navegación offline?
- ¿El registro de pago queda efectivamente en cola y sincroniza tras volver la conexión en navegador real?
- ¿La UI de Pagos usa otros endpoints/estados de ruta no cubiertos por `/api/rutas/actual/...`?

## Next Steps
- Probar flujo offline completo: iniciar sesión, cargar clientes, perder internet, pulsar “Pago”, abrir ventana de pago, guardar pago, cerrar/abrir app, volver conexión y sincronizar.
- Confirmar en navegador que ya no aparece “Error al consultar la ruta activa” ni “ruta cerrada” por estar offline.
- Verificar que el pago queda en cola y no se descarta por estado de ruta temporal.
- Confirmar si otras rutas críticas del vendedor también deben dejar de ser lazy-loaded.
- Añadir aviso UI: “Sin conexión. Los pagos se guardarán y se enviarán automáticamente.”
- Probar visualmente el Login con Vite y, si se localiza `LoginView.vue`, migrar el override desde `global.css`.

## Promotion Candidates For DESIGN.md
- Aplicación operativa móvil/PWA con escala fija y `viewport-fit=cover`.
- Vue 3 + Tailwind/DaisyUI como base visual.
- Soporte de modo oscuro y multiidioma como requisitos de experiencia.
- Uso de mapas Leaflet/Google Maps en rutas/clientes.
- En Login, mensaje motivacional con jerarquía clara, legibilidad y cercanía al logo nuevo.
- Estado offline visible, no alarmante y orientado a operación en campo.
- Regla UX estable: no expulsar sesión por falta de conexión; confiar temporalmente en sesión local.
- Regla UX estable: no vaciar datos ya cargados ni mostrar error fatal por fallos de red temporales.
- Regla UX estable: rutas críticas de cobro/pago deben estar disponibles antes de quedar offline.
- Regla UX estable: la consulta de ruta activa no debe impedir guardar pagos offline si hay sesión/ruta local confiable.
- Regla UX estable: una ruta no debe marcarse cerrada por un fallo de red; offline debe mostrar/usar ruta temporal confiable.

## Recent History
- 2026-05-17: Se inspeccionó el workspace y se resumió FinzBPP como sistema de cobranza/ventas a crédito con frontend Vue y backend Express/MongoDB.
- 2026-05-26: Se creó/actualizó `DESIGN.md` como baton visual mínimo para ajustes de Login.
- 2026-05-27: Se volvió a aplicar ajuste del mensaje motivacional del Login en `global.css`, con controles en `login-tweaks.js`.
- 2026-05-27: Se implementó confianza temporal de sesión offline en `offlineSession.js`, `main.js`, `clearAuth.js` y `syncOfflinePagos.js`.
- 2026-05-27: Se corrigió comportamiento offline adicional: `vendedorParallelFetch.js` usa snapshot local y `deployVersionCheck.js` evita recargar sin conexión.
- 2026-05-27: Se ajustó `frontend-separado/src/router/index.js` para cargar `Pagos` directamente y manejar fallos de importación de rutas diferidas offline.
- 2026-05-27: Se ajustó `rutaUtils.js` para que la consulta de ruta activa no bloquee registrar pagos offline; se documentó en `DESIGN.md` y `OFFLINE_PAGOS.md`.
- 2026-05-27: Se reforzó manejo de ruta offline en `main.js` y `rutaUtils.js`: fallback temporal abierto para `/api/rutas/actual/...` y prevención de “ruta cerrada” por fallo de red.