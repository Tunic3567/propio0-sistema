# 🌙 Sistema de Modo Oscuro

## Características

### ✨ **Detección Automática**
- **`prefers-color-scheme`**: Detecta automáticamente las preferencias del sistema del usuario
- **Persistencia**: Guarda la preferencia del usuario en `localStorage`
- **Sincronización**: Se actualiza automáticamente cuando el usuario cambia el tema del sistema

### 🎨 **Diseño Elegante**
- **Transiciones suaves**: Animaciones de 300ms para todos los cambios de tema
- **Colores consistentes**: Paleta de colores optimizada para ambos modos
- **Contraste mejorado**: Texto y elementos perfectamente legibles en ambos modos

### 🔧 **Implementación Técnica**

#### **Composable `useTheme.js`**
```javascript
// Funcionalidades principales:
- detectSystemTheme()     // Detecta preferencia del sistema
- applyTheme(dark)        // Aplica tema al documento
- toggleTheme()           // Cambia tema manualmente
- initTheme()             // Inicializa tema al cargar
```

#### **Componente `ThemeToggle.vue`**
- Botón elegante con iconos de sol/luna
- Animaciones suaves al cambiar
- Indicadores visuales de estado
- Tooltips informativos

#### **Configuración Tailwind**
```javascript
// tailwind.config.cjs
darkMode: 'class',  // Activa modo oscuro por clase
colors: {
  dark: { /* Paleta personalizada */ }
}
```

### 🎯 **Elementos Compatibles**

#### **Navegación**
- ✅ Navbar principal
- ✅ Sidebar deslizable
- ✅ Botones de navegación
- ✅ Iconos y títulos

#### **Vistas**
- ✅ LoginView
- ✅ VendedorDashboard
- ✅ Modales y overlays
- ✅ Formularios

#### **Componentes**
- ✅ Botones y enlaces
- ✅ Tarjetas y contenedores
- ✅ Texto y etiquetas
- ✅ Bordes y sombras

### 🚀 **Uso**

#### **Para Desarrolladores**
```vue
<template>
  <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Contenido -->
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
const { isDark, toggleTheme } = useTheme()
</script>
```

#### **Para Usuarios**
1. **Automático**: El tema se ajusta según las preferencias del sistema
2. **Manual**: Click en el botón de tema (🌙/☀️) en la esquina superior derecha
3. **Persistente**: La preferencia se guarda automáticamente

### 🎨 **Paleta de Colores**

#### **Modo Claro**
- Fondo principal: `bg-gray-100`
- Contenedores: `bg-white`
- Texto principal: `text-gray-900`
- Texto secundario: `text-gray-600`

#### **Modo Oscuro**
- Fondo principal: `dark:bg-gray-900`
- Contenedores: `dark:bg-gray-800`
- Texto principal: `dark:text-gray-100`
- Texto secundario: `dark:text-gray-300`

### 🔄 **Transiciones**
- **Duración**: 300ms
- **Easing**: `ease-in-out`
- **Elementos**: background-color, border-color, color, box-shadow

### 📱 **Responsive**
- Funciona perfectamente en móviles y desktop
- Botón de tema accesible en todas las pantallas
- Transiciones optimizadas para dispositivos táctiles

### 🎯 **Beneficios**
- **Accesibilidad**: Reduce fatiga visual en ambientes oscuros
- **Modernidad**: Interfaz contemporánea y profesional
- **Personalización**: Respeta las preferencias del usuario
- **Rendimiento**: Transiciones suaves sin impacto en performance
