# 🌍 Sistema de Internacionalización (i18n)

Este documento explica cómo usar el sistema de traducción implementado con **vue-i18n**.

## 📦 Instalación

Primero, instala la dependencia:

```bash
cd frontend-separado
npm install vue-i18n@^11.0.0
```

**Nota:** Se usa vue-i18n v11 (la versión más reciente y soportada). La versión 9 está deprecada.

## 🎯 Idiomas Disponibles

El sistema soporta 3 idiomas:

- 🇪🇸 **Español** (es) - Idioma por defecto
- 🇺🇸 **English** (en)
- 🇧🇷 **Português** (pt)

## 🔧 Configuración

El sistema está configurado en:
- `src/i18n/index.js` - Configuración principal
- `src/i18n/locales/` - Archivos de traducción

## 📝 Uso en Componentes

### En el Template

```vue
<template>
  <div>
    <h1>{{ $t('nav.clients') }}</h1>
    <button>{{ $t('common.save') }}</button>
  </div>
</template>
```

### En el Script (Composition API)

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const message = t('client.title')
</script>
```

## 🎨 Componente LanguageSelector

El componente `LanguageSelector` ya está integrado en:
- ✅ `NavbarVendedor.vue`
- ✅ `NavbarAdmin.vue`
- ✅ `LoginView.vue`

### Características:
- Menú desplegable elegante
- Bandera del idioma actual
- Persistencia en localStorage
- Detección automática del idioma del navegador
- Cierre con clic fuera o tecla ESC

## 📚 Estructura de Traducciones

Las traducciones están organizadas por categorías:

```json
{
  "common": { ... },      // Textos comunes (guardar, cancelar, etc.)
  "nav": { ... },         // Navegación
  "client": { ... },      // Clientes
  "payment": { ... },      // Pagos
  "route": { ... },       // Rutas
  "summary": { ... },     // Resumen
  "login": { ... },       // Login
  "reports": { ... },     // Reportes
  "address": { ... }      // Direcciones
}
```

## ➕ Agregar Nuevas Traducciones

1. **Edita los archivos JSON** en `src/i18n/locales/`:

```json
// es.json
{
  "miNuevaSeccion": {
    "titulo": "Mi Título",
    "descripcion": "Mi Descripción"
  }
}
```

2. **Repite para todos los idiomas** (en.json, pt.json)

3. **Usa en tu componente**:

```vue
{{ $t('miNuevaSeccion.titulo') }}
```

## 🔄 Cambiar Idioma Programáticamente

```javascript
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// Cambiar a inglés
locale.value = 'en'

// Guardar en localStorage
localStorage.setItem('app-locale', 'en')
```

## 📱 Persistencia

El idioma seleccionado se guarda automáticamente en `localStorage` con la clave `app-locale` y se restaura al recargar la página.

## 🎯 Ejemplos de Uso

### Ejemplo 1: Botón con traducción
```vue
<button>{{ $t('common.save') }}</button>
```

### Ejemplo 2: Título dinámico
```vue
<h1>{{ $t('client.title') }}</h1>
```

### Ejemplo 3: Mensaje con parámetros (futuro)
```vue
{{ $t('client.greeting', { name: 'Juan' }) }}
```

## 🚀 Próximos Pasos

Para traducir completamente la aplicación:

1. **Identifica todos los textos** en las vistas
2. **Agrega las traducciones** a los archivos JSON
3. **Reemplaza los textos hardcodeados** con `$t('clave')`
4. **Prueba en todos los idiomas**

## 📖 Documentación Oficial

- [Vue I18n Documentation](https://vue-i18n.intlify.dev/)
- [Vue I18n Guide](https://vue-i18n.intlify.dev/guide/)

## ⚠️ Notas Importantes

- **Arroba `@` en textos:** en vue-i18n, `@` inicia un *mensaje enlazado*. En correos de ejemplo (`correo@ejemplo.com`) hay que escapar: `correo{'@'}ejemplo.com` para que no rompa la app al cargar traducciones.
- El idioma por defecto es **Español** (es)
- Si falta una traducción, se mostrará la clave o el texto en español
- Los cambios de idioma se aplican inmediatamente sin recargar la página
- El selector de idioma está disponible en todas las vistas principales
