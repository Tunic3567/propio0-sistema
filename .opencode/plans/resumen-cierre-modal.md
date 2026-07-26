# Plan: Modal de resumen al cerrar ruta (vendedor)

## Objetivo
Al cerrar una ruta desde cualquier vista del vendedor, mostrar un modal con el resumen completo y opciones para descargar PNG o compartir.

## Archivos a modificar/crear

### 1. Nuevo: `frontend-separado/src/components/ResumenCierreModal.vue`
Modal que recibe props `show`, `vendedorNombre`, `ruta` (objeto del panel), `resumen` (conteo clientes), `intereses`.
- Tarjeta blanca estilizada para capturar con html2canvas
- Botón "Descargar PNG": captura la tarjeta con html2canvas (scale:2) y descarga como PNG
- Botón "Compartir": usa Web Share API si soporta files, con fallback silencioso
- Import dinámico de html2canvas solo al hacer clic (no afecta bundle inicial)

### 2. Modificar: `frontend-separado/src/views/VendedorDashboard.vue`
- Importar `ResumenCierreModal` (junto a los otros imports)
- Agregar refs:
  - `mostrarResumenCierre = ref(false)`
  - `datosResumenCierre = ref(null)` → almacena `{ ruta, resumen, vendedorNombre, intereses }`
- En `confirmarCierreRuta()`, tras éxito (before `actualizarDashboard()`):
  1. Fetch `GET /api/vendedores/${vendedorId}/panel?_ts=${Date.now()}`
  2. Calcular intereses con misma lógica que `ResumenVendedor.vue` (panel.clientes + ruta dates)
  3. Setear `datosResumenCierre` y `mostrarResumenCierre = true`
- Template: agregar `<ResumenCierreModal>` al final, antes de `</template>`

### 3. Modificar: `frontend-separado/src/views/ResumenVendedor.vue`
- Mismos cambios que en VendedorDashboard.vue
- En `confirmarCerrarRuta()`, tras éxito:
  1. Fetch panel
  2. Calcular intereses
  3. Setear datos y mostrar modal
- Template: agregar `<ResumenCierreModal>` al final

### 4. Modificar: i18n
Agregar a `es.json`, `en.json`, `pt.json` en sección `"route"`:
- `closeSummary`: "Resumen de Ruta Cerrada" / "Closed Route Summary" / "Resumo de Rota Fechada"
- `downloadPng`: "Descargar PNG" / "Download PNG" / "Baixar PNG"
- `shareImage`: "Compartir" / "Share" / "Compartilhar"

### 5. Dependencia
- `html2canvas` ya instalado via npm

## Flujo
1. Vendedor toca "Cerrar Ruta" → modal de confirmación
2. Confirma → POST /api/rutas/cerrar
3. Si ok → fetch panel GET /api/vendedores/:id/panel
4. Setear datos → abrir ResumenCierreModal
5. Usuario descarga PNG o comparte
6. Usuario cierra modal → actualizarDashboard() o navigate (según vista)

## Código del componente

