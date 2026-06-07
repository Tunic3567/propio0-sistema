# Sesión única (un dispositivo a la vez)

## Comportamiento

- Cada **administrador** y cada **vendedor** tiene en MongoDB un campo `sessionToken` que se **regenera en cada inicio de sesión** exitoso.
- El frontend guarda ese valor en `localStorage` como `sessionToken` y lo envía en todas las peticiones al API como cabecera **`Authorization: Bearer <token>`**.
- Si el mismo usuario inicia sesión en otro dispositivo, el token anterior deja de existir en la base de datos: la **primera petición** desde el dispositivo viejo recibe **401** con `code: "SESSION_REVOKED"` y la app **vuelve al login** mostrando un aviso (“Se inició una nueva sesión…”).
- Sin cabecera `Authorization`: **401** con `code: "SESSION_REQUIRED"` (sin ese aviso; solo redirección al login).

## Backend

- Modelos: `Administrador` y `Vendedor` incluyen `sessionToken` (índice disperso).
- Middleware: `backend-separado/lib/sessionAuth.js` → `requireSessionMiddleware`.
- Rutas **públicas** (sin token): `GET /api/`, `POST /api/login`, `GET /api/test`.
- CORS permite la cabecera `Authorization` y `X-Session-Token` (alternativa al Bearer).

## Frontend

- Parche global de `fetch` en `src/main.js` (solo URLs del `API_BASE_URL` definido en `src/config/api.js`).
- Tras cambiar contraseña en **Mi cuenta** (admin), el backend rota también `sessionToken`; hay que volver a iniciar sesión.

## Migración

Los usuarios ya existentes tendrán `sessionToken: null` hasta el **próximo login**; a partir de ahí aplica la sesión única.
