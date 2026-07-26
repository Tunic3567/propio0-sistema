# Resumen de cambios

## Notas del Día: CRUD completo (admin y vendedor)

- **Archivos:**
  - `backend-separado/models/NotaDia.js` (nuevo)
  - `backend-separado/index.js`
  - `frontend-separado/src/views/NotasDia.vue` (nuevo)
  - `frontend-separado/src/router/index.js`
  - `frontend-separado/src/components/NavbarAdmin.vue`
  - `frontend-separado/src/components/NavbarVendedor.vue`
  - `frontend-separado/src/i18n/locales/es.json`
  - `frontend-separado/src/i18n/locales/en.json`
  - `frontend-separado/src/i18n/locales/pt.json`
  - `frontend-separado/src/views/MiCuentaAdmin.vue`

- **Problema:** No existía funcionalidad de "Notas del Día" para que administradores y vendedores registraran observaciones diarias sobre clientes.

- **Solución:**
  1. **Modelo** (`NotaDia.js`): Esquema Mongoose con campos `titulo`, `descripcion`, `vendedor` (ref), `cliente` (ref, opcional), `creadoPor` ('admin'|'vendedor'), `creadoPorAdmin` (ref), `creadoPorVendedor` (ref), `fecha`.
  2. **Backend** (`index.js`): Cuatro endpoints REST en `/notas-dia`:
     - `GET` — Admin: notas de todos los vendedores de su grupo. Vendedor: notas propias + asignadas a él.
     - `POST` — Admin: asigna a cualquier vendedor/cliente de su grupo. Vendedor: auto-asignado.
     - `PUT /:id` — Admin: cualquier nota del grupo. Vendedor: notas donde es assigned vendor o creador.
     - `DELETE /:id` — mismas reglas que PUT.
  3. **Vista** (`NotasDia.vue`): Componente compartido (adminAccess pattern como Pagos.vue) con lista de notas, modal crear/editar, modal eliminar. Admin selecciona vendedor y se filtran clientes. Vendedor solo selecciona cliente propio.
  4. **Router**: Ruta `/notas-dia` con `meta: { requiresAuth: true, role: 'vendedor', adminAccess: true }`.
  5. **NavbarAdmin**: Botón "Notas del Día" (icono clipboard) después de Resumen, dentro del bloque `!esSuperUsuario`.
  6. **NavbarVendedor**: Botón "Notas del Día" después de Resumen, con `rutaAbiertaLocal` disabled pattern.
  7. **i18n**: Clave `nav.notes` agregada a español ("Notas del Día"), inglés ("Daily Notes") y portugués ("Notas do Dia").
  8. **MiCuentaAdmin**: Fix inmediato de `cuenta.value.usuario` tras confirmar edición de usuario.

## Accesos: ocultar estado de envío de correos a administradores regulares

- **Archivo:** `frontend-separado/src/views/MiCuentaAdmin.vue`
- **Problema:** La sección "Envío de correos (servidor Render)" con el estado de variables SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS, FRONTEND_URL, MAIL_FROM) era visible para cualquier administrador en "Accesos" → "Mi cuenta".
- **Solución:** Se agregó un computed `esSuperUsuario` que verifica `localStorage.getItem('rol') === 'superusuario'`. La sección ahora solo se muestra si `esSuperUsuario` es `true`. Además, se omite la llamada a `cargarEstadoEnvioCorreo()` si no es superusuario.

## AdminDashboard: botón "Ver ocultos y reportados" con modal unificado

- **Archivo:** `frontend-separado/src/views/AdminDashboard.vue`
- **Problema:** El checkbox "Ver ocultos" solo alternaba la visibilidad de clientes ocultos en la lista principal, sin mostrar los clientes reportados ni ofrecer una vista consolidada.
- **Solución:** Se reemplazó el checkbox por un botón que abre un modal unificado con:
  - Clientes ocultos (`ocultoEnAdmin: true`)
  - Clientes cuyo CC ha sido reportado en el sistema de `CedulaReportada`
  - CCs reportados que no tienen cliente asociado
  - Cada entrada muestra badges "Oculto" y/o "Reportado" según corresponda
  - Se eliminó la dependencia del ref `verOcultos` y su lógica en `cargarClientes()`

## VendedorDashboard: evitar recarga de clientes al volver de pagos

- **Archivos:** `frontend-separado/src/views/VendedorDashboard.vue`, `frontend-separado/src/App.vue`
- **Problema:** Al registrar un pago y volver al dashboard, `VendedorDashboard` se desmontaba y remontaba completamente (sin `KeepAlive`), forzando una recarga total de clientes con pantalla de carga.
- **Solución:** Se replicó la misma configuración de `AdminDashboard`:
  1. Se agregó `defineOptions({ name: 'VendedorDashboard' })` al componente
  2. Se agregó `'VendedorDashboard'` al array `keepAliveComponents` en `App.vue`
   3. Se agregó hook `onActivated` que ejecuta `actualizarDashboardEventos()` para refresh silencioso en background

