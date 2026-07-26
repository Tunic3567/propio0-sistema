<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="$emit('close')"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden">
      <div class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 class="text-lg font-bold text-neutral-900 dark:text-slate-100">{{ $t('history.closedSummaries') }}</h2>
        <button @click="$emit('close')" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-slate-300 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="overflow-y-auto flex-1">
        <div v-if="cargando" class="flex items-center justify-center p-8 text-neutral-500 dark:text-slate-400">
          Cargando...
        </div>

        <template v-else>
          <div class="shrink-0 px-6 pt-4 pb-2">
            <select
              v-model="rutaSeleccionadaId"
              class="w-full rounded-lg border-2 border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="r in rutasCerradas" :key="r._id" :value="r._id">
                {{ formatFechaCorta(r.fechaApertura) }} → {{ formatFechaCorta(r.fechaCierre) }}
              </option>
            </select>
          </div>

          <div v-if="!datosPanel" class="flex items-center justify-center p-8 text-neutral-500 dark:text-slate-400">
            {{ $t('history.selectClosedRoute') }}
          </div>

          <div v-else ref="summaryCardRef" class="bg-white text-neutral-900" style="font-family: system-ui, -apple-system, sans-serif;">
            <div class="p-6">
              <div class="text-center mb-5">
                <h1 class="text-xl font-bold text-neutral-900">{{ datosPanel.vendedor?.nombre || '—' }}</h1>
                <p class="text-xs text-neutral-500 mt-0.5">{{ $t('route.closeSummary') }}</p>
              </div>

              <div class="text-sm space-y-1 mb-4 text-neutral-700">
                <div class="flex justify-between">
                  <span>{{ $t('route.openingDate') }}:</span>
                  <span class="font-semibold">{{ formatFecha(datosPanel.ruta?.fechaApertura) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('route.closingDate') }}:</span>
                  <span class="font-semibold">{{ formatFecha(datosPanel.ruta?.fechaCierre) }}</span>
                </div>
              </div>

              <hr class="border-neutral-200 mb-4">

              <div class="text-sm space-y-2.5">
                <div class="flex justify-between">
                  <span class="text-neutral-600">{{ $t('summary.initialCash') }}</span>
                  <span class="font-bold tabular-nums">${{ formatNum(datosPanel.ruta?.cajaInicial, 2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">{{ $t('summary.expectedCollected') }}</span>
                  <span class="font-bold tabular-nums">${{ formatNum(datosPanel.ruta?.recaudadoPretendido, 2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">{{ $t('summary.currentCollected') }}</span>
                  <span class="font-bold tabular-nums">${{ formatNum(datosPanel.ruta?.recaudado, 2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">{{ $t('summary.income') }}</span>
                  <span class="font-bold tabular-nums">${{ formatNum(datosPanel.ruta?.ingresos, 2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">{{ $t('summary.sales') }}</span>
                  <span class="font-bold tabular-nums">${{ formatNum(datosPanel.ruta?.ventas, 2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">{{ $t('summary.expenses') }}</span>
                  <span class="font-bold tabular-nums">${{ formatNum(datosPanel.ruta?.egresos, 2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">{{ $t('summary.withdrawals') }}</span>
                  <span class="font-bold tabular-nums">${{ formatNum(datosPanel.ruta?.retiros, 2) }}</span>
                </div>
              </div>

              <hr class="border-neutral-300 my-4">

              <div class="text-sm space-y-2.5">
                <div class="flex justify-between font-bold text-neutral-900">
                  <span>{{ $t('summary.finalCash') }}</span>
                  <span class="tabular-nums">${{ formatNum(datosPanel.ruta?.cajaFinal, 2) }}</span>
                </div>
              </div>

              <hr class="border-neutral-200 my-4">

              <div class="text-xs text-neutral-600 space-y-1">
                <div class="flex justify-between">
                  <span>{{ $t('summary.totalClients') }}</span>
                  <span class="font-semibold">{{ formatNum(datosPanel.resumen?.total ?? 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('summary.newClients') }} / {{ $t('summary.renewedClients') }} / {{ $t('summary.cancelledClients') }}</span>
                  <span class="font-semibold">{{ formatNum(datosPanel.resumen?.nuevos ?? 0) }} / {{ formatNum(datosPanel.resumen?.renovados ?? 0) }} / {{ formatNum(datosPanel.resumen?.cancelados ?? 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-gray-900">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-slate-300 bg-white dark:bg-gray-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors"
        >
          {{ $t('common.close') }}
        </button>
        <button
          v-if="soportaCompartir"
          @click="compartirPNG"
          :disabled="!datosPanel"
          class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          {{ $t('route.shareImage') }}
        </button>
        <button
          @click="descargarPNG"
          :disabled="!datosPanel"
          class="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          {{ $t('route.downloadPng') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import API_BASE_URL from '../config/api.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  vendedorId: { type: String, default: '' },
  rutasDisponibles: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const summaryCardRef = ref(null)
const rutaSeleccionadaId = ref('')
const cargando = ref(false)
const datosPanel = ref(null)

const rutasCerradas = computed(() =>
  (props.rutasDisponibles || []).filter(r => !!r.fechaCierre)
)

const interesesCalculados = computed(() => {
  const ruta = datosPanel.value?.ruta
  const clientes = datosPanel.value?.clientes || []
  if (!ruta || !ruta.fechaApertura) return 0
  const inicio = new Date(ruta.fechaApertura).getTime()
  const fin = ruta.fechaCierre ? new Date(ruta.fechaCierre).getTime() : Date.now()
  const suma = clientes.reduce((acc, c) => {
    const created = c?.createdAt ? new Date(c.createdAt).getTime() : 0
    if (created >= inicio && created <= fin) {
      const valor = Number(c?.valor) || 0
      const saldoInicial = Number(c?.saldo_inicial)
      const total = Number(c?.total)
      const base = !isNaN(saldoInicial) && saldoInicial > 0 ? saldoInicial : (!isNaN(total) && total > 0 ? total : null)
      if (base != null) {
        return acc + Math.max(0, base - valor)
      }
      const interesPct = Number(c?.intereses) || 0
      return acc + (valor * interesPct) / 100
    }
    return acc
  }, 0)
  return Math.round(suma * 100) / 100
})

const soportaCompartir = computed(() => {
  try {
    return !!(navigator.canShare && navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] }))
  } catch { return false }
})

watch(() => props.show, async (val) => {
  if (!val) return
  const cerradas = rutasCerradas.value
  if (cerradas.length === 0) return
  rutaSeleccionadaId.value = cerradas[0]._id
  await cargarRuta(cerradas[0]._id)
})

watch(rutaSeleccionadaId, async (id) => {
  if (!id) return
  await cargarRuta(id)
})

async function cargarRuta(rutaId) {
  if (!rutaId || !props.vendedorId) return
  cargando.value = true
  datosPanel.value = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendedores/${props.vendedorId}/panel?rutaId=${rutaId}&_ts=${Date.now()}`, { cache: 'no-store' })
    if (res.ok) {
      datosPanel.value = await res.json()
    }
  } catch (e) {
    console.error('Error al cargar resumen de ruta:', e)
  } finally {
    cargando.value = false
  }
}

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
  if (isNaN(n)) {
    return decimals === 0 ? '0' : (0).toLocaleString(lf, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }
  const opts = decimals === 0
    ? { useGrouping: true }
    : { useGrouping: true, minimumFractionDigits: decimals, maximumFractionDigits: decimals }
  return n.toLocaleString(lf, opts)
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString(localeForDates(), { dateStyle: 'short', timeStyle: 'short' })
}

function formatFechaCorta(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString(localeForDates(), { dateStyle: 'short' })
}

function generarNombreArchivo() {
  const nombre = (datosPanel.value?.vendedor?.nombre || 'vendedor').replace(/\s+/g, '_').toLowerCase()
  const fecha = datosPanel.value?.ruta?.fechaCierre
    ? new Date(datosPanel.value.ruta.fechaCierre).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]
  return `resumen_${nombre}_${fecha}.png`
}

async function descargarPNG() {
  const el = summaryCardRef.value
  if (!el) return
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = generarNombreArchivo()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (e) {
    console.error('Error al generar PNG:', e)
  }
}

async function compartirPNG() {
  const el = summaryCardRef.value
  if (!el) return
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })
    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.share({
          files: [new File([blob], generarNombreArchivo(), { type: 'image/png' })],
          title: t('route.closeSummary')
        })
      } catch (e) {
        if (e.name !== 'AbortError') console.error('Error al compartir:', e)
      }
    }, 'image/png')
  } catch (e) {
    console.error('Error al generar PNG:', e)
  }
}
</script>
