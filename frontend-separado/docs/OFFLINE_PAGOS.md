# Pagos offline (cola local)

## Comportamiento

- En **Registrar pago** (`/pagos`), si no hay red (`navigator.onLine === false`) o falla la petición por red, el mismo cuerpo que se enviaría a `POST /api/pagos` se guarda en una **cola persistente** (IndexedDB, con fallback a `localStorage`).
- Al **recuperar conexión** (`window` `online`), al **volver a la pestaña** (`visibilitychange`) y unos segundos tras **cargar la app**, se intenta **subir en orden** cada pago pendiente.
- Si la consulta de **ruta activa** falla por estar offline, por error de red o por una respuesta no confiable, la app no bloquea el registro ni marca la ruta como cerrada: devuelve una ruta temporal abierta basada en la sesión/ruta local y guarda el pago en cola para validarlo al sincronizar.

- Si el servidor responde **duplicado** (`PAGO_DUPLICADO` / `PAGO_DUPLICADO_BD`), el ítem se **elimina de la cola** (ya estaba registrado).
- El **saldo del cliente en pantalla** se actualiza de forma optimista al encolar (store + `localStorage` `clienteSeleccionado`). Tras sincronizar, conviene que el dashboard recargue datos del servidor (`actualizar-dashboard` / `pago-registrado` ya se disparan).

## UI

- **Navbar vendedor**: aviso ámbar con número de pendientes y botón **Subir ahora** si hay cola.

## Limitaciones (MVP)

- Solo **creación** de pago desde `Pagos.vue` (no ediciones desde Registros ni admin).
- Varios pagos **offline** para el **mismo cliente y misma ruta** pueden entrar en cola; al subir, el segundo recibirá error de duplicado y se descartará de la cola — evitar registrar dos veces el mismo cliente/ruta sin conexión.
- **Renovar cliente** con saldo 0 offline puede requerir red al navegar a crear cliente.

## Archivos

- `src/utils/offlinePagoQueue.js` — cola
- `src/utils/syncOfflinePagos.js` — envío al reconectar
- `src/main.js` — listeners globales de sincronización
- `src/views/Pagos.vue` — encolado
- `src/components/NavbarVendedor.vue` — aviso y botón manual