## LanguageSelector: menú se cerraba solo en iPhone

- **Archivo:** `frontend-separado/src/components/LanguageSelector.vue`
- **Problema:** En iOS Safari, el menú de idioma se abría y se cerraba inmediatamente. El backdrop Teleportado al `<body>` con `touch-none` interfería con la síntesis de eventos `click` en iOS, generando un cierre inmediato.
- **Solución:** Se reemplazó el backdrop Teleportado por un detector de clics externo vía `document.addEventListener('click', ...)` agregado/removido con `watch(isOpen)`. Se eliminaron el debounce de 400ms y las directivas `@click.stop` que ya no son necesarias.

## Geolocalización en iPhone: sin aviso de permisos

- **Archivos:** `frontend-separado/src/views/CrearCliente.vue`, `frontend-separado/src/views/CrearClienteAdmin.vue`
- **Problema:** En iOS Safari, `miUbicacion()` usaba `async function` + `new Promise` para envolver `getCurrentPosition()`. El bundler al transformar la función `async` rompía la cadena de gesto de usuario que iOS exige para mostrar el aviso de permisos de ubicación.
- **Solución:** Se convirtió `miUbicacion()` a función síncrona que llama `getCurrentPosition()` con callbacks directos. El reverse geocoding (fetch a Nominatim) se mueve al callback de éxito como función async separada, después de que iOS ya procesó el permiso.

## ResumenAdmin: añadir "Total Registrados"

- **Archivo:** `frontend-separado/src/views/ResumenAdmin.vue`
- **Problema:** El resumen del admin mostraba "Total Clientes" pero no el total de registrados (clientes con pagos registrados), a diferencia del resumen del vendedor que sí lo incluye.
- **Solución:** Se agregó el mismo elemento inline `(N Registrados)` dentro del botón de "Total Clientes", usando la propiedad `resumenPanel.resumen?.clientesConPagosRegistrados` que ya estaba disponible desde la API existente. La traducción `summary.registered` ya existía en todos los locales.

## Gestión de usuarios para superusuario

- **Archivos:** `backend-separado/index.js`, `frontend-separado/src/router/index.js`, `frontend-separado/src/components/NavbarAdmin.vue`, `frontend-separado/src/views/GestionUsuarios.vue`
- **Problema:** El superusuario no tenía una interfaz para administrar los usuarios del sistema. Solo podía editar vendedores desde "Accesos" en el panel de administración.
- **Solución:**
  1. **Backend** (`index.js`): Siete nuevos endpoints protegidos solo para superusuario:
     - `GET /admin/super/usuarios` — lista todos los administradores y vendedores
     - `POST /admin/super/usuarios/admin` — crea un administrador con código de vinculación generado automáticamente
     - `POST /admin/super/usuarios/vendedor` — crea un vendedor vinculado al código de un administrador existente
     - `PUT /admin/super/usuarios/admin/:id` — edita nombre, usuario y/o contraseña de un admin
     - `PUT /admin/super/usuarios/vendedor/:id` — edita nombre, usuario, contraseña, ciudad y país de un vendedor
     - `DELETE /admin/super/usuarios/admin/:id` — elimina un admin (solo si no tiene vendedores vinculados)
     - `DELETE /admin/super/usuarios/vendedor/:id` — elimina un vendedor (solo si no tiene clientes asignados)
  2. **Router** (`index.js`): Nueva ruta `/admin/super/usuarios` con `meta: { role: 'superusuario' }`
  3. **NavbarAdmin** (`NavbarAdmin.vue`): Botón "Usuarios" en sidebar para superusuario; navegación común (Clientes, Rutas, Accesos, Movimientos, Resumen) oculta cuando es superusuario
  4. **GestionUsuarios** (`GestionUsuarios.vue`): Vista con tabla de usuarios, columna de acciones con botones **Editar** y **Eliminar**, modales para crear/editar (admin: nombre, usuario, contraseña; vendedor: nombre, usuario, contraseña, ciudad, país), y confirmación de eliminación con protección si hay dependencias

## Registros: faltaba `observaciones` en la respuesta del endpoint

- **Archivo:** `backend-separado/index.js`
- **Problema:** El endpoint `GET /vendedor/:vendedorId/registros` mapeaba los pagos excluyendo `observaciones`, por lo que los comentarios del pago no se visualizaban en la página Registros del vendedor.
- **Solución:** Se agregó `observaciones: pago.observaciones` al `map` del endpoint.