```vue
<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="$emit('close')"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden">
      <div class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 class="text-lg font-bold text-neutral-900 dark:text-slate-100">Resumen de Ruta Cerrada</h2>
        <button @click="$emit('close')" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-slate-300 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div ref="summaryCardRef" class="bg-white text-neutral-900" style="font-family: system-ui, -apple-system, sans-serif;">
        <div class="p-6">
          <div class="text-center mb-5">
            <h1 class="text-xl font-bold text-neutral-900">{{ vendedorNombre }}</h1>
            <p class="text-xs text-neutral-500 mt-0.5">Resumen de Ruta Cerrada</p>
          </div>

          <div class="text-sm space-y-1 mb-4 text-neutral-700">
            <div class="flex justify-between">
              <span>Apertura:</span>
              <span class="font-semibold">{{ formatFecha(ruta.fechaApertura) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Cierre:</span>
              <span class="font-semibold">{{ formatFecha(ruta.fechaCierre) }}</span>
            </div>
          </div>

          <hr class="border-neutral-200 mb-4">

          <div class="text-sm space-y-2.5">
            <div class="flex justify-between">
              <span class="text-neutral-600">Cartera Inicial</span>
              <span class="font-bold tabular-nums">${{ formatNum(ruta.carteraInicial, 2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600">Caja Inicial</span>
              <span class="font-bold tabular-nums">${{ formatNum(ruta.cajaInicial, 2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600">Recaudo Estimado</span>
              <span class="font-bold tabular-nums">${{ formatNum(ruta.recaudadoPretendido, 2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600">Recaudo Actual</span>
              <span class="font-bold tabular-nums">${{ formatNum(ruta.recaudado, 2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600">Ingresos</span>
              <span class="font-bold tabular-nums">${{ formatNum(ruta.ingresos, 2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600">Ventas</span>
              <span class="font-bold tabular-nums">${{ formatNum(ruta.ventas, 2) }}</span>
            </div>
            <div v-if="intereses > 0" class="flex justify-between">
              <span class="text-neutral-600">Intereses</span>
              <span class="font-bold tabular-nums">${{ formatNum(intereses, 2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600">Egresos</span>
              <span class="font-bold tabular-nums">${{ formatNum(ruta.egresos, 2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600">Retiros</span>
              <span class="font-bold tabular-nums">${{ formatNum(ruta.retiros, 2) }}</span>
            </div>
          </div>

          <hr class="border-neutral-300 my-4">

          <div class="text-sm space-y-2.5">
            <div class="flex justify-between font-bold text-neutral-900">
              <span>Caja Final</span>
              <span class="tabular-nums">${{ formatNum(ruta.cajaFinal, 2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-neutral-900">
              <span>Cartera Final</span>
              <span class="tabular-nums">${{ formatNum(ruta.carteraFinal, 2) }}</span>
            </div>
          </div>

          <hr class="border-neutral-200 my-4">

          <div class="text-xs text-neutral-600 space-y-1">
            <div class="flex justify-between">
              <span>Total Clientes</span>
              <span class="font-semibold">{{ formatNum(resumen?.total ?? 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Nuevos / Renovados / Cancelados</span>
              <span class="font-semibold">{{ formatNum(resumen?.nuevos ?? 0) }} / {{ formatNum(resumen?.renovados ?? 0) }} / {{ formatNum(resumen?.cancelados ?? 0) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-gray-900">
        <button @click="$emit('close')" class="px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-slate-300 bg-white dark:bg-gray-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors">Cerrar</button>
        <button v-if="soportaCompartir" @click="compartirPNG" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          Compartir
        </button>
        <button @click="descargarPNG" class="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Descargar PNG
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  show: { type: Boolean, default: false },
  vendedorNombre: { type: String, default: '' },
  ruta: { type: Object, default: () => ({}) },
  resumen: { type: Object, default: () => ({}) },
  intereses: { type: Number, default: 0 }
})

const emit = defineEmits(['close'])
const { locale } = useI18n()
const summaryCardRef = ref(null)

const soportaCompartir = computed(() => {
  return !!(navigator.canShare && navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] }))
})

function localeForDates() {
  const loc = (locale?.value) || 'es'
  if (typeof loc === 'string' && loc.startsWith('es')) return 'es-ES'
  if (typeof loc === 'string' && loc.startsWith('pt')) return 'pt-BR'
  return 'en-US'
}

function formatNum(value, decimals = 0) {
  const n = Number(value)
  const loc = (locale?.value) || 'es'
  const lf = (typeof loc === 'string' && loc.startsWith('es')) ? 'es-ES' : (typeof loc === 'string' && loc.startsWith('pt')) ? 'pt-BR' : 'en-US'
  if (isNaN(n)) return decimals === 0 ? '0' : (0).toLocaleString(lf, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const opts = decimals === 0 ? { useGrouping: true } : { useGrouping: true, minimumFractionDigits: decimals, maximumFractionDigits: decimals }
  return n.toLocaleString(lf, opts)
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString(localeForDates(), { dateStyle: 'short', timeStyle: 'short' })
}

function generarNombreArchivo() {
  const nombre = (props.vendedorNombre || 'vendedor').replace(/\s+/g, '_').toLowerCase()
  const fecha = props.ruta?.fechaCierre ? new Date(props.ruta.fechaCierre).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  return `resumen_${nombre}_${fecha}.png`
}

async function descargarPNG() {
  const el = summaryCardRef.value
  if (!el) return
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = generarNombreArchivo()
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (e) { console.error('Error al generar PNG:', e) }
}

async function compartirPNG() {
  const el = summaryCardRef.value
  if (!el) return
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.share({ files: [new File([blob], generarNombreArchivo(), { type: 'image/png' })], title: 'Resumen de Ruta Cerrada' })
      } catch (e) { if (e.name !== 'AbortError') console.error(e) }
    }, 'image/png')
  } catch (e) { console.error('Error al generar PNG:', e) }
}
</script>
```

