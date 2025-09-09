# 🚀 Guía de Hosting - Sistema de Gestión de Vendedores

## 📋 Resumen del Plan
- **Frontend:** Vercel (gratis)
- **Backend:** Render (gratis) 
- **Base de datos:** MongoDB Atlas (gratis)

---

## 🔧 PASO 1: Preparar el Código

### 1.1 Actualizar URLs de API
```bash
# Ejecutar script para actualizar todas las URLs
node update-api-urls.js
```

### 1.2 Crear archivo .env para frontend
Crear `frontend/.env`:
```
VITE_API_URL=https://tu-backend.onrender.com
```

### 1.3 Crear archivo .env para backend
Crear `backend/.env`:
```
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/propio0?retryWrites=true&w=majority
PORT=4000
CORS_ORIGIN=https://tu-app.vercel.app
```

---

## 🗄️ PASO 2: Configurar MongoDB Atlas

### 2.1 Crear cuenta en MongoDB Atlas
1. Ir a [mongodb.com/atlas](https://mongodb.com/atlas)
2. Crear cuenta gratuita
3. Crear un cluster gratuito (M0)

### 2.2 Configurar base de datos
1. Crear usuario de base de datos
2. Configurar IP whitelist (0.0.0.0/0 para permitir todas)
3. Obtener string de conexión

### 2.3 Crear colecciones
Crear las siguientes colecciones:
- `administradores`
- `vendedores` 
- `clientes`
- `pagos`
- `rutas`
- `egresos`
- `ingresos`

---

## 🖥️ PASO 3: Hostear Backend en Render

### 3.1 Preparar repositorio
1. Subir código a GitHub
2. Asegurar que `backend/package.json` esté en la raíz del backend

### 3.2 Crear servicio en Render
1. Ir a [render.com](https://render.com)
2. Crear cuenta gratuita
3. "New" → "Web Service"
4. Conectar repositorio de GitHub
5. Configurar:
   - **Name:** `propio0-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `MONGO_URI`: [tu-string-de-conexion]
     - `PORT`: `4000`
     - `CORS_ORIGIN`: `https://tu-app.vercel.app`

### 3.3 Desplegar
1. Hacer clic en "Create Web Service"
2. Esperar a que termine el build
3. Copiar la URL del servicio (ej: `https://propio0-backend.onrender.com`)

---

## 🌐 PASO 4: Hostear Frontend en Vercel

### 4.1 Preparar frontend
1. Asegurar que `frontend/vercel.json` esté creado
2. Actualizar `frontend/.env` con la URL del backend

### 4.2 Desplegar en Vercel
1. Ir a [vercel.com](https://vercel.com)
2. Crear cuenta gratuita
3. "New Project" → Importar repositorio
4. Configurar:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL`: [url-del-backend]

### 4.3 Desplegar
1. Hacer clic en "Deploy"
2. Esperar a que termine el build
3. Copiar la URL del frontend (ej: `https://tu-app.vercel.app`)

---

## 🔄 PASO 5: Actualizar Configuración

### 5.1 Actualizar CORS del backend
1. Ir a Render → Tu servicio → Environment
2. Actualizar `CORS_ORIGIN` con la URL real de Vercel

### 5.2 Actualizar frontend
1. Ir a Vercel → Tu proyecto → Settings → Environment Variables
2. Actualizar `VITE_API_URL` si es necesario

---

## ✅ PASO 6: Verificar Funcionamiento

### 6.1 Probar frontend
1. Abrir la URL de Vercel
2. Verificar que carga correctamente

### 6.2 Probar backend
1. Abrir `[url-backend]/api/vendedores` en el navegador
2. Debería devolver un array vacío (o con datos si ya hay)

### 6.3 Probar login
1. Crear un administrador en MongoDB Atlas
2. Probar login en el frontend

---

## 🛠️ Comandos Útiles

### Desarrollo local
```bash
# Backend
cd backend && npm install && node index.js

# Frontend  
cd frontend && npm install && npm run dev
```

### Verificar logs
- **Render:** Dashboard → Tu servicio → Logs
- **Vercel:** Dashboard → Tu proyecto → Functions → Logs

---

## 🆘 Solución de Problemas

### Error de CORS
- Verificar que `CORS_ORIGIN` en Render coincida con la URL de Vercel

### Error de conexión a MongoDB
- Verificar que `MONGO_URI` sea correcto
- Verificar que la IP esté en la whitelist de MongoDB

### Frontend no carga
- Verificar que `VITE_API_URL` sea correcto
- Verificar logs de Vercel

---

## 📞 URLs de Referencia
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render:** https://dashboard.render.com
- **Vercel:** https://vercel.com/dashboard