## Historial admin: faltaba mostrar `observaciones` en el modal de historial de ventas

- **Archivos:** `frontend-separado/src/components/HistorialVentasClienteModal.vue`, `frontend-separado/src/views/Pagos.vue`
- **Problema:** El modal de historial de ventas del administrador no mostraba el campo `observaciones` de los pagos, ni en vista móvil ni en escritorio. La página de registro de pagos solo mostraba `observaciones` en el modal de pago duplicado, no al cargar la página con un pago existente.
- **Solución:**
  1. **HistorialVentasClienteModal**: En vista móvil se agregó un bloque con el comentario cuando `p.observaciones` existe; en vista escritorio se agregó la columna "Comentario" a la tabla.
  2. **Pagos.vue**: El banner de pago existente ahora muestra tipo, valor, parcelas y comentario del pago ya registrado.

## Sidebar colapsable en móvil (ResumenAdmin)

- **Archivos:**
  - `frontend-separado/src/views/ResumenAdmin.vue`
  - `frontend-separado/src/i18n/locales/es.json`
  - `frontend-separado/src/i18n/locales/en.json`
  - `frontend-separado/src/i18n/locales/pt.json`

- **Problema:** En móvil, con muchos vendedores el árbol de ubicaciones ocupaba toda la pantalla y el usuario tenía que desplazarse mucho antes de ver el contenido del resumen.

- **Solución:**
  1. Se agregó estado `sidebarAbierto` (`ref(false)`) y detección responsive `isDesktopView` vía listener `resize`.
  2. El sidebar se oculta por defecto en móvil y se muestra mediante un botón toggle azul "Mostrar asesores" / "Ocultar asesores".
  3. Al seleccionar un vendedor, el sidebar se cierra automáticamente.
  4. En desktop el comportamiento no cambia: sidebar siempre visible y con scroll independiente.

## Descargar/compartir resumen al cerrar ruta (vendedor)

- **Archivos:**
  - `frontend-separado/src/components/ResumenCierreModal.vue` (nuevo)
  - `frontend-separado/src/views/VendedorDashboard.vue`
  - `frontend-separado/src/views/ResumenVendedor.vue`
  - `frontend-separado/src/i18n/locales/es.json`
  - `frontend-separado/src/i18n/locales/en.json`
  - `frontend-separado/src/i18n/locales/pt.json`
  - `frontend-separado/package.json` (nueva dependencia html2canvas)

- **Problema:** Al cerrar una ruta desde el perfil del vendedor, no había forma de descargar o compartir el resumen de la ruta cerrada.

- **Solución:**
  1. Nuevo componente `ResumenCierreModal.vue`: modal con tarjeta estilizada del resumen (vendedor, fechas, cartera/caja, recaudo, ingresos/ventas/egresos/retiros, caja final, cartera final, clientes).
  2. Botones: "Descargar PNG" (captura con html2canvas scale:2, descarga como PNG) y "Compartir" (Web Share API con fallback a descarga).
  3. Integrado en `VendedorDashboard.vue` y `ResumenVendedor.vue`: tras cerrar ruta exitosamente, se fetchea `GET /api/vendedores/:id/panel` y se abre el modal.
  4. Dependencia `html2canvas` importada dinámicamente (no afecta bundle inicial).

## HistorialResumenesModal: ver resúmenes de rutas cerradas anteriores

- **Archivos:**
  - `frontend-separado/src/components/HistorialResumenesModal.vue` (nuevo)
  - `frontend-separado/src/views/ResumenVendedor.vue`
  - `frontend-separado/src/i18n/locales/es.json`
  - `frontend-separado/src/i18n/locales/en.json`
  - `frontend-separado/src/i18n/locales/pt.json`

- **Problema:** Un vendedor no podía consultar resúmenes de rutas cerradas anteriores, solo veía el de la ruta actual.

- **Solución:**
  1. Nuevo componente `HistorialResumenesModal.vue`: modal con selector desplegable de rutas cerradas, la misma tarjeta de resumen (excluye cartera inicial/final), y botones de descarga PNG / compartir (Web Share API).
  2. Botón "Historial de resúmenes cerrados" en `ResumenVendedor.vue` (visible solo cuando hay rutas cerradas), abre el modal pasando `vendedorId` y `rutasDisponibles`.
  3. El modal fetchea `GET /api/vendedores/:id/panel?rutaId=...` al seleccionar cada ruta (el backend ya soporta este parámetro).
  4. i18n: clave `history.closedSummaries` en español, inglés y portugués.