## Modificaciones en VendedorDashboard.vue

### Template (final, antes de </template>):
```vue
  <ResumenCierreModal
    :show="mostrarResumenCierre"
    v-bind="datosResumenCierre || {}"
    @close="cerrarResumenCierre"
  />
```

### Script (imports, agregar):
```js
import ResumenCierreModal from '../components/ResumenCierreModal.vue'
```

### Script (refs, junto a los otros refs):
```js
const mostrarResumenCierre = ref(false)
const datosResumenCierre = ref(null)
```

### Script (function cerrarResumenCierre):
```js
function cerrarResumenCierre() {
  mostrarResumenCierre.value = false
  datosResumenCierre.value = null
  actualizarDashboard()
  window.dispatchEvent(new CustomEvent('ruta-cerrada'))
}
```

### Script (en confirmarCierreRuta, tras éxito):
Reemplazar:
```js
mostrarModalCierre.value = false
await actualizarDashboard()
window.dispatchEvent(new CustomEvent('ruta-cerrada'))
```
con:
```js
mostrarModalCierre.value = false
try {
  const panelRes = await fetch(`${API_BASE_URL}/api/vendedores/${localStorage.getItem('vendedorId')}/panel?_ts=${Date.now()}`, { cache: 'no-store' })
  if (panelRes.ok) {
    const panel = await panelRes.json()
    const intereses = // ... computed logic from ResumenVendedor.vue
    datosResumenCierre.value = {
      vendedorNombre: panel.vendedor?.nombre || '',
      ruta: panel.ruta || {},
      resumen: panel.resumen || {},
      intereses
    }
    mostrarResumenCierre.value = true
  } else {
    await actualizarDashboard()
    window.dispatchEvent(new CustomEvent('ruta-cerrada'))
  }
} catch {
  await actualizarDashboard()
  window.dispatchEvent(new CustomEvent('ruta-cerrada'))
}
```

## Modificaciones en ResumenVendedor.vue
Similar a VendedorDashboard.vue, pero en `confirmarCerrarRuta()`:
- Tras éxito, cargar panel, calcular intereses, mostrar modal
- Al cerrar modal: `router.push('/vendedor')`

## i18n additions

### es.json (sección "route"):
```
"closeSummary": "Resumen de Ruta Cerrada",
"downloadPng": "Descargar PNG",
"shareImage": "Compartir"
```

### en.json:
```
"closeSummary": "Closed Route Summary",
"downloadPng": "Download PNG",
"shareImage": "Share"
```

### pt.json:
```
"closeSummary": "Resumo de Rota Fechada",
"downloadPng": "Baixar PNG",
"shareImage": "Compartilhar"
```
