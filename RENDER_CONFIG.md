# 🚀 Configuración para Render

## 📋 **Configuración del Servicio**

### **Información Básica:**
- **Name**: `sistema-cobranza` (o el nombre que prefieras)
- **Region**: `Oregon (US West)` (más cerca de ti)
- **Branch**: `main`
- **Root Directory**: `.` (dejar vacío)

### **Build & Deploy:**
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: `18` (o superior)

### **Variables de Entorno:**
Configura estas variables en Render:

```
MONGO_URI = mongodb+srv://ViaticTunic:James100@cluster0.idvfr4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT = 4000
CORS_ORIGIN = https://sistema-cobranza.onrender.com
```

## 🔧 **Pasos Detallados:**

### 1. **Crear el Servicio:**
1. Ve a [render.com](https://render.com)
2. **New +** → **Web Service**
3. **Connect GitHub** → Selecciona tu repositorio
4. **Connect**

### 2. **Configurar el Servicio:**
1. **Name**: `sistema-cobranza`
2. **Region**: `Oregon (US West)`
3. **Branch**: `main`
4. **Root Directory**: (dejar vacío)
5. **Build Command**: `npm run build`
6. **Start Command**: `npm start`
7. **Node Version**: `18`

### 3. **Variables de Entorno:**
1. Ve a la pestaña **"Environment"**
2. Agrega estas variables:
   - `MONGO_URI` = `mongodb+srv://ViaticTunic:James100@cluster0.idvfr4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - `PORT` = `4000`
   - `CORS_ORIGIN` = `https://sistema-cobranza.onrender.com`

### 4. **Deploy:**
1. Haz clic en **"Create Web Service"**
2. **Espera 5-10 minutos** para el build
3. **¡Listo!** Tu app estará en `https://sistema-cobranza.onrender.com`

## ✅ **Verificación:**
- La app debería estar disponible en la URL que te dé Render
- Las URLs tendrán `#` (ej: `https://sistema-cobranza.onrender.com/#/admin`)
- Todo debería funcionar igual que en local

## 🚨 **Notas Importantes:**
- **Primera vez**: Puede tardar 5-10 minutos
- **URLs con #**: Es normal para SPA
- **Variables de entorno**: Deben estar exactamente como se muestran
- **Node Version**: 18 o superior

¡Sigue estos pasos y tendrás tu app funcionando en minutos! 🎉
